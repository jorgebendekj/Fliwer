'use strict';

import React, { Component } from 'react';
import {View, Text, Platform} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import Icon from 'react-native-vector-icons/Entypo';

class FliwerButtonPopup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var {text, disabled, style} = this.props;

        return (
                <View style={[this.style.buttonContainer]}>
                    <View style={[this.style.buttonTouchale, style, this.props.styleInputCustome]}>
                        <View style={[this.style.insideTouch, this.props.styleInputCustome]}>
                            <View style={[this.style.buttonInside, this.props.styleInputCustome, style, disabled ? {backgroundColor: "gray"} : {}]}>
                                <Text style={{}}>{text}</Text>
                            </View>
                            <View style={this.style.iconContainer}>
                                <Icon name="chevron-thin-left" backgroundColor="" style={this.style.icon}></Icon>
                            </View>
                        </View>
                    </View>
                </View>
                )
    }
};


var style = {
    buttonContainer: {
        height: 40,
        width: "100%",
        maxWidth: 300,
        //marginBottom:10
    },
    buttonTouchale: {
        backgroundColor: FliwerColors.primary.black,
        height: "100%",
        width: "100%",
        borderRadius: 45,
        alignItems: 'center',
        flexDirection: 'row'
    },
    buttonInside: {
        backgroundColor: FliwerColors.secondary.white,
        position: "absolute",
        left: 1,
        right: 0,
        borderRadius: 45,
        alignItems: 'center',
        flexDirection: 'row',
        overflow: "hidden",
        width: "86.5%", //width border
        height: "95%", //width border
        paddingLeft: 10,
        justifyContent: "center",

    },
    insideTouch: {
        width: "100%",
        height: "100%",
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 16,
        marginLeft: -18,
        height: 20,
        color: FliwerColors.secondary.black,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center",
        width: "100%"
    },
    iconContainer: {
        position: "absolute",
        right: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    icon: {
        color: FliwerColors.secondary.white,
        fontSize: 20,
        textAlign: "left",
        transform: [{rotate: '180deg'}]
    },
    "@media (orientation:landscape)": {
        buttonContainer: {
            maxWidth: 400
        },
    }
};


//Connect everything
export default mediaConnect(style, FliwerButtonPopup);
