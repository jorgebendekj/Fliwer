'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import FliwerSlideBar from '../../components/custom/FliwerSlideBar';
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

import Icon from 'react-native-vector-icons/EvilIcons';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'

import nothingIcon  from '../../assets/img/valve_nothing.png'

import {toast} from '../../widgets/toast/toast'
import { CheckBox  } from 'react-native-elements'
import Dropdown from '../../widgets/dropdown/dropdown';
import DatePicker from '../../widgets/datePicker/datePicker';

class ValveSensorCard extends Component {

    constructor(props) {
        super(props);

        var device = this.props.devices[this.props.idDevice];
        this.state = {
            timeout: null,
            minutes: null,
            replant: (device.idZone && this.props.zoneData[device.idZone] ? this.props.zoneData[device.idZone].replantTime : null),
            replantEnabled: true,
            replant2: null,
            replant2Enabled: false,
            replant3: null,
            replant3Enabled: false
        };

        if(device.idZone && !this.props.zoneData[device.idZone]){
            //load Zone data
            this.props.actions.fliwerZoneActions.getOneZone(device.idZone).then((zone)=>{
                this.setState({replant: zone.replantTime});
            })
        }

    }

    componentWillUnmount = () => {
        clearTimeout(this.state.timeout);
    }

    selectFlowMeterTick(value) {
        //this.props.parentLoading(true);
        var device = this.props.devices[this.props.idDevice];
        this.props.actions.fliwerDeviceActions.modifyFlowMeterTicks(this.props.idDevice, value).then((zoneChanged) => {
            //this.props.parentLoading(false);
            this.toggle()();
        })
    }

