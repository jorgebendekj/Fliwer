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

import moment from 'moment';

import {FliwerColors} from '../../utils/FliwerColors.js'
import * as ActionsLang from '../../actions/languageActions.js';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import FliwerCalmButton from '../custom/FliwerCalmButton.js'
import trashImage  from '../../assets/img/trash.png'

class FliwerAgendaCalendarTaskListView extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    
    render() {
        var task=this.props.task;

        return (
            <View style={[this.style.taskContainer,this.props.style]}>
                {
                    this.state.mediaStyle.orientation=='landscape' ? (
                        <View style={this.style.taskContainerImage}>
                            <Image source={{uri:task.userCreator.image}} resizeMode={"cover"} style={this.style.taskCreatorProfileImage} />
                            <Text  style={this.style.taskCreatorText}>{this.props.actions.translate.get('By') + " " + task.userCreator.first_name+" "+task.userCreator.last_name}</Text>
                        </View>
                    ):null
                }

                <View style={this.style.taskContainerBody}>
                    <View style={this.style.taskContainerBodyText}>
                        {
                            this.state.mediaStyle.orientation=='portrait' ? (
                                <View style={this.style.taskContainerImage}>
                                    <Image source={{uri:task.userCreator.image}} resizeMode={"cover"} style={this.style.taskCreatorProfileImage} />
                                </View>
                            ):null
                        }
                        <View style={this.style.taskContainerBodyTextIn}>
                            <Text style={this.style.taskContainerBodyTextTitle}>{task.title}</Text>
                            {this.renderTaskTime()}
                            {
                                this.state.mediaStyle.orientation=='landscape' ? (
                                    <Text style={this.style.taskContainerBodyTextDescription}>{task.description}</Text>
                                ):null
                            }
                        </View>
                                
                        <TouchableOpacity style={this.style.deleteButton} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
                            if (this.props.onDelete)
                                this.props.onDelete(this.props.task)
                            }
                        }>
                            <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                        </TouchableOpacity>
                    </View>
                    <View style={this.style.taskContainerBodyInfo}>
                        {
                            this.state.mediaStyle.orientation=='portrait' ? (
                                <Text style={this.style.taskContainerBodyTextDescription}>{task.description}</Text>
                            ):null
                        }
                        {
                            task.users && task.users.length > 0 ? (
                                <View style={[this.style.taskContainerUsers]}>
                                    <View style={this.style.taskContainerUsersTitle}>
                                        <Text style={this.style.taskContainerUsersTitleText}>{this.props.actions.translate.get('Users')}</Text>
                                    </View>
                                    <View style={this.style.taskContainerUsersList}>
                                        {this.renderTaskUsers()}
                                    </View>
                                </View>
                            ):null
                        }
                        {
                            task.clients && task.clients.length > 0 ? (
                        <View style={[this.style.taskContainerClients,task.attachments && task.attachments.length>0?this.style.marginRight:{}]}>
                            <View style={this.style.taskContainerClientsTitle}>
                                <Text style={this.style.taskContainerClientsTitleText}>{this.props.actions.translate.get('Customers')}</Text>
                            </View>
                            <View style={this.style.taskContainerClientsList}>
                                {this.renderTaskClients()}
                            </View>
                        </View>
                            ):null
                        }
                        {
                            task.attachments && task.attachments.length > 0 ? (
                        <View style={this.style.taskContainerAttachments}>
                            <View style={this.style.taskContainerAttachmentsTitle}>
                                <Text style={this.style.taskContainerAttachmentsTitleText}>{this.props.actions.translate.get('Attached')}</Text>
                            </View>
                            <View style={this.style.taskContainerAttachmentsList}>
                                {this.renderTaskAttachments()}
                            </View>
                        </View>
                            ):null
                        }
                    </View>
                </View>

            </View>
        )
    }

    renderTaskTime(){
        var indents=[];
        var task=this.props.task;

        var creatorString="";
        if(this.state.mediaStyle.orientation=='portrait')creatorString=this.props.actions.translate.get('By') + " " + task.userCreator.first_name+" "+task.userCreator.last_name+". "

        if(task.allDay){
            indents.push(
                <View style={this.style.taskContainerBodyTextTime}>
                    <Text style={this.style.taskContainerBodyTextTimeText}>{creatorString+moment(new Date(task.start)).format("LL HH:mm")+ " - " + this.props.actions.translate.get('All_day')}</Text>
                </View>
            )
        }else if(task.end){
            indents.push(
                <View style={this.style.taskContainerBodyTextTime}>
                    <Text style={this.style.taskContainerBodyTextTimeText}>{creatorString+moment(new Date(task.start)).format("LL HH:mm")+" - "+moment(new Date(task.end)).format("LL HH:mm")}</Text>
                </View>
            )
        }else{
            indents.push(
                <View style={this.style.taskContainerBodyTextTime}>
                    <Text style={this.style.taskContainerBodyTextTimeText}>{creatorString+moment(new Date(task.start)).format("LL HH:mm")}</Text>
                </View>
            )
        }

        return indents;
    }

    renderTaskUsers(){
        var indents=[];
        var task=this.props.task;
        for(var i=0;i<task.users.length;i++){
            indents.push(
                <View style={this.style.taskContainerUsersListItem}>
                    <Image source={{uri:task.users[i].image}} resizeMode={"cover"} style={this.style.taskContainerUsersListItemImage} />
                    <Text style={this.style.taskContainerUsersListItemText}>{task.users[i].first_name+" "+task.users[i].last_name}</Text>
                </View>
            )
        }

        return indents;
    }

    renderTaskClients(){
        var indents=[];
        var task=this.props.task;
        for(var i=0;i<task.clients.length;i++){
            indents.push(
                <View style={this.style.taskContainerClientsListItem}>
                    <Image source={{uri:task.clients[i].image}} resizeMode={"cover"} style={this.style.taskContainerClientsListItemImage} />
                    <Text style={this.style.taskContainerClientsListItemText}>{task.clients[i].first_name+" "+task.clients[i].last_name}</Text>
                </View>
            )
        }
        return indents;
    }

    renderTaskAttachments(){
        var indents=[];
        var task=this.props.task;
        for(var i=0;i<task.attachments.length;i++){
            indents.push(
                <View style={this.style.taskContainerAttachmentsListItem}>
                    <Text style={this.style.taskContainerAttachmentsListItemText}>{task.attachments[i].idCourse+"-TODO"}</Text>
                </View>
            )
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
    taskContainer:{
        width: "100%",
        backgroundColor: "rgb(230,230,230)",
        borderRadius: 10,
        marginBottom: 20,
        padding: 20,
        display: "flex",
        flexDirection: "row",
        alignItems:"center"
    },
    taskContainerImage:{
        alignItems:"center",
        marginRight: 20
    },
    taskCreatorProfileImage:{
        height: 100,
        width: 100,
        borderRadius: 100,
        marginBottom:10
    },
    taskCreatorText:{
        

    },
    taskContainerBody:{
        flexGrow:1,
        flexShrink:1
    },
    taskContainerBodyText:{
        marginBottom: 10,
        flexDirection:"row"
    },
    taskContainerBodyTextIn:{
        flexGrow:1,
        flexShrink:1
    },
    taskContainerBodyTextTitle:{
        fontSize: 20,
        fontFamily: FliwerColors.fonts.title,
        marginBottom: 5,
    },
    taskContainerBodyTextDescription:{
        fontSize: 16,
        marginBottom: 10,
        textAlign: "justify"
    },
    taskContainerBodyTextTime:{
        flexDirection: "row",
        marginBottom: 10
    },
    taskContainerBodyTextTimeText:{
        fontSize: 14,
    },
    taskContainerBodyInfo:{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: 10
    },
    marginRight:{
        marginRight: "5%"
    },
    taskContainerUsers:{
        backgroundColor: "rgb(245,245,245)",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        alignItems:"center",
        flexGrow:1
    },
    taskContainerUsersTitle:{
        
    },
    taskContainerUsersTitleText:{
        fontSize: 16
    },
    taskContainerUsersList:{
        flexDirection: "row",
        marginLeft: 10
    },
    taskContainerClients:{
        backgroundColor: "rgb(245,245,245)",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        alignItems:"center",
        flexGrow:1
    },
    taskContainerClientsTitle:{
        
    },
    taskContainerClientsTitleText:{
        fontSize: 16
    },
    taskContainerClientsList:{
        flexDirection: "row",
        marginLeft: 10
    },
    taskContainerAttachments:{
        backgroundColor: "rgb(245,245,245)",
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        alignItems:"center",
        flexGrow:1
    },
    taskContainerAttachmentsTitle:{
        
    },
    taskContainerAttachmentsTitleText:{
        fontSize: 16
        
    },
    taskContainerAttachmentsList:{
        flexDirection: "row",
        marginLeft: 10
    },
    taskContainerUsersListItem:{
        alignItems: "center",
        marginLeft: 10,
        marginRight: 10
    },
    taskContainerUsersListItemImage:{
        width: 40,
        height: 40,
        borderRadius: 40
    },
    taskContainerUsersListItemText:{

    },
    taskContainerClientsListItem:{
        alignItems: "center",
        marginLeft: 10,
        marginRight: 10
    },
    taskContainerClientsListItemImage:{
        width: 40,
        height: 40,
        borderRadius: 40
    },
    taskContainerClientsListItemText:{

    },
    taskContainerAttachmentsListItem:{
        alignItems: "center",
        marginLeft: 10,
        marginRight: 10
    },
    taskContainerAttachmentsListItemText:{

    },
    deleteButton: {
        width: 40,
        height: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    trashIcon: {
        width: 25,
        height: 25,
        justifyContent: "flex-end",
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(130%)"
        },
    },
    "@media (width<=800)": {
        
    },
    "@media (orientation:portrait)": {
        taskContainerBodyText:{
            flexDirection:"row"
        },
        taskContainerImage:{
            marginRight:10
        },
        taskCreatorProfileImage:{
            height: 70,
            width: 70,
            borderRadius: 100,
            marginBottom:5
        },
        taskContainerBodyTextDescription:{
            marginbottom: 20,
            width: "100%"
        },
        taskContainerBodyInfo:{
            flexDirection: "column"
        },
        taskContainerUsers:{
            width: "100%"
        },
        taskContainerClients:{
            width: "100%"
        },
        taskContainerAttachments:{
            width: "100%"
        }
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendarTaskListView));
