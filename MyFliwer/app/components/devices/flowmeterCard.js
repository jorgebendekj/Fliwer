'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import FliwerSlideBar from '../custom/FliwerSlideBar.js';
import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors.js'

import Icon from 'react-native-vector-icons/EvilIcons';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'


import {toast} from '../../widgets/toast/toast'
import { CheckBox  } from 'react-native-elements'
import Dropdown from '../../widgets/dropdown/dropdown';
import DatePicker from '../../widgets/datePicker/datePicker';

import flowOffIcon  from '../../assets/img/10_flow-off.png'
import flowOnIcon  from '../../assets/img/10_flow-on.png'
import selectNothing  from '../../assets/img/10_ico-nothing.png'
import selectNothingOn  from '../../assets/img/10_ico-nothing_on.png'

import nothingIcon  from '../../assets/img/valve_nothing.png'
import valveIcon  from '../../assets/img/valve.png'
import flowIcon from '../../assets/img/flowmeter.png'


import selectValve  from '../../assets/img/10_ico-valve.png'
import selectValveOn  from '../../assets/img/10_ico-valve_on.png'
import selectPump  from '../../assets/img/10_ico-pump.png'
import selectPumpOn  from '../../assets/img/10_ico-pump_on.png'

class FlowmeterCard extends Component {

    constructor(props) {
        super(props);

        var device = this.props.devices[this.props.idDevice];
        this.state = {
            timeout: null,
            minutes: null,
            replant: (device.idZone && this.props.zoneData[device.idZone] ? this.props.zoneData[device.idZone].replantTime : null),
            replantEnabled: true,
            replant2: null,
            replant2Enabled: false,
            replant3: null,
            replant3Enabled: false
        };

        if(device.idZone && !this.props.zoneData[device.idZone]){
            //load Zone data
            this.props.actions.fliwerZoneActions.getOneZone(device.idZone).then((zone)=>{
                this.setState({replant: zone.replantTime});
            })
        }

    }

    componentWillUnmount = () => {
        clearTimeout(this.state.timeout);
    }

    getReedSensorIcon(type) {
        //var {data} = this.props;

        switch (type) {
            case "flow-meter":
                return flowIcon;
            case "pluviometer":
                return valveIcon;
            case "anenometer":
                return valveIcon;
            default:
                return nothingIcon;
        }
    }
    

    selectReedSensor(reedSensorType) {
        //this.props.setLoading(true);
        this.props.actions.fliwerDeviceActions.modifyDevice(this.props.idDevice, {reedSensorType: reedSensorType}).then((zoneChanged) => {
            this.toggle()();
            //this.props.setLoading(false);
        })
    }

    selectFlowMeterTick(value) {
        //this.props.setLoading(true);
        this.props.actions.fliwerDeviceActions.modifyFlowMeterTicks(this.props.idDevice, value).then((zoneChanged) => {
            //this.props.setLoading(false);
        })
    }


    render() {
        var {title} = this.props;
        var device = this.props.devices[this.props.idDevice];

        if (this.state.conf) {
            if (this.hasValves(device.type))
                return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/" + this.props.idDevice + "/valves/"} />)
            else
                return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/new/linkwifi/" + this.props.idDevice} />)
        } else if (this.state.idDevice) {
            return (<Redirect push to={"/device/" + this.state.idDevice} />)
        } else {
            return (
                    <FliwerCard ref="card" touchableFront={true} cardInStyle={this.style.valveCard} style={this.style.valveCard} touchableBack={true}>
                        <View>
                            <View style={[this.style.cardView]}>
                                <Text style={this.style.title}>{title}</Text>
                                {
                                    device.reedSensorType && device.reedSensorType!='no-sensor'?
                                        (<Text style={this.style.subtitle}>{this.props.actions.translate.get("deviceCard_reedSensor_"+device.reedSensorType)+" "+(this.props.actions.fliwerDeviceActions.getFlowDevices(device.reedSensorType).findIndex(d => d.DeviceSerialNumber ===  device.DeviceSerialNumber)+1)}</Text>)
                                        :(null)
                                }
                                {this.renderCardFront()}
                            </View>
                        </View>
                        <View>
                            <View style={[this.style.cardView]}>
                                <Text style={this.style.title}>{title}</Text>
                                {
                                    device.reedSensorType && device.reedSensorType!='no-sensor'?
                                        (<Text style={this.style.subtitle}>{this.props.actions.translate.get("deviceCard_reedSensor_"+device.reedSensorType)+" "+(this.props.actions.fliwerDeviceActions.getFlowDevices(device.reedSensorType).findIndex(d => d.DeviceSerialNumber ===  device.DeviceSerialNumber)+1)}</Text>)
                                        :(null)
                                }
                                {this.renderCardBack()}
                            </View>
                        </View>
                    </FliwerCard>
                    );
        }
    }

