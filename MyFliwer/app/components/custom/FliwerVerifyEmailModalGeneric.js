'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Platform, ScrollView} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import FliwerGreenButton from './FliwerGreenButton.js'
import {loginStyles} from '../login/loginStyles.js';

import Modal from '../../widgets/modal/modal'
import EmailAuth from '../../widgets/emailAuth/emailAuth.js'

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerVerifyEmailModalGeneric extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: this.props.email? this.props.email : '',
            modalEmailAuthInfoVisible: false,
            modalMsg: '',
            colorMsg: null,
            signed: false,
            loading: false,
            fastVerification: false,
            visible: false//only when the props changed is confirmed to be visible
        };

        if(this.props.visible){
            this.props.actions.sessionActions.checkEmailVerificationSession().then((result)=>{
                if(result.verifiedEmail){
                    this.setState({fastVerification:true,visible:true,email:result.verifiedEmail});
                }
            },(err)=>{
                console.log(err);
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(!prevProps.visible && this.props.visible){
            this.props.actions.sessionActions.checkEmailVerificationSession().then((result)=>{
                if(result.verifiedEmail){
                    this.setState({fastVerification:true,visible:true,email:result.verifiedEmail});
                }else this.setState({visible:this.props.visible});
            },(err)=>{
                console.log(err);
            })
        }else if(prevProps.visible!=this.state.visible){
            this.setState({visible:this.props.visible});
        }
    }

    render() {
        var {animationType, visible, onCancel, title, subtitle, emailInfo, cancelText, nested} = this.props;

        return (
                <Modal animationType={animationType ? animationType : "fade"} loadingModal={this.state.loading} inStyle={this.style.modalIn} visible={visible && this.state.visible} nested={nested} onClose={() => {

                    }}>
                    <View style={[this.style.modalView, {maxHeight: 620}]}>
                        <ScrollView scrollEventThrottle={1000} style={[{width: "100%"}, Platform.OS == "web"? {height: "100%"} : {}]} contentContainerStyle={{justifyContent: "space-between"}}>

                            <Text style={this.style.modalViewTitle}>{title?title:this.props.actions.translate.get("Email_verificationCode_title")}</Text>
                            <Text style={this.style.modalViewSubtitle}>{subtitle?subtitle:
                                (this.state.fastVerification?
                                    this.props.actions.translate.get("Email_verificationCode_subtitle_validated")
                                :this.props.actions.translate.get("Email_verificationCode_subtitle"))}</Text>
                            <View style={[this.style.form, Platform.OS !== 'web'? {paddingLeft: 10, paddingRight: 10} : {}]}>

                            <EmailAuth
                                    containerStyle={{marginTop: 10}}
                                    email={this.state.email}
                                    setLoading={(loading) => {
                                        this.props.setLoading(loading)
                                        this.setState({loading: loading});
                                    }}
                                    ref={(ref) => this.emailAuth = ref}
                                    fastVerification={this.state.fastVerification}
                                    onAction={this.props.onAction}
                                    onError={this.props.onError}
                                    onValidate={(uuid,verificationCode) => this.onValidateEmailAuth(uuid,verificationCode)}
                                    firstTitle={this.state.fastVerification?this.props.actions.translate.get("emailAuth_email_confirm"):this.props.actions.translate.get('emailAuth_enter_email')}
                                    secondTitle={/*"Para finalizar, introduce el código que has recibido por correo"*/this.props.actions.translate.get('emailAuth_enter_code')}
                                    successText={/*"El proceso ha finalizado con éxito"*/this.props.actions.translate.get('emailAuth_end')}
                                    confirmTextButton={this.state.fastVerification?this.props.actions.translate.get("confirm"):this.props.actions.translate.get('PhoneAuth_accept_code')}
                                    setInfoModalVisible={(visible, signed, colorMsg, modalMsg) => {
                                        this.setState({modalEmailAuthInfoVisible: visible, signed: signed, colorMsg: colorMsg, modalMsg: modalMsg});
                                    }}
                                />

                            </View>
                        </ScrollView>
                        <View style={this.style.modalButtonContainer}>
                            <TouchableOpacity style={[this.style.modalButton, this.style.modalButton2]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')}
                                onPress={() => {
                                    if(onCancel)onCancel();
                                  }
                                }>
                                <Text style={[this.style.modalButtonText, this.style.modalButtonTextYes]}>{cancelText?cancelText:this.props.actions.translate.get('general_cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                        {this.renderEmailAuthInfoModal()}
                    </View>
                </Modal>
            );
    }

    onValidateEmailAuth(uuid,verificationCode)
    {
        var {onSuccess,onAction} = this.props;
        var that = this;
        return new Promise((resolve, reject) => {

            if (!verificationCode)
            {
                reject(that.props.actions.translate.get('emailAuth_enter_email'));
                return;
            }

            var verificationTime = Math.floor(Date.now() / 1000);

            if(onSuccess)onSuccess({uuid:uuid,verificationCode:verificationCode,verificationTime:verificationTime})
            resolve();
        });

    }


    renderEmailAuthInfoModal() {

        return (
            <Modal animationType={"fade"} loadingModal={false} inStyle={this.style.modalIn} visible={this.state.modalEmailAuthInfoVisible} onClose={() => {

                }}>
                <View style={[this.style.modalView, {width: "100%", alignItems: "center", paddingLeft: 40, paddingRight: 40, paddingBottom: 10}]}>


                    <View style={[{width: "100%", marginTop: 0}, Platform.OS === 'web'? {alignItems: "justify"} : {}]}>
                        <Text style={[loginStyles.littleTextStyle, {textAlign: "center"}, this.state.colorMsg? {color: this.state.colorMsg} : {}]}>{this.state.modalMsg}</Text>
                    </View>

                    <FliwerGreenButton
                        containerStyle={{marginTop: 20, width: 100, height: 30}}
                        style={{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.primary.green}}
                        textStyle={[loginStyles.buttonTextStyle, loginStyles.littleButtonTextStyle]}
                        onPress={()=>{
                            if (this.state.signed){
                                this.setState({modalEmailAuthInfoVisible: false,modalMsg: '',colorMsg: null,signed: false,loading: false})
                                this.props.onFinalize();
                            }
                            else
                                this.setState({modalEmailAuthInfoVisible: false});
                        }}
                        text={this.props.actions.translate.get('accept')}
                    />
                </View>
            </Modal>
        );
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        data: state.sessionReducer.data
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
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 700
    },
    modalView: {
        paddingTop: 20
    },
    modalViewTitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 14,
        color: "gray", //FliwerColors.primary.gray,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: -1
    },
    modalButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)"
    },
    modalButton1: {
        borderBottomLeftRadius: 20
    },
    modalButton2: {
        borderRightWidth: 0,
        borderBottomRightRadius: 20
    },
    modalButtonText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonTextNo: {
        color: "blue"
    },
    modalButtonTextYes: {
        color: "red"
    },
    form: {
        width: "100%",
        alignItems: 'center',
        marginTop: 0,
        marginBottom: 20,
        zIndex: 0,
        paddingLeft: 0,
        paddingRight: 0,
        alignSelf: "center"
    },
    ":hover": {
        modalButton1: {
            backgroundColor: "rgba(175,215,255,0.3)"
        },
        modalButton2: {
            backgroundColor: "rgba(255,175,175,0.3)"
        }
    }
};


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerVerifyEmailModalGeneric));
