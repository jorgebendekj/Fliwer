'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image
} = require('react-native');

import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';


import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import ValveCard from '../../components/devices/valveCard.js'
import ValveSensorCard from '../../components/devices/valveSensorCard.js'
import ZoneSensorCard from '../../components/devices/zoneSensorCard.js'
import FlowmeterCard from '../../components/devices/flowmeterCard.js'
import RealtimeCountdown from '../../components/devices/realtimeCountdown.js'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'
import FliwerLoading from '../fliwerLoading'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../widgets/toast/toast'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect,withRouter } from '../../utils/router/router'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import background  from '../../assets/img/devicesBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import realtimeIco  from '../../assets/img/devices/realtime-1-ico.png'


class ControlValves extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idZone: this.props.match.params.idZone,
            idDevice: this.props.match.params.idDevice,
            nextDeviceId: null,
            valvesRef: [],
            showSimultaneity: this.props.simultaneityActivated,
            showRealtimeLayer: false,
            loading: false,
            initialLoading: true,
            realtimeData: null,
            realtimeDisconnectionQuestionModal: false,
            realtimeInterval: null,
            realtimeIntervalDevice: null,
            realTimeIrrigationShow: false,
            realTimePlaying:false
        };
        if(!this.props.devices[this.props.match.params.idDevice]){
            //Load device data
            this.props.actions.fliwerDeviceActions.getDevice(this.props.match.params.idDevice,true).finally(() => {
                this.setData(this.state.idDevice).then(anyRequest => {
                    //if (anyRequest) this.forceUpdate();            
                    var device = this.props.devices[this.state.idDevice];
                    var realTimeIrrigationShow=false;
                    if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime)){
                        realTimeIrrigationShow=true;
                    }

                    this.setState({initialLoading: false, realTimeIrrigationShow:realTimeIrrigationShow});
                });
            });
        }else{
            this.setData(this.state.idDevice).then(anyRequest => {
                //if (anyRequest) this.forceUpdate();
                var device = this.props.devices[this.state.idDevice];
                var realTimeIrrigationShow=false;
                if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime)){
                    realTimeIrrigationShow=true;
                }
    
                this.setState({initialLoading: false, realTimeIrrigationShow:realTimeIrrigationShow});
            });
        }


    }

    componentDidUpdate(prevProps) {
        var that = this;

        if (this.props.match.params.idDevice !== this.state.idDevice) {
            var iDevice = this.props.match.params.idDevice;

            this.setData(iDevice).then(anyRequest => {
                that.setState({idDevice: iDevice, nextDeviceId: null, initialLoading: false}, () => {
                    //if (that.state.showSimultaneity)
                    //    that.flipCards(true);
                });
            });
        }
    }

    componentWillUnmount = () => {
        if (this.state.realtimeInterval != null)
            clearTimeout(this.state.realtimeInterval);
    }

    setData(iDevice) {
        if (this.state.realtimeInterval != null)
            clearTimeout(this.state.realtimeInterval);
        console.log("Start setData");
        return new Promise((resolve, reject) => {
            var anyRequest = false;

            if (!this.props.devices[iDevice])
                resolve(anyRequest);
            else {
                var device = this.props.devices[iDevice];

                if(!device)return null;

                new Promise((resolveValves, rejectValves) => {
                    if (device.type != "SENS" && device.type != "SENS_PRO") {
                        anyRequest = true;
                        this.props.actions.fliwerDeviceActions.getDeviceValves(iDevice).then(() => {
                            resolveValves();
                        });
                    }
                    else
                        resolveValves();
                }).then(() => {
                    console.log("setData device.type", device.type);
                    this.state.realtimeData = null;
                    if (device.type.indexOf("UNIPRO") != -1 ||
                        device.type.indexOf("CONTROL") != -1 ||
                        device.type.indexOf("TBD") != -1 ||
                        device.type=="SENS") {
                        anyRequest = true;
                        this.props.actions.fliwerDeviceActions.getRealtimeDeviceData(iDevice).then((data) => {
                            console.log("getRealtimeDeviceData data", data);
                            this.state.realtimeData = data;

                            if (this.state.realtimeData != null) {
                                clearTimeout(this.state.realtimeInterval);
                                this.state.realtimeIntervalDevice = iDevice;
                                this.state.realtimeInterval = setInterval(() => {
                                    this.props.actions.fliwerDeviceActions.getRealtimeDeviceData(this.state.realtimeIntervalDevice).then((data) => {
                                        console.log("getRealtimeDeviceData data (interval)", data);
                                        
                                        if (data == null && this.state.showRealtimeLayer)
                                            this.setState({realtimeData: data, showRealtimeLayer: false});
                                        else
                                            this.setState({realtimeData: data});
                                    });
                                }, 1000 * 30);
                            }

                            resolve(anyRequest);
                        });
                    }
                    else
                        resolve(anyRequest);
                });
            }
        });

    }

    render() {
        var device = this.props.devices[this.state.idDevice];
        if ((this.state.idZone && this.state.goDevices) /*|| !this.props.devices || !this.props.devices[this.state.idDevice]*/) {
            if(this.props.asComponent) return (<Redirect push to={"/app/fliwer/devices/" + this.state.idZone} />)
            else return (<Redirect push to={"/zone/" + this.state.idZone + "/devices"} />)
        }
        else if ((!this.props.preloadedData /*&& !this.props.loadedStorageData*/ && !this.props.loadingDevices) || !device || !this.props.devices[this.state.idDevice] ||
                (!this.props.devices[this.state.idDevice].valves && this.props.devices[this.state.idDevice].type != "SENS" && this.props.devices[this.state.idDevice].type != "SENS_PRO") ||
                this.state.initialLoading
                ) {
            return (
                    <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"}>
                        {
                            !this.props.asComponent?
                                (<MainFliwerTopBar showTextBar={true} title={(device && device.type?this.props.actions.translate.get(FliwerCommonUtils.typeToTitle(device.type)):"")+" "+this.state.idDevice} mode={'zone'} />
                                ):<MainFliwerTopBar showTextBar={true} hideMainBar={true} title={(device && device.type?this.props.actions.translate.get(FliwerCommonUtils.typeToTitle(device.type)):"")+" "+this.state.idDevice} mode={'zone'} />
                        }
                        <FliwerLoading/>
                    </ImageBackground>
                    );
        } else if (this.state.nextDeviceId) {
            var idDevice = this.state.nextDeviceId;
            this.state.nextDeviceId = null;
            this.state.initialLoading = true;
            if(this.props.asComponent) return (<Redirect push to={"/app/fliwer/devices/" + this.state.idZone + "/" + idDevice + "/valves/"} />);
            else return (<Redirect push to={"/zone/" + this.state.idZone + "/devices/" + idDevice + "/valves/"} />);

        } else {

            var devicesWithValves = this.getDevicesWithValvesLike(this.props.devices[this.state.idDevice]);
            var isRealtimeConnected = this.isRealtimeConnected();

            return (
                    <ImageBackground
                            source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)}
                            resizeMode={"cover"}
                            style={this.style.background}
                            loading={this.state.loading}
                        >
                            
                        {
                            !this.props.asComponent?
                                (
                                    <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get(FliwerCommonUtils.typeToTitle(device.type))+" "+this.state.idDevice}
                                    mode={'zone'}
                                    onPressNextGarden={devicesWithValves.length>1? this.nextDevice : null}
                                    onPressPreviousGarden={devicesWithValves.length>1? this.previousDevice : null}/>
                                ):(
                                    <MainFliwerTopBar showTextBar={true} hideMainBar={true} title={this.props.actions.translate.get(FliwerCommonUtils.typeToTitle(device.type))+" "+this.state.idDevice}
                                    mode={'zone'}
                                    onPressNextGarden={devicesWithValves.length>1? this.nextDevice : null}
                                    onPressPreviousGarden={devicesWithValves.length>1? this.previousDevice : null}/>
                                )
                        }
                        

                        {this.state.realtimeData != null?<View style={this.style.realtimeBar}>
                            <View style={{marginLeft: 5, marginRight: 5}}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={{fontWeight: "bold", fontSize: 12}}>{
                                    this.props.actions.translate.get('general_realtime_mode') + " " + (isRealtimeConnected?this.props.actions.translate.get('deviceCard_front_connected').toUpperCase():this.props.actions.translate.get('deviceCard_front_disconnected').toUpperCase())}
                                </Text>
                            </View>
                            <View style={[this.style.realtimeConnectedLed, {marginLeft: 5, marginRight: 5}, isRealtimeConnected? this.style.isRealtimeConnectedLed : this.style.isRealtimeNotConnectedLed]}></View>
                            <View style={[this.style.realtimeDisconnectionButton, {marginLeft: 5, marginRight: 5}]}>
                                <TouchableOpacity style={{}} activeOpacity={1}
                                    onPress={() => {
                                        this.setState({realtimeDisconnectionQuestionModal: true});
                                    }}
                                    >
                                    <Text style={{textAlign: "center", fontSize: 10}}>{"E X I T"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>:null}
                        {this.state.realtimeData != null?<View style={this.style.realtimeBar}>
                            <View style={{marginLeft: 5, marginRight: 5}}>
                                <Text style={{fontSize: 12}}>{
                                    this.props.actions.translate.get('deviceCard_remainingtime') + ":"
                                }</Text>
                            </View>
                            <View style={{marginLeft: 5, marginRight: 5}}>
                                <RealtimeCountdown remainingTime={this.state.realtimeData.remainingTime} />
                            </View>
                        </View>:null}
                        <ScrollView scrollEventThrottle={1000} style={{flex: 1}}>
                            <CardCollection>
                                { this.renderValves() }
                            </CardCollection>
                        </ScrollView>
                        {this.state.realtimeData != null?this.renderRealtimeButton():null}
                        {this.renderFlipCardsButton()}
                        {this.renderRealtimeIrrigationButton()}
                        {this.renderPlayPauseButton()}
                        {this.renderStopButton()}
                        {this.renderForwardButton()}
                        {this.renderBackwardButton()}
                        {this.renderBackBar()}
                        {this.renderRealtimeDisconnectionQuestionModal()}
                    </ImageBackground>
                    );
        }
    }

    renderRealtimeDisconnectionQuestionModal() {

        if (!this.state.realtimeDisconnectionQuestionModal)
            return null;

        return (
            <FliwerDeleteModal
                visible={this.state.realtimeDisconnectionQuestionModal}
                onClose={() => {
                    this.setState({realtimeDisconnectionQuestionModal: false});
                }}
                onConfirm={() => {

                    var device = this.props.devices[this.state.idDevice];

                    this.setState({realtimeDisconnectionQuestionModal: false, loading: true});
                    this.props.actions.fliwerDeviceActions.realtimeCloseConnection(device.LinkSerialNumber).then(() => {
                        this.setState({loading: false});
                        toast.notification(this.props.actions.translate.get('deviceCard_sent_desconnection_order'));
                    }, (err) => {
                        this.setState({loading: false});
                        if (err && err.reason)
                            toast.error(err.reason);
                    });
                }}
                title={this.props.actions.translate.get('deviceCard_realtime_disconnection_question')}
                subtitle={false}
                text={""}
                hiddeText={true}
                password={false}
                loadingModal={false}
                />
        );
    }

    renderBackBar()
    {
        return(
            <View style={this.style.buttonBackContainer}>
                <TouchableOpacity style={this.style.buttonBack} onPress={() => {
                        this.setState({goDevices: true});
                    }}>
                    <Text style={this.style.textBack}>{this.props.actions.translate.get('general_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderValves() {
        var indents = [];
        var device = this.props.devices[this.state.idDevice];
        
        if( device.type=="SENS" || device.type=="SENS_PRO" /*|| device.type.indexOf("UNIPRO") != -1 || device.type.indexOf("TBD") != -1 */|| device.type.indexOf("CONTROL") != -1) {
            //Sensor Zone Card
            indents.push(<ZoneSensorCard key={this.state.idDevice + "_zoneSensorCard"} idZone={this.state.idZone} idDevice={this.state.idDevice} setLoading={this.setLoading()}/>);
        }
        
        if ( (device.type == 'SENS' && device.idZone) || (device.type == 'SENS_PRO' && device.zones && device.zones.length > 0)) {
            //valve sensor card (replants)
            let title = (device.type == 'SENS') ? this.props.actions.translate.get("valveSensorCard_title") : this.props.actions.translate.get("config");
            indents.push(<ValveSensorCard key={this.state.idDevice + "_valveSensorCard"} idZone={this.state.idZone} idDevice={this.state.idDevice} hideActivationValvule={(device.type == 'SENS_PRO')} title={title}/>);
        } 
        
        //flow meter card
        if ( device.type == 'SENS_PRO' || device.type.indexOf("UNIPRO") != -1 || device.type.indexOf("TBD") != -1 || device.type.indexOf("CONTROL") != -1) {
            let title = this.props.actions.translate.get("flowmeterCard_reedSensor");
            indents.push(<FlowmeterCard key={this.state.idDevice + "_flowMeterCard"} idZone={this.state.idZone} idDevice={this.state.idDevice} hideActivationValvule={(device.type == 'SENS_PRO')} title={title}/>);
        } 
        
        if(device.valves)
        {
            var valves = Object.values(device.valves.config);

            valves.sort((a, b) => {
                return a.valveNumber > b.valveNumber ? 1 : -1
            });
            this.state.valvesRef = [];
            for (var index in valves) {
                var valve = valves[index];

                var realtimeStatus = 'closed';
                if (this.props.realtimeDevicesValves[this.state.idDevice] && this.props.realtimeDevicesValves[this.state.idDevice][valve.valveNumber]) {
                    var object = this.props.realtimeDevicesValves[this.state.idDevice][valve.valveNumber];
                    if (object.status == 'open' && Date.now() > object.time + (10*60*1000)) { // 10 minuts
                        this.props.actions.fliwerDeviceActions.setStatusValve(device.LinkSerialNumber, this.state.idDevice, valve.valveNumber, 'closed');
                        realtimeStatus = 'closed';
                    }
                    else
                        realtimeStatus = object.status;
                }

                indents.push(
                    <ValveCard
                        ref={(c) => {
                            if (c)
                                this.state.valvesRef.push(c);
                        }}
                        key={this.state.idDevice + "_" + index}
                        idZone={this.state.idZone}
                        idDevice={this.state.idDevice}
                        editable={valve.uneditable?false:true}
                        valveNumber={valve.valveNumber}
                        data={valve}
                        showSimultaneity={this.state.showSimultaneity}
                        showRealtimeLayer={this.state.realTimeIrrigationShow}
                        realtimeStatus={realtimeStatus}
                        setLoading={this.setLoading()}
                        loading={this.state.loading}
                        updateRealtimeData={() => {
                            console.log("updateRealtimeData")
                            this.setData(this.state.idDevice).then(anyRequest => {
                                //if (anyRequest) this.forceUpdate();
                            });
                        }}
                    />
                );
            }
        }
        

        return indents;

    }

    renderRealtimeButton() {

        if (!this.props.devices[this.state.idDevice])
            return null;

        return (
            <TouchableOpacity
                style={this.style.realtimeButton}
                activeOpacity={1}
                onMouseEnter={this.hoverIn('realtimeButton')}
                onMouseLeave={this.hoverOut('realtimeButton')}
                onPress={() => {
                    this.flipRealtime(!this.state.showRealtimeLayer);
                }}>
                <Image style={{width: 35, height: 35}} source={realtimeIco} resizeMode={"contain"} draggable={false}/>
            </TouchableOpacity>
        );
    }


    renderFlipCardsButton() {

        if (this.props.devices[this.state.idDevice] && this.props.devices[this.state.idDevice].type != "SENS_PRO")
            return (
                <TouchableOpacity
                    style={this.style.flipCardsButton}
                    activeOpacity={1}
                    onMouseEnter={this.hoverIn('flipCardsButton')}
                    onMouseLeave={this.hoverOut('flipCardsButton')}
                    onPress={() => {
                        this.flipCards(!this.state.showSimultaneity);
                    }}>
                       <IconMaterialCommunityIcons name="rotate-3d-variant" color={"white"} size={35} style={{}} ></IconMaterialCommunityIcons>
                </TouchableOpacity>
            );
    }
    
    renderRealtimeIrrigationButton(){
        //return null;//Disabled
        var device = this.props.devices[this.state.idDevice];
        if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime)){

            return (
                <TouchableOpacity
                    style={[this.style.realTimeButton,this.style.realTimeIrrigationModeButton]}
                    activeOpacity={1}
                    onMouseEnter={this.hoverIn('realTimeIrrigationModeButton')}
                    onMouseLeave={this.hoverOut('realTimeIrrigationModeButton')} 
                    onPress={() => {
                        this.setState({ realTimeIrrigationShow: !this.state.realTimeIrrigationShow });
                    }}>
                    <Fontisto name="flash" size={40} style={[{ textAlign:"center", alignSlef:"center",width:"100%"},{color: "white", alignSelf: "center"}]}/>
                </TouchableOpacity>
            );

        }else return null;
    }
    
    renderPlayPauseButton(){
        return null;//Disabled
        var device = this.props.devices[this.state.idDevice];
        if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime) && (this.state.realTimeIrrigationShow || this.state.realTimePlaying)){

            return (
                <TouchableOpacity
                    style={[this.style.realTimeButton,this.style.realTimePlayPauseButton]}
                    activeOpacity={1}
                    onMouseEnter={this.hoverIn('realTimePlayPauseButton')}
                    onMouseLeave={this.hoverOut('realTimePlayPauseButton')} 
                    onPress={() => {
                        this.setState({ realTimePlaying: !this.state.realTimePlaying });
                    }}>
                    <FontAwesome6 name={this.state.realTimePlaying?"pause":"play"} size={30} style={[{ textAlign:"center", alignSlef:"center",width:"100%"},{color: "white", alignSelf: "center"}]}/>
                </TouchableOpacity>
            );

        }else return null;

    }

    renderStopButton(){
        var device = this.props.devices[this.state.idDevice];
        if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime) && this.state.realTimePlaying){

            return (
                <TouchableOpacity
                    style={[this.style.realTimeButton,this.style.realTimeStopButton]}
                    activeOpacity={1}
                    onMouseEnter={this.hoverIn('realTimeStopButton')}
                    onMouseLeave={this.hoverOut('realTimeStopButton')} 
                    onPress={() => {
                        this.setState({ realTimeVisualization: !this.state.realTimeVisualization });
                    }}>
                    <FontAwesome6 name="stop" size={30} style={[{ textAlign:"center", alignSlef:"center",width:"100%"},{color: "white", alignSelf: "center"}]}/>
                </TouchableOpacity>
            );

        }else return null;
    }
    
    renderForwardButton(){
        var device = this.props.devices[this.state.idDevice];
        if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime) && this.state.realTimePlaying){

            return (
                <TouchableOpacity
                    style={[this.style.realTimeButton,this.style.realTimeForwardButton]}
                    activeOpacity={1}
                    onMouseEnter={this.hoverIn('realTimeForwardButton')}
                    onMouseLeave={this.hoverOut('realTimeForwardButton')} 
                    onPress={() => {
                        this.setState({ realTimeVisualization: !this.state.realTimeVisualization });
                    }}>
                    <FontAwesome6 name="forward" size={30} style={[{ textAlign:"center", alignSlef:"center",width:"100%"},{color: "white", alignSelf: "center"}]}/>
                </TouchableOpacity>
            );

        }else return null;
    }

    renderBackwardButton(){
        var device = this.props.devices[this.state.idDevice];
        if(device.realTimeConfig && (device.realTimeConfig.plannedConnectionTime<Date.now()/1000 || device.realTimeConfig.connectionTime) && this.state.realTimePlaying){

            return (
                <TouchableOpacity
                    style={[this.style.realTimeButton,this.style.realTimeBackwardButton]}
                    activeOpacity={1}
                    onMouseEnter={this.hoverIn('realTimeBackwardButton')}
                    onMouseLeave={this.hoverOut('realTimeBackwardButton')} 
                    onPress={() => {
                        this.setState({ realTimeVisualization: !this.state.realTimeVisualization });
                    }}>
                    <FontAwesome6 name="backward" size={30} style={[{ textAlign:"center", alignSlef:"center",width:"100%"},{color: "white", alignSelf: "center"}]}/>
                </TouchableOpacity>
            );

        }else return null;
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
        }
    }

    flipCards(showSimultaneity) {

        this.props.actions.fliwerDeviceActions.setSimultaneity(showSimultaneity).then(() => {
            this.setState({showSimultaneity: showSimultaneity}, () => {
                this.state.valvesRef.forEach((c) => {
                    //console.log("c", c)
                    if (c.props.data.valveType !== null)
                        c.refs.card._toggleCard();
                });
            });
        });
    }

    flipRealtime(showRealtimeLayer) {

        //this.props.actions.fliwerDeviceActions.setSimultaneity(showRealtimeLayer).then(() => {
            this.setState({showRealtimeLayer: showRealtimeLayer}, () => {

            });
        //});
    }

    getDevicesWithValvesLike(device) {

        if(!device)return [];

        if (device.type.indexOf("UNIPRO") != -1 || device.type.indexOf("TBD") != -1 || device.type.indexOf("CONTROL") != -1 || device.type=="SENS") {
            // Continue
        }
        else
            return [];

        var devicesWithValves = Object.values(this.props.devices).filter((dev) => {

            if (device.idHome == dev.idHome) {
                if (dev.type.indexOf("UNIPRO") != -1 || dev.type.indexOf("TBD") != -1 || dev.type.indexOf("CONTROL") != -1 || dev.type=="SENS") {
                    return true;
                }
            }

            return false;

        }).sort((a, b) => {

            
            var a_valves = a.valves?Object.values(a.valves.config):[-1];
            var a_valve = a_valves[0];
            var b_valves = b.valves?Object.values(b.valves.config):[-1];
            var b_valve = b_valves[0];

            if (a_valve.slot_virtual < b_valve.slot_virtual)
                return -1;
            else if (a_valve.slot_virtual > b_valve.slot_virtual)
                return 1;
            else
                return 0;
        });

        return devicesWithValves;
    }

    nextDevice = () => {
        var device = this.props.devices[this.state.idDevice];
        var devicesWithValves = this.getDevicesWithValvesLike(device);
        if (devicesWithValves.length==0) return;
        var nextIndex = 0;
        devicesWithValves.forEach((dev, i) => {
            if (dev.DeviceSerialNumber == device.DeviceSerialNumber)
                nextIndex=i+1;
        });
        var nextDeviceId = devicesWithValves[nextIndex]? devicesWithValves[nextIndex].DeviceSerialNumber : (devicesWithValves[0].DeviceSerialNumber != device.DeviceSerialNumber? devicesWithValves[0].DeviceSerialNumber : devicesWithValves[1].DeviceSerialNumber);
        this.setState({nextDeviceId: nextDeviceId});
    }

    previousDevice = () => {
        var device = this.props.devices[this.state.idDevice];
        var devicesWithValves = this.getDevicesWithValvesLike(device);
        if (devicesWithValves.length==0) return;
        var nextIndex = devicesWithValves.length - 1;
        devicesWithValves.forEach((dev, i) => {
            if (dev.DeviceSerialNumber == device.DeviceSerialNumber)
                nextIndex=i-1;
        });
        var nextDeviceId = devicesWithValves[nextIndex]? devicesWithValves[nextIndex].DeviceSerialNumber : (devicesWithValves[devicesWithValves.length - 1].DeviceSerialNumber != device.DeviceSerialNumber? devicesWithValves[devicesWithValves.length - 1].DeviceSerialNumber : devicesWithValves[devicesWithValves.length - 2].DeviceSerialNumber);
        this.setState({nextDeviceId: nextDeviceId});
    }

    isRealtimeConnected() {
        if (this.state.realtimeData == null)
            return false;
        return this.state.realtimeData.connected==1? true : false;
    }
};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        preloadedData: state.sessionReducer.preloadedData,
        loadedStorageData: state.sessionReducer.loadedStorageData,
        translation: state.languageReducer.translation,
        devices: state.fliwerDeviceReducer.devices,
        loadingDevices: state.fliwerDeviceReducer.loading,
        simultaneityActivated: state.fliwerDeviceReducer.simultaneityActivated,
        realtimeDevicesValves: state.fliwerDeviceReducer.realtimeDevicesValves,
        homeLoading: state.fliwerHomeReducer.loading,
        homeData: state.fliwerHomeReducer.data,
        gardenLoading: state.fliwerGardenReducer.loading,
        gardenData: state.fliwerGardenReducer.data,
        zoneLoading: state.fliwerZoneReducer.loading,
        zoneData: state.fliwerZoneReducer.data
    }
}

