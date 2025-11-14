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
import { FliwerColors, CurrentTheme,MenuTheme } from '../../utils/FliwerColors.js'
import { FliwerStyles } from '../../utils/FliwerStyles.js'
import { FliwerCommonUtils } from '../../utils/FliwerCommonUtils.js'

import HomeAppSection from './HomeAppSection.js'
import HomeAppCard from './HomeAppCard.js'

import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton from '../../assets/img/add.png'
import mapButton from '../../assets/img/map.png'

import { Orientation } from '../../utils/orientation/orientation'


import { DocumentPicker } from '../../utils/uploadFile/uploadFile'

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            searchInput: "",
        };

        //Load Home Config Info.

        if (Platform.OS != 'web' && Platform.OS != 'android') {
            var now = Math.floor(Date.now() / 1000);
            if (now > (this.state.lastCheckedVersionTime + 86400)) {
                // 86400 (1 day)
                this.props.actions.sessionActions.getVersion().then(() => {
                    this.state.versionCode = this.props.versionCode;
                    this.state.versionName = this.props.versionName;
                    this.state.forceUpdateApp = this.props.forceUpdateApp;
                    this.checkVersion();
                });
            }
        }
    }

    componentDidUpdate(prevProps) {

    }

    checkVersion() {

        if (Platform.OS != 'android' && this.state.versionCode != null) {
            setTimeout(() => {
                var version = FliwerCommonUtils.getVersion();
                if (version != null && version < this.state.versionCode) {
                    this.setState({ updateAppModalVisible: true });
                }
            }, 200);
        }

    }

    renderUpdateAppModal() {

        if (!this.state.updateAppModalVisible)
            return null;

        return (
            <FliwerUpdateAppModal onClose={() => {
                this.setState({ updateAppModalVisible: false });
            }}
                forceUpdateApp={this.state.forceUpdateApp}
                versionCode={this.state.versionCode}
                versionName={this.state.versionName}
            />
        );
    }

    goToHomePress(idhome, iduserGardener, isVisitorCard) {
        console.log("idhome", idhome, "iduserGardener", iduserGardener, "isVisitorCard", isVisitorCard);
        //console.log("this.props.homeData", this.props.homeData);

        if (isVisitorCard == false) {
            this.props.actions.sessionActions.addGardenerUserID(iduserGardener, idhome);
        } else {
            this.props.actions.sessionActions.addVisitorUserID(iduserGardener, idhome);
        }

        if (this.props.homeData[idhome]) {
            this.setState({ idHome: idhome, goToHome: true });
            return;
        }

        this.setState({ refreshing: true });
        this.props.actions.sessionActions.wrongData2().then(() => {
            this.props.actions.academyActions.setGardenerData(null, null).then(() => {
                this.setState({ idHome: idhome, goToHome: true });
            });
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
            this.state.refreshing = false;
        })

    }

    bindRefToHomeList(idHome) {
        return (ref) => {
            if (this._gardenerHomeADDList[idHome]) {
                this._gardenerHomeADDList[idHome].component = ref ? ref : null;
            }
        }
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

        return(
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    backgroundColor:"rgb(100,100,100)"
                }}
                kay="HomeView"
            >    
                {this.renderApps()}
                {this.state.allowShowVerifyPhoneModal ? this.getFliwerVerifyPhoneModal() : null}
                {this.renderUpdateAppModal()}
            </View>
        )

        return (
            <ImageBackground  style={{backgroundColor:CurrentTheme.secondaryColor,flexGrow:1}}  loading={this.state.loading}>

                <ScrollView style={{ display:"flex",height:"100%" }} contentContainerStyle={{flexGrow:1}} >
                    {
                        /*Welcome view*/
                        /*
                            <View style={{ width:"100%",display:"flex",alignItems:"center" }}>
                                <ImageBackground resizeMode={"cover"} style={{width:"100%",height:"100%",padding:20,alignItems:"center"}} source={background} >
                                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                                        <Text style={{ fontSize: 30, color: "white", fontFamily:FliwerColors.fonts.title }}>{"Welcome,"}</Text>
                                    </View>
                                    <TouchableOpacity style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20,width:150 }}>
                                        <Image source={{ uri: this.props.data.photo_url }} style={{ width: 150, height: 150, borderRadius: 75 }} />
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 10 }}>
                                        <Text style={{ fontSize: 20, color: "white" }}>{this.props.data.first_name}</Text>
                                    </View>
                                    <View style={{ flexDirection: "row",justifyContent: "center", alignItems: "center", width:"100%", marginTop: 20 }}>
                                        <FliwerTwoPanelInput 
                                            onChangeText={(text) => {
                                                this.setState({searchInput: text})
                                            }} 
                                            placeholder={"Search App"} 
                                            containerStyle={{alignSelf: "center", width:"80%",maxWidth: 400}} inputContainer={{right: 45}} 
                                            defaultValue={""}
                                            rightIcon={<Icon2 name="magnify" size={30} color={FliwerColors.secondary.white} />}
                                        />
                                    </View>
                                </ImageBackground>
                            </View>
                        */
                    }

                    {/* {this.renderApps()} */}
                </ScrollView>



            </ImageBackground>
        );

    }


    renderApps() {

        var indents=[];
        
        var apps=MenuTheme.apps;
        for(var i=0;i<apps.length;i++){
            if(apps[i] && this.props.onAppPress){
                var redirect=apps[i].redirect;
                indents.push(this.renderMenuItem(apps[i].iconProvider,apps[i].icon,apps[i].name,((r)=>{return ()=>{this.props.onAppPress(r)}})(redirect),apps[i].size,apps[i].style,apps[i].disabled));
            }
        }

        return indents
    }
    
    renderMenuItem(iconProvider,icon,text,onPress,size=30,style,disabled ){
        
        const SpecificIcon = iconProvider;//components[iconProvider];
        const Containter = disabled?View:TouchableOpacity;
        return (
            <Containter style={[{width: "49%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around", padding: 20}]} onPress={() => {
                if(onPress)onPress();
            }}>
                {iconProvider?
                    (
                        <SpecificIcon name={icon} style={[{fontSize:size,color:CurrentTheme.primaryText,opacity:(disabled?0.3:1)}]}/>
                    ):
                    (
                        <Image resizeMode={"contain"} source={icon} style={[{width: size, height: size,opacity:(disabled?0.3:1)},style?style:{}]}/>
                    )
                }
                <Text style={{color:CurrentTheme.secondaryText,fontSize:15,fontFamily:FliwerColors.fonts.title,opacity:(disabled?0.3:1), marginTop: 10 }}>{text}</Text>
            </Containter>
        )
    }

    getFliwerVerifyPhoneModal() {

        return (
            <FliwerVerifyPhoneModal
                visible={this.props.data.phoneVerificationIsNeeded && !this.props.phoneVerificationIsCancelled && this.props.isGardener}
                onFinalize={() => {
                    this.props.data.phoneVerificationIsNeeded = false;
                    this.setState({ allowShowContractsModalWarning: true });
                }}
                loadingModal={false}
                country={this.props.data.country}
                phone={this.props.data.phone}
                setLoading={this.setLoading()}
                onCancel={() => {
                    this.props.actions.sessionActions.cancelPhoneVerification().then(() => {
                        this.setState({ allowShowContractsModalWarning: true });
                    });
                }}
            />
        );

    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({ loading: loading });
        };
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
    mapContainer: {
        width: "100%",
    },
    mapListContainerSeparator: {
        position: "absolute",
        top: "50%",
        marginTop: -20,
        width: "100%",
        height: 40,
        cursor: "pointer"
    },
    mapListContainerSeparatorLine: {
        position: "absolute",
        top: "50%",
        marginTop: -1,
        width: "100%",
        height: 2,
        backgroundColor: FliwerColors.primary.gray
    },
    mapListContainerSeparatorCircle: {
        position: "absolute",
        left: "50%",
        marginLeft: -20,
        height: 40,
        width: 40,
        backgroundColor: FliwerColors.primary.gray,
        borderRadius: 45,
        elevation: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    mapListContainerSeparatorText: {
        color: "white",
        WebkitUserSelect: "none",
        userSelect: "none",
        fontSize: 26
    },
    homeListContainer: {
        width: "100%"
    },
    viewMap: {
        position: "absolute",
        backgroundColor: FliwerColors.primary.gray,
        //bottom: 140, // Old (Above the old academy button)
        bottom: 65,
        left: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        justifyContent: "center"
    },
    viewAcademy: {
        position: "absolute",
        backgroundColor: FliwerColors.complementary.blue,
        bottom: 65,
        right: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        justifyContent: "center"
    },
    addImg: {
        flex: 1,
        width: "47%",
        height: "47%"
    },
    addButton: {
        height: 30,
        marginLeft: 6,
        minWidth: 30,
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 400
    },
    modalView: {
        paddingTop: 20
    },
    modalViewTitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    modalButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)"
    },
    modalButton1: {
        borderBottomLeftRadius: 20
    },
    modalButton2: {
        borderRightWidth: 0,
        borderBottomRightRadius: 20
    },
    modalButtonText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonTextNo: {
        color: "blue"
    },
    modalButtonTextYes: {
        color: "red"
    },
    addZone: {
        position: "absolute",
        backgroundColor: FliwerColors.secondary.green,
        bottom: 15,
        right: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
    },
    addZoneImg: {
        flex: 1,
        width: "47%",
        height: "47%"
    },
    collection: {
        marginBottom: 85
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

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, Home));
