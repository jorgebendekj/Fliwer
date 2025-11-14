'use strict';

import React, { Component } from 'react';
import {TouchableOpacity} from 'react-native';
//import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'


class FliwerExitButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {onPress} = this.props;
        
        return null;
        /*
        return (
            <TouchableOpacity style={this.style.exitButtonTouch} activeOpacity={1} onMouseEnter={this.hoverIn('exitButtonTouch')} onMouseLeave={this.hoverOut('exitButtonTouch')} onPress={() => {
                    onPress();
                }}>
                <IconMaterialIcons name="exit-to-app" size={30} style={{color: "white"}}/>
            </TouchableOpacity>            
        );*/

    }
    
};

var style = {
    exitButtonTouch: {
        position: "absolute",
        //right: 30,
        right: 18,
        top: 45,
        backgroundColor: FliwerColors.secondary.gray,
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white
    },
    ":hover": {
        exitButtonTouch: {
            backgroundColor: "silver"
        }
    }
};

//Connect everything
export default mediaConnect(style, FliwerExitButton);
