'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
/*
import { Camera } from 'react-native-vision-camera';
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
*/
/*
import AwesomeCamera from "react-native-awesome-camera";
import {mediaConnect} from '../../utils/mediaStyleSheet.js';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});
*/

class VideoRecorder extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cameraType : 'back',
            isRecording: false,
            timeout: null,
            start: null,
            countdownNumber: null,
            device: null
        };
/*
        const newCameraPermission = Camera.requestCameraPermission().then(()=>{
          const newMicrophonePermission = Camera.requestMicrophonePermission().then(()=>{

            Camera.getAvailableCameraDevices().then((devices)=>{
              devices = {
                back: devices.find((d) => d.position === "back"),
                front: devices.find((d) => d.position === "front")
              }
              this.setState({device:devices.back});
            },(error)=>{console.log("Error: ",error)})

          },(error)=>{console.log("Error: ",error)});
        },(error)=>{console.log("Error: ",error)})
*/

    }

    render() {
        var that = this;
        var {containerStyle, onTakeVideo} = this.props;

        const dimensions = Dimensions.get('window');
        //var height = dimensions.height - 210;
        var height = dimensions.height //parseInt(dimensions.height * 70 / 100);

        return <AwesomeCamera setIsOpen={(isOpen)=>{debugger;}} getData={(data)=>{debugger;}} />

/*
        if(!this.state.device)return [];
        else
          return (
              <View style={[this.style.container, containerStyle]}>
                  <Camera
                      ref={ref => {
                          this.camera = ref;
                      }}
                      style={[StyleSheet.absoluteFillObject,this.style.preview]}
                      device={this.state.device}
                      isActive={true}
                      frameProcessor={null}
                      format={this.state.device.formats[10]}
                      video={true}
                      audio={true}
                      orientation="portrait"
                  />
                  <View style={{width: "100%", height:"100%", alignContent: "flex-end", justifyContent:"flex-end",marginBottom:10}}>
                      <TouchableOpacity
                      onPress={() => {

                        if (this.state.isRecording) {
                            clearTimeout(this.state.timeout);
                            if (this.camera)
                                this.camera.stopRecording();
                        }
                        else {
                            that.setState({isRecording: true, countdownNumber: 60});

                            this.state.start = Date.now()
                            this.state.timeout = setInterval(() => {
                                if (!this.camera) {
                                    clearTimeout(this.state.timeout);
                                    return;
                                }
                                var diff = parseInt(60 - (((Date.now() - this.state.start) / 1000) | 0));
                                console.log("diff", diff);
                                if (diff < 0) {
                                    clearTimeout(this.state.timeout);
                                    this.camera.stopRecording();
                                }
                                else
                                    this.setState({countdownNumber: diff});
                            }, 1000);
                            this.camera.startRecording({
                              onRecordingFinished: (video) => console.log(video),
                              onRecordingError: (error) => console.error(error),
                            });
                        }

                      }}
                      style={[this.style.recButton, this.state.isRecording? this.style.recButtonStopped : this.style.recButtonRecording]}>
                      <Text style={{fontSize: 14, color: this.state.isRecording? "black" : "white"}}>{this.state.isRecording? this.state.countdownNumber : "REC"}</Text>
                  </TouchableOpacity>
              </View>
              </View>
          );
*/

          /*

          <View style={{width: "100%", marginTop: 30}}>
              <TouchableOpacity
                  onPress={() => {
                      if (this.state.isRecording) {
                          clearTimeout(this.state.timeout);
                          if (this.camera)
                              this.camera.stopRecording();
                      }
                      else {
                          that.setState({isRecording: true, countdownNumber: 60});
                          const cameraConfig = {
                              //maxDuration: 60,
                              quality: RNCamera.Constants.VideoQuality['480p'],
                              //videoBitrate: (500 * 1000) // 500Kbps
                              videoBitrate: (1000 * 1000) // 1Mbps
                          };
                          this.state.start = Date.now()
                          this.state.timeout = setInterval(() => {
                              if (!this.camera) {
                                  clearTimeout(this.state.timeout);
                                  return;
                              }
                              var diff = parseInt(60 - (((Date.now() - this.state.start) / 1000) | 0));
                              console.log("diff", diff);
                              if (diff < 0) {
                                  clearTimeout(this.state.timeout);
                                  this.camera.stopRecording();
                              }
                              else
                                  this.setState({countdownNumber: diff});
                          }, 1000);
                          this.camera.recordAsync(cameraConfig).then(data => {
                              that.setState({isRecording: false});
                              onTakeVideo(data);
                          });
                      }

                  }}
                  style={[this.style.recButton, this.state.isRecording? this.style.recButtonStopped : this.style.recButtonRecording]}>
                  <Text style={{fontSize: 14, color: this.state.isRecording? "black" : "white"}}>{this.state.isRecording? this.state.countdownNumber : "REC"}</Text>
              </TouchableOpacity>
          </View>
          */
    }

};

var style = {
    container: {
        width: "100%",
        height: 400,
        overflow:"hidden",
        backgroundColor:"trnasparent"
    },
    preview: {
        height: "100%",
        width:"100%",
        flex: 1,
    },
    recButton: {
        width: 70,
        height: 70,
        borderRadius: 45,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 1,
        bottom:0
    },
    recButtonStopped: {
        backgroundColor: 'white',
        borderColor: "red"
    },
    recButtonRecording: {
        backgroundColor: 'red',
        borderColor: "silver"
    }
};

//Connect everything
export default mediaConnect(style, VideoRecorder);
