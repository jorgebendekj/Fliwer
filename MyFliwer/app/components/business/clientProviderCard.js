'use strict';

import React, { Component } from 'react';
var { View, Text, Image, TouchableOpacity, Platform, Dimensions } = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import FliwerCarousel from '../custom/FliwerCarousel'
import FliwerImage from '../custom/FliwerImage.js'
import FastImage from '../custom/FastImage'
import FliwerCalmButton from '../custom/FliwerCalmButton.js'

import { mediaConnect } from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'

import { CurrentTheme, FliwerColors } from '../../utils/FliwerColors.js'
import { FliwerAlertMedia } from '../../utils/FliwerAlertMedia.js'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsWrapper from '../../actions/wrapperActions.js'; //Import your actions

import homeIcon from '../../assets/img/5_House.png'

import noImageBG from '../../assets/img/1_bg_task.jpg'
import rainolveNoImageBG from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

//import trashIcon  from '../../assets/img/9-Configuration.png'
import trashImage from '../../assets/img/trash.png'
import turn3 from '../../assets/img/3_Turn3.png'
import turn4 from '../../assets/img/3_Turn4.png'

class ClientProviderCard extends Component {

    constructor(props) {
        super(props);

        var user =  this.props.usersListData?Object.values(this.props.usersListData).find((user) => user.user_id == this.props.idUser):null;

        if(!user && this.props.data.user_id == this.props.idUser){
            user = this.props.data;
        }
        if(user)
            user.image=user.photo_url;
        this.state = {
            user: user? user : (this.props.cardData?this.props.cardData:{})
        }

        this.card = React.createRef();
    }


    render() {
        return (
            this.renderCardFront()
        );
    }

    renderTopText() {
        var card = "";
        if (this.state.user.first_name || this.state.user.last_name)
            card = card + this.state.user.first_name.toUpperCase() + ' ' + this.state.user.last_name.toUpperCase()
        else
            card = '--'

        return card;
    }

    renderCardFront() {
        var card = [];

        let selectedWorker = this.props?.match?.params?.idWorker || null;

        if (this.state.goWorkerDetails) {
            card.push(<Redirect push to={`/app/clients/details/${this.state.goWorkerDetails}`} />)
            this.state.goWorkerDetails = false;
            if (this.state.mediaStyle.orientation != "landscape") {
                this.props.actions.wrapperActions.setPortraitScreen(2);
            }
        }

        if (typeof this.props.onPressAdd === 'function') {
            //Create user button card
            card.push(
                <TouchableOpacity key={"cardFront1_" + this.state.user.idUser} style={{ width:"95%", alignSelf: "center", height: 110, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: FliwerColors.secondary.white, marginTop: 10, opacity: Platform.OS == "android" ? 0.6 : 0.4 }}
                    onPress={() => {
                        this.setState({ goWorkerDetails: 'create' })
                        //this.props.onPressAdd()
                    }}
                >
                    <Text key={987} style={{ fontSize: 100, marginTop: -15, color: "gray", fontFamily: FliwerColors.fonts.regular }}>{"+"}</Text>
                </TouchableOpacity>
            );

            return card
        }

        card.push(
            <TouchableOpacity
                key={"cardFront2_" + this.state.user.idUser}
                style={{
                    width: "95%",
                    height: 110,
                    backgroundColor: selectedWorker == this.state.user.user_id
                        ? CurrentTheme.lighterCardColor
                        : CurrentTheme.darkerCardColor,
                    borderRadius: 7,
                    borderWidth: selectedWorker == this.state.user.user_id ? 2 : 0,
                    borderColor: CurrentTheme.selectedColor,
                    marginTop: 10,
                    alignSelf: "center"
                }}
                onPress={() => {
                    this.setState({ goWorkerDetails: this.state.user.user_id });
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        gap: 10,
                        padding: 10,
                        alignItems: "flex-start",
                        height: "100%"
                    }}
                >
                    <View style={{ width: 90, flexShrink: 0 }}>
                        <Image
                            style={{
                                width: 90,
                                height: 90,
                                borderRadius: 10,
                                backgroundColor: "white"
                            }}
                            source={{ uri: this.state.user.image }}
                            resizeMode={"cover"}
                        />
                    </View>

                    <View
                        style={{
                            flex: 1,
                            justifyContent: "flex-start",
                            gap: 5,
                            height: "100%"
                        }}
                    >
                        {/* Top text */}
                        <Text
                            style={[
                                this.style.textTitle,
                                { color: CurrentTheme.cardText, fontSize: 16, opacity: 1 }
                            ]}
                            ellipsizeMode="tail"
                            numberOfLines={1}
                        >
                            {this.renderTopText()}
                        </Text>

                        {/* Position */}
                        {this.state.user.businessPosition && (
                            <Text
                                style={[
                                    this.style.textDescription,
                                    {
                                        color: CurrentTheme.cardText,
                                        fontSize: 12,
                                        opacity: 1
                                    }
                                ]}
                                ellipsizeMode="tail"
                                numberOfLines={4}
                            >
                                {this.state.user.businessPosition}
                            </Text>
                        )}

                        {/* Email */}
                        <Text
                            style={[
                                this.style.textDescription,
                                {
                                    color: CurrentTheme.cardText,
                                    fontSize: 12,
                                    opacity: 1
                                }
                            ]}
                            ellipsizeMode="tail"
                            numberOfLines={4}
                        >
                            {this.state.user.email}
                        </Text>

                    </View>
                </View>
            </TouchableOpacity>
        );


        if (this.state.user.pending || this.state.user.petition) {
            if (this.state.user.pending)
                var text = this.props.actions.translate.get('Gardener_pending');
            if (this.state.user.expired)
                text = this.props.actions.translate.get('FliwerButtonProgramDetail_expired');
            card.push(
                <TouchableOpacity key={"cardFront8_" + this.state.user.idUser} style={[this.style.layerEdit]} onPress={() => {
                    if (this.props.modalDelete) {
                        this.props.modalDelete(true, this.state.user.idUser);
                    }
                }} >
                    <Text style={[this.style.layerText]}>{text}</Text>
                </TouchableOpacity>
            )
        }

        return card
    }

