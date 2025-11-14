'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    RefreshControl,
    Platform,
    BackHandler,
    TextInput,
    Dimensions
} = require('react-native');

import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';

import { CheckBox } from 'react-native-elements'

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import RealTimeBar from './realTimeBar.js'
import FliwerLoading from '../fliwerLoading'
import ImageBackground from '../../components/imageBackground.js'
import DeviceCard from '../../components/devices/deviceCard.js'
import CardCollection from '../../components/custom/cardCollection.js'
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerLocationModal from '../../components/custom/FliwerLocationModal.js'
import BatteryModal from '../../components/devices/batteryModal.js'
import RangeModal from '../../components/devices/rangeModal.js'
import DevicesMap from '../../components/devices/devicesMap'
import FliwerButtonDateTimePicker from '../../components/custom/FliwerButtonDateTimePicker.js'
import Dropdown from '../../widgets/dropdown/dropdown';
import FliwerVerifyEmailModalGeneric from '../../components/custom/FliwerVerifyEmailModalGeneric.js'

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions
import * as ActionVisitor from '../../actions/visitorActions.js'; //Import your actions

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { Redirect, withRouter } from '../../utils/router/router'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import { FliwerCommonUtils } from '../../utils/FliwerCommonUtils'
import { FliwerColors,CurrentTheme } from '../../utils/FliwerColors'
import { FliwerStyles } from '../../utils/FliwerStyles'

import Modal from '../../widgets/modal/modal'
import { toast } from '../../widgets/toast/toast'

//import background from '../../assets/img/devicesBackground.jpg'
//import rainolveBackground from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

import addButton from '../../assets/img/add.png'
import refreshButton from '../../assets/img/refresh.png'
import mapButton from '../../assets/img/map.png'
import ic_launcher from '../../assets/img/ic_launcher.png'
import applestore from '../../assets/img/applestore.png'
import googleplay from '../../assets/img/googleplay.png'

import moment from 'moment';

