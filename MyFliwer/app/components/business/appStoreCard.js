'use strict';

import React, { Component } from 'react';
var { View, Text, Image, TouchableOpacity, Platform,Switch } = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import FliwerCarousel from '../custom/FliwerCarousel'
import FliwerImage from '../custom/FliwerImage.js'
import FastImage from '../custom/FastImage'
import FliwerCalmButton from '../custom/FliwerCalmButton.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import { mediaConnect } from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'

import { FliwerColors,CurrentTheme,MenuTheme } from '../../utils/FliwerColors.js'
import { FliwerAlertMedia } from '../../utils/FliwerAlertMedia.js'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

import homeIcon from '../../assets/img/5_House.png'

import noImageBG from '../../assets/img/no-image.jpg'

//import trashIcon  from '../../assets/img/9-Configuration.png'
import trashImage from '../../assets/img/trash.png'
import turn3 from '../../assets/img/3_Turn3.png'
import turn4 from '../../assets/img/3_Turn4.png'

class AppStoreCard extends Component {

    constructor(props) {
        super(props);
        var product =  this.props.productsReducer?this.props.productsReducer.find((p) => p.id == this.props.idProduct):null;

        /*
        if(!user && this.props.data.user_id == this.props.idUser){
            user = this.props.data;
            user.image=user.photo_url;
        }
        */

        this.state = {
            product: product? product : (this.props.cardData?this.props.cardData:{}),
        }
        
        this.card= React.createRef();
    }


    render() {
        return (
            <FliwerCard ref={this.card} key={"productCard_" + this.state.product.id} touchableFront={true} touchableBack={true}
                cardStyle={!this.props.onPressAdd ? {} : { opacity: (Platform.OS == "android" ? 0.6 : 0.4) }}
                unfocused={this.props.unfocused}
            >
                <View>
                    <View style={[this.style.frontCard,this.props.styleCard]}
                        onLayout={(event) => {
                            this.setState({ layout: event.nativeEvent.layout })
                        }}>
                        {this.renderCardFront()}
                    </View>
                </View>
                {
                    /*
                        <View>
                            <View style={[this.style.frontCard,this.props.styleCard]}
                                onLayout={(event) => {
                                    this.setState({ layout: event.nativeEvent.layout })
                                }}>
                                {this.renderCardBack()}
                            </View>
                        </View>
                    */
                }
            </FliwerCard>
        );
    }

