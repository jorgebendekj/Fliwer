'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Platform} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/Entypo';

import debounce from 'lodash/debounce';

class FliwerBackButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false
        };
    }

    componentWillMount() {

       this.onPressDelayed = debounce(this.handleClick.bind(this), 200);
    }

    async handleClick(e) {

        this.setState({clicked: true});

        try {
            await this.props.onPress();
        } finally {
            this.setState({clicked: false});
        }

    }

    render() {
        //
        var {containerStyle, style, textStyle, text, disabled} = this.props;

        disabled = disabled || this.state.clicked;

        return (
            <View style={[this.style.buttonContainer,containerStyle]}>
                <TouchableOpacity style={[this.style.buttonTouchale,style]}
                    onPress={disabled ? () => {console.log("disabled")} : this.onPressDelayed.bind(this)}
                    >
                    <View style={this.style.insideTouch}>
                        <View style={this.style.iconContainer}>
                            <Icon name="chevron-thin-left" backgroundColor="" style={this.style.icon}></Icon>
                        </View>
                        <Text style={[this.style.buttonText,textStyle]}>{text}</Text>
                    </View>
                </TouchableOpacity>
            </View>
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
        backgroundColor: FliwerColors.primary.black,
        height: "100%",
        width: "100%",
        borderRadius: 45,
        alignItems: 'center',
        flexDirection: 'row'
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
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center",
        width: "100%"
    },
    iconContainer: {
        position: "absolute",
        left: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    icon: {
        color: FliwerColors.secondary.white,
        fontSize: 20,
        textAlign: "left"
    },
    "@media (orientation:landscape)": {
        buttonContainer: {
            maxWidth: 400
        },
    }
};

if (Platform.OS === 'web') {
    style.icon.height = "100%";
    style.buttonText.height = 13;
}

//Connect everything
export default mediaConnect(style, FliwerBackButton);
