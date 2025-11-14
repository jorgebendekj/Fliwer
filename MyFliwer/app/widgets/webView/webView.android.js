'use strict';

import React, { Component } from 'react';
var {View} = require('react-native');
import { WebView } from 'react-native-webview';
import Pdf from 'react-native-pdf';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {toast} from '../../widgets/toast/toast'

class MyWebView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {style, height,width, source, url,pdf} = this.props;
        
        if(pdf) {
            return (
                <View style={{flex:1}}>
                    <Pdf
                        style={[style,{height: height, width: width/* We must specify any width and height (dani)*/}]} 
                        source={{uri: 'data:application/pdf;base64,'+pdf}}
                    />                            
                </View>
            )
        }else{
            return (
                <View style={{flex:1}}>
                    <WebView 
                        nestedScrollEnabled={true}
                        scrollEnabled = {true}
                        style={[style,{height: height, width: width/* We must specify any width and height (dani)*/}]} 
                        source={url?{uri:url}:source} 
                        renderError={() => toast.error("Error rendering webview")}
                    />                            
                </View>
            );
        }

    }

};

var style = {

};

export default mediaConnect(style, MyWebView);