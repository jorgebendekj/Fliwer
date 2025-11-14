'use strict';

import React, { Component } from 'react';
import {View,Text,TextInput,Platform,TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import {bindActionCreators} from 'redux';

import Icon from 'react-native-vector-icons/EvilIcons';

class FliwerSearchInput extends Component {
  constructor(props) {
      super(props);
      this.state={
        closeIcon:false,
        value:null,
      }

      var txt={}
      txt.nativeEvent={}
      txt.nativeEvent.text=this.props.defaultValue?this.props.defaultValue:(this.props.value?this.props.value:null);
      this.state.value=txt;
  }


  clearText(text){
    this.textInput.clear();
    //this.setState({closeIcon:false});
  }

  render() {
    //
    var {containerStyle,style,placeholder,onChangeText,returnKeyType,autoCapitalize,onSubmitEditing,blurOnSubmit,ref,secureTextEntry,value,inputStyle,inputContainer,defaultValue}=this.props;
    var that=this;
    return (

      <View style={[this.style.buttonContainer,{flexDirection:"row"},containerStyle]}>
        <View style={[this.style.buttonTouchale,style]}>
            {this.renderIcon()}
            <View style={[this.style.inputContainer,inputContainer]}>
                <TextInput
                  style={[this.style.input,inputStyle]}
                  key={placeholder}
                  placeholder={placeholder}
                  secureTextEntry={secureTextEntry}
                  onChangeText={(text)=>{if(onChangeText)onChangeText(text);
                    var txt={}
                    txt.nativeEvent={}
                    txt.nativeEvent.text=text;
                    this.state.value=txt
                  }}
                  returnKeyType = {returnKeyType?returnKeyType:"search"}
                  autoCapitalize = {autoCapitalize}
                  onSubmitEditing={onSubmitEditing}
                  underlineColorAndroid={'transparent'}
                  textAlign={'center'}
                  placeholderTextColor={FliwerColors.secondary.gray}
                  value={value}
                  ref={input => { this.textInput =input;if(ref)ref(input) }}
                  blurOnSubmit={blurOnSubmit}
                  defaultValue={defaultValue}
                />
            </View>

          </View>
          {this.props.searchButton?this.renderSearchButton():null}
      </View>
    )
  }

  renderIcon(){
    var {onChangeText}=this.props;

    return (
      <TouchableOpacity style={this.style.iconContainer} onPress={()=>{if(typeof this.props.onSubmitEditing==="function")this.props.onSubmitEditing(this.state.value)}}>
        <Icon name={"search"} backgroundColor="" style={this.style.icon}></Icon>
      </TouchableOpacity>
    )
  }

  renderSearchButton()
  {
      return (<FliwerGreenButton text={this.props.actions.translate.get('General_search').toUpperCase()} style={{paddingLeft:8,paddingRight:8,width:null}} containerStyle={{height:33,marginBottom:1,alignSelf:"center",marginTop:0,width:null,minWidth:89}}
        onPress={async ()=>{if(typeof this.props.onSubmitEditing==="function"){await this.props.onSubmitEditing(this.state.value)}}}/>)

  }
};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
    }
}

// Doing this merges our actions into the component’s props,
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
  buttonContainer:{
    height:48,
    //width:"100%",
    //maxWidth:300,
    marginBottom:10,
    justifyContent:"center"
  },
  buttonTouchale:{
    backgroundColor:FliwerColors.primary.green,
    height:"100%",
    //width:"100%",
    borderRadius:45,
    alignItems: 'center',
    flexDirection: 'row',
    //maxWidth:245,
    marginRight:12,
    width:201,
  },
  iconContainer:{
    position:"absolute",
    right:12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent:'center'
  },
  icon:{
    color: FliwerColors.secondary.white,
    fontSize: 20,
    textAlign:"left"
  },
  inputContainer:{
    position:"absolute",
    top:1,
    left:1,
    bottom:1,
    borderRadius:45,
    right:36
  },
  input:{
    height:"100%",
    fontFamily:FliwerColors.fonts.light,
    textAlign: 'center',
    backgroundColor:FliwerColors.secondary.white,
    borderRadius:45,
    padding:10,
    fontSize:14,
    width:"100%",
    color:"black"
  },
  "@media (orientation:landscape)":{
    buttonContainer:{
      //maxWidth:400,
    },
    buttonTouchale:{
      width:292,
    },
  }
};

if(Platform.OS==='web'){
  style.icon.height="100%";
  style.buttonTouchale.width=225;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style,FliwerSearchInput));
