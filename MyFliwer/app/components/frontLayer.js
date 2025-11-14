'use strict';

import React, { Component } from 'react';
import {View, Text} from 'react-native';
import {toast} from '../widgets/toast/toast'



import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {PortalHost} from '@gorhom/portal'


import * as ActionsLang from '../actions/languageActions.js'; //Import your actions

class FrontLayer extends Component {

    constructor(props) {
        super(props);
    }

    render() {

      if(this.props.frontLayerPortals>0){
        return (
          <View style={{width: "100%", height: "100%", position: "absolute"} }>
              {this.renderChildren()}
          </View>
          )
      }else{
        return null;
      }
        
    }

    renderChildren() {
      var indents=[];

      for(var i=0;i<this.props.frontLayerPortals;i++){
        indents.push(
          <PortalHost key={"frontLayer"+i} name={"frontLayer"+i} />
        );
      }

      return indents;
    }
};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
  return {
      data: state.sessionReducer.data,
      frontLayerPortals: state.wrapperReducer.frontLayerPortals
  };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
  return {
      actions: {
          translate: bindActionCreators(ActionsLang, dispatch),
      }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FrontLayer);
