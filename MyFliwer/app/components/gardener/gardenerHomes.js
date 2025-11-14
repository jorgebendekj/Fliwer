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
import FliwerLoading from '../fliwerLoading'
import HomeGardenerCard from '../../components/gardener/homeGardenerCard.js'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'
import FliwerContractsModalWarning from '../../components/custom/FliwerContractsModalWarning.js'
import FliwerVerifyPhoneModal from '../../components/custom/FliwerVerifyPhoneModal.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../../components/custom/FliwerUpdateAppModal.js'
import GardenerHomesMap from '../../components/gardener/gardenerHomesMap'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/Entypo';

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
import {toast} from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import ClientObjectModal from '../../components/gardener/ClientObjectModal.js'
import {FliwerColors,CurrentTheme} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton  from '../../assets/img/add.png'
import mapButton  from '../../assets/img/map.png'

import {Orientation} from '../../utils/orientation/orientation'


import {DocumentPicker} from '../../utils/uploadFile/uploadFile'

class GardenerHomes extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goToHome: null,
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
            goToHomeAtFirstJustOneTimeFlag: false,
            gardenerHomesCanvasHeight: null,

            versionCode: this.props.versionCode,
            versionName: this.props.versionName,
            forceUpdateApp: this.props.forceUpdateApp,
            lastCheckedVersionTime: this.props.lastCheckedVersionTime,
            updateAppModalVisible: false
        };

        if (this.props.preloadedData) {
            if (this.props.allowRefreshGardenerHomes || this.props.asComponent) {
                this.props.actions.sessionActions.cleanGardenerUser().then(() => {
                    this.props.actions.sessionActions.cleanVisitorUser().then(() => {
                        this.props.actions.sessionActions.wrongData2().then(() => {
                           this.refreshGardenerHomes();
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
            this.refreshGardenerHomes();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log("shouldComponentUpdate nextProps", nextProps);
        return !this.state.disablePreloading;
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

    refreshGardenerHomes(forceRefresh, disablePreloading) {

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

                var polyRequestParams = [];/*
                polyRequestParams.push({url: '/gardener/home', params: JSON.stringify({})});
                polyRequestParams.push({url: '/gardener/users', params: JSON.stringify({})});
                polyRequestParams.push({url: '/visitor/home', params: JSON.stringify({})});
                polyRequestParams.push({url: '/visitor/users', params: JSON.stringify({})});*/

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
    }

    goToHomePress(idhome, iduserGardener, isVisitorCard)
    {
        console.log("idhome", idhome, "iduserGardener", iduserGardener, "isVisitorCard", isVisitorCard);
        //console.log("this.props.homeData", this.props.homeData);

        if (isVisitorCard == false)
        {
            this.props.actions.sessionActions.addGardenerUserID(iduserGardener, idhome);
        } else {
            this.props.actions.sessionActions.addVisitorUserID(iduserGardener, idhome);
        }

        if (this.props.homeData[idhome]) {
            this.setState({idHome: idhome, goToHome: true});
            return;
        }

        this.setState({refreshing: true});
        this.props.actions.sessionActions.wrongData2(true).then(() => {
            this.props.actions.academyActions.setGardenerData(null, null).then(() => {
                this.setState({idHome: idhome, goToHome: true});
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

    goToHome(idHome, skipAnimation) {
        console.log("goToHome", idHome, skipAnimation)
        //check if the home is in this screen or not
        if (this._gardenerHomeADDList[idHome]) {
            if (Platform.OS === 'android' || Platform.OS == 'ios') {
                if (this._gardenerHomeADDList[this._firstHomeInList] && this._gardenerHomeADDList[this._firstHomeInList].component) {
                    this._gardenerHomeADDList[this._firstHomeInList].component.measure((first_a, first_b, first_width, first_height, first_px, first_py) => {
                        if (this._gardenerHomeADDList[idHome])
                            this._gardenerHomeADDList[idHome].component.measure((a, b, width, height, px, py) => {
                                this._scrollView.scrollTo({x: 0, y: py - first_py, animated: true, duration: 1000});
                                this.setState({highlightedHomeId: idHome});
                            });
                    });
                }
            }
            else {
                if (this._gardenerHomeADDList[idHome] && this._gardenerHomeADDList[idHome].component) {
                    this._gardenerHomeADDList[idHome].component.measure((offsetXFrame, offsetYFrame, width, height, offsetXPage, offsetYPage) => {
                        //console.log("offsetXFrame, offsetYFrame, width, height, offsetXPage, offsetYPage", offsetXFrame, offsetYFrame, width, height, offsetXPage, offsetYPage)
                        //var scrollToY = offsetYFrame + 5; // Show card at top
                        var scrollToY = offsetYFrame;
                        if (this.state.gardenerHomesCanvasHeight)
                            scrollToY = scrollToY - (this.state.gardenerHomesCanvasHeight/2) + (height/2);
                        this._scrollView.scrollTo({x: 0, y: scrollToY, animated: skipAnimation? false : true, duration: 1000});
                        this.setState({highlightedHomeId: idHome}, () => {
                            /*if (!that.state.gotoDeviceFirstTime) {
                                that.state.gotoDeviceFirstTime = true;
                                that.goToDevice(idDevice)
                            }*/
                        });


                    });
                }
            }

        }else{
            this.setState({highlightedHomeId: null});
        }
    }

    render() {
        if (this.state.goADDusers) {
            return (<Redirect push to={"/gardener/add"} />)
        } else if (this.state.goWallet) {
            return (<Redirect push to={"/wallet"}/>)
        } else if (this.state.goAcademy) {
            return (<Redirect push to={"/academyCourses"}/>)
        } else if (this.state.goToHome) {
            this.state.goToHome = false;
            return (<Redirect push to={"/zone/"} />)
        } else if (!this.state.disablePreloading && (!this.props.preloadedData || this.props.loadingData || !this.state.refreshGardenerHomesInitialized || this.state.refreshGardenerHomesInitializing)) {
            var icons = [
                "gardener",
                "zone", "files", "academy"];

            return (
                    <ImageBackground   style={{backgroundColor:CurrentTheme.secondaryColor}} >
                        {
                            !this.props.asComponent?(<MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('hello') + " " + this.props.data.first_name} />):null
                        }
                        
                        <FliwerLoading/>
                        <View style={{width: "100%", flex: 1}}></View>
                        {
                            !this.props.asComponent?(<MainFliwerMenuBar idZone={null} current={"gardener"} icons={icons} />):null
                        }
                    </ImageBackground>
                    );
        } else if (this.state.gotoInvitation) {
            var route = this.state.petition == 'ticket' || this.state.petition == 'audit'? 'audit' : 'sepa';
            return (<Redirect push to={"/" + route + "/" + this.state.idInvitation} />);
        } else {

            var loading = (Platform.OS == 'web' ? (this.state.loading || this.state.refreshing) : (this.state.loading));

            if (!this.props.isVisitor) {
                var phoneVerificationEnabled = true; //(Platform.OS == 'web')
                if (!this.props.isGardener || !phoneVerificationEnabled)
                    this.state.allowShowContractsModalWarning = true;
                else {
                    this.state.allowShowVerifyPhoneModal = true;
                    if (this.state.allowShowVerifyPhoneModal && !this.props.data.phoneVerificationIsNeeded)
                        this.state.allowShowContractsModalWarning = true;
                }
            }

            var icons = [
                "gardener",
                "zone", "files", "academy"];
            //if (Object.values(this.props.gardensOnCare).length > 0)
            //    icons.push("mapview");

            const dimensions = Dimensions.get('window');
            var isPortrait = (dimensions.height > dimensions.width);

            return (
                    <ImageBackground style={{backgroundColor:CurrentTheme.secondaryColor}} loading={loading}>
                        {
                            !this.props.asComponent?(
                                <MainFliwerTopBar showTextBar={true} title={
                                    this.props.actions.translate.get('hello') + " " +
                                    this.props.data.first_name + ", " +
                                    this.props.actions.translate.get('Gardener_you_are_caring').toLowerCase() + ":"}/>
                            ):null
                        }

                        <View style={{flexDirection: isPortrait? "column" : "row", flex: 1}} >

                            {this.state.mapVisible?<View style={[this.style.mapContainer, {flex: 1}, isPortrait? {borderBottomColor: '#aaaaaa', borderBottomWidth: 1}:{borderRightColor: '#aaaaaa', borderRightWidth: 1}]} >
                                {this.renderMap()}
                            </View>:null}

                            <View
                                style={[this.style.homeListContainer, (isPortrait || !this.state.mapVisible || (dimensions.width/2) < 450)? {flex: 1} : {width: 450}]}
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
                                        this.refreshGardenerHomes()
                                    }} /> }>
                                    <CardCollection style={this.style.collection}>

                                        { this.renderZones() }

                                    </CardCollection>
                                </ScrollView>
                            </View>
                        </View>

                        {
                            !this.props.asComponent?(
                                <MainFliwerMenuBar idZone={null} current={this.state.mapVisible? "mapview" : "gardener"} icons={icons}
                                onPressMapView={() => {
                                    this.setState({mapVisible: !this.state.mapVisible});
                                }} />
                            ):null
                        }
                        {Object.values(this.props.gardensOnCare).length == 0 || this.props.asComponent ?
                            []
                        :
                            <TouchableOpacity style={this.style.viewMap} activeOpacity={1} onMouseEnter={this.hoverIn('viewMap')} onMouseLeave={this.hoverOut('viewMap')}
                                onPress={() => {
                                    this.setState({mapVisible: !this.state.mapVisible, highlightedHomeId: null});
                                }}>
                                <Image style={{width: "60%", height: "60%"}} resizeMode={"contain"} source={mapButton}/>
                            </TouchableOpacity>
                        }


                        {0 && this.props.roles.fliwer?<TouchableOpacity style={this.style.viewAcademy} activeOpacity={1} onMouseEnter={this.hoverIn('viewAcademy')} onMouseLeave={this.hoverOut('viewAcademy')} onPress={() => {
                                            this.setState({goAcademy: true})
                                        }}>
                            <Icon2 name="school" color={"white"} size={44} style={[this.style.academyIcon]} ></Icon2>
                        </TouchableOpacity>:null}

                        {
                            /*if fliwer role or has wallet*/
                            /*
                            this.props.roles.fliwer || (this.props.wallet && this.props.wallet.id) ?(
                                
                                <TouchableOpacity style={this.style.viewWallet} activeOpacity={1} onPress={() => {
                                    this.setState({goWallet: true})
                                }}>
                                    <Icon3 name="wallet" color={"white"} size={35} style={[this.style.walletIcon]} ></Icon3>
                                </TouchableOpacity>
                            ):null
                            */
                        }

                        <FliwerDeleteModal
                            visible={this.state.modalVisible}
                            onClose={() => {
                                this.setModalVisible(false, this.state.idUser);
                            }}
                            onConfirm={async (password) => {
                                await this.deleteUserOnCare(password)
                            }}
                            title={this.state.isDeletingVisitor ? this.props.actions.translate.get('GardenerHomes_delete_visiting_gardens') : this.props.actions.translate.get('masterVC_remove_user_gardener')}
                            hiddeText={true}
                            password={false}
                            loadingModal={this.state.loading}
                            />
                        {this.renderClientObjectModal()}
                        {this.state.allowShowVerifyPhoneModal ? this.getFliwerVerifyPhoneModal() : null}
                        {this.state.allowShowContractsModalWarning ?
                            <FliwerContractsModalWarning
                            enabled={!loading}
                            loadingModal={this.state.loading}
                            />:null}

                        {this.state.invitationErrorModalVisible ? this.renderInvitationErrorModal() : null}

                        {this.renderUpdateAppModal()}

                    </ImageBackground>
                );

        }

    }

    addUser() {
        if (this.props.isVisitor)
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
        else
            this.setState({goADDusers: true});
    }

    getFliwerVerifyPhoneModal() {

        return(
            <FliwerVerifyPhoneModal
                visible={this.props.data.phoneVerificationIsNeeded && !this.props.phoneVerificationIsCancelled && this.props.isGardener}
                onFinalize={() => {
                    this.props.data.phoneVerificationIsNeeded = false;
                    this.setState({allowShowContractsModalWarning: true});
                }}
                loadingModal={false}
                country={this.props.data.country}
                phone={this.props.data.phone}
                setLoading={this.setLoading()}
                onCancel={() => {
                    this.props.actions.sessionActions.cancelPhoneVerification().then(() => {
                        this.setState({allowShowContractsModalWarning: true});
                    });
                }}
            />
        );

    }

    renderInvitationErrorModal() {
        return(
            <Modal animationType="fade" loadingModal={false} inStyle={[FliwerStyles.modalIn, {maxWidth: 400}]} visible={this.state.invitationErrorModalVisible} onClose={() => {
                    this.setState({invitationErrorModalVisible: false});
                }}>
                <View style={[FliwerStyles.modalView, {}]
                    }>
                    <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}>
                        <View style={{width: "100%", alignItems: "center"}}>

                            <Text style={FliwerStyles.titleStyle} >{this.props.actions.translate.get('Invitation_we_are_sorry')}</Text>
                            <Text style={[FliwerStyles.littleTextStyle, {marginTop: 20}]} >{this.props.actions.translate.get('Invitation_error_accessing_link')}</Text>

                            <View style={{alignSelf: "center", marginTop: 20}}>
                                <FliwerGreenButton
                                    text={this.props.actions.translate.get('accept')}
                                    style={[FliwerStyles.fliwerGreenButtonStyle, {}]}
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {marginBottom: 0, width: 150}]}
                                    onPress={() => {
                                        this.setState({invitationErrorModalVisible: false});
                                    }}/>
                            </View>

                        </View>
                    </ScrollView>
                </View>
            </Modal>
        );
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
        };
    }

    renderZones() {
        var indents = [];
        console.log("renderZones");

        // Add + zone
        if (!this.state.loading && !this.state.refreshing)
            indents.push(
                <HomeGardenerCard
                    key={999}
                    onPressAdd={()=> this.addUser()}
                    directAccess={this.props.asComponent?this.props.mode:false}
                    />
             );

        //console.log("this.props.gardensOnCare", Object.values(this.props.gardensOnCare));
        //console.log("this.props.usersListData", Object.values(this.props.usersListData));

        this._gardenerHomeADDList = {};
        //this._visitorHomeADDList={};

        var gardener = Object.values(this.props.gardensOnCare);
        console.log(gardener.length);
        gardener.sort((a, b) => {
            if (a.userInfo.first_name.toUpperCase() < b.userInfo.first_name.toUpperCase()) {
                return -1;
            } else if (a.userInfo.first_name.toUpperCase() > b.userInfo.first_name.toUpperCase()) {
                return 1;
            } else if (a.userInfo.first_name.toUpperCase() == b.userInfo.first_name.toUpperCase()) {

                if (a.userInfo.last_name.toUpperCase() < b.userInfo.last_name.toUpperCase()) {
                    return -1;
                } else if (a.userInfo.last_name.toUpperCase() > b.userInfo.last_name.toUpperCase()) {
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
            }
            return 0;
        });

        //For the moment only show own home if there is at least one garden inside:
        gardener=gardener.filter((g)=>g.idUser!=this.props.data.user_id || g.gardens.length>0);

        var gardenerVisitorHomes = Object.values(this.props.gardenerVisitorHomes);
        var visitor = gardenerVisitorHomes.length>0? gardenerVisitorHomes : Object.values(this.props.visitorHomeList);
        
        //For the moment only show own home if there is at least one garden inside:
        visitor=visitor.filter((g)=>g.idUser!=this.props.data.user_id || g.gardens.length>0)

        //console.log("visitors", visitor);
        visitor.sort((a, b) => {
            if (a.userInfo.first_name.toUpperCase() < b.userInfo.first_name.toUpperCase()) {
                return -1;
            } else if (a.userInfo.first_name.toUpperCase() > b.userInfo.first_name.toUpperCase()) {
                return 1;
            } else if (a.userInfo.first_name.toUpperCase() == b.userInfo.first_name.toUpperCase()) {

                if (a.userInfo.last_name.toUpperCase() < b.userInfo.last_name.toUpperCase()) {
                    return -1;
                } else if (a.userInfo.last_name.toUpperCase() > b.userInfo.last_name.toUpperCase()) {
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
            }
            return 0;
        });

        for (var index in gardener) {
            var usersListData = Object.values(this.props.usersListData);
            var userFound = usersListData.find((n) => {
                return n.user_id == gardener[index].idUser
            });

            this._gardenerHomeADDList[gardener[index].id] = {gardener: gardener[index], component: null};
            if (indents.length == 0)
                this._firstHomeInList = gardener[index].id;
            indents.push(<HomeGardenerCard
                            ref={this.bindRefToHomeList(gardener[index].id)}
                            key={"gardenercard" + gardener[index].id}
                            pendingRequestActivation={userFound ? userFound.pending : false}
                            expired={userFound ? userFound.expired : false}
                            nalerts={gardener[index].genericInfo.alerts}
                            modalDelete={(visible, idUser, user) => this.setModalVisible(visible, idUser, user)}
                            modalModifyClientObject={(visible, idUser, user) => this.setModalClientObjectVisible(visible, idUser, user)}
                            homeInfo={gardener[index]}
                            idHome={gardener[index].id}
                            photoProfile={userFound ? userFound.photo_url : this.props.data.photo_url}
                            iduserGardener={gardener[index].idUser}
                            directAccess={this.props.asComponent?this.props.mode:false}
                            onDirectAccess={(idZone)=>{
                                this.setState({highlightedHomeId: null});
                            }}
                            marked={this.state.highlightedHomeId == gardener[index].id}
                            onMark={this.props.currentPath=='/app/fliwer'?(
                                (idHome) => {
                                    if(this.props.onMark)this.props.onMark(idHome)
                                }
                            ):null}
                            goToHome={(idhome, iduserGardener) => {
                                this.goToHomePress(idhome, iduserGardener, false);
                            }}
                            unfocused={(Platform.OS === 'web' && this.state.mapVisible && this.state.highlightedHomeId && this.state.highlightedHomeId!=gardener[index].id)}
                            onSelectUnfocused={(idHome) => {
                                console.log("onSelectUnfocused", idHome);
                                this.setState({highlightedHomeId: idHome});
                            }}
                        />);
        }

        var gardenerVisitorUsers = Object.values(this.props.gardenerVisitorUsers);
        var usersListData = gardenerVisitorUsers.length>0? gardenerVisitorUsers : Object.values(this.props.visitorsListData);
        //console.log("usersListData", usersListData);

        for (var index in visitor) {
            var userFound = usersListData.find((n) => {
                return n.user_id == visitor[index].idUser;
            });
            var isVisitorCard = userFound? true : false;
            if (!gardener.find((g) => {
                return visitor[index].id == g.id;
            }))
                indents.push(<HomeGardenerCard key={"visitorcard" + visitor[index].id} pendingRequestActivation={userFound ? userFound.pending : false} expired={userFound ? userFound.expired : false} nalerts={visitor[index].genericInfo.alerts} modalDelete={(visible, idUser, user) => this.setModalVisible(visible, idUser, user, true)}  homeInfo={visitor[index]} idHome={visitor[index].id} photoProfile={userFound ? userFound.photo_url : this.props.data.photo_url}
                                    iduserGardener={visitor[index].idUser}
                                    isVisitorCard={isVisitorCard}
                                    goToHome={(idhome, iduserGardener, isVisitorCard2) => {
                                        this.goToHomePress(idhome, iduserGardener, isVisitorCard2);
                                    }} />);
        }

        if (!this.state.goToHomeAtFirstJustOneTimeFlag) {
            this.state.goToHomeAtFirstJustOneTimeFlag = true;
            /*console.log("GO TO HOME at first time, just one time", this.props.checkGardeneridHome)
            setTimeout(() => {
                this.goToHome(this.props.checkGardeneridHome, true);
            }, 500);*/
        }

        return indents;
    }

    async deleteUserOnCare() {
        this.setState({loading: true});
        var users;

        if (this.state.isDeletingVisitor) {
            var gardenerVisitorUsers = Object.values(this.props.gardenerVisitorUsers);
            var usersListData = gardenerVisitorUsers.length>0? gardenerVisitorUsers : Object.values(this.props.visitorsListData);
            users = usersListData.filter((i) => {
               return i.user_id == this.state.idUser;
            });
        }
        else
        {
            users = Object.values(this.props.usersListData).filter((i) => {
                return i.user_id == this.state.idUser
            });
        }

        await this.props.actions.fliwerGardenerActions.wipeAllowRefreshGardenerHomes().then(async () => {
            if (users.length > 0)
            {
                if (this.state.isDeletingVisitor) {
                    await this.props.actions.fliwerVisitorActions.deleteVisitorUser(users[0].user_id).then(() => {
                        this.setState({loading: false});
                        this.setModalVisible(false);
                        toast.notification(this.props.actions.translate.get('GardenerHome_user_removed'));
                    }, (error) => {
                        this.setState({loading: false});
                        reject(error)
                    });

                } else {
                    await this.props.actions.fliwerGardenerActions.deleteGardenerUser(users[0].user_id).then(() => {
                          this.setState({loading: false});
                          this.setModalVisible(false);
                          toast.notification(this.props.actions.translate.get('GardenerHome_user_removed'));
                      }, (error) => {
                          this.setState({loading: false});
                          reject(error)
                      });
                }
            }
            else
            {
                this.setModalVisible(false);
                this.setState({loading: false});
            }
        });

    }

    setModalVisible(visible, idUser, user, isVisitor) {
        this.setState({modalVisible: visible, idUser: idUser, userInfo: user, isDeletingVisitor: visible ? isVisitor : false});
    }

    setModalClientObjectVisible(visible, idUser, user) {
        this.setState({modalClientObjectVisible: visible, idUser: idUser, userInfo: user});
    }

    renderMap() {
        if (!this.state.mapVisible)
            return [];
        else {
            return (<GardenerHomesMap
                        key={11}
                        onPress={(marker) => {
                            if (marker.id)
                                this.goToHome(marker.id);
                        }}
                        highlightedId={this.state.highlightedHomeId}
                    />
            );
        }
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
        loadingData: state.gardenerReducer.loadingData,
        wallet: state.sessionReducer.wallet
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

export default connect(mapStateToProps, mapDispatchToProps,null, { forwardRef: true })(mediaConnect(styles, GardenerHomes)); 
