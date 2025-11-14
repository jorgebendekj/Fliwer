import React, {Component} from 'react';
var {StyleSheet, ScrollView, View, Image, Text, TouchableOpacity} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsDevices from '../../actions/fliwerDeviceActions.js'; //Import your actions

import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerTwoPanelInput from '../custom/FliwerTwoPanelInput.js'

import Icon from 'react-native-vector-icons/EvilIcons';
import SimpleLineIcon from 'react-native-vector-icons/SimpleLineIcons';

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import moment from 'moment';

import Modal from '../../widgets/modal/modal'
import {toast} from '../../widgets/toast/toast'

const MESSAGES_TO_INCREASE = 10;
const DATE_TO_INCREASE = 3600 * 24 * 7 * 1;
const INICIAL_MESSAGES = 15;

import valveIcon  from '../../assets/img/valve.png'
import FlowDetailChartModal from './FlowDetailChartModal.js';

class IrrigationList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            nowDate: parseInt(new Date() / 1000),
            lastDate: new Date() / 1000 - (3600 * 24 * 15),
            showMessagesLimit: this.props.initialLines ? this.props.initialLines : INICIAL_MESSAGES,
            paddingTo: 50,
            noMoreData: false,
            displayModal: false,
            displayChart:false,
            flowRef: null
        }
        this.firstLoad = true;

    }

    componentDidMount()
    {
        if (this.props.preloadedData && !this.props.zoneLoadingIrrigationData && !this.props.zoneLoadingData && this.props.zoneData[this.props.idZone].creationTime && this.countIrrigations() <= this.state.showMessagesLimit) {

            this.firstLoad = false;
            if(this.props.setLoading)this.props.setLoading(true);
            this.setState({loading: true})
            this.loadMoreIrrigationHistory().then(() => {
                this.setState({loading: false})
                if(this.props.setLoading)this.props.setLoading(false);
            })
        }
    }

    componentDidUpdate(prevProps)
    {
        if (this.props.preloadedData && !this.props.zoneLoadingIrrigationData && !this.props.zoneLoadingData && this.firstLoad && this.props.zoneData[this.props.idZone].creationTime && this.countIrrigations() <= this.state.showMessagesLimit) {
            this.firstLoad = false;
            if(this.props.setLoading)this.props.setLoading(true);
            this.setState({loading: true})
            this.loadMoreIrrigationHistory().then(() => {
                this.setState({loading: false})
                if(this.props.setLoading)this.props.setLoading(false);
            })
        }
    }

    render() {
        const {idZone, initialLines, increaseLines, containerStyle} = this.props;
        return(
                <ScrollView style={[this.style.container, containerStyle]} scrollEventThrottle={100} nestedScrollEnabled={true}
                    onScroll={({nativeEvent}) => {
                        this.state.lastContentY = nativeEvent.contentOffset.y;
                        this.state.contentSizeHeight = nativeEvent.contentSize.height;
                        this.state.paddingTo = nativeEvent.contentSize.height / 6;

                        //console.log("render onScroll", nativeEvent);

                        if (!this.state.noMoreData && !this.state.loading && this.isCloseToBottom(nativeEvent)) {
                            if(this.props.setLoading)this.props.setLoading(true);
                            this.setState({loading: true, showMessagesLimit: this.countIrrigations() + MESSAGES_TO_INCREASE});
                            //console.log("render onScroll loadMoreIrrigationHistory");
                            this.loadMoreIrrigationHistory().then(() => {
                                this.setState({loading: false});
                                  if(this.props.setLoading)this.props.setLoading(false);
                            })
                        }
                    }}>
                    {this.renderValves()}
                    {this.renderLoading()}
                    {this.renderModal()}
                    {this.renderChart()}
                </ScrollView>
                )
    }

    renderValves() {
        const {onDetail} = this.props;
        var indents = [];
        var irrigations = this.getValveActuations();
        var lastDate = (new Date()).getDate() + 1;
        var lastMonth = (new Date()).getMonth() + 1;
        var lastYear = (new Date()).getFullYear();
        
        for (var i = 0; i < irrigations.length; i++) {
            var borderTop = false;
            var borderBottom = true;

            var date = (new Date(irrigations[i].startTime * 1000)).getDate();
            var month = (new Date(irrigations[i].startTime * 1000)).getMonth();
            var year = (new Date(irrigations[i].startTime * 1000)).getFullYear();
            if (date != lastDate || month!=lastMonth || year!=lastYear || i == 0) {
                indents.push(this.renderDate(irrigations[i].startTime));
                indents.push(this.renderHeader(irrigations[i].startTime));
                lastDate = date;
                lastMonth = month;
                lastYear = year;
                borderTop = true;
            }
            //if(i+1<irrigations.length && lastDate!=(new Date(irrigations[i+1].startTime*1000)).getDate())borderBottom=false;

            var consumption = null, hasconsumption = true, consumptionOk = true;
            if (irrigations[i].flow && irrigations[i].duration) {
                consumption = parseFloat(irrigations[i].flow) / irrigations[i].duration
                if (Math.round(consumption) !== consumption)
                    consumption = consumption.toFixed(2)
                else
                    consumption += ""
                if (!irrigations[i].flowRef)
                    hasconsumption = false;
                else if (!this.checkCorrectFlow(consumption, irrigations[i].flowRef))
                    consumptionOk = false;
            } else
                hasconsumption = false;

            var slot = null;
            if (irrigations[i].slot) {
                slot = irrigations[i].slot + "";
                if (slot.length == 1)
                    slot + " ";
            }

            indents.push(
                    <View key={"row" + irrigations[i].id} style={[this.style.valveRow, (borderTop ? this.style.valveRowBorderTop : {}), (borderBottom ? this.style.valveRowBorderBottom : {}), (irrigations[i].manualIrrigation ? this.style.valveRowManual : this.style.valveRowAuto), (slot? {} : this.style.valveRowKO)]}>
                        <TouchableOpacity style={[this.style.valveColumn, this.style.valveColumnBorderRight, this.style.slotColumn]} onPress={this.openDetail(irrigations[i])} >
                            <Text style={this.style.slotText}>{slot ? "S" + slot : "ESCAPE"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[this.style.valveColumn, this.style.valveColumnBorderRight, this.style.hourColumn]} onPress={this.openDetail(irrigations[i])}>
                            {irrigations[i].startTime != null ? (<Text style={this.style.slotText}>{moment(new Date(irrigations[i].startTime * 1000)).format("HH:mm")}</Text>) : null}
                            {irrigations[i].endTime != null ? (<Text style={this.style.slotText}>{moment(new Date(irrigations[i].endTime * 1000)).format("HH:mm")}</Text>) : null}
                            {irrigations[i].measuretime != null ? (<Text style={this.style.slotText}>{moment(new Date(irrigations[i].measuretime * 1000)).format("HH:mm")}</Text>) : null}
                        </TouchableOpacity>
                        <TouchableOpacity style={[this.style.valveColumn, this.style.valveColumnBorderRight, this.style.hourColumn]} onPress={this.openDetail(irrigations[i])}>
                            {irrigations[i].duration != null ? (<Text style={this.style.slotText}>{irrigations[i].duration + " min"}</Text>) : null}
                            {irrigations[i].flow != null ? (<Text style={this.style.slotText}>{FliwerCommonUtils.toPointsFormat((irrigations[i].flow / 1000)) + " m³"}</Text>) : null}
                        </TouchableOpacity>
                        {this.renderConsumption(irrigations[i],consumption, hasconsumption, consumptionOk, irrigations[i].flowRef, irrigations[i].valveType)}
                    </View>
                    )
        }

        return indents;
    }

    renderConsumption(irrigation,consumption, hasconsumption, consumptionOk, flowRef, valveType)
    {
        var style2 = (this.state.mediaStyle.orientation == 'portrait' && consumption && consumption.length > 4 ? {padding: 1, fontSize: (consumption.length > 5 ? 10 : 11)} : {});
        var style3 = (hasconsumption && consumptionOk ? this.style.consumptionOK : (hasconsumption && !consumptionOk ? this.style.consumptionKO : {}));

        if(valveType==1)
        {
            //Pump or master valve
            return (
                <View style={[this.style.valveColumn, this.style.hourColumn]}>
                    <Text style={[this.style.slotText, style2, style3]}>{this.props.actions.translate.get('irrigationList_masterValve')}</Text>
                </View>
            );
        }
        else if (!consumption || !flowRef)
        {
            return (
                <TouchableOpacity style={[this.style.valveColumn, this.style.hourColumn]} onPress={
                    this.openChart(irrigation)
                } >
                    <Text style={[this.style.slotText, style2, style3]}>{(consumption ? FliwerCommonUtils.toPointsFormat(consumption) + " l/min" : "--")}</Text>
                </TouchableOpacity>
            );
        }
        else
        {
            var uparrow = "\u2191";
            var downarrow = "\u2193";
            var perc = (Math.abs(flowRef - consumption) / flowRef ) * 100;

            return (
                <TouchableOpacity style={[this.style.valveColumn, this.style.hourColumn]} onPress={
                    this.openChart(irrigation)
                } >
                    <Text style={[this.style.slotText, style2, style3]}>{FliwerCommonUtils.toPointsFormat(consumption) + " l/min"}</Text>
                    <Text style={[this.style.slotText, style2, style3]}>{FliwerCommonUtils.toPointsFormat(perc) + " % " + ((consumption-flowRef)>0? uparrow : downarrow)}</Text>
                </TouchableOpacity>
            );
        }
    }

    renderDate(timestamp) {
        return (
                <View style={this.style.dateContainer}>
                    <Text style={this.style.dateText}>{moment(new Date(timestamp * 1000)).format("LL")}</Text>
                </View>
                )
    }

    renderHeader(timestamp) {
        return (
                <View key={"rowHead" + timestamp} style={[this.style.valveRow, this.style.headerRow, this.style.valveRowBorderTop]}>
                    <View style={[this.style.valveColumn, this.style.valveColumnBorderRight, this.style.slotColumn]}>
                        <Image style={[this.style.valveImage, this.style.headerImage]} draggable={false} source={valveIcon} resizeMode={"contain"} />
                    </View>
                    <View style={[this.style.valveColumn, this.style.valveColumnBorderRight]}>
                        <Icon name={"clock"} style={this.style.headerIcon} ></Icon>
                    </View>
                    <View style={[this.style.valveColumn, this.style.valveColumnBorderRight]}>
                        <SimpleLineIcon name={"drop"} style={this.style.headerIcon2}></SimpleLineIcon>
                        <Text style={this.style.slotText}>{"m³"}</Text>
                    </View>
                    <View style={[this.style.valveColumn]}>
                        <SimpleLineIcon name={"drop"} style={this.style.headerIcon2}></SimpleLineIcon>
                        <Text style={this.style.slotText}>{"l/min"}</Text>
                    </View>
                </View>
                );
    }

    renderLoading() {
        if (!this.state.noMoreData || this.state.loading) {
            return (
                    <View style={this.style.imageLoadingConatiner}>
                        <Image style={[this.style.imageLoading]} draggable={false} source={{uri: (!global.envVars.TARGET_RAINOLVE?'https://old.fliwer.com/myfliwer/img/loadingapp.gif':'https://old.fliwer.com/myfliwer/img/loadingapprainolve.gif')}} resizeMode={"contain"} />
                    </View>)
        } else
            return null;
    }

    renderModal() {
        if (this.state.displayModal && this.state.firstDisplayModal) {

            this.state.firstDisplayModal = false;
            var irrigation = this.state.currentIrrigation;
            var valveFlowRef = this.props.devices[irrigation.controlId]?this.props.devices[irrigation.controlId].valves.config[irrigation.valveNumber - 1].caudalRef:null;

            if (this.state.flowRef == null)
                this.state.flowRef = valveFlowRef;

            var consumption = null, hasconsumption = true, consumptionOk = true;
            if (irrigation.flow) {
                consumption = parseFloat(irrigation.flow) / irrigation.duration
                if (Math.round(consumption) !== consumption)
                    consumption = consumption.toFixed(2)
                else
                    consumption += ""
                if (!irrigation.flowRef)
                    hasconsumption = false;
                else if (!this.checkCorrectFlow(consumption, irrigation.flowRef))
                    consumptionOk = false;
            } else
                hasconsumption = false;

            global.frontLayer.renderLayer(() => {
                //console.log(irrigation.flowRef, this.state.flowRef);
                return (
                        <Modal animationType="fade" inStyle={this.style.modalIn} visible={true} onClose={() => {
                                this.closeDetail()
                            }}>
                            <View style={this.style.modalView}>
                                <View style={this.style.modalTitle}>
                                    <Text style={this.style.modalTitleText}>{this.props.actions.translate.get('irrigationList_title')}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{"Slot" + ":"}</Text>
                                    <Text style={this.style.detailLineText}>{"S" + irrigation.slot}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('general_device') + ":"}</Text>
                                    <Text style={this.style.detailLineText}>{irrigation.controlId}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('valveCard_zone_selectType_valve') + ":"}</Text>
                                    <Text style={this.style.detailLineText}>{irrigation.valveNumber}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('fliwerProgram_alert_startTime')/*+":"*/}</Text>
                                    <Text style={this.style.detailLineText}>{moment(new Date(irrigation.startTime * 1000)).format("L HH:mm")}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('general_until') + ":"}</Text>
                                    <Text style={this.style.detailLineText}>{moment(new Date(irrigation.endTime * 1000)).format("L HH:mm")}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('fliwerHistory_duration_irrigation') + ":"}</Text>
                                    <Text style={this.style.detailLineText}>{irrigation.duration + " " + this.props.actions.translate.get('general_min')}</Text>
                                </View>
                                <View style={this.style.detailLine}>
                                    <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('FliwerProgramDetail_served_time') + ":"}</Text>
                                    <Text style={this.style.detailLineText}>{irrigation.servedTime ? moment(new Date(irrigation.servedTime * 1000)).format("L HH:mm") : this.props.actions.translate.get('ProgramDetail_pending')}</Text>
                                </View>
                                {
                            !irrigation.pump ? null : (
                                                    <View style={this.style.detailLine}>
                                                        <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('deviceCard_pump') + ":"}</Text>
                                                        <Text style={this.style.detailLineText}>{irrigation.pump.controlId}</Text>
                                                    </View>
                                    )
                                }
                                {
                            !irrigation.pump ? null : (
                                                    <View style={this.style.detailLine}>
                                                        <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('valveCard_zone_selectType_valve') + ":"}</Text>
                                                        <Text style={this.style.detailLineText}>{irrigation.pump.valveNumber}</Text>
                                                    </View>
                                    )
                                }
                                {
                            !consumption ? null : (
                                                    <View style={this.style.detailLine}>
                                                        <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('irrigationList_consumption') + ":"}</Text>
                                                        <Text style={this.style.detailLineText}>{irrigation.flow + "l"}</Text>
                                                    </View>
                                    )
                                }
                                {
                            !consumption ? null : (
                                                    <View style={this.style.detailLine}>
                                                                <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('fliwerCard_flow_plot_title') + ":"}</Text>
                                                                <Text style={[this.style.detailLineText, (consumptionOk ? this.style.textOK : this.style.textKO)]}>{FliwerCommonUtils.toPointsFormat(consumption) + " l/min"}</Text>
                                                            </View>
                                    )
                                }
                                {
                            !irrigation.flowRef ? null : (
                                                    <View style={this.style.detailLine}>
                                                                <Text style={this.style.detailLineTitle}>{this.props.actions.translate.get('irrigationList_reference_flow') + ":"}</Text>
                                                                <Text style={this.style.detailLineText}>{FliwerCommonUtils.toPointsFormat(irrigation.flowRef) + " l/min"}</Text>
                                                            </View>
                                    )
                                }
                                <View style={[this.style.detailLine, this.style.detailLineColumn]}>
                                    <Text style={[this.style.detailLineTitle, this.style.detailLineTitleColumn]}>{this.props.actions.translate.get('irrigationList_actual_reference_flow') + ":"}</Text>
                                    <FliwerTwoPanelInput keyboardType={"numeric"} onSubmitEditing={() => {
                                if (this.state.flowRef != valveFlowRef) {
                                    this.saveFlowRef();
                                }
                                this.closeDetail()
                            }} placeholder={this.props.actions.translate.get('fliwerCard_no_data')} containerStyle={{alignSelf: "center", maxWidth: 200}} inputContainer={{right: 62}} defaultValue={this.state.flowRef} onChangeText={(text) => {
                                this.setState({flowRef: text})
                            }} rightText={"l/min"} />
                                </View>
                                <FliwerGreenButton containerStyle={{width: "60%", alignSelf: "center"}} text={this.props.actions.translate.get('general_save').toUpperCase()} onPress={async () => {
                                    if (this.state.flowRef != valveFlowRef) {
                                        await this.saveFlowRef();
                                    }
                                    this.closeDetail();
                                }} />
                            </View>
                        </Modal>
                        )
            })
            //this.props.actions.translate.get('AddGardener_search_user')
        } else
            return [];

    }

    renderChart(){
        if (this.state.displayChart && this.state.firstDisplayChart) {

            this.state.firstDisplayChart = false;

            global.frontLayer.renderLayer(() => {
                //console.log(irrigation.flowRef, this.state.flowRef);
                return (
                    <FlowDetailChartModal 
                        onClose={() => {
                            this.closeChart()
                        }}
                        loadingModal={this.state.loading}
                        setLoading={this.props.setLoading}
                        from={this.state.currentIrrigation.startTime}
                        to={this.state.currentIrrigation.endTime+300}
                        idIrrigation={this.state.currentIrrigation.id}
                        idZone={this.props.idZone}
                    />

                )
            })
            //this.props.actions.translate.get('AddGardener_search_user')
        } else
            return [];
    }

    getIrrigations() {
        return Object.values(this.props.zoneData[this.props.idZone].taskManagerHistoryData).filter((event) => {
            //return event.type == "irrigationHistory" || event.type == "irrigationPending" || event.type == "deviceIrrigationHistory";

            if (event.type == "deviceIrrigationHistory") {
                return true;
            }

            if (event.type == "irrigationHistory") {

                if (!event.message.scheduling || event.message.scheduling.length==0)
                    return false;

                var now = Math.floor(Date.now() / 1000);
                if (now > event.message.irrigationEndTime)
                {
                    return true;
                }
            }

            return false;
        });
    }

    getValveActuations() {
        function flatten(arr) {
            return Array.prototype.concat(...arr);
        }
        return flatten(this.getIrrigations().filter((i)=>{
          if(i.type=='irrigationHistory') return (i.message.allowed==3 || i.message.allowed==4);
          else return true;
        }).map((i) => {
            if (i.type == 'deviceIrrigationHistory') {
                //console.log("getValveActuations deviceIrrigationHistory", i.message);
                i.message.manualIrrigation = true;
                return i.message;
            } else {
                //console.log("getValveActuations other", i.message);
                return i.message.scheduling;
            }
        })).sort((v1, v2) => {
            if (!v1.startTime)
                v1.startTime = v1.measureTime;
            if (!v2.startTime)
                v2.startTime = v2.measureTime;
            return (v1.startTime == v2.startTime && v1.valveType==1 && v2.valveType!=1?1:(v1.startTime == v2.startTime && v1.valveType!=1 && v2.valveType==1?-1: (v1.startTime > v2.startTime ? -1 : (v1.startTime < v2.startTime ? 1 : 0))  ))
        })
    }

    countIrrigations() {
        return this.getIrrigations().length;
    }

    loadMoreIrrigationHistory() {
        var limitDate = this.props.zoneData[this.props.idZone].creationTime;

        //console.log("loadMoreIrrigationHistory limitDate", limitDate);

        return new Promise((resolve, reject) => {

            //var previousTotalMessages = this.countIrrigations();

            this.props.actions.fliwerZoneActions.getZoneDataTaskManagerHistory(this.props.idZone, parseInt(this.state.lastDate), parseInt(this.state.nowDate)).then(() => {
                this.state.nowDate = this.state.lastDate;
                this.state.lastDate = this.state.lastDate - DATE_TO_INCREASE;
                //console.log("nowDate", this.state.nowDate, "lastDate", this.state.lastDate);
                if (this.state.lastDate <= limitDate)
                    this.state.noMoreData = true;
                var countIrrigations = this.countIrrigations();
                //console.log(!this.state.displayModal, !this.state.noMoreData, countIrrigations, this.state.showMessagesLimit, (countIrrigations <= this.state.showMessagesLimit));
                if (!this.state.displayModal && !this.state.displayChart && !this.state.noMoreData && countIrrigations <= this.state.showMessagesLimit) {
                    //console.log("com que s'han carregat menys de 25 missatges, carreguem de nou 30 dies mes: anteiorment"+previousTotalMessages+", ara: "+nowTotalMessages);
                    this.loadMoreIrrigationHistory().then(() => {
                        resolve();
                    })
                } else {
                    resolve();
                }
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
            });
        });

    }

    isCloseToBottom( {layoutMeasurement, contentOffset, contentSize}){
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - (layoutMeasurement.height + this.state.paddingTo)
    }

    async saveFlowRef() {
        await this.props.actions.fliwerDeviceActions.setControlValveFlowRef(this.state.currentIrrigation.controlId, this.state.currentIrrigation.valveNumber, this.state.flowRef).then(() => {
            this.setState({flowRef: null})
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        });
    }

    openDetail(irrigation) {
        return async () => {
            if (!irrigation.manualIrrigation && irrigation.valveType!=1) {

                if(!this.props.devices[irrigation.controlId]){
                    //load irrigation.controlId data into device reducer
                    if(this.props.setLoading)this.props.setLoading(true);
                    this.setState({loading: true})
                    await this.props.actions.fliwerDeviceActions.getDevice(irrigation.controlId);
                    await this.props.actions.fliwerDeviceActions.getDeviceValves(irrigation.controlId);
                    if(this.props.setLoading)this.props.setLoading(false);
                    this.setState({loading: false})
                }
                global.frontLayer.display(true);
                this.setState({displayModal: true, currentIrrigation: irrigation, firstDisplayModal: true});
            }
        };
    }

    async closeDetail() {
        await global.frontLayer.display(false);
        this.setState({displayModal: false, displayChart:false, flowRef: null, firstDisplayModal: true});
    }

    openChart(irrigation) {
        return async () => {
            await global.frontLayer.display(true);
            this.setState({displayChart: true, displayModal:false, currentIrrigation: irrigation, firstDisplayChart: true});
        };
    }

    async closeChart() {
        await global.frontLayer.display(false);
        this.setState({displayChart: false, flowRef: null, firstDisplayChart: true});
    }


    checkCorrectFlow(flow, flowRef) {
        flow = parseFloat(flow);
        flowRef = parseFloat(flowRef);
        var threshold = 0.3;
        //console.log("checkCorrectFlow",flow,flowRef,flow<=(flowRef+flowRef*(threshold/2)),flow>=(flowRef-flowRef*(threshold/2)))
        return flow <= (flowRef + flowRef * (threshold / 2)) && flow >= (flowRef - flowRef * (threshold / 2))
    }

}


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        sessionData: state.sessionReducer.data,
        preloadedData: state.sessionReducer.preloadedData,
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        zoneLoadingIrrigationData: state.fliwerZoneReducer.loadingIrrigationData,
        zoneLoadingData: state.fliwerZoneReducer.loadingData,
        devices: state.fliwerDeviceReducer.devices
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
            fliwerDeviceActions: bindActionCreators(ActionsDevices, dispatch)
        }
    }
}

