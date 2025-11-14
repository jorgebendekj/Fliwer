'use strict';

import React, { Component } from 'react';
import {View,Text,TextInput,Platform,Image} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/EvilIcons';
var devicePlugged=require('../../assets/img/2-Plug-verd.png');
class FliwerSearchInput extends Component {
  constructor(props) {
      super(props);
      this.state={
        closeIcon:false
      }
  }

  render() {
    //
    var {style,leftText,rightText,leftTextStyle,borderColor,rightTextStyle,leftContainerStyle,rightContainerStyle,buttonStyle,customHeight,customHeightLeftContainer,customHeightRightContainer,imageLeft,
        centerTextStyle,centerContainerStyle,centerText}=this.props;
    var that=this;
    
    return (
      <View style={[this.style.buttonContainer,style,buttonStyle,customHeight,borderColor?{backgroundColor:borderColor}:{}]}>
        <View style={[this.style.leftContainer,leftContainerStyle,customHeightLeftContainer]}>
          {imageLeft?imageLeft:<Text style={[this.style.leftText,leftTextStyle]} ellipsizeMode='tail' numberOfLines={1}>{leftText}</Text>}
        </View>
        <View style={centerText?{display:"flex",flexDirection:"row",flexGrow:1}:[this.style.rightContainer,rightContainerStyle,customHeightRightContainer]}>
          {
            centerText?[(
              <View style={[this.style.centerContainer,centerContainerStyle,customHeightRightContainer]}>
                <Text style={[this.style.rightText,centerTextStyle]} ellipsizeMode='tail' numberOfLines={1}>{centerText}</Text>
              </View>),(
              <View style={[this.style.rightContainer,rightContainerStyle,customHeightRightContainer]}>
                <Text style={[this.style.rightText,rightTextStyle]} ellipsizeMode='tail' numberOfLines={1}>{rightText}</Text>
              </View>)
            ]:(
              <Text style={[this.style.rightText,rightTextStyle]} ellipsizeMode='tail' numberOfLines={1}>{rightText}</Text>
            )
          }
        </View>
      </View>
    )
  }

 };


var style ={
  buttonContainer:{
    height:37,
    width:"100%",
    maxWidth:250,
    paddingRight:1,
    marginBottom:5,
    borderRadius:50,
    backgroundColor:FliwerColors.primary.green,
    display:"flex",
    flexDirection:"row"
  },
  leftContainer:{
    width:40,
    marginLeft:1,
    marginTop:1,
    borderBottomLeftRadius:50,
    borderTopLeftRadius:50,
    height:35,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center',
    backgroundColor:FliwerColors.primary.green,
  },
  leftText:{
    color: FliwerColors.secondary.white,
    width:"100%",
    fontSize: 15,
    textAlign:"center",
    paddingLeft:5,
    fontFamily:FliwerColors.fonts.light
  },
  centerContainer:{
    marginLeft:1,
    marginTop:1,
    flexGrow:1,
    height:35,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center',
    backgroundColor:"white",
    flexShrink:1,
    paddingRight:4,
    paddingLeft:4
  },
  rightContainer:{
    marginLeft:1,
    marginTop:1,
    borderBottomRightRadius:50,
    borderTopRightRadius:50,
    flexGrow:1,
    height:35,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center',
    backgroundColor:"white",
    flexShrink:1,
    paddingRight:4,
    paddingLeft:4
  },
  rightText:{
    fontSize: 15,
    textAlign:"center",
    paddingRight:5,
    fontFamily:FliwerColors.fonts.light
  }
};

/*
if(Platform.OS==='web'){
  style.rightText.height=15;
  style.leftText.height=15;
}
*/

//Connect everything
export default mediaConnect(style,FliwerSearchInput);
