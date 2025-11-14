import React from 'react'
var {View, Platform, Switch, Text, TouchableOpacity} = require('react-native');
import moment from 'moment';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryLabel, Rect, Text as SvgText, VictoryTooltip, VictoryVoronoiContainer, VictoryContainer, VictoryScatter, LineSegment} from 'victory-native';
import { Svg } from 'react-native-svg';
import {SvgImage} from '../../widgets/svgImage/svgImage'


import * as scale from 'd3-scale'

import irr_manual  from '../../assets/img/5_riego_manual.png'
import irr_auto  from '../../assets/img/5_riego_auto.png'
import irr_both  from '../../assets/img/5_riego_ambos.png'

import zoom_in  from '../../assets/img/zoom_in.png'
import zoom_out  from '../../assets/img/zoom_out.png'

///////////////////////////////////////////////////////////////
//CUSTOM THEME

// Layout
const padding = 8;

// * Labels
const baseLabelStyles = {
    padding,
    stroke: "transparent",
    strokeWidth: 0
};

// Strokes

// Put it all together...
const theme = {
    axis: Object.assign(
            {
                style: {
                    axis: {
                        fill: "transparent",
                    },
                    axisLabel: Object.assign({}, {
                        padding,
                        stroke: "transparent"
                    }),
                    grid: {
                        strokeWidth: 0,
                        stroke: "transparent"
                    },
                    ticks: {
                        fill: "transparent",
                        size: 5,
                        strokeWidth: 1
                    },
                    tickLabels: Object.assign({}, baseLabelStyles)
                }
            },
            ),
    line: Object.assign(
            {
                style: {
                    data: {
                        fill: "transparent",
                        opacity: 1,
                        strokeWidth: 2
                    }
                }
            }
    ),
    tooltip: {
        style: Object.assign({}, {
            padding: 5,
            pointerEvents: "none"
        }),
        flyoutStyle: {
            strokeWidth: 1,
            fill: "#f0f0f0",
            pointerEvents: "none"
        },
        cornerRadius: 5,
        pointerLength: 5
    }
};

///////////////////////////////////////////////////////////////

class FliwerFlowChart extends React.PureComponent {

    constructor(props) {
        super(props);
        var defaultValues = this.calculateNewDefaultValuesSync(this.props.defaultValues);
        //console.log("NEW CHART",this.props.defaultValues,defaultValues,defaultValues?new Date(defaultValues.from):null);
        this.state = {
            chartWidth: 0,
            chartHeight: 0,
            dataInstantEnabled: false,
            totalFrom: null,
            totalTo: null,
            total: null,
            totalValueProgram: null,
            totalValueManual: null,
            totalValueLoss: null,
            animationEnabled: true,
            animationTrigger: false,
            animationTriggerWhitelist: true,
            animationTriggerTimeout: null,
            animationTriggerTimeout2: null,
            animationTriggerTimeout3: null,
            zoom: defaultValues && defaultValues.zoom ? true : false,
            from: defaultValues && defaultValues.from ? defaultValues.from : null,
            to: defaultValues && defaultValues.to ? defaultValues.to : null,
            numberSeparations: defaultValues && defaultValues.numberSeparations ? defaultValues.numberSeparations : null,
            separationsUnit: defaultValues && defaultValues.separationsUnit ? defaultValues.separationsUnit : null,
            rectHover: null,
            syncUpdate: false,
            showPrev: true,
            showNext: false
        }
        this.calculateNewDefaultValues(this.props.defaultValues).then((defaultValues) => {
            this.animate();
        })
        this.point = [];

    }

    componentWillMount = () => {
        this.measureView();
    }

    componentWillUnmount() {
        clearTimeout(this.state.animationTriggerTimeout);
        clearTimeout(this.state.animationTriggerTimeout2);
        clearTimeout(this.state.animationTriggerTimeout3);
    };

