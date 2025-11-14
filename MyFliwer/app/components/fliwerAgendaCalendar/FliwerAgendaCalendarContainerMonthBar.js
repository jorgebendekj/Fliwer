'use strict';
import React, { Component,useState } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
} = require('react-native');

import {FliwerColors} from '../../utils/FliwerColors.js'
import * as ActionsLang from '../../actions/languageActions.js';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'


class FliwerAgendaCalendarContainerMonthBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {

        return (
            <View style={[this.style.barContainer,this.props.style]}>

                <FliwerCalmButton
                    containerStyle={{}}
                    buttonStyle={[{marginLeft: 10}]}
                    iconData={{
                        style: this.style.eyeIcon,
                        name: "chevron-left"
                    }}
                    onPress={() => {
                        if(typeof this.props.onPreviousMonth==="function")this.props.onPreviousMonth();
                    }}
                />
                <View style={this.style.title}>
                    <Text style={this.style.titleText}>{this.props.title}</Text>
                </View>
                <FliwerCalmButton
                    containerStyle={{}}
                    buttonStyle={[{marginLeft: 10}]}
                    iconData={{
                        style: this.style.eyeIcon,
                        name: "chevron-right"
                    }}
                    onPress={() => {
                        if(typeof this.props.onNextMonth==="function")this.props.onNextMonth();
                    }}
                />
            </View>
        )
    }

}
;

function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        sessionData: state.sessionReducer.dataLogin,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        userData: state.sessionReducer.data,
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
    barContainer: {
        width: "100%",
        height: 40,
        backgroundColor:"white",
        display:"flex",
        flexDirection:"row",
        borderBottomColor: "rgb(150,150,150)",
        borderBottomWidth: 1,
        alignItems:"center"
    },
    prevContainer:{
        height:"100%",
        flexDirection:"row",
        marginLeft:10,
        alignItems:"center"
    },
    title:{
        flexGrow:1,
        height:"100%",
        marginLeft:10,
        marginRight:10,
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center",     
    },
    titleText:{
        fontFamily: FliwerColors.fonts.title,
        fontSize: 18,
    },
    nextContainer:{
        marginRight:10,
        height:"100%",
        flexDirection:"row",
        alignItems:"center"
    },
    eyeIcon: {
        fontSize: 29,
        textAlign: "center",
        zIndex: 1,
        //height:30,
        color: "back"
    },
    ":hover": {
        
    },
    "@media (width<=480)": {

    },
    "@media (orientation:portrait)": {

    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendarContainerMonthBar));
