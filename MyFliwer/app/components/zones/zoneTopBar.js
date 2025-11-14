'use strict';

import React, { Component } from 'react';
import {StyleSheet, View, ScrollView, Image, Text, TouchableOpacity} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import alert_light  from '../../assets/img/alert_light.png'
import alert_temp  from '../../assets/img/alert_temp.png'
import alert_airh  from '../../assets/img/alert_airh.png'
import alert_soilm  from '../../assets/img/alert_soilm.png'
import alert_fert  from '../../assets/img/alert_fert.png'
import alert_maint  from '../../assets/img/alert_maint.png'
import alert_meteo  from '../../assets/img/alert_meteo.png'
import alert_light_gray  from '../../assets/img/alert_light_gray.png'
import alert_temp_gray  from '../../assets/img/alert_temp_gray.png'
import alert_airh_gray  from '../../assets/img/alert_airh_gray.png'
import alert_soilm_gray  from '../../assets/img/alert_soilm_gray.png'
import alert_fert_gray  from '../../assets/img/alert_fert_gray.png'
import alert_maint_gray  from '../../assets/img/alert_maint_gray.png'
import alert_meteo_gray  from '../../assets/img/alert_meteo_gray.png'
import alert_light_gray2  from '../../assets/img/alert_light_gray2.png'
import alert_temp_gray2  from '../../assets/img/alert_temp_gray2.png'
import alert_airh_gray2  from '../../assets/img/alert_airh_gray2.png'
import alert_soilm_gray2  from '../../assets/img/alert_soilm_gray2.png'
import alert_fert_gray2  from '../../assets/img/alert_fert_gray2.png'
import alert_maint_gray2  from '../../assets/img/alert_maint_gray2.png'
import alert_meteo_gray2  from '../../assets/img/alert_meteo_gray2.png'

class zoneTopBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    render() {
        const {children} = this.props

        if (this.state.returnHome)
            return (<Redirect push to={"/"} />)
        else {
            return (
                    <View style={this.style.container}>
                        <View style={this.style.bar}>
                            {this.icons()}
                        </View>
                        <View style={this.style.containerIn}>
                            { children }
                        </View>
                    </View>
                    )
        }
    }

    icons() {
        const {filter, alerts, disableLight, disableTemp, disableAirh, disableSoilm, disableFert, disableMaint, disableMeteo} = this.props;
        var zone = this.props.zoneData[this.props.idZone];

        if(!zone) return null;

        return(
                <View style={this.style.iconSpace}>
                    <TouchableOpacity style={this.style.icon} disabled={disableLight} activeOpacity={1} onMouseEnter={disableLight ? null : this.hoverIn('iconImageLight')} onMouseLeave={this.hoverOut('iconImageLight')} onPress={() => {
                        this.props.updateFilter('light')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageLight]} draggable={false} resizeMode={"contain"} source={disableLight ? alert_light_gray2 : (filter == 'light' ? alert_light : alert_light_gray)} />
                            <Text style={this.style.iconText}>{disableLight || !zone.genericInfo.sensors.light.units ? null : (parseInt((zone.genericInfo.sensors.light.value ? zone.genericInfo.sensors.light.value : (zone.data && zone.data.light_inst.length > 0 ? zone.data.light_inst[zone.data.light_inst.length - 1].value : 0)) * 100) / 100 + zone.genericInfo.sensors.light.units)}</Text>
                            {disableLight ? null : this.renderAlertNumber("light")}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.style.icon} disabled={disableTemp} activeOpacity={1} onMouseEnter={disableTemp ? null : this.hoverIn('iconImageTemp')} onMouseLeave={this.hoverOut('iconImageTemp')} onPress={() => {
                        this.props.updateFilter('temp')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageTemp]} draggable={false} resizeMode={"contain"} source={disableTemp ? alert_temp_gray2 : (filter == 'temp' ? alert_temp : alert_temp_gray)} />
                            <Text style={this.style.iconText}>{disableTemp || !zone.genericInfo.sensors.temp.units ? null : (parseInt(zone.genericInfo.sensors.temp.value * 100) / 100 + zone.genericInfo.sensors.temp.units)}</Text>
                            {disableTemp ? null : this.renderAlertNumber("temp")}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.style.icon} disabled={disableAirh} activeOpacity={1} onMouseEnter={disableAirh ? null : this.hoverIn('iconImageAirh')} onMouseLeave={this.hoverOut('iconImageAirh')} onPress={() => {
                        this.props.updateFilter('airh')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageAirh]} draggable={false} resizeMode={"contain"} source={disableAirh ? alert_airh_gray2 : (filter == 'airh' ? alert_airh : alert_airh_gray)} />
                            <Text style={this.style.iconText}>{disableAirh || !zone.genericInfo.sensors.airh.units ? null : (parseInt((zone.genericInfo.sensors.airh.value ? zone.genericInfo.sensors.airh.value : (zone.data && zone.data.hum_inst.length > 0 ? zone.data.hum_inst[zone.data.hum_inst.length - 1].value : 0)) * 100) / 100 + zone.genericInfo.sensors.airh.units)}</Text>
                            {disableAirh ? null : this.renderAlertNumber("airh")}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.style.icon} disabled={disableSoilm} activeOpacity={1} onMouseEnter={disableSoilm ? null : this.hoverIn('iconImageSoilm')} onMouseLeave={this.hoverOut('iconImageSoilm')} onPress={() => {
                        this.props.updateFilter('soilm')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageSoilm]} draggable={false} resizeMode={"contain"} source={disableSoilm ? alert_soilm_gray2 : (filter == 'soilm' ? alert_soilm : alert_soilm_gray)} />
                            <Text style={this.style.iconText}>{disableSoilm || !zone.genericInfo.sensors.soilm.units ? null : (parseInt(zone.genericInfo.sensors.soilm.value * 100) / 100 + (zone.genericInfo.sensors.soilm.units == "%" ? zone.genericInfo.sensors.soilm.units : (" " + zone.genericInfo.sensors.soilm.units)))}</Text>
                            {disableSoilm ? null : this.renderAlertNumber("soilm")}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.style.icon} disabled={disableFert} activeOpacity={1} onMouseEnter={disableFert ? null : this.hoverIn('iconImageFert')} onMouseLeave={this.hoverOut('iconImageFert')} onPress={() => {
                        this.props.updateFilter('fert')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageFert]} draggable={false} resizeMode={"contain"} source={disableFert ? alert_fert_gray2 : (filter == 'fert' ? alert_fert : alert_fert_gray)} />
                            <Text style={this.style.iconText}>{disableFert || !zone.genericInfo.sensors.fert.units ? null : (parseInt((zone.data && zone.data.fert.length > 0 ? zone.data.fert[zone.data.fert.length - 1].value : 0) * 100) / 100 + (zone.genericInfo.sensors.fert.units == "μS" ? zone.genericInfo.sensors.fert.units : (" " + zone.genericInfo.sensors.fert.units)))}</Text>
                            {disableFert ? null : this.renderAlertNumber("fert")}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.style.icon} disabled={disableMaint} activeOpacity={1} onMouseEnter={disableMaint ? null : this.hoverIn('iconImageMaint')} onMouseLeave={this.hoverOut('iconImageMaint')} onPress={() => {
                        this.props.updateFilter('maint')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageMaint]} draggable={false} resizeMode={"contain"} source={disableMaint ? alert_maint_gray2 : (filter == 'maint' ? alert_maint : alert_maint_gray)} />
                            <Text style={this.style.iconText}></Text>
                            {disableMaint ? null : this.renderAlertNumber("maint")}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={this.style.icon} disabled={disableMeteo} activeOpacity={1} onMouseEnter={disableMeteo ? null : this.hoverIn('iconImageMeteo')} onMouseLeave={this.hoverOut('iconImageMeteo')} onPress={() => {
                        this.props.updateFilter('meteo')
                    }}>
                        <View style={this.style.iconInside}>
                            <Image style={[this.style.iconImage, this.style.iconImageMeteo]} draggable={false} resizeMode={"contain"} source={disableMeteo ? alert_meteo_gray2 : (filter == 'meteo' ? alert_meteo : alert_meteo_gray)} />
                            <Text style={this.style.iconText}></Text>
                            {disableMeteo ? null : this.renderAlertNumber("meteo")}
                        </View>
                    </TouchableOpacity>
                </View>
                )
    }

    renderAlertNumber(filter) {
        if (this.props.zoneData[this.props.idZone].genericInfo.sensors[filter].alerts)
            return(
                    <View style={this.style.alertNumber}>
                        <Text style={this.style.alertNumberText}>{this.props.zoneData[this.props.idZone].genericInfo.sensors[filter].alerts}</Text>
                    </View>
                    )
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        zoneLoading: state.fliwerZoneReducer.loading,
        zoneData: state.fliwerZoneReducer.data
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
        }
    };
}


