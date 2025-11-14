'use strict';

import React, { Component } from 'react';
var {View} = require('react-native');
import { WebView } from 'react-native-webview';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {toast} from '../../widgets/toast/toast'

class MyWebView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {style,height, width, source,url,pdf} = this.props;

        if(pdf) {
            return (
                <View style={{flex:1}}>
                    <WebView 
                        style={[style,{height: height, width: width/* We must specify any width and height (dani)*/}]} 
                        source={{
                            html: `
                        <html>
                        <object data="data:application/pdf;base64,${pdf}$" type="application/pdf">
                            <embed 
                                scrollbar="1" 
                                src="data:application/pdf;base64,${pdf}" 
                                type="application/pdf" 
                               
                            />
                        </object>
                        </html>
                        ` }}
                        renderError={() => toast.error("Error rendering webview")}
                    />                            
                </View>
            )
        }else{
            return (
                <View style={{flex:1}}>
                    <WebView 
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