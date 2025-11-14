'use strict';

import React, { Component } from 'react';
import {View, Platform, TouchableOpacity, Text, Image, ScrollView} from 'react-native';

import ChartCard from '../charts/chartCard.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {Orientation} from '../../utils/orientation/orientation'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import Modal from '../../widgets/modal/modal'
import {toast} from '../../widgets/toast/toast'

import batteryType1_Off  from '../../assets/img/ico-off.png'
import batteryType1_On  from '../../assets/img/ico-on.png'
import batteryType2_Off  from '../../assets/img/ico-off.png'
import batteryType2_On  from '../../assets/img/ico-on.png'
import BatteryChartCard from '../charts/batteryChartCard.js';


class BatteryModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            batteryType: null,
            loading: false,
            fullScreenChart: false,
            chartPositionInfo: null,
            filter: 'mant'
        };

        this.props.actions.fliwerDeviceActions.getDeviceData(this.props.idDevice).then((data) => {
            this.forceUpdate();
        });

    }

    render() {
        var {onClose} = this.props;

        return (
            <Modal animationType="fade" loadingModal={this.props.loadingModal} inStyle={[FliwerStyles.modalIn, {maxWidth: 600, backgroundColor: "transparent"}, this.state.fullScreenChart? {width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%"} : {}]} visible={true} onClose={() => {
                    if (this.state.fullScreenChart) {
                        Orientation.unlockAllOrientations(this);
                    }
                    onClose();
                }}>
                <View style={{}}>
                    {/* <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}> */}
                        <View style={{width: "100%", alignItems: "center"}}>
                            {/* {this.renderBatterySelection()} */}
                            {this.renderChart()}
                        </View>
                    {/* </ScrollView> */}
                </View>
                {this.renderFullScreenChart()}
            </Modal>
        );

    }

    renderBatterySelection() {
        var {batteryType} = this.props;

        var batteryType = this.state.batteryType ? this.state.batteryType : batteryType;

        var device = this.props.devices[this.props.idDevice];
        //console.log("renderChart device", device);
        if (!device)
            return null;

        switch (device.type) {
            case "TBD1":
            case "TBD2":
            case "TBD4":
            case "TBD6":
                break;
            default:
                return null;
                break;
        }

        var hasPermissionToEdit = this.hasPermissionToEdit();

        return (
            <View style={{width: "100%", alignItems: "center"}}>
                <Text style={[FliwerStyles.titleStyle, {fontSize: 18}]}>{
                    this.props.actions.translate.get("Battery_select_battery_type")
                }</Text>

                <View style={{flexDirection: "row", marginTop: 0}}>
                    <TouchableOpacity style={[this.style.selectIconType, this.style.batteryType1]}
                        onMouseEnter={batteryType==0 || !hasPermissionToEdit? null : this.hoverIn('batteryType1')} onMouseLeave={batteryType==0 || !hasPermissionToEdit? null : this.hoverOut('batteryType1')}
                        disabled={batteryType==0 || !hasPermissionToEdit? true : false}
                        onPress={() => {
                            this.updateBatteryType(0);
                        }}>
                        <Image style={this.style.selectIconTypeImage} source={batteryType==0 ? batteryType1_On : batteryType1_Off}/>
                        <Text style={this.style.selectIconTypeText}>{"Li-ion"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[this.style.selectIconType, this.style.batteryType2]}
                        onMouseEnter={batteryType!=0 || !hasPermissionToEdit? null : this.hoverIn('batteryType2')} onMouseLeave={batteryType!=0 || !hasPermissionToEdit? null : this.hoverOut('batteryType2')}
                        disabled={batteryType!=0 || !hasPermissionToEdit? true : false}
                        onPress={() => {
                            this.updateBatteryType(1);
                        }}>
                        <Image style={this.style.selectIconTypeImage} source={batteryType!=0 ? batteryType2_On : batteryType2_Off}/>
                        <Text style={this.style.selectIconTypeText}>{"Alkaline"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderChart() {
        var {onClose,forcedMin,forcedMax} = this.props;

        var devicesData = this.props.devicesData[this.props.idDevice];
        if (!devicesData)
            return (
                <View style={this.style.paramCard}></View>
            );

        //console.log("renderChart devicesData", devicesData);
        var chartData = this.getData();
        var data_meteo = [];
        var irrigationHistoryData = [];

        return (
            <BatteryChartCard key={22}
                idDevice={this.props.idDevice}
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
                filter={this.state.filter}
                data={chartData}
                dataInstant={chartData}
                meteoData={data_meteo}
                irrigationHistoryData={Object.values(irrigationHistoryData)}
                dataRange={devicesData.data.dataGathered} 
                getMoreData={(from, to) => {
                    return this.getMoreData(from, to)
                }}
                onNewPosition={(info) => {
                    if (!this.state.fullScreenChart)
                        this.onChartMovePosition(info)
                }}
                limit33={forcedMin?forcedMin:devicesData.data.limits['battery'][33]}
                limit66={forcedMax?forcedMax:devicesData.data.limits['battery'][66]}
                units={"V"}
                defaultValues={this.state.chartPositionInfo}
                minData={devicesData.data.deviceCreationTime}
            />
        );
    }

    renderFullScreenChart() {
        if (!this.state.fullScreenChart)
            return null;

        var devicesData = this.props.devicesData[this.props.idDevice];
        if (!devicesData)
            return null;

        var chartData = this.getData();
        var data_meteo = [];
        var irrigationHistoryData = [];

        return(
            <ChartCard key={22} fullScreen={true}
                onFullScreen={() => {
                    if (this.state.fullScreenChart)
                        this._dataChart.animate();
                    this.setFullScreenChart(!this.state.fullScreenChart)
                }}
                numberDays={7} style={this.style.fullScreenCard}
                cardStyle={this.style.fullScreenCardIn}
                filter={this.state.filter}
                data={chartData}
                dataInstant={chartData}
                meteoData={data_meteo}
                irrigationHistoryData={Object.values(irrigationHistoryData)}
                dataRange={devicesData.data.dataGathered}
                getMoreData={(from, to) => {
                    return this.getMoreData(from, to);
                }}
                onNewPosition={(info) => {
                    this.onChartMovePosition(info)
                }}
                limit33={devicesData.data.limits['battery'][33]}
                limit66={devicesData.data.limits['battery'][66]}
                units={"V"}
                defaultValues={this.state.chartPositionInfo}
                minData={devicesData.data.deviceCreationTime}
                title={"Battery level"}
            />
        );
    }

    getData() {
        var {forcedMin,forcedMax} = this.props;
        if (!this.props.devicesData || !this.props.devicesData[this.props.idDevice])
            return [];

        var devicesData = this.props.devicesData[this.props.idDevice];

        var data = [];
        
        data.push(devicesData.data.battery);
        var title = "Battery";

        for (var i = 0; i < data.length; i++) {
            //var f = (filter == "anemometer" || filter == "pluviometer")? "meteo" : filter;
            data[i] = data[i].map((e) => {
                let units = "V";
                e.units = units;
                e.title = (typeof title === "string" ? title : title[i]);
                if(forcedMin || forcedMax)e.percent=50;
                return e;
            });
        }

        //console.log("getData data", data);

        return data;
    }

    getMoreData(from, to) {
        return new Promise((resolve, reject) => {
            this.props.setLoading(true);
            this.props.actions.fliwerDeviceActions.getDeviceMoreData(this.props.idDevice, from, to).then(() => {
                this.props.setLoading(false);
                resolve();
            }, (error) => {
                reject(error)
            });
        });
    }

    setFullScreenChart(fullscreen) {
        if (fullscreen) {
            this.setState({fullScreenChart: true});
            Orientation.lockToLandscape(this);
        } else {
            this.setState({fullScreenChart: false});
            Orientation.unlockAllOrientations(this);
        }
    }

    onChartMovePosition(info) {
        this.setState({chartPositionInfo: info})
    }

    updateBatteryType(value) {

        this.props.setLoading(true);
        this.props.actions.fliwerDeviceActions.modifyDevice(this.props.idDevice, {
            batteryType: value
        }).then((response) => {
            this.setState({batteryType: value});
            this.props.setLoading(false);
        }, (err) => {
            this.props.setLoading(false);
            if (err && err.reason)
                toast.error(err.reason);
        });

    }

    hasPermissionToEdit() {
        if (this.props.isVisitor)
            return false;

        return (this.props.roles.fliwer || this.props.roles.angel || this.props.isGardener);
    }

};


function mapStateToProps(state, props) {
    return {
        devices: state.fliwerDeviceReducer.devices,
        devicesData: state.fliwerDeviceReducer.data,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
        roles: state.sessionReducer.roles
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch)
        }
    };
}

var style = {
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
        color: FliwerColors.primary.black,
        //marginTop: 10
        marginTop: -52,
        zIndex: 999
    },
    batteryType1: {
        marginRight: 15
    },
    batteryType2: {
        marginLeft: 15
    },
    paramCard: {
        width: "100%",
        // height: 355,
        height: 580,
//        marginTop: 20,
        maxWidth: 500
    },
    paramCardIn: {
        height: 350
    },
    fullScreenCard: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
//        paddingBottom: 8,
        width: "auto",
        maxWidth: "auto",
        position: "absolute"
    },
    fullScreenCardIn: {
        height: "100%",
        maxWidth: "auto",
        marginBottom: 0
    },
    ":hover": {
        batteryType1: {
            filter: "brightness(110%)"
        },
        batteryType2: {
            filter: "brightness(110%)"
        }
    }
};

if (Platform.OS != 'web')
    style.fullScreenCard.top = 0;

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, BatteryModal));
