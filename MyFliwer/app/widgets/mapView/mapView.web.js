'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Animated, Easing } from 'react-native';

import {AdvancedMarker, APIProvider, Map} from '@vis.gl/react-google-maps';

import {fitBounds} from './fitBounds.js';

import {CustomAdvancedMarker} from './customMarker/custom-marker.tsx';


class MapView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            width: 200,
            height: 200,
            zoom: null,
            center: {lat:0,lng:0},
            forcedCenterNull:false,
            markersVisible: []
        };
        this.mapInstance = null;


        this.animationProgress = new Animated.Value(0);

    }

     /*
    shouldComponentUpdate(nextProps, nextState) {
        if (JSON.stringify(this.state) != JSON.stringify(nextState))return true;
        else{
            if (JSON.stringify(this.props) == JSON.stringify(nextProps))return false;
            else {
                var nextPropsClone = Object.assign({},nextProps);
                var thisPropsClone = Object.assign({},this.props);
                delete nextPropsClone.markers;
                delete thisPropsClone.markers;
                if(JSON.stringify(nextPropsClone) != JSON.stringify(thisPropsClone))return true;
                else{
                    this.forceUpdate();
                    return false;
                }
            }
        }
    }
    */
    
    goTo = (coords, zoom) => {
        // Primero, comprobamos si ya hemos capturado la instancia del mapa
        if (!this.mapInstance) {
            console.warn("La instancia del mapa aún no está disponible.");
            // Como fallback, podríamos llamar a la versión con setState
            // this.setState({ center: { lat: coords.latitude, lng: coords.longitude }, zoom });
            return;
        }

        console.log("Usando métodos nativos de Google Maps...");

        // 1. Animamos el desplazamiento del centro del mapa.
        //    Esto crea una panorámica suave.
        this.mapInstance.panTo({
            lat: parseFloat(coords.latitude),
            lng: parseFloat(coords.longitude)
        });

        // 2. Cambiamos el zoom. Este cambio es INSTANTÁNEO.
        //    No hay un método "animateZoom" nativo.
        this.mapInstance.setZoom(zoom);
    }
    
    resetInitialRegion() {
        if(this.mapInstance){
            //use this.state.initialRegion to panTo and setZoom
            this.goTo({latitude:this.state.initialRegion.latitude,longitude:this.state.initialRegion.longitude},this.state.initialRegion.zoom)
        }
    }

    recalculateBoundsZoom(){

        var bounds;
        var newPosition = {
            latitude: 41,
            longitude: 2,
            zoom: 16
        }

        if (this.props.markers && this.props.markers.length>1) {
            var minlat = 200, maxlat = -200, minlong = 200, maxlong = -200;
            for (var i = 0; i < this.props.markers.length; i++) {
                if (parseFloat(this.props.markers[i].lat) < minlat)
                    minlat = parseFloat(this.props.markers[i].lat);
                if (parseFloat(this.props.markers[i].long) < minlong)
                    minlong = parseFloat(this.props.markers[i].long);
                if (parseFloat(this.props.markers[i].lat) > maxlat)
                    maxlat = parseFloat(this.props.markers[i].lat);
                if (parseFloat(this.props.markers[i].long) > maxlong)
                    maxlong = parseFloat(this.props.markers[i].long);
            }
            bounds={ne: {lat: maxlat, lng: maxlong}, sw: {lat: minlat, lng: minlong}};

            //Add some margin to bounds
            const latMargin = (maxlat - minlat) * 0.1; // 10% margin
            const lngMargin = (maxlong - minlong) * 0.1; // 10% margin
            bounds.ne = { lat: maxlat + latMargin, lng: maxlong + lngMargin };
            bounds.sw = { lat: minlat - latMargin, lng: minlong - lngMargin };


            const size = {
                width: this.state.width, // Map width in pixels
                height: this.state.height, // Map height in pixels
                };
                
            const {center, zoom} = fitBounds(bounds, size);
            newPosition = {
                latitude: center.lat,
                longitude: center.lng,
                zoom: zoom>3?zoom:20
            }
        }else if(this.props.markers && this.props.markers.length==1){
            newPosition = {
                latitude: this.props.markers[0].lat,
                longitude: this.props.markers[0].long,
                zoom: 20
            }
        }
        
        this.goTo({latitude:newPosition.latitude,longitude:newPosition.longitude},newPosition.zoom)
    }

    getCurrentPosition() {
        if (this.map && this.map.center)
        {
            return {lat: this.map.center.lat(), long: this.map.center.lng(), zoom: this.map.zoom}
        } else
            return {}
    }

    render() {

        var initialRegion = Object.assign({}, this.props.initialRegion);
        var bounds;

        if (this.props.autocenter && !this.state.initialRegion) {
            initialRegion = {
                latitude: 41,
                longitude: 2,
                zoom: 16
            }
            if (this.props.markers && this.props.markers.length) {
                var minlat = 200, maxlat = -200, minlong = 200, maxlong = -200;
                for (var i = 0; i < this.props.markers.length; i++) {
                    if (parseFloat(this.props.markers[i].lat) < minlat)
                        minlat = parseFloat(this.props.markers[i].lat);
                    if (parseFloat(this.props.markers[i].long) < minlong)
                        minlong = parseFloat(this.props.markers[i].long);
                    if (parseFloat(this.props.markers[i].lat) > maxlat)
                        maxlat = parseFloat(this.props.markers[i].lat);
                    if (parseFloat(this.props.markers[i].long) > maxlong)
                        maxlong = parseFloat(this.props.markers[i].long);
                }
                bounds={ne: {lat: maxlat, lng: maxlong}, sw: {lat: minlat, lng: minlong}};

                //Add some margin to bounds
                const latMargin = (maxlat - minlat) * 0.1; // 10% margin
                const lngMargin = (maxlong - minlong) * 0.1; // 10% margin
                bounds.ne = { lat: maxlat + latMargin, lng: maxlong + lngMargin };
                bounds.sw = { lat: minlat - latMargin, lng: minlong - lngMargin };
                this.state.bounds = bounds;


                const size = {
                    width: this.state.width, // Map width in pixels
                    height: this.state.height, // Map height in pixels
                  };
                  
                const {center, zoom} = fitBounds(bounds, size);
                initialRegion = {
                    latitude: center.lat,
                    longitude: center.lng,
                    zoom: zoom>3?zoom:18
                }
            }
            this.state.initialRegion = initialRegion;
        }
        
        /*
         * Old:
         */
        /*
        onGoogleApiLoaded={map => {
              this.map = map.map;
              map.map.setMapTypeId('satellite');
        }}*/        

        // New:
        //yesIWantToUseGoogleMapApiInternals    
        //onGoogleApiLoaded={({ map, maps }) => {
        console.log("MapView render. initialRegion", this.state.initialRegion);
        console.log("Map render center:",this.state.center)
        return (
                <View style={this.props.style}
                    onLayout={(event) => {
                        var {x, y, width, height} = event.nativeEvent.layout;
                        if(this.state.bounds){
                            const size = {
                                width: width, // Map width in pixels
                                height:height, // Map height in pixels
                              };

                            const {center, zoom} = fitBounds(this.state.bounds, size);
                            this.state.initialRegion.zoom=zoom;
                        }
                        this.setState({width: width, height: height})

                    }}>
                    <APIProvider apiKey={'AIzaSyBNkLwQPzajoL_5FI_iMiJ7yLP2ja09AXo'}>
                        <Map 
                            defaultCenter={{lat: this.state.initialRegion.latitude, lng: this.state.initialRegion.longitude}} 
                            defaultZoom={this.state.initialRegion?(this.state.initialRegion.zoom ? this.state.initialRegion.zoom : 16):(initialRegion.zoom ? initialRegion.zoom : 16)} 
                            mapId="DEMO_MAP_ID"
                            mapTypeId={"satellite"}
                            onClick={(event)=>{
                                if(this.props.onClick && event && event.detail && event.detail.latLng){
                                    this.props.onClick({lat: event.detail.latLng.lat, long: event.detail.latLng.lng});
                                }
                            }}
                            onTilesLoaded={({map}) => {
                                this.mapInstance = map;
                            }}
                        >
                            {this.renderMarkers()}
                            {this.props.children}
                        </Map>
                    </APIProvider>


                </View>
                )
    }

    renderMarkers(markersForced) {
        /*
         Marker Obj: {
         lat:
         long:
         color: (optional)
         onPress: (optional)
         title:
         description:
         image:
         }
         */

        const { renderMarker} = this.props;

        var markers=markersForced?markersForced:this.props.markers;

        var that = this;
        var indents = [];
        if (markers && markers.length && !this.state.loadingMarkers) {
            for (var i = 0; i < markers.length; i++) {
                (function(i) {
                    
                    //var titleVisible = that.state.markersVisible[i] && markers[i].title? true : false;
                    var titleVisible = false;
                    if (markers[i].title) {
                        if (that.props.highlightedId)
                            titleVisible = (that.props.highlightedId == markers[i].id);
                        else
                            titleVisible = that.state.markersVisible[i];                        
                    }

                    indents.push(
                        <CustomAdvancedMarker 
                            position={{lat: parseFloat(markers[i].lat), lng:parseFloat(markers[i].long)}}
                            renderCustomPin = {renderMarker}
                            marker={markers[i]}
                            id={i}
                            onClick={(obj) => {
                                markers[i].onPress(obj);
                                
                                var markersVisible = that.state.markersVisible;
                                for (var j = 0; j < markers.length; j++) {
                                    markersVisible[j]= false;
                                }
                                markersVisible[i] = true;
                                //that.setState({markersVisible: markersVisible});
                                that.state.markersVisible = markersVisible;
                            }} 
                         />
                        /*
                        <AdvancedMarker 
                            position={{lat: parseFloat(markers[i].lat), lng:parseFloat(markers[i].long)}}
                            onClick={(obj) => {
                                markers[i].onPress(obj);
                                
                                var markersVisible = that.state.markersVisible;
                                for (var j = 0; j < markers.length; j++) {
                                    markersVisible[j]= false;
                                }
                                markersVisible[i] = true;
                                //that.setState({markersVisible: markersVisible});
                                that.state.markersVisible = markersVisible;
                            }} 
                        >
                            <TouchableOpacity activeOpacity={0.9} 
                                    style={[{
                                        //width: 42, height: 73,
                                        //marginLeft: -21, marginTop: -73,
                                        //marginLeft: "-50%", marginTop: "-100%",// display: "table-caption",
                                        zIndex: titleVisible?999:0
                                        //,borderColor: "violet", borderWidth: 1
                                    },markers[i].containerStyle]}
                                    lat={parseFloat(markers[i].lat)}
                                    lng={parseFloat(markers[i].long)}
                                    key={i + "m"}
                                    >
                                {(renderMarker ? renderMarker(markers[i], i,that.obj) : [])}
                                
                                {titleVisible?<View style={{position: "absolute", width: 110, top: 0, left:-55, backgroundColor: "white", borderColor: "gray", borderWidth: 1, padding: 5, justifyContent: "center", alignItems: "center", zIndex: 999}}>
                                    <Text style={{color: "black", fontSize: 10, textAlign: "center"}}>{markers[i].title}</Text>
                                </View>:null}
                        
                            </TouchableOpacity>
                        </AdvancedMarker>
                        */
                    );
                })(i);
            }
        }
        return indents;
    }

    getBoundsZoomLevel(bounds, mapDim) {
        var WORLD_DIM = {height: 256, width: 256}; 
        var ZOOM_MAX = 21;

        function latRad(lat) {
            var sin = Math.sin(lat * Math.PI / 180);
            var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
        }

        function zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
        }

        var ne = bounds.ne;
        var sw = bounds.sw;

        var latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

        var lngDiff = ne.lng - sw.lng;
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        return Math.max(Math.min(latZoom, lngZoom, ZOOM_MAX) - 1, 0);
    }

    pixelToLatlng(xcoor, ycoor) {
        var ne = this.map.getBounds().getNorthEast();
        var sw = this.map.getBounds().getSouthWest();
        var projection = this.map.getProjection();
        var topRight = projection.fromLatLngToPoint(ne);
        var bottomLeft = projection.fromLatLngToPoint(sw);
        var scale = 1 << this.map.getZoom();
        var newLatlng = projection.fromPointToLatLng(new google.maps.Point(xcoor / scale + bottomLeft.x, ycoor / scale + topRight.y));
        return newLatlng;
    }
  
    toDataUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var reader = new FileReader();
            reader.onloadend = function () {
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    fitBounds(bounds) {
        this.map.fitBounds(bounds);
    }


    takeSnapshot(options) {
        var that = this;
        return new Promise(function (resolve, reject) {
            if (that.map && that.obj) {
                var defaultOpt = {
                    format: 'jpg', // image formats: 'png', 'jpg' (default: 'png')
                    quality: 0.8, // image quality: 0..1 (only relevant for jpg, default: 1)
                    result: 'base64', // result types: 'file', 'base64' (default: 'file')
                    rectangleWidth: 0,
                    rectangleCenter: {x: 0, y: 0}
                }
                options = Object.assign({}, defaultOpt, options);
                var staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap";
                //Set the Google Map Center.
                var latlng = that.pixelToLatlng(options.rectangleCenter.x, options.rectangleCenter.y);
                staticMapUrl += "?center=" + latlng.lat() + "," + latlng.lng();
                //Set the Google Map Size.
                staticMapUrl += "&size=" + parseInt(options.rectangleWidth) + "x" + parseInt(options.rectangleWidth);
                //Set the Google Map Zoom.
                staticMapUrl += "&zoom=" + that.map.zoom;
                //Set the Google Map Type.
                staticMapUrl += "&maptype=" + that.map.mapTypeId;
                //Set the Google Api key.
                staticMapUrl += "&key=AIzaSyBnBbjHlhSpxroBitTiTNcAPMY0IP9y3eY";

                that.toDataUrl(staticMapUrl, function (image) {
                    resolve(image);
                })

            } else
                reject({error: 1, text: "map not loaded"})
        });
    }

};

//Connect everything
export default MapView;
