'use strict';

import React, { Component } from 'react';
import {View,Text,TextInput,Platform} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerSearchInput extends Component {
  constructor(props) {
      super(props);
      this.state={
      }
  }

  clearText(text){
    this.textInput.clear();
    this.setState({closeIcon:false});
  }

  render() {
    var {containerStyle,style,placeholder,onChangeText,returnKeyType,keyboardType,autoCapitalize,onSubmitEditing,blurOnSubmit,ref,secureTextEntry,value,defaultValue,inputStyle,inputContainer, disabled}=this.props;
    return (
      <View style={[this.style.buttonContainer,containerStyle]}>
        <View style={[this.style.buttonTouchale,style]}>
            {this.renderIcon()}
            <View style={[this.style.inputContainer,inputContainer]}>
                <TextInput
                  disabled={disabled}
                  style={[this.style.input,inputStyle]}
                  key={placeholder}
                  placeholder={placeholder}
                  secureTextEntry={secureTextEntry}
                  keyboardType={keyboardType}
                  onChangeText={(text)=>{if(onChangeText)onChangeText(text)}}
                  returnKeyType = {returnKeyType}
                  autoCapitalize = {autoCapitalize}
                  onSubmitEditing={onSubmitEditing}
                  underlineColorAndroid={'transparent'}
                  textAlign={'center'}
                  placeholderTextColor={FliwerColors.secondary.gray}
                  value={value}
                  defaultValue={defaultValue}
                  ref={input => { this.textInput =input;if(ref)ref(input) }}
                  blurOnSubmit={blurOnSubmit}
                />
            </View>
          </View>
      </View>
    )
  }

  renderIcon(){
    var {rightText,rightIcon}=this.props;

    if(rightIcon){
      return (
        <View style={this.style.iconContainer} >
          {rightIcon}
        </View>
      )
    }else{
      return (
        <View style={this.style.iconContainer} >
          <Text name={"x"} backgroundColor="" style={this.style.icon}>{rightText}</Text>
        </View>
      )
    }
  }
};


var style ={
  buttonContainer:{
    height:48,
    width:"100%",
    maxWidth:300,
    marginBottom:10
  },
  buttonTouchale:{
    backgroundColor:FliwerColors.primary.green,
    height:"100%",
    width:"100%",
    borderRadius:45,
    borderBottomLeftRadius: 45,
    borderTopLeftRadius: 45,
    alignItems: 'center',
    flexDirection: 'row'
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
    right:44
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
  },
  "@media (orientation:landscape)":{
    buttonContainer:{
      maxWidth:400
    },
  }
};

if(Platform.OS==='web'){
  style.icon.height="100%";
}

//Connect everything
export default mediaConnect(style,FliwerSearchInput);
