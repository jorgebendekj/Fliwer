'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
    PanResponder,
    Animated,
    Dimensions
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading.js'
import CardCollection from '../custom/cardCollection.js'
import FliwerTwoPanelInput from '../custom/FliwerTwoPanelInput.js'
import ImageBackground from '../imageBackground.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerContractsModalWarning from '../custom/FliwerContractsModalWarning.js'
import FliwerVerifyPhoneModal from '../custom/FliwerVerifyPhoneModal.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../custom/FliwerUpdateAppModal.js'
import GardenerHomesMap from '../gardener/gardenerHomesMap.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsModifyZone from '../../actions/modifyZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions
import * as ActionVisitor from '../../actions/visitorActions.js'; //Import your actions
import * as ActionAcademy from '../../actions/academyActions.js'; //Import your actions
import * as ActionPoly from '../../actions/polyActions.js';
import * as ActionInvoice from '../../actions/invoiceActions.js';

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import { toast } from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import ClientObjectModal from '../gardener/ClientObjectModal.js'
import { FliwerColors } from '../../utils/FliwerColors.js'
import { FliwerStyles } from '../../utils/FliwerStyles.js'
import { FliwerCommonUtils } from '../../utils/FliwerCommonUtils.js'


import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton from '../../assets/img/add.png'
import mapButton from '../../assets/img/map.png'

import { Orientation } from '../../utils/orientation/orientation'


import { DocumentPicker } from '../../utils/uploadFile/uploadFile'

class HomeAppCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            onPress: ()=>{},
            title: "",
            icon: null,
            background: FliwerColors.primary.green,
        };
        
        this.setAppCard();

    }

    componentDidUpdate (prevProps) {
        if(this.props.title!=prevProps.title){
            this.setAppCard();
            this.forceUpdate();
        }
    }

    setAppCard(){
        var params={
            onPress: ()=>{},
            title: "",
            icon: null,
            background:FliwerColors.primary.gray
        }

        switch(this.props.title){ 
            case "Gardens":
                params.onPress=()=>{console.log("Gardens")}
                params.title="Gardens";
                params.icon=<Icon2 name="flower" size={60} color={"white"} />
                params.background=FliwerColors.primary.green
            break;
            default:
                params.title=this.props.title
            break;
        }

        this.state.onPress=params.onPress;
        this.state.title=params.title;
        this.state.icon=params.icon;
        this.state.background=params.background;
    }


    render() {
        /*
        The idea is to have in a scroll view, a top section with the user photo and a message with "Welcome," at top of the photo, and "User name" at the bottom of the photo- All of this section with a background Image and a search bar.
        */

        /*
                <MainFliwerTopBar showTextBar={true} title={
                    this.props.actions.translate.get('hello') + " " +
                    this.props.data.first_name + ", " +
                    this.props.actions.translate.get('Gardener_you_are_caring').toLowerCase() + ":"} />
        */


        
        return (
            <TouchableOpacity style={[this.style.container ]} onPress={this.state.onPress}>
                <View style={[this.style.iconContainer,{backgroundColor: this.state.background}]}>
                    {this.state.icon}
                </View>
                <Text style={this.style.title}>{this.state.title}</Text>
            </TouchableOpacity>
        );

    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        data: state.sessionReducer.data,
        preloadedData: state.sessionReducer.preloadedData,
        language: state.languageReducer.language,
        translation: state.languageReducer.translation,
        gardensOnCare: state.gardenerReducer.gardenerHomes,
        usersListData: state.gardenerReducer.usersListData,
        allowRefreshGardenerHomes: state.gardenerReducer.allowRefreshGardenerHomes,
        gardenerVisitorHomes: state.gardenerReducer.gardenerVisitorHomes,
        gardenerVisitorUsers: state.gardenerReducer.gardenerVisitorUsers,
        visitorsListData: state.visitorReducer.usersListData,
        visitorHomeList: state.visitorReducer.visitorHomes,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
        roles: state.sessionReducer.roles,
        phoneVerificationIsCancelled: state.sessionReducer.phoneVerificationIsCancelled,
        petition: state.sessionReducer.petition,
        versionCode: state.sessionReducer.versionCode,
        versionName: state.sessionReducer.versionName,
        forceUpdateApp: state.sessionReducer.forceUpdateApp,
        checkedVersion: state.sessionReducer.checkedVersion,
        lastCheckedVersionTime: state.sessionReducer.lastCheckedVersionTime,
        checkGardeneridHome: state.sessionReducer.gardenerCheckidHome,
        invitationChecked: state.academyReducer.invitationChecked,
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
            fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch),
            modifyZoneActions: bindActionCreators(ActionsModifyZone, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
            fliwerVisitorActions: bindActionCreators(ActionVisitor, dispatch),
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            invoiceActions: bindActionCreators(ActionInvoice, dispatch),
            polyActions: bindActionCreators(ActionPoly, dispatch),
        }
    };
}

//Connect everything
var styles = {
    container: {
        width: 100,
        height: 110,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title:{
        color:"white",
        marginTop:5,
        fontSize: 15
    },
    iconContainer:{
        width: 80,
        height: 80,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent:'center',
        borderRadius: 10
    },
    ":hover": {
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, HomeAppCard));
