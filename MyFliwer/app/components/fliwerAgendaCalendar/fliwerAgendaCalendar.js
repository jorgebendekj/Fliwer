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
import * as ActionsAgendaCalendar from '../../actions/agendaCalendarActions.js';

import FliwerAgendaCalendarOptionsBar from './FliwerAgendaCalendarOptionsBar.js';
import FliwerAgendaCalendarContainerMonth from './FliwerAgendaCalendarContainerMonth.js';
import FliwerAgendaCalendarContainerDay from './FliwerAgendaCalendarContainerDay.js';
import FliwerAgendaCalendarContainerStatus from './FliwerAgendaCalendarContainerStatus.js';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'


class FliwerAgendaCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                view: 0, //0 month, 1 day, 2 status
            },
            currentDay: new Date()
        };
        this.props.actions.actionsAgendaCalendar.getMonthTasks(new Date().getMonth()+1,new Date().getFullYear()).then(()=>{
        });
    }

    render() {

        return (
            <View style={[this.style.container,this.props.containerStyle]}>
                <FliwerAgendaCalendarOptionsBar style={this.props.barStyle} options={this.state.options} changeOptions={(newOptions)=>{
                    this.setState({options:newOptions,currentDay: new Date()})
                }} />
                <View style={[this.style.containerIn,this.props.containerInStyle]}>
                    {this.renderContent()}
                </View>
            </View>
        )
    }

    renderContent(){
        switch(this.state.options.view){
            case 0:
                return (
                    <FliwerAgendaCalendarContainerMonth onSetDay={(day)=>{
                        var options=this.state.options;
                        options.view=1;
                        this.setState({options:options,currentDay:day})
                    }}/>
                );
            case 1:
                return (
                    <FliwerAgendaCalendarContainerDay currentDay={this.state.currentDay} onloading={this.props.onLoading}/>
                );
            case 2:
                return (
                    <FliwerAgendaCalendarContainerStatus onloading={this.props.onLoading}/>
                );
        }
    }

};

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
            translate: bindActionCreators(ActionsLang, dispatch),
            actionsAgendaCalendar: bindActionCreators(ActionsAgendaCalendar, dispatch),
        }
    }
}

var style = {
    container: {
        width:"100%",
        height:"100%",
        display:"flex"
    },
    containerIn:{
        backgroundColor:"white",
        flexGrow:1,
        flexShrink:1
    },
    ":hover": {
        
    },
    "@media (width<=480)": {

    },
    "@media (orientation:portrait)": {

    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendar));
