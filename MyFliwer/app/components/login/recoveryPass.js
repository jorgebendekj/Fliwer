'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';

import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerTextInput from '../custom/FliwerTextInput.js'
import LoginBottomBar from './bottomBar.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {loginStyles} from './loginStyles.js';
import {FliwerColors} from '../../utils/FliwerColors'
import { Redirect } from '../../utils/router/router'
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import fliwerLogo  from '../../assets/img/logo_fliwer.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

class recoveryPass extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goLogin: false,
            saving: false,
            goStart: false,
            email: ""
        };
    }

    render() {
        if (this.props.logedIn) {
            if (this.props.isGardener || this.props.isVisitor)
                return (<Redirect push to={"/gardener"} />);
            else
                return (<Redirect push to={"/zone"} />);
        } else if (this.state.goLogin) {
            return (<Redirect push to={"/login"} />);
        } else if (this.state.goStart) {
            return (<Redirect push to={"/start"} />);
        } else if (this.props.loading) {
            return (
                    <FliwerLoading/>
                    );
        } else {

            var maxWidth = loginStyles.getMaxWidth();
            var formWidth = loginStyles.getFormWidth();
            var logoSize = loginStyles.getLogoSize();
            var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();

            return (
                    <ImageBackground  style={{height: "100%", backgroundColor: "white"}} resizeMode={"cover"} loading={this.state.saving}>
                        <ScrollView scrollEventThrottle={1000} style={loginStyles.contentView} contentContainerStyle={loginStyles.contentViewContainer}>

                            <View style={[loginStyles.contentViewIn, {width: maxWidth, height: null, marginBottom: 20}]}>

                                <View style={loginStyles.content}>

                                    <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                                        disabled={false}
                                        onPress={() => {
                                            this.setState({goStart: true})
                                        }}>
                                        <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                                    </TouchableOpacity>

                                    <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                                        {//"Recupera tu contraseña"
                                        this.props.actions.translate.get('loginVC_recover_your_pass')}
                                    </Text>

                                    <Text style={loginStyles.descriptionStyle}>
                                        {//"Te enviaremos un email con las instrucciones para recuperar tu contraseña"
                                        //We will send you an email with the instructions to recover your password
                                        this.props.actions.translate.get('loginVC_recovery_pass_instructions')}
                                    </Text>

                                    <View style={{width: "100%", maxWidth: formWidth, marginTop: 40}}>

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
                                            autoComplete={"on"}
                                            autoCapitalize = 'none'
                                            onSubmitEditing={() => {
                                                this.recoveryPassword();
                                            }}
                                            blurOnSubmit={false}
                                            keyboardType={"email-address"}
                                        />

                                    </View>

                                    <View style={[loginStyles.lineDelimiter, {marginTop: 40}]}></View>

                                    <View style={{marginTop: 40}}>
                                        <Text style={loginStyles.littleTextStyle}>
                                            {//"¿No recuerdas tu email? Contacta con nosotros a support@fliwer.com"
                                            //Don't you remember your email? Contact us at support@fliwer.com
                                            this.props.actions.translate.get('loginVC_contact_us_if_youve_forgotten_pass')}
                                        </Text>
                                    </View>

                                </View>
                            </View>

                            <View style={[this.style.fliwerGreenButton, {paddingLeft: loginStyles.contentViewIn.paddingLeft, paddingRight: loginStyles.contentViewIn.paddingRight}, {marginBottom: loginStyles.getFliwerButtonMarginBottom()}]}>
                                <FliwerGreenButton
                                    containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth}}
                                    style={loginStyles.buttonStyle}
                                    textStyle={loginStyles.buttonTextStyle}
                                    onPress={async () => {
                                        await this.recoveryPassword();
                                    }}
                                    text={this.props.actions.translate.get('loginVC_recovery_pass')}
                                />
                            </View>

                            <View style={this.style.finalBlock}></View>
                        </ScrollView>

                        <LoginBottomBar
                            arrowLeft={() => {
                                this.setState({goLogin: true});
                            }} />

                    </ImageBackground>
                    );
        }
    }

    async recoveryPassword() {
        this.setState({saving: true});
        console.log("this.props.language", this.props.language);
        await this.props.actions.sessionActions.requestResetPassword(this.state.email, this.props.language).then((response) => {
            if (response.ok == true)
                toast.notification(this.props.actions.translate.get('loginVC_email_sent'));
            this.setState({saving: false});
        }, (error) => {
            if (error.id == 21)
                toast.error(this.props.actions.translate.get('loginVC_email_not_registered'))
            else if (error.id == 15)
                toast.error(this.props.actions.translate.get('loginVC_fill_email'))
            this.setState({saving: false});
        })

    }

};


function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        logedIn: state.sessionReducer.logedIn,
        userData: state.sessionReducer.data,
        language: state.languageReducer.language,
        translation: state.languageReducer.translation,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
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
    fliwerGreenButton: {
        width: "100%",
        height: 40
    },
    finalBlock: {
        width: "100%",
        height: 0
    },
    "@media (height<=620)":{
        finalBlock: {
            height: 20
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, recoveryPass));
