'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Switch, Platform} = require('react-native');

import Clipboard from '@react-native-clipboard/clipboard';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';

import FliwerCard from '../custom/FliwerCard.js'
import FliwerTwoPanelInfo from '../../components/custom/FliwerTwoPanelInfo.js'
import FliwerDeviceList from '../../components/custom/FliwerDeviceList.js'
import FliwerTextInput from '../../components/custom/FliwerTextInput.js'
import FliwerCalmButton from '../custom/FliwerCalmButton.js'


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import moment from 'moment';

import { Redirect } from '../../utils/router/router'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import {toast} from '../../widgets/toast/toast'
import Dropdown from '../../widgets/dropdown/dropdown';
import RealtimeCountdown from '../../components/devices/realtimeCountdown.js'

import sensor_slim  from '../../assets/img/sensor_slim_icon.png'
import defaultIcon  from '../../assets/img/fliwer_icon1.png'
import deviceSensor  from '../../assets/img/6_Sensor-planted.png'
import deviceLinkWifi  from '../../assets/img/device_linkwifi2.png'
import deviceLinkGprs  from '../../assets/img/device_linkgprs.png'
import deviceControl9  from '../../assets/img/device_control.png'
import deviceControl24  from '../../assets/img/Control24v.png'
import deviceLogger  from '../../assets/img/device_logger.png'
import deviceSDial  from '../../assets/img/device_sdial2.png'
import deviceWDial  from '../../assets/img/device_wdial.png'

import deviceBattery1  from '../../assets/img/2-Battery3.png'
import deviceBattery2  from '../../assets/img/2-Battery2.png'
import deviceBattery3  from '../../assets/img/2-battery1.png'
import deviceBatteryNull  from '../../assets/img/2-Battery-gray.png'
import deviceConnectionLevel1  from '../../assets/img/2-wifi4.png'
import deviceConnectionLevel2  from '../../assets/img/2-wifi3.png'
import deviceConnectionLevel3  from '../../assets/img/2-wifi2.png'
import deviceConnectionLevel4  from '../../assets/img/2-wifi-verd.png'
import deviceConnectionLevelnull  from '../../assets/img/2-wifi-gray.png'
import deviceBattery0  from '../../assets/img/2-nobattery.png'
import deviceUnplugged  from '../../assets/img/2-noplug.png'
import deviceConnectionLevel0  from '../../assets/img/2-Nowifi.png'
import devicePlugged  from '../../assets/img/2-Plug-verd.png'

import settingImage  from '../../assets/img/setting.png'
import trashImage  from '../../assets/img/trash.png'

import turn1 from '../../assets/img/3_Turn1.png'
import turn2 from '../../assets/img/3_Turn2.png'

import directConnectionImage from '../../assets/img/directConnection.png'
import indirectConnectionImage from '../../assets/img/indirectConnection.png'

import SignalBar from './signalBar.js'
import PingTestBar from './pingTestBar.js'


class DeviceCard extends Component {

    constructor(props) {
        super(props);
        var device = this.props.devices[this.props.idDevice];
        this.state = {
            idDevice: null,
            conf: false,
            selectedIndex: null
        }
    }

    componentWillUnmount = () => {
        clearTimeout(this.state.timeout);
        clearTimeout(this.state.timeOutCountdown);
        clearTimeout(this.state.timeOutRenderGetDevice);
    };


    setClipBoardId(str) {
        Clipboard.setString(str);
        toast.notification(this.props.actions.translate.get("deviceCard_front_clipboard").replace("%SN%", str))
    }

    setClipBoardSIMNumber(str) {
        Clipboard.setString(str);
        toast.notification(this.props.actions.translate.get("sim_number_copied_to_clipboard").replace("%SN%", str))
    }

    typeToBatteryLevel(type) {
        switch (type) {
            case 0:
                return deviceBattery0;
            case 1:
                return deviceBattery1;
            case 2:
                return deviceBattery2;
            case 3:
                return deviceBattery3;
            default:
                return this.props.sessionRoles.fliwer?deviceBatteryNull:null;
        }
    }
    typeToBatteryPlugged(type) {
        switch (type) {
            case 0:
                return deviceUnplugged;
            case 1:
                return devicePlugged;
            default:
                return null;
        }
    }

    typeToBatteryorcedBorder(type){
        switch (type) {
            case 0:
                return "red";
            case 1:
                return null;
            case 2:
                return null;
            case 3:
                return null;
            default:
                return FliwerColors.primary.gray;
        }
    }

    typeToConnectionLevel(type) {
        switch (type) {
            case 0:
                return deviceConnectionLevel0;
            case 1:
                return deviceConnectionLevel1;
            case 2:
                return deviceConnectionLevel2;
            case 3:
                return deviceConnectionLevel3;
            case 4:
                return deviceConnectionLevel4;
            default:
                return deviceConnectionLevel4; //deviceConnectionLevelnull;
        }
    }

    typeToConnectionLevelForcedBorder(type) {
        switch (type) {
            case 0:
                return "red";
            default:
                return null;
        }
    }

    hasValves(type) {
        switch (type) {
            case "SENS":
                return true;
            case "CONTROL_9":
            case "CONTROL_24":
            case "UNIPRO16":
            case "UNIPRO12":
            case "UNIPRO9":
            case "UNIPRO6":
            case "TBD6":
            case "TBD4":
            case "TBD2":
            case "TBD1":
                return true;
            case "LINK_WIFI_PRO":
            case "LINK_WIFI":
            case "LINK_GPRS_PRO":
            case "LINK_GPRS":
            case "SENS_PRO":
                return false;
            default:
                return false;
        }
    }

    hasReedSensor(type) {
        switch (type) {
            case "CONTROL_9":
            case "CONTROL_24":
            case "UNIPRO16":
            case "UNIPRO12":
            case "UNIPRO9":
            case "UNIPRO6":
            case "TBD6":
            case "TBD4":
            case "TBD2":
            case "TBD1":
            case "SENS_PRO":
                return true;
            case "SENS":
            case "LINK_WIFI_PRO":
            case "LINK_WIFI":
            case "LINK_GPRS_PRO":
            case "LINK_GPRS":
                return false;
            default:
                return false;
        }
    }

    typeToImg(type) {
        switch (type) {
            case "SENS":
                return deviceSensor;
            case "CONTROL_9":
                return deviceControl9;
            case "CONTROL_24":
                return deviceControl24;
            case "LINK_WIFI_PRO":
            case "LINK_WIFI":
                return deviceLinkWifi;
            case "LINK_GPRS_PRO":
            case "LINK_GPRS":
                return deviceLinkGprs;
            case "SENS_PRO":
                return deviceLogger;
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
                return deviceLinkWifi;
        }
    }

    getStateStyle(device) {
        var style={
            cardBackgroundColor: "white",
            cardBackgroundColorConnected: "white",
            cardBackgroundColorDisconnected: "white",
            primaryColor: FliwerColors.primary.green,
            secondaryColor: FliwerColors.primary.gray,
            textColor1: FliwerColors.primary.gray,
            textColor2: "black",
            textColorWithBackground1: "white",
            textColorWithBackground2: "white",
            hasCenterContainer:true,
            text:"CONN"//this.props.actions.translate.get("deviceCard_front_connected")
        }

        if (device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime>Date.now()/1000 && !device.realTimeConfig.connectionTime)){
            /*
            style.cardBackgroundColor= FliwerColors.secondary.black;
            style.primaryColor= "white";
            style.textColor1= "white";
            style.textColor2= "white";
            style.textColorWithBackground1="black";
            style.textColorWithBackground2="white";
            style.textColorWithBackground= FliwerColors.primary.gray;
            */
           
            //style.primaryColor= FliwerColors.secondary.black;

            //style.text = "RT MODE"//this.props.actions.translate.get("general_realtime_mode").toUpperCase();
            style.hasCenterContainer=false;
        } else if (device.realTimeConfig){
            /*
            style.cardBackgroundColor= FliwerColors.secondary.black;
            style.primaryColor= "white";
            style.textColor1= "white";
            style.textColor2= "white";
            style.textColorWithBackground1="black";
            style.textColorWithBackground2="white";
            style.textColorWithBackground= FliwerColors.primary.gray;
            */
            style.cardBackgroundColorConnected="rgba(239, 255, 169, 0.38)";
            style.cardBackgroundColorDisconnected="rgba(255, 169, 169, 0.38)";
            style.primaryColor= FliwerColors.secondary.black;
            style.hasCenterContainer=false;
            if(this.props.deviceRealTimeInfo && this.props.deviceRealTimeInfo[this.props.idDevice] && this.props.deviceRealTimeInfo[this.props.idDevice].status==2)style.text = "RT ON"//this.props.actions.translate.get("general_realtime_mode").toUpperCase();
            else style.text = "RT OFF"//this.props.actions.translate.get("general_realtime_mode").toUpperCase();
            
        } else if (device.irrigating){
            style.primaryColor= FliwerColors.complementary.skyblue;
            //style.text = this.props.actions.translate.get("deviceCard_front_irrigating")
            style.text = "IRRIG";
        } else if (device.failed){
            style.primaryColor= FliwerColors.secondary.red;
            //style.text = this.props.actions.translate.get("deviceCard_failed_front")
            style.text = "FAILED";
        } else if (device.deviceLost){
            style.primaryColor= FliwerColors.secondary.red;
            //style.text = this.props.actions.translate.get("deviceCard_front_disconnected")
            style.text = "DISC";
        } else if (device.firstConnection && (device.type == 'LINK_WIFI' || device.type == 'LINK_WIFI_PRO'   || device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO")){
            style.primaryColor= FliwerColors.primary.gray;
            //style.text = this.props.actions.translate.get("deviceCard_front_firstConnection")
            style.text = "IDLE";
        }
        /* else{
            style.text = this.props.actions.translate.get("deviceCard_front_connected")
        }*/
        return style;

    }