    updateValve(value) {
        var changes = {
            irrigationEnabled: value
        }
        if (typeof this.props.parentLoading === "function")
            this.props.parentLoading(true);
        this.props.actions.fliwerDeviceActions.modifyDevice(this.props.idDevice, changes).then(() => {
            if (typeof this.props.parentLoading === "function")
                this.props.parentLoading(false);
            console.log("success");
        }, (err) => {
            if (typeof this.props.parentLoading === "function")
                this.props.parentLoading(false);
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    updateValveMinutes(value) {
        this.setState({minutes: value});
        clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {

            var changes = {
                minutes: value
            }

            this.props.actions.fliwerDeviceActions.modifyDevice(this.props.idDevice, changes).then(() => {
                this.setState({minutes: null});
                console.log("success");
            }, (err) => {
                if (err && err.reason)
                    toast.error(err.reason);
            })

        }, 3000)

    }

    addMinute() {
        var device = this.props.devices[this.props.idDevice];
        var min = this.state.minutes ? this.state.minutes : (device.minutes ? device.minutes : 0);
        min++;
        if (min > 250)
            min = 1;
        this.updateValveMinutes(min);
    }

    subMinute() {
        var device = this.props.devices[this.props.idDevice];
        var min = this.state.minutes ? this.state.minutes : (device.minutes ? device.minutes : 0);
        min--;
        if (min < 1)
            min = 250;
        this.updateValveMinutes(min);
    }

    updateReplantTime(replant, sensorNumber) {
        var device = this.props.devices[this.props.idDevice];

        if (!device.idZone) {
            return;
        }

        var zone = device.idZone;
        if (sensorNumber)
        {
            device.zones.forEach(node => {
                if (node.loggerSensor == sensorNumber) {
                    zone = node.idZone;
                    return false;
                }
            });
        }

        this.props.actions.fliwerZoneActions.updateReplantTime(zone, replant,null).then(() => {
            if (sensorNumber == 2)
            {
                this.setState({replant2: replant});
            } else if (sensorNumber == 3)
            {
                this.setState({replant3: replant});
            } else
            {
                this.setState({replant: replant});
            }
            toast.notification(this.props.actions.translate.get("valveCard_zone_replantSuccess")); 

        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        });
    }

    printZones() {
        
        var device = this.props.devices[this.props.idDevice];
        var zones=this.props.actions.fliwerHomeActions.getZonesFromHome(device.idHome);

        if (device.idImageDash || device.idHome) {
            debugger;
            var that = this;
            var arr = Object.values(zones)/*.filter((z) => {
                if (gardens[z.idImageDash].idHome == device.idHome) {
                    return true;
                } else {
                    return false
                }
            })*/.map((z) => {
                return {label: z.name, value: z.idZone}
            });
            function compare(a, b) {
                if (a.label < b.label)
                    return -1;
                if (a.label > b.label)
                    return 1;
                return 0;
            }
            var aarray = arr.sort(compare);
            aarray.unshift({label: this.props.actions.translate.get("general_no_zone"), value: null});
            return aarray;
        } else {
            return [];
        }
    }

    render() {
        var {title} = this.props;
        var device = this.props.devices[this.props.idDevice];

        let cardViewLonger = {};
        if (device.type === "SENS_PRO")
        {
            cardViewLonger = this.style.cardViewLonger;
            
            this.state.replantEnabled = false;
            this.state.replant2Enabled = false;
            if (device.zones && device.zones.length > 0)
                device.zones.forEach(node => {
                    if (node.loggerSensor && node.idZone) {
                        if (node.loggerSensor == 1)
                        {
                            this.state.replant = this.props.zoneData[node.idZone].replantTime;
                            this.state.replantEnabled = true;

                            // Bug fixing. When deassing a zone of sensor, after that, device.idZone becomes null
                            if (!this.props.devices[this.props.idDevice].idZone)
                            {
                                this.props.devices[this.props.idDevice].idZone = node.idZone;
                            }
                        }
                        if (node.loggerSensor == 2)
                        {
                            this.state.replant2 = this.props.zoneData[node.idZone].replantTime;
                            this.state.replant2Enabled = true;
                        } else if (node.loggerSensor == 3)
                        {
                            this.state.replant3 = this.props.zoneData[node.idZone].replantTime;
                            this.state.replant3Enabled = true;
                        }
                    }
                });
        }

        if (this.state.conf) {
            if (this.hasValves(device.type))
                return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/" + this.props.idDevice + "/valves/"} />)
            else
                return (<Redirect push to={"/zone/" + this.props.idZone + "/devices/new/linkwifi/" + this.props.idDevice} />)
        } else if (this.state.idDevice) {
            return (<Redirect push to={"/device/" + this.state.idDevice} />)
        } else {
            return (
                    <FliwerCard ref="card" touchableFront={false} cardInStyle={this.style.valveCard} style={this.style.valveCard} touchableBack={false}>
                        <View>
                            <View style={[this.style.cardView, cardViewLonger]}>
                                <Text style={this.style.title}>{title}</Text>
                                {this.renderCardFront()}
                            </View>
                        </View>
                    </FliwerCard>
                    );
        }
    }

    renderCardFront() {
        var {hideActivationValvule} = this.props;
        var device = this.props.devices[this.props.idDevice];
        var card = [];
        //Replant
        if (device.idZone) {
            card.push(
                    <Text key={1} style={this.style.replantText}>{this.props.actions.translate.get("valveCard_zone_replantTime")}</Text>
                    );

            if (this.state.replantEnabled)
            {
                if (device.type === "SENS_PRO")
                {
                    card.push(
                        <Text key={101} style={this.style.replantText}>SENSOR 1</Text>
                        );
                }

                card.push(
                        <View key={2} style={this.style.datePickerContainer}>
                            <View style={this.style.datePickerContainerIn}>
                                <Text pointerEvents="none" style={this.style.datePickerText}>{this.state.replant ? moment(this.state.replant * 1000).format('LLL') : this.props.actions.translate.get("valveCard_zone_replantTimeNever")}</Text>
                                <DatePicker ref={(datepicker) => this._datepicker = datepicker} date={this.state.replant ? moment(this.state.replant * 1000).toDate() : moment().toDate()} mode="datetime" showYearDropdown={true} style={this.style.datePicker} customStyles={{dateInput: this.style.datePicker, dateText: this.style.datePickerText}} onChange={(replant) => {
                                this.updateReplantTime(replant / 1000);
                            }} />
                            </View>
                            <TouchableOpacity style={this.style.replantErase} onPress={() => {
                                                    this.updateReplantTime(null)
                            }}>
                                <Image style={this.style.replantEraseImage} draggable={false} source={nothingIcon} resizeMode={"contain"}/>
                            </TouchableOpacity>
                        </View>
                        );
                /*      
                card.push(
                        <FliwerGreenButton onPress={() => {
                                this._datepicker.touchableHandlePress()
                            }} textStyle={[Platform.OS == 'web' ? {height: 14} : {}]} style={[{}]} text={this.props.actions.translate.get("valveCard_zone_replantButton")} containerStyle={{height: 40, maxWidth: 200}}/>
                        );*/
            }
        }

        if (device.type === "SENS_PRO")
        {
            /*
             * SENSOR 2
             */
            if (this.state.replant2Enabled)
            {
                card.push(
                        <Text key={102} style={this.style.replantText}>SENSOR 2</Text>
                        );
                card.push(
                        <View key={103} style={this.style.datePickerContainer}>
                            <View style={this.style.datePickerContainerIn}>
                                <Text pointerEvents="none" style={this.style.datePickerText}>{this.state.replant2 ? moment(this.state.replant2 * 1000).format('LLL') : this.props.actions.translate.get("valveCard_zone_replantTimeNever")}</Text>
                                <DatePicker ref={(datepicker) => this._datepicker2 = datepicker} date={this.state.replant2 ? moment(this.state.replant2 * 1000).toDate() : moment().toDate()} mode="datetime" showYearDropdown={true} style={this.style.datePicker} customStyles={{dateInput: this.style.datePicker, dateText: this.style.datePickerText}} onChange={(replant) => {
                                this.updateReplantTime(replant / 1000, 2)
                            }} />
                            </View>
                            <TouchableOpacity style={this.style.replantErase} onPress={() => {
                                                    this.updateReplantTime(null, 2)
                            }}>
                                <Image style={this.style.replantEraseImage} draggable={false} source={nothingIcon} resizeMode={"contain"}/>
                            </TouchableOpacity>
                        </View>
                        );
                /*
                card.push(
                        <FliwerGreenButton onPress={() => {
                                this._datepicker2.touchableHandlePress()
                            }} textStyle={[Platform.OS == 'web' ? {height: 14} : {}]} style={[{}]} text={this.props.actions.translate.get("valveCard_zone_replantButton")} containerStyle={{height: 40, maxWidth: 200}}/>
                        );*/
            }

            /*
             * SENSOR 3
             */
            if (this.state.replant3Enabled)
            {
                card.push(
                        <Text key={104} style={this.style.replantText}>SENSOR 3</Text>
                        );
                card.push(
                        <View key={105} style={this.style.datePickerContainer}>
                            <View style={this.style.datePickerContainerIn}>
                                <Text pointerEvents="none" style={this.style.datePickerText}>{this.state.replant3 ? moment(this.state.replant3 * 1000).format('LLL') : this.props.actions.translate.get("valveCard_zone_replantTimeNever")}</Text>
                                <DatePicker ref={(datepicker) => this._datepicker3 = datepicker} date={this.state.replant3 ? moment(this.state.replant3 * 1000).toDate() : moment().toDate()} mode="datetime" showYearDropdown={true} style={this.style.datePicker} customStyles={{dateInput: this.style.datePicker, dateText: this.style.datePickerText}} onChange={(replant) => {
                                this.updateReplantTime(replant / 1000, 3)
                            }} />
                            </View>
                            <TouchableOpacity style={this.style.replantErase} onPress={() => {
                                                    this.updateReplantTime(null, 3)
                            }}>
                                <Image style={this.style.replantEraseImage} draggable={false} source={nothingIcon} resizeMode={"contain"}/>
                            </TouchableOpacity>
                        </View>
                        );
                card.push(
                        <FliwerGreenButton onPress={() => {
                                this._datepicker3.touchableHandlePress()
                            }} textStyle={[Platform.OS == 'web' ? {height: 14} : {}]} style={[{}]} text={this.props.actions.translate.get("valveCard_zone_replantButton")} containerStyle={{height: 40, maxWidth: 200}}/>
                        );
            }
        }

        //Sensor Valve
        if (hideActivationValvule)
        {
            return card;
        }
        /*
        card.push(<CheckBox key={3} 
          title={this.props.actions.translate.get("deviceCard_activate_valve")} 
          textStyle={this.style.checkBoxText} 
          containerStyle={this.style.checkBoxContainer} 
          checked={device.irrigationEnabled} 
          onPress={() => {
                        this.updateValve(!device.irrigationEnabled);
                    }}
          />);

        if (device.irrigationEnabled) {

            card.push(
                              <View key={4} style={[this.style.durationContainer, {height: 30, paddingBottom: 10}]}>
                        <Text style={this.style.durationText}>{this.props.actions.translate.get("valveCard_zone_irrigationDuration")}</Text>
                        <View style={this.style.minContainer}>
                            <Text style={this.style.numberText}>{(this.state.minutes ? this.state.minutes : (device.minutes ? device.minutes : "--"))}</Text>
                            <Text style={this.style.minText}>{this.props.actions.translate.get("general_min")}</Text>
                        </View>
                    </View>
                    )

            card.push(
                    <View key={5} style={this.style.sliderContainer}>
                        <TouchableOpacity style={this.style.valveMinutesMinus} onPress={() => {
                            this.subMinute()
                        }}><Text style={this.style.valveMinutesButtonText}>-</Text></TouchableOpacity>
                        <FliwerSlideBar style={this.style.slider} value={this.state.minutes ? this.state.minutes : device.minutes} disabled={false} max={250} min={1} onChange={(value) => {
                                this.updateValveMinutes(value)
                                              }} />
                        <TouchableOpacity style={this.style.valveMinutesPlus} onPress={() => {
                                this.addMinute()
                                            }}><Text style={this.style.valveMinutesButtonText}>+</Text></TouchableOpacity>
                    </View>
                    )

        }*/

        return card;
    }


};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        lastUpdateDevices: state.fliwerDeviceReducer.lastUpdate,
        devices: state.fliwerDeviceReducer.devices,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        zoneData: state.fliwerZoneReducer.data,
        isVisitor: state.sessionReducer.visitorCheckidUser
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch)
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
    valveCard: {
        //maxWidth:300
    },
    cardView: {
        height: 300,
        width: "100%",
        alignItems: "center"
    },
    cardViewLonger: {
        height: 315
    },
    title: {
        width: "100%",
        textAlign: "center",
        marginTop: 10,
        fontSize: 22,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        height: 28
    },

