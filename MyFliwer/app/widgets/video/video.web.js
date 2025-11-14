'use strict';

import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';

import ReactPlayer from 'react-player';
import { Player, ControlBar, PlayToggle, VolumeMenuButton, CurrentTimeDisplay, TimeDivider, DurationDisplay, ProgressControl, FullscreenToggle } from 'video-react';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import FliwerImage from '../../components/custom/FliwerImage.js'
import Modal from '../../widgets/modal/modal'

import Icon from 'react-native-vector-icons/EvilIcons';

class Video extends Component {

    constructor(props) {
        super(props);
        this.state = {
            play: false,
            displayModal: false,
            video: null,
            loading: true
        }
    }

    componentDidMount() {
        if (this.props.source) {
            if (!this.props.completeURL)
                this.setState({video: 'https://my.fliwer.com/videos/' + this.props.source + '.mp4'})
            else
                this.setState({video: this.props.source})
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.source != this.props.source) {
            if (!this.props.completeURL)
                this.setState({video: 'https://my.fliwer.com/videos/' + this.props.source + '.mp4'})
            else
                this.setState({video: this.props.source})
        }
    }

    render() {
        var {poster, customStyle, resizeMode, backgroundColor, noModal} = this.props;

        var rszM = resizeMode ? resizeMode : "contain";
        var bgc = backgroundColor ? backgroundColor : "black";

        if (noModal)
            return (this.renderNoModal());
        else
            return (
                <TouchableOpacity style={[{height: "100%", width: "100%", backgroundColor: bgc, display: "flex", alignItems: "center", justifyContent: "center"}, customStyle]} onPress={() => {
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
                    {false?<Image style={{height: "100%", width: "100%", position: "absolute"}}  draggable={false}  resizeMode={rszM} source={poster} />:null}
                    {!this.state.loading?<Icon name="play" style={{color: "white", fontSize: 122, zIndex: 1, textShadow: "1px 1px 6px black"}} ></Icon>:null}
                    {this.renderModal()}
                </TouchableOpacity>
            );
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
        };
    }

    openVideo() {
        global.frontLayer.display(true);
        this.setState({displayModal: true, play: true});
    }

    closeVideo() {
        global.frontLayer.display(false);
        this.setState({displayModal: false});
    }

    renderModal() {

        if (this.state.displayModal) {

            global.frontLayer.renderLayer(() => {
                return (
                    <Modal animationType="fade" inStyle={this.style.modalIn} visible={true} onClose={() => {
                            this.closeVideo()
                        }}>

                        {this.renderVideoComponent()}

                        <TouchableOpacity style={{position: "absolute", right: 0, top: 0, height: 40, width: 40, display: "flex", justifyContent: "center", alignItems: "center"}} onPress={() => {
                            this.closeVideo()
                        }}>
                            <Text style={{color: "white", fontSize: 30, textShadow: "1px 1px 6px black"}}>x</Text>
                        </TouchableOpacity>
                    </Modal>
                );
            });
        } else
            return [];
    }

    renderNoModal() {
        return (
            <View style={{height: "100%", width: "100%"}}>
                {this.renderVideoComponent()}
            </View>
        );
    }

    renderVideoComponent() {
        const {noAutoPlay, mute, noModal} = this.props;

        //console.log("this.state.video", this.state.video);
        var isSourceString = (this.state.video && (typeof this.state.video === 'string'));
        var isUrl = (isSourceString && this.state.video.indexOf("/getFile/") === -1);

        if (isUrl)
            return (
                <ReactPlayer
                    className='react-player'
                    playing
                    url={this.state.video}
                    width='100%'
                    height='100%'
                    muted={mute ? true : false}
                    controls={true}
                />
            );
        else
            return (
                <Player
                    ref={player => {
                        this.player = player;
                    }}
                    src={this.state.video}
                    autoPlay={noAutoPlay? false : true}
                    className={noModal? "" : "videoModal"}
                    muted={mute ? true : false}
                    >
                    <ControlBar autoHide={false} disableDefaultControls={true}>
                        <PlayToggle key="play-toggle" order={1} />
                        {(mute ? null : <VolumeMenuButton  key="volume-menu-button" order={4} vertical />)}
                        <CurrentTimeDisplay key="current-time-display" order={5.1} />
                        <TimeDivider key="time-divider" order={5.2} />
                        <DurationDisplay key="duration-display" order={5.3} />
                        <ProgressControl key="progress-control" order={6} />
                        <FullscreenToggle key="fullscreen-toggle" order={8} />
                    </ControlBar>
                </Player>
            );
    }

};

var style = {
    modalIn: {
        backgroundColor: "rgba(0,0,0,0.7)",
        borderRadius: 4,
        width: "80%",
        height: "60%",
        maxWidth: 720,
        maxHeight: 480
    }
}

//Connect everything
export default mediaConnect(style, Video);
