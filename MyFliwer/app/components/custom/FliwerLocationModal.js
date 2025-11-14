'use strict';

import React, { Component } from 'react';
import {View, Platform, TouchableOpacity, Text, TextInput, Dimensions, Image} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import {gpsUtils} from '../../utils/gpsUtils'

import Modal from '../../widgets/modal/modal'
import {toast} from '../../widgets/toast/toast'
import MapView from '../../widgets/mapView/mapView';

var mapImage = require('../../assets/img/map_background.jpg');
var fliwerMarker= require('../../assets/img/fliwerMarker.png');


class FliwerLocationModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            coordsText: this.props.coords? this.props.coords : "",
            coords: null,
            coordsTextManual: null,
            coordsData: null,
            accuracy: this.props.accuracy? this.props.accuracy : null,
            mapDim: {w: 0, h: 0},
            mapHeight: null,
            mapWidth: null,
            defaultZoom: 18,
            marker: null,
            timer: null,
            interval: null,
            intervalEnabled: null,
            rectTargetVisible: false,
            //rectTargetEnabled: false,
            watchID: null,
            intervalWatching: null,
            intervalWatchingEnabled: null,
            intervalWatchingBlink: false
        };
        
        if (this.state.coordsText) {
            this.setCoords();
        }
        else
            this.getCurrentLocation();
        
