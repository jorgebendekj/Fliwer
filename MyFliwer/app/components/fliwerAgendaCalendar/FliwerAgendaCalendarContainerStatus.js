'use strict';
import React, { Component,useState } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
} = require('react-native');

import {FliwerColors} from '../../utils/FliwerColors.js'
import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js';
import * as ActionsAgendaCalendar from '../../actions/agendaCalendarActions.js';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import moment from 'moment';
import {toast} from '../../widgets/toast/toast'

/*
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable  } from "@dnd-kit/sortable";
*/

import ImageBackground from '../../components/imageBackground.js'
import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

import FliwerAgendaCalendarContainerDayBar from './FliwerAgendaCalendarContainerDayBar.js'
import FliwerAgendaCalendarTaskListView from './FliwerAgendaCalendarTaskListView.js'
import Modal from '../../widgets/modal/modal'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerButtonDateTimePicker from '../custom/FliwerButtonDateTimePicker.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import { CheckBox  } from 'react-native-elements'


class DraggableTask extends React.Component {
    render() {
      const { task, provided,_style,onDelete } = this.props;
  
      const style = {
        transform: provided.transform ? `translate(${provided.transform.x}px, ${provided.transform.y}px)` : "none",
      };
  
      return (
        <View style={style} {...provided.attributes} {...provided.listeners} >
            <FliwerAgendaCalendarTaskListView task={task} style={_style}  onDelete={onDelete} />
        </View>
      );
    }
  }

  

// ✅ Create a higher-order component (HOC) to wrap DraggableTask with useSortable
function withSortable(WrappedComponent) {
    return function SortableComponent(props) {
      const { id } = props.task;
      const sortable = null//useSortable({ id });
  
      return <WrappedComponent {...props} provided={sortable} />;
    };
  }

  // ✅ Use the HOC to make DraggableTask sortable
  const SortableDraggableTask = withSortable(DraggableTask);
  

class FliwerAgendaCalendarContainerStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDay: this.props.currentDay?this.props.currentDay:new Date(),
            savingAddTask:false,
            showAddModal: false,
            showDeleteTaskModal:false,
            taskToDelete: null,
            addTask_title: "",
            addTask_description: "",
            addTask_date: null,
            addTask_allDay: false,
            addTask_start: Date.now()/1000,
            addTask_end: Date.now()/1000,
            addTask_users: [],
            addTask_clients: [],
            business_users: [],
            restDaysOfWeek: this.props.restDaysOfWeek || [0,6], //Default saturday and sunday
            localRestDays: this.props.localRestDays || { 2023:{1:[6],4:[7],5:[1],8:[15],10:[12],11:[1],12:[6,8,25]} }, //Default 2023's Spain oficial rest days
        };  


        if(typeof this.props.onloading === "function")this.props.onloading(true);
        this.props.actions.actionsAgendaCalendar.getAllTasks().finally(()=>{
            this.props.actions.sessionActions.getBusinessEmployeesBasicInfo().then((res)=>{
                res= res.sort((a,b)=>{return (a.first_name+" "+a.last_name).localeCompare(b.first_name+" "+b.last_name)})
                this.setState({business_users:res})
            },(err)=>{
                console.log("[Load user business users].",err);
            })
            if(typeof this.props.onloading === "function")this.props.onloading(false);
        })

    }

    clearAddTask(){
        this.setState({
            addTask_title: "",
            addTask_description: "",
            addTask_date: null,
            addTask_allDay: false,
            addTask_start: Date.now()/1000,
            addTask_end: Date.now()/1000,
            addTask_users: [],
            addTask_clients: [],
            taskToDelete:null
        })
    }

    
    onDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        debugger;
    };

    render() {


        return (
            <ImageBackground source={(!global.envVars.TARGET_RAINOLVE ? background : rainolveBackground)} resizeMode={"cover"} style={[this.style.container,this.props.containerStyle]} loading={false}>
                {this.renderStatusColumns()}
            </ImageBackground>
        )
    }

    renderStatusColumns(){
        
        var allTasks=this.props.calendarAllTasks;
        //transform allTasks to an object with the status as key and an array of tasks as value
        var tasksByStatus={};
        for(var i=0;i<allTasks.length;i++){
            if(!tasksByStatus[allTasks[i].status])tasksByStatus[allTasks[i].status]=[];
            tasksByStatus[allTasks[i].status].push(allTasks[i]);
        }

        var status=['general_pending','general_doing','general_done'];

        var indents=[];

        for(var i=0;i<status.length;i++){
            var title=this.props.actions.translate.get(status[i]);
            if(!title)title=status[i];
            if(!tasksByStatus[status[i]])tasksByStatus[status[i]]=[];
            indents.push(
                <View style={this.style.statusColumn} key={status[i]}>
                    <Text style={[this.style.dayListTitle]}>{title}</Text>
                    <ScrollView style={this.style.statusColumnIn} contentContainerStyle={{}}>
                            {this.renderStatusColumn(status[i],tasksByStatus[status[i]])}
                    </ScrollView>
                </View>
            )
        }

        return indents;
    }


    renderStatusColumn(status,tasks){

        var indents=[];


        //extraspace at the end
        indents.push(<TouchableOpacity key={"newTask"} style={this.style.newTaskContainer} onPress={()=>{this.clearAddTask();this.setState({showAddModal:true})}}>
            <Text style={this.style.newTaskContainerPLus}>{"+"}</Text>
        </TouchableOpacity>);


        if(tasks){
            tasks=tasks.sort((task1,task2)=>{
                return new Date(task1.start)>new Date(task2.start)?1:-1;
            });

            tasks.forEach((task)=>{
                indents.push(
                    <SortableDraggableTask key={task.id} task={task} style={this.style.taskListView}  onDelete={(task)=>{ this.setState({showDeleteTaskModal:true,taskToDelete:task})}} />
                );
            });
        }

        return indents;

    }

    /*

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


    renderDay(){
        var indents=[];
        
        var monthYearString=(this.state.currentDay.getMonth()+1)+"-"+this.state.currentDay.getFullYear();

        if(this.props.calendarTasks && this.props.calendarTasks[monthYearString]){

            var tasks=this.props.calendarTasks[monthYearString];
            tasks=tasks.filter((task)=>{
                var startDate=new Date(task.start);
                var endDate=task.end?new Date(task.end):null;
                return (!endDate && this.compareDates(startDate,this.state.currentDay)==0) || (endDate && (this.compareDates(startDate,this.state.currentDay)==0 || this.compareDates(endDate,this.state.currentDay)==0 || this.compareDates(startDate,this.state.currentDay)<0 && this.compareDates(endDate,this.state.currentDay)>0))
            });

            var initDay=new Date(this.state.currentDay);
            initDay.setHours(0,0,0,0);
            var endDay=new Date(this.state.currentDay);
            endDay.setHours(23,59,59,999);

            var allDay=tasks.filter((task1)=>{
                var startDate1=new Date(task1.start);
                var endDate1=task1.end?new Date(task1.end):null;
                if( (task1.allDay || (endDate1 && startDate1<initDay && endDate1>endDay) )) return true;
                else return false;
            });

            tasks=tasks.filter((task1)=>{
                var startDate1=new Date(task1.start);
                var endDate1=task1.end?new Date(task1.end):null;
                if( (task1.allDay || (endDate1 && startDate1<initDay && endDate1>endDay) )) return false;
                else return true;
            });

            var alreadyStarted=tasks.filter((task1)=>{
                var startDate1=new Date(task1.start);
                var endDate1=task1.end?new Date(task1.end):null;
                if(startDate1<initDay ) return true;
                else return false;
            });

            tasks=tasks.filter((task1)=>{
                var startDate1=new Date(task1.start);
                var endDate1=task1.end?new Date(task1.end):null;
                if(startDate1<initDay ) return false;
                else return true;
            });

            tasks.sort((task1,task2)=>{
                return new Date(task1.start)>new Date(task2.start)?1:-1;
            });
            
            //All sorted and categorized in allDay, alreadyStarted and tasks

            if(allDay.length>0){
                indents.push(<Text key={"allDay"} style={[this.style.dayListTitle]}>{this.props.actions.translate.get('All_day')}</Text>);
                allDay.forEach((task)=>{
                    indents.push(<FliwerAgendaCalendarTaskListView key={task.id} task={task} style={this.style.taskListView} onDelete={(task)=>{
                        this.setState({showDeleteTaskModal:true,taskToDelete:task});
                    }} />);
                });
            }

            if(alreadyStarted.length>0){
                indents.push(<Text key={"startedBefore"} style={[this.style.dayListTitle]}>{this.props.actions.translate.get('Already_started')}</Text>);
                alreadyStarted.forEach((task)=>{
                    indents.push(<FliwerAgendaCalendarTaskListView key={task.id} task={task} style={this.style.taskListView}  onDelete={(task)=>{
                        this.setState({showDeleteTaskModal:true,taskToDelete:task});
                    }} />);
                });
            }

            if(tasks.length>0){
                indents.push(<Text key={"startingToday"} style={[this.style.dayListTitle]}>{this.props.actions.translate.get('Start_today')}</Text>);
                tasks.forEach((task)=>{
                    indents.push(<FliwerAgendaCalendarTaskListView key={task.id} task={task} style={this.style.taskListView}  onDelete={(task)=>{
                        this.setState({showDeleteTaskModal:true,taskToDelete:task});
                    }} />);
                });
            }

            //extraspace at the end
            indents.push(<TouchableOpacity key={"newTask"} style={this.style.newTaskContainer} onPress={()=>{this.clearAddTask();this.setState({showAddModal:true})}}>
                <Text style={{fontSize: 100, marginTop: -15, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
            </TouchableOpacity>);

            //extraspace at the end
            indents.push(<View key={"emptySpace"} style={{width:"100%",height:20}}></View>);

        }

        return indents;
    }

    renderDeleteTaskModal(){
        return (
            <FliwerDeleteModal
                visible={this.state.showDeleteTaskModal}
                onClose={() => {
                    this.setState({showDeleteTaskModal: false})
                }}
                onConfirm={() => {

                    if(typeof this.props.onloading === "function")this.props.onloading(true);
                    this.setState({savingAddTask: true});

                    this.props.actions.actionsAgendaCalendar.deleteCalentarTask(this.state.taskToDelete.id).then((res)=>{
                        if(typeof this.props.onloading === "function")this.props.onloading(false);
                        this.props.actions.actionsAgendaCalendar.getMonthTasks(this.state.currentDay.getMonth()+1,this.state.currentDay.getFullYear());
                        this.setState({showAddModal:false,showDeleteTaskModal:false});
                        this.clearAddTask();
                    },(err)=>{
                        if(typeof this.props.onloading === "function")this.props.onloading(false);
                        this.setState({showDeleteTaskModal:false});
                        if (err && err.reason)
                            toast.error(err.reason);
                    });
                }}
                title={this.props.actions.translate.get('Delete_the_task')}
                hiddeText={true}
                password={false}
                loadingModal={this.state.savingAddTask}
                />
        )
    }

    renderAddModal()
    {
        var showStart = moment.unix(this.state.addTask_start).format("h:mm a, YYYY MMMM D");    
        var showEnd = moment.unix(this.state.addTask_end).format("h:mm a, YYYY MMMM D");
        
        return (
                <Modal animationType="fade" inStyle={[this.style.modalIn]} visible={this.state.showAddModal}
                    onClose={() => {
                        this.setState({showAddModal: false})
                    }}
                    >
                    <ScrollView contentContainerStyle ={[this.style.modalView]}>
                        <View style={{width: "100%"}}>
                            <View style={{}}>
                                <Text style={[this.style.modalTitle]}>{this.props.actions.translate.get('Add_new_task')}</Text>
                            </View>

                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('Title') + ':'}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    this.setState({addTask_title: text});
                                }}
                                value={this.state.addTask_title}
                                multiline={true}
                            />

                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('Description') + ':'}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    this.setState({addTask_description: text});
                                }}
                                value={this.state.addTask_description}
                                multiline={true}
                            />

                            <CheckBox
                                title={this.props.actions.translate.get('All_day')}
                                textStyle={this.style.modalInputCheckboxText}
                                containerStyle={this.style.modalInputCheckbox}
                                checked={this.state.addTask_allDay? true : false}
                                onPress={()=>{
                                    this.setState({addTask_allDay: !this.state.addTask_allDay});
                                }}
                            />

                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('fliwerProgram_alert_startTime')}</Text>
                            <FliwerButtonDateTimePicker
                                mode={this.state.addTask_allDay?"date":"datetime"}
                                date={showStart}
                                timeIntervals={10}
                                styleButtonContainer={{ width: "100%",alignSelf:"center",marginBottom:10 }}
                                onChange={(v) => {
                                    this.setState({ addTask_start: v })
                                }}
                            />

                            {
                                !this.state.addTask_allDay?(
                                    <View>
                                        <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('End')}</Text>
                                        <FliwerButtonDateTimePicker
                                            mode={"datetime"}
                                            date={showEnd}
                                            timeIntervals={10}
                                            styleButtonContainer={{ width: "100%",alignSelf:"center",marginBottom:10}}
                                            onChange={(v) => {
                                                this.setState({ addTask_end: v })
                                            }}
                                        />
                                    </View>):null
                            }

                            <Text style={[this.style.modalInputTitle,{marginTop:10}]}>{this.props.actions.translate.get('Users') + ':'}</Text>
                            <View style={this.style.modalOptionsSelector}>
                                {this.renderAddModalUsers()}
                            </View>

                            <Text style={[this.style.modalInputTitle,{marginTop:10}]}>{this.props.actions.translate.get('Customers') + ':'}</Text>
                            <View style={this.style.modalOptionsSelector}>
                                {this.renderAddModalClients()}
                            </View>

                        </View>
                        <FliwerGreenButton
                            text={this.props.actions.translate.get('accept')}
                            style={{paddingLeft: 8, paddingRight: 8, width: null, marginTop: 10}}
                            containerStyle={{height: 33, marginBottom: 1, alignSelf: "center", marginTop: 10, width: null, minWidth: 135}}
                            onPress={() => {
                                if(typeof this.props.onloading === "function")this.props.onloading(true);
                                this.setState({savingAddTask: true});
                                var task = {
                                    title: this.state.addTask_title,
                                    description: this.state.addTask_description,
                                    start: new Date(this.state.addTask_start*1000).toISOString(),
                                    end: this.state.addTask_end? new Date(this.state.addTask_end*1000).toISOString():null,
                                    allDay: this.state.addTask_allDay,
                                    users: this.state.addTask_users,
                                    clients: this.state.addTask_clients,
                                    //attachments: this.state.addTask_attachments,
                                };

                                this.props.actions.actionsAgendaCalendar.addCalentarTask(task).then((res)=>{
                                    if(typeof this.props.onloading === "function")this.props.onloading(false);
                                    this.props.actions.actionsAgendaCalendar.getMonthTasks(this.state.currentDay.getMonth()+1,this.state.currentDay.getFullYear());
                                    this.setState({showAddModal:false,savingAddTask:false});
                                    this.clearAddTask();
                                },(err)=>{
                                    if(typeof this.props.onloading === "function")this.props.onloading(false);
                                    this.setState({savingAddTask:false});
                                    if (err && err.reason)
                                        toast.error(err.reason);
                                });
                            }}/>
                    </ScrollView>
                </Modal>
                )
    }

    renderAddModalUsers(){
        var indents = [];

        if(this.state.business_users)
            for(var i=0;i<this.state.business_users.length;i++){
                ((i)=>{
                    indents.push(
                        <View style={this.style.modalOptionsSelectorItem}>
                            <TouchableOpacity onPress={()=>{
                                    var users = this.state.addTask_users;
                                    var index = users.indexOf(this.state.business_users[i].idUser);
                                    if(index>=0){
                                        users.splice(index,1);
                                    }else{
                                        users.push(this.state.business_users[i].idUser);
                                    }
                                    this.setState({addTask_users: users});
                            }}>
                                <Image source={{uri:this.state.business_users[i].image}} resizeMode={"cover"} style={this.style.modalOptionsSelectorItemImage} />
                            </TouchableOpacity>
                            <CheckBox
                                title={this.state.business_users[i].first_name+" "+this.state.business_users[i].last_name}
                                textStyle={[this.style.modalInputCheckboxText,this.style.modalOptionsSelectorItemCheckboxText]}
                                containerStyle={[this.style.modalInputCheckbox,this.style.modalOptionsSelectorItemCheckbox]}
                                checked={this.state.addTask_users.indexOf(this.state.business_users[i].idUser)>=0? true : false}
                                onPress={()=>{
                                    var users = this.state.addTask_users;
                                    var index = users.indexOf(this.state.business_users[i].idUser);
                                    if(index>=0){
                                        users.splice(index,1);
                                    }else{
                                        users.push(this.state.business_users[i].idUser);
                                    }
                                    this.setState({addTask_users: users});
                                }}
                            />
                        </View>
                    )
                })(i)
            }
        
        
        return indents;
    }

    

    renderAddModalClients(){
        var indents = [];
        var gardenerUsers=this.props.gardenerUsersList;

        if(gardenerUsers){
            
            gardenerUsers=Object.values(gardenerUsers).sort((a,b)=>{return (a.first_name+" "+a.last_name).localeCompare(b.first_name+" "+b.last_name)})

            for(var i=0;i<gardenerUsers.length;i++){
                ((i)=>{
                    indents.push(
                        <View style={this.style.modalOptionsSelectorItem}>
                            <TouchableOpacity onPress={()=>{
                                    var clients = this.state.addTask_clients;
                                    var index = clients.indexOf(gardenerUsers[i].user_id);
                                    if(index>=0){
                                        clients.splice(index,1);
                                    }else{
                                        clients.push(gardenerUsers[i].user_id);
                                    }
                                    this.setState({addTask_clients: clients});
                            }}>
                                <Image source={{uri:gardenerUsers[i].photo_url}} resizeMode={"cover"} style={this.style.modalOptionsSelectorItemImage} />
                            </TouchableOpacity>
                            <CheckBox
                                title={gardenerUsers[i].first_name+" "+gardenerUsers[i].last_name}
                                textStyle={[this.style.modalInputCheckboxText,this.style.modalOptionsSelectorItemCheckboxText]}
                                containerStyle={[this.style.modalInputCheckbox,this.style.modalOptionsSelectorItemCheckbox]}
                                checked={this.state.addTask_clients.indexOf(gardenerUsers[i].user_id)>=0? true : false}
                                onPress={()=>{
                                    var clients = this.state.addTask_clients;
                                    var index = clients.indexOf(gardenerUsers[i].user_id);
                                    if(index>=0){
                                        clients.splice(index,1);
                                    }else{
                                        clients.push(gardenerUsers[i].user_id);
                                    }
                                    this.setState({addTask_clients: clients});
                                }}
                            />
                        </View>
                    )
                })(i)
            }

        }
        
        
        return indents;
    }
    */

}
;

