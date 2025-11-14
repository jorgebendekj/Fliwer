'use strict';
import React, { Component } from 'react';
import {View, StyleSheet, Text} from 'react-native';
import { appleAuthAndroid, AppleButton } from '@invertase/react-native-apple-authentication';
import { v4 as uuid } from 'uuid'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

class MyAppleButton extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        var {containerStyle} = this.props;

        if (!appleAuthAndroid.isSupported)
            return null;

        return (
            <View style={containerStyle}>
                <AppleButton
                    style={styles.appleButton}
                    cornerRadius={4}
                    buttonStyle={AppleButton.Style.WHITE_OUTLINE}
                    buttonType={AppleButton.Type.CONTINUE}
                    onPress={() => this.signIn()}
                    />
            </View>
        );
    }

    signIn = async () => {
        // Generate secure, random values for state and nonce
        const rawNonce = uuid();
        const state = uuid();

        var clientId = 'com.SignInService.Fliwer';
//        var clientId = 'com.fliwer.Fliwer';

        try {
            // Configure the request
            appleAuthAndroid.configure({
              // The Service ID you registered with Apple
              clientId: clientId,

              // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
              // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
//              redirectUri: 'https://example.com/auth/callback',
              redirectUri: 'https://fliwer.com:7100/loginApple/return',

              // The type of response requested - code, id_token, or both.
              responseType: appleAuthAndroid.ResponseType.ALL,

              // The amount of user information requested from Apple.
              scope: appleAuthAndroid.Scope.ALL,

              // Random nonce value that will be SHA256 hashed before sending to Apple.
              nonce: rawNonce,

              // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
              state,
            });

            // Open the browser window for user sign in
            // Send the authorization code to your backend for verification
            const response = await appleAuthAndroid.signIn();
            console.log("response", response)
            if (response) {

                var appleAuthRequestResponse = {
                    authorizationCode: response.code,
                    identityToken: response.id_token,
                    user: response.code,
                    nonce: response.nonce,
                    state: response.state,
                    clientId: clientId
                };
                console.log("appleAuthRequestResponse", appleAuthRequestResponse);

                if (this.props.onLogin)
                    this.props.onLogin(appleAuthRequestResponse);
            }
        } catch (error) {
            if (error && error.message) {
                switch (error.message) {
                  case appleAuthAndroid.Error.NOT_CONFIGURED:
                    console.log("appleAuthAndroid not configured yet.");
                    break;
                  case appleAuthAndroid.Error.SIGNIN_FAILED:
                    console.log("Apple signin failed.");
                    break;
                  case appleAuthAndroid.Error.SIGNIN_CANCELLED:
                    console.log("User cancelled Apple signin.");
                    break;
                  default:
                    break;
                }
                if (this.props.onCancelled)
                    this.props.onCancelled();
            }
        }
    }

};

function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

const styles = StyleSheet.create({
    appleButton: {
        marginTop: 3,
        fontSize: 18,
        width: 160, // You must specify a width
        height: 45 // You must specify a height
    }
});

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(MyAppleButton);