var styles = {
    container: {
        width: "100%",
        height: 1,
    },
    imageLoadingConatiner: {
        alignSelf: "center",
    },
    imageLoading: {
        height: 51,
        width: 51,
    },
    dateContainer: {
        width: "100%",
        backgroundColor: "white"/*FliwerColors.secondary.gray*/,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 4
    },
    dateText: {

    },
    valveRow: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 60
    },
    headerRow: {
        height: 30
    },
    valveRowOK: {
        backgroundColor: "#f2fbc3"
    },
    valveRowKO: {
        backgroundColor: "#ffd0d0"
    },
    valveRowAuto: {
        backgroundColor: "#f2fbc3"
    },
    valveRowManual: {
        backgroundColor: "#c3dffb"
    },
    consumptionOK: {
        color: "black"
    },
    consumptionKO: {
        color: "red"
    },
    valveRowBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: FliwerColors.primary.gray
    },
    valveRowBorderTop: {
        borderTopWidth: 1,
        borderTopColor: FliwerColors.primary.gray
    },
    valveColumn: {
        width: "29%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    valveColumnBorderRight: {
        borderRightWidth: 1,
        borderRightColor: FliwerColors.primary.gray
    },
    slotColumn: {
        width: "13%",
        justifyContent: 'center'
    },
    hourColumn: {
        flexDirection: "column"
    },
    valveImage: {
        height: "100%",
        margin: 5,
        width: 35
    },
    headerImage: {
        height: "80%"
    },
    headerIcon: {
        fontSize: 24
    },
    headerIcon2: {
        fontSize: 18
    },
    slotText: {
        padding: 5
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        minWidth: 300,
        maxWidth: "80%"
    },
    modalView: {
        paddingTop: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 20,
        //maxHeight:"80%",
        display: "flex"
    },
    modalTitle: {
        alignItems: "center",
        display: "flex"
    },
    modalTitleText: {
        fontSize: 22,
        fontFamily: FliwerColors.fonts.title,
        marginBottom: 15
    },
    detailLine: {
        display: "flex",
        flexDirection: "row",
        marginBottom: 10
    },
    detailLineColumn: {
        flexDirection: "column"
    },
    detailLineTitle: {
        fontSize: 18
    },
    detailLineTitleColumn: {
        marginBottom: 5
    },
    detailLineText: {
        marginLeft: 10,
        fontSize: 18
    },
    textOK: {
        color: "#a7bb3c"
    },
    textKO: {
        color: "#ff4d4d"
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, IrrigationList));
