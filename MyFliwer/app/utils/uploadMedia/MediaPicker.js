'use strict';
import React, { Component } from 'react';
import { View, Text, Platform} from 'react-native';
import FliwerPickerModal from '../../components/custom/FliwerPickerModal.js'
import {toast} from '../../widgets/toast/toast'
import {launchCamera,hasCamera,launchImageLibrary, FileDrop , getBase64} from './uploadMedia'

//Test
import {DocumentPicker} from '../../utils/uploadFile/uploadFile'


class _MediaPicker {

    openPicker(options) {

      if(!options.mediaType)options.mediaType='photo';
      if(!options.videoQuality)options.videoQuality='high';

      return new Promise((resolve,reject)=>{
        if(Platform.OS==='web'){
          launchImageLibrary(options, (response) => {
            if(response.error)reject(response);
            else resolve(response);
          })
        }else{
          global.frontLayer.renderLayer(() => {
              var indents =[]
              indents.push(<FliwerPickerModal
                  visible={true}
                  nested={options.nested?options.nested:false}
                  onClose={() => {
                    global.frontLayer.display(false);
                    global.frontLayer.renderLayer(() => {});
                    resolve(null);
                  }}
                  onCamera={async ()=> {
                    global.frontLayer.display(false);
                    global.frontLayer.renderLayer(() => {});
                    setTimeout(()=>{
                      launchCamera(options, (response) => {
                        if(options.mediaType=='photo' && response.assets && response.assets[0]){
                          getBase64(response.assets[0].uri).then((data)=>{
                            response=response.assets[0];
                            response.base64=data;
                            resolve(response);
                          },(error)=>{
                            console.warn("Can't open camera",error)
                            resolve(response);
                          })
                        }else{
                          console.warn("Can't open camera",response)
                          resolve(response);
                        }
                      });
                    },200);
                  }}
                  onGallery={async ()=> {
                    global.frontLayer.display(false);
                    global.frontLayer.renderLayer(() => {});
                    if(options.documentPicker){

                      setTimeout(()=>{
                        DocumentPicker.pick(options).then((response) => {
                          if(response && response.length>0){
                            var filePicker=response[0];
                            resolve({
                              assets:[
                                {
                                    fileName: filePicker.name,
                                    uri: filePicker.uri,
                                    fileSize: filePicker.size,
                                    type: filePicker.type
                                }
                              ]
                            })
                          }else resolve(response);
                        }, (error) => {
                        });
                      },200);
                    }else{
                      
                      setTimeout(()=>{
                        launchImageLibrary(options, (response) => {
                          if(options.mediaType=='photo' && response.assets && response.assets[0]){
                            getBase64(response.assets[0].uri).then((data)=>{
                              response=response.assets[0];
                              response.base64=data;
                              resolve(response);
                            },(error)=>{
                              resolve(response);
                            })
                          }else{
                            resolve(response);
                          }
                        });
                    },200);
                  }
                    
                  }}
              />);
              return indents;
          });
          global.frontLayer.display(true);
        }
      })
    }



}

var imagePicker= new _MediaPicker();
var _fileDrop = FileDrop;

export { imagePicker as MediaPicker, _fileDrop as FileDrop, getBase64  };
