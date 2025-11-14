import WifiManager from "react-native-wifi-reborn";
//import NetInfo from "@react-native-community/netinfo";
import ReactNativeBlobUtil from 'react-native-blob-util'
const {config, fs} = ReactNativeBlobUtil;
import {toast} from '../../widgets/toast/toast'

class WifiConnection {

    requestLocationPermission() {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }

    reScan() {
        return new Promise(function (resolve, reject) {
            resolve();
        });
    }

    isEnabled() {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    }

    setEnabled(en) {

    }

    getSSID() {
      return new Promise(function (resolveSSID, rejectSSID) {
          var tries=0;

          var ssid=(tries)=>{

            var fallbackError=(error)=>{
                if(tries<10){
                    toast.error("Couldn't get ssid, retrying: "+(tries+1)+". "+JSON.stringify(error));
                    setTimeout(()=>{
                        ssid(tries+1);
                    },2000)
                }else rejectSSID(error/*"Can\'t retrieve SSID"*/);
            }
/*
            //if(tries%2==0){
                WifiManager.getCurrentWifiSSID().then(
                        ssid => {
                            resolveSSID(ssid);
                        },
                (error) => {
                    fallbackError(error);
                });
            //}else{
                NetInfo.configure({
                      shouldFetchWiFiSSID: true
                });

                NetInfo.fetch().then(state => {
                  console.log("Connection type", state.type);
                  console.log("Is connected?", state.isConnected);
                  if(state.type=="wifi"){
                      if(!state.details) fallbackError("No details object");
                      else if(state.details.ssid)resolveSSID(state.details.ssid)
                      else fallbackError("No ssid in details");
                  }else fallbackError("Connection is not wifi");
              },(error)=>{
                  fallbackError(error);
              });
            //}

*/
              WifiManager.getCurrentWifiSSID().then(
                      ssid => {
                          resolveSSID(ssid);
                      },
              (error) => {
                  //fallbackError(error);
                  resolveSSID("");
              }
              );


          }
          ssid(0)
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
              WifiManager.disconnectFromSSID(ssid).then((isRemoved) => {
                  console.log("resolve disconnect", isRemoved);
                  that.getSSID().then((ssid2) => {
                      if(ssid==ssid2)rejectDisconnect({id: 4, msg: "Still connected to "+ssid});
                      else resolveDisconnect(ssid);
                  },
                  (error)=>{
                      rejectDisconnect({id: 5, msg: error});
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
              resolve(info.text());
          }, (error) => {
              reject(error);
          });

        });
    }

}

export var wifiConnection = new WifiConnection();
