'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity, TouchableWithoutFeedback, TextInput, Platform, Keyboard} from 'react-native';

import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerTextInput from '../custom/FliwerTextInput.js'
import FliwerUpdateAppModal from '../custom/FliwerUpdateAppModal.js'
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
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import { Redirect, withRouter } from '../../utils/router/router'
//import {trackingTransparency} from '../../utils/trackingTransparency/trackingTransparency'
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import Icon from 'react-native-vector-icons/EvilIcons';

import fliwerLogo  from '../../assets/img/logo_fliwer_new_dark.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

import facebookImg  from '../../assets/img/facebook_login_icon.png'
import googleImg  from '../../assets/img/googleSignIn.png'
import appleImg  from '../../assets/img/apple.png'

class LoginLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goLogin: false,
            saving: false,
            goStart: false,
            goRegister: false,
            goRecoveryPass: false,
            goWelcome: false,
            email: this.props.match.params.email? this.props.match.params.email : (this.props.petition? this.props.petition.email : ""),
            password: "",
            showPassword: false,
            countryCode: this.props.countryCode,
            languageCode: this.props.language,
            cookiesPolicyAccepted: this.props.cookiesPolicyAccepted,
            petition: this.props.match.params.petition? this.props.match.params.petition : (this.props.petition? this.props.petition.id : null),
            hash: this.props.match.params.hash? this.props.match.params.hash : (this.props.petition? this.props.petition.hash : null),

            versionCode: this.props.versionCode,
            versionName: this.props.versionName,
            forceUpdateApp: this.props.forceUpdateApp,
            checkedVersion: this.props.checkedVersion,
            updateAppModalVisible: false,
            updateAppModalHasBeenChecked: false,

            keyboardOffset: 0,

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

        if (this.state.goStart && this.state.email && this.state.countryCode && this.state.languageCode) {
            // https://www.fliwer.com/#/login/email@domain/ES/es
            this.props.actions.sessionActions.setPetition("login", "", this.state.email);
        }else{
          this.checkVersion();
          console.log("End constructor");
        }



    }

    shouldComponentUpdate(nextProps, nextState) {

        if (nextProps.versionCode != null && this.state.versionCode != nextProps.versionCode) {
            this.state.versionCode = nextProps.versionCode;
            this.state.versionName = nextProps.versionName;
            this.state.forceUpdateApp = nextProps.forceUpdateApp;
            this.checkVersion();
        }

        return true;
    }

    componentDidMount() {
        if (Platform.OS === "ios") {
            this.keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                this._keyboardDidShow,
            );
            this.keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                this._keyboardDidHide,
            );
        }

        this.checkTrackingTransparency().then((allow) => {
            if (!allow)
                this.setState({allowTrackingTransparency: allow});
        });
    }

    componentWillUnmount() {
        if (Platform.OS === "ios") {
            this.keyboardDidShowListener.remove();
            this.keyboardDidHideListener.remove();
        }
    }

    _keyboardDidShow = event => {
          this.setState({keyboardOffset: event.endCoordinates.height});
    }

    _keyboardDidHide = () => {
          this.setState({keyboardOffset: 0});
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
        }else if (this.props.logedIn && this.props.defaultApp) {
            if (this.props.roles.gardener || this.props.roles.angel || this.props.roles.accountant || this.props.roles.expert || this.props.isVisitor) 
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
            else if(this.props.roles.manager)
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
            else
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
        } else if (this.state.goLogin) {
            return (<Redirect push to={"/login"} />);
        } else if (this.state.goStart) {
            return (<Redirect push to={"/start"} />);
        } else if (this.state.goRegister) {
            return (<Redirect push to={"/preregister"} />);
        } else if (this.state.goRecoveryPass) {
            return (<Redirect push to={"/recoveryPass"} />);
        } else if (this.state.goWelcome) {
            return (<Redirect push to={"/welcome"} />);
        } else if (this.props.loading) {
            return (
                    <FliwerLoading/>
                    );
        } else {

            var maxWidth = loginStyles.getMaxWidth();
            var formWidth = loginStyles.getFormWidth();
            var isLittleHeight = loginStyles.isLittleHeight();
            var diffMargin = isLittleHeight? 10 : 0;

            return (
                    <ImageBackground  style={[{height: "100%", backgroundColor: "white"}, Platform.OS === "ios"? {top: this.state.keyboardOffset * (-1)}:{}]} resizeMode={"cover"} loading={this.state.saving}>
                        <ScrollView scrollEventThrottle={1000} style={loginStyles.contentView} contentContainerStyle={loginStyles.contentViewContainer}>

                            <View style={[loginStyles.contentViewIn, {width: maxWidth, height: null, marginBottom: 30 - diffMargin}]}>
                                {this.state.allowTrackingTransparency?
                                    this.renderContent()
                                :
                                    this.renderAlertForNotAllowTrackingTransparency()
                                }
                            </View>

                            {this.state.allowTrackingTransparency?<View style={[this.style.fliwerGreenButton, {paddingLeft: loginStyles.contentViewIn.paddingLeft, paddingRight: loginStyles.contentViewIn.paddingRight}, {marginBottom: loginStyles.getFliwerButtonMarginBottom()}]}>
                                <FliwerGreenButton
                                    containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth}}
                                    style={loginStyles.buttonStyle}
                                    textStyle={loginStyles.buttonTextStyle}
                                    onPress={async () => {
                                        await this.manualLogin();
                                    }}
                                    text={this.props.actions.translate.get('login')}
                                />
                            </View>:null}

                            <View style={this.style.finalBlock}></View>
                        </ScrollView>

                        <LoginBottomBar
                            arrowLeft={() => {
                                this.setState({goWelcome: true});
                            }} />

                        {this.renderUpdateAppModal()}

                    </ImageBackground>
                    );
        }
    }

    renderAlertForNotAllowTrackingTransparency() {
        var logoSize = loginStyles.getLogoSize();
        var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();

        return (
            <View style={loginStyles.content}>
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
        var formWidth = loginStyles.getFormWidth();
        var logoSize = loginStyles.getLogoSize();
        var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();

        return (
            <View style={loginStyles.content}>

                <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                    onPress={() => {
                        this.setState({goStart: true})
                    }}>
                    <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                </TouchableOpacity>

                <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                    {//"Introduce tus datos para iniciar sesión"
                    //Enter your data to log in
                    this.props.actions.translate.get('loginVC_enter_your_data_to_login')}
                </Text>

                <View style={{marginTop: 40, flexDirection: "row"}}>
                    {
                        false?
                        <FacebookButton
                            image={facebookImg}
                            style={{width: 50, height: 50}}
                            onError={ (error) => {
                                console.log("Error facebook login", error);
                                toast.error("Login with Facebook failed");
                            }}
                            onCancelled={ () => {
                            }}
                            onLogin={ (token) => {
                                this.setState({saving: true});
                                //console.log("token", token);
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
                            />:null
                    }
                    <View style={{width: 40}}></View>
                     {
                        true?
                        <GoogleButton
                            image={googleImg}
                            style={{width: 45, height: 45, paddingTop: 6}}
                            onLogin={ (token) => {
                                console.log("onLogin", token);
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
                        />:null
                    }
                    <View style={{width: 40}}></View>
                     {
                        true?
                        <MicrosoftButton
                            image={googleImg}
                            style={{width: 45, height: 45, paddingTop: 6}}
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
                    />:null
                 }

                </View>
                {Platform.OS === "ios" /*|| Platform.OS === "android"*/?
                    <AppleButton
                        containerStyle={{marginTop: 20}}
                        onLogin={ (appleAuthRequestResponse) => {
                            console.log("onLogin", appleAuthRequestResponse);
                            this.setState({saving: true});
                            this.props.actions.sessionActions.loginApple(
                                    appleAuthRequestResponse,
                                    this.state.countryCode,
                                    this.state.languageCode,
                                    this.state.petition,
                                    this.state.hash
                            ).then(() => {
                                // Happy login
                            }, err => {
                                this.setState({saving: false});
                                if (err.reason)
                                    toast.error(err.reason);
                            });
                        }}
                        onCancelled={ (what) => {
                            console.log("onCancelled", what);
                        }}
                        onError={ (error) => {
                            console.log("onError", error);
                            //toast.error("Login with Apple failed");
                        }}
                    />
                :null}

                <View style={[loginStyles.lineDelimiter, this.style.marginTopBetweenSocialmediaAndTextboxes]}></View>

                <View style={[{width: "100%", maxWidth: formWidth}, this.style.marginTopBetweenSocialmediaAndTextboxes]}>

                    <FliwerTextInput
                        containerStyle={loginStyles.textFieldContainerStyle}
                        style={loginStyles.textFieldStyle}
                        placeholder={this.props.actions.translate.get('loginVC_mail_placeholder')}
                        onChangeText={(text) => {
                            var email = text.replace(/[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
                            this.setState({email: email});
                        }}
                        value={this.state.email}
                        returnKeyType = {"next"}
                        autoComplete={"email"}
                        autoCapitalize = 'none'
                        textContentType={"emailAddress"}
                        onSubmitEditing={() => {
                            this.secondTextInput.focus();
                        }}
                        blurOnSubmit={false}
                        keyboardType={"email-address"}
                    />

                    <View style={{}}>
                        <FliwerTextInput
                            containerStyle={loginStyles.textFieldContainerStyle}
                            style={loginStyles.textFieldStyle}
                            secureTextEntry={this.state.showPassword?false:true}
                            autoComplete={"password"}
                            textContentType={"password"}
                            autoCapitalize = 'none'
                            placeholder={this.props.actions.translate.get('loginVC_pass_placeholder')}
                            onChangeText={(text) => this.setState({password: text})}
                            textInputRef={(input) => {
                                this.secondTextInput = input;
                            }}
                            onSubmitEditing={() => {
                                this.manualLogin();
                            }}
                        />
                        <View style={loginStyles.showPasswordStyle}>
                            <TouchableWithoutFeedback style={{width: "100%", height: "100%"}}
                                    onPress={()=>this.setState({showPassword:!this.state.showPassword})}>
                                <Icon name="eye" size={30} style={[(this.state.showPassword?{color:"black"}:{})]} ></Icon>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>

                </View>

                <View style={{marginTop: 10}}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.setState({goRecoveryPass: true})
                        }}>
                        <Text style={loginStyles.littleTextStyle}>
                            {//¿Has olvidado tu contraseña? /// 8499
                            this.props.actions.translate.get('loginVC_forget_pass')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {false?<View style={[loginStyles.lineDelimiter, {marginTop: 20}]}></View>:null}
                {false?<View style={{marginTop: 20}}>
                    <TouchableOpacity
                        style={{}}
                        onPress={() => {
                            this.setState({goRegister: true})
                        }}>
                        <Text style={loginStyles.littleTextStyle}>
                            {//"¿No tienes una cuenta? Regístrate"
                            //Don't have you an account? Sign up
                            this.props.actions.translate.get('loginVC_dont_have_you_account')}
                        </Text>
                    </TouchableOpacity>
                </View>:null}

            </View>
        );
    }

    renderUpdateAppModal() {

        if (!this.state.updateAppModalVisible)
            return null;

        return (
            <FliwerUpdateAppModal onClose={() => {
                    this.setState({updateAppModalVisible: false});
                }}
                forceUpdateApp={this.state.forceUpdateApp}
                versionCode={this.state.versionCode}
                versionName={this.state.versionName}
            />
        );
    }

    checkVersion() {

        if (Platform.OS!='android' && !this.state.goStart && !this.state.checkedVersion && this.state.versionCode != null && !this.state.updateAppModalHasBeenChecked) {
            this.state.updateAppModalHasBeenChecked = true;

            setTimeout(() => {
                var version = FliwerCommonUtils.getVersion();
                if (version != null && version < this.state.versionCode) {
                    this.setState({updateAppModalVisible: true});
                }
            }, 200);
        }

    }

    async manualLogin() {
        if (this.state.password)
        {
            this.setState({saving: true});
            await this.props.actions.sessionActions.login(
                    this.state.email,
                    this.state.password,
                    this.state.languageCode,
                    this.state.petition,
                    this.state.hash
            ).then(() => {

            }, (error) => {
                this.setState({saving: false});
            });
        } else {
            toast.error(this.props.actions.translate.get('loginVC_fields_required'))
        }
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
        isVisitor: state.sessionReducer.isVisitor,
        roles: state.sessionReducer.roles,
        versionCode: state.sessionReducer.versionCode,
        versionName: state.sessionReducer.versionName,
        forceUpdateApp: state.sessionReducer.forceUpdateApp,
        checkedVersion: state.sessionReducer.checkedVersion,
        defaultApp: state.sessionReducer.defaultApp
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(ActionsSession, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {

    marginTopBetweenSocialmediaAndTextboxes: {
        marginTop: 40
    },
    fliwerGreenButton: {
        width: "100%",
        height: 40
    },
    finalBlock: {
        width: "100%",
        height: 0
    },
    "@media (height<=785)":{
        marginTopBetweenSocialmediaAndTextboxes: {
            marginTop: 20
        }
    },
    "@media (height<=620)":{
        finalBlock: {
            height: 20
        }
    }
};

if (Platform.OS === "ios")
    style.marginTopBetweenSocialmediaAndTextboxes.marginTop = 30;

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginLogin)));
