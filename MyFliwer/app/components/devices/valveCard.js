'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform, ScrollView, Switch, Dimensions} = require('react-native');

import { CheckBox  } from 'react-native-elements'
import Icon from 'react-native-vector-icons/EvilIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import FliwerSlideBar from '../../components/custom/FliwerSlideBar';
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'

import FliwerCard from '../custom/FliwerCard.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import { Redirect } from '../../utils/router/router'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions

import valveIcon  from '../../assets/img/valve.png'
import pumpIcon  from '../../assets/img/pump.png'
import nothingIcon  from '../../assets/img/valve_nothing.png'
import pumpOffIcon  from '../../assets/img/pump-off.png'
import pumpOnIcon  from '../../assets/img/pump-on.png'
import flowOffIcon  from '../../assets/img/flow-off.png'
import flowOnIcon  from '../../assets/img/flow-on.png'


import selectNothing  from '../../assets/img/10_ico-nothing.png'
import selectNothingOn  from '../../assets/img/10_ico-nothing_on.png'
import selectValve  from '../../assets/img/10_ico-valve.png'
import selectValveOn  from '../../assets/img/10_ico-valve_on.png'
import selectPump  from '../../assets/img/10_ico-pump.png'
import selectPumpOn  from '../../assets/img/10_ico-pump_on.png'
import turn1 from '../../assets/img/3_Turn1.png'
import turn2 from '../../assets/img/3_Turn2.png'

import {toast} from '../../widgets/toast/toast'
import Dropdown from '../../widgets/dropdown/dropdown';
import Modal from '../../widgets/modal/modal'

class ValveCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            valveZone: this.props.data.idZone,
            valveType: this.props.data.valveType,
            motor_slot: this.props.data.motor_slot,
            flowmeter: this.props.data.flowmeter,
            minutesAdj: this.props.data.minutesAdj,
            timeout: null,
            showSimultaneity: this.props.showSimultaneity,
            flipped: this.props.showSimultaneity,
            simultaneityDeleteModalVisible: false,
            simultaneityDeleteControlId: null,
            simultaneityDeleteValveNumber: null,
            simultaneitySelectionValvesModalVisible: false,
            simultaneitySelectionSortedBy: "controller",
            simultaneitySelectionCheckboxMapping: {},
            showRealtimeLayer: this.props.showRealtimeLayer,
            realtimeStatus: this.props.realtimeStatus,
            //valvePlaying:0,//int, seconds to valveClose
        };

    }

    componentWillReceiveProps(nextProps) {

        if (this.state.showSimultaneity != nextProps.showSimultaneity && nextProps.showSimultaneity) {
            this.setState({showSimultaneity: nextProps.showSimultaneity});
        }

        if (this.state.showRealtimeLayer != nextProps.showRealtimeLayer) {
            this.setState({showRealtimeLayer: nextProps.showRealtimeLayer});
        }

        if (this.state.realtimeStatus != nextProps.realtimeStatus) {
            this.setState({realtimeStatus: nextProps.realtimeStatus});
        }
    }

    componentWillUnmount = () => {
        clearTimeout(this.state.timeout);
    };

    render() {
        var device = this.props.devices[this.props.idDevice];

        if (this.state.conf) {
            if (this.hasValves(device.type))
                return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/" + this.props.idDevice + "/valves/"} />)
            else
                return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/new/linkwifi/" + this.props.idDevice} />)
        } else {

            var data;
            if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
            else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

            var flipped = data.valveType == null? false : this.state.flipped;

            var touchableFront = !flipped? false : !this.state.showSimultaneity;
            var touchableBack = !flipped? !this.state.showSimultaneity: false;
            if (this.state.showRealtimeLayer) {
                touchableFront = false;
                touchableBack = false;
            }

            return (
                    <FliwerCard ref="card" touchableFront={touchableFront} touchableBack={touchableBack} cardInStyle={this.style.valveCard} style={this.style.valveCard}>
                        <View>
                            {!flipped? this.renderCardFront() : this.renderCardBack()}
                        </View>
                        <View>
                            {!flipped? this.renderCardBack() : this.renderCardFront()}
                        </View>
                        {this.renderSimultaneityDeleteModal()}
                        {this.renderSimultaneitySelectionValvesModal()}
                    </FliwerCard>
                    );
        }
    }

    renderRealtimeLayer() {

        var indents = [];

        if (!this.state.showRealtimeLayer)
            return indents;

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        var deviceRealTimeInfo=this.props.deviceRealTimeInfo[this.props.idDevice];

        if (data.valveType != null && data.valveType !=1 && deviceRealTimeInfo){

            var valvePlaying=deviceRealTimeInfo.irrigationStatus.filter((v)=>{return v.valve==this.props.valveNumber});

            indents.push(
                <View style={this.style.layerEditContent}>
                    <Text style={[this.style.layerText]}>{/*this.props.actions.translate.get('general_realtime_mode').toUpperCase()*/"REAL TIME IRRIGATION"}</Text>
                    <TouchableOpacity
                        style={{
                            marginTop: 20,
                            height: 60,
                            width: 60,
                            borderRadius: 45,
                            borderColor: "white",
                            color:"white",
                            borderWidth: 2,
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onPress={async () => {
                            //TODO
                            if( this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
                            else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

                            this.props.setLoading(true);
                            if (valvePlaying.length == 0) {
                                var openSend=[{
                                    idDevice: this.props.idDevice,
                                    valves: [data.valveNumber]
                                }
                                ];
                                //Get valve pump
                                if(data.motor_slot!=null){
                                    if(data.motor_controlId==openSend[0].idDevice){
                                        openSend[0].valves.push(data.motor_valveNumber)
                                    }else{
                                        openSend.push({
                                            idDevice: data.motor_controlId,
                                            valves: [data.motor_valveNumber]
                                        });
                                    }
                                }

                                try{
                                    //Before open valves, close all valves
                                    var deviceRealTimeInfo=this.props.deviceRealTimeInfo;
                                    //Iterate over every device
                                    for(var i=0;i<Object.keys(deviceRealTimeInfo).length;i++){
                                        var deviceRT=deviceRealTimeInfo[Object.keys(deviceRealTimeInfo)[i]].irrigationStatus;
                                        var idDeviceRT=Object.keys(deviceRealTimeInfo)[i];
                                        //Iterate over every valve
                                        var valvesToClose=[];
                                        if(deviceRT.length>0){
                                            for(var j=0;j<deviceRT.length;j++){
                                                valvesToClose.push(deviceRT[j].valve);
                                            }
                                            if(valvesToClose.length>0){
                                                await this.props.actions.fliwerDeviceActions.sendDataRealTime(idDeviceRT,"closeValve",{valve: valvesToClose},true)
                                            }
                                        }
                                    }


                                    //Open valves
                                    for(var i=0;i<openSend.length;i++){
                                        await this.props.actions.fliwerDeviceActions.sendDataRealTime(openSend[i].idDevice,"openValve",{valve: openSend[i].valves},true)
                                    }
                                    
                                    this.props.setLoading(false);
                                }catch(e){
                                    toast.error("Failed to send open valve");
                                    this.props.setLoading(false);
                                }
                                
                            } else {
                                var openSend=[{
                                    idDevice: this.props.idDevice,
                                    valves: [data.valveNumber]
                                }
                                ];
                                //Get valve pump
                                if(data.motor_slot!=null){
                                    if(data.motor_controlId==openSend[0].idDevice){
                                        openSend[0].valves.push(data.motor_valveNumber)
                                    }else{
                                        openSend.push({
                                            idDevice: data.motor_controlId,
                                            valves: [data.motor_valveNumber]
                                        });
                                    }
                                }

                                //Close valves
                                try{
                                    for(var i=0;i<openSend.length;i++){
                                        await this.props.actions.fliwerDeviceActions.sendDataRealTime(openSend[i].idDevice,"closeValve",{valve: openSend[i].valves},true)
                                    }
                                    this.props.setLoading(false);
                                }catch(e){
                                    toast.error("Failed to send close valve");
                                    this.props.setLoading(false);
                                }

                            }
                        }}>
                        <FontAwesome6 name={valvePlaying.length == 0? "play" : "stop"} size={30} style={{color:"white"}}/>
                    </TouchableOpacity>

                </View>
            );
        }

        return(
            <View style={[this.style.layerEdit]}>
                {indents}
            </View>
        );
    }

    renderCardFront() {
        var that = this;
        //var {data} = this.props;
        var data;
        if( this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        var card = [];
        var icon = this.getValveIcon();

        card.push(
                <View style={this.style.cardView}>

                    {data.valveType != null?<TouchableOpacity activeOpacity={1}
                        onPress={()=>{
                            this.setState({showSimultaneity: true}, () => {
                                that.toggle()();
                            });
                        }}
                        style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                        <Image style={[this.style.turnButtonImage, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                    </TouchableOpacity>:null}
                    {data.valveType != null?<TouchableOpacity activeOpacity={1}
                        onPress={()=>{
                            this.setState({showSimultaneity: true}, () => {
                                that.toggle()();
                            });
                        }}
                        style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                        <Image style={[this.style.turnButtonImage, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                    </TouchableOpacity>:null}

                    <Text style={this.style.title}>{this.props.actions.translate.get("valveCard_zone_slotNumber").replace("%NSLOT%", data.slot_virtual)}</Text>
                    <Text style={this.style.subtitle}>{(!data.Type.includes("UNIPRO") || data.valveNumber!=0)?(this.props.actions.translate.get("valveCard_zone_valveNumber").replace("%NVALVE%", data.valveNumber)):(this.props.actions.translate.get("valveCard_zone_selectType_pump"))}</Text>
                    <TouchableOpacity style={[this.style.valveImageTouch, (data.valveType == null ? {marginTop: 30, marginBottom: 30} : (data.valveType == 1 ? {marginTop: 0, position: "absolute", height: "100%", width: "60%"} : {}))]} onMouseEnter={this.hoverIn('valveImage')} onMouseLeave={this.hoverOut('valveImage')}
                        onPress={() => {
                            this.setState({showSimultaneity: false}, () => {
                                if( (this.props.devices[this.props.idDevice].type!='UNIPRO6' && this.props.devices[this.props.idDevice].type!='UNIPRO9' && this.props.devices[this.props.idDevice].type!='UNIPRO12' && this.props.devices[this.props.idDevice].type!='UNIPRO16') || this.props.valveNumber!=0)this.toggle()();
                            });
                        }}>
                        <Image style={this.style.valveImage} draggable={false} source={icon} resizeMode={"contain"} />
                    </TouchableOpacity>
                    <View style={this.style.infoContainer}>
                        {this.renderPump()}
                        {this.renderFlowmeter()}
                        {this.renderValveDuration()}
                        {this.renderValveZone()}
                    </View>

                    {this.renderRealtimeLayer()}
                </View>
                )
        //<Dropdown ref={input => this.valveTypeSelect = input} modal={true} placeholder={"Valve Type"} selectedValue={data.valveType} style={{display:"none",width:0}} styleOptions={{}} options={this.printValveType()} onChange={(value)=>{this.setState({valveType:value});}} />
        return card;
    }

    renderPump() {
        //var {data} = this.props;

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        var array = [];
        var hasPump = this.hasDirectPump(data.Type) ? (data.motor) : (data.motor_slot != null);
        if (1/*data.Type != "CONTROL_9" && data.Type != "TBD6" && data.Type != "TBD4" && data.Type != "TBD2" && data.Type != "TBD1"*/)
        {
            if (data.valveType == 0) {
                if (Platform.OS === 'web') {
                    array.push(
                            <TouchableOpacity style={this.style.pumpImageTouch} onMouseEnter={this.hoverIn(hasPump ? 'pumpImageOn' : 'pumpImageOff')} onMouseLeave={this.hoverOut(hasPump ? 'pumpImageOn' : 'pumpImageOff')}  onPress={() => {
                                    if (this.hasDirectPump(data.Type)) {
                                        this.updateMotor(!hasPump)
                                    } else {
                                        this.pumpSelect.openModal();
                                    }
                                }}>
                                <Image style={[this.style.pumpImage, (hasPump ? this.style.pumpImageOn : this.style.pumpImageOff)]} draggable={false} source={(hasPump ? pumpOnIcon : pumpOffIcon)} resizeMode={"contain"} />
                                <Dropdown ref={input => this.pumpSelect = input} modal={true} placeholder={"Pump"} selectedValue={data.motor_slot}  style={{opacity: 0/*, display: "none"*/, width: 0}} styleOptions={{}} options={this.printOptions()} onChange={(value) => {
                                    this.updateMotor(value)
                                }} />
                            </TouchableOpacity>
                            )
                } else if (this.hasDirectPump(data.Type)) {
                    array.push(
                            <TouchableOpacity style={this.style.pumpImageTouch} onMouseEnter={this.hoverIn(hasPump ? 'pumpImageOn' : 'pumpImageOff')} onMouseLeave={this.hoverOut(hasPump ? 'pumpImageOn' : 'pumpImageOff')}  onPress={() => {
                                    if (this.hasDirectPump(data.Type)) {
                                        this.updateMotor(!hasPump)
                                    } else {
                                        this.pumpSelect.openModal();
                                    }
                                }}>
                                <Image style={[this.style.pumpImage, (hasPump ? this.style.pumpImageOn : this.style.pumpImageOff)]} draggable={false} source={(hasPump ? pumpOnIcon : pumpOffIcon)} resizeMode={"contain"} />
                            </TouchableOpacity>
                            )
                } else {
                    array.push(
                            <View style={this.style.pumpImageTouch} onMouseEnter={this.hoverIn(hasPump ? 'pumpImageOn' : 'pumpImageOff')} onMouseLeave={this.hoverOut(hasPump ? 'pumpImageOn' : 'pumpImageOff')}>
                                <Image style={[this.style.pumpImage, (hasPump ? this.style.pumpImageOn : this.style.pumpImageOff)]} draggable={false} source={(hasPump ? pumpOnIcon : pumpOffIcon)} resizeMode={"contain"} />
                                <Dropdown ref={input => this.pumpSelect = input} modal={true} placeholder={"Pump"} selectedValue={data.motor_slot}  style={{opacity: 0, position: "absolute", width: "100%", height: "100%"}} styleOptions={{}} options={this.printOptions()} onChange={(value) => {
                                    this.updateMotor(value)
                                }} />
                            </View>
                    );
                }
                if (hasPump && !this.hasDirectPump(data.Type)) {
                    array.push(
                        <TouchableOpacity  style={this.style.pumpSlotTextTouch}  onMouseEnter={this.hoverIn(hasPump ? 'pumpImageOn' : 'pumpImageOff')} onMouseLeave={this.hoverOut(hasPump ? 'pumpImageOn' : 'pumpImageOff')}  onPress={() => {
                                this.pumpSelect.openModal();
                            }}>
                            <Text style={this.style.pumpSlotText}>{this.props.actions.translate.get("valveCard_zone_pumpSlotNumber").replace("%NSLOT%", data.motor_slot)}</Text>
                        </TouchableOpacity>
                    );
                }
            }
        }

        return array;
    }

    renderFlowmeter() {
        //var {data} = this.props;

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        var array = [];
        var hasFlowmeter = data.flowmeter;
        if (data.valveType == 0) {
            if (Platform.OS === 'web') {
                array.push(
                        <TouchableOpacity style={this.style.flowImageTouch} onMouseEnter={this.hoverIn(hasFlowmeter ? 'flowImageOn' : 'flowImageOff')} onMouseLeave={this.hoverOut(hasFlowmeter ? 'flowImageOn' : 'flowImageOff')}  onPress={() => {
                                this.flowSelect.openModal();
                            }}>
                            <Image style={[this.style.pumpImage, (hasFlowmeter ? this.style.flowImageOn : this.style.flowImageOff)]} draggable={false} source={(hasFlowmeter ? flowOnIcon : flowOffIcon)} resizeMode={"contain"} />
                            <Dropdown ref={input => this.flowSelect = input} modal={true} placeholder={"Flowmeter"} selectedValue={data.flowmeter}  style={{opacity: 0/*, display: "none"*/, width: 0}} styleOptions={{}} options={this.printFlowOptions()} onChange={(value) => {
                                this.updateFlowmeter(value)
                            }} />
                        </TouchableOpacity>
                        )
            } else {
                array.push(
                        <View style={this.style.flowImageTouch} onMouseEnter={this.hoverIn(hasFlowmeter ? 'flowImageOn' : 'flowImageOff')} onMouseLeave={this.hoverOut(hasFlowmeter ? 'flowImageOn' : 'flowImageOff')}>
                            <Image style={[this.style.pumpImage, (hasFlowmeter ? this.style.flowImageOn : this.style.flowImageOff)]} draggable={false} source={(hasFlowmeter ? flowOnIcon : flowOffIcon)} resizeMode={"contain"} />
                            <Dropdown ref={input => this.flowSelect = input} modal={true} placeholder={"Flowmeter"} selectedValue={data.flowmeter}  style={{opacity: 0, position: "absolute", width: "100%", height: "100%"}} styleOptions={{}} options={this.printFlowOptions()} onChange={(value) => {
                                this.updateFlowmeter(value)
                            }} />
                        </View>
                );
            }
            if (hasFlowmeter) {
                array.push(
                    <TouchableOpacity  style={this.style.flowTextTouch}  onMouseEnter={this.hoverIn(hasFlowmeter ? 'flowImageOn' : 'flowImageOff')} onMouseLeave={this.hoverOut(hasFlowmeter ? 'flowImageOn' : 'flowImageOff')}  onPress={() => {
                            this.flowSelect.openModal();
                        }}>
                        <Text style={this.style.pumpSlotText}>{ this.props.actions.fliwerDeviceActions.getFlowDevices("flow-meter").findIndex(d => d.DeviceSerialNumber ===  data.flowmeter)+1}</Text>
                    </TouchableOpacity>
                );
            }
        }

        return array;
    }


    renderValveDuration() {
        //var {data} = this.props;


        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        var array = [];

        if (data.valveType == 0) {
            array.push(
                    <View style={[this.style.durationContainer, (data.minutesAdj ? {} : {height: 30, paddingBottom: 10})]}>
                        <Text style={this.style.durationText}>{this.props.actions.translate.get("valveCard_zone_irrigationDuration")}</Text>
                        <View style={this.style.minContainer}>
                            <Text style={this.style.numberText}>{(this.state.minutesAdj ? this.state.minutesAdj : "--")}</Text>
                            <Text style={this.style.minText}>{this.props.actions.translate.get("general_min")}</Text>
                        </View>
                    </View>
            );
        }

        if (data.valveType == 0 && data.minutesAdj) {
            if (this.state.minutesAdj) {
                array.push(
                    <FliwerSlideBar style={this.style.slider} value={this.state.minutesAdj} disabled={data.minutesAdj ? false : true} step={1} max={250} min={1} onChange={(value) => {
                            this.updateValveMinutes(value)
                        }} />
                    );
                array.push(
                        <TouchableOpacity style={this.style.valveMinutesMinus} onPress={() => {
                                this.subMinute()
                            }}><Text style={this.style.valveMinutesButtonText}>-</Text></TouchableOpacity>
                        )
                array.push(
                        <TouchableOpacity style={this.style.valveMinutesPlus} onPress={() => {
                                this.addMinute()
                            }}><Text style={this.style.valveMinutesButtonText}>+</Text></TouchableOpacity>
                        )
            }
        }

        return array;
    }

    renderValveZone() {
        var array = [];

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        if (data.valveType == null || data.valveType == 0) {
            array.push(
                    <View style={this.style.pumpSelectContainer}>

                        <Dropdown modal={true} disabled={data.valveType == null} placeholder={this.props.actions.translate.get("valveCard_zone_placeholder")} selectedValue={data.idZone} style={this.style.pumpSelect} options={this.printZones()} onChange={(value) => {
                            this.updateValveZone(value)
                        }} />
                        <View style={this.style.selectZoneOut}><Text key={11} style={this.style.selectZoneText}>{this.props.actions.translate.get("valveCard_zone_placeholder")}</Text></View>
                    </View>
                    )
        }

        return array;
    }

    renderPumpBack(data) {
        if (1/*data.Type != "TBD6" && data.Type != "TBD4" && data.Type != "TBD2" && data.Type != "TBD1" && data.Type != "UNIPRO16" && data.Type != "UNIPRO12" && data.Type != "UNIPRO9" && data.Type != "UNIPRO6"*/)
            return (
                    <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypePump]} onMouseEnter={this.hoverIn('selectIconTypePump')} onMouseLeave={this.hoverOut('selectIconTypePump')}  onPress={() => {
                            this.updateValveType(1);
                        }}>
                        <Image style={this.style.selectIconTypeImage} source={(data.valveType == 1 ? selectPumpOn : selectPump)}/>
                        <Text style={this.style.selectIconTypeText}>{this.props.actions.translate.get("valveCard_zone_selectType_pump")}</Text>
                    </TouchableOpacity>)
    }

    renderCardBack() {
        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        if (!this.state.showSimultaneity && !data.uneditable)
            return this.renderTypeSelection();
        else
            return this.renderSimultaneity();
    }

    renderTypeSelection() {

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        return (
            <View style={this.style.cardView}>
                <Text style={this.style.title}>{this.props.actions.translate.get("valveCard_zone_slotNumber").replace("%NSLOT%", data.slot_virtual)}</Text>
                <Text style={this.style.subtitle}>{this.props.actions.translate.get("valveCard_zone_selectType_title")}</Text>
                <View style={this.style.SelectValveTypeContainer}>
                    <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypeNothing]} onMouseEnter={this.hoverIn('selectIconTypeNothing')} onMouseLeave={this.hoverOut('selectIconTypeNothing')}  onPress={() => {
                            this.updateValveType(null);
                        }}>
                        <Image style={this.style.selectIconTypeImage} source={(data.valveType == null ? selectNothingOn : selectNothing)}/>
                        <Text style={this.style.selectIconTypeText}>{this.props.actions.translate.get("valveCard_zone_selectType_nothing")}</Text>
                    </TouchableOpacity>
                    {this.renderPumpBack(data)}
                    <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypeValve]} onMouseEnter={this.hoverIn('selectIconTypeValve')} onMouseLeave={this.hoverOut('selectIconTypeValve')}  onPress={() => {
                            this.updateValveType(0);
                        }}>
                        <Image style={this.style.selectIconTypeImage} source={(data.valveType == 0 ? selectValveOn : selectValve)}/>
                        <Text style={this.style.selectIconTypeText}>{this.props.actions.translate.get("valveCard_zone_selectType_valve")}</Text>
                    </TouchableOpacity>
                </View>

                {this.renderRealtimeLayer()}
            </View>
        );
    }

    renderSimultaneity() {

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        //console.log("this.props.devices[this.props.idDevice]", this.props.devices[this.props.idDevice]);
        //console.log("renderSimultaneity data", data);
        var indents = [];

        // Clone sims
        var simultaneous_valves = [];
        data.simultaneous_valves.forEach((sim) => {
            simultaneous_valves.push(sim);
        });

        /*if (this.props.idDevice == 'AC70719A110026B5') {
            console.log("simultaneous_valves", simultaneous_valves);
        }*/

        // Add itself
        if (simultaneous_valves.length > 0)
            simultaneous_valves.push({
                controlId: this.props.idDevice,
                valveNumber: this.props.valveNumber,
                slot_virtual: data.slot_virtual,
                minutesAdj: data.minutesAdj
            });

        // Sorting items
        simultaneous_valves.sort((a, b) => {
            if (a.slot_virtual > b.slot_virtual)
                return 1;
            else if (a.slot_virtual < b.slot_virtual) {
                return -1;
            }
            else {
                return 0;
            }
        });

        // Render table and columns
        var totalRows = Math.floor((simultaneous_valves.length) / 3) + 1;
        //console.log("totalRows", totalRows);
        var counterValve = 0;
        var addButtonAddedInColumn = false;
        var addButtonAddedInRow = false;
        for (var row = 0; row < totalRows; row++) {
            var columnsIndents = [];
            for (var column = 0; column < 3; column++) {
                //console.log("row", row, "column", column);
                if (simultaneous_valves[counterValve]) {
                    columnsIndents.push(
                        <View style={this.style.simultaneityCell}>
                            {this.renderSimultaneityItem(simultaneous_valves[counterValve])}
                        </View>
                    );
                    counterValve++;
                }
                else {
                    // Add button
                    if (!addButtonAddedInColumn) {
                        columnsIndents.push(
                            <View style={this.style.simultaneityCell}>
                                {this.renderSimultaneityAddButton()}
                            </View>
                        );
                        addButtonAddedInColumn = true;
                    }
                    else {
                        columnsIndents.push(
                            <View style={this.style.simultaneityCell}>
                            </View>
                        );
                    }
                }
            }
            if (!addButtonAddedInRow)
                indents.push(
                    <View style={{width: "100%", flexDirection: "row", height: 60}}>
                        {columnsIndents}
                    </View>
                );
            if (addButtonAddedInColumn)
                addButtonAddedInRow = true;
        }

        // Get minutes
        var minutes = 0;
        simultaneous_valves.forEach((sim) => {
            var dataAux = this.props.devices[sim.controlId].valves.config.filter((c)=>{return c.valveNumber == sim.valveNumber});
            if (dataAux.length>0){
                dataAux=dataAux[0];
                if (dataAux.minutesAdj && dataAux.minutesAdj > minutes)
                    minutes = dataAux.minutesAdj;
            }
        });

        return (
            <View style={this.style.cardView}>

                <TouchableOpacity activeOpacity={1}
                    onPress={()=>{
                        this.toggle()();
                    }}
                    style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                    <Image style={[this.style.turnButtonImage, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1}
                    onPress={()=>{
                        this.toggle()();
                    }}
                    style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                    <Image style={[this.style.turnButtonImage, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                </TouchableOpacity>

                <Text style={this.style.title}>{this.props.actions.translate.get("valveCard_zone_slotNumber").replace("%NSLOT%", data.slot_virtual)}</Text>
                <Text style={this.style.subtitle}>{
                    this.props.actions.translate.get("valveCard_simultaneous_slots")
                }</Text>

                <View style={{width: "100%", borderColor: "silver", borderTopWidth: 1, borderBottomWidth: 1, marginTop: 2}}>
                    <ScrollView
                        scrollEventThrottle={1000} style={{width: "100%", height: 218, padding: 5}}
                        contentContainerStyle={{}} ref='_scrollView'>
                        {indents}
                    </ScrollView>
                </View>

                {true?<View style={{width: "100%", height: 30, alignItems: "center", justifyContent: "center"}}>
                    <Text style={{textAlign: "center"}}>{
                        (minutes>0? minutes : data.minutesAdj) + " " +
                        //this.props.actions.translate.get("fliwerCard_minuts").toLowerCase()
                        "min. riego simultáneo"
                    }</Text>
                </View>:null}

                {this.renderRealtimeLayer()}
            </View>
        );
    }

    renderSimultaneityAddButton() {

        return (
            <TouchableOpacity style={[this.style.simultaneityChild, {borderColor: FliwerColors.primary.green}]}
                onPress={() => {
                    global.frontLayer.display(true);
                    this.setState({simultaneitySelectionValvesModalVisible: true, simultaneitySelectionCheckboxMapping: {}});
                }}>
                <Text style={{fontSize: 30, color: FliwerColors.primary.green, paddingBottom: 3}}>{"+"}</Text>
            </TouchableOpacity>
        );
    }

    renderSimultaneityItem(data) {

        var hideRemoveItem = (data.controlId == this.props.idDevice && data.valveNumber == this.props.valveNumber);

        return (
            <View style={{width: "100%", height: "100%"}}>
                <View style={[this.style.simultaneityChild, this.style.simultaneityChildItemAdded]}>
                    <Text style={{fontSize: 14, fontWeight: "bold", color: "white"}}>{"S" + data.slot_virtual}</Text>
                    <Text style={{fontSize: 8, color: "#E5E8E8"}}>{data.controlId}</Text>
                </View>
                {!hideRemoveItem?<TouchableOpacity style={this.style.simultaneityChildRemoveItem}
                    onPress={() => {
                        global.frontLayer.display(true);
                        this.setState({simultaneityDeleteModalVisible: true, simultaneityDeleteControlId: data.controlId, simultaneityDeleteValveNumber: data.valveNumber});
                    }}>
                    <Text style={{fontSize: 15, color: "white", paddingBottom: 3}}>{"x"}</Text>
                </TouchableOpacity>:null}
            </View>
        );
    }

    renderSimultaneityDeleteModal() {

        if (this.state.simultaneityDeleteModalVisible) {
            global.frontLayer.renderLayer(() => {
                return (
                    <FliwerDeleteModal
                        visible={this.state.simultaneityDeleteModalVisible}
                        onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({simultaneityDeleteModalVisible: false, simultaneityDeleteControlId: null, simultaneityDeleteValveNumber: null});
                        }}
                        onConfirm={() => {
                            global.frontLayer.display(false);
                            this.setState({simultaneityDeleteModalVisible: false});
                            this.deleteSimultaneity();
                        }}
                        title={
                            this.props.actions.translate.get("valveCard_are_you_sure_to_remove_this_simultaneity")
                        }
                        subtitle={false}
                        text={""}
                        hiddeText={true}
                        password={false}
                        loadingModal={false}
                        />
                );
            });
        } else
            return [];
    }

    renderSimultaneitySelectionValvesModal() {

        if (this.state.simultaneitySelectionValvesModalVisible) {


            var data;
            if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
            else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

            // Getting all items
            var items = [];
            for (var idDevice in this.props.devices) {
                var device = this.props.devices[idDevice];

                var allow = true;
                if (this.props.checkGardeneridHome && device.idHome != this.props.checkGardeneridHome)
                    allow = false;

                if (allow && device.valves && device.valves.config) {
                    device.valves.config.forEach((conf) => {
                        //console.log("conf", conf);

                        // Add or not
                        // *****************************************************
                        var add = conf.valveType == 0? true : false;
                        if (conf.controlId == this.props.idDevice && conf.valveNumber == this.props.valveNumber)
                            add = false;
                        if (add)
                            data.simultaneous_valves.forEach((sim) => {
                                //console.log("sim", sim);
                                if (conf.controlId == sim.controlId && conf.valveNumber == sim.valveNumber)
                                    add = false;
                            });
                        // *****************************************************

                        if (add) {
                            var key = conf.controlId + "|" + conf.slot_virtual + "|" + conf.valveNumber;

                            var checkvalue;
                            if (this.state.simultaneitySelectionCheckboxMapping[key] != undefined)
                                checkvalue = this.state.simultaneitySelectionCheckboxMapping[key];
                            else {
                                checkvalue = false;
                                this.state.simultaneitySelectionCheckboxMapping[key] = checkvalue;
                            }

                            items.push({
                                key: key,
                                controlId: conf.controlId,
                                valveNumber: conf.valveNumber,
                                checkvalue: checkvalue,
                                slot_virtual: conf.slot_virtual,
                                idZone: conf.idZone,
                                zoneName: this.props.zoneData[conf.idZone] && this.props.zoneData[conf.idZone].name ? this.props.zoneData[conf.idZone].name.toUpperCase().trim() : "Z",
                                minutesAdj: conf.minutesAdj
                            });
                        }
                    });
                }
            };

            // Sorting items
            items.sort((a, b) => {
                if (a.slot_virtual > b.slot_virtual)
                    return 1;
                else if (a.slot_virtual < b.slot_virtual) {
                    return -1;
                }
                else {
                    return 0;
                }
            });
            if (this.state.simultaneitySelectionSortedBy == "zone")
                items.sort((a, b) => {
                    var a_zoneName = a.zoneName.toLowerCase();
                    var b_zoneName = b.zoneName.toLowerCase();
                    if (a_zoneName > b_zoneName) {
                        return 1;
                    }
                    else if (a_zoneName < b_zoneName) {
                        return -1;
                    }
                    return 0;
                });

            // Render sorteditems
            var dimensions = Dimensions.get('window');
            var isLandscape = (dimensions.width > 800);
            var indents = [];
            items.forEach((item) => {
                var key = item.key;
                ((key) => {


                    indents.push(
                        <View style={{width: "100%", flexDirection: "row", borderColor: "silver", borderWidth: 1, borderRadius: 4, marginTop: 4}}>

                            {isLandscape?<View style={this.style.simultaneitySelectionRow}>
                                <Text style={{fontSize: 14, fontWeight: "bold"}}>{"S" + item.slot_virtual}</Text>
                            </View>:null}
                            {isLandscape?<View style={this.style.simultaneitySelectionRow}>
                                <Text style={{fontSize: 10}}>{item.zoneName=='Z' ? "" : item.zoneName}</Text>
                            </View>:null}
                            {isLandscape?<View style={this.style.simultaneitySelectionRow}>
                                <Text style={{fontSize: 10}}>{item.controlId}</Text>
                            </View>:null}

                            {!isLandscape?<View style={this.style.simultaneitySelectionRow}>
                                <View style={{}}>
                                    <Text style={{fontSize: 14, fontWeight: "bold", textAlign: "center"}}>{"S" + item.slot_virtual}</Text>
                                </View>
                                <View style={{}}>
                                    <Text style={{fontSize: 10, textAlign: "center"}}>{item.zoneName=='Z' ? "" : item.zoneName}</Text>
                                </View>
                                <View style={{}}>
                                    <Text style={{fontSize: 10, fontStyle: "italic", textAlign: "center"}}>{item.controlId}</Text>
                                </View>
                            </View>:null}

                            <View style={this.style.simultaneitySelectionRow}>
                                <Text style={{fontSize: 10}}>{item.minutesAdj? (item.minutesAdj + " " + this.props.actions.translate.get("fliwerCard_minuts").toLowerCase()) : " - - -"}</Text>
                            </View>
                            <View style={[this.style.simultaneitySelectionRow, {}]}>
                                <CheckBox key={101}
                                    title={""}
                                    textStyle={{}}
                                    containerStyle={{backgroundColor: "transparent", borderWidth: 0}}
                                    checked={item.checkvalue? true : false}
                                    onPress={this.changeSimultaneitySelectionCheckbox(key)}
                                />
                            </View>
                        </View>
                    );
                })(key);

            });

            global.frontLayer.renderLayer(() => {
                return (
                    <Modal animationType="fade" loadingModal={this.props.loading} inStyle={[FliwerStyles.modalIn, {maxWidth: 600, height: "80%"}]} visible={true} onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({simultaneitySelectionValvesModalVisible: false});
                        }}>
                        <View style={[FliwerStyles.modalView, {
                                paddingLeft: 20,
                                paddingRight: 20}]
                            }>

                            <View style={{width: "100%", marginTop: 0, marginBottom: 15}}>
                                <Text style={[FliwerStyles.titleStyle, {fontSize: 18}]}>
                                    {this.props.actions.translate.get("valveCard_select_one_or_more_valves")}
                                </Text>
                            </View>

                            <View style={this.style.sorterSwitchContainer}>
                                <Text style={[this.style.sorterSwitchTitle, this.style.sorterSwitchTitle1]}>{
                                    this.props.actions.translate.get("valveCard_sorted_by") + ": " + "Slot"
                                }</Text>
                                <Switch style={this.style.sorterSwitch}
                                    onValueChange = {(value) => {
                                        this.setState({simultaneitySelectionSortedBy: (value ? "zone" : "controller")});
                                    }}
                                    value = {(this.state.simultaneitySelectionSortedBy == "controller" ? false : true)}
                                    thumbColor={"white"} trackColor={"#a5cd07"}/>
                                <Text style={[this.style.sorterSwitchTitle, this.style.sorterSwitchTitle2]}>{this.props.actions.translate.get("general_zone")}</Text>
                            </View>

                            <ScrollView
                                scrollEventThrottle={1000}
                                style={[FliwerStyles.modalScrollViewStyle, {borderColor: "black", borderWidth: 1, borderRadius: 4, borderTopRightRadius: 0, borderBottomRightRadius: 0, padding: 4, marginTop: 20}]}
                                contentContainerStyle={{justifyContent: "space-between"}}>
                                {indents}
                            </ScrollView>
                            <View style={{flexDirection: "row", alignSelf: "center", marginTop: 20, marginBottom: 0}}>
                                <FliwerGreenButton
                                    text={this.props.actions.translate.get('accept')}
                                    style={FliwerStyles.fliwerGreenButtonStyle}
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 120}]}
                                    onPress={() => {
                                        this.addSimultaneities();
                                    }}/>
                                <FliwerGreenButton
                                    text={this.props.actions.translate.get('general_cancel')}
                                    style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: "silver", color: "black"}]}
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 120, marginLeft: 10, marginRight: 10}]}
                                    onPress={() => {
                                        global.frontLayer.display(false);
                                        this.setState({simultaneitySelectionValvesModalVisible: false});
                                    }}/>
                            </View>
                        </View>
                    </Modal>
                );
            });
        } else
            return [];

    }

    changeSimultaneitySelectionCheckbox(key) {
        return () => {
            var simultaneitySelectionCheckboxMapping = this.state.simultaneitySelectionCheckboxMapping;
            var currentvalue = simultaneitySelectionCheckboxMapping[key];
            simultaneitySelectionCheckboxMapping[key] = !currentvalue;
            this.setState({simultaneitySelectionCheckboxMapping: simultaneitySelectionCheckboxMapping});
        };
    }

    printOptions() {

        var arr = [{label: this.props.actions.translate.get("valveCard_zone_selectPump_nopump"), value: null}];

        if (this.props.devices[this.props.idDevice] && this.props.devices[this.props.idDevice].valves && this.props.devices[this.props.idDevice].valves.slots) {
            var slots = this.props.devices[this.props.idDevice].valves.slots.filter((s) => {
                return s.valveType == 1
            });
            slots.forEach((s) => {
                arr.push({label: this.props.actions.translate.get("valveCard_zone_slotNumber").replace("%NSLOT%", s.slot_virtual), value: s.slot_virtual})
            });
            return arr;
        } else {
            return [];
        }
    }

    printFlowOptions() {
        var arr =[{label: this.props.actions.translate.get("valveCard_zone_selectPump_nopump"), value: null}];
        this.props.actions.fliwerDeviceActions.getFlowDevices("flow-meter").forEach((d,i)=>{
            arr.push({label: (i+1)+" - "+d.DeviceSerialNumber, value: d.DeviceSerialNumber});
        });
        return arr;
    }

    printZones() {
        /*
        var zones = this.props.zoneData;
        var gardens = this.props.gardenData;
        */

        var device = this.props.devices[this.props.idDevice];

        var zones=this.props.actions.fliwerHomeActions.getZonesFromHome(device.idHome);
        
        if (device.idImageDash || device.idHome) {
            var arr = Object.values(zones)/*.filter((z) => {
                if (gardens[z.idImageDash].idHome == device.idHome) {
                    return true;
                } else {
                    return false
                }
            })*/.map((z) => {
                return {label:z && z.name?z.name:null, value: z.idZone}
            });
            function compare(a, b) {
                if (a.label < b.label)
                    return -1;
                if (a.label > b.label)
                    return 1;
                return 0;
            }
            var aarray = arr.sort(compare);
            aarray.unshift({label: this.props.actions.translate.get("general_no_zone"), value: null});
            return aarray;
        } else {
            return [];
        }
    }

    updateValveZone(value) {
        var {data} = this.props;

        var changes = [{
                valveNumber: data.valveNumber,
                minutesAdj: value ? 1/*(this.props.zoneData[value].minutesCustom ? this.props.zoneData[value].minutesCustom : (this.props.zoneData[value].minutesEasy ? this.props.zoneData[value].minutesEasy : 1))*/ : null,
                idZone: value
            }]

        this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
            this.setState({minutesAdj: changes[0].minutesAdj})
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        })

    }

    updateValveType(value) {

        var {data} = this.props;

        var changes = [{
                valveNumber: data.valveNumber,
                valveType: value,
                motor_controlId: null,
                motor_valveNumber: null,
                motor_slot: null,
                minutesAdj: null,
                idZone: null
            }]
        this.state.minutesAdj = null;

        this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
            this.forceUpdate();
            this.toggle()()
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    updateMotor(value) {

        var {data} = this.props;

        if (this.hasDirectPump(data.Type)) {
            var changes = [{
                    valveNumber: data.valveNumber,
                    motor: value
                }]
        } else {

            var slot = value != null ? this.props.devices[this.props.idDevice].valves.slots.find(s => s.slot_virtual == value) : {controlId: null, valveNumber: null};
            var changes = [{
                    valveNumber: data.valveNumber,
                    motor_controlId: slot.controlId,
                    motor_valveNumber: slot.valveNumber,
                    motor_slot: value
                }]
        }

        this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
            this.forceUpdate();
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    updateFlowmeter(idDevice) {

        var {data} = this.props;

        var changes = [{
            valveNumber: data.valveNumber,
            flowmeter: idDevice
        }]

        this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
            this.forceUpdate();
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    updateValveMinutes(value) {
        var {data} = this.props;

        this.setState({minutesAdj: value});
        clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {

            var changes = [{
                    valveNumber: data.valveNumber,
                    minutesAdj: value
                }]

            this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
                this.forceUpdate();
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
            })
        }, 1000)

    }

    hasDirectPump(type) {
        return false;//All goes with the same pump system 
        
        switch (type) {
            case "UNIPRO16":
            case "UNIPRO12":
            case "UNIPRO9":
            case "UNIPRO6":
            case "TBD6":
            case "TBD4":
            case "TBD2":
            case "TBD1":
            case "TBD1":
                return true;
            default:
                return false;
        }
    }

    toggle(value) {
        var that = this;
        return function () {
            that.refs.card._toggleCard(value)
        }
    }

    addMinute() {
        var min = this.state.minutesAdj;
        if (min) {
            min++;
            if (min > 250)
                min = 1;
            this.updateValveMinutes(min);
        }
    }

    subMinute() {
        var min = this.state.minutesAdj;
        if (min) {
            min--;
            if (min < 1)
                min = 250;
            this.updateValveMinutes(min);
        }
    }

    getValveIcon() {
        //var {data} = this.props;

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        switch (data.valveType) {
            case 0:
                return valveIcon;
            case 1:
                return pumpIcon;
            default:
                return nothingIcon;
        }
    }

    deleteSimultaneity() {

        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        // Remove item
        var new_simultaneous_valves = [];
        data.simultaneous_valves.forEach((sim) => {
            console.log("deleteSimultaneity sim", sim);
            if (this.state.simultaneityDeleteControlId != sim.controlId  || this.state.simultaneityDeleteValveNumber != sim.valveNumber)
                new_simultaneous_valves.push(sim);
        });

        var changes = [{
            valveNumber: this.props.valveNumber,
            minutesAdj: this.state.minutesAdj,
            simultaneous_valves: new_simultaneous_valves
        }];

        this.props.setLoading(true);
        this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
            this.forceUpdate();
            this.props.setLoading(false);
        }, (err) => {
            this.props.setLoading(false);
            if (err && err.reason)
                toast.error(err.reason);
        });

    }

    addSimultaneities() {


        var data;
        if(this.props.devices[this.props.idDevice].valves.config[0].valveNumber==0) data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber];
        else data=this.props.devices[this.props.idDevice].valves.config[this.props.valveNumber - 1];

        var list = this.state.simultaneitySelectionCheckboxMapping;
        var selected = [];

        for (var item in list) {
            var checked = list[item];
            if (checked)
                selected.push(item);
        }

        if (selected.length == 0) {
            toast.error(this.props.actions.translate.get("valveCard_select_atleast_slot"));
            return;
        }

        // Clone sims
        var simultaneous_valves = [];
        data.simultaneous_valves.forEach((sim) => {
            simultaneous_valves.push(sim);
        });

        selected.forEach((key) => {
            //var key = conf.controlId + "|" + conf.slot_virtual + "|" + conf.valveNumber;
            var pieces = key.split("|");
            simultaneous_valves.push({
                controlId: pieces[0],
                slot_virtual: pieces[1],
                valveNumber: pieces[2]
            });
        });

        var changes = [{
            valveNumber: this.props.valveNumber,
            minutesAdj: this.state.minutesAdj,
            simultaneous_valves: simultaneous_valves
        }];

        console.log("changes", changes);

        this.props.setLoading(true);
        this.props.actions.fliwerDeviceActions.modifyControlValves(this.props.idDevice, changes).then(() => {
            //this.forceUpdate();
            global.frontLayer.display(false);
            this.setState({simultaneitySelectionValvesModalVisible: false, simultaneitySelectionCheckboxMapping: {}});
            this.props.setLoading(false);
        }, (err) => {
            this.props.setLoading(false);
            if (err && err.reason)
                toast.error(err.reason);
        });

    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        lastUpdateDevices: state.fliwerDeviceReducer.lastUpdate,
        devices: state.fliwerDeviceReducer.devices,
        deviceRealTimeInfo: state.fliwerDeviceReducer.deviceRealTimeInfo,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        zoneData: state.fliwerZoneReducer.data,
        checkGardeneridHome: state.sessionReducer.gardenerCheckidHome
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
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
        }
    }
}