    renderCardFront() {
        var device = this.props.devices[this.props.idDevice];
        var card = [];

        card.push(
            <TouchableOpacity style={[this.style.valveImageTouch, (device.reedSensorType=='no-sensor' || !device.reedSensorType?{flexGrow:1,width:150}:{})/*, (data.valveType == null ? {marginTop: 30, marginBottom: 30} : (data.valveType == 1 ? {marginTop: 0, position: "absolute", height: "100%", width: "60%"} : {})*/]} onMouseEnter={this.hoverIn('valveImage')} onMouseLeave={this.hoverOut('valveImage')}
                onPress={() => {
                    this.toggle()();
                }}>
                <Image style={this.style.valveImage} draggable={false} source={this.getReedSensorIcon(device.reedSensorType)} resizeMode={"contain"} />
            </TouchableOpacity>
        );
        /*
        card.push(
                <View key={9} style={[this.style.zoneSelectContainer]} onStartShouldSetResponder={() => true}>
                    <View style={[this.style.selectZoneTextContainer, {marginTop: 6}]}>
                        <Text key={11} style={this.style.selectZoneText}>{
                            this.props.actions.translate.get("deviceCard_select_reedsensor")
                            //"Escoge la frecuencia del sensor de pulsos"
                        }</Text>
                    </View>
                    <View style={[this.style.pumpSelectContainer]}>
                        <Dropdown modal={true} placeholder={
                                this.props.actions.translate.get("deviceCard_select_reedsensor")
                                //"Escoge la frecuencia del sensor de pulsos"
                            } 
                            selectedValue={device.reedSensorType} style={this.style.pumpSelect} styleOptions={{}} 
                            options={[
                                {label: this.props.actions.translate.get("deviceCard_reedSensor_no-sensor"), value: "no-sensor"},
                                {label: this.props.actions.translate.get("deviceCard_reedSensor_flow-meter"), value: "flow-meter"},
                                {label: this.props.actions.translate.get("deviceCard_reedSensor_pluviometer"), value: "pluviometer"},
                                {label: this.props.actions.translate.get("deviceCard_reedSensor_anemometer"), value: "anemometer"}]} 
                            onChange={(value) => {
                                if (this.props.isVisitor)
                                    toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                else
                                    this.selectReedSensor(value)
                            }} />
                    </View>

                </View>
                );
        */

        if(device.type.indexOf("UNIPRO") == -1 && device.reedSensorType=='flow-meter')
            card.push(
                    <View key={9} style={[this.style.zoneSelectContainer]} onStartShouldSetResponder={() => true}>
                        <View style={[this.style.selectZoneTextContainer, {marginTop: 6}]}>
                            <Text key={11} style={this.style.selectZoneText}>{
                                this.props.actions.translate.get("valveCard_select_reed_sensor_freq")
                                //"Escoge la frecuencia del sensor de pulsos"
                            }</Text>
                        </View>
                        <View style={[this.style.pumpSelectContainer]}>
                            <Dropdown modal={true} placeholder={
                                    this.props.actions.translate.get("valveCard_select_reed_sensor_freq")
                                    //"Escoge la frecuencia del sensor de pulsos"
                                } 
                                selectedValue={device.flowMeterTicks} style={this.style.pumpSelect} styleOptions={{}} 
                                options={[
                                    //{label: this.props.actions.translate.get("valveCard_flowMeter_noFlowMeter"), value: null}, 
                                    {label: /*"Sin frecuencia"*/this.props.actions.translate.get("valveCard_no_frequency"), value: null}, 
                                    {label: this.props.actions.translate.get("valveCard_flowMeter_value").replace("%NLITERS%", 1), value: 1}, 
                                    {label: this.props.actions.translate.get("valveCard_flowMeter_value").replace("%NLITERS%", 10), value: 10}, 
                                    {label: this.props.actions.translate.get("valveCard_flowMeter_value").replace("%NLITERS%", 100), value: 100}, 
                                    {label: this.props.actions.translate.get("valveCard_flowMeter_value").replace("%NLITERS%", 1000), value: 1000}]} 
                                onChange={(value) => {
                                    if (this.props.isVisitor)
                                        toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                    else
                                        this.selectFlowMeterTick(value)
                                }} />
                        </View>

                    </View>
                    );
                    
        //Add realtime flowmeter data
        if(device.reedSensorType=='flow-meter' && device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime)){
            //Add a centered text with the flowmeter data in Liters from real time start
            //TODO: translate
            card.push(
                <Text style={[this.style.selectZoneText,{marginTop:5}]}>{(device.realTimeConfig.flow?device.realTimeConfig.flow:0)+" L from real time start"}</Text>
            );
        }

