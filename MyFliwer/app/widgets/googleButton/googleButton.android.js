'use strict';
import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {FliwerColors} from '../../utils/FliwerColors'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import {toast} from '../../widgets/toast/toast'

import icon  from '../../assets/img/googleSignIn.png'

GoogleSignin.configure({
    webClientId: '1092770741396-le8rpgqbbqmhk708jg8rpb7c8nhf5sfk.apps.googleusercontent.com',
    forceConsentPrompt: true,
    scopes:['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
});

class GoogleButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isSigninInProgress: false
        }
    }

    _signIn() {
        var signIn = () => {
            GoogleSignin.signIn().then((user) => {
                console.log(user);
                if (this.props.onLogin && user.data)
                    this.props.onLogin(user.data.idToken);
                this.setState({isSigninInProgress: false});
            }).catch((err) => {
                if (err.code === statusCodes.SIGN_IN_CANCELLED) {
                    if (this.props.onCancelled)
                        this.props.onCancelled()
                } else if (this.props.onError)
                    this.props.onError(err);
                this.setState({isSigninInProgress: false});
            });
        }

        if (!this.state.isSigninInProgress) {
            this.setState({isSigninInProgress: true})
            GoogleSignin.revokeAccess().then(() => {
                signIn();
            }).catch((err) => {
                signIn();
            })
        }
    }

    render() {

        if (!this.props.image)
            return (
                <TouchableOpacity onPress={() => {
                        this._signIn()
                    }}
                    style={[{backgroundColor: "white", display: "flex", justifyContent: "center", borderWidth: 1, borderColor: FliwerColors.primary.gray}, this.props.style]}
                >
                    <Image source={icon} resizeMode={"contain"} style={{width: 30, height: 30, position: "absolute", left: 10}}/>
                    <Text style={{fontFamily: 'AlrightSans-Light', textAlign: 'center', width: "100%"}}>{this.props.actions.translate.get('loginVC_google_button')}</Text>
                </TouchableOpacity>
                );
        else
            return (
                <TouchableOpacity onPress={() => {
                        this._signIn()
                    }}
                    style={[{}, this.props.style]}
                >
                    <Image source={this.props.image} resizeMode={"contain"} style={{width: "100%", height: "100%"}}/>
                </TouchableOpacity>
                );
    }

};

function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(GoogleButton);
