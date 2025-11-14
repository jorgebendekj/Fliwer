'use strict';

import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {FliwerColors} from '../../utils/FliwerColors'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

//const FBSDK = require('react-native-fbsdk');
//const {LoginManager, AccessToken} = FBSDK;

class FacebookButton extends Component {

    constructor(props) {
        super(props);
    }

    _fbLogin = () => {
       // LoginManager.logInWithPermissions(['public_profile', 'email']).then(this.loginCallback(), this.loginError());
    }

    loginCallback() {
        var that = this
        return function (result) {
            if (result.isCancelled) {
                if (that.props.onCancelled)
                    that.props.onCancelled();
            } else {
                /* AccessToken.getCurrentAccessToken().then(
                        (data) => {
                    if (that.props.onLogin)
                        that.props.onLogin(data.accessToken.toString());
                }
                ) */
            }
        }
    }

    loginError() {
        var that = this;
        return function (error) {
            if (that.props.onError)
                that.props.onError(error);
        }
    }

    logoutCallback() {
        var that = this
        return function () {
            if (that.props.onLogout)
                that.props.onLogout();
        }
    }

    render() {

        if (!this.props.image)
            return (
                    <Icon.Button name="facebook" backgroundColor="#3b5998" onPress={this._fbLogin}  style={this.props.style}>
                        <Text style={{fontFamily: 'AlrightSans-Light', textAlign: 'center', marginLeft: -15, width: "100%", color: FliwerColors.secondary.white}}>{this.props.actions.translate.get('loginVC_facebook_button')}</Text>
                    </Icon.Button>
                    );
        else
            return (
                    <TouchableOpacity
                        onPress={this._fbLogin}
                        style={[{}, this.props.style]}>
                        <Image source={this.props.image} resizeMode={"contain"} style={{width: "100%", height: "100%"}}/>
                    </TouchableOpacity>
            );

        /*
         return (
         <LoginButton onLoginFinished={this.loginCallback()} onLogoutFinished={this.logoutCallback()}/>
         )
         */
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
export default connect(mapStateToProps, mapDispatchToProps)(FacebookButton);
