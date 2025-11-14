import React, {Component} from 'react';
var {Image,View} = require('react-native');

import loadingapp from '../assets/img/loadingapp.gif'
import loadingrainolve from '../assets/img/loadingapprainolve.gif'

class FliwerLoading extends Component {


  render() {

    var source = (!global.envVars.TARGET_RAINOLVE?loadingapp:loadingrainolve);
//    var source = {uri: 'https://old.fliwer.com/myfliwer/img/loadingapp.gif'};

    return(
      <View style={{position:'absolute',top:0,bottom:0,left:0,right:0,backgroundColor:"rgba(0,0,0,0.4)",alignItems: 'center',justifyContent: 'center',flex: 1,zIndex:9998}}>
        <Image
            source={source}
            style={{width: 100, height: 100, zIndex:9999}}
        />
      </View>
    )
  }

}
export default FliwerLoading;
