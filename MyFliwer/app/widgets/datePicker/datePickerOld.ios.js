'use strict';
import React, { Component } from 'react';
import {DatePickerIOS} from 'react-native';

export default class MyDatePicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        const {style, date, placeholder, format, minDate, maxDate, confirmText, cancelText, customStyles, onChange, mode} = this.props

        return (
                <DatePickerIOS
                    style={[style, {}]}
                    date={date}
                    mode={mode ? mode : 'date'}
                    minimumDate={minDate}
                    maximumDate={maxDate}
                    onDateChange={(value) => {
                        if (typeof onChange === 'function')
                            onChange(value);
                    }}
                    />
                )
    }
}
