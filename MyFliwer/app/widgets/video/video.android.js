'use strict';

import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';

//import YouTube from 'react-native-youtube';
import { WebView } from 'react-native-webview';
import Video from 'react-native-video-controls';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {Orientation} from '../../utils/orientation/orientation'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import FliwerImage from '../../components/custom/FliwerImage.js'
import Modal from '../../widgets/modal/modal'

import Icon from 'react-native-vector-icons/EvilIcons';
import addButton  from '../../assets/img/add.png'

class Video2 extends Component {

    constructor(props) {
        super(props);
        this.state = {
            play: false,
            displayModal: false,
            loading: true
        }
    }

    render() {
        var {poster, resizeMode, backgroundColor} = this.props;

        var rszM = resizeMode ? resizeMode : "contain";
        var bgc = backgroundColor ? backgroundColor : "black";

        return (
                <TouchableOpacity style={{height: "100%", width: "100%", backgroundColor: bgc, display: "flex", alignItems: "center", justifyContent: "center"}} onPress={() => {
                        this.openVideo()
                    }}>
                    {true?<FliwerImage
                        draggable={false}
                        containerStyle={{height: "100%", width: "100%", position: "absolute"}}
                        style={{height: "100%", width: "100%"}}
                        resizeMode={rszM}
                        source={poster}
                        setLoading={this.setLoading()}
                    />:null}
                    {false?<Image style={{height: "100%", width: "100%", position: "absolute"}}  draggable={false} resizeMode={rszM} source={poster} />:null}
                    {!this.state.loading?<Icon name="play" style={{color: "white", fontSize: 122, zIndex: 1, textShadowRadius: 20,lineHeight:150, textShadowColor: "black"}} ></Icon>:null}
                    {this.renderModal()}
                </TouchableOpacity>
                )
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
        };
    }

    openVideo() {
        var {orientation} = this.props;
        global.frontLayer.display(true);
        this.setState({displayModal: true, play: true});
        if (!orientation || orientation == 'landscape')
            Orientation.lockToLandscape(this);
    }

    closeVideo() {
        global.frontLayer.display(false);
        this.setState({displayModal: false});
        Orientation.unlockAllOrientations(this);
    }

    renderModal() {
        const {poster, mute} = this.props;

        if (this.state.displayModal) {

            var source = this.props.source;
            console.log("source", source);
            var isSourceString = (source && (typeof source === 'string'));
            console.log("isSourceString", isSourceString);
            var isUrl = (isSourceString && source.indexOf("/getFile/") === -1 && FliwerCommonUtils.isValidUrl(source));
            console.log("isUrl", isUrl);
            var isLocalVideo = (isSourceString && source.indexOf("/getFile/") === -1 && !FliwerCommonUtils.isValidUrl(source));
            console.log("isLocalVideo", isLocalVideo);

            if (isSourceString && !isUrl && !isLocalVideo) {
                if (source.indexOf("?") === -1)
                    source += "?";
                else
                    source += "&";
                source += "multipart=1&platformOS=android";
            }else if(isSourceString && !isUrl && isLocalVideo){
              source="../../assets/videos/"+source;
            }
            console.log("source", source);
            console.log("mute", mute);

            // https://medium.com/@surajmdurgad/embedding-youtube-videos-in-a-react-native-app-8c556a18fd76
            //WebView -> mediaPlaybackRequiresUserAction

            global.frontLayer.renderLayer(() => {
                return (
                        <Modal animationType="fade" inStyle={this.style.modalIn} onClose={() => {
                                this.closeVideo()
                            }}>

                            {isUrl?
                                <WebView
                                  allowsFullscreenVideo
                                  allowsInlineMediaPlayback
                                  source={{ uri: source }}
                                />
                            :
                                <Video
                                    ref={player => {
                                        this.player = player;
                                    }}
                                    source={isSourceString? {uri: source} : source}
                                    controls={false}
                                    paused={!this.state.play}
                                    style={{height: "100%", width: "100%", backgroundColor: "black"}}
                                    resizeMode={"contain"}
                                    navigator={ this.props.navigator }
                                    disableFullscreen={true}
                                    onBack ={() => {
                                        this.closeVideo();
                                    }}
                                    muted={mute ? true : false}
                                    disableVolume={mute ? true : false}
                                />
                            }

                        </Modal>
                        )
            })
        } else
            return [];
    }

};

var style = {
    modalIn: {
        backgroundColor: "rgba(0,0,0,0.7)",
        width: "100%",
        height: "100%"
    }
}

//Connect everything
export default mediaConnect(style, Video2);
