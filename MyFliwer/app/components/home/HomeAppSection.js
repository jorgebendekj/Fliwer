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

class HomeAppSection extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            searchInput: "",
        };

    }
    render() {
        const {children, style,title} = this.props;

        return (
            <View style={[this.style.container, style]}>
                <Text style={this.style.title}>{title}</Text>
                <View style={this.style.content}>
                    {children}
                </View>
            </View>
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
        width: "100%",
    },
    title:{
        color:"white",
        marginLeft:20,
        marginTop:15,
        marginBottom:5,
        fontFamily:FliwerColors.fonts.title,
        fontSize:18
    },
    content:{
        display:"flex",
        flexDirection:"row",
        flexWrap:"wrap",
    },
    ":hover": {
        viewAcademy: {
            backgroundColor: FliwerColors.complementary.skyblue
        },
        viewMap: {
            backgroundColor: "#D1D1D1"
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, HomeAppSection));
