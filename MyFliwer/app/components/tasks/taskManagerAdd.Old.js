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
import Icon from 'react-native-vector-icons/Entypo';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../widgets/toast/toast'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect,withRouter } from '../../utils/router/router'

import icofliwer  from '../../assets/img/Icofliwer.png'
import searchIco  from '../../assets/img/9_serch.png'

import background  from '../../assets/img/zoneBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

import moment from 'moment';


class TaskManagerAdd extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idZone: this.props.match.params.idZone,
            loading: false,
            added: false,
            goTaskManager: false,

        };
    }

    async addProgramer(program)
    {
        this.setState({loading: true});
        await this.props.actions.fliwerZoneActions.addZoneDataIrrigationPrograms(this.props.match.params.idZone, program).then(() => {
            this.setState({loading: false});
            this.setState({added: true});
        }, (err) => {
            if (err.reason)
                toast.error(err.reason);
            this.setState({loading: false});
        })

    }

    setLoading(v)
    {
        this.setState({loading: v})
    }

    goBackPressed()
    {

        return () => {

            this.setState({goTaskManager: true})

        }
    }

    render()
    {

        if (this.state.added)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/taskManager/"} />)
        else if (this.state.goTaskManager)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/taskManager/"} />)
        else
        {
            var zone = this.props.zoneData[this.state.idZone];

            var topIcons = [];
            var bottomIcons = [];
            topIcons.push("params", "devices", "history", "plants");
            if (this.props.isGardener)
                bottomIcons.push("gardener");
            bottomIcons.push("zone", "files");

            return (
                    <ImageBackground source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"} loading={this.state.loading} >
                        <MainFliwerTopBar showTextBar={true} title={zone ? zone.name : null}/>
                        <MainFliwerMenuBar idZone={this.state.idZone} current={"task-manager-add"} icons={topIcons} position={"top"} />
                        <ScrollView scrollEventThrottle={1000} style={{flex: 1}}>
                            {this.renderTopBar()}
                            <CardCollection style={this.style.collection}>
                                {this.renderTaskManager()}
                            </CardCollection>
                        </ScrollView>
                        <MainFliwerMenuBar idZone={this.state.idZone} current={"task-manager-add"} icons={bottomIcons} />
                    </ImageBackground>
                    );
        }
    }

    renderTopBar()
    {
        return(
                <View style={[this.style.barContainer, Platform.OS == "android" || Platform.OS == 'ios' ? {height: 34} : {}]}>
                    <View style={this.style.arrowBackContainer}>
                        {this.renderBackArrow()}
                    </View>

                </View>
                )
    }

    renderBackArrow() {
        var indents = []

        indents.push(
                <TouchableOpacity style={[{}]} onPress={this.goBackPressed()}>
                    <Icon name="chevron-left" size={30} style={[{}]}></Icon>
                </TouchableOpacity>
                )

        return indents;
    }

    renderTaskManager()
    {
        var indents = [];

        //debugger;

//oftenIrrigateOptions[0]={label:this.props.actions.translate.get('taskManagerCard_onetime'),value:0}


        var programs = {};
        programs = {allowed: 2, repeat: 0, id: null, day: moment().add(3, 'hours').format("D"), start_time: moment(new Date()).add(3, 'hours'), end_time: moment(new Date()).add(4, 'hours').add(1, 'hours').format("HH:mm:ss")}

        //console.log("mintime add: ",moment(this.state.minStartTime).toDate());
        //console.log("maxtime  add: ",moment(this.state.maxStartTime).toDate());

        indents.push(<TaskManagerCard idZone={this.props.match.params.idZone} bottomButtonText={this.props.actions.translate.get('taskManagerCard_add_program')} programInformation={programs} setLoading={(v) => this.setLoading(v)} onAdd={async (program) => await this.addProgramer(program)}/>)

        return indents;
    }

}
;


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        isGardener: state.sessionReducer.isGardener,
        zoneData: state.fliwerZoneReducer.data,
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

        }
    }
}

//Connect everything

var style = {
    collection: {
        marginBottom: 85
    },
    barContainer: {
        height: 35,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1,
        width: "100%",
        backgroundColor: "rgb(240,240,240)",
        justifyContent: "flex-start",
        //paddingTop: 10,
    },

};
if (Platform.OS == "WEB") {
    //styles.containerIn.flexShrink=1;
    //styles["@media (orientation:portrait)"].taskManagerContainer.paddingLeft="75%";

}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, TaskManagerAdd)));
