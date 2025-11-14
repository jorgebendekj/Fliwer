'use strict';

import React, { Component } from 'react';
import {View, Platform, TouchableOpacity, Text, Image, ScrollView, Touchable} from 'react-native';

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


import moment from 'moment';
import { Button } from 'react-native-elements';

class PingTestBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            index:-2,
            newTestPacketSize:127,
            newTestPingPeriod:0.1,
            newTestDuration:60,
            testRunning:".",
            testRunningInterval:null
        };

        this.state.testRunningInterval=setInterval(()=>{
            var testRunning=this.state.testRunning;
            if(testRunning.length>3)testRunning=".";
            else testRunning+=".";
            this.setState({testRunning:testRunning});
        },1000);

    }

    componentWillUnmount(){
        clearInterval(this.state.testRunningInterval);
    }

    rollPacketSize(){
        var options=[31,64,97,127];
        var index=options.indexOf(this.state.newTestPacketSize);
        index=(index+1)%options.length;
        this.setState({newTestPacketSize:options[index]});
    }

    rollPingPeriod(){
        var options=[0.1,0.2,0.5,1,5,10];
        var index=options.indexOf(this.state.newTestPingPeriod);
        index=(index+1)%options.length;
        this.setState({newTestPingPeriod:options[index]});
    }

    rollDuration(){
        var options=[10,30,60,300,600];
        var index=options.indexOf(this.state.newTestDuration);
        index=(index+1)%options.length;
        this.setState({newTestDuration:options[index]});
    }

    render() {
        var {devices,idDevice,style,barContainerStyle,barColor,showText,showTime,barHeight} = this.props;

        var pingTests = devices[idDevice].pingTests?devices[idDevice].pingTests:[];
        //Sort from bigger idTest to smaller
        pingTests.sort((a,b)=>b.idTest-a.idTest);

        if(this.state.index==-2){
            //First time, decide if show newest or add a new one
            if(pingTests.length==0)this.state.index=-1;
            else this.state.index=0;
        }

        return (
            <View style={[{height:40,width:"100%",display:"flex",flexDirection:"row",borderWidth: 1,borderRadius: 40},style]}>
                <TouchableOpacity
                    onPress={()=>{
                        if(this.state.index<pingTests.length-1) this.setState({index:this.state.index+1})
                    }}
                    style={[{height:"100%",width:20,display:"flex",alignItems:"center",justifyContent:"center",borderTopLeftRadius:45,borderBottomLeftRadius:45,backgroundColor:FliwerColors.primary.green}]}
                >
                    <Text style={{fontFamily:FliwerColors.fonts.light}}>{"<"}</Text>
                </TouchableOpacity>

                {this.state.index==-1?this.renderNewestPingTest():this.renderPingTest(pingTests[this.state.index])}

                {
                    this.state.index!=-1?(
                        <TouchableOpacity
                            onPress={()=>{
                                if(this.state.index>-1) this.setState({index:this.state.index-1})
                            }}
                            style={[{height:"100%",width:20,display:"flex",alignItems:"center",justifyContent:"center",borderTopRightRadius:45,borderBottomRightRadius:45,backgroundColor:FliwerColors.primary.green}]}
                        >
                            <Text style={{fontFamily:FliwerColors.fonts.light}}>{">"}</Text>
                        </TouchableOpacity>
                    ):null
                }

            </View>
        );

    }

    renderNewestPingTest(){
        var {textStyle,buttonText} = this.props;
        var indents=[];

        //var failed=!pingTest.packetsReceived && pingTest.endTime;
        
        //{"idTest":42,"insertTime":1724422713,"endTime":1724422728,"numberPackets":60,"packetSize":97,"duration":6,"pingPeriod":"0.1","packetsReceived":59}
        indents.push(
            <View style={{height:"100%",flexGrow:1,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-evenly"}}>
                <TouchableOpacity style={[this.style.barColumn,{width:"16%"}]} onPress={()=>{this.rollPacketSize();}}>
                    <Text style={[this.style.barText,textStyle]}>{(this.state.newTestPacketSize)+"b"}</Text>
                </TouchableOpacity>
                

                <TouchableOpacity style={[this.style.barColumn,{width:"16%"},this.style.columnBackground]} onPress={()=>{this.rollPingPeriod();}}>
                    <Text style={[this.style.barText,textStyle]}>{(this.state.newTestPingPeriod)+"s"}</Text>
                </TouchableOpacity>
                

                <TouchableOpacity style={[this.style.barColumn,{width:"18%"}]} onPress={()=>{this.rollDuration();}}>
                    <Text style={[this.style.barText,textStyle]}>{(this.state.newTestDuration)+"s"}</Text>
                </TouchableOpacity>
                

                <TouchableOpacity style={[this.style.barColumn,{flexGrow:1,backgroundColor:FliwerColors.primary.green,borderTopRightRadius:45,borderBottomRightRadius:45}]} onPress={()=>{
                    //Call device action realTimeStartPingTest(idDevice,packetSize,pingPeriod,duration)
                    var startFunction=()=>{
                        return new Promise((resolve,reject)=>{
                            if(this.props.setLoading)this.props.setLoading(true);
                            this.props.actions.fliwerDeviceActions.realTimeStartPingTest(this.props.idDevice,this.state.newTestPacketSize,this.state.newTestPingPeriod,this.state.newTestDuration).then(()=>{
                                if(this.props.setLoading)this.props.setLoading(false);
                                this.setState({index:0});
                                resolve();
                            },(error)=>{
                                if(this.props.setLoading)this.props.setLoading(false);
                                toast("Error starting test",error);
                                reject();
                            });
                        });
                    };

                    if(this.props.onStartTest) this.props.onStartTest(startFunction);
                    else startFunction();

                }}>
                    <Text style={[this.style.barText,textStyle]}>{buttonText?buttonText:"Start new test"}</Text>
                </TouchableOpacity>

            </View>
        );

        return indents;
    }

    renderPingTest(pingTest){
        var {textStyle,startTimeFormat,startTimeStyle} = this.props;
        var indents=[];

        if(!pingTest)return indents;


        //{"idTest":42,"insertTime":1724422713,"endTime":1724422728,"numberPackets":60,"packetSize":97,"duration":6,"pingPeriod":"0.1","packetsReceived":59}
        indents.push(
            <View style={{height:"100%",flexGrow:1,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-evenly"}}>
                <View style={[this.style.barColumn,{width:"16%"}]}>
                    <Text style={[this.style.barText,textStyle]}>{(pingTest.packetSize)+"b"}</Text>
                </View>
                

                <View style={[this.style.barColumn,{width:"16%"},this.style.columnBackground]}>
                    <Text style={[this.style.barText,textStyle]}>{parseFloat(pingTest.pingPeriod)+"s"}</Text>
                </View>
                

                <View style={[this.style.barColumn,{width:"18%"}]}>
                    <Text style={[this.style.barText,textStyle]}>{pingTest.duration+"s"}</Text>
                </View>
                

                <View style={[this.style.barColumn,{width:"28%"},this.style.columnBackground]}>
                    <Text style={[this.style.barText,textStyle,startTimeStyle]}>{moment.unix(pingTest.insertTime).format(startTimeFormat?startTimeFormat:"HH:mm:ss")}</Text>
                </View>
                
                {pingTest.endTime?(
                    <View style={[this.style.barColumn,{width:"15%"},{flexDirection:"column",alignItems:"center"}]}>
                        <Text style={[this.style.barText,textStyle]}>{pingTest.packetsReceived?pingTest.packetsReceived:"--"}</Text>
                        <View style={this.style.barSeparatorColumn}></View>
                        <Text style={[this.style.barText,textStyle]}>{pingTest.numberPackets}</Text>
                    </View>
                ):(
                    <View style={[this.style.barColumn,{width:"15%"},{flexDirection:"column",alignItems:"center"}]}>
                        <Text style={[this.style.barText,textStyle]}>{this.state.testRunning}</Text>
                    </View>
                )}

            </View>
        );

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
    barColumn:{
        display:"flex",
        /*
        marginLeft:3,
        marginRight:3,
        */
        height:"100%",
        justifyContent:"center",
        /*flexGrow:1,*/
        textAlign:"center"
    },
    columnBackground:{
        backgroundColor:FliwerColors.secondary.gray
    },
    barText:{
        color:"black",
        fontFamily:FliwerColors.fonts.light,
        textAlign:"center",
        fontSize:15
    },
    barSeparator:{
        backgroundColor:"black",
        width:1,
        height:"100%"
    },
    barSeparatorColumn:{
        backgroundColor:"black",
        height:1,
        width:"100%"
    },
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
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, PingTestBar));
