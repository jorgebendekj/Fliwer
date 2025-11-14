'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, TouchableOpacity, Image, Platform, StyleSheet, RefreshControl} = require('react-native');

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {toast} from '../../widgets/toast/toast'

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

import moment from 'moment';
import Modal from '../../widgets/modal/modal'
import FliwerCarousel from '../custom/FliwerCarousel'
import FliwerButtonProgramDetail  from '../custom/FliwerButtonProgramDetail.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerVerifyEmailModalGeneric from '../custom/FliwerVerifyEmailModalGeneric.js'
import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'


import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import valveIcon  from '../../assets/img/valve.png'
import pumpIcon  from '../../assets/img/pump.png'

import defaultIcon  from '../../assets/img/fliwer_icon1.png'
import deviceSensor  from '../../assets/img/6_Sensor-planted.png'
import deviceControl9  from '../../assets/img/device_control.png'
import deviceControl24  from '../../assets/img/Control24v.png'
import deviceSDial  from '../../assets/img/device_sdial2.png'
import deviceWDial  from '../../assets/img/device_wdial.png'
import trashImage  from '../../assets/img/trash.png'


class FliwerProgramDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            emailVerificationNeeded: false,
            taskManagerHistoryData: null,
            loading: false
        };
    };

    setModalVisible(visible, data, type) {

        if(visible){
            global.frontLayer.display(true);
            global.frontLayer.renderLayer(() => {
                var indents=[];
                //indents.push(<Text>{"Hola"}</Text>)

                if(this.state.emailVerificationNeeded){
                  indents.push(
                    <FliwerVerifyEmailModalGeneric
                        visible={this.state.emailVerificationNeeded}
                        onFinalize={() => {
                          this.state.emailVerificationNeeded=false;
                          this.setModalVisible(false, this.state.idIrrigationProgram, this.state.isRealtimeMode);
                          //this.setState({emailVerificationNeeded: false});
                        }}
                        loadingModal={false}
                        nested={true}
                        email={this.props.sessionData.email}
                        setLoading={(v) => this.setLoading(v)}
                        onAction={(uuid,code)=>{
                            //return this.state.emailVerificationSuccess(uuid,code);
                            if(this.state.emailVerificationType=='cancel')
                                return this.cancelManualPendingIrrigation(uuid,code);
                            else return this.deleteManualPendingIrrigation(uuid,code);
                        }}
                        onError={(err)=>{
                          if (err && err.reason)
                              toast.error(err.reason);
                          //this.setModalVisible(false, this.state.idIrrigationProgram, this.state.isRealtimeMode);
                        }}
                        onSuccess={()=>{
                          this.props.rerenderParentCallback();
                        }}
                        onCancel={() => {
                          this.state.emailVerificationNeeded=false;
                          this.setModalVisible(false, this.state.taskManagerHistoryData);
                          //this.setState({emailVerificationNeeded: false});
                        }}
                    />
                  );
                }else{
                  indents.push(
                          <FliwerDeleteModal
                              visible={true}
                              onClose={() => {
                                  this.setModalVisible(false, this.state.taskManagerHistoryData);
                              }}
                              onConfirm={async () => {
                                  //await this.cancelManualPendingIrrigation();
                                  this.state.emailVerificationNeeded=true;
                                  this.state.emailVerificationType=type;
                                  this.setModalVisible(true, this.state.taskManagerHistoryData);
                              }}
                              title={this.state.taskManagerHistoryData && this.state.taskManagerHistoryData.type == "realtimeProgram"? this.props.actions.translate.get('taskManager_sure_delete_realtime_task'): (type=='cancel'?this.props.actions.translate.get('taskManager_cancelProgram'): (type?this.props.actions.translate.get('taskManager_reloadProgram'):this.props.actions.translate.get('taskManager_sure_delete') ) )  }
                              password={false}
                              loadingModal={false}
                              nested={true}
                              />
                      );
                }

                return indents;
            });
        }else{
            global.frontLayer.display(false);
            global.frontLayer.renderLayer(() => {});
        }
        this.setState({taskManagerHistoryData: data});
    }

    setLoading(v) {
        this.setState({loading: v})
    }

    typeToImg(type) {
        switch (type) {
            case "SENS":
                return deviceSensor;
            case "CONTROL_9":
                return deviceControl9;
            case "CONTROL_24":
                return deviceControl24;
            case "UNIPRO16":
            case "UNIPRO12":
            case "UNIPRO9":
            case "UNIPRO6":
                return deviceSDial;
            case "TBD6":
            case "TBD4":
            case "TBD2":
            case "TBD1":
                return deviceWDial;
            default:
                return defaultIcon;
        }
    }

    render() {
        var {modalStyle} = this.props;
        if (this.props.visible)
            return (
                    <Modal animationType="fade" nested={true} inStyle={this.style.modalIn} visible={this.props.visible} onClose={(v) => {
                            this.setModalVisible(false, this.state.taskManagerHistoryData);
                            this.props.modalClosed();
                        }}>
                        <View style={[this.style.modalView, modalStyle]}>
                            <View style={this.style.optionsContainer}>
                                {this.props.data ? this.renderModalContent() : null}
                            </View>
                        </View>
                        {/*this.renderDeleteModal()*/}
                        </Modal>
                    )
        else
            return [];
    }
