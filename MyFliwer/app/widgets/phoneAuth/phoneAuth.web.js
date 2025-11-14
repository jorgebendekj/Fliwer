import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    Text,
    Platform
} from 'react-native'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {FliwerStyles} from '../../utils/FliwerStyles'
import firebase from '../../utils/firebase/firebase';
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import FliwerTextInput from '../../components/custom/FliwerTextInput.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import {toast} from '../../widgets/toast/toast'
import PhoneInput from '../../widgets/phoneInput/phoneInput';

class PhoneAuth extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phone: this.props.phone? this.props.phone : '',
            validPhone: '',
            appVerifier: null,
            confirmationResult: null,
            code: null,
            recaptchaId: Date.now().toString(),
            recaptchaVisible: true
        };

    }

    render() {
        const {containerStyle} = this.props;

        return (
            <View style={[this.style.container, containerStyle]}>
                {this.renderPhoneAuth()}
            </View>
        );
    }

    renderPhoneAuth() {

        var that = this;
        var recaptchaIdDiv = this.getRecaptchaId(this.state.recaptchaId);
        //console.log("render recaptchaIdDiv", recaptchaIdDiv);
        let theCountry = this.props.country? this.props.country : 'es';

        return (
            <View style={{width: "100%", alignItems: "center"}}>
                {this.state.recaptchaVisible?<div id={recaptchaIdDiv}></div>:null}

                <View style={[{width: "100%", marginTop: 0}, Platform.OS === 'web'? {alignItems: "center"} : {}]}>
                    <Text style={[FliwerStyles.littleTextStyle, {textAlign: "center"}]}>{this.props.firstTitle? this.props.firstTitle :
                            //"Primero, introduce tu número de móvil para enviarte un SMS"
                            this.props.actions.translate.get('PhoneAuth_first_enter_phone_number_to_send_yourself_sms')
                    }</Text>
                </View>

                {!this.props.hidePhone?
                <PhoneInput
                    country={theCountry.toLowerCase()}
                    value={this.state.phone}
                    onChange={(text) => {
                        this.setState({phone: text});
                        this.props.onChangePhone(text);
                    }}
                />:null}

                <FliwerGreenButton
                    containerStyle={[{marginTop: 0, width: 100, height: 30}, this.props.hidePhone? {marginTop: 20} : {}]}
                    style={{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.complementary.blue}}
                    textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                    onPress={()=>this.sendSMS()}
                    text={this.props.actions.translate.get('PhoneAuth_send_sms')}
                />

                <View style={[{width: "100%", marginTop: 20}, Platform.OS === 'web'? {alignItems: "justify"} : {}]}>
                    <Text style={[FliwerStyles.littleTextStyle, {textAlign: "center"}]}>{this.props.secondTitle? this.props.secondTitle :
                            //"Introduce el código que has recibido por SMS"
                            this.props.actions.translate.get('PhoneAuth_enter_code_you_have_received')
                    }</Text>
                </View>

                <FliwerTextInput
                    containerStyle={[FliwerStyles.textFieldContainerStyle, {marginTop: 10}]}
                    style={[FliwerStyles.textFieldStyle]}
                    autoCapitalize = 'none'
                    returnKeyType = {"done"}
                    placeholder={"Código"}
                    onChangeText={(text) => {
                        this.setState({code: text});
                    }}
                    onSubmitEditing={() => {
                        this.confirmCode();
                    }}
                    keyboardType={"phone-pad"}
                    value={this.state.code}
                    />

                <FliwerGreenButton
                    containerStyle={{marginTop: 0, width: 100, height: 30}}
                    style={[{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.primary.green},this.props.confirmStyleButton?this.props.confirmStyleButton:{}]}
                    textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                    onPress={()=> {
                        this.confirmCode();

                        /*
                         * TEST
                        that.props.onValidate("34639000000", "123456", "maria de la oh").then(()=>{
                            that.props.setInfoModalVisible(true, true, null, that.props.successText? that.props.successText :
                                    //"El contrato ha sido firmado correctamente. Muchas gracias."
                                    that.props.actions.translate.get('PhoneAuth_contract_has_been_signed_successfully')
                            );
                        }, (err) => {
                            that.props.setInfoModalVisible(true, false, "tomato", "Error: " + err);
                        });
                         */
                    }}
                    text={this.props.confirmTextButton? this.props.confirmTextButton :
                            //"Firmar"
                            this.props.actions.translate.get('PhoneAuth_signin')
                    }
                    disabled={
                        //false // for test
                        this.state.phone.length == 0 || this.state.confirmationResult == null
                    }
                />
            </View>
        );
    }

    async sendSMS() {
        var that = this;

//        var verificationId = "ALiwoWI7htAvdRrAALDs7MZ8ZwEkh-jmWALTIAi_Q8wsWoVDDJ_-uNY9oNFepVO-Bpu9QzZ4ouUvSreNcex7kya_yqYp3PkyKCVZU_5545lke_7qQRDj_YzJzWqdQt74-5nQiwqD5HT1b8lDU_EZZn4xFlXwvCrqEuY1VSYXTV0ZssHROtstZIXTazbNH5gXj2uMn-i1mwlzNLV5orI-nY7FUwkAY9KVTg";
//        var verificationCode = "179038";
//        var credential = firebase.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
//        console.log("credential", credential);
//        var authResult = await firebase.auth().signInWithCredential(credential);
//        console.log("authResult", authResult);
//        return;

        if (!this.state.phone)
        {
            toast.error(this.props.actions.translate.get('PhoneAuth_please_type_your_phone_number'));
            return;
        }

        that.props.setLoading(true);

        // Turn off phone auth app verification.
//        firebase.auth().settings.appVerificationDisabledForTesting = true;

        var recaptchaIdDiv = that.getRecaptchaId(that.state.recaptchaId);
        //console.log("sendSMS recaptchaIdDiv", recaptchaIdDiv);

        var phoneNumber = '+' + this.state.phone;
        console.log("phoneNumber", phoneNumber);

        firebase.auth.languageCode = 'es';
        window.recaptchaVerifier = new firebase.RecaptchaVerifier(firebase.auth,recaptchaIdDiv, {
            'size': 'invisible',
            'callback': function (response) {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                console.log("window.recaptchaVerifier callback", response);
            }
        },firebase.auth);

//        window.recaptchaVerifier.render().then(function(widgetId) {
//            console.log("window.recaptchaVerifier render", widgetId);
////            window.recaptchaVerifier.clear();
////            grecaptcha.reset(widgetId);
//            window.recaptchaWidgetId = widgetId;
//        });

        firebase.signInWithPhoneNumber(firebase.auth,phoneNumber, window.recaptchaVerifier)
                .then(function (confirmationResult) {

                    console.log("Sms sent");
                    console.log(confirmationResult);

                    that.props.setLoading(false);

                    that.props.setInfoModalVisible(true, false, null,
                        //"El SMS se ha enviado correctamente"
                        that.props.actions.translate.get('PhoneAuth_the_sms_has_been_sent_successfully')
                    );

                    that.setState({confirmationResult: confirmationResult, validPhone: that.state.phone, recaptchaVisible: false}, () => {
                        setTimeout(() => {
                            that.setState({recaptchaVisible: true});
                        }, 500);
                    });

                }).catch(function (error) {

                    console.log("Sms not sent!. Err: ", error);
                    that.props.setLoading(false);
                    that.props.setInfoModalVisible(true, false, "tomato",
                        //"Ha ocurrido un error al enviar el SMS. Por favor, revise el número de télefono y vuelva a intentarlo más tarde. Gracias."
                        that.props.actions.translate.get('PhoneAuth_error_sending_sms')
                    );
                });
    }

    confirmCode() {
        var that = this;

        if (!this.state.code)
        {
            toast.error(
                    //"Por favor, introduce el código de verificación que has recibido por SMS"
                    this.props.actions.translate.get('PhoneAuth_please_enter_verification_code')
            );
            return;
        }

        console.log("confirmCode", this.state.code);
        that.props.setLoading(true);
        this.state.confirmationResult.confirm(that.state.code).then(function (result) {
            console.log("confirmationResult. result: ", result);
            console.log("confirmationResult. verificationId: ", that.state.confirmationResult.verificationId);

            // User signed in successfully.
            that.props.setLoading(false);

            that.props.onValidate(that.state.validPhone, that.state.code, that.state.confirmationResult.verificationId).then(()=>{
                that.props.setInfoModalVisible(true, true, null, that.props.successText? that.props.successText :
                        //"El contrato ha sido firmado correctamente. Muchas gracias."
                        that.props.actions.translate.get('PhoneAuth_contract_has_been_signed_successfully')
                );
            }, (err) => {
                that.props.setInfoModalVisible(true, false, "tomato", "Error: " + err);
            });

        }).catch(function (error) {
            console.log("confirmationResult. Err: ", error);
            // User couldn't sign in (bad verification code?)
            that.props.setLoading(false);
            that.props.setInfoModalVisible(true, false, "tomato",
                //"Puede que el código de verificación no sea el correcto. Por favor, revise el código del SMS que ha recibido y vuelva a intentarlo. Gracias."
                that.props.actions.translate.get('PhoneAuth_error_confirming_code')
            );
        });
    }

    getRecaptchaId(recaptchaId) {
//        return 'recaptcha-container';
        return "recaptcha-container" + "-" + recaptchaId;
    }
}

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
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

var style = {
    container: {
        alignItems: "center"
    }
};


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, PhoneAuth));
