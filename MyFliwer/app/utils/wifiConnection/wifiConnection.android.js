import WifiManager from "react-native-wifi-reborn";
import {PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import ReactNativeBlobUtil from 'react-native-blob-util'
const {config, fs} = ReactNativeBlobUtil;
import {toast} from '../../widgets/toast/toast'

class WifiConnection {

    requestLocationPermission() {
        return new Promise(async function (resolve, reject) {
            const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                  {
                    title: 'Location permission is required for WiFi connections',
                    message:
                      'This app needs location permission as this is required  ' +
                      'to scan for wifi networks.',
                    buttonNegative: 'DENY',
                    buttonPositive: 'ALLOW',
                  },
            );
//            const granted = PermissionsAndroid.request(
//                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
//                    ).then((granted) => {
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('ACCESS_COARSE_LOCATION granted');

//                    Geolocation.getCurrentPosition((position) => {
//                        console.log('location activated');
//                        resolve();
//                    }, (error) => {
//                        console.log('error requestLocationPermission', error);
//                        reject(error);
//                    });

                    Geolocation.getCurrentPosition(
                        (position) => {
                            console.log(position);
                            console.log('location activated');
                            resolve();
                        },
                        (error) => {
                            // See error code charts below.
                            console.log(error.code, error.message);
                            resolve();
                            //reject(error);
                        },
                        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                    );

                } else {
                    console.log('ACCESS_COARSE_LOCATION denied');
                    reject('ACCESS_COARSE_LOCATION denied');
    }
//            }, (err) => {
//                console.log(err);
//                reject(err);
//            });

        });
    }

    reScan() {
        return new Promise(function (resolve, reject) {
            /*WifiManager.reScanAndLoadWifiList((info) => {
                resolve(info);
            }, (err) => {
                console.log(err);
                reject(err);
            });*/
            resolve();
        });
    }

    isEnabled() {
        return new Promise(function (resolve, reject) {
            /*WifiManager.isEnabled((enabled) => {
                resolve(enabled);
            });*/
            // On Android 10, the user has to enable wifi manually.
            resolve(true);
        });
    }

    setEnabled(en) {
        // On Android 10, the user has to enable wifi manually.
        //WifiManager.setEnabled(en);
    }

    getSSID() {
        return new Promise(function (resolveSSID, rejectSSID) {
            WifiManager.getCurrentWifiSSID().then(
                    ssid => {
                        resolveSSID(ssid);
                    },
                    (error) => {
                rejectSSID(error/*"Can\'t retrieve SSID"*/);
            }
            );
        });
    }

    connect(ssid, password, isWep) {
        return new Promise(function (resolveConnect, rejectConnect) {
            if (!password)
                password = '';
            try {
                WifiManager.connectToProtectedSSID(ssid, password, false,false).then(() => {
                    WifiManager.forceWifiUsageWithOptions(true,{noInternet:true}).then(()=>{
                      resolveConnect(ssid);
                    },(error)=>{
                      console.log("forceWifiUsageWithOptions error:",error)
                      resolveConnect(ssid);
                    })

                }, (err) => {
                    rejectConnect(err);
                }).catch(err => {
                    rejectConnect({code:null,message:"Uncaught method connect"});
                });
            } catch (e) {
                rejectConnect(e);
            }
        });
    }

    disconnect(ssid) {
        var that=this;
        return new Promise(function (resolveDisconnect, rejectDisconnect) {
            try {
                toast.error("Disconnecting");
                WifiManager.isRemoveWifiNetwork(ssid).then((isRemoved) => {
                    console.log("resolve disconnect", isRemoved);
                    that.getSSID().then((ssid2) => {if(ssid==ssid2)WifiManager.disconnect();},(error)=>{console.log(error)}).finally(()=>{
                      WifiManager.forceWifiUsageWithOptions(false,{noInternet:false}).then(()=>{
                        resolveDisconnect(ssid);
                      },(error)=>{
                        console.log("forceWifiUsageWithOptions error:",error)
                        resolveDisconnect(ssid);
                      })
                    })

                },
                        (err) => {
                    rejectDisconnect({id: 1, msg: err});
                }
                ).catch(err => {
                    rejectDisconnect({id: 2, msg: err});
                });
            } catch (err) {
                    rejectDisconnect({id: 3, msg: err});
            }
        });
    }

    request(url) {
        return new Promise(function (resolve, reject) {
          config({
            wifiOnly: true,
            timeout: 14000
          }).fetch("GET", url).then((info) => {
              //toast.error("GET url OK");
              resolve(info.text());
          }).catch((errorMessage, statusCode) => {
              //toast.error("GET url error: "+statusCode+":"+errorMessage);
              reject(errorMessage);
          });

        });
    }

}

export var wifiConnection = new WifiConnection();