    shouldComponentUpdate(nextProps, nextState) {
        return (this.state.animationEnabled==false || nextState.animationEnabled==false) &&  !(JSON.stringify(this.props) == JSON.stringify(nextProps) && JSON.stringify(this.state) == JSON.stringify(nextState));
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.defaultValues) != JSON.stringify(nextProps.defaultValues) || this.props.numberSeparations != nextProps.numberSeparations) {
            this.calculateNewDefaultValues(nextProps.defaultValues, nextProps).then((defaultValues) => {
                this.setState({
                    zoom: defaultValues && defaultValues.zoom ? true : false,
                    from: defaultValues && defaultValues.from ? defaultValues.from : null,
                    to: defaultValues && defaultValues.to ? defaultValues.to : null,
                    numberSeparations: defaultValues && defaultValues.numberSeparations ? defaultValues.numberSeparations : null,
                    separationsUnit: defaultValues && defaultValues.separationsUnit ? defaultValues.separationsUnit : null,
                    syncUpdate: true
                })
            })
        }
        if (this.props.color != nextProps.color || this.props.color2 != nextProps.color2 || this.props.data.length != nextProps.data.length) {
            this.setState({animationEnabled: true});
        }
    }

    recalculateFromTo(origFrom, nseparations) {
        const {getMoreData, dataRange} = this.props
        return new Promise((resolve, reject) => {
            var newFrom = new Date();
            newFrom.setHours(0);
            newFrom.setMinutes(0);
            newFrom.setSeconds(0);
            newFrom.setMilliseconds(0);
            newFrom.setDate(newFrom.getDate() + 1);
            var nowFromDiff = (newFrom.getTime() - origFrom);
            var timeZonediff = 0;
            if (newFrom.getTimezoneOffset() != new Date(origFrom).getTimezoneOffset()) {
                timeZonediff = (newFrom.getTimezoneOffset() - new Date(origFrom).getTimezoneOffset()) * 60000;
            }
            var daysFromDiff = (nowFromDiff - timeZonediff) / 86400000;
            var separationsToFrom = Math.ceil(daysFromDiff / nseparations);
            //debugger;
            newFrom.setDate((newFrom.getDate() - nseparations) - ((separationsToFrom - 1) * nseparations))
            var newTo = new Date(newFrom);
            newTo.setDate(newTo.getDate() + (nseparations) - 1)

            if (newFrom.getTime() / 1000 < dataRange.from) {
                if (getMoreData) {
                    getMoreData(newFrom.getTime() / 1000, newTo.getTime() / 1000).then(() => {
                        resolve({from: newFrom, to: newTo})
                    })
                }
            } else {
                resolve({from: newFrom, to: newTo});
            }
        })
    }

    recalculateFromToSync(origFrom, nseparations) {
        const {getMoreData, dataRange} = this.props
        var newFrom = new Date();
        newFrom.setHours(0);
        newFrom.setMinutes(0);
        newFrom.setSeconds(0);
        newFrom.setMilliseconds(0);
        newFrom.setDate(newFrom.getDate() + 1);
        var nowFromDiff = (newFrom.getTime() - origFrom);
        var timeZonediff = 0;
        if (newFrom.getTimezoneOffset() != new Date(origFrom).getTimezoneOffset()) {
            timeZonediff = (newFrom.getTimezoneOffset() - new Date(origFrom).getTimezoneOffset()) * 60000;
        }
        var daysFromDiff = (nowFromDiff - timeZonediff) / 86400000;
        var separationsToFrom = Math.ceil(daysFromDiff / nseparations);
        //debugger;
        newFrom.setDate((newFrom.getDate() - nseparations) - ((separationsToFrom - 1) * nseparations))
        var newTo = new Date(newFrom);
        newTo.setDate(newTo.getDate() + (nseparations) - 1)
        return {from: newFrom, to: newTo}
    }

    calculateNewDefaultValues(defaults, nextProps) {
        const {numberSeparations, getMoreData, dataRange} = this.props
        return new Promise((resolve, reject) => {
            var defaultValues = Object.assign({}, defaults);
            if (defaults && !defaults.zoom) {
                var nseparations = nextProps ? (nextProps.numberSeparations ? nextProps.numberSeparations : 4) : (numberSeparations ? numberSeparations : 4);

                var origFrom = defaultValues.from;
                var origTo = defaultValues.to;

                var obj = this.recalculateFromTo(origFrom, nseparations).then((obj) => {
                    defaultValues.from = obj.from.getTime();
                    defaultValues.to = obj.to.getTime();
                    resolve(defaultValues)
                });
            } else
                resolve(defaultValues);
        })
    }

    calculateNewDefaultValuesSync(defaults) {
        const {numberSeparations, getMoreData, dataRange} = this.props

        var defaultValues = Object.assign({}, defaults);
        if (defaults && !defaults.zoom) {
            var nseparations = numberSeparations ? numberSeparations : 4;

            var origFrom = defaultValues.from;
            var origTo = defaultValues.to;

            var obj = this.recalculateFromToSync(origFrom, nseparations)
            defaultValues.from = obj.from.getTime();
            defaultValues.to = obj.to.getTime();
        }
        return defaultValues
    }

    componentWillUpdate(nextProps, nextState) {
        const {onNewPosition} = this.props
        if ((nextState.from != this.state.from || nextState.to != this.state.to || nextState.zoom != this.state.zoom) && onNewPosition) {
            console.log("UPDATE FATHER syncUpdate?", this.state.syncUpdate, {from: nextState.from, to: nextState.to, zoom: nextState.zoom, numberSeparations: nextState.numberSeparations, separationsUnit: nextState.separationsUnit})
            /*if(Platform.OS==='web' || !this.state.syncUpdate)*/onNewPosition({from: nextState.from, to: nextState.to, zoom: nextState.zoom, numberSeparations: nextState.numberSeparations, separationsUnit: nextState.separationsUnit});
            //else this.setState({syncUpdate:false})
        }
    }

    measureView() {
        if (this._container) {
            this._container.measure((ox, oy, width, height, px, py) => {
                this.setState({chartHeight: height, chartWidth: width - 60});
            })
        }
    }

    animate() {
        this.setState({animationEnabled: true, animationTrigger: true, animationTriggerWhitelist: false})
        this.state.animationTriggerTimeout = setTimeout(() => {
            this.setState({animationTriggerWhitelist: true})
        }, 0)
        this.state.animationTriggerTimeout2 = setTimeout(() => {
            this.setState({animationTrigger: false})
        }, 500)
        this.state.animationTriggerTimeout3 = setTimeout(() => {
            this.setState({animationEnabled: false})
        }, 3000)
    }

    valueWithUnits(value, units) {
        var micro = false;
        if (units && units.charAt(0) == "μ")
            micro = true;
        if (units && value > 1000) {
            value /= 1000;
            units = (micro ? "m" : "K") + (micro ? units.substr(1) : units);
        }
        return Math.round(value * 100) / 100 + " " + (units ? units : "")
    }

    forceRender() {
        this.forceUpdate();
    }

    /*
     zoomPress(e){
     const { numberSeparations} = this.props
     if(this.state.zoom){
     this.setState({animationEnabled:true,zoom:false,from:null,to:null,numberSeparations:null,separationsUnit:null,textTest:[]})
     this.animate();
     }else{
     var nseparations=this.state.numberSeparations?this.state.numberSeparations:(numberSeparations?numberSeparations:4);

     var pos=Math.floor( ((e.nativeEvent.locationX/this.state.chartWidth)*100) / (100/nseparations))
     var time=(this.state.auxTo-this.state.auxFrom)/nseparations;

     var from=this.state.auxFrom.getTime()+time*pos

     var to=new Date(from);
     to.setDate(to.getDate()+1);
     this.setState({animationEnabled:true,zoom:true,from:from,to:to.getTime(),numberSeparations:4,separationsUnit:'h',textTest:[]})
     this.animate();
     }
     }*/

    zoomPress(e) {
        const {numberSeparations, getMoreData, dataRange} = this.props;

        if (this.state.zoom) {
            var nseparations = numberSeparations ? numberSeparations : 4;
            this.recalculateFromTo(this.state.from, nseparations).then((obj) => {
                this.setState({animationEnabled: true, zoom: false, from: obj.from.getTime(), to: obj.to.getTime(), numberSeparations: 1, separationsUnit: null, textTest: []})
                this.animate();
            })
        } else {
            var nseparations = numberSeparations ? numberSeparations : 4;
            var locationX = Platform.OS === 'web'? e.nativeEvent.layerX : e.nativeEvent.locationX;
            var pos = Math.floor(((locationX / this.state.chartWidth) * 100) / (100 / nseparations))
            var time = (this.state.auxTo - this.state.auxFrom) / nseparations;
            var from = this.state.auxFrom.getTime() + time * pos
            var to = new Date(from);
            to.setDate(to.getDate() + 1);
            this.setState({animationEnabled: true, zoom: true, from: from, to: to.getTime(), numberSeparations: 4, separationsUnit: 'h', textTest: []})
            this.animate();
        }
    }

    nextPress() {
        const {separationsUnit, numberSeparations} = this.props
        var nseparations = (numberSeparations ? numberSeparations : 4) - 1;
        var useparations = this.state.separationsUnit ? this.state.separationsUnit : (separationsUnit ? separationsUnit : 'd');
        var newTo = new Date(this.state.auxTo);
        var newFrom = new Date(this.state.auxTo);
        if (this.state.zoom) {
            newFrom.setDate(newTo.getDate());
            newTo.setDate(newFrom.getDate() + 1);
        } else {
            switch (useparations) {
                case 'h':
                    newFrom.setHours(newTo.getHours());
                    newTo.setHours(newFrom.getHours() + nseparations);
                    break;
                default:
                    newFrom.setDate(newTo.getDate());
                    newTo.setDate(newFrom.getDate() + nseparations);
                    break;
            }
        }

        this.setState({
            from: newFrom.getTime(),
            to: newTo.getTime(),
            numberSeparations: this.state.zoom ? this.state.numberSeparations : 1,
            animationEnabled: true,
            syncUpdate: true
        })
        this.animate();
    }

    prevPress() {
        const {separationsUnit, numberSeparations, dataRange, getMoreData} = this.props
        var nseparations = (numberSeparations ? numberSeparations : 4);
        var useparations = this.state.separationsUnit ? this.state.separationsUnit : (separationsUnit ? separationsUnit : 'd');
        var newTo = new Date(this.state.auxFrom);
        var newFrom = new Date(this.state.auxFrom);
        var newFromGather = new Date(this.state.auxFrom);
        if (this.state.zoom) {
            newFromGather.setDate(newFrom.getDate() - 1 * 10);
            newFrom.setDate(newFrom.getDate() - 1);
        } else {
            switch (useparations) {
                case 'h':
                    newTo.setHours(newTo.getHours() - 1);
                    newFromGather.setHours(newFrom.getHours() - nseparations * 10);
                    newFrom.setHours(newFrom.getHours() - nseparations);
                    break;
                default:
                    newTo.setDate(newTo.getDate() - 1);
                    newFromGather.setDate(newFrom.getDate() - nseparations * 10);
                    newFrom.setDate(newFrom.getDate() - nseparations);
                    break;
            }
        }
        if (newFrom.getTime() / 1000 < dataRange.from) {
            if (getMoreData) {
                getMoreData(newFromGather.getTime() / 1000, newTo.getTime() / 1000).then(() => {
                    console.log("PREV PRESS 1")
                    this.setState({
                        from: newFrom.getTime(),
                        to: newTo.getTime(),
                        numberSeparations: this.state.zoom ? this.state.numberSeparations : 1,
                        animationEnabled: true,
                        syncUpdate: true
                    })
                    this.animate();
                })
            }
        } else {
            console.log("PREV PRESS 2")
            this.setState({
                from: newFrom.getTime(),
                to: newTo.getTime(),
                numberSeparations: this.state.zoom ? this.state.numberSeparations : 1,
                animationEnabled: true,
                syncUpdate: true
            })
            this.animate();
        }
    }

    render() {
        const {style, data, color, color2, numberDays, hideBottomBar, hideMiddleBar, hideTopBar} = this.props;
        //console.log("render fliwerFlowChart");

        return (
                <View style={[this.style.container, style]} >
                    <View style={[this.style.bottomChart, FliwerCommonUtils.isIphoneBrowser()? {bottom: 60, zIndex: 99, height: 85} : {}, hideBottomBar?{backgroundColor: FliwerColors.subparameters.soilm}: {}]}>
                        {this.renderBottomChart()}
                    </View>
                    <View style={this.style.containerChart} ref={(v) => {
                            this._container = v;
                        }} onLayout={() => {
                            this.measureView();
                        }}>
                        {this.renderChart()}
                        <TouchableOpacity style={{opacity: 0, height: 40, width: "100%", position: "absolute"}}
                            onPress={(e) => {
                                this.zoomPress(e)
                            }}
                          >
                        </TouchableOpacity>
                        {(this.state.animationEnabled ? (<TouchableOpacity activeOpacity={0} onPress={() => {
                                        }} style={this.style.animationMask}></TouchableOpacity>) : [])}
                    </View>
                    {this.state.showPrev ? (<TouchableOpacity onPress={() => this.prevPress()} style={[this.style.prevNextButton, this.style.prevButton]}><Text style={[this.style.prevNextText]}>{"<"}</Text></TouchableOpacity>) : []}
                    {this.state.showNext ? (<TouchableOpacity onPress={() => this.nextPress()} style={[this.style.prevNextButton, this.style.nextButton]}><Text style={[this.style.prevNextText]}>{">"}</Text></TouchableOpacity>) : []}
                </View>
                /*
                 xMin={1547218806}
                 xMax={1547794804}
                 */
                )

    }

    renderChart() {
        /*
         numberSeparations: n separations
         separationsUnit: ms,s,m,h,d,M

         Usage: if not from and to are provided (props or state), it shows the last numberSeparations per separationsUnit.
         if from and to are provided, it makes the separations every numberSeparations per separationsUnit.

         Example: numberSeparations=4, separationsUnit=d, no from and/or to
         Shows the last 4 days in the chart
         numberSeparations=4, separationsUnit=h, with from and to
         Shows a separation every 4 hours.
         */
        const {style, data, dataInstant, color, color2, color3, color4, numberSeparations, separationsUnit, units, currency, priceLiter, getMoreData, dataRange, minData, zoneData} = this.props

        var nseparations = this.state.numberSeparations ? this.state.numberSeparations : (numberSeparations ? numberSeparations : 4);

        if (this.state.zoom && this.state.chartWidth > 1600)
            nseparations = 1;
        else if (this.state.zoom)
            nseparations = 4;
        var timeseparation = 1;
        var useparations = this.state.separationsUnit ? this.state.separationsUnit : (separationsUnit ? separationsUnit : 'd');
        var data2 = [];
        var finalData = [...data];


        var to, from;
        if (this.state.from && this.state.to) {
            to = new Date(this.state.to);
            from = new Date(this.state.from);

            switch (useparations) {
                case 'h':
                    timeseparation = nseparations
                    var timeZonediff = 0;
                    if (to.getTimezoneOffset() != from.getTimezoneOffset()) {
                        timeZonediff = (to.getTimezoneOffset() - from.getTimezoneOffset()) * 60000;
                    }
                    var notexact = ((to.getTime() - from.getTime()) - timeZonediff) % (timeseparation * 3600000);
                    nseparations = parseInt(((to.getTime() - from.getTime()) - timeZonediff) / (timeseparation * 3600000));
                    if (notexact) {
                        nseparations++;
                        to.setHours(from.getHours() + nseparations);
                    }
                    break;
                default:
                    timeseparation = nseparations
                    var timeZonediff = 0;
                    if (to.getTimezoneOffset() != from.getTimezoneOffset()) {
                        timeZonediff = (to.getTimezoneOffset() - from.getTimezoneOffset()) * 60000;
                    }
                    var notexact = ((to.getTime() - from.getTime()) - timeZonediff) % (timeseparation * 86400000);
                    nseparations = parseInt(((to.getTime() - from.getTime()) - timeZonediff) / (timeseparation * 86400000));
                    if (!notexact) {
                        nseparations++;
                        to = new Date(from);
                        to.setDate(from.getDate() + nseparations);
                    }
                    break;
            }
        } else {
            to = new Date();
            to.setDate(to.getDate() + 1);
            to.setHours(0, 0, 0, 0);
            from = new Date(to);
            switch (useparations) {
                case 'h':
                    from.setHours(to.getHours() - nseparations);
                    break;
                default:
                    from.setDate(to.getDate() - nseparations);
                    break;
            }
        }

        for (var i = 0; i < finalData.length; i++) {
            data2[i] = finalData[i].filter((item) => {
                return item.time * 1000 >= from.getTime() - 15000000 && item.time * 1000 <= to.getTime() + 15000000
            });
        }

        this.state.auxFrom = from;
        this.state.auxTo = to;

        var showPrev = from > minData * 1000,
                showNext = to < Date.now();
        if (showPrev != this.state.showPrev || showNext != this.state.showNext)
            this.setState({showPrev: showPrev, showNext: showNext})//First load

        var tickValues = [];
        var dayTickValues = [];
        var lastDay = null;
        var allDaysTicks = [];
        var auxDate = new Date(from);
        var allDaysDate = new Date(from);

        switch (useparations) {
            case 'h':
                auxDate.setMinutes(auxDate.getMinutes() + (timeseparation * 30));
                break;
            default:
                auxDate.setHours(auxDate.getHours() + (timeseparation * 12));
                break;
        }

        var flowTickValues = [];
        var flowTickValuesProgram = [];
        var flowTickValuesManual = [];
        var flowTickValuesLoss = [];
        var maxValue = 0;
        var totalValue = 0;
        var totalValueProgram = 0;
        var totalValueManual = 0;
        var totalValueLoss = 0;

        var indexFlow = 0;
        while (auxDate.getTime() < to.getTime()) {
            //store the start from the current day and go to the end
            var auxallDaysDate = new Date(allDaysDate);
            allDaysTicks.push(allDaysDate.getTime() / 1000);

            switch (useparations) {
                case 'h':
                    allDaysDate.setHours(allDaysDate.getHours() + timeseparation);
                    break;
                default:
                    allDaysDate.setDate(allDaysDate.getDate() + timeseparation);
                    break;
            }

            var auxirrigationProgram = 0;
            var auxirrigationManual = 0;
            var auxirrigationLoss = 0;
            var auxFlows = []
            var auxTitle = "";
            while (indexFlow < data2[0].length && data2[0][indexFlow].time <= allDaysDate.getTime() / 1000) {
                while (indexFlow < data2[0].length && data2[0][indexFlow].time < auxallDaysDate.getTime() / 1000)
                    indexFlow++;
                if (indexFlow < data2[0].length && data2[0][indexFlow].time <= allDaysDate.getTime() / 1000) {
                    auxFlows.push({DeviceSerialNumber: data2[0][indexFlow].DeviceSerialNumber, value: data2[0][indexFlow].value, valve: data2[0][indexFlow].valve, units: data2[0][indexFlow].units})
                    if (data2[0][indexFlow].valve==null && zoneData)
                        auxirrigationLoss += data2[0][indexFlow].value;
                    else if (data2[0][indexFlow].idProgrammedTask && data2[0][indexFlow].manual)
                        auxirrigationManual += data2[0][indexFlow].value;
                    else
                        auxirrigationProgram += data2[0][indexFlow].value;
                    auxTitle = data2[0][indexFlow].title;
                    indexFlow++;
                }
            }
            if (auxirrigationProgram > 0)
                flowTickValuesProgram.push({time: auxDate.getTime() / 1000, value: (this.state.animationTrigger ? 0 : auxirrigationProgram), label: /*zoneData ? JSON.stringify(auxFlows) :*/ auxTitle + ": " + auxirrigationProgram + units,obj:zoneData ? auxFlows:null})
            if (auxirrigationManual > 0)
                flowTickValuesManual.push({time: auxDate.getTime() / 1000, value: (this.state.animationTrigger ? 0 : auxirrigationProgram + auxirrigationManual), label: /*zoneData ? JSON.stringify(auxFlows) :*/ auxTitle + ": " + auxirrigationManual + units,obj:zoneData ? auxFlows:null})
            if (auxirrigationLoss > 0)
                flowTickValuesLoss.push({time: auxDate.getTime() / 1000, value: (this.state.animationTrigger ? 0 : auxirrigationProgram + auxirrigationManual + auxirrigationLoss), label: /*zoneData ? JSON.stringify(auxFlows) :*/ "Loss : " + auxirrigationLoss + units,obj:zoneData ? auxFlows:null})
            if (auxirrigationProgram || auxirrigationManual || auxirrigationLoss) {
                flowTickValues.push({time: auxDate.getTime() / 1000, value: (this.state.animationTrigger ? 0 : auxirrigationProgram + auxirrigationManual + auxirrigationLoss), label: /*zoneData ? JSON.stringify(auxFlows) :*/ auxTitle + ": " + auxirrigationProgram + units,obj:zoneData ? auxFlows:null})
            }

            if (auxirrigationProgram + auxirrigationManual + auxirrigationLoss > maxValue)
                maxValue = auxirrigationProgram + auxirrigationManual + auxirrigationLoss;
            totalValue += auxirrigationProgram + auxirrigationManual + auxirrigationLoss;
            totalValueProgram += auxirrigationProgram;
            totalValueManual += auxirrigationManual;
            totalValueLoss += auxirrigationLoss;

            //store the current midday and go to tomorrow midday
            if (auxDate.getDate() != lastDay) {
                var tempAuxDate = new Date(auxDate);
                tempAuxDate.setHours(0);
                var init;
                if (tempAuxDate.getTime() < from.getTime())
                    init = from.getTime();
                else
                    init = tempAuxDate.getTime();
                tempAuxDate.setDate(tempAuxDate.getDate() + 1);
                var end;
                if (tempAuxDate.getTime() > to.getTime())
                    end = to.getTime();
                else
                    end = tempAuxDate.getTime();
                dayTickValues.push((init + ((end - init) / 2)) / 1000);
                lastDay = auxDate.getDate();
            }

            tickValues.push(auxDate.getTime() / 1000);

            switch (useparations) {
                case 'h':
                    auxDate.setHours(auxDate.getHours() + timeseparation);
                    break;
                default:
                    auxDate.setDate(auxDate.getDate() + timeseparation);
                    break;
            }
        }
        if (from.getTime() / 1000 != this.state.from || to.getTime() / 1000 != this.state.to || totalValue != this.state.total) {
            this.setState({totalFrom: from.getTime() / 1000, totalTo: to.getTime() / 1000, total: totalValue, totalValueProgram: totalValueProgram, totalValueManual: totalValueManual, totalValueLoss: totalValueLoss})
        }

        //adjusting text lines space
        var coeficientMax = 0.27, offsetTooltip = 15;
        var twolines = false, twolines2 = false;
        if (((maxValue / 1000) + "").length + 3 >= (Platform.OS === 'android' || Platform.OS == 'ios' ? 11 : 10))
            twolines = true;
        var money = parseInt((parseFloat(maxValue / 1000) * priceLiter) * 100) / 100 + " " + currency;
        if (money.length >= (Platform.OS === 'android' || Platform.OS == 'ios' ? 11 : 10))
            twolines2 = true;
        if (twolines && !twolines2) {
            coeficientMax = 0.35;
            offsetTooltip = 22;
        } else if (!twolines && twolines2) {
            coeficientMax = 0.4;
            offsetTooltip = 28;
        } else if (twolines && twolines2) {
            coeficientMax = 0.45;
            offsetTooltip = 36;
        }

        //allDaysTicks.push(allDaysDate.getTime()/1000);

        var hasFlowTick = flowTickValuesLoss.length>0 || flowTickValuesProgram.length>0 || flowTickValuesManual.length>0;

        ///////////////////////////////
        ///////////////////////////////

        class RectGrid extends React.Component {
            render() {
                var {x1, y1, x2, y2, index, datum} = this.props;

                var press = () => {
                    /*
                     if(that.state.zoom){
                     that.setState({animationEnabled:true,zoom:false,from:null,to:null,numberSeparations:null,separationsUnit:null})
                     that.animate();
                     }else{
                     var to=new Date(datum*1000);
                     to.setDate(to.getDate()+1);
                     that.setState({animationEnabled:true,zoom:true,from:datum*1000,to:to.getTime(),separationsUnit:'h'})
                     that.animate();
                     }
                     */
                    if (that.state.zoom) {
                        var nseparations = numberSeparations ? numberSeparations : 4;
                        that.recalculateFromTo(that.state.from, nseparations).then((obj) => {
                            that.setState({animationEnabled: true, zoom: false, from: obj.from.getTime(), to: obj.to.getTime(), numberSeparations: 1, separationsUnit: null, textTest: []})
                            that.animate();
                        })
                    } else {
                        var to = new Date(datum * 1000);
                        to.setDate(to.getDate() + 1);
                        that.setState({animationEnabled: true, zoom: true, from: datum * 1000, to: to.getTime(), numberSeparations: 4, separationsUnit: 'h', textTest: []})
                        that.animate();
                    }
                }
                var events = {
                    onClick: press,
                    onPressIn: press,
                    onMouseOver: () => {
                        that.setState({rectHover: index})
                    },
                    onMouseOut: () => {
                        that.setState({rectHover: null})
                    }
                };
                if (!this.props.transparent && (Platform.OS === 'android' || Platform.OS == 'ios'))
                    events = null;
                if (y2 > y1) {
                    var yaux = y2;
                    y2 = y1;
                    y1 = yaux;
                }
                var style = {fill: this.props.transparent ? "transparent" : (that.state.rectHover == index && !that.state.animationEnabled && !that.state.zoom ? "#f8ffbd" : (index % 2 ? "white" : "#f1f1f1"))};
                if (Platform.OS === 'web')
                    style.cursor = "pointer";

                return (
                        <Rect x={x1} y={y2} style={style} width={(100 / nseparations) + "%"} height={y1 - y2} events={events} />
                        );
            }
        }

        class CubicMetersPoint extends React.Component {
            render() {
                const {x, y, datum} = this.props; // VictoryScatter supplies x, y and datum
                var indents = [];
                var value = FliwerCommonUtils.toPointsFormat(parseFloat(datum.value / 1000)) + " m³";
                var money = null;//(parseInt((parseFloat(datum.value/1000)*priceLiter)*100)/100)+" "+currency;
                if (datum.value) {
                    var twolines = value.length < (Platform.OS === 'android' || Platform.OS == 'ios' ? 11 : 10);
                    if (twolines)
                        indents.push(<Svg style={{pointerEvents: 'none'}}><SvgText x={x} y={20} style={{dominantBaseline: "middle", textAnchor: "middle", fill: (typeof color === 'string' ? color : color[0]), fontFamily: FliwerColors.fonts.regular, fontSize: (Platform.OS === 'android' || Platform.OS == 'ios' ? 12 : 14)}} >{value}</SvgText></Svg>);
                    else
                        indents.push(<Svg style={{pointerEvents: 'none'}}>
                        <SvgText x={x} y={15} style={{dominantBaseline: "middle", textAnchor: "middle", fill: (typeof color === 'string' ? color : color[0]), fontFamily: FliwerColors.fonts.regular, fontSize: (Platform.OS === 'android' || Platform.OS == 'ios' ? 12 : 14)}} >{value.slice(0, value.length / 2)}</SvgText>
                        <SvgText x={x} y={30} style={{dominantBaseline: "middle", textAnchor: "middle", fill: (typeof color === 'string' ? color : color[0]), fontFamily: FliwerColors.fonts.regular, fontSize: (Platform.OS === 'android' || Platform.OS == 'ios' ? 12 : 14)}} >{value.slice(value.length / 2, value.length)}</SvgText>
                        </Svg>)

                    if (money) {
                        var twolines2 = money.length < (Platform.OS === 'android' || Platform.OS == 'ios' ? 11 : 10);
                        if (twolines2)
                            indents.push(<Svg style={{pointerEvents: 'none'}}><SvgText x={x} y={twolines ? 35 : 45} style={{dominantBaseline: "middle", textAnchor: "middle", fill: "#d8a304", fontFamily: FliwerColors.fonts.regular, fontSize: (Platform.OS === 'android' || Platform.OS == 'ios' ? 12 : 14)}} >{money}</SvgText></Svg>);
                        else
                            indents.push(<Svg style={{pointerEvents: 'none'}}>
                            <SvgText x={x} y={twolines ? 35 : 45} style={{dominantBaseline: "middle", textAnchor: "middle", fill: "#d8a304", fontFamily: FliwerColors.fonts.regular, fontSize: (Platform.OS === 'android' || Platform.OS == 'ios' ? 12 : 14)}} >{money.slice(0, money.length / 2)}</SvgText>
                            <SvgText x={x} y={twolines ? 50 : 60} style={{dominantBaseline: "middle", textAnchor: "middle", fill: "#d8a304", fontFamily: FliwerColors.fonts.regular, fontSize: (Platform.OS === 'android' || Platform.OS == 'ios' ? 12 : 14)}} >{money.slice(money.length / 2, money.length)}</SvgText>
                            </Svg>)
                    }
                    return indents;
                } else
                    return [];
            }
        }

        var that = this;
        class CustomTooltip extends React.Component {
            render() {

                const {x, y, datum} = this.props;

                var baseX = x - 80;
                var baseY = 0//30 + offsetTooltip;
                var baseW = 240;
                var nlines = 2;
                var baseH = 30 + (20 * 1);

                //at least until RN 0.58 :'(
                if (baseY < 0)
                    baseY = 0;
                if (baseX < 0)
                    baseX = 0;
                if (baseX + baseW > that.state.chartWidth)
                    baseX = that.state.chartWidth - baseW;
                if (baseY + baseH > that.state.chartHeight)
                    baseY = that.state.chartHeight - baseH;

                if (!that.state.animationEnabled) {

                    var labeling = false, labelData = null;
                    if (zoneData) {
                        try {
                            labelData = datum.obj;
                            labeling = true;
                        } catch(e) {}
                    }

                    if (labeling) {
                        var labelDataParsed = {};
                        for (var j = 0; j < labelData.length; j++) {
                            if (!labelDataParsed[labelData[j].DeviceSerialNumber + "|" + labelData[j].valve]) {
                                labelDataParsed[labelData[j].DeviceSerialNumber + "|" + labelData[j].valve] = {DeviceSerialNumber: labelData[j].DeviceSerialNumber, valve: labelData[j].valve, units: labelData[j].units, value: 0}
                            }
                            labelDataParsed[labelData[j].DeviceSerialNumber + "|" + labelData[j].valve].value += labelData[j].value
                        }
                        labelDataParsed = Object.values(labelDataParsed).sort((v1, v2) => {
                            return v1.DeviceSerialNumber < v2.DeviceSerialNumber ? -1 : (v1.DeviceSerialNumber > v2.DeviceSerialNumber ? -1 : (v1.valve < v2.valve ? -1 : 1))
                        });
                        baseH = (baseH - 20) + (20 * labelDataParsed.length);
                        return (
                                <Svg style={{pointerEvents: 'none'}}>
                                <Rect  x={baseX} y={baseY} width={baseW} height={baseH} style={{fill: FliwerColors.hexToRgb(typeof color === 'string' ? color : color[i], 0.9)}} rx={5} ry={5}/>
                                {this.renderToolTipValues(labelDataParsed, baseX, baseY, baseW, baseH)}
                                <LineSegment x1={baseX + 0.05 * baseW} x2={baseX + 0.95 * baseW} y1={baseY + (5 + (20 * labelDataParsed.length))} y2={baseY + (5 + (20 * labelDataParsed.length))} style={{stroke: "white"}}  />
                                <SvgText x={baseX + 0.5 * baseW} y={baseY + (18 + (20 * labelDataParsed.length))} style={{fill: "white", dominantBaseline: "middle", textAnchor: "middle", fontFamily: FliwerColors.fonts.regular, fontSize: 12}}>{moment(new Date(that.state.zoom ? ((this.props.datum.time - (timeseparation / 2) * 3600) * 1000) : this.props.datum.time * 1000)).format(that.state.zoom ? "HH:mm" : "LL") + (that.state.zoom ? moment(new Date((this.props.datum.time + (timeseparation / 2) * 3600) * 1000)).format(" - HH:mm") : "")}</SvgText>
                                </Svg>
                                )
                    } else
                        return (
                                <Svg style={{pointerEvents: 'none'}}>
                                <Rect  x={baseX} y={baseY} width={baseW} height={baseH} style={{fill: FliwerColors.hexToRgb(typeof color === 'string' ? color : color[i], 0.9)}} rx={5} ry={5}/>
                                <SvgText x={baseX + 0.5 * baseW} y={baseY + (14)} style={{fill: "white", dominantBaseline: "middle", textAnchor: "middle", fontFamily: FliwerColors.fonts.regular, fontSize: 12}}>{datum.label}</SvgText>
                                <LineSegment x1={baseX + 0.05 * baseW} x2={baseX + 0.95 * baseW} y1={baseY + (5 + (20 * 1))} y2={baseY + (5 + (20 * 1))} style={{stroke: "white"}}  />
                                <SvgText x={baseX + 0.5 * baseW} y={baseY + (18 + (20 * 1))} style={{fill: "white", dominantBaseline: "middle", textAnchor: "middle", fontFamily: FliwerColors.fonts.regular, fontSize: 12}}>{moment(new Date(that.state.zoom ? ((this.props.datum.time - (timeseparation / 2) * 3600) * 1000) : this.props.datum.time * 1000)).format(that.state.zoom ? "HH:mm" : "LL") + (that.state.zoom ? moment(new Date((this.props.datum.time + (timeseparation / 2) * 3600) * 1000)).format(" - HH:mm") : "")}</SvgText>
                                </Svg>
                                );
                } else
                    return (
                        <Svg style={{pointerEvents: 'none'}}>
                        </Svg>
                        );

            }
            renderToolTipValues(tooltipPoints, baseX, baseY, baseW, baseH) {
                var data = [];
                for (var i = 0; i < tooltipPoints.length; i++) {
                    data.push(<SvgText x={baseX + 0.5 * baseW} y={baseY + (14 + 20 * i)} style={{fill: "white", dominantBaseline: "middle", textAnchor: "middle", fontFamily: FliwerColors.fonts.regular, fontSize: 12}}>{tooltipPoints[i].DeviceSerialNumber + " - " + (tooltipPoints[i].valve ? "V" + tooltipPoints[i].valve + ": " : "") + tooltipPoints[i].value.toFixed(2).replace(/[.,]00$/, "") + " " + tooltipPoints[i].units}</SvgText>)
                }
                return data;
            }
        }


        class CustomLabel extends React.Component {

            constructor(props) {
                super(props);
            }

            render() {
                const {x, y, text, index} = this.props; // VictoryScatter supplies x, y and datum

                var imageX = 5 + ((that.state.chartWidth / nseparations) * index);
                return (
                                        <Svg style={{pointerEvents: 'none'}}>
                        <SvgText x={x} y={y} ref={(t) => {
                                                                this.text = t;
                                            }} style={{fill: "black", strokeWidth: 1, fontFamily: FliwerColors.fonts.title, fontSize: 14, textAnchor: "middle"}} >{text}</SvgText>
                        {/*
                        <SvgImage
                            style={{pointerEvents: 'none'}}
                            x={imageX}
                            y={y - 12}
                            width={12}
                            height={12}
                            preserveAspectRatio="xMidYTop"
                            href={that.state.zoom ? zoom_out : zoom_in}
                            />
                            */}
                        </Svg>
                        );
            }
        }

        ///////////////////////////////
        ///////////////////////////////
        var _tooltipPoints;
        var indents = [];
        var animationWhitelist = [];
        if (this.state.animationTriggerWhitelist)
            animationWhitelist.push("data");
        if (this.state.chartWidth && this.state.chartHeight) {
            indents.push(
                    <View pointerEvents={this.state.animationEnabled ? "none" : "auto"} key={1}>

                        <View pointerEvents="none" style={{height: 40}} key={2}>
                            <VictoryChart
                                key={3}
                                theme={theme}
                                style={this.style.chartTop}
                                width={this.state.chartWidth}
                                height={40}
                                padding={{top: 0, bottom: 0}}
                                domain={{x: [from.getTime() / 1000, to.getTime() / 1000], y: [0, 100]}}
                                containerComponent={ < VictoryContainer disableContainerEvents /> }
                            >
                            <VictoryAxis
                                key={4}
                                orientation={"top"}
                                tickValues={tickValues}
                                tickLabelComponent={ < VictoryLabel dy = {46} labelPlacement={"parallel"} /> }
                                tickFormat={ (value) => {
                                    var formatYearlessL;
                                    if (this.state.zoom) {
                                        formatYearlessL = "HH:mm";
                                    } else {
                                        var formatL = moment.localeData().longDateFormat('L');
                                        formatYearlessL = formatL.replace(/YYYY/g, 'YY');
                                    }
                                    return moment(new Date(value * 1000)).format(formatYearlessL)
                                }}
                                style={{
                                    axis: {
                                        stroke: "transparent",
                                        strokeWidth: 0
                                    },
                                    axisLabel: {
                                        stroke: "transparent",
                                        strokeWidth: 0
                                    },
                                    ticks: {
                                        //fill: "transparent",
                                        stroke: "transparent",
                                        strokeWidth: 0
                                    },
                                    tickLabels: {
                                        textAnchor: "middle",
                                        fill: "black",
                                        strokeWidth: 1,
                                        fontFamily: FliwerColors.fonts.regular,
                                        fontSize: 12
                                    }
                                }}
                                />
                            <VictoryAxis
                                key={5}
                                orientation={"top"}
                                tickValues={dayTickValues}
                                tickLabelComponent={ <CustomLabel y = {19} labelPlacement={"vertical"}   /> }
                                tickFormat={ (value) => {
                                    var titleFormat = 'ddd';
                                    if (this.state.zoom) {
                                        var formatL = moment.localeData().longDateFormat('L');
                                            var formatYearlessL = formatL.replace(/YYYY/g, 'YY');
                                            titleFormat += "d - " + formatYearlessL
                                        }
                                        return moment(new Date(value * 1000)).format(titleFormat).toUpperCase()
                                    }}
                                style={{
                                    axis: {
                                        stroke: "transparent",
                                        strokeWidth: 0
                                            },
                                            axisLabel: {
                                        stroke: "transparent",
                                        strokeWidth: 0
                                    },
                                    ticks: {
                                        //fill: "transparent",
                                        stroke: "transparent",
                                        strokeWidth: 0
                                    },
                                    tickLabels: {
                                        textAnchor: "middle",
                                        fill: "black",
                                        strokeWidth: 1,
                                        fontFamily: FliwerColors.fonts.title,
                                        fontSize: 14
                                    }
                                }}
                                />
                            </VictoryChart>
                        </View>
                        <VictoryChart
                            key={6}
                            theme={theme}
                            style={this.style.chart}
                            width={this.state.chartWidth}
                            height={this.state.chartHeight}
                            padding={{top: 0, bottom: 5}}
                            domain={{x: [from.getTime() / 1000, to.getTime() / 1000], y: [0, maxValue + (coeficientMax * maxValue)]}}
                            containerComponent={ < VictoryVoronoiContainer
                                                        voronoiDimension = "x"
                                                        style = {{
                                                            overflow: "visible"
                                                                }}
                                                        disable = {!hasFlowTick || this.state.animationEnabled}
                                                        labels = {({ datum }) => `y: ${datum.y}`}
                                                        labelComponent = {Platform.OS=='android'?null:(<VictoryTooltip
                                                            style={{
                                                                fill: "transparent",
                                                                strokeWidth: 0
                                                            }}
                                                            flyoutStyle={{
                                                                fill: color2,
                                                                fillOpacity: 0.8,
                                                                strokeWidth: 0,
                                                                pointerEvents: "none"
                                                            }}
                                                            cornerRadius={5}
                                                            pointerLength={10}
                                                            flyoutComponent={ < CustomTooltip labelPlacement={"vertical"}  /> }
                                                        />)}
                                                    />}
                        >
                            <VictoryAxis
                            key={7}
                            tickValues={allDaysTicks}
                            gridComponent={ < RectGrid style={{}}/ > }
                            style={{
                                axis: {
                                    stroke: "transparent",
                                    strokeWidth: 0
                                },
                                axisLabel: {
                                    stroke: "transparent",
                                    strokeWidth: 0,
                                    display: "none"
                                },
                                ticks: {
                                    //fill: "transparent",
                                    stroke: "transparent",
                                    strokeWidth: 0
                                },
                                tickLabels: {
                                    fill: "transparent",
                                    strokeWidth: 0,
                                    display: "none"
                                }
                            }}
                            />
                            <VictoryBar
                                y={"value"}
                                x={"time"}
                                labelPlacement={"parallel"} 
                                animate={{
                                    duration: this.props.animation ? this.props.animation : 1500,
                                    onLoad: {duration: this.props.animation ? this.props.animation : 1500},
                                    onEnd: () => {
                                        this.setState({animationEnabled: false})
                                    },
                                    animationWhitelist: animationWhitelist
                                }}
                                barWidth={(datum, active) => {
                                    return 0.33 * (this.state.chartWidth / nseparations);
                                }}
                                style={{
                                    data: {
                                        fill: typeof color4 === 'string' ? color4 : color4[i],
                                        pointerEvents: "none"
                                    },
                                    labels: {
                                        fill: "transparent",
                                        pointerEvents: "none"
                                    }
                                }}
                                data={flowTickValuesLoss}
                            />
                            <VictoryBar
                                y={"value"}
                                x={"time"}
                                labelPlacement={"parallel"} 
                                animate={{
                                    duration: this.props.animation ? this.props.animation : 1500,
                                    onLoad: {duration: this.props.animation ? this.props.animation : 1500},
                                    onEnd: () => {
                                        this.setState({animationEnabled: false})
                                    },
                                    animationWhitelist: animationWhitelist
                                }}
                                barWidth={(datum, active) => {
                                    return 0.33 * (this.state.chartWidth / nseparations);
                                }}
                                style={{
                                    data: {
                                        fill: typeof color2 === 'string' ? color2 : color2[i],
                                        pointerEvents: "none"
                                    },
                                                     labels: {
                                        fill: "transparent",
                                        pointerEvents: "none"
                                    }
                                }}
                                data={flowTickValuesManual}
                            />
                            <VictoryBar
                                y={"value"}
                                x={"time"}
                                labelPlacement={"parallel"} 
                                animate={{
                                    duration: this.props.animation ? this.props.animation : 1500,
                                    onLoad: {duration: this.props.animation ? this.props.animation : 1500},
                                    onEnd: () => {
                                        this.setState({animationEnabled: false})
                                    },
                                    animationWhitelist: animationWhitelist
                                }}
                                barWidth={(datum, active) => {
                                    return 0.33 * (this.state.chartWidth / nseparations);
                                }}
                                style={{
                                    data: {
                                        fill: typeof color3 === 'string' ? color3 : color3[i],
                                        pointerEvents: "none"
                                    },
                                    labels: {
                                        fill: "transparent",
                                        pointerEvents: "none"
                                    }
                                }}
                                data={flowTickValuesProgram}
                            />
                            {/*
                            <VictoryAxis dependentAxis
                                key={11}
                                tickValues={[0]}
                                style={{
                                    grid: {
                                        strokeWidth: 2,
                                        stroke: typeof color2 === 'string' ? color2 : color2[i]
                                    },
                                    axis: {
                                        stroke: "transparent",
                                        strokeWidth: 0
                                    },
                                    axisLabel: {
                                        stroke: "transparent",
                                        strokeWidth: 0,
                                        display: "none"
                                    },
                                    ticks: {
                                        //fill: "transparent",
                                        stroke: "transparent",
                                        strokeWidth: 0,
                                        display: "none"
                                    },
                                    tickLabels: {
                                        fill: "transparent",
                                        strokeWidth: 0,
                                        display: "none"
                                    }
                                }}
                            />
                            */}
                            <VictoryScatter
                                key={12}
                                data={flowTickValues}
                                y={"value"}
                                x={"time"}
                                style={{
                                    data: {
                                        fill: typeof color2 === 'string' ? color2 : color2[i],
                                        pointerEvents: "none"
                                    },
                                    labels: {
                                        fill: "transparent",
                                        pointerEvents: "none"
                                    }
                                }}
                                dataComponent={ < CubicMetersPoint / > }
                            />
                        </VictoryChart>
                    </View>
                );
            }

            return indents;
        }

        renderBottomChart()
        {
            const {units, currency, priceLiter, hideBottomBar, hideMiddleBar, hideTopBar} = this.props
            var indents = [];


            if (this.state.totalFrom && this.state.totalTo) {

                var formatL = moment.localeData().longDateFormat('L');
                var formatYearlessL = formatL.replace(/YYYY/g, 'YY');
                var from = moment(new Date(this.state.totalFrom * 1000)).format(formatYearlessL)
                var to = moment(new Date(this.state.totalTo * 1000)).format(formatYearlessL)

                /*
                 if(priceLiter && currency){
                 indents.push(
                 <View style={[this.style.bottomChartIn,this.style.bottomChartMoney]}>
                 <Text style={this.style.textDate}>{this.props.actions.languageActions.get('general_from')+" "+from}</Text>
                 <Text style={this.style.textTotal}>{parseInt((parseFloat((this.state.total/1000))*priceLiter)*100)/100+" "+currency}</Text>
                 <Text style={this.style.textDate}>{this.props.actions.languageActions.get('general_to')+" "+to}</Text>
                 </View>
                 )
                 }
                 */

                /*
                 indents.push(
                 <View style={[this.style.bottomChartIn,priceLiter && currency?this.style.bottomChartMeters:{}]}>
                 <Text style={this.style.textDate}>{this.props.actions.languageActions.get('general_from')+" "+from}</Text>
                 <Text style={this.style.textTotal}>{FliwerCommonUtils.toPointsFormat(parseFloat((this.state.total/1000)))+" m³"}</Text>
                 <Text style={this.style.textDate}>{this.props.actions.languageActions.get('general_to')+" "+to}</Text>
                 </View>
                 )
                 */

                if (!hideBottomBar)
                    indents.push(
                                        <View style={[this.style.bottomChartIn, priceLiter && currency ? this.style.bottomChartMetersLoss : {}]}>
                                            <Text style={this.style.textDate}></Text>
                                            <Text style={this.style.textTotal}>{FliwerCommonUtils.toPointsFormat(parseFloat((this.state.totalValueLoss / 1000))) + " m³"}</Text>
                                            <Text style={this.style.textDate}></Text>
                                        </View>
                            );

                if (!hideMiddleBar)
                    indents.push(
                                        <View style={[this.style.bottomChartIn, priceLiter && currency ? this.style.bottomChartMetersManual : {}]}>
                                            <Text style={this.style.textDate}>{((Platform.OS == 'android' || Platform.OS == 'ios') && this.state.mediaStyle.orientation == "landscape") ? [] : this.props.actions.languageActions.get('general_from') + " " + from}</Text>
                                            <Text style={this.style.textTotal}>{FliwerCommonUtils.toPointsFormat(parseFloat((this.state.totalValueManual / 1000))) + " m³"}</Text>
                                            <Text style={this.style.textDate}>{((Platform.OS == 'android' || Platform.OS == 'ios') && this.state.mediaStyle.orientation == "landscape") ? [] : this.props.actions.languageActions.get('general_to') + " " + to}</Text>
                                        </View>
                            );

                if (!hideTopBar)
                    indents.push(
                                        <View style={[this.style.bottomChartIn, priceLiter && currency ? this.style.bottomChartMetersPrograms : {}]}>
                                            <Text style={this.style.textDate}></Text>
                                            <Text style={this.style.textTotal}>{FliwerCommonUtils.toPointsFormat(parseFloat((this.state.totalValueProgram / 1000))) + " m³"}</Text>
                                            <Text style={this.style.textDate}></Text>
                                        </View>
                            );


                if ((Platform.OS == 'android' || Platform.OS == 'ios') && this.state.mediaStyle.orientation == "landscape") {
                        indents.push(<Text style={[this.style.textDate, this.style.textDateLandscapeFrom]}>{this.props.actions.languageActions.get('general_from') + " " + from}</Text>);
                        indents.push(<Text style={[this.style.textDate, this.style.textDateLandscapeTo]}>{this.props.actions.languageActions.get('general_to') + " " + to}</Text>);
                }

            }

            return indents;
        }

    }


    function mapStateToProps(state, props) {
        return {
                translation: state.languageReducer.translation
        };
    }


    function mapDispatchToProps(dispatch) {
        return {
            actions: {
                    languageActions: bindActionCreators(ActionsLang, dispatch)
            }
        };
    }

    var style={
        container: {
            "width": "100%",
            "height": "100%",
            borderRadius: 10,
        },
        containerChart: {
            paddingLeft: 30,
            paddingRight: 30,
            left: 0,
            right: 0,
            position: "absolute",
            top: 0,
            bottom: 90,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            overflow: "hidden",
            backgroundColor: "white"
        },
        bottomChart: {
            bottom: 0,
            height: 120,
            backgroundColor: FliwerColors.secondary.green,
            width: "100%",
            position: "absolute",
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10
        },
        bottomChartIn: {
            position: "absolute",
            bottom: 0,
            height: 30,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: 5,
            paddingRight: 5
        },
        /*
         bottomChartMeters:{
         bottom:30,
         borderBottomLeftRadius: 10,
         borderBottomRightRadius: 10,
         backgroundColor:FliwerColors.subparameters.soilm
         },
         */
        bottomChartMetersPrograms: {
            bottom: 60,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: FliwerColors.secondary.green
        },
        bottomChartMetersManual: {
            height: 50,
            bottom: 30,
            paddingTop: 20,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: FliwerColors.subparameters.soilm
        },
        bottomChartMetersLoss: {
            height: 50,
            paddingTop: 20,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
            backgroundColor: FliwerColors.secondary.red
        },
        /*
         bottomChartMoney:{
         height:50,
         paddingTop:20,
         backgroundColor:"#d8a304",
         borderBottomLeftRadius: 10,
         borderBottomRightRadius: 10
         },
         */
        textDate: {
            color: "white",
            fontFamily: FliwerColors.fonts.light,
            fontSize: 10
        },
        textTotal: {
            color: "white",
            fontFamily: FliwerColors.fonts.title,
            fontSize: 16
        },
        chart: {
            width: "100%",
            height: "100%",
            borderRadius: 10,
            paddingTop: 40,
            position: "absolute"
        },
        chartTop: {
            "width": "100%",
            "height": 40,
        },
        animationMask: {
            width: "100%",
            height: "100%",
            position: "absolute"
        },

        prevNextButton: {
            top: "50%",
            marginTop: -57.5,
            width: 20,
            height: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute"
        },
        prevButton: {
            left: 5,
            textAlign: "center"
        },
        nextButton: {
            right: 5,
            textAlign: "center"
        },
        prevNextText: {
                fontFamily: FliwerColors.fonts.regular,
                fontSize: 20
        }
    };


    if(Platform.OS=='android' || Platform.OS == 'ios') {
        style["@media (orientation:landscape)"] = {
        containerChart: {
            right: 120,
            bottom: 0,
            borderTopRightRadius: 10
        },
        nextButton: {
            right: 125,
        },
        bottomChart: {
            top: 0,
            height: "100%",
            bottom: 0,
            right: 0,
            width: 130,
            backgroundColor: FliwerColors.secondary.green,
            position: "absolute",
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 10,
            display: "flex",
            flexDirection: "column"
        },
        bottomChartIn: {
            position: "relative",
        },
        bottomChartMetersPrograms: {
            flexGrow: 1,
            height: null,
            paddingTop: 0,
            bottom: 0,
            paddingLeft: 15,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 10,
            backgroundColor: FliwerColors.secondary.green
        },
        bottomChartMetersManual: {
            flexGrow: 1,
            paddingLeft: 15,
            paddingTop: 0,
            bottom: 0,
            height: null,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: FliwerColors.subparameters.soilm
        },
        bottomChartMetersLoss: {
            flexGrow: 1,
            paddingLeft: 15,
            paddingTop: 0,
            bottom: 0,
            height: null,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: FliwerColors.secondary.red
        },
        textDateLandscapeFrom: {
            paddingLeft: 10,
            position: "absolute",
            top: 5,
            width: "100%",
            textAlign: "center"
        },
        textDateLandscapeTo: {
                paddingLeft: 10,
                position: "absolute",
                bottom: 5,
                width: "100%",
                textAlign: "center"
            }
        }
    }


    //Connect everything
    export default connect(mapStateToProps, mapDispatchToProps,null,{ forwardRef: true })(mediaConnect(style,FliwerFlowChart));
