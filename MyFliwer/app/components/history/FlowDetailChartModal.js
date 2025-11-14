'use strict';

import React, { Component } from 'react';
import {View, Platform, TouchableOpacity, Text, Image, ScrollView} from 'react-native';

import GenericBarChartCard from '../charts/genericBarChartCard.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {Orientation} from '../../utils/orientation/orientation'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors.js'
import {FliwerStyles} from '../../utils/FliwerStyles.js'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils.js'

import Modal from '../../widgets/modal/modal'
import {toast} from '../../widgets/toast/toast'

import batteryType1_Off  from '../../assets/img/ico-off.png'
import batteryType1_On  from '../../assets/img/ico-on.png'
import batteryType2_Off  from '../../assets/img/ico-off.png'
import batteryType2_On  from '../../assets/img/ico-on.png'


class FlowDetailChartModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            batteryType: null,
            loading: false,
            fullScreenChart: false,
            chartPositionInfo: null,
            data:[],
        };

        var {data, idZone,idIrrigation,from,to} = this.props;

        this.props.actions.fliwerZoneActions.getZoneMoreData(idZone, from,to).then(() => {
            var irrigationData = this.props.zoneData[this.props.idZone].data.flow[0].data.filter(f=>f.idProgrammedTask==idIrrigation).map((f)=>{return {time:f.time,value:f.value}});
            this.setState({data:irrigationData});
        }, (error) => {
            reject(error)
        })

    }

    render() {
        var {onClose} = this.props;

        return (
            <Modal animationType="fade" loadingModal={false/*this.props.loadingModal*/} inStyle={[FliwerStyles.modalIn, {maxWidth: 800, backgroundColor: "transparent"}, this.state.fullScreenChart? {width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%"} : {}]} visible={true} onClose={() => {
                    if (this.state.fullScreenChart) {
                        Orientation.unlockAllOrientations(this);
                    }
                    onClose();
                }}>
                <View style={{}}>
                    <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}>
                        <View style={{width: "100%", alignItems: "center"}}>
                            {this.state.data.length>0?this.renderChart():null}
                        </View>
                    </ScrollView>
                </View>
                {this.renderFullScreenChart()}
            </Modal>
        );

    }


    renderChart() {
        var {onClose, from,to} = this.props;

        return (
            <GenericBarChartCard key={FlowDetailChartModal+"_chart"}
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
                numberDays={(this.state.mediaStyle.width > 990 ? 10 : 5)}
                style={this.style.paramCard}
                cardStyle={this.style.paramCardIn}
                data={[this.state.data]}
                dataTooltip={["Ticks received"]}
                separationsUnit={"m"}
                units={" L"}
                forcedDataRange={true}
                dataRange={{
                    from: from,
                    to: to
                }}
                onNewPosition={(info) => {
                    if (!this.state.fullScreenChart)
                        this.onChartMovePosition(info)
                }}
                defaultValues={this.state.chartPositionInfo}
                minData={this.state.data.length>0?this.state.data[0].time:0}
                title={"Irrigation "+this.props.idIrrigation+" flow"}
            />
        );
    }

    renderFullScreenChart() {
        var {onClose, from,to} = this.props;

        if (!this.state.fullScreenChart)
            return null;

        return(
            <GenericBarChartCard
                key={FlowDetailChartModal+"_fullScreenchart"}
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
                numberDays={20}
                style={this.style.fullScreenCard}
                cardStyle={this.style.fullScreenCardIn}
                data={[this.state.data]}
                dataTooltip={["Ticks received"]}
                separationsUnit={"m"}
                units={" L"}

                forcedDataRange={true}
                dataRange={{
                    from: from,
                    to: to
                }}
                onNewPosition={(info) => {
                    this.onChartMovePosition(info)
                }}
                defaultValues={this.state.chartPositionInfo}
                minData={this.state.data.length>0?this.state.data[0].time:0}
                title={"Irrigation "+this.props.idIrrigation+" flow"}
            />
        );
    }

    /*
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
        */

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

};


function mapStateToProps(state, props) {
    return {
        zoneData: state.fliwerZoneReducer.data,
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
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
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
        height: 450,
//        marginTop: 20,
        maxWidth: 850
    },
    paramCardIn: {
        height: 445
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
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FlowDetailChartModal));
