'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Platform,
    BackHandler,
    TouchableOpacity
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading'
import ZoneTopBar from '../../components/zones/zoneTopBar.js'
import AlertCard from '../../components/zones/alertCard.js'
import MeteoCard from '../../components/zones/meteoCard.js'
import ChartCard from '../../components/charts/chartCard.js'
import GenericBarChartCard from '../../components/charts/genericBarChartCard.js'
import FlowChartCard from '../../components/charts/flowChartCard.js'
import IrrigationListCard from '../../components/history/irrigationListCard.js'
import ParamCard from '../../components/zones/paramCard.js'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'
import Modal from '../../widgets/modal/modal'
import { FliwerColors } from '../../utils/FliwerColors'
import DatePicker from '../../widgets/datePicker/datePicker';
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import { toast } from '../../widgets/toast/toast'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import { mediaConnect } from '../../utils/mediaStyleSheet.js';
import { Orientation } from '../../utils/orientation/orientation';
import { Redirect, withRouter } from '../../utils/router/router';

import moment from 'moment';

import background from '../../assets/img/zoneBackground.jpg'

class Zone extends Component {
    constructor(props) {
        super(props);
        var e = this.props.match.params.filter;
        
        this.state = {
            loading: false,
            loadingIrrigationList: false,
            idZone: this.props.match.params.idZone,
            idAdvice: null,
            filter: (this.props.match.params.filter ? this.props.match.params.filter : "soilm"),
            filter2: (this.props.match.params.filter ? (e == 'airh' ? 'hum' : (e == 'soilm' ? 'water' : e)) : "water"),
            filter3: (this.props.match.params.filter ? this.typeToFilter3(e) :  this.typeToFilter3("soilm")),
            modalVisible: false,
            modalVisibleQuestion: false,
            fullScreenChart: false,
            fullScreenFlowChart: false,
            fullScreenIrrigationDataChart: false,
            fromChart: null,
            containerHeight: null,
            chartPositionInfo: null,
            flowChartPositionInfo: [],
            indexFullScreenFlowChart: null,
            foundZoneId: null,
            goNextGarden: false,
            modalDownloadVisible: false,
            modalDownloadFlowVisible: false,
            downloadStart: null,
            downloadEnd: null,
            modalCalibrationVisible: false,
            calibrationData: null,

            disableLight: null,
            disableTemp: null,
            disableAirHum: null,
            disableFertilizer: null,
            disableWater: null
        };

        this.updateFilter = this.updateFilter.bind(this);

    }

    componentDidMount() {
        if (Platform.OS == "android") {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        }
        // Llamamos a la función de carga de datos aquí
        this.loadZoneData(this.props.match.params.idZone);
    }

    // Centralizamos la lógica de carga
    loadZoneData = (idZone) => {
        this.props.actions.fliwerZoneActions.getOneZone(idZone).finally(() => {
            this.props.actions.fliwerZoneActions.getZoneData(idZone, this.state.fromChart).then((zone) => {
                const hasSensor_Pro = this.hasSensorPro();
                
                // Usamos setState para actualizar el estado
                const newState = {
                    disableLight: zone.enableLightParam == null ? hasSensor_Pro : !zone.enableLightParam,
                    disableTemp: zone.enableTempParam == null ? hasSensor_Pro : !zone.enableTempParam,
                    disableAirHum: zone.enableAirHumParam == null ? hasSensor_Pro : !zone.enableAirHumParam,
                    disableFertilizer: zone.enableFertilizerParam == null ? hasSensor_Pro : !zone.enableFertilizerParam,
                    disableWater: zone.enableWaterParam == null ? false : !zone.enableWaterParam
                };
                
                this.setState(newState, () => {
                    // ¡Lógica corregida! Solo actualiza el filtro si no se proporcionó uno.
                    if (!this.props.match.params.filter) {
                        let defaultFilter = "maint";
                        if (!this.state.disableWater) defaultFilter = "soilm";
                        else if (!this.state.disableLight) defaultFilter = "light";
                        else if (!this.state.disableTemp) defaultFilter = "temp";
                        else if (!this.state.disableAirHum) defaultFilter = "airh";
                        else if (!this.state.disableFertilizer) defaultFilter = "fert";
                        
                        this.updateFilter(defaultFilter);
                    }
                });
            });
        });
    }

