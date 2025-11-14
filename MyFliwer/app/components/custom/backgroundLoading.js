'use strict';

import React, { Component } from 'react';
var {View, Platform, Image} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions


class BackgroundLoading extends Component {

    render() {
        /*if(this.props.logedIn && !this.props.preloadedData && this.props.loadedStorageData){
         return (
         <View pointerEvents="none" style={this.style.box}>
         <Image
         source={{uri: 'https://old.fliwer.com/myfliwer/img/loadingapp.gif'}}
         style={{width: 40, height: 40 }}
         />
         </View>
         );
         }else */ return null;
    }

};

var style = {
    box: {
        position: 'absolute',
        width: 40,
        height: 40,
        left: 5,
        bottom: 5
    }
};


if (Platform.OS === 'web') {
    style.box.left = 16;
}

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        loadedStorageData: state.sessionReducer.loadedStorageData,
        preloadedData: state.sessionReducer.preloadedData,
        logedIn: state.sessionReducer.logedIn
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch)
        }
    }
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, BackgroundLoading));