//        setTimeout(() => {
//            this.state.rectTargetEnabled = true;
//        }, 500);        
        
        console.log("constructor")
    }
    
    setCoords() {
        if (this.state.coordsText) {
            const [latitude, longitude] = this.state.coordsText.split(",");
            this.state.coords = {
                lat: parseFloat(latitude),
                long: parseFloat(longitude),
                zoom: this.state.defaultZoom
            };
            this.state.coordsData = {
                lat: parseFloat(latitude),
                long: parseFloat(longitude),
                zoom: this.state.defaultZoom
            };
            this.state.marker = {
                lat: parseFloat(latitude),
                long: parseFloat(longitude),
                id: "mylocation"
            };
        }        
    }

    componentWillMount = () => {
        this.measureView();
        clearTimeout(this.state.timer);
        clearTimeout(this.state.interval);
        this.state.rectTargetVisible = false;
    }
    
    componentWillUnmount = () => {
        if (this.state.intervalWatching != null)
            clearTimeout(this.state.intervalWatching); 
        if (this.state.watchID != null)
            Geolocation.clearWatch(this.state.watchID);
    }

    render() {
        var {onClose} = this.props;

        const dimensions = Dimensions.get('window');
        var maxWidth = 400;
        
        var noMapHeight = 335;
        if (Platform.OS != 'web') {
            noMapHeight = parseInt(dimensions.height * 50 / 100);
        }
            
        if (Platform.OS == 'web')
            this.state.mapHeight = 300;
        else
            this.state.mapHeight = dimensions.height - noMapHeight;
        var totalPadding = 42;
        if (dimensions.width >= (maxWidth + totalPadding))
            this.state.mapWidth = maxWidth - totalPadding;
        else
            this.state.mapWidth = dimensions.width - 84;
        
        var backgroundColorLocation = "#D8D8D7";
        var colorLocation = "black";
        
        if (this.state.intervalWatchingEnabled) {
            if (this.state.intervalWatchingBlink) {
                backgroundColorLocation = "gray";
                colorLocation = "white";                
            }
            else {
                backgroundColorLocation = FliwerColors.secondary.green;
                colorLocation = "white"; 
            }
        }
        
        return (
            <Modal animationType="fade" loadingModal={this.props.loadingModal} inStyle={[FliwerStyles.modalIn, {maxWidth: maxWidth}]} visible={true} onClose={() => {
                    onClose();
                }}>
                <View style={[FliwerStyles.modalView, {
                        paddingLeft: 20,
                        paddingRight: 20}]
                    }>
                        <View style={{width: "100%", alignItems: "center"}}>
                        
                            <View style={{width: "100%", height: this.state.mapHeight}}>
                                <View style={[this.style.mapView]} ref={(view) => {
                                        this._view = view;
                                        this.measureView();
                                    }} onLayout={() => this.measureView()}>
                                    {this.renderMap()}
                                </View>
                            </View>

                            {Platform.OS != 'web'?<View style={{marginTop: 10}}>
                                <TouchableOpacity
                                    style={{
                                        marginLeft: 5, backgroundColor: backgroundColorLocation, borderRadius: 25, padding: 4, 
                                        flexDirection: "row",
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingLeft: 10, paddingRight: 15,
                                        borderColor: "gray",// "#000000",
                                        borderWidth: 1
                                    }} 
                                    onMouseEnter={this.hoverIn('gpsIconTouchable')} 
                                    onMouseLeave={this.hoverOut('gpsIconTouchable')}  
                                    onPress={() => {
                                        
                                        if (Platform.OS != 'web') {
                                            if (this.state.intervalWatching != null)
                                                clearTimeout(this.state.intervalWatching);  
                                            
                                            if (this.state.intervalWatchingEnabled) {
                                                if (this.state.watchID != null)
                                                    Geolocation.clearWatch(this.state.watchID);  

                                                this.setState({intervalWatchingEnabled: false, intervalWatching: null, intervalWatchingBlink: false});
                                            } else {

                                                this.getCurrentLocation();

                                                this.state.intervalWatching = setInterval(() => {
                                                    console.log("intervalWatching")
                                                    this.setState({intervalWatchingEnabled: true, intervalWatchingBlink: !this.state.intervalWatchingBlink});
                                                }, 1000);                                             
                                            }                                            
                                        }
                                        else
                                            this.getCurrentLocation();
                                    }}>
                                    <IconMaterialIcons name="gps-fixed" size={37} style={[{color: colorLocation, alignSelf: "center"}, this.style.gpsIconTouchable]}/>
                                    <Text style={{marginLeft: 5, fontSize: 10}}>{this.state.intervalWatchingEnabled?"Buscando mejor posición":"Buscar posición actual"}</Text>
                                </TouchableOpacity>
                            </View>:null}
                            
                            <View style={{marginTop: Platform.OS == 'web'? 15 : 10, alignItems: "center"}}>
                                <Text style={[FliwerStyles.titleStyle,{fontSize: 12}]}>{"Desplázate sobre el mapa o escribe las coordenadas"}</Text>
                                <View style={{flexDirection: "row"}}>
                                    <TextInput
                                        key={this.state.coordsText ? "keyTI_" + this.state.coordsText : "914"}
                                        style={{marginTop: 4, height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, width: 270, alignItems: "center", textAlign: "center"}}
                                        onChangeText={(text) => {
                                            //console.log("onChangeText", text)
                                            this.setState({coordsTextManual: text, accuracy: null});
                                        }}
                                        value={this.state.coordsTextManual !== null? this.state.coordsTextManual : (this.state.coordsText ? this.state.coordsText : "")}
                                        textContentType={"location"}
                                        keyboardType={"decimal-pad"}
                                        returnKeyType = {"done"}
                                        multiline = {false}
                                        placeholder={""}
                                        editable={true}
                                        onSubmitEditing={() => {
                                            this.validateManualCoords();
                                        }}
                                        />
                                    {false && this.state.coordsText?<TouchableOpacity 
                                        style={{position: "absolute", right: 10, top: 9, cursor: "pointer"}}
                                        onPress={()=>{
                                            var locationPieces = this.state.coordsText.split(",");
                                            FliwerCommonUtils.openLocationMaps(locationPieces[0], locationPieces[1]);
                                        }}>
                                        <IconMaterialCommunityIcons name="directions" color={"blue"} size={25} style={{}} ></IconMaterialCommunityIcons>
                                    </TouchableOpacity>:null}     
                                    {this.state.coordsTextManual?<TouchableOpacity 
                                        style={{position: "absolute", right: 10, top: 9, cursor: "pointer", backgroundColor: "green", borderRadius: 45, padding:2}}
                                        onPress={()=>{
                                            this.validateManualCoords();
                                        }}>
                                        <IconMaterialCommunityIcons name="check" color={"white"} size={25} style={{}} ></IconMaterialCommunityIcons>
                                    </TouchableOpacity>:null}                               
                                </View>
                            </View>
                            
                            {Platform.OS != 'web'?<View style={{marginTop: 5}}>
                                <Text style={[FliwerStyles.titleStyle,{fontSize: 12}]}>{this.state.accuracy != null? this.props.actions.translate.get('Location_accuracy_of') + " " + FliwerCommonUtils.toPointsFormat(this.state.accuracy) + " " + this.props.actions.translate.get('general_unit_meters'):""}</Text>
                            </View>:null}
                            
                            <View style={{marginTop: 15, flexDirection: "row"}}>
                                <FliwerGreenButton onPress={() => {
                                        var coordsText = this.state.coordsTextManual === null? this.state.coordsText : this.state.coordsTextManual;
                                        if (coordsText && !FliwerCommonUtils.isValidCoordinates(coordsText)) {
                                            toast.error(this.props.actions.translate.get('Location_coords_are_wrong'));
                                            return;
                                        }
                                        const [latitude, longitude] = coordsText.split(",");
                                        this.state.coordsData = {
                                            lat: parseFloat(latitude),
                                            long: parseFloat(longitude),
                                            zoom: this.state.defaultZoom
                                        };                                            
            
                                        this.props.onAccept(coordsText, this.state.accuracy, this.state.coordsData);
                                    }} 
                                    text={this.props.actions.translate.get('accept')} 
                                    style={FliwerStyles.fliwerGreenButtonStyle} 
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {marginRight: 5, width: 150}]} 
                                    disabled={this.state.intervalEnabled}
                                    disabledStyle={{backgroundColor: FliwerColors.primary.green, opacity: 0.2}}
                                />                                 
                                <FliwerGreenButton onPress={() => {
                                        onClose();
                                    }} 
                                    text={this.props.actions.translate.get('general_cancel')} 
                                    style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: "silver"}]} 
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {marginLeft: 5, width: 150}]}
                                />                                   
                            </View>
                        </View>                  
                </View>
            </Modal>
        );

    }
    
    validateManualCoords() {
        if (!this.state.coordsTextManual)
            return;
            
        var coordsText = this.state.coordsTextManual === null? this.state.coordsText : this.state.coordsTextManual;
        
        if (coordsText && !FliwerCommonUtils.isValidCoordinates(coordsText)) {
            toast.error(this.props.actions.translate.get('Location_coords_are_wrong'));
            return;
        } 

        this.state.coordsText = coordsText;

        this.setState({coords: null, coordsTextManual: null}, () => {
            this.setCoords();
            this.forceUpdate();                                                 
        });                                                
        
    }

    renderMap()
    {
        var makers = this.getMarkers();
        
        if (this.state.coords && (this.state.coords.lat > 0 || this.state.coords.long > 0 || this.state.coords.zoom > 0)) {
            //console.log("Rendering map", this.state.coords);
            var latitude = this.state.coords.lat;
            var longitude = this.state.coords.long;
            
            return(
                    <View style={[{width: this.state.mapWidth, height: this.state.mapHeight}]}>
                        <MapView  
                            style={[this.style.mapView, this.style.mapView2, {}]} mapType={"satellite"} ref={map => {
                                this.map = map;
                            }}
                            initialRegion={{
                                latitude: latitude,
                                longitude: longitude,
                                zoom: this.state.coords.zoom
                            }}
                            markers={makers}
                            renderMarker={(this.renderMarker)}
                            onPress={(e) => {
                                //console.log("onPress map", e)
                            }}
                            forceMapRefresh={0}
                            onRegionChange={(region) => {
                                //console.log("onRegionChange region", region)
                                var latitude = region.latitude.toFixed(7);
                                var longitude = region.longitude.toFixed(7);
                                var coordsText = latitude + "," + longitude;
                                if (!this.state.isOnRegionInitialized) {
                                    this.state.coordsTextRegion = coordsText;
                                    this.state.isOnRegionInitialized = true;
                                    return;
                                }
                                if (this.state.coordsTextRegion == coordsText)
                                    return;
                                    
                                this.state.coordsText = coordsText;
                                this.state.coordsTextManual = null;
                                this.state.rectTargetVisible = true;
                                this.restartTimer();
                            }}
                        />
                        {this.state.rectTargetVisible || true?<View style={this.style.RectangleSnapContainer} pointerEvents={"box-none"} >
                        </View>:null}
                    </View>
                    );            
        }
        else {
            return(
                    <View style={[{flexGrow: 1, width: "100%"}]}>
                        <Image style={[{height: "100%", width: "100%", position: "absolute"}]} draggable={false} resizeMode={"cover"} source={mapImage} />
                        <View style={this.style.RectangleSnapContainer} pointerEvents={"box-none"} >
                        </View>
                    </View>);
        }
    }
    
    restartTimer() {
        //console.log("restartTimer")
        clearTimeout(this.state.timer);
        this.state.timer = setTimeout(() => {
            //console.log("paint coords")
            clearTimeout(this.state.timer);
            this.state.timer = null;
            clearTimeout(this.state.interval);
            this.state.interval = null;
            this.state.intervalEnabled = false;
            clearTimeout(this.state.interval);
            this.forceUpdate();
        }, 500);
        
        if (!this.state.intervalEnabled) {
            this.state.intervalEnabled = true;
            clearTimeout(this.state.interval);
            this.state.interval = setInterval(() => {
                //console.log("interval")
                this.forceUpdate();
            }, 100);         
        }
       
    }

    getMarkers() {
        return [this.state.marker];
    }

    renderMarker(marker,i){
        return(
          <View key={i+"v"} style={{width:42,height:73,top:7}}>
            <Image resizeMode={"contain"} source={fliwerMarker} style={{width:"100%",height:"100%"}}/>
          </View>
         );
    }

    getCurrentLocation()
    {
        var that = this;
        this.props.setLoading(true);
        gpsUtils.getCurrentPosition().then((data) => {
            //console.log("getCurrentLocation data", data);
            
            var latitude = data.lat.toString().replace(/,/g, '.'); 
            latitude = parseFloat(latitude).toFixed(7);
            latitude = parseFloat(latitude);
            
            var longitude = data.long.toString().replace(/,/g, '.'); 
            longitude = parseFloat(longitude).toFixed(7);
            longitude = parseFloat(longitude);
            
            var coordsText = latitude + "," + longitude;

            var marker = {
                lat: latitude,
                long: longitude,
                id: "mylocation"
            };
            
            var firstCoords = Platform.OS == 'web'? null : {lat: latitude, long: longitude, zoom: this.state.defaultZoom + 10};
            this.setState({coords: firstCoords, marker: marker, rectTargetVisible: false}, () => { 
                this.setState({coords: {lat: latitude, long: longitude, zoom: this.state.defaultZoom}, coordsText: coordsText, coordsTextManual: null, accuracy: data.accuracy, coordsData: data, isOnRegionInitialized: false, rectTargetVisible: false}, () => {
                    this.props.setLoading(false);
                    if (Platform.OS != 'web')
                        this.watchPosition();
                });
            });            
        }, (error) => {
            this.props.setLoading(false);
        });
    }

    watchPosition() {

        if (this.state.watchID != null)
            Geolocation.clearWatch(this.state.watchID);                    
        this.state.watchID = Geolocation.watchPosition((lastPosition) => {
            console.log("watchPosition lastPosition", lastPosition);
            
            var latitude = lastPosition.coords.latitude.toString().replace(/,/g, '.'); 
            latitude = parseFloat(latitude).toFixed(7);
            latitude = parseFloat(latitude);
            
            var longitude = lastPosition.coords.longitude.toString().replace(/,/g, '.'); 
            longitude = parseFloat(longitude).toFixed(7);
            longitude = parseFloat(longitude);
            
            var accuracy = lastPosition.coords.accuracy.toString().replace(/,/g, '.'); 
            accuracy = parseFloat(accuracy).toFixed(7);
            accuracy = parseFloat(accuracy);
            
            var coordsText = latitude + "," + longitude;

            var marker = {
                lat: latitude,
                long: longitude,
                id: "mylocation"
            };
            
            this.setState({marker: marker, accuracy: accuracy, coordsText: coordsText, coordsTextManual: null}, () => { 

            }); 


        }, (err) => {
            console.log("watchPosition err", err);
        },{
            enableHighAccuracy: true,
            distanceFilter: 1, 
            interval: 1000,
            maximumAge: 0, 
            maxAge: 0,
            timeout: 10000
        });      

        console.log("this.state.watchID", this.state.watchID);
        
    }

    measureView() {
        if (this._view) {
            this._view.measure((ox, oy, width, height, px, py) => {
                if (this.state.mapDim.w != width || this.state.mapDim.h != height)
                    this.setState({mapDim: {w: width, h: height}});
            });
        }
    }
    
};


function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
        }
    };
}

var style = {
    mapView: {
        width: "100%",
        flexGrow: 1,
//        borderColor: "red",
//        borderWidth: 1
    },
    mapView2: {
//        borderColor: "green",
    },
    RectangleSnapContainer: {
        display: "flex",
        alignItems: 'center',
        justifyContent: 'center',
        position: "absolute",
        width: "100%",
        top: 0,
        bottom: 0,
        flexGrow: 1,
        flexDirection: "column",
    },
    middleSight: {
        display: "flex",
        alignItems: 'center',
        justifyContent: "center",
        top: null
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FliwerLocationModal));