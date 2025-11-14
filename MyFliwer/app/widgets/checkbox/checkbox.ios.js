'use strict';

import React, { Component } from 'react';
import Checkbox from '@react-native-community/checkbox';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

class MyCheckbox extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            
        };
    }

    render() {
        const {value, style, onValueChange} = this.props;
        
        return (
            <Checkbox
                value={value? true : false}
                style={[this.style.ckeckboxStyle, style]}
                onTintColor={FliwerColors.primary.green}
                onCheckColor={FliwerColors.primary.green}
                onValueChange = {onValueChange}
                />
        );
    }

};

var style = {
    ckeckboxStyle:{

    }
};

export default mediaConnect(style, MyCheckbox);
