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

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import FliwerAgendaCalendarContainerMonthBar from './FliwerAgendaCalendarContainerMonthBar.js'

import moment from 'moment';


class FliwerAgendaCalendarContainerMonth extends Component {
    constructor(props) {
        super(props);
        this.state = {
            month: new Date().getMonth()+1,
            year: new Date().getFullYear(),
            restDaysOfWeek: this.props.restDaysOfWeek || [0,6], //Default saturday and sunday
            localRestDays: this.props.localRestDays || { 2023:{1:[6],4:[7],5:[1],8:[15],10:[12],11:[1],12:[6,8,25]} }, //Default 2023's Spain oficial rest days
        };

        /* props
            firstDayOfWeek
            restDaysOfWeek:[]
            localRestDays:{2023:{12:[6,8,25]}} //Object with rest days in a year
            containerStyle
            calendarContainer
        */
    }

    monthNumberToName(monthNumber){
        var month = moment().month(monthNumber - 1).format('MMMM');
        return  month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()
        // switch(monthNumber){
        //     case 1:
        //         return "January";
        //     case 2:
        //         return "February";
        //     case 3:
        //         return "March";
        //     case 4:
        //         return "April";
        //     case 5:
        //         return "May";
        //     case 6:
        //         return "June";
        //     case 7:
        //         return "July";
        //     case 8:
        //         return "August";
        //     case 9:
        //         return "September";
        //     case 10:
        //         return "October";
        //     case 11:
        //         return "November";
        //     default:
        //         return "December";
        // }
    }

    render() {

        return (
            <View style={[this.style.container,this.props.containerStyle]}>
                <FliwerAgendaCalendarContainerMonthBar title={this.monthNumberToName(this.state.month)+" "+this.state.year}
                    onPreviousMonth={()=>{
                        if(this.state.month==1){
                            this.props.actions.actionsAgendaCalendar.getMonthTasks(12,this.state.year-1);
                            this.setState({month:12,year:this.state.year-1})
                        }else{
                            this.props.actions.actionsAgendaCalendar.getMonthTasks(this.state.month-1,this.state.year);
                            this.setState({month:this.state.month-1})
                        }
                    }}
                    onNextMonth={()=>{
                        if(this.state.month==12){
                            this.props.actions.actionsAgendaCalendar.getMonthTasks(1,this.state.year+1);
                            this.setState({month:1,year:this.state.year+1})
                        }else{
                            this.props.actions.actionsAgendaCalendar.getMonthTasks(this.state.month+1,this.state.year);
                            this.setState({month:this.state.month+1})
                        }
                    }}
                />
                <View style={[this.style.calendarContainer,this.props.calendarContainer]}>
                    {this.renderCalendar()}
                </View>
            </View>
        )
    }

    renderCalendar(){
        var firstDayOfWeek = this.props.firstDayOfWeek || 1; //Default monday
        var indents=[];

        //first we want to know the day of the week of the first day of the month
        var firstDayOfMonth = new Date(this.state.year,this.state.month-1,1).getDay();
        //then we want to know the number of days of the month
        var numberOfDaysOfMonth = new Date(this.state.year,this.state.month,0).getDate();
        //then we want to know the number of days of the previous month
        var numberOfDaysOfPreviousMonth = new Date(this.state.year,this.state.month-1,0).getDate();
        //then we want to know the first day in the last month in the same week as the first day of the current month
        var firstDayOfLastMonth = (numberOfDaysOfPreviousMonth-firstDayOfMonth)+1+firstDayOfWeek;
        //know we want to know the number of weeks in the month
        var numberOfWeeks = Math.ceil((numberOfDaysOfMonth+firstDayOfMonth)/7);
        
        //First day date is the first day of the last month last week
        var currentDay = new Date(this.state.year,this.state.month-2,firstDayOfLastMonth);
        
        //For every week
        for(var i=0;i<numberOfWeeks;i++){
            var week = [];
            for(var j=0;j<7;j++){
                week.push(this.renderDay(currentDay));
                currentDay.setDate(currentDay.getDate()+1);
            }
            indents.push(<View style={{flexDirection:"row",flexGrow:1}}>{week}</View>);
        }

        return indents;
    }

    renderDay(day){
        var indents=[];
        
        var number=day.getDate();
        var outsideMonth=day.getMonth()!=this.state.month-1;
        //Check if day is today
        var today = new Date();
        var isToday = today.getDate()==day.getDate() && today.getMonth()==day.getMonth() && today.getFullYear()==day.getFullYear();

        //Check if day is rest day
        var isRestDay = this.state.restDaysOfWeek.includes(day.getDay());
        //if not rest day check if is local rest day
        if(!isRestDay && !outsideMonth){
            if(this.state.localRestDays[day.getFullYear()] && this.state.localRestDays[day.getFullYear()][day.getMonth()+1]){
                isRestDay = this.state.localRestDays[day.getFullYear()][day.getMonth()+1].includes(day.getDate());
            }
        }

        indents.push(
            <TouchableOpacity style={[this.style.monthDayContainer,outsideMonth?this.style.outsideMonthDayContainer:this.style.currentMonthDayContainer]} onMouseEnter={this.hoverIn('hoveredMonthDayContainer')} onMouseLeave={this.hoverOut('hoveredMonthDayContainer')} onPress={((year,month,day)=>{
                return ()=>{
                    if(typeof this.props.onSetDay==="function")this.props.onSetDay(new Date(year,month,day));
                }
            })(day.getFullYear(),day.getMonth(),day.getDate())}>
                <Text style={[this.style.monthDayText,outsideMonth?this.style.outsideMonthDayText:this.style.currentMonthDayText,isToday?this.style.todayMonthDayText:{},isRestDay && !outsideMonth?this.style.restMonthDayText:{}]}>{number}</Text>
                <View style={this.style.dayIconsContainer}>{this.renderDayIcons(day)}</View>
            </TouchableOpacity>
        )
        return indents;
    }

