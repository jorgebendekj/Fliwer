'use strict';
import React, { Component } from 'react';
var {View, Image} = require('react-native');
import MapView, {Marker} from 'react-native-maps';

var isEqual = require('lodash.isequal');
var loadedImages = {};

class MapView2 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            width: 200,
            height: 200,
            reloadMarkers: null,
            loadingMarkers: true,
            defaultRegionChanged: false,
            forceMapRefresh: Math.floor(Math.random() * 100),
            region: {}
        };
    }

    componentWillMount() {
        this.checkHref();
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(this.props.markers, nextProps.markers)) {
            this.checkHref();
        }
        if (!isEqual(this.props.forceMapRefresh, nextProps.forceMapRefresh)) {
            this.state.forceMapRefresh = nextProps.forceMapRefresh;
        }
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(this.props.initialRegion, prevProps.initialRegion)) {
            this.setState({defaultRegionChanged: true})
        }
    }

    checkHref() {
        var that = this;
        this.setState({loadingMarkers: true});

        var j = 0, done = 0;
        if (this.props.markers) {
            for (var i = 0; i < this.props.markers.length; i++) {
                if (that.props.markers[i].image) {
                    (function (i) {
                        var href = that.props.markers[i].image;

                        if (typeof href === 'string') {
                            fetch(href).then(response => response.blob())
                                    .then(blob => { // <--- `this.result` contains a base64 data URI
                                        var reader = new FileReader();
                                        reader.onload = function () {
                                            loadedImages[href] = {uri: this.result};
                                            done++;
                                            if (j == done)
                                                that.setState({loadingMarkers: false});
                                        };
                                        reader.readAsDataURL(blob);
                                    })
                            j++;
                        }
                    })(i)
                }
            }
            if (j == 0)
                that.setState({loadingMarkers: false});
        }

    }

    getCurrentPosition() {
        if (this.map && this.map.props && this.state.region) //log2(360 * ((screenWidth/256) / region.longitudeDelta)) + 1
        {
            return {lat: this.state.region.latitude, long: this.state.region.longitude, zoom: (Math.log2(360 * (this.state.width / 256) / this.state.region.longitudeDelta)) - 0.5533}
        } else
            return {}
    }

    takeSnapshot(options) {
        if (this.map)
            return this.map.takeSnapshot(options)
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

    render() {

        //console.log("render mapView. this.state.forceMapRefresh", this.state.forceMapRefresh);
        
        var initialRegion = {};
        var props = Object.assign({}, this.props);
        if (props.autocenter) {
            //debugger;
            initialRegion = {
                latitude: 41,
                longitude: 2,
                zoom: 16
            };
            if (props.markers && props.markers.length) {
                var minlat = 200, maxlat = -200, minlong = 200, maxlong = -200;
                for (var i = 0; i < props.markers.length; i++) {
                    if (parseFloat(props.markers[i].lat) < minlat)
                        minlat = parseFloat(props.markers[i].lat);
                    if (parseFloat(props.markers[i].long) < minlong)
                        minlong = parseFloat(props.markers[i].long);
                    if (parseFloat(props.markers[i].lat) > maxlat)
                        maxlat = parseFloat(props.markers[i].lat);
                    if (parseFloat(props.markers[i].long) > maxlong)
                        maxlong = parseFloat(props.markers[i].long);
                }
                var centerlatitude = (minlat + maxlat) / 2, centerlongitude = (minlong + maxlong) / 2, centerzoom = this.getBoundsZoomLevel({ne: {lat: maxlat, lng: maxlong}, sw: {lat: minlat, lng: minlong}}, {height: this.state.width, width: this.state.height});
                initialRegion = {
                    latitude: centerlatitude,
                    longitude: centerlongitude,
                    zoom: centerzoom
                }
            }
        } else {
            initialRegion = {
                latitude: this.props.initialRegion.latitude,
                longitude: this.props.initialRegion.longitude,
                zoom: this.props.initialRegion.zoom
            }
            props.initialRegion = initialRegion;
        }
        if (initialRegion.zoom) {
            initialRegion.latitudeDelta = initialRegion.longitudeDelta = Math.exp(Math.log(360) - (initialRegion.zoom * Math.LN2));
        } else {
            initialRegion.latitudeDelta = initialRegion.longitudeDelta = 0.0021;
        }
        if (!this.state.region.latitude || this.state.defaultRegionChanged) {
            props.region = initialRegion;
            this.state.defaultRegionChanged = false;
        }

        props.ref = (map) => {
            this.map = map;/*if(typeof this.props.ref ==='function'){this.props.ref(map)}*/
        };
        
        //key={this.state.forceMapRefresh}
        
        return (
                <MapView  {...props} onRegionChangeComplete={(region) => {
                        this.state.region = region;
                    }} onLayout={(event) => {
                        var {x, y, width, height} = event.nativeEvent.layout;
                        this.setState({width: width, height: height})
                    }}
                    
                >
                    {this.renderMarkers()}
                </MapView >
                );
    }

    /*
     saveMarker(i){
     return (m)=>{this._markers[i]=m;}
     }
     */

    renderMarkers() {
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
        const {markers} = this.props;
        var that = this;
        var indents = [];
        if (markers && markers.length && !this.state.loadingMarkers) {
            for (var i = 0; i < markers.length; i++) {
                //console.log("renderMarkers maker:", markers[i]);
                indents.push(<Marker
                    coordinate={{latitude: parseFloat(markers[i].lat), longitude: parseFloat(markers[i].long)}}
                    title={ markers[i].title ? markers[i].title : null}
                    description={markers[i].description ? markers[i].description : null}
                    pinColor={markers[i].color}
                    onPress={markers[i].onPress}
                    reloadMarkers={this.state.reloadMarkers}
                    key={i + "m"}
                    >
                    {this.renderMarkerImage(markers[i], i)}
                </Marker >)
            }
        }
        return indents;
    }

    renderMarkerImage(marker, i) {
        const {renderMarker} = this.props;
        var that = this;
        if (marker.image) {
            var image = null;
            if (typeof marker.image !== 'string')
                image = marker.image
            else
                image = loadedImages[marker.image];
            //console.log(image);
            if (renderMarker) {
                return renderMarker(Object.assign(marker, {image: image}), i)
            } else {
                return(
                        <View style={{backgroundColor: (marker.borderColor ? marker.borderColor : "black"), borderRadius: 45, padding: 4, width: 60, height: 60}} key={i + "v"}>
                            <Image resizeMode={"cover"} source={image} style={{borderRadius: 45, width: "100%", height: "100%"}} key={i + "i"} />
                        </View>
                        )
            }
        } else
            return renderMarker(marker, i);
    }

}

export default MapView2;