    renderCardFront() {
        var card = [];
        
        var idApp=this.props.idApp;
        
        //get App
        var app=MenuTheme.getApp(idApp);

        /*
            Draw the icon at the left, in the right a container with the name as the title, a new field description below, and a switch button to enable/disable the app

            In summary, inside a view goes the image and another view. In this second view goes the title, description and switch button
        */
       var size=50;
       app.description=app.description?app.description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, varius velit. Sed sit amet facilisis lectus. Nam sit amet semper nunc. Nullam vel eros nec nunc tristique rhoncus. Nullam non erat nec justo tincidunt aliquam. Nullam auctor, nunc nec ultricies sollicitudin, justo nunc tincidunt nulla, nec aliquam nunc nunc id justo. Nullam auctor, nunc nec ultricies sollicitudin, justo nunc tincidunt nulla, nec aliquam nunc nunc id justo.";

        card.push(
            <View key={"cardFront_app_store_" + idApp} activeOpacity={1} style={{ width: "100%", height: "100%" }}>
                    <View style={this.style.topCardCenter}>
                        <View style={this.style.topCardTopInfoLeft2}>
                            
                            <View style={this.style.topCardLeft}>

                                {app.iconProvider?
                                    (
                                        <app.iconProvider name={app.icon} style={[{fontSize:size,color:"black",opacity:(app.disabled?0.3:1)}]}/>
                                    ):
                                    (
                                        <Image resizeMode={"contain"} source={app.icon} style={[{width: size, height: size,opacity:(app.disabled?0.3:1)},style?style:{}]}/>
                                    )
                                }
                            </View>

                            <Text style={[this.style.topCardTopInfoTitle]}>{app.name}</Text>

                        </View>
                        
                        <View style={this.style.topCardTopInfoLeft}>
                            <Text style={[this.style.topCardTopInfoText]}>{app.description}</Text>
                        </View>

                        <View style={this.style.localizationSwitchContainer}>
                            <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle1]}>{"Desactivada"}</Text>
                            <Switch style={this.style.localizationSwitch} onValueChange = {(value) => {
                                //only if fliwer role
                                if(this.props.roles.fliwer)
                                    this.props.actions.sessionActions.updateApp(idApp, value);
                            }} value = {app.access} thumbColor={"white"} />
                            <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle2]}>{"Activada"}</Text>
                        </View>
                    </View>
            </View>
        );
        

        return (
            <View key={"cardFront_app_store_" + idApp} activeOpacity={1} style={{ width: "100%", height: "100%" }}>
                {card}
            </View>
        )
    }

    renderCardBack(){
        var card = [];

        card.push(
            <TouchableOpacity key={"cardFront2_" + this.state.product.id} style={this.style.topTextCard}
                onPress={()=>{
                    if(this.props.onPress)
                        this.props.onPress(this.state.product);
                }}>
                <View style={this.style.topCardCenter}>
                    {this.renderTopCard()}
                </View>
            </TouchableOpacity>
        );
        /*

        if(!this.props.isVisitor && this.props.modalModifyClientObject && this.state.product.id!=this.props.userData.user_id){
            card.push(
                <FliwerGreenButton
                    containerStyle={{alignSelf:"center",marginTop: 20, width: 150, height: 30}}
                    style={{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.primary.green}}
                    onPress={()=>{
                        this.props.modalModifyClientObject(true, this.state.product.id,this.state.user);
                    }}
                    text={this.props.actions.translate.get('general_client_modify')}
                />
            )
        }
        */

        
        if (this.props.modalDelete)
            card.push(
                <TouchableOpacity
                    key={"cardFront3_" + this.state.product.id}
                    style={this.style.trashIconWrapper}
                    activeOpacity={1}
                    onPress={() => {
                        //toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                        this.props.modalDelete(true, this.state.product.id);
                    }} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}>
                    <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"} />
                </TouchableOpacity>
            );

        return card;
    }


};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        data: state.sessionReducer.data,
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        devices: state.fliwerDeviceReducer.devices,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        employees: state.sessionReducer.employees,
        usersListData: state.gardenerReducer.usersListData,
        userData: state.sessionReducer.data,
        productsReducer: state.invoiceReducer.products
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
            sessionActions: bindActionCreators(ActionsSession, dispatch),
        }
    }
}

