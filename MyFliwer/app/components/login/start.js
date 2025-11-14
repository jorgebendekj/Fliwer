'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Image, Text, TouchableOpacity, Platform} from 'react-native';

import Dropdown from '../../widgets/dropdown/dropdown';
import ImageBackground from '../imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerConditionsModal from '../custom/FliwerConditionsModal.js'
import LoginBottomBar from './bottomBar.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {loginStyles} from './loginStyles.js';
import {FliwerColors} from '../../utils/FliwerColors'
import { Redirect, withRouter } from '../../utils/router/router'
import {toast} from '../../widgets/toast/toast'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import fliwerLogo  from '../../assets/img/logo_fliwer_new_dark.png'
import rainolveLogo  from '../../assets/img/logo_rainolve.png'

class LoginStart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            countries: this.props.countries? this.props.countries : null,
            oldCountryCode: null,
            countryCode: this.props.country ? this.props.country : null,
            oldLanguageCode: null,
            languageCode: this.props.language ? this.props.language : null,
            updatingTranslations: false,

            languageHasChangeManually: this.props.languageHasChangeManually ? this.props.languageHasChangeManually : false,
            saving: false,
            gettingLocation: false,
            checkedCountryAndLanguage: false,
            goStart: false,
            goWelcome: false,
            waitingToGoWelcome: false,
            goRegister: false,
            goLogin: false,

            cookiesPolicyModalVisible: false,
            cookiesPolicyAccepted: this.props.cookiesPolicyAccepted,
            goWelcomeAfterAcceptingPolicy: false,

            petition: (this.props.petition? this.props.petition.id : null)
        };

        if (this.state.countries && Object.entries(this.state.countries).length > 0)
        {
            if (this.state.countryCode && this.state.languageCode)
            {
                this.state.checkedCountryAndLanguage = true;

                if (!this.state.cookiesPolicyAccepted)
                    this.getCookiesPolicyAccepted().then((accepted) => {
                        this.props.actions.translate.setCookiesPolicyAccepted(accepted).then(()=>{
                            this.setState({
                                cookiesPolicyAccepted: accepted/*,
                                cookiesPolicyModalVisible: !accepted*/
                            });
                        });
                    });
            }
            else
            {
                this.getCountryAndLanguage();
            }
        }


    }

    componentWillReceiveProps(nextProps) {

        if (this.state.countries && Object.entries(this.state.countries).length > 0) return;

        if (nextProps.countries && Object.entries(nextProps.countries).length > 0) {
            this.state.countries = nextProps.countries;
            this.getCountryAndLanguage(true);
        }
    }

    render() {
        if(this.props.offline){  
            return (<Redirect push to={"/app/fliwer"} />);
        }else if (this.props.logedIn) {
            if (this.props.isGardener || this.props.isVisitor)
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
            else
                return (<Redirect push to={"/app/"+this.props.defaultApp} />);
        } else if (this.props.reloginData && this.props.reloginData.relogin && this.state.countryCode && this.state.cookiesPolicyAccepted) {
            return (<Redirect push to={"/loginUser"} />);
        }  else if (this.state.goStart) {
            return (<Redirect push to={"/start"} />);
        } else if (this.state.goWelcome) {
            return (<Redirect push to={"/welcome"} />);
        } else if (this.state.goRegister) {
            return (<Redirect push to={"/register"} />);
        } else if (this.state.goLogin) {
            return (<Redirect push to={"/login"} />);
        } else if (this.props.loading || !this.state.checkedCountryAndLanguage) {
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

                            <View style={[loginStyles.contentViewIn, {width: maxWidth, height: null, marginBottom: 40}]}>

                                <View style={loginStyles.content}>

                                    <TouchableOpacity style={[loginStyles.logoContainer, {width: logoSize.width, height: logoSize.height, marginTop: logoSize.marginTop}]}
                                        disabled={true}
                                        onPress={() => {
                                            this.setState({goStart: true})
                                        }}>
                                        <Image source={(!global.envVars.TARGET_RAINOLVE?fliwerLogo:rainolveLogo)} resizeMode={"contain"} style={loginStyles.imageLogo}/>
                                    </TouchableOpacity>

                                    <Text style={[loginStyles.titleStyle, {marginTop: marginTopBetweenLogoAndTitle}]}>
                                        {//"Welcome to the future of plant care"
                                        /*this.props.actions.translate.get('loginVC_welcome_to_the_future_of_plant_care')*/
                                        "Bienvenido a la solución en la nube que tiene todo lo que necesitas para gestionar tu negocio, en cualquier momento y desde cualquier lugar"}
                                    </Text>

                                    <View style={{width: "100%", maxWidth: formWidth, marginTop: 10}}>

                                        <Text style={[loginStyles.descriptionStyle, {}]}>
                                            <Text>{
                                                "Por favor, confirma el país"
                                                //this.props.actions.translate.get('loginVC_please_confirm_the_country')
                                            }</Text>
                                            <Text> </Text>
                                            <Text style={{fontWeight: "bold"}}>{
                                                //dónde se encuentran tus plantas
                                                this.props.actions.translate.get('loginVC_where_your_plants_are_located')
                                            }</Text>
                                        </Text>

                                        <Dropdown
                                            modal={true}
                                            filterEnabled={true}
                                            placeholder={this.props.actions.translate.get('general_country')}
                                            selectedValue={this.state.countryCode}
                                            style={{marginTop: 10}}
                                            styleOptions={{textAlign: "center", fontFamily: FliwerColors.fonts.light, zIndex: 999}}
                                            options={this.printCountries()}
                                            onChange={
                                                async (code) => {
                                                    //console.log("onChange country", code);
                                                    var countriesTable = Object.values(this.props.countries);
                                                    var defaultLanguage = countriesTable.find((c) => {
                                                        return c.Code == code;
                                                    }).langName;

                                                    if (code)
                                                        this.props.actions.translate.setCountry(code);

                                                    //console.log("this.state.languageHasChangeManually", this.state.languageHasChangeManually);
                                                    //console.log("defaultLanguage", defaultLanguage);
                                                    if (!this.state.languageHasChangeManually && defaultLanguage)
                                                    {
                                                        this.setState({saving: true});
                                                        this.props.actions.translate.setLanguage(defaultLanguage);
                                                        await this.props.actions.translate.getTranslation(defaultLanguage, null, true);
                                                        this.waitUntilLanguageChanged(code, defaultLanguage);
                                                    }
                                                    else
                                                        this.setState({countryCode: code, saving: false});
                                                }
                                            } />
                                    </View>

                                    <View style={{width: "100%", maxWidth: formWidth, marginTop: 0}}>

                                        <Text style={loginStyles.descriptionStyle}>{
                                            //Y selecciona el idioma que quieres utilizar
                                            this.props.actions.translate.get('loginVC_and_select_language')
                                        }</Text>

                                        <Dropdown
                                            modal={true}
                                            placeholder={this.props.actions.translate.get('general_language')}
                                            selectedValue={this.state.languageCode}
                                            style={{marginTop: 10}}
                                            styleOptions={{textAlign: "center", fontFamily: FliwerColors.fonts.light}}
                                            options={this.printLanguages()}
                                            onChange={
                                                async (value) => {
                                                    if (value)
                                                    {
                                                        //console.log("onChange language", value);

                                                        this.setState({saving: true, languageHasChangeManually: true});
                                                        this.props.actions.translate.activateLanguageHasChangeManually();
                                                        this.props.actions.translate.setLanguage(value);
                                                        await this.props.actions.translate.getTranslation(value, null, true);
                                                        this.waitUntilLanguageChanged(this.state.countryCode, value);
                                                    }

                                            }} />
                                    </View>

                                </View>

                            </View>

                            <View style={[this.style.fliwerGreenButton, {paddingLeft: loginStyles.contentViewIn.paddingLeft, paddingRight: loginStyles.contentViewIn.paddingRight}, {marginBottom: loginStyles.getFliwerButtonMarginBottom()}]}>
                                <FliwerGreenButton
                                    containerStyle={{alignSelf: "center", width: "100%", maxWidth: formWidth}}
                                    style={loginStyles.buttonStyle}
                                    textStyle={loginStyles.buttonTextStyle}
                                    onPress={() => {

                                        if (this.state.cookiesPolicyAccepted)
                                            this.setState({goWelcome: true});
                                        else
                                            this.setState({cookiesPolicyModalVisible: true, goWelcomeAfterAcceptingPolicy: true});

                                    }}
                                    text={this.props.actions.translate.get('confirm')}
                                    disabled={false /*!this.state.cookiesPolicyAccepted*/}
                                />
                            </View>

                            <View style={this.style.finalBlock}></View>
                        </ScrollView>

                        <LoginBottomBar defaultCenterText={this.props.actions.translate.get('legalVC_legal_conditions')} />

                        {this.state.cookiesPolicyModalVisible?this.renderCookiesPolicyModal():null}

                    </ImageBackground>
                    );
        }
    }

    renderCookiesPolicyModal() {
        return (
            <FliwerConditionsModal onClose={() => {
                    this.props.actions.translate.setCookiesPolicyAccepted(true).then(()=>{
                        var goWelcome = this.state.goWelcomeAfterAcceptingPolicy;
                        this.setState({cookiesPolicyAccepted: true, cookiesPolicyModalVisible: false, goWelcomeAfterAcceptingPolicy: false, goWelcome: goWelcome});
                    });
                }}
                type={'cookies-policy'}
                buttonType={'accept'}
            />
        );
    }

    getCountryAndLanguage(mustRender)
    {
        var that = this;

        console.log("Start getCountryAndLanguage");
        uniqueStorage.getItem('country').then(function(data){
            try {
                data = JSON.parse(data);
            } catch (err) {
                data = null;
            }

            console.log("End getCountryAndLanguage", data);
            var country = (data && data.value? data.value : "");

            that.state.countryCode = country;
            that.getLanguage(mustRender);

        }, () => {
            console.log("Rejection getCountry");
            that.checkCountryAndLanguage(mustRender);
        });

    }

    getLanguage(mustRender) {
        var that = this;

        console.log("Start getLanguage");
        uniqueStorage.getItem('language').then(function(data){
            try {
                data = JSON.parse(data);
            } catch (err) {
                data = null;
            }

            console.log("End getLanguage", data);
            var language = (data && data.value? data.value : "");

            that.state.languageCode = language;
            that.checkCountryAndLanguage(mustRender);

        }, () => {
            console.log("Rejection getLanguage");
            that.checkCountryAndLanguage(mustRender);
        });

    }

    async checkCountryAndLanguage(mustRender)
    {
        if (!this.state.countryCode || !this.state.languageCode)
        {
            this.getLocation(mustRender);
        }
        else
        {
            if (!this.state.updatingTranslations)
            {
                this.state.updatingTranslations = true;
                this.props.actions.translate.setCountry(this.state.countryCode);
                this.props.actions.translate.setLanguage(this.state.languageCode);
                await this.props.actions.translate.getTranslation(this.state.languageCode);
                this.waitUntilLanguageChanged(this.state.countryCode, this.state.languageCode);
            }
            else {
                if (mustRender) this.forceUpdate();
            }
        }

    }

    getLocation(mustRender) {
        var that = this;

        if (!this.state.countries || Object.entries(this.state.countries).length == 0 || this.state.gettingLocation) {
            if (mustRender) this.forceUpdate();
            return;
        };

        this.state.gettingLocation = true;
        this.getCurrentPositionByAPI().then(async (data) => {
            console.log("getCurrentPositionByAPI", data, this.state.countries);
            var countriesTable = Object.values(this.state.countries);
            var defaultLanguage = countriesTable.find((c) => {
                return c.Code == data.country_code;
            }).langName;

            this.props.actions.translate.setCountry(data.country_code);
            this.props.actions.translate.setLanguage(defaultLanguage);
            //console.log("defaultLanguage", defaultLanguage);
            await this.props.actions.translate.getTranslation(defaultLanguage);
            this.waitUntilLanguageChanged(data.country_code, defaultLanguage);

        }, (err) => {
            this.getCookiesPolicyAccepted().then((accepted) => {
                that.props.actions.translate.setCookiesPolicyAccepted(accepted).then(()=>{
                    that.setState({
                        countryCode: "ES",
                        languageCode: "es",
                        gettingLocation: false,
                        checkedCountryAndLanguage: true,
                        updatingTranslations: false,
                        saving: false,
                        goWelcome: false,
                        goRegister: false,
                        goLogin: false,
                        cookiesPolicyAccepted: accepted/*,
                        cookiesPolicyModalVisible: !accepted*/
                    });
                });
            });
            console.log("Error:", err);
        });
    }

    waitUntilLanguageChanged(country, lang) {
        var that = this;

        if (this.props.language == lang) {

            var willGoWelcome = (this.state.countryCode && this.state.languageCode && !this.props.initialized);
            this.props.actions.translate.initialize();

            this.getCookiesPolicyAccepted().then((accepted) => {
                that.props.actions.translate.setCookiesPolicyAccepted(accepted).then(()=>{

                    var goWelcome = willGoWelcome && accepted;
                    var goRegister = false, goLogin = false;
                    if (that.state.petition === 'invitation') {
                        goWelcome = false,
                        goRegister = true;
                        goLogin = false;
                    }
                    else if (that.state.petition === 'login') {
                        goWelcome = false,
                        goRegister = false;
                        goLogin = true;
                    }

                    that.setState({
                        countryCode: country,
                        languageCode: lang,
                        gettingLocation: false,
                        checkedCountryAndLanguage: true,
                        updatingTranslations: false,
                        saving: false,
                        goWelcome: goWelcome,
                        goRegister: goRegister,
                        goLogin: goLogin,
                        cookiesPolicyAccepted: accepted/*,
                        cookiesPolicyModalVisible: !accepted*/
                    });
                });
            });
            return;
        }

        setTimeout(() => {
            this.waitUntilLanguageChanged(country, lang);
        }, 200);
    }

    getCookiesPolicyAccepted() {
        return new Promise((resolve, reject) => {

            console.log("Start getCookiesPolicyAccepted");
            uniqueStorage.getItem('cookiesPolicyAccepted').then(function(data){
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    data = null;
                }

                console.log("End getCookiesPolicyAccepted data", data);
                var accepted = (data && data.value);
                resolve(accepted);

            }, () => {
                resolve(false);
                console.log("Rejection checkCookiesPolicy");
            });
        });
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

    printCountries() {
        var that = this;
        if (!this.props.countries)
            return [];
        var arr = Object.keys(this.props.countries).map(function (key) {
            return {label: that.props.countries[key].Name, value: that.props.countries[key].Code};
        });
        function compare(a, b) {
            if (a.label < b.label)
                return -1;
            if (a.label > b.label)
                return 1;
            return 0;
        }
        return arr.sort(compare);
    }

    getCurrentPositionByAPI() {
        return new Promise((resolve, reject) => {

            var defaultRet = {
                country_code: "ES"
            };

            console.log("Start getCurrentPositionByAPI");

            try {
                /*
                fetch("https://geolocation-db.com/json/0f761a30-fe14-11e9-b59f-e53803842572", {
                    method: "GET"
                }).then((data) => {
                    this.analyzeCurrentPositionData(data).then((data2) => {
                        if (data2.country_code) {
                            console.log("End getCurrentPositionByAPI", data2);
                            resolve(data2);
                        }
                        else {
                            console.log("Error fetching current position 1");
                            resolve(defaultRet);
                        }
                    }, (err) => {
                        console.log("Error fetching current position 2", err);
                        resolve(defaultRet);
                    })
                }, (err) => {
                    */
                    console.log("Error fetching current position 3", err);
                    resolve(defaultRet);
                    /*
                }).catch(err => {
                    console.log("Error fetching current position 4", err);
                    resolve(defaultRet);
                });*/
            } catch (err) {
                console.log("Error fetching current position 5", err);
                resolve(defaultRet);
            }

        });
    }

    analyzeCurrentPositionData(data) {
        return new Promise((resolve, reject) => {
            console.log("Start analyzeCurrentPositionData");
            try {
                data.json().then((data2) => {
                    if (data2.country_code) {
                        console.log("End analyzeCurrentPositionData", data2);
                        resolve(data2);
                    }
                    else {
                        //alert("Error analyzeCurrentPositionData 1")
                        console.log("Error analyzeCurrentPositionData 1");
                        reject(data2);
                    }
                }, (err) => {
                    //alert("Error analyzeCurrentPositionData 2")
                    console.log("Error analyzeCurrentPositionData 2", err);
                    reject(err);
                })
            } catch (err) {
                //alert("Error analyzeCurrentPositionData 3")
                console.log("Error analyzeCurrentPositionData 3", err);
                reject(err);
            }
        });
    }

};


function mapStateToProps(state, props) {
    return {
        country: state.languageReducer.country,
        language: state.languageReducer.language,
        allLanguages: state.languageReducer.languages,
        translation: state.languageReducer.translation,
        languageHasChangeManually: state.languageReducer.languageHasChangeManually,
        initialized: state.languageReducer.initialized,
        cookiesPolicyAccepted: state.languageReducer.cookiesPolicyAccepted,
        loading: state.sessionReducer.loading,
        logedIn: state.sessionReducer.logedIn,
        offline: state.sessionReducer.offline,
        userData: state.sessionReducer.data,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
        petition: state.sessionReducer.petition,
        countries: state.locationReducer.countries,
        reloginData: state.sessionReducer.reloginData,
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginStart)));
