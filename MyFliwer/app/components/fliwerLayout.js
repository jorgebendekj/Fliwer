'use strict';

import React, { Component } from 'react';
import {View,StyleSheet} from 'react-native';
import {Toolbar} from 'react-native-material-ui';
import FliwerDrawer from './fliwerDrawer';
import Login from './login' //Import the component file

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../actions/languageActions.js'; //Import your actions


class FliwerLayout extends Component {

    constructor(props) {
        super(props);
    }


    componentDidMount() {
      var that=this;
      setTimeout(function(){
        that.drawer.close()
      },2000)
    }

    render() {
        return (

          <View style={styles.allView}>
            <Toolbar
              rightElement="menu"
              centerElement="MyFliwer"
            />
            <View style={styles.belowToolbarView}>
              <Login />
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
        language: state.languageReducer.language
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
        languageActions: bindActionCreators(ActionsLang, dispatch)
      }
    }
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(FliwerLayout);

var styles = StyleSheet.create({
    allView:{flex:1, width: "100%",height:"100%",backgroundColor: 'white'},
    belowToolbarView:{flex:1, width: "100%",height:"100%",backgroundColor: 'white'}
});
