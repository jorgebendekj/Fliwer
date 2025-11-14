'use strict';

import React, { Component } from 'react';
import {View, Platform, TouchableOpacity, Text, Image, ScrollView} from 'react-native';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {Orientation} from '../../utils/orientation/orientation'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors.js'
import {FliwerStyles} from '../../utils/FliwerStyles.js'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils.js'

import {toast} from '../../widgets/toast/toast'

import batteryType1_Off  from '../../assets/img/ico-off.png'
import batteryType1_On  from '../../assets/img/ico-on.png'
import batteryType2_Off  from '../../assets/img/ico-off.png'
import batteryType2_On  from '../../assets/img/ico-on.png'

import moment from 'moment';

class SignalBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    render() {
        var {signalArray,style,barContainerStyle,barColor,showText,showTime,barHeight} = this.props;

        

        return (
            <View style={[{height:(barHeight?barHeight:18)+(showText?12:0)+(showTime?12:0),width:"100%",display:"flex"},style]}>
                {showTime?(
                    <View style={{height:12,width:"100%"}}>
                        {this.renderTime()}
                    </View>
                ):null}
                <View style={[{height:(barHeight?barHeight:18),width:"100%"},barContainerStyle]}>
                    <View style={{position:"absolute",width:"100%",height:1,top:"50%",marginTop:-0.5,borderRadius:1,backgroundColor:barColor?barColor:"gray"}}></View>
                    {this.renderSignal()}
                    {this.renderSeparators()}
                </View>
                {showText?(
                    <View style={{height:12,width:"100%"}}>
                        {this.renderText()}
                    </View>
                ):null}
            </View>
        );

    }

    renderSignal(){
        var {signalArray,colorRanges,signalbarWidth} = this.props; 
        // signalArray is from older to newer
        // colorRanges from worse to better
        
        var colorRangesUse=colorRanges;
        if(!colorRangesUse)colorRangesUse=[{max:25,color:"red"},{max:50,color:"orange"},{max:75,color:"yellow"},{max:9999,color:"green"}];//From worse to better

        var signalbarWidthUse=signalbarWidth?signalbarWidth:5;

        var indents=[];
        var step=(100/signalArray.length);

        var paddingLeft=0;

        for(var i=0;i<signalArray.length;i++){

            if(signalArray[i]!=null){

                var color="gray";
                for(var j=0;j<colorRangesUse.length;j++){
                    if(signalArray[i].connection<colorRangesUse[j].max){
                        color=colorRangesUse[j].color;
                        break;
                    }
                }

                indents.push(
                    <View style={{position:"absolute",width:step+"%",height:signalbarWidthUse,top:"50%",left:paddingLeft+"%",marginTop:-1*(signalbarWidthUse/2),borderRadius:signalbarWidthUse,backgroundColor:color}}></View>
                );
            }
            paddingLeft+=step;

        }

        return indents;
    }

    renderSeparators(){
        var {signalArray,barColor,tickWidth} = this.props; 
        // signalArray is from newer to older
        
        var indents=[];
        var step=(100/signalArray.length);

        var paddingLeft=0;

        var _tickWidth=tickWidth?tickWidth:5;

        for(var i=signalArray.length-1;i>=0;i--){

            indents.push(
                <View style={{position:"absolute",height:"100%",width:_tickWidth,left:paddingLeft+"%",borderRadius:_tickWidth,backgroundColor:barColor?barColor:"gray"}}></View>
            );
            paddingLeft+=step;

        }

        if(signalArray.length==0){
            //Render the first separator
            indents.push(
                <View style={{position:"absolute",height:"100%",width:_tickWidth,left:"0%",borderRadius:_tickWidth,backgroundColor:barColor?barColor:"gray"}}></View>
            );
        }

        //last separator
        indents.push(
            <View style={{position:"absolute",height:"100%",width:_tickWidth,right:"0%",borderRadius:_tickWidth,backgroundColor:barColor?barColor:"gray"}}></View>
        );

        return indents;
    
    }

    renderText(){
        var {textStyle,signalArray} = this.props;

        var indents=[];
        var step=(100/signalArray.length);

        var paddingLeft=0;

        for(var i=0;i<signalArray.length;i++){
                
            if(signalArray[i]!=null){
                indents.push(
                    <Text style={[{position:"absolute",left:paddingLeft+(step/2)+"%",transform: "translateX(-50%)",fontSize:10,color:"black"},textStyle]}>{signalArray[i].connection+"%"}</Text>
                );
            }
            paddingLeft+=step;

        }

        return indents;
    }

    renderTime(){
        var {textStyle,signalArray} = this.props;

        var indents=[];
        var step=(100/signalArray.length);

        var paddingLeft=0;

        for(var i=0;i<signalArray.length;i++){
                
            if(signalArray[i]!=null){
                indents.push(
                    <Text style={[{position:"absolute",left:paddingLeft+(step/2)+"%",transform: "translateX(-50%)",fontSize:10,color:"black"},textStyle]}>{moment.unix(signalArray[i].timestamp).format("HH:mm:ss")}</Text>
                );
            }
            paddingLeft+=step;

        }

        return indents;
    }

};


function mapStateToProps(state, props) {
    return {
        devices: state.fliwerDeviceReducer.devices,
        devicePacketData: state.fliwerDeviceReducer.packetData,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
        roles: state.sessionReducer.roles
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch)
        }
    };
}

var style = {
    selectIconType: {
        width: 100,
        height: 120,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    selectIconTypeImage: {
        width: 90,
        height: 90
    },
    selectIconTypeText: {
        fontFamily: FliwerColors.fonts.light,
        color: FliwerColors.primary.black,
        //marginTop: 10
        marginTop: -52,
        zIndex: 999
    },
    batteryType1: {
        marginRight: 15
    },
    batteryType2: {
        marginLeft: 15
    },
    paramCard: {
        width: "100%",
        height: 355,
//        marginTop: 20,
        maxWidth: 500
    },
    paramCardIn: {
        height: 350
    },
    fullScreenCard: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
//        paddingBottom: 8,
        width: "auto",
        maxWidth: "auto",
        position: "absolute"
    },
    fullScreenCardIn: {
        height: "100%",
        maxWidth: "auto",
        marginBottom: 0
    },
    ":hover": {
        batteryType1: {
            filter: "brightness(110%)"
        },
        batteryType2: {
            filter: "brightness(110%)"
        }
    }
};

if (Platform.OS != 'web')
    style.fullScreenCard.top = 0;

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, SignalBar));
