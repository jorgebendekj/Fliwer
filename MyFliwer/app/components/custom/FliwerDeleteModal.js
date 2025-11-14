'use strict';

import React, { Component } from 'react';
import {View, Text} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'
import Modal from '../../widgets/modal/modal'
import FliwerTextInput from './FliwerTextInput.js'

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerDeleteModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: null
        }
    }

    render() {
        //
        var {animationType, visible, onClose, title, text, textCancel, textConfirm, onConfirm,onConfirm2, nested, password} = this.props;

        return (
                <Modal animationType={animationType ? animationType : "fade"} nested={nested} loadingModal={this.props.loadingModal} inStyle={this.style.modalIn} visible={visible} onClose={() => {
                        if (typeof onClose === "function")
                            onClose()
                    }}>
                    <View style={this.style.modalView}>
                        <Text style={this.style.modalViewTitle}>{title}</Text>
                        {this.renderRemoveBySupport(text)}
                        {password?null:this.renderSubtitle()}
                        {this.askPassword()}
                        <View style={this.style.modalButtonContainer}>
                            <FliwerCalmButton
                                buttonStyle={[this.style.modalButton, this.style.modalButton1]}
                                onMouseEnter={this.hoverIn('modalButton1')} onMouseLeave={this.hoverOut('modalButton1')}
                                onPress={async () => {
                                    if (typeof onConfirm2 === "function")
                                        await onConfirm2();
                                    else if (typeof onClose === "function")
                                        await onClose();
                                }}
                                text={(textCancel ? textCancel : this.props.actions.translate.get('general_no'))}
                                textStyle={[this.style.modalButtonText, this.style.modalButtonTextNo]}
                                skipView={true}
                            />
                            {
                                password?null:(
                                    <FliwerCalmButton
                                        buttonStyle={[this.style.modalButton, this.style.modalButton2]}
                                        onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')}
                                        onPress={async () => {
                                        if (typeof onConfirm === "function")
                                            await onConfirm(this.state.password);
                                        }}
                                        text={(textConfirm ? textConfirm : this.props.actions.translate.get('general_yes'))}
                                        textStyle={[this.style.modalButtonText, this.style.modalButtonTextYes]}
                                        skipView={true}
                                    />
                                )
                            }
                        </View>
                    </View>
                </Modal>
                )
    }

    renderSubtitle()
    {
        var {text} = this.props;
        if (!this.props.hiddeText)
            return (<Text style={this.style.modalViewSubtitle}>{(this.props.subtitle ? text : this.props.actions.translate.get('general_sure'))}</Text>)

    }

    renderRemoveBySupport(text) {
        var {password} = this.props;

        if (password && typeof this.props.onMailRequestDelete === "function")
            return(
                    <View style={this.style.mailSendRequestContainer}>
                        <Text style={this.style.requestText}>{(text ? text : this.props.actions.translate.get('masterVC_garden_remove_suport'))}</Text>
                        <FliwerGreenButton text={this.props.actions.translate.get('masterVC_request')}
                            containerStyle={this.style.buttonRequest}
                            style={{backgroundColor: "silver"}}
                            onPress={async () => {
                            if (typeof this.props.onMailRequestDelete === "function")
                                await this.props.onMailRequestDelete()
                        }}/>
                    </View>
                    )
    }

    askPassword() {
        var {password, onConfirm, customTitle, customSubtitle, customMessage} = this.props;
        if (0 && password) {
            return (
                    <View style={this.style.modalpasswordContainer}>
                        <Text style={this.style.modalpasswordText}>{this.props.actions.translate.get('fliwerDeleteModal_confirm_password')}</Text>
                        <FliwerTextInput
                            style={this.style.modalpasswordInput}
                            secureTextEntry={true}
                            autoCapitalize = 'none'
                            placeholder={this.props.actions.translate.get('loginVC_pass_placeholder')}
                            onChangeText={(text) => this.setState({password: text})}
                            onSubmitEditing={() => {
                            if (typeof onConfirm === "function")
                                onConfirm(this.state.password)
                        }}
                            />
                    </View>
                    );
        }
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

var style = {
    buttonRequest: {
        height: 31,
        width: 140,
        marginTop: 5,
        //marginLeft:"5%",
    },
    mailSendRequestContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
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
    requestText: {
        width: "90%",
        //marginLeft:"5%",
        //marginBottom:20,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
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
    modalpasswordContainer: {
        display: "flex",
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 20,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap"
    },
    modalpasswordText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        paddingRight: 10
    },
    modalpasswordInput: {
        marginBottom: 0
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
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerDeleteModal));
