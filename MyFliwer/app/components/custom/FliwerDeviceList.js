'use strict';

import React, { Component } from 'react';
import {View,ScrollView,Text,TextInput,Platform,Image} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/EvilIcons';

import deviceLinkWifi from '../../assets/img/device_linkwifi2.png'
import sensorIcon from '../../assets/img/6_Sensor-planted.png'

class FliwerSearchInput extends Component {
  constructor(props) {
      super(props);
      this.state={
      }
  }

  render() {
    var {style,childDevices,renderRow,n,rowHeight}=this.props;
    var that=this;
    var card=[];

    for (var i = 0; i<n || i<childDevices.length;i++)
      {
        card.push(
          <View style={[this.style.globalContainer,style,i==0?this.style.firstContainerTopRadius:null,(n>childDevices.length?i==(n-1):i==(childDevices.length-1))?this.style.LastConatinerBottomRadius:null,rowHeight?{height:(i==0?rowHeight+2:rowHeight)}:{}]}>
            <View style={[this.style.rowContainer,i==0?this.style.firstRowTopRadius:null,(n>childDevices.length?i==(n-1):i==(childDevices.length-1))?this.style.lastRowBottomRadius:null,rowHeight?{height:(i==0?rowHeight:rowHeight-1)}:{}]}>
              {(i<childDevices.length?renderRow(childDevices[i],i,n>childDevices.length?n:childDevices.length):[])}
            </View>
          </View>
        )
      }
      
    return (
      <ScrollView style={[this.style.container,style]} contentContainerStyle={this.style.contentContainer} >
        {card}
      </ScrollView>
    )
  }

 };

var style ={
  container:{
    height:186,
    width:"100%",
    paddingRight: 1
  },
  contentContainer:{
  },
  firstContainerTopRadius:{
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    height:38,
  },
  LastConatinerBottomRadius:{
    borderBottomRightRadius:10,
    borderBottomLeftRadius:10
  },
  firstRowTopRadius:{
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    marginTop:1
  },
  lastRowBottomRadius:{
    borderBottomRightRadius:10,
    borderBottomLeftRadius:10
  },
  rowContainer:{
    height:36,
    width:"100%",
    backgroundColor:FliwerColors.secondary.white,
    display:"flex",
    flexDirection:"row",
  },
  globalContainer:{
    height:37,
    width:"100%",
    maxWidth:300,
    paddingRight: 1,
    paddingLeft:1,
    backgroundColor:FliwerColors.primary.green,
  },
};

//Connect everything
export default mediaConnect(style,FliwerSearchInput);
