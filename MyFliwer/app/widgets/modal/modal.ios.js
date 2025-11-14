'use strict';

import React, { Component } from 'react';
import {View, Modal, TouchableOpacity, KeyboardAvoidingView} from 'react-native';
import FliwerLoading from '../../components/fliwerLoading'

class Modal2 extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount()
    {
        if (typeof this.props.onShow === "function")
            this.props.onShow();
    }

    render() {
        const {children, animationType, visible, viewStyle, inStyle, onClose,nested} = this.props;
        //Use of multiple modals is bugged in ios, so we're skipping it
        if(nested){
            if(visible){
                return (
                    <TouchableOpacity style={{position:"absolute",width:"100%",height:"100%",zIndex:999999}} onPress={() => {
                        if (onClose)
                            onClose();
                    }}>
                        <KeyboardAvoidingView behavior="padding" style={[{position: "absolute", top: 45, bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}, viewStyle]}>
                            {this.renderBackground()}
                            <View  style={[{backgroundColor: "white"}, inStyle]}>
                                { children }
                                {this.props.loadingModal ? <FliwerLoading /> : null}
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableOpacity>
                );
            }else return [];
        }
        else{
            return (
                <Modal animationType={animationType ? animationType : false} onRequestClose={() => {
                        if (onClose)
                            onClose();
                    }} transparent={true} visible={visible != null ? visible : true}>
                    <KeyboardAvoidingView behavior="padding" style={[{position: "absolute", top: 45, bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}, viewStyle]}>
                        {this.renderBackground()}
                        <View  style={[{backgroundColor: "white"}, inStyle]}>
                            { children }
                            {this.props.loadingModal ? <FliwerLoading /> : null}
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            );
        }

    }

    renderBackground() {
        const {onClose, outStyle} = this.props;
        if (onClose)
            return (<TouchableOpacity style={[{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "black", opacity: 0.6}, outStyle]} onPress={() => {
                                if (!this.props.loadingModal)
                                    onClose();
                            }}></TouchableOpacity>);
        else
            return (<View style={[{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "black", opacity: 0.6}, outStyle]}></View>);
    }

};

export default Modal2;
