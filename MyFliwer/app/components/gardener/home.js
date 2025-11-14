'use strict';

import React, { Component } from 'react';
var {
  StyleSheet,
  View,
  ScrollView,
  Text
} = require('react-native');

import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import FliwerLoading from '../fliwerLoading'
import HomeCard from '../../components/gardener/homeCard.js'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import background from '../../assets/img/homeBackground.jpg'

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };

        var that=this;
    }

    render() {
        if (this.props.homeLoading) {
            return (
                <FliwerLoading/>
            );
        } else {
            return (
              <ImageBackground  source={background} resizeMode={"cover"}>
                <ScrollView  scrollEventThrottle={100} style={{flex:1}}>
                  <MainFliwerTopBar/>
                  <CardCollection>
                    { this.renderHome() }
                  </CardCollection>
                </ScrollView>
              </ImageBackground>
            );
        }
    }

    renderHome(){
      var indents = [];
      for(var index in this.props.homeData) {
        var obj = this.props.homeData[index];
        indents.push(<HomeCard key={"HomeCard_"+index} title={obj.name} subtitle={obj.nameCity+(obj.meteo?(" · "+obj.meteo.temperature+"º"+" · "+obj.meteo.airHumidity+"% hum"):"")} image={obj.image} />);
      }

      return indents;

    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        data: state.sessionReducer.data,
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
        homeLoading: state.fliwerHomeReducer.loading,
        homeData: state.fliwerHomeReducer.data,
        gardenLoading: state.fliwerGardenReducer.loading,
        gardenData: state.fliwerGardenReducer.data,
        zoneLoading: state.fliwerZoneReducer.loading,
        zoneData: state.fliwerZoneReducer.data
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
        sessionActions: bindActionCreators(Actions, dispatch),
        languageActions: bindActionCreators(ActionsLang, dispatch),
        fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
        fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch),
        fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
      }
    }
}

//Connect everything

var styles ={

};



export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles,Home));
