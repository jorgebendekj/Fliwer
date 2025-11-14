import React from 'react'
var { View, Platform, Switch, Text, TouchableOpacity } = require('react-native');
import moment from 'moment';
import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { FliwerColors } from '../../utils/FliwerColors'
import { FliwerCommonUtils } from '../../utils/FliwerCommonUtils'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { VictoryChart, VictoryLine, VictoryAxis, VictoryLabel, Rect, Text as SvgText, VictoryTooltip, VictoryContainer, VictoryVoronoiContainer, VictoryScatter, LineSegment } from 'victory-native';
import { Svg } from 'react-native-svg';
import { SvgImage } from '../../widgets/svgImage/svgImage'

import { toast } from '../../widgets/toast/toast'

import * as scale from 'd3-scale'

import irr_manual from '../../assets/img/5_riego_manual.png'
import irr_auto from '../../assets/img/5_riego_auto.png'
import irr_both from '../../assets/img/5_riego_ambos.png'

import zoom_in from '../../assets/img/zoom_in.png'
import zoom_out from '../../assets/img/zoom_out.png'

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

class FliwerChart extends React.PureComponent {

    constructor(props) {
        super(props);

        var defaultValues = this.calculateNewDefaultValuesSync(this.props.defaultValues);
        //console.log("NEW CHART",this.props.defaultValues);
        this.state = {
            chartWidth: 0,
            chartHeight: 0,
            dataInstantEnabled: false,
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
            lastTooltip: null,
            syncUpdate: false,
            showPrev: true,
            showNext: false,
            settingCalibrationRange: false,
            settingCalibrationRangeFrom: (this.props.calibrationData && this.props.calibrationData.from) ? this.props.calibrationData.from : null,
            settingCalibrationRangeTo: (this.props.calibrationData && this.props.calibrationData.to) ? this.props.calibrationData.to : null,
        }

        this.calculateNewDefaultValues(this.props.defaultValues).then((defaultValues) => {
            this.animate();
        });
        this.point = [];
        this._testTextRef = [];
    }

    componentWillMount = () => {
        this.measureView();
    }

