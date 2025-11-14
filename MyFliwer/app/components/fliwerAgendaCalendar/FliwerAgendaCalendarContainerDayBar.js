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

import moment from 'moment';

import FliwerCalmButton from '../custom/FliwerCalmButton.js'


class FliwerAgendaCalendarContainerDayBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            daysNumber:5
        };
    }
    

    monthNumberToName(monthNumber){
        return moment().month(monthNumber - 1).format('MMM').toUpperCase();
        // switch(monthNumber){
        //     case 1:
        //         return "JAN";
        //     case 2:
        //         return "FEB";
        //     case 3:
        //         return "MAR";
        //     case 4:
        //         return "APR";
        //     case 5:
        //         return "MAY";
        //     case 6:
        //         return "JUN";
        //     case 7:
        //         return "JUL"
        //     case 8:
        //         return "AUG";
        //     case 9:
        //         return "SEP";
        //     case 10:
        //         return "OCT";
        //     case 11:
        //         return "NOV";
        //     default:
        //         return "DEC";
        // }
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
                        if(typeof this.props.onPrevious==="function")this.props.onPrevious(this.state.daysNumber);
                    }}
                />
                <View style={this.style.title}>
                    {this.renderDays()}
                </View>
                <FliwerCalmButton
                    containerStyle={{}}
                    buttonStyle={[{marginLeft: 10}]}
                    iconData={{
                        style: this.style.eyeIcon,
                        name: "chevron-right"
                    }}
                    onPress={() => {
                        if(typeof this.props.onNext==="function")this.props.onNext(this.state.daysNumber);
                    }}
                />
            </View>
        )
    }

    compareDates(date1,date2){
        if(date1.getDate()!=date2.getDate())return false;
        if(date1.getMonth()!=date2.getMonth())return false;
        if(date1.getFullYear()!=date2.getFullYear())return false;
        return true;
    }

    renderDays(){
        var indents=[];

        var daysNumber=Math.floor((this.state.mediaStyle.width-100)/(this.state.mediaStyle.width<800?80:100)) //5;
        if(daysNumber%2==0)daysNumber--;
        this.state.daysNumber=daysNumber;

        var firstDay= new Date(this.props.current);
        firstDay.setDate(firstDay.getDate()-Math.floor((daysNumber-1)/2));

        for(var i=0;i<daysNumber;i++){
            indents.push(<TouchableOpacity style={[this.style.dayContainer,this.compareDates(this.props.current,firstDay)?this.style.selectedDayContainer:{}]} onPress={((year,month,day)=>{
                return ()=>{
                    if(typeof this.props.onSetDay==="function")this.props.onSetDay(new Date(year,month,day));
                }
            })(firstDay.getFullYear(),firstDay.getMonth(),firstDay.getDate())}>
                <Text  style={[this.style.dayContainerTextDate,this.compareDates(firstDay,new Date())?this.style.currentDay:{}]}>{firstDay.getDate()}</Text>
                <Text  style={[this.style.dayContainerTextYear,this.compareDates(firstDay,new Date())?this.style.currentDay:{}]}>{this.monthNumberToName(firstDay.getMonth()+1)+" "+firstDay.getFullYear()}</Text>
            </TouchableOpacity>);
             firstDay.setDate(firstDay.getDate()+1);
        }

        return indents;
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
        height: 60,
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
    dayContainer:{
        width:100,
        height:"100%",
        display:"flex",
        flexDirection:"column",
        textAlign:"center",
        justifyContent:"center"
    },
    selectedDayContainer:{
        backgroundColor: "rgb(230,230,230)"
    },
    currentDay:{
        color:  FliwerColors.primary.green
    },
    dayContainerTextDate:{
        fontSize: 24,
        fontFamily: FliwerColors.fonts.title,
        color: "rgb(100,100,100)",
        textAlign:'center'
    },
    dayContainerTextYear:{
        color: "rgb(100,100,100)",
        textAlign:'center'
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
    "@media (width<=800)": {
        dayContainer:{
            width:80
        }
    },
    "@media (orientation:portrait)": {

    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendarContainerDayBar));