    //old getStateBackground
    getStateBackground(device) { 
        var color = FliwerColors.primary.green;
        if (device.irrigating)
            color = FliwerColors.complementary.skyblue;
        else if (device.failed || device.deviceLost)
            color = FliwerColors.secondary.red;
        else if (device.firstConnection && (device.type == 'LINK_WIFI' || device.type == 'LINK_WIFI_PRO'   || device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO"))
            color = FliwerColors.primary.gray;
        else
            color = FliwerColors.primary.green;
        return color;
    }

    getStateText(device) {
        var text = this.props.actions.translate.get("deviceCard_front_connected");
        //console.log("getStateText device", device);
        if (device.realTimeConfig)
            text = this.props.actions.translate.get("general_realtime_mode")
        else if (device.irrigating)
            text = this.props.actions.translate.get("deviceCard_front_irrigating")
        else if (device.failed)
            text = this.props.actions.translate.get("deviceCard_failed_front")
        else if (device.deviceLost)
            text = this.props.actions.translate.get("deviceCard_front_disconnected")
        else if (device.firstConnection && (device.type == 'LINK_WIFI' || device.type == 'LINK_WIFI_PRO'   || device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO"))
            text = this.props.actions.translate.get("deviceCard_front_firstConnection")
        else
            text = this.props.actions.translate.get("deviceCard_front_connected")
        return text;
    }
    
    printZones() {
        var zones = this.props.zoneData;
        var gardens = this.props.gardenData;
        var device = this.props.devices[this.props.idDevice];
        if (!device.idImageDash && !device.idHome) {
            device.idHome = gardens[this.props.zoneData[this.props.idZone].idImageDash].idHome;
        }
        var that = this;
        var arr = Object.values(zones).filter((z) => {
            if (gardens[z.idImageDash].idHome == device.idHome) {
                return true;
            } else {
                return false
            }
        }).map((z) => {
            return {label: z.name, value: z.idZone}
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
    }

    printReedSensors() {
        return [
            {label: /*"Ningún sensor"*/this.props.actions.translate.get("deviceCard_no_sensor"), value: "no-sensor"},
            {label: /*"Caudalímetro"*/this.props.actions.translate.get("deviceCard_flowmeter"), value: "flow-meter"},
            {label: /*"Pluviómetro"*/this.props.actions.translate.get("deviceCard_pluviometer"), value: "pluviometer"},
            {label: /*"Anemómetro"*/this.props.actions.translate.get("deviceCard_anemometer"), value: "anemometer"}
        ];
    }

    printWakeupPeriods() {
        return [
            {label:"10 min", value: 10},
            {label:"20 min", value: 20},
            {label:"40 min", value: 40},
            {label:"60 min", value: 60},
            {label:"protocol v1", value: 1}
        ];
    }

    removeFailedDevice() {
        var device = this.props.devices[this.props.idDevice];
        this.props.actions.fliwerDeviceActions.deleteDeviceFailed(device.LinkSerialNumber, this.props.idDevice).then(() => {
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    configPress()
    {
        if (this.props.isVisitor)
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
        else {
            var device = this.props.devices[this.props.idDevice];
            if (Platform.OS == "android" || Platform.OS == 'ios' || this.hasValves(device.type) || device.type == 'SENS_PRO' || device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO")
            {
                this.setState({conf: true});
            } else {
                if (typeof this.props.visibleModalUseApp === "function")
                    this.props.visibleModalUseApp();
                //toast.error(this.props.actions.translate.get('Devices_add_devices_app'));
            }
        }
    }

    render() {
        var device = this.props.devices[this.props.idDevice];
        if (this.state.conf) {
            if (this.hasValves(device.type) || device.type == 'SENS_PRO'){
                if(this.props.devicesAsComponent) return (<Redirect push to={"/app/fliwer/devices/" + this.props.idZone + "/" + this.props.idDevice + "/valves/"} />);
                else return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/" + this.props.idDevice + "/valves/"} />);
            }else
            {
                if (device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO")
                    return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/new/link3G/" + this.props.idDevice} />);
                else
                    return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/new/linkwifi/" + this.props.idDevice} />);
            }
        } else if (this.state.idDevice) {
            return (<Redirect push to={"/device/" + this.state.idDevice} />)
        } else {
            return (
                    <FliwerCard ref="card" touchableFront={false} touchableBack={false} unfocused={this.props.unfocused}
                            cardStyle={[device ? (device.failed ? {backgroundColor: "#ffb7b7"} : {}) : {}, !this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)}]}
                            onSelectUnfocused={() => {
                                if (typeof this.props.onSelectUnfocused === "function")
                                    this.props.onSelectUnfocused(this.props.idDevice);
                            }}
                        >
                        <View>
                            {this.renderCardFront()}
                        </View>
                        <View>
                            {this.renderCardBack()}
                        </View>
                    </FliwerCard>
                    );
        }
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    measure(callback) {
        return this.refs.card.measure(callback);
    }

    toggle(value) {
        var that = this;
        return function () {
            that.refs.card._toggleCard(value)
        }
    }

    selectReedSensor(reedSensorType) {
        this.props.setLoading(true);
        var device = this.props.devices[this.props.idDevice];
        this.props.actions.fliwerDeviceActions.modifyDevice(this.props.idDevice, {reedSensorType: reedSensorType}).then((zoneChanged) => {
            if (this.props.zoneChangeHandler && typeof this.props.zoneChangeHandler === "function")
                this.props.zoneChangeHandler();
            this.props.setLoading(false);
            this.toggle()();
        })
    }

    selectWakeUpPeriod(wakeUpPeriod) {
        this.props.setLoading(true);
        var device = this.props.devices[this.props.idDevice];
        this.props.actions.fliwerDeviceActions.setLinkWakeupPeriod(this.props.idDevice,wakeUpPeriod).then((zoneChanged) => {
            if (this.props.zoneChangeHandler && typeof this.props.zoneChangeHandler === "function")
                this.props.zoneChangeHandler();
            this.props.setLoading(false);
        })
    }

    selectFlowMeterTick(value) {
        this.props.setLoading(true);
        var device = this.props.devices[this.props.idDevice];
        this.props.actions.fliwerDeviceActions.modifyFlowMeterTicks(this.props.idDevice, value).then((zoneChanged) => {
            this.props.setLoading(false);
            this.toggle()();
        })
    }

    selectFlowZone(idZone) {
        this.props.setLoading(true);
        this.props.actions.fliwerDeviceActions.linkToFlowZone(this.props.idDevice, idZone).then((zoneChanged) => {
            if (this.props.zoneChangeHandler && typeof this.props.zoneChangeHandler === "function")
                this.props.zoneChangeHandler();
            this.props.setLoading(false);
            this.toggle()();
        })
    }

    selectProtocolVersion(protocolVersion) {
        if(protocolVersion==1){        
            this.props.setLoading(true);
            var device = this.props.devices[this.props.idDevice];
            this.props.actions.fliwerDeviceActions.modifyConfiguration(this.props.idDevice, {
                protocolVersion: 1
            }).then(() => {
                if (this.props.zoneChangeHandler && typeof this.props.zoneChangeHandler === "function")
                    this.props.zoneChangeHandler();
                this.props.setLoading(false);
            }, (err) => {
                this.props.setLoading(false);
                toast.error(err)
            });
        }
    }

    renderCardFront() {
        if (typeof this.props.onPressAdd === 'function')
            return (
                <View style={[this.style.cardView, this.style.cardCommonView]}>
                    <TouchableOpacity style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}}
                        onPress={()=>this.props.onPressAdd()}
                        >
                        <Text key={987} style={{fontSize: 100, marginTop: -5, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                    </TouchableOpacity>
                </View>
            );
        var device = this.props.devices[this.props.idDevice];
        var card = [];
        var title = FliwerCommonUtils.typeToTitle(device.type);
        if (!title)
            title = device.type;
        else
            title = this.props.actions.translate.get(title);

        var rotatable = (device ? (device.failed ? false : true) : false) && !this.props.unfocused;

        var compilationTime = device.unixCompilationTime?moment(device.unixCompilationTime * 1000).format("DD/MM/YYYY"):null;

        var collectTime = device.lastCollectCompletionTime?moment(device.lastCollectCompletionTime * 1000).format("DD/MM/YYYY HH:mm:ss"):null;


        var cardBackgroundColor = this.getStateStyle(device).cardBackgroundColor;
        /*
        if(device.realTimeConfig){
            //In realtime
            if(this.props.deviceRealTimeInfo[this.props.idDevice] && this.props.deviceRealTimeInfo[this.props.idDevice].status==2){
                cardBackgroundColor=this.getStateStyle(device).cardBackgroundColorConnected;
            }else if(this.props.deviceRealTimeInfo[this.props.idDevice] && this.props.deviceRealTimeInfo[this.props.idDevice].status==1){
                cardBackgroundColor=this.getStateStyle(device).cardBackgroundColorDisconnected;
            }
        }
        */
        var rightTextTwoPanel=null
        var centerTextTwoPanel=null;
        if(device.realTimeConfig &&  (device.realTimeConfig.plannedConnectionTime>Date.now()/1000 && !device.realTimeConfig.connectionTime)){
            rightTextTwoPanel=this.state.toRealTimeCountdown;
        }else if(device.realTimeConfig){
            rightTextTwoPanel=this.state.endRealTimeCountdown;
        }else{
            centerTextTwoPanel=new Date(device.lastCollectCompletionTime * 1000).toLocaleTimeString([], {hour12: false});
            rightTextTwoPanel=new Date(device.lastCollectCompletionTime * 1000).toLocaleDateString();
        }
        

        card.push(
                <View key={1} style={[this.style.globalContainer,{backgroundColor:cardBackgroundColor}]}>

                    {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                        <Image style={[this.style.turnButtonImage, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                    </TouchableOpacity>:null}
                    {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                        <Image style={[this.style.turnButtonImage, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                    </TouchableOpacity>:null}

                    <Text key={2} style={[this.style.title,{color: this.getStateStyle(device).textColor2}]}>{title}</Text>
                    <TouchableOpacity style={{width: "100%"}} onPress={(e) => {
                            this.setClipBoardId(this.props.idDevice)/*e.stopPropagation()*/
                        }}>
                        <FliwerTwoPanelInfo style={{maxWidth: "100%"}} 
                            borderColor={this.getStateStyle(device).primaryColor}
                            leftContainerStyle={{backgroundColor: this.getStateStyle(device).primaryColor}}
                            leftText={this.props.actions.translate.get("deviceCard_front_id")} 
                            leftTextStyle={{color: this.getStateStyle(device).textColorWithBackground1}}
                            rightTextStyle={{color: this.getStateStyle(device).textColor2}}
                            rightContainerStyle={{backgroundColor: cardBackgroundColor}}
                            rightText={this.props.idDevice} 
                        />
                    </TouchableOpacity>
                    {compilationTime?
                        <Text key={13} style={[this.style.lastConnectionText,{alignSelf:"end"},{color:this.getStateStyle(device).textColor2}]}>{this.props.actions.translate.get("deviceCard_firmware_version")+": "+compilationTime}</Text>
                    :null}
                    {collectTime && device.realTimeConfig?(
                        <Text key={14} style={[this.style.lastConnectionText,{alignSelf:"end"},{color:this.getStateStyle(device).textColor2}]}>{"Last collect: "+collectTime}</Text>
                    ):<View style={{marginBottom:12}}></View>}
                    <View key={3} style={[this.style.centralContainer]}>
                        <View key={4} style={[this.style.imageContainer]}>
                            <Image key={5} style={this.style.deviceImage} draggable={false} source={this.typeToImg(device.type)} resizeMode={"contain"} />
                        </View>
                        <View key={6} style={[this.style.rightCentralContainer]}>
                          <TouchableOpacity key={7} style={[this.style.batteryImageContainer]}
                              disabled={false/*device.type=="UNIPRO6" || device.type=="UNIPRO9" || device.type=="UNIPRO12" || device.type=="UNIPRO16" || device.type=="CONTROL_24"*/}
                              onPress={() => {
                                  if (typeof this.props.visibleBatteryModal === "function")
                                      this.props.visibleBatteryModal(true, this.props.idDevice);
                              }}>
                              {this.renderBattery()}
                          </TouchableOpacity>
                            <View key={9} style={[this.style.signalImageContainer]}>
                                {this.renderConnection()}
                            </View>
                        </View>
                        <View key={12} style={[this.style.leftCentralContainer]}>
                            {this.renderWakeUpPeriod()}
                            {null/*device.realTimeConfig || (!device.deviceLost && !device.failed && device.unixCompilationTime>=1690754400)?this.renderRealTimeButton():null*/}
                            {null/*this.renderPingTestButton()*/}
                        </View>
                    </View>
                    <FliwerTwoPanelInfo 
                        leftTextStyle={{color: this.getStateStyle(device).textColorWithBackground2}} 
                        centerTextStyle={{color: this.getStateStyle(device).textColor2,fontSize:15}}
                        rightTextStyle={{color: this.getStateStyle(device).hasCenterContainer?this.getStateStyle(device).textColorWithBackground2:this.getStateStyle(device).textColor2,fontSize:15}}
                        leftContainerStyle={[this.style.leftContainerStyle, {backgroundColor: this.getStateStyle(device).primaryColor,width:"28%"}]} 
                        centerContainerStyle={{backgroundColor: cardBackgroundColor}}
                        rightContainerStyle={{backgroundColor: this.getStateStyle(device).hasCenterContainer?this.getStateStyle(device).primaryColor:cardBackgroundColor}} style={{maxWidth: "100%"}} 
                        borderColor={this.getStateStyle(device).primaryColor}
                        leftText={this.getStateStyle(device).text/*this.props.actions.translate.get("deviceCard_front_status")*/} 
                        centerText={centerTextTwoPanel}
                        rightText={rightTextTwoPanel} 
                    />
                    {null/*(device.realTimeConfig?null:(device.failed ? this.renderLastTryRegisterTime() : this.renderLastConnection()))*/}
                    
                    {this.renderRealTimeInfo()}
                    {this.renderNextConnectionOrRealTimeDuration()}

                    {   this.props.sessionRoles.fliwer?(
                            <SignalBar 
                                signalArray={device.connectionHistory?device.connectionHistory.sort((c1,c2)=>{
                                    return c1.timestamp-c2.timestamp
                                }):[]} 
                                style={{marginTop:0}}
                                tickWidth={4}
                                barHeight={14}
                                showText={true}
                                showTime={true}
                                textStyle={{}}
                                timeStyle={{}}
                            />
                        ):null
                    }
                    {null/*
                    <PingTestBar 
                        idDevice={this.props.idDevice} 
                        setLoading={this.props.setLoading}
                    />
                    */}

                   
                   <View key={10} style={[this.style.TrashFrontContainer]}>
                        {(device.failed ? this.drawTrashButton() : null)}

                    </View>
                </View>
                )

        if(this.props.realTimeVisualization){
            //realTime overlay

            //depending on realtime status we define the overlay
            if(this.props.idDevice=='A170711B0F001D2C')debugger;
            if(device.realTimeConfig &&  (device.realTimeConfig.plannedConnectionTime>Date.now()/1000 && !device.realTimeConfig.connectionTime)){
                //Realtime Pending
                card.push(
                    <View key={6} style={[this.style.sensorFrontNoZoneContainer]} >
                        <Text style={[this.style.addZoneText,{paddingLeft:10,paddingRight:10}]}>{"REAL TIME STARTS IN"}</Text>
                        <RealtimeCountdown style={this.style.realTimeCountdownOverlay}  textOnEnd={"Starting realtime..."}  endTime={device.realTimeConfig.plannedConnectionTime} />
                        <View style={{width:"100%",alignItems:"center"}}>
                            {this.renderRealTimeButtonOverlay("white")}
                        </View>
                        
                        {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                            <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
                        {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                            <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
                    </View>
                )
            }else if(device.realTimeConfig){
                //In realtime
                var realTimeStatusStyle;
                if(this.props.deviceRealTimeInfo[this.props.idDevice] && this.props.deviceRealTimeInfo[this.props.idDevice].status==2){
                    realTimeStatusStyle = {
                        backgroundColor: FliwerColors.hexToRgb(FliwerColors.primary.green,0.7)
                    }
                }else if(this.props.deviceRealTimeInfo[this.props.idDevice] && this.props.deviceRealTimeInfo[this.props.idDevice].status==1){
                    realTimeStatusStyle = {
                        backgroundColor: FliwerColors.hexToRgb(FliwerColors.secondary.red,0.7)
                    }
                }

                card.push(
                    <View key={15} style={[this.style.sensorFrontNoZoneContainer,(realTimeStatusStyle?realTimeStatusStyle:{})]} >
                        <Text style={[this.style.addZoneText,{paddingLeft:10,paddingRight:10}]}>{"REAL TIME"}</Text>
                        <RealtimeCountdown key={16} style={this.style.realTimeCountdownOverlay} textOnEnd={"Ending realtime..."}  endTime={device.realTimeConfig.deathTime} />
                        <View style={{width:"100%",alignItems:"center"}}>
                            {this.renderGoToValvesOverlay("white")}
                        </View>
                        <View style={{width:"100%",alignItems:"center"}}>
                            {this.renderRealTimeButtonOverlay("white")}
                        </View>


                        {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                            <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
                        {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                            <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
                    </View>
                )
            }else if(device.unixCompilationTime>=1690754400 /*minimum for rt*/){
                //No realtime


                card.push(
                    <View key={17} style={[this.style.sensorFrontNoZoneContainer]}>
                        <Text style={[this.style.addZoneText,{paddingLeft:10,paddingRight:10}]}>{"START REAL TIME"}</Text>
                        <View style={{width:"100%",alignItems:"center"}}>
                            {this.renderRealTimeButtonOverlay("white")}
                        </View>


                        {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                            <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
                        {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                            <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
                    </View>
                )
            }

        }else{
            //add garden overlay
            if ((device.type == 'SENS' || device.type == 'SENS_PRO') && this.props.zoneDevices.length == 0 && !device.failed) {
                card.push(
                        <TouchableOpacity key={18} style={[this.style.sensorFrontNoZoneContainer]} onPress={() => {
                                //this.toggle()()
                                this.configPress();
                            }}>
                            <Text style={[this.style.addZoneText]}>{this.props.actions.translate.get("deviceCard_front_addGarden")}</Text>
                            {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                                <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                            </TouchableOpacity>:null}
                            {rotatable?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                                <Image style={[this.style.turnButtonImage, this.style.turnButtonImageWhite, {bottom: 5}]} source={turn2} resizeMode={"contain"}/>
                            </TouchableOpacity>:null}
                        </TouchableOpacity>
                        )
            }
        }



        return (
                <View style={[this.style.cardView, this.style.cardCommonView, device.type == 'SENS_PRO'? this.style.cardSensPro : {}]}>
                    {card}
                </View>
                );
    }

    renderBattery() {
        var device = this.props.devices[this.props.idDevice];

        var forcedBorder=this.typeToBatteryorcedBorder(device.batteryLevel);
        return (<Image key={8} style={[this.style.bateryImage,{borderRadius:45,borderWidth:1,borderColor:forcedBorder?forcedBorder:this.getStateStyle(device).primaryColor}]} draggable={false} source={device.batteryPlugged ? this.typeToBatteryPlugged(device.batteryLevel) : this.typeToBatteryLevel(device.batteryLevel)} resizeMode={"contain"} />)
    }

    renderConnection() {
        var device = this.props.devices[this.props.idDevice];
        /*
        if (device.connectionLevel != null){
          return (<Image key={10} style={this.style.wifiImage} draggable={false} source={this.typeToConnectionLevel(device.connectionLevel)} resizeMode={"contain"} />)
        }
        */
       var forcedBorder=this.typeToConnectionLevelForcedBorder(device.connectionLevel);

        return (
          <TouchableOpacity key={13} style={[this.style.wifiImage]} onPress={() => {
            if (this.props.isVisitor)
                toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
            else {
                        if (this.props.visibleRangeModal)
                            this.props.visibleRangeModal(true, this.props.idDevice)
                    }
            }}>
              <Image key={10} style={[this.style.wifiImage,{borderRadius:45,borderWidth:1,borderColor:forcedBorder?forcedBorder:this.getStateStyle(device).primaryColor}]} draggable={false} source={this.typeToConnectionLevel(device.connectionLevel)} resizeMode={"contain"} />
          </TouchableOpacity>
        );
    }

    renderWakeUpPeriod(){
      var device = this.props.devices[this.props.idDevice];

      if(device.config){
        return (
          <TouchableOpacity key={13} style={[this.style.wakeUpPeriodImageContainer,{borderColor:this.getStateStyle(device).primaryColor}]} onPress={() => {
            if (this.props.isVisitor)
                toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
            else {
                        if (this.props.sessionRoles.fliwer && this.props.modalConfig)
                            this.props.modalConfig(true, this.props.idDevice)
                    }
            }}>
              <Text key={14} style={[{textAlign:"center"},this.style.wakeUpPeriodText,{color: this.getStateStyle(device).textColor2}]}>{device.config.wakeUpPeriod+(device.config.wakeUpPeriodUnits?"h":"m")}</Text>
          </TouchableOpacity>
        );
      }else if(device.type == 'LINK_WIFI' || device.type == 'LINK_WIFI_PRO'   || device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO"){
        return (
          <View key={13} style={[this.style.wakeUpPeriodImageContainer]}>
              <Text key={14} style={[{textAlign:"center"},this.style.wakeUpPeriodText]}>{device.wakeUpPeriod+"'"}</Text>
              {(!this.props.sessionRoles.fliwer && !global.envVars.TARGET_RAINOLVE)?
                (
                    <Dropdown modal={true}
                    placeholder={this.props.actions.translate.get("DeviceCard_wakeUpPeriod_selector")}
                    selectedValue={device.wakeUpPeriod}
                    style={{opacity: 0, position: "absolute", width: "100%", height: "100%"}}
                    styleOptions={{}}
                    options={[{label:"protocol v0", value: 0},{label:"protocol v1", value: 1}]}
                    onChange={(value) => {
                        if (this.props.isVisitor)
                            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                        else
                            this.selectProtocolVersion(value)
                        }}
                    />
                )            
              :(
                  <Dropdown modal={true}
                    placeholder={this.props.actions.translate.get("DeviceCard_wakeUpPeriod_selector")}
                    selectedValue={device.wakeUpPeriod}
                    style={{opacity: 0, position: "absolute", width: "100%", height: "100%"}}
                    styleOptions={{}}
                    options={this.printWakeupPeriods()}
                    onChange={(value) => {
                      if (this.props.isVisitor)
                          toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                      else if(value!=1)
                          this.selectWakeUpPeriod(value)
                      else this.selectProtocolVersion(value)
                      }}
                  />
                )
              }

          </View>
        );
      }else{
        return (
            <View key={13} style={[this.style.wakeUpPeriodImageContainer]}>
                <Text key={14} style={[{textAlign:"center"},this.style.wakeUpPeriodText]}>{"v0"}</Text>

                    <Dropdown modal={true}
                    placeholder={this.props.actions.translate.get("DeviceCard_wakeUpPeriod_selector")}
                    selectedValue={device.wakeUpPeriod}
                    style={{opacity: 0, position: "absolute", width: "100%", height: "100%"}}
                    styleOptions={{}}
                    options={[{label:"protocol v0", value: 0},{label:"protocol v1", value: 1}]}
                    onChange={(value) => {
                        if (this.props.isVisitor)
                            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                        else
                            this.selectProtocolVersion(value)
                        }}
                    />     
  
            </View>
          );
      }

    }

    renderRealTimeButton(forcedColor){
        var device = this.props.devices[this.props.idDevice];

        return (
            <TouchableOpacity key={13} style={[this.style.realTimeButtonContainer,{borderColor:forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]} onPress={() => {
                if (this.props.isVisitor)
                    toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                else {
                    if(device.realTimeConfig /*|| o nextRTProgrammed*/){
                        if (this.props.realTimeEndModal)
                            this.props.realTimeEndModal(this.props.idDevice)
                    }else{
                        if (this.props.realTimeStartModal)
                            this.props.realTimeStartModal(this.props.idDevice)
                    }
                }
            }}>
                <Fontisto name="flash" size={20} style={[this.style.wakeUpPeriodText,{color: forcedColor?forcedColor:this.getStateStyle(device).primaryColor, alignSelf: "center"}]}/>
                {device.realTimeConfig?(
                   <View style={[this.style.prohibitLine,{backgroundColor: forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]}></View>
                ):null}
            </TouchableOpacity>
        );
        /*
        

        */
    }

    renderPingTestButton(forcedColor){
        var device = this.props.devices[this.props.idDevice];

        return (
            <TouchableOpacity key={13} style={[this.style.realTimeButtonContainer,{borderColor:forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]} onPress={() => {
                if (this.props.isVisitor)
                    toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                else {
                    if(device.realTimeConfig /*|| o nextRTProgrammed*/){
                        if (this.props.realTimeEndModal)
                            this.props.realTimeEndModal(this.props.idDevice)
                    }else{
                        if (this.props.realTimeStartModal)
                            this.props.realTimeStartModal(this.props.idDevice)
                    }
                }
            }}>
                
                <IconMaterialCommunityIcons  name="antenna" size={20} style={[this.style.wakeUpPeriodText,{color: forcedColor?forcedColor:this.getStateStyle(device).primaryColor, alignSelf: "center"}]} ></IconMaterialCommunityIcons>
                {device.realTimeConfig?(
                   <View style={[this.style.prohibitLine,{backgroundColor: forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]}></View>
                ):null}
            </TouchableOpacity>
        );
    }

    renderGoToValvesOverlay(forcedColor){        
        var device = this.props.devices[this.props.idDevice]; 
   
        if(!this.hasValves(device.type)) return null;

        return (
           
            <FliwerCalmButton 
                containerStyle={[{marginTop:10,borderWidth:1,paddingLeft:10,paddingRight:10,paddingTop:5,paddingBottom:5,borderRadius:5,borderColor:forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]}
                buttonStyle={{}}
                onPress={() => {
                    this.setState({conf:true})
                }}
                textStyle={{color: forcedColor?forcedColor:this.getStateStyle(device).primaryColor}}
                text={"Go to valves"}
            />
        );
    }

    renderRealTimeButtonOverlay(forcedColor){
        var device = this.props.devices[this.props.idDevice];

        return (
            <TouchableOpacity key={13} style={[this.style.realTimeButtonContainerOverlay,{borderColor:forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]} onPress={() => {
                if (this.props.isVisitor)
                    toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                else {
                    if(device.realTimeConfig /*|| o nextRTProgrammed*/){
                        if (this.props.realTimeEndModal)
                            this.props.realTimeEndModal(this.props.idDevice)
                    }else{
                        if (this.props.realTimeStartModal)
                            this.props.realTimeStartModal(this.props.idDevice)
                    }
                }
            }}>
                <Fontisto name="flash" size={40} style={[this.style.wakeUpPeriodText,{color: forcedColor?forcedColor:this.getStateStyle(device).primaryColor, alignSelf: "center"}]}/>
                {device.realTimeConfig?(
                   <View style={[this.style.prohibitLine,{backgroundColor: forcedColor?forcedColor:this.getStateStyle(device).primaryColor}]}></View>
                ):null}
            </TouchableOpacity>
        );
        /*
        

        */
    }

    renderLastTryRegisterTime() {
        var device = this.props.devices[this.props.idDevice];
        var indents = [];
        if (device.LastTryRegisterTime) {
            indents.push(<FliwerTwoPanelInfo 
                leftTextStyle={{color: this.getStateStyle(device).textColorWithBackground2}} 
                rightTextStyle={{color: this.getStateStyle(device).textColor2}} 
                leftContainerStyle={[this.style.leftContainerStyle, {backgroundColor: this.getStateStyle(device).secondaryColor}]} 
                rightContainerStyle={[this.style.rightContainerStyle, {backgroundColor: this.getStateStyle(device).cardBackgroundColor}]} 
                borderColor={this.getStateStyle(device).cardBackgroundColor} 
                style={{maxWidth: "100%"}} 
                rightText={new Date(device.LastTryRegisterTime * 1000).toLocaleTimeString([], {hour12: false})} 
                leftText={new Date(device.LastTryRegisterTime * 1000).toLocaleDateString()} />);
            indents.push(<View style={this.style.lastConnectionTextStyle}><Text key={11} style={this.style.lastConnectionText}>{this.props.actions.translate.get("deviceCard_fail_front_LastTry")}</Text></View>);
        }
        return indents;
    }
    renderLastConnection() {
        var device = this.props.devices[this.props.idDevice];
        var indents = [];
        if (device.lastCollectCompletionTime/*device.lastConnection*/) {
            indents.push(<FliwerTwoPanelInfo 
                leftTextStyle={{color: this.getStateStyle(device).textColorWithBackground2}} 
                rightTextStyle={{color: this.getStateStyle(device).textColor2}} 
                leftContainerStyle={[this.style.leftContainerStyle, {backgroundColor: this.getStateStyle(device).secondaryColor}]} 
                rightContainerStyle={[this.style.rightContainerStyle, {backgroundColor: this.getStateStyle(device).cardBackgroundColor}]} 
                borderColor={this.getStateStyle(device).secondaryColor} 
                style={{maxWidth: "100%"}} 
                rightText={new Date(device.lastCollectCompletionTime * 1000).toLocaleTimeString([], {hour12: false})} 
                leftText={new Date(device.lastCollectCompletionTime * 1000).toLocaleDateString()} />);
            //indents.push(<View style={this.style.lastConnectionTextStyle}><Text key={11} style={[this.style.lastConnectionText,{color:this.getStateStyle(device).textColor1}]}>{this.props.actions.translate.get("deviceCard_front_lastConection")}</Text></View>);
        }
        return indents;
    }

    renderRealTimeInfo(){
        var device = this.props.devices[this.props.idDevice];
        var indents = [];
        if (device.realTimeConfig) {
            /*
                If realTimeConfig.programmedTime>now then we are in a realTime pending. Show in the left the countdown to the realTime start and nothing in the right
                If realTimeConfig.programmedTime<=now then we are in a realTime. Show in the left the programmedTime and the countdown to finish in the right
            */
            if(device.realTimeConfig &&  (device.realTimeConfig.plannedConnectionTime>Date.now()/1000 && !device.realTimeConfig.connectionTime)){
                indents.push(<RealtimeCountdown hidden={true} key={"countdown_"+device.DeviceSerialNumber+"_1"} endTime={device.realTimeConfig.plannedConnectionTime} textOnEnd={"Starting realtime..."} style={{color:this.getStateStyle(device).textColor1}} 
                onTick={(timeLeft)=>{
                    this.setState({toRealTimeCountdown:timeLeft});
                }}
                onEnd={()=>{
                    this.state.timeOutCountdown=setTimeout(()=>{
                        this.props.actions.fliwerDeviceActions.getDevice(this.props.idDevice).then(() => {
                            console.log("success");
                        }, (err) => {
                            console.log(err)
                        })
                    },5000);
                }} />);
                this.state.endRealTimeCountdown="";
            }else {
                //Set programmedTime to toRealTimeCountdown
                this.state.toRealTimeCountdown=new Date(device.realTimeConfig.plannedConnectionTime * 1000).toLocaleTimeString();
                
                indents.push(<RealtimeCountdown hidden={true} key={"countdown_"+device.DeviceSerialNumber+"_1"} endTime={device.realTimeConfig.deathTime} textOnEnd={"Ending realtime..."} style={{color:this.getStateStyle(device).textColor2}} 
                onTick={(timeLeft)=>{
                    this.setState({endRealTimeCountdown:timeLeft});
                }}
                onEnd={()=>{
                    this.state.timeOutCountdown=setTimeout(()=>{
                        this.props.actions.fliwerDeviceActions.getDevice(this.props.idDevice).then(() => {
                            console.log("success");
                        }, (err) => {
                            console.log(err)
                        })
                    },60000);
                }} />)
            }



            /*
            indents.push(<FliwerTwoPanelInfo 
                leftTextStyle={{color: this.getStateStyle(device).textColorWithBackground2}} 
                rightTextStyle={{color: this.getStateStyle(device).textColor2}} 
                leftContainerStyle={[this.style.leftContainerStyle, {backgroundColor: "black"}]} 
                rightContainerStyle={[this.style.rightContainerStyle, {backgroundColor: this.getStateStyle(device).cardBackgroundColor}]} 
                borderColor={this.getStateStyle(device).secondaryColor} 
                style={{maxWidth: "100%"}} 
                rightText={this.state.endRealTimeCountdown} 
                leftText={this.state.toRealTimeCountdown} />);
            */
        }
        return indents;
    }

    renderNextConnectionOrRealTimeDuration(){
        var device = this.props.devices[this.props.idDevice];
        var indents = [];
        
        if(device.realTimeConfig &&  (device.realTimeConfig.plannedConnectionTime>Date.now()/1000 && !device.realTimeConfig.connectionTime)){
            //console.log("Device",device.DeviceSerialNumber,"en realTime fins:",device.realTimeConfig.deathTime) 
            /*
            indents.push(<RealtimeCountdown hidden={true} key={"countdown_"+device.DeviceSerialNumber+"_1"} endTime={device.realTimeConfig.programmedTime} textOnEnd={"Starting realtime..."} style={{color:this.getStateStyle(device).textColor1}} onEnd={()=>{
                this.state.timeOutCountdown=setTimeout(()=>{
                    this.props.actions.fliwerDeviceActions.getDevice(this.props.idDevice).then(() => {
                        console.log("success");
                    }, (err) => {
                        console.log(err)
                    })
                },5000);
            }} />)
            */
        }else if(device.realTimeConfig){
            //console.log("Device",device.DeviceSerialNumber,"en realTime fins:",device.realTimeConfig.deathTime) 
            /*
            indents.push(<RealtimeCountdown hidden={true} key={"countdown_"+device.DeviceSerialNumber+"_1"} endTime={device.realTimeConfig.deathTime} textOnEnd={"Ending realtime..."} style={{color:this.getStateStyle(device).textColor1}} onEnd={()=>{
                this.state.timeOutCountdown=setTimeout(()=>{
                    this.props.actions.fliwerDeviceActions.getDevice(this.props.idDevice).then(() => {
                        console.log("success");
                    }, (err) => {
                        console.log(err)
                    })
                },5000);
            }} />)
            */
        }else if(device.config){
            if(device.config.wakeUpTime && device.config.wakeUpTime<new Date().getTime()/1000){
                if(device.DeviceSerialNumber=="A57070750F000A15")debugger;
                if(!this.state.timeOutRenderGetDevice){
                    this.state.timeOutRenderGetDevice=setTimeout(()=>{
                        clearTimeout(this.state.timeOutRenderGetDevice);
                    },5000);
                    this.props.actions.fliwerDeviceActions.getDevice(this.props.idDevice).then(() => {
                        if(device.DeviceSerialNumber=="A57070750F000A15")debugger;
                            console.log("success");
                    }, (err) => {
                        console.log(err)
                    })
                }
            }else if(device.config.wakeUpTime){
                //console.log("Device",device.DeviceSerialNumber,"es coonnectara a les:",device.config.wakeUpTime)
                indents.push(<RealtimeCountdown hidden={true} key={"countdown_"+device.DeviceSerialNumber+"_2"} textOnEnd={"Talking to device..."} style={{color:this.getStateStyle(device).textColor2}} endTime={device.config.wakeUpTime} onEnd={()=>{
                    this.state.timeOutCountdown=setTimeout(()=>{
                        this.props.actions.fliwerDeviceActions.getDevice(this.props.idDevice).then(() => {
                            console.log("success");
                        }, (err) => {
                            console.log(err)
                        })
                    },15000);
                }} />)
            }
        }

        return indents;
    }

    renderCardBack() {
        if (typeof this.props.onPressAdd === 'function')
            return null;

        var device = this.props.devices[this.props.idDevice];
        if (!device.failed) {
            return (
                    <View style={[this.style.backCard, this.style.cardCommonView, device.type == 'SENS_PRO'? this.style.cardSensPro : {}]}>
                        {this.renderCardBackInfo()}
                    </View>
                    );
        } else
            return [];
    }

    renderLocation()
    {
        var device = this.props.devices[this.props.idDevice];
        var indents = [];
        //console.log("device!!",device);
        if (!device.latitude && !device.longitude)
        {
            indents.push(
                    <View style={{width: "100%", marginTop: 5, flexDirection: "row", justifyContent: "center", flexGrow: 1, paddingLeft: 4}}>
                        <TouchableOpacity style={[this.style.getLocationTouchable, {backgroundColor: FliwerColors.primary.gray, borderRadius: 25, alignSelf: "flex-end", flexDirection: "row"}]} onMouseEnter={this.hoverIn('getLocationTouchable')} onMouseLeave={this.hoverOut('getLocationTouchable')} onPress={() => {
                                    if (this.props.isVisitor)
                                        toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                    else {
                                        if (typeof this.props.visibleModifyDeviceLocation === "function")
                                                              this.props.visibleModifyDeviceLocation(true, this.props.idDevice);
                            }
                        }}>
                            <View style={{flexDirection: "row", alignItems: "center", paddingLeft: 7, paddingRight: 13, paddingBottom: 4, paddingTop: 5}}>
                                <IconMaterialIcons name="gps-fixed" size={20} style={{color: "white", alignSelf: "center", paddingRight: 5}}/>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={{fontFamily: FliwerColors.fonts.light, fontSize: 11, textAlign: "center", color: FliwerColors.secondary.white}}>{this.props.actions.translate.get("DeviceCard_button_set_location")}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    )
        } else {
            var coords = String(device.latitude).substring(0, 9) + "," + String(device.longitude).substring(0, 9)

            indents.push(
                    <View style={[{width: "100%", marginTop: 5, flexDirection: "row", justifyContent: "center", flexGrow: 1, paddingLeft: 5}, this.style.locationEstablished]}>
                        <View style={[this.style.buttonContainer, {height: 33, flexGrow: 0, alignSelf: "flex-end", marginBottom: 0}]}>
                            <TouchableOpacity style={[this.style.leftContainerGPS, {height: null, justifyContent: "center", paddingLeft: 8, paddingRight: 4}]} onMouseEnter={this.hoverIn('leftContainerGPS')} onMouseLeave={this.hoverOut('leftContainerGPS')} onPress={() => {
                                    if (this.props.isVisitor)
                                        toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                    else {
                                        if (typeof this.props.visibleModifyDeviceLocation === "function")
                                            this.props.visibleModifyDeviceLocation(true, this.props.idDevice)
                                    }
                                }}>
                                <View key={4} style={[this.style.imageContainer, {}]}>
                                    <IconMaterialIcons name="gps-fixed" size={21} style={{color: "white", alignSelf: "center"}}/>

                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={this.style.centerContainerLocation} activeOpacity={1} onMouseEnter={this.hoverIn('centerContainerLocation')} onMouseLeave={this.hoverOut('centerContainerLocation')} onPress={() => {
                                    if (this.props.isVisitor)
                                        toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                    else {
                                        if (typeof this.props.visibleModifyDeviceLocation === "function")
                                            this.props.visibleModifyDeviceLocation(true, this.props.idDevice)
                                    }
                                }}>
                                <Text style={[this.style.rightText, {fontSize: 11}]} ellipsizeMode='tail' numberOfLines={1}>{coords}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[this.style.rightContainerLocation, {height: 31/*, backgroundColor: "blue"*/}]} onMouseEnter={this.hoverIn('rightContainerLocation')} onMouseLeave={this.hoverOut('rightContainerLocation')}  onPress={() => {
                                    if (typeof this.props.openLocationMaps === "function")
                                        this.props.openLocationMaps(device.latitude, device.longitude)
                                }}>
                                <IconMaterialCommunityIcons name="directions" color={"white"} size={20} style={{}} ></IconMaterialCommunityIcons>
                                {false?<View style={{flexDirection: "column"}}>
                                    <IconFeather name="corner-down-right" size={14} style={{color: "white", alignSelf: "center"}}/>
                                    <Text style={[this.style.rightText, {color: "white", fontSize: 11}]}>{this.props.actions.translate.get("DeviceCard_go_map").substring(0, 2)}</Text>
                                </View>:null}
                            </TouchableOpacity>
                        </View>
                    </View>
                    );

        }
        return indents;
    }

    renderSIMNumber()
    {
        var device = this.props.devices[this.props.idDevice];

        if (device.type != 'LINK_GPRS' && device.type != 'LINK_GPRS_PRO')
        {
            return null;
        }

        var simNumber = !device.simNumber? "" : device.simNumber;

        return (
                <View style={{width: "100%", marginTop: 5, flexDirection: "row", justifyContent: "center", flexGrow: 1, paddingLeft: 5}}>
                    <View style={[this.style.buttonContainer, {height: 33, flexGrow: 0, alignSelf: "flex-end", marginBottom: 0}]}>
                        <TouchableOpacity style={[simNumber.length == 0? {cursor: "default"} : this.style.leftContainerSIM, {height: null, justifyContent: "center", paddingLeft: 8, paddingRight: 4}]} onMouseEnter={simNumber.length == 0? null : this.hoverIn('leftContainerSIM')} onMouseLeave={simNumber.length == 0? null : this.hoverOut('leftContainerSIM')}
                            onPress={() => {
                                if (simNumber.length != 0) this.setClipBoardSIMNumber(simNumber);
                            }} disabled={(simNumber.length == 0)}>
                            <View key={4} style={[this.style.imageContainer, {}]}>
                                <IconMaterialIcons name="sim-card" size={21} style={{color: "white", alignSelf: "center"}}/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[this.style.centerContainerSIM, {height: 31, width: 160}, simNumber.length == 0? {cursor: "default"} : {}]} activeOpacity={1} onMouseEnter={simNumber.length == 0? null : this.hoverIn('centerContainerSIM')} onMouseLeave={simNumber.length == 0? null : this.hoverOut('centerContainerSIM')}
                            onPress={() => {
                                if (simNumber.length != 0) this.setClipBoardSIMNumber(simNumber);
                            }}>
                            <Text style={[this.style.rightText, {fontSize: 11}]} ellipsizeMode='tail' numberOfLines={1}>{simNumber}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[this.style.rightContainerSIM, {height: 31}]} onMouseEnter={this.hoverIn('rightContainerSIM')} onMouseLeave={this.hoverOut('rightContainerSIM')}  onPress={() => {
                                if (typeof this.props.visibleModifyDeviceSIMNumber === "function")
                                    this.props.visibleModifyDeviceSIMNumber(true, this.props.idDevice)
                            }}>
                            <View style={{flexDirection: "column"}}>
                                <IconFeather name="edit" size={14} style={{color: "white", alignSelf: "center"}}/>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>

                );

    }

    drawTrashButton() {
        var device = this.props.devices[this.props.idDevice];
        return (<TouchableOpacity style={this.style.deleteButton} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
                        if (this.props.isVisitor)
                            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                        else {
                                    if (this.props.modalFunc)
                                        this.props.modalFunc(true, this.props.idDevice)
                                }
                            }}>
            <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
        </TouchableOpacity>)
    }

    drawSettingButton() {
        var device = this.props.devices[this.props.idDevice];
        //console.log('drawSettingButton', device.type);
        if (this.hasValves(device.type) || device.type == 'LINK_WIFI' || device.type == 'LINK_WIFI_PRO' || device.type == 'SENS_PRO' || device.type == "LINK_GPRS" || device.type == "LINK_GPRS_PRO")
            return (
                    <TouchableOpacity style={this.style.gearButton} onMouseEnter={this.hoverIn('gearIcon')} onMouseLeave={this.hoverOut('gearIcon')}  onPress={() => {
                            this.configPress();
                        }}>
                        <Image style={this.style.gearIcon} source={settingImage} resizeMode={"contain"}/>
                    </TouchableOpacity>)
        else
            return [];
    }

    renderCardBackInfo() {

        var device = this.props.devices[this.props.idDevice];
        var card = [];

        var title = FliwerCommonUtils.typeToTitle(device.type);
        if (!title)
            title = device.type;
        else
            title = this.props.actions.translate.get(title);
        var childDevices = !device.routingTable?[]:device.routingTable.sort((a, b)=>{
            if(a.directConnection && !b.directConnection) return -1;
            else if(!a.directConnection && b.directConnection) return 1;
            else if (a.DeviceSerialNumber < b.DeviceSerialNumber)
                return -1;
            else if (a.DeviceSerialNumber > b.DeviceSerialNumber)
                return 1;
            return 0;
        });

        card.push(
                <View key={1} style={[this.style.globalContainer]}>

                    {true?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                        <Image style={[this.style.turnButtonImage, {top: 5}]} source={turn1} resizeMode={"contain"}/>
                    </TouchableOpacity>:null}
                    {true?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={[this.style.turnButtonDown, {bottom: -10 }]} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                        <Image style={[this.style.turnButtonImage, {bottom: 0}]} source={turn2} resizeMode={"contain"}/>
                    </TouchableOpacity>:null}

                    <View style={{flexDirection: "row", width: "100%"}}>
                        <TouchableOpacity style={{justifyContent: "center", width: 22, height: 22}} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
                                if (this.props.isVisitor)
                                    toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                else {

                                    this.props.actions.sessionActions.checkEmailVerificationSession().then((result)=>{
                                        if(result.verifiedEmail && this.props.deleteFunc){
                                                this.props.deleteFunc(true, this.props.idDevice)
                                        }else if (this.props.modalFunc){
                                            this.props.modalFunc(true, this.props.idDevice)
                                        }
                                    },(err)=>{
                                        console.log(err);
                                    })
                                        
                                }
                            }}>
                            <Image style={{width: 16, height: 16}} source={trashImage} resizeMode={"contain"}/>
                        </TouchableOpacity>
                        <Text key={2} style={[this.style.title, {paddingRight: 22}]}>{title}</Text>
                    </View>
                    <TouchableOpacity style={{width: "100%"}} onPress={(e) => {
                            this.setClipBoardId(this.props.idDevice)/*e.stopPropagation()*/
                        }}>
                        <FliwerTwoPanelInfo style={{maxWidth: "100%",marginBottom:4}} leftText={this.props.actions.translate.get("deviceCard_front_id")} rightText={this.props.idDevice} />
                    </TouchableOpacity>
                    {this.renderLinkSerialNumber(device)}
                    {this.drawChangeLinkRealTime(device)}
                    {this.renderFliwerDeviceList(childDevices)}
                    {this.renderSIMNumber()}
                    {this.renderLocation()}
                    <View style={this.style.settingContainer}>
                        {this.drawSettingButton()}
                    </View>
                </View>
                )
        return card;

    }

    renderFliwerDeviceList(childDevices) {
        var device = this.props.devices[this.props.idDevice];
        var card = [];

        card.push(<FliwerDeviceList style={{maxWidth: "100%"}} n={3} rowHeight={50} 
            renderRow={(childDevices, i, n) => this.renderRow(childDevices, i, n)} 
            childDevices={childDevices}/>)
        return card;

    }

    renderLinkSerialNumber(device)
    {
        var indents = [];
        var devices = this.props.devices;
        var deviceLinked = devices[device.LinkSerialNumber] ? devices[device.LinkSerialNumber].type : "";
        indents.push(
                <View style={this.style.linkSerialNumberContainer}>
                    <View style={[this.style.buttonContainer, {height: 35}, Platform.OS == "web" ? {marginBottom: 3} : {}]}>
                        <View style={[this.style.leftContainer, {height: 33, width: 50}]}>
                            <View key={4} style={[this.style.imageContainer]}>
                                <Image key={5} style={this.style.deviceImageButton} draggable={false} source={this.typeToImg(deviceLinked)}  resizeMode={"contain"} />
                            </View>
                        </View>
                        <View style={[this.style.rightContainer, {height: 33, paddingLeft: 8, paddingRight: 8}]}>
                            <Text style={[this.style.rightText, {fontSize: 13}]}>{device.LinkSerialNumber}</Text>
                        </View>
                    </View>
                </View>
                )

        if (device.LinkSerialNumber)
            return (
                    <TouchableOpacity style={{alignSelf: "center"}} onPress={(e) => {
                            this.setClipBoardId(device.LinkSerialNumber)
                        }}>
                        {indents}
                    </TouchableOpacity>
                    )
        else
            return [];

    }

    drawChangeLinkRealTime(device){
        //Only renders if the devices is in realTime and connected
        //if(1){
        if(device.realTimeConfig && device.realTimeConfig.programmedTime<=Date.now()/1000 /*&& this.props.deviceRealTimeInfo && this.props.deviceRealTimeInfo[this.props.idDevice] && this.props.deviceRealTimeInfo[this.props.idDevice].status==2*//*OK*/) {
            //Draws a touchable opacity in absolute position with a circular icon autorenew from MaterialCommunityIcons
            return (
                <View style={this.style.changeLinkRealTimeContainer}>
                    <IconMaterialCommunityIcons name="autorenew" size={26} style={[this.style.wakeUpPeriodText,{color: this.getStateStyle(device).primaryColor, alignSelf: "center"}]}/>
                    <Dropdown modal={true}
                        placeholder={"Gateway de "+this.props.idDevice/*this.props.actions.translate.get("DeviceCard_wakeUpPeriod_selector")*/}
                        selectedValue={device.LinkSerialNumber}
                        style={{opacity: 0, position: "absolute", width: "100%", height: "100%"}}
                        styleOptions={{}}
                        options={this.printGatewaysInRT(device)}
                        onChange={(value) => {
                            if (this.props.isVisitor)
                                toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                            else{
                                //set loading
                                this.props.setLoading(true);
                                var newLink=value;
                                if(1/*value!=device.LinkSerialNumber*/){ 
                                    this.props.actions.fliwerDeviceActions.sendDataRealTime(newLink,"changeGatewayInRealTime",{newDevice: this.props.idDevice},false,120000/*2 minutes*/).then((result) => {
                                        this.props.actions.fliwerDeviceActions.getDeviceList(null,device.idHome).then(() => {
                                            if(result && result.warning){
                                                toast.error("Something went wrong: ("+result.warning+") "+result.error);
                                            }
                                            this.props.setLoading(false);
                                        }, (err) => {
                                            this.props.setLoading(false);
                                            if (err && err.reason)
                                                toast.error(err.reason);
                                        })
                                    }, (err) => {
                                        console.log(err)
                                        this.props.setLoading(false);
                                        if (err && err.reason)
                                            toast.error(err.reason);
                                    });
                                }
                            }
                        }}
                    />
                </View>
            )
        } else
            return [];

    }

    printGatewaysInRT(device){
        //Print dropdown options of the devices in this home that is gateway and is in realTime
        //Print has to be Type + "-" + DeviceSerialNumber
        //Has to be in the same home as the current device
        var devices = this.props.devices;
        var options = [];
        for (var key in devices) {
            if(device.LinkSerialNumber==key || (key!=this.props.idDevice && devices[key].idHome == device.idHome && devices[key].config && devices[key].config.deviceRole)){
                //if(1){ 
                if( device.LinkSerialNumber==key || (devices[key].realTimeConfig && devices[key].realTimeConfig.programmedTime<=Date.now()/1000 && this.props.deviceRealTimeInfo && this.props.deviceRealTimeInfo[key] && this.props.deviceRealTimeInfo[key].status==2/*OK*/)){    
                    options.push({label: devices[key].type + "-" + devices[key].DeviceSerialNumber, value: devices[key].DeviceSerialNumber});
                }
            }
        }
        //sort options by label
        options.sort((a, b) => {
            if (a.label < b.label)
                return -1;
            if (a.label > b.label)
                return 1;
            return 0;
        });
        
        return options;
    }

    renderRow(childDevice, i, totalRows)
    {
        var {gotoFunction} = this.props;

        var old=false;

        var connectionHistory=childDevice && this.props.devices[childDevice.idDevice]? this.props.devices[childDevice.idDevice].connectionHistory:null;
        var childDeviceInfo=childDevice && this.props.devices[childDevice.idDevice]? this.props.devices[childDevice.idDevice]:null;
                
        /*
                onMouseEnter={() => {
                                this.hoverIn('imageRowHoverLeft,leftContainerRowHover,centerContainerRowHover,centerContainerRowTextHover,rightContainerRowHover,imageRowHoverRight')();
                                this.setState({selectedIndex: childDevice.idDevice})
                }} onMouseLeave={() => {
                    this.hoverOut('imageRowHoverLeft,leftContainerRowHover,centerContainerRowHover,centerContainerRowTextHover,rightContainerRowHover,imageRowHoverRight')();
                    this.setState({selectedIndex: null})
                }} 

                <View style={[(i == 0 ? this.style.rightContainerRowFirst : this.style.rightContainerRow), (i == (totalRows - 1) ? this.style.rightContainerRowLast : this.style.rightContainerRow), (childDevice.idDevice == this.state.selectedIndex ? this.style.rightContainerRowHover : {})]}>
                    <Image key={1} style={[this.style.imageRow, (childDevice.idDevice == this.state.selectedIndex ? this.style.imageRowHoverRight : {})]} draggable={false} source={childDevice.directConnection?directConnectionImage:indirectConnectionImage} resizeMode={"contain"} />
                </View>
        */
       
        var backgroundDirectChild="white";
        var backgroundIndirectChild="rgb(245,245,245)";

        return (
                <View style={[this.style.rowContainer,{backgroundColor:childDevice.directConnection?backgroundDirectChild:backgroundIndirectChild}]}>

                        <TouchableOpacity style={[(i == 0 ? this.style.leftContainerRowFirst : this.style.leftContainerRow), (i == (totalRows - 1) ? this.style.leftContainerRowLast : this.style.leftContainerRow), (childDevice.idDevice == this.state.selectedIndex ? this.style.leftContainerRowHover : {},{backgroundColor:childDevice.directConnection?backgroundDirectChild:backgroundIndirectChild})]}
                             onPress={() => {if (typeof gotoFunction === "function")gotoFunction(childDevice.idDevice)}}>
                            <Image key={1} style={[this.style.imageRow, (childDevice.idDevice == this.state.selectedIndex ? this.style.imageRowHoverLeft : {})]} draggable={false} source={this.typeToImg(childDevice.type)} resizeMode={"contain"} />
                            <View style={{width:"100%",height:20}}>
                                <Text style={[this.style.centerContainerRowText, (childDevice.idDevice == this.state.selectedIndex ? this.style.centerContainerRowTextHover : {})]}>{childDevice.idDevice.slice(-4)}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={[this.style.centerContainerRow,(i == 0 ? this.style.rightContainerRowFirst : this.style.rightContainerRow), (i == (totalRows - 1) ? this.style.rightContainerRowLast : this.style.rightContainerRow),{display:"flex",flexDirection:"row"}, (childDevice.idDevice == this.state.selectedIndex ? this.style.centerContainerRowHover : {}),{backgroundColor:childDevice.directConnection?backgroundDirectChild:backgroundIndirectChild}]}>

                            {
                                /*if child device is in realTime*/
                                childDeviceInfo && childDeviceInfo.realTimeConfig &&  (childDeviceInfo.realTimeConfig.plannedConnectionTime>Date.now()/1000 || childDeviceInfo.realTimeConfig.connectionTime)?(
                                    <PingTestBar 
                                        style={{height:38,flexGrow:1}}
                                        textStyle={{fontSize:12}}
                                        startTimeStyle={{fontSize:11}}
                                        idDevice={childDevice.idDevice} 
                                        setLoading={this.props.setLoading}
                                        startTimeFormat={"DD/MM/YY hh:mm:ss"}
                                        buttonText={"Start"}
                                        onStartTest={(startTestFunction)=>{
                                            if(this.props.startTestModal){
                                                this.props.startTestModal(childDevice.idDevice,startTestFunction);
                                            }else startTestFunction();
                                        }}
                                    />
                                ):(
                                    <TouchableOpacity style={{width:"100%"}} onPress={() => {if (typeof gotoFunction === "function")gotoFunction(childDevice.idDevice)}}>
                                        <Text style={[this.style.centerContainerRowText, (childDevice.idDevice == this.state.selectedIndex ? this.style.centerContainerRowTextHover : {})]}>{childDevice.idDevice}</Text>
                                    </TouchableOpacity>
                                )
                            }
                        </View>
                    


                </View>
                )

                /* //Display connectivity level
                    <View style={[(i == 0 ? this.style.rightContainerRowFirst : this.style.rightContainerRow), (i == (totalRows - 1) ? this.style.rightContainerRowLast : this.style.rightContainerRow), (childDevice.idDevice == this.state.selectedIndex ? this.style.rightContainerRowHover : {})]}>
                        <Image key={1} style={[this.style.imageRow, (childDevice.idDevice == this.state.selectedIndex ? this.style.imageRowHoverRight : {})]} draggable={false} source={this.typeToConnectionLevel(childDevice.connectionLevel)} resizeMode={"contain"} />
                    </View>
                */
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        devices: state.fliwerDeviceReducer.devices,
        deviceRealTimeInfo: state.fliwerDeviceReducer.deviceRealTimeInfo,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        zoneData: state.fliwerZoneReducer.data,
        isVisitor: state.sessionReducer.visitorCheckidUser,
        sessionRoles: state.sessionReducer.roles
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
            sessionActions: bindActionCreators(ActionsSession, dispatch)
        }
    }
}

var style = {
    getLocationTouchable: {
        maxWidth: 200
    },
    linkSerialNumberContainer: {
        paddingBottom: 1,
        alignSelf: "center"
    },
    buttonContainer: {
        height: 37,
        //width:"100%",
        //maxWidth:250,
        paddingRight: 1,
        marginBottom: 10,
        borderRadius: 25,
        backgroundColor: FliwerColors.primary.green,
        //display:"flex",
        flexDirection: "row",
        alignSelf: "center"
    },
    leftContainer: {
        width: 40,
        marginLeft: 1,
        marginTop: 1,
        borderBottomLeftRadius: 50,
        borderTopLeftRadius: 50,
        height: 35,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: "white",
    },

    leftText: {
        color: FliwerColors.secondary.white,
        width: "100%",
        fontSize: 15,
        textAlign: "center",
        paddingLeft: 5,
        fontFamily: FliwerColors.fonts.light
    },
    rightContainerLocation: {
        width: 40,
        marginLeft: 1,
        marginTop: 1,
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        height: 35,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        //backgroundColor:"white",
        backgroundColor: FliwerColors.primary.gray,
        overflow: "hidden"
    },
    rightContainer: {
        //marginLeft:1,
        marginTop: 1,
        paddingRight: 6,
        paddingLeft: 6,
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        //flexGrow:1,
        height: 35,
        //alignItems: 'center',
        flexDirection: 'row',
        //justifyContent:'center',
        backgroundColor: "white",
        borderLeftWidth: 1,
        borderLeftColor: FliwerColors.primary.green
    },
    centerContainerLocation: {
        marginTop: 1,
        paddingRight: 3,
        paddingLeft: 3,
        height: 31, width: 160,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: "white",
        borderLeftWidth: 1,
        borderLeftColor: FliwerColors.primary.green
    },
    rightText: {
        fontSize: 12,
        textAlign: "center",
        alignSelf: "center",
        paddingRight: 5,
        fontFamily: FliwerColors.fonts.light
    },
    linkSerialNumberText: {
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    settingTrashContainer: {
        width: "100%",
        display: "flex",
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexGrow: 1,
        flexDirection: "row",
        marginTop: 0,
    },
    selectZoneText: {
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    TrashFrontContainer: {
        right: 9,
        top: 11,
        position: "absolute",
        //width:25,
        //width:"100%",
        //display:"flex",
        //justifyContent:'flex-end',
        //alignItems:'flex-end',
        //flexGrow: 1,
        //flexDirection:"row",
        //marginBottom: 10,
    },
    leftContainerStyle: {
        width: "50%",
    },
    centerContainerRowText: {
        color: FliwerColors.primary.black,
        width: "100%",
        fontSize: 12,
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light
    },
    rowContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
    },
    centerContainerRow: {
        height: "100%",
        backgroundColor: FliwerColors.secondary.white,
        display: "flex",
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
        marginRight:5
    },
    rightContainerRow: {
        width: 37,
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FliwerColors.secondary.white,
    },
    rightContainerRowFirst: {
        width: 37,
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FliwerColors.secondary.white,
        borderTopRightRadius: 10,
    },
    rightContainerRowLast: {
        width: 37,
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FliwerColors.secondary.white,
        borderBottomRightRadius: 10,
    },
    leftContainerRow: {
        width: 37,
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FliwerColors.secondary.white,
    },
    leftContainerRowFirst: {
        width: 37,
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FliwerColors.secondary.white,
        borderTopLeftRadius: 10,
    },
    leftContainerRowLast: {
        width: 37,
        height: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: FliwerColors.secondary.white,
        borderBottomLeftRadius: 10,
    },
    imageRow: {
        height: 30,
        width: 30,
    },
    lastConnectionText: {
        fontSize: 10,
        fontFamily: FliwerColors.fonts.light,
    },
    lastConnectionTextStyle: {
        width: "100%",
        color: FliwerColors.primary.gray
    },
    deviceImageButton: {
        width: 30,
        height: 30,
    },
    deviceImage: {
        width: "75%",
        height: "75%",
    },
    wifiImage: {
        width: "100%",
        height: "100%",
    },
    bateryImage: {
        width: "100%",
        height: "100%",
    },
    wakeupPeriodImage:{
        width: "100%",
        height: "100%",
    },
    batteryImageContainer: {
        height: 42,
        width: 42,
        position: "absolute",
        bottom: "50%",
        marginBottom: 4,
        right: 0,
    },
    signalImageContainer: {
        height: 42,
        width: 42,
        position: "absolute",
        top: "50%",
        marginTop: 4,
        right: 0,
    },
    changeLinkRealTimeContainer: {
        height: 34,
        width: 34,
        position: "absolute",
        top: 80,
        right: 24,
        borderRadius: 25,
        borderColor: FliwerColors.primary.green,
        color: FliwerColors.primary.green,
        borderWidth:1,
        display: "flex",
        justifyContent: "center",
        alignContent:"center",
        textAlign:"center"
    },
    wakeUpPeriodImageContainer: {
        height: 42,
        width: 42,
        position: "absolute",
        bottom: "50%",
        marginBottom: 4,
        left: 0,
        borderRadius: 25,
        borderColor: FliwerColors.primary.green,
        color: FliwerColors.primary.green,
        borderWidth:1,
        display: "flex",
        justifyContent: "center",
        alignContent:"center",
        textAlign:"center"
    },
    realTimeButtonContainer: {
        height: 42,
        width: 42,
        position: "absolute",
        top: "50%",
        marginTop: 4,
        left: 0,
        borderRadius: 25,
        borderColor: FliwerColors.primary.green,
        color: FliwerColors.primary.green,
        borderWidth:1,
        display: "flex",
        justifyContent: "center",
        alignContent:"center",
        textAlign:"center"
    },
    realTimeButtonContainerOverlay: {
        height: 62,
        width: 62,
        marginTop: 10,
        borderRadius: 41,
        borderColor: FliwerColors.primary.green,
        color: FliwerColors.primary.green,
        borderWidth:1,
        display: "flex",
        justifyContent: "center",
        alignContent:"center",
        textAlign:"center"
    },
    realTimeCountdownOverlay:{
        fontWeight: "normal",
        fontSize: 26,
        color: "white",
        width: "100%",
        textAlign: "center",
        marginTop: 10
    },
    rightCentralContainer: {
        width: "25%",
        height: "100%",
        position: "absolute",
        right: 0,
    },
    leftCentralContainer: {
        width: "25%",
        height: "100%",
        position: "absolute",
        left: 0,
    },
    globalContainer: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        paddingLeft: "7%",
        paddingRight: "7%",
        paddingTop: "3%",
        borderRadius: 10
    },
    imageContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    centralContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: 136,
    },
    container: {
        position: "absolute",
        width: "100%",
        top: 40,
        bottom: 0,
        alignItems: "center"
    },
    cardView: {
        height: 359,
        width: "100%",
        alignItems: "center"
    },
    backCard: {
        height: 359,
        paddingBottom: 16,
        width: "100%"
    },
    backCardMenu: {
        height: "auto",
        position: "absolute",
        width: "100%",
        bottom: 50,
        top: 0
    },
    image: {
        width: "100%",
        height: 225,
        alignItems: "center",
        marginBottom: 10,
        borderRadius: 5,
    },
    title: {
        width: "100%",
        textAlign: "center",
        marginBottom: 1,
        fontSize: 18,
        height: 27,
        fontFamily: FliwerColors.fonts.title,
    },
    miniTitle: {
        width: "100%",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 0,
        fontSize: 18
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        marginTop: 1,
        marginBottom: 5,
        fontSize: 12
    },
    text: {
        textAlign: "left",
        paddingLeft: 15,
        paddingRight: 15,
        fontSize: 10,
        marginTop: 0,
        marginBottom: 0,
    },
    ViewAllPhases: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        width: "90%",
        flexWrap: "wrap",
        marginTop: 0,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 2
    },
    ViewPhase: {
        width: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    ViewPhaseImageOut: {
        width: 60,
        height: 60,
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#d9dad7",
        marginBottom: 3
    },
    ViewPhaseImageOutSelected: {
        backgroundColor: "#a6cf07",
    },
    ViewPhaseImage: {
        width: 40,
        height: 40,
        borderRadius: 5
    },
    ViewPhaseText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 10
    },
    settingContainer: {
        width: 30,
        height: 30,
        position: "absolute",
        bottom: -4,
        left: 10
    },
    trashContainer: {
        width: 30,
        height: 30
    },
    deleteButton: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    gearButton: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
    },
    trashIcon: {
        width: 25,
        height: 25,
        justifyContent: "flex-end",
    },
    errorIcon: {
        fontSize: 200,
        textAlign: "center",
        color: " rgb(255, 110, 110)"
    },
    gearIcon: {
        width: 25,
        height: 25,
        justifyContent: "flex-end",
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 20
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
    zoneText: {
        textAlign: "left",
        paddingLeft: 15,
        width: "auto",
        alignSelf: "center"
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
    sensorFrontNoZoneContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        display: "flex",
    },
    addZoneText: {
        width: "100%",
        fontSize: 34,
        color: "white",
        textAlign: "center"
    },
    leftContainerGPS: {

    },
    leftContainerSIM: {

    },
    centerContainerSIM: {
        marginTop: 1,
        paddingRight: 3,
        paddingLeft: 3,
        height: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: "white",
        borderLeftWidth: 1,
        borderLeftColor: FliwerColors.primary.green
    },
    rightContainerSIM: {
        width: 40,
        marginLeft: 1,
        marginTop: 1,
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        height: 35,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        //backgroundColor:"white",
        backgroundColor: FliwerColors.primary.gray,
        overflow: "hidden"
    },
    turnButtonUp: {
      position:"absolute",
      width:40,
      height:40,
      top: 0,
      right: 0,
      zIndex: 99
    },
    turnButtonDown: {
      position:"absolute",
      width:40,
      height:40,
      bottom: 0,
      right: 0,
      zIndex: 99
    },
    turnButtonImage:{
      position:"absolute",
      right: 0,
      width: 20,
      height: 20,
      marginRight: 4
    },
    turnButtonImageWhite:{
        filter:"brightness(1000%)"
    },
    wakeupPeriodText: {
        fontSize: 16,
        color: FliwerColors.primary.green,
        textAlign:"center",
        alignSlef:"center",
        backgroundColor:"red",
        fontFamily: FliwerColors.fonts.light
    },
    prohibitLine:{
        height: 1,
        width: "100%",
        position: "absolute",
        rotate: "45deg"
    },
    ":hover": {
        leftContainerGPS: {
            filter: "brightness(110%)"
        },
        leftContainer: {
            filter: "brightness(110%)"
        },
        centerContainerLocation: {
            filter: "brightness(90%)"
        },
        rightContainerLocation: {
            filter: "brightness(110%)"
        },
        getLocationTouchable: {
            filter: "brightness(115%)"
                    //color:"#353631"
        },
        modelImageGermination: {
            filter: "brightness(130%)"
        },
        modelImageFructification: {
            filter: "brightness(130%)"
        },
        modelImageGrowing: {
            filter: "brightness(130%)"
        },
        modelImageFlowering: {
            filter: "brightness(130%)"
        },
        trashIcon: {
            filter: "brightness(130%)"
        },
        gearIcon: {
            //filter:"brightness(120%)"
            filter: "opacity(50%)"
        },
        imageRowHoverLeft: {
            //backgroundColor:FliwerColors.secondary.white,
            filter: "brightness(400%)"
                    //backgroundColor:FliwerColors.primary.black,
        },
        centerContainerRowHover: {
            //filter:"brightness(130%)",
            backgroundColor: FliwerColors.secondary.green,
        },
        leftContainerRowHover: {
            backgroundColor: FliwerColors.secondary.green,
        },
        centerContainerRowTextHover: {
            color: "white",
            //backgroundColor:FliwerColors.primary.black,
        },
        rightContainerRowHover: {
            //filter:"brightness(130%)",
            backgroundColor: FliwerColors.secondary.green,
        },
        imageRowHoverRight: {
            //filter:"brightness(400%)",
            //backgroundColor:FliwerColors.primary.black,
        },
        leftContainerSIM: {
            filter: "brightness(110%)"
        },
        centerContainerSIM: {
            filter: "brightness(90%)"
        },
        rightContainerSIM: {
            filter: "brightness(110%)"
        },
        turnButtonUp:{
          filter:"brightness(150%)"
        },
        turnButtonDown:{
          filter:"brightness(150%)"
        }
    },
    "@media (width<=420)": {
        cardCommonView: {
            height: 390
        },
        locationEstablished: {
            marginBottom: 30
        }
    },
    "@media (width<=378)": {
        cardCommonView: {
            height: 400
        }
    },
    "@media (width<=358)": {
        cardSensPro: {
            height: 430
        }
    }

}

if (Platform.OS === 'android' || Platform.OS == 'ios') {
    style.pumpSelectContainer.marginBottom = 2;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, DeviceCard));