var styles = {
    container: {
        position: "relative"
    },
    iconInside: {
        width: "100%",
        position: "absolute",
        height: "100%"
    },
    alertNumber: {
        position: "absolute",
        bottom: "20%",
        width: 22,
        height: 22,
        backgroundColor: "red",
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center"
    },
    alertNumberText: {
        color: "white"
    },/*
    "@media (orientation:landscape)": {
        container: {
            display: "flex",
            flexDirection: "row",
            height: "100%"
        },
        containerIn: {
            position: "absolute",
            height: "100%",
            left: 60,
            right: 0,
            width: "auto"
        },
        bar: {
            height: "100%",
            backgroundColor: "#55585d",
            width: 60,
        },
        iconSpace: {
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 10
        },
        icon: {
            flex: 1,
            width: "100%"
        },
        iconImage: {
            height: "100%",
            left: "10%",
            width: "80%"
        },
        iconText: {
            width: "100%",
            color: "white",
            bottom: 0,
            fontSize: 10,
            textAlign: "center",
            position: "absolute"
        },
        alertNumber: {
            right: 2
        },
        "@media (height<=630)": {//tablets in landscape
            iconImage: {
                top: 0,
                height: "70%"
            },
            alertNumber: {
                width: 20,
                height: 20
            },
            alertNumberText: {
                fontSize: 13
            }
        },
        "@media (height<=470)": {//phones in landscape
            iconImage: {
                top: 0,
                height: "65%"
            },
            iconSpace: {
                paddingTop: 3,
                paddingBottom: 3
            },
            iconText: {
                bottom: 3
            },
            alertNumber: {
                bottom: "32%",
                height: 15,
                right: 7,
                width: 15
            },
            alertNumberText: {
                fontSize: 10
            }
        }
    },
    "@media (orientation:portrait)": {*/
        container: {
            height: "100%",
            position: "absolute",
            width: "100%"
        },
        bar: {
            height: 60,
            backgroundColor: "#55585d",
            width: "100%"
        },
        iconSpace: {
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: 'row',
            alignItems: 'center'
        },
        icon: {
            flex: 1,
            height: "100%"
        },
        iconImage: {
            width: "100%",
            height: "57%",
            bottom: 0,
            top: 6
        },
        iconText: {
            width: "100%",
            bottom: 5,
            color: "white",
            fontSize: 10,
            textAlign: "center",
            position: "absolute"
        },
        containerIn: {
            position: "absolute",
            top: 60,
            bottom: 0,
            width: "100%"
        },
        alertNumber: {
            bottom: "32%",
            height: 18,
            width: 18,
            left: 5
        },
        alertNumberText: {
            fontSize: 12
        },/*
    },*/
    ":hover": {
        iconImageLight: {
            filter: "brightness(170%)"
        },
        iconImageTemp: {
            filter: "brightness(170%)"
        },
        iconImageAirh: {
            filter: "brightness(170%)"
        },
        iconImageSoilm: {
            filter: "brightness(170%)"
        },
        iconImageFert: {
            filter: "brightness(170%)"
        },
        iconImageMaint: {
            filter: "brightness(170%)"
        },
        iconImageMeteo: {
            filter: "brightness(170%)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, zoneTopBar));
