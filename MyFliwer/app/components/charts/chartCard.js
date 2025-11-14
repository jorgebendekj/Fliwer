'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../../components/custom/FliwerCard.js'
import FliwerChart from '../../components/charts/fliwerChart.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

import { Redirect } from '../../utils/router/router'

import Icon from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

class ChartCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
        this._chart= React.createRef();
    }

    render() {
        const {style, cardStyle, fullScreen, onFullScreen, onDownload, onClose} = this.props
        return (
                <FliwerCard ref="card" touchable={false} style={[style, this.style.fliwerCardStyle]} cardStyle={cardStyle} cardInStyle={this.style.cardInStyle}>
                    <View>
                        {this.renderCardFront()}
                        {typeof onFullScreen === "function"?<TouchableOpacity style={this.style.resizeButton} onMouseEnter={this.hoverIn('resizeIcon')} onMouseLeave={this.hoverOut('resizeIcon')}
                            onPress={() => {
                                onFullScreen();
                            }}>
                            <Icon name={fullScreen ? "size-actual" : "size-fullscreen"} style={this.style.resizeIcon} ></Icon>
                        </TouchableOpacity>:null}
                        {typeof onDownload === "function"?<TouchableOpacity style={this.style.downloadButton} onMouseEnter={this.hoverIn('downloadIcon')} onMouseLeave={this.hoverOut('downloadIcon')}
                            onPress={() => {
                                onDownload();
                            }}>
                            <Icon name={"cloud-download"} style={this.style.downloadIcon} ></Icon>
                        </TouchableOpacity>:null}
                        {typeof onClose === "function"?<TouchableOpacity style={this.style.closeButton} onMouseEnter={this.hoverIn('closeIcon')} onMouseLeave={this.hoverOut('closeIcon')}
                            onPress={() => {
                                onClose();
                            }}>
                            <IconMaterialIcons name="close" size={25} style={{color: "black"}}/>
                        </TouchableOpacity>:null}
                    </View>
                </FliwerCard>
                );
    }

    getChart() {
        return this._chart;
    }

    renderCardFront() {
        var card = [];
        const {data, filter, numberDays, limit33, limit66, units, meteoData, irrigationHistoryData, dataInstant, onChartRef, dataRange, getMoreData, onNewPosition, defaultValues, minData} = this.props

        var data2, dataInstant2;

        var idrawSwitch = true;
        if ((filter == 'light' || filter == 'airh') && (data.length == 0 || (data.length == 1 && data[0].length == 0))) {
            data2 = dataInstant;
            dataInstant2 = data;
            idrawSwitch = false;
        } else {
            data2 = data;
            dataInstant2 = dataInstant;
        }

        card.push(<FliwerChart 
                ref={(c) => {
                    if (c) {
                        this._chart = c;
                        if (typeof onChartRef === "function")
                            onChartRef(this._chart)
                    }
                }} 
                key={1} 
                numberSeparations={numberDays} 
                data={data2} 
                dataInstant={dataInstant2} 
                meteoData={meteoData} 
                irrigationHistoryData={irrigationHistoryData} 
                color={filter != 'soilm' ? FliwerColors.subparameters[filter] : [FliwerColors.subparameters['soilm'], FliwerColors.subparameters['soilm2'], FliwerColors.subparameters['soilm3'], ]} 
                color2={FliwerColors.parameters[filter]} 
                limit33={limit33} 
                limit66={limit66} 
                units={units} 
                drawSwitch={(filter == "light" || filter == "airh" ? idrawSwitch : false)} 
                dataRange={dataRange} 
                getMoreData={getMoreData} 
                onNewPosition={onNewPosition} 
                defaultValues={defaultValues} 
                minData={minData}
                enableCalibration={(this.props.enableCalibration===undefined || this.props.enableCalibration===true) && filter=='soilm'?true:false}
                calibrationData={this.props.calibrationData}
                onModal={this.props.onModal}
            />)
        /*
         if(this.props.title)card.push (<Text key={1} style={this.style.title}>{this.props.title}</Text>)
         if(this.props.image)card.push(<Image key={3} style={this.style.image} source={{uri: this.props.image}} />)
         if(this.props.subtitle)card.push (<Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>)
         */

        return card;
    }

};

var style = {

    resizeButton: {
        position: "absolute",
        top: 0,
        left: 0
    },
    resizeIcon: {
        fontSize: 20,
        textAlign: "center",
        zIndex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        height: 30,
        color: "rgb(150,150,150)",
        marginTop: 5
    },
    downloadButton: {
        position: "absolute",
        top: 0,
        right: 0
    },
    downloadIcon: {
        fontSize: 20,
        textAlign: "center",
        zIndex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
        height: 30,
        color: "rgb(115, 143, 177)",
        marginTop: 5
    },
    closeButton: {
        position: "absolute",
        top: 5,
        right: 5
    },
    "@media (orientation:landscape)": {
        cardInStyle: {
            maxWidth: "100%",
            height: "100%"
        },
        fliwerCardStyle: {

        }
    },
    "@media (orientation:portrait)": {
        cardInStyle: {
            height: "100%",
            width: "100%"
        }
    },
    ":hover": {
        resizeIcon: {
            filter: "brightness(130%)"
        },
        downloadIcon: {
            filter: "brightness(130%)"
        },
        closeIcon: {
            filter: "brightness(130%)"
        }
    }
}

//Connect everything
export default mediaConnect(style, ChartCard);