class Devices extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idZone: this.props.match.params.idZone,
            loadingZone:false,
            addDevices: false,
            modalVisible: false,
            modalConfig: false,
            modalTitle: null,
            realTimeStartModal: false,
            realTimeEndModal: false,
            idDevice: null,
            loading: false,
            refreshing: false,
            gotoDevice: null,
            gotoZone: null,
            
            redirected: false,
            visibleModalDeviceLocation: false,
            visibleModalDeviceSIMNumber: false,
            modifiedSimNumber: null,
            coordsDevice: null,
            verifyVisible: false,
            petition: this.props.petition ? this.props.petition.id : null,
            email: this.props.petition && this.props.petition.email ? this.props.petition.email : null,
            visibleModalUseApp: false,
            visibleBatteryModal: false,
            visibleRangeModal: false,
            mapVisible: false,
            gotoDeviceFirstTime: false,
            highlightedDeviceId: null,
            devicesCanvasHeight: null,
            zone:null,
            home:null,
            realTimeVisualization:false,
            startPingTestModal:null,
            renderedDevices: [],
            rebootResetOption: 0,
            showDropdown: false,
        };
        this._devicesInList = {};

        if(this.props.match.params.idZone){
            this.state.loadingZone=true;
            this.props.actions.fliwerZoneActions.getOneZone(this.props.match.params.idZone).then((zone)=>{
                this.props.actions.fliwerDeviceActions.getDeviceList(null,zone.idHome).then(()=>{
                    this.setState({loadingZone:false});
                });
            })
        }else this.refreshDevices();
        
        

        
    }

    
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.match.params.idZone != nextProps.match.params.idZone) {
            var exZone = this.state.zone
            this.setState({loadingZone:true});
            this.props.actions.fliwerZoneActions.getOneZone(nextProps.match.params.idZone).then((zone)=>{
                if(exZone && exZone.idHome!=zone.idHome){
                    this.props.actions.fliwerDeviceActions.getDeviceList(null,zone.idHome).then(()=>{
                        this.setState({loadingZone:false});
                        this.state.idZone = nextProps.match.params.idZone;
                        this.forceUpdate();
                    });
                }else{
                    this.setState({loadingZone:false});
                    this.state.idZone = nextProps.match.params.idZone;
                    this.forceUpdate();
                }
            })
        }
        return true;
    }
    

    componentWillUnmount = () => {
        this.backHandler.remove()
    };

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        //this.goBack(); // works best when the goBack is async
        return true;
    }

    componentWillMount() {
        this.props.actions.createZoneActions.stopCreatingNewZone();
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.idZone !== this.state.idZone) {
            this.setState({ idZone: this.props.match.params.idZone, gotoDevice: null, gotoZone: null, redirected: false, loading: false })

        }
    }

    render() {
        //console.log("zoneData!",this.props.zoneData);
        if (this.state.goNextGarden) {
            this.state.goNextGarden = false;
            this.setState({ loading: true })
            return (<Redirect push to={"/zone/" + this.state.foundZoneId + "/devices/"} />)
        } else {
            
                
            if(!this.state.zone || !this.state.home || this.state.zone.idZone != this.state.idZone){
                var zoneGardenHome=this.props.actions.fliwerZoneActions.getZoneGardenHome(this.state.idZone);
                this.state.zone=zoneGardenHome.zone;
                this.state.home=zoneGardenHome.home;
            }

            if (this.state.addDevices)
                return (<Redirect push to={"/zone/" + this.state.idZone + "/devices/new"} />)
            else if (!this.props.preloadedData || this.state.loadingZone /*&& !this.props.loadedStorageData || this.props.loadingDevices*/) {
                var title = "";

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener)
                    bottomIcons.push("gardener");
                bottomIcons.push("zone", "files");

                return (
                    <ImageBackground style={{backgroundColor:CurrentTheme.complementaryColor}} resizeMode={"cover"}>
                        {
                            !this.props.asComponent?[
                                (<MainFliwerTopBar showTextBar={true} title={title} />),
                                (<MainFliwerMenuBar idZone={this.state.idZone} current={"devices"} icons={topIcons} position={"top"} />)
                            ]:(<MainFliwerTopBar showTextBar={true} hideMainBar={true} mode={'zone'} title={(this.state.home?this.state.home.name + " - ":"") + (this.state.zone?this.state.zone.name:"")} onPressNextGarden={false} onPressPreviousGarden={false} />)
                        }
                        <FliwerLoading />
                        <View style={{ width: "100%", flex: 1 }}></View>
                        {
                            !this.props.asComponent?[
                                (<MainFliwerMenuBar idZone={this.state.idZone} current={"devices"} icons={bottomIcons} />)
                            ]:null
                        }
                    </ImageBackground>
                );
            } else if (this.state.gotoDevice && this.state.gotoZone && !this.state.redirected) {
                this.state.redirected = true;
                return (<Redirect push to={"/zone/" + this.state.gotoZone + "/devices/" + this.state.gotoDevice} />)
            } else {

                /*
                var meteoTime;
                if (home.meteo && home.meteo.icon) {
                    var date = new Date(home.meteo.lastMeteoUpdateTime * 1000);
                    meteoTime = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
                }*/

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener)
                    bottomIcons.push("gardener");
                bottomIcons.push("zone", "files");

                var zones = Object.values(this.props.zoneData);

                const dimensions = Dimensions.get('window');
                var isPortrait = (dimensions.height > dimensions.width);
                
                return (
                    <ImageBackground style={{backgroundColor:CurrentTheme.complementaryColor}} resizeMode={"cover"} loading={(Platform.OS == 'web' ? (this.state.loading || this.state.refreshing) : (this.state.loading))} >
                        {
                            !this.props.asComponent?[
                                (<MainFliwerTopBar showTextBar={true} mode={'zone'} title={(this.state.home?this.state.home.name + " - ":"") + this.state.zone.name} onPressNextGarden={zones.length > 1 ? this.nextGarden : null} onPressPreviousGarden={zones.length > 1 ? this.previousGarden : null} />),
                                (<MainFliwerMenuBar idZone={this.state.idZone} current={"devices"} icons={topIcons} position={"top"} />)
                            ]:(<MainFliwerTopBar showTextBar={true} hideMainBar={true} mode={'zone'} title={(this.state.home?this.state.home.name + " - ":"") +  (this.state.zone?this.state.zone.name:"")} onPressNextGarden={false} onPressPreviousGarden={false} />)
                        }

                        <RealTimeBar idZone={this.state.idZone} onStart={()=>{
                            this.setState({realTimeStartAllModal:true});
                        }} onCancel={(close)=>{
                            if(close){
                                this.setState({realTimeEndAllModal:true,realTimeEndAllMode:"close"});
                            }else {
                                this.setState({realTimeEndAllModal:true,realTimeEndAllMode:"cancel"});
                            }
                        }}/>


                        <View style={{ flexDirection: isPortrait ? "column" : "row", flex: 1 }} >

                            {this.state.mapVisible ? <View style={[{ width: "100%", flex: 1 }, isPortrait ? { borderBottomColor: '#aaaaaa', borderBottomWidth: 1 } : { borderRightColor: '#aaaaaa', borderRightWidth: 1 }]} >
                                {this.renderMap()}
                            </View> : null}

                            <View
                                style={[{ width: "100%" }, (isPortrait || !this.state.mapVisible || (dimensions.width / 2) < 450) ? { flex: 1 } : { width: 450 }]}
                                onLayout={(e) => {
                                    this.setState({ devicesCanvasHeight: e.nativeEvent.layout.height });
                                }}
                            >
                                <ScrollView ref={(s) => {
                                    this._scrollView = s;
                                }}
                                    scrollEventThrottle={1000}
                                    style={{ flex: 1 }}
                                    refreshControl={< RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                                        this.refreshDevices()
                                    }} />}
                                >
                                    <CardCollection style={this.style.collection}>
                                        {this.renderDevices(this.state.zone)}
                                    </CardCollection>
                                </ScrollView>
                            </View>
                        </View>

                        {
                            !this.props.asComponent?[
                                (<MainFliwerMenuBar idZone={this.state.idZone} current={"devices"} icons={bottomIcons} />)
                            ]:null
                        }
                        {this.realTimeVisualizationButton()}
                        {this.renderRefreshDevicesButton()}
                        {this.getFliwerVerifyEmailModalGenericDeleteDevice()}
                        {this.renderDevicesMapButton()}
                        {this.renderModalDeviceLocation()}
                        {this.renderModalDeviceSIMNumber()}
                        {this.renderBatteryModal()}
                        {this.renderRangeModal()}
                        {this.renderRealTimeStartModal()}
                        {this.renderRealTimeStartAllModal()}
                        {this.renderRealTimeEndModal()}
                        {this.renderRealTimeEndAllModal()}
                        {this.renderStartPingTestModal()} 
                        {Platform.OS == "web" ? this.renderModalUseApp() : null}
                        {this.getFliwerDeleteModal()}
                        {this.getFliwerConfigModal()}
                    </ImageBackground>
                );
            }
        }
    }

    getFliwerVerifyEmailModalGenericDeleteDevice(){
        return (
            <FliwerVerifyEmailModalGeneric
                visible={this.state.verifyVisible}
                onFinalize={() => {
                    // this.props.actions.modifyZoneActions.removeMap();
                    // this.props.actions.createZoneActions.removePhotoZone();
                    //toast.notification(this.props.actions.translate.get("modifyGarde_modify_correct"));
                    // this.modalClosed()
                    this.setState({verifyVisible: false, loading: false});
                    
                }}
                loadingModal={false}
                email={this.props.data.email}
                setLoading={this.setLoading()}
                onAction={(uuid,verificationCode)=>{
                     return this.props.actions.fliwerDeviceActions.deleteDevice(this.state.idDevice,uuid,verificationCode);
                }}
                onError={(err)=>{
                    if (err && err.reason)
                        toast.error(err.reason);
                    this.setState({loading: false, loading: false});
                }}
                onCancel={() => {
                    this.setState({verifyVisible: false, loading: false});
                }}
            />
        );

            
    }

    renderRealTimeStartModal(){
        if(!this.state.realTimeStartModal)
            return null;
        else{
            var device = this.props.devices[this.state.idDevice];
            var allowed=true;
            var title="¿Estás seguro de que quieres programar el tiempo real en este dispositivo y todos sus puentes?";
            //If not link and unixCompileTime<1715119200 
            
            /*
            if(device && device.type && !device.type.includes("LINK") && device.unixCompileTime && device.unixCompileTime<1715119200){
                title="Tu versión de firmware no es compatible con el modo tiempo real.¿Quieres avisar ?";
                allowed=false;
            }
            */

            return(
                <FliwerDeleteModal
                    visible={this.state.realTimeStartModal}
                    onClose={() => {
                        this.setRealTimeStartModal(false,null);
                    }}
                    onConfirm={async () => {
                        /**/
                        this.setState({loading:true});
                        this.props.actions.fliwerDeviceActions.startRealTime(this.state.idDevice,this.state.zone.idHome).then(()=>{
                            this.setRealTimeStartModal(false,null);
                            this.setState({loading:false});
                        },(err)=>{
                            toast.error(err);
                            this.setState({loading:false});
                        })
                    }}
                    title={"Programar Tiempo Real"}
                    subtitle={true}
                    text={title}
                    password={false}
                    loadingModal={this.state.loading}
                />
            );
        }
    }

    renderRealTimeStartAllModal(){
        //Same as renderRealTimeStartModal but for all devices in the zone
        if(!this.state.realTimeStartAllModal)
            return null;
        else{
            var devices = Object.values(this.props.devices).filter(device => device.idHome==this.state.zone.idHome);
            var allowed=true;
            var title="¿Estás seguro de que quieres programar el tiempo real en todos los dispositivos de esta zona?";
            //If not link and unixCompileTime<1715119200 
            
            /*
            if(device && device.type && !device.type.includes("LINK") && device.unixCompileTime && device.unixCompileTime<1715119200){
                title="Tu versión de firmware no es compatible con el modo tiempo real.¿Quieres avisar ?";
                allowed=false;
            }
            */

            return(
                <FliwerDeleteModal
                    visible={this.state.realTimeStartAllModal}
                    onClose={() => {
                        this.setState({realTimeStartAllModal:false});
                    }}
                    onConfirm={async () => {
                        /**/
                        this.setState({loading:true});
                        this.props.actions.fliwerDeviceActions.startRealTimeAll(this.state.zone.idHome).then(()=>{
                            this.setState({loading:false,realTimeStartAllModal:false});
                        },(err)=>{
                            toast.error(err);
                            this.setState({loading:false,realTimeStartAllModal:false});
                        })
                    }}
                    title={"Programar Tiempo Real"}
                    subtitle={true}
                    text={title}
                    password={false}
                    loadingModal={this.state.loading}
                />
            );
        }
    }

    renderRealTimeEndModal(){
        if(!this.state.realTimeEndModal)
            return null;
        else{
            var device = this.props.devices[this.state.idDevice];
            var inRealTime= device.realTimeConfig?true:false; //TODO
            return(
                <FliwerDeleteModal
                    visible={this.state.realTimeEndModal}
                    onClose={() => {
                        this.setRealTimeEndModal(false,null);
                    }}
                    onConfirm={async () => {
                        this.setState({loading:true});
                        this.props.actions.fliwerDeviceActions.endRealTime(this.state.idDevice,this.state.zone.idHome).then(()=>{
                            this.setRealTimeEndModal(false,null);
                            this.setState({loading:false});
                        },(err)=>{
                            toast.error(err);
                            this.setState({loading:false});
                        })
                    }}
                    title={inRealTime?"Finalizar Tiempo Real":"Cancelar Tiempo Real"}
                    subtitle={true}
                    text={inRealTime?"¿Estás seguro de que quieres salir del modo tiempo real en este dispositivo?":"¿Estás seguro de que quieres cancelar la programación del tiempo real en este dispositivo?"}
                    password={false}
                    loadingModal={this.state.loading}
                />
            );
        }
    }

    renderRealTimeEndAllModal(){
        if(!this.state.realTimeEndAllModal)
            return null;
        else{
            var devices = Object.values(this.props.devices).filter(device =>  device.realTimeConfig && device.idHome==this.state.zone.idHome);
            if(devices.length==0) return null;
            var inRealTime= devices.reduce((prev, current) => (prev.realTimeConfig.plannedConnectionTime > current.realTimeConfig.plannedConnectionTime) ? prev : current).realTimeConfig?true:false; //TODO
            return(
                <FliwerDeleteModal
                    visible={this.state.realTimeEndAllModal}
                    onClose={() => {
                        this.setState({realTimeEndAllModal:false});
                    }}
                    onConfirm={async () => {
                        this.setState({loading:true});
                        this.props.actions.fliwerDeviceActions.endRealTimeAll(this.state.zone.idHome).then(()=>{
                            this.setState({loading:false,realTimeEndAllModal:false});
                        },(err)=>{
                            toast.error(err);
                            this.setState({loading:false,realTimeEndAllModal:false});
                        })
                    }}
                    title={inRealTime?"Finalizar Tiempo Real":"Cancelar Tiempo Real"}
                    subtitle={true}
                    text={inRealTime?"¿Estás seguro de que quieres salir del modo tiempo real en todos los dispositivos de esta zona?":"¿Estás seguro de que quieres cancelar la programación del tiempo real en todos los dispositivos de esta zona?"}
                    password={false}
                    loadingModal={this.state.loading}
                />
            );
        }
    }

    renderStartPingTestModal(){
        if(!this.state.startPingTestModal)
            return null;
        else{
            return(
                <FliwerDeleteModal
                    visible={this.state.startPingTestModal?true:false}
                    onClose={() => {
                        this.setState({startPingTestModal:null});
                    }}
                    onConfirm={async () => {
                        this.state.startPingTestModal().finally(()=>{
                            this.setState({startPingTestModal:null});
                        })
                    }}
                    title={"Prueba de Ping"}
                    subtitle={true}
                    text={"¿Estás seguro de que quieres realizar una prueba de ping en este dispositivo?"}
                    password={false}
                    loadingModal={this.state.loading}
                />
            );
        }
    }

    setDeleteModalVisible(visible, idDevice){
        this.setState({verifyVisible: visible, idDevice});
    }


    getFliwerDeleteModal() {

        if (!this.state.modalVisible)
            return null;
        else {
            let passwordIsNeeded = (this.props.sessionData.country !== 'KR');
            let title;
            if (this.state.modalTitle)
                title = this.state.modalTitle;
            else {
                title = (this.state.idDevice && this.props.devices[this.state.idDevice] && this.props.devices[this.state.idDevice].type.includes("LINK") ? this.props.actions.translate.get('masterVC_device_link_remove_title') : this.props.actions.translate.get('masterVC_device_remove_title'));
                this.state.modalTitle = title;
            }

            return (
                <FliwerDeleteModal
                    visible={this.state.modalVisible}
                    onClose={() => {
                        this.setModalVisible(false, this.state.idDevice);
                    }}
                    onConfirm={async (password) => {
                        await this.deleteDevice(password)
                    }}
                    title={title}
                    password={passwordIsNeeded}
                    onMailRequestDelete={async () => {
                        await this.sendMailRequestDelete();
                    }}
                    loadingModal={this.state.loading}
                />
            );
        }

    }

    getFliwerConfigModal() {
        if (!this.state.modalConfig)
            return null;
        else {
            var lastConfig;

            if(this.props.devices[this.state.idDevice] && this.props.devices[this.state.idDevice].lastConfigReceivedTime){
                lastConfig = moment.unix(this.props.devices[this.state.idDevice].lastConfigReceivedTime).format("DD/MM/YYYY HH:mm:ss");
            }

            if (typeof this.state.configWakeUpTime === "undefined") this.state.configWakeUpTime = this.props.devices[this.state.idDevice].config.wakeUpTime;
            if (typeof this.state.wakeUpPeriod === "undefined") this.state.wakeUpPeriod = this.props.devices[this.state.idDevice].config.wakeUpPeriod/*?this.props.devices[this.state.idDevice].config.wakeUpPeriod:60*/;
            if (typeof this.state.wakeUpPeriodUnits === "undefined") this.state.wakeUpPeriodUnits = this.props.devices[this.state.idDevice].config.wakeUpPeriodUnits ? this.props.devices[this.state.idDevice].config.wakeUpPeriodUnits : 0;
            if (typeof this.state.wakeUpDuration === "undefined") this.state.wakeUpDuration = this.props.devices[this.state.idDevice].config.wakeUpDuration/*?this.props.devices[this.state.idDevice].config.wakeUpDuration:5*/;
            if (typeof this.state.wakeUpDurationUnits === "undefined") this.state.wakeUpDurationUnits = typeof this.props.devices[this.state.idDevice].config.wakeUpDurationUnits !== "undefined" ? this.props.devices[this.state.idDevice].config.wakeUpDurationUnits : 1;
            if (typeof this.state.connectionDuration === "undefined") this.state.connectionDuration = this.props.devices[this.state.idDevice].config.connectionDuration/*?this.props.devices[this.state.idDevice].config.connectionDuration:5*/;
            if (typeof this.state.connectionDurationUnits === "undefined") this.state.connectionDurationUnits = typeof this.props.devices[this.state.idDevice].config.connectionDurationUnits !== "undefined" ? this.props.devices[this.state.idDevice].config.connectionDurationUnits : 1;
            if (typeof this.state.keepAlivePeriod === "undefined") this.state.keepAlivePeriod = this.props.devices[this.state.idDevice].config.keepAlivePeriod/*?this.props.devices[this.state.idDevice].config.keepAlivePeriod:40*/;
            if (typeof this.state.deviceRole === "undefined") this.state.deviceRole = this.props.devices[this.state.idDevice].config.deviceRole;
            if (typeof this.state.realTimeVisible === "undefined") this.state.realTimeVisible = this.props.devices[this.state.idDevice].config.realTimeVisible==1?1:0;
            if (typeof this.state.searchDevicesEnabled === "undefined") this.state.searchDevicesEnabled =  this.props.devices[this.state.idDevice].config.deviceRole==1?this.props.devices[this.state.idDevice].config.searchDevicesEnabled:0;
            if (typeof this.state.dataLostMaxDuration === "undefined") this.state.dataLostMaxDuration = this.props.devices[this.state.idDevice].config.dataLostMaxDuration/*?this.props.devices[this.state.idDevice].config.keepAlivePeriod:40*/;
            if (typeof this.state.protocolVersion === "undefined") this.state.protocolVersion = /*this.props.devices[this.state.idDevice].config.protocolVersion ?*/ true /*: false*/; //If this modal is opened then it is using the new protocol
            if (typeof this.state.collectRetriesDelay === "undefined") this.state.collectRetriesDelay = this.props.devices[this.state.idDevice].config.collectRetriesDelay?this.props.devices[this.state.idDevice].config.collectRetriesDelay:0.1;

            var showDate = null;
            if (this.state.configWakeUpTime) showDate = moment.unix(this.state.configWakeUpTime).format("h:mm a, YYYY MMMM D");

            var linkSerialNumber= this.props.devices[this.state.idDevice].LinkSerialNumber

            /*
            deviceRole          :           0
            protocolVersion          :           0
            */


            return (
                <Modal animationType="fade" inStyle={[FliwerStyles.modalIn, { maxWidth: 500 }]} visible={true} onClose={() => { this.setModalConfigVisible(false, this.state.idDevice); }}>
                    <ScrollView style={[FliwerStyles.modalView, { paddingLeft: 20, paddingRight: 20 }]}>
                        <View style={{ width: "100%" }}>
                            <View style={{ alignItems: "center" }}><Text style={[this.style.textFormat, { fontSize: 20 }]}>{this.props.actions.translate.get("config")}</Text></View>
                            <View style={[this.style.underLine, {}]}></View>
                        </View>

                        {lastConfig?(
                            <View style={{alignSelf:"end", marginTop: 10}}>
                                <Text style={{fontSize: 10,fontFamily: FliwerColors.fonts.light}}>{"Last config received: "+lastConfig}</Text>
                            </View>):null
                        }

                        
                        {   //if this.state.idDevice is in rt and connected, render a button (not green) for send reboot/reset
                            this.props.devices[linkSerialNumber] && this.props.devices[linkSerialNumber].realTimeConfig &&  this.props.devices[linkSerialNumber].realTimeConfig.programmedTime<=Date.now()/1000 && this.props.deviceRealTimeInfo && this.props.deviceRealTimeInfo[linkSerialNumber] && this.props.deviceRealTimeInfo[linkSerialNumber].status==2/*OK*/?(
                                <>
                                    <FliwerGreenButton text={"Reboot/Reset"} style={[this.style.buttonStyle,{backgroundColor:FliwerColors.primary.gray}]} containerStyle={{ marginTop: 10, marginBottom: 10, height: 33, width: 200, alignSelf:"end"}}
                                        onPress={() => {
                                            this._rebootDropdown.openModal();
                                        }}
                                    />
                                    <Dropdown
                                        ref={(t) => { this._rebootDropdown = t; }}
                                        modal={true}
                                        style={{ display:"hidden",position:"absolute",top:0,left:0,opacity:0 }}
                                        disabled={true}
                                        selectedValue={-1}
                                        options={[
                                            { value: 0, label: "Reset" },
                                            { value: 1, label: "Reboot" }
                                        ]}
                                        onChange={(value) => {
                                            //set loading
                                            this.setState({loading:true});
                                            this.props.actions.fliwerDeviceActions.sendDataRealTime(linkSerialNumber,"sendRebootOnDemandFromParent",{type: value,idDeviceReboot:this.state.idDevice},false).then(() => {
                                                this.setState({loading:false});
                                                toast.notification("Reboot/Reset command sent");
                                            }, (err) => {
                                                console.log("Probable error sending reboot/reset:",err);
                                                this.setState({loading:false});
                                                toast.notification("Reboot/Reset command sent");
                                            });
                                        }}
                                    />
                                </>
                            ):null
                        }


                        <View style={{ width: "100%", flexDirection: "row", marginTop: 10, alignItems: "center" }}>
                            <CheckBox
                                title={this.props.actions.translate.get("Devices_new_protocol")}
                                textStyle={{}}
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                checked={this.state.protocolVersion ? true : false}
                                onPress={() => {
                                    this.setState({ protocolVersion: !this.state.protocolVersion })
                                }}
                            />
                        </View>

                        <View style={[this.style.configModalBoxPair,{marginTop:0}]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{this.props.actions.translate.get("Devices_waekeup_time") + ":"}</Text>
                            <FliwerButtonDateTimePicker
                                mode={"datetime"}
                                date={showDate}
                                timeIntervals={1}
                                styleButtonContainer={{ width: "100%" }}
                                onChange={(v) => {
                                    this.setState({ configWakeUpTime: v })
                                }}
                            />
                        </View>

                        <View style={[this.style.configModalBoxPair]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{this.props.actions.translate.get("Devices_waekeup_period") + ":"}</Text>
                            <View style={[this.style.configModalBoxPairInside]}>
                                <TextInput
                                    ref={(t) => { this._wakeUpPeriodTextInput = t; }}
                                    style={{ width: 60, height: 40, marginRight: 20, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4 }}
                                    onChangeText={(text) => {
                                        var newText = text.replace(/\D/g, "");
                                        if (newText != text) this._wakeUpPeriodTextInput.value = 60;
                                        this.setState({ wakeUpPeriod: newText });
                                    }}
                                    defaultValue={this.state.wakeUpPeriod+""}
                                    keyboardType={"number-pad"}
                                    maxLength={3}
                                    editable={true}
                                />
                                <Dropdown modal={true} 
                                    style={{ flexShrink: 1,flexGrow:1 }}
                                    selectedValue={this.state.wakeUpPeriodUnits}
                                    options={[{ value: 0, label: this.props.actions.translate.get("fliwerCard_minuts") }, { value: 1, label: this.props.actions.translate.get("fliwerCard_hours") }]}
                                    onChange={(value) => {
                                        this.setState({ wakeUpPeriodUnits: value })
                                    }}
                                />
                            </View>
                        </View>

                        <View style={[this.style.configModalBoxPair]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{this.props.actions.translate.get("Devices_waekeup_duration") + ":"}</Text>
                            <View style={[this.style.configModalBoxPairInside]}>
                                <TextInput
                                    ref={(t) => { this._wakeUpDurationTextInput = t; }}
                                    style={{ width: 60, height: 40, marginRight: 20, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4 }}
                                    onChangeText={(text) => {
                                        var newText = text.replace(/\D/g, "");
                                        if (newText != text) this._wakeUpDurationTextInput.value = 60;
                                        this.setState({ wakeUpDuration: newText });
                                    }}
                                    defaultValue={this.state.wakeUpDuration+""}
                                    keyboardType={"number-pad"}
                                    maxLength={3}
                                    editable={true}
                                />
                                <Dropdown modal={true} style={{ flexShrink: 1,flexGrow:1 }}
                                    styleOptions={{}}
                                    selectedValue={this.state.wakeUpDurationUnits}
                                    options={[{ value: 0, label: this.props.actions.translate.get("fliwerCard_seconds") }, { value: 1, label: this.props.actions.translate.get("fliwerCard_minuts") }]}
                                    onChange={(value) => {
                                        this.setState({ wakeUpDurationUnits: value })
                                    }}
                                />
                            </View>
                        </View>

                        

                        <View style={[this.style.configModalBoxPair]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{"Connection Duration:"}</Text>
                            <View style={[this.style.configModalBoxPairInside]}>
                                <TextInput
                                    ref={(t) => { this._connectionDurationTextInput = t; }}
                                    style={{ width: 60, height: 40, marginRight: 20, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4 }}
                                    onChangeText={(text) => {
                                        var newText = text.replace(/\D/g, "");
                                        if (newText != text) this._connectionDurationTextInput.value = 60;
                                        this.setState({ connectionDuration: newText });
                                    }}
                                    defaultValue={this.state.connectionDuration+""}
                                    keyboardType={"number-pad"}
                                    maxLength={3}
                                    editable={true}
                                />
                                <Dropdown modal={true} style={{ flexShrink: 1,flexGrow:1 }}
                                    styleOptions={{}}
                                    selectedValue={this.state.connectionDurationUnits}
                                    options={[{ value: 0, label: this.props.actions.translate.get("fliwerCard_seconds") }, { value: 1, label: this.props.actions.translate.get("fliwerCard_minuts") }]}
                                    onChange={(value) => {
                                        this.setState({ connectionDurationUnits: value })
                                    }}
                                />
                            </View>
                        </View>

                        <View style={[this.style.configModalBoxPair]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{this.props.actions.translate.get("Devices_keepalive_period") + ":"}</Text>
                            <View style={[this.style.configModalBoxPairInside]}>
                                <TextInput
                                    ref={(t) => { this._keepAlivePeriodTextInput = t; }}
                                    style={{ width: 60, height: 40, marginRight: 20, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4 }}
                                    onChangeText={(text) => {
                                        var newText = text.replace(/\D/g, "");
                                        if (newText != text) this._keepAlivePeriodTextInput.value = 60;
                                        this.setState({ keepAlivePeriod: newText });
                                    }}
                                    defaultValue={this.state.keepAlivePeriod+""}
                                    keyboardType={"number-pad"}
                                    maxLength={3}
                                    editable={true}
                                />
                                <Text style={[this.style.textFormat, {}]}>{this.props.actions.translate.get("fliwerCard_seconds")}</Text>
                            </View>
                        </View>

                        
                        <View style={[this.style.configModalBoxPair]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{this.props.actions.translate.get("Devices_dataLostMaxDuration_period") + ":"}</Text>
                            <View style={[this.style.configModalBoxPairInside]}>
                                <TextInput
                                    ref={(t) => { this._dataLostMaxDurationTextInput = t; }}
                                    style={{ width: 60, height: 40, marginRight: 20, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4 }}
                                    onChangeText={(text) => {
                                        var newText = text.replace(/\D/g, "");
                                        if (newText != text) this._dataLostMaxDurationTextInput.value = 60;
                                        this.setState({ dataLostMaxDuration: newText });
                                    }}
                                    defaultValue={this.state.dataLostMaxDuration+""}
                                    keyboardType={"number-pad"}
                                    maxLength={3}
                                    editable={true}
                                />
                                <Text style={[this.style.textFormat, {}]}>{this.props.actions.translate.get("fliwerCard_seconds")}</Text>
                            </View>
                        </View>

                        <View style={[this.style.configModalBoxPair]}>
                            <Text style={[this.style.textFormat, { marginRight: 20 }]}>{/*this.props.actions.translate.get("Devices_collectRetriesDelay")*/"Delay de reintentos en collect" + ":"}</Text>
                            <TouchableOpacity style={[this.style.configModalBoxPairInside]} onPress={()=>{
                                var collectRetriesDelayValues=[0.1,0.2,0.5,1,5,10];
                                var index=collectRetriesDelayValues.indexOf(parseFloat(this.state.collectRetriesDelay));
                                index++;
                                if(index>=collectRetriesDelayValues.length) index=0;
                                this.setState({collectRetriesDelay:collectRetriesDelayValues[index]});
                            }}>
                                <View style={{borderRadius:5,borderWidth:1,width: 40,height: 40,textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center",  marginRight: 10}}>
                                    <Text style={[this.style.textFormat, {fontSize:16}]}>{this.state.collectRetriesDelay}</Text>
                                </View>
                                <Text style={[this.style.textFormat, {}]}>{this.props.actions.translate.get("fliwerCard_seconds")}</Text>
                            </TouchableOpacity>
                        </View>

                        {
                            <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                                <CheckBox
                                    title={this.props.actions.translate.get("Devices_gateway")}
                                    textStyle={{}}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.deviceRole ? true : false}
                                    onPress={() => {
                                        this.setState({ deviceRole: !this.state.deviceRole })
                                    }}
                                />
                            </View>
                        }

                        {
                            //If it's gateway, the user can activate its search devices mode with an slider
                            this.state.deviceRole==0?null:
                            (
                                <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                                    <CheckBox
                                        title={this.props.actions.translate.get("Devices_searchDevicesEnabled")}
                                        textStyle={{}}
                                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                        checked={this.state.searchDevicesEnabled ? true : false}
                                        onPress={() => {
                                            this.setState({ searchDevicesEnabled: !this.state.searchDevicesEnabled })
                                        }}
                                    />
                                </View>
                            )
                        }

                        <View style={{ width: "100%", flexDirection: "row", alignItems: "center" }}>
                            <CheckBox
                                title={"Real Time Visible"}
                                textStyle={{}}
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                checked={this.state.realTimeVisible ? true : false}
                                onPress={() => {
                                    this.setState({ realTimeVisible: !this.state.realTimeVisible })
                                }}
                            />
                        </View>

                        <FliwerGreenButton text={"Save Configuration"} style={this.style.buttonStyle} containerStyle={{ marginTop: 30, marginBottom: 30, height: 33, width: null, minWidth: 200, alignSelf: "center" }}
                            onPress={async () => {
                                if (this.state.protocolVersion==1 && !this.state.configWakeUpTime) toast.error(this.props.actions.translate.get("Devices_configError_wakeUpTime"));
                                else if(this.state.protocolVersion==1 && this.state.wakeUpPeriodUnits==0 && this.state.wakeUpPeriod<5) toast.error("Wakeup period cannot be less than 5 minutes");
                                else if(this.state.protocolVersion==1 && this.state.wakeUpDurationUnits==0 && this.state.wakeupDuration<=10) toast.error("Wakeup duration cannot be 10 seconds or less");
                                else if(this.state.protocolVersion==1 && this.state.connectionDurationUnits==0 && this.state.connectionDuration<=10) toast.error("Connection duration cannot be 10 seconds or less");
                                else if (this.state.protocolVersion==1 && !this.state.wakeUpPeriod) toast.error(this.props.actions.translate.get("Devices_configError_wakeUpPeriod"));
                                else if (this.state.protocolVersion==1 && !this.state.wakeUpDuration) toast.error(this.props.actions.translate.get("Devices_configError_wakeupDuration"));
                                else if (this.state.protocolVersion==1 && !this.state.connectionDuration) toast.error("Connection Duration mandatory");
                                else if (this.state.protocolVersion==1 && !this.state.keepAlivePeriod) toast.error(this.props.actions.translate.get("Devices_configError_KeepAlivePeriod"));
                                else if (this.state.protocolVersion==1 && !this.state.dataLostMaxDuration) toast.error(this.props.actions.translate.get("Devices_configError_dataLostMaxDuration"));
                                //Connection duration needs to also be equal or greater than wakeupDuration. So compare them using the actual seconds (using wakeUpDurationUnits and connectionDurationUnits)
                                else if((this.state.wakeUpDurationUnits==0?this.state.wakeUpDuration:this.state.wakeUpDuration*60)/*total wakeup*/ > (this.state.connectionDurationUnits==0?this.state.connectionDuration:this.state.connectionDuration*60))toast.error("Connection Duration has to be equal or greater than Wakeup Duration");
                                else {
                                    this.setState({ loading: true });
                                    var newConfig={protocolVersion:0}
                                    
                                    if(this.state.protocolVersion==1)
                                        newConfig={
                                            wakeUpTime: this.state.configWakeUpTime,
                                            wakeUpPeriod: this.state.wakeUpPeriod,
                                            wakeUpPeriodUnits: this.state.wakeUpPeriodUnits,
                                            wakeUpDuration: this.state.wakeUpDuration,
                                            wakeUpDurationUnits: this.state.wakeUpDurationUnits,
                                            connectionDuration: this.state.connectionDuration,
                                            connectionDurationUnits: this.state.connectionDurationUnits,
                                            keepAlivePeriod: this.state.keepAlivePeriod,
                                            dataLostMaxDuration: this.state.dataLostMaxDuration,
                                            devRole: this.state.deviceRole ? 1 : 0,
                                            realTimeVisible: this.state.realTimeVisible?1:0,
                                            searchDevicesEnabled: this.state.searchDevicesEnabled ? 1 : 0,
                                            protocolVersion: this.state.protocolVersion ? 1 : 0,
                                            collectRetriesDelay: this.state.collectRetriesDelay ? this.state.collectRetriesDelay : 0.1
                                        };
                                    this.props.actions.fliwerDeviceActions.modifyConfiguration(this.state.idDevice,newConfig).then(() => {
                                        this.setModalConfigVisible(false, null);
                                        delete this.state.protocolVersion;
                                        delete this.state.wakeUpTime;
                                        delete this.state.wakeUpPeriod;
                                        delete this.state.wakeUpPeriodUnits;
                                        delete this.state.wakeUpDuration;
                                        delete this.state.wakeUpDurationUnits;
                                        delete this.state.connectionDuration;
                                        delete this.state.connectionDurationUnits;
                                        delete this.state.keepAlivePeriod;
                                        delete this.state.dataLostMaxDuration;
                                        delete this.state.devRole;
                                        delete this.state.realTimeVisible;
                                        delete this.state.searchDevicesEnabled;
                                        delete this.state.collectRetriesDelay;
                                        this.setState({ loading: false });
                                    }, (err) => {
                                        this.setState({ loading: false });
                                        toast.error(err)
                                    });
                                }
                            }} />
                    </ScrollView>
                </Modal>
            );
        }

    }

    renderModalDeviceSIMNumber() {

        return (
            <Modal animationType="fade" loadingModal={this.state.loading} inStyle={[this.style.modalIn]} visible={this.state.visibleModalDeviceSIMNumber} onClose={() => {
                this.setState({ visibleModalDeviceSIMNumber: false, modifiedSimNumber: null, idDevice: null })
            }}>
                <View style={[this.style.modalView]}>
                    <ScrollView scrollEventThrottle={1000} style={{ flexGrow: 0 }} contentContainerStyle={{ alignItems: "center", alignSelf: "center" }}>
                        <View style={{}}>
                            <View style={{ marginBottom: 12 }}>
                                <Text style={[this.style.textFormat, { textAlign: "center", fontSize: 16, fontWeight: "bold" }]}>{"Fliwer Link 3G"}</Text>
                            </View>
                            <View style={{ alignSelf: "center", width: "80%", marginBottom: 12 }}>
                                <Text style={[this.style.textFormat, { textAlign: "center" }]}>{this.props.actions.translate.get("sim_card_number")}</Text>
                            </View>
                        </View>
                        <View style={{ marginBottom: 12 }}>
                            <IconMaterialIcons name="sim-card" size={37} style={[{ color: FliwerColors.primary.black, alignSelf: "center" }, this.style.gpsIconTouchable]} />
                        </View>
                        <View style={{ marginBottom: 12 }}>
                            <TextInput
                                key={8010}
                                style={{ borderRadius: 25, borderColor: FliwerColors.secondary.green, paddingRight: 7, paddingLeft: 7, paddingTop: 6, paddingBottom: 6, borderWidth: 1, width: 237, alignItems: "center", textAlign: "center" }}
                                onChangeText={(text) => {
                                    var simNumber = text.trim();
                                    if (simNumber.length > 20) simNumber = simNumber.substr(0, 20);
                                    this.setState({ modifiedSimNumber: simNumber });
                                }}
                                value={this.state.modifiedSimNumber}
                                textContentType={"none"}
                                keyboardType={"default"}
                                returnKeyType={"done"}
                                multiline={false}
                                maxLength={20}
                            />

                        </View>
                        <FliwerGreenButton onPress={async () => {
                            await this.setDeviceSIMNumber(this.state.idDevice)
                        }} text={this.props.actions.translate.get("DeviceCard_button_save")} containerStyle={{ height: 33, marginTop: 10, marginBottom: 20, width: null, minWidth: 135 }} />
                    </ScrollView>
                </View>
            </Modal>
        );
    }

    renderModalUseApp() {
        var indents = []
        indents.push(
            <Modal animationType="fade" loadingModal={this.state.loading} inStyle={[this.style.modalIn, this.state.mediaStyle.orientation === "landscape" ? { maxWidth: 500 } : { maxWidth: "89%" }]} visible={this.state.visibleModalUseApp} onClose={() => {
                this.setState({ visibleModalUseApp: false })
            }}>
                <View style={[{ paddingTop: 25, paddingBottom: 10, paddingLeft: 20, paddingRight: 20 }]}>
                    <ScrollView scrollEventThrottle={1000} style={{ flexGrow: 0 }} contentContainerStyle={{ alignItems: "center", alignSelf: "center" }}>
                        <View style={{ alignItems: "center" }}>
                            <View style={{ marginBottom: 20, width: "66%" }}>
                                <Text style={[{ fontFamily: FliwerColors.fonts.title, color: FliwerColors.primary.black, textAlign: "center", fontSize: 18 }]}>{this.props.actions.translate.get("Devices_only_app")}</Text>
                            </View>
                            <View style={{ marginBottom: 20 }}>
                                <Image style={{ width: 55, height: 55 }} resizeMode={"contain"} draggable={false} source={ic_launcher} />
                            </View>
                            <View style={{ flexDirection: "row", width: "100%", justifyContent: "space-evenly" }}>
                                <View style={{ marginBottom: 12, alignSelf: "center", marginRight: 14 }}>
                                    <TouchableOpacity style={{}} onMouseEnter={this.hoverIn('iconAppStore')} onMouseLeave={this.hoverOut('iconAppStore')} onPress={() => {
                                        window.open("https://apps.apple.com/es/app/fliwer/id1120704069", "_blank")
                                    }}>
                                        <Image style={{ width: 120, height: 45 }} resizeMode={"contain"} draggable={false} source={applestore} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginBottom: 12, alignSelf: "center" }}>
                                    <TouchableOpacity style={{}} onMouseEnter={this.hoverIn('iconGooglePlay')} onMouseLeave={this.hoverOut('iconGooglePlay')} onPress={() => {
                                        window.open("https://play.google.com/store/apps/details?id=com.myfliwer", "_blank")
                                    }}>
                                        <Image style={{ width: 120, height: 45 }} resizeMode={"contain"} draggable={false} source={googleplay} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ marginBottom: 12 }}>
                                <Text style={[this.style.textFormat, { textAlign: "center", fontSize: 14 }]}>{this.props.actions.translate.get("Devices_setup_app")}</Text>
                            </View>
                        </View>
                        <FliwerGreenButton onPress={() => {
                            this.setState({ visibleModalUseApp: false })
                        }} text={this.props.actions.translate.get("Devices_button_close")} style={{ padding: 7, width: null }} containerStyle={{ height: 31, marginTop: 20, marginBottom: 11, width: null, minWidth: 135 }} />
                    </ScrollView>
                </View>
            </Modal>
        );
        return indents;
    }

    renderDevices(zone) {

        if(!zone)return null;

        var indents = [];
        var devices = Object.values(this.props.devices);
        devices = devices.filter((a) => {
            return !a.failed
        }).sort((a, b) => {
            if (a.failed && !b.failed)
                return -1;
            else if (a.type > b.type)
                return 1;
            else if (a.type < b.type)
                return -1;
            else
                return a.DeviceSerialNumber > b.DeviceSerialNumber ? 1 : -1
        });
        this._devicesInList = {};
        this.state.renderedDevices = [];
        for (var index in devices) {
            var device = devices[index];
            if (device.idImageDash && !device.idHome) {
                device.idHome = this.props.gardenData[device.idImageDash].idHome;
            }
            if ((device.type != "SENS" && device.type != "SENS_PRO") || device.idZone == zone.idZone || (device.zones && device.zones.find((z) => {
                return z.idZone == zone.idZone
            })) || !device.idZone) {
                if ((!device.idImageDash && !device.idHome) || device.idImageDash == zone.idImageDash || device.idHome == zone.idHome) {
                    if (this.props.devices[device.DeviceSerialNumber]) {
                        var idZoneDevices = this.props.devices[device.DeviceSerialNumber].zones ? this.props.devices[device.DeviceSerialNumber].zones : [];
                        if (idZoneDevices.length == 0 && this.props.devices[device.DeviceSerialNumber].idZone)
                            idZoneDevices.push({ idZone: this.props.devices[device.DeviceSerialNumber].idZone, loggerSensor: 0 });
                        this._devicesInList[device.DeviceSerialNumber] = { device: device, component: null };
                        if (indents.length == 0)
                            this._firstDeviceInList = device.DeviceSerialNumber;
                        indents.push(<DeviceCard
                            key={device.DeviceSerialNumber}
                            visibleModalUseApp={() => {
                                this.setState({ visibleModalUseApp: true })
                            }}
                            visibleModifyDeviceLocation={(v, idDevice) => this.setVisibleModifyDeviceLocation(v, idDevice)}
                            openLocationMaps={(lat, long) => {
                                FliwerCommonUtils.openLocationMaps(lat, long);
                            }}
                            devicesAsComponent={this.props.asComponent}
                            visibleModifyDeviceSIMNumber={(v, idDevice) => this.setVisibleModifyDeviceSIMNumber(v, idDevice)}
                            ref={this.bindRefToDeviceList(device.DeviceSerialNumber)}
                            idZone={zone.idZone}
                            idDevice={device.DeviceSerialNumber}
                            zoneDevices={idZoneDevices}
                            setLoading={this.setLoading()}
                            modalFunc={(v, p) => this.setModalVisible(v, p)}
                            deleteFunc = {(v, idDevice) => this.setDeleteModalVisible(true, idDevice)}
                            modalConfig={(v, p) => this.setModalConfigVisible(v, p)}
                            realTimeStartModal={(idDevice) => this.setRealTimeStartModal(true,idDevice)}
                            realTimeEndModal={(idDevice) => this.setRealTimeEndModal(true,idDevice)}
                            parentLoading={(value) => {
                                this.setState({ loading: value })
                            }}
                            gotoFunction={(idDevice) => {
                                this.goToDevice(idDevice)
                            }}
                            visibleBatteryModal={(v, idDevice) => this.setVisibleBatteryModal(v, idDevice)}
                            visibleRangeModal={(v, idDevice) => this.setVisibleRangeModal(v, idDevice)}
                            unfocused={(Platform.OS === 'web' && this.state.mapVisible && this.state.highlightedDeviceId && this.state.highlightedDeviceId != device.DeviceSerialNumber)}
                            onSelectUnfocused={(idDevice) => {
                                this.setState({ highlightedDeviceId: idDevice });
                            }}
                            realTimeVisualization={this.state.realTimeVisualization}
                            startTestModal={(idDevice,startFunction) => this.setState({startPingTestModal:startFunction,idDevice:idDevice})}
                        />);
                        this.state.renderedDevices.push(device);
                    }
                }
            }
        }

        // Add new card
        indents.push(<DeviceCard key={999}
            idZone={this.state.idZone}
            idDevice={null}
            touchableFront={false}
            onPressAdd={() => this.addDevices()}
        />);

        return indents;

    }

    setVisibleBatteryModal(visible, idDevice) {
        this.setState({ visibleBatteryModal: visible, idDevice: idDevice });
    }

    setVisibleRangeModal(visible, idDevice) {
        this.setState({ visibleRangeModal: visible, idDevice: idDevice });
    }

    renderBatteryModal() {
        if (!this.state.visibleBatteryModal)
            return null;

        var device = this.props.devices[this.state.idDevice];

        return (
            <BatteryModal
                onClose={() => {
                    this.setState({ visibleBatteryModal: false });
                }}
                loadingModal={this.state.loading}
                forcedMax={(device.type=="UNIPRO6" || device.type=="UNIPRO9" || device.type=="UNIPRO12" || device.type=="UNIPRO16" || device.type=="CONTROL_24")?13:null}
                forcedMin={(device.type=="UNIPRO6" || device.type=="UNIPRO9" || device.type=="UNIPRO12" || device.type=="UNIPRO16" || device.type=="CONTROL_24")?4.9:null}
                setLoading={this.setLoading()}
                idDevice={this.state.idDevice}
                batteryType={device.batteryType}
            />
        );
    }

    renderRangeModal() {
        if (!this.state.visibleRangeModal)
            return null;
        var device = this.props.devices[this.state.idDevice];

        return (
            <RangeModal
                onClose={() => {
                    this.setState({ visibleRangeModal: false });
                }}
                loadingModal={this.state.loading}
                setLoading={this.setLoading()}
                idDevice={this.state.idDevice}
            />
        )

    }

    renderRefreshDevicesButton() {
        return (
            <TouchableOpacity
                style={this.style.refreshDevices}
                activeOpacity={1}
                onMouseEnter={this.hoverIn('refreshDevices')}
                onMouseLeave={this.hoverOut('refreshDevices')} onPress={() => {
                    this.refreshDevices();
                }}>
                <Image style={this.style.refreshDevicesImg} resizeMode={"contain"} draggable={false} source={refreshButton} />
            </TouchableOpacity>
        );
    }

    realTimeVisualizationButton(){
        //only draw TouchableOpacity if fliwer role
        return (  this.props.sessionRoles.fliwer && 
            <TouchableOpacity
                style={this.style.realTimeVisualization}
                activeOpacity={1}
                onMouseEnter={this.hoverIn('realTimeVisualization')}
                onMouseLeave={this.hoverOut('realTimeVisualization')}
                onPress={() => {
                    this.setState({ realTimeVisualization: !this.state.realTimeVisualization });
                }}>
                <Fontisto name="flash" size={40} style={[{ textAlign:"center", alignSlef:"center",width:"100%"},{color: "white", alignSelf: "center"}]}/>
            </TouchableOpacity>
        );
    }

    renderDevicesMapButton() {

        var renderMapButton = false;

        for (var i = 0; i < this.state.renderedDevices.length; i++) {
            var device = this.state.renderedDevices[i];

            if (device.latitude && device.longitude) {
                renderMapButton = true;
                break;
            }
        }

        if (renderMapButton)
            return (
                <TouchableOpacity style={this.style.viewMap} activeOpacity={1} onMouseEnter={this.hoverIn('viewMap')} onMouseLeave={this.hoverOut('viewMap')}
                    onPress={() => {
                        this.setState({ mapVisible: !this.state.mapVisible, highlightedDeviceId: null, gotoDeviceFirstTime: false });
                    }}>
                    <Image style={{ width: "60%", height: "60%" }} resizeMode={"contain"} source={mapButton} />
                </TouchableOpacity>
            );
    }

    renderMap() {
        if (!this.state.mapVisible)
            return [];
        else {
            return (<DevicesMap key={11}
                devices={this.state.renderedDevices}
                onPress={(marker) => {
                    if (marker.id)
                        this.goToDevice(marker.id);
                }}
                highlightedId={this.state.highlightedDeviceId}
            />
            );
        }
    }

    async deleteDevice(password) {
        /* TODO
         this.props.actions.fliwerZoneActions.deleteZonePlant(this.state.idZone,this.state.idPlant).then(()=>{
         for(var i=0;i<this._cards.length;i++){
         if(this._cards[i] && this._cards[i].toggle)this._cards[i].toggle(false)()
         }
         this.setModalVisible(false);
         },(err)=>{
         if(err && err.reason)toast.error(err.reason);
         })
         */

        var device = this.props.devices[this.state.idDevice];
        this.setState({ loading: true })
        if (!device.failed) {
            await this.props.actions.fliwerDeviceActions.deleteDevice(this.state.idDevice, password).then(() => {
                this.setState({ modalVisible: false, loading: false, idDevice: null });
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
                this.setState({ loading: false })
            })
        } else {
            await this.props.actions.fliwerDeviceActions.deleteDeviceFailed(device.LinkSerialNumber, this.state.idDevice, password).then(() => {
                this.setState({ modalVisible: false, loading: false, idDevice: null });
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
                this.setState({ loading: false })
            })
        }
    }

    setModalVisible(visible, idDevice) {
        if (!visible)
            this.state.modalTitle = null;
        this.setState({ modalVisible: visible, idDevice: idDevice });
    }

    setModalConfigVisible(visible, idDevice) {

        delete this.state.configWakeUpTime
        delete this.state.wakeUpPeriod
        delete this.state.wakeUpPeriodUnits
        delete this.state.wakeUpDuration
        delete this.state.wakeUpDurationUnits
        delete this.state.connectionDuration
        delete this.state.connectionDurationUnits
        delete this.state.realTimeVisible
        delete this.state.keepAlivePeriod
        delete this.state.dataLostMaxDuration
        delete this.state.deviceRole
        delete this.state.searchDevicesEnabled
        if (!visible)
            this.state.modalTitle = null;
        this.setState({ modalConfig: visible, idDevice: idDevice });
    }

    setRealTimeStartModal(show,idDevice) {
        this.setState({ realTimeStartModal: show, idDevice: idDevice });
    }

    setRealTimeEndModal(show,idDevice) {
        this.setState({ realTimeEndModal: show, idDevice: idDevice });
    }

    addDevices() {
        if (this.props.isVisitor) {
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));

        } else {

            /*if (Platform.OS == "android" || Platform.OS == 'ios')
            {
                this.setState({addDevices: true})
            } else {
                this.setState({visibleModalUseApp: true})
                //toast.error(this.props.actions.translate.get('Devices_add_devices_app'));
            }*/
            this.setState({ addDevices: true })
        }
    }

    async refreshDevices() {
        //console.log("refreshing devices");
        this.setState({ refreshing: true });

        if(this.props.match.params.idZone){
            if(this.state.zone){
                await this.props.actions.fliwerDeviceActions.getDeviceList(null,this.state.zone.idHome).then(() => {
                    this.setState({ refreshing: false });
                }, (err) => {
                    if (err && err.reason)
                        toast.error(err.reason);
                })
            }
        }else{
            await this.props.actions.fliwerDeviceActions.getDeviceList().then(() => {
                this.setState({ refreshing: false });
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
            })
        }
    }

    bindRefToDeviceList(idDevice) {
        return (ref) => {
            if (this._devicesInList[idDevice]) {
                this._devicesInList[idDevice].component = ref ? ref : null;
            }
        }
    }

    goToDevice(idDevice) {
        var that = this;
        //check if the device is in this screen or not
        if (this._devicesInList[idDevice]) {
            if (Platform.OS === 'android' || Platform.OS == 'ios') {
                if (this._devicesInList[this._firstDeviceInList] && this._devicesInList[this._firstDeviceInList].component) {
                    this._devicesInList[this._firstDeviceInList].component.measure((first_a, first_b, first_width, first_height, first_px, first_py) => {
                        if (this._devicesInList[idDevice])
                            this._devicesInList[idDevice].component.measure((a, b, width, height, px, py) => {
                                this._scrollView.scrollTo({ x: 0, y: py - first_py, animated: true, duration: 1000 });
                                this.setState({ highlightedDeviceId: idDevice });
                            });
                    });
                }
            }
            else {
                if (this._devicesInList[idDevice] && this._devicesInList[idDevice].component) {
                    this._devicesInList[idDevice].component.measure((offsetXFrame, offsetYFrame, width, height, offsetXPage, offsetYPage) => {
                        //console.log("offsetXFrame, offsetYFrame, width, height, offsetXPage, offsetYPage", offsetXFrame, offsetYFrame, width, height, offsetXPage, offsetYPage)
                        //var scrollToY = offsetYFrame + 5; // Show card at top
                        var scrollToY = offsetYFrame;
                        if (this.state.devicesCanvasHeight)
                            scrollToY = scrollToY - (this.state.devicesCanvasHeight / 2) + (height / 2);
                        this._scrollView.scrollTo({ x: 0, y: scrollToY, animated: true, duration: 1000 });
                        this.setState({ highlightedDeviceId: idDevice }, () => {
                            if (!that.state.gotoDeviceFirstTime) {
                                that.state.gotoDeviceFirstTime = true;
                                that.goToDevice(idDevice)
                            }
                        });
                    });
                }
            }

        }

    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({ loading: loading });
        }
    }

    nextGarden = () => {

        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() < this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return -1;
            } else if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() > this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return 1;
            } else {

                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else
                    return 0
            }

            return 0;
        });

        var zonesTable = Object.values(sortedZones).map((k) => {
            return k.idZone
        })
        var foundZoneId = zonesTable.findIndex(element => element == this.props.match.params.idZone);

        if (foundZoneId + 1 >= zonesTable.length)
            this.state.foundZoneId = zonesTable[0];
        else
            this.state.foundZoneId = zonesTable[foundZoneId + 1];

        this.setState({ goNextGarden: true, mapVisible: false, highlightedDeviceId: null, gotoDeviceFirstTime: false });
    }

    previousGarden = () => {
        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() < this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return -1;
            } else if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() > this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return 1;
            } else {
                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else
                    return 0
            }

            return 0;
        });

        var zonesTable = Object.values(sortedZones).map((k) => {
            return k.idZone
        })
        var foundZoneId = zonesTable.findIndex(element => element == this.props.match.params.idZone);

        if (foundZoneId - 1 < 0)
            this.state.foundZoneId = zonesTable[zonesTable.length - 1];
        else
            this.state.foundZoneId = zonesTable[foundZoneId - 1];

        this.setState({ goNextGarden: true, mapVisible: false, highlightedDeviceId: null, gotoDeviceFirstTime: false });
    }

    async sendMailRequestDelete() {
        this.setState({ loading: true });
        await this.props.actions.fliwerZoneActions.sendMailRequestDelete({ DeviceSerialNumber: this.state.idDevice }).then(() => {
            this.setState({ loading: false });
            this.setModalVisible(false);
            toast.notification(this.props.actions.translate.get('RequestDelete_send'));
        }, (err) => {
            this.setState({ loading: false });
            if (err && err.reason)
                toast.error(err.reason);
        });

    }

    setVisibleModifyDeviceSIMNumber(visible, idDevice) {

        var modifiedSimNumber = null;
        if (visible && idDevice) {
            var device = this.props.devices[idDevice];
            modifiedSimNumber = (!device || !device.simNumber) ? "" : device.simNumber;
        }

        this.setState({ visibleModalDeviceSIMNumber: visible, idDevice: idDevice, modifiedSimNumber: modifiedSimNumber });
    }

    async setDeviceSIMNumber(idDevice) {
        this.setState({ loading: true });

        var data = {
            simNumber: (!this.state.modifiedSimNumber ? "" : this.state.modifiedSimNumber)
        };

        await this.props.actions.fliwerDeviceActions.modifyDevice(idDevice, data).then(async () => {
            this.setState({ loading: false, visibleModalDeviceSIMNumber: false, modifiedSimNumber: null, idDevice: null });
            //await this.refreshDevices();
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
            this.setState({ loading: false, visibleModalDeviceSIMNumber: false, modifiedSimNumber: null, idDevice: null });
        });

    }

    renderModalDeviceLocation() {

        if (!this.state.visibleModalDeviceLocation)
            return null;

        var device = this.props.devices[this.state.idDevice];
        var coords = "";
        if (device && device.latitude && device.longitude)
            coords = String(device.latitude).substring(0, 20) + "," + String(device.longitude).substring(0, 20);
        var coordsValue = this.state.coordsDevice ? this.state.coordsDevice.lat + "," + this.state.coordsDevice.long : coords;

        return (
            <FliwerLocationModal
                onClose={() => {
                    this.setState({ visibleModalDeviceLocation: false });
                }}
                onAccept={async (coords, accuracy, coordsData) => {

                    var data = {};
                    data.latitude = coordsData.lat;
                    data.longitude = coordsData.long;
                    //console.log("modifyDevice data", data);

                    this.setState({ loading: true })
                    await this.props.actions.fliwerDeviceActions.modifyDevice(this.state.idDevice, data).then(() => {
                        this.setState({ loading: false, visibleModalDeviceLocation: false, coordsDevice: null, idDevice: null })
                    }, (err) => {
                        if (err && err.reason)
                            toast.error(err.reason);
                        this.setState({ loading: false, visibleModalDeviceLocation: false, coordsDevice: null, idDevice: null })
                    });
                }}
                loadingModal={this.state.loading}
                setLoading={this.setLoading()}
                coords={coordsValue}
            />
        );
    }

    setVisibleModifyDeviceLocation(visible, idDevice) {
        this.setState({ visibleModalDeviceLocation: visible, idDevice: idDevice });
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        preloadedData: state.sessionReducer.preloadedData,
        loadedStorageData: state.sessionReducer.loadedStorageData,
        gardenerHomes: state.gardenerReducer.gardenerHomes,
        translation: state.languageReducer.translation,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        zoneData: state.fliwerZoneReducer.data,
        categories: state.fliwerPlantReducer.categories,
        devices: state.fliwerDeviceReducer.devices,
        lastUpdateDevices: state.fliwerDeviceReducer.devices.lastUpdate,
        loadingDevices: state.fliwerDeviceReducer.loading,
        isVisitor: state.sessionReducer.visitorCheckidUser,
        isGardener: state.sessionReducer.isGardener,
        sessionData: state.sessionReducer.data,
        petition: state.sessionReducer.petition,
        data: state.sessionReducer.data,
        deviceRealTimeInfo: state.fliwerDeviceReducer.deviceRealTimeInfo,
        sessionRoles: state.sessionReducer.roles
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
            fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
            fliwerVisitorActions: bindActionCreators(ActionVisitor, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch)
        }
    };
}

