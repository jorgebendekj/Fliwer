'use strict';

import React, { Component } from 'react';
import {View,Text,PanResponder,Image,Animated,Platform} from 'react-native';

import Slider from "../../widgets/slider/slider.js";

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'


var gradient= require('../../assets/img/barGradient.png');

class FliwerSlideBar extends Component {
  constructor(props) {
      super(props);
  }

  render() {
    //
    const {style,value,max,min,onChange,disabled,step}=this.props;

    return (
      <View style={[this.style.slidebar,style]}>
        <Image draggable={false} source={gradient} resizeMode={"cover"} style={this.style.gradient} />
        <Slider
          disabled={disabled}
          value={value==null?min:value}
          onValueChange={(value) => {if(onChange && typeof onChange==="function")onChange(value);}}
          maximumValue={max}
          minimumValue={min}
          step={step}
          style={this.style.bar}
          trackStyle={{opacity: 0}}
          thumbStyle={{height:46,width:20,backgroundColor:"rgba(0,0,0,0)"}}
          thumbContent={()=>{return this.renderThumb()}}
        />
      </View>
    )
  }

  renderThumb(){
    return (
      <View style={this.style.pointer}>
        <View style={this.style.circle}></View>
        <View style={this.style.line}></View>
      </View>
    )
  }
};

var style ={
  slidebar:{
    height:55
  },
  gradient:{
    position:"absolute",
    width:"100%",
    height:14,
    borderRadius:8,
    marginTop:22
  },
  bar:{
    width:"100%",
    height:55,
    borderRadius:0,
    paddingBottom:10
  },
  pointer:{
    height:46,
    alignItems:"center"
  },
  circle:{
    height:13,
    width:13,
    borderRadius:7,
    borderWidth:2
  },
  line:{
    height:32,
    width:2,
    backgroundColor:"black"
  }
};


//Connect everything
export default mediaConnect(style,FliwerSlideBar);
