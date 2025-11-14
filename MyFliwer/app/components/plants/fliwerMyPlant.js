'use strict';

import React, { Component } from 'react';
var {View,  Text,  TouchableOpacity,  Image,  Platform} = require('react-native');


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {FliwerColors} from '../../utils/FliwerColors'
import Icon from 'react-native-vector-icons/Feather';

import defaultIcon from '../../assets/img/fliwer_icon1.png'

class FliwerMyPlant extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
      var {id,onPress,onPressRemove}=this.props;
      var plant=this.props.plants[id];
      return (
        <TouchableOpacity style={this.style.container} onPress={()=>{if(typeof onPress==='function')onPress(id)}}  onMouseEnter={this.hoverIn('image')} onMouseLeave={this.hoverOut('image')}>
          <View style={this.style.imageContainer}>
            <Image style={this.style.image} draggable={false} source={(plant.plant_image1_mini?{uri: plant.plant_image1_mini}:defaultIcon)}  resizeMode={(plant.plant_image1_mini?"cover":"contain")}/>
          </View>
          <TouchableOpacity style={this.style.iconContainer} onPress={()=>{if(typeof onPressRemove==='function')onPressRemove(id)}}  onMouseEnter={this.hoverIn('iconContainer')} onMouseLeave={this.hoverOut('iconContainer')}>
            <Icon name={"minus"} backgroundColor="" style={this.style.icon}></Icon>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
      plants: state.fliwerPlantReducer.plants
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
    width:70,
    height:70,
    alignItems: "center",
    margin:10
  },
  imageContainer:{
    width:60,
    height:60,
    marginBottom:5,
    backgroundColor:FliwerColors.primary.green,
    borderRadius:45
  },
  image:{
    width:"80%",
    height:"80%",
    marginLeft:"10%",
    marginTop:"10%",
    borderRadius:80
  },
  iconContainer:{
    width:26,
    height:26,
    borderRadius:45,
    backgroundColor:FliwerColors.primary.gray,
    justifyContent:"center",
    position:"absolute",
    right:0,
    bottom:0
  },
  icon:{
    width:"100%",
    color:FliwerColors.secondary.white,
    fontSize:18,
    textAlign:"center"
  },
  "@media (orientation:landscape)":{
      container:{
        width:110,
        height:100,
        margin:20
      },
      imageContainer:{
        width:100,
        height:100,
        borderRadius:80
      },
      iconContainer:{
        width:35,
        height:35,
        top:65
      },
      icon:{
        fontSize:26,
      },
      "@media (height<=550)":{//optimize space
          container:{
            width:70,
            height:70,
            margin:10
          },
          imageContainer:{
            width:60,
            height:60,
            borderRadius:45
          },
          iconContainer:{
            width:26,
            height:26,
            top: 40
          },
          icon:{
            fontSize:18,
          },
      }
  },
  ":hover":{
    image:{
      filter:"brightness(130%)"
    },
    iconContainer:{
      filter:"brightness(130%)"
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles,FliwerMyPlant));
