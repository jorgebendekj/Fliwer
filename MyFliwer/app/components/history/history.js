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
    Platform
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading'
import ImageBackground from '../imageBackground.js'
import {FliwerColors} from '../../utils/FliwerColors'
import FliwerBackButton from '../custom/FliwerBackButton.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerBubble from '../custom/FliwerBubble.js'
import FliwerHistory from '../history/FliwerHistory.js'
import FliwerProgramDetail from '../history/FliwerProgramDetail.js'
import FliwerHistoryFilter from '../history/FliwerHistoryFilter.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect,withRouter } from '../../utils/router/router'

import background  from '../../assets/img/1_bg.jpg'
import icofliwer  from '../../assets/img/Icofliwer.png'

import searchIco  from '../../assets/img/9_serch.png'


class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            idZone: this.props.match.params.idZone,
            goTaskManager: false,
            modalVisible: false,
            taskManagerHistoryData: null,
            modalStyle: null,
            modalFilterVisible: false,
            filterAllList: ["alert_maintenance", "advice_maintenance", "alert_fertilizer", "advice_fertilizer", "alert_humidity", "advice_humidity", "alert_soil_moisture", "advice_soil_moisture", "advice_meteo", "alert_meteo", "manual", "automatic", "realtime_program"],
            filter: [],
            filtering: false,
        };
        this.props.actions.fliwerZoneActions.getZoneData(this.props.match.params.idZone).then(() => {
            this.forceUpdate();
        });

        this.state.filter = this.state.filter.concat(this.state.filterAllList);

        this.rerenderParentCallback = this.rerenderParentCallback.bind(this);

    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.idZone !== this.state.idZone)
            this.setState({idZone: this.props.match.params.idZone});
    }

    async rerenderParentCallback() {
        this.setState({modalVisible: false});
        await this.props.actions.fliwerZoneActions.getZoneData(this.props.match.params.idZone).then(() => {
            this.forceUpdate();
        });
    }

    setModalVisible(visible, data, modalStyle) {
        this.setState({modalVisible: visible, taskManagerHistoryData: data, modalStyle: modalStyle});
    }

    modalClosed() {
        this.setState({modalVisible: false});
    }

    modalFilterOpen() {
        this.setState({modalFilterVisible: true});
    }

    modalFilterClosed() {
        this.setState({modalFilterVisible: false});
    }

    onUpdate(filter)
    {
        var filtering = null;
        if (filter.length == this.state.filterAllList.length)
            filtering = false;
        else
            filtering = true;

        this.setState({filter: filter, filtering: filtering});
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

        this.setState({goNextGarden: true});
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

        this.setState({goNextGarden: true});
    }

    render() {
        //console.log("render history");
        if (this.state.goNextGarden) {
            this.state.goNextGarden = false;
            return (<Redirect push to={"/zone/" + this.state.foundZoneId + "/history/"} />)
        } else
        {
            if (this.state.idZone && this.state.goTaskManager) {
                return (<Redirect push to={"/zone/" + this.state.idZone + "/taskManager"} />)
            } else {
                var zone = this.props.zoneData[this.props.match.params.idZone];
                if (!zone || !zone.idImageDash) {
                    return (<Redirect push to={"/zone"} />);
                }
                var garden = this.props.gardenData[zone.idImageDash];
                var home = this.props.homeData[garden.idHome];

                var zones = Object.values(this.props.zoneData);

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener)
                    bottomIcons.push("gardener");
                bottomIcons.push("zone", "files");

                return (
                        <ImageBackground source={background} resizeMode={"cover"}>
                            <MainFliwerTopBar showTextBar={true} mode={'zone'} title={home.name + " - " + zone.name} onPressNextGarden={zones.length>1?this.nextGarden:null} onPressPreviousGarden={zones.length>1?this.previousGarden:null}/>
                            <MainFliwerMenuBar idZone={this.state.idZone} current={"history"} icons={topIcons} position={"top"} />
                            <ImageBackground resizeMode={"cover"} loading={this.state.loading}>
                                <View style={[this.style.historyContainer, Platform.OS == "android" || Platform.OS == 'ios' ? {maxWidth: null, paddingLeft: 0, paddingRight: 0, paddingTop: 0, bottom: 51, top: 0} : {}]}>
                                    <View style={[this.style.historyTopBarContainer, Platform.OS == "android" || Platform.OS == 'ios' ? {borderTopRightRadius: 0, borderTopLeftRadius: 0} : {}]}>
                                        <View style={this.style.historyTopBarLeftContainer}>
                                            <View style={this.style.historyTopBarLeftImageContainer}>
                                                <Image key={1} style={[this.style.historyTopBarLeftImage]} draggable={false} source={icofliwer} resizeMode={"contain"} />
                                            </View>
                                            <View style={this.style.historyTopBarLeftTextContainer}>
                                                <Text style={this.style.historyTopBarLeftText}>Fliwer</Text>
                                            </View>
                                        </View>
                                        <View style={[this.style.historyTopBarCenterContainer, {opacity: 1}]}>
                                            <FliwerGreenButton
                                                onPress={() => {
                                                    if (this.props.isVisitor)
                                                        toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                                                    else {
                                                        this.setState({idZone: this.props.match.params.idZone, goTaskManager: true})
                                                    }
                                                }} text={this.props.actions.translate.get('history_top_bar_buttonTaskManager_name')} containerStyle={this.style.button} />
                                        </View>
                                        <TouchableOpacity style={[this.style.historyTopBarRightContainer, {opacity: 0}]} disabled={true}
                                            onPress={() => {
                                                this.modalFilterOpen()
                                            }}>
                                            <View style={this.style.historyTopBarRightImageContainer}>
                                                <Image key={1} style={[this.style.historyTopBarRightImage]} draggable={false} source={searchIco} resizeMode={"contain"} />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={this.style.line}></View>
                                    <View style={[this.style.historyBodyContainer, Platform.OS == "android" || Platform.OS == 'ios' ? {borderBottomRightRadius: 0, borderBottomLeftRadius: 0} : {}]}>
                                        <FliwerHistory filter={this.state.filter} filtering={this.state.filtering} idZone={this.props.match.params.idZone}
                                            openModal={(visible, data, modalStyle) => {
                                                this.setModalVisible(visible, data, modalStyle)
                                            }}/>
                                    </View>
                                </View>
                                {this.renderModalFilter()}
                                <FliwerProgramDetail
                                    idZone={this.props.match.params.idZone}
                                    rerenderParentCallback={this.rerenderParentCallback}
                                    visible={this.state.modalVisible}
                                    modalClosed={() => {
                                        this.modalClosed()
                                    }}
                                    data={this.state.taskManagerHistoryData}
                                    modalStyle={this.state.modalStyle}/>
                            </ImageBackground>
                            <MainFliwerMenuBar idZone={this.state.idZone} current={"history"} icons={bottomIcons} />
                        </ImageBackground>
                        );
            }
        }
    }

    renderModalFilter() {
        var zone = this.props.zoneData[this.state.idZone];
        if (this.state.modalFilterVisible) {
            return (<FliwerHistoryFilter visible={this.state.modalFilterVisible} minData={zone.creationTime} onUpdate={(filter) => this.onUpdate(filter)} modalClosed={() => {
                                this.modalFilterClosed()
                            }} filterList={this.state.filter} filterAllList={this.state.filterAllList} modalStyle={this.state.modalFilterStyle}/>)
        } else
            return []
    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.visitorCheckidUser,
    }
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
    }
}

