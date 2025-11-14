'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
    Animated,
    Dimensions
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading.js'
import ClientProviderCard from '../business/clientProviderCard.js'
import CardCollection from '../custom/cardCollection.js'
import ImageBackground from '../imageBackground.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerContractsModalWarning from '../custom/FliwerContractsModalWarning.js'
import FliwerVerifyPhoneModal from '../custom/FliwerVerifyPhoneModal.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerUpdateAppModal from '../custom/FliwerUpdateAppModal.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import BusinessBar from './businessBar.js'

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsModifyZone from '../../actions/modifyZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions
import * as ActionAcademy from '../../actions/academyActions.js'; //Import your actions
import * as ActionPoly from '../../actions/polyActions.js';

import {toast} from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import ClientObjectModal from '../gardener/ClientObjectModal.js'
import {FliwerColors,CurrentTheme} from '../../utils/FliwerColors.js'
import {FliwerStyles} from '../../utils/FliwerStyles.js'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import { CheckBox  } from 'react-native-elements'


import {Orientation} from '../../utils/orientation/orientation'

class BusinessClients extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goToHome: null,
            goToFiles:false,
            loading: !this.props.preloadedData,
            refreshing: false,
            idHome: null,
            goADDusers: false,
            modalVisible: false,
            modalClientObjectVisible:false,
            idUser: null,
            pan: new Animated.ValueXY(),
            marginTopPan: new Animated.Value(0),
            marginBottomPan: new Animated.Value(0),
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
            updateAppModalVisible: false,
            editModalVisible: false,
            editEmployeeData:{}
        };

        //this._gardenerHomeADDList = {};


    }

    componentDidMount() {
        //console.log("componentDidMount this.props.userData.phone", this.props.userData.phone);

        this.setState({ loading: true });
        this.props.actions.fliwerGardenerActions.getGardenerUsers().then((response2) => {
            this.setState({ loading: false });
            //this.forceUpdate();
        }, (err) => {
            this.setState({ loading: false });
            if (err && err.reason)
                toast.error(err.reason);
        });
    
    }
    
    componentDidUpdate(prevProps) {

        if (this.props.preloadedData && !prevProps.preloadedData) {
            this.setState({loading: false, disablePreloading: false});
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


    render() {
        if (this.state.goADDusers) {
            return (<Redirect push to={"/business/clients/add"} />)
        } else if (this.state.goAcademy) {
            return (<Redirect push to={"/academyCourses"}/>)
        } else if (this.state.goToHome) {
            this.state.goToHome = false;
            return (<Redirect push to={"/zone/"} />)
        } else if (this.state.goToFiles) {
            return (<Redirect push to={"/files"}/>)
        } else if (!this.state.disablePreloading && (!this.props.preloadedData || this.state.refreshGardenerHomesInitializing)) {
            var icons = [
                "gardener",
                "zone", "files", "academy"];

            return (
                <ImageBackground style={{backgroundColor:CurrentTheme.secondaryColor}}  resizeMode={"cover"}>
                    <FliwerLoading/>
                    <View style={{width: "100%", flex: 1}}></View>
                </ImageBackground>
            );
        } else if (this.state.gotoInvitation) {
            var route = this.state.petition == 'ticket' || this.state.petition == 'audit'? 'audit' : 'sepa';
            return (<Redirect push to={"/" + route + "/" + this.state.idInvitation} />);
        } else {

            var loading = (Platform.OS == 'web' ? (this.state.loading || this.state.refreshing) : (this.state.loading));

            var phoneVerificationEnabled = true; //(Platform.OS == 'web')
            if (!this.props.isGardener || !phoneVerificationEnabled)
                this.state.allowShowContractsModalWarning = true;
            else {
                this.state.allowShowVerifyPhoneModal = true;
                if (this.state.allowShowVerifyPhoneModal && !this.props.data.phoneVerificationIsNeeded)
                    this.state.allowShowContractsModalWarning = true;
            }

            var icons = [
                "gardener",
                "zone", "files", "academy"];
            //if (Object.values(this.props.gardensOnCare).length > 0)

            const dimensions = Dimensions.get('window');
            var isPortrait = (dimensions.height > dimensions.width);
            
            return (
                <ImageBackground  style={{ backgroundColor: CurrentTheme.primaryView }} resizeMode={"cover"} loading={loading}>


                    <View style={{flexDirection: isPortrait? "column" : "row", flex: 1}} >
                        <ScrollView
                            ref={(s) => {
                                this._scrollView = s;
                            }} scrollEventThrottle={1000}
                            style={{flex: 1}}
                            onScroll={({nativeEvent}) => {
                                //this.state.lastScrollContentY = nativeEvent.contentOffset.y;
                            }}
                            refreshControl={ < RefreshControl refreshing = {this.state.refreshing} onRefresh = {() => {
                                //this.refreshGardenerHomes()
                            }} /> }>
                            <CardCollection style={this.style.collection}>

                                { this.renderClients() }
                                
                            </CardCollection>
                        </ScrollView>
                    </View>
    
                    <FliwerDeleteModal
                        visible={this.state.modalVisible}
                        onClose={() => {
                            this.setModalVisible(false, this.state.idUser);
                        }}
                        onConfirm={async (password) => {
                            await this.deleteUserOnCare(password)
                        }}
                        title={this.props.actions.translate.get('masterVC_remove_user_gardener')}
                        hiddeText={true}
                        password={false}
                        loadingModal={this.state.loading}
                        />

                    {this.state.invitationErrorModalVisible ? this.renderInvitationErrorModal() : null}

                    {this.renderClientObjectModal()}

                </ImageBackground>
            );

        }

    }

    addUser() {
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

    renderEditModalClients(){
        var indents = [];
        var gardenerUsers=this.props.usersListData;
 
        if(gardenerUsers){
            
            gardenerUsers=Object.values(gardenerUsers).sort((a,b)=>{return (a.first_name+" "+a.last_name).localeCompare(b.first_name+" "+b.last_name)})

            for(var i=0;i<gardenerUsers.length;i++){
                ((i)=>{
                    indents.push(
                        <View style={this.style.modalOptionsSelectorItem}>
                            <TouchableOpacity onPress={()=>{
                                    var clients = this.state.editEmployeeData.gardenerUsers;

                                    var index = clients.indexOf(gardenerUsers[i].user_id);
                                    if(index>=0){
                                        clients.splice(index,1);
                                    }else{
                                        clients.push(gardenerUsers[i].user_id);
                                    }
                                    var editEmployeeData = this.state.editEmployeeData;
                                    editEmployeeData.gardenerUsers=clients;
                                    this.setState({editEmployeeData: editEmployeeData});
                            }}>
                                <Image source={{uri:gardenerUsers[i].photo_url}} resizeMode={"cover"} style={this.style.modalOptionsSelectorItemImage} />
                            </TouchableOpacity>
                            <CheckBox
                                title={gardenerUsers[i].first_name+" "+gardenerUsers[i].last_name}
                                textStyle={[this.style.modalInputCheckboxText,this.style.modalOptionsSelectorItemCheckboxText]}
                                containerStyle={[this.style.modalInputCheckbox,this.style.modalOptionsSelectorItemCheckbox]}
                                checked={this.state.editEmployeeData.gardenerUsers && this.state.editEmployeeData.gardenerUsers.indexOf(gardenerUsers[i].user_id)>=0? true : false}
                                onPress={()=>{
                                    var clients = this.state.editEmployeeData.gardenerUsers;

                                    var index = clients.indexOf(gardenerUsers[i].user_id);
                                    if(index>=0){
                                        clients.splice(index,1);
                                    }else{
                                        clients.push(gardenerUsers[i].user_id);
                                    }
                                    var editEmployeeData = this.state.editEmployeeData;
                                    editEmployeeData.gardenerUsers=clients;
                                    this.setState({editEmployeeData: editEmployeeData});
                                }}
                            />
                        </View>
                    )
                })(i)
            }

        }
        
        return indents;
    }

    renderEditModalEmployees(){
        var indents = [];
        
        
        var employees= this.props.employees;
 
        if(employees){
            
            employees=Object.values(employees).sort((a,b)=>{return (a.first_name+" "+a.last_name).localeCompare(b.first_name+" "+b.last_name)})
            
            for(var i=0;i<employees.length;i++){
                ((i)=>{
                    indents.push(
                        <View style={this.style.modalOptionsSelectorItem}>
                            <TouchableOpacity onPress={()=>{
                                    var clients = this.state.editEmployeeData.employees;

                                    var index = clients.indexOf(employees[i].user_id);
                                    if(index>=0){
                                        clients.splice(index,1);
                                    }else{
                                        clients.push(employees[i].user_id);
                                    }
                                    var editEmployeeData = this.state.editEmployeeData;
                                    editEmployeeData.employees=clients;
                                    this.setState({editEmployeeData: editEmployeeData});
                            }}>
                                <Image source={{uri:employees[i].image}} resizeMode={"cover"} style={this.style.modalOptionsSelectorItemImage} />
                            </TouchableOpacity>
                            <CheckBox
                                title={employees[i].first_name+" "+employees[i].last_name}
                                textStyle={[this.style.modalInputCheckboxText,this.style.modalOptionsSelectorItemCheckboxText]}
                                containerStyle={[this.style.modalInputCheckbox,this.style.modalOptionsSelectorItemCheckbox]}
                                checked={this.state.editEmployeeData.employees && this.state.editEmployeeData.employees.indexOf(employees[i].user_id)>=0? true : false}
                                onPress={()=>{
                                    var clients = this.state.editEmployeeData.employees;

                                    var index = clients.indexOf(employees[i].user_id);
                                    if(index>=0){
                                        clients.splice(index,1);
                                    }else{
                                        clients.push(employees[i].user_id);
                                    }
                                    var editEmployeeData = this.state.editEmployeeData;
                                    editEmployeeData.employees=clients;
                                    this.setState({editEmployeeData: editEmployeeData});
                                }}
                            />
                        </View>
                    )
                })(i)
            }

        }
        
        return indents;
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
        };
    }

    renderClients() {
        var indents = [];

        var usersListData = this.props.usersListData?Object.values(this.props.usersListData):[];
        usersListData=usersListData.filter(user=>!user.clientObject || user.clientObject.isClient || (!user.clientObject.isClient && !user.clientObject.isProvider) )
       
        for (var index in usersListData) {
            indents.push(<ClientProviderCard key={"employee_card_"+usersListData[index].user_id} 
                idUser={usersListData[index].user_id} 
                modalDelete={(visible, idUser) => this.setModalVisible(visible, idUser)}
                modalModifyClientObject={(visible, idUser, user) => this.setModalClientObjectVisible(visible, idUser, user)}
                onPress={(user)=>{
                    this.props.actions.sessionActions.addGardenerUserID(user.user_id);
                    this.setState({goToFiles: true});
                }}
            />);
        }

        // Add + employee
        if (!this.state.loading && !this.state.refreshing)
            indents.push(
                <ClientProviderCard
                    key={999}
                    onPressAdd={()=> {this.setState({goADDusers: true})}}
                    />
             );



        return indents;
    }

    setModalVisible(visible, idUser) {
        this.setState({modalVisible: visible,modalClientObjectVisible:false, idUser: idUser});
    }
    
    setModalClientObjectVisible(visible, idUser, user) {
        
        this.setState({modalClientObjectVisible: visible,modalVisible:false, idUser: idUser, userInfo: user});
    }

    renderClientObjectModal(){

        if(!this.state.modalClientObjectVisible)
            return null;
        
        return (
            <ClientObjectModal 
                visible={this.state.modalClientObjectVisible}
                type={"gardener"}
                onClose={()=>{this.setState({modalClientObjectVisible: false})}}
                onLoading={(loading)=>{this.setState({loading:loading})}}
                onConfirm={(client)=>{
                    this.setState({loading: true});
                    this.props.actions.sessionActions.refreshEmployees().then(()=>{
                        this.setState({loading: false,modalClientObjectVisible:false});
                    });
                }}
                idUser={this.state.idUser}
            />)
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
        userListLoaded: state.gardenerReducer.userListLoaded,
        allowRefreshGardenerHomes: state.gardenerReducer.allowRefreshGardenerHomes,
        isGardener: state.sessionReducer.isGardener,
        roles: state.sessionReducer.roles,
        employees: state.sessionReducer.employees,
        phoneVerificationIsCancelled: state.sessionReducer.phoneVerificationIsCancelled,
        petition: state.sessionReducer.petition,
        versionCode: state.sessionReducer.versionCode,
        versionName: state.sessionReducer.versionName,
        forceUpdateApp: state.sessionReducer.forceUpdateApp,
        checkedVersion: state.sessionReducer.checkedVersion,
        lastCheckedVersionTime: state.sessionReducer.lastCheckedVersionTime,
        checkGardeneridHome: state.sessionReducer.gardenerCheckidHome,
        invitationChecked: state.academyReducer.invitationChecked,
        homeData: state.fliwerHomeReducer.data
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
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            polyActions: bindActionCreators(ActionPoly, dispatch)
        }
    };
}

//Connect everything
var styles = {
    homeListContainer: {
        width: "100%"
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
    
    modalIn2: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center"
    },
    modalTitle:{
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        fontSize: 21,
        marginBottom:10
    },
    modalInputTitle:{
        marginBottom:5
    },
    modalInputArea:{
        height: 40, 
        width:"100%",
        borderColor: 'gray',
        borderWidth: 1, 
        padding: 5, 
        marginTop: 5,
        backgroundColor:"white",
        marginBottom:10
    },
    modalInputCheckbox:{
        backgroundColor: "transparent",
        borderWidth: 0, 
        marginLeft: -8, 
        marginTop: -4
    },
    modalInputCheckboxText:{
        fontWeight: "regular",
    },
    modalOptionsSelector:{
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20
    },
    modalOptionsSelectorItem:{
        marginBottom:5,
        flexDirection:"row",
    },
    modalOptionsSelectorItemImage:{
        width: 40,
        height: 40,
        marginRight:5
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
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, BusinessClients));
