'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import SignatureCanvas from 'react-signature-pad-wrapper'

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {toast} from '../../widgets/toast/toast'

class SignaturePad extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {containerStyle, signatureStyle, confirmText, resetText, instructionsText} = this.props;
        
        var _confirmText = confirmText? confirmText : this.props.actions.translate.get('confirm');
        var _resetText = resetText? resetText : "Reset";
        var _instructionsText = instructionsText? instructionsText : "Por favor, completa tu firma utilizando el ratón";
        var _width = signatureStyle && signatureStyle.width? signatureStyle.width : 300;
        var _height = signatureStyle && signatureStyle.height? signatureStyle.height : 200;
        
        return (
            <View style={[this.style.container, {}, containerStyle]}>
                <Text style={[FliwerStyles.littleTextStyle, this.style.instructionsText]}>{_instructionsText}</Text>
                
                <View style={{borderWidth: 1, borderColor: "gray", marginTop: 10}}>
                    <SignatureCanvas 
                        ref={(ref) => { 
                            this.sigCanvas = ref;
                        }} 
                        width={_width} height={_height}
                        options={{minWidth: 1, maxWidth: 1}} 
                    />
                </View>

                <View style={this.style.buttonsWrapper}>
                    <FliwerGreenButton 
                        containerStyle={[this.style.buttonContainerStyle, {marginRight: 5}]} 
                        style={[this.style.buttonContainerStyle, {}]}
                        textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                        onPress={()=>this.saveSign()} 
                        text={_confirmText} 
                    />  
                    
                    <FliwerGreenButton 
                        containerStyle={[this.style.buttonContainerStyle, {marginLeft: 5}]} 
                        style={[this.style.buttonContainerStyle, {backgroundColor: "silver"}]}
                        textStyle={[FliwerStyles.buttonTextStyle, FliwerStyles.littleButtonTextStyle]}
                        onPress={()=>this.resetSign()} 
                        text={_resetText} 
                    /> 

                </View>
            </View>
        );
    }

    saveSign() {
        
        const data = this.sigCanvas.toData();
        if (data.length == 0) {
            toast.error("Por favor, completa tu firma antes de confirmar");
            return;
            
        }
        var img = this.sigCanvas.toDataURL();
        this.props.onConfirm(img);
    }

    resetSign() {
        this.sigCanvas.clear();
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
