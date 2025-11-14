'use strict';

import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class VideoRecorder extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        return null;
    }

};

var style = {
    container: {
        
    }
};

//Connect everything
export default mediaConnect(style, VideoRecorder);
