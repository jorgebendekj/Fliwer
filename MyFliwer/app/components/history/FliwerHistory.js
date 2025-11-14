'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, Image, Platform, StyleSheet, RefreshControl} = require('react-native');

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {toast} from '../../widgets/toast/toast'

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import ImageBackground from '../../components/imageBackground.js'
import FliwerBackButton from '../custom/FliwerBackButton.js'
import FliwerBubble from '../custom/FliwerBubble.js'

import moment from 'moment';

const MESSAGES_TO_INCREASE = 20;
const DATE_TO_INCREASE = 3600 * 24 * 30 * 1;
const INICIAL_MESSAGES = 15;


class FliwerHistory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            py: 0,
            nowDate: parseInt(new Date() / 1000),
            lastDate: new Date() / 1000 - (3600 * 24 * 15),
            firstLoad: true,
            lastContentY: null,
            showMessagesLimit: INICIAL_MESSAGES,
            previousHeight: null,
            timeout: null,
            noMoreData: false,
            contentSizeHeight: 0,
            paddingTo: 100,
            loadingTimeout: null,
            firstTimeTimeout: null,
            hasHistoric: true,
            modalVisible: false,
            taskManagerHistoryData: {},
            modalStyle: null,
            filtering: this.props.filtering,
            messagesToShow: 0,
            filter: this.props.filter
        };

        this.props.actions.fliwerZoneActions.getZoneData(this.props.idZone).then(() => {
            this.updateTaskManagerHistoryData();
            this.forceUpdate();
        });

        //console.log("FliwerHistory constructor");
    }

    componentWillUnmount = () => {
        clearTimeout(this.state.timeout);
        clearTimeout(this.state.loadingTimeout);
        clearTimeout(this.state.firstTimeTimeout);
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.filtering != nextProps.filtering)
        {
            this.setState({filtering: nextProps.filtering});
        }

        if (this.props.filter !== nextProps.filter) {
            this.setState({filter: nextProps.filter})
            //this.CountFilterAlerts();
        }

    }

    componentDidMount() {
        console.log("componentDidMount");
        if (Platform.OS == 'web') {
            setTimeout(() => {
                console.log("scrollToEnd 1");
                this._scrollView.scrollToEnd({animated: false});
                setTimeout(() => {
                    console.log("scrollToEnd 2");
                    this._scrollView.scrollToEnd({animated: false});
                }, 500);
            }, 500);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log("shouldComponentUpdate",this.props.key2,!(JSON.stringify(this.props)==JSON.stringify(nextProps) && JSON.stringify(this.state)==JSON.stringify(nextState)),this.props,nextProps)
        return  JSON.stringify(this.state) != JSON.stringify(nextState) || !this.state.loading
    }

    updateTaskManagerHistoryData() {
        this.state.taskManagerHistoryData = {};
        var taskManagerHistoryData = this.props.zoneData[this.props.idZone].taskManagerHistoryData;
        var obj;
        for (var key in taskManagerHistoryData) {
            obj = taskManagerHistoryData[key];
            if ( obj.type != "deviceIrrigationHistory")
            {
                this.state.taskManagerHistoryData[key] = obj;
            }
        }
    }

    CountFilterAlerts()
    {
        var zone = this.props.zoneData[this.props.idZone];
        var taskManagerHistoryDate = zone.taskManagerHistoryData;
        var keys = Object.keys(this.state.taskManagerHistoryData).sort();
        var index = keys.length - 1 - this.state.showMessagesLimit;
        var limit = keys.length - 1;
        if (index < 0)
            index = 0;
        if (limit < 0)
            limit = 0;
        var messagesToShow = 0;
        while (Object.keys(this.state.taskManagerHistoryData).length > 0 && index <= limit)
        {
            var id = this.state.taskManagerHistoryData[keys[index]];

            if (id && id.id && taskManagerHistoryDate[id.id]) {
                var found = null;
                if (taskManagerHistoryDate[id.id].type == "alertHistory")
                {
                    found = this.state.filter.find(function (element) {
                        return element == taskManagerHistoryDate[id.id].message.category;
                    });
                } else if ((taskManagerHistoryDate[id.id].type == "irrigationHistory" || taskManagerHistoryDate[id.id].type == "irrigationPending"))
                {
                    found = this.state.filter.find(function (element) {
                        return FliwerAlertMedia.subCategoryToMedia(element).automatic == taskManagerHistoryDate[id.id].message.generatedEvent;
                    });
                } /*else if ((taskManagerHistoryDate[id.id].type == "realtimeProgram")) {
                    console.log("CountFilterAlerts realtimeProgram", taskManagerHistoryDate[id.id])

                }*/

                if (found) {
                    messagesToShow++;
                    //missatges del tipus que vull que es mostrin
                }
            }

            index++;
        }

        this.state.messagesToShow = messagesToShow;

    }

    isCloseToTop( {layoutMeasurement, contentOffset, contentSize}){
        //console.log("el top ara es: "+this.state.paddingTo)
        return Platform.OS == 'android' || Platform.OS == 'ios' ? layoutMeasurement.height + contentOffset.y >= contentSize.height - (layoutMeasurement.height + this.state.paddingTo) : layoutMeasurement.height + contentOffset.y <= layoutMeasurement.height + this.state.paddingTo;
    }

    loadMoreIrrigationHistory(differenceCumulade)
    {
        var limitDate = this.props.zoneData[this.props.idZone].creationTime;

        return new Promise((resolve, reject) => {


            var previousTotalMessages = Object.keys(this.state.taskManagerHistoryData).length;
            //this.setState({loading:true})

            //console.log("He carregat a la cache l'historial des del dia d'avui: "+new Date(this.state.lastDate*1000).toLocaleDateString()+", fins el dia: "+ new Date(this.state.nowDate*1000).toLocaleDateString());

            this.props.actions.fliwerZoneActions.getZoneDataTaskManagerHistory(this.props.idZone, parseInt(this.state.lastDate), parseInt(this.state.nowDate)).then(() => {

                this.updateTaskManagerHistoryData();

                this.state.nowDate = this.state.lastDate;
                this.state.lastDate = this.state.lastDate - DATE_TO_INCREASE
                var nowTotalMessages = Object.keys(this.state.taskManagerHistoryData).length;
                var difference = (nowTotalMessages - previousTotalMessages) + differenceCumulade;
                //console.log("Total missatges ara: "+ nowTotalMessages+ "menys els dabans: "+previousTotalMessages+ " , mes els acumulats: "+differenceCumulade + " , acumulem: "+difference);
                this.CountFilterAlerts();
                if (!this.state.noMoreData && (difference <= MESSAGES_TO_INCREASE || this.state.messagesToShow <= INICIAL_MESSAGES)) {
                    //console.log("com que s'han carregat menys de 25 missatges, carreguem de nou 30 dies mes: anteiorment"+previousTotalMessages+", ara: "+nowTotalMessages);
                    if (this.state.lastDate <= limitDate)
                    {
                        this.state.noMoreData = true;
                    }
                    this.loadMoreIrrigationHistory(difference).then(() => {
                        resolve();
                    });
                } else if (this.state.filtering && !this.state.noMoreData)
                {
                    /*
                     this.CountFilterAlerts();
                     if(this.state.messagesToShow <= INICIAL_MESSAGES)
                     {
                     if(this.state.lastDate <= limitDate) this.state.noMoreData=true;
                     this.loadMoreIrrigationHistory(difference).then(()=> {resolve();})
                     }
                     */
                } else {
                    differenceCumulade = 0;
                    //console.log("S'han carregat mes de X missatges: abans "+previousTotalMessages+", ara: "+nowTotalMessages);
                    //console.log("PAU: loadMoreIrrigationHistory FINISH",differenceCumulade)
                    resolve();
                }
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
            })
        })//fi new Promise

    }

    taskManagertHistoryDataToBubbleObject(data) {
        var obj = {
            ignore: true,
            rightSide: false,
            bubbleTextTable: [],
            containerStyle: null,
            containerINStyle: null,
            textStyle: null,
            textMoreStyle: null,
            showMoreStyle: null,
            triangleStyle: null,
            iconStyle: null,
            time: data?data.time:null,
            icon: null,
            showMore: false,
            modalFunc: null,
            isPast: data?(data.time <  Math.floor(Date.now() / 1000)):false,
            bubbleKey: "bubble_" + data.id
        };

        switch (data.type) {
            case "irrigationHistory":
                obj.bubbleTextTable[0] = (data.message.manualEvent ? this.props.actions.translate.get("fliwerBubble_manual_irrigation") : this.props.actions.translate.get("fliwerBubble_intelligent_irrigation"));
                obj.bubbleTextTable[1] = (data.message.canceled ? this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_cancelled") : this.props.actions.translate.get("fliwerBubble_time_from_to").replace("%FROM%", moment(new Date(data.message.irrigationTime * 1000)).format("HH:mm")).replace("%TO%", moment(new Date(data.message.irrigationEndTime * 1000)).format("HH:mm")))
                if (data.message.duration >= 3600)
                    obj.bubbleTextTable[2] = this.props.actions.translate.get("fliwerHistory_duration_irrigation") + ": " + moment.utc(data.message.duration * 1000).format("h[h] m[min]");
                else
                    obj.bubbleTextTable[2] = (data.message.duration ? this.props.actions.translate.get("fliwerHistory_duration_irrigation") + ": " + moment.utc(data.message.duration * 1000).format("m[min]") : null)

                if (!data.message.canceled && data.message.scheduling && data.message.scheduling.length>0)
                    obj.bubbleTextTable[3] = data.message.taskTime?this.props.actions.translate.get("fliwerBubble_task_time").replace("%TIME%", moment(new Date(data.message.taskTime * 1000)).format("HH:mm")):"";

                obj.rightSide = data.message.manualEvent;
                obj.showMore = true;
                obj.icon = {uri: data.message.icon};
                obj.modalFunc = () => {
                    if (typeof this.props.openModal === 'function')
                        this.props.openModal(true, data);
                }
                obj.ignore = false;
                break;
            case "irrigationPending":
                obj.bubbleTextTable[0] = (data.message.manualEvent ? this.props.actions.translate.get("fliwerBubble_manual_irrigation_pending") : this.props.actions.translate.get("fliwerBubble_intelligent_irrigation_pending"));
                obj.bubbleTextTable[1] = (data.message.canceled ? this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_cancelled") : this.props.actions.translate.get("fliwerBubble_time_from_to").replace("%FROM%", moment(new Date(data.message.irrigationTime * 1000)).format("HH:mm")).replace("%TO%", moment(new Date(data.message.irrigationEndTime * 1000)).format("HH:mm")))
                if (data.message.duration >= 3600)
                    obj.bubbleTextTable[2] = this.props.actions.translate.get("fliwerHistory_duration_irrigation") + ": " + moment.utc(data.message.duration * 1000).format("h[h] m[min]");
                else
                    obj.bubbleTextTable[2] = (data.message.duration ? this.props.actions.translate.get("fliwerHistory_duration_irrigation") + ": " + moment.utc(data.message.duration * 1000).format("m[min]") : null)
                if (!data.message.canceled && data.message.scheduling && data.message.scheduling.length>0)
                    obj.bubbleTextTable[3] = data.message.taskTime?this.props.actions.translate.get("fliwerBubble_task_time").replace("%TIME%", moment(new Date(data.message.taskTime * 1000)).format("HH:mm")):"";    
                obj.rightSide = data.message.manualEvent;
                obj.showMore = true;
                obj.icon = {uri: data.message.icon};
                obj.modalFunc = () => {
                    if (typeof this.props.openModal === 'function')
                        this.props.openModal(true, data);
                }
                obj.ignore = false;
                obj.bubbleKey = obj.bubbleKey.replace("irrigationPending", "irrigationHistory");
                //console.log("obj.bubbleKey", obj.bubbleKey)
                break;
            case "alertHistory":
                var media = FliwerAlertMedia.subCategoryToMedia(data.message.subcategory)
                obj.icon = media.img;
                obj.showMore = true;
                obj.bubbleTextTable[0] = media.title;
                obj.containerINStyle = {backgroundColor: media.color};
                obj.triangleStyle = {borderTopColor: media.color}
                obj.showMoreStyle = {backgroundColor: media.color2};
                obj.textStyle = {color: "white"};
                obj.iconStyle = {height: 33};
                obj.modalFunc = () => {
                    if (typeof this.props.openModal === 'function')
                        this.props.openModal(true, data, {backgroundColor: media.color, borderRadius: 20});
                }
                obj.ignore = false;
                break;
            case "chatHistory":
                if (data.message.idUser)
                    obj.rightSide = true;
                obj.bubbleTextTable[0] = data.message.text;
                obj.ignore = false;
                break;
            case "realtimeProgram":
                obj.bubbleTextTable[0] = this.props.actions.translate.get('general_realtime_mode');
                if (data.message.cancelled) {
                    obj.bubbleTextTable[1] = this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_cancelled");
                    obj.bubbleTextTable[2] = null;
                }
                else {
                    if (data.message.status == 'finished') {
                        obj.bubbleTextTable[1] = this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_finished");
                        obj.bubbleTextTable[2] = null;
                    }
                    else {
                        obj.isPast = false;
                        if (data.message.status == 'activated') {
                            obj.bubbleTextTable[1] = this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_activated");
                        }
                        else {
                            obj.bubbleTextTable[1] = this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_pending");
                        }
                        obj.bubbleTextTable[2] = this.props.actions.translate.get("fliwerBubble_time_from_to").replace("%FROM%", moment(new Date(data.message.programmedTime * 1000)).format("HH:mm")).replace("%TO%", moment(new Date(data.message.programmedEndTime * 1000)).format("HH:mm"));
                    }
                }

                obj.containerStyle = {backgroundColor: "#9FD5F9"};
                obj.containerINStyle = {backgroundColor: "#9FD5F9"};
                obj.triangleStyle = {borderTopColor: "#9FD5F9"}
                obj.showMoreStyle = {backgroundColor: "#5DADE2"};
                obj.rightSide = false;
                obj.showMore = true;
                obj.icon = {uri: data.message.icon};
                obj.iconStyle = {height: 40, width: 40};
                obj.modalFunc = () => {
                    if (typeof this.props.openModal === 'function')
                        this.props.openModal(true, data);
                };
                obj.ignore = false;
                break;
        }

        return obj;
    }

    render() {
        var {containerStyle, style, textStyle, text, onPress, idZone} = this.props;
        //console.log("loading: "+this.state.loading);

        //if (Object.keys(this.state.taskManagerHistoryData).length > 0)
        //{
            if (!this.props.zoneData[this.props.idZone].creationTime) {
                this.state.hasHistoric = false;
            } else {
                //var limitDate=this.props.zoneData[this.props.idZone].creationTime;
                this.state.hasHistoric = true;
            }

            //console.log("Actualment hi ha a la cache: ",Object.keys(this.state.taskManagerHistoryData).length, " i el limit esta a: " + this.state.showMessagesLimit );

            this.CountFilterAlerts();

            while (this.state.hasHistoric && this.state.filtering && this.state.messagesToShow <= INICIAL_MESSAGES && (Object.keys(this.state.taskManagerHistoryData).length >= this.state.showMessagesLimit))
            {
                this.state.showMessagesLimit = this.state.showMessagesLimit + MESSAGES_TO_INCREASE;
            }

            if (this.state.hasHistoric && (this.state.firstLoad) && (Object.keys(this.state.taskManagerHistoryData).length <= this.state.showMessagesLimit))
            {
                this.loadMoreIrrigationHistory(0).then(() => {
                    //console.log("Succes -> this.loadMoreIrrigationHistory(0)");
                    if (Platform.OS == 'web') {
                        this._scrollView.scrollToEnd({animated: false});
                    }
                    this.setState({loading: false, firstLoad: false});
                });
            }

        //}

        return (
                <ImageBackground resizeMode={"cover"} loading={this.state.loading} style={{flexShrink:1}}>
                    <ScrollView  style={this.style.containerScroll} ref={(s) => {
                                                          this._scrollView = s;
                                                      }}
                                onScroll={({nativeEvent}) => {
                                        this.state.lastContentY = nativeEvent.contentOffset.y;
                                        /*
                                         if(!this.state.blockY || nativeEvent.contentOffset.y-this.state.lastContentY<2000){
                                         this.state.lastContentY= nativeEvent.contentOffset.y
                                         console.log("y",this.state.lastContentY)
                                         }else{
                                         console.log("blockedY",nativeEvent.contentOffset.y)
                                         }
                                         */
                                        this.state.contentSizeHeight = nativeEvent.contentSize.height
                                        //console.log("top y: "+nativeEvent.contentOffset.y);

                                        if (!this.state.firstLoad)
                                        {
                                            this.state.paddingTo = nativeEvent.contentSize.height / 6;

                                             if (!this.state.noMoreData && !this.state.loading && this.isCloseToTop(nativeEvent)) {
                                                 //console.log("we are on top!");
                                                 //this.state.blockY= true;
                                                    new Promise((resolve, reject) => {
                                                        //console.log("limit: "+this.state.showMessagesLimit+ " , total cache: ",Object.keys(this.state.taskManagerHistoryData).length);
                                                        if ((this.state.showMessagesLimit + MESSAGES_TO_INCREASE) >= Object.keys(this.state.taskManagerHistoryData).length)
                                                        {
                                                            //console.log("Entro a la funcio de carregar cache.");
                                                            this.loadMoreIrrigationHistory(0).then(() => {
                                                                resolve();
                                                            })
                                                            //console.log("Surto de la carrega de dades a cache");
                                                        } else {
                                                            resolve();
                                                        }
                                                    }).then(() => {
                                                        this.state.showMessagesLimit = this.state.showMessagesLimit + MESSAGES_TO_INCREASE;
                                                        this.setState({loading: false});
                                                    });
                                                }
                                        }
                                }}

                                scrollEventThrottle={100}
                                onContentSizeChange={(widh, height) => { //aquest height es el de fora: content
                                        //anar al botom al iniciar el chat
                                        if (height > 40 && this.state.firstLoad && !this.state.loading) {
                                            if (this.state.firstTimeTimeout)
                                                clearTimeout(this.state.firstTimeTimeout);
                                            this.state.firstTimeTimeout = setTimeout(() => {
                                                this.setState({py: height})
                                                if (Platform.OS == 'web') {
                                                    this._scrollView.scrollToEnd({animated: false});
                                                }
                                                //console.log("setLoading1");
                                                 //if(typeof setLoading==='function') this.props.setLoading(false);
                                                 this.setState({loading: false})
                                                 this.state.timeout = setTimeout(() => {
                                                     this.state.firstLoad = false;
                                                 }, 0)

                                             }, 0)
                                         }

                                         var a = height - this.state.previousHeight
                                         var b = a + this.state.lastContentY
                                         //mantenir posicio al carregar dades
                                         if (this.state.previousHeight != height && !this.state.firstLoad)
                                         {
                                             //console.log("altura cambiadaa! altura anterior: "+ this.state.previousHeight + " ,nova altura"+ height+ "= la resta es "+a+", i la nova y es: "+b)
                                             //console.log("prevH",this.state.previousHeight,"H",height,"diff",a,"last Y",this.state.lastContentY,"new Y",b)
                                             if (Platform.OS == 'web' && this.state.lastContentY == 0)
                                                 this._scrollView.scrollTo({x: 0, y: b, duration: 0, animated: false});
                                             //this.state.blockY=false;
                                             //this.state.YdiffWhileBlocked=0;
                                             this.state.previousHeight = height;
                                         } else {
                                             this.state.previousHeight = height;
                                         }
                                     }}
                                 contentContainerStyle={this.style.containerInScroll}>
                        <View style={this.style.containerScrollIn} >
                            <View style={this.style.bubbleContainer} >
                                {this.renderBubbles()}
                            </View>
                        </View>

                    </ScrollView>
                </ImageBackground>


                )
    }

    renderBubbles() {
        var indents = [];
        var bubbleTextTable = [];
        var lastDate = null;
        var today = moment().format("YYYY-MM-DD");

        if (!this.state.hasHistoric)
        {
            //console.log("No history");
            indents.push(
                    <View style={this.style.textStartContainer}>
                        <Text style={this.style.textStart}>{this.props.actions.translate.get("FliwerHistory_no_messages")}</Text>
                    </View>)
        } else
        {
            debugger;
            if (Object.keys(this.state.taskManagerHistoryData).length != 0)
            {
                //console.log("Here history data");
                var zone = this.props.zoneData[this.props.idZone];

                var taskManagerHistoryDate = zone.taskManagerHistoryData
                var id = {};

                if (!this.state.noMoreData) {
                    indents.push(
                            <View style={this.style.imageLoadingConatiner}>
                                <Image key={1} style={[this.style.imageLoading]} draggable={false} source={{uri: (!global.envVars.TARGET_RAINOLVE?'https://old.fliwer.com/myfliwer/img/loadingapp.gif':'https://old.fliwer.com/myfliwer/img/loadingapprainolve.gif')}} resizeMode={"contain"} />
                            </View>)
                } else {
                    indents.push(
                            <View style={this.style.textStartContainer}>
                                <Text style={this.style.textStart}>{this.props.actions.translate.get("fliwerHistory_start_conversation")}</Text>
                            </View>)
                }
                var keys = Object.keys(this.state.taskManagerHistoryData).sort();
                var index = keys.length - 1 - this.state.showMessagesLimit;
                var limit = keys.length - 1;
                if (index < 0)
                    index = 0;
                if (limit < 0)
                    limit = 0;

                var nbubble = 0;
                //console.log(1,ini)

                //console.log("this.state.taskManagerHistoryData", this.state.taskManagerHistoryData);
                while (index <= limit) {
                    var hisData = this.state.taskManagerHistoryData[keys[index]];
                    id = hisData;
                    var bubbleObject = {ignore:true};
                    if(taskManagerHistoryDate[id.id])bubbleObject=this.taskManagertHistoryDataToBubbleObject(taskManagerHistoryDate[id.id]);
                    if (!bubbleObject.ignore) {

                        var found = this.state.filter.find(function (element) {
                            var found = false;
                            if (element == taskManagerHistoryDate[id.id].message.category)
                                var found = true;
                            else if (element == "automatic" && FliwerAlertMedia.subCategoryToMedia(element).automatic == taskManagerHistoryDate[id.id].message.generatedEvent)
                                var found = true;
                            else if (element == "manual" && FliwerAlertMedia.subCategoryToMedia(element).automatic == taskManagerHistoryDate[id.id].message.generatedEvent)
                                var found = true;
                            return found;
                        });

                        if (found)
                        {
                            //console.log("mostro:"+id.message.category);
                            var bubbleTextTable = [];
                            //var actuallyDate = new Date(taskManagerHistoryDate[id.id].time * 1000).toLocaleDateString();
                            var actuallyDate = moment(taskManagerHistoryDate[id.id].time * 1000).format("YYYY-MM-DD");
                            //var isTomorrow = !(moment(actuallyDate).isBefore(today) || moment(actuallyDate).isSame(today));
                            var isToday = moment(actuallyDate).isSame(today);
                            var isTomorrow = moment(actuallyDate).isAfter(today);

                            //render the center date
                            if (lastDate != actuallyDate)
                            {
                                lastDate = actuallyDate;

                                indents.push(
                                        <View key={"_" + taskManagerHistoryDate[id.id].id} style={this.style.dateCointainer}>
                                            <View style={this.style.line2}></View>
                                            <View style={this.style.date}>
                                                <Text style={isToday? {fontWeight: "bold"} : {}}>{isTomorrow? this.props.actions.translate.get("for_tomorrow") : ((isToday? this.props.actions.translate.get("today")+ ", " : "") + moment(new Date(taskManagerHistoryDate[id.id].time * 1000)).format("LL"))}</Text>
                                            </View>
                                            <View style={this.style.line2}></View>
                                        </View>
                                );

                                //  Hello
                                if (!bubbleObject.rightSide) {
                                    if (!isTomorrow)
                                    {
                                        var bubbleHellow = this.taskManagertHistoryDataToBubbleObject({type: "chatHistory", id: "_", time: taskManagerHistoryDate[id.id].time, message: {idUser: null, text: this.props.actions.translate.get("fliwerBubble_hi") + " " + this.props.sessionData.first_name + "! " + this.props.actions.translate.get("fliwerBubble_how_are_you")}});
                                        indents.push(<FliwerBubble key={"bubble_" + taskManagerHistoryDate[id.id].id + "_hi"} keys={"bubble_" + id.id + "_hi"} time={bubbleHellow.time} showMore={bubbleHellow.showMore} icon={bubbleHellow.icon} onButtonPress={bubbleHellow.onButtonPress} rightSide={bubbleHellow.rightSide} bubbleTextTable={bubbleHellow.bubbleTextTable} containerStyle={bubbleHellow.containerStyle} containerINStyle={bubbleHellow.containerINStyle} textStyle={bubbleHellow.textStyle} textMoreStyle={bubbleHellow.textMoreStyle} showMoreStyle={bubbleHellow.showMoreStyle} iconStyle={bubbleHellow.iconStyle} triangleStyle={bubbleHellow.triangleStyle} idZone={this.props.idZone} isToday={isToday} isPast={bubbleObject.isPast} />);
                                    }
                                    else
                                    {
                                        console.log("Tomorrow task hisData:", hisData);
                                    }
                                }
                            }

                            //console.log("key", bubbleObject.bubbleKey)
                            indents.push(<FliwerBubble key={bubbleObject.bubbleKey} keys={"bubble_" + id.id} time={bubbleObject.time} showMore={bubbleObject.showMore} modalFunc={bubbleObject.modalFunc} icon={bubbleObject.icon} onButtonPress={bubbleObject.onButtonPress} rightSide={bubbleObject.rightSide} bubbleTextTable={bubbleObject.bubbleTextTable} containerStyle={bubbleObject.containerStyle} containerINStyle={bubbleObject.containerINStyle} textStyle={bubbleObject.textStyle} textMoreStyle={bubbleObject.textMoreStyle} showMoreStyle={bubbleObject.showMoreStyle} iconStyle={bubbleObject.iconStyle} triangleStyle={bubbleObject.triangleStyle} idZone={this.props.idZone} isToday={isToday} isPast={bubbleObject.isPast} />)
                            nbubble++;

                        } else {
                            //console.log("No mostro: "+id.message.category);
                        }
                    }

                    index++;

                }

            }
            else
            {
                //console.log("Ouppss");
            }
        }

        return indents;
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        sessionData: state.sessionReducer.data,
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
        }
    }
}


var styles = {
    containerScroll: {
    },
    containerScrollIn: {
        paddingLeft: 90,
        paddingRight: 90
    },
    containerInScroll: {
    },
    dateCointainer: {
        width: "80%",
        flexDirection: 'row',
        alignItems: "center",
        alignSelf: "center",
    },
    date: {
        paddingRight: 6,
        paddingLeft: 6,
    },
    imageLoadingConatiner: {
        alignSelf: "center",
    },
    imageLoading: {
        height: 51,
        width: 51,
    },
    textStart: {
        backgroundColor: FliwerColors.fonts.light,
    },
    textStartContainer: {
        backgroundColor: FliwerColors.secondary.gray,
        borderBottomLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
        borderTopLeftRadius: 15,
        alignSelf: "center",
        marginBottom: 10,
        marginTop: 10,
        opacity: 0.5,
        paddingRight: 5,
        paddingLeft: 5,
    },
    line2: {
        height: 1,
        backgroundColor: FliwerColors.secondary.gray,
        flexGrow: 1,
    },
    "@media (width<=500)": {
        containerScrollIn: {
            paddingLeft: 20,
            paddingRight: 20,
        }
    },
    "@media (width>500 && width<=800)": {
        containerScrollIn: {
            paddingLeft: 50,
            paddingRight: 50,
        }
    },
    "@media (width>800 && width<=1000)": {
        containerScrollIn: {
            paddingLeft: 70,
            paddingRight: 70,
        }
    }


};

if (Platform.OS == 'android' || Platform.OS == 'ios') {
    styles.containerScroll = {transform: [{rotate: '180deg'}, {scaleX: -1}]}
    styles.containerScrollIn = {transform: [{rotate: '180deg'}, {scaleX: -1}]}
}


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, FliwerHistory));