    rerenderParentCallback() {
        this.props.actions.fliwerZoneActions.getZoneData(this.state.idZone, this.state.fromChart).then(() => {
            this.state.zone=null;
            this.forceUpdate();
        });
        //this.forceUpdate();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.match.params.idZone != nextProps.match.params.idZone) {
            // Reutilizamos la lógica de carga
            this.loadZoneData(nextProps.match.params.idZone);
            this.setState({ idZone: nextProps.match.params.idZone }); // Actualiza el idZone en el estado
        }
        if(this.props.match.params.filter != nextProps.match.params.filter) {
            this.updateFilter(nextProps.match.params.filter);
        }
        return !(JSON.stringify(this.props) == JSON.stringify(nextProps) && JSON.stringify(this.state) == JSON.stringify(nextState)); 
    }

    componentWillMount() {
        this.measureView();
    }

    componentWillUnmount = () => {
        if (Platform.OS == "android")
            this.backHandler.remove();
    };

    handleBackPress = () => {
        Orientation.unlockAllOrientations(this);
        if (this.state.fullScreenChart || this.state.fullScreenFlowChart || this.state.fullScreenIrrigationDataChart) {
            this.setState({ fullScreenChart: false, fullScreenFlowChart: false, fullScreenIrrigationDataChart: false });
            return true;
        }
        else
            return false;
    }

    measureView() {
        if (this._container) {
            this._container.measure((ox, oy, width, height, px, py) => {
                this.setState({ containerHeight: height });
            })
        }
    }

    setModalVisibleSure(visible, id) {
        this.setState({ modalVisible: visible });
        this.setState({ idAdvice: id });
    }

    setModalVisibleQuestion(visibleQuestion, visibleSure, zone) {
        if (this.state.idAdvice) {
            var advice = zone.advices.find((i) => {
                return i.id === this.state.idAdvice
            })
            if (!advice)
                var advice = zone.alerts.find((i) => {
                    return i.id === this.state.idAdvice
                })

            if (advice.question) {
                this.setState({ modalVisibleQuestion: visibleQuestion });
                this.setState({ modalVisible: visibleSure });
            } else {
                this.setState({ modalVisibleQuestion: false });
                this.setState({ modalVisible: false });
                this.deleteAlert(advice.buttons[0], this.isAdvice(zone).isAdvice);
            }
        }
    }

    isAdvice(zone) {
        var advice = zone.advices.find((i) => {
            return i.id === this.state.idAdvice
        })

        if (!advice) {
            advice = zone.alerts.find((i) => {
                return i.id === this.state.idAdvice
            })
            advice.isAdvice = false;
        } else {
            advice.isAdvice = true;
        }
        return advice;
    }

    deleteAlert(advice, isAdvice) {
        this.setState({ loading: true })
        //debugger;
        this.props.actions.fliwerZoneActions.deleteAlert(this.state.idZone, this.state.idAdvice, advice, isAdvice, this.state.filter).then(() => {
            this.setState({ modalVisibleQuestion: false, modalVisible: false, loading: false, idAdvice: null });
        }, (err) => {
            this.setState({ loading: false })
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    typeToFilter3(type) {
        switch (type) {
            case "temp":
                type = "temperature";
                break;
            case "airh":
                type = "humidity";
                break;
            case "soilm":
                type = "soil_moisture";
                break;
            case "fert":
                type = "fertilizer";
                break;
            case "maint":
                type = "maintenance";
                break;
            case "light":
                type = "light";
                break;
            case "anemometer":
                type = "anemometer";
                break;
            case "pluviometer":
                type = "pluviometer";
                break;
        }
        return type;
    }

    updateFilter(e) {
        //console.log("updateFilter", e);
        this.setState({
            filter: e,
            filter2: e == 'airh' ? 'hum' : (e == 'soilm' ? 'water' : e),
            filter3: this.typeToFilter3(e)
        })
    }

    getData(type, filter, idDevice, isZone) {
        var zone = this.props.zoneData[this.state.idZone];
        //console.log("getData zone", zone);
        var data = [];
        var filter2;
        var title;
        switch (filter) {
            case "light":
                if (type == 1)
                    data.push(zone.data.light);
                else
                    data.push(zone.data.light_inst);
                title = this.props.actions.languageActions.get('fliwerCard_light_plot_title');
                break;
            case "temp":
                if (type == 1)
                    data.push(zone.data.temp);
                title = this.props.actions.languageActions.get('fliwerCard_temp_plot_title');
                break;
            case "airh":
                if (type == 1)
                    data.push(zone.data.hum);
                else
                    data.push(zone.data.hum_inst);
                filter2 = 'airh';
                title = this.props.actions.languageActions.get('fliwerCard_hum_plot_title');
                break;
            case "soilm":
                if (type == 1)
                    data.push(zone.data.water);
                if (type == 1 && zone.data.water2 && zone.data.water2.length > 0)
                    data.push(zone.data.water2);
                //if(type==1 && zone.data.water3 && zone.data.water3.length>0)data.push(zone.data.water3);
                if (data.length > 1)
                    title = [this.props.actions.languageActions.get('fliwerCard_water_plot_title') + " 1", this.props.actions.languageActions.get('fliwerCard_water_plot_title') + " 2", this.props.actions.languageActions.get('fliwerCard_water_plot_title') + " 3"];
                else
                    title = this.props.actions.languageActions.get('fliwerCard_water_plot_title');
                break;
            case "fert":
                if (type == 1)
                    data.push(zone.data.fert);
                title = this.props.actions.languageActions.get('fliwerCard_fert_plot_title');
                break;
            case "flow":
                for (var i = 0; i < zone.data.flow.length; i++)
                    if ((!idDevice || idDevice == zone.data.flow[i].DeviceSerialNumber) && (!isZone || zone.data.flow[i].zoneData))
                        data.push(Object.assign({}, zone.data.flow[i]));
                title = this.props.actions.languageActions.get('fliwerCard_flow_plot_title');
                break;
            case "pluviometer":
                for (var i = 0; i < zone.data.pluviometer.length; i++)
                if ((!idDevice || idDevice == zone.data.pluviometer[i].DeviceSerialNumber) && (!isZone || zone.data.pluviometer[i].zoneData))
                    data.push(zone.data.pluviometer[i].data);
                filter2 = 'pluviometer';
                /*
                for (var i = 0; i < zone.data.pluviometer.length; i++)
                    if ((!idDevice || idDevice == zone.data.pluviometer[i].DeviceSerialNumber) && (!isZone || zone.data.pluviometer[i].zoneData))
                        data.push(Object.assign({}, zone.data.pluviometer[i]));
                */
                title = this.getReedSensorName(filter);
                break;
            case "anemometer":                
                for (var i = 0; i < zone.data.anemometer.length; i++)
                if ((!idDevice || idDevice == zone.data.anemometer[i].DeviceSerialNumber) && (!isZone || zone.data.anemometer[i].zoneData))
                    data.push(zone.data.anemometer[i].data);
                filter2 = 'anemometer';
                /*
                for (var i = 0; i < zone.data.anemometer.length; i++)
                    if ((!idDevice || idDevice == zone.data.anemometer[i].DeviceSerialNumber) && (!isZone || zone.data.anemometer[i].zoneData))
                        data.push(Object.assign({}, zone.data.anemometer[i]));
                */
                title = this.getReedSensorName(filter);
                break;
            case "evapotranspiration":
                if (!zone.data.evapotranspiration || !zone.data.evapotranspiration.value) return null;
                data = { title: this.props.actions.languageActions.get('fliwerCard_eto'), units: zone.data.evapotranspiration.units, value: zone.data.evapotranspiration.value };
                return data;
                break;
            case "dewpoint":
                if (!zone.data.dewpoint || !zone.data.dewpoint.value) return null;
                data = { title: this.props.actions.languageActions.get('fliwerCard_dw'), units: zone.data.dewpoint.units, value: zone.data.dewpoint.value };
                return data;
                break;
            default:
                data.push(zone.data.light);
                title = this.props.actions.languageActions.get('fliwerCard_light_plot_title');
                break;
        }
        for (var i = 0; i < data.length; i++) {
            if (filter == "flow") {
                var units = this.getReedSensorUnits(filter);
                data[i].data = [data[i].data.map((e) => {
                    e.units = units;
                    e.title = (typeof title === "string" ? title : title[i]);
                    return e;
                })]
            } else {
                var f = (filter == "anemometer" || filter == "pluviometer") ? "meteo" : filter;
                data[i] = data[i].map((e) => {
                    let units = (filter == "evapotranspiration") ? "" : zone.genericInfo.sensors[f].units;
                    e.units = units;
                    e.title = (typeof title === "string" ? title : title[i]);
                    return e;
                });
            }
        }
        return data;
    }

    getReedSensorName(type, isInfo) {
        var name;
        switch (type) {
            case "pluviometer":
                if (isInfo)
                    name = this.props.actions.languageActions.get('deviceCard_pluviometer_info');
                else
                    name = this.props.actions.languageActions.get('deviceCard_pluviometer');
                break;
            case "anemometer":
                if (isInfo)
                    name = this.props.actions.languageActions.get('deviceCard_anemometer_info');
                else
                    name = this.props.actions.languageActions.get('deviceCard_anemometer');
                break;
            default:
                if (isInfo)
                    name = this.props.actions.languageActions.get('deviceCard_flowmeter_info');
                else
                    name = this.props.actions.languageActions.get('deviceCard_flowmeter');
                break;
        }
        return name;
    }

    getReedSensorUnits(type) {
        var units;
        switch (type) {
            case "pluviometer":
                units = "L/mÂ²";
                //units = "mm";
                break;
            case "anemometer":
                units = "Km/h";
                break;
            default:
                units = "L";
                break;
        }
        return units;
    }

    getMoreData(from, to) {
        return new Promise((resolve, reject) => {
            this.setState({ loading: true })
            this.props.actions.fliwerZoneActions.getZoneMoreData(this.state.idZone, from, to).then(() => {
                this.setState({ loading: false, fromChart: from })
                resolve();
            }, (error) => {
                reject(error)
            })
        })
    }

    async downloadData() {
        this.setState({ loading: true });
        await this.props.actions.fliwerZoneActions.getZoneDataCSV(this.state.idZone, this.state.downloadStart / 1000, this.state.downloadEnd / 1000).then(() => {
            this.setState({ loading: false })
        }, (error) => {
        })
    }

    async downloadFlowData(){
        this.setState({ loading: true });
        await this.props.actions.fliwerZoneActions.getZoneFlowDataCSV(this.state.idZone, this.state.downloadStart / 1000, this.state.downloadEnd / 1000).then(() => {
            this.setState({ loading: false })
        }, (error) => {
        })
    }

    onChartMovePosition(info) {
        //console.log("PAU INFO",info)
        this.setState({ chartPositionInfo: info })
    }
    onFlowChartMovePosition(i, info) {
        var positionInfo = this.state.flowChartPositionInfo.concat([])
        positionInfo[i] = info;
        //console.log("NEW FLOWCHART POSITION INFO",info,new Date(info.from),positionInfo)
        this.setState({ flowChartPositionInfo: positionInfo })
    }

    getActualValue(filter) {
        var zone = this.props.zoneData[this.state.idZone];
        filter = filter ? filter : this.state.filter;
        var value = 0;
        if (filter == 'light')
            value = (parseInt((zone.genericInfo.sensors.light.value ? zone.genericInfo.sensors.light.value : (zone.data && zone.data.light_inst.length > 0 ? zone.data.light_inst[zone.data.light_inst.length - 1].value : 0)) * 100) / 100);
        else if (filter == 'airh')
            value = (parseInt((zone.genericInfo.sensors.airh.value ? zone.genericInfo.sensors.airh.value : (zone.data && zone.data.hum_inst.length > 0 ? zone.data.hum_inst[zone.data.hum_inst.length - 1].value : 0)) * 100) / 100);
        else if (filter == 'fert')
            value = parseInt((zone.data && zone.data.fert.length > 0 ? zone.data.fert[zone.data.fert.length - 1].value : 0) * 100) / 100;
        else
            value = zone.genericInfo.sensors[filter].value;
        return value;
    }

    hasSensorPro(reedSensorType) {
        var hasSensorPro = false;
        var devices = Object.values(this.props.devices);
        if (devices) {
            for (var index in devices) {
                var device = devices[index];
                //console.log("els tipus son: " +index+ "->" +device.type +" idzone->" + device.idZone);
                if (device.type == "SENS_PRO" && device.idZone == this.state.idZone) {
                    if (!reedSensorType)
                        hasSensorPro = true;
                    else if (reedSensorType == device.reedSensorType)
                        hasSensorPro = true;
                }
            }
        }
        return hasSensorPro;
    }

    setFullScreenChart(fullscreen) {
        if (fullscreen) {
            this.setState({ fullScreenChart: true, fullScreenFlowChart: false, fullScreenIrrigationDataChart: false })
            Orientation.lockToLandscape(this);
        } else {
            this.setState({ fullScreenChart: false, fullScreenFlowChart: false, fullScreenIrrigationDataChart: false })
            Orientation.unlockAllOrientations(this);
        }
    }

    setFullScreenFlowChart(idDevice, i) {
        if (idDevice) {
            this.setState({ fullScreenChart: false, fullScreenIrrigationDataChart: false, fullScreenFlowChart: idDevice, indexFullScreenFlowChart: i })
            Orientation.lockToLandscape(this);
        } else {
            this.setState({ fullScreenChart: false, fullScreenIrrigationDataChart: false, fullScreenFlowChart: null, indexFullScreenFlowChart: null })
            Orientation.unlockAllOrientations(this);
        }
    }

    setFullScreenIrrigationDataChart(fullscreen) {
        if (fullscreen) {
            this.setState({ fullScreenChart: false, fullScreenFlowChart: false, fullScreenIrrigationDataChart: true })
            Orientation.lockToLandscape(this);
        } else {
            this.setState({ fullScreenChart: false, fullScreenFlowChart: false, fullScreenIrrigationDataChart: false })
            Orientation.unlockAllOrientations(this);
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

        this.setState({ goNextGarden: true });
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

        this.setState({ goNextGarden: true });
    }

    render() {
        if (this.state.goNextGarden) {
            this.state.goNextGarden = false;
            return (<Redirect push to={"/zone/" + this.state.foundZoneId} />)
        } else {
            if ((!this.props.preloadedData /*&& !this.props.loadedStorageData*/) || this.props.zoneLoadingData) {
                var title = "";
                var zone = this.props.zoneData[this.state.idZone];
                if (zone && zone.idImageDash) {
                    var garden = this.props.gardenData[zone.idImageDash];
                    if (garden) {
                        var home = this.props.homeData[garden.idHome];
                        if (home)
                            title = home.name + " - " + zone.name;
                    }
                }

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener)
                    bottomIcons.push("gardener");
                bottomIcons.push("zone", "files");

                return (
                    <ImageBackground source={background} resizeMode={"cover"}>
                        {
                            !this.props.asComponent?[
                                (<MainFliwerTopBar showTextBar={true} title={title} />),
                                (<MainFliwerMenuBar idZone={this.state.idZone} current={"params"} icons={topIcons} position={"top"} />)
                            ]
                            :null
                        }
                        <FliwerLoading />
                        <View style={{ width: "100%", flex: 1 }}></View>
                        {
                            !this.props.asComponent?(<MainFliwerMenuBar idZone={this.state.idZone} current={"params"} icons={bottomIcons} />):null
                        }
                    </ImageBackground>
                );
            } else {

                if(!this.state.zone || !this.state.zone.data || !this.state.home || this.state.zone.idZone != this.state.idZone){
                    var zoneGardenHome=this.props.actions.fliwerZoneActions.getZoneGardenHome(this.state.idZone);
                    this.state.zone=zoneGardenHome.zone;
                    this.state.garden=zoneGardenHome.garden;
                    this.state.home=zoneGardenHome.home;
                }

                var loadingIrrigationList = false;

                /*
                var meteoTime;
                if (home.meteo && home.meteo.icon) {
                    var date = new Date(home.meteo.lastMeteoUpdateTime * 1000);
                    meteoTime = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
                }*/

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener) {
                    bottomIcons.push("gardener");
                    loadingIrrigationList = this.state.loadingIrrigationList;
                }
                bottomIcons.push("zone", "files");

                var zones = Object.values(this.props.zoneData);

                return (
                    <ImageBackground source={background/*{uri:garden.imageName?garden.imageName:home.imageName}*/} resizeMode={"cover"} style={this.style.background} loading={this.state.loading || loadingIrrigationList}>
                        {Platform.OS === 'ios' ? <View style={{ width: "100%", height: 45, backgroundColor: FliwerColors.primary.green }}></View> : null}
                        {
                            !this.props.asComponent?[
                                (<MainFliwerTopBar showTextBar={true} mode={'zone'} title={this.state.home.name + " - " + this.state.zone.name} onPressNextGarden={zones.length > 1 ? this.nextGarden : null} onPressPreviousGarden={zones.length > 1 ? this.previousGarden : null} />),
                                (<MainFliwerMenuBar idZone={this.state.idZone} current={"params"} icons={topIcons} position={"top"} />)
                            ]:(<MainFliwerTopBar showTextBar={true} hideMainBar={true} mode={'zone'} title={(this.state.home?this.state.home.name + " - ":"") + (this.state.zone?this.state.zone.name:"")} onPressNextGarden={false} onPressPreviousGarden={false} />)
                        }
                        <ScrollView scrollEventThrottle={1000} contentContainerStyle={this.style.scrollView} style={this.style.scrollView}>
                            <ZoneTopBar idZone={this.state.idZone}
                                disableLight={this.state.disableLight}
                                disableTemp={this.state.disableTemp}
                                disableAirh={this.state.disableAirHum}
                                disableFert={this.state.disableFertilizer}
                                disableSoilm={this.state.disableWater}
                                updateFilter={this.updateFilter}
                                filter={this.state.filter}>
                                <View style={this.style.infoContainer} ref={(v) => {
                                    this._container = v;
                                }} onLayout={() => {
                                    this.measureView();
                                }}>
                                    {this.renderParamsLandscape(this.state.zone)}
                                    <CardCollection ownScroll={true} style={this.style.cardCollection} cardView={this.style.cardCollectionCardView}>
                                        {this.renderAlerts(this.state.zone)}
                                    </CardCollection>
                                </View>
                            </ZoneTopBar>
                        </ScrollView>
                        {
                            !this.props.asComponent?(<MainFliwerMenuBar idZone={this.state.idZone} current={"params"} icons={bottomIcons} />):null
                        }
                        {this.renderModal(this.state.zone)}
                        {this.renderModalDownload(this.state.zone)}
                        {this.renderModalQuestion(this.state.zone)}
                        {this.renderFullScreenChart(this.state.zone)}
                        {this.renderModalCalibration(this.state.zone)}
                    </ImageBackground>
                );

            }
        }
    }

    renderModal(zone) {
        return (
            <Modal animationType="fade" inStyle={this.style.modalIn} visible={this.state.modalVisible} onClose={() => {
                this.setModalVisibleSure(!this.state.modalVisible);
            }}>
                <View style={this.style.modalView}>
                    <Text style={this.style.modalViewTitle}>{this.props.actions.languageActions.get('masterVC_advice_remove_title')}</Text>
                    <Text style={this.style.modalViewSubtitle}>{this.props.actions.languageActions.get('general_sure')}</Text>
                    <View style={[this.style.modalButtonContainer, { width: "100%" }]}>
                        <TouchableOpacity style={[this.style.modalButton, this.style.modalButton1]} onMouseEnter={this.hoverIn('modalButton1')} onMouseLeave={this.hoverOut('modalButton1')} onPress={() => {
                            this.setModalVisibleSure(false);
                        }}>
                            <Text style={[this.style.modalButtonText, this.style.modalButtonTextNo]}>{this.props.actions.languageActions.get('general_no')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[this.style.modalButton, this.style.modalButton2]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')} onPress={() => {
                            this.setModalVisibleQuestion(true, false, zone);
                        }}>
                            <Text style={[this.style.modalButtonText, this.style.modalButtonTextYes]}>{this.props.actions.languageActions.get('general_yes')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    renderModalQuestion(zone) {
        if (this.state.idAdvice) {
            var advice = this.isAdvice(zone);
            if (advice.question) {
                return (
                    <Modal animationType="fade" inStyle={this.style.modalIn} visible={this.state.modalVisibleQuestion} onClose={() => {
                        this.setModalVisibleQuestion(false, false, zone);
                    }}>
                        <View style={this.style.modalView}>
                            <Text style={this.style.modalViewTitle}>{advice.question}</Text>
                            <View style={this.style.modalButtonContainer}>
                                <TouchableOpacity style={[this.style.modalButton, this.style.modalButton1]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton1')} onPress={() => {
                                    this.setModalVisibleQuestion(false, true, zone);
                                }}>
                                    <Text style={[this.style.modalButtonText, this.style.modalButtonTextCancel]}>{this.props.actions.languageActions.get('general_cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[this.style.modalButton, this.style.modalButton1]} onMouseEnter={this.hoverIn('modalButton1')} onMouseLeave={this.hoverOut('modalButton1')} onPress={() => {
                                    this.deleteAlert(advice.buttons[1], advice.isAdvice)
                                }}>
                                    <Text style={[this.style.modalButtonText, this.style.modalButtonTextNo]}>{this.props.actions.languageActions.get('general_no')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[this.style.modalButton, this.style.modalButton2]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')} onPress={() => {
                                    this.deleteAlert(advice.buttons[0], advice.isAdvice)
                                }}>
                                    <Text style={[this.style.modalButtonText, this.style.modalButtonTextYes]}>{this.props.actions.languageActions.get('general_yes')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )
            }
        }
    }

    renderModalDownload(zone) {
        if (this.state.modalDownloadVisible || this.state.modalDownloadFlowVisible) {
            return (
                <Modal animationType="fade" inStyle={this.style.modalIn} visible={(this.state.modalDownloadVisible || this.state.modalDownloadFlowVisible)} onClose={() => {
                    this.setState({ modalDownloadVisible: false,modalDownloadFlowVisible:false, downloadStart: null, downloadEnd: null })
                }}>
                    <View style={this.style.modalView}>
                        <Text style={this.style.modalViewTitle}>{this.props.actions.languageActions.get("downloadData_title")}</Text>

                        <View style={this.style.datePickerContainer}>
                            <Text pointerEvents="none" style={[this.style.datePickerContainerText, Platform.OS === 'ios' ? { marginTop: 12 } : {}]}>{this.props.actions.languageActions.get("general_from")}</Text>
                            <View style={this.style.datePickerContainerIn}>
                                <Text pointerEvents="none" style={this.style.datePickerText}>{moment(this.state.downloadStart).format('LLL')}</Text>
                                <DatePicker ref={(datepicker) => this._datepicker = datepicker} date={moment(this.state.downloadStart).toDate()} mode="datetime" showYearDropdown={true} style={this.style.datePicker} customStyles={{ dateInput: this.style.datePicker, dateText: this.style.datePickerText }} onChange={(time) => {
                                    this.setState({ downloadStart: time })
                                }} />
                            </View>
                        </View>
                        <View style={this.style.datePickerContainer}>
                            <Text pointerEvents="none" style={[this.style.datePickerContainerText, Platform.OS === 'ios' ? { marginTop: 12 } : {}]}>{this.props.actions.languageActions.get("general_to")}</Text>
                            <View style={this.style.datePickerContainerIn}>
                                <Text pointerEvents="none" style={this.style.datePickerText}>{moment(this.state.downloadEnd).format('LLL')}</Text>
                                <DatePicker ref={(datepicker) => this._datepicker = datepicker} date={moment(this.state.downloadEnd).toDate()} mode="datetime" showYearDropdown={true} style={this.style.datePicker} customStyles={{ dateInput: this.style.datePicker, dateText: this.style.datePickerText }} onChange={(time) => {
                                    this.setState({ downloadEnd: time })
                                }} />
                            </View>
                        </View>

                        <FliwerGreenButton text={this.props.actions.languageActions.get("downloadData_button")} containerStyle={this.style.datePickerButton} onPress={async () => {
                            if(this.state.modalDownloadVisible)await this.downloadData()
                            else await this.downloadFlowData();
                        }} />
                    </View>
                </Modal>
            )
        }
    }

    renderModalCalibration(zone) {
        if (this.state.modalCalibrationVisible) {
            if(this.state.calibrationData.from==this.state.calibrationData.to)this.state.calibrationData.to=null;
            var text;
            if(this.state.calibrationData.to)text="Calibration period will be between "+moment(this.state.calibrationData.from*1000).format('LLL')+" and "+ moment(this.state.calibrationData.to*1000).format('LLL')+". Do you want to continue?"
            else text="Calibration time will be from "+moment(this.state.calibrationData.from*1000).format('LLL')+". Do you want to continue?"

            return (
                <FliwerDeleteModal
                visible={this.state.modalCalibrationVisible}
                onClose={() => {
                    
                    if(this._chartCard.resetCalibration)this._chartCard.resetCalibration()
                    if(this._chartCardFullSCreen && this._chartCardFullSCreen.resetCalibration)this._chartCardFullSCreen.resetCalibration()
                    this.setState({modalCalibrationVisible: false});
                }}
                onConfirm={() => {
                    this.setState({ loading: true });
                    this.props.actions.fliwerZoneActions.updateReplantTime(zone.idZone,this.state.calibrationData.from,this.state.calibrationData.to).then(() => {
                        this.props.actions.fliwerZoneActions.getZoneData(zone.idZone, this.state.fromChart).then(() => {
                            this.setState({ modalCalibrationVisible: false, loading: false, zone:null })
                        });
                    },(err)=>{
                        this.setState({ loading: false }); 
                        if (err && err.reason)
                            toast.error(err.reason);
                    })

                }}
                title={"Change calibration period"}
                subtitle={true}
                text={text}
                hiddeText={false}
                password={false}
                loadingModal={false}
                />
            )

        }
    }

    renderParamsLandscape(zone) {
        var indents = [];
        if (this.state.mediaStyle.orientation == "landscape" && zone && zone.data && this.state.filter != "maint") {

            var renderParamCard = true;
            var renderGenericBarCard = false;

            var filter = this.state.filter;
            var filter2 = this.state.filter2;
            var filterSensor = this.state.filter;
            var units;
            var title = null;
            var evapotranspiration = null, dewpoint = null;
            if (this.state.filter == "meteo") {
                var hasAnemometer = zone.data && zone.data.anemometer && zone.data.anemometer.length //this.hasSensorPro("anemometer");
                var hasPluviometer = zone.data && zone.data.pluviometer && zone.data.pluviometer.length //this.hasSensorPro("pluviometer");
                if (hasAnemometer || hasPluviometer) {
                    if (hasAnemometer) {
                        filter = "anemometer";
                        filter2 = "anemometer";
                        filterSensor = "meteo";
                        units = "mm/d";
                        evapotranspiration = this.getData(1, "evapotranspiration");
                        dewpoint = this.getData(1, "dewpoint");
                    }
                    else if (hasPluviometer) {
                        filter = "pluviometer";
                        filter2 = "pluviometer";
                        filterSensor = "meteo";
                        units = "l/m2";
                        renderGenericBarCard = true;
                    }
                    title = this.getReedSensorName(filter, true);
                }
                else
                    renderParamCard = false;
            }

            if (renderParamCard) {
                indents.push(<ParamCard
                    rerenderParentCallback={this.rerenderParentCallback}
                    key={21} idZone={this.state.idZone}
                    style={this.style.paramCard}
                    cardStyle={this.style.paramCardIn}
                    filter={filter}
                    meteo={this.state.home?this.state.home.meteo:null}
                    sensor={zone.DeviceSerialNumber ? true : false}
                    value={this.getActualValue()}
                    percent={zone.genericInfo.sensors[filterSensor].percent}
                    units={units?units:zone.genericInfo.sensors[filterSensor].units}
                    measureTime={zone.genericInfo.sensors[filterSensor].measureTime}
                    limit33={zone.data.limits[filter2][33]}
                    limit66={zone.data.limits[filter2][66]}
                    prevIrrigation={zone.genericInfo.prevIrrigation ? zone.genericInfo.prevIrrigation.start : null}
                    title={title}
                    evapotranspiration={evapotranspiration}
                    dewpoint={dewpoint}
                />)
                if (renderGenericBarCard) {
                    indents.push(
                        <GenericBarChartCard key={22}
                            fullScreen={false}
                            onChartRef={(c) => {
                                this._dataChart = c;
                            }}
                            onFullScreen={() => {
                                this.setFullScreenChart(!this.state.fullScreenChart)
                            }}
                            onClose={() => {
                                onClose();
                            }}
                            numberDays={(this.state.mediaStyle.width > 990 ? 7 : 4)}
                            style={this.style.paramCard}
                            cardStyle={this.style.paramCardIn}
                            data={this.getData(2, filter)}
                            dataTooltip={[this.props.actions.languageActions.get('deviceCard_pluviometer')]}
                            units={units?units:zone.genericInfo.sensors[filterSensor].units}
                            dataRange={zone.data.dataGathered}
                            getMoreData={(from, to) => {
                                return this.getMoreData(from, to)
                            }}
                            onNewPosition={(info) => {
                                if (!this.state.fullScreenChart)
                                    this.onChartMovePosition(info)
                            }}
                            meteoData={zone.data.meteo}
                            defaultValues={this.state.chartPositionInfo}
                            minData={zone.creationTime}
                            title={title}
                        />
                    );
                } else {
                    indents.push(<ChartCard key={22} fullScreen={false} onChartRef={(c) => {
                        this._dataChart = c;
                        this._chartCard = c;
                    }} onFullScreen={() => {
                        this.setFullScreenChart(!this.state.fullScreenChart)
                    }} onDownload={() => {
                        this.onDownloadPress()
                    }} numberDays={(this.state.mediaStyle.width > 990 ? 7 : 4)}
                        style={this.style.paramCard} cardStyle={this.style.paramCardIn}
                        filter={filter} data={this.getData(1, filter)}
                        dataInstant={this.getData(2, filter)}
                        meteoData={zone.data.meteo}
                        irrigationHistoryData={Object.values(zone.irrigationHistoryData)}
                        dataRange={zone.data.dataGathered}
                        getMoreData={(from, to) => {
                            return this.getMoreData(from, to)
                        }} onNewPosition={(info) => {
                            if (!this.state.fullScreenChart)
                                this.onChartMovePosition(info)
                        }} limit33={zone.data.limits[filter2][33]}
                        limit66={zone.data.limits[filter2][66]}
                        units={zone.genericInfo.sensors[filterSensor].units}
                        defaultValues={this.state.chartPositionInfo}
                        minData={zone.creationTime} 
                        enableCalibration={this.props.roles.fliwer?true:false}
                        calibrationData={{from:zone.replantTime,to:zone.maxCalibrationTime}}
                        onModal={(name,data)=>{
                            if(name=="setCalibrationRange"){
                                this.setState({modalCalibrationVisible:true,calibrationData:data})
                            }
                        }}
                    />)
                }
            }
        }
        return indents;
    }

    onDownloadPress() {
        if (this.props.isVisitor)
            toast.error(this.props.actions.languageActions.get('DemoUser_no_permition_message'));
        else
            this.setState({ modalDownloadVisible: true, downloadStart: new Date().setDate((new Date()).getDate() - 7), downloadEnd: Date.now() })

    }

    onDownloadFlowPress() {
        if (this.props.isVisitor)
            toast.error(this.props.actions.languageActions.get('DemoUser_no_permition_message'));
        else
            this.setState({ modalDownloadFlowVisible: true, downloadStart: new Date().setDate((new Date()).getDate() - 7), downloadEnd: Date.now() })

    }

    renderAlerts(zone) {
        var indents = [];
        if (this.state.filter == "meteo" && this.state.home) {
            //Add meteo cards
            indents.push(<MeteoCard key={"m-1"} title={this.props.actions.languageActions.get('MeteoCard_title_today')} icon={{ uri: this.state.home.meteo.icon }} temperature={this.state.home.meteo.temperature + "ºC"} temperature_min={this.state.home.meteo.temperature_min + "ºC"} temperature_max={this.state.home.meteo.temperature_max + "ºC"} rain={this.state.home.meteo.rain + "%"} cloud={this.state.home.meteo.cloud + "%"} windspeed={this.state.home.meteo.windspeed + "km/h"} winddegree={this.state.home.meteo.winddegree + "º"} />);
            indents.push(<MeteoCard key={"m-2"} title={this.props.actions.languageActions.get('MeteoCard_title_tomorrow')} icon={{ uri: this.state.home.meteo["1d_icon"] }} temperature={this.state.home.meteo["1d_temperature"] + "ºC"} temperature_min={this.state.home.meteo["1d_temperature_min"] + "ºC"} temperature_max={this.state.home.meteo["1d_temperature_max"] + "ºC"} rain={this.state.home.meteo["1d_rain"] + "%"} cloud={this.state.home.meteo["1d_cloud"] + "%"} windspeed={this.state.home.meteo["1d_windspeed"] + "km/h"} winddegree={this.state.home.meteo["1d_winddegree"] + "º"} />);
            indents.push(<MeteoCard key={"m-3"} title={this.props.actions.languageActions.get('MeteoCard_title_2day')} icon={{ uri: this.state.home.meteo["2d_icon"] }} temperature={this.state.home.meteo["2d_temperature"] + "ºC"} temperature_min={this.state.home.meteo["2d_temperature_min"] + "ºC"} temperature_max={this.state.home.meteo["2d_temperature_max"] + "ºC"} rain={this.state.home.meteo["2d_rain"] + "%"} cloud={this.state.home.meteo["2d_cloud"] + "%"} windspeed={this.state.home.meteo["2d_windspeed"] + "km/h"} winddegree={this.state.home.meteo["2d_winddegree"] + "º"} />);
            indents.push(<MeteoCard key={"m-4"} title={this.props.actions.languageActions.get('MeteoCard_title_3day')} icon={{ uri: this.state.home.meteo["3d_icon"] }} temperature={this.state.home.meteo["3d_temperature"] + "ºC"} temperature_min={this.state.home.meteo["3d_temperature_min"] + "ºC"} temperature_max={this.state.home.meteo["3d_temperature_max"] + "ºC"} rain={this.state.home.meteo["3d_rain"] + "%"} cloud={this.state.home.meteo["3d_cloud"] + "%"} windspeed={this.state.home.meteo["3d_windspeed"] + "km/h"} winddegree={this.state.home.meteo["3d_winddegree"] + "º"} />);
        }

        if(zone){
            for (var index in zone.alerts) {
                var alert = zone.alerts[index];
                if (!this.state.filter || alert.category.includes(this.state.filter3)) {
                    indents.push(<AlertCard key={alert.id} modalFunc={(visible, idAdvice) => this.setModalVisibleSure(visible, idAdvice)} idAdvice={alert.id} category={alert.category} subcategory={alert.subcategory} title={alert.title} subtitle={alert.text.length < 60 ? alert.text : alert.text.substring(0, 30) + '...'} text={alert.text} icon={alert.icon} />);
                }
            }
    
            for (var index in zone.advices) {
                var alert = zone.advices[index];
                if (!this.state.filter || alert.category.includes(this.state.filter3)) {
                    indents.push(<AlertCard key={alert.id} modalFunc={(visible, idAdvice) => this.setModalVisibleSure(visible, idAdvice)} idAdvice={alert.id} category={alert.category} subcategory={alert.subcategory} title={alert.title} subtitle={alert.text.length < 60 ? alert.text : alert.text.substring(0, 30) + '...'} text={alert.text} icon={alert.icon} />);
                }
            }
        }

        if (this.state.mediaStyle.orientation == "portrait" && zone && zone.data) {
            if (this.state.filter != "maint") {

                var renderParamCard = true;
                var renderGenericBarCard = false;
                var filter = this.state.filter;
                var filter2 = this.state.filter2;
                var filterSensor = this.state.filter;
                var units;
                var title = null;
                var evapotranspiration = null, dewpoint = null;
                if (this.state.filter == "meteo") {
                    var hasAnemometer = zone.data && zone.data.anemometer && zone.data.anemometer.length //this.hasSensorPro("anemometer");
                    var hasPluviometer = zone.data && zone.data.pluviometer && zone.data.pluviometer.length //this.hasSensorPro("pluviometer");
                    if (hasAnemometer || hasPluviometer) {
                        if (hasAnemometer) {
                            filter = "anemometer";
                            filter2 = "anemometer";
                            filterSensor = "meteo";
                            units = "mm/d";
                            evapotranspiration = this.getData(1, "evapotranspiration");
                            dewpoint = this.getData(1, "dewpoint");
                        }
                        else if (hasPluviometer) {
                            filter = "pluviometer";
                            filter2 = "pluviometer";
                            filterSensor = "meteo";
                            units = "l/m2";
                            renderGenericBarCard = true;
                        }
                        title = this.getReedSensorName(filter, true);
                    }
                    else
                        renderParamCard = false;
                }

                if (renderParamCard) {
                    indents.push(<ParamCard rerenderParentCallback={this.rerenderParentCallback}
                        key={21}
                        idZone={this.state.idZone}
                        filter={filter}
                        sensor={zone.DeviceSerialNumber ? true : false}
                        meteo={this.state.home?this.state.home.meteo:null} value={this.getActualValue()}
                        percent={zone.genericInfo.sensors[filterSensor].percent}
                        units={units?units:zone.genericInfo.sensors[filterSensor].units}
                        measureTime={zone.genericInfo.sensors[filterSensor].measureTime}
                        limit33={zone.data.limits[filter2][33]}
                        limit66={zone.data.limits[filter2][66]}
                        prevIrrigation={zone.genericInfo.prevIrrigation ? zone.genericInfo.prevIrrigation.start : null}
                        title={title}
                        evapotranspiration={evapotranspiration}
                        dewpoint={dewpoint}
                    />)
                    
                if (renderGenericBarCard) {
                    indents.push(
                        <GenericBarChartCard key={22}
                            fullScreen={false}
                            onChartRef={(c) => {
                                this._dataChart = c;
                            }}
                            onFullScreen={() => {
                                this.setFullScreenChart(!this.state.fullScreenChart)
                            }}
                            onClose={() => {
                                onClose();
                            }}
                            numberDays={(this.state.mediaStyle.width > 990 ? 7 : 4)}
                            style={this.style.paramCard}
                            cardStyle={this.style.paramCardIn}
                            data={this.getData(2, filter)}
                            dataTooltip={[this.props.actions.languageActions.get('deviceCard_pluviometer')]}
                            units={units?units:zone.genericInfo.sensors[filterSensor].units}
                            dataRange={zone.data.dataGathered}
                            getMoreData={(from, to) => {
                                return this.getMoreData(from, to)
                            }}
                            onNewPosition={(info) => {
                                if (!this.state.fullScreenChart)
                                    this.onChartMovePosition(info)
                            }}
                            meteoData={zone.data.meteo}
                            defaultValues={this.state.chartPositionInfo}
                            minData={zone.creationTime}
                            title={title}
                        />
                    );
                } else {
                    indents.push(<ChartCard key={22} fullScreen={false} onChartRef={(c) => {
                        this._dataChart = c;
                        this._chartCard = c;
                    }} onFullScreen={() => {
                        this.setFullScreenChart(!this.state.fullScreenChart)
                    }} onDownload={() => {
                        this.onDownloadPress()
                    }} style={this.style.paramCard} cardStyle={[this.style.paramCardIn, this.style.flow]}
                        filter={filter}
                        data={this.getData(1, filter)}
                        dataInstant={this.getData(2, filter)}
                        meteoData={zone.data.meteo}
                        irrigationHistoryData={Object.values(zone.irrigationHistoryData)}
                        limit33={zone.data.limits[filter2][33]}
                        dataRange={zone.data.dataGathered}
                        getMoreData={(from, to) => {
                            return this.getMoreData(from, to)
                        }} onNewPosition={(info) => {
                            if (!this.state.fullScreenChart)
                                this.onChartMovePosition(info)
                        }} limit66={zone.data.limits[filter2][66]}
                        units={zone.genericInfo.sensors[filterSensor].units}
                        defaultValues={this.state.chartPositionInfo}
                        minData={zone.creationTime}
                        enableCalibration={this.props.roles.fliwer?true:false}
                        calibrationData={{from:zone.replantTime,to:zone.maxCalibrationTime}}
                        onModal={(name,data)=>{
                            if(name=="setCalibrationRange"){
                                this.setState({modalCalibrationVisible:true,calibrationData:data})
                            }
                        }}
                         />)
                    }
                }
            }
        }

        if (zone && zone.data && this.state.filter == "soilm") {
            var flowData = this.getData(1, "flow");
            var soilmData = this.getData(1, "soilm");
            for (var i = 0; i < flowData.length; i++) {
                indents.push(<FlowChartCard key={'_flowChart' + i} onChartRef={(c) => {
                    this._chart = c;
                }} fullScreen={false} onFullScreen={((i) => {
                    return (idDevice) => {
                        this.setFullScreenFlowChart(this.state.fullScreenFlowChart ? null : idDevice, i)
                    }
                    
                })(i)} 
                onDownload={() => {
                    this.onDownloadFlowPress()
                }} 
                numberDays={(this.state.mediaStyle.width > 990 ? 7 : 4)} style={[this.style.paramCard, this.style.flowCard, (this.state.mediaStyle.orientation == "landscape" ? { height: this.state.containerHeight / 2, marginBottom: 0 } : {})]} cardStyle={[this.style.paramCardIn, this.style.paramCardInFlow]} filter={"soilm"} idDevice={flowData[i].DeviceSerialNumber} zoneName={zone.name} data={flowData[i].data} zoneData={flowData[i].zoneData} dataInstant={soilmData} units={"L"} currency={zone.priceWaterLiterCurrency} priceLiter={zone.priceWaterLiter} dataRange={zone.data.dataGathered} getMoreData={(from, to) => {
                    return this.getMoreData(from, to)
                }} onNewPosition={((i) => {
                    return (info) => {
                        if (!this.state.fullScreenFlowChart)
                            this.onFlowChartMovePosition(i, info)
                    }
                })(i)} defaultValues={this.state.flowChartPositionInfo[i]} minData={zone.creationTime} />)
                if (flowData[i].zoneData) {
                    indents.push(<IrrigationListCard
                        key={'_irrigationList'} fullScreen={false}
                        setLoading={null/*this.setLoadingIrrigationList()*/}
                        onFullScreen={() => {
                            this.setFullScreenIrrigationDataChart(this.state.fullScreenIrrigationDataChart ? null : true)
                        }} style={[this.style.paramCard, this.style.flowCard, (this.state.mediaStyle.orientation == "landscape" ? { height: this.state.containerHeight / 2, marginBottom: 0 } : {})]} cardStyle={this.style.paramCardIn} idZone={this.state.idZone} />)
                }
            }
        }

        if (zone && zone.data && this.state.filter == "meteo") {

            var flowCharts = [];
            var flowData = this.getData(1, "flow");
            if (flowData.length > 0 && this.hasSensorPro("flow-meter"))
                flowCharts.push({ type: "flow-meter", data: flowData });
            //            var pluviometerData = this.getData(1, "pluviometer");
            //            if (pluviometerData.length > 0 && this.hasSensorPro("pluviometer"))
            //                flowCharts.push({type: "pluviometer", data: pluviometerData});
            //            var anemometerData = this.getData(1, "anemometer");
            //            if (anemometerData.length > 0 && this.hasSensorPro("anemometer"))
            //                flowCharts.push({type: "anemometer", data: anemometerData});

            var soilmData = this.getData(1, "soilm");
            for (var j = 0; j < flowCharts.length; j++) {
                var type = flowCharts[j].type;
                var data = flowCharts[j].data;
                var filter = type;
                var title = this.getReedSensorName(filter);
                var units = this.getReedSensorUnits(filter);
                switch (type) {
                    case "pluviometer":
                        break;
                    case "anemometer":
                        break;
                    default:
                        filter = "soilm";
                        break;
                }
                for (var i = 0; i < data.length; i++) {

                    indents.push(<FlowChartCard
                        key={'_flowChart_' + j + '_' + i} onChartRef={(c) => {
                            //this._chart[filter] = c;
                            this._chart = c;
                        }} fullScreen={false} onFullScreen={((i) => {
                            return (idDevice) => {
                                this.setFullScreenFlowChart(this.state.fullScreenFlowChart ? null : idDevice, i)
                            }
                        })(i)}
                        
                        onDownload={() => {
                            this.onDownloadFlowPress()
                        }} 
                        title={title.toUpperCase()}
                        numberDays={(this.state.mediaStyle.width > 990 ? 7 : 4)}
                        style={[this.style.paramCard, this.style.flowCard, (this.state.mediaStyle.orientation == "landscape" ? { height: this.state.containerHeight / 2, marginBottom: 0 } : {})]}
                        cardStyle={[this.style.paramCardIn, this.style.paramCardInFlow]}
                        filter={filter}
                        idDevice={data[i].DeviceSerialNumber}
                        zoneName={zone.name}
                        data={data[i].data}
                        zoneData={data[i].zoneData}
                        dataInstant={soilmData}
                        units={units}
                        currency={zone.priceWaterLiterCurrency}
                        priceLiter={zone.priceWaterLiter}
                        dataRange={zone.data.dataGathered}
                        getMoreData={(from, to) => {
                            return this.getMoreData(from, to)
                        }}
                        onNewPosition={((i) => {
                            return (info) => {
                                if (!this.state.fullScreenFlowChart)
                                    this.onFlowChartMovePosition(i, info)
                            }
                        })(i)}
                        defaultValues={this.state.flowChartPositionInfo[i]}
                        minData={zone.creationTime}
                        hideResizeButton={true}
                        hideBottomBar={filter == "soilm" ? false : true}
                        hideMiddleBar={false}
                        hideTopBar={filter == "soilm" ? false : true}
                    />);
                }
            }
        }

        return indents;
    }

    renderFullScreenChart(zone) {
        if (this.state.fullScreenChart && this.state.filter != "maint") {

            var renderParamCard = true;
            var renderGenericBarCard = false;
            var filter = this.state.filter;
            var filter2 = this.state.filter2;
            var filterSensor = this.state.filter;
            var units;
            var title = null;
            if (this.state.filter == "meteo") {
                var hasAnemometer = zone.data && zone.data.anemometer && zone.data.anemometer.length //this.hasSensorPro("anemometer");
                var hasPluviometer = zone.data && zone.data.pluviometer && zone.data.pluviometer.length //this.hasSensorPro("pluviometer");
                console.log("hasAnemometer", hasAnemometer);
                console.log("hasPluviometer", hasPluviometer);
                if (hasAnemometer || hasPluviometer) {
                    if (hasAnemometer) {
                        filter = "anemometer";
                        filter2 = "anemometer";
                        filterSensor = "meteo";
                        units = "mm/d";
                    }
                    else if (hasPluviometer) {
                        filter = "pluviometer";
                        filter2 = "pluviometer";
                        filterSensor = "meteo";
                        units= "l/m2"
                        renderGenericBarCard = true;
                    }
                    title = this.getReedSensorName(filter, true);
                }
                else
                    renderParamCard = false;
            }
            if (renderGenericBarCard) {
                return(
                    <GenericBarChartCard key={22}
                        fullScreen={false}
                        onChartRef={(c) => {
                            this._dataChart = c;
                        }}
                        onFullScreen={() => {
                            if (this.state.fullScreenChart)
                                this._dataChart.animate();
                            this.setFullScreenChart(!this.state.fullScreenChart)
                        }}
                        onClose={() => {
                            onClose();
                        }}
                        numberDays={7}
                        style={[this.style.fullScreenCard,this.props.asComponent?{top:Platform.OS === 'ios' ? 80 : 40}:{}]}
                        cardStyle={this.style.fullScreenCardIn}
                        data={this.getData(2, filter)}
                        dataTooltip={[this.props.actions.languageActions.get('deviceCard_pluviometer')]}
                        units={units?units:zone.genericInfo.sensors[filterSensor].units}
                        dataRange={zone.data.dataGathered}
                        getMoreData={(from, to) => {
                            return this.getMoreData(from, to)
                        }}
                        onNewPosition={(info) => {
                            if (!this.state.fullScreenChart)
                                this.onChartMovePosition(info)
                        }}
                        meteoData={zone.data.meteo}
                        defaultValues={this.state.chartPositionInfo}
                        minData={zone.creationTime}
                        title={title}
                    />
                );
            } else if (renderParamCard)
                return (<ChartCard key={22} fullScreen={true}  onChartRef={(c) => {
                        this._chartCardFullSCreen = c;
                    }} 
                    onFullScreen={() => {
                        if (this.state.fullScreenChart)
                            this._dataChart.animate();
                        this.setFullScreenChart(!this.state.fullScreenChart)
                    }}
                    numberDays={7} style={[this.style.fullScreenCard,this.props.asComponent?{top:Platform.OS === 'ios' ? 80 : 40}:{}]}
                    cardStyle={this.style.fullScreenCardIn}
                    filter={filter}
                    data={this.getData(1, filter)}
                    dataInstant={this.getData(2, filter)}
                    meteoData={zone.data.meteo}
                    irrigationHistoryData={Object.values(zone.irrigationHistoryData)}
                    dataRange={zone.data.dataGathered}
                    getMoreData={(from, to) => {
                        return this.getMoreData(from, to)
                    }}
                    onNewPosition={(info) => {
                        this.onChartMovePosition(info)
                    }}
                    limit33={zone.data.limits[filter2][33]}
                    limit66={zone.data.limits[filter2][66]}
                    units={units?units:zone.genericInfo.sensors[filterSensor].units}
                    defaultValues={this.state.chartPositionInfo}
                    minData={zone.creationTime}
                    enableCalibration={this.props.roles.fliwer?true:false}
                    calibrationData={{from:zone.replantTime,to:zone.maxCalibrationTime}}
                    onModal={(name,data)=>{
                        if(name=="setCalibrationRange"){
                            this.setState({modalCalibrationVisible:true,calibrationData:data})
                        }
                    }}
                    title={title}
                />);

        }
        else if (this.state.fullScreenFlowChart && this.state.filter != "meteo" && this.state.filter != "maint") {

            if (zone.data && this.state.filter == "soilm") {
                var flowData = this.getData(1, "flow", typeof this.state.fullScreenFlowChart === "string" ? this.state.fullScreenFlowChart : null, typeof this.state.fullScreenFlowChart === "boolean" ? true : null)[0];
                var soilmData = this.getData(1, "soilm");
                //console.log("NEW CHART FULL RENDER",this.state.flowChartPositionInfo[this.state.indexFullScreenFlowChart],this.state.flowChartPositionInfo[this.state.indexFullScreenFlowChart]?new Date(this.state.flowChartPositionInfo[this.state.indexFullScreenFlowChart].from):null);
                if (flowData) {
                    return (<FlowChartCard key={23} fullScreen={true} onFullScreen={(idDevice) => {
                        if (this.state.fullScreenFlowChart)
                            this._chart.animate();
                        this.setFullScreenFlowChart(this.state.fullScreenFlowChart ? null : idDevice)
                    }} 
                    
                    onDownload={() => {
                        this.onDownloadFlowPress()
                    }} 
                    numberDays={7} style={[this.style.fullScreenCard,this.props.asComponent?{top:Platform.OS === 'ios' ? 80 : 40}:{}]} cardStyle={this.style.fullScreenCardIn} filter={"soilm"} idDevice={flowData.DeviceSerialNumber} zoneName={zone.name} data={flowData.data} zoneData={flowData.zoneData} dataInstant={soilmData} units={"L"} currency={zone.priceWaterLiterCurrency} priceLiter={zone.priceWaterLiter} dataRange={zone.data.dataGathered} getMoreData={(from, to) => {
                        return this.getMoreData(from, to)
                    }} onNewPosition={((i) => {
                        return (info) => {
                            this.onFlowChartMovePosition(i, info)
                        }
                    })(this.state.indexFullScreenFlowChart)} defaultValues={this.state.flowChartPositionInfo[this.state.indexFullScreenFlowChart]} minData={zone.creationTime} />)
                } else {
                    this.setState({ fullScreenFlowChart: false });
                    return [];
                }
            }
        } else if (this.state.fullScreenIrrigationDataChart && this.state.filter != "meteo" && this.state.filter != "maint") {
            return (<IrrigationListCard
                key={'_irrigationList_fullScreen'}
                fullScreen={true}
                setLoading={this.setLoadingIrrigationList()}
                onFullScreen={() => {
                    this.setFullScreenIrrigationDataChart(this.state.fullScreenIrrigationDataChart ? null : true)
                }} style={[this.style.fullScreenCard,this.props.asComponent?{top:Platform.OS === 'ios' ? 80 : 40}:{}]} cardStyle={this.style.fullScreenCardIn} idZone={this.state.idZone} />)
        } else
            return [];
    }

    setLoadingIrrigationList() {
        var that = this;
        return (loading) => {
            that.setState({ loadingIrrigationList: loading });
        };
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        loading: state.sessionReducer.loading,
        data: state.sessionReducer.data,
        preloadedData: state.sessionReducer.preloadedData,
        preloadedUntilZones: state.sessionReducer.preloadedUntilZones,
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
        homeLoading: state.fliwerHomeReducer.loading,
        homeData: state.fliwerHomeReducer.data,
        gardenerHomes: state.gardenerReducer.gardenerHomes,
        gardenLoading: state.fliwerGardenReducer.loading,
        gardenData: state.fliwerGardenReducer.data,
        zoneLoading: state.fliwerZoneReducer.loading,
        zoneLoadingData: state.fliwerZoneReducer.loadingData,
        zoneData: state.fliwerZoneReducer.data,
        devices: state.fliwerDeviceReducer.devices,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.visitorCheckidUser,
    }
}

// Doing this merges our actions into the componentâ€™s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            languageActions: bindActionCreators(ActionsLang, dispatch),
            fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
            fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
        }
    }
}

