'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Platform,
    Keyboard

} = require('react-native');

import Clipboard from '@react-native-clipboard/clipboard';
import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import {FliwerColors} from '../../utils/FliwerColors'
import { Redirect } from '../../utils/router/router'
import FliwerDeviceList from '../../components/custom/FliwerDeviceList.js'
import FliwerSearchInput from '../custom/FliwerSearchInput.js'
import Icon from 'react-native-vector-icons/Entypo';
import ZoneCard from '../../components/zones/zoneCard.js'
import EmployeeCard  from '../business/employeeCard.js'
import ClientObjectModal from './ClientObjectModal.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {toast} from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions
import * as ActionInvoice from '../../actions/invoiceActions.js';

import {Orientation} from '../../utils/orientation/orientation'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import sdialIcon  from '../../assets/img/6_S-dial.png'

class gardenerAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: null,
            loading: false,
            activateRequest: false,
            goGardenerHome: false,
            gotoInvitation:false,
            invitation:null,
            newInvitation:null,
            searchResults: null,
            idHomeSearched: null,
            actualEmail: null,
            createClientModal:false,
            visibleModalGotoInvitation:false
        };
    }

    componentWillUnmount() {
        clearTimeout(this.searchTimeout);
    };

    render() {

        if (this.state.goGardenerHome)
        {
            this.setState({goGardenerHome: false})
            return (<Redirect push to={"/gardener/" + this.state.idHomeSearched} />)
        } else if(this.state.gotoInvitation){
            if(this.state.newInvitation) return (<Redirect push to={"/invitation/new/" + this.state.newInvitation} />)
            else return (<Redirect push to={"/invitation/" + this.state.invitation.id} />)
        } else {

            var icons = [];
            icons.push("gardener");
            icons.push("zone", "files", "academy");
            return (
                <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"} loading={(Platform.OS == 'web' ? (this.state.loading || this.state.refreshing) : (this.state.loading))}>
                    <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('FliwerMainTopBar_add_user_to_care')}/>
                    <View style={this.style.container}>
                        <View style={this.style.seatchContainer}>
                            <View style={this.style.fileDropIn}>
                                <FliwerSearchInput
                                    searchButton={true}
                                    placeholder={this.props.actions.translate.get('dragableGardenerUsersVC_email')}
                                    containerStyle={[this.style.search]}
                                    ref={(input) => {
                                        this.searchInput = input;
                                    }}
                                    returnKeyType={"search"}
                                    onChangeText={(email) => {
                                        this.state.actualEmail = email;
                                        if (email && this.state.activateRequest)
                                            this.setState({activateRequest: false});
                                    }}
                                    onSubmitEditing={async (email) => {
                                        if (email.nativeEvent.text)
                                            this.setState({email: email.nativeEvent.text});
                                        await this.searchUser(email.nativeEvent.text)
                                    }}
                                    blurOnSubmit={false}
                                    />
                            </View>
                        </View>
                        <View style={this.style.containerIn}>
                            <ScrollView style={this.style.containerObjects} contentContainerStyle={this.style.containerInContainer}>
                                <CardCollection style={this.style.collection}>
                                    { this.renderResults() }
                                </CardCollection>
                            </ScrollView>
                        </View>
                    </View>
                    <View style={{width: "100%", height: 60, marginTop: 10, backgroundColor: "white"}}>
                        {this.renderButton()}
                    </View>
                    <MainFliwerMenuBar idZone={null} current={null} icons={icons} />
                    {(this.state.loading ? (<FliwerLoading />) : [])}
                    {this.renderModalGotoInvitation()}
                    {this.renderModalCreateClient()}
                </ImageBackground>
            );
        }
    }

    renderButton()
    {
        var containerStyle = [{alignSelf: "center", height: 40, maxWidth: 300, marginTop: 10}, Platform.OS === 'ios'? {marginBottom: 18, marginTop: 0} : {}];

        if (!this.state.activateRequest)
            return (<FliwerGreenButton onPress={async () => {
                this.setState({createClientModal: true});
            }} textStyle={[Platform.OS == 'web' ? {height: null} : {}]} style={[{}]} text={this.props.actions.translate.get('AddGardener_create_client')} containerStyle={containerStyle}/>)
        else {
            return (<FliwerGreenButton onPress={async () => {
                await this.requestCaring(this.state.actualEmail)
            }} textStyle={[Platform.OS == 'web' ? {height: null} : {}]} style={[{}]} text={this.props.actions.translate.get('AddGardener_request_caring')} containerStyle={containerStyle}/>)
            
        }

    }

    async searchUser(email) {
        if (email)
        {
            this.setState({loading: true})
            await this.props.actions.fliwerGardenerActions.getGardenerUserInformation(email).then((response) => {

                /*if (response.homes.length == 0)
                    toast.notification(this.props.actions.translate.get('AddGardener_without_gardens'));
                */

                this.setState({loading: false, activateRequest: true, searchResults: response, idHomeSearched: null});
                Keyboard.dismiss();

            }, (error) => {
                if (error.ok == false && error.id == 21)
                {
                    /*
                    this.setState({searchResults: null})
                    toast.error(this.props.actions.translate.get('AddGardener_no_user_found'));
                    */
                   //User not found. Search if user is invited
                   this.props.actions.invoiceActions.getInvitations().then(() => {
                        
                        var invitation=this.props.invitationsReducer.find(i=>i.guestEmail==email);
                        
                        if (invitation){

                            this.setState({loading: false, activateRequest: false, visibleModalGotoInvitation:true, invitation:invitation,newInvitation:null});

                        }else{

                            this.setState({loading: false, activateRequest: false, visibleModalGotoInvitation:true, newInvitation:email,invitation:null});
                        }

                   }, (error) => {
                       console.log("error", error);
                       this.setState({loading: false, activateRequest: false});

                   });
                   
                }else this.setState({loading: false, activateRequest: false})
                //reject(error)
            });

        } else {
            toast.error("Introduce un email...");
        }

    }

    async requestCaring(email) {
        this.setState({loading: true});
        await this.props.actions.fliwerGardenerActions.wipeAllowRefreshGardenerHomes().then(async () => {
            await this.props.actions.fliwerGardenerActions.putGardenerUser(email).then((response) => {
                this.setState({loading: false, activateRequest: false});
                if (response.ok == true && response.uuid != null && response.expired == false && response.pending == true) {
                    if (response.new == true)
                    {
                        toast.notification(this.props.actions.translate.get('AddGardener_request_has_sent'));
                        this.setState({searchResults: null, requestCaring: false, goGardenerHome: true})
                    } else
                        toast.notification(this.props.actions.translate.get('AddGardener_request_pendding'));
                } else if (response.ok == true && response.uuid == null && response.expired == false && response.pending == false)
                {
                    this.setState({searchResults:null});
                    toast.notification(this.props.actions.translate.get('AddGardener_already_on_your_care'));
                } else
                {
                    //toast.error("Error");
                }
            }, (error) => {
                this.setState({loading: false})
                //reject(error)
            });
        });
    }

    renderResults() {
        var indents = [];
        if (this.state.searchResults != null)
        {
            this.state.searchResults.image=this.state.searchResults.photo_url;
            indents.push(<EmployeeCard key={"employee_card_"+this.state.searchResults.idUser} 
                cardData={this.state.searchResults}
                styleCard={{height:329}}
            />);

            var userGardens = Object.values(this.state.searchResults.homes);

            if (userGardens.length > 0)
            {
                for (var i = 0; i < userGardens.length; i++) {
                    //var home = sortedGardens[index];
                    var home = userGardens[i];
                    for (var z = 0; z < home.gardens.length; z++) {
                        for (var y = 0; y < home.gardens[z].zones.length; y++) {
                            if (home.gardens[z].zones[y])
                            {
                                indents.push(<ZoneCard key={home.gardens[z].zones[y].idZone}
                                    touchableFront={false}
                                    idZone={home.gardens[z].zones[y].idZone}
                                    idHome={home.gardens[z].idHome}
                                    homeName={home.name}
                                    deviceSerialNumber={home.gardens[z].zones[y].DeviceSerialNumber}
                                    title={home.gardens[z].zones[y].name}
                                    subtitle={(home.nameCity ? home.nameCity : "--") + (home.meteo ? (" · " + home.meteo.temperature + "º" + " · " + home.meteo.airHumidity + "% hum") : "")}
                                    image={home.gardens[z].imageName ? home.gardens[z].imageName : home.imageName}
                                    alerts={0}
                                    devicesCount={home.gardens[z].genericInfo.devices}
                                    modalFunc={(v, p) => this.setModalModifyVisible(v, p)}
                                    modalClosed={() => {
                                        this.modalClosed()
                                }}/>);
                            }
                        }
                    }
                }

                this.state.idHomeSearched = userGardens[0].id;
            }


        }
        return indents;
    }

    renderZoneName() {
        var zoneName;
        if (this.state.idZone && this.props.zoneData[this.state.idZone]) {
            zoneName = this.props.zoneData[this.state.idZone].name;
        }
        return zoneName;
    }

    renderModalGotoInvitation(){
        return(
          <FliwerDeleteModal
              visible={this.state.visibleModalGotoInvitation}
              onClose={() => {
                  this.setState({visibleModalGotoInvitation: false})
              }}
              onConfirm={async () => {
                  this.setState({visibleModalGotoInvitation:false, gotoInvitation:true})
              }}
              title={this.props.actions.translate.get(this.state.newInvitation?"AddGardener_create_invitation":"AddGardener_goto_invitation")}
              hiddeText={true}
              password={false}
              loadingModal={this.state.loading}
              />
          );
      }
    
    renderModalCreateClient(){
        if(!this.state.createClientModal) return [];
        else return (
            <ClientObjectModal 
                visible={this.state.createClientModal}
                onClose={()=>{this.setState({createClientModal: false})}}
                onLoading={(loading)=>{this.setState({loading:loading})}}
                onConfirm={(client)=>{
                    this.setState({goGardenerHome: true})
                }}
            />)

    }

}
;



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        invitationsReducer: state.invoiceReducer.invitations,
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
            invoiceActions: bindActionCreators(ActionInvoice, dispatch)

        }
    }
}


var styles = {
    buttonDisabled: {
        backgroundColor: FliwerColors.primary.gray,

    },
    collection: {
        marginBottom: 85,
        width: "100%",
    },
    background: {
        backgroundColor: "white",
        height: "100%",
    },
    container: {
        width: "100%",
        alignItems: "center",
        flex: 1
    },
    seatchContainer: {
        marginTop: 10,
        width: "100%",
        height: 56
    },
    search: {
        marginRight: 10
    },
    containerInContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        paddingLeft: 10,
        paddingRight: 10
    },
    containerIn: {
        flexDirection: "column",
        width: "100%"
    },
    containerObjects: {
        width: "100%"
    },
    fileDropIn: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },

    "@media (orientation:portrait)": {
        containerIn: {
            flexGrow: 1,
        },
    },
    "@media (orientation:landscape)": {
        containerIn: {
            flexDirection: "row",
            height: "100%"
        },
        containerObjects: {
            width: "80%",
        },
    },
    ":hover": {
    }

};

if (Platform.OS == "android" || Platform.OS == 'ios') {
    styles.containerIn.flexShrink = 1;
}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, gardenerAdd));
