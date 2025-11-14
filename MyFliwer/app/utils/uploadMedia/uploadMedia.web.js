'use strict';
import React, { Component } from 'react';
import {FileDrop} from 'react-file-drop';

var getBase64 = (file) =>{
  return new Promise((resolve,reject)=>{
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        resolve(reader.result)
    };
    reader.onerror = (error) => {
        console.log('Error: ', error);
        reject(error)
    };
  })
}

class _ImageUploader {



    launchImageLibrary(options, callback) {
        var that = this;
        var response = {didCancel: false, error: false, invalidFile: false, customButton: false};
        if (options.fileInput) {
            options.fileInput.onchange = function (e) {
              var file = e.target.files[0];
              var asset={};
              asset.uri = URL.createObjectURL(file);
              asset.type =file.type;
              asset.fileName =file.name;
              response.assets=[asset];
                if(options.mediaType=='photo'){
                  var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
                  if (ValidImageTypes.indexOf(e.target.files[0].type) != -1) {
                      getBase64(e.target.files[0]).then((file) => {
                          response.base64 = file;
                          if (callback)
                              callback(response);
                      });
                  } else {
                      response.error = true;
                      response.invalidFile = true;
                      if (callback)
                          callback(response);
                  }
                }else{
                  if (callback)
                      callback(response);
                }

            }
            options.fileInput.click()
        } else {
            response.error = true;
            if (callback)
                callback(response);
        }
    }

    launchCamera(){
      return new Promise((resolve,reject)=>{reject();})
    }

    hasCamera(){
      return false;
    }

}

var MediaPicker = new _ImageUploader();
var launchCamera =  MediaPicker.launchCamera;
var hasCamera = MediaPicker.hasCamera ;
var launchImageLibrary = MediaPicker.launchImageLibrary;

export { launchCamera, hasCamera, launchImageLibrary, FileDrop, getBase64 };
