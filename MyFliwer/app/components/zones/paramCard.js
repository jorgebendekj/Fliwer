'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'

import moment from 'moment';

var alert = {
    light: require('../../assets/img/alert_light.png'),
    temp: require('../../assets/img/alert_temp.png'),
    airh: require('../../assets/img/alert_airh.png'),
    soilm: require('../../assets/img/alert_soilm.png'),
    fert: require('../../assets/img/alert_fert.png'),
    maint: require('../../assets/img/alert_maint.png'),
    meteo: require('../../assets/img/alert_meteo.png'),
    anemometer: require('../../assets/img/alert_meteo.png'),
    pluviometer: require('../../assets/img/alert_meteo.png')
};
import paramSensor  from '../../assets/img/paramSENSOR.png'
import paramNoSensor  from '../../assets/img/paramNOSENSOR.png'

var ARparamSensor = 0.79157;
var pointsParamSensor = [{x: 0.263314, y: 0.121780}, {x: 0.733728, y: 0.121780}, {x: 0.263314, y: 0.744731}];
var paramSensor66Point = {x: 0.71893, y: 0.23653}
var paramSensor33Point = {x: 0.5355, y: 0.62763}
var limitsParamSensor = {0: 0, 18: 0.33, 82: 0.66, 100: 1};

var ARparamNoSensor = 0.508130;
var pointsParamNoSensor = [{x: 0, y: 0}, {x: 0.995, y: 0}, {x: 0, y: 0.99}];
var paramNoSensor66Point = {x: 0.98, y: 0.179}
var paramNoSensor33Point = {x: 0.57, y: 0.816}
var limitsParamNoSensor = {0: 0, 18: 0.33, 82: 0.66, 100: 1};

import plusSignImage from '../../assets/img/plus-little.png'
import minusSignImage from '../../assets/img/minus-little.png'

import {toast} from '../../widgets/toast/toast'
import FliwerCalmButton from '../custom/FliwerCalmButton.js'

class ParamCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            percent: 0,
            containerWidth: 0,
            containerHeight: 0,
            styleBackground: {
                marginLeft: 0,
                width: 0,
                height: 0,
                marginTop: 0
            },
            styleFill: {
                marginLeft: 0,
                width: 0,
                height: 0,
                marginTop: 0
            },
            dataSensorInImage: {
                width: 0,
                height: 0,
                left: 0,
                top: 0
            },
            dataSensor66: {
                height: 0,
                marginLeft: 0
            },
            dataSensor33: {
                marginTop: 0,
                marginLeft: 0
            },
            textLine66: {
                paddingLeft: 0
            },
            textLine33: {
                paddingLeft: 0
            },
            dataTextView: {
                marginTop: 0,
                height: 0,
                left: 0
            },
            idZone: null,
            limit33: this.props.limit33
        };

    }

    render() {
        const {style, cardStyle} = this.props;

        return (
                <FliwerCard ref="card" touchable={false} style={style} cardStyle={[cardStyle, this.style.cardStyle]} cardInStyle={this.style.cardInStyle}>
                    <View>
                        {this.renderCardFront()}
                    </View>
                </FliwerCard>
                );
    }

    toggle() {
        var that = this;
        return function () {
            that.refs.card._toggleCard()
        }
    }

    valueWithUnits(value, units) {
        var micro = false;
        if (units && units.charAt(0) == "μ")
            micro = true;
        if (units && value > 1000) {
            value /= 1000;
            units = (micro ? "m" : "K") + (micro ? units.substr(1) : units);
        }
        return FliwerCommonUtils.toPointsFormat(Math.round(value * 100) / 100) + " " + (units ? units : "")
    }

    calculateDistributedPercentageValue(value, limit) {
        /*
         Required:
         value
         limit: (Limit Object)
         */
        var local_percent = 0, percent_final = 0;
        if (limit[18] == null || limit[82] == null || limit[100] == null || limit[0] == null) {
            percent_final = 50;
        } else if (value > limit[82]) {
            // Entre 82-100%
            local_percent = (value - limit[82]) / (limit[100] - limit[82]);
            percent_final = 82 + (100 * local_percent * ((100 - 82) / 100));
        } else if (value >= limit[18]) {
            // Entre 18-82
            local_percent = (value - limit[18]) / (limit[82] - limit[18]);
            percent_final = 18 + (100 * local_percent * ((82 - 18) / 100));
        } else {
            // Entre 0%-18
            local_percent = (value - limit[0]) / (limit[18] - limit[0]);
            percent_final = 0 + (100 * local_percent * (18 / 100));
        }
        return percent_final;
    }

    renderPositions() {
        const {percent, sensor, filter, meteo, limit66, units, value, measureTime} = this.props;
        var width = this.state.containerWidth, height = this.state.containerHeight, that = this;
        var AR, pointsParam, param66Point, param33Point, limitsParam;
        if (sensor) {
            AR = ARparamSensor;
            pointsParam = pointsParamSensor;
            param66Point = paramSensor66Point;
            param33Point = paramSensor33Point;
            limitsParam = limitsParamSensor;
        } else {
            AR = ARparamNoSensor;
            pointsParam = pointsParamNoSensor;
            param66Point = paramNoSensor66Point;
            param33Point = paramNoSensor33Point;
            limitsParam = limitsParamNoSensor;
        }
        //console.log("w", width, "height", height)
        var w2, h2, pointsPosition, Bleft, Bwidth, Bheight, Btop;
        if (width / AR <= height) {
            w2 = width;
            h2 = width / AR;
        } else {
            h2 = height;
            w2 = height * AR;
        }
        //console.log("w", width, "height", height, "w2", w2, "h2", h2);
        var sumTop = sensor ? (height - h2) : (height - h2) / 2;
        pointsPosition = [
            {x: pointsParam[0].x * w2 + (width - w2) / 2,
                y: pointsParam[0].y * h2 + sumTop},
            {x: pointsParam[1].x * w2 + (width - w2) / 2,
                y: pointsParam[1].y * h2 + sumTop},
            {x: pointsParam[2].x * w2 + (width - w2) / 2,
                y: pointsParam[2].y * h2 + sumTop}
        ];
        //console.log(JSON.stringify(pointsPosition));
        var styleBackground = {};
        var styleFill = {};
        var dataSensorInImage = {};
        var dataSensor66 = {};
        var dataSensor33 = {};
        var textLine66 = {};
        var textLine33 = {};
        var dataTextView = {}
        styleBackground.marginLeft = pointsPosition[0].x;
        styleBackground.height = pointsPosition[2].y - pointsPosition[1].y;
        styleBackground.width = pointsPosition[1].x - pointsPosition[0].x;
        styleBackground.marginTop = pointsPosition[0].y;

        dataSensorInImage.width = w2;
        dataSensorInImage.height = h2;
        dataSensorInImage.left = (width - w2) / 2;
        dataSensorInImage.top = sumTop;
        dataSensor33.marginLeft = param33Point.x * w2 + (width - w2) / 2;
        dataSensor33.marginTop = param33Point.y * h2 + sumTop;
        dataSensor66.marginLeft = param66Point.x * w2 + (width - w2) / 2;
        dataSensor66.height = param66Point.y * h2 + sumTop;
        textLine33.paddingLeft = (w2 - dataSensor33.marginLeft) + (width - w2) / 2;
        textLine66.paddingLeft = (w2 - dataSensor66.marginLeft) + (width - w2) / 2;

        dataTextView.marginTop = dataSensor66.height;
        dataTextView.height = dataSensor33.marginTop - dataTextView.marginTop;
        dataTextView.left = dataSensor66.marginLeft + textLine66.paddingLeft;

        //console.log("init percent", percent / 100, "limits", limitsParam);
        var realPercent = that.calculateDistributedPercentageValue(percent / 100, limitsParam) / 100;
        styleFill.marginLeft = styleBackground.marginLeft;
        styleFill.height = styleBackground.height - (1 - realPercent) * styleBackground.height;
        styleFill.width = styleBackground.width
        styleFill.marginTop = styleBackground.marginTop + (1 - realPercent) * styleBackground.height;

        //console.log("real percent", realPercent, "top to add", (1 - realPercent));
        //console.log(styleFill);
        if (styleBackground.marginLeft != that.state.styleBackground.marginLeft ||
                styleBackground.height != that.state.styleBackground.height ||
                styleBackground.width != that.state.styleBackground.width ||
                styleBackground.marginTop != that.state.styleBackground.marginTop ||
                styleFill.marginLeft != that.state.styleFill.marginLeft ||
                styleFill.height != that.state.styleFill.height ||
                styleFill.width != that.state.styleFill.width ||
                styleFill.marginTop != that.state.styleFill.marginTop ||
                dataSensorInImage.width != that.state.dataSensorInImage.width ||
                dataSensorInImage.height != that.state.dataSensorInImage.height ||
                dataSensorInImage.left != that.state.dataSensorInImage.left ||
                dataSensorInImage.top != that.state.dataSensorInImage.top ||
                dataSensor66.height != that.state.dataSensor66.height ||
                dataSensor66.marginLeft != that.state.dataSensor66.marginLeft ||
                dataSensor33.marginTop != that.state.dataSensor33.marginTop ||
                dataSensor33.marginLeft != that.state.dataSensor33.marginLeft ||
                textLine66.paddingLeft != that.state.textLine66.paddingLeft ||
                textLine33.paddingLeft != that.state.textLine33.paddingLeft ||
                dataTextView.marginTop != that.state.dataTextView.marginTop ||
                dataTextView.height != that.state.dataTextView.height ||
                dataTextView.left != that.state.dataTextView.left) {
            that.state.styleBackground = styleBackground;
            that.state.dataSensorInImage = dataSensorInImage;
            that.state.dataSensor33 = dataSensor33;
            that.state.dataSensor66 = dataSensor66;
            that.state.styleFill = styleFill;
            that.state.textLine66 = textLine66;
            that.state.textLine33 = textLine33;
            that.state.dataTextView = dataTextView;
            that.forceUpdate();
        }
    }

    toFilter2(e) {
        return e == 'airh' ? 'hum' : (e == 'soilm' ? 'water' : e)
    }

    renderCardFront() {
        const {percent, sensor, filter, meteo, limit33, limit66, units, value, measureTime, title, evapotranspiration, dewpoint} = this.props;
        //var limit33 = this.state.limit33;

        var that = this;

        var cardTitle = title? title.toUpperCase() : this.props.actions.translate.get('fliwerCard_' + this.toFilter2(filter) + '_title');

        that.renderPositions();

        return (
                <View style={this.style.paramCard}>
                    <View style={this.style.title}>
                        <Image style={this.style.iconImage} resizeMode={"contain"} source={alert[filter]} />
                        <Text style={this.style.titleText}>{cardTitle}</Text>
                    </View>
                    <View style={this.style.line}></View>
                    <View style={this.style.dataView}>
                        <View style={[this.style.infoBox, (sensor ? this.style.infoBoxOutSensor : this.style.infoBoxOutNoSensor)]}>
                            <View style={[this.style.infoBoxOut2, this.style[filter + 'Background2']]}>
                                <Text style={[this.style.infoBox2Text, evapotranspiration? {marginTop: 10} : {}]}>{this.props.actions.translate.get('fliwerCard_last_read') + ' | ' + (measureTime ? moment(new Date(measureTime * 1000)).format("LL HH:mm") : this.props.actions.translate.get('fliwerCard_no_data'))}</Text>
                                {evapotranspiration?
                                <Text style={[this.style.infoBox2Text, this.style.evapotranspirationText]}>{
                                    evapotranspiration.title + " = " + evapotranspiration.value + " " + evapotranspiration.units
                                }</Text>:null}
                                {dewpoint?
                                <Text style={[this.style.infoBox2Text, this.style.evapotranspirationText, this.style.dewpointText]}>{
                                    dewpoint.title + " = " + dewpoint.value + " " + dewpoint.units
                                }</Text>:null}
                            </View>
                            <View style={[this.style.infoBoxOut1, this.style[filter + 'Background']]}>
                                {this.renderBox1()}
                            </View>
                        </View>
                        <View style={[this.style.roundBox, (sensor ? this.style.roundBoxSensor : this.style.roundBoxNoSensor)]}></View>
                        <View style={[this.style.dataPercent, (sensor ? this.style.dataSensorBackground : this.style.dataNoSensorBackground), this.state.styleBackground]}></View>
                        <View style={[this.style.dataPercent, (sensor ? this.style.dataSensorBackground : this.style.dataNoSensorBackground), this.style[filter + 'Background'], this.state.styleFill]}></View>
                        <View style={sensor ? this.style.dataSensor : this.style.dataNoSensor} onLayout={(event) => {
                                var {width, height} = event.nativeEvent.layout;
                                that.state.containerWidth = width;
                                that.state.containerHeight = height;
                                that.renderPositions();
                            }}>
                            <Image style={[(sensor ? this.style.dataSensorIn : this.style.dataNoSensorIn), this.state.dataSensorInImage]} source={sensor ? paramSensor : paramNoSensor}/>
                        </View>

                        <View style={[this.style.dataLine, this.style.dataLineBottom, (sensor ? this.style.dataSensorLine : this.style.dataNoSensorLine), this.state.dataSensor33]}>
                            <Text style={[this.style.limitText, this.style.limitTextDown, (sensor ? this.style.limitTextSensor : this.style.limitTextNoSensor), this.state.textLine33]}>{this.props.actions.translate.get('fliwerCard_minLimit').toUpperCase() + ": " + this.valueWithUnits(limit33, units)}</Text>
                            {this.renderLowLimitsButtons()}
                        </View>
                        <View style={[this.style.dataLine, this.style.dataLineTop, (sensor ? this.style.dataSensorLine : this.style.dataNoSensorLine), this.state.dataSensor66]}>
                            <Text style={[this.style.limitText, (sensor ? this.style.limitTextSensor : this.style.limitTextNoSensor), this.style.limitTextUp, this.state.textLine66]}>{this.props.actions.translate.get('fliwerCard_maxLimit').toUpperCase() + ": " + this.valueWithUnits(limit66, units)}</Text>
                        </View>
                        <View style={[this.style.dataTextView, (sensor ? this.style.dataTextViewSensor : this.style.dataTextViewNoSensor), this.state.dataTextView]}>
                            <Text style={[this.style.dataText, this.style[filter + 'Color'], Platform.OS=="ios"?{paddingTop: 3}:{}]}>{this.valueWithUnits(value, units)}</Text>
                        </View>
                    </View>
                </View>
                );
    }


    renderBox1() {
        const {filter, meteo, units, value} = this.props;
        var text;
        var indents = [];
        var _units = units;
        var _unitsHours = "";
        var _unitsMinuts = "";
        if (filter == "light" || filter == "temp" || filter == "airh" || filter == "anemometer" || filter == "pluviometer")
            text = 'fliwerCard_tomorrowPrevision';
        else if (filter == "fert")
            text = 'fliwerCard_fert_title2';
        else
            text = 'fliwerCard_water_nowater';
        indents.push(<Text style={this.style.infoBox1Text}>{this.props.actions.translate.get(text)}</Text>);

        if (filter == "light" || filter == "anemometer" || filter == "pluviometer") {
            var meteoIcon = meteo && meteo['1d_icon'] ? meteo['1d_icon'] : null;
            indents.push(
                    <View style={this.style.nextDayMeteoOut}>
                        <Image source={{uri: meteoIcon}} resizeMode={"contain"} style={this.style.nextDayMeteo}/>
                    </View>
                    );
        } else {
            var textValue = 0;
            var textValueHours = 0;
            var textValueMinuts = 0;
            if (meteo && filter == "temp")
            {
                textValue = meteo['1d_temperature'];
                if (!_units)
                    _units = "ºC";
            } else if (meteo && filter == "airh")
            {
                textValue = meteo['1d_airHumidity'];
                if (!_units)
                    _units = "%";
            } else if (this.props.sensor && filter == "soilm") {
                textValue = this.props.prevIrrigation ? parseInt(((Date.now() - (this.props.prevIrrigation * 1000)) / (1000 * 60 * 60 * 24))) : "--";
                textValueHours = this.props.prevIrrigation ? parseInt((((Date.now() - (this.props.prevIrrigation * 1000)) / (1000 * 60 * 60 * 24)) - textValue) * 24) : 0;
                textValueMinuts = this.props.prevIrrigation ? parseInt((((Date.now() - (this.props.prevIrrigation * 1000)) / (1000 * 60 * 60 * 24)) - textValue) * 24 * 60) : 0;
                _units = this.props.actions.translate.get('fliwerCard_days');
                _unitsHours = this.props.actions.translate.get('fliwerCard_hours');
                _unitsMinuts = this.props.actions.translate.get('fliwerCard_minuts');

            } else if (!this.props.sensor && (filter == "soilm" || filter == "fert"))
            {
                textValue = this.props.actions.translate.get('fliwerCard_no_data');
                _units = "";
            } else
            {
                if (value != null)
                    textValue = value;
                else
                    textValue = "--";
            }

            indents.push(
                    <View style={[this.style.nextDayMeteoOut, this.style.nextDayMeteoOutFlex]}>
                        <Text style={this.style.infoBox1Text2}>{(filter == "soilm" && textValue == 0 && textValueHours == 0) ? textValueMinuts + " " + _unitsMinuts : ""} {(textValue >= 1) ? (textValue + " " + _units + " ") : !this.props.prevIrrigation ? textValue + " " + _units : ""} {textValueHours >= 1 ? textValueHours + " " + _unitsHours + " " : ""}</Text>
                    </View>
                    );
        }
        return indents;
    }

    renderLowLimitsButtons() {
        const {filter, meteo, units, value} = this.props;
        var indents = [];
        var that = this;

        if (!this.props.idZone) {
            return indents;
        }

        var zone = this.props.zoneData[this.props.idZone];
        //console.log(zone);
        if (!zone.CC) {
            return indents;
        }

//        if (filter === "soilm")
        if (filter === "soilm" && (this.props.sessionData.gardener || global.envVars.TARGET_RAINOLVE ))
        {
            indents.push(
                <View style={this.style.signButtonContainer}>
                    <FliwerCalmButton
                        onPress={async ()=>{await that.setLowLimit('increase')}}
                        onMouseEnter={this.hoverIn('signIcon')}
                        onMouseLeave={this.hoverOut('signIcon')}
                        containerStyle={this.style.signButton}
                        imageData={{
                            style: this.style.signIcon,
                            source: plusSignImage,
                            resizeMode: "contain"
                        }}
                    />
                    <FliwerCalmButton
                        onPress={()=>{
                            return new Promise(function(resolve,reject){
                                that.setLowLimit('decrease').then(function(value){
                                    resolve(value);
                                },function(err){
                                    resolve(null);
                                });
                            });
                        }}
                        onMouseEnter={this.hoverIn('signIcon2')}
                        onMouseLeave={this.hoverOut('signIcon2')}
                        containerStyle={this.style.signButton}
                        imageData={{
                            style: this.style.signIcon2,
                            source: minusSignImage,
                            resizeMode: "contain"
                        }}
                    />
                    <FliwerCalmButton
                        onPress={()=>{
                            return new Promise(function(resolve,reject){
                                that.setLowLimit('default').then(function(value){
                                    resolve(value);
                                },function(err){
                                    resolve(null);
                                });
                            });
                        }}
                        onMouseEnter={this.hoverIn('defaultButton')}
                        onMouseLeave={this.hoverOut('defaultButton')}
                        containerStyle={this.style.signButton}
                        buttonStyle={this.style.defaultButton}
                        text={"Default"}
                        textStyle={this.style.defaultButtonText}
                    />
                </View>
            );
        }

        return indents;
    }

    setLowLimit(action)
    {
        if (!this.props.idZone) {
            toast.error("Oups! idZone is not defined. This shouldn't happen.");
            return;
        }

        var that = this;
        return new Promise(function(resolve,reject){
            that.props.actions.fliwerZoneActions.setURCustom(that.props.idZone, action).then((limit33) => {
                //toast.notification("New limit: " + limit33);
                //that.setState({limit33: limit33});
                that.props.rerenderParentCallback();
                resolve(limit33);
            }, (err) => {
                if (err && err.reason) {
                    toast.error(err.reason);
                }
                resolve(null);
            });
        });

    }
};


