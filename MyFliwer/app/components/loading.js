import React, {Component} from 'react';
var {StyleSheet,View,ActivityIndicator} = require('react-native');

class Loading extends Component {


  render() {
    const {children, style, imageStyle, loading, ...props} = this.props;

    if(loading)
    return(
      <View style={{position:'absolute',zIndex:9998,top:0,bottom:0,left:0,right:0,backgroundColor:"rgba(0,0,0,0.4)",alignItems: 'center',justifyContent: 'center',flex: 1}}>
        <ActivityIndicator
            animating={true}
            style={[{height: 80,zIndex:9999}]}
            size={"large"}
        />
      </View>
    )
    else return(<View style={{position:'absolute',height:0,width:0}}></View>)
  }
}
export default Loading;
