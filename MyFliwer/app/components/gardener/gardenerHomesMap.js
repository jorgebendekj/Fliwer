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
import MapView from '../../widgets/mapView/mapView'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions


import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../widgets/toast/toast'
import {FliwerColors} from '../../utils/FliwerColors'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect, withRouter } from '../../utils/router/router';

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg' 
import markerGreen  from '../../assets/img/mapsMarkerGreen.png'
import markerRed  from '../../assets/img/mapsMarkerRed.png'


class GardenerHomesMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: this.props.mode?this.props.mode:"homes",
            id:null,
            loading: false,
            goToZones:false,
            goToDevices:false,
            reloadMarkers:false,
            loadingDeviceInfo:[]
        };

        if(this.state.mode=="zones" || this.state.mode=="devices"){
            this.state.id=this.props.match.params.idHome;
        }
    }

    
    shouldComponentUpdate(nextProps, nextState) {

        var shouldUpdate=false;
        var pendingGoToMarkers=false;
        if(nextProps.mode!=this.state.mode){
            this.state.mode=nextProps.mode;
            this.state.reloadMarkers = true;
            pendingGoToMarkers=true;
            shouldUpdate=true;
        }

        if (this.props.match.params.idHome != nextProps.match.params.idHome) {
            this.state.id=nextProps.match.params.idHome;
            this.state.reloadMarkers = true;
            shouldUpdate=true;
        }

        if (this.props.idHome != nextProps.idHome) {
            this.state.id=nextProps.idHome;
            this.state.reloadMarkers = true;
            pendingGoToMarkers=true;
            shouldUpdate=true;
        }
        if(shouldUpdate)this.forceUpdate();

        if(this.map && pendingGoToMarkers){
            setTimeout(()=>{
                this.map.recalculateBoundsZoom();
            },0);
        }

        return true;
    }

    render() {
        if (!this.props.preloadedData || this.props.loadingData ) {
            return (
                    <ImageBackground  style={{backgroundColor:"rgb(220,220,220)"}} resizeMode={"cover"}>
                        <FliwerLoading/>
                    </ImageBackground>
                    );
        } else {

            if(this.state.goToZones || this.state.goToDevices){
                this.setState({goToZones:false,goToDevices:false});
            }

            return (
                    <ImageBackground  style={{backgroundColor:"rgb(220,220,220)"}} resizeMode={"cover"} loading={this.state.loading}>
                        <MapView
                            style={[this.style.mapView]}
                            autocenter={true}
                            key={"map_1"}
                            mapType={"satellite"}
                            ref={map => {
                                this.map = map;
                            }}
                            markers={this.getMarkers()}
                            renderMarker={this.renderMarker}
                            highlightedId={this.props.highlightedId}
                            onClick={this.props.onClick}
                        />
                    </ImageBackground>
                    );
        }
    }

    renderMarker(marker, i) {
        
        var style={width: 42, height: 73};

        if (marker.nalerts == 0) {
            return(
                    <View key={i + "v"} style={style}>
                        <Image resizeMode={"contain"} source={markerGreen} style={{width: "100%", height: "100%"}}/>
                    </View>
                    )
        } else
            return(
                    <View key={i + "v"} style={style}>
                        <Image resizeMode={"contain"} source={markerRed} style={{width: "100%", height: "100%"}}/>
                        <View style={{position: "absolute", width: 23, height: 24, top: 11, left: 9.5, justifyContent: "center", alignItems: "center"}}>
                            <Text style={{color: "white"}}>{marker.nalerts}</Text>
                        </View>
                    </View>
                    )
    }

    getMarkers(){
        //Depending on the mode, we will get the markers for the map
        if(!this.state.mode)this.state.mode="homes";

        if(this.state.mode=="homes"){
            return this.getHomeMarkers();
        } else if(this.state.mode=="zones"){
            return this.getZoneMarkers();
        }else if(this.state.mode=="devices"){
            return this.getDeviceMarkers();
        }
    }

    getHomeMarkers() {
        var that = this;
        if(this.state.markers && !this.state.reloadMarkers)return this.state.markers;
        this.state.reloadMarkers=false;
        
        var markers = [];
        var cityMarkers = {};
        var homes = Object.values(this.props.gardensOnCare);

        for (var i = 0; i < homes.length; i++) {
            var gardens = homes[i].gardens;
            var alerts = {};
            var nalerts = 0;
            var lat = null, long = null, imageName = null;
            if (homes[i].latitude && homes[i].longitude) {
                lat = homes[i].latitude;
                long = homes[i].longitude;
            }
            for (var j = 0; j < gardens.length; j++) {
                if (!imageName && gardens[j].imageName)
                    imageName = gardens[j].imageName;
                if (!lat && !long && gardens[j].latitude && gardens[j].longitude) {
                    lat = gardens[j].latitude;
                    long = gardens[j].longitude;
                }
                var zones = gardens[j].zones;
                for (var k = 0; k < zones.length; k++) {
                    var keys = Object.keys(zones[k].genericInfo.sensors);
                    for (var l = 0; l < keys.length; l++) {
                        if (!alerts[keys[l]])
                            alerts[keys[l]] = zones[k].genericInfo.sensors[keys[l]].alerts
                        else
                            alerts[keys[l]] += zones[k].genericInfo.sensors[keys[l]].alerts
                        nalerts += zones[k].genericInfo.sensors[keys[l]].alerts;
                    }
                }
            }

            var title = homes[i].userInfo.first_name;
            if (homes[i].userInfo.last_name)
                title += " " + homes[i].userInfo.last_name;
            //title += ", " + homes[i].name;

            if (lat && long) {
                var obj = {lat: lat, long: long, title: title, id: homes[i].id, image: markerGreen/*null*/, borderColor: (nalerts ? FliwerColors.secondary.red : FliwerColors.secondary.green), alerts: alerts, nalerts: nalerts};
                
                obj.onPress = (function (obj) {
                    return () => {
                        that.setState({id:obj.id,goToZones:true});
                        if (that.props.onPress)that.props.onPress(obj,that.map)
                    }
                })(obj)
                markers.push(obj)
            } else if (gardens.length > 0) {
                if (!cityMarkers[homes[i].idCity])
                    cityMarkers[homes[i].idCity] = {lat: parseFloat(homes[i].latitudeCity), long: parseFloat(homes[i].longitudeCity), markers: []};
                cityMarkers[homes[i].idCity].markers.push({id: homes[i].id, title: title, image: markerGreen, borderColor: (nalerts ? FliwerColors.secondary.red : FliwerColors.secondary.green), alerts: alerts, nalerts: nalerts});
            }
        }

        var cityMarkersArray = Object.values(cityMarkers);
        var DGROW = 0.0005;
        for (var k = 0; k < cityMarkersArray.length; k++) {
            var city = cityMarkersArray[k];
            var cx = city.lat, cy = city.long;
            if (cx && cy) {
                var n = 2, i = 0, j = 1;
                while (i < city.markers.length) {
                    if (i == 0) {
                        var obj = {lat: cx, long: cy, title: city.markers[i].title, id: city.markers[i].id, image: city.markers[i].image, borderColor: city.markers[i].borderColor, alerts: city.markers[i].alerts, nalerts: city.markers[i].nalerts};
                        if (this.props.onPress)
                            obj.onPress = (function (obj) {
                                return () => {
                                    that.props.onPress(obj,that.map)
                                }
                            })(obj)
                        markers.push(obj)
                        i++;
                    } else {
                        n *= 2;
                        var n2 = 0, alfa = 0, offset = 360 / n;
                        if (city.markers.length - i < n) {
                            n = city.markers.length - i;
                            offset = 360 / n;
                            alfa = offset / 2;
                        }
                        while (i < city.markers.length && n2 < n) {
                            var obj = {lat: cx + Math.cos(alfa * (Math.PI / 180)) * DGROW * j, long: cy + Math.sin(alfa * (Math.PI / 180)) * DGROW * j, title: city.markers[i].title, id: city.markers[i].id, image: city.markers[i].image, borderColor: city.markers[i].borderColor, alerts: city.markers[i].alerts, nalerts: city.markers[i].nalerts};
                            if (this.props.onPress)
                                obj.onPress = (function (obj) {
                                    return () => {
                                        that.props.onPress(obj,that.map)
                                    }
                                })(obj)
                            markers.push(obj)
                            i++;
                            n2++;
                            alfa += offset;
                        }
                        j++;
                    }
                }
            }
        }

        //console.log("markers", markers)
        this.state.markers = markers;
        return markers;
    }

    getZoneMarkers(){
        //this.state.mode is "gardens" and this.state.id is the id of the home
        var markers = [];
        var that=this;
        var homes = Object.values(this.props.gardensOnCare);
        var home = homes.find((home) => home.id == this.state.id);
        
        if(home){
            

            var gardens = home.gardens;
            for (var i = 0; i < gardens.length; i++) {
                var zones = gardens[i].zones;


                var DGROW = 0.0005;
                var n = 2;
                var  alfa = 0, offset = 360 / n;
                if (zones.length - i < n) {
                    n = zones.length - i;
                    offset = 360 / n;
                    alfa = offset / 2;
                }

                for (var j = 0; j < zones.length; j++) {
                    /*
                    var keys = Object.keys(zones[j].genericInfo.sensors);
                    for (var k = 0; k < keys.length; k++) {
                        var alerts = zones[j].genericInfo.sensors[keys[k]].alerts;
                    */
                        var alerts=Object.values(zones[j].genericInfo.sensors).reduce((a, b) => a + b.alerts, 0);
                        var title = zones[j].name;
                        var lat = zones[j].latitude;
                        var long = zones[j].longitude;

                        if(!lat || !long){
                            //Try getting the location from zone's garden
                            lat = gardens[i].latitude;
                            long = gardens[i].longitude;
                        }

                        //if lat or long are not defined, we will check if it's sensor has a location
                        if ( (!lat || !long) && zones[j].DeviceSerialNumber && !this.props.devices[zones[j].DeviceSerialNumber] && !this.state.loadingDeviceInfo[zones[j].DeviceSerialNumber]) {
                            this.state.loadingDeviceInfo[zones[j].DeviceSerialNumber] = true;
                            ((device)=>{
                                this.props.actions.fliwerDeviceActions.getDevice(device,true).finally(() => {
                                    this.state.loadingDeviceInfo[device] = false;
                                    this.forceUpdate();
                                });
                            })(zones[j].DeviceSerialNumber)
                        }


                        if((!lat || !long) && zones[j].DeviceSerialNumber && this.props.devices[zones[j].DeviceSerialNumber]){
                            var device = this.props.devices[zones[j].DeviceSerialNumber];
                            lat = device.latitude;
                            long = device.longitude;
                        }

                        if((!lat || !long) &&  !this.state.loadingDeviceInfo[zones[j].DeviceSerialNumber]){
                            //Try getting the location from garden's home
                            lat= parseFloat(home.latitude) + (Math.cos(alfa * (Math.PI / 180))*DGROW);
                            long= parseFloat(home.longitude) + (Math.sin(alfa * (Math.PI / 180))*DGROW);
                            alfa += offset;
                        }

                        if (lat && long) {
                            var obj = {lat: lat, long: long, title: title, id: zones[j].idZone, image: markerGreen, borderColor: (alerts ? FliwerColors.secondary.red : FliwerColors.secondary.green), alerts: alerts, nalerts: alerts};
                            if (this.props.onPress)
                                obj.onPress = (function (obj) {
                                    return () => {
                                        that.props.onPress(obj,that.map)
                                    }
                                })(obj)
                            markers.push(obj)
                        }
                    //}
                }
            }
        }
        this.state.markers = markers;
        return markers;
    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        data: state.sessionReducer.data,
        preloadedData: state.sessionReducer.preloadedData,
        translation: state.languageReducer.translation,
        gardensOnCare: state.gardenerReducer.gardenerHomes,
        loadingData: state.gardenerReducer.loadingData,
        devices: state.fliwerDeviceReducer.devices
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
        }
    }
}

//Connect everything

var styles = {
    mapView: {
        position: "absolute",
        top: 0,
        width: "100%",
        bottom: 0,
    },
    markerPointer: {
        width: 0,
        height: 0,
        marginTop: 30,
        marginLeft: 2,
        marginRight: 2,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 19,
        borderRightWidth: 19,
        borderBottomWidth: 26,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        transform: [{rotate: '180deg'}]
    }
};



export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, GardenerHomesMap)));