    renderCardBack() {
        var card = [];


        card.push(<View style={this.style.topCardCenter}>
            <Text>
                {this.renderTopText()}
            </Text>
        </View>)

        if (this.state.user.license && Object.keys(this.state.user.license).length > 0) {
            card.push(
                <TouchableOpacity key={"cardFront6_" + this.state.user.idUser} style={[this.style.bottomContainer, { marginLeft: 10, alignItems: "start", marginBottom: 10 }]}
                    onPress={() => {

                        if (this.props.onPress)
                            this.props.onPress(this.state.user);
                    }}>
                    <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.homeText, { alignSelf: "start", paddingTop: 2 }]}>{"Licencias activas:"}</Text>
                </TouchableOpacity>
            )

            var licenses = [];
            for (var i = 0; i < Object.keys(this.state.user.license).length; i++) {
                //translate
                if (this.state.user.license[Object.keys(this.state.user.license)[i]] == 1)
                    licenses.push(<Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.homeText, { paddingTop: 2 }]}>{this.props.actions.translate.get('general_license_' + Object.keys(this.state.user.license)[i])}</Text>);
            }

            card.push(
                <TouchableOpacity key={"cardFront7_" + this.state.user.idUser} style={[this.style.bottomContainer, { marginLeft: 10, alignItems: "start" }]}
                    onPress={() => {

                        if (this.props.onPress)
                            this.props.onPress(this.state.user);
                    }}>
                    {licenses}
                </TouchableOpacity>
            )
        }

        return card;
    }


};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        data: state.sessionReducer.data,
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        devices: state.fliwerDeviceReducer.devices,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        employees: state.sessionReducer.employees,
        usersListData: state.gardenerReducer.usersListData,
        userData: state.sessionReducer.data,
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch),
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch),
        }
    }
}

var style = {
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        fontSize: 21
    },
    layerEdit: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
        backgroundColor: "rgba(150,150,150,0.8)",
        justifyContent: "center",
        top: 0,
    },
    layerText: {
        width: "100%",
        fontSize: 33,
        //padding:"20%",
        paddingLeft: "10%",
        paddingRight: "10%",
        color: "white",
        textAlign: "center",
    },
    bottomContainer: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
    },
    trashIconWrapper: {
        position: "absolute",
        top: 14,
        right: 10
    },
    trashIcon: {
        width: 20,
        height: 20
    },
    topCardCenter: {
        width: "66%",
        alignSelf: "center"
    },
    frontCard: {
        height: 100,
        width: "100%"
    },
    image: {
        width: "100%",
        height: "100%",
    },
    sensorIcon: {
        width: "100%",
        height: "100%",
    },
    homeView: {
        height: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        //marginBottom:11,
        marginTop: 5,
        maxWidth: "45%",
        marginLeft: 7,
    },
    homeText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 15
    },
    buttonAccess: {
        backgroundColor: FliwerColors.primary.green,
        height: 32,
        borderRadius: 4,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center"
    },
    buttonTextIn: {
        color: "rgb(255, 255, 255)",
        fontSize: 18
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(70%)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(mediaConnect(style, ClientProviderCard));