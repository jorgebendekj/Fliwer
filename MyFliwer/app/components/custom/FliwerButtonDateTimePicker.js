import React, { Component } from "react";
import { Button, View, Platform, Text, TouchableOpacity } from "react-native";

import DatePicker from '../../widgets/datePicker/datePicker';

import { FliwerColors } from '../../utils/FliwerColors'
import Icon from 'react-native-vector-icons/Entypo';

import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import FliwerButtonPopup from '../../components/custom/FliwerButtonPopup.js'

import moment from 'moment';

class FliwerButtonDateTimePicker extends Component {
    constructor(props) {

        super(props);
        this.state = {
            maxTime: this.props.maxTime,
            minTime: this.props.minTime,
            customRenderVisible: false
        };

    }

    //DatePicker need date format: Sun Aug 18 2019 17:55:00 GMT+0200 (hora de verano de Europa central)
    //and we recive from props: unix timestamp
    //onChange it returns the selected date with unix format: (1567005780)

    handleChange(date) {
        this.props.onChange(moment(date).unix());
    }

    render() {
        return (
            this.renderItems()
        );
    }

    renderItems() {
        var format = "h:mm a, YYYY MMMM D"
        var indents = [];
        //console.log("data mi"+ new Date());
        //console.log("start:"+ this.state.startDate);

        //console.log(this.state.date.format("h:mm aa, yyyy MMMM d").toString());

        if (!this.props.showDate && this.props.showTime)
            format = "h:mm";
        else if (this.props.format) {
            format = this.props.format
        }

        var text = moment(this.props.date, (format)).format(format).toString();

        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            if (this.props.customRenderItem) {
                indents.push(
                    <TouchableOpacity
                        style={{ height: 40 }}
                        onPress={() => {
                            this.setState({
                                customRenderVisible: true
                            })
                        }}
                    >
                        {this.props.customRenderItem}
                        {this.renderDatePicker(format)}
                    </TouchableOpacity>
                )
            } else {
                indents.push(
                    <View style={[this.style.buttonContainer, this.props.styleButtonContainer]} onStartShouldSetResponder={() => true}>
                        <View style={[this.style.buttonTouchale, this.props.styleInputCustome]}>
                            <View style={[this.style.insideTouch, this.props.styleInputCustome]}>
                                <View style={[this.style.buttonInside, this.props.styleInputCustome]}>
                                    <Text pointerEvents="none" style={this.style.datePickerText}>{text}</Text>
                                    {this.renderDatePicker(format)}
                                </View>
                                <View style={this.style.iconContainer}>
                                    <Icon name="chevron-thin-left" backgroundColor="" style={this.style.icon}></Icon>
                                </View>
                            </View>
                        </View>

                    </View>
                );
            }
        } else {
            if (this.props.customRenderItem) {
                indents.push(
                    <View>
                        {this.props.customRenderItem}
                        {this.renderDatePicker(format)}
                    </View>
                )
            } else {
                indents.push(
                    <View style={this.style.buttonContainer} onStartShouldSetResponder={() => true}>
                        <FliwerButtonPopup style={{}} text={text} />
                        {this.renderDatePicker(format)}
                    </View>
                );
            }
        }

        return indents;
    }

    renderDatePicker(format) {

        return (
            <DatePicker
                date={typeof this.props.date === 'number' ? new Date(this.props.date * (this.props.date < 1000000000 ? 1000 : 1)) : this.props.date instanceof Date ? this.props.date : null}
                onChange={(value) => {
                    console.log('date pciker container', value)
                    this.handleChange(value)
                }}
                showDateSelect={this.props.mode}
                showTimeSelect={this.props.mode}
                timeFormat="HH:mm"
                timeIntervals={this.props.timeIntervals ? this.props.timeIntervals : 5}
                format={format}
                mode={this.props.mode}
                style={{ width: "100%", height: "100%", position: "absolute", opacity: 0 }}
                withPortal={true}
                placeholder={this.props.actions.translate.get("FliwerButtonDateTimePicker_choose_date")}
                customStyles={{ dateInput: this.style.datePicker, dateText: this.style.datePickerText }}
                customInput={< input style={this.props.mergedCustomStyles} />}
                minTime={null}
                maxTime={null}
                minDate={this.props.minDate}
                maxDate={this.props.maxDate}
                showYearDropdown={this.props.showYearDropdown}
                showMonthDropdown={this.props.showMonthDropdown}
                customRenderVisible={this.state.customRenderVisible}
                setCustomRenderVisible={() => this.setState({ customRenderVisible: false })}
                disabled={this.props.disabled}
                hideModal={this.props?.hideModal ? (value) => this.props.hideModal(value) : null}
            />
        );
    }

};


function mapStateToProps(state, props) {
    return {

    };
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

//Connect everything

var style = {
    collection: {
        marginBottom: 85
    },
    buttonContainer: {
        height: 40,
        width: "100%",
        maxWidth: 301,
        //marginBottom:10,
        //backgroundColor: "pink",
    },
    datePicker: {
        width: "100%",
        height: "100%",
        borderRadius: 4,
        zIndex: 1,
        paddingLeft: 5,
        alignItems: "flex-start",
        position: "absolute",
        cursor: "pointer",
    },
    datePickerText: {
        position: "absolute",
        width: "100%",
        display: "flex",
        alignItems: "center",
        paddingLeft: 10
    },

    buttonTouchale: {
        backgroundColor: FliwerColors.primary.black,
        height: "100%",
        width: "100%",
        borderRadius: 45,
        alignItems: 'center',
        flexDirection: 'row'
    },
    buttonInside: {
        backgroundColor: FliwerColors.secondary.white,
        position: "absolute",
        left: 1,
        right: 0,
        borderRadius: 45,
        alignItems: 'center',
        flexDirection: 'row',
        overflow: "hidden",
        width: "86.5%", //width border
        height: "95%", //width border
        paddingLeft: 10,
        justifyContent: "center",

    },
    insideTouch: {
        width: "100%",
        height: "100%",
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 16,
        marginLeft: -18,
        height: 20,
        color: FliwerColors.secondary.black,
        fontFamily: FliwerColors.fonts.light,
        textAlign: "center",
        width: "100%"
    },
    iconContainer: {
        position: "absolute",
        right: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    icon: {
        color: FliwerColors.secondary.white,
        fontSize: 20,
        textAlign: "left",
        transform: [{ rotate: '180deg' }]
    },

};


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerButtonDateTimePicker));
