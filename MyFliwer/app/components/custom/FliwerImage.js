'use strict';

import React, { Component } from 'react';
import {View, Image, TouchableOpacity} from 'react-native';

import IconFeather from 'react-native-vector-icons/Feather';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import ZoomImage from '../../widgets/zoomImage/zoomImage.js'

var loadingapp = require('../../assets/img/loadingapp.gif');
var loadingrainolve = require('../../assets/img/loadingapprainolve.gif');
var automaticIcon = require('../../assets/img/5_riego_auto.png');


class FliwerImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            started: false,
            loading: true,
            loaded: false,
            zoomImageVisible: false
        };

    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log("shouldComponentUpdate nextProps", nextProps);
        return true;
    }

    render() {
        var {containerStyle, style, draggable, resizeMode, source} = this.props;

        //console.log("source", source);

        var key = source.uri? source.uri : source;

        return (
            <View style={containerStyle} key={"v_"+key}>
                <Image
                    key={"img_"+key}
                    style={style}
                    draggable={draggable}
                    resizeMode={resizeMode}
                    source={source}
                    onLoadStart={e => {
                        //console.log("onLoadStart");
                        //console.log("this.state.started", this.state.started);
                        if (!this.state.started) {
                            this.setState({started: true, loading: true, loaded: false});
                            if(this.props.setLoading && typeof(this.props.setLoading)==='function')this.props.setLoading(true);
                        }
                    }}
                    onLoad={e => {
                        //console.log("onLoad");
                        //console.log("this.state.loaded", this.state.loaded);
                        if (!this.state.loaded) {
                            this.setState({loading: false, loaded: true});
                            if(this.props.setLoading && typeof(this.props.setLoading)==='function')this.props.setLoading(false);
                        }
                    }}
                    onLoadEnd={e => {
                        //console.log("onLoadEnd");
                        //console.log("this.state.loaded", this.state.loaded);
                        if (!this.state.loaded) {
                            this.setState({loading: false, loaded: true});
                            if(this.props.setLoading && typeof(this.props.setLoading)==='function')this.props.setLoading(false);
                        }
                    }}
                />
                {this.renderLoader(key)}
                {false?this.renderZoomImageIcon():null}
                {false?this.renderZoomImageModal():null}
            </View>
        );

    }

    renderLoader(key) {
        var {loaderStyle} = this.props;

        if (!this.state.loading)
            return null;

        return (
            <View style={this.style.loaderWrapper} key={"loadingv_"+key}>
                <Image draggable={false}
                    key={"loadingimg_"+key}
                    style={[this.style.loader, loaderStyle]}
                    resizeMode={"contain"}
                    source={(!global.envVars.TARGET_RAINOLVE?loadingapp:loadingrainolve)}
                />
            </View>
        );

    }

    renderZoomImageIcon() {
        var {source} = this.props;

        if (!source || this.state.loading)
            return null;

        return (
            <TouchableOpacity style={this.style.zoomImage}
                onPress={() => {
                    this.setState({zoomImageVisible: true});
                }}>
                    <IconFeather name="zoom-in" size={30} style={{color: "black"}}/>
            </TouchableOpacity>
        );

    }

    renderZoomImageModal() {
        var {source} = this.props;

        if (!source || this.state.loading || !this.state.zoomImageVisible)
            return null;

        return (
            <ZoomImage
                visible={this.state.zoomImageVisible}
                source={source.uri?source.uri:source}
                onClose={() => {
                    this.setState({zoomImageVisible: false});
                }}
            />
        );
    }

};

var style = {
    loaderWrapper: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
//        borderColor: "red",
//        borderWidth: 1,
//        backgroundColor:"red",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10
    },
    loader: {
        width: 90,
        height: 90
    },
    zoomImage: {
        position: "absolute",
        top: 15, right: 5,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center"
    }
};

//Connect everything
export default mediaConnect(style, FliwerImage);