//Connect everything

var styles = {
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        maxWidth: "83%",
        overflow: "hidden",
    },
    modalView: {
        paddingTop: 25,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
    },
    mapContainer: {
        position: 'absolute',
        top: 40,
        bottom: "50%",
        width: "100%"
    },
    mapListContainerSeparator: {
        position: "absolute",
        top: "50%",
        marginTop: -20,
        width: "100%",
        height: 40,
        cursor: "pointer"
    },
    mapListContainerSeparatorLine: {
        position: "absolute",
        top: "50%",
        marginTop: -1,
        width: "100%",
        height: 2,
        backgroundColor: FliwerColors.primary.gray
    },
    mapListContainerSeparatorCircle: {
        position: "absolute",
        left: "50%",
        marginLeft: -20,
        height: 40,
        width: 40,
        backgroundColor: FliwerColors.primary.gray,
        borderRadius: 45,
        elevation: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    mapListContainerSeparatorText: {
        color: "white",
        WebkitUserSelect: "none",
        userSelect: "none",
        fontSize: 26
    },
    viewMap: {
        position: "absolute",
        backgroundColor: FliwerColors.primary.gray,
        //bottom: 140, // Old (Above the old academy button)
        bottom: 65,
        left: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        justifyContent: "center"
    },
    refreshDevices: {
        position: "absolute",
        bottom: 65,
        right: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        //        borderColor: FliwerColors.secondary.white,
        //        backgroundColor: FliwerColors.secondary.green,
        backgroundColor: FliwerColors.primary.gray,
        borderColor: FliwerColors.secondary.white

    },
    refreshDevicesImg: {
        color: "white",
        flex: 1,
        width: "47%",
        height: "47%",
        textAlign: "center",
    },
    realTimeVisualization: {
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
    collection: {
        marginBottom: 85
    },
    textFormat: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
    },
    configModalBoxPair: {
        marginTop: 20,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    configModalBoxPairInside:{
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    ":hover": {
        gpsIconTouchable: {
            filter: "contrast(50%)"
        },
        refreshDevices: {
            filter: "brightness(120%)"
        },
        realTimeVisualization:{
            filter: "brightness(120%)"
        },
        viewMap: {
            backgroundColor: "#D1D1D1"
        }
    },
    "@media (orientation: portrait)": {
        configModalBoxPair: {
            flexDirection: "column",
            alignItems: "flex-start"
        },
        configModalBoxPairInside:{
            width: "100%"
        }
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, Devices));
