'use strict';

import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {FliwerColors} from '../../utils/FliwerColors'
import FacebookLogin from '@greatsumini/react-facebook-login';

import {toast} from '../../widgets/toast/toast'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

class FacebookButton extends Component {

    constructor(props) {
        super(props);
    }
/*
    initFacebook(callback) {
        var that = this;

        window.fbAsyncInit = function () {
            FB.init({
                appId: '1469782766851933',
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v2.12'
            });

            if (callback)
                callback();
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

    }

    loginFacebook() {
        if (typeof FB == 'undefined')
            this.initFacebook(() => {
                this.loginFacebook()
            });
        else {
            FB.login((response) => {
                console.log("FB response",response)
                if (response.authResponse) {
                    if (this.props.onLogin)
                        this.props.onLogin(response.authResponse.accessToken);
                } else {
                    if (this.props.onCancelled)
                        this.props.onCancelled();
                }

            }, {scope: 'email,public_profile'});
        }
    }
*/

    render() {
        /*
         return (
         <Icon.Button name="facebook" backgroundColor="#3b5998" onPress={this.loginFacebook()} style={this.props.style}>
         <Text style={{fontFamily:'AlrightSans-Light',fontSize:16,height:20,textAlign:'center',marginLeft:-15,width:"100%",color:FliwerColors.secondary.white}}>{this.props.actions.translate.get('loginVC_facebook_button')}</Text>
         </Icon.Button>
         )
         */

         return (<FacebookLogin
           appId="1469782766851933"
           onSuccess={(response) => {
             console.log('Login Success!', response);
             debugger;
             if (this.props.onLogin)
                 this.props.onLogin(response.accessToken);
           }}
           onFail={(error) => {
             toast.error("error: "+JSON.stringify(error));
             if (this.props.onCancelled)
                 this.props.onCancelled();
           }}
           onProfileSuccess={(response) => {
             //toast.error("success: "+JSON.stringify(response));
             console.log('Get Profile Success!', response);
           }}
           render={({ onClick, logout }) => {
               if (!this.props.image)
               {
                   return (
                           <TouchableOpacity onPress={onClick}  style={[{backgroundColor: "#3b5998", display: "flex", justifyContent: "center"}, this.props.style]}>
                               <Icon name="facebook"  style={{width: 30, height: 30, fontSize: 25, color: "white", position: "absolute", left: 17, display: "flex", alignItems: "center"}} ></Icon>
                               {true?<Text style={{fontFamily: 'AlrightSans-Light', textAlign: 'center', width: "100%", color: FliwerColors.secondary.white, height: 13}}>{this.props.actions.translate.get('loginVC_facebook_button')}</Text>:null}
                           </TouchableOpacity>
                   );
               }
               else
               {
                   return (
                           <TouchableOpacity onPress={onClick}  style={[{}, this.props.style]}>
                               <Image source={this.props.image} resizeMode={"contain"} style={{width: "100%", height: "100%"}}/>
                           </TouchableOpacity>
                   );
               }
           }}
         />);

         /*
        if (!this.props.image)
        {
            return (
                    <TouchableOpacity onPress={() => {
                            this.loginFacebook();
                        }}  style={[{backgroundColor: "#3b5998", display: "flex", justifyContent: "center"}, this.props.style]}>
                        <Icon name="facebook"  style={{width: 30, height: 30, fontSize: 25, color: "white", position: "absolute", left: 17, display: "flex", alignItems: "center"}} ></Icon>
                        {true?<Text style={{fontFamily: 'AlrightSans-Light', textAlign: 'center', width: "100%", color: FliwerColors.secondary.white, height: 13}}>{this.props.actions.translate.get('loginVC_facebook_button')}</Text>:null}
                    </TouchableOpacity>
            );
        }
        else
        {
            return (
                    <TouchableOpacity onPress={() => {
                            this.loginFacebook();
                        }}  style={[{}, this.props.style]}>
                        <Image source={this.props.image} resizeMode={"contain"} style={{width: "100%", height: "100%"}}/>
                    </TouchableOpacity>
            );
        }
        */

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

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(FacebookButton);
