'use strict';

import React, { Component, PureComponent } from 'react';
import {View, Text, Platform, Image, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import moment from 'moment';
import manualIcon  from '../../assets/img/5_riego_manual.png'
import automaticIcon  from '../../assets/img/5_riego_auto.png'

class FliwerBubble extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log("shouldComponentUpdate",this.props.key2,!(JSON.stringify(this.props)==JSON.stringify(nextProps) && JSON.stringify(this.state)==JSON.stringify(nextState)),this.props,nextProps)
        return !(JSON.stringify(this.props) == JSON.stringify(nextProps) && JSON.stringify(this.state) == JSON.stringify(nextState))
    }

    render() {
        var {idZone, containerStyle, containerINStyle, textStyle, triangleStyle, time, bubbleTextTable, icon, rightSide, isToday, isPast} = this.props;
        var date = new Date(time * 1000);
        //console.log("render bubble", this.props.keys);
        return (
                <View style={[this.style.bubbleContainer, (!isPast? {} : {opacity: 0.4})]} >
                    <View  style={[this.style.triangle, rightSide ? this.style.rotateTriangle : {}, triangleStyle]}>
                    </View>
                    <View ref={(v) => {
                            this._container = v;
                        }} style={[this.style.bubbleContainerIN, rightSide ? this.style.rightSideStyle : {}, containerINStyle]}
                        >
                        {this.renderImage()}
                        <View style={this.style.centerContainer}>
                            <View style={[this.style.centerContainerIn, rightSide ? {flexDirection: "row-reverse", alignSelf: "flex-end"} : {}, !icon ? {marginLeft: 10} : {}]}>
                                <View style={[this.style.centerTextConatiner]}>
                                    {this.renderTextTable(bubbleTextTable)}
                                </View>
                            </View>
                            <View style={[this.style.timeContainer, rightSide ? {paddingLeft: 8, paddingRight: 8, alignSelf: "flex-start"} : {}]}>
                                <Text style={[this.style.timeText, textStyle]}>{moment(date).format("HH:mm") }</Text>
                            </View>
                        </View>
                        {this.renderButtonPlusPanelInfo()}
                    </View>
                </View>
                )
    }

    renderImage()
    {
        var {idZone, containerStyle, textStyle, iconStyle, icon, bubbleTextTable, rightSide} = this.props;
        var indents = []
        if (icon)
            indents.push(
                    <View style={this.style.leftContainer}>
                        <View style={this.style.imageConatiner}>
                            <Image style={[this.style.image, iconStyle]} draggable={false} source={icon} resizeMode={"contain"} />
                        </View>
                    </View>
                    )
        return indents;
    }

    renderTextTable(bubbleTextTable)
    {
        var {rightSide, textStyle} = this.props;
        var indents = []
        if (!bubbleTextTable)
            bubbleTextTable = []
        //transform string to array
        else if (typeof bubbleTextTable === "string")
            bubbleTextTable = [bubbleTextTable]

        if (bubbleTextTable.length > 0)
        {
            for (var index in bubbleTextTable)
                if (bubbleTextTable[index])
                    indents.push(
                            <View style={this.style.textTableStyle}>
                                <Text style={[this.style.bubbleText, rightSide ? {textAlign: 'right', alignSelf: "flex-end"} : {}, textStyle]}> {bubbleTextTable[index]} </Text>
                            </View>)
        }
        return indents;
    }

    renderButtonPlusPanelInfo()
    {
        var {idZone, containerStyle, style, textStyle, textMoreStyle, showMoreStyle, showMore, bubbleTextTable, onButtonPress, rightSide} = this.props;
        if (showMore) {
            return (
                    <View style={this.style.rightContainer} >
                        <TouchableOpacity disabled={false} style={[this.style.touchableStyle, rightSide ? this.style.touchableRightStyle : {}, showMoreStyle]}  onPress={() => {
                            if (this.props.modalFunc)
                                this.props.modalFunc()
                        }}  >
                            <Text style={[this.style.plusText, textMoreStyle]}>+</Text>
                        </TouchableOpacity>
                    </View>
                    )
        }
    }
};


var style = {
    bubbleContainer: {
        flexDirection: 'column',
        marginLeft: 10
    },
    bubbleContainerIN: {
        backgroundColor: FliwerColors.secondary.lightGreen,
        borderBottomLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        flexDirection: 'row',
        minHeight: 47,
        maxWidth: 375,
        marginBottom: 10,
        marginTop: 10,
        display: "flex",
        width: "80%",
        minWidth: 245,
    },
    bubbleText: {
        //fontFamily: FliwerColors.fonts.light
        display: "flex"
    },
    leftContainer: {
        alignSelf: "center"
    },
    centerContainer: {
        flexGrow: 1,
        flexShrink: 1,
        alignSelf: "center",
        flexDirection: "column"
    },
    centerContainerIn: {
        flexGrow: 1,
        flexShrink: 1,
        flexDirection: "row",
        alignSelf: "flex-start",
        marginTop: 13,
        marginBottom: 13,
    },
    centerTextContainer: {
        flexDirection: "column",
    },
    centerTextConatiner: {
        flexGrow: 1,
        flexShrink: 1,
        justifyContent: "center"
    },
    rightContainer: {
    },
    touchableStyle: {
        backgroundColor: FliwerColors.primary.green,
        width: 30,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1
    },
    touchableRightStyle: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    imageConatiner: {
        marginLeft: 10,
        marginRight: 10
    },
    image: {
        height: 51,
        width: 51,
        marginBottom: 5,
        marginTop: 5
    },
    plusText: {
        color: "white",
        fontSize: 20,
        fontFamily: FliwerColors.fonts.title,
    },
    timeText: {
        fontSize: 10,
        fontFamily: FliwerColors.fonts.light,
    },
    timeContainer: {
        position: "absolute",
        bottom: 0,
        alignItems: "flex-end",
        alignSelf: "flex-end",
        paddingRight: 12,
    },
    triangle: {
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderTopWidth: 8,
        borderRightColor: 'transparent',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: FliwerColors.secondary.lightGreen,
        position: "absolute",
        left: -10,
        top: 10,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 0,
    },
    rotateTriangle: {
        transform: [
            {rotateY: '180deg'}
        ],
        left: null,
        right: -10,
        borderTopColor: FliwerColors.secondary.gray
    },
    rightSideStyle: {
        backgroundColor: FliwerColors.secondary.gray,
        alignSelf: "flex-end",
        flexDirection: 'row-reverse',
        paddingLeft: 0,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 0,
    }
};


export default mediaConnect(style, FliwerBubble);
