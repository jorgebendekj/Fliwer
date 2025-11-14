'use strict';

import React, { Component } from 'react';
import {View, Text, Platform} from 'react-native';

import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

        
class FliwerGreenButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var {containerStyle, style, textStyle, text, onPress, disabled, hide, disabledStyle} = this.props;

        if (hide)
            return null;
        
        return (
            <FliwerCalmButton 
                containerStyle={[this.style.buttonContainer, containerStyle]} 
                disabled={disabled} 
                buttonStyle={[this.style.buttonTouchale, style, disabled ? {backgroundColor: "silver", opacity: 0.7} : {}, disabled? disabledStyle : {}]} 
                onMouseEnter={this.hoverIn('buttonTouchale')} onMouseLeave={this.hoverOut('buttonTouchale')} 
                onPress={async ()=> {await onPress()}} 
                text={text} 
                textStyle={[this.style.buttonText, textStyle]}
            />
        );
    }
};

var style = {
    buttonContainer: {
        height: 48,
        width: "100%",
        maxWidth: 300,
        marginBottom: 10
    },
    buttonTouchale: {
        backgroundColor: "@theme acceptColor"/*FliwerColors.primary.green*/,
        height: "100%",
        width: "100%",
        borderRadius: 4,
        alignItems: 'center',
        flexDirection: 'row'
    },
    buttonText: {
        flex: 1,
        fontSize: 16,
        color: "@theme acceptText"/*FliwerColors.secondary.white*/,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center",
        textAlignVertical: "center"
    },
    "@media (orientation:landscape)": {
        buttonContainer: {
            maxWidth: 400
        }
    },
    ":hover": {
        buttonTouchale: {
            filter: "brightness(107%)"
        }
    }
};

if (Platform.OS == 'web')
    style.buttonText.height = 13;
if (Platform.OS == 'ios')
    style.buttonTouchale.paddingTop = 5;



//Connect everything
export default mediaConnect(style, FliwerGreenButton);