//Connect everything

var styles = {
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 400
    },
    modalView: {
        paddingTop: 20,
        alignItems: "center"
    },
    modalViewTitle: {
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    modalButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)"
    },
    modalButton1: {
        borderBottomLeftRadius: 20
    },
    modalButton2: {
        borderRightWidth: 0,
        borderBottomRightRadius: 20
    },
    modalButtonText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonTextNo: {
        color: "blue"
    },
    modalButtonTextYes: {
        color: "red"
    },
    background: {
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    scrollView: {
        position: "relative",
        width: "100%",
        height: "100%"
    },
    fullScreenCard: {
        left: 0,
        right: 0,
        top: Platform.OS === 'ios' ? 120 : 80,
        bottom: 0,
        paddingBottom: 8,
        width: "auto",
        maxWidth: "auto",
        position: "absolute"
    },
    fullScreenCardIn: {
        height: "100%",
        maxWidth: "auto",
        marginBottom: 0,
    },
    infoContainer: {
        width: "100%",
        height: "100%"
    },
    datePickerContainer: {
        height: 40,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        marginBottom: 10
    },
    datePickerContainerText: {
        display: "flex",
        alignItems: "center",
        minWidth: 60,
        marginLeft: 10
    },
    datePickerContainerIn: {
        height: 40,
        width: "70%",
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
        height: 40,
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
    datePickerButton: {
        maxWidth: 200
    },

    "@media (orientation:landscape)": {
        cardCollection: {
            position: "absolute",
            left: "50%",
            right: 0,
            bottom: 0,
            top: 0
        },
        cardCollectionCardView: {
            marginTop: 0
        },
        paramCard: {
            maxWidth: 1000,
            height: '50%',
            width: '50%',
            paddingRight: 0,
            paddingBottom: 8
        },
        flowCard: {
            width: "100%",
        },
        paramCardIn: {
            height: "100%",
            marginBottom: 0,
        },
        fullScreenCard: {
            left: 60
        }
    },
    "@media (orientation:portrait)": {
        paramCard: {
            width: "100%",
            height: 355,
            marginBottom: 9
        },
        flowCard: {
            height: 381,
        },
        paramCardIn: {
            height: 350
        },
        paramCardInFlow: {
            height: 381,
        },
        cardCollection: {
        },
        fullScreenCard: {
            top: 120,
            bottom: 14
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, Zone));
