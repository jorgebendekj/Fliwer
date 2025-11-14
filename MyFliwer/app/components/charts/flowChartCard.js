'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../../components/custom/FliwerCard.js'
import FliwerFlowChart from './fliwerFlowChart.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

import { Redirect } from '../../utils/router/router'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import Icon from 'react-native-vector-icons/SimpleLineIcons';

import icon  from '../../assets/img/controladoragua-ico.png'

class FlowChartCard extends Component {

    constructor(props) {
        super(props);

    }

    render() {
        const {style, cardStyle, fullScreen, onFullScreen, idDevice, zoneName, filter, hideResizeButton, onDownload} = this.props
        return (
                <FliwerCard ref="card" touchable={false} style={[this.style.fliwerCardStyle, style]} cardStyle={cardStyle} cardInStyle={this.style.cardInStyle}>
                    <View>
                        {this.renderCardFront()}
                        {!hideResizeButton?<TouchableOpacity style={this.style.resizeButton} onMouseEnter={this.hoverIn('resizeIcon')} onMouseLeave={this.hoverOut('resizeIcon')}
                            onPress={() => {
                                if (typeof onFullScreen === "function")
                                    onFullScreen(idDevice ? idDevice : true)
                            }}>
                            <Icon name={fullScreen ? "size-actual" : "size-fullscreen"} style={[this.style.icon, this.style.resizeIcon]} ></Icon>
                        </TouchableOpacity>:null}
                        {typeof onDownload === "function"?<TouchableOpacity style={this.style.downloadButton} onMouseEnter={this.hoverIn('downloadIcon')} onMouseLeave={this.hoverOut('downloadIcon')}
                            onPress={() => {
                                onDownload();
                            }}>
                            <Icon name={"cloud-download"} style={this.style.downloadIcon} ></Icon>
                        </TouchableOpacity>:null}
                    </View>
                </FliwerCard>
                );
    }

    renderCardFront() {
        var card = [];
        const {title, fullScreen, data, filter, numberDays, units, dataInstant, idDevice, onChartRef, currency, priceLiter, dataRange, getMoreData, onNewPosition, defaultValues, minData, zoneName, zoneData, hideBottomBar, hideMiddleBar, hideTopBar} = this.props

        var cardTitle = title? title : this.props.actions.languageActions.get('flowChartCart_title');

        card.push(
                <View style={this.style.cardFront}>
                    <View style={[this.style.title, fullScreen ? this.style.fullScreenTitle : {}]}>
                        <Text style={this.style.titleText}>{cardTitle}</Text>
                        <Text style={this.style.titleText}>{idDevice ? idDevice : zoneName}</Text>
                        {filter==="soilm"?<Image style={[this.style.titleImage, fullScreen ? this.style.fullScreenTitleImage : {}]} source={icon} resizeMode={"contain"} />:null}
                    </View>
                    <View style={this.style.flowChart}>
                        <FliwerFlowChart
                            ref={(c) => {
                                if (c) {
                                    this._chart = c;
                                    if (typeof onChartRef === "function")
                                        onChartRef(this._chart)
                                }
                            }}
                            key={"FliwerFlowChart"+1}
                            style={this.style.flowChartIn}
                            numberSeparations={numberDays}
                            data={data}
                            dataInstant={dataInstant}
                            color={filter != 'soilm' ? FliwerColors.subparameters[filter] : [FliwerColors.subparameters['soilm'], FliwerColors.subparameters['soilm2'], FliwerColors.subparameters['soilm3'], ]} color2={FliwerColors.parameters[filter]} color3={FliwerColors.primary["green"]} color4={FliwerColors.secondary["red"]}
                            units={units}
                            currency={currency}
                            priceLiter={priceLiter}
                            dataRange={dataRange}
                            getMoreData={getMoreData}
                            onNewPosition={onNewPosition}
                            defaultValues={defaultValues}
                            minData={minData}
                            zoneData={zoneData}
                            hideBottomBar={hideBottomBar}
                            hideMiddleBar={hideMiddleBar}
                            hideTopBar={hideTopBar}
                        />
                    </View>
                </View>
                )

        return card;
    }

}
;

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
            languageActions: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

var style = {

    resizeButton: {
        position: "absolute",
        top: 0,
        left: 0
    },
    downloadButton: {
        position: "absolute",
        top: 12,
        right: 62
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
    modeButton: {
        position: "absolute",
        top: 0,
        left: 30
    },
    icon: {
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
    gridIcon: {
        fontSize: 25
    },
    chartIcon: {
        fontSize: 25,
        transform: [{scale: 1.5}]
    },
    cardFront: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    cardBack: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    title: {
        paddingTop: 15,
        height: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%"
    },
    titleText: {
        fontFamily: FliwerColors.fonts.light,
        fontSize: 14
    },
    titleImage: {
        height: 53,
        width: 60,
        right: 1,
        top: 2,
        position: "absolute"
    },
    flowChart: {
        flexGrow: 1,
        width: "100%"
    },
    flowChartIn: {
        height: "100%",
    },
    fullScreenTitle: {

    },
    fullScreenTitleImage: {

    },
    "@media (orientation:landscape)": {
        cardInStyle: {
            maxWidth: "100%",
            height: "100%"
        },
        fliwerCardStyle: {
            paddingBottom: 16
        },
        "@media (height<=500)": {
            fullScreenTitle: {
                height: 38,
                paddingTop: 0
            },
            fullScreenTitleImage: {
                width: 55,
                height: 35
            }
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
        modeIcon: {
            filter: "brightness(130%)"
        }
    }
}

if (Platform.OS === 'android' || Platform.OS == 'ios') {
    style.flowChart.height = 1;
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FlowChartCard));
