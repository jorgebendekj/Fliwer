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

import MainFliwerTopBar from '../../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../../mainFliwerMenuBar.js'
import FliwerLoading from '../../fliwerLoading.js'
import HomeGardenerCard from '../../gardener/homeGardenerCard.js'
import CardCollection from '../../custom/cardCollection.js'
import ImageBackground from '../../imageBackground.js'
import { withRouter } from '../../../utils/router/router';
import FliwerDeleteModal from '../../custom/FliwerDeleteModal.js'
import FliwerContractsModalWarning from '../../custom/FliwerContractsModalWarning.js'
import FliwerVerifyPhoneModal from '../../custom/FliwerVerifyPhoneModal.js'
import FliwerGreenButton from '../../custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../../custom/FliwerUpdateAppModal.js'
import GardenerHomes from '../../gardener/gardenerHomes.js'
import GardenerHomesMap from '../../gardener/gardenerHomesMap.js'
import ZoneInfo from '../../zones/zoneInfo.js'
import Devices from '../../devices/devices.js'
import ControlValves from '../../devices/controlValves.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FliwerWrapper from '../../FliwerWrapper.js'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
//import BusinessEmployers from '../../business/businessEmployers.js'
import BusinessClients from '../../business/businessClients.js'

import * as Actions from '../../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../../actions/languageActions.js'; //Import your actions
import * as ActionsHome from '../../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../../actions/createZoneActions.js'; //Import your actions
import * as ActionsModifyZone from '../../../actions/modifyZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionGardener from '../../../actions/gardenerActions.js'; //Import your actions
import * as ActionVisitor from '../../../actions/visitorActions.js'; //Import your actions
import * as ActionAcademy from '../../../actions/academyActions.js'; //Import your actions
import * as ActionPoly from '../../../actions/polyActions.js';
import * as ActionInvoice from '../../../actions/invoiceActions.js';
import * as ActionsWrapper from '../../../actions/wrapperActions.js'; //Import your actions

import { uniqueStorage } from '../../../utils/uniqueStorage/uniqueStorage';
import { toast } from '../../../widgets/toast/toast'
import Modal from '../../../widgets/modal/modal'
import ClientObjectModal from '../../gardener/ClientObjectModal.js'
import { FliwerColors, CurrentTheme } from '../../../utils/FliwerColors.js'
import { FliwerStyles } from '../../../utils/FliwerStyles.js'
import { FliwerCommonUtils } from '../../../utils/FliwerCommonUtils.js'

import { mediaConnect } from '../../../utils/mediaStyleSheet.js'
import { Redirect } from '../../../utils/router/router'

import background from '../../../assets/img/homeBackground.jpg'
import rainolveBackground from '../../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton from '../../../assets/img/add.png'
import mapButton from '../../../assets/img/map.png'
import homeIcon from '../../../assets/img/map.png'
import sensorIcon from '../../../assets/img/tintable_sensor_icon.png'
import fliwerIcon from '../../../assets/img/fliwer_icon_new.png'
//import fliwerIcon  from '../../assets/img/fliwer_icon_new.png'


import IconEntypo from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

import Sync from '../../../assets/img/sync.gif'


import { DocumentPicker } from '../../../utils/uploadFile/uploadFile'
import WorkersDetails from '../../workerDetail/WorkersDetails.js';


const components = {
    entypo: IconEntypo,
    ionic: IoniconsIcon,
    material: IconMaterialCommunityIcons,
    fontawesome: IconFontAwesome
};

class FliwerApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            goToMainScreen: false,
            goToDevices: false,
            goToParameters: false,
            primaryViewPercentageLandscape: 75,
            primaryViewPercentagePortrait: 70,
            sectionSelected: 0,
            highlightedId: null,
        };

        this.gardenerHomesRef = React.createRef();
        this.props.actions.wrapperActions.setCurrentApp("clients");

    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentPath } = this.props;

        var orientation = this.state.mediaStyle.orientation == "landscape";
        const validPaths = ['/app/clients'];
        const isValidPath = validPaths.includes(currentPath);

        if (!orientation) {
            if (prevProps.currentPath !== currentPath) {
                if (isValidPath && this.props.portraitScreen == 2) {
                    this.props.actions.wrapperActions.setPortraitScreen(1);
                }
            }
        }
    }

    calculateMainMenu() {
        //if landscape
        if (this.state.mediaStyle.orientation == "landscape") {
            return {
                width: 200,
                height: "100%"
            };
        } else {
            //Same but with height
            return {
                width: "100%",
                height: 100
            }
        }
    }

    calculatePrimaryView() {
        //if landscape
        if (this.state.mediaStyle.orientation == "landscape") {
            //Get the width of the screen and substract 10px, then apply primaryViewPercentage over the result
            const screenWidth = Dimensions.get('window').width - 270;
            const primaryViewWidth = screenWidth * (this.state.primaryViewPercentageLandscape / 100);
            return {
                width: (screenWidth - primaryViewWidth),
                minWidth: 370,
                height: "100%"
            };
        } else {
            //Same but with height
            return {
                width: "100%",
                height: 250
            }
        }
    }

    calculateSecondaryView() {
        //if landscape
        if (this.state.mediaStyle.orientation == "landscape") {
            //Get the width of the screen and substract 10px, then apply primaryViewPercentage over the result
            const screenWidth = Dimensions.get('window').width - 270;
            const primaryViewWidth = screenWidth * (this.state.primaryViewPercentageLandscape / 100);

            return {
                maxWidth: (primaryViewWidth),
                flexGrow: 1,
                height: "100%"
            };
        } else {
            return {
                width: "100%"
            }
        }
    }

    calculateFilterMenu() {
        //if landscape
        if (this.state.mediaStyle.orientation == "landscape") {
            return {
                width: 70,
                height: "100%"
            };
        } else {
            //Same but with height
            return {
                width: "100%",
                height: 70
            }
        }
    }

    render() {
        /*
            The new screen has a split screen between two views: main (screen) and secondary (selector). 
            The primary goest in the left. The division should be pressable to change the size of the views.
        */
        var icons = [
            "gardener",
            "zone", "files", "academy"];

        var redirects = [];

        if (this.state.loading) {

            return (
                <ImageBackground style={{ backgroundColor: CurrentTheme.secondaryColor }} resizeMode={"cover"}>
                    <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('hello') + " " + this.props.data.first_name} />
                    <FliwerLoading />
                    <View style={{ width: "100%", flex: 1 }}></View>
                    <MainFliwerMenuBar idZone={null} current={"map"} icons={icons} />
                </ImageBackground>
            );
        } else {
            //Only render a view with the two views inside, the primaryView and the secondary

            if (this.state.resetView) {
                redirects.push(<Redirect push to={"/app/clients"} />)
                this.state.resetView = false;
            }

            if (this.state.goWorkerDetails) {
                redirects.push(<Redirect push to={`/app/clients/details/${this.state.goWorkerDetails}`} />)
                this.state.goWorkerDetails = false;
                if (this.state.mediaStyle.orientation != "landscape") {
                    this.props.actions.wrapperActions.setPortraitScreen(2);
                }
            }


            var indents = [
                this.renderPrimaryView(),
                this.renderSecondaryView(),
                this.renderFilterMenu()
            ];

            return [
                <FliwerWrapper key={"fliwerWrapper"}>{indents}</FliwerWrapper>, redirects
            ]
        }

    }

    renderMenuItem(iconProvider, icon, text, onPress, size = 30, style) {

        const SpecificIcon = components[iconProvider];
        return (
            <TouchableOpacity style={[{ width: "100%", height: 70, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", paddingLeft: 10 }]} onPress={() => {
                if (onPress) onPress();
            }}>
                {iconProvider ?
                    (
                        <SpecificIcon name={icon} style={[{ fontSize: size, color: CurrentTheme.primaryText }]} />
                    ) :
                    (
                        <Image resizeMode={"contain"} source={icon} style={[{ width: size, height: size }, style ? style : {}]} />
                    )
                }
                <Text style={{ position: "absolute", color: CurrentTheme.primaryText, left: 60, fontSize: 20, fontFamily: FliwerColors.fonts.title }}>{text}</Text>
            </TouchableOpacity>
        )
    }


    renderSecondaryView() {
        switch (this.props.currentPath) {
            case "/app/clients/details/:idWorker":
                return (
                    <WorkersDetails
                        key={"WorkersDetails-" + this.props.match.params.idWorker}
                        idWorker={this.props.match.params.idWorker}
                        setIsUpdating={(value) => this.setState({ isUpdating: value })}
                        isEditing={this.state.isEditing}
                        resetEditing={() => this.setState({ isEditing: false })}
                        isDeleting={this.state.isDeleting}
                        setDeletingItem={(item) => this.setState({ deletingItem: item })}
                        resetDeleting={() => this.setState({ isDeleting: false, deletingItem: null })}
                        mobile={this.state.mediaStyle.orientation == "landscape"}
                        onCreateSucces={(idWorker) => this.setState({ goWorkerDetails: idWorker })}
                    />
                )
            default:
                return [];
        }
    }

    renderPrimaryView() {
        //console.log('primary')
        return <BusinessClients
            key={'BusinessClients'}
            deletingItem={this.state.deletingItem}
            resetDeleting={() => this.setState({ isDeleting: false, deletingItem: null, resetView: true })}
            match={this.props.match}
        />
    }

    renderEditButton() {
        if (this.props.match.params.idWorker == this.props.data.user_id) {
            return []
        }
        switch (this.props.currentPath) {
            case "/app/clients/details/:idWorker":
                return (
                    <TouchableOpacity
                        style={[this.style.switchModeButton]}
                        activeOpacity={1}
                        onPress={() => {
                            this.setState({ isEditing: !this.state.isEditing })
                        }}
                    >
                        <IconFontAwesome name={this.state.isEditing ? "close" : "pencil"} size={30} style={{ color: "white" }} />
                    </TouchableOpacity>
                )
            default:
                return [];
        }
    }

    renderSyncButton() {
        if (this.props.match.params.idWorker == this.props.data.user_id) {
            return []
        }
        switch (this.props.currentPath) {
            case "/app/clients/details/:idWorker":
                return (
                    <TouchableOpacity
                        style={[this.style.switchModeButton, { opacity: this.state.isUpdating ? 0.5 : 1 }]}
                        activeOpacity={1}
                        disabled
                    >
                        {
                            this.state.isUpdating
                                ?
                                <Image source={Sync} style={{ width: 30, height: 30, borderRadius: 10 }} resizeMode={"contain"} />
                                :
                                <IoniconsIcon name="cloud-done-outline" size={30} style={{ color: "white" }} />
                        }
                    </TouchableOpacity>
                )
            default:
                return [];
        }
    }

    renderDeleteButton() {
        if (this.props.match.params.idWorker == 'create' || this.props.match.params.idWorker == this.props.data.user_id) {
            return []
        }
        switch (this.props.currentPath) {
            case "/app/clients/details/:idWorker":
                return (
                    <TouchableOpacity
                        style={[this.style.switchModeButton]}
                        activeOpacity={1}
                        onPress={() => {
                            this.setState({ isDeleting: true })
                        }}
                    >
                        <IconFontAwesome name="trash-o" size={30} style={{ color: "white" }} />
                    </TouchableOpacity>
                )
            default:
                return [];
        }
    }

    renderFilterMenu() {

        var orientation = this.state.mediaStyle.orientation == "landscape";

        return (
            <View
                style={{
                    flex: orientation ? 1 : 0,
                    display: "flex",
                    flexDirection: orientation ? "column" : "row",
                    justifyContent: orientation ? "space-between" : "space-between",
                    paddingTop: orientation ? 20 : 0,
                    alignItems: "center",
                    backgroundColor: orientation ? CurrentTheme.filterMenu : CurrentTheme.secondaryColor,
                    gap: '15px'
                }}
            >
                <View
                    style={{
                        flex: 0,
                        display: "flex",
                        flexDirection: orientation ? "column" : "row",
                        justifyContent: orientation ? "space-between" : "space-around",
                        paddingTop: orientation ? 20 : 0,
                        alignItems: "center",
                        backgroundColor: orientation ? CurrentTheme.filterMenu : CurrentTheme.secondaryColor,
                        gap: '15px'
                    }}
                >
                    {this.renderSyncButton()}
                    {this.renderEditButton()}
                </View>
                <View
                    style={{
                        marginBottom: 10
                    }}
                >
                    {this.renderDeleteButton()}
                </View>
            </View>
        )
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
        homeData: state.fliwerHomeReducer.data,
        portraitScreen: state.wrapperReducer.portraitScreen
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
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch)
        }
    };
}

