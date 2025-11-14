'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-vision-camera';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class VideoRecorder extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cameraType : 'back',
            isRecording: false,
            timeout: null,
            start: null,
            countdownNumber: null
        };
    }

    render() {
        var that = this;
        var {containerStyle, onTakeVideo} = this.props;

        const dimensions = Dimensions.get('window');
        var height = dimensions.height - 280;

        return (
            <View style={[this.style.container, {height: height}, containerStyle]}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={this.style.preview}

                    autoFocus={RNCamera.Constants.AutoFocus.on}
                    type={this.state.cameraType}
                    flashMode={RNCamera.Constants.FlashMode.auto}
                    ratio="4:3"
                    whiteBalance={RNCamera.Constants.WhiteBalance.auto}
                    captureAudio={true}

                    onGoogleVisionBarcodesDetected={({ barcodes }) => {
                        //console.log("barcode", barcodes);
                    }}
                />
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
                                    codec: RNCamera.Constants.VideoCodec['H264'],
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
            </View>
        );
    }

};

var style = {
    container: {
        width: "100%"
    },
    preview: {
        backgroundColor: 'black',
        height: "100%",
        flex: 1,
        alignItems: 'center'
    },
    recButton: {
        width: 70,
        height: 70,
        borderRadius: 45,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: "center",
        borderWidth: 1
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
