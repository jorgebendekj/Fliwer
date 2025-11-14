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
        const {date, minDate, maxDate, onChange, mode, text} = this.props;

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
                    isVisible={this.state.visible}
                    mode={mode ? mode : 'date'}
                    onConfirm={(value) => {
                        onChange(value);
                        this.setState({visible: false});
                    }}
                    onCancel={() => {
                        this.setState({visible: false});
                    }}
                    locale="en_GB"
              />
            </View>
        );
    }
}