function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        devices: state.fliwerDeviceReducer.devices,
        zoneData: state.fliwerZoneReducer.data,
        sessionData: state.sessionReducer.data
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
        }
    }
}

var style = {
    paramCard: {
        width: "100%",
        height: 350,
        alignItems: "center"
    },
    iconImage: {
        position: 'absolute',
        height: 30,
        width: 30,
        left: 10
    },
    titleText: {
        textAlign: "center",
        fontSize: 14,
        paddingLeft: 20,
        paddingRight: 20,
        fontFamily: "AvenirNext-Regular",
        width: "100%"
    },
    nextDayMeteoOut: {
        display: "flex",
        position: "absolute",
        top: 28,
        bottom: 5,
        left: 5,
        right: 5,
        marginLeft: 10,
        justifyContent: "center",
        flexDirection: "row"
    },
    nextDayMeteoOutFlex: {
        display: "flex",
        flexDirection: "column"
    },
    nextDayMeteo: {
        flex: 1,
        height: undefined,
        width: undefined,
        maxWidth: 100
    },
    infoBox1Text: {
        textAlign: "center",
        fontSize: 12,
        paddingLeft: 5,
        paddingRight: 5,
        fontFamily: "AvenirNext-Regular",
        width: "100%",
        color: "white",
        marginTop: 10
    },
    infoBox1Text2: {
        textAlign: "center",
        fontSize: 26,
        paddingLeft: 5,
        paddingRight: 5,
        fontFamily: "AvenirNext-Bold",
        width: "100%",
        color: "white",
        paddingTop: 10
    },
    infoBox2Text: {
        textAlign: "center",
        fontSize: 12,
        paddingLeft: 5,
        paddingRight: 5,
        fontFamily: "AvenirNext-Regular",
        width: "100%",
        color: "white"
    },
    evapotranspirationText: {
        marginTop: 10,
        fontWeight: "bold",
        color: "white"
    },
    dewpointText: {
        marginTop: 5
    },
    title: {
        width: "100%",
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        height: 30
    },
    line: {
        width: "90%",
        borderBottomColor: '#cecece',
        borderBottomWidth: 1
    },
    text: {
        width: '100%',
        textAlign: 'justify'
    },
    dataView: {
        height: 200,
        width: "100%",
    },
    dataSensor: {
        left: 20,
        height: 200,
        width: 200
    },
    dataNoSensor: {
        left: 20,
        height: 200,
        width: 100
    },
    dataLine: {
        position: "absolute",
        right: 0
    },
    dataLineTop: {
        borderBottomColor: '#cecece',
        borderBottomWidth: 1
    },
    dataLineBottom: {
        borderTopColor: '#cecece',
        borderTopWidth: 1
    },
    dataPercent: {

    },
    lightColor: {
        color: FliwerColors.parameters.light,
    },
    lightBackground: {
        backgroundColor: FliwerColors.parameters.light,
    },
    lightBackground2: {
        backgroundColor: FliwerColors.subparameters.light,
    },
    tempColor: {
        color: FliwerColors.parameters.temp,
    },
    tempBackground: {
        backgroundColor: FliwerColors.parameters.temp,
    },
    tempBackground2: {
        backgroundColor: FliwerColors.subparameters.temp,
    },
    airhColor: {
        color: FliwerColors.parameters.airh,
    },
    airhBackground: {
        backgroundColor: FliwerColors.parameters.airh,
    },
    airhBackground2: {
        backgroundColor: FliwerColors.subparameters.airh,
    },
    soilmColor: {
        color: FliwerColors.parameters.soilm,
    },
    soilmBackground: {
        backgroundColor: FliwerColors.parameters.soilm,
    },
    soilmBackground2: {
        backgroundColor: FliwerColors.subparameters.soilm,
    },
    fertColor: {
        color: FliwerColors.parameters.fert,
    },
    fertBackground: {
        backgroundColor: FliwerColors.parameters.fert,
    },
    fertBackground2: {
        backgroundColor: FliwerColors.subparameters.fert,
    },
    anemometerColor: {
        color: FliwerColors.parameters.anemometer,
    },
    anemometerBackground: {
        backgroundColor: FliwerColors.parameters.anemometer,
    },
    anemometerBackground2: {
        backgroundColor: FliwerColors.subparameters.anemometer,
    },
    pluviometerColor: {
        color: FliwerColors.parameters.pluviometer,
    },
    pluviometerBackground: {
        backgroundColor: FliwerColors.parameters.pluviometer,
    },
    pluviometerBackground2: {
        backgroundColor: FliwerColors.subparameters.pluviometer,
    },
    dataSensorBackground: {
        position: "absolute",
        backgroundColor: "#767676",
    },
    dataNoSensorBackground: {
        position: "absolute",
        backgroundColor: "#767676",
    },
    dataSensorIn: {
        bottom: 0,
        position: "absolute"
    },
    dataNoSensorIn: {
        position: "absolute"
    },
    limitText: {
        textAlign: "right",
        fontSize: 12,
        fontFamily: "AvenirNext-Regular",
        width: "100%"
    },
    limitTextUp: {
        position: "absolute",
        right: 0,
        bottom: 0
    },
    limitTextDown: {
        marginTop: 4
    },
    dataTextView: {
        right: "30%",
        position: "absolute",
        top: "5%",
        display: "flex",
        justifyContent: "center"
    },
    dataTextViewNoSensor: {
        right: "40%"
    },
    dataText: {
        textAlign: "right",
        fontSize: 30,
        fontFamily: "AvenirNext-Bold"
    },
    roundBox: {
        position: "absolute",
        backgroundColor: "white"
    },
    infoBox: {
        position: "absolute",
        right: 0
    },
    infoBoxOut1: {
        position: "absolute",
        width: "100%",
        height: "60%"
    },
    infoBoxOut2: {
        position: "absolute",
        width: "100%",
        top: "60%",
        bottom: 0,
        display: "flex",
        alignItems: "center",
//        flexDirection: "row",
        justifyContent: "center"
    },
    signButtonContainer:{
        position:"relative",
        flexDirection: 'row',
        height: 25,
        marginLeft: "auto",
        display:"flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        marginTop: 10
    },
    signButton:{
//        borderColor: 'green',
//        borderWidth: 1,
        padding: 5
    },
    signIcon:{
        width:25,
        height:25
    },
    signIcon2:{
        width:25,
        height:25
    },
    defaultButton: {
        borderColor: 'silver',
        borderWidth: 1,
        borderRadius: 5,
        height: 25,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 6
    },
    defaultButtonText: {
        fontSize: 10
    },
    ":hover":{
        signIcon:{
//          filter:"opacity(50%)",
//          backgroundColor:FliwerColors.primary.green
        },
        signIcon2:{
//          filter:"opacity(50%)",
//          backgroundColor:FliwerColors.primary.green
        },
        defaultButton: {
//          filter:"opacity(50%)",
          backgroundColor:FliwerColors.primary.green
        }
    },
    "@media (orientation:landscape)": {
        paramCard: {
            height: "auto",
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        },
        line: {
            width: "98%"
        },
        cardStyle: {
            marginBottom: 0
        },
        cardInStyle: {
            maxWidth: 50000,
            height: "100%"
        },
        dataSensor: {
            bottom: 0,
            left: "5%",
            height: "auto",
            top: "5%",
            width: "43%",
            position: "absolute"
        },
        dataNoSensor: {
            bottom: 0,
            left: "5%",
            height: "auto",
            width: "17%",
            position: "absolute",
            top: 0
        },
        dataSensorLine: {
            left: "5%",
            top: "5%",
            right: "30%"
        },
        dataSensorBackground: {
            left: "5%",
            top: "5%",
        },
        dataNoSensorLine: {
            left: "5%",
            top: 0,
            right: "40%"
        },
        dataNoSensorBackground: {
            left: "5%",
            top: 0
        },
        dataView: {
            top: 51,
            bottom: 0,
            position: "absolute",
            height: "auto"
        },
        dataTextViewNoSensor: {
            top: 0
        },
        roundBox: {
            top: 0,
            bottom: 0,
            width: 10,
            borderTopRightRadius: 45,
            borderBottomRightRadius: 45
        },
        roundBoxSensor: {
            left: "70%"
        },
        roundBoxNoSensor: {
            left: "60%"
        },
        infoBox: {
            top: 0,
            bottom: 0
        },
        infoBoxOut1: {
            paddingLeft: 10
        },
        infoBoxOut2: {
            paddingLeft: 10,
            borderBottomRightRadius: 10
        },
        infoBoxOutSensor: {
            left: "70%"
        },
        infoBoxOutNoSensor: {
            left: "60%"
        },
        "@media (width<=1300)": {
            limitText: {
                fontSize: 10
            },
            dataText: {
                fontSize: 20,
                lineHeight: 20
            },
            roundBox: {
                width: 5,
            },

            infoBoxOut1: {
                paddingLeft: 5
            },
            infoBoxOut2: {
                paddingLeft: 5
            },
            infoBox1Text2: {
                fontSize: 18
            }
        },
        "@media (width<=964)": {
            evapotranspirationText: {
                fontSize: 10
            }
        },
        "@media (width<=750)": {//some phones in landscape have limited space
            limitText: {
                fontSize: 8
            },
            dataSensor: {
                left: 5,
                width: "30%"
            },
            dataNoSensor: {
                left: 5
            },
            dataSensorLine: {
                left: 5
            },
            dataSensorBackground: {
                left: 5
            },
            dataNoSensorLine: {
                left: 5
            },
            dataNoSensorBackground: {
                left: 5
            },
            dataText: {
                fontSize: 20,
                lineHeight: 20
            },
            infoBox1Text: {
                fontSize: 10,
                marginTop: 3
            },
            infoBox2Text: {
                fontSize: 10
            },
            infoBox1Text2: {
                fontSize: 18
            }
        },
        "@media (width<=650)": {//worst phones
            dataText: {
                fontSize: 15,
                lineHeight: 15
            },
            infoBox1Text: {
                fontSize: 8
            },
            infoBox2Text: {
                fontSize: 8
            },
            infoBox1Text2: {
                fontSize: 12
            }
        },
        "@media (height<=470)": {//phones in landscape
            iconImage: {
                height: 25
            },
            title: {
                height: 10
            },
            titleText: {
                fontSize: 10
            },
            dataView: {
                top: 31
            }
        }
    },
    "@media (orientation:portrait)": {
        dataView: {
            height: 300
        },
        titleText: {
            paddingLeft: 45,
            paddingRight: 45
        },
        dataSensorBackground: {
            top: 0,
            left: 0
        },
        dataNoSensorBackground: {
            top: 0,
            left: 20
        },
        dataSensorIn: {
            borderBottomLeftRadius: 13
        },
        dataSensor: {
            left: 0,
            width: 140,
            height: 177,
            borderBottomLeftRadius: 13
        },
        dataNoSensor: {
            height: 177
        },
        infoBoxOut1: {
            height: "63%",
            paddingTop: 10,
            borderBottomLeftRadius: 13,
            borderBottomRightRadius: 13,
        },
        infoBoxOut2: {
            top: "63%",
            marginTop: -10,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10
        },
        dataSensorLine: {
            left: 20,
            top: 0,
            right: 15
        },
        dataNoSensorLine: {
            left: 20,
            top: 0,
            right: 15
        },
        limitText: {
            fontSize: 8
        },
        limitTextNoSensor: {
            fontSize: 10
        },
        dataTextView: {
            top: 0,
            right: 15
        },
        dataText: {
            fontSize: 25,
            lineHeight: 25
        },
        dataTextViewNoSensor: {
            right: 15
        },
        roundBox: {
            top: 167,
            left: 0,
            right: 0,
            height: 10,
            borderBottomLeftRadius: 45,
            borderBottomRightRadius: 45
        },
        infoBox: {
            top: 167,
            bottom: 0,
            left: 0,
            right: 0
        },
        nextDayMeteoOut: {
            top: 38
        },
        defaultButton: {
            paddingTop: 3
        },
        evapotranspirationText: {
            marginTop: 3,
            fontSize: 10
        },
        dewpointText: {
            marginTop: 3,
            fontSize: 10
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, ParamCard));
