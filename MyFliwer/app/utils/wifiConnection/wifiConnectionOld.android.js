/**
 * @file Manage ajax's call configurations.
 * @version 0.0.1
 * @todo UserService.getGardensUsers (admin)
 * @todo ExtraService.getMessages (chatBot)
 * @todo ExtraService.sendMessage (chatBot)
 * @todo ExtraService.getAdvertisementCard
 * @module
 */
 import {PermissionsAndroid} from 'react-native';
 import wifi from "react-native-wifi";
 import awifi from "react-native-android-wifi";
 import iot from "react-native-iot-wifi";
 import Geolocation from 'react-native-geolocation-service';
 import {toast} from '../../widgets/toast/toast'


class WifiConnection {

  state={
    wasEnabled:true
  }

  requestLocationPermission() {
    return new Promise (function(resolve,reject){
        const granted = PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        ).then((granted)=>{
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('ACCESS_COARSE_LOCATION granted');

            Geolocation.getCurrentPosition(
                (position) => {
                  console.log('location activated');
                  resolve();
                },
                (error) => {
                  reject(error);
                },
                {}
            );
            resolve();
          } else {
            console.log('ACCESS_COARSE_LOCATION denied');
            reject('ACCESS_COARSE_LOCATION denied');
          }
        },(err)=>{
          console.log(err);
          reject(err);
        });
    });
  }

  isEnabled(){
    return new Promise(function(resolve,reject){
      wifi.isEnabled((enabled) => {
        if(enabled)resolve(enabled);
        else reject({noCompatible:false,isEnabled:enabled});
      });
    })
  }

  setEnabled(en){
    wifi.setEnabled(en);
  }

  getSSID(){
    /*
    return new Promise(function(resolve,reject){
      wifi.getCurrentWifiSSID().then((ssid) => {
        resolve(ssid);
      });
    })
    */
    return new Promise((resolve,reject)=>{
      awifi.getSSID((ssid) => {
        resolve(ssid);
      });
    })
  }

  reScan(){
    return new Promise(function(resolve,reject){
      wifi.reScanAndLoadWifiList((info)=>{
        resolve(info)
      },()=>{
        reject({noCompatible:false,error:error});
      })
    })
  }

  waitSSIDChange(){
    var that=this;
    return new Promise(function(resolve,reject){
      //wifi.forceWifiUsage(false);

      function checkSSIDChange(times){
        console.log("time",times+"!");
        that.getSSID().then((ssid)=>{
          console.log("ssid is",ssid);
          if(times>10 || ssid!='FLIWER'){
            console.log("end check ssid",ssid,times);
            setTimeout(()=>{
              resolve();
            },5000)
          }else{
            console.log("el ssid es: ",ssid ,"desconectant...");
            if(ssid=='FLIWER')wifi.disconnect();
            setTimeout(()=>{
              checkSSIDChange(times+1);
            },1000)
          }
        })
      }
      //that.setEnabled(false);
      //resolve();
      awifi.isRemoveWifiNetwork('FLIWER', (isRemoved) => {
        iot.removeSSID("FLIWER", (error)=>{
          that.reScan().then(()=>{
            console.log("Forgetting the wifi device - FLIWER",isRemoved,error);
            checkSSIDChange(0);
          })
        });
      });
    })
  }

  disconnect(){
    var that=this;
    return new Promise(function(resolve,reject){
      //wifi.forceWifiUsage(false);
      that.getSSID().then((ssid)=>{
        if(ssid=='FLIWER')wifi.disconnect();
        awifi.forceWifiUsage(false);
        if(!that.state.wasEnabled){
          that.setEnabled(false);
          that.state.wasEnabled=true;
        }else{
          that.setEnabled(true);
        }
        resolve();
      })
    })
  }

 connect(ssid){
   var that=this;
   return new Promise(function(resolve,reject){

     new Promise(function(resolve2,reject2){

       that.isEnabled().then(()=>{
         resolve2();
       },(error)=>{
         that.state.wasEnabled=false;
         that.setEnabled(true);
         resolve2();
       })


     }).then(()=>{


       that.requestLocationPermission().then(()=>{

         that.reScan().then(()=>{
           var tryConnect;

           tryConnect=function(ntry){
             console.log("inner conn",ntry)
             awifi.findAndConnect(ssid,'',(error) => {
                 setTimeout(()=>{
                   that.getSSID().then((ssid)=>{
                     console.log('inner conn check',ssid);
                     if(ssid=='FLIWER'){
                       //console.log('going to useWifiRequests')
                       awifi.forceWifiUsage(true);
                      //iot.useWifiRequests(true).then(()=>{
                        //console.log('done useWifiRequests')
                        resolve(ssid);
                      //},(error)=>{
                        //console.log('err useWifiRequests',error)
                        //reject({noCompatible:false,error:error,id:5});
                      //});
                    }else if(ntry<5)tryConnect(ntry+1);
                    else reject({noCompatible:false,error:error,id:4});
                  })
                },5000)
            });
           }
           tryConnect(0)
         },(error)=>{
           reject({noCompatible:false,error:error,id:2});
         });
       },(error)=>{
         eject({noCompatible:false,error:error,id:6});
       })
     },(error)=>{
       reject({noCompatible:false,error:error,id:1});
     });
  })
 }

  request(url){
    return new Promise(function(resolve,reject){
      fetch(url).then((info) => {
        info.text().then(resolve,reject);
      },(error)=>{
        reject({noCompatible:false,error:error});
      });
    })
  }

}

 export var wifiConnection = new WifiConnection();