    componentWillUnmount() {
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i])
                this.point[i].removeEventListener('click', this.onclick);
        }
        clearTimeout(this.state.animationTriggerTimeout);
        clearTimeout(this.state.animationTriggerTimeout2);
        clearTimeout(this.state.animationTriggerTimeout3);
    };

    shouldComponentUpdate(nextProps, nextState) {
        return /*(this.state.animationEnabled == false || nextState.animationEnabled == false) &&*/ !(JSON.stringify(this.props) == JSON.stringify(nextProps) && JSON.stringify(this.state) == JSON.stringify(nextState));
    }

    componentWillReceiveProps(nextProps) {

        if (JSON.stringify(this.props.calibrationData) != JSON.stringify(nextProps.calibrationData)) {
            this.setState({
                settingCalibrationRange: false,
                settingCalibrationRangeFrom: (nextProps.calibrationData && nextProps.calibrationData.from) ? nextProps.calibrationData.from : null,
                settingCalibrationRangeTo: (nextProps.calibrationData && nextProps.calibrationData.to) ? nextProps.calibrationData.to : null,
            });
        }

        if (JSON.stringify(this.props.defaultValues) != JSON.stringify(nextProps.defaultValues) || this.props.numberSeparations != nextProps.numberSeparations) {
            this.calculateNewDefaultValues(nextProps.defaultValues).then((defaultValues) => {
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
            this.setState({ animationEnabled: true });
        }
    }

    resetCalibration() {
        this.setState({
            settingCalibrationRange: false,
            settingCalibrationRangeFrom: (this.props.calibrationData && this.props.calibrationData.from) ? this.props.calibrationData.from : null,
            settingCalibrationRangeTo: (this.props.calibrationData && this.props.calibrationData.to) ? this.props.calibrationData.to : null,
        });
    }

    recalculateFromTo(origFrom, nseparations) {
        const { getMoreData, dataRange } = this.props
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
                        resolve({ from: newFrom, to: newTo })
                    })
                }
            } else {
                resolve({ from: newFrom, to: newTo });
            }
        })
    }

    recalculateFromToSync(origFrom, nseparations) {
        const { getMoreData, dataRange } = this.props
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
        return { from: newFrom, to: newTo }
    }

    calculateNewDefaultValues(defaults) {
        const { numberSeparations, getMoreData, dataRange } = this.props
        return new Promise((resolve, reject) => {
            var defaultValues = Object.assign({}, defaults);
            if (defaults && !defaults.zoom) {
                var nseparations = numberSeparations ? numberSeparations : 4;

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
        const { numberSeparations, getMoreData, dataRange } = this.props

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
        const { onNewPosition } = this.props
        if ((nextState.from != this.state.from || nextState.to != this.state.to || nextState.zoom != this.state.zoom) && onNewPosition) {
            //console.log("UPDATE FATHER syncUpdate?", this.state.syncUpdate, {from: nextState.from, to: nextState.to, zoom: nextState.zoom, numberSeparations: nextState.numberSeparations, separationsUnit: nextState.separationsUnit})
            if (Platform.OS === 'web' || !this.state.syncUpdate) {
                onNewPosition({ from: nextState.from, to: nextState.to, zoom: nextState.zoom, numberSeparations: nextState.numberSeparations, separationsUnit: nextState.separationsUnit });
            }
            //else this.setState({syncUpdate:false})
        }
    }

    measureView() {
        if (this._container) {
            this._container.measure((ox, oy, width, height, px, py) => {
                this.setState({ chartHeight: height, chartWidth: width });
            })
        }
    }

    animate() {
        this.setState({ animationEnabled: true, animationTrigger: true, animationTriggerWhitelist: false })
        this.state.animationTriggerTimeout = setTimeout(() => {
            this.setState({ animationTriggerWhitelist: true })
        }, 0)
        this.state.animationTriggerTimeout2 = setTimeout(() => {
            this.setState({ animationTrigger: false })
        }, 500)
        this.state.animationTriggerTimeout3 = setTimeout(() => {
            this.setState({ animationEnabled: false })
        }, 1500)
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

    forceRender() {
        this.forceUpdate();
    }

    zoomPress(e) {
        const { numberSeparations, getMoreData, dataRange } = this.props;
        if (this.state.zoom) {
            var nseparations = numberSeparations ? numberSeparations : 4;
            this.recalculateFromTo(this.state.from, nseparations).then((obj) => {
                this.setState({ animationEnabled: true, zoom: false, from: obj.from.getTime(), to: obj.to.getTime(), numberSeparations: 1, separationsUnit: null, textTest: [] })
                this.animate();
            })
        } else {
            var nseparations = numberSeparations ? numberSeparations : 4;
            var locationX = Platform.OS === 'web' ? e.nativeEvent.layerX : e.nativeEvent.locationX;
            var pos = Math.floor(((locationX / this.state.chartWidth) * 100) / (100 / nseparations))
            var time = (this.state.auxTo - this.state.auxFrom) / nseparations;
            var from = this.state.auxFrom.getTime() + time * pos
            var to = new Date(from);
            to.setDate(to.getDate() + 1);
            this.setState({ animationEnabled: true, zoom: true, from: from, to: to.getTime(), numberSeparations: 4, separationsUnit: 'h', textTest: [] })
            this.animate();
        }
    }

    nextPress() {
        const { separationsUnit, numberSeparations } = this.props
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
        const { separationsUnit, numberSeparations, dataRange, getMoreData } = this.props
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
        const { style, data, color, color2, lineStyle, numberDays, minData,drawSwitch } = this.props
        var dateTo = new Date(this.state.to);
        dateTo.setDate(dateTo.getDate() + 1);
        //console.log(this.state.from,minData*1000,this.state.from>minData*1000,this.state.to,Date.now(),this.state.to<Date.now());
        //console.log("render fliwerChart");

        return (
            <View style={[[this.style.container, style], { height:  '100%' }]} >
                {this.renderSwitch()}
                <View style={[this.style.containerChart,drawSwitch?{}:{top:0}]} ref={(v) => {
                    this._container = v;
                }} onLayout={() => {
                    this.measureView();
                }}>
                    {this.renderChart()}
                    <TouchableOpacity style={{ opacity: 0, height: 60, width: "100%", position: "absolute" }} onPress={(e) => {
                        this.zoomPress(e)
                    }}></TouchableOpacity>
                    <TouchableOpacity style={{ opacity: 0, height: 60, bottom: 0, width: "100%", position: "absolute" }} onPress={(e) => {
                        this.zoomPress(e)
                    }}></TouchableOpacity>
                    {(this.state.animationEnabled && Platform.OS === 'web' ? (<TouchableOpacity activeOpacity={0} onPress={() => {
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

    renderSwitch() {
        const { drawSwitch } = this.props
        if (drawSwitch) {
            return (
                <View style={this.style.switchContainer}>
                    <Text style={[this.style.switchTitle, this.style.switchTitle1]}>{this.props.actions.translate.get('chartCart_calculated')}</Text>
                    <Switch style={this.style.switch} onValueChange={(value) => this.setState({ animationEnabled: true, dataInstantEnabled: value })} value={this.state.dataInstantEnabled} ios_backgroundColor={"#a5cd07"} thumbColor={"white"} trackColor={"#a5cd07"} />
                    <Text style={[this.style.switchTitle, this.style.switchTitle2]}>{this.props.actions.translate.get('chartCard_Raw')}</Text>
                </View>
            )
        } else
            [];
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
        const { style, data, dataInstant, color, color2, lineStyle, numberSeparations, separationsUnit, limit33, limit66, units, meteoData, irrigationHistoryData, getMoreData, dataRange, minData } = this.props

        //irrigationHistoryDataCopy is a copy of irrigationHistoryData but sorted by taskTime
        var irrigationHistoryDataCopy = [...irrigationHistoryData];
        irrigationHistoryDataCopy.sort((a, b) => a.taskTime - b.taskTime);

        var nseparations = this.state.numberSeparations ? this.state.numberSeparations : (numberSeparations ? numberSeparations : 4);
        var timeseparation = 1;
        var useparations = this.state.separationsUnit ? this.state.separationsUnit : (separationsUnit ? separationsUnit : 'd');
        var data2 = [];
        var finalData;
        if (this.state.dataInstantEnabled && dataInstant && dataInstant.length > 0)
            finalData = [...dataInstant];
        else
            finalData = [...data];
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

        if (this.state.animationTrigger)
            data2 = [];

        this.state.auxFrom = from;
        this.state.auxTo = to;
        var showPrev = from > minData * 1000,
            showNext = to < Date.now();
        if (showPrev != this.state.showPrev || showNext != this.state.showNext)
            this.setState({ showPrev: showPrev, showNext: showNext })//First load

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

        var meteoTickValues = [];
        var irrigationTickValues = [];


        var indexMeteo = 0;
        var indexIrrigation = 0;

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

            var auxmeteo = [];
            while (indexMeteo < meteoData.length && meteoData[indexMeteo].time <= allDaysDate.getTime() / 1000) {
                while (indexMeteo < meteoData.length && meteoData[indexMeteo].time < auxallDaysDate.getTime() / 1000)
                    indexMeteo++;
                if (indexMeteo < meteoData.length && meteoData[indexMeteo].time <= allDaysDate.getTime() / 1000) {
                    auxmeteo.push(meteoData[indexMeteo]);
                    indexMeteo++;
                }
                //indexMeteo++;
            }
            if (auxmeteo.length > 0) {
                auxmeteo = auxmeteo.sort((a, b) => b.priority - a.priority);
                meteoTickValues.push({ time: auxDate.getTime() / 1000, value: 0, icon: auxmeteo[0].iconBlack })
            }

            var auxirrigation = [];

            while (indexIrrigation < irrigationHistoryDataCopy.length && irrigationHistoryDataCopy[indexIrrigation].irrigationTime < allDaysDate.getTime() / 1000) {
                while (indexIrrigation < irrigationHistoryDataCopy.length && irrigationHistoryDataCopy[indexIrrigation].irrigationTime < auxallDaysDate.getTime() / 1000)
                    indexIrrigation++;
                if (indexIrrigation < irrigationHistoryDataCopy.length && irrigationHistoryDataCopy[indexIrrigation].irrigationTime < allDaysDate.getTime() / 1000) {
                    if (irrigationHistoryDataCopy[indexIrrigation].allowed == 3 || irrigationHistoryDataCopy[indexIrrigation].allowed == 4 || irrigationHistoryDataCopy[indexIrrigation].canceled) {
                        //console.log(irrigationHistoryData[indexIrrigation]);
                        auxirrigation.push(irrigationHistoryDataCopy[indexIrrigation]);
                    }
                    indexIrrigation++;
                }
            }

            if (auxirrigation.length > 0) {
                var has3 = auxirrigation.find((i) => i.allowed == 3 && !i.canceled);
                var has4 = auxirrigation.find((i) => i.allowed == 4 && !i.canceled);
                var hasCancelled = auxirrigation.find((i) => i.canceled);
                var icon;
                if (has3 && has4)
                    icon = irr_both;
                else {
                    if (has3) {
                        icon = irr_auto;
                    } else if (has4) {
                        icon = irr_manual;
                    } else if (hasCancelled) {
                        //console.log("hasCancelled", hasCancelled);
                        icon = hasCancelled.icon;
                    }
                }
                irrigationTickValues.push({ time: auxDate.getTime() / 1000, value: 0, icon: icon })
            }

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

            tickValues.push((auxallDaysDate.getTime() + ((allDaysDate.getTime() - auxallDaysDate.getTime()) / 2)) / 1000);

            switch (useparations) {
                case 'h':
                    auxDate.setHours(auxDate.getHours() + timeseparation);
                    break;
                default:
                    auxDate.setDate(auxDate.getDate() + timeseparation);
                    break;
            }
        }

        //allDaysTicks.push(allDaysDate.getTime()/1000);

        let i2 = 0;
        var hasdata2 = false;
        while (i2 < data2.length && !hasdata2) {
            hasdata2 = data2[i2].length > 0;
            i2++;
        }



        const verticalLines = [];

        if (this.state.settingCalibrationRangeFrom) {
            verticalLines.push(
                <VictoryLine
                    key="vertical-line-from"
                    style={{
                        data: { stroke: "#44a3ad", strokeWidth: 1 }
                    }}
                    data={[
                        { x: this.state.settingCalibrationRangeFrom, y: 0 },
                        { x: this.state.settingCalibrationRangeFrom, y: 100 }
                    ]}
                />
            );
        }

        if (this.state.settingCalibrationRangeTo) {
            verticalLines.push(
                <VictoryLine
                    key="vertical-line-to"
                    style={{
                        data: { stroke: "#1d1482", strokeWidth: 1 }
                    }}
                    data={[
                        { x: this.state.settingCalibrationRangeTo, y: 0 },
                        { x: this.state.settingCalibrationRangeTo, y: 100 }
                    ]}
                />
            );
        }

        ///////////////////////////////
        ///////////////////////////////
        var _tooltipPoints;
        var that = this;

        class RectGrid extends React.Component {
            render() {
                var { x1, y1, x2, y2, index, datum } = this.props;

                var press = () => {
                    if (that.state.zoom) {
                        var nseparations = numberSeparations ? numberSeparations : 4;
                        that.recalculateFromTo(that.state.from, nseparations).then((obj) => {
                            that.setState({ animationEnabled: true, zoom: false, from: obj.from.getTime(), to: obj.to.getTime(), numberSeparations: 1, separationsUnit: null, textTest: [] })
                            that.animate();
                        })
                    } else {
                        var to = new Date(datum * 1000);
                        to.setDate(to.getDate() + 1);
                        that.setState({ animationEnabled: true, zoom: true, from: datum * 1000, to: to.getTime(), numberSeparations: 4, separationsUnit: 'h', textTest: [] })
                        that.animate();
                    }
                }
                var events = {
                    onClick: press,
                    onPressIn: press,
                    onMouseOver: () => {
                        that.setState({ rectHover: index })
                    },
                    onMouseOut: () => {
                        that.setState({ rectHover: null })
                    }
                };
                if (!this.props.transparent && (Platform.OS === 'android' || Platform.OS === 'ios'))
                    events = null;
                if (y2 > y1) {
                    var yaux = y2;
                    y2 = y1;
                    y1 = yaux;
                }
                var style = { fill: this.props.transparent ? "blue" : (that.state.rectHover == index && !that.state.animationEnabled && !that.state.zoom ? "#f8ffbd" : (index % 2 ? "white" : "#f1f1f1")) };
                if (Platform.OS === 'web')
                    style.cursor = "pointer";
                return (
                    <Rect x={x1} y={y2} style={style} width={(100 / nseparations) + "%"} height={y1 - y2} events={events} />
                );
            }
        }

        class CustomTooltip extends React.Component {
            render() {
                var { x, y, datum } = this.props;
                /*
                if (!_tooltipPoints)
                    return [];
                */
                //console.log(this.props,_tooltipPoints)
                var tooltipPoints = [datum]//_tooltipPoints.slice(0)
                var time;
                if (this.props.datum)
                    time = this.props.datum.time;

                var someUnits = false, i = 0;
                while (!someUnits && i < tooltipPoints.length) {
                    if (tooltipPoints[i].units)
                        someUnits = true;
                    i++;
                }

                if ((someUnits || that.state.lastTooltip) && !that.state.animationEnabled && tooltipPoints.filter((p) => { return p.value }).length > 0) {
                    var maxY;
                    if (!someUnits && that.state.lastTooltip) {
                        tooltipPoints = that.state.lastTooltip.tooltip;
                        x = that.state.lastTooltip.x;
                        time = that.state.lastTooltip.time;
                        maxY = that.state.lastTooltip.maxY;
                    } else {
                        maxY = Math.max.apply(Math, tooltipPoints.map(function (o) {
                            return o._y;
                        }))
                        that.state.lastTooltip = { x: x, tooltip: tooltipPoints, time: time, maxY: maxY }
                    }

                    var baseX = x - 80;
                    var baseY = ((that.state.chartHeight - 120) * (1 - (maxY / 100))) - (40 + (20 * tooltipPoints.length));

                    var baseW = 180;
                    var baseH = 30 + (20 * tooltipPoints.length);

                    if (Platform.OS === 'android' || Platform.OS === 'ios') {
                        if (baseY < 0)
                            baseY = 0;
                        if (baseX < 0)
                            baseX = 0;
                        if (baseX + baseW > that.state.chartWidth)
                            baseX = that.state.chartWidth - baseW;
                        if (baseY + baseH > that.state.chartHeight)
                            baseY = that.state.chartHeight - baseH;
                    }

                    return (
                        <Svg style={{ pointerEvents: 'none' }}>
                            <Rect x={baseX} y={baseY} width={baseW} height={baseH} style={{ fill: FliwerColors.hexToRgb(color2, 0.8) }} rx={5} ry={5} />
                            {this.renderToolTipValues(tooltipPoints, baseX, baseY, baseW, baseH)}
                            <LineSegment x1={baseX + 0.05 * baseW} x2={baseX + 0.95 * baseW} y1={baseY + (5 + (20 * tooltipPoints.length))} y2={baseY + (5 + (20 * tooltipPoints.length))} style={{ stroke: "white" }} />
                            <SvgText x={baseX + 0.5 * baseW} y={baseY + (18 + (20 * tooltipPoints.length))} style={{ fill: "white", dominantBaseline: "middle", textAnchor: "middle", fontFamily: FliwerColors.fonts.regular, fontSize: 12 }}>{moment(new Date(time * 1000)).format("LL HH:mm")}</SvgText>
                        </Svg>
                    );
                } else
                    return [];

            }
            renderToolTipValues(tooltipPoints, baseX, baseY, baseW, baseH) {
                var data = [];
                for (var i = 0; i < tooltipPoints.length; i++) {
                    if (tooltipPoints[i].value) data.push(<SvgText x={baseX + 0.5 * baseW} y={baseY + (14 + 20 * i)} style={{ fill: "white", dominantBaseline: "middle", textAnchor: "middle", fontFamily: FliwerColors.fonts.regular, fontSize: 12 }}>{tooltipPoints[i].title + ": " + tooltipPoints[i].value.toFixed(2).replace(/[.,]00$/, "") + " " + tooltipPoints[i].units}</SvgText>)
                }
                return data;
            }
        }

        class MeteoPoint extends React.Component {
            render() {
                const { x, y, datum } = this.props; // VictoryScatter supplies x, y and datum
                var width = (that.state.chartWidth / nseparations) * 0.5;
                return (
                    <SvgImage
                        style={{ pointerEvents: 'none' }}
                        x={x - (width / 2)}
                        y={3}
                        width={width}
                        height={40}
                        preserveAspectRatio="xMidYTop"
                        onImageLoaded={this.props.onImageLoaded}
                        href={datum.icon}
                    />
                );
            }
        }

        class CustomLabel extends React.Component {

            constructor(props) {
                super(props);
            }

            render() {
                const { x, y, text, index } = this.props; // VictoryScatter supplies x, y and datum

                var imageX = 0 + ((that.state.chartWidth / nseparations) * index);
                return (
                    <Svg style={{ pointerEvents: 'none' }}>
                        <SvgText x={x} y={y} ref={(t) => {
                            this.text = t;
                        }} style={{ fill: "black", strokeWidth: 1, fontFamily: FliwerColors.fonts.title, fontSize: 14, textAnchor: "middle" }} >{text}</SvgText>
                        {/*
                        <SvgImage
                            style={{ pointerEvents: 'none' }}
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

        class IrrigationPoint extends React.Component {
            render() {
                const { x, y, datum } = this.props; // VictoryScatter supplies x, y and datum
                var width = (that.state.chartWidth / nseparations) * 0.8;
                return (
                    <SvgImage
                        style={{ pointerEvents: 'none' }}
                        x={x - (width / 2)}
                        y={25}
                        width={width}
                        height={30}
                        preserveAspectRatio="xMidYTop"
                        onImageLoaded={this.props.onImageLoaded}
                        href={datum.icon}
                    />
                );
            }
        }

        ///////////////////////////////
        ///////////////////////////////

        var indents = [];
        if (this.state.chartWidth && this.state.chartHeight) {
            indents.push(
                <View pointerEvents={this.state.animationEnabled ? "none" : "auto"} style={{height:"100%"}} >
                    <View pointerEvents="none" style={{ height: 60}}>
                        <VictoryChart
                            theme={theme}
                            style={this.style.chartTop}
                            width={this.state.chartWidth}
                            height={60}
                            padding={{ top: 0, bottom: 0 }}
                            domain={{ x: [from.getTime() / 1000, to.getTime() / 1000], y: [0, 100] }}
                            containerComponent={< VictoryContainer disableContainerEvents />}
                        >
                            <VictoryAxis
                                orientation={"top"}
                                tickValues={dayTickValues}
                                tickLabelComponent={< CustomLabel y={19} />}
                                tickFormat={(value) => {
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
                            <VictoryScatter
                                data={irrigationTickValues}
                                y={"value"}
                                x={"time"}
                                dataComponent={< IrrigationPoint />}
                            />
                        </VictoryChart>
                    </View>
                    <VictoryChart
                        theme={theme}
                        style={[this.style.chart]}
                        width={this.state.chartWidth}
                        height={this.state.chartHeight - 120}
                        padding={{ top: 0, bottom: 0 }}
                        domain={{ x: [from.getTime() / 1000, to.getTime() / 1000], y: [0, 100] }}
                        containerComponent={< VictoryVoronoiContainer voronoiDimension="x"
                            disable={!hasdata2 || this.state.animationEnabled}
                            style={{
                                overflow: "visible"
                            }}
                            labels={({ datum }) => `y: ${datum._y}`}
                            events={{
                                onClick: (e) => {

                                    if (this.props.enableCalibration && this.state.lastTooltip && this.state.lastTooltip.tooltip && this.state.lastTooltip.tooltip.length > 0) {
                                        if (!this.state.settingCalibrationRange) {
                                            this.setState({ settingCalibrationRange: true, settingCalibrationRangeTo: null, settingCalibrationRangeFrom: this.state.lastTooltip.tooltip[0].time });
                                        } else {
                                            var from = this.state.settingCalibrationRangeFrom;
                                            var to = this.state.lastTooltip.tooltip[0].time;
                                            if (from > to) {
                                                var aux = from;
                                                from = to;
                                                to = aux;
                                            }
                                            //temp
                                            this.setState({ settingCalibrationRange: false, settingCalibrationRangeTo: from, settingCalibrationRangeFrom: to });

                                            if (this.props.onModal) {
                                                this.props.onModal("setCalibrationRange", {
                                                    from: from,
                                                    to: to
                                                });

                                            }
                                        }
                                    }
                                }
                            }}
                            labelComponent={<VictoryTooltip
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
                                flyoutComponent={< CustomTooltip />}
                            />}
                        />}
                    >
                        <VictoryAxis
                            tickValues={allDaysTicks}
                            gridComponent={< RectGrid style={{}} />}
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
                        <VictoryAxis dependentAxis
                            tickValues={[33]}
                            tickFormat={(t) => this.props.actions.translate.get('fliwerCard_minLimit') + ": " + this.valueWithUnits(limit33, units)}
                            tickLabelComponent={< VictoryLabel dy={12} dx={"60%"} />}
                            style={{
                                grid: {
                                    strokeWidth: 1,
                                    stroke: "#989898",
                                    userSelect: "none",
                                    pointerEvents: "none"
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
                                    textAnchor: "start",
                                    fill: "black",
                                    strokeWidth: 1,
                                    fontFamily: FliwerColors.fonts.light,
                                    fontSize: 11,
                                    userSelect: "none",
                                    pointerEvents: "none"
                                }
                            }}
                        />
                        <VictoryAxis dependentAxis
                            tickValues={[66]}
                            tickFormat={(t) => this.props.actions.translate.get('fliwerCard_maxLimit') + ": " + this.valueWithUnits(limit66, units)}
                            tickLabelComponent={< VictoryLabel dy={-13} dx={"60%"} />}
                            style={{
                                grid: {
                                    strokeWidth: 1,
                                    stroke: "#989898",
                                    userSelect: "none",
                                    pointerEvents: "none"
                                },
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
                                    textAnchor: "start",
                                    fill: "black",
                                    strokeWidth: 1,
                                    fontFamily: FliwerColors.fonts.light,
                                    fontSize: 11,
                                    userSelect: "none",
                                    pointerEvents: "none"
                                }
                            }}
                        />
                        {this.renderLines(data2)}
                        {verticalLines}
                    </VictoryChart>

                    <View pointerEvents="none" style={[{height:60},Platform.OS=="web"?{}:{position:"absolute",bottom:0}]}>
                        <VictoryChart
                            theme={theme}
                            style={this.style.chartTop}
                            width={this.state.chartWidth}
                            height={60}
                            padding={{ top: 0, bottom: 0 }}
                            domain={{ x: [from.getTime() / 1000, to.getTime() / 1000], y: [0, 100] }}
                        >
                            <VictoryScatter
                                data={meteoTickValues}
                                y={"value"}
                                x={"time"}
                                dataComponent={< MeteoPoint />}
                            />
                            <VictoryAxis
                                tickValues={tickValues}
                                tickLabelComponent={< VictoryLabel y={42} dy={0} />}
                                tickFormat={(value) => {

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
                                }
                                }
                            />
                        </VictoryChart>
                    </View>
                </View>
            );
        }

        return indents;
    }

    renderLines(data2) {
        const { style, data, color, color2, lineStyle, numberDays } = this.props

        var lines = [];
        var animationWhitelist = ["style", "x", "y"];
        if (this.state.animationTriggerWhitelist)
            animationWhitelist.push("data");

        for (var i = 0; i < data2.length; i++) {
            if (data2[i].length > 0) {

                if (data2[i].length > 1) {
                    lines.push(
                        <VictoryLine
                            style={{
                                data: {
                                    stroke: typeof color === 'string' ? color : color[i],
                                    userSelect: "none",
                                    pointerEvents: "none"
                                },
                                labels: { fill: "transparent" }
                            }}
                            animate={{
                                duration: this.props.animation ? this.props.animation : 1500,
                                onLoad: { duration: 0 },
                                onEnd: () => {
                                    this.setState({ animationEnabled: false })
                                },
                                animationWhitelist: animationWhitelist
                            }}
                            data={data2[i]}
                            y={"percent"}
                            x={"time"}
                        />)
                }

                lines.push(
                    <VictoryScatter
                        style={{
                            data: {
                                fill: typeof color === 'string' ? color : color[i],
                                userSelect: "none",
                                pointerEvents: "none"
                            },
                            parent: {
                                border: "1px solid #ccc"
                            }
                        }}
                        data={data2[i]}
                        y={"percent"}
                        x={"time"}
                        size={(datum, active) => !this.state.animationEnabled && active ? 5 : 0}
                    />);
            }
        }
        return lines;
    }

}


function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        sessionRoles: state.sessionReducer.roles
    };
}


function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {
    container: {
        "width": "100%",
        // "height": '85%',
        borderRadius: 10,
    },
    containerChart: {
        left: 30,
        right: 30,
        position: "absolute",
        top: 30,
        bottom: 0
    },
    chart: {
        "width": "100%",
        "height": "100%",
        paddingTop: 60,
        borderRadius: 10
    },
    chartTop: {
        "width": "100%",
        "height": 60,
    },

    chart2: {
        "width": "100%",
        "height": 60,
        position: "absolute"
    },
    chart3: {
        "width": "100%",
        "height": 60,
        bottom: 0,
        position: "absolute"
    },
    animationMask: {
        width: "100%",
        height: "100%",
        position: "absolute"
    },

    switchContainer: {
        position: "absolute",
        top: 0,
        right: 0,
        height: 20,
        width: 180,
        marginTop: 5,
        marginRight: 40,
        marginBottom: 5,
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    switchTitle: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 12,
        paddingTop: 4
    },
    switchTitle1: {
        marginRight: 5
    },
    switchTitle2: {
        marginLeft: 5
    },
    switch: {

    },
    prevNextButton: {
        top: "50%",
        marginTop: -20,
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

if (Platform.OS == 'ios')
    style.switchTitle.paddingTop = 10;


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(mediaConnect(style, FliwerChart));
