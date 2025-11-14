'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Platform} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/Entypo';

import debounce from 'lodash/debounce';

class FliwerNextBackButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false
        };
    }

    componentWillMount() {

       this.onBackDelayed = debounce(this.handleBackClick.bind(this), 200);
       this.onPressDelayed = debounce(this.handlePressClick.bind(this), 200);
    }

    async handleBackClick(e) {

        this.setState({clicked: true});

        try {
            await this.props.onBack();
        } finally {
            this.setState({clicked: false});
        }

    }

    async handlePressClick(e) {

        this.setState({clicked: true});

        try {
            await this.props.onPress();
        } finally {
            this.setState({clicked: false});
        }

    }

    render() {
        var {containerStyle, backButtonStyle, nextButtonStyle, textStyle, text, disabled, disableRequestButton, disabledBackButton} = this.props;

        var disabledBackBtn = disabledBackButton || this.state.clicked;
        var disabledNextBtn = (disabled ? true : (disableRequestButton ? true : false)) || this.state.clicked;

        return (
                <View style={[this.style.buttonContainer, containerStyle]}>
                    <TouchableOpacity style={[this.style.backButton, backButtonStyle]} onPress={this.onBackDelayed.bind(this)} disabled={disabledBackBtn}>
                            <View style={this.style.iconContainer}>
                                <Icon name="chevron-thin-left" backgroundColor="" style={this.style.icon}></Icon>
                            </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[this.style.nextButton, nextButtonStyle, disabled ? {backgroundColor: "gray"} : (disableRequestButton ? {backgroundColor: "gray"} : {})]} disabled={disabledNextBtn}
                        onPress={this.onPressDelayed.bind(this)}>
                        <Text style={[this.style.buttonText, textStyle]}>{text}</Text>
                    </TouchableOpacity>
                </View>
        );
    }
};

var style = {
    buttonContainer: {
        height: 48,
        width: "100%",
        maxWidth: 340,
        marginBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        flexDirection: 'row'
    },
    backButton: {
        backgroundColor: FliwerColors.primary.black,
        height: "100%",
        width: 36,
        borderRadius: 0,
        borderTopLeftRadius: 45,
        borderBottomLeftRadius: 45,
        justifyContent: "center",
        alignItems: 'center'
    },
    nextButton: {
        backgroundColor: FliwerColors.primary.green,
        height: "100%",
        flex: 1,
        borderRadius: 4,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        justifyContent: "center",
        alignItems: 'center',
        overflow: "hidden"
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: -18,
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center",
        width: "100%"
    },
    iconContainer: {
        position: "absolute",
        left: 12,
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
        }
    }
};

//Connect everything
export default mediaConnect(style, FliwerNextBackButton);
