'use strict';

import React, { Component } from 'react';
var {View,ScrollView,RefreshControl} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class CardCollection extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      const { children, style, ownScroll,onRefresh,refreshing,cardView } = this.props
      if(ownScroll || (onRefresh && refreshing!=null)){
        if(onRefresh && refreshing!=null){
          return (
            <ScrollView contentContainerStyle={this.style.cardViewOutContainer} style={[this.style.cardViewOut,style]} refreshControl={
              <RefreshControl onRefresh={onRefresh} refreshing={refreshing}/>}>
              <View style={[this.style.cardView,cardView]}>
                { children }
              </View>
            </ScrollView>
          );
        }else{
          return (
            <ScrollView contentContainerStyle={this.style.cardViewOutContainer} style={[this.style.cardViewOut,style]}>
              <View style={[this.style.cardView,cardView]}>
                { children }
              </View>
            </ScrollView>
          );
        }
      }else{
        return (
          <View style={[this.style.cardViewOut,this.style.cardViewOutContainer,style?style:{}]}>
            <View style={[this.style.cardView,cardView]}>
              { children }
            </View>
          </View>
        );
      }
    }

};

var styles ={
    cardView:{
      marginTop:10
    },
    "@media (orientation:portrait)":{
      cardViewOut:{
        flex:1
      },
      cardViewOutContainer:{
        alignItems: "center"
      },
      cardView:{
        width:"85%",
        maxWidth:350
      }
    },
    "@media (orientation:landscape)":{
      cardViewOut:{
      },
      cardView:{
        width:"100%",
        flexWrap: "wrap",
        justifyContent: "center",
        flexDirection: 'row'
      }
    }
};



export default mediaConnect(styles,CardCollection);
