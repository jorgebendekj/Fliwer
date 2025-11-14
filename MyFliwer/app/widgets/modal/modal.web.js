'use strict';

import React, { Component } from 'react';
import {View, TouchableOpacity, Animated} from 'react-native';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import FliwerLoading from '../../components/fliwerLoading'

class Modal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: this.props.visible,
            display: false,
            opacity: new Animated.Value(this.props.visible ? 1 : 0)
        };
    }

    componentDidMount()
    {
        if (typeof this.props.onShow === "function")
            this.props.onShow();
    }

    render() {
        const {children, animationType, visible, inStyle} = this.props
        
        if (this.state.visible != visible) {
            this.state.visible = visible;
            if (visible)
                this.state.display = true;
            Animated.timing(this.state.opacity, {
                toValue: visible,
                duration: 200,
                useNativeDriver: true
            }).start(() => {
                if (!visible)
                    this.setState({display: false});
            });
        }

        var viewStyle = {
            opacity: this.state.opacity
        };
        
        if (!visible && !this.state.display)
            viewStyle.display = "none";

        return (
                <Animated.View style={[this.style.container, viewStyle]} visible={visible != null ? visible : undefined}>
                    {this.renderBackground()}
                    <View style={[{backgroundColor: "white"}, FliwerCommonUtils.isSafariBrowser()? {height: 400}: {}, inStyle]}>
                        { children }
                        {this.props.loadingModal ? <FliwerLoading /> : null}
                    </View>
                </Animated.View>
                );
    }

    renderBackground() {
        const {onClose, outStyle} = this.props
        if (onClose)
            return (<TouchableOpacity key={1} style={[this.style.background, outStyle]} onPress={() => {
                                if (!this.props.loadingModal)
                                    onClose();
                            }}></TouchableOpacity>)
        else
            return (<View key={1} style={[this.style.background, outStyle]}></View>)
    }

};

var style = {
    container: {position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 99},
    background: {position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "black", opacity: 0.6}
};

export default mediaConnect(style, Modal);
