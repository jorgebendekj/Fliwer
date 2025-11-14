'use strict';

import React, { Component } from 'react';
import {View, Text, PanResponder, Image, Animated, Platform} from 'react-native';

import Slider from "../../widgets/slider/slider.js";

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

var gradient = require('../../assets/img/barGradient.png');
var fliwerMarker = require('../../assets/img/fliwerMarker.png');
var plusSignImage=require('../../assets/img/plus-little.png');
var minusSignImage=require('../../assets/img/minus-little.png');

import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'


class FliwerSlideBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const {style, value, max, min, onChange, disabled, step, hideTitle} = this.props;

        return (
                <View style={[this.style.slidebar, style]}>
                
                    {!hideTitle?
                        <View style={[{}]}>
                            <Text style={[this.style.titleSlider]}>Ahorra con Fliwer</Text>
                        </View> :
                        <View style={[{}]}>
                            <Text style={[this.style.titleSlider]}>&nbsp;</Text>
                        </View>
                    }
                    
                    <FliwerCalmButton 
                        onPress={()=>{
                            if (value > 20)
                                onChange(value - 2);
                        }}
                        onMouseEnter={this.hoverIn('signIcon')} 
                        onMouseLeave={this.hoverOut('signIcon')}
                        containerStyle={[this.style.signButton, {
                            position: "absolute",
                            top: 30,
                            left: 0,
                            zIndex: 1
                        }]} 
                        imageData={{
                            style: this.style.signIcon,
                            source: plusSignImage,
                            resizeMode: "contain"
                        }} 
                    />
                    <FliwerCalmButton 
                        onPress={()=>{
                            if (value < 80)
                                onChange(value + 2);
                        }}
                        onMouseEnter={this.hoverIn('signIcon2')} 
                        onMouseLeave={this.hoverOut('signIcon2')}
                        containerStyle={[this.style.signButton, {
                            position: "absolute",
                            top: 30,
                            right: 0,
                            zIndex: 1
                        }]} 
                        imageData={{
                            style: this.style.signIcon2,
                            source: minusSignImage,
                            resizeMode: "contain"
                        }} 
                    />                       
                
                    <View style={[this.style.gradientCostEstimate]}></View>
                    <View style={[this.style.finalLine]}></View>
                    <View style={[this.style.initialLine]}></View>
                    <View style={[this.style.circle0]}><Text style={[this.style.percentText, {width: 40}]}>100%</Text></View>
                    <View style={[this.style.circle100, {left: "20%"}]}><Text style={[this.style.percentText]}>80%</Text></View>
                    
                    {false?<View style={[this.style.stepMark, {left: "22%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "24%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "26%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "28%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "30%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "32%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "34%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "36%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "38%"}]}></View>:null}

                    <View style={[this.style.circle100, {left: "40%"}]}><Text style={[this.style.percentText]}>60%</Text></View>
                    
                    {false?<View style={[this.style.stepMark, {left: "42%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "44%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "46%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "48%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "50%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "52%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "54%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "56%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "58%"}]}></View>:null}
                    
                    <View style={[this.style.circle100, {left: "60%"}]}><Text style={[this.style.percentText]}>40%</Text></View>
                    
                    {false?<View style={[this.style.stepMark, {left: "62%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "64%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "66%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "68%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "70%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "72%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "74%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "76%"}]}></View>:null}
                    {false?<View style={[this.style.stepMark, {left: "78%"}]}></View>:null}
                    
                    <View style={[this.style.circle100, {left: "80%"}]}><Text style={[this.style.percentText]}>20%</Text></View>
                    <View style={[this.style.circle100]}><Text style={[this.style.percentText]}>0%</Text></View>
                
                    <Slider
                        disabled={disabled}
                        value={value}
                        onValueChange={(value) => {
                            if (onChange && typeof onChange === "function")
                                onChange(value);
                        }}
                        maximumValue={max}
                        minimumValue={min}
                        step={2}
                        inverted={true}
                        style={this.style.bar}
                        trackStyle={{opacity: 0}}
                        thumbStyle={{height: 123, width: "40%", backgroundColor: "rgba(0,0,0,0)"}}
                        thumbContent={() => {
                            return this.props.renderThumb()
                        }}
                        thumbTouchSize={{width: 80, height: 150}}
                    />                                  
                </View>
                );
    }

    renderThumb() {
        return (
                <View style={this.style.pointer}>
                    <Image draggable={false} source={fliwerMarker} resizeMode={"cover"} style={this.style.iconSlide} />
                    <View style={[this.style.percent, {userSelect: "none"}]}><Text style={this.style.percentText}>{this.state.value + "%"}</Text></View>
                </View>
                )
    }
};

var style = {
    titleSlider: {
        fontFamily: FliwerColors.fonts.title,
        fontSize: 17,

    },
    initialLine: {
        height: 4,
        backgroundColor: "rgb(190,190,190)",
        width: "20%",
        left: "80%",
        borderRadius: 8,
        top: 59.5,

    },
    finalLine: {
        height: 4,
        backgroundColor: "rgb(190,190,190)",
        left: 0,
        width: "20%",
        borderRadius: 8,
        top: 63.5,

    },
    pointer: {
        height: 101,
        alignItems: "center"
    },
    iconSlide: {
        width: 53,
        height: 73

    },
    percent: {
        //height:13,
        //width:13,
    },
    percentText: {
        position: "absolute",
        left: -5,
        top: 10,
        width: 36
    },
    stepMark: {
        position: "absolute",
        height: 10,
        width: 1,
        backgroundColor: FliwerColors.complementary.blue,
        top: 81,
        right: 0
    },
    circle100: {
        position: "absolute",
        height: 8,
        width: 8,
        borderRadius: 7,
        borderWidth: 2,
        backgroundColor: "black",
        top: 82,
        right: 0,
        marginLeft: -3,
    },
    circle0: {
        position: "absolute",
        height: 8,
        width: 8,
        borderRadius: 7,
        borderWidth: 2,
        backgroundColor: "black",
        top: 82,
        marginLeft: -4,
        left: 4
    },
    gradientCostEstimate: {
        position: "absolute",
        width: "100%",
        height: 4,
        top: 84,
        borderRadius: 8,
        //marginTop:22,
        backgroundColor: FliwerColors.complementary.blue
    },
    slidebar: {
        height: 5
    },
    gradient: {
        position: "absolute",
        width: "100%",
        height: 14,
        borderRadius: 8,
        marginTop: 22,
        borderColor: 'red',
        borderWidth: 1
    },
    bar: {
        width: "100%",
        height: 89,
        borderRadius: 0
    },

    circle: {
        height: 13,
        width: 13,
        borderRadius: 7,
        borderWidth: 2
    },
    line: {
        height: 32,
        width: 2,
        backgroundColor: "black"
    },
    signButtonContainer:{
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    signButton:{
        padding: 5
    },
    signIcon:{
        width: 30,
        height: 30
    },
    signIcon2:{
        width: 30,
        height: 30
    },
    ":hover":{
        signIcon:{
//          filter:"opacity(50%)",
//          backgroundColor:FliwerColors.primary.green
        },
        signIcon2:{
//          filter:"opacity(50%)",
//          backgroundColor:FliwerColors.primary.green
        }
    }
};


//Connect everything
export default mediaConnect(style, FliwerSlideBar);
