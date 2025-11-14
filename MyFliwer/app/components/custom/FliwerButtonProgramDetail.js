'use strict';

import React, { Component } from 'react';
import {View,Text,TextInput,Platform} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import Icon from 'react-native-vector-icons/EvilIcons';

class FliwerButtonProgramDetail extends Component {
  constructor(props) {
      super(props);
      this.state={
        closeIcon:false
      }
  }

  render() {


    return (
      <View style={this.style.buttonContainer}>
        <View style={[this.style.leftContainer,this.props.active==0?{backgroundColor:FliwerColors.primary.green}:{}]}>
          <Text style={[this.style.leftText,this.props.active==0?{color:"white"}:{}]}>{this.props.actions.translate.get('FliwerButtonProgramDetail_pending')}</Text>
        </View>
        <View style={[this.style.centerContainer, {marginRight:1},this.props.active==1?{backgroundColor:FliwerColors.primary.green}:{}]}>
          <Text style={[this.style.centerText,this.props.active==1?{color:"white"}:{}]}>{this.props.actions.translate.get('FliwerButtonProgramDetail_sending')}</Text>
        </View>
        <View style={[this.style.centerContainer,this.props.active==2?{backgroundColor:FliwerColors.primary.green}:{}]}>
          <Text style={[this.style.centerText,this.props.active==2?{color:"white"}:{}]}>{this.props.actions.translate.get('FliwerButtonProgramDetail_irrigating')}</Text>
        </View>
        <View style={[this.style.rightContainer,this.props.active==3?{backgroundColor:FliwerColors.primary.green}:{}]}>
          <Text style={[this.style.rightText,this.props.active==3?{color:"white"}:{}]}>{this.props.actions.translate.get('FliwerButtonProgramDetail_done')}</Text>
        </View>
      </View>
    )
  }

 };


 // The function takes data from the app current state,
 // and insert/links it into the props of our component.
 // This function makes Redux know that this component needs to be passed a piece of the state
 function mapStateToProps(state, props) {
     return {
         devices: state.fliwerDeviceReducer.devices,
     }
 }

 // Doing this merges our actions into the componentâ€™s props,
 // while wrapping them in dispatch() so that they immediately dispatch an Action.
 // Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
 function mapDispatchToProps(dispatch) {
     return {
       actions: {
         translate: bindActionCreators(ActionsLang, dispatch),
       }
     }
 }



var style ={
  centerText:{
    //width:"100%",
    fontSize: 11,
    textAlign:"center",
    paddingLeft:4,
    paddingRight:4,
    fontFamily:FliwerColors.fonts.light,
    color: FliwerColors.primary.gray,
  },
  centerContainer:{
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center',
    backgroundColor:"white",
    marginTop:1,
    marginBottom:1,
    //maxWidth:80,
  },
  buttonContainer:{
    height:37,
    //width:"100%",
    //maxWidth:300,
    paddingRight:1,
    borderRadius:50,
    backgroundColor:FliwerColors.primary.green,
    display:"flex",
    flexDirection:"row"
  },
  leftContainer:{
    marginRight:1,
    marginLeft:1,
    marginTop:1,
    borderBottomLeftRadius:50,
    borderTopLeftRadius:50,
    height:35,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center',
    backgroundColor:"white",
    //maxWidth:80,
  },
  leftText:{
    color: FliwerColors.primary.gray,
    //width:"100%",
    fontSize: 11,
    textAlign:"center",
    paddingLeft:4,
    paddingRight:4,
    fontFamily:FliwerColors.fonts.light
  },
  rightContainer:{
    marginTop:1,
    marginLeft:1,
    borderBottomRightRadius:50,
    borderTopRightRadius:50,
    flexGrow:1,
    height:35,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center',
    backgroundColor:"white",
    //maxWidth:70,
  },
  rightText:{
    fontSize: 11,
    textAlign:"center",
    paddingRight:4,
    paddingLeft:4,
    fontFamily:FliwerColors.fonts.light,
    color: FliwerColors.primary.gray,
  }
};

if(Platform.OS==='web'){
  style.rightText.height=15;
  style.leftText.height=15;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style,FliwerButtonProgramDetail));
