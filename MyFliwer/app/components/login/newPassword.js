'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TextInput, TouchableOpacity, Platform} from 'react-native';

import Dropdown from '../../widgets/dropdown/dropdown';
import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerTextInput from '../custom/FliwerTextInput.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {loginStyles} from './loginStyles.js';
import {FliwerColors} from '../../utils/FliwerColors'
import { Redirect,withRouter } from '../../utils/router/router'
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import fliwerLogo  from '../../assets/img/logo_fliwer.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

class LoginNewPassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hash: this.props.match.params.hash,
            lang: this.props.match.params.lang,
            password: "",
            password2: "",
            country_code: this.props.country ? this.props.country : null,
            languageHasChangeManually: this.props.languageHasChangeManually ? this.props.languageHasChangeManually : false,
            saving: false,
            searchedCountry: false,
            goStart: false
        };

        this.props.actions.translate.getTranslation(this.state.lang);
    }

    render() {

        var that = this;

        if (this.props.logedIn) {
            if (this.props.isGardener)
                return (<Redirect push to={"/gardener"} />);
            else
                return (<Redirect push to={"/zone"} />);
        } else if (this.state.goStart) {
            return (<Redirect push to={"/start"} />);
        } else if (this.props.loading /*|| this.state.activate*/) {
            return (
                    <FliwerLoading/>
                    );
        } else {

            var maxWidth = loginStyles.getMaxWidth();
            var formWidth = loginStyles.getFormWidth();
            var logoSize = loginStyles.getLogoSize();

            return (
                    <ImageBackground  style={{height: "100%", backgroundColor: "white"}} resizeMode={"cover"} loading={this.state.saving}>
                        <ScrollView scrollEventThrottle={1000} style={loginStyles.contentView} contentContainerStyle={loginStyles.contentViewContainer}>

                            <View style={[loginStyles.contentViewIn, {width: maxWidth, height: null, marginBottom: 40}]}>

                                <View style={loginStyles.content}>

                                    <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                                        onPress={() => {
                                            this.setState({goStart: true})
                                        }}>
                                        <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                                    </TouchableOpacity>

                                    <Text style={loginStyles.titleStyle}>
                                        {this.props.actions.translate.get('loginVC_enter_your_new_password')}
                                    </Text>

                                    <View style={{width: "100%", maxWidth: formWidth, marginTop: 40}}>
                                        <Dropdown
                                            modal={true}
                                            placeholder={this.props.actions.translate.get('general_language')}
                                            selectedValue={this.props.language}
                                            style={[{marginTop: 10}, Platform.OS == "android" || Platform.OS == 'ios'? {borderWidth: 1, borderRadius: 4, borderColor: "gray"} : {}]}
                                            styleOptions={{textAlign: "center", fontFamily: FliwerColors.fonts.light, zIndex: 999}}
                                            options={this.printLanguages()}
                                            onChange={(value) => {
                                                if (value)
                                                {
                                                    this.props.actions.translate.getTranslation(value);
                                                    this.setState({languageHasChangeManually: true});
                                                    this.props.actions.translate.activateLanguageHasChangeManually();
                                                }
                                        }} />
                                    </View>

                                    <View style={{width: "100%", maxWidth: formWidth, marginTop: 40}}>

                                        <FliwerTextInput
                                            containerStyle={loginStyles.textFieldContainerStyle}
                                            style={loginStyles.textFieldStyle}
                                            secureTextEntry={true}
                                            autoCapitalize = 'none'
                                            placeholder={this.props.actions.translate.get('loginVC_pass_placeholder')}
                                            onChangeText={(text) => that.setState({password: text})}
                                            ref={(input) => {
                                                this.secondTextInput = input;
                                            }}
                                            onSubmitEditing={() => {
                                                this.secondTextInput2.focus();
                                            }}
                                        />

                                        <FliwerTextInput
                                            containerStyle={loginStyles.textFieldContainerStyle}
                                            style={loginStyles.textFieldStyle}
                                            secureTextEntry={true}
                                            autoCapitalize = 'none'
                                            placeholder={this.props.actions.translate.get('userRegisterVC_repeat_password_tf')}
                                            onChangeText={(text) => that.setState({password2: text})}
                                            ref={(input) => {
                                                this.secondTextInput2 = input;
                                            }}
                                            onSubmitEditing={() => {
                                                this.resetPasswordChange()
                                            }}
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
                                        await this.resetPasswordChange();
                                    }}
                                    text={this.props.actions.translate.get('loginVC_change_pass')}
                                />
                            </View>
                        </ScrollView>

                    </ImageBackground>
                    );
        }
    }

    printLanguages() {
        var that = this;
        if (!this.props.allLanguages)
            return [];
        var arr = Object.keys(this.props.allLanguages).map(function (key) {
            return {label: that.props.allLanguages[key].complete_name, value: that.props.allLanguages[key].name};
        });
        function compare(a, b) {
            if (a.value < b.value)
                return -1;
            if (a.value > b.value)
                return 1;
            return 0;
        }
        return arr.sort(compare);
    }

    async resetPasswordChange() {
        if (this.state.password == this.state.password2) {
            this.setState({saving: true});
            await this.props.actions.sessionActions.resetPasswordChange(this.state.hash, this.state.lang, this.state.password).then(async (response) => {
                await this.props.actions.sessionActions.login(response.email, this.state.password);
                //this.setState({saving:false});
            }, (err) => {
                this.setState({saving: false});
                toast.error(this.props.actions.translate.get('userForgotPasswordVC_not_found'))
                console.log("Error:", err);
            })
        } else
            toast.error(this.props.actions.translate.get('userRegisterVC_password_mach_tf'))
    }

};


function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        logedIn: state.sessionReducer.logedIn,
        userData: state.sessionReducer.data,
        language: state.languageReducer.language,
        allLanguages: state.languageReducer.languages,
        translation: state.languageReducer.translation,
        isGardener: state.sessionReducer.isGardener,
        country: state.languageReducer.country,
        languageHasChangeManually: state.languageReducer.languageHasChangeManually
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
    fliwerGreenButton: {
        width: "100%",
        height: 40
    }
};


//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginNewPassword)));