// Doing this merges our actions into the componentâ€™s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
            fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch)
        }
    }
}

//Connect everything

var styles = {
    buttonBackContainer: {
        width: "100%",
        height: 55
    },
    textBack: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 30,
        textAlign: "center",
        color: "white"
    },
    buttonBack: {
        backgroundColor: "#555555",
        alignItems: "center",
        justifyContent: "center",
        flex: 1
    },
    flipCardsButton: {
        position: "absolute",
        bottom: 65,
        right: 18,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        backgroundColor: FliwerColors.complementary.blue,
        borderColor: FliwerColors.secondary.white
    },
    /*
    realtimeButton: {
        position: "absolute",
        bottom: 135,
        right: 18,
        width: 60,
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        backgroundColor: FliwerColors.complementary.blue,
        borderColor: FliwerColors.secondary.white
    },
    */
    realtimeBar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        backgroundColor: "rgb(240,240,240)",
        justifyContent: "center",
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1
    },
    realtimeConnectedLed: {
        borderColor: "gray",
        borderWidth: 2,
        borderRadius: 45,
        height: 20,
        width: 20
    },
    isRealtimeConnectedLed: {
        backgroundColor: FliwerColors.primary.green
    },
    isRealtimeNotConnectedLed: {
        backgroundColor: "red"
    },
    realtimeDisconnectionButton: {
        height: 30,
        //width: 120,
        paddingLeft: 8, paddingRight: 8,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: "silver",
        justifyContent: "center"
    },
    realTimeButton: {
        position: "absolute",
        bottom: 135,
        right: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        backgroundColor: FliwerColors.primary.gray,
        borderColor: FliwerColors.secondary.white
    },
    realTimeIrrigationModeButton:{
        bottom:135
    },
    realTimePlayPauseButton:{
        bottom:205
    },
    realTimeStopButton:{
        bottom:275
    },
    realTimeBackwardButton:{
        bottom:345
    },
    realTimeForwardButton:{
        bottom: 415
    },
    ":hover": {
        flipCardsButton: {
            filter: "brightness(120%)"
        },        
        /*
        realtimeButton: {
            filter: "brightness(120%)"
        },
        */
        realTimeIrrigationModeButton:{
            filter: "brightness(120%)"
        },
        realTimePlayPauseButton:{
            filter: "brightness(120%)"
        },
        realTimeStopButton:{
            filter: "brightness(120%)"
        },
        realTimeBackwardButton:{
            filter: "brightness(120%)"
        },
        realTimeForwardButton:{
            filter: "brightness(120%)"
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, ControlValves));