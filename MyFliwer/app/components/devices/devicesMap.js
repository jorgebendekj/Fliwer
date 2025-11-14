'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform
} = require('react-native');

import FliwerLoading from '../fliwerLoading'
import ImageBackground from '../../components/imageBackground.js'
import {FliwerColors} from '../../utils/FliwerColors'
import MapView from '../../widgets/mapView/mapView'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import markerGreen  from '../../assets/img/mapsMarkerGreen.png'
import markerRed  from '../../assets/img/mapsMarkerRed.png'

class DevicesMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    render() {
        if (!this.props.preloadedData) {
            return (
                    <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"}>
                        <FliwerLoading/>
                    </ImageBackground>
                    );
        } else {
            return (
                    <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"} loading={this.state.loading}>
                        <MapView
                            style={[this.style.mapView, (this.props.history ? {} : {top: 0})]}
                            autocenter={true}
                            mapType={"satellite"}
                            ref={map => {
                                this.map = map;
                            }}
                            markers={this.getMarkers()}
                            renderMarker={this.renderMarker}
                            highlightedId={this.props.highlightedId}
                            />
                    </ImageBackground>
                    );
        }
    }

    getMarkers() {
        var that = this;
        var markers = [];

        var devices = this.props.devices;

        for (var i = 0; i < devices.length; i++) {
            var device = devices[i];

            if (device.latitude && device.longitude) {
                //console.log("device", device)

                var typeToTitle = FliwerCommonUtils.typeToTitle(device.type);
                var title = typeToTitle? this.props.actions.translate.get(typeToTitle) : "";
                if (typeToTitle) title += " ";
                title += device.DeviceSerialNumber;

                var obj = {lat: device.latitude, long: device.longitude, title: title, id: device.DeviceSerialNumber, image: null, borderColor: FliwerColors.secondary.green, alerts: {}, nalerts: 0};
                obj.onPress = (function (obj) {
                    return () => {
                        that.props.onPress(obj)
                    }
                })(obj)
                markers.push(obj);
            }
        }

        /*
        var obj = {lat: "41.85077959654291", long: "3.1261814944446087", title: "title", id: "12345", image: null, borderColor: FliwerColors.secondary.green, alerts: {}, nalerts: 0};
        obj.onPress = (function (obj) {
            return () => {
                that.props.onPress(obj)
            }
        })(obj)
        markers.push(obj);
        */

        return markers;
    }

    renderMarker(marker, i) {
        var style={width: 42, height: 73};
        
        return(
            <View key={i + "v"} style={style}>
                <Image resizeMode={"contain"} source={markerGreen} style={{width: "100%", height: "100%"}}/>
            </View>
        );
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        preloadedData: state.sessionReducer.preloadedData,
        translation: state.languageReducer.translation
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

//Connect everything

var styles = {
    mapView: {
        position: "absolute",
        top: 40,
        width: "100%",
        bottom: 0,
    }
};



export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, DevicesMap));
