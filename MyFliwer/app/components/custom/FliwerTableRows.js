'use strict';

import React, { Component } from 'react';
import {View, Text, Platform, Image, ScrollView } from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/EvilIcons';

var deviceLinkWifi = require('../../assets/img/device_linkwifi2.png');
var sensorIcon = require('../../assets/img/6_Sensor-planted.png');

class FliwerTableRows extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        var that = this;
        var headerCard = [];
        var rowsCard = [];
        var totalCard = [];

        headerCard.push(
                <View style={[that.style.globalContainer, that.style.firstContainerTopRadius]}>
                    <View style={[that.style.rowContainer, that.style.firstRowTopRadius]}>
                        {(that.props.renderRowTop())}
                    </View>
                </View>
                )

        var info = this.props.information;

        for (var i = 0; i < info.length; i++)
        {
            var that = this;
            (function (i) {
                rowsCard.push(
                        <View style={[that.style.globalContainer]}>
                            <View style={[that.style.rowContainer]}>
                                {(that.props.renderRow(i))}
                            </View>
                        </View>
                        );
            })(i);
        }
        
        // Total
        totalCard.push(
                <View style={[that.style.globalContainer, that.style.LastConatinerBottomRadius]}>
                    <View style={[that.style.rowContainer, that.style.lastRowBottomRadius]}>
                        {(that.props.renderRowTotal())}
                    </View>
                </View>
                );        

        return (
                <View style={this.style.container}>
                    {headerCard}
                    <ScrollView scrollEventThrottle={1000} style={this.style.scrollStyle} contentContainerStyle={this.style.contentViewContainer} showsHorizontalScrollIndicator={true} 
                        ref={(s) => {
                            this._scrollView = s;
                        }}>
                        {rowsCard}
                        {totalCard}
                    </ScrollView>
                </View>
                )
    }

    moveScrollToBottom()
    {
        this._scrollView.scrollToEnd({animated: false});
        if (Platform.OS == 'android' || Platform.OS == 'ios') {
            this._scrollView.scrollToEnd({animated: false});
        }

    }
};


var style = {
    container: {
        //height:"100%",
        //backgroundColor:"pink",
        flexShrink: 1,

    },
    scrollStyle: {
        //height:"100%",
        //flexGrow:1,
        //height:320

    },
    contentViewContainer: {

    },

    firstContainerTopRadius: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        height: 38
    },
    LastConatinerBottomRadius: {
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    firstRowTopRadius: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginTop: 1
    },
    lastRowBottomRadius: {
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    rowContainer: {
        height: 36,
        width: "100%",
        backgroundColor: FliwerColors.secondary.white,
        //display:"flex",
        flexDirection: "row",
    },
    globalContainer: {
        height: 37,
        width: "100%",
        //maxWidth:300,
        paddingRight: 1,
        paddingLeft: 1,
        backgroundColor: FliwerColors.secondary.gray
    }

};

//Connect everything
export default mediaConnect(style, FliwerTableRows);
