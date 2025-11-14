'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity, Platform} from 'react-native';

import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import FacebookButton from '../../widgets/facebookButton/facebookButton';
import GoogleButton from '../../widgets/googleButton/googleButton';
import AppleButton from '../../widgets/appleButton/appleButton';
import MicrosoftButton from '../../widgets/MicrosoftButton/microsoftButton';
import LoginBottomBar from './bottomBar.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {loginStyles} from './loginStyles.js';
import {FliwerColors} from '../../utils/FliwerColors'
import { Redirect,withRouter } from '../../utils/router/router'
//import {trackingTransparency} from '../../utils/trackingTransparency/trackingTransparency'
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import fliwerLogo  from '../../assets/img/logo_fliwer_new_dark.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

import facebookImg  from '../../assets/img/facebook_login_icon.png'
import googleImg  from '../../assets/img/googleSignIn.png'
import emailImg  from '../../assets/img/mail_login_icon.png'


class LoginPreregister extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goLogin: false,
            saving: false,
            initSpain: false,
            goStart: false,
            goWelcome: false,
            goRegister: false,
            countryCode: this.props.countryCode,
            languageCode: this.props.language,
            cookiesPolicyAccepted: this.props.cookiesPolicyAccepted,
            petition: this.props.match.params.petition? this.props.match.params.petition : (this.props.petition? this.props.petition.id : null),
            hash: this.props.match.params.hash? this.props.match.params.hash : (this.props.petition? this.props.petition.hash : null),

            allowTrackingTransparency: true
        };

        if (this.props.match.params.petition && this.props.match.params.hash) {
            this.props.actions.sessionActions.setPetition(this.props.match.params.petition, this.props.match.params.hash);
        }

        if (!this.state.countryCode && this.props.match.params.country) {
            this.state.countryCode = this.props.match.params.country;
            this.props.actions.translate.setCountry(this.state.countryCode);
        }

        if (!this.state.languageCode && this.props.match.params.lang) {
            this.state.languageCode = this.props.match.params.lang;
            this.props.actions.translate.setLanguage(this.state.languageCode);
        }

        this.state.goStart = !this.state.countryCode || !this.state.cookiesPolicyAccepted;

        console.log("this.state.petition", this.state.petition);
        console.log("this.state.hash", this.state.hash);

    }

    componentDidMount() {
        this.checkTrackingTransparency().then((allow) => {
            if (!allow)
                this.setState({allowTrackingTransparency: allow});
        });
    }

    checkTrackingTransparency() {
        return new Promise(async function (resolve, reject) {
            var allow = true;
//            if (Platform.OS === 'ios')
//                allow = await trackingTransparency.getTrackingStatus();
            resolve(allow);
        });
    }

    render() {
        if(this.props.offline){  
                    return (<Redirect push to={"/app/fliwer"} />);
        }else if (this.props.logedIn) {
            if (this.props.isGardener || this.props.isVisitor)
                return (<Redirect push to={"/gardener"} />);
            else
                return (<Redirect push to={"/zone"} />);
        } else if (this.state.goLogin) {
            return (<Redirect push to={"/login"} />);
        } else if (this.state.goStart) {
            return (<Redirect push to={"/start"} />);
        } else if (this.state.goRegister) {
            return (<Redirect push to={"/register"} />);
        } else if (!this.props.loading && this.state.initSpain) {
            return (<Redirect push to={"/init/spain"}/>);
        } else if (this.state.goWelcome) {
            return (<Redirect push to={"/welcome"} />);
        } else if (this.props.loading) {
            return (
                    <FliwerLoading/>
                    );
        } else {

            var maxWidth = loginStyles.getMaxWidth();

            return (
                    <ImageBackground  style={{height: "100%", backgroundColor: "white"}} resizeMode={"cover"} loading={this.state.saving}>
                        <ScrollView scrollEventThrottle={1000} style={loginStyles.contentView} contentContainerStyle={loginStyles.contentViewContainer}>

                            <View style={[loginStyles.contentViewIn, {width: maxWidth}]}>
                                {this.state.allowTrackingTransparency?
                                    this.renderContent()
                                :
                                    this.renderAlertForNotAllowTrackingTransparency()
                                }
                            </View>
                        </ScrollView>

                        <LoginBottomBar
                            arrowLeft={() => {
                                this.setState({goWelcome: true});
                            }} />

                    </ImageBackground>
                    );
        }
    }

    renderAlertForNotAllowTrackingTransparency() {
        var logoSize = loginStyles.getLogoSize();
        var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();

        return (
            <View style={[loginStyles.content, {width: "100%", paddingBottom: 80}]}>
                <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                    onPress={() => {
                        this.setState({goStart: true})
                    }}>
                    <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                </TouchableOpacity>

                <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                    {"You are not accepted the message: Allow 'MyFliwer' to track your activity across other comapanies´s apps and websites."}
                </Text>

                <Text style={loginStyles.titleStyle}>
                    {"Please, remove the app and install again. Thanks."}
                </Text>
            </View>
        );
    }

    renderContent() {
        var logoSize = loginStyles.getLogoSize();
        var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();

        return (
            <View style={[loginStyles.content, {width: "100%", paddingBottom: 80}]}>

                <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                    onPress={() => {
                        this.setState({goStart: true})
                    }}>
                    <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                </TouchableOpacity>

                <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                    {//"Estás a un paso de formar parte de fliwer" + "!"
                    //You are one step away from being part of fliwer
                    this.props.actions.translate.get('loginVC_youre_one_step_from_being_part_of_fliwer').replace("fliwer","Taskium") + "!"}
                </Text>

                <Text style={loginStyles.descriptionStyle}>
                    {//"Puedes entrar con tu cuenta de Google o Facebook, o registrarte con tu email"
                    //You can enter with your Google or Facebook account, or register with your email
                    this.props.actions.translate.get('loginVC_you_can_enter_with_google_or_facebook_account')}
                </Text>

                <View style={{marginTop: 40, flexDirection: "row"}}>
                    <FacebookButton
                        image={facebookImg}
                        style={{width: 60, height: 60}}
                        onError={ (error) => {
                            console.log("Error facebook login", error);
                            toast.error("Login with Facebook failed");
                        }}
                        onCancelled={ () => {
                        }}
                        onLogin={ (token) => {
                            this.setState({saving: true});
                            console.log("Registering on facebook", token);
                            this.props.actions.sessionActions.loginFacebook(
                                    token,
                                    this.state.countryCode,
                                    this.state.languageCode,
                                    this.state.petition,
                                    this.state.hash
                            );
                        }}
                        onLogout={ () => {
                        }}
                    />
                    <View style={{width: 40}}></View>
                    <GoogleButton
                        image={googleImg}
                        style={{width: 55, height: 55, paddingTop: 4}}
                        onLogin={ (token) => {
                            console.log("Registering on google", token);
                            this.setState({saving: true});
                            this.props.actions.sessionActions.loginGoogle(
                                    token,
                                    this.state.countryCode,
                                    this.state.languageCode,
                                    this.state.petition,
                                    this.state.hash
                            );
                        }}
                        onCancelled={ (what) => {
                            console.log("onCancelled", what);
                        }}
                        onError={ (error) => {
                            console.log("onError", error);
                            //toast.error("Login with Google failed");
                        }}
                    />
                    <View style={{width: 40}}></View>
                    <MicrosoftButton
                        image={googleImg}
                        style={{width: 55, height: 55, paddingTop: 4}}
                        onLogin={ (token) => {
                            console.log("onLogin", token);
                            this.setState({saving: true});
                            this.props.actions.sessionActions.loginMicrosoft(
                                    token,
                                    this.state.countryCode,
                                    this.state.languageCode,
                                    this.state.petition,
                                    this.state.hash
                            );
                        }}
                        onCancelled={ (what) => {
                            console.log("onCancelled", what);
                        }}
                        onError={ (error) => {
                            console.log("onError", error);
                            //toast.error("Login with Google failed");
                        }}
                    />
                </View>
                {Platform.OS === "ios"?
                    <View style={{marginTop: 20}}>
                        <AppleButton
                            onLogin={ (appleAuthRequestResponse) => {
                                console.log("onLogin", appleAuthRequestResponse);
                                this.setState({saving: true});
                                this.props.actions.sessionActions.loginApple(
                                        appleAuthRequestResponse,
                                        this.state.countryCode,
                                        this.state.languageCode,
                                        this.state.petition,
                                        this.state.hash
                                );
                            }}
                            onCancelled={ (what) => {
                                console.log("onCancelled", what);
                            }}
                            onError={ (error) => {
                                console.log("onError", error);
                                //toast.error("Login with Apple failed");
                            }}
                        />
                    </View>
                :null}

                <View style={[loginStyles.lineDelimiter, {marginTop: 40}]}></View>

                <View style={{marginTop: 40, flexDirection: "row"}}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{width: 60, height: 60}}
                        onMouseEnter={this.hoverIn('emailImg')} onMouseLeave={this.hoverOut('emailImg')}
                        onPress={() => {
                            this.setState({goRegister: true});
                        }}
                    >
                        <Image source={emailImg} resizeMode={"contain"} style={{width: "100%", height: "100%"}}/>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
};


function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        logedIn: state.sessionReducer.logedIn,
        offline: state.sessionReducer.offline,
        userData: state.sessionReducer.data,
        language: state.languageReducer.language,
        translation: state.languageReducer.translation,
        countryCode: state.languageReducer.country,
        cookiesPolicyAccepted: state.languageReducer.cookiesPolicyAccepted,
        petition: state.sessionReducer.petition,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(ActionsSession, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

var style = {
    ":hover": {
        emailImg:{
          filter:"brightness(150%)"
        }
    }
};

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginPreregister)));
