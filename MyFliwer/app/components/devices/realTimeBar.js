'use strict';

import React, { Component } from 'react';
import {View, TouchableOpacity, Platform, Image,Text} from 'react-native';

import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import IconFontisto from 'react-native-vector-icons/Fontisto';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'
import {FliwerColors} from '../../utils/FliwerColors'

import FliwerCalmButton from '../custom/FliwerCalmButton.js'
import RealtimeCountdown from '../../components/devices/realtimeCountdown.js'


import fliwer_logo from '../../assets/img/Poweredbyfliwer.png'

class RealTimeBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
        };
        
    }

    render() {
        var that = this;

        if(!this.state.zone || !this.state.home || this.state.zone.idZone != this.props.idZone){
            var zoneGardenHome=this.props.actions.fliwerZoneActions.getZoneGardenHome(this.props.idZone);
            this.state.zone=zoneGardenHome.zone;
            this.state.home=zoneGardenHome.home;
        }

        //if there is a device in the home that has realTimeConfig and it's active, ge tthe first one
        var device = Object.values(this.props.devices).filter(device => device.realTimeConfig && device.idHome==this.state.home.id);
        var realTimeConfig;
        if(device.length>0){
            //get realTimeConfig that has max plannedConnectionTime
            realTimeConfig = device.reduce((prev, current) => (prev.realTimeConfig.plannedConnectionTime > current.realTimeConfig.plannedConnectionTime) ? prev : current).realTimeConfig;
        }

        if(realTimeConfig && realTimeConfig.plannedConnectionTime<=Date.now()/1000){
            //RealTime programmed and started. Show a bar with a text that says "Real Time in progress", followed by a text that says "Close Real Time" and a button with the icon flash from Fontisto crossed with a 45deg rotated line, like in a prohibition sign
        
            return (
                <View style={[that.style.bar, that.props.barStyle, this.props.position == "top"? that.style.barOnTop : that.style.barOnBottom]}>

                    <Text>{"Real Time in progress:"}</Text>
                    <RealtimeCountdown style={this.style.realTimeCountdownOverlay} textOnEnd={"Ending realtime..."} endTime={realTimeConfig.deathTime} />
                        <TouchableOpacity style={that.style.iconButton}
                            onPress={() => {
                                // Close real time
                                that.props.onCancel(true);
                        }}>
                                <IconFontisto name="flash" size={30} color={FliwerColors.orange}/>
                                <View  style={this.style.prohibited} ></View>
                        </TouchableOpacity>
                </View>
            );
        }else if(realTimeConfig){
            //RealTime programmed but not started. Show a text that says "Real Time Starts in:" and a countdown using RealtimeCountdown component, followed by a text that seys "Cancel Real Time", and a button with the icon flash from Fontisto crossed with a 45deg rotated line, like in a prohibition sign
            return (
                <View style={[that.style.bar, that.props.barStyle, this.props.position == "top"? that.style.barOnTop : that.style.barOnBottom]}>

                <Text>{"Real Time Starts in:"}</Text>
                <RealtimeCountdown style={this.style.realTimeCountdown} textOnEnd={"Starting realtime..."} endTime={realTimeConfig.plannedConnectionTime} />
                    <TouchableOpacity style={that.style.iconButton}
                        onPress={() => {
                            // Close real time
                            that.props.onCancel();
                    }}>
                            <IconFontisto name="flash" size={30} color={FliwerColors.orange}/>
                            <View  style={this.style.prohibited} ></View>
                    </TouchableOpacity>
                </View>
            );
            
        }else{
            //Show a bar with a text that says "Start Real Time" and a button with the icon flash from Fontisto
            return (
                <View style={[that.style.bar, that.props.barStyle, this.props.position == "top"? that.style.barOnTop : that.style.barOnBottom]}>

                    <Text>{"Start Real Time"}</Text>
                    <TouchableOpacity style={that.style.iconButton}
                        onPress={() => {
                            // Close real time
                            that.props.onStart(false);
                    }}>
                            <IconFontisto name="flash" size={30} color={FliwerColors.orange}/>
                    </TouchableOpacity>
                </View>
            );
        }


    }

};


function mapStateToProps(state, props) {
    return {
        isVisitor: state.sessionReducer.isVisitor,
        generalAlerts: state.sessionReducer.generalAlerts,
        notSignedContractsData: state.invoiceReducer.notSignedContractsData,
        notSignedAngelContractsData: state.invoiceReducer.notSignedAngelContractsData,
        roles: state.sessionReducer.roles,
        devices: state.fliwerDeviceReducer.devices
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
        }
    };
}

var styles = {
    bar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        backgroundColor: "rgb(240,240,240)",
        justifyContent: "center",
        gap:10
    },
    barOnTop: {
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1
    },
    barOnBottom: {
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1
    },
    actionButton: {
        marginLeft: 20, marginRight: 20
    },
    realTimeCountdown:{

    },
    prohibited:{
        position:"absolute",
        backgroundColor:1,
        height:2,
        width:"100%",
        transform: [{rotate: '45deg'}],
        backgroundColor:"black"
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 45,
        height:30,
        width:30
    },
    closeText: {
        marginLeft: 5
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, RealTimeBar));
