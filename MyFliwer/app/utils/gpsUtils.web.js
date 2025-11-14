'use strict';

import {Platform, Image } from 'react-native';
import ImageEditor from "@react-native-community/image-editor";

import { RNFS } from '../utils/fs/fs'
import Geolocation from '@react-native-community/geolocation';
import * as ActionsLocation from '../actions/locationActions.js'; //Import your actions
import * as ActionsLang from '../actions/languageActions.js'; //Import your actions
import {PermissionsAndroid} from '../utils/permissionsAndroid/permissionsAndroid';

import {toast} from '../widgets/toast/toast'

import {store} from '../store.js'; //Import the store

var distanceTable = [5164236800, 2582118400, 1291059200, 645529600, 322764800, 161382400, 80691200, 40345600, 20172800, 10086400, 5043200, 2521600, 1260800, 630400, 315200, 157600, 78800, 39400, 19700, 9850, 4925, 2462.5];

class GPSUtils {

    _getCurrentPositionByAPI() {
        return new Promise((resolve, reject) => {
            fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyBNkLwQPzajoL_5FI_iMiJ7yLP2ja09AXo", {
                headers: {
                    'Origin': 'my.fliwer.com'
                },
                method: "POST"
            }).then((data) => {
                data.json().then((result) => {
                    if (result.location) {
                        if (result.accuracy)
                            result.location.accuracy = result.accuracy;
                        resolve(result.location);
                    }
                    else {
                        reject(result)
                    }
                }, (error) => {
                    resolve(error)
                })
            }, (error) => {
                reject(error);
            })
        });
    }

    _getCurrentPosition() {
        var that = this;
        return new Promise(async (resolve, reject) => {
            
            var tryGetPosition = function (nIntents) {
                console.log("tryGetPosition nIntents", nIntents)
                Geolocation.getCurrentPosition((position) => {
                    resolve({lat: position.coords.latitude, long: position.coords.longitude, zoom: (position.coords.accuracy > 500 ? 15 : 16), accuracy: position.coords.accuracy})
                }, (error) => {
                    console.log("0.1", error.code, error.message);
                    if (error.code == 3 && nIntents < 2) {
                        tryGetPosition(nIntents+1);
                    } else {
                        that._getCurrentPositionByAPI().then((data) => {
                            resolve({lat: data.lat, long: data.lng, zoom: 15, accuracy: data.accuracy});
                        }, (err) => {
                            if (Platform.OS !== 'web') {
                                toast.error(ActionsLang.get('zoneImageSelectorVC_satellite_GPS_error')(store.dispatch, store.getState));
                            }
                            reject({});
                        })
                    }
                }, {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000});
            };
            
            tryGetPosition(0);
            
        });
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (Platform.OS !== 'android') {
                this._getCurrentPosition().then((r) => {
                    resolve(r)
                }, (error) => {
                    reject(error)
                });
            } else {
                PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]
                        ).then((permission) => {
                    if (permission['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED && permission['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED) {
                        this._getCurrentPosition().then((r) => {
                            resolve(r)
                        }, (error) => {
                            reject(error)
                        });
                    } else {
                        console.log('ACCESS_COARSE_LOCATION denied');
                        reject({})
                    }
                }, (err) => {
                    console.log("permissions error:", err);
                    reject(err)
                });
            }
        })
    }

    getGeolocation(text, mapDimensions) {
        return new Promise((resolve, reject) => {

            ActionsLocation.searchGeolocalitzacion(text)(store.dispatch).then((results) => {
                var GLOBE_WIDTH = 256; // a constant in Google's map projection
                var sw = results.bounds.southwest.lat
                var ne = results.bounds.northeast.lat
                var angle = ne - sw;
                if (angle < 0) {
                    angle += 360;
                }

                var sw2 = results.bounds.southwest.lng
                var ne2 = results.bounds.northeast.lng
                var angle2 = ne2 - sw2;
                if (angle2 < 0) {
                    angle2 += 360;
                }

                var zoomWidth, zoomHeight;
                if (mapDimensions) {
                    zoomWidth = Math.floor(Math.log(mapDimensions.width * 360 / angle / GLOBE_WIDTH) / Math.LN2);
                    zoomHeight = Math.floor(Math.log(mapDimensions.height * 360 / angle2 / GLOBE_WIDTH) / Math.LN2);
                }

                //console.log("el zooom es: " + zoomWidth + ", i el zoom2 per lng es: " +zoomHeight+ ", i el mapDim width es " + this.state.mapDim.w+ ", i l'altura es " +this.state.mapDim.h );
                resolve({lat: results.location.lat, long: results.location.lng, zoom: zoomHeight & zoomWidth ? (zoomWidth < zoomHeight ? zoomWidth : zoomHeight) : null});

            }, (error) => {
                toast.error(ActionsLang.get('zoneImageSelectorVC_search_geolocation_error')(store.dispatch, store.getState));
                reject({})
            });
        })

    }

        getSnapshot(map, mapDimensions, rectangleWidth, center) {
        return new Promise((resolve, reject) => {
            console.log("mapDimensions:", mapDimensions);
            console.log("rectangleWidth:", rectangleWidth);
            console.log("center:", center);
    
            const snapshot = map.takeSnapshot({
                format: 'jpg', // image formats: 'png', 'jpg' (default: 'png')
                quality: 0.8, // image quality: 0..1 (only relevant for jpg, default: 1)
                result: 'base64', // result types: 'file', 'base64' (default: 'file')
                //web support
                rectangleWidth: rectangleWidth,
                rectangleCenter: {x: center.x, y: center.y}
            });
    
            snapshot.then((uri) => {
                if (Platform.OS === 'web') {
                    resolve(uri);
                }
            });
        });
    }

    zoomToEarthDiscance(zoom) {
        //No funciona gaire bé, de moment a saco
        return Platform.OS == 'web' ? 17700 : 500
        /*
         if(zoom>21)zoom=21;
         if(zoom<0)zoom=0;
         if(Number.isInteger(parseFloat(zoom)))return distanceTable[zoom];
         else{
         var max=parseInt(zoom);
         var min=max+1;
         console.log("min",min,"max",max)
         min=distanceTable[min];
         max=distanceTable[max];
         console.log("new min",min,"max",max)
         return ((max-min)*parseFloat((zoom%1).toFixed(4))+min)
         }
         */
    }

}

export var
        gpsUtils = new GPSUtils();