//Connect everything

var styles = {
    historyContainer: {
        paddingTop: 10,
        paddingRight: 20,
        paddingLeft: 20,
        width: "100%",
        alignItems: "center",
        alignSelf: "center",
        maxWidth: 1250,
        height:"100%"
    },
    historyTopBarContainer: {
        height: 50,
        width: "100%",
        backgroundColor: FliwerColors.secondary.white,
        flexDirection: "row",
        alignItems: 'center',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingRight: 15,
        paddingLeft: 15,
    },
    historyBodyContainer: {
        width: "100%",
        flexShrink: 1,
        flexGrow:1,
        backgroundColor: FliwerColors.secondary.white,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
    },
    historyTopBarCenterContainer: {
        height: "100%",
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: "center",

    },
    historyTopBarRightContainer: {
    },
    historyTopBarCenterIn: {
        height: "100%",
        width: "100%",
    },
    historyTopBarRightImageContainer: {
        height: 21,
        width: 21,
    },
    historyTopBarLeftContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: 'center',

    },
    historyTopBarLeftImage: {
        height: "100%",
        width: "100%",
    },
    historyTopBarLeftImageContainer: {
        height: 40,
        width: 40,
    },
    historyTopBarLeftTextContainer: {
        paddingLeft: 5,
    },
    historyTopBarLeftText: {
        fontFamily: FliwerColors.fonts.regular,
    },
    historyTopBarRightImage: {
        height: "100%",
        width: "100%",
    },
    line: {
        width: "100%",
        height: 1,
        backgroundColor: FliwerColors.secondary.gray
    },
    button: {
        height: 35,
        width: "80%",
        maxWidth: 200,
        marginBottom: 0
    },
    ":hover": {
        taskmanagerButton: {
            backgroundColor: "red",
            filter: "brightness(220%)"
        },
    },

};
if (Platform.OS == "web") {
    //styles.containerIn.flexShrink=1;
    //styles["@media (orientation:portrait)"].taskManagerContainer.paddingLeft="75%";
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, History)));
