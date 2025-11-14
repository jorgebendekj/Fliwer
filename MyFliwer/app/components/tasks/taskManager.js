'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    RefreshControl,
    Platform
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading'
import ImageBackground from '../imageBackground.js'
import {FliwerColors} from '../../utils/FliwerColors'
import FliwerBackButton from '../custom/FliwerBackButton.js'
import TaskManagerCard from './taskManagerCard.js'
import CardCollection from '../custom/cardCollection.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerVerifyEmailModalGeneric from '../custom/FliwerVerifyEmailModalGeneric.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect,withRouter } from '../../utils/router/router'
import moment from 'moment';

import icofliwer  from '../../assets/img/Icofliwer.png'

import searchIco  from '../../assets/img/9_serch.png'

import background  from '../../assets/img/zoneBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

import addButton  from '../../assets/img/add.png'


class TaskManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idZone: this.props.match.params.idZone,
            modalVisible: false,
            previousModalVisible:false,
            emailVerificationNeeded: false,
            idIrrigationProgram: null,
            loading: false,
            goToHistory: false,
            addingNewTask: false,
            isRealtimeMode: false,
            initialized: false

        };

        this.props.actions.fliwerZoneActions.getZoneDataIrrigationPrograms(this.props.match.params.idZone).then(() => {
            this.props.actions.sessionActions.getRealtimePrograms().then((response) => {
                this.setState({initialized: true});
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params.idZone !== this.state.idZone) {
            this.setState({idZone: this.props.match.params.idZone, initialized: false});
            this.props.actions.fliwerZoneActions.getZoneDataIrrigationPrograms(this.props.match.params.idZone).then(() => {
                this.setState({initialized: true});
            });
        }
    }

    render()
    {
        var topIcons = [];
        var bottomIcons = [];
        topIcons.push("params", "devices", "history", "plants");
        if (this.props.isGardener)
            bottomIcons.push("gardener");
        bottomIcons.push("zone", "files");

        if (this.state.goNextGarden) {
            this.state.goNextGarden = false;
            return (<Redirect push to={"/zone/" + this.state.foundZoneId + "/taskManager/"} />)
        } else if(this.state.goToHistory) {
            return (<Redirect push to={"/zone/"+this.state.idZone+"/history"} />);
        } else if (!this.props.preloadedData || !this.state.initialized) {
            var zone = this.props.zoneData[this.state.idZone];
            return (
                    <ImageBackground source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"}>
                        <MainFliwerTopBar showTextBar={true} mode={'zone'} title={zone?zone.name:""}/>
                        <MainFliwerMenuBar idZone={this.state.idZone} current={"task-manager"} icons={topIcons} position={"top"} />
                        <FliwerLoading/>
                        <View style={{width: "100%", flex: 1}}></View>
                        <MainFliwerMenuBar idZone={this.state.idZone} current={"task-manager"} icons={bottomIcons} />
                    </ImageBackground>
                    )
        } else
        {
            var zone = this.props.zoneData[this.state.idZone];
            var zones = Object.values(this.props.zoneData);
            return (
              <ImageBackground source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} loading={this.state.loading} resizeMode={"cover"} >
                  <MainFliwerTopBar showTextBar={true} mode={'zone'} title={zone.name} onPressNextGarden={zones.length>1?this.nextGarden:null} onPressPreviousGarden={zones.length>1?this.previousGarden:null}/>
                  <MainFliwerMenuBar idZone={this.state.idZone} current={"task-manager"} icons={topIcons} position={"top"} />
                  <ScrollView scrollEventThrottle={1000} style={{flex: 1}}>
                      <CardCollection style={this.style.collection}>
                          {this.renderTaskManager()}
                      </CardCollection>
                  </ScrollView>
                  {this.renderBackBar()}
                  <MainFliwerMenuBar idZone={this.state.idZone} current={"task-manager"} icons={bottomIcons} />
                  <FliwerDeleteModal
                      visible={this.state.modalVisible}
                      onClose={() => {
                          this.setModalVisible(false, this.state.idIrrigationProgram, this.state.isRealtimeMode);
                      }}
                      onConfirm={async () => {
                          this.setState({modalVisible:false,emailVerificationNeeded:true,emailVerificationSuccess:(uuid,code)=>{return this.deleteIrrigationProgram(uuid,code)}})
                      }}
                      title={this.state.isRealtimeMode? this.props.actions.translate.get('taskManager_sure_delete_realtime_task') : this.props.actions.translate.get('taskManager_sure_delete')}
                      password={false}
                      loadingModal={this.state.loading}
                      />
                  {this.getFliwerVerifyEmailModalGeneric()}
              </ImageBackground>
          );
        }

    }

    renderBackBar()
    {
        return(
            <View style={this.style.buttonBackContainer}>
                <TouchableOpacity style={this.style.buttonBack} onPress={() => {
                        //this.props.history.goBack();
                        this.setState({goToHistory: true});
                    }}>
                    <Text style={this.style.textBack}>{this.props.actions.translate.get('general_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderTaskManager()
    {
        var indents = [];

        if (this.props.zoneData && this.props.zoneData[this.state.idZone])
        {

            var programs = this.props.zoneData[this.state.idZone].irrigationProgramsData;
            //var programs= Object.values(this.props.zoneData[this.state.idZone])
        }

        if (programs) {
            programs = Object.values(programs).sort((pa, pb) => {
                if (pa.repeat == 0 && pb.repeat == 0)
                    return pa.irrigationTime >= pb.irrigationTime ? 1 : -1;
                else if (pa.repeat == 0 && pb.repeat != 0)
                    return -1;
                else if (pa.repeat != 0 && pb.repeat == 0)
                    return 1;
                else if (pa.repeat == 5 && pb.repeat == 5) {
                    var pas = pa.start_time.split(":"), pbs = pb.start_time.split(":");
                    if (pas[0] < pbs[0] || (pas[0] == pbs[0] && pas[1] < pbs[1]))
                        return -1;
                } else if (pa.repeat == 5 && pb.repeat != 5)
                    return -1;
                else if (pa.repeat != 5 && pb.repeat == 5)
                    return 1;
                else if (pa.repeat == 3 && pb.repeat == 3) {
                    var pas = pa.start_time.split(":"), pbs = pb.start_time.split(":");
                    if (pa.weekday < pb.weekday || ((pa.weekday == pb.weekday && pas[0] < pbs[0]) || (pa.weekday < pb.weekday && pas[0] == pbs[0] && pas[1] < pbs[1])))
                        return -1;
                } else if (pa.repeat == 3 && pb.repeat != 3)
                    return -1;
                else if (pa.repeat != 3 && pb.repeat == 3)
                    return 1;
                else if (pa.repeat == 2 && pb.repeat == 2) {
                    var pas = pa.start_time.split(":"), pbs = pb.start_time.split(":");
                    if (pa.day < pb.day || ((pa.day == pb.day && pas[0] < pbs[0]) || (pa.day < pb.day && pas[0] == pbs[0] && pas[1] < pbs[1])))
                        return -1;
                } else if (pa.repeat == 2 && pb.repeat != 2)
                    return -1;
                else if (pa.repeat != 2 && pb.repeat == 2)
                    return 1;
                else if (pa.repeat == 1 && pb.repeat == 1) {
                    var pas = pa.start_time.split(":"), pbs = pb.start_time.split(":");
                    if (pa.month < pb.month || (pa.month == pb.month && pa.day < pb.day) || ((pa.month == pb.month && pa.day == pb.day && pas[0] < pbs[0]) || (pa.month == pb.month && pa.day < pb.day && pas[0] == pbs[0] && pas[1] < pbs[1])))
                        return -1;
                } else if (pa.repeat == 1 && pb.repeat != 1)
                    return -1;
                else if (pa.repeat != 1 && pb.repeat == 1)
                    return 1;
                return 1;
            });

            //console.log("programs",programs, " data: ",this.props.zoneData);

            for (var index = 0; index < programs.length; index++) {
                //console.log("for "+index+" - ",programs[index]);

                if (programs[index].allowed == 0 || programs[index].allowed == 2)
                    indents.push(
                        <TaskManagerCard key={programs[index].id}
                            programInformation={programs[index]}
                            setLoading={(v) => this.setLoading(v)}
                            idZone={this.state.idZone}
                            onUpdate={(idZone,idProgram,programModified,onFinish) => this.onUpdate(idZone,idProgram,programModified,onFinish)}
                            modalFunc={(v, id, isRealtimeMode) => this.setModalVisible(v, id, isRealtimeMode)}
                        />
                    );
            }
        }

        // Render real time programs
        if (this.props.realTimePrograms.length > 0) {
            var realTimePrograms = this.props.realTimePrograms;
            for (var index = 0; index < realTimePrograms.length; index++) {
                var realTimeProgram = realTimePrograms[index];
                realTimeProgram.isRealtimeMode = true;
                realTimeProgram.start_time = realTimeProgram.programmedTime*1000;
                indents.push(
                    <TaskManagerCard key={"realTimeProgram-" + realTimeProgram.id}
                        programInformation={realTimeProgram}
                        setLoading={(v) => this.setLoading(v)}
                        idZone={this.state.idZone}
                        onUpdate={(idZone,idProgram,programModified,onFinish) => this.onUpdate(idZone,idProgram,programModified,onFinish)}
                        modalFunc={(v, id, isRealtimeMode) => this.setModalVisible(v, id, isRealtimeMode)}
                    />
                );
            }
        }

        // Add new card
        if (this.state.addingNewTask) {
            var programs = {allowed: 2, repeat: 0, id: null, day: moment().add(3, 'hours').format("D"), start_time: moment(new Date()).add(3, 'hours'), end_time: moment(new Date()).add(4, 'hours').add(1, 'hours').format("HH:mm:ss")};
            indents.push(
                <TaskManagerCard key={998}
                    programInformation={programs}
                    setLoading={(v) => this.setLoading(v)}
                    idZone={this.state.idZone}
                    bottomButtonText={this.props.actions.translate.get('taskManagerCard_add_program')}
                    onAdd={async (program) => {
                        this.state.emailVerificationSuccess=(uuid,code)=>{return this.addProgramer(program,uuid,code)}
                        this.state.emailVerificationFinalize=()=>{return this.props.actions.fliwerZoneActions.getZoneDataIrrigationPrograms(this.props.match.params.idZone)}
                        this.setState({emailVerificationNeeded: true})
                    }}
                    modalFunc={(v, id) => this.setState({addingNewTask: false})}
                />
            );

        }
        else {
            indents.push(
                <TaskManagerCard key={999}
                    programInformation={null}
                    idZone={this.state.idZone}
                    onPressAdd={()=> {
                        this.setState({addingNewTask: true});
                    }}
                />
            );
        }

        return indents;
    }

    getFliwerVerifyEmailModalGeneric() {

        return(
            <FliwerVerifyEmailModalGeneric
                visible={this.state.emailVerificationNeeded}
                onFinalize={() => {
                    if(this.state.emailVerificationFinalize){
                      this.state.emailVerificationFinalize().finally(()=>{
                        this.setState({emailVerificationNeeded: false, loading: false, addingNewTask: false});
                      })
                    }else{
                      this.setState({emailVerificationNeeded: false, loading: false, addingNewTask: false});
                    }
                }}
                loadingModal={false}
                email={this.props.data.email}
                setLoading={(v) => this.setLoading(v)}
                onAction={(uuid,code)=>{
                  return this.state.emailVerificationSuccess(uuid,code);
                }}
                onError={(err)=>{
                  if (err && err.reason)
                      toast.error(err.reason);
                  this.setState({loading: false});
                }}
                onSuccess={()=>{
                  this.setModalVisible(false, this.state.idIrrigationProgram, this.state.isRealtimeMode);
                }}
                onCancel={() => {
                  this.setState({emailVerificationNeeded: false,modalVisible:this.state.previousModalVisible?true:false});
                }}
            />
        );

    }

    addProgramer(program,uuid,code)
    {

        var that = this;

        this.setState({loading: true});

        if (program.isRealtimeMode) {
            return that.props.actions.sessionActions.addRealtimeProgram(program)
        }
        else {
            return that.props.actions.fliwerZoneActions.addZoneDataIrrigationPrograms(that.props.match.params.idZone, program, uuid,code)
        }

    }

    setModalVisible(visible, idIrrigationProgram, isRealtimeMode) {

        this.setState({modalVisible: visible,previousModalVisible:visible, idIrrigationProgram: idIrrigationProgram, isRealtimeMode: isRealtimeMode});
    }

    setLoading(v)
    {
        this.setState({loading: v})
    }


    deleteIrrigationProgram(uuid,code) {
      if (this.state.isRealtimeMode)
        return this.props.actions.sessionActions.deleteRealtimeProgram(this.state.idIrrigationProgram,uuid,code);
      else
        return this.props.actions.fliwerZoneActions.deleteIrrigationPrograms(this.props.match.params.idZone, this.state.idIrrigationProgram,uuid,code);
    }


    onUpdate(idZone,idProgram,programModified,onFinish) {

        this.state.emailVerificationSuccess=(uuid,code)=>{return this.updateProgram(idZone,idProgram,programModified,uuid,code)}
        this.state.emailVerificationFinalize=()=>{
            if(onFinish)onFinish();
            return this.props.actions.fliwerZoneActions.getZoneDataIrrigationPrograms(this.props.match.params.idZone)
        }
        this.setState({emailVerificationNeeded: true})
        //this.forceUpdate();
    }

    updateProgram(idZone,idProgram,programModified,uuid,code){
        return this.props.actions.fliwerZoneActions.modifyIrrigationProgram(idZone,idProgram,programModified,uuid,code);
    }

    nextGarden = () => {

        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() < this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return -1;
            } else if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() > this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return 1;
            } else {

                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else
                    return 0
            }

            return 0;
        });

        var zonesTable = Object.values(sortedZones).map((k) => {
            return k.idZone
        })
        var foundZoneId = zonesTable.findIndex(element => element == this.props.match.params.idZone);

        if (foundZoneId + 1 >= zonesTable.length)
            this.state.foundZoneId = zonesTable[0];
        else
            this.state.foundZoneId = zonesTable[foundZoneId + 1];

        this.setState({goNextGarden: true});
    }

    previousGarden = () => {
        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() < this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return -1;
            } else if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() > this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return 1;
            } else {
                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else
                    return 0
            }

            return 0;
        });

        var zonesTable = Object.values(sortedZones).map((k) => {
            return k.idZone
        })
        var foundZoneId = zonesTable.findIndex(element => element == this.props.match.params.idZone);

        if (foundZoneId - 1 < 0)
            this.state.foundZoneId = zonesTable[zonesTable.length - 1];
        else
            this.state.foundZoneId = zonesTable[foundZoneId - 1];

        this.setState({goNextGarden: true});
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        zoneData: state.fliwerZoneReducer.data,
        translation: state.languageReducer.translation,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        isGardener: state.sessionReducer.isGardener,
        preloadedData: state.sessionReducer.preloadedData,
        realTimePrograms: state.sessionReducer.realTimePrograms,
        data: state.sessionReducer.data
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

//Connect everything

var style = {
    collection: {
        marginBottom: 85
    },
    buttonBackContainer: {
        width: "100%",
        height: 55
    },
    textBack: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 30,
        textAlign: "center",
        color: "white"
    },
    buttonBack: {
        backgroundColor: "#555555",
        alignItems: "center",
        justifyContent: "center",
        flex: 1
    },
    ":hover": {

    }

};
if (Platform.OS == "WEB") {
    //styles.containerIn.flexShrink=1;
    //styles["@media (orientation:portrait)"].taskManagerContainer.paddingLeft="75%";

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, TaskManager)));
