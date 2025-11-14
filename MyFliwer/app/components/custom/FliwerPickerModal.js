'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'
import Modal from '../../widgets/modal/modal'
import FliwerTextInput from './FliwerTextInput.js'
import IconFeather from 'react-native-vector-icons/Feather';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerPickerModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: null
        }
    }

    render() {
        //
        var {animationType, visible, onClose, title, text, textCancel, textConfirm, onCamera, onGallery, nested} = this.props;

        return (
                <Modal animationType={animationType ? animationType : "fade"} nested={nested} loadingModal={false} inStyle={this.style.modalIn} visible={visible} onClose={() => {
                        if (typeof onClose === "function")
                            onClose()
                    }}>
                    <View style={this.style.modalView}>
                        <Text style={this.style.modalViewTitle}>{this.props.actions.translate.get("general_choose")}</Text>

                        <View style={this.style.modalButtonContainer} >
                            <TouchableOpacity style={this.style.modalButton} onPress={()=>{
                              if (typeof onCamera === "function") onCamera();
                            }} >
                                <IconFeather name="camera" style={[this.style.icon]} />
                                <Text style={this.style.modalViewText}>{this.props.actions.translate.get("photo_selector_camera")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={this.style.modalButton} onPress={()=>{
                              if (typeof onGallery === "function") onGallery();
                            }} >
                                <IconFeather name="image" style={[this.style.icon]} />
                                <Text style={this.style.modalViewText}>{this.props.actions.translate.get("photo_selector_gallery")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                )
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
        maxWidth: 350
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
    modalViewText: {
      fontFamily: 'AvenirNext-Regular',
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
        marginBottom: 30,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-around",
      marginBottom: 20
    },
    modalButton: {
      alignItems: "center",
      justifyContent: "center",
      width: "40%"
    },
    icon:{
      fontSize: 50,
      alignSelf: "center"
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
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerPickerModal));