/*
    renderDeleteModal() {

        if (this.state.modalVisible) {
            console.log(2)
            global.frontLayer.renderLayer(() => {
                return (
                        <FliwerDeleteModal
                            visible={this.state.modalVisible}
                            onClose={() => {
                                this.setModalVisible(false, this.state.taskManagerHistoryData);
                            }}
                            onConfirm={async () => {
                                await this.cancelManualPendingIrrigation();
                            }}
                            title={this.state.taskManagerHistoryData && this.state.taskManagerHistoryData.type == "realtimeProgram"? this.props.actions.translate.get('taskManager_sure_delete_realtime_task'): this.props.actions.translate.get('taskManager_sure_delete')}
                            password={false}
                            loadingModal={this.state.loading}
                            />
                    );
            });
            global.frontLayer.display(true);
        } else
            return [];

    }
*/
    renderModalContent()
    {
        var {data} = this.props;
        var indents = []
        if (data) {
            switch (data.type) {
                case "irrigationHistory":
                case "irrigationPending":
                    indents = indents.concat(this.renderModalContentIrrigation());
                    break;
                case "alertHistory":
                    indents = indents.concat(this.renderModalContentAlert());
                    break;
                case "realtimeProgram":
                    indents = indents.concat(this.renderModalContentRealtimeProgram());
                    break;
            }
        }
        return indents;
    }

    renderModalContentRealtimeProgram() {
        var indents = []
        var data = this.props.data.message;

        var statusText;
        var showMoreInfo = false;
        if (data.cancelled)
            statusText = this.props.actions.translate.get("fliwerBubble_cancelled");
        else {
            if (data.status == 'finished')
                statusText = this.props.actions.translate.get("fliwerBubble_finished");
            else {

                if (data.status == 'activated') {
                    statusText = this.props.actions.translate.get("fliwerBubble_activated");
                    showMoreInfo = true;
                }
                else
                    statusText = this.props.actions.translate.get("fliwerBubble_pending");
            }
        }

        var from = this.props.actions.translate.get("fliwerBubble_time_from_to").replace("%FROM%", moment(new Date(data.programmedTime * 1000)).format("HH:mm")).replace("%TO%", moment(new Date(data.programmedEndTime * 1000)).format("HH:mm"));
        var duration = this.props.actions.translate.get("fliwerHistory_duration_irrigation") + ": " + moment.utc(data.duration * 1000).format("h[h] m[min]");
        var elapsedTime = null;
        var remainingTime = null;
        if (showMoreInfo) {
            elapsedTime = this.props.actions.translate.get("deviceCard_elapsedtime") + ": ";
            if (data.elapsed >= 3600)
                elapsedTime += moment.utc(data.elapsed * 1000).format("h[h] m[min]");
            else
                elapsedTime += moment.utc(data.elapsed * 1000).format("m[min]");
            remainingTime = this.props.actions.translate.get("deviceCard_remainingtime") + ": ";
            if (data.remainingTime >= 3600)
                remainingTime += moment.utc(data.remainingTime * 1000).format("h[h] m[min]");
            else
                remainingTime += moment.utc(data.remainingTime * 1000).format("m[min]");
        }

        indents.push(
                <View style={this.style.titleTopConatiner}>
                    <Text style={this.style.titleTop}>{this.props.actions.translate.get('general_realtime_mode')}</Text>
                </View>
                );

        indents.push(
                <View style={[this.style.contentTop, {width: 350, padding: 20}]}>
                    <View style={this.style.contentTopLeft}>
                        {false?<View style={this.style.titleTopText}><Text>{"Hora de creación" + ": " + moment(new Date(data.insertTime * 1000)).format("HH:mm")} </Text></View>:null}
                        <View style={[this.style.topText, {marginTop: 5}]}><Text>{this.props.actions.translate.get("fliwerBubble_status") + ": " + statusText}</Text></View>
                        <View style={[this.style.topText, {marginTop: 5}]}><Text>{from}</Text></View>
                        <View style={[this.style.topText, {marginTop: 5}]}><Text>{duration}</Text></View>
                        {elapsedTime?<View style={[this.style.topText, {marginTop: 5}]}><Text>{elapsedTime}</Text></View>:null}
                        {remainingTime?<View style={[this.style.topText, {marginTop: 5}]}><Text>{remainingTime}</Text></View>:null}
                    </View>
                    <View>
                        <View style={[this.style.imageConatiner, {}]}>
                            <Image style={[this.style.image, {height: 45, width: 45}]} draggable={false} source={data.icon} resizeMode={"contain"} />
                        </View>
                    </View>
                    <View>
                        {this.drawTrashButton()}
                    </View>
                </View>
                );

        return indents;
    }

    renderModalContentIrrigation() {
        var indents = []
        var data = this.props.data.message;

        indents.push(
                <View style={this.style.titleTopConatiner}>
                    <Text style={this.style.titleTop}>{data.manualEvent ? this.props.actions.translate.get("fliwerBubble_manual_irrigation") : this.props.actions.translate.get("fliwerBubble_intelligent_irrigation")}</Text>
                </View>
                );

        indents.push(
                <View style={this.style.contentTop}>
                    <View style={this.style.contentTopLeft}>
                        <View style={[this.style.topText, {fontSize: 8}]}><Text>{moment(new Date(data.irrigationTime * 1000)).format("DD/MM/YYYY")} </Text></View>
                        <View style={[this.style.topText, {fontSize: 8}]}><Text>{
                            data.canceled ?
                                this.props.actions.translate.get("fliwerBubble_status") + ": " + this.props.actions.translate.get("fliwerBubble_cancelled")
                                :
                                //this.props.actions.translate.get("fliwerBubble_time_from_to").replace("%FROM%", moment(new Date(data.irrigationTime * 1000)).format("HH:mm")).replace("%TO%", moment(new Date(data.irrigationEndTime * 1000)).format("HH:mm"))
                                (this.props.actions.translate.get("fliwerBubble_programTime").replace("%FROM%",moment(new Date(data.irrigationTime * 1000)).format("HH:mm")).replace("%TO%",moment(new Date(data.irrigationEndTime * 1000)).format("HH:mm")))
                        }</Text></View>
                        <View style={[this.style.topText, {fontSize: 8}]}><Text>{
                            data.taskTime?this.props.actions.translate.get("fliwerBubble_task_time").replace("%TIME%", moment(new Date(data.taskTime * 1000)).format("HH:mm")):""
                        }</Text></View>
                    </View>
                    <View>
                        <View style={[this.style.imageConatiner]}>
                            <Image style={[this.style.image]} draggable={false} source={data.icon} resizeMode={"contain"} />
                        </View>
                    </View>
                </View>
                );

        indents.push(
            <View style={this.style.drawCancelContainer}>
                {this.drawReloadButton()}
                {this.drawTrashButton()}
            </View>
        )

        indents.push(<View style={this.style.line1}></View>)

        if (!data.canceled)
            indents.push(<FliwerCarousel
            autoplay={false}
            renderItem={(slide, index) => {
                                return (
                                        <TouchableOpacity activeOpacity={1} key={index} style={{width: "100%"}} >
                                            <View style={this.style.carouseSlide}>
                                                <View style={{display: "flex", justifyContent: "flex-start", flexDirection: "row", width: "100%", marginBottom: 8}} >
                                                    {this.drawDevice(slide.item)}
                                                    <View style={[{justifyContent: "center", paddingLeft: 8}]}><Text style={[this.style.carouselText]} >{slide.item.controlId}</Text></View>
                                                </View>

                                                <View style={{display: "flex", justifyContent: "flex-start", flexDirection: "row", width: "100%", marginBottom: 4}}>
                                                    {this.drawValveImage(slide.item)}
                                                    <View style={{justifyContent: "center", paddingLeft: 8}}><Text style={this.style.carouselText}>{this.props.actions.translate.get("valveCard_zone_slotNumber").replace("%NSLOT%",slide.item.slot)} - {this.props.actions.translate.get("valveCard_zone_valveNumber").replace("%NVALVE%",slide.item.valveNumber)}</Text></View>
                                                </View>

                                                {this.drawPumpImage(slide.item)}

                                                <View style={{display: "flex", justifyContent: "space-between", flexDirection: "row", width: "100%", marginBottom: 8}}>
                                                    <View style={{justifyContent: "center", flexDirection: "row"}}>
                                                        <View><Text style={this.style.carouselText}>{moment(new Date(slide.item.startTime * 1000)).format("HH:mm")}</Text></View>
                                                        <View><Text style={this.style.carouselText}> - </Text></View>
                                                        <View><Text style={this.style.carouselText}>{moment(new Date(slide.item.endTime * 1000)).format("HH:mm")}</Text></View>
                                                    </View>
                                                    <View><Text style={this.style.carouselText}>{slide.item.duration} min</Text></View>
                                                </View>

                                                <View style={{display: "flex", justifyContent: "space-between", flexDirection: "row", width: "100%", marginBottom: 6}}>
                                                    <View><Text style={[this.style.carouselDeviceText]}>{this.props.actions.translate.get('FliwerProgramDetail_served_time')}</Text></View>
                                                    <View style={[{justifyContent: "center", paddingLeft: 8}]}><Text style={[this.style.carouselText, {fontSize: 16}]}>{slide.item.servedTime ? moment(new Date(slide.item.servedTime * 1000)).format("L HH:mm") : this.props.actions.translate.get('ProgramDetail_pending')}</Text></View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        )
                            }}
            style={this.style.carousel}
            data={data.scheduling}
            dotsStyle={[{maxWidth: 290, alignSelf: "center"}, Platform.OS == 'android' || Platform.OS == 'ios' ? {width: "0%", bottom: (data.scheduling.filter((s) => {
                    return s.pump
                }).length > 1 ? -158 : -141)} : {bottom: (data.scheduling.filter((s) => {
                    return s.pump
                    }).length > 1 ? -152 : -135)}]}
            textPrevStyle={{color: "black"}}
            textNextStyle={{color: "black"}}
            />)

        if (!data.canceled)
            indents.push(<View style={this.style.line2}></View>)

        if (!data.canceled)
            indents.push(<View style={this.style.textBottomCreateContainer}><Text style={this.style.textBottomCreateText}>{this.props.actions.translate.get('FliwerProgramDetail_creation')} {data.manualEvent ? this.props.actions.translate.get('FliwerProgramDetail_me') : "Fliwer"}</Text></View>)
        else
            indents.push(<View style={this.style.textBottomCreateContainer}><Text style={[this.style.textBottomCreateText]}>{this.props.actions.translate.get('FliwerProgramDetail_cancelled_byFliwer')}</Text></View>)

        if (data.canceled)
            indents.push(
                        <View style={this.style.cancelledTextContent}>
                            <Text style={this.style.cancelledTextContainer}>
                            <Text style={this.style.cancelledText}>{this.props.actions.translate.get('FliwerProgramDetail_reason')}:</Text>
                            <Text style={this.style.cancelledTextReason}>{data.cancelText}</Text>
                            </Text>
                        </View>
                    )

        var active = 0;
        if (data.scheduling[0])
        {
            if (data.scheduling.filter((s) => {
                return s.servedTime == null
            }).length > 1)
                active = 0;
            else if (new Date().getTime() / 1000 < data.irrigationTime)
                active = 1;
            else if (new Date().getTime() / 1000 >= data.irrigationTime && new Date().getTime() / 1000 <= data.irrigationEndTime)
                active = 2;
            else if (data.irrigationEndTime < new Date().getTime() / 1000)
                active = 3;
        }

        if (!data.canceled)
        {
            indents.push(<View style={this.style.textStatusContainer}><Text>{this.props.actions.translate.get("fliwerBubble_status")}</Text></View>)
            indents.push(<View style={this.style.FliwerButtonProgramDetailContainer}><FliwerButtonProgramDetail active={active}/></View>)
            indents.push(<View style={this.style.line3}></View>)
        }

        return indents;
    }

    drawDevice = (slide) => {
        var device = this.props.devices[slide.controlId];
        var indents = []
        if (device)
            indents.push(
                        <View style={this.style.imageConatinerRightCarouselValve}>
                            <Image style={[this.style.imageValve]} draggable={false} source={this.typeToImg(device.type)} resizeMode={"contain"} />
                        </View>
                    )
        return indents;
    };

    drawValveImage = (slide) => {
        var indents = []
        if (true)
            indents.push(
                    <View style={this.style.imageConatinerRightCarouselValve}>
                        <Image style={[this.style.imageValve]} draggable={false} source={valveIcon} resizeMode={"contain"} />
                    </View>
                    )
        return indents;
    };

    drawPumpImage = (slide) => {
        var indents = []
        if (slide.pump)
            indents.push(
                    <View style={{display: "flex", justifyContent: "flex-start", flexDirection: "row", width: "100%", marginBottom: 4}}>
                        <View style={this.style.imageConatinerRightCarouselValve}>
                            <Image style={[this.style.imageValve]} draggable={false} source={pumpIcon} resizeMode={"contain"} />
                        </View>
                        <View style={{justifyContent: "center", paddingLeft: 8}}><Text style={this.style.carouselText}>SLOT {slide.slot}</Text></View>
                    </View>
                    )
        return indents;
    }

    renderModalContentAlert() {
        var indents = []
        var data = this.props.data.message;
        var media = FliwerAlertMedia.subCategoryToMedia(data.subcategory);
        indents.push(
                    <View style={this.style.contentAlertTop}>
                        <Text style={this.style.contentAlertTitle}>{media.title}</Text>
                        <Image style={this.style.contentAlertImage} draggable={false} source={media.img} resizeMode={"contain"} />
                        <Text style={this.style.contentAlertText}><Text style={{fontWeight: "bold"}}>{this.props.actions.translate.get("fliwerProgram_alert_startTime") + " "}</Text>{moment(data.startTime * 1000).format("LLL")}</Text>
                        <Text style={this.style.contentAlertText}><Text style={{fontWeight: "bold"}}>{this.props.actions.translate.get("fliwerProgram_alert_solvedTime") + " "}</Text>{data.solvedTime ? moment(data.solvedTime * 1000).format("LLL") : this.props.actions.translate.get("fliwerProgram_alert_notSolved")}</Text>
                        <ScrollView style={this.style.contentAlertScroll}>
                            <Text style={this.style.contentAlertText}>{data.text.replace(/<br>/g, "\n")}</Text>
                        </ScrollView>
                    </View>
                );
        return indents;
    }

    drawTrashButton() {
        var data = this.props.data;

        var irrigationCondition = (data.type === 'irrigationPending' &&
            /*data.message.manualEvent &&*/
            (data.message.allowed == 3 || data.message.allowed == 4) &&
            !data.message.canceled);

        var realtimeCondition = (data.type === 'realtimeProgram' &&
            !data.message.cancelled && data.message.status == 'pending');

        if (irrigationCondition || realtimeCondition) {
            return (
                <View style={[this.style.trashContainer, realtimeCondition? {position: "absolute", bottom: -10, right: -10}: {}]}>
                    <TouchableOpacity style={this.style.deleteButton} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}
                        onPress={() => {
                            this.setModalVisible(true, data, "cancel");
                        }}>
                        <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                    </TouchableOpacity>
                </View>
            );
        }

        return (<View></View>);
    }

    drawReloadButton(){
    //<IconMaterialCommunityIcons name={iconName} size={iconSize} style={{color: iconColor}} />
        var data = this.props.data;

        var irrigationCondition = (data.type === 'irrigationPending') && this.props.sessionRoles.fliwer;

        if (irrigationCondition) {
            return (
                <View style={[this.style.trashContainer]}>
                    <TouchableOpacity style={this.style.deleteButton} onMouseEnter={this.hoverIn('reloadIcon')} onMouseLeave={this.hoverOut('reloadIcon')}
                        onPress={() => {
                            this.setModalVisible(true, data,"reload");
                        }}>
                        <IconMaterialCommunityIcons name={"reload"} size={30} style={[this.style.reloadIcon]}/>
                    </TouchableOpacity>
                </View>
            );
        }

        return (<View></View>);
    }

    async cancelManualPendingIrrigation(uuid,code) {

        var idZone = this.props.idZone;
        var data = this.state.taskManagerHistoryData;
        var idProgram = data.message.id;

        if (data.type == "realtimeProgram") {
            return this.props.actions.sessionActions.deleteRealtimeProgram(idProgram);
        }
        else {
            return this.props.actions.fliwerZoneActions.cancelManualPendingIrrigation(idZone, idProgram, data.message,uuid,code);
        }
    }

    async deleteManualPendingIrrigation(uuid,code) {

        var idZone = this.props.idZone;
        var data = this.state.taskManagerHistoryData;
        var idProgram = data.message.id;

        return this.props.actions.fliwerZoneActions.deleteManualPendingIrrigation(idZone, idProgram, data.message,uuid,code);      
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        devices: state.fliwerDeviceReducer.devices,
        sessionData: state.sessionReducer.data,
        sessionRoles: state.sessionReducer.roles
    }
}

