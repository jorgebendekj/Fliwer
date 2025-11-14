'use strict';

import React, { Component } from 'react';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class MyWebView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {style,height, width, source, url,pdf} = this.props;

        if(pdf) {
            return (
                <embed src={`data:application/pdf;base64,${pdf}`}  height={height} width={width} frameBorder="0" />
            )
        }if(url || (source && source.url)){
            return (
                    <iframe src={url?url:source.url} height={height} width={width} frameBorder="0" />
            );
        }else{
            return(
                <div  style={style} dangerouslySetInnerHTML={{__html: source.html}} />
            )
        }

    }

};

var style = {

};

export default mediaConnect(style, MyWebView);