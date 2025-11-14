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
    RefreshControl
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading'
import ZoneCard from './zoneCard.js'
import ZoneModify from './zoneModify.js'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'
import FliwerVerifyEmailModalGeneric from '../../components/custom/FliwerVerifyEmailModalGeneric.js'
import FliwerUpdateCountryModal from '../../components/custom/FliwerUpdateCountryModal.js'
import FliwerVerifyPhoneModalGeneric from '../../components/custom/FliwerVerifyPhoneModalGeneric.js'
import FliwerContractsModalWarning from '../../components/custom/FliwerContractsModalWarning.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../../components/custom/FliwerUpdateAppModal.js'
import { bindActionCreators } from 'redux';
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
import * as ActionAcademy from '../../actions/academyActions.js'; //Import your actions
import * as ActionGardener from '../../actions/gardenerActions.js';

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import { toast } from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import { FliwerColors } from '../../utils/FliwerColors'
import { FliwerStyles } from '../../utils/FliwerStyles'
import { FliwerCommonUtils } from '../../utils/FliwerCommonUtils'


import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton from '../../assets/img/add.png'
import { Orientation } from '../../utils/orientation/orientation'

class Zone extends Component {
    constructor(props) {
        super(props);

        this.state = {
            firstModifyZone: true,
            creatingZone: false,
            modalVisible: false,
            verifyVisible: false,
            updateCountryModalVisible: false,
            idZone: null,
            loading: false,
            modalModifyVisible: false,
            refreshing: false,
            allowShowVerifyPhoneModal: false,
            allowShowContractsModalWarning: false,
            petition: this.props.petition ? this.props.petition.id : null,
            hash: this.props.petition ? this.props.petition.hash : null,
            email: this.props.petition && this.props.petition.email ? this.props.petition.email : null,
            gotoInvitation: false,
            idInvitation: null,
            invitationErrorModalVisible: false,
            gardenerUsersList: Object.values(this.props.gardenerUsersList),
            goToHome: false,

            versionCode: this.props.versionCode,
            versionName: this.props.versionName,
            forceUpdateApp: this.props.forceUpdateApp,
            lastCheckedVersionTime: this.props.lastCheckedVersionTime,
            updateAppModalVisible: false
        };

        this._zoneRefList = {};

        Orientation.unlockAllOrientations();

        // Set home as visited at least once
        this.props.actions.fliwerZoneActions.setUserHomeHasBeenVisited(true).then(() => {
            if (!this.props.invitationChecked &&
                (this.state.petition === 'ticket' || this.state.petition === 'audit' || this.state.petition === 'sepa' || this.state.petition === 'invitation') &&
                this.state.hash) {

                this.props.actions.academyActions.getInvitation(this.state.petition, this.state.hash, this.state.email).then((data) => {
                    let gotoInvitation = this.state.petition != 'invitation' ? true : false;
                    let idInvitation = gotoInvitation ? data.id : null;
                    this.setState({ gotoInvitation: gotoInvitation, idInvitation: idInvitation });
                }, (err) => {
                    this.setState({ invitationErrorModalVisible: true });
                });
            }
            else {
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
        });

        if (this.props.isGardener && this.props.gardenerCheckidUser) {
            if (this.state.gardenerUsersList.length == 0)
                this.props.actions.fliwerGardenerActions.getGardenerUsers().then((resp) => {
                    this.state.gardenerUsersList = Object.values(this.props.gardenerUsersList);
                    // Add the own gardener
                    this.state.gardenerUsersList.push(this.props.data);
                    this.setState({ gardenerUsersList: this.state.gardenerUsersList });
                });
            else {
                // Add the own gardener
                this.state.gardenerUsersList.push(this.props.data);
                this.setState({ gardenerUsersList: this.state.gardenerUsersList });
            }
        }

    }

    bindRefToZoneList(idZone) {
        return (ref) => {
            this._zoneRefList[idZone] = ref;
        }
    }

    render() {
        if (this.state.creatingZone) {
            //console.log("REDIRECT TO NEW ZONE");
            return (<Redirect push to={"/zone/new"} />);
        } else if (!this.props.preloadedData /* && !this.props.loadedStorageData*/) {
            //console.log("NOT PRELOADEDDATA");
            var topBarData = this.getMainFliwerTopBarData();

            var icons = [];
            if (this.props.isGardener)
                icons.push("gardener");
            icons.push("zone", "files", "academy");

            return (
                <ImageBackground source={(!global.envVars.TARGET_RAINOLVE ? background : rainolveBackground)} resizeMode={"cover"}>
                    <MainFliwerTopBar showTextBar={true}
                        mode={topBarData.mode} title={topBarData.title}
                    />
                    <FliwerLoading />
                    <View style={{ width: "100%", flex: 1 }}></View>
                    <MainFliwerMenuBar idZone={this.state.idZone} current={"zone"} icons={icons} />
                </ImageBackground>
            );

        } else if (this.state.goAcademy) {
            //console.log("REDIRECT TO ACADEMYCOURSES");
            return (<Redirect push to={"/academyCourses"} />);
        } else if (this.state.goWallet) {
            return (<Redirect push to={"/wallet"}/>)
        } else if (this.state.gotoInvitation) {
            var route = this.state.petition == 'ticket' || this.state.petition == 'audit' ? 'audit' : 'sepa';
            return (<Redirect push to={"/" + route + "/" + this.state.idInvitation} />);
        } else if (this.state.goToHome) {
            this.state.goToHome = false;
            return (<Redirect push to={"/zone/"} />)
        } else {
            //console.log("RENDERING ZONES");
            var loading = (Platform.OS == 'web' ? (this.state.loading || this.state.refreshing) : (this.state.loading));

            var phoneVerificationEnabled = true; //(Platform.OS == 'web')
            var showUpdateCountryModal = this.props.data && !this.props.data.country;
            if (!showUpdateCountryModal && !this.props.isVisitor) {
                if (this.props.isGardener || !phoneVerificationEnabled)
                    this.state.allowShowContractsModalWarning = true;
                else {
                    this.state.allowShowVerifyPhoneModal = true;
                    if (this.state.allowShowVerifyPhoneModal && !this.props.data.phoneVerificationIsNeeded)
                        this.state.allowShowContractsModalWarning = true;
                }
            }

            var topBarData = this.getMainFliwerTopBarData();

            var icons = [];
            if (this.props.isGardener)
                icons.push("gardener");
            icons.push("zone", "files", "academy");

            var arrowsEnabled = topBarData.mode == "zone" ? true : false;

            return (
                <ImageBackground source={(!global.envVars.TARGET_RAINOLVE ? background : rainolveBackground)} resizeMode={"cover"} loading={loading}>
                    <MainFliwerTopBar showTextBar={true}
                        mode={topBarData.mode} title={topBarData.title} onPressNextGarden={arrowsEnabled ? this.nextZone : null} onPressPreviousGarden={arrowsEnabled ? this.previousZone : null}
                    />
                    <ScrollView scrollEventThrottle={1000} style={{ flex: 1 }} refreshControl={< RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                        this.refreshZones()
                    }} />}>
                        <CardCollection style={this.style.collection}>
                            {this.renderZones()}
                        </CardCollection>
                    </ScrollView>
                    <MainFliwerMenuBar idZone={this.state.idZone} current={"zone"} icons={icons} />
                    {false ? <TouchableOpacity style={this.style.viewAcademy} activeOpacity={1} onMouseEnter={this.hoverIn('viewAcademy')} onMouseLeave={this.hoverOut('viewAcademy')} onPress={() => {
                        this.setState({ goAcademy: true })
                    }}>
                        <Icon2 name="school" color={"white"} size={44} style={[this.style.academyIcon]} ></Icon2>
                    </TouchableOpacity> : null}

                    <TouchableOpacity style={this.style.viewWallet} activeOpacity={1} onPress={() => {
                                            this.setState({goWallet: true})
                                        }}>
                        <Icon3 name="wallet" color={"white"} size={35} style={[this.style.walletIcon]} ></Icon3>
                    </TouchableOpacity>

                    {false ? <TouchableOpacity style={this.style.addZone} activeOpacity={1} onMouseEnter={this.hoverIn('addZone')} onMouseLeave={this.hoverOut('addZone')}
                        onPress={() => {
                            this.addZone();
                        }}>
                        <Image style={this.style.addZoneImg} resizeMode={"contain"} source={addButton} />
                    </TouchableOpacity> : null}
                    {this.getFliwerDeleteModal()}
                    {this.state.idZone ? this.renderModalZone() : null}
                    {this.getFliwerVerifyEmailModalGeneric()}
                    {this.checkModal()}
                    {showUpdateCountryModal ? this.getFliwerUpdateCountryModal() : null}
                    {this.state.allowShowVerifyPhoneModal ? this.getFliwerVerifyPhoneModalGeneric() : null}
                    {this.state.allowShowContractsModalWarning ?
                        <FliwerContractsModalWarning
                            enabled={!loading}
                            loadingModal={this.state.loading}
                        /> : null}
                    {this.state.invitationErrorModalVisible ? this.renderInvitationErrorModal() : null}
                    {this.renderUpdateAppModal()}
                </ImageBackground>
            );
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

    renderInvitationErrorModal() {
        return (
            <Modal animationType="fade" loadingModal={false} inStyle={[FliwerStyles.modalIn, { maxWidth: 400 }]} visible={this.state.invitationErrorModalVisible} onClose={() => {
                this.setState({ invitationErrorModalVisible: false });
            }}>
                <View style={[FliwerStyles.modalView, {}]
                }>
                    <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{ justifyContent: "space-between" }}>
                        <View style={{ width: "100%", alignItems: "center" }}>

                            <Text style={FliwerStyles.titleStyle} >{this.props.actions.translate.get('Invitation_we_are_sorry')}</Text>
                            <Text style={[FliwerStyles.littleTextStyle, { marginTop: 20 }]} >{this.props.actions.translate.get('Invitation_error_accessing_link')}</Text>

                            <View style={{ alignSelf: "center", marginTop: 20 }}>
                                <FliwerGreenButton
                                    text={this.props.actions.translate.get('accept')}
                                    style={[FliwerStyles.fliwerGreenButtonStyle, {}]}
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, { marginBottom: 0, width: 150 }]}
                                    onPress={() => {
                                        this.setState({ invitationErrorModalVisible: false });
                                    }} />
                            </View>

                        </View>
                    </ScrollView>
                </View>
            </Modal>
        );
    }

    setModalVisible(visible, idZone) {
        this.setState({ modalVisible: visible, idZone: idZone });
    }

    setVerifyVisible(visible, idGarden, idZone, zoneInformation, isDelete) {
        this.setState({ verifyVisible: visible, verifyInformation: { idGarden: idGarden, idZone: idZone, zoneInformation: zoneInformation, isDelete: isDelete } });
    }


    setModalModifyVisible(visible, idZone) {
        if (this.props.isVisitor)
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
        else {
            this.setState({ modalModifyVisible: visible, idZone: idZone });
        }
    }

    async deleteGarden(password) {

        //console.log("this.props.zoneData", this.props.zoneData, this.state.idZone);

        //var idZo = this.state.idZone;
        var idGarden = this.props.zoneData[this.state.idZone].idImageDash;
        //console.log("idGarden", idGarden);

        await this.props.actions.fliwerGardenActions.deleteGarden(idGarden, password).then(() => {
            this.setState({ loading: false })
            this.setModalVisible(false);
        }, (err) => {
            console.log("err", err);
            this.setState({ loading: false })
            if (err.id == 130)
                toast.error(this.props.actions.translate.get('FliwerErrors_last_garden'));
            else if (err && err.reason)
                toast.error(err.reason);
        })
    }

    async sendMailRequestDelete() {
        this.setState({ loading: true })
        this.setModalVisible(false);
        await this.props.actions.fliwerZoneActions.sendMailRequestDelete({ idZone: this.state.idZone }).then(() => {
            this.setModalVisible(false);
            this.setState({ loading: false });
            toast.notification(this.props.actions.translate.get('RequestDelete_send'));
        }, (err) => {
            this.setState({ loading: false });
            if (err && err.reason)
                toast.error(err.reason);
        })

    }

    modalClosed() {
        this.setState({ modalModifyVisible: false });
        if (this.props.modifyingZone.modifying)
            this.props.actions.modifyZoneActions.stopModifyingZone();
    }

    refreshZones() {

        this.state.refreshing = true;
        this.props.actions.sessionActions.wrongData2().then(() => {
            this.state.refreshing = false;
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
            this.state.refreshing = false;
        })
    }

    checkModal() {
        if (this.props.modifyingZone.modifying && this.state.firstModifyZone)
            this.setState({ modalModifyVisible: true, idZone: this.props.modifyingZone.idZone, firstModifyZone: false });
    }
    

    getFliwerDeleteModal() {

        let passwordIsNeeded = (this.props.data.country !== 'KR');

        return (
            <FliwerDeleteModal
                visible={this.state.modalVisible}
                onClose={() => {
                    this.setModalVisible(false, this.state.idZone);
                }}
                onConfirm={async (password) => {
                    await this.deleteGarden(password)
                }}
                onMailRequestDelete={async () => {
                    await this.sendMailRequestDelete()
                }}
                title={this.props.actions.translate.get('masterVC_garden_remove_title')}
                requestSupport={true}
                password={passwordIsNeeded}
                loadingModal={this.state.loading}
            />
        );
    }

    getFliwerVerifyEmailModalGeneric() {
        return (
            <FliwerVerifyEmailModalGeneric
                visible={this.state.verifyVisible}
                nested={true}
                onFinalize={() => {
                    if (this.state.verifyInformation && this.state.verifyInformation.isDelete) {
                        this.setState({ verifyVisible: false, loading: false });
                        var sortedZones = Object.values(this.props.zoneData);

                        sortedZones.sort((a, b) => {
                            if(!this.props.gardenData[a.idImageDash])return -1;
                            if(!this.props.gardenData[b.idImageDash])return 1;
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
                        this._zoneRefList[sortedZones[this.state.verifyInformation.indexZone].idZone].toggle()();


                    } else {
                        this.props.actions.modifyZoneActions.removeMap();
                        this.props.actions.createZoneActions.removePhotoZone();
                        toast.notification(this.props.actions.translate.get("modifyGarde_modify_correct"));
                        this.modalClosed()
                        this.setState({ verifyVisible: false, loading: false });
                    }

                }}
                loadingModal={false}
                email={this.props.data.email}
                setLoading={this.setLoading()}
                onAction={(uuid, verificationCode) => {
                    if (this.state.verifyInformation && this.state.verifyInformation.isDelete) {
                        //mira el modal s'ha obert desde borrar o modificar
                        var sortedZones = Object.values(this.props.zoneData);

                        sortedZones.sort((a, b) => {
                            if(!this.props.gardenData[a.idImageDash])return -1;
                            if(!this.props.gardenData[b.idImageDash])return 1;
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
                        this.state.verifyInformation.indexZone = sortedZones.findIndex(z => {
                            return z.idZone == this.state.verifyInformation.idZone;
                        })


                        return this.props.actions.fliwerGardenActions.deleteGarden(this.state.verifyInformation.idGarden, uuid, verificationCode);

                    } else {
                        return this.props.actions.fliwerGardenActions.modifyZoneInformation(this.state.verifyInformation.idGarden, this.state.verifyInformation.idZone, this.state.verifyInformation.zoneInformation, uuid, verificationCode);
                    }
                }}
                onError={(err) => {
                    if (err && err.reason)
                        toast.error(err.reason);
                    this.setState({ loading: false, loading: false });
                }}
                onCancel={() => {
                    this.setState({ verifyVisible: false, loading: false });
                }}
            />
        );
    }

    getFliwerUpdateCountryModal() {

        this.state.updateCountryModalVisible = !this.props.data.country;
        // this.state.updateCountryModalVisible = true; // Test

        return (
            <FliwerUpdateCountryModal
                visible={this.state.updateCountryModalVisible}
                onClose={() => {

                }}
                onConfirm={(country) => {
                    this.updateCountry(country);
                }}
                requestSupport={true}
                loadingModal={this.state.loading}
            />
        );
    }

    updateCountry(country) {
        if (!country) {
            return;
        }

        this.props.actions.sessionActions.updateProfileWithoutNotifications({
            email: this.props.data.email,
            first_name: this.props.data.first_name,
            last_name: this.props.data.last_name,
            country: country,
            pushNotificationLevel: this.props.data.pushNotificationLevel
        }).then(() => {
            this.props.data.country = country;
            this.setState({ updateCountryModalVisible: false, allowShowVerifyPhoneModal: true });
        }, (err) => {
            toast.error(err.reason);
        });
    }

    getFliwerVerifyPhoneModalGeneric() {

        return (
            <FliwerVerifyPhoneModalGeneric
                visible={this.props.data.phoneVerificationIsNeeded && !this.props.phoneVerificationIsCancelled && !this.props.isGardener && !this.props.isVisitor}
                onFinalize={() => {
                    this.props.data.phoneVerificationIsNeeded = false;
                    this.setState({ allowShowContractsModalWarning: true });
                }}
                loadingModal={false}
                country={this.props.data.country}
                title={this.props.actions.translate.get('PhoneAuth_verify_your_phone_number')}
                subtitle={this.props.actions.translate.get('PhoneAuth_tell_us_your_phone_we_can_help_you')}
                smsInfo={this.props.actions.translate.get('PhoneAuth_first_send_yourself_sms')}
                cancelText={this.props.actions.translate.get('PhoneAuth_i_wanna_do_later')}
                phone={this.props.data.phone}
                setLoading={this.setLoading()}
                onSuccess={(phoneData) => {

                    this.setLoading()(true);

                    this.props.actions.sessionActions.updateProfileWithoutNotifications({
                        email: this.props.data.email,
                        first_name: this.props.data.first_name,
                        last_name: this.props.data.last_name,
                        phone: phoneData.verifiedPhone,
                        lastPhoneVerification: phoneData.verificationTime,
                        pushNotificationLevel: this.props.data.pushNotificationLevel
                    }).then(() => {
                        this.props.data.phone = phoneData.verifiedPhone;
                        this.setLoading()(false);
                        resolve();
                    }, (err) => {
                        this.setLoading()(false);
                        reject(err.reason ? err.reason : err);
                    });

                }}
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

    renderModalZone() {
        if (this.state.modalModifyVisible) {
            return (<ZoneModify
                modalFunc={(v, id) => this.setModalVisible(v, id)}
                modifyFunc={(idGarden, idZone, zoneInformation) => this.setVerifyVisible(true, idGarden, idZone, zoneInformation, false)}
                deleteFunc={(idGarden, idZone) => {
                    
                    this.props.actions.sessionActions.checkEmailVerificationSession().then((result)=>{
                        if(result.verifiedEmail){
                            this.setVerifyVisible(true, idGarden, idZone, null, true)
                        } else{
                            this.setModalVisible(true, idZone);
                        }
                    });
                }}
                loading={() => this.setState({ loading: true })}
                loadingOff={() => this.setState({ loading: false })}
                idZone={this.state.idZone}
                visible={Platform.OS == 'ios'?(this.state.modalModifyVisible && !this.state.verifyVisible):this.state.modalModifyVisible}
                modalClosed={() => {
                    this.modalClosed()
                }}
            />)
        } else
            return []
    }

    renderZones() {
        var indents = [];
        var requestedData = false;
        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if(!this.props.gardenData[a.idImageDash])return -1;
            if(!this.props.gardenData[b.idImageDash])return 1;
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


        for (var index in sortedZones) {
            var zone = sortedZones[index];
            //console.log("Zone", zone);
            if (!zone) {
                if (!requestedData) {
                    this.props.actions.sessionActions.wrongData();
                    requestedData = true;
                }
            } else {
                var garden = this.props.gardenData[zone.idImageDash];
                //console.log("Garden", garden);
                //console.log("gardenData", this.props.gardenData);
                if (!garden) {
                    if (!requestedData) {
                        this.props.actions.sessionActions.wrongData();
                        requestedData = true;
                    }
                } else {
                    var home = this.props.homeData[garden.idHome];
                    //console.log("Home", home);
                    //console.log("homeData", this.props.homeData);
                    if (!home) {
                        if (!requestedData) {
                            this.props.actions.sessionActions.wrongData();
                            requestedData = true;
                        }
                    } else {
                        var nalerts = 0;
                        for (var info in zone.genericInfo.sensors) {
                            nalerts += zone.genericInfo.sensors[info].alerts
                        }

                        //console.log("checkGardeneridHome", this.props.checkGardeneridHome);
                        //console.log("checkVisitoridHome", this.props.checkVisitoridHome);
                        
                        if (this.props.checkGardeneridHome || this.props.checkVisitoridHome) {
                            //console.log("this.props.gardenData[zone.idImageDash].idHome", this.props.gardenData[zone.idImageDash].idHome);
                            //console.log("this.props.checkGardeneridHome", this.props.checkGardeneridHome);
                            //console.log("this.props.checkVisitoridHome", this.props.checkVisitoridHome);
                            if (this.props.gardenData[zone.idImageDash].idHome == this.props.checkGardeneridHome || this.props.gardenData[zone.idImageDash].idHome == this.props.checkVisitoridHome)
                                indents.push(<ZoneCard key={index} ref={this.bindRefToZoneList(zone.idZone)} idZone={zone.idZone} idHome={zone.idHome} homeName={home.name} deviceSerialNumber={zone.DeviceSerialNumber} title={zone.name} subtitle={(home.nameCity ? home.nameCity : "") + (home.meteo ? (" · " + home.meteo.temperature + "º" + " · " + home.meteo.airHumidity + "% hum") : "-")} image={garden.imageName ? garden.imageName : home.imageName} alerts={nalerts} modalFunc={(v, p) => this.setModalModifyVisible(v, p)}
                                    modalClosed={() => {
                                        this.modalClosed();
                                    }} />);
                        } else
                            indents.push(<ZoneCard key={index} ref={this.bindRefToZoneList(zone.idZone)} idZone={zone.idZone} idHome={zone.idHome} homeName={home.name} deviceSerialNumber={zone.DeviceSerialNumber} title={zone.name} subtitle={(home.nameCity ? home.nameCity : "--") + (home.meteo ? (" · " + home.meteo.temperature + "º" + " · " + home.meteo.airHumidity + "% hum") : "")} image={garden.imageName ? garden.imageName : home.imageName} alerts={nalerts} modalFunc={(v, p) => this.setModalModifyVisible(v, p)}
                                modalClosed={() => {
                                    this.modalClosed();
                                }} />);


                    }
                }
            }
        }

        // Add new card
        if (!this.state.loading && !this.state.refreshing)
            indents.push(
                <ZoneCard key={999} idZone={null}
                    touchableFront={false}
                    onPressAdd={() => this.addZone()}
                />
            );

        return indents;

    }

    addZone() {
        if (this.props.isVisitor)
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
        else {
            this.props.actions.createZoneActions.createNewZone();
            this.setState({ creatingZone: true })
        }
    }

    getMainFliwerTopBarData() {
        var mode = "", title = "";

        if (this.props.isGardener) {
            //mode = "zone";
            //            console.log("this.props.zoneData", this.props.zoneData)
            //            console.log("this.props.homeData", this.props.homeData)
            //            console.log("this.props.gardenData", this.props.gardenData)
            //            console.log("this.props.checkGardeneridHome", this.props.checkGardeneridHome);
            //            console.log("this.props.gardenerCheckidUser", this.props.gardenerCheckidUser);
            //            console.log("this.props.gardenerUsersList", this.props.gardenerUsersList);

            if (this.state.gardenerUsersList.length > 0 && this.props.gardenerCheckidUser) {
                for (let key in this.state.gardenerUsersList) {
                    let user = this.state.gardenerUsersList[key];
                    if (user.user_id == this.props.gardenerCheckidUser) {
                        title = user.first_name;
                        //                        if (user.last_name)
                        //                            title += " " + user.last_name;
                        break;
                    }
                }
            }

            if (this.props.checkGardeneridHome && this.props.homeData[this.props.checkGardeneridHome]) {
                var homeName = this.props.homeData[this.props.checkGardeneridHome].name;
                if (title != homeName) {
                    if (title) title += " - ";
                    title += this.props.homeData[this.props.checkGardeneridHome].name;
                }
            }

        }

        if (!title)
            title = this.props.data.first_name + " " + this.props.data.last_name;

        if (!mode && this.props.isGardener && this.props.checkGardeneridHome && Object.keys(this.props.homeData).length > 1) {
            mode = "zone";
        }

        return {
            mode: mode,
            title: title
        };
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

    nextZone = () => {

        if (this.props.checkGardeneridHome && Object.keys(this.props.homeData).length > 0) {
            var get = false;
            var nextIdHome = null;
            var firstIdHome = null;
            for (var index in this.props.homeData) {
                if (firstIdHome == null)
                    firstIdHome = index;
                if (get && nextIdHome == null)
                    nextIdHome = index;
                if (!get && index == this.props.checkGardeneridHome)
                    get = true;
            }
            if (nextIdHome == null)
                nextIdHome = firstIdHome;

            this.gotToHome(nextIdHome);
        }
    }

    previousZone = () => {

        if (this.props.checkGardeneridHome && Object.keys(this.props.homeData).length > 0) {
            var lastIdHome = null;
            var previousIdHome = null;
            for (var index in this.props.homeData) {
                if (lastIdHome != null && index == this.props.checkGardeneridHome)
                    previousIdHome = lastIdHome;
                lastIdHome = index;
            }
            if (previousIdHome == null)
                previousIdHome = lastIdHome;

            this.gotToHome(previousIdHome);
        }

    }

    gotToHome(idHome) {
        if (!this.props.checkVisitoridHome)
            this.props.actions.sessionActions.addGardenerUserID(this.props.gardenerCheckidUser, idHome);
        else
            this.props.actions.sessionActions.addVisitorUserID(this.props.gardenerCheckidUser, idHome);

        this.setState({
            firstModifyZone: true,
            creatingZone: false,
            modalVisible: false,
            updateCountryModalVisible: false,
            idZone: null,
            loading: false,
            modalModifyVisible: false,
            refreshing: false,
            allowShowVerifyPhoneModal: false,
            allowShowContractsModalWarning: false,
            petition: this.props.petition ? this.props.petition.id : null,
            hash: this.props.petition ? this.props.petition.hash : null,
            email: this.props.petition && this.props.petition.email ? this.props.petition.email : null,
            gotoInvitation: false,
            idInvitation: null,
            invitationErrorModalVisible: false,
            gardenerUsersList: Object.values(this.props.gardenerUsersList),
            goToHome: false,

            versionCode: this.props.versionCode,
            versionName: this.props.versionName,
            forceUpdateApp: this.props.forceUpdateApp,
            lastCheckedVersionTime: this.props.lastCheckedVersionTime,
            updateAppModalVisible: false
        })

        //this.setState({goToHome: true});
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        data: state.sessionReducer.data,
        preloadedData: state.sessionReducer.preloadedData,
        preloadedUntilZones: state.sessionReducer.preloadedUntilZones,
        loadedStorageData: state.sessionReducer.loadedStorageData,
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
        homeLoading: state.fliwerHomeReducer.loading,
        homeData: state.fliwerHomeReducer.data,
        gardenLoading: state.fliwerGardenReducer.loading,
        gardenData: state.fliwerGardenReducer.data,
        zoneLoading: state.fliwerZoneReducer.loading,
        zoneData: state.fliwerZoneReducer.data,
        creatingZone: state.createZoneReducer.creating,
        modifyingZone: state.modifyZoneReducer,
        checkGardeneridHome: state.sessionReducer.gardenerCheckidHome,
        checkVisitoridHome: state.sessionReducer.visitorCheckidHome,
        isVisitor: state.sessionReducer.visitorCheckidUser,
        phoneVerificationIsCancelled: state.sessionReducer.phoneVerificationIsCancelled,
        isGardener: state.sessionReducer.isGardener,
        petition: state.sessionReducer.petition,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        versionCode: state.sessionReducer.versionCode,
        versionName: state.sessionReducer.versionName,
        forceUpdateApp: state.sessionReducer.forceUpdateApp,
        checkedVersion: state.sessionReducer.checkedVersion,
        lastCheckedVersionTime: state.sessionReducer.lastCheckedVersionTime,
        gardenerUsersList: state.gardenerReducer.usersListData,
        invitationChecked: state.academyReducer.invitationChecked
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
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),

        }
    };
}

//Connect everything

var styles = {
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
        addZone: {
            backgroundColor: "#f8ff7d"
        },
        viewAcademy: {
            backgroundColor: FliwerColors.complementary.skyblue
        },
    }
};



export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, Zone));
