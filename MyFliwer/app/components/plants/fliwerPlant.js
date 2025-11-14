'use strict';

import React, { Component } from 'react';
var {View,  Text,  TouchableOpacity,  Image,  Platform} = require('react-native');


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {FliwerColors} from '../../utils/FliwerColors'
import Icon from 'react-native-vector-icons/Feather';

import defaultIcon from '../../assets/img/fliwer_icon1.png'

class FliwerPlant extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {
      var {id,onPress,onPressAdd,textStyle,borderColorStyle, disabled}=this.props;
      var plant=this.props.plants[id];
      return (

        <TouchableOpacity style={[this.style.container]} onPress={()=>{if(typeof onPress==='function')onPress(id)}}  onMouseEnter={this.hoverIn('image')} onMouseLeave={this.hoverOut('image')}>
          <View style={[this.style.imageContainer,borderColorStyle]}>
            <Image style={[this.style.image]} draggable={false} source={(plant.plant_image1_mini?{uri: plant.plant_image1_mini}:defaultIcon)}  resizeMode={(plant.plant_image1_mini?"cover":"contain")}/>
            <View style={disabled?this.style.disabledStyle:{}} ></View>
          </View>
          <TouchableOpacity style={[this.style.iconContainer, disabled?{opacity: 0}:{}]} disabled={disabled} onPress={()=>{if(typeof onPressAdd==='function')onPressAdd(id)}}  onMouseEnter={this.hoverIn('iconContainer')} onMouseLeave={this.hoverOut('iconContainer')}>
            <Icon name={"plus"} backgroundColor="" style={this.style.icon}></Icon>
          </TouchableOpacity>
          {this.renderName(textStyle)}
        </TouchableOpacity>

      );
    }

    renderName(textStyle){
      var {id}=this.props;
      var plant=this.props.plants[id];
      if(this.props.myPlant)return [];
      else return (<Text style={[this.style.text, textStyle]} numberOfLines={2} ellipsizeMode={'tail'}>{(plant.common_name?plant.common_name:plant.scientific)}</Text>);
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
    width:90,
    alignItems: "center",
    marginBottom:10,
    marginRight:10,
    marginLeft:10
  },
  imageContainer:{
    width:80,
    height:80,
    marginBottom:5,
    backgroundColor:FliwerColors.secondary.gray,
    borderRadius:45
  },
  disabledStyle:{
    width:"100%",
    height:"100%",
    borderRadius:75,
    backgroundColor:FliwerColors.hexToRgb(FliwerColors.secondary.white, 0.4),
    position:"absolute",

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
    backgroundColor:FliwerColors.primary.green,
    justifyContent:"center",
    position:"absolute",
    right:0,
    top:60,
  },
  icon:{
    width:"100%",
    color:FliwerColors.secondary.white,
    fontSize:18,
    textAlign:"center"
  },
  text:{
    textAlign:"center",
    fontFamily:FliwerColors.fonts.light,
    fontSize:12
  },
  "@media (orientation:landscape)":{
      container:{
        width:160,
        margin:20
      },
      imageContainer:{
        width:150,
        height:150,
        borderRadius:80
      },
      text:{
        fontSize:16
      },
      iconContainer:{
        width:40,
        height:40,
        top:110
      },
      icon:{
        fontSize:30,
      },
      "@media (height<=550)":{//optimize space
          container:{
            width:90,
            margin:10
          },
          imageContainer:{
            width:80,
            height:80,
            borderRadius:45
          },
          text:{
            fontSize:12
          },
          iconContainer:{
            width:26,
            height:26,
            top:60
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

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles,FliwerPlant));
