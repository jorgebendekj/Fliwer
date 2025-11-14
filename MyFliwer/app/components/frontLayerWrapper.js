'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
    PanResponder,
    Animated,
    Dimensions
} = require('react-native');


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {Portal} from '@gorhom/portal'

import * as ActionsWrapper from '../actions/wrapperActions.js'

import {mediaConnect} from '../utils/mediaStyleSheet.js'
import { Redirect } from '../utils/router/router'


class FrontLayerWrapper extends Component {
    constructor(props) {
        super(props);
    }

    componentWillUnmount(){
        this.props.actions.wrapper.setFrontLayerPortals(0); 
    }
        
    render() {
        var indents=[];

        //if is an array do length, if an object length==1
        var length= this.props.children?(this.props.children.length==undefined?1:this.props.children.length):0;

        if(this.props.visible!==undefined && !this.props.visible)length=0;

        if(this.props.frontLayerPortals!=length)this.props.actions.wrapper.setFrontLayerPortals(length);
        
        //if this.props.children is an array
        if(!this.props.children || length==undefined || length==0){
        }else {
            for(var i=0;i<length;i++){ 
                indents.push(
                    <Portal key={"PortalFrontLayer"+i} hostName={"frontLayer"+i}>
                        {this.props.children.length==undefined?this.props.children:this.props.children[i]}
                    </Portal>
                )
            }
        }
        return indents;
    }


};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        frontLayerPortals: state.wrapperReducer.frontLayerPortals
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            wrapper: bindActionCreators(ActionsWrapper, dispatch),
        }
    };
}

//Connect everything
var styles = {
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, FrontLayerWrapper));