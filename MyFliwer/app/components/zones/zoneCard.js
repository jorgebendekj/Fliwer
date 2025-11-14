'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import FliwerCarousel from '../custom/FliwerCarousel'
import FliwerImage from '../custom/FliwerImage.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/FontAwesome';

import { Redirect } from '../../utils/router/router'

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import iconAlert  from '../../assets/img/zoneCard_backAlert.png'
import iconTool  from '../../assets/img/zoneCard_backTool.png'
import iconPlant  from '../../assets/img/zoneCard_backPlant.png'
import iconTask  from '../../assets/img/zoneCard_backTask.png'

import shadow  from '../../assets/img/zoneCard_shadow.png'
import alertZoneIcon  from '../../assets/img/4_Alarm.png'
import homeIcon  from '../../assets/img/5_House.png'
import loggerIcon  from '../../assets/img/device_logger.png'
import sensorIcon  from '../../assets/img/6_Sensor-planted.png'
import controlIcon  from '../../assets/img/6_Control.png'
import linkIcon  from '../../assets/img/6_Link.png'
import sdialIcon  from '../../assets/img/6_S-dial.png'
import wdialIcon  from '../../assets/img/6_W-dial.png'

import configIcon  from '../../assets/img/9-Configuration.png'
import turn3  from '../../assets/img/3_Turn3.png'
import turn4  from '../../assets/img/3_Turn4.png'

class ZoneCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            idZone: null,
            goPlants: false,
            goDevices: false,
            goHistory: false,
            currentIndex: 0,
            filter: null
        }

    }
 
    getZoneAlerts() {
        if (this.props.alerts != 0)
        {
            var zone = this.props.zoneData[this.props.idZone];
            return zone.alerts.concat(zone.advices);
        } else
            return []
    }

    alertSubCategoryToIcon() {

    }

    render() {
        if (this.state.idZone && this.state.goPlants) {
            return (<Redirect push to={"/zone/" + this.state.idZone + "/plants"} />)
        } else if (this.state.idZone && this.state.goDevices) {
            return (<Redirect push to={"/zone/" + this.state.idZone + "/devices"} />)
        } else if (this.state.idZone && this.state.goHistory) {
            return (<Redirect push to={"/zone/" + this.state.idZone + "/history"} />)
        } else if (this.state.idZone) {
            return (<Redirect push to={"/zone/" + this.state.idZone + (this.state.filter ? "/filter/" + this.state.filter : "")} />)
        } else {

            return (
                <FliwerCard ref="card"
                    touchableFront={!this.props.touchableFront?(this.props.touchableFront==false?false:true):(this.props.touchableFront?true:false)}
                    touchableBack={false}
                    cardStyle={!this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)}}
                    OntoggleEnd={()=>{
                      if(Platform.OS=='web')this.forceUpdate();
                    }}
                >
                    <View>
                        <View style={this.style.frontCard}>
                            {this.renderCardFront()}
                        </View>
                    </View>
                    <View>
                        {this.renderCardBack()}
                    </View>
                </FliwerCard>

            );
        }
    }

    toggle() {
        var that = this;
        return function () {
            that.refs.card._toggleCard()
        }
    }

    renderCardFront() {
        var card = [];

        if (typeof this.props.onPressAdd === 'function')
            return (
                <TouchableOpacity style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}}
                    onPress={()=>this.props.onPressAdd()}
                    >
                    <Text key={987} style={{fontSize: 100, marginTop: -15, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                </TouchableOpacity>
            );

        if (this.props.title)
            card.push(<Text key={1} style={this.style.title}>{this.props.title.toUpperCase()}</Text>)
        if (this.props.subtitle)
            card.push(<Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>)

            //<Image style={this.style.image} source={{uri: this.props.image}} draggable={false} />
        card.push(<View key={3} style={this.style.imageCarouselContainer}>
            {this.props.image ?
                <FliwerImage
                    draggable={false}
                    containerStyle={this.style.image}
                    style={{width: "100%", height: "100%"}}
                    resizeMode={"cover"}
                    source={{uri: this.props.image}}
                    setLoading={()=>{}}
                    loaderStyle={{/*width: 40, height: 40*/}}
                />
            : []}
            {this.renderFliwerCarousel()}
        </View>);

        if (this.getZoneAlerts().length > 0)
            card.push(<Image key={5} style={this.style.alertZoneIcon} source={alertZoneIcon} resizeMode={"contain"} />);

        card.push(
                <View key={6} style={this.style.devicesFrontView}>
                    {this.renderDevicesZoneIcons()}
                </View>
                );

        card.push(
                <View key={7} style={this.style.homeView}>
                    <Image style={this.style.homeIcon} source={homeIcon} resizeMode={"contain"}/>
                    <Text style={this.style.homeText}>{this.props.homeName.toUpperCase()}</Text>
                </View>
                );

        return card;
    }

    renderFliwerCarousel() {
        var card = [];
        if (this.props.alerts != 0 && this.getZoneAlerts().length > 0) {
            card.push(<Image style={this.style.carouselShadow} source={shadow} draggable={false} resizeMode={"cover"}/>)
            card.push(<FliwerCarousel
                autoplay={true}
                renderItem={(slide) => {
                                          return (
                                                  <TouchableOpacity activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                                                          this.setState({idZone: this.props.idZone, filter: FliwerAlertMedia.subCategoryToMedia(slide.item.subcategory).filter})
                                                      }}>
                                                  <View style={this.style.carouseSlide}>
                                                      <Image style={this.style.carouselAlertIcon} source={FliwerAlertMedia.subCategoryToMedia(slide.item.subcategory).img} draggable={false} />
                                                      <Text style={this.style.carouselAlertText}>{(slide.item.title ? slide.item.title : FliwerAlertMedia.subCategoryToMedia(slide.item.subcategory).title)}</Text>
                                                  </View>
                                              </TouchableOpacity>
                                                  )
                                      }}
                style={this.style.carousel}
                data={this.getZoneAlerts()}
                />)
            card.push(<View style={this.style.imageTopAlertBar}></View>)
            card.push(<View style={this.style.imageBottomAlertBar}></View>)

            return card;
        } else
            return null;
    }

    renderDevicesZoneIcons() {
        if (this.props.devicesCount)
        {

            var card = [];
            var countLogger = this.props.devicesCount.loggers;
            var countSensor = this.props.devicesCount.sensors;
            var countLink = this.props.devicesCount.links_wifi + this.props.devicesCount.links_gprs;
            var countSDial = this.props.devicesCount.sDials;
            var countWDial = this.props.devicesCount.wDials;
            var countControl = this.props.devicesCount.controls_9 + this.props.devicesCount.controls_24;


            if (countLogger > 0)
                card.push(
                        <View style={[this.style.sensorIconContainer]}>
                            <Image style={[this.style.sensorIcon]} source={loggerIcon} resizeMode={"contain"}/>
                            {this.drawCountDevice(countLogger)}
                        </View>)
            if (countSensor > 0)
                card.push(
                        <View style={[this.style.sensorIconContainer]}>
                            <Image style={[this.style.sensorIcon]} source={sensorIcon} resizeMode={"contain"}/>
                            {this.drawCountDevice(countSensor)}
                        </View>)
            if (countLink > 0)
                card.push(
                        <View style={[this.style.sensorIconContainer]}>
                            <Image style={[this.style.sensorIcon]} source={linkIcon} resizeMode={"contain"}/>
                            {this.drawCountDevice(countLink)}
                        </View>)
            if (countSDial > 0)
                card.push(
                        <View style={[this.style.sensorIconContainer]}>
                            <Image style={[this.style.sensorIcon]} source={sdialIcon} resizeMode={"contain"}/>
                            {this.drawCountDevice(countSDial)}
                        </View>)

            if (countControl > 0)
                card.push(
                        <View style={[this.style.sensorIconContainer]}>
                            <Image style={[this.style.sensorIcon]} source={controlIcon} resizeMode={"contain"}/>
                            {this.drawCountDevice(countControl)}
                        </View>)

            if (countWDial > 0)
                card.push(
                        <View style={[this.style.sensorIconContainer]}>
                            <Image style={[this.style.sensorIcon]} source={wdialIcon} resizeMode={"contain"}/>
                            {this.drawCountDevice(countWDial)}
                        </View>)

        } else {
            var zone = this.props.zoneData[this.props.idZone];
            var garden = this.props.gardenData[zone.idImageDash];
            var home = this.props.homeData[garden.idHome];
            var devices = Object.values(this.props.devices);

            var card = [];
            var hasSensor = false;
            var countSensor = 0;
            var countLink = 0;
            var countSDial = 0;
            var countWDial = 0;
            var countControl = 0;


            if (devices) {
                for (var index in devices) {
                    var device = devices[index];
                    if ((!hasSensor) && (device.type == "SENS" || device.type == "SENS_PRO")) {
                        if (device.idZone || device.zones) {
                            if (device.idZone == this.props.idZone || (device.zones && device.zones.find((z) => {
                                return z.idZone == this.props.idZone
                            }))) {
                                card.push(
                                        <View style={[this.style.sensorIconContainer]}>
                                            <Image style={[this.style.sensorIcon]} source={(device.type == "SENS") ? sensorIcon : loggerIcon} resizeMode={"contain"}/>
                                        </View>)
                                hasSensor = true;
                            }
                        }
                    }

                    if ((device.type == "LINK_WIFI_PRO" || device.type == "LINK_WIFI" || device.type == "LINK_GPRS_PRO" || device.type == "LINK_GPRS") && (device.idHome == garden.idHome)) {
                        countLink++;
                    }
                    if ((device.type == "UNIPRO16" || device.type == "UNIPRO12" || device.type == "UNIPRO9" || device.type == "UNIPRO6") && (device.idHome == garden.idHome)) {
                        countSDial++;
                    }
                    if (((device.type == "CONTROL_9" || device.type == "CONTROL_24") && (device.idHome == garden.idHome))) {
                        countControl++;
                    }
                    if (((device.type == "TBD6" || device.type == "TBD4" || device.type == "TBD2" || device.type == "TBD1") && (device.idHome == garden.idHome))) {
                        countWDial++;
                    }
                }

                if (countLink > 0)
                    card.push(
                            <View style={[this.style.sensorIconContainer]}>
                                <Image style={[this.style.sensorIcon]} source={linkIcon} resizeMode={"contain"}/>
                                {this.drawCountDevice(countLink)}
                            </View>)
                if (countSDial > 0)
                    card.push(
                            <View style={[this.style.sensorIconContainer]}>
                                <Image style={[this.style.sensorIcon]} source={sdialIcon} resizeMode={"contain"}/>
                                {this.drawCountDevice(countSDial)}
                            </View>)

                if (countControl > 0)
                    card.push(
                            <View style={[this.style.sensorIconContainer]}>
                                <Image style={[this.style.sensorIcon]} source={controlIcon} resizeMode={"contain"}/>
                                {this.drawCountDevice(countControl)}
                            </View>)

                if (countWDial > 0)
                    card.push(
                            <View style={[this.style.sensorIconContainer]}>
                                <Image style={[this.style.sensorIcon]} source={wdialIcon} resizeMode={"contain"}/>
                                {this.drawCountDevice(countWDial)}
                            </View>)
            }
        }
        return card;
    }

    renderDevices(countLink, countSDial, countControl, countWDial, countSensor) {
        var card = []
        if (countSensor > 0)
            card.push(
                    <View style={[this.style.sensorIconContainer]}>
                        <Image style={[this.style.sensorIcon]} source={sensorIcon} resizeMode={"contain"}/>
                        {this.drawCountDevice(countSensor)}
                    </View>)
        if (countLink > 0)
            card.push(
                    <View style={[this.style.sensorIconContainer]}>
                        <Image style={[this.style.sensorIcon]} source={linkIcon} resizeMode={"contain"}/>
                        {this.drawCountDevice(countLink)}
                    </View>)
        if (countSDial > 0)
            card.push(
                    <View style={[this.style.sensorIconContainer]}>
                        <Image style={[this.style.sensorIcon]} source={sdialIcon} resizeMode={"contain"}/>
                        {this.drawCountDevice(countSDial)}
                    </View>)

        if (countControl > 0)
            card.push(
                    <View style={[this.style.sensorIconContainer]}>
                        <Image style={[this.style.sensorIcon]} source={controlIcon} resizeMode={"contain"}/>
                        {this.drawCountDevice(countControl)}
                    </View>)

        if (countWDial > 0)
            card.push(
                    <View style={[this.style.sensorIconContainer]}>
                        <Image style={[this.style.sensorIcon]} source={wdialIcon} resizeMode={"contain"}/>
                        {this.drawCountDevice(countWDial)}
                    </View>)

        return card;
    }

    drawCountDevice(count) {
        var card = []
        card.push(
                <View style={this.style.circleCountDevices}>
                    <Text style={this.style.circleCountDevicesTextNumber}>{count}</Text>
                </View>
                )
        if (count > 1)
            return card;
        else
            return null;
    }

    renderCardBack() {

        if (typeof this.props.onPressAdd === 'function')
            return null;

        return (
                <View style={this.style.backCard}>
                    <View style={this.style.backCardButtons}>
                        <TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.backCardButtonBack} onMouseEnter={this.hoverIn('backCardButtons')} onMouseLeave={this.hoverOut('backCardButtons')}>
                            <Image style={this.style.backCardButtonTurn1} source={turn3} resizeMode={"contain"}/>
                            <Text style={this.style.backCardButtonText}>{this.props.actions.translate.get('gardenCard_back_back_button')}</Text>
                            <Image style={this.style.backCardButtonTurn2} source={turn4} resizeMode={"contain"}/>
                        </TouchableOpacity>
                    </View>
                    <Text style={this.style.titleBack}>{this.props.title.toUpperCase()}</Text>
                    <TouchableOpacity  style={this.style.backCardConfig}  activeOpacity={1} onPress={() => {
                            if (this.props.modalFunc) {
                                this.props.modalFunc(true, this.props.idZone);
                            }
                        }} onMouseEnter={this.hoverIn('configIcon')} onMouseLeave={this.hoverOut('configIcon')}>
                        <Image style={this.style.configIcon} source={configIcon} resizeMode={"contain"}/>
                    </TouchableOpacity>

                    <View style={this.style.backCardMenu}>
                        <View style={this.style.leftSide}>
                            <View style={[this.style.topSide, this.style.iconContainer]}>
                                <TouchableOpacity activeOpacity={1} style={[this.style.iconContainerIn, this.style.alertIcon]} onMouseEnter={this.hoverIn('alertIcon')} onMouseLeave={this.hoverOut('alertIcon')} onPress={() => {
                                        this.setState({idZone: this.props.idZone})
                                    }}>
                                    <Image style={[this.style.backIcon]} source={iconAlert} resizeMode={"contain"}/>
                                    <Text style={this.style.backText} ellipsizeMode='tail' numberOfLines={1}>{this.props.actions.translate.get('gardenCard_back_alerts')}</Text>
                                    <View>
                                        {this.drawParameterAlertCircle()}
                                    </View>
                                </TouchableOpacity>

                            </View>
                            <View style={[this.style.bottomSide, this.style.iconContainer]}>
                                <TouchableOpacity activeOpacity={1} style={this.style.iconContainerIn} onMouseEnter={this.hoverIn('plantIcon')} onMouseLeave={this.hoverOut('plantIcon')} onPress={() => {
                                        this.setState({idZone: this.props.idZone, goPlants: true})
                                    }}>
                                    <Image style={[this.style.backIcon, this.style.plantIcon]} source={iconPlant} resizeMode={"contain"}/>
                                    <Text style={this.style.backText} ellipsizeMode='tail' numberOfLines={1}>{this.props.actions.translate.get('gardenCard_back_plants')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={this.style.rightSide}>
                            <View style={[this.style.topSide, this.style.iconContainer]}>
                                <TouchableOpacity activeOpacity={1}  style={this.style.iconContainerIn} onMouseEnter={this.hoverIn('toolIcon')} onMouseLeave={this.hoverOut('toolIcon')} onPress={() => {
                                        this.setState({idZone: this.props.idZone, goDevices: true})
                                    }}>
                                    <Image style={[this.style.backIcon, this.style.toolIcon]} source={iconTool} resizeMode={"contain"}/>
                                    <Text style={this.style.backText} ellipsizeMode='tail' numberOfLines={1}>{this.props.actions.translate.get('gardenCard_back_tools')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[this.style.bottomSide, this.style.iconContainer]}>
                                <TouchableOpacity activeOpacity={1}  style={this.style.iconContainerIn} onMouseEnter={this.hoverIn('taskIcon')} onMouseLeave={this.hoverOut('taskIcon')} onPress={() => {
                                        this.setState({idZone: this.props.idZone, goHistory: true})
                                    }}>
                                    <Image style={[this.style.backIcon, this.style.taskIcon]} source={iconTask} resizeMode={"contain"}/>
                                    <Text style={[this.style.backText]} ellipsizeMode='tail' numberOfLines={1}>{this.props.actions.translate.get('gardenCard_back_task')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View pointerEvents="none" style={this.style.horitzontalBar}></View>
                        <View pointerEvents="none" style={this.style.verticalBar}></View>
                        {this.drawCentralAlertCircle()}
                        {this.drawCentralAlertText()}
                    </View>
                </View>
                );
    }

    drawParameterAlertCircle() {
        if (this.props.alerts != 0 && this.getZoneAlerts().length > 0) {
            var fsize = 10 //this.props.alerts<10?10:8;
            return (
                    <View style={[this.style.circleParameterAlert, this.style.circleParameterAlertKO]}>
                        <View pointerEvents="none" style={this.style.circleParameterAlertNumberOut}>
                            <Text style={[this.style.circleAlertNumber, {fontSize: fsize}]}>{this.getZoneAlerts().length}</Text>
                        </View>
                    </View>
                    )
        }
    }

    drawCentralAlertCircle() {
        if (this.props.alerts != 0 && this.getZoneAlerts().length > 0) {
            return (
                    <View style={[this.style.circleAlert, this.style.circleAlertKO]}>
                    </View>
                    )
        }
    }

    drawCentralAlertText() {
        if (this.getZoneAlerts().length > 0) {
            var fsize = this.props.alerts < 10 ? 30 : 25;
            return (
                    <View  pointerEvents="none" style={this.style.circleAlertNumberOut}>
                        <Text style={[this.style.circleAlertNumber, {fontSize: fsize}]}>{this.getZoneAlerts().length}</Text>
                    </View>
                    )
        }

    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        devices: state.fliwerDeviceReducer.devices,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
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
    circleCountDevicesTextNumber: {
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        display: "flex",
        fontSize: 7,
    },
    circleCountDevices: {
        width: 12,
        height: 12,
        borderRadius: 20,
        position: "absolute",
        left: "50%",
        top: 36,
        alignItems: "center",
        backgroundColor: FliwerColors.primary.black,
        justifyContent: "center",
    },
    frontCard: {
        height: 329,
        width: "100%"
    },
    backCard: {
        height: 329,
        width: "100%",
        display: "flex",
        flexDirection: "column"
    },
    backCardMenu: {
        height: "auto",
        position: "absolute",
        backgroundColor: "white",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: "100%",
        top: 40,
        bottom: 40
    },
    titleBack: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.gray,
        marginTop: 10,
        fontSize: 20,
    },
    backCardConfig: {
        position: "absolute",
        top: 11,
        right: 10
    },
    configIcon: {
        width: 30,
        height: 30
    },
    backCardButtons: {
        position: "absolute",
        backgroundColor: FliwerColors.secondary.green,
        bottom: 0,
        width: "100%",
        height: 50,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    backCardButtonBack: {
        position: "absolute",
        width: "100%",
        height: 40,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        flexDirection: "row"
    },
    backCardButtonText: {
        color: "white",
        fontSize: 16,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center",
        flexGrow: 1,
    },
    backCardButtonTurn1: {
        width: 20,
        height: 20,
        margin: 10
    },
    backCardButtonTurn2: {
        width: 20,
        height: 20,
        margin: 10
    },
    backCardButtonIcon1: {
        marginRight: 10,
        fontSize: 20
    },
    backCardButtonIcon2: {
        marginLeft: 10,
        fontSize: 20
    },
    horitzontalBar: {
        borderBottomColor: FliwerColors.secondary.green,
        borderBottomWidth: 1,
        position: "absolute",
        left: 30,
        right: 30,
        top: "50%"
    },

    verticalBar: {
        borderLeftColor: FliwerColors.secondary.green,
        borderLeftWidth: 1,
        position: "absolute",
        left: "50%",
        top: 15,
        bottom: 15
    },
    leftSide: {
        bottom: 0,
        position: "absolute",
        right: "50%",
        left: 0,
        top: 0
    },
    rightSide: {
        bottom: 0,
        top: 0,
        position: "absolute",
        left: "50%",
        right: 0
    },
    topSide: {
        position: "absolute",
        width: "100%",
        height: "50%"
    },
    iconContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    iconContainerIn: {
        flex: 1,
        width: "50%",
        height: "auto",
        alignItems: "center"
    },
    triangleAlert: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderRightWidth: 40,
        borderTopWidth: 40,
        borderRightColor: 'transparent',
        borderTopColor: 'red',
        position: "absolute",
        left: 0
    },
    triangleAlertNumber: {
        color: "white",
        textAlign: "center",
        width: 20,
        height: 30,
        left: 0,
        top: -4,
        fontSize: 24,
        zIndex: 1,
        position: "absolute"
    },
    triangleAlertNumberBorder: {
        color: "white",
        textAlign: "center",
        width: 20,
        height: 20,
        left: 0,
        top: 4,
        fontFamily: "AlrightSans-Medium",
        fontSize: 20,
        position: "absolute"
    },
    backIcon: {
        width: "100%",
        height: "45%",
        top: -14,
        marginTop: "50%"
    },
    backText: {
        position: "absolute",
        top: "60%",
        marginTop: 18,
        fontSize: 12
    },
    backIconDisabled: {
        filter: "brightness(220%)"
    },
    backTextDisabled: {
        filter: "brightness(320%)"
    },
    bottomSide: {
        position: "absolute",
        width: "100%",
        height: "50%",
        top: "50%"
    },
    circleParameterAlert: {
        width: 20,
        height: 20,
        borderRadius: 20,
        left: 23,
        top: -28,
        //backgroundColor:FliwerColors.secondary.red
        //marginLeft: -83,
        //marginTop: -64,
    },
    circleParameterAlertKO: {
        backgroundColor: FliwerColors.secondary.red
    },
    circleAlert: {
        width: 40,
        height: 40,
        borderRadius: 20,
        left: "50%",
        top: "50%",
        marginLeft: -20,
        marginTop: -20,
    },
    circleAlertKO: {
        backgroundColor: FliwerColors.secondary.red
    },
    circleAlertNumberOut: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
    },
    circleAlertNumber: {
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        flex: 1
    },
    circleParameterAlertNumberOut: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "absolute"
    },
    circleParameterAlertNumber: {
        color: "white",
        textAlign: "center",
        //fontFamily:"AlrightSans-Medium",
        flex: 1
    },
    imageCarouselContainer: {
        height: 164,
        width: "100%"
    },
    image: {
        width: "100%",
        height: 164,
        alignItems: "center"
    },
    imageTopAlertBar: {
        width: "100%",
        backgroundColor: "#fe4b4b",
        position: "absolute",
        top: 0,
        height: 3.5
    },
    imageBottomAlertBar: {
        width: "100%",
        backgroundColor: "#fe4b4b",
        position: "absolute",
        bottom: 0,
        height: 5
    },
    carousel: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    carouseSlide: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    carouselShadow: {
        width: "100%",
        height: "100%",
        position: "absolute"
    },
    carouselAlertIcon: {
        width: 80,
        height: 80,
        marginBottom: 10
    },
    carouselAlertText: {
        fontFamily: FliwerColors.fonts.regular,
        color: "white",
        fontSize: 16,
        paddingBottom: 20
    },
    alertZoneIcon: {
        width: 48,
        height: 35,
        position: "absolute",
        right: "6%",
        top: 45
    },
    devicesFrontView: {
        width: "100%",
        height: 66,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    sensorIconContainer: {
        width: 50,
        height: 50,
        paddingLeft: 3,
    },
    sensorIcon: {
        width: "100%",
        height: "100%",
    },
    homeView: {
        width: "100%",
        height: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 11
    },
    homeIcon: {
        width: 16,
        height: 16,
        marginRight: 10
    },
    homeText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 10
    },

    title: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        marginTop: 10,
        fontSize: 20,
        height: 30
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        marginBottom: 15,
        marginTop: -2,
        fontSize: 10
    },
    text: {
        width: '100%',
        textAlign: 'center'
    },
    "@media (orientation:portrait)": {
        backText: {
            marginTop: 20
        }
    },
    ":hover": {
        backCardButtons: {
            filter: "brightness(150%)"
        },
        configIcon: {
            filter: "brightness(70%)"
        },
        alertIcon: {
            filter: "brightness(220%)"
        },
        plantIcon: {
            filter: "brightness(150%)"
        },
        taskIcon: {
            filter: "brightness(150%)"
        },
        toolIcon: {
            filter: "brightness(120%)"
        }
    }
};


if (Platform.OS == 'web') {
    style.backCardButtonText.height = 13;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef:true})(mediaConnect(style, ZoneCard));

