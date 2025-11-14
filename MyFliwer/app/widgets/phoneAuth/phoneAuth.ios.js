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
            code: null
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

        let theCountry = this.props.country? this.props.country : 'es';

        return (
            <View style={{width: "100%", alignItems: "center"}}>

                <View style={[{width: "100%", marginTop: 0}, Platform.OS === 'web'? {alignItems: "center"} : {}]}>
                    <Text style={[FliwerStyles.littleTextStyle, {textAlign: "center"}]}>{this.props.firstTitle? this.props.firstTitle :
                            //"Primero, introduce tu número de móvil para enviarte un SMS"
                            this.props.actions.translate.get('PhoneAuth_first_enter_phone_number_to_send_yourself_sms')
                    }</Text>
                </View>

                {!this.props.hidePhone?
                <PhoneInput
                    country={theCountry.toUpperCase()}
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
                    onPress={()=> {
                        this.sendSMS();
                    }}
                    text={this.props.actions.translate.get('PhoneAuth_send_sms')}
                />

                <View style={[{width: "100%", marginTop: 20}, Platform.OS === 'web'? {alignItems: "justify"} : {}]}>
                    <Text style={[FliwerStyles.littleTextStyle, {textAlign: "center"}]}>{this.props.secondTitle? this.props.secondTitle :
                            //"Introduce el código que has recibido por SMS"
                            this.props.actions.translate.get('PhoneAuth_enter_code_you_have_received')
                    }</Text>
                </View>

                <FliwerTextInput
                    containerStyle={[FliwerStyles.textFieldContainerStyle, {marginTop: 10, width: 150}]}
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
                    onPress={()=>this.confirmCode()}
                    text={this.props.confirmTextButton? this.props.confirmTextButton :
                            //"Firmar"
                            this.props.actions.translate.get('PhoneAuth_signin')
                    }
                    disabled={this.state.phone.length == 0 || this.state.confirmationResult == null}
                />
            </View>
        );
    }

    sendSMS() {
        var that = this;

        if (!this.state.phone)
        {
            toast.error(this.props.actions.translate.get('PhoneAuth_please_type_your_phone_number'));
            return;
        }

        that.props.setLoadingMobile(true);

//        // Turn off phone auth app verification.
//        firebase.auth().settings.appVerificationDisabledForTesting = true;

        var phoneNumber = '+' + this.state.phone;
        console.log("phoneNumber", phoneNumber);

        firebase.auth().languageCode = this.props.language;

        // TEST
//        firebase
//          .auth()
//          .signInWithPhoneNumber(phoneNumber)
//          .then(confirmResult => {
//                console.log("Sms sent");
//                that.props.setLoadingMobile(false);
//          })
//          .catch(error => {
//                console.log(error)
//                that.props.setLoadingMobile(false);
//          });


        firebase.auth().signInWithPhoneNumber(phoneNumber)
                .then(function (confirmationResult) {
                    console.log("Sms sent");
                    console.log(confirmationResult);

                    that.props.setLoadingMobile(false);

                    that.setState({confirmationResult: confirmationResult, validPhone: that.state.phone}, () => {
                        that.props.setInfoModalVisible(true, false, null,
                            //"El SMS se ha enviado correctamente"
                            that.props.actions.translate.get('PhoneAuth_the_sms_has_been_sent_successfully')
                        );
                    });

                }).catch(function (error) {
                    console.log("Sms not sent!. Err: ", error);
                    that.props.setLoadingMobile(false);
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
        that.props.setLoadingMobile(true);
        this.state.confirmationResult.confirm(that.state.code).then(function (result) {
            console.log("confirmationResult. result: ", result);
            console.log("confirmationResult. verificationId: ", that.state.confirmationResult.verificationId);

            // User signed in successfully.
            that.props.setLoadingMobile(false);

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
            that.props.setLoadingMobile(false);
            that.props.setInfoModalVisible(true, false, "tomato",
                //"Puede que el código de verificación no sea el correcto. Por favor, revise el código del SMS que ha recibido y vuelva a intentarlo. Gracias."
                that.props.actions.translate.get('PhoneAuth_error_confirming_code')
            );
        });
    }

}

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        language: state.languageReducer.language
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
