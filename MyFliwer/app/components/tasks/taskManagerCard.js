'use strict';

import React, { Component, PureComponent } from 'react';
import {View, Text, Button, Platform, Image, ScrollView, StyleSheet, TouchableOpacity, Switch} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerCard from '../custom/FliwerCard.js'
import FliwerButtonPopup from '../../components/custom/FliwerButtonPopup.js'
import FliwerButtonPopupDropDown from '../../components/custom/FliwerButtonPopupDropDown.js'
import FliwerButtonDateTimePicker from '../../components/custom/FliwerButtonDateTimePicker.js'

import { Redirect } from '../../utils/router/router'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

import Icon from 'react-native-vector-icons/EvilIcons';
import {toast} from '../../widgets/toast/toast'

import icofliwer  from '../../assets/img/fliwer_icon1.png'

import trashImage  from '../../assets/img/trash.png'
import settingImage  from '../../assets/img/setting.png'
//import lockImage  from '../../assets/img/lock-dark.png'

import moment from 'moment';


class TaskManagerCard extends Component {
    constructor(props) {
        super(props);

        if (typeof this.props.onPressAdd !== 'function')
            this.loadPredefinedState();
    }

    loadPredefinedState() {
        var state = {
            showLayer: true,
            id_zone: this.props.idZone,
            goBack: false,
            idProgram: this.props.programInformation.id,
            allowed: this.props.programInformation.allowed,
            endTime: this.props.programInformation.end_time,
            startTime: this.props.programInformation.start_time,
            frequency_day: this.props.programInformation.day,
            frequency_month: this.props.programInformation.month,
            frequency_weekday: this.props.programInformation.weekday,
            frequency_year: this.props.programInformation.year,
            repeat: this.props.programInformation.repeat,
            irrigationOptionSelected: this.props.programInformation.isRealtimeMode? 3 : this.props.programInformation.allowed,
            oftenOptionsSelected: this.props.programInformation.repeat,

            minEndDate: moment(new Date()).add(2, 'hours'),
            maxEndDate: moment(new Date()).add(2, 'hours'),
            dateStartIrrigation: null,
            dateEndIrrigation: null,
            dateOptionSelectedFrom: moment(this.props.programInformation.start_time, "HH:mm:ss").toDate().getTime() / 1000,
            dateOptionSelectedUntil: moment(this.props.programInformation.end_time, "HH:mm:ss").toDate().getTime() / 1000,

            minEndTime: moment(this.props.end_time).add(2, 'hours').toDate().getTime(),
            maxEndTime: moment("23:59:59", "HH:mm:ss").toDate().getTime(),

            minStartTime: moment(new Date()).add(2, 'hours').toDate().getTime(),
            maxStartTime: moment("23:59:59", "HH:mm:ss").toDate().getTime(),
            minStartDate: (moment(new Date()).subtract(0, 'days').toDate()),
            maxStartDate: (moment(new Date()).add(100, 'year').toDate()),

            disabled: (!this.props.programInformation.disabled? 0 : 1),

            // RealTime
            isRealtimeMode: this.props.programInformation.isRealtimeMode? true : false,
            programmedTime: this.props.programInformation.programmedTime? this.props.programInformation.programmedTime*1000 : 0,
            lastProgrammedTime: null

        };

        //console.log("inicial start_time", this.props.programInformation.start_time);
        //console.log("inicial dateOptionSelectedFrom", moment(this.props.programInformation.start_time, "HH:mm:ss").toDate().getTime() / 1000);

        if (!this.state)
            this.state = state;
        else
            this.setState(state);
    }

    render() {
        if (typeof this.props.onPressAdd === 'function')
            return (
                <FliwerCard ref="card" touchableFront={false} touchableBack={false}
                        cardStyle={{opacity: (Platform.OS == "android"? 0.6 : 0.4)}}>
                    <View>
                        <View style={[this.style.cardView]}>
                            <TouchableOpacity style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}}
                                onPress={()=>this.props.onPressAdd()}
                                >
                                <Text key={987} style={{fontSize: 100, marginTop: -5, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                    </View>
                </FliwerCard>
            );

//        console.log("render this.state.startTime ", this.state.startTime);
//        console.log("anterior ", this.state.dateStartIrrigation);
//        console.log("frequencia: ", this.state.frequency_day + " " + this.state.frequency_month + " " + this.state.frequency_year);

        var start = moment(this.state.startTime, 'HH:mm:ss')
        var hourStart = start.get("hour");
        var minutesStart = start.get("minute");
        var secondsStart = start.get("second");

        var end = moment(this.state.endTime, 'HH:mm:ss')
        var hourEnd = end.get("hour");
        var minutesEnd = end.get("minute");
        var secondsEnd = end.get("second");

        if (this.state.repeat == 3) // every week
        {

            this.state.dateStartIrrigation = moment().isoWeekday(this.state.frequency_weekday);
            this.state.dateStartIrrigation = moment(this.state.dateStartIrrigation).set({'hour': hourStart, 'minute': minutesStart, 'second': secondsStart});


            this.state.dateEndIrrigation = moment().isoWeekday(this.state.frequency_weekday).set({'hour': hourEnd, 'minute': minutesEnd, 'second': secondsEnd})

            //console.log("ssssss "+ moment().weekday(this.state.frequency_weekday).toDate());
        } else if (this.state.repeat == 2) //every month
        {
            this.state.dateStartIrrigation = moment(this.state.frequency_day, 'D')
            this.state.dateStartIrrigation = moment(this.state.dateStartIrrigation).set({'hour': hourStart, 'minute': minutesStart, 'second': secondsStart})

            this.state.dateEndIrrigation = moment(this.state.frequency_day, 'D')
            this.state.dateEndIrrigation = moment(this.state.dateEndIrrigation).set({'hour': hourEnd, 'minute': minutesEnd, 'second': secondsEnd})

        } else if (this.state.repeat == 1) //every year
        {
            this.state.dateStartIrrigation = moment(this.state.frequency_day + " " + this.state.frequency_month, 'D M')
            this.state.dateStartIrrigation = moment(this.state.dateStartIrrigation).set({'hour': hourStart, 'minute': minutesStart, 'second': secondsStart})


            this.state.dateEndIrrigation = moment(this.state.frequency_day + " " + this.state.frequency_month, 'D M')
            this.state.dateEndIrrigation = moment(this.state.dateEndIrrigation).set({'hour': hourEnd, 'minute': minutesEnd, 'second': secondsEnd})

        } else if (this.state.repeat == 0) //just one time
        {
            this.state.dateStartIrrigation = moment(this.state.frequency_day + " " + this.state.frequency_month + " " + this.state.frequency_year, 'D M Y')
            this.state.dateStartIrrigation = moment(this.state.dateStartIrrigation).set({'hour': hourStart, 'minute': minutesStart, 'second': secondsStart})

            this.state.dateEndIrrigation = moment(this.state.frequency_day + " " + this.state.frequency_month + " " + this.state.frequency_year, 'D M Y')
            this.state.dateEndIrrigation = moment(this.state.dateEndIrrigation).set({'hour': hourEnd, 'minute': minutesEnd, 'second': secondsEnd})

        } else if (this.state.repeat == 5) //Everyday
        {
            this.state.dateStartIrrigation = moment().set({'hour': hourStart, 'minute': minutesStart, 'second': secondsStart})

            this.state.dateEndIrrigation = moment().set({'hour': hourEnd, 'minute': minutesEnd, 'second': secondsEnd})
        }

        // Real time
        if (this.state.isRealtimeMode) {
            this.state.dateStartIrrigation = new Date(this.state.programmedTime);
        }

        //console.log("actual a mostrar:", this.state.dateStartIrrigation);

        var irrigationOptions = [{}]
        irrigationOptions[0] = {label: this.props.actions.translate.get('taskManagerCard_irrigation'), value: 2};
        irrigationOptions[1] = {label: this.props.actions.translate.get('taskManagerCard_no_irrigation'), value: 0};
        if (!this.props.programInformation.id)
            irrigationOptions[2] = {label: this.props.actions.translate.get('general_realtime_mode'), value: 3};

        var oftenIrrigateOptions = [{}]
        oftenIrrigateOptions[0] = {label: this.props.actions.translate.get('taskManagerCard_onetime'), value: 0}
        oftenIrrigateOptions[1] = {label: this.props.actions.translate.get('taskManagerCard_every_year'), value: 1}
        oftenIrrigateOptions[2] = {label: this.props.actions.translate.get('taskManagerCard_weekly'), value: 3}
        oftenIrrigateOptions[3] = {label: this.props.actions.translate.get('taskManagerCard_monthly'), value: 2}
        oftenIrrigateOptions[4] = {label: this.props.actions.translate.get('taskManagerCard_every_day'), value: 5}

        var oftenNoIrrigateOptions = [{}]
        oftenNoIrrigateOptions[0] = {label: this.props.actions.translate.get('taskManagerCard_onetime'), value: 0}
        oftenNoIrrigateOptions[1] = {label: this.props.actions.translate.get('taskManagerCard_every_year'), value: 1}
        oftenNoIrrigateOptions[2] = {label: this.props.actions.translate.get('taskManagerCard_weekly'), value: 3}
        oftenNoIrrigateOptions[3] = {label: this.props.actions.translate.get('taskManagerCard_monthly'), value: 2}

        return (
                <FliwerCard ref="card" touchableFront={this.props.programInformation.id ? false : false} touchableBack={true}>
                    <View>
                        {this.renderCardFront(irrigationOptions, oftenIrrigateOptions, oftenNoIrrigateOptions)}
                    </View>
                    <View>
                        {this.renderCardBack()}
                    </View>
                </FliwerCard>
        );
    }

    renderCardFront(irrigationOptions, oftenIrrigateOptions, oftenNoIrrigateOptions)
    {
        var indents = [];
        var mode = "datetime";

        if (false) {
            indents.push(
                    <View key={1} style={this.style.helpTextFliwer}>
                        <Image style={[this.style.iconImage]} draggable={false} source={icofliwer} resizeMode={"contain"} />
                        <Text style={{fontFamily: "AvenirNext-Bold"}}>Fliwer:</Text><Text style={{fontFamily: "AvenirNext-Regular"}}> {!this.props.programInformation.id ? this.props.actions.translate.get('taskManagerCard_hello_new') : this.props.actions.translate.get('taskManagerCard_hello')} </Text>
                    </View>)

            indents.push(
                    <View key={2} style={this.style.helpTextYou}>
                        <Text style={{fontFamily: "AvenirNext-Bold"}}>{this.props.actions.translate.get('general_you')}: </Text><Text style={{fontFamily: "AvenirNext-Regular"}}>{this.props.actions.translate.get('taskManagerCard_want_to') + '...'}</Text>
                    </View>)
        }

        var title;
        if (this.state.irrigationOptionSelected == 0)
            title = this.props.actions.translate.get('taskManagerCard_dont_irrigate').toUpperCase();
        else if (this.state.irrigationOptionSelected == 3)
            title = this.props.actions.translate.get('general_realtime_mode').toUpperCase();
        else
            title = this.props.actions.translate.get('taskManagerCard_irrigation_program').toUpperCase();

        indents.push(
            <View key={1} style={{marginBottom: 5}}>
                <Text style={{color: FliwerColors.primary.gray, fontWeight: "bold", fontSize: 18, textAlign: "center"}}>{title}</Text>
            </View>);

        if (this.state.irrigationOptionSelected != 3 || !this.props.programInformation.id) {
            indents.push
                    (<View key={90} style={this.style.subtitles}>
                        <Text style={this.style.subtitlesText}>{this.props.actions.translate.get('general_action')}</Text>
                    </View>)
            indents.push(<FliwerButtonPopupDropDown key={3} selectOptionValue={this.state.irrigationOptionSelected}
                            options={irrigationOptions}
                            onChange={(v) => (this.onChangeIrrigationOption(v))}
                            placeholder={this.props.actions.translate.get('general_action')}
                            disabled={this.state.isRealtimeMode}
                        />)
        }

        indents.push
                (<View key={4} style={this.style.subtitles}>
                    <Text style={this.style.subtitlesText}>{this.props.actions.translate.get('general_from')}</Text>
                </View>)

        if (this.state.oftenOptionsSelected == 5)
        {
            mode = "time";
            this.state.minStartTime = null;
            this.state.maxEndTime = null;
        } else
            mode = "datetime";
        //console.log("data inici reg: ", this.state.dateStartIrrigation);
        indents.push(<FliwerButtonDateTimePicker
                        mode={mode}
                        maxDate={this.state.maxStartDate}
                        minDate={this.state.minStartDate}
                        minTime={this.state.minStartTime ? this.state.minStartTime : {}}
                        maxTime={this.state.maxEndTime ? this.state.maxEndTime : {}}
                        date={this.state.dateStartIrrigation}
                        format={this.getFormatDateByRepeat(this.state.oftenOptionsSelected)}
                        onChange={(v) => (this.onChangeDateOptionFrom(v))}
                    />)

        if (this.state.irrigationOptionSelected == 0) //NO IRRIGATION
        {
            indents.push
                    (<View key={6} style={this.style.subtitles}>
                  <Text style={this.style.subtitlesText}>{this.props.actions.translate.get('general_until')} </Text>
              </View>)

            indents.push(<FliwerButtonDateTimePicker mode={"time"} maxTime={this.state.maxEndTime} minTime={this.state.minStartTime} date={this.state.dateEndIrrigation} format={this.getFormatDateByRepeat(this.state.oftenOptionsSelected)} onChange={(v) => (this.onChangeDateOptionUntil(v))}/>)
        }


        if (this.state.irrigationOptionSelected != 3) {
            indents.push(
                    <View key={7} style={this.style.subtitles}>
                        <Text style={this.style.subtitlesText}>{this.props.actions.translate.get('general_how_often')} </Text>
                    </View>
                    );
            indents.push(this.renderOftenDropDown(oftenNoIrrigateOptions, oftenIrrigateOptions))
        }

        if (this.state.irrigationOptionSelected != 3)
            indents.push(
                <View style={this.style.switchContainer}>
                    <Text style={[this.style.switchTitle, this.style.switchTitle1]}>{this.props.actions.translate.get('deactivated')}</Text>
                    <Switch style={this.style.switch}
                        onValueChange = {(value) => {
                            this.setState({disabled: !value});

                            // Mark: Uopdate visually
                            this.modifyProgram({isDisabledAction: true, disabled: !value});

                        }}
                        value = {!this.state.disabled} ios_backgroundColor={"#a5cd07"} thumbColor={"white"} trackColor={"#a5cd07"}/>
                    <Text style={[this.style.switchTitle, this.style.switchTitle2]}>{this.props.actions.translate.get('activated')}</Text>
                </View>
            );

        indents.push(
                <View key={8} style={[this.style.bottomToolbar]}>
                    <View style={{width: "100%", justifyContent: 'center', alignItems: 'center'}}>
                        {this.drawUpdateAddButton()}
                        {this.drawTrashButton()}
                    </View>
                </View>
                )

        if (this.props.programInformation.id && this.state.showLayer) {
            var backColorStyle = {};

            if (this.state.irrigationOptionSelected == 3)
                backColorStyle = {backgroundColor: "rgba(93, 173, 226, 0.6)"};
            else {
                if (this.state.disabled)
                    backColorStyle = {backgroundColor: "rgba(192,192,192,0.6)"};
                else if (this.state.irrigationOptionSelected == 0)
                    backColorStyle = {backgroundColor: "rgba(254,133,138,0.6)"};
            }
            indents.push(
                    <TouchableOpacity key={9} style={[this.style.layerEdit, backColorStyle]} onPress={() => {
                            this.showLayer(false)
                        }}>
                        <Text style={[this.style.layerText]}>{Platform.OS === 'web' ? this.props.actions.translate.get('taskManagerCard_click_edit') : this.props.actions.translate.get('taskManagerCard_tap_edit')}</Text>
                    </TouchableOpacity>
                    )
        }

        return (
                <View key={10} style={this.style.cardView}>
                    <View style={[this.style.globalContainer]}>
                        {indents}
                    </View>
                </View>
                );

    }

    renderCardBack()
    {
        var indents = [];

        return (
                <View style={this.style.cardView}>
                    <View style={[this.style.globalContainer]}>
                        {indents}
                    </View>
                </View>
                );

    }

    drawTrashButton() {
        var indents = [];

        if (this.props.programInformation.id || typeof this.props.onAdd === 'function')
            indents.push(
                    <TouchableOpacity key={12} style={this.style.deleteButton} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')} onPress={() => {
                            if (this.props.modalFunc)
                                this.props.modalFunc(true, this.props.programInformation.id, this.state.isRealtimeMode)
                        }}>
                        <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                    </TouchableOpacity>
                    );

        return (
                <View style={this.style.trashContainer}>
                    {indents}
                </View>
                )
    }

    renderOftenDropDown(oftenNoIrrigateOptions, oftenIrrigateOptions) {
        if (this.state.irrigationOptionSelected == 0) //no irrigation
            return (<FliwerButtonPopupDropDown
                        selectOptionValue={this.state.oftenOptionsSelected}
                        options={oftenNoIrrigateOptions}
                        onChange={(v) => (this.onChangeOftenOptions(v))}
                        placeholder={this.props.actions.translate.get('general_frequency')}
            />)
        else if (this.state.irrigationOptionSelected == 2)
            return (<FliwerButtonPopupDropDown
                        selectOptionValue={this.state.oftenOptionsSelected}
                        options={oftenIrrigateOptions}
                        onChange={(v) => (this.onChangeOftenOptions(v))}
                        placeholder={this.props.actions.translate.get('general_frequency')}
            />)
    }

    drawUpdateAddButton() {

        return (
                <View style={this.style.updateButtonContainer}>
                    <FliwerGreenButton onPress={!this.props.programInformation.id ? async (program) => await this.addProgram(program) : async () => await this.modifyProgram(null,true)} text={!this.props.programInformation.id ? this.props.bottomButtonText : this.props.actions.translate.get('general_update').toUpperCase()} containerStyle={this.style.updateButtonTouchable} />
                </View>
                );
    }

    //repeat (optional): 0 none, 1 every year, 2 every month, 3 every week, 4 all day (only restrictions), 5 every day
    // dateStartIrrigation and dateEndIrrigation, get the timestamp unix from the reducer/server programs. And never change.
    //dateOptionSelectedFrom and dateOptionSelectedUntil: get the changes of timepicker
    //picker of dateTime: cuando cambiamos su valor, el componente datepicker cambia el valor de el mismo. Devolviendo el cambia a dateOptionSelectedFrom

    onChangeDateOptionFromUntil(from, until) {
        var untilDateAux, untilDate, untilHour, untilMinute;

        if (this.state.isRealtimeMode) {
            console.log("onChangeDateOptionFromUntil", from, until);
//            if (from < ((Date.now() / 1000) + 7200)) {
//                toast.error(this.props.actions.translate.get('taskManagerCard_program_startTimeTooEarly'));
//                if (Platform.OS == 'android' || Platform.OS == 'ios')
//                    this.forceUpdate();
//                return;
//            }

            var lastProgrammedTime = this.state.programmedTime;
            this.setState({programmedTime: new Date(from * 1000), lastProgrammedTime: lastProgrammedTime});

            // Mark: UPDATE program visually
            if (this.props.programInformation.id)
            {
                this.modifyProgram();
            }

            return;
        }


        if (this.state.irrigationOptionSelected == 2)
            until = null;
        if (until) {
            untilDateAux = new Date(until * 1000);
            untilDate = new Date(from * 1000);
            untilDate.setHours(untilDateAux.getHours());
            untilDate.setMinutes(untilDateAux.getMinutes());
            until = untilDate.getTime() / 1000;
            untilHour = untilDate.getHours();
            untilMinute = untilDate.getMinutes();
        }
        var fromDate = new Date(from * 1000);
        var fromHour = fromDate.getHours();
        var fromMinute = fromDate.getMinutes();
        if ((from < ((Date.now() / 1000) + (this.props.roles.fliwer?0:/*7200*/0)) || (until && until < ((Date.now() / 1000) + (this.props.roles.fliwer?0:/*7200*/0) ))) && this.state.oftenOptionsSelected != 5) {
            toast.error(this.props.actions.translate.get('taskManagerCard_program_startTimeTooEarly')) 
            if (Platform.OS == 'android' || Platform.OS == 'ios')
                this.forceUpdate();
        } else {
            if (until && (untilHour < fromHour || (untilHour == fromHour && untilMinute < fromMinute))) {
                fromDate.setHours(untilHour);
                fromDate.setMinutes(untilMinute);
                fromDate.setSeconds(0);

                this.setState({
                    dateOptionSelectedFrom: fromDate.getTime() / 1000,
                    dateOptionSelectedUntil: from,
                    startTime: untilHour + ":" + untilMinute + ":00",
                    frequency_day: fromDate.getDate(),
                    frequency_month: fromDate.getMonth() + 1,
                    frequency_weekday: fromDate.getDay(),
                    frequency_year: fromDate.getFullYear(),
                    endTime: fromHour + ":" + fromMinute + ":00",

                    minEndTime: moment(fromDate.getTime() / 1000).add(0, 'minutes').toDate().getTime()
                })
            } else {
                if (until && untilHour == fromHour && untilMinute == fromMinute) {
                    if (untilHour == 23 && untilMinute >= 55) {
                        from -= 300;
                        fromDate = new Date(from * 1000);
                        fromHour = fromDate.getHours();
                        fromMinute = fromDate.getMinutes();
                    } else {
                        until += 300;
                        untilDate = new Date(until * 1000);
                        untilHour = untilDate.getHours();
                        untilMinute = untilDate.getMinutes();
                    }
                }
                this.setState({
                    dateOptionSelectedUntil: until,
                    dateOptionSelectedFrom: from,
                    endTime: until ? (untilHour + ":" + untilMinute + ":00") : null,
                    startTime: fromHour + ":" + fromMinute + ":00",
                    frequency_day: fromDate.getDate(),
                    frequency_month: fromDate.getMonth() + 1,
                    frequency_weekday: fromDate.getDay(),
                    frequency_year: fromDate.getFullYear(),

                    minEndTime: moment(from).add(0, 'minutes').toDate().getTime()
                })
            }

            // Mark: UPDATE program visually
            if (this.props.programInformation.id)
            {
                this.modifyProgram();
            }
        }
    }

    onChangeDateOptionFrom(value) {
        this.onChangeDateOptionFromUntil(value, this.state.dateOptionSelectedUntil)
    }

    onChangeDateOptionUntil(value) {
        this.onChangeDateOptionFromUntil(this.state.dateOptionSelectedFrom, value)
    }

    onChangeIrrigationOption(value) {
        if (this.state.oftenOptionsSelected == 5)
            this.setState({oftenOptionsSelected: 0})
        var until = new Date(this.state.dateOptionSelectedFrom * 1000);
        if (until.getHours() == 23 && until.getMinutes() == 59) {
            var from = new Date(this.state.dateOptionSelectedFrom * 1000);
            from.setHours(from.getHours() - 1);
            this.setState({irrigationOptionSelected: value, startTime: from.getHours() + ":" + from.getMinutes() + ":00", endTime: until.getHours() + ":" + until.getMinutes() + ":00"})
        } else {
            if (until.getHours() >= 23)
                until.setMinutes(59);
            else
                until.setHours(until.getHours() + 1);
            this.setState({irrigationOptionSelected: value, endTime: until.getHours() + ":" + until.getMinutes() + ":00"})
        }

        // Mark: UPDATE program visually
        if (this.props.programInformation.id)
        {
            this.modifyProgram();
        }

    }

    onChangeOftenOptions(value) {
        this.setState({oftenOptionsSelected: value});

        // Mark: UPDATE program visually
        if (this.props.programInformation.id)
        {
            this.modifyProgram();
        }
    }

    undo() {
        this.loadPredefinedState();
    }

    hasChanges(last)
    {
        var hasChanged = false;

        if (!hasChanged && last.restriction != this.state.irrigationOptionSelected) {
            hasChanged = true;
        }

        if (!hasChanged && last.startTime != moment(this.state.dateStartIrrigation).format("HH:mm:ss")) {
            hasChanged = true;
        }

        if (!hasChanged && last.endTime)
        {
            if (!hasChanged && last.endTime != moment(this.state.dateEndIrrigation).format("HH:mm:ss")) {
                hasChanged = true;
            }
        }
        if (!hasChanged && last.repeat != this.state.oftenOptionsSelected) {
            hasChanged = true;
        }

        return hasChanged;
    }

    async addProgram()
    {
        var newProgram = {}

        if (this.state.irrigationOptionSelected == 2) {
            newProgram = {restriction: 0, repeat: this.state.oftenOptionsSelected, startTime: parseInt(this.state.dateOptionSelectedFrom), disabled: this.state.disabled}
        }
        if (this.state.irrigationOptionSelected == 0) {
            newProgram = {restriction: 1, repeat: this.state.oftenOptionsSelected, startTime: parseInt(this.state.dateOptionSelectedFrom), endTime: parseInt(this.state.dateOptionSelectedUntil), disabled: this.state.disabled}
        }
        if (this.state.irrigationOptionSelected == 3) {
            newProgram = {isRealtimeMode: true, startTime: parseInt(this.state.dateOptionSelectedFrom)};
        }

        await this.props.onAdd(newProgram);
    }

    showLayer(value)
    {
        this.setState({showLayer: value})
    }

    async modifyProgram(obj,save)
    {

        var irrigationOptionSelected = this.state.irrigationOptionSelected;
        if (obj && obj.irrigationOptionSelected)
        {
            irrigationOptionSelected = obj.irrigationOptionSelected;
        }

        var programModified = {};
        if (irrigationOptionSelected != 3) {
            if (irrigationOptionSelected == 2) {
                programModified = {restriction: 0, repeat: this.state.oftenOptionsSelected, startTime: parseInt(moment(this.state.dateStartIrrigation).toDate().getTime() / 1000)}
            }
            if (irrigationOptionSelected == 0) {
                programModified = {restriction: 1, repeat: this.state.oftenOptionsSelected, startTime: parseInt(moment(this.state.dateStartIrrigation).toDate().getTime() / 1000), endTime: parseInt(moment(this.state.dateEndIrrigation).toDate().getTime() / 1000)}
            }

            programModified.disabled = this.state.disabled;

            if (obj)
            {
                if (obj.oftenOptionsSelected)
                {
                    programModified.repeat = obj.oftenOptionsSelected;
                }
                if (obj.isDisabledAction)
                {
                    programModified.disabled = obj.disabled;
                }
            }
            if(save){
                if(this.props.onUpdate)this.props.onUpdate(this.props.idZone, this.state.idProgram, programModified,()=>{this.setState({showLayer: true})});
                /*
                this.props.setLoading(true);
                await this.props.actions.fliwerZoneActions.modifyIrrigationProgram(this.props.idZone, this.state.idProgram, programModified).then(async () => {
                    //console.log("S'ha modificat la programacio: ", programModified);
                    this.setState({showLayer: true})
                    this.props.setLoading(false);
                    await this.props.onUpdate();
                }, (err) => {
                    if (err && err.reason)
                        toast.error(err.reason);
                    this.props.setLoading(false);
                });
                */
            }else {
                this.setState({
                    repeat: programModified.repeat
                })
            }
        }
        else {
            programModified.startTime = parseInt(moment(this.state.dateStartIrrigation).toDate().getTime() / 1000);
            if(save){
                if(this.props.onUpdate)this.props.onUpdate(this.props.idZone, this.state.idProgram, programModified,()=>{this.setState({showLayer: true})});
                /*
                this.props.setLoading(true);
                await this.props.actions.sessionActions.modifyRealtimeProgram(this.state.idProgram, programModified).then(async () => {
                    //console.log("S'ha modificat la programacio: ", programModified);
                    this.setState({showLayer: true})
                    this.props.setLoading(false);
                    await this.props.onUpdate();
                }, (err) => {
                    if (err && err.reason)
                        toast.error(err.reason);
                    this.props.setLoading(false);
                    this.setState({programmedTime: this.state.lastProgrammedTime});
                });
                */
            }
        }
    }

    getFormatDateByRepeat(repeat) {
        var format = "h:mm a, YYYY MMMM D"
        /*
         var formatL = moment.localeData().longDateFormat('LLL').replace('h','HH').replace(' A','');
         switch(repeat){
         case 1:
         format = formatL.replace("YYYY","");
         break;
         case 2:
         format = formatL.replace("YYYY","").replace("MMMM","").replace("D","Do");
         break;
         case 3:
         format = "dddd, "+formatL.replace("YYYY","").replace("MMMM","").replace("D","");
         break;
         case 5:
         format = "HH:mm";
         break;
         default:
         case 4:
         format = formatL;
         break;
         }
         format=format.replace(/ +/g," ");
         console.log(formatL)
         console.log(format)
         */

        if (repeat == 5)
            format = "HH:mm";
        else if (repeat == 3)
            format = "dddd, HH:mm"
        else
            format = moment.localeData().longDateFormat('LLL').replace('h', 'HH').replace(' A', '');

        return format;
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        roles: state.sessionReducer.roles
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
            sessionActions: bindActionCreators(ActionsSession, dispatch)
        }
    }
}



var style = {
    iconImage: {
        height: 21,
        width: 21,

    },
    cardView: {
        height: 400,
        width: "100%",
        alignItems: "center"
    },
    globalContainer: {
        flexDirection: "column",
        width: "100%",
        height: "100%",
        alignItems: "center",
        paddingLeft: "9%",
        paddingRight: "9%",
        paddingTop: "5%"
    },
    helpTextFliwer: {
        flexDirection: "row",
        //alignSelf:"start",
    },
    helpTextYou: {
        flexDirection: "row",
        alignSelf: "flex-end",
        marginBottom: 3
    },
    subtitles: {
        alignSelf: "flex-start",
        marginTop: 5,
        marginBottom: 5
    },
    subtitlesText: {
        color: FliwerColors.primary.gray
    },
    trashContainer: {
        position: "absolute",
        right: -10,
        bottom: 1,
        width: 25,
        height: 30
    },
    deleteButton: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    bottomToolbar: {
        width: "100%",
        display: "flex",
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexGrow: 1,
        flexDirection: "row",
        paddingBottom: 15
    },
    trashIcon: {
        width: 25,
        height: 25,
        justifyContent: "flex-end",
    },
    updateButtonTouchable: {
        height: "100%",
        width: "100%"
    },
    updateButtonContainer: {
        width: "60%",
        height: 30
    },
    layerEdit: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
        backgroundColor: "rgba(217,232,7,0.6)",
        justifyContent: "center",
        top: 0
    },
    layerText: {
        width: "100%",
        fontSize: 33,
        padding: "20%",
        color: "white",
        textAlign: "center",
        //fontFamily:FliwerColors.fonts.title,
    },
    switchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        paddingTop: 10,
        paddingLeft: 20
    },
    switchTitle: {
        fontSize: 14,
        color: FliwerColors.primary.gray
    },
    switchTitle1: {
        marginRight: 20
    },
    switchTitle2: {
        marginLeft: 20
    },
    switch: {
        transform: [{scaleX: 1}, {scaleY: 1}]
    },

    ":hover": {
        trashIcon: {
            filter: "brightness(110%)"
        }
    }
}




export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, TaskManagerCard));