var style = {
    addHomesImage: {
        width: 80,
        height: 80,
        alignItems: "center",
        justifyContent: "center",

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
    bottomContainerIn: {
        //paddingLeft:20,
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        paddingTop: 3,
        flexDirection: "row",
    },
    trashIconWrapper: {
        position: "absolute",
        bottom: 14,
        left: 10
    },
    trashIcon: {
        width: 20,
        height: 20
    },
    topCardLeft: {
        alignItems: "center",
    },
    imgProfileTop: {
        height: 30,
        borderRadius: 25,
        width: 30,
        marginLeft: 8,
    },
    topCardCenter: {
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 84,
        alignSelf: "center",
        gap: 10,
        padding: 10
    },
    topCardRight: {
        width: "17%",
    },
    topTextCard: {
        minHeight: 84,//64,
        width:"90%",
        marginLeft:"5%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    bottomTextCard:{
        width:"90%",
        marginLeft:"5%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    textWithShadow: {
        textShadowColor: "black",
        textShadowOffset: { width: -1, height: 0 },
        textShadowRadius: 5,
    },
    circleAlertNumberOut: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
    },
    circleAlertNumber: {
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        flex: 1,
        //paddingBottom:3,
    },
    backgroundImageCarousel: {
        resizeMode: "cover",
        flexGrow: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
        opacity: 0.2,
    },
    dotAlertStyle: {
        width: 26,
        height: 26,
        borderRadius: 200,
        backgroundColor: FliwerColors.secondary.red,
        position: "absolute",
        top: 4,
        right: 1
    },
    dotAlertTotalStyle: {
        width: 40,
        height: 40,
        borderRadius: 200,
        backgroundColor: FliwerColors.secondary.red,
        position: "absolute",
        right: 30,
        top: 11,
    },
    carouseSlide: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        height: 223,
        padding: 8,
    },
    carouselGardenImageOut: {
        width: "33.33%",
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
        padding: 1,

    },
    carouselGardenImage: {
        width: "80%",
        resizeMode: "cover",
        height: "80%",
        borderRadius: 16,
    },
    carouselGardenImageAndroid: {
        width: "80%",
        height: "80%",
        borderRadius: 16,
    },
    carouselGardenImageBG: {
        width: "100%",
        resizeMode: "cover",
        height: "100%",
    },
    frontCard: {
        height: "auto",
        width: "100%"
    },
    imageCarouselContainer: {
        height: 210,
        width: "100%",
        paddingLeft:20,
        paddingRight:20,
        marginBottom:10
    },
    image:{ 
        width: "100%", 
        height: "100%"
    },
    imageTopAlertBar: {
        width: "100%",
        backgroundColor: "#fe4b4b",
        position: "absolute",
        top: 0,
        height: 4
    },
    imageBottomAlertBar: {
        width: "100%",
        backgroundColor: "#fe4b4b",
        position: "absolute",
        bottom: 0,
        height: 4
    },
    carousel: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    carouselAlertText: {
        fontFamily: FliwerColors.fonts.regular,
        color: "white",
        fontSize: 16,
        paddingBottom: 20
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
    homeViewConatainer: {
        //display:"flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 20,
        //marginBottom:11,
        marginTop: 5,
        maxWidth: "45%",
        marginRight: 7,
    },
    homeIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    locationIcon: {
        marginRight: 3,
        fontSize: 20
    },
    homeText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 15
    },
    title: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        marginTop: 10,
        fontSize: 18,
        marginBottom: 10
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        color: FliwerColors.primary.black,
        marginBottom: 15,
        marginTop: -2,
        fontSize: 16
    },
    text: {
        width: '100%',
        textAlign: 'center'
    },
    buttonContainer: {
        height: 40,
        width: "50%",
        marginLeft: "25%",
        flexGrow: 1,
        marginTop: 5
    },
    buttonAccess: {
        backgroundColor: FliwerColors.primary.green,
        height: 32,
        borderRadius: 4,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center"
    },
    buttonTextIn:{
        color: "rgb(255, 255, 255)",
        fontSize: 18
    },
    topCardTopInfo:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"center",
        width:"100%",
        marginTop:3,
        justifyContent: "space-between"
    },
    topCardTopInfoLeft:{
        display: "flex",
        flexDirection: "row",
    },
    topCardTopInfoLeft2:{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap:10
    },
    topCardTopInfoRight:{
        display: "flex",
        flexDirection: "row",
    },
    topCardTopInfoTitle:{
        fontSize: 20,
        fontFamily: FliwerColors.fonts.title,
        flexGrow: 1,
    },
    topCardTopInfoText:{
        fontSize: 14,
    },
    localizationSwitchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end"
    },
    localizationSwitch: {
        transform: [{scaleX: 1}, {scaleY: 1}]
    },
    localizationSwitchTitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 14,
    },
    localizationSwitchTitle1: {
        marginRight: 10
    },
    localizationSwitchTitle2: {
        marginLeft: 10
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(70%)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(mediaConnect(style, AppStoreCard));