'use strict';

import React, { Component } from 'react';
var {View,  Text,  TouchableOpacity,  Image,  Platform} = require('react-native');


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {FliwerColors} from '../../utils/FliwerColors'

class FliwerPlantCategory extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
      var {id,onPress,textStyle}=this.props;

      return (
        <TouchableOpacity style={this.style.container} onPress={()=>{onPress(id)}}>
          <View style={this.style.imageContainer}>
            <Image style={this.style.image} draggable={false} source={{uri: this.props.categories[id].img+"?v=1"}}  resizeMode={"contain"}/>
          </View>
          <Text style={[this.style.text, textStyle]} numberOfLines={2} ellipsizeMode={'tail'}>{this.props.categories[id].name}</Text>
        </TouchableOpacity>
      );
    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        categories: state.fliwerPlantReducer.categories
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
      }
    }
}

//Connect everything

var styles ={
  container:{
    width:80,
    alignItems: "center",
    margin:10
  },
  imageContainer:{
    width:"100%",
    height:80,
    marginBottom:5,
    backgroundColor:FliwerColors.secondary.gray,
    borderRadius:45
  },
  image:{
    width:"100%",
    height:"100%",/*
    marginLeft:"20%",
    marginTop:"20%"*/
  },
  text:{
    textAlign:"center",
    fontFamily:FliwerColors.fonts.light,
    fontSize:12
  },
  "@media (orientation:landscape)":{
      container:{
        width:150,
        margin:20
      },
      imageContainer:{
        height:150,
        borderRadius:80
      },
      text:{
        fontSize:16
      },
      "@media (height<=550)":{//optimize space
          container:{
            width:80,
            margin:10
          },
          imageContainer:{
            height:80,
            borderRadius:45
          },
          text:{
            fontSize:12
          },
      }
  },
  ":hover":{
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles,FliwerPlantCategory));
