'use strict';

import React, { Component } from 'react';
import {View, Text} from 'react-native';
import {mediaConnect} from '../utils/mediaStyleSheet.js'
import {toast} from '../widgets/toast/toast'

class FrontLayer extends Component {

    constructor(props) {
        super(props);

        if(global.frontLayer){
          this.state = Object.assign({},global.frontLayer.state);
          global.frontLayer.setState({display: false,children: ()=>{}});
        }else{
          this.state = {
              display: false,
              children: () => {
              }
          };
        }

        global.frontLayer = this;
    }

    shouldComponentUpdate(nextProps,nextState){
      return true;
    }

    renderLayer(c) {
        setTimeout(() => {
            this.setState({children: c});
        }, 0);
        return [];
    }

    renderChildren() {
      var c=this.state.children();
      return c;
    }

    display(d) {
        this.setState({display: d,children: () => {}});
    }

    render() {
        return (
                <View style={this.state.display ? {width: "100%", height: "100%", position: "absolute"} : {display: "none", width: 0, height: 0}}>
                    {this.renderChildren()}
                </View>
                )
    }
};


export default FrontLayer;