var style = {
    /*
     configOut:{
     position: "absolute",
     right: 10,
     top: 5,
     zIndex:1
     },
     config:{
     fontSize: 35,
     color: "#cecece"
     },*/
    valveCard: {
        //maxWidth:300
    },
    selectZoneText: {
        fontSize: 10,
        fontFamily: FliwerColors.fonts.light,
        marginTop: 0,
    },
    cardView: {
        height: 300,
        width: "100%",
        alignItems: "center"
    },
    title: {
        width: "100%",
        textAlign: "center",
        marginTop: 8,
        fontSize: 22,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        height: 29
    },
    subtitle: {
        width: "100%",
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center"
    },
    valveImageTouch: {
        marginTop: 2,
        width: 110,
        height: 110,
    },
    valveImage: {
        width: "100%",
        height: "100%"
    },
    infoContainer: {
        width: "70%",
    },
    pumpImageTouch: {
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        top: -110,
    },
    flowImageTouch: {
        width: 60,
        height: 60,
        borderRadius: 30,
        position: "absolute",
        top: -110,
        right: 0
    },
    pumpSlotTextTouch: {
        backgroundColor: FliwerColors.primary.black,
        borderRadius: 15,
        width: 28,
        height: 28,
        position: "absolute",
        top: -73,
        left: 38,
        alignItems: "center",
        justifyContent: "center"
    },
    flowTextTouch:{
        backgroundColor: FliwerColors.primary.black,
        borderRadius: 15,
        width: 28,
        height: 28,
        position: "absolute",
        top: -73,
        right: -5,
        alignItems: "center",
        justifyContent: "center"
    },
    selectZoneOut: {

    },
    pumpSlotText: {
        color: "white",
        fontSize: 12,
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light
    },
    pumpImage: {
        width: "100%",
        height: "100%"
    },
    durationContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 19
    },
    durationText: {
        flexGrow: 1,
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    minContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    numberText: {
        fontSize: 22,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        paddingRight: 3
    },
    minText: {
        fontFamily: FliwerColors.fonts.light,
        fontSize: 14
    },
    slider: {
        width: "100%"
    },
    valveMinutesMinus: {
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: FliwerColors.primary.green,
        top: 33,
        left: -35,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"

    },
    valveMinutesPlus: {
        position: "absolute",
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: FliwerColors.secondary.green,
        top: 33,
        right: -35,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    valveMinutesButtonText: {
        fontSize: 19,
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.regular
    },
    pumpSelectContainer: {
        //height:40,
        //marginBottom:10,
        borderRadius: 4,
        position: "relative",
        zIndex: 1,
        width: "100%",
    },
    pumpSelect: {
        width: "100%",
        position: "relative",
        zIndex: 1,
        height: 29,
        minHeight: 29,
    },
    SelectValveTypeContainer: {
        flexGrow: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80%",
        paddingTop: 5,
        paddingBottom: 5
    },
    selectIconType: {
        width: 100,
        height: 120,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    selectIconTypeImage: {
        width: 90,
        height: 90
    },
    selectIconTypeText: {
        fontFamily: FliwerColors.fonts.light,
        color: FliwerColors.primary.black
    },
    turnButtonUp: {
      position:"absolute",
      width:40,
      height:40,
      top: 0,
      right: 0,
//      borderColor: "red", borderWidth: 1,
      zIndex: 999
    },
    turnButtonDown: {
      position:"absolute",
      width:40,
      height:40,
      bottom: 0,
      right: 0,
//      borderColor: "red", borderWidth: 1,
      zIndex: 999
    },
    turnButtonImage:{
      position:"absolute",
      right: 0,
//      borderColor: "green", borderWidth: 1,
      width: 20,
      height: 20,
      marginRight: 4
    },
    simultaneityCell: {
        width: "33%", height: "100%", padding: 3
    },
    simultaneityChild: {
        width: "100%", height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: 4
    },
    simultaneityChildItemAdded: {
        backgroundColor: FliwerColors.complementary.blue,
        borderColor: FliwerColors.secondary.gray
    },
    simultaneityChildRemoveItem: {
        position: 'absolute',
        top: -5,
        right: 0,
        width: 20, height: 20,
        borderRadius: 45,
        backgroundColor: "red",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center"
    },
    sorterSwitchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
    },
    sorterSwitchTitle: {
        fontSize: 14
    },
    sorterSwitchTitle1: {
        marginRight: 20
    },
    sorterSwitchTitle2: {
        marginLeft: 20
    },
    sorterSwitch: {
        transform: [{scaleX: 1}, {scaleY: 1}]
    },
    simultaneitySelectionRow: {
        flex: 1,
        alignItems: "center", justifyContent: "center", paddingTop: 5, paddingBottom: 5, paddingLeft: 2, paddingRight: 2
    },
    layerEdit: {
        position: "absolute",
        left: 0,
        top: 0,
        borderRadius: 10,
        backgroundColor: "rgba(93, 173, 226, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        zIndex: 999
    },
    layerEditContent: {
        justifyContent: "center",
        alignItems: "center"
    },
    layerText: {
        fontSize: 25,
        color: "white",
        textAlign: "center"
    },
    layerTextStatusValve: {
        fontSize: 12,
        color: "white",
        marginTop: 10,
        borderWidth: 1,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        padding: 5
    },
    ":hover": {
        valveImage: {
            filter: "brightness(150%)"
        },
        pumpImageOn: {
            filter: "brightness(110%)"
        },
        pumpImageOff: {
            filter: "brightness(90%)"
        },
        flowImageOn: {
            filter: "brightness(110%)"
        },
        flowImageOff: {
            filter: "brightness(90%)"
        },
        selectIconTypeNothing: {
            filter: "brightness(110%)"
        },
        selectIconTypePump: {
            filter: "brightness(110%)"
        },
        selectIconTypeValve: {
            filter: "brightness(110%)"
        },
        turnButtonUp:{
          filter:"brightness(150%)"
        },
        turnButtonDown:{
          filter:"brightness(150%)"
        }
    }
}

if (Platform.OS === 'web') {
    style.pumpSelect.height = 42;
    style.pumpSelect.minHeight = 42;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, ValveCard));
