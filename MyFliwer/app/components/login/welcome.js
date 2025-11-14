'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity, Platform} from 'react-native';

import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../custom/FliwerUpdateAppModal.js'
import LoginBottomBar from './bottomBar.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionInitial from '../../actions/initialActions.js';

import {loginStyles} from './loginStyles.js';
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import { Redirect, withRouter } from '../../utils/router/router'
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import fliwerLogo  from '../../assets/img/logo_fliwer_new_dark.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

class LoginWelcome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goLogin: false,
            saving: false,
            initSpain: false,
            goStart: false,
            goPreregister: false,
            goToCalculateFliwer: false,
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
            updateAppModalHasBeenChecked: false
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

        this.checkVersion();

        console.log("End constructor");
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

    render() {
        if (this.props.logedIn && this.props.defaultApp) {
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
        } else if (this.state.goLogin) {
            return (<Redirect push to={"/login"} />);
        } else if (!this.props.loading && this.state.initSpain) {
            return (<Redirect push to={"/init/spain"}/>);
        } else if (this.state.goToCalculateFliwer) {
            //return (<Redirect push to={"/init/spain/gardenLocation"}/>);
            return (<Redirect push to={"/init/spain/forWhat"}/>);
        } else if (this.props.loading) {
            return (
                    <FliwerLoading/>
                    );
        } else {

            var maxWidth = loginStyles.getMaxWidth();
            var formWidth = loginStyles.getFormWidth();
            var logoSize = loginStyles.getLogoSize();
            var marginTopBetweenLogoAndTitle = loginStyles.getMarginTopBetweenLogoAndTitle();
            var isLittleHeight = loginStyles.isLittleHeight();
            var diffMargin = isLittleHeight? 10 : 0;

            return (
                    <ImageBackground  style={{height: "100%", backgroundColor: "white"}} resizeMode={"cover"} loading={this.state.saving}>
                        <ScrollView scrollEventThrottle={1000} style={loginStyles.contentView} contentContainerStyle={loginStyles.contentViewContainer}>

                            <View style={[loginStyles.contentViewIn, {width: maxWidth}]}>

                                <View style={[loginStyles.content, {width: "100%", paddingBottom: 40}]}>

                                    <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                                        onPress={() => {
                                            this.setState({goStart: true})
                                        }}>
                                        <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                                    </TouchableOpacity>

                                    <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                                        {this.props.actions.translate.get('hello') + "!"}
                                    </Text>

                                    <Text style={[loginStyles.titleStyle, {marginTop: 10}]}>
                                        {this.props.actions.translate.get('welcome') + "!"}
                                    </Text>

                                    <Text style={[loginStyles.descriptionStyle, {width: "100%", maxWidth: formWidth}]}>{
                                        //"¿Es tu primera vez? ¿O ya formas parte de fliwer?"
                                        //this.props.actions.translate.get('loginVC_is_your_first_time_or')

                                        //"¿Es tu primera vez?"
                                        this.props.actions.translate.get('loginVC_is_your_first_time')

                                    }</Text>

                                    <FliwerGreenButton
                                        containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth, marginTop: 10}}
                                        style={[loginStyles.buttonStyle, {backgroundColor: FliwerColors.complementary.blue}]}
                                        textStyle={loginStyles.buttonTextStyle}
                                        onPress={() => {
                                            this.setState({goPreregister: true});
                                        }}
                                        text={this.props.actions.translate.get('loginVC_im_new')}
                                    />

                                    <Text style={[loginStyles.descriptionStyle, {width: "100%", maxWidth: formWidth, marginTop: 20 - diffMargin}]}>{
                                        //"¿O ya formas parte de fliwer?"
                                        this.props.actions.translate.get('loginVC_or_you_are_already_on_fliwer').replace("fliwer","I've Work App")

                                        //"¿Quieres entrar a fliwer?"
                                        //this.props.actions.translate.get('loginVC_do_you_want_to_access_to_fliwer')
                                    }</Text>

                                    <FliwerGreenButton
                                        containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth, marginTop: 10}}
                                        style={loginStyles.buttonStyle}
                                        textStyle={{fontWeight: "bold"}}
                                        onPress={() => {
                                            this.setState({goLogin: true});
                                        }}
                                        text={
                                            this.props.actions.translate.get('loginVC_iam_already_on_fliwer').replace("fliwer","I've Work App")

                                            //"Entrar a fliwer"
                                            //this.props.actions.translate.get('loginVC_access_to_fliwer')
                                        }
                                    />

                                    {0 &&(this.state.countryCode=="ES" || this.state.countryCode=="CR")?<Text style={[loginStyles.descriptionStyle, {width: "100%", maxWidth: formWidth, marginTop: 20 - diffMargin}]}>{
                                        //"Sólo quiero informarme"
                                        //I just want to inform myself
                                        this.props.actions.translate.get('loginVC_i_just_want_to_inform_myself')
                                    }</Text>:null}

                                    {0 &&(this.state.countryCode=="ES" || this.state.countryCode=="CR")?<FliwerGreenButton
                                        containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth, marginTop: 10}}
                                        style={[loginStyles.buttonStyle, {backgroundColor: FliwerColors.primary.gray}]}
                                        textStyle={loginStyles.buttonTextStyle}
                                        onPress={() => {
                                            this.calculateFliwer();
                                        }}
                                        text={
                                            //"Calcula tu Fliwer"
                                            this.props.actions.translate.get('calcfw_calculate_fliwer')
                                        }
                                    />:null}

                                    <View style={{marginBottom: 40}}></View>

                                </View>
                            </View>
                        </ScrollView>

                        <LoginBottomBar
                            arrowLeft={() => {
                                this.setState({goStart: true});
                            }} />

                        {this.renderUpdateAppModal()}

                    </ImageBackground>
                    );
        }
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

    calculateFliwer()
    {
        var isTest = false;

        if (!isTest)
        {
            this.setState({saving: true});
            this.props.actions.initialActions.cleanInitialData().then(() => {
                this.setState({goToCalculateFliwer: true});
            }, (error) => {
                this.setState({saving: false});
            });
        }
        else
        {
            // Test
            this.setState({saving: true});
            this.props.actions.initialActions.testing({}).then(() => {
                this.setState({saving: false});
            }, (error) => {
                this.setState({saving: false});
            });
        }
    }

};


function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        logedIn: state.sessionReducer.logedIn,
        userData: state.sessionReducer.data,
        language: state.languageReducer.language,
        translation: state.languageReducer.translation,
        countryCode: state.languageReducer.country,
        cookiesPolicyAccepted: state.languageReducer.cookiesPolicyAccepted,
        petition: state.sessionReducer.petition,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
        versionCode: state.sessionReducer.versionCode,
        versionName: state.sessionReducer.versionName,
        forceUpdateApp: state.sessionReducer.forceUpdateApp,
        checkedVersion: state.sessionReducer.checkedVersion,
        initialReducer: state.initialReducer,
        defaultApp: state.sessionReducer.defaultApp
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(ActionsSession, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            initialActions: bindActionCreators(ActionInitial, dispatch)
        }
    };
}

var style = {

};

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginWelcome)));