function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        sessionData: state.sessionReducer.dataLogin,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        userData: state.sessionReducer.data,
        calendarAllTasks: state.agendaCalendarReducer.allTasks,
        calendarLoading: state.agendaCalendarReducer.updating,
        gardenerUsersList: state.gardenerReducer.usersListData,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            actionsAgendaCalendar: bindActionCreators(ActionsAgendaCalendar, dispatch),
        }
    }
}

var style = {
    container: {
        flexShrink: 1,
        flexGrow:1,
        flexDirection: "row",
    },
    statusColumn:{
        flex:1,
        height:"100%",
        padding: 10
    },
    statusColumnIn:{
        backgroundColor: "rgba(0,0,0,0.4)",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: "100%",
        padding: 10,
    },
    dayListTitle:{
        fontFamily: FliwerColors.fonts.title,
        paddingTop:15,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        fontSize: 20,
        textAlign: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        width:"100%",
        color:"white",
        paddingBottom: 15
    },
    newTaskContainer:{
        width: "100%",
        backgroundColor: "rgba(255, 255, 255,0.4)",
        boxShadow: "rgba(74, 74, 73, 0.8) 0px 5px 10px",
        borderColor: "rgb(128, 128, 128)",
        borderWidth: 2,
        borderRadius: 10,
        marginTop: 10,
        marginBottom:10,
        display: "flex",
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    newTaskContainerPLus:{
        fontSize: 60,
        color: "rgb(40,40,40)", 
        fontFamily: FliwerColors.fonts.regular
    },
    taskListView:{
        marginBottom:10
    },




    calendarContainer:{
        paddingLeft:"5%",
        paddingRight:"5%",
        height:"100%",
        flexShrink:1
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center"
    },
    modalTitle:{
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        fontSize: 21,
        marginBottom:10
    },
    modalInputTitle:{
        marginBottom:5
    },
    modalInputArea:{
        height: 100, 
        width:"100%",
        borderColor: 'gray',
        borderWidth: 1, 
        padding: 5, 
        marginTop: 5,
        backgroundColor:"white",
        marginBottom:10
    },
    modalInputCheckbox:{
        backgroundColor: "transparent",
        borderWidth: 0, 
        marginLeft: -8, 
        marginTop: -4
    },
    modalInputCheckboxText:{
        fontWeight: "regular",
    },
    modalOptionsSelector:{
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20
    },
    modalOptionsSelectorItem:{
        marginBottom:5,
        flexDirection:"row",
    },
    modalOptionsSelectorItemImage:{
        width: 40,
        height: 40,
        marginRight:5
    },
    modalOptionsSelectorItemCheckbox:{

    },
    modalOptionsSelectorItemCheckboxText:{

    },

    ":hover": {
        
    },
    "@media (width<=480)": {

    },
    "@media (orientation:portrait)": {
        calendarContainer:{
            paddingLeft:"2%",
            paddingRight:"2%"
        }
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendarContainerStatus));