        return card;
    }

    renderCardBack() {
        var device = this.props.devices[this.props.idDevice];

        return (
            <View style={this.style.SelectValveTypeContainer}>
                <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypeNothing]} onMouseEnter={this.hoverIn('selectIconTypeNothing')} onMouseLeave={this.hoverOut('selectIconTypeNothing')}  onPress={() => {
                        this.selectReedSensor("no-sensor");
                    }}>
                    <Image style={this.style.selectIconTypeImage} source={(device.reedSensorType=='no-sensor' || !device.reedSensorType?selectNothingOn:selectNothing)}/>
                    <Text style={this.style.selectIconTypeText}>{this.props.actions.translate.get("valveCard_zone_selectType_nothing")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypePump]} onMouseEnter={this.hoverIn('selectIconTypePump')} onMouseLeave={this.hoverOut('selectIconTypePump')}  onPress={() => {
                        this.selectReedSensor("flow-meter");
                    }}>
                    <Image style={this.style.selectIconTypeImage} source={(device.reedSensorType=='flow-meter'?flowOnIcon:flowOffIcon)}/>
                    <Text style={this.style.selectIconTypeText}>{"Caudalímetro"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypeValve]} onMouseEnter={this.hoverIn('selectIconTypeValve')} onMouseLeave={this.hoverOut('selectIconTypeValve')}  onPress={() => {
                        this.selectReedSensor("pluviometer");
                    }}>
                    <Image style={this.style.selectIconTypeImage} source={selectValve}/>
                    <Text style={this.style.selectIconTypeText}>{"pluviómetro"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[this.style.selectIconType, this.style.selectIconTypeValve]} onMouseEnter={this.hoverIn('selectIconTypeValve')} onMouseLeave={this.hoverOut('selectIconTypeValve')}  onPress={() => {
                        this.selectReedSensor("anenometer");
                    }}>
                    <Image style={this.style.selectIconTypeImage} source={selectValve}/>
                    <Text style={this.style.selectIconTypeText}>{"Anenómetro"}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    toggle(value) {
        var that = this;
        return function () {
            that.refs.card._toggleCard(value)
        }
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
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        zoneData: state.fliwerZoneReducer.data,
        isVisitor: state.sessionReducer.visitorCheckidUser
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
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch)
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
    cardView: {
        height: 300,
        width: "100%",
        alignItems: "center"
    },
    cardViewLonger: {
        height: 535
    },
    title: {
        width: "100%",
        textAlign: "center",
        marginTop: 10,
        fontSize: 22,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        height: 28
    },
    subtitle:{
        width: "100%",
        textAlign: "center",
        fontSize: 12,
        fontFamily: FliwerColors.fonts.regular
    },

    checkBoxContainer: {
        width: "100%",
        backgroundColor: "white",
        borderColor: "white",
        paddingRight: 0,
        paddingLeft: 15,
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 5,
        marginBottom: 0
    },
    checkBoxText: {
        fontSize: 14,
        fontWeight: "normal"
    },

    durationContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 19,
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 10
    },
    durationText: {
        flexGrow: 1,
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    minContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
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
    sliderContainer: {
        width: "100%",
        flexDirection: "row",
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 0
    },
    slider: {
        flexGrow: 1
    },
    valveMinutesMinus: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
        marginTop: 12,
        backgroundColor: FliwerColors.primary.green,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    }, valveMinutesPlus: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 5,
        marginTop: 12,
        backgroundColor: FliwerColors.secondary.green,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    valveMinutesButtonText: {
        fontSize: 19,
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.regular
    },

    replantText: {
        alignSelf: "flex-start",
        marginTop: 5,
        marginLeft: 15,
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    datePickerContainer: {
        height: 40,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 4,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    datePickerContainerIn: {
        height: "100%",
        marginLeft: 10,
        marginRight: 10,
        flexGrow: 1,
        borderWidth: 1,
        borderRadius: 4,
        paddingLeft: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    datePicker: {
        width: "100%",
        height: "100%",
        borderRadius: 4,
        borderWidth: 0,
        paddingLeft: 5,
        alignItems: "flex-start",
        opacity: 0
    },
    datePickerText: {
        position: "absolute",
        width: "100%",
        display: "flex",
        alignItems: "center",
        paddingLeft: 10
    },
    replantErase: {
        width: 30,
        height: 30,
        marginRight: 15
    },
    replantEraseImage: {
        width: 30,
        height: 30
    },
    zoneSelectContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        paddingLeft: 15
    },
    flowSelectBackContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        paddingLeft: 15
    },
    selectZoneText: {
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    pumpSelectContainer: {
        height: 40,
        borderRadius: 4,
        flexGrow: 1,
        position: "relative",
        paddingRight: 15,
        //marginBottom:6
    },
    pumpSelect: {
        width: "100%",
        position: "relative",
        zIndex: 1,
    },
    
    valveImageTouch: {
        marginTop: 2,
        width: 150,
        height: 150,
    },
    valveImage: {
        width: "100%",
        height: "100%"
    },
    SelectValveTypeContainer: {
        flexDirection: "row",
        flexGrow:1,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80%",
        paddingTop: 5,
        paddingBottom: 5
    },
    selectIconType: {
        width: 95,
        height: 105,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    selectIconTypeImage: {
        width: 75,
        height: 75
    },
    selectIconTypeText: {
        fontFamily: FliwerColors.fonts.light,
        color: FliwerColors.primary.black
    },

    "@media (orientation:portrait)": {

    },
    ":hover": {
    },
}

if (Platform.OS === 'android' || Platform.OS == 'ios') {
    style.pumpSelectContainer.marginBottom = 2;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FlowmeterCard));
