'use strict';
import React, { Component } from 'react';
import { View, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default class MyDatePicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false
        };
    }

    render() {
        const {date, minDate, maxDate, onChange, mode, text, customRenderVisible, setCustomRenderVisible} = this.props;

        return (
            <View style={{width: "100%", height: "100%"}}>
                <TouchableOpacity 
                    style={{width: "100%", height: "100%"}}
                    disabled={this.props.disabled}
                    onPress={() => {
                        this.setState({visible: !this.state.visible});
                    }} >
                </TouchableOpacity>    
              <DateTimePickerModal
                    date={date?date:new Date()}
                    isVisible={this.state.visible || customRenderVisible}
                    mode={mode ? mode : 'date'}
                    onConfirm={(value) => {
                        onChange(value);
                        this.setState({visible: false});
                        if(setCustomRenderVisible) setCustomRenderVisible();
                    }}
                    onCancel={() => {
                        this.setState({visible: false});
                        if(setCustomRenderVisible) setCustomRenderVisible();
                    }}
                    locale="en_GB"
              />
            </View>
        );
    }
}
