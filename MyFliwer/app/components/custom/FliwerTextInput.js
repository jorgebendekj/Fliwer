'use strict';

import React, { Component } from 'react';
import {View, TextInput} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

class FliwerTextInput extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var {keyboardType, multiline, textInputRef, containerStyle, style, placeholder, onChangeText, returnKeyType, autoCapitalize, onSubmitEditing, blurOnSubmit, ref, secureTextEntry, value, textContentType, onFocus, onBlur, maxLength, disabled, textContentType} = this.props;
        
        
        return (
            <View style={[this.style.inputContainer, containerStyle]}>
                    <TextInput
                        keyboardType={keyboardType}
                        style={[this.style.input, style]}
                        key={placeholder}
                        placeholder={placeholder}
                        secureTextEntry={secureTextEntry}
                        onChangeText={onChangeText}
                        returnKeyType = {returnKeyType}
                        numberOfLines={multiline?3:1}
                        autoCapitalize = {autoCapitalize}
                        onSubmitEditing={onSubmitEditing}
                        textContentType={textContentType}
                        underlineColorAndroid={'transparent'}
                        multiline={multiline}
                        placeholderTextColor={FliwerColors.secondary.gray}
                        value={value}
                        textAlign= {'center'}
                        ref={(input) => {
                            if (typeof textInputRef === "function")
                                textInputRef(input)
                        }}
                        blurOnSubmit={blurOnSubmit}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        maxLength={maxLength}
                        disabled={disabled}
                    />
            </View>
        );
    }
};


function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {
    inputContainer: {
        height: 48,
        width: "100%",
        maxWidth: 300,
        marginBottom: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: FliwerColors.primary.green,
        borderRadius: 45
    },
    input: {
        height: "100%",
        width: "100%",
        fontFamily: FliwerColors.fonts.light,
        textAlign: 'center',
        borderColor: FliwerColors.primary.green,
        borderRadius: 45,
        padding: 10,
        fontSize: 14,
        color:"black"
    },
    "@media (orientation:landscape)": {
        inputContainer: {
            maxWidth: 400
        }
    }
};


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerTextInput));
