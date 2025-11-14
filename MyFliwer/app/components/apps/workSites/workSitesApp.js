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
import { withRouter  } from '../../../utils/router/router';
import FliwerDeleteModal from '../../custom/FliwerDeleteModal.js'
import FliwerContractsModalWarning from '../../custom/FliwerContractsModalWarning.js'
import FliwerVerifyPhoneModal from '../../custom/FliwerVerifyPhoneModal.js'
import FliwerGreenButton from '../../custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../../custom/FliwerUpdateAppModal.js'
import GardenerHomes from '../../gardener/gardenerHomes.js'
import GardenerHomesMap from '../../gardener/gardenerHomesMap.js'
import ZoneInfo from '../../zones/zoneInfo.js'
import Devices from '../../devices/devices'
import ControlValves from '../../devices/controlValves'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import FliwerWrapper from '../../FliwerWrapper.js'
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

import * as ActionsLang from '../../../actions/languageActions.js'; //Import your actions
import * as ActionsWrapper from '../../../actions/wrapperActions.js'; //Import your actions

import { uniqueStorage } from '../../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../../widgets/toast/toast'
import Modal from '../../../widgets/modal/modal'
import ClientObjectModal from '../../gardener/ClientObjectModal.js'
import {FliwerColors,CurrentTheme} from '../../../utils/FliwerColors.js'
import {FliwerStyles} from '../../../utils/FliwerStyles.js'
import {FliwerCommonUtils} from '../../../utils/FliwerCommonUtils.js'

import {mediaConnect} from '../../../utils/mediaStyleSheet.js'
import { Redirect } from '../../../utils/router/router'

import background from '../../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton  from '../../../assets/img/add.png'
import mapButton  from '../../../assets/img/map.png'
import homeIcon  from '../../../assets/img/map.png'
import sensorIcon  from '../../../assets/img/tintable_sensor_icon.png'
import fliwerIcon  from '../../../assets/img/fliwer_icon_new.png'
//import fliwerIcon  from '../../assets/img/fliwer_icon_new.png'


import IconEntypo from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import FliwerSimpleTabView from '../../custom/FliwerSimpleTabView.js';


import {DocumentPicker} from '../../../utils/uploadFile/uploadFile'


const components = {
    entypo: IconEntypo,
    ionic: IoniconsIcon,
    material:IconMaterialCommunityIcons,
    fontawesome:IconFontAwesome
};

class WorkSitesApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            goToMainScreen:false,
            goToDevices:false,
            goToParameters:false,
            primaryViewPercentageLandscape:75,
            primaryViewPercentagePortrait:70,
            sectionSelected:0,
            mode:"homes",
            highlightedId:null,
            idZone:null,
        };

        this.gardenerHomesRef = React.createRef();
        this.props.actions.wrapperActions.setCurrentApp("workSites");
        this.map=null;
    }

    setPortraitScreen(screen){
        if(this.props.portraitScreen!=screen)this.props.actions.wrapperActions.setPortraitScreen(screen);
    }

    render(){
        /*
            The new screen has a split screen between two views: main (screen) and secondary (selector). 
            The primary goest in the left. The division should be pressable to change the size of the views.
        */
        var icons = [
            "gardener",
            "zone", "files", "academy"];

        var redirects=[];

        if (this.state.loading) {

            return (
                    <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"}>
                        <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('hello') + " " + this.props.data.first_name} />
                        <FliwerLoading/>
                        <View style={{width: "100%", flex: 1}}></View>
                        <MainFliwerMenuBar idZone={null} current={"map"} icons={icons} />
                    </ImageBackground>
                    );
        } else{
            //Only render a view with the two views inside, the primaryView and the secondary

            if(this.state.goToMainScreen){
                this.setState({goToMainScreen:false});
                redirects.push(<Redirect to="/app/workSites" />);
            }

            if(this.state.goToDevices && (this.props.match.params.idZone || this.state.idZone)){
                this.setState({goToDevices:false});
                redirects.push(<Redirect to={"/app/workSites/devices/"+(this.props.match.params.idZone?this.props.match.params.idZone:this.state.idZone)} />);
                this.state.idZone=null;
            }

            if(this.state.goToParameters && (this.props.match.params.idZone || this.state.idZone)){
                this.setState({goToParameters:false});
                redirects.push(<Redirect to={"/app/workSites/zone/"+(this.props.match.params.idZone?this.props.match.params.idZone:this.state.idZone)} />);
                this.state.idZone=null;
            }

            var indents =[this.renderPrimaryView(),this.renderSecondaryView(),this.renderFilterMenu()];

            return [
                <FliwerWrapper key={"fliwerWrapper"}>{indents}</FliwerWrapper>,
                redirects
            ]
        }

    }

    renderSecondaryView(){
        switch(this.props.currentPath){
            case '/app/workSites':
                this.setPortraitScreen(1);
                return (
                    <GardenerHomesMap
                        key={"fliwer_App_GardenerHomesMap"}
                        onPress={(marker,map) => {
                            if(map)this.map=map;
                            if(this.state.mode=="homes"){
                                if (this.gardenerHomesRef && this.gardenerHomesRef.current && marker.id){
                                    this.setState({highlightedId: marker.id,mode:"zones"});
                                    this.gardenerHomesRef.current.goToHome(marker.id);
                                }
                            }else{
                                //zones. Go to zona 
                                if(marker.id){
                                    if(this.state.sectionSelected==1)//devices
                                    {
                                        this.setState({goToDevices:true,idZone:marker.id});
                                    }else{
                                        this.setState({goToParameters:true,idZone:marker.id});
                                    }
                                }
                            }
                        }}
                        idHome={this.state.highlightedId}
                        mode={this.state.mode}
                    />
                );
            case "/app/workSites/devices/:idZone" :
                this.setPortraitScreen(2);
                return (
                    <Devices match={this.props.match} asComponent={true} />
                )
            case "/app/workSites/devices/:idZone/:idDevice/valves":
                this.setPortraitScreen(2);
                return (
                    <ControlValves match={this.props.match}  asComponent={true} />
                )
            case '/app/workSites/zone/:idZone':
            case '/app/workSites/zone/:idZone/:filter':
            case '/app/workSites/zone/:idZone/:filter/:timestamp':
                this.setPortraitScreen(2);
                return (
                    <ZoneInfo  key={"fliwer_App_ZoneInfo"} match={this.props.match}  asComponent={true} />
                )
            default:
                return [];
        }
    }

    renderPrimaryView(){
        var mode="homes";
        
        switch(this.state.sectionSelected){
            case 1:
                mode="devices";
                break;
        }


        switch(this.props.currentPath){
            case '/app/workSites':
            case "/app/workSites/devices/:idZone" :
            case "/app/workSites/devices/:idZone/:idDevice/valves":
            case '/app/workSites/zone/:idZone':
            case '/app/workSites/zone/:idZone/:filter':
            case '/app/workSites/zone/:idZone/:filter/:timestamp':
                return (
                    <GardenerHomes key={"GardenerHomes"} ref={this.gardenerHomesRef} currentPath={this.props.currentPath} asComponent={true} mode={mode} onMark={(idHome)=>{
                        this.setState({highlightedId:idHome,mode:"zones"});
                        this.gardenerHomesRef.current.goToHome(idHome);
                    }}/>
                )
            default:
                return [];
        }
    }

    renderFilterMenu(){
        return (
            <View style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",paddingTop:20,alignItems:"center",backgroundColor:CurrentTheme.primaryColor}}>
                {
                    (()=>{
                        var indents=[];
                        switch(this.props.currentPath){
                            case '/app/workSites':
                            case "/app/workSites/devices/:idZone" :
                            case "/app/workSites/devices/:idZone/:idDevice/valves":
                            case '/app/workSites/zone/:idZone':
                            case '/app/workSites/zone/:idZone/:filter':
                            case '/app/workSites/zone/:idZone/:filter/:timestamp':
                                indents.push(this.renderFilterMenuItem("ionic","map-outline",() => {
                                    if(this.map)this.map.resetInitialRegion();
                                    this.gardenerHomesRef.current.goToHome(null);
                                    this.setState({goToMainScreen:true,highlightedId:null,mode:"homes"});
                                }));
                                indents.push(this.renderFilterMenuItem("ionic","home-outline",()=>{
                                    var goToParameters=false;
                                    switch(this.props.currentPath){
                                        case "/app/workSites/devices/:idZone" :
                                        case "/app/workSites/devices/:idZone/:idDevice/valves":
                                            //Move to devices
                                            goToParameters=true;
                                        break;
                                    }
                                    this.setState({sectionSelected:0,goToParameters:goToParameters});
                                }));
                                return indents;
                            default:
                                return [];
                        }
                    })()
                }
            </View>
        )
    }

    renderFilterMenuItem(iconProvider,icon,onPress,size=30,style){
        
        const SpecificIcon = components[iconProvider];
        return (
            <TouchableOpacity style={[{height:70,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-start"}]} onPress={() => {
                if(onPress)onPress();
            }}>
                {iconProvider?
                    (
                        <SpecificIcon name={icon} style={[{fontSize:size,color:CurrentTheme.primaryText}]}/>
                    ):
                    (
                        <Image resizeMode={"contain"} source={icon} style={[{width: size, height: size},style?style:{}]}/>
                    )
                }
            </TouchableOpacity>
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
        portraitScreen: state.wrapperReducer.portraitScreen,
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
        }
    };
}

//Connect everything
var styles = {
    mainDualViewBar:{
        width:60,
        height:"100%",
        backgroundColor: FliwerColors.secondary.black,
        paddingTop:20,
        display: "flex",
        alignItems: "center",
    },
    mainDualViewBarIcon:{
        width:45,
        height:45,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 45,
        marginBottom: 20
    },
    mainDualViewBarIconSelected:{
        backgroundColor: FliwerColors.primary.green,
    },
    dualViewContainer:{
        flex: 1,
        flexDirection: "row",
    },
    dualViewContainerScroll:{
        justifyContent: "center",
        alignItems: "center",
    },
    primaryView:{
    },
    secondaryView:{
    },
    separator:{
        height:"100%",
        width: 0,//10,
        backgroundColor: FliwerColors.gray,
    },
    mainDualViewSeparator: {height:1,width:"80%",backgroundColor:"white",marginBottom:20},
    "@media (orientation:portrait)":{
        separator:{
            height: 0,
            width:"100%",
        },
        dualViewContainer:{
            flexDirection: "column",
            flexGrow:1
        },
        dualViewContainerScroll:{
            flexDirection: "column",
            flexGrow:1
        },
        primaryView:{
            flex:1,
            flexGrow:1
        },
        mainDualViewBar:{
            width:"100%",
            height:54,
            flexDirection: "row",
            paddingTop:0
        },
        mainDualViewBarIcon: {
            marginLeft: 10,
            marginRight: 10,
            marginBottom: 0,
        },
        mainDualViewSeparator:{
            height:"80%",
            width: 1,
            marginBottom:0,
            marginLeft: 10,
            marginRight: 10
        }
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, WorkSitesApp)));