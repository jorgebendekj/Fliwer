'use strict';

import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
var {TouchableOpacity, View, Text, Platform} = require('react-native');

import Modal from '../../widgets/modal/modal'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {applyThemeToCSSVariables, FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import moment from 'moment';
import './datePicker.css'

class MyDatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = {
            display: false,
            selected: null,
            value: null
        }
    }

    componentDidMount(){
        if(Platform.OS === 'web'){
            applyThemeToCSSVariables();
        }
    }

    render() {
        var {placeholder, style, disabled, showTimeSelect, showOnlyTime, mergedCustomStyles} = this.props;

        return (
                <TouchableOpacity ref={(t) => {
                        this._touchable = t
                    }} style={style} disabled={disabled} onPress={() => {
                        if(this.props?.hideModal) this.props?.hideModal(true)
                        this.openModal()
                    }}>
                    {this.renderModal()}
                </TouchableOpacity>
                )

    }

    touchableHandlePress() {
        this._touchable.touchableHandlePress();
    }

    openModal() {
        global.frontLayer.display(true);
        this.setState({display: true})
    }

    renderModal() {
        if (this.state.display) {
            global.frontLayer.renderLayer(() => {
                return (
                        <Modal animationType="fade" inStyle={this.style.modalIn} visible={this.state.display} onClose={() => {
                                this.closeModal();
                            }}>
                            <View style={this.style.modalView}>
                                {this.renderModalPlaceHolder()}
                                <View style={this.style.optionsContainer}>
                                    {this.renderModalOptions()}
                                </View>
                            </View>
                        </Modal>
                        )
            })
        } else
            return [];
    }

    renderModalPlaceHolder() {
        if (this.props.placeholder)
            return (
                    <View style={this.style.placeHolderContainer}>
                        <Text style={this.style.placeHolder} >{this.props.placeholder}</Text>
                        <View style={this.style.underLine}></View>
                    </View>
                    )
        else
            return [];
    }

    renderModalOptions() {

        if (this.props.mode == "date")
        {
            var modeTimeOnly = false;
            var modeTime = false;

        } else if (this.props.mode == "time")
        {
            var modeTimeOnly = true;
            var modeTime = true;
        } else if (this.props.mode == "datetime")
        {
            var modeTimeOnly = false;
            var modeTime = true;
        } else {
            var modeTimeOnly = false;
            var modeTime = true;
        }


        var dateValue = this.state.value? this.state.value : this.props.date;
        console.log("renderModalOptions dateValue",  dateValue);

        if(dateValue=="Invalid Date")dateValue=Date.now();

        if (dateValue && !this.state.value)
            this.state.value = dateValue;

        return(
                <View>
                    <DatePicker
                        inline
                        dateFormat={this.props.format ? this.props.format : "YYYY-MM-dd"}
                        placeholder={this.props.placeholder}
                        selected={dateValue}
                        disabled={this.props?.disabled}
                        onChange={(value) => {
                            //if (typeof this.props.onChange === 'function')
                                //this.props.onChange(value);

                            //console.log("onChange value", value);
                            this.setState({value: value});
                        }}
                        showTimeSelect={modeTime}
                        showTimeSelectOnly={modeTimeOnly}
                        style={this.props.style}
                        timeIntervals={this.props.timeIntervals}
                        customInput={ < input style = {this.props.mergedCustomStyles} / > }
                        minTime={(moment(dateValue).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) ? this.props.minTime : null}
                        maxTime={(moment(dateValue).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) ? this.props.maxTime : null}
                        minDate={this.props.minDate}
                        maxDate={this.props.maxDate}
                        calendarClassName={modeTime ? "" : "react-datepicker--month-only"}
                        timeFormat="HH:mm"
                        showYearDropdown={this.props.showYearDropdown}
                        showMonthDropdown={this.props.showMonthDropdown}
                        dropdownMode="select"
                        />
                    <View style={{width: "100%"/*, borderColor: "red", borderWidth: 1*/, paddingTop: 10, flexDirection: "row"}}>
                        <FliwerGreenButton
                            onPress={() => {
                                this.closeModal();
                                console.log("FliwerGreenButton web onPress value", this.state.value);
                                if (typeof this.props.onChange === 'function')
                                    this.props.onChange(this.state.value);
                                this.state.value = null;
                            }}
                            text={this.props.actions.translate.get('accept')}
                            textStyle={[{fontWeight: "bold"}, this.props.mode == "time"? {fontSize: 12} : {} ]}
                            containerStyle={{flex: 1, marginRight: 5}}
                            style={{}}
                        />
                        <FliwerGreenButton
                            onPress={() => {
                                this.closeModal();
                                this.state.value = null;
                            }}
                            text={this.props.actions.translate.get('general_cancel')}
                            textStyle={[{fontWeight: "bold"}, this.props.mode == "time"? {fontSize: 12} : {} ]}
                            containerStyle={{flex: 1, marginLeft: 5}}
                            style={{backgroundColor: "gray"}}
                        />
                    </View>
                </View>
                );
    }

    selectOption(index) {
        return () => {
            this.setState({selected: index})
        }
    }

    closeModal()
    {
        global.frontLayer.display(false);
        this.setState({display: false});
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {

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
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        minWidth: 200,
        maxWidth: "90%"
    },
    modalView: {
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        //maxHeight:"80%",
        display: "flex"
    },
    placeHolderContainer: {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 31,
        marginBottom: 10
    },
    optionsContainer: {
        //height:"20%",
        //maxHeight:"65%",
        flexShrink: 1,
        overflowY: "auto"
    },
    placeHolder: {
        fontSize: 20
    },
    underLine: {
        height: 1,
        backgroundColor: "black"
    },
    option: {
        paddingTop: 10,
        paddingBottom: 10
    },
    optionText: {
        fontSize: 16,
        paddingLeft: 5,
    },
    optionTextSelected: {
        fontFamily: "AvenirNext-Bold"
    },
    optionHover: {
        backgroundColor: "rgb(220,220,220)"
    }
};

export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, MyDatePicker));
