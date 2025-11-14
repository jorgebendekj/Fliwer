'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import SignatureCapture from 'react-native-signature-capture';

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

class SignaturePad extends Component {

    constructor(props) {
        super(props);
        this.state = {
            signed: false
        };
    }

    render() {
        var {containerStyle, signatureStyle, confirmText, resetText, instructionsText} = this.props;
        
        var _confirmText = confirmText? confirmText : this.props.actions.translate.get('confirm');
        var _resetText = resetText? resetText : "Reset";
        var _instructionsText = instructionsText? instructionsText : "Por favor, completa tu firma con el dedo o con un lápiz táctil";
        
        return (
            <View style={[this.style.container, {}, containerStyle]}>
                <Text style={[FliwerStyles.littleTextStyle, this.style.instructionsText]}>{_instructionsText}</Text>
                
                <View style={{borderWidth: 1, borderColor: "gray", marginTop: 10}}>
                    <SignatureCapture
                        style={[this.style.signature, signatureStyle]}
                        ref="sign"
                        onSaveEvent={this._onSaveEvent}
                        onDragEvent={this._onDragEvent}
                        saveImageFileInExtStorage={false}
                        showNativeButtons={false}
                        showTitleLabel={false}
                        backgroundColor="#ffffff"
                        strokeColor="#000000"
                        minStrokeWidth={4}
                        maxStrokeWidth={4}
                        viewMode={"portrait"}/>
                </View>

                <View style={this.style.buttonsWrapper}>
                    <FliwerGreenButton 
                        containerStyle={[this.style.buttonContainerStyle, {marginRight: 5}]} 
                        style={[this.style.buttonContainerStyle, {}]}
                        textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                        onPress={()=>this.saveSign()} 
                        text={_confirmText} 
                        disabled={!this.state.signed}
                    />  
                    
                    <FliwerGreenButton 
                        containerStyle={[this.style.buttonContainerStyle, {marginLeft: 5}]} 
                        style={[this.style.buttonContainerStyle, {backgroundColor: "silver"}]}
                        textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                        onPress={()=>this.resetSign()} 
                        text={_resetText} 
                        disabled={!this.state.signed}
                    /> 

                </View>
            </View>
        );
    }

    saveSign() {
        this.refs["sign"].saveImage();
    }

    resetSign() {
        this.refs["sign"].resetImage();
        this.setState({signed: false});
    }
    
    _onSaveEvent = (result) => {
        //result.encoded - for the base64 encoded png
        //result.pathName - for the file path name
        //console.log(result);
        this.props.onConfirm("data:image/png;base64," + result.encoded);
    } 
    
    _onDragEvent = () => {
         // This callback will be called when the user enters signature
        //console.log("dragged");
        if (!this.state.signed)
            this.setState({signed: true});
    } 

};

function mapStateToProps(state, props) {
    return {
        
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
    }
}

var style = {
    container: {
        width: "100%"
    },
    instructionsText: {
        textAlign: "center",
        marginTop: 10  
    },
    signature: {
        height: "100%", width: "100%",
    },
    buttonsWrapper: {
        marginTop: 20, marginBottom: 0, 
        flexDirection: "row", 
        alignSelf: "center",
        alignItems: "center"
    },
    buttonContainerStyle: {
        marginTop: 0, width: 100, height: 30
    },
    buttonStyle: {
        borderRadius: 4, height: 30        
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, SignaturePad));
