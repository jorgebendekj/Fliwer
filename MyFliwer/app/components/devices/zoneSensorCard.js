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
import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'

import nothingIcon  from '../../assets/img/valve_nothing.png'

import {toast} from '../../widgets/toast/toast'
import { CheckBox  } from 'react-native-elements'
import Dropdown from '../../widgets/dropdown/dropdown';
import DatePicker from '../../widgets/datePicker/datePicker';

class ZoneSensorCard extends Component {

    constructor(props) {
        super(props);

        var device = this.props.devices[this.props.idDevice];
        this.state = {
        };

    }


    selectZone(idZone, nSensor) {
        if(this.props.setLoading)this.props.setLoading(true);
        var device = this.props.devices[this.props.idDevice];
        this.props.actions.fliwerDeviceActions.linkToZone(this.props.idDevice, idZone, device.type == 'SENS_PRO' || device.type.indexOf("UNIPRO") != -1 || device.type.indexOf("TBD") != -1 || device.type.indexOf("CONTROL") != -1 ? nSensor : null).then((zoneChanged) => {
            if (this.props.zoneChangeHandler && typeof this.props.zoneChangeHandler === "function")
                this.props.zoneChangeHandler();
            if(this.props.setLoading)this.props.setLoading(false);
        })
    }

    printZones() {
        
        var device = this.props.devices[this.props.idDevice];
        if (device.idImageDash || device.idHome) {
            var that = this;

            var zones=this.props.actions.fliwerHomeActions.getZonesFromHome(device.idHome);
    
            //var zones = this.props.zoneData;


            var arr = Object.values(zones)/*.filter((z) => {
                if (z.idHome == device.idHome) {
                    return true;
                } else {
                    return false
                }
            })*/.map((z) => {
                return {label: z && z.name? z.name:null, value: z.idZone}
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
                    <FliwerCard ref="card" touchableFront={false} cardInStyle={this.style.valveCard} style={this.style.valveCard} touchableBack={false}>
                        <View>
                            <View style={[this.style.cardView]}>
                                <Text style={this.style.title}>{title?title:this.props.actions.translate.get("zoneSensorCard_title")}</Text>
                                {this.renderCardFront()}
                            </View>
                        </View>
                    </FliwerCard>
                    );
        }
    }

    renderCardFront() {

        var device = this.props.devices[this.props.idDevice];
        var card = [];
        
        var idZoneDevices = this.props.devices[this.props.idDevice].zones ? this.props.devices[this.props.idDevice].zones : [];
        if (idZoneDevices.length == 0 && this.props.devices[this.props.idDevice].idZone)
            idZoneDevices.push({ idZone: this.props.devices[this.props.idDevice].idZone, loggerSensor: 0 });

        var zoneDevices = [];
        for (var i = 0; i < idZoneDevices.length; i++) {
            zoneDevices[idZoneDevices[i].loggerSensor] = idZoneDevices[i].idZone
        }

        card.push(
                <View key={9} style={[this.style.zoneSelectContainer, Platform.OS == "android" || Platform.OS == 'ios' ? {width: "80%", paddingLeft: 0} : {}]} onStartShouldSetResponder={() => true}>
                    {Platform.OS == "web" ? <View style={[{marginTop: 5}]}><Text key={11} style={this.style.selectZoneText}>{device.type == 'SENS' ? this.props.actions.translate.get("valveCard_zone_placeholder") : this.props.actions.translate.get("valveCard_zone_placeholder_pro")}</Text></View> : null}
                    {Platform.OS == "android" || Platform.OS == 'ios' ? <View style={[{marginTop: 0}]}><Text key={11} style={this.style.selectZoneText}>{this.props.actions.translate.get("deviceCard_relate_sensors")}</Text></View> : null}   
                   <View style={[Platform.OS == "android" || Platform.OS == 'ios' ? {paddingLeft: 15} : {}]}>
                        {this.renderDropModalZonesCustomized(device, zoneDevices, 1)}
                    </View>
                </View>
                )

        if (device.type == 'SENS_PRO' || device.type.indexOf("UNIPRO") != -1 || device.type.indexOf("TBD") != -1 || device.type.indexOf("CONTROL") != -1) {
            card.push(
                    <View key={12} style={[this.style.zoneSelectContainer, Platform.OS == "android" || Platform.OS == 'ios' ? {width: "80%"} : {}]} onStartShouldSetResponder={() => true}>
                        {Platform.OS == "web" ? <View style={[this.style.selectZoneTextContainer, {marginTop: 5}]}><Text key={12} style={this.style.selectZoneText}>{this.props.actions.translate.get("valveCard_zone_placeholder_pro2")}</Text></View> : null}
                        {this.renderDropModalZonesCustomized(device, zoneDevices, 2)}
                    </View>
            );
        }


        return card;
    }

    
    renderDropModalZonesCustomized(device, zoneDevices, number)
    {
        var text1 = ""
        var text2 = ""
        if (number == 1)
        {
            text1 = "valveCard_zone_placeholder_pro"
            text2 = "valveCard_zone_placeholder"
        } else if (number == 2)
        {
            text1 = "valveCard_zone_placeholder_pro2"
            text2 = "valveCard_zone_placeholder2"
        } else if (number == 3)
        {
            text1 = "valveCard_zone_placeholder_pro3"
            text2 = "valveCard_zone_placeholder3"
        }

        return(
            <View style={this.style.pumpSelectContainer}>
                <Dropdown modal={true} placeholder={this.props.actions.translate.get(text1)} selectedValue={zoneDevices[number] ? zoneDevices[number] : zoneDevices[0]} style={this.style.pumpSelect} styleOptions={{}} options={this.printZones()} onChange={(value) => {
                    if (this.props.isVisitor)
                        toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                    else
                        this.selectZone(value, number)
                }} />
            </View>
        );
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
        marginBottom:10,
        fontSize: 22,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        height: 28
    },
    zoneSelectContainer: {
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
    imageContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
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
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, ZoneSensorCard));
