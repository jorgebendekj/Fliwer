'use strict';

import React, { Component } from 'react';
import {TouchableOpacity} from 'react-native';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'


class FliwerExitButton2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {onPress, containerStyle, color} = this.props;

        var _color = color?color:"black";

        return (
            <TouchableOpacity style={[this.style.exitButtonTouch, containerStyle]} activeOpacity={1} 
                onPress={() => {
                    onPress();
                }}>
                <IconMaterialIcons name="close" size={30} style={{color: _color}}/>
            </TouchableOpacity>            
        );

    }
    
};

var style = {
    exitButtonTouch: {
        position: "absolute",
        right: 0,
        top: 0,
        backgroundColor: "transparent",
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 45
    }
};

//Connect everything
export default mediaConnect(style, FliwerExitButton2);