    compareDates(date1,date2){
        if(date1.getDate()==date2.getDate() && date1.getMonth()==date2.getMonth() && date1.getFullYear()==date2.getFullYear())return 0;
        else if(date1.getFullYear()>date2.getFullYear())return 1;
        else if(date1.getFullYear()<date2.getFullYear())return -1;
        else if(date1.getMonth()>date2.getMonth())return 1;
        else if(date1.getMonth()<date2.getMonth())return -1;
        else if(date1.getDate()>date2.getDate())return 1;
        else if(date1.getDate()<date2.getDate())return -1;
        else return 0;
    }

    renderDayIcons(day){
        var indents=[];
        var monthYearString=(day.getMonth()+1)+"-"+day.getFullYear();
        var icons={
            "createdByMe":0,
            "myTasks":0,
            "otherTasks":0, //in the future can be more separated
        }

        if(this.props.calendarTasks && this.props.calendarTasks[monthYearString]){

            for(var i=0;i<this.props.calendarTasks[monthYearString].length;i++){
                var task=this.props.calendarTasks[monthYearString][i];
                var startDate=new Date(task.start);
                var endDate=task.end?new Date(task.end):null;
                /*
                    (end IS NULL AND start>='"+initDateString+"' AND start<='"+endDateString+"') OR (  (start >= '"+initDateString+"' AND start <= '"+endDateString+"') OR (end >= '"+initDateString+"' AND end <= '"+endDateString+"') OR (start <= '"+initDateString+"' AND end >= '"+endDateString+"') )
                */

                if( (!endDate && this.compareDates(startDate,day)==0) || (endDate && (this.compareDates(startDate,day)==0 || this.compareDates(endDate,day)==0 || this.compareDates(startDate,day)<0 && this.compareDates(endDate,day)>0)))
                {
                    if(task.idUserCreator==this.props.sessionData.idUser)icons.createdByMe++;
                    else if(task.users.find((user)=>{return user.idUser==this.props.sessionData.idUser}))icons.myTasks++;
                    else icons.otherTasks++;
                }
            }
        }

        if(icons.createdByMe>0){
            indents.push(<View style={[this.style.dayIconContainer,this.style.dayIconContainerCreatedByMe]}><Text style={this.style.dayIconText}>{icons.createdByMe}</Text></View>);
        }

        if(icons.myTasks>0){
            indents.push(<View style={[this.style.dayIconContainer,this.style.dayIconContainerMyTasks]}><Text style={this.style.dayIconText}>{icons.myTasks}</Text></View>);
        }

        if(icons.otherTasks>0){
            indents.push(<View style={[this.style.dayIconContainer,this.style.dayIconContainerOtherTasks]}><Text style={this.style.dayIconText}>{icons.otherTasks}</Text></View>);
        }

        return indents;
    }

}

function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        sessionData: state.sessionReducer.dataLogin,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        userData: state.sessionReducer.data,
        calendarTasks: state.agendaCalendarReducer.tasks,
        calendarLoading: state.agendaCalendarReducer.updating,
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
        width: "100%",
        height: "100%",
        display:"flex"
    },
    calendarContainer:{
        flexGrow:1,
        backgroundColor: "white",
        width:"100%"
    },
    monthDayContainer:{
        width:"14.28571428571429%",
        justifyContent:"center",
        alignItems:"center"
    },
    monthDayText:{
        fontSize: 24,
        width: 60,
        height: 60,
        lineHeight: 60,
        fontFamily: FliwerColors.fonts.title
    },
    dayIconsContainer:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        position: "absolute",
        bottom: 10,
        width: "100%"
    },
    
    dayIconContainer:{
        marginLeft: 2,
        marginRight: 4,
        width: 20,
        height: 20,
        borderRadius: 50,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    dayIconContainerCreatedByMe:{
        backgroundColor:FliwerColors.parameters.fert,
    },
    dayIconContainerMyTasks:{
        backgroundColor:FliwerColors.parameters.light,
    },
    dayIconContainerOtherTasks:{
        backgroundColor:FliwerColors.parameters.soilm,
    },
    dayIconText:{
        color: "white",
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 14
    },
    outsideMonthDayContainer:{
        flexGrow:1
    },
    outsideMonthDayText:{
        textAlign:"center",
        color:"rgb(200,200,200)"
    },
    currentMonthDayContainer:{
        flexGrow:1
    },
    currentMonthDayText:{
        textAlign:"center",
        color:"rgb(100,100,100)"
    },
    todayMonthDayText:{
        backgroundColor:FliwerColors.primary.green,
        borderRadius:100,
        color:"white"
    },
    restMonthDayText:{
        color:"red"
    },
    ":hover": {
        hoveredMonthDayContainer:{
            backgroundColor:"rgb(240,240,240)"
        }
    },
    "@media (width<=550)": {
        monthDayText:{
            fontSize: 21,
            width:50,
            height: 50,
            lineHeight: 50
        }
    },
    "@media (orientation:portrait)": {
        
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendarContainerMonth));
