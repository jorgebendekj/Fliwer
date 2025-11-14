'use strict';

import React, { Component } from 'react';
var {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  PanResponder,
  Animated
} = require('react-native');


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsPlant from '../../actions/fliwerPlantActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import { Redirect } from '../../utils/router/router'


import defaultIcon from '../../assets/img/fliwer_icon1.png'

class plantMiniCard extends Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        if(this.props.registerPlant)this.props.registerPlant(this);
    }

    getInitialState(){
      return  {
        showDraggable: true,
        dropAreaValues: null,
        pan: new Animated.ValueXY(),
        scale: new Animated.Value(1),
        dragging:false,
        layout:null
      }
    }

    onLayout(event) {
      this.state.layout=event.nativeEvent.layout;
    }

    isDropArea(gesture) {
      return this.props.dropAreaCheck?this.props.dropAreaCheck(gesture,this.state.layout):false;
    }

    dropFunc(gesture) {
      return this.props.dropFunc?this.props.dropFunc(gesture,this.state.layout):false;
    }

    componentWillMount() {
      // Add a listener for the delta value change
      var that=this;
      this._val = { x:0, y:0 }
      this.panListener=this.state.pan.addListener((value) => this._val = value);
      // Initialize PanResponder with move handling
      if(this.props.panResponder)this.panResponder=this.props.panResponder;
      else this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gesture) => true,
        onPanResponderMove: (e, gestureState) => {
          this.isDropArea(gestureState)
          Animated.event([
            null, { dx: this.state.pan.x, dy: this.state.pan.y }
          ])(e, gestureState);
        },
        onPanResponderGrant: (evt, gestureState) => {
          this.setState({dragging:true});
          if(this.props.startCallback)this.props.startCallback(this.props.idPlant);
        },
        onPanResponderEnd: (evt, gestureState) => {
        },
        onPanResponderRelease: (e, gesture) => {
          if (this.dropFunc(gesture)) {
            Animated.timing(this.state.scale, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true
            }).start(() =>{
                this.setState({dragging:false});
                if(this.props.dropCallback)this.props.dropCallback(this.props.idPlant);
            });
        } else {
          Animated.spring(this.state.pan, {
            toValue: { x: 0, y: 0 },
            friction: 5
          }).start(() =>{
            this.setState({dragging:false});
          });
        }
        }
      });
      // adjusting delta value
      this.state.pan.setValue({ x:0, y:0})
    }

    componentWillUnmount() {
      if(this.panListener)this.state.pan.removeListener(this.panListener);
    }

    render() {
      var myPlant=this.props.myPlant;
      var panStyle = {
        transform: this.state.pan.getTranslateTransform(),
      }
      panStyle.transform.push({scaleX:this.state.scale});
      panStyle.transform.push({scaleY:this.state.scale});

      var plant=this.props.plants[this.props.idPlant];
      return (
        <Animated.View {...this.panResponder.panHandlers} onLayout={e => { this.onLayout(e)}} style={[panStyle,this.style.categoryMiniCard,(this.state.dragging?{zIndex:2,elevation:2}:{}),(myPlant?this.style.categoryMiniCardMyPlant:{}),this.props.style]}>
          <View style={[this.style.imageCategoryOut,(myPlant?this.style.imageCategoryOutMyPlant:{})]}>
            <Image style={[this.style.imageCategory,this.style.imagePlant,(myPlant?this.style.imagePlantMyPlant:{})]} draggable={false} source={(plant.plant_image1_mini?{uri: plant.plant_image1_mini}:defaultIcon)}  resizeMode={(plant.plant_image1_mini?"cover":"contain")}/>
          </View>
          {this.renderName()}
        </Animated.View>
      );
    }

    renderName(){
      var plant=this.props.plants[this.props.idPlant];
      if(this.props.myPlant)return [];
      else return (<Text style={[this.style.textCategory,this.props.testStyle]} numberOfLines={2} ellipsizeMode={'tail'}>{plant.common_name}</Text>);
    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
        creatingZone: state.createZoneReducer.creating,
        categories: state.fliwerPlantReducer.categories,
        plants: state.fliwerPlantReducer.plants
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
        languageActions: bindActionCreators(ActionsLang, dispatch),
        createZoneActions: bindActionCreators(ActionsCreateZone,dispatch),
        fliwerPlantActions: bindActionCreators(ActionsPlant,dispatch)
      }
    }
}

//Connect everything

var styles ={
    categoryMiniCard:{
      height:250,
      width:200
    },
    categoryMiniCardMyPlant:{
      height:100,
      width:100,
      margin:10
    },
    categoryMiniCardTouch:{
      position:"absolute",
      width:"100%",
      height:"100%"
    },
    imageCategoryOut:{
      backgroundColor:"#ececec",
      position:"absolute",
      left:25,
      right:25,
      top:10,
      bottom:50
    },
    imageCategoryOutMyPlant:{
      backgroundColor:"#a6cf07",
      left:0,
      right:0,
      top:0,
      bottom:0,
      borderRadius:5
    },
    imageCategory:{
      width:"90%",
      height:"90%",
      marginLeft:"5%",
      marginTop:"5%"
    },
    textCategory:{
      position:"absolute",
      width:"100%",
      textAlign:"center",
      top:200,
      paddingLeft:10,
      paddingRight:10,
      fontFamily:"AvenirNext-Regular",
      fontSize:14
    },
    imagePlant:{
      borderRadius:10,
      height:"70%",
      marginTop:"15%",
      width:"80%",
      marginLeft:"10%",
    },
    imagePlantMyPlant:{
      borderRadius:5,
      height:"90%",
      width:"90%",
      marginTop:"5%",
      marginLeft:"5%",
    },
    "@media (orientation:landscape)":{
      "@media (width<=1060)":{
        categoryMiniCard:{
          height:200,
          width:150
        },
        categoryMiniCardMyPlant:{
          height:80,
          width:80
        },
        imageCategoryOut:{
          bottom:60
        },
        textCategory:{
          top:140
        }
      },
      "@media (width<=650)":{//worst phones
        categoryMiniCard:{
          height:170,
          width:120
        },
        categoryMiniCardMyPlant:{
          height:60,
          width:60
        },
        imageCategoryOut:{
          left:5,
          right:5,
          bottom:60,
          top:0
        },
        textCategory:{
          top:110
        }
      }
    },
    "@media (orientation:portrait)":{
      categoryMiniCard:{
        height:152,
        width:100
      },
      categoryMiniCardMyPlant:{
        height:50,
        width:50,
        marginRight:2,
        marginLeft:2,
        marginTop:0,
        marginBottom:2,
        float: "left",
      },
      imageCategoryOut:{
        left:5,
        right:5,
        bottom:42,
        top:0
      },
      textCategory:{
        top:110,
        paddingLeft:2,
        paddingRight:2,
        fontSize:12
      }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles,plantMiniCard));
