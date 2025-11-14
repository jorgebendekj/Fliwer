'use strict';

import React, { Component } from 'react';
import {View, Platform, TouchableOpacity, Text, Image, ScrollView} from 'react-native';

import GenericBarChartCard from '../charts/genericBarChartCard.js'

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


class RangeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            batteryType: null,
            loading: true,
            fullScreenChart: false,
            chartPositionInfo: null,
            filter: 'mant'
        };

        this.props.actions.fliwerDeviceActions.getDeviceDataPackets(this.props.idDevice).then((data) => {
            this.props.setLoading(false);
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
                    <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}>
                        <View style={{width: "100%", alignItems: "center"}}>
                            {false?this.renderBatterySelection():null}
                            {this.renderChart()}
                        </View>
                    </ScrollView>
                </View>
                {this.renderFullScreenChart()}
            </Modal>
        );

    }


    renderChart() {
        var {onClose} = this.props;

        var devicesData = this.props.devicePacketData[this.props.idDevice];
        if (!devicesData)
            return (
                <View style={this.style.paramCard}></View>
            );

        //console.log("renderChart devicesData", devicesData);
        var chartData = this.getData();
        var data_meteo = [];
        var device=this.props.devices[this.props.idDevice];
        
        var irrigationHistoryData = [];

        return (
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
                data={chartData}
                dataTooltip={this.getDataNames()}
                units={" pkt"}
                dataRange={devicesData.packetData.dataGathered}
                getMoreData={(from, to) => {
                    return this.getMoreData(from, to)
                }}
                onNewPosition={(info) => {
                    if (!this.state.fullScreenChart)
                        this.onChartMovePosition(info)
                }}
                meteoData={data_meteo}
                defaultValues={this.state.chartPositionInfo}
                minData={devicesData.packetData.deviceCreationTime}
                title={"Device "+this.props.idDevice+" Packets"}
                subtitle={device.connectionLevelpercentage?"Connection: "+device.connectionLevelRaw+"("+device.connectionLevelpercentage+"%)":null}
            />
        );
    }

    renderFullScreenChart() {
        if (!this.state.fullScreenChart)
            return null;

        var devicesData = this.props.devicePacketData[this.props.idDevice];
        if (!devicesData)
            return null;

        var chartData = this.getData();
        var data_meteo = [];
        var irrigationHistoryData = [];
        var device=this.props.devices[this.props.idDevice];

        return(
            <GenericBarChartCard
              key={22}
              fullScreen={false}
              onChartRef={(c) => {
                  this._dataChart = c;
              }}
              onFullScreen={() => {
                  if (this.state.fullScreenChart)
                      this._dataChart.animate();
                  this.setFullScreenChart(!this.state.fullScreenChart)
              }}
              numberDays={7}
              style={this.style.fullScreenCard}
              cardStyle={this.style.fullScreenCardIn}
              data={chartData}
              dataTooltip={this.getDataNames()}
              units={" pkt"}
              dataRange={devicesData.packetData.dataGathered}
              getMoreData={(from, to) => {
                  return this.getMoreData(from, to)
              }}
              onNewPosition={(info) => {
                  this.onChartMovePosition(info)
              }}
              meteoData={data_meteo}
              defaultValues={this.state.chartPositionInfo}
              minData={devicesData.packetData.deviceCreationTime}
              title={"Device "+this.props.idDevice+" Packets"}
              subtitle={device.connectionLevelpercentage?"Connection: "+device.connectionLevelRaw+" ("+device.connectionLevelpercentage+"%)":null}
            />
        );
    }

    getData() {
        if (!this.props.devicePacketData || !this.props.devicePacketData[this.props.idDevice])
            return [];

        var devicesData = this.props.devicePacketData[this.props.idDevice];
        var data = [];
        devicesData.packetData.packets=devicesData.packetData.packets.map((i)=>{
          i.value=1;
          return i;
        })
        data.push(devicesData.packetData.packets.filter((p)=>{return p.origin}));
        data.push(devicesData.packetData.packets.filter((p)=>{return !p.origin}));

        return data;
    }

    getDataNames() {
      return ['Packets sent','Packets received'];
    }

    getMoreData(from, to) {
        return new Promise((resolve, reject) => {
            this.props.setLoading(true);
            this.props.actions.fliwerDeviceActions.getDeviceMoreDataPackets(this.props.idDevice, from, to).then(() => {
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

    hasPermissionToEdit() {
        if (this.props.isVisitor)
            return false;

        return (this.props.roles.fliwer || this.props.roles.angel || this.props.isGardener);
    }

};


function mapStateToProps(state, props) {
    return {
        devices: state.fliwerDeviceReducer.devices,
        devicePacketData: state.fliwerDeviceReducer.packetData,
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
        height: 355,
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
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, RangeModal));
