'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, Image, TouchableOpacity, Platform, Switch} = require('react-native');

import FliwerCard from '../../components/custom/FliwerCard.js'
import {FliwerColors} from '../../utils/FliwerColors'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import { Redirect } from '../../utils/router/router'


class AlertCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            idAdvice: null,
        };
    }

    render() {
        return (
                <FliwerCard ref="card" whiteArrow={false} touchable={false} cardInStyle={this.style.cardInStyle} cardStyle={[this.style.cardOut]}>
                    <View>
                        <View style={{width: "100%", height: "100%"}}>
                            <View style={{/*justifyContent: "space-evenly", height: "73%"*/}}>
                                <Text key={1} style={this.style.title}> {this.props.title} </Text>
                                <View style={this.style.imageOut}>
                                  <Image key={2} style={this.style.image} draggable={false} source={this.props.icon} resizeMode={"contain"} />
                                </View>
                            </View>
                            <View style={ this.style.info }>
                              <View style={ this.style.textRow}>
                                  <Text key={3} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard_temperature')+":"}</Text>
                                  <Text key={4} style={this.style.textRowValue}>{this.props.temperature}</Text>
                              </View>
                              <View style={ this.style.textRow}>
                                  <Text key={5} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard_temperature_min')+":"}</Text>
                                  <Text key={6} style={this.style.textRowValue}>{this.props.temperature_min}</Text>
                              </View>
                              <View style={ this.style.textRow}>
                                  <Text key={7} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard_temperature_max')+":"}</Text>
                                  <Text key={8} style={this.style.textRowValue}>{this.props.temperature_max}</Text>
                              </View>
                              <View style={ this.style.textRow}>
                                  <Text key={9} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard_rain')+":"}</Text>
                                  <Text key={10} style={this.style.textRowValue}>{this.props.rain}</Text>
                              </View>
                              <View style={ this.style.textRow}>
                                  <Text key={11} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard_cloud')+":"}</Text>
                                  <Text key={12} style={this.style.textRowValue}>{this.props.cloud}</Text>
                              </View>
                              <View style={ this.style.textRow}>
                                  <Text key={13} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard__wind_speed')+":"}</Text>
                                  <Text key={14} style={this.style.textRowValue}>{this.props.windspeed}</Text>
                              </View>
                              <View style={ this.style.textRow}>
                                  <Text key={15} style={this.style.textRowTitle}>{this.props.actions.translate.get('MeteoCard_wind_degree')+":"}</Text>
                                  <Text key={16} style={this.style.textRowValue}>{this.props.winddegree}</Text>
                              </View>
                            </View>
                        </View>
                    </View>
                    <View>
                        <View style={ {height: "100%", width: "100%"}}>
                        </View>
                    </View>
                </FliwerCard>
                );
    }

    toggle() {
        var that = this;
        return function () {
            that.refs.card._toggleCard()
        }
    }


};

function mapStateToProps(state, props) {
    return {
      translation: state.languageReducer.translation
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

var style = {
    imageOut:{
      marginTop:10,
      height: 100,
      width: 100,
      backgroundColor: "slategrey",
      borderRadius: 60,
      alignItems:"center",
      justifyContent:"center",
      alignSelf:"center"
    },
    image: {
      width:90,
      height:90,
      borderRadius:50
    },
    title: {
      ////width:"100%",
      textAlign: "center",
      //marginTop:10,
      //marginBottom:4,
      fontSize: 20,
      marginTop:10,
      //paddingLeft:19,
      //paddingRight:19,
      color: "black",
      fontFamily: FliwerColors.fonts.title,
    },
    info:{
      flexGrow: 1,
      width: "70%",
      left: "15%",
      marginTop: 10
    },
    textRow:{
      display: "flex",
      flexDirection: "row",
      justifyContent:"space-between"
    },
    textRowTitle:{
      marginRight:5,
      fontFamily: FliwerColors.fonts.title
    },
    textRowValue:{

    },
    cardInStyle: {
        width: '100%',
        height: '100%',
    },
    contentTextBackOut: {
        paddingLeft: 20,
        paddingRight: 20,
        maxHeight: 203,
        marginBottom: 15,
    },
    contentTextBackScroll: {

    },
    contentTextBack: {
        justifyContent: "center"
    },
    cardOut: {
        height: 295,
    },
    /*
     card:{
     //minHeight:290,
     height: 285,
     //alignItems: "center",
     display: "flex",
     flexDirection: "column",
     //alignItems: "flex-start",
     justifyContent: "center",
     padding: 20
     },*/
    deleteAlertButton: {
        position: "absolute",
        right: 25,
        paddingRight: 10,
        top: 1,
    },
    deleteAlertButtonX: {
        textAlign: 'left',
        fontSize: 20,
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.light,

    }
}

//Connect everything
//export default mediaConnect(style,AlertCard);
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, AlertCard));
