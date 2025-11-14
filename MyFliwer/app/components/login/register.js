'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity, TouchableWithoutFeedback, Platform, Keyboard} from 'react-native';

import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import LoginBottomBar from './bottomBar.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerTextInput from '../custom/FliwerTextInput.js'
import FliwerAcceptConditions from '../custom/FliwerAcceptConditions.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {loginStyles} from './loginStyles.js';
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import { Redirect,withRouter } from '../../utils/router/router'
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import Icon from 'react-native-vector-icons/EvilIcons';

import fliwerLogo  from '../../assets/img/logo_fliwer_new_dark.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

class LoginRegister extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goLogin: false,
            saving: false,
            goStart: false,
            goPreregister: false,
            name: "",
            surname: "",
            password: "",
            repeatPassword: "",
            countryCode: this.props.countryCode,
            languageCode: this.props.language,
            cookiesPolicyAccepted: this.props.cookiesPolicyAccepted,
            showPassword: false,
            showRepeatPassword: false,
            petition: this.props.match.params.petition? this.props.match.params.petition : (this.props.petition? this.props.petition.id : null),
            hash: this.props.match.params.hash? this.props.match.params.hash : (this.props.petition? this.props.petition.hash : null),
            email: this.props.match.params.email? this.props.match.params.email : (this.props.petition? this.props.petition.email : ""),
            acceptConditions: false,

            keyboardOffset: 0
        };

        if (this.props.match.params.petition && this.props.match.params.hash) {
            this.props.actions.sessionActions.setPetition(this.props.match.params.petition, this.props.match.params.hash, this.state.email);
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

        console.log("this.state.countryCode", this.state.countryCode);
        console.log("this.state.languageCode", this.state.languageCode);
        console.log("this.state.petition", this.state.petition);
        console.log("this.state.hash", this.state.hash);
        console.log("this.state.email", this.state.email);

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

    render() {
        if(this.props.offline){  
            return (<Redirect push to={"/app/"} />);
        }else if (this.props.logedIn) {
            if (this.props.isGardener || this.props.isVisitor)
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
            else
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
        } else if (this.state.goLogin) {
            return (<Redirect push to={"/login"} />);
        } else if (this.state.goStart) {
            return (<Redirect push to={"/start"} />);
        } else if (this.state.goPreregister) {
            return (<Redirect push to={"/preregister"} />);
        } else if (this.props.loading) {
            return (
                    <FliwerLoading/>
                    );
        } else {

            var maxWidth = loginStyles.getMaxWidth();
            var formWidth = loginStyles.getFormWidth();
            var logoSize = loginStyles.getLogoSize();
            var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();

            var disabledEmail = (this.state.petition==='invitation' && this.state.email)? true : false;

            return (
                    <ImageBackground  style={[{height: "100%", backgroundColor: "white"}, Platform.OS === "ios"? {top: this.state.keyboardOffset * (-1)}:{}]} resizeMode={"cover"} loading={this.state.saving}>
                        <ScrollView scrollEventThrottle={1000} style={loginStyles.contentView} contentContainerStyle={loginStyles.contentViewContainer}>

                            <View style={[loginStyles.contentViewIn, {width: maxWidth, height: null, marginBottom: 0}]}>

                                <View style={loginStyles.content}>

                                    <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                                        onPress={() => {
                                            this.setState({goStart: true})
                                        }}>
                                        <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                                    </TouchableOpacity>

                                    <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                                        {//"Introduce tus datos para registrarte"
                                        //Enter your data to register
                                        this.props.actions.translate.get('loginVC_enter_your_data_to_register')}
                                    </Text>

                                    <View style={[{width: "100%", maxWidth: formWidth}, this.style.marginTopTextboxes]}>
                                        <FliwerTextInput
                                            containerStyle={[loginStyles.textFieldContainerStyle/*, this.state.nameIsActive? {borderColor: FliwerColors.primary.green, borderWidth: 1} : {}*/]}
                                            style={[loginStyles.textFieldStyle/*, this.state.nameIsActive? {borderColor: FliwerColors.primary.green, borderWidth: 1} : {}*/]}
                                            autoCapitalize = 'none'
                                            returnKeyType = {"done"}
                                            placeholder={this.props.actions.translate.get('userRegisterVC_name_tf')}
                                            onChangeText={(text) => {
                                                var name = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
                                                this.setState({name: name});
                                            }}
                                            value={this.state.name}
                                            onSubmitEditing={() => {
                                                this.surnameTextInput.focus()
                                            }}
                                            blurOnSubmit={true}
                                            multiline = {false}
                                            onFocus={() => {
                                                //this.setState({ nameIsActive: true });
                                            }}
                                            onBlur={() => {
                                                //this.setState({ nameIsActive: false });
                                            }}
                                            />

                                        <FliwerTextInput
                                            containerStyle={loginStyles.textFieldContainerStyle}
                                            style={loginStyles.textFieldStyle}
                                            autoCapitalize = 'none'
                                            returnKeyType = {"done"}
                                            placeholder={this.props.actions.translate.get('userRegisterVC_surname_tf')}
                                            onChangeText={(text) => {
                                                var surname = text.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
                                                this.setState({surname: surname});
                                            }}
                                            value={this.state.surname}
                                            textInputRef={(input) => {
                                                this.surnameTextInput = input;
                                            }}
                                            onSubmitEditing={() => {
                                                this.emailTextInput.focus()
                                            }}
                                            blurOnSubmit={true}
                                            multiline = {false}
                                            />

                                        <FliwerTextInput
                                            containerStyle={[loginStyles.textFieldContainerStyle, disabledEmail? {backgroundColor: "rgb(245, 245, 245)"} : {}]}
                                            style={[loginStyles.textFieldStyle, disabledEmail? {backgroundColor: "rgb(245, 245, 245)"} : {}]}
                                            placeholder={this.props.actions.translate.get('loginVC_mail_placeholder')}
                                            onChangeText={(text) => {
                                                var email = text.replace(/[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
                                                this.setState({email: email});
                                            }}
                                            value={this.state.email}
                                            returnKeyType = {"done"}
                                            autoCapitalize = 'none'
                                            textContentType={"username"}
                                            textInputRef={(input) => {
                                                this.emailTextInput = input;
                                            }}
                                            onSubmitEditing={() => {
                                                this.passTextInput.focus();
                                            }}
                                            blurOnSubmit={true}
                                            multiline = {false}
                                            disabled={disabledEmail}
                                            />

                                        <View style={{}}>
                                            <FliwerTextInput
                                                containerStyle={loginStyles.textFieldContainerStyle}
                                                style={loginStyles.textFieldStyle}
                                                secureTextEntry={this.state.showPassword?false:true}
                                                value={this.state.password}
                                                autoCapitalize = 'none'
                                                returnKeyType = {"done"}
                                                textContentType={"newPassword"}
                                                placeholder={this.props.actions.translate.get('loginVC_pass_placeholder')}
                                                onChangeText={(text) => this.setState({password: text})}
                                                textInputRef={(input) => {
                                                    this.passTextInput = input;
                                                }}
                                                onSubmitEditing={() => {
                                                    this.repeatPassTextInput.focus();
                                                }}
                                                blurOnSubmit={true}
                                                multiline = {false}
                                                />
                                            <View style={loginStyles.showPasswordStyle}>
                                                <TouchableWithoutFeedback style={{width: "100%", height: "100%"}}
                                                        onPressIn={()=>this.setState({showPassword:true})}
                                                        onPressOut={()=>this.setState({showPassword:false})}>
                                                    <Icon name="eye" size={30} style={[(this.state.showPassword?{color:"black"}:{})]} ></Icon>
                                                </TouchableWithoutFeedback>
                                            </View>
                                        </View>

                                        <View style={{}}>
                                            <FliwerTextInput
                                                containerStyle={loginStyles.textFieldContainerStyle}
                                                style={loginStyles.textFieldStyle}
                                                secureTextEntry={this.state.showRepeatPassword?false:true}
                                                autoCapitalize = 'none'
                                                returnKeyType = {"done"}
                                                placeholder={this.props.actions.translate.get('userRegisterVC_repeat_password_tf')}
                                                onChangeText={(text) => this.setState({repeatPassword: text})}
                                                textInputRef={(input) => {
                                                    this.repeatPassTextInput = input;
                                                }}
                                                onSubmitEditing={() => {
                                                    this.manualRegister()
                                                }}
                                                blurOnSubmit={true}
                                                multiline = {false}
                                                />
                                            <View style={loginStyles.showPasswordStyle}>
                                                <TouchableWithoutFeedback style={{width: "100%", height: "100%"}}
                                                        onPressIn={()=>this.setState({showRepeatPassword:true})}
                                                        onPressOut={()=>this.setState({showRepeatPassword:false})}>
                                                    <Icon name="eye" size={30} style={[(this.state.showRepeatPassword?{color:"black"}:{})]} ></Icon>
                                                </TouchableWithoutFeedback>
                                            </View>
                                        </View>

                                        <FliwerAcceptConditions
                                            ref={(o) => this._fliwerAcceptConditions = o}
                                            checked={this.state.acceptConditions? true : false}
                                            onPress={this.changeCheckboxAcceptConditionsValue()}
                                            showConditions={()=>this._fliwerAcceptConditions.onPressShowConditions()}
                                            type={"pricacy-policy"}
                                            title={this.props.actions.translate.get('acceptCond_I_accept_privacy_policy')}
                                        />

                                    </View>
                                </View>
                            </View>

                            <View style={[this.style.fliwerGreenButton, {paddingLeft: loginStyles.contentViewIn.paddingLeft, paddingRight: loginStyles.contentViewIn.paddingRight}, {marginBottom: loginStyles.getFliwerButtonMarginBottom()}]}>
                                <FliwerGreenButton
                                    containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth}}
                                    style={loginStyles.buttonStyle}
                                    textStyle={loginStyles.buttonTextStyle}
                                    onPress={async () => {
                                         await this.manualRegister();
                                    }}
                                    text={this.props.actions.translate.get('signin')}
                                />
                            </View>

                            <View style={this.style.finalBlock}></View>
                        </ScrollView>

                        <LoginBottomBar
                            arrowLeft={() => {
                                this.setState({goPreregister: true});
                            }} />

                    </ImageBackground>
                    );
        }
    }

    changeCheckboxAcceptConditionsValue() {
        return () => {
            this.setState({acceptConditions: !this.state.acceptConditions})
        };
    }

    async manualRegister() {

        if (this.state.email && !FliwerCommonUtils.validateEmail(this.state.email)) {
            toast.error(this.props.actions.translate.get('loginVC_email_is_not_correct'));
            return;
        }

        if (!this.state.name || !this.state.surname || !this.state.email || !this.state.password || !this.state.repeatPassword || !this.state.countryCode) {
            toast.error(this.props.actions.translate.get('loginVC_fields_required'));
            return;
        }

        if (this.state.password !== this.state.repeatPassword) {
            // Las contraseñas no són idénticas
            toast.error(this.props.actions.translate.get('loginVC_passwords_are_not_identical'));
            return;
        }

        if (!this.state.acceptConditions) {
            toast.error(this.props.actions.translate.get('loginVC_you_must_accept_privacy_policy'));
            return;
        }

        this.setState({saving: true});
        await this.props.actions.sessionActions.register(
                this.state.email,
                this.state.password,
                this.state.name,
                this.state.surname,
                this.state.countryCode,
                this.state.languageCode,
                this.state.petition,
                this.state.hash
        ).then(function () {}, (err) => {
            this.setState({saving: false});
            toast.error(err.reason);
        });

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

    marginTopTextboxes: {
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
    "@media (height<=800)":{
        marginTopTextboxes: {
            marginTop: 20
        }
    },
    "@media (height<=720)":{
        finalBlock: {
            height: 20
        }
    }

};

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginRegister)));
