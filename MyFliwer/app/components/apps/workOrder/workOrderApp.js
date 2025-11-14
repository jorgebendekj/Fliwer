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
import ImageBackground from '../../imageBackground.js'
import { withRouter } from '../../../utils/router/router';
import TemplateList from './templateList.js'
import WorkOrderList from './workOrderList.js';
import EmployeeAssignList from './employeeAssignList.js'
import WorkOrderSettings from './workOrderSettings.js';
import CoursePage from '../../fliwerAcademy/coursePage.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FliwerWrapper from '../../FliwerWrapper.js'

import * as ActionsLang from '../../../actions/languageActions.js'; //Import your actions
import * as ActionsWrapper from '../../../actions/wrapperActions.js'; //Import your actions
import * as ActionsAcademy from '../../../actions/academyActions.js'; //Import your actions 

import { FliwerColors, CurrentTheme } from '../../../utils/FliwerColors.js'

import { mediaConnect } from '../../../utils/mediaStyleSheet.js'
import { Redirect } from '../../../utils/router/router'

import background from '../../../assets/img/homeBackground.jpg'
import rainolveBackground from '../../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
//import fliwerIcon  from '../../assets/img/fliwer_icon_new.png'



import IconEntypo from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import FliwerSimpleTabView from '../../custom/FliwerSimpleTabView.js';

import Sync from '../../../assets/img/sync.gif'
import FrontLayerWrapper from '../../frontLayerWrapper.js';
import FliwerDeleteModal from '../../custom/FliwerDeleteModal.js';
import NewWorkOrderList from './NewWorkOrderList.js';




const components = {
    entypo: IconEntypo,
    ionic: IoniconsIcon,
    material: IconMaterialCommunityIcons,
    material1: IconMaterialIcons,
    fontawesome: IconFontAwesome
};

class WorkOrderApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            goToMainScreen: false,
            goToTemplates: false,
            goToWorkOrders: false,
            goToAssignTemplate2: false,
            goADDWorkOrder: null,
            lastDataLoaded: null,
            highlightedId: null,
            selectedTab: 0,
            isSwitchModeButtonInEditionModePosition: false,
            renderDeleteModal: false
        };

        this.gardenerHomesRef = React.createRef();
        this.props.actions.wrapperActions.setCurrentApp("workOrder");

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedTab !== this.state.selectedTab) {
            this.handleTabAction()
        }

        const { currentPath } = this.props;

        var orientation = this.state.mediaStyle.orientation == "landscape";
        const validPaths = ['/app/workOrder', '/app/workOrder/assignTemplate'];
        const isValidPath = validPaths.includes(currentPath);

        if (!orientation) {
            if (prevProps.currentPath !== currentPath) {
                if (isValidPath && this.props.portraitScreen == 2) {
                    this.props.actions.wrapperActions.setPortraitScreen(1);
                }
            }
        }

    }

    componentDidMount() {

        const { currentPath } = this.props;

        const isAssignTemplate = currentPath.includes('assignTemplate');

        if (isAssignTemplate) {
            this.setState({ forceTabSwitch: 1 })
        }
    }

    handleTabAction() {
        if (this.state.selectedTab === 0) {
            var goToMainScreen = false;
            switch (this.props.currentPath) {
                case '/app/workOrder/assignTemplate':
                case '/app/workOrder/assignTemplate/:idCourse/pages':
                case '/app/workOrder/assignTemplate/templates/:idCourse/pages':
                case '/app/workOrder/assignTemplate/templates/new':
                    //Move to devices
                    goToMainScreen = true;
                    break;
            }
            this.setState({ goToMainScreen: goToMainScreen });
        } else {
            var goToAssignTemplate = false;
            switch (this.props.currentPath) {
                case '/app/workOrder':
                case "/app/workOrder/in/:idCourse":
                    //Move to devices
                    goToAssignTemplate = true;
                    break;
            }
            this.setState({ goToAssignTemplate: goToAssignTemplate });
        }
    }


    setPortraitScreen(screen) {
        if (this.props.portraitScreen != screen) this.props.actions.wrapperActions.setPortraitScreen(screen);
    }

    renderDeleteModal() {
        if (this.state.renderDeleteModal) {
            //Render a delete Modal that ask in spanish if the user is new or already exist. The modal is inside the frontLayerWrapper
            let title = this.props.currentPath === "/app/workOrder/in/:idCourse" ? "¿Quieres borrar el parte de trabajo?" : "¿Quieres borrar la plantilla?"
            let template = this.props.currentPath !== "/app/workOrder/in/:idCourse"

            return (
                <FrontLayerWrapper key="renderDeleteWorkOrderAppNew">
                    <FliwerDeleteModal
                        visible={this.state.renderDeleteModal}
                        onClose={() => {
                            this.setState({ renderDeleteModal: false });
                        }}
                        onConfirm={async () => {
                            if (template) {
                                this.setState({ goToAssignTemplate2: true })
                                await this.props.actions.academyActions.deleteWorkOrderTemplate(this.props.match.params.idCourse);
                            } else {
                                this.setState({ goToWorkOrders: true })
                                await this.props.actions.academyActions.deleteWorkOrder(this.props.match.params.idCourse);
                            }
                            this.setState({ renderDeleteModal: false });
                        }}
                        title={title}
                        hiddeText={true}
                        password={false}
                        loadingModal={this.props.loading}
                    />
                </FrontLayerWrapper>
            );
        } else return [];
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
                <ImageBackground source={(!global.envVars.TARGET_RAINOLVE ? background : rainolveBackground)} resizeMode={"cover"}>
                    <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('hello') + " " + this.props.data.first_name} />
                    <FliwerLoading />
                    <View style={{ width: "100%", flex: 1 }}></View>
                    <MainFliwerMenuBar idZone={null} current={"map"} icons={icons} />
                </ImageBackground>
            );
        } else {
            //Only render a view with the two views inside, the primaryView and the secondary

            if (this.state.goToMainScreen) {
                this.state.goToMainScreen = false;
                redirects.push(<Redirect to="/app/workOrder" />);
            }

            if (this.state.goToTemplates) {
                this.state.goToTemplates = false;
                redirects.push(<Redirect to={"/app/workOrder/templates"} />);
            }

            if (this.state.goToAssignTemplate) {
                this.state.goToAssignTemplate = false;
                redirects.push(<Redirect to={"/app/workOrder/assignTemplate"} />);
            }

            if (this.state.goToAssignTemplate2) {
                this.state.goToAssignTemplate2 = false;
                redirects.push(<Redirect to={"/app/workOrder/assignTemplate"} />);
            }

            if (this.state.goToWorkOrders) {
                this.state.goToWorkOrders = false;
                redirects.push(<Redirect to={"/app/workOrder"} />);
            }

            if (this.state.goADDWorkOrder !== null) {
                redirects.push(<Redirect to={`/app/workOrder/in/${this.state.goADDWorkOrder}`} />);
                this.state.goADDWorkOrder = null;
            }

            //var orientation = this.state.mediaStyle.orientation == "landscape";
            var indents = [
                this.renderPrimaryView(),
                this.renderSecondaryView(),
                this.renderFilterMenu()
            ];




            return [
                <FliwerWrapper key={"fliwerWrapper"}>{indents}</FliwerWrapper>,
                redirects, this.renderDeleteModal()
            ]
        }

    }

    renderSecondaryView() {

        switch (this.props.currentPath) {
            case "/app/workOrder/in/:idCourse":
                return (
                    <CoursePage key={"WorkOrderPage-" + this.props.match.idCouse} match={this.props.match} asComponent={true} asWorkOrder={true} isEditionMode={this.state.isSwitchModeButtonInEditionModePosition} setIsUpdating={(value) => this.setState({ isUpdating: value })} isDeleting={this.state.isDeleting} setDeletingItem={(value) => this.setState({ deletingItem: value })} />
                )
            case '/app/workOrder/templates/:idCourse/pages':
                return (
                    <CoursePage key={"WorkOrderTemplatePage-" + this.props.match.idCouse} match={this.props.match} asComponent={true} asTemplate={true} isEditionMode={this.state.isSwitchModeButtonInEditionModePosition} setIsUpdating={(value) => this.setState({ isUpdating: value })} isDeleting={this.state.isDeleting} setDeletingItem={(value) => this.setState({ deletingItem: value })} />
                )
            case '/app/workOrder/templates/:idCourse':
                return (
                    <WorkOrderSettings key={"WorkOrderSettings-" + this.props.match.idCouse} match={this.props.match} asComponent={true} asTemplate={true} />
                )
            case '/app/workOrder/templates/new':
            case '/app/workOrder/assignTemplate/templates/new':
                return (
                    <WorkOrderSettings key={"WorkOrderSettings-new"} match={this.props.match} asComponent={true} asTemplate={true} fastCreate={true} />
                )
            case '/app/workOrder/assignTemplate/:idCourse/pages':
                return (
                    <CoursePage key={"WorkOrderTemplatePage-" + this.props.match.idCouse} match={this.props.match} asComponent={true} asTemplate={true} isEditionMode={this.state.isSwitchModeButtonInEditionModePosition} setIsUpdating={(value) => this.setState({ isUpdating: value })} isDeleting={this.state.isDeleting} setDeletingItem={(value) => this.setState({ deletingItem: value })} />
                )
            case '/app/workOrder/assignTemplate/templates/:idCourse/pages':
                return (
                    <CoursePage key={"WorkOrderTemplatePage-" + this.props.match.idCouse} match={this.props.match} asComponent={true} asTemplate={true} isEditionMode={this.state.isSwitchModeButtonInEditionModePosition} setIsUpdating={(value) => this.setState({ isUpdating: value })} isDeleting={this.state.isDeleting} setDeletingItem={(value) => this.setState({ deletingItem: value })} />
                )
            case '/app/workOrder/templates':
                return []
            default:
                return [];
        }
    }

    renderPrimaryView() {

        var indents = [];

        switch (this.props.currentPath) {
            case '/app/workOrder':
            case "/app/workOrder/in/:idCourse":
                indents.push(
                    <NewWorkOrderList
                        key={"WorkOrderList"}
                        match={this.props.match}
                        ref={this.templateListRef}
                        asComponent={true}
                        deletingItem={this.state.deletingItem}
                        enDeleteItem={() => this.setState({ deletingItem: null, isDeleting: false })}
                        goNewWorkOrder={(id) => this.setState({ goADDWorkOrder: id })}
                    />
                )
                break;
            //case '/app/workOrder/templates/:idCourse/pages':
            case '/app/workOrder/templates':
            case '/app/workOrder/templates/new':
            case '/app/workOrder/templates/:idCourse':
                indents.push(
                    <TemplateList key={"TemplateList"} ref={this.templateListRef} asComponent={true} />
                )
                break;

            case '/app/workOrder/assignTemplate':
            case '/app/workOrder/assignTemplate/:idCourse/pages':
            case '/app/workOrder/assignTemplate/templates/:idCourse/pages':
            case '/app/workOrder/assignTemplate/templates/new':
            case '/app/workOrder/templates/:idCourse/pages':
                indents.push(
                    <EmployeeAssignList key={"EmployeeAssignList"} match={this.props.match} ref={this.employeeAssignListRef} asComponent={true} currentPath={this.props.currentPath} deletingItem={this.state.deletingItem} enDeleteItem={() => this.setState({ deletingItem: null, isDeleting: false })} />
                )
                break;
            default:
                break;
        }

        return (
            <View style={{ height: '100%' }}>
                {this.renderSubMenu()}
                {indents}
            </View>
        )
    }

    createdByMe() {

        var createdByMe = false;

        if (this.state.course && this.state.course.creator) {
            if (this.state.course.creator.idUser) {
                if (this.props.sessionData && this.state.course.creator.idUser == this.props.sessionData.idUser) {
                    createdByMe = true;
                }

            }
        } else {//si no tinc el creator significa que l'estic creant
            createdByMe = true;
        }

        return createdByMe;
    }

    hasPermissionToEdit() {
        if (this.props.asWorkOrder) {
            //Only has permission if it's the creator
            var course = this.state.course;
            return (course && this.props.sessionData && course.creator.idUser == this.props.sessionData.idUser);
        } else return (this.props.roles.fliwer || (this.props.roles.angel && this.createdByMe()) || this.createdByMe());
    }

    isEditionMode() {
        if (!this.hasPermissionToEdit()) {
            return false;
        }

        return this.state.isSwitchModeButtonInEditionModePosition;

    }

    renderSwitchModeButtons() {

        switch (this.props.currentPath) {
            case "/app/workOrder/in/:idCourse":
            case '/app/workOrder/assignTemplate/:idCourse/pages':
            case '/app/workOrder/assignTemplate/templates/:idCourse/pages':
            case '/app/workOrder/templates/:idCourse/pages':
                return (
                    <>
                        <TouchableOpacity
                            style={[this.style.switchModeButton]}
                            activeOpacity={1}
                            onPress={() => {
                                this.setState({ isSwitchModeButtonInEditionModePosition: !this.state.isSwitchModeButtonInEditionModePosition });
                            }}
                            disabled={!this.state.isSwitchModeButtonInEditionModePosition}
                        >
                            <IconFontAwesome name="eye" size={30} style={{ color: !this.state.isSwitchModeButtonInEditionModePosition ? CurrentTheme.acceptColor : CurrentTheme.primaryText }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[this.style.switchModeButton]}
                            activeOpacity={1}
                            onPress={() => {
                                this.setState({ isSwitchModeButtonInEditionModePosition: !this.state.isSwitchModeButtonInEditionModePosition });
                            }}
                            disabled={this.state.isSwitchModeButtonInEditionModePosition}
                        >
                            <IconFontAwesome name="edit" size={30} style={{ color: this.state.isSwitchModeButtonInEditionModePosition ? CurrentTheme.acceptColor : CurrentTheme.primaryText }} />
                        </TouchableOpacity>
                    </>
                )
            default:
                return [];
        }
    }

    renderDeleteButton() {
        switch (this.props.currentPath) {
            case "/app/workOrder/in/:idCourse":
            case '/app/workOrder/assignTemplate/:idCourse/pages':
            case '/app/workOrder/assignTemplate/templates/:idCourse/pages':
            case '/app/workOrder/templates/:idCourse/pages':
                return (
                    <TouchableOpacity
                        style={[this.style.switchModeButton]}
                        activeOpacity={1}
                        onPress={() => {
                            this.setState({ renderDeleteModal: true });
                        }}
                    >
                        <IconFontAwesome name="trash-o" size={30} style={{ color: CurrentTheme.primaryText }} />
                    </TouchableOpacity>
                )
            default:
                return [];
        }
    }

    renderSyncButton() {
        switch (this.props.currentPath) {
            case "/app/workOrder/in/:idCourse":
            case '/app/workOrder/assignTemplate/:idCourse/pages':
            case '/app/workOrder/assignTemplate/templates/:idCourse/pages':
            case '/app/workOrder/templates/:idCourse/pages':

                return (
                    <TouchableOpacity
                        style={[this.style.switchModeButton, { opacity: this.state.isUpdating ? 0.5 : 1 }]}
                        activeOpacity={1}
                        onPress={() => {
                            this.setState({ isUpdating: !this.state.isUpdating });
                        }}
                        disabled
                    >
                        {
                            this.state.isUpdating
                                ?
                                <Image source={Sync} style={{ width: 30, height: 30, borderRadius: 10 }} resizeMode={"contain"} />
                                :
                                <IoniconsIcon name="cloud-done-outline" size={30} style={{ color: CurrentTheme.primaryText }} />
                        }
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
                    justifyContent: orientation ? "flex-start" : "space-around",
                    paddingTop: orientation ? 20 : 0,
                    alignItems: "center",
                    backgroundColor: orientation ? CurrentTheme.filterMenu : CurrentTheme.filterMenu,
                    gap: '15px'
                }}
            >
                {this.renderSwitchModeButtons()}
                {this.renderSyncButton()}
                {this.renderDeleteButton()}
            </View>
        )
    }

    renderSubMenu() {

        return (
            <View style={{ width: "100%", height: 40, display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: CurrentTheme.primaryColor }}>

                <FliwerSimpleTabView
                    style={{ height: "auto" }}
                    selectedTabTextStyle={{ color: "white" }}
                    headerStyle={{ backgroundColor: CurrentTheme.secondaryColor }}
                    tabTextStyle={{ color: CurrentTheme.primaryText }}
                    selectedTabContainerStyle={{ backgroundColor: CurrentTheme.complementaryColor }}
                    setSelectedTab={(tab) => {
                        this.setState({ selectedTab: tab })
                    }}
                    forceTabSwitch={this.state.forceTabSwitch}
                    resetTabSwitch={() => this.setState({ forceTabSwitch: 0 })}
                    workOrderApp={true}
                >
                    <Text
                        title={this.props.actions.translate.get('Academy_work_order').toUpperCase()}
                    />
                    <Text
                        title={this.props.actions.translate.get('Academy_templates')}
                    />
                </FliwerSimpleTabView>
            </View>
        )
    }

    //renderFilterMenuItem(iconProvider,icon,onPress,size=30,style){
    renderFilterMenuItem(title = '', onPress) {

        //const SpecificIcon = components[iconProvider];
        return (
            <TouchableOpacity style={[{ height: 70, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }]} onPress={() => {
                if (onPress) onPress();
            }}>
                <Text style={{ padding: 10, color: CurrentTheme.primaryText, fontFamily: FliwerColors.fonts.title, textAlign: "center", fontSize: 18 }}>{title}</Text>
                {/* {iconProvider?
                    (
                        <SpecificIcon name={icon} style={[{fontSize:size,color:CurrentTheme.primaryText}]}/>
                    ):
                    (
                        <Image resizeMode={"contain"} source={icon} style={[{width: size, height: size},style?style:{}]}/>
                    )
                } */}
            </TouchableOpacity>
        )
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        data: state.sessionReducer.data,
        portraitScreen: state.wrapperReducer.portraitScreen,
        roles: state.sessionReducer.roles,
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch),
            academyActions: bindActionCreators(ActionsAcademy, dispatch),
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
        }
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
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, WorkOrderApp)));