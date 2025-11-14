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
import PhoneAuth from '../../widgets/phoneAuth/phoneAuth'

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerVerifyPhoneModal extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            phone: this.props.phone? this.props.phone : '',
            modalPhoneAuthInfoVisible: false,
            modalMsg: '',
            colorMsg: null,
            signed: false,
            loading: false
        };
    }

    render() {
        var {animationType, visible, onCancel, country} = this.props;

        return (
                <Modal animationType={animationType ? animationType : "fade"} loadingModal={this.state.loading} inStyle={this.style.modalIn} visible={visible} onClose={() => {
                    
                    }}>
                    <View style={[this.style.modalView, {maxHeight: 620}]}>
                        <ScrollView scrollEventThrottle={1000} style={[{width: "100%"}, Platform.OS == "web"? {height: "100%"} : {}]} contentContainerStyle={{justifyContent: "space-between"}}>

                            <Text style={this.style.modalViewTitle}>{this.props.actions.translate.get('PhoneAuth_verify_your_phone_number')}</Text>
                            <Text style={this.style.modalViewSubtitle}>{this.props.actions.translate.get('PhoneAuth_tell_us_your_phone_we_can_help_you')}</Text>
                            <View style={[this.style.form, Platform.OS !== 'web'? {paddingLeft: 10, paddingRight: 10} : {}]}>

                                <PhoneAuth 
                                    country={country}
                                    containerStyle={{marginTop: 10}} 
                                    phone={this.state.phone}
                                    setLoading={(loading) => this.props.setLoading(loading)} 
                                    setLoadingMobile={(loading) => this.setState({loading: loading})} 
                                    onValidate={(verifiedPhone, verifiedCode, verificationId) => this.onValidatePhoneAuth(verifiedPhone, verifiedCode, verificationId)}
                                    onChangePhone={(phone) => this.onChangePhoneAuth(phone)}
                                    firstTitle={this.props.actions.translate.get('PhoneAuth_first_send_yourself_sms')} 
                                    secondTitle={this.props.actions.translate.get('PhoneAuth_finally_enter_code')} 
                                    hidePhone={false} 
                                    confirmTextButton={this.props.actions.translate.get('PhoneAuth_accept_code')}
                                    successText={this.props.actions.translate.get('PhoneAuth_you_phone_number_has_been_verified')}
                                    setInfoModalVisible={(visible, signed, colorMsg, modalMsg) => {
                                        this.setState({modalPhoneAuthInfoVisible: visible, signed: signed, colorMsg: colorMsg, modalMsg: modalMsg});
                                    }} 
                                />

                            </View>
                        </ScrollView>
                        <View style={this.style.modalButtonContainer}>
                            <TouchableOpacity style={[this.style.modalButton, this.style.modalButton2]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')}
                                onPress={() => {
                                    onCancel();
                                  }
                                }>
                                <Text style={[this.style.modalButtonText, this.style.modalButtonTextYes]}>{this.props.actions.translate.get('PhoneAuth_i_wanna_do_later')}</Text>
                            </TouchableOpacity>
                        </View>
                        {this.renderPhoneAuthInfoModal()}
                    </View>
                </Modal>
            );
    }

    onValidatePhoneAuth(verifiedPhone, verifiedCode, verificationId)
    {   
        var that = this;
        return new Promise((resolve, reject) => {
            
            if (!verifiedPhone)
            {
                reject(that.props.actions.translate.get('PhoneAuth_please_type_your_phone_number'));
                return;
            }

            var lastPhoneVerification = Math.floor(Date.now() / 1000);

            that.props.setLoading(true);
            that.props.actions.sessionActions.updateProfileWithoutNotifications({
                email: that.props.data.email,
                first_name: that.props.data.first_name,
                last_name: that.props.data.last_name,
                phone: verifiedPhone,
                lastPhoneVerification: lastPhoneVerification,
                pushNotificationLevel: that.props.data.pushNotificationLevel
            }).then(() => {
                that.props.data.phone = verifiedPhone;
                that.props.setLoading(false);
                resolve();
            }, (err) => {
                that.props.setLoading(false);
                reject(err.reason? err.reason : err);
            });
        });   
    
    }

    onChangePhoneAuth(phone)
    {
        //this.state.phone = phone;
    }  
    
    renderPhoneAuthInfoModal() {
              
        return (
            <Modal animationType={"fade"} loadingModal={false} inStyle={this.style.modalIn} visible={this.state.modalPhoneAuthInfoVisible} onClose={() => {
                    
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
                            if (this.state.signed)
                                this.props.onFinalize();
                            else
                                this.setState({modalPhoneAuthInfoVisible: false});
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
        paddingLeft: 40,
        paddingRight: 40,
        maxWidth: 500,
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
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerVerifyPhoneModal));