    checkBoxContainer: {
        width: "100%",
        backgroundColor: "white",
        borderColor: "white",
        paddingRight: 0,
        paddingLeft: 15,
        paddingTop: 0,
        paddingBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 5,
        marginBottom: 0
    },
    checkBoxText: {
        fontSize: 14,
        fontWeight: "normal"
    },

    durationContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: 19,
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 10
    },
    durationText: {
        flexGrow: 1,
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    minContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    numberText: {
        fontSize: 22,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        paddingRight: 3
    },
    minText: {
        fontFamily: FliwerColors.fonts.light,
        fontSize: 14
    },
    sliderContainer: {
        width: "100%",
        flexDirection: "row",
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 0
    },
    slider: {
        flexGrow: 1
    },
    valveMinutesMinus: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
        marginTop: 12,
        backgroundColor: FliwerColors.primary.green,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    }, valveMinutesPlus: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginLeft: 5,
        marginTop: 12,
        backgroundColor: FliwerColors.secondary.green,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    },
    valveMinutesButtonText: {
        fontSize: 19,
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.regular
    },

    replantText: {
        alignSelf: "flex-start",
        marginTop: 5,
        marginLeft: 15,
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    datePickerContainer: {
        height: 40,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 4,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    datePickerContainerIn: {
        height: "100%",
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
        height: "100%",
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
    replantErase: {
        width: 30,
        height: 30,
        marginRight: 15
    },
    replantEraseImage: {
        width: 30,
        height: 30
    },
    zoneSelectContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        paddingLeft: 15
    },
    flowSelectBackContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        paddingLeft: 15
    },
    selectZoneText: {
        fontSize: 12,
        fontFamily: FliwerColors.fonts.light
    },
    pumpSelectContainer: {
        height: 40,
        borderRadius: 4,
        flexGrow: 1,
        position: "relative",
        paddingRight: 15,
        //marginBottom:6
    },
    pumpSelect: {
        width: "100%",
        position: "relative",
        zIndex: 1,
    },

    "@media (orientation:portrait)": {

    },
    ":hover": {
    },
}

if (Platform.OS === 'android' || Platform.OS == 'ios') {
    style.pumpSelectContainer.marginBottom = 2;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, ValveSensorCard));
