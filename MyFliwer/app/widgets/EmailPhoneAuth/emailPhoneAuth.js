import React, { Component } from 'react'
import {
    StyleSheet,
    View,
    Text,
    Platform
} from 'react-native'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {FliwerStyles} from '../../utils/FliwerStyles.js'
import {FliwerColors} from '../../utils/FliwerColors.js'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import FliwerTextInput from '../../components/custom/FliwerTextInput.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import {loginStyles} from '../../components/login/loginStyles.js';

import {toast} from '../../widgets/toast/toast'

class EmailPhoneAuth extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: this.props.email? this.props.email : '',
            validEmail: '',
            confirmationResult: null,
            code: null,
            uuid: null,
        };

    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.email!=this.props.email){
            this.setState({email:this.props.email});
        }
    }

    render() {
        const {containerStyle} = this.props;

        return (
            <View style={[this.style.container, containerStyle]}>
                {this.renderEmailAuth()}
            </View>
        );
    }

    renderEmailAuth() {

        var that = this;
        
        return (
            <View style={{width: "100%", alignItems: "center"}}>

                {this.props.fastVerification?null:(
                    <View style={{display:"flex",flexDirection:"row",width:"100%",justifyContent:"space-evenly",flexWrap:"wrap"}}>

                        <View style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                            <View style={[{width: "100%", marginTop: 0}, Platform.OS === 'web'? {alignItems: "center"} : {}]}>
                                <Text style={[FliwerStyles.littleTextStyle, {textAlign: "center"}]}>{//this.props.firstTitle? this.props.firstTitle :
                                        //"Primero, introduce tu número de móvil para enviarte un SMS"
                                        "Send email to "+this.state.email/*this.props.actions.translate.get('emailAuth_enter_email')*/
                                }</Text>
                            </View>
                            <FliwerGreenButton
                                    containerStyle={[{marginTop: 0, width: 200, height: 30}]}
                                    style={{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.complementary.blue}}
                                    textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                                    onPress={()=>this.sendEMail()}
                                    text={this.props.actions.translate.get('emailAuth_send_email')}
                            />
                        </View>
                    </View>
                )}

                {/*}
                  <FliwerTextInput
                      containerStyle={loginStyles.textFieldContainerStyle}
                      style={[loginStyles.textFieldStyle,this.style.textFieldStyle]}
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
                      disabled={this.props.fastVerification}
                  />
                  */}

                {1 || this.props.fastVerification?null:(
                    <FliwerGreenButton
                        containerStyle={[{marginTop: 0, width: 100, height: 30}]}
                        style={{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.complementary.blue}}
                        textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                        onPress={()=>this.sendEMail()}
                        text={this.props.actions.translate.get('emailAuth_send_email')}
                    />
                )}

                {this.props.fastVerification?null:(
                    <View style={[{width: "100%", marginTop: 20}, Platform.OS === 'web'? {alignItems: "justify"} : {}]}>
                        <Text style={[FliwerStyles.littleTextStyle, {textAlign: "center"}]}>{this.props.secondTitle? this.props.secondTitle :
                                this.props.actions.translate.get('emailAuth_enter_code')
                        }</Text>
                    </View>
                )}

                {this.props.fastVerification?null:(
                    <FliwerTextInput
                        containerStyle={[FliwerStyles.textFieldContainerStyle, {marginTop: 10},this.style.codeFieldStyle]}
                        style={[FliwerStyles.textFieldStyle,this.style.codeFieldStyle]}
                        placeholder={"Código"}
                        onChangeText={(text) => {
                        this.setState({code:text});
                        }}
                        value={this.state.code}
                        returnKeyType = {"done"}
                        autoCapitalize = 'none'
                        onSubmitEditing={() => {
                            this.confirmCode();
                        }}
                        blurOnSubmit={false}
                        maxLength={6}
                        keyboardType={"email-address"}
                    />
                )}

                <FliwerGreenButton
                    containerStyle={{marginTop: 0, width: 100, height: 30}}
                    style={[{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.primary.green},this.props.confirmStyleButton?this.props.confirmStyleButton:{}]}
                    textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                    onPress={()=> {
                        if(this.props.fastVerification){
                            this.fastVerification(this.state.email)
                        }else this.confirmCode();
                    }}
                    text={this.props.confirmTextButton? this.props.confirmTextButton :
                            //"Firmar"
                            this.props.actions.translate.get('PhoneAuth_signin')
                    }
                    disabled={
                        //false // for test
                        !this.props.fastVerification && (this.state.email.length == 0 || this.state.confirmationResult == null)
                    }
                />
            </View>
        );
    }

    async fastVerification(email){
        var that = this;
        that.props.setLoading(true);
        this.props.actions.sessionActions.requestEmailVerification(email).then((confirmationResult) => {
            console.log("First step without email sent");
            
            if(this.props.onAction){
                this.props.onAction(confirmationResult.uuid,confirmationResult.code).then(()=>{
                  console.log("confirmationResult for ",confirmationResult.uuid,confirmationResult.code);
                  that.props.setLoading(false);
      
                  that.props.onValidate(confirmationResult.uuid, confirmationResult.code).then(()=>{


                      this.setState({validEmail: '',confirmationResult: null,code: null,uuid: null});
                      that.props.setInfoModalVisible(true, true, null, that.props.successText? that.props.successText :
                              //"El contrato ha sido firmado correctamente. Muchas gracias."
                              that.props.actions.translate.get('PhoneAuth_contract_has_been_signed_successfully')
                      );


                  }, (err) => {
                      that.props.setInfoModalVisible(true, false, "tomato", "Error: " + err);
                  });
                },(err)=>{
                  console.log("confirmationResult. Err: ", err);
                  that.props.setLoading(false);
                  if(err.id==191){
                    that.props.setInfoModalVisible(true, false, "tomato",
                        //"Puede que el código de verificación no sea el correcto. Por favor, revise el código del correo que ha recibido y vuelva a intentarlo. Gracias."
                        that.props.actions.translate.get('emailAuth_error_confirming_code')
                    );
                  }else if(this.props.onError)this.props.onError(err);
                })
              }


        }).catch(function (error) {
            console.log("Email not sent!. Err: ", error);
            that.props.setLoading(false);
            that.props.setInfoModalVisible(true, false, "tomato",
                //"Ha ocurrido un error al enviar el correo. Por favor, revise la dirección de correo y vuelva a intentarlo más tarde. Gracias."
                that.props.actions.translate.get('emailAuth_error')
            );
        });;
    }

    async sendEMail() {
        var that = this;

        if (!this.state.email)
        {
            toast.error(this.props.actions.translate.get('emailAuth_please_type_your_email'));
            return;
        }

        that.props.setLoading(true);


        var email = this.state.email;
        console.log("email", email);

        this.props.actions.sessionActions.requestEmailVerification(email).then((confirmationResult) => {

            console.log("Email sent");

            that.props.setLoading(false);

            that.props.setInfoModalVisible(true, false, null,
                that.props.actions.translate.get('emailAuth_sent_ok')
            );

            that.setState({confirmationResult: confirmationResult, validEmail: that.state.email});
        }).catch(function (error) {

            console.log("Email not sent!. Err: ", error);
            that.props.setLoading(false);
            that.props.setInfoModalVisible(true, false, "tomato",
                //"Ha ocurrido un error al enviar el correo. Por favor, revise la dirección de correo y vuelva a intentarlo más tarde. Gracias."
                that.props.actions.translate.get('emailAuth_error')
            );
        });;

    }


    confirmCode(force=false) {
        var that = this;

        if (!this.state.code && !force)
        {
            toast.error(
                    this.props.actions.translate.get('emailAuth_verificationCode')
            );
            return;
        }

        if(!this.state.code)this.state.code="";

        console.log("confirmCode", this.state.code);

        if(this.props.onAction){
          that.props.setLoading(true);
          this.props.onAction(this.state.confirmationResult.uuid,this.state.code).then(()=>{
            console.log("confirmationResult for ",this.state.confirmationResult.uuid,this.state.code);
            that.props.setLoading(false);

            that.props.onValidate(this.state.confirmationResult.uuid, that.state.code).then(()=>{
                this.setState({validEmail: '',confirmationResult: null,code: null,uuid: null})
                that.props.setInfoModalVisible(true, true, null, that.props.successText? that.props.successText :
                        //"El contrato ha sido firmado correctamente. Muchas gracias."
                        that.props.actions.translate.get('PhoneAuth_contract_has_been_signed_successfully')
                );
            }, (err) => {
                that.props.setInfoModalVisible(true, false, "tomato", "Error: " + err);
            });
          },(err)=>{
            console.log("confirmationResult. Err: ", err);
            that.props.setLoading(false);
            if(err.id==191){
              that.props.setInfoModalVisible(true, false, "tomato",
                  //"Puede que el código de verificación no sea el correcto. Por favor, revise el código del correo que ha recibido y vuelva a intentarlo. Gracias."
                  that.props.actions.translate.get('emailAuth_error_confirming_code')
              );
            }else if(this.props.onError)this.props.onError(err);
          })
        }

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
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {
    container: {
        alignItems: "center"
    },
    textFieldStyle:{

    },
    codeFieldStyle:{
        width: 100
    },
    "@media (orientation:portrait)":{
        textFieldStyle:{
            minWidth: "100%"
        }
    }
};


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps,null,{ forwardRef: true })(mediaConnect(style, EmailPhoneAuth));