// Doing this merges our actions into the componentâ€™s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
            sessionActions: bindActionCreators(ActionsSession, dispatch)
        }
    }
}


var style = {
    cancelledTextContent: {
        alignItems: "center",
        paddingRight: 2,
        flexDirection: "row",
        width: "80%",
        paddingBottom: 10,
        maxWidth: 300,
    },
    cancelledText: {
        alignItems: "center",
        fontFamily: FliwerColors.fonts.title,
        paddingRight: 3,
    },
    cancelledTextReason: {
        alignItems: "center",
        fontFamily: FliwerColors.fonts.regular,
    },
    titleTopText: {
        paddingBottom: 3
    },
    topText: {
    },
    titleTopConatiner: {
        marginBottom: 4,
    },
    titleTop: {
        fontFamily: FliwerColors.fonts.title,
        fontSize: 20,
    },
    circleParameterAlert: {

    },
    circleAlertNumber: {
        textAlign: "center",
        fontFamily: FliwerColors.fonts.regular,
        flex: 1,
    },
    circleAlertNumberOut: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
        top: 32,
        left: 13,
        borderRadius: 20,
        borderWidth: 1,
        width: 15,
        height: 15,
    },
    imageConatinerRightCarouselValve: {

    },
    imageConatinerRightCarouselPump: {
        position: "absolute",
        left: 0,
        bottom: -4,
        overflow: "hidden",
    },
    FliwerButtonProgramDetailContainer: {

    },
    textBottomCreateContainer: {
        marginBottom: 10,
    },
    textBottomCreateText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 15,
    },
    carouselText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 20,
    },
    carouselDeviceText: {
        fontFamily: FliwerColors.fonts.title,
        fontSize: 16,
    },
    carousel: {
        width: 370,
        marginBottom: 1,
        flexShrink: 1,
    },
    carouseSlide: {
        width: "100%",
        //height:"100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingRight: 43,
        paddingLeft: 43,
    },
    textStatusContainer: {
        paddingBottom: 4,
    },
    imageConatiner: {
        marginLeft: 15,
    },
    contentTop: {
        width: "80%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    contentTopLeft: {
        justifyContent: "center",
    },
    image: {
        height: 51,
        width: 51,
    },
    imageValve: {
        height: 34,
        width: 34,
    },
    imagePump: {
        height: 51,
        width: 51,
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        minWidth: 200,
        maxWidth: "90%",
        maxHeight: "70%",
        overflow: "hidden"
    },
    modalView: {
        paddingTop: 10,
        paddingLeft: 0,
        paddingRight: 5,
        paddingBottom: 5,
        display: "flex",
        maxHeight: "100%"
    },
    optionsContainer: {
        flexShrink: 1,
        overflowY: "auto",
        maxHeight: "100%",
        alignItems: "center",
    },
    underLine: {
        height: 1,
        backgroundColor: "black"
    },
    line1: {
        height: 1,
        backgroundColor: FliwerColors.secondary.gray,
        marginTop: 3,
        marginBottom: 12,
        width: "80%",
    },
    line2: {
        height: 1,
        backgroundColor: FliwerColors.secondary.gray,
        marginTop: 1,
        marginBottom: 10,
        width: "80%",
    },
    line3: {
        height: 1,
        backgroundColor: FliwerColors.secondary.gray,
        marginTop: 10,
        marginBottom: 27,
        width: "80%",
    },
    contentAlertTop: {
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        paddingTop: 5,
        paddingLeft: 15,
        paddingRight: 10,
        paddingBottom: 10
    },
    contentAlertTitle: {
        color: FliwerColors.secondary.white,
        width: "100%",
        textAlign: "center",
        fontSize: 18,
        paddingLeft: 20,
        paddingRight: 20,
        alignSelf: "center",
        paddingBottom: 8,
        fontFamily: FliwerColors.fonts.title,
        maxHeight: "100%"
    },
    contentAlertImage: {
        width: "100%",
        minWidth: 100,
        alignSelf: "center",
        height: 100,
        marginBottom: 8
    },
    contentAlertScroll: {
        maxHeight: "100%",
        maxWidth: 500
    },
    contentAlertText: {
        color: "white",
        paddingBottom: 5
    },
    trashContainer: {
        paddingTop: 14,
        width: 30,
        height: 35
    },
    deleteButton: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    drawCancelContainer:{
        flexDirection:"row",
        marginBottom:10,
        width: "80%",
        justifyContent: "flex-end"
    },
    trashIcon: {
        width: 25,
        height: 25,
        justifyContent: "flex-end",
        marginLeft: 10
    },
    reloadIcon:{
        width: 25,
        height: 25,
        justifyContent: "flex-end",
        color:"rgb(150,150,150)"
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(110%)"
        },
        reloadIcon: {
            filter: "brightness(110%)"
        }
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerProgramDetail));
