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

import EmployeeAssignCard from   './employeeAssignCard.js'
import CardCollection from '../../../components/custom/cardCollection.js'
import ImageBackground from '../../../components/imageBackground.js'
import FliwerUpdateAppModal from '../../../components/custom/FliwerUpdateAppModal.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';


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

import {toast} from '../../../widgets/toast/toast'
import ClientObjectModal from '../../../components/gardener/ClientObjectModal.js'
import {FliwerColors,CurrentTheme} from '../../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../../utils/FliwerCommonUtils'

import {mediaConnect, MediaInfo} from '../../../utils/mediaStyleSheet.js'
import { Redirect } from '../../../utils/router/router'
import TemplateCard from './templateCard.js';
import { Divider } from 'react-native-elements';
import FilwerDivider from '../../custom/FliwerDivider.js';


class EmployeeAssignList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: this.props.allowRefreshGardenerHomes,
            disablePreloading: false,
            refreshGardenerHomesInitializing: false,
            refreshGardenerHomesInitialized: !this.props.allowRefreshGardenerHomes,
            refreshing: false,
            idHome: null,
            goADDusers: false,
            modalVisible: false,
            modalClientObjectVisible:false,
            idUser: null,
            userInfo: null,
            pan: new Animated.ValueXY(),
            marginTopPan: new Animated.Value(0),
            marginBottomPan: new Animated.Value(0),
            mapVisible: false,
            isDeletingVisitor: false,
            allowShowVerifyPhoneModal: false,
            allowShowContractsModalWarning: false,
            petition: this.props.petition? this.props.petition.id : null,
            hash: this.props.petition? this.props.petition.hash : null,
            email: this.props.petition && this.props.petition.email? this.props.petition.email : null,
            gotoInvitation: false,
            idInvitation: null,
            invitationErrorModalVisible: false,
            highlightedHomeId: null,
            gardenerHomesCanvasHeight: null,

            versionCode: this.props.versionCode,
            versionName: this.props.versionName,
            forceUpdateApp: this.props.forceUpdateApp,
            lastCheckedVersionTime: this.props.lastCheckedVersionTime,
            updateAppModalVisible: false
        };



        if(!this.props.userListLoaded){
            this.props.actions.fliwerGardenerActions.getGardenerUsers().then((resp) => {
                if(resp && resp.error){
                    toast(resp.error);
                }
            });
        }

        if (this.props.preloadedData) {
            if (this.props.allowRefreshTemplates || this.props.asComponent) {
                this.props.actions.sessionActions.cleanGardenerUser().then(() => {
                    this.props.actions.sessionActions.cleanVisitorUser().then(() => {
                        this.props.actions.sessionActions.wrongData2().then(() => {

                           this.refreshTemplates();
                        });
                    });
                });
            }
            else
                this.checkGardenerHomesGenericInfo();
        }

        this._gardenerHomeADDList = {};

        // Reset Current index academy
        this.props.actions.academyActions.resetCurrentIndexAcademyCategory();

        if (Platform.OS != 'web' && Platform.OS!='android') {
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
        if (this.props.preloadedData && !prevProps.preloadedData) {
            this.refreshTemplates();
        }
        //console.log(this.props)
    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log("shouldComponentUpdate nextProps", nextProps);
        return !this.state.disablePreloading;
    }

    componentDidMount(){
        if(this.props?.match && this.props?.match?.params && this.props?.match?.params?.idCourse){
            this.setState({ selectedTemplate: this.props?.match?.params?.idCourse })
        }
    }

    checkVersion() {

        if (Platform.OS!='android' && this.state.versionCode != null) {
            setTimeout(() => {
                var version = FliwerCommonUtils.getVersion();
                if (version != null && version < this.state.versionCode) {
                    this.setState({updateAppModalVisible: true});
                }
            }, 200);
        }

    }

    renderUpdateAppModal() {

        if (!this.state.updateAppModalVisible)
            return null;

        return (
            <FliwerUpdateAppModal onClose={() => {
                    this.setState({updateAppModalVisible: false});
                }}
                forceUpdateApp={this.state.forceUpdateApp}
                versionCode={this.state.versionCode}
                versionName={this.state.versionName}
            />
        );
    }

    renderClientObjectModal(){
        if(!this.state.modalClientObjectVisible)
            return null;
        return (
            <ClientObjectModal 
                visible={this.state.modalClientObjectVisible}
                onClose={()=>{this.setState({modalClientObjectVisible: false})}}
                onLoading={(loading)=>{this.setState({loading:loading})}}
                onConfirm={(client)=>{
                    this.setState({loading: true});
                    this.props.actions.invoiceActions.getClientInformation().then(()=>{
                        this.setState({loading: false,modalClientObjectVisible:false});
                    });
                }}
                idUser={this.state.idUser}
            />)
    }

    /*
     * Check if we must refresh gardener homes
     */
    checkGardenerHomesGenericInfo() {
        console.log("checkGardenerHomesGenericInfo...");
        this.props.actions.fliwerGardenerActions.getGardenerHomesGenericInfo().then((response) => {
            //console.log("checkGardenerHomesGenericInfo response", response);

            if (this.state.refreshGardenerHomesInitializing) {
                return;
            }

            var gardensOnCare = Object.values(this.props.gardensOnCare);
            if (gardensOnCare.length != response.length) {
                console.log("refreshGardenerHomes by checkGardenerHomesGenericInfo");
                this.refreshGardenerHomes(true, true);
                return;
            }

            if (gardensOnCare.length == 0 && response.length == 0) {
                return;
            }

            gardensOnCare.sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                } else if (a.id > b.id) {
                    return 1;
                } else {
                    return 0;
                }
            });

            response.sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                } else if (a.id > b.id) {
                    return 1;
                } else {
                    return 0;
                }
            });

            var genericInfo1, genericInfo2;
            var anyDiff = false;
            for (var i = 0; i < gardensOnCare.length; i++) {
                genericInfo1 = gardensOnCare[i].genericInfo;
                genericInfo2 = response[i].genericInfo;

                if (genericInfo1.advices != genericInfo2.advices) {
                    console.log("Diff -> advices", genericInfo1.advices, genericInfo2.advices);
                    anyDiff = true;
                    break;
                }

                if (genericInfo1.alerts != genericInfo2.alerts) {
                    console.log("Diff -> alerts", genericInfo1.alerts, genericInfo2.alerts);
                    anyDiff = true;
                    break;
                }

                if (genericInfo1.zones != genericInfo2.zones) {
                    console.log("Diff -> zones", genericInfo1.zones, genericInfo2.zones);
                    anyDiff = true;
                    break;
                }
            }

            if (true || anyDiff) {
                console.log("refreshGardenerHomes by checkGardenerHomesGenericInfo");
                this.refreshGardenerHomes(true, true);
                return;
            }

        });
    }

    refreshTemplates(forceRefresh, disablePreloading) {

        this.setState({loading: true});
        this.props.actions.academyActions.getTemplates().then((response) => {
            this.setState({loading: false});
        });
        
        /*
        if (!this.props.allowRefreshGardenerHomes && !forceRefresh) {
            this.checkGardenerHomesGenericInfo();
            return;
        }

        console.log("refreshGardenerHomes", forceRefresh, disablePreloading);

        if (!disablePreloading)
            this.setState({loading: true, refreshGardenerHomesInitialized: false, refreshGardenerHomesInitializing: true});
        else {
            this.state.disablePreloading = true;
            this.state.loading = false;
            this.state.refreshGardenerHomesInitialized = false;
            this.state.refreshGardenerHomesInitializing = true;
        }

        //this.props.actions.fliwerGardenerActions.wipeData().then(() => {
            this.props.actions.fliwerGardenerActions.wipeAllowRefreshGardenerHomes().then(() => {

                var polyRequestParams = [];

                this.props.actions.polyActions.polyRequest(polyRequestParams, true).then((response) => {
                    //console.log("polyRequest", response);
                    var respIndex = 0;
                    var gardenerHomes = Array.isArray(response[respIndex])? [].concat(response[respIndex]) : null;
                    respIndex++;
                    var gardenerUsers = Array.isArray(response[respIndex])? response[respIndex] : null;
                    respIndex++;
                    var visitorHomes = Array.isArray(response[respIndex])? response[respIndex] : null;
                    respIndex++;
                    var visitorUsers = Array.isArray(response[respIndex])? response[respIndex] : null;

                    this.props.actions.fliwerGardenerActions.getGardenerHomes(gardenerHomes,true).then(() => {
                        this.props.actions.fliwerGardenerActions.getGardenerUsers(gardenerUsers).then(() => {
                            this.props.actions.fliwerVisitorActions.getVisitorHomes(visitorHomes).then(() => {
                                this.props.actions.fliwerVisitorActions.getVisitorUsers(visitorUsers).then(() => {
                                    this.props.actions.academyActions.setGardenerData(null, null).then(() => {
                                        if (!this.props.invitationChecked &&
                                              (this.state.petition === 'ticket' || this.state.petition === 'audit' || this.state.petition === 'sepa' || this.state.petition === 'invitation') &&
                                              this.state.hash) {

                                               this.props.actions.academyActions.getInvitation(this.state.petition, this.state.hash, this.state.email).then((data) => {
                                                   let gotoInvitation = this.state.petition != 'invitation'? true : false;
                                                   let idInvitation = gotoInvitation? data.id : null;
                                                   this.props.actions.fliwerGardenerActions.setAllowRefreshGardenerHomes(false, visitorHomes, visitorUsers);
                                                   this.setState({loading: false, gotoInvitation: gotoInvitation, idInvitation: idInvitation, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                                               }, (err) => {
                                                   this.props.actions.fliwerGardenerActions.setAllowRefreshGardenerHomes(false, visitorHomes, visitorUsers);
                                                   this.setState({loading: false, invitationErrorModalVisible: true, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                                               });
                                           }
                                           else {
                                                console.log("End refreshGardenerHomes");
                                                this.props.actions.fliwerGardenerActions.setAllowRefreshGardenerHomes(false, visitorHomes, visitorUsers);
                                                this.setState({loading: false, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                                           }
                                    });
                                }, (err) => {
                                    this.setState({loading: false, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                                    if (err && err.reason)
                                        toast.error(err.reason);
                                    console.log("Error", err);
                                });
                            }, (err) => {
                                this.setState({loading: false, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                                if (err && err.reason)
                                    toast.error(err.reason);
                                console.log("Error", err);
                            });
                        }, (err) => {
                            this.setState({loading: false, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                            if (err && err.reason)
                                toast.error(err.reason);
                            console.log("Error", err);
                        });
                    }, (err) => {
                        this.setState({loading: false, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                        if (err && err.reason)
                            toast.error(err.reason);
                        console.log("Error", err);
                    });

                }, (err) => {
                    this.setState({loading: false, refreshGardenerHomesInitialized: true, refreshGardenerHomesInitializing: false, disablePreloading: false});
                    toast.error("Error refreshing gardener data");
                });
            });
        //});
        */
    }


    render() {

        var indents=[];

        if (this.state.goADDTemplate){
            indents.push(<Redirect push to={"/app/workOrder/assignTemplate/templates/"+this.state.goADDTemplate} />)
            this.state.goADDTemplate=null;
        }

        if (this.state.goADDWorkOrderTemplate){
            indents.push(<Redirect push to={`/app/workOrder/assignTemplate/templates/${this.state.goADDWorkOrderTemplate}/pages`} />)
            this.state.goADDWorkOrderTemplate=null;
            if(MediaInfo.orientation != "landscape"){
                this.props.actions.wrapperActions.setPortraitScreen(2);
            }
        }
        var loading = this.state.loading || this.state.refreshing;

        indents.push (
                <ImageBackground style={{backgroundColor:CurrentTheme.secondaryColor}} loading={loading}>

                    <View style={{flexDirection: "row", flex: 1, backgroundColor: CurrentTheme.primaryView}} >

                        <View
                            style={[this.style.homeListContainer, {flex: 1}]}
                            onLayout={(e) => {
                                this.state.gardenerHomesCanvasHeight = e.nativeEvent.layout.height;
                            }}
                        >
                            <ScrollView
                                ref={(s) => {
                                    this._scrollView = s;
                                }} scrollEventThrottle={1000}
                                style={{flex: 1}}
                                onScroll={({nativeEvent}) => {
                                    //this.state.lastScrollContentY = nativeEvent.contentOffset.y;
                                }}
                                refreshControl={ < RefreshControl refreshing = {this.state.refreshing} onRefresh = {() => {
                                    this.refreshTemplates()
                                }} /> }>
                                <FilwerDivider>
                                    <Text style={{padding:10,color:CurrentTheme.primaryText,fontFamily:FliwerColors.fonts.title,textAlign:"center",fontSize:18}}>{this.props.actions.translate.get('Academy_workers')}</Text>
                                </FilwerDivider>
                                <CardCollection style={this.style.collection}>

                                    { this.renderEmployees() }

                                    <FilwerDivider>
                                        <Text style={{padding:10,color:CurrentTheme.primaryText,fontFamily:FliwerColors.fonts.title,textAlign:"center",fontSize:18}}>{this.props.actions.translate.get('Academy_unused_templates')}</Text>
                                    </FilwerDivider>                                    
                                    { this.renderTemplates2() }

                                </CardCollection>
                            </ScrollView>
                        </View>
                    </View>



                </ImageBackground>
            );

        return indents;

    }

    renderTemplates(){
        var indents = [];

        //Add + template

        indents.push(
            <TemplateCard
                key={999}
                onPressAdd={()=> {this.setState({goADDTemplate: "new"})}}
            />)

        //for every template in this.props.templates

        var templates = Object.values(this.props.templates);
        //console.log("templates", templates);
        for (var index in templates) {
            indents.push(
                <TemplateCard
                    key={"template"+templates[index].id}
                    course={templates[index]}
                    onLoading={(loading)=>{this.setState({loading:loading})}}
                    gotoCourse ={(id)=> {this.setState({goADDTemplate: id})}}
                />
            )
        }

        return indents;
    }

    
    renderEmployees() {
        var indents = [];

        var employees= this.props.employees;

        if(this.props.data.bussinessOwner==this.props.data.user_id){
            indents.push(<EmployeeAssignCard 
                key={"employee_card_"+this.props.data.user_id} 
                idUser={this.props.data.user_id}
                onLoading={(loading)=>{this.setState({loading:loading})}}
                setTemplateSelected={(id) => this.setState({ selectedTemplate: id })}
                selectedTemplate={this.state.selectedTemplate}
                deletingItem={this.props?.deletingItem}
                enDeleteItem={this.props.enDeleteItem}
            />);
        }

        for (var index in employees) {
            indents.push(<EmployeeAssignCard 
                key={"employee_card_"+employees[index].idUser} 
                idUser={employees[index].idUser} 
                onLoading={(loading)=>{this.setState({loading:loading})}}
                setTemplateSelected={(id) => this.setState({ selectedTemplate: id })}
                selectedTemplate={this.state.selectedTemplate}
                deletingItem={this.props?.deletingItem}
                enDeleteItem={this.props.enDeleteItem}
            />);
        }

        return indents;
    }
    
    renderTemplates2(){
        var indents = [];

        //for every template in this.props.templates
        var employees= [];

        if(this.props.data.bussinessOwner==this.props.data.user_id){
            employees.push(this.props.data)
        }

        for(let i in this.props.employees){
            employees.push(this.props.employees[i])
        }

        var employeesWithTemplate = employees.filter(x => x.workOrderTemplates);

        var templates = this.props.templates.filter(template => {

            let isUsed = employeesWithTemplate.some(employee => {
                return employee.workOrderTemplates.some(workTemplate => {
                    return workTemplate.idCourse === template.id ? true : false
                })
            })

            return !isUsed
        })

        for (var index in templates) {
            indents.push(
                <TemplateCard
                    key={"template"+templates[index].id}
                    course={templates[index]}
                    onLoading={(loading)=>{this.setState({loading:loading})}}
                    gotoCourse ={(id)=> {this.setState({goADDWorkOrderTemplate: id})}}
                    setTemplateSelected={(id) => this.setState({ selectedTemplate: id })}
                    selectedTemplate={this.state.selectedTemplate}
                    deletingItem={this.props?.deletingItem}
                    enDeleteItem={this.props.enDeleteItem}
                />
            )
        }

        //Add + template

        indents.push(
            <TemplateCard
                key={999}
                onPressAdd={()=> {this.setState({goADDTemplate: "new"})}}
            />)

        return indents;
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
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
        templates: state.academyReducer.templates,

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
        loadingData: state.gardenerReducer.loadingData,
        employees: state.sessionReducer.employees,
        userListLoaded: state.gardenerReducer.userListLoaded,
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
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch),
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
    viewWallet:{
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

export default connect(mapStateToProps, mapDispatchToProps,null, { forwardRef: true })(mediaConnect(styles, EmployeeAssignList)); 
