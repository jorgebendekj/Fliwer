'use strict';
import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {FliwerColors} from '../../utils/FliwerColors'
import * as msal from "@azure/msal-browser";

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import icon  from '../../assets/img/microsoftSignIn.png'


class MyAppleButton extends Component {

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        var {containerStyle} = this.props;

        return (
          <TouchableOpacity onPress={() => {
                  this._signIn()
              }}
              style={[{}, this.props.style]}
          >
              <Image source={icon} resizeMode={"contain"} style={{width: "100%", height: "100%"}}/>
          </TouchableOpacity>
        );
    }

    _signIn = async () => {
        // Generate secure, random values for state and nonce


        const msalConfig = {
            auth: {
                clientId: '1608dd5f-7c5a-48ac-8aec-b6372d5ad04a'
            }
        };

        const msalInstance = new msal.PublicClientApplication(msalConfig);

        try {
            const tokenResponse  = await msalInstance.acquireTokenPopup({scopes: ['openid','email','profile','User.Read','UserAuthenticationMethod.Read']});
            debugger;
             if (this.props.onLogin)this.props.onLogin(tokenResponse.accessToken);
        } catch (error) {
          debugger;
          if ( (error.error && error.error=="aa.session.user_cancelled" ) || ((error.json && (error.json.error=="access_denied" )))  ) {
              if (this.props.onCancelled)
                  this.props.onCancelled()
          } else if (this.props.onError)
              this.props.onError(error);
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