//Connect everything
var styles = {
    mainDualViewBar: {
        width: 60,
        height: "100%",
        backgroundColor: FliwerColors.secondary.black,
        paddingTop: 20,
        display: "flex",
        alignItems: "center",
    },
    mainDualViewBarIcon: {
        width: 45,
        height: 45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 45,
        marginBottom: 20
    },
    mainDualViewBarIconSelected: {
        backgroundColor: FliwerColors.primary.green,
    },
    dualViewContainer: {
        flex: 1,
        flexDirection: "row",
    },
    dualViewContainerScroll: {
        justifyContent: "center",
        alignItems: "center",
    },
    primaryView: {
    },
    secondaryView: {
    },
    separator: {
        height: "100%",
        width: 0,//10,
        backgroundColor: FliwerColors.gray,
    },
    mainDualViewSeparator: { height: 1, width: "80%", backgroundColor: "white", marginBottom: 20 },
    "@media (orientation:portrait)": {
        separator: {
            height: 0,
            width: "100%",
        },
        dualViewContainer: {
            flexDirection: "column",
            flexGrow: 1
        },
        dualViewContainerScroll: {
            flexDirection: "column",
            flexGrow: 1
        },
        primaryView: {
            flex: 1,
            flexGrow: 1
        },
        mainDualViewBar: {
            width: "100%",
            height: 54,
            flexDirection: "row",
            paddingTop: 0
        },
        mainDualViewBarIcon: {
            marginLeft: 10,
            marginRight: 10,
            marginBottom: 0,
        },
        mainDualViewSeparator: {
            height: "80%",
            width: 1,
            marginBottom: 0,
            marginLeft: 10,
            marginRight: 10
        },
        switchModeButton: {
            width: 50,
            height: 50,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
        },
        ":hover": {
            switchModeButton: {
                opacity: 1
            },
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(mediaConnect(styles, FliwerApp)));