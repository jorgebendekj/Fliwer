'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import FliwerCarousel from '../custom/FliwerCarousel'
import FliwerImage from '../custom/FliwerImage.js'
import FastImage from '../custom/FastImage'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'

import { Redirect,withRouter } from '../../utils/router/router'

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions

import homeIcon  from '../../assets/img/5_House.png'

import noImageBG  from '../../assets/img/1_bg_task.jpg'
import rainolveNoImageBG  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

//import trashIcon  from '../../assets/img/9-Configuration.png'
import trashImage  from '../../assets/img/trash.png'
import turn3  from '../../assets/img/3_Turn3.png'
import turn4  from '../../assets/img/3_Turn4.png'

class HomeGardenerCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            idHome: this.props.idHome,
            iduserGardener: this.props.iduserGardener,
            idUser: this.props.iduserGardener,
            isVisitorCard: this.props.isVisitorCard,
            layout: {},
            test: {},
            goToGarden:false,
            goToDevices: false,
            idZone:null
        }
    }

    componentWillReceiveProps(nextProps) {
        this.state.isVisitorCard = nextProps.isVisitorCard;
    }

    measure(callback) {
        return this.refs.card.measure(callback);
    }

    getZoneAlertsCountTotalHome() {
        var total = 0;
        for (var i = 0; i < this.props.homeInfo.gardens.length; i++) {
            for (var x = 0; x < this.props.homeInfo.gardens[i].zones.length; x++) {
                var sensor = this.props.homeInfo.gardens[i].zones[x].genericInfo.sensors
                total = total + sensor.light.alerts + sensor.temp.alerts + sensor.airh.alerts + sensor.soilm.alerts + sensor.fert.alerts + sensor.maint.alerts + sensor.meteo.alerts
            }
        }
        return total
    }

    isZoneAlerts() {
        var total = 0;
        var found = false;
        var i = -1;
        var x = -1;

        while (!found && ++i < this.props.homeInfo.gardens.length) {
            var x = -1;
            while (!found && ++x < this.props.homeInfo.gardens[i].zones.length) {
                var sensor = this.props.homeInfo.gardens[i].zones[x].genericInfo.sensors
                total = total + sensor.light.alerts + sensor.temp.alerts + sensor.airh.alerts + sensor.soilm.alerts + sensor.fert.alerts + sensor.maint.alerts + sensor.meteo.alerts
                if (total != 0)
                    found = true;
            }
        }
        return found
    }

    getZoneAlerts() {
        if (this.props.alerts != 0)
        {
            var zone = this.props.zoneData[this.props.idZone];
            return zone.alerts.concat(zone.advices);
        } else
            return []
    }

    find_dimesions(layout) {
        const {x, y, width, height} = layout;
        //console.warn(x);
        //console.warn(y);
        //console.log("width ",width);
        //console.warn(height);
    }

    render() {

        if(this.state.goToGarden){
            this.setState({goToGarden:false})
            return <Redirect to={"/app/fliwer/zone/"+this.state.idZone} />
        }

        if(this.state.goToDevices){
            this.setState({goToDevices:false})
            return <Redirect to={"/app/fliwer/devices/"+this.state.idZone} />
        }

        return (
                <FliwerCard ref="card"  key={"card_"+this.props.idHome} touchableFront={true} touchableBack={true}
                    style={(this.props.directAccess?{maxWidth:553,minHeight:0}:{})}
                    cardStyle={[!this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)},(this.props.directAccess?{maxWidth:553,minHeight:0}:{})]}
                    cardInStyle={(this.props.directAccess?{maxWidth:553,minHeight:0}:{})}
                    unfocused={this.props.unfocused}
                    onSelectUnfocused={() => {
                        if (typeof this.props.onSelectUnfocused === "function")
                            this.props.onSelectUnfocused(this.state.idHome);
                    }}
                >
                    <View>
                        <View style={[this.style.frontCard,(this.props.marked?this.style.markedCard:{}),(this.props.directAccess?this.style.frontCardShowAll:{}) /*Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout.width < 300 ? {height: 303} : {}) :*/ ]}
                            onLayout={(event) => {
                                this.find_dimesions(event.nativeEvent.layout);
                                this.setState({layout: event.nativeEvent.layout})
                        }}>
                            {this.renderCardFront()}
                        </View>
                    </View>
                    <View>
                        <View style={[this.style.frontCard,(this.props.marked?this.style.markedCard:{}),(this.props.directAccess?this.style.frontCardShowAll:{}) /*Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout.width < 300 ? {height: 303} : {}) :*/ ]}
                            onLayout={(event) => { 
                                this.find_dimesions(event.nativeEvent.layout);
                                this.setState({layout: event.nativeEvent.layout})
                        }}>
                            {this.renderCardBack()}
                        </View>
                    </View>
                </FliwerCard>
                );
    }

    renderTopText() {
        var card = [];
        if (this.props.homeInfo.userInfo.first_name || this.props.homeInfo.userInfo.last_name)
            card.push(<Text key={18} ellipsizeMode='tail' numberOfLines={1} style={this.style.title}>{this.props.homeInfo.userInfo.first_name.toUpperCase()} {this.props.homeInfo.userInfo.last_name.toUpperCase()}</Text>)
        else
            card.push(<Text key={19} style={this.style.title}>--</Text>)

        if (this.props.homeInfo.userInfo.email)
            card.push(<Text key={21} ellipsizeMode='tail' numberOfLines={1} style={this.style.subtitle}>{this.props.homeInfo.userInfo.email}</Text>)
        else
            card.push(<Text key={20} style={this.style.subtitle}>--</Text>)

        return card;
    }

    renderCardFront() {
        var card = [];

        if (typeof this.props.onPressAdd === 'function')
            return (
                <TouchableOpacity key={"cardFront1_"+this.props.idHome} style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}}
                    onPress={()=>this.props.onPressAdd()}
                    >
                    <Text key={987} style={{fontSize: 100, marginTop: -15, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                </TouchableOpacity>
            );

        card.push(
                <View  key={"cardFront2_"+this.props.idHome}  style={this.style.topTextCard}>
                    <View style={this.style.topCardLeft}>
                        <Image source={{uri: this.props.photoProfile}} draggable={false} resizeMode={"cover"} style={this.style.imgProfileTop}/>
                    </View>
                    <View style={this.style.topCardCenter}>
                        {this.renderTopText()}
                    </View>
                    <View style={this.style.topCardRight}>
                    </View>
                </View>);

        card.push(<TouchableOpacity key={"cardFront4_" + this.props.idHome} style={[this.style.imageCarouselContainer, Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout.width < 300 ? { height: 200 } : {}) : {},(this.props.directAccess?this.style.imageCarouselContainerShowAll:{})]}
                onPress={() => {
                    /*
                    if (this.props.unfocused && typeof this.props.onSelectUnfocused === "function")
                        this.props.onSelectUnfocused(this.state.idHome);
                    else*/
                        if(!this.props.marked && this.props.onMark)
                                this.props.onMark(this.state.idHome);
                        /*
                        else
                            this.props.goToHome(this.state.idHome, this.state.iduserGardener, this.state.isVisitorCard)
                        */
                    }} >
                        {this.renderFliwerCarousel()}
                </TouchableOpacity>);

        card.push(
                <View key={"cardFront5_"+this.props.idHome} style={[this.style.bottomContainer]}>
                    <View style={[this.style.bottomContainerIn]}>
                        <View style={[this.style.homeViewConatainer]}>
                            <Image style={this.style.homeIcon} source={homeIcon} resizeMode={"contain"}/>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.homeText, {alignSelf: "center", paddingTop: 2}]}>{this.props.homeInfo.name.toUpperCase()}</Text>
                        </View>
                        <View key={23} style={[this.style.homeView]}>
                            <Icon2 key={24} name="location-pin" style={this.style.locationIcon}/>
                            {this.props.homeInfo.nameCity ? <Text style={this.style.homeText} ellipsizeMode='tail' numberOfLines={1}>{this.props.homeInfo.nameCity.toUpperCase() + (this.props.homeInfo.meteo ? (" · " + this.props.homeInfo.meteo.temperature + "º" + " · " + this.props.homeInfo.meteo.airHumidity + "% hum") : "")}</Text> : <Text key={25} style={this.style.homeText}>--</Text>}
                        </View>
                    </View>

                </View>
                )

        if (this.props.pendingRequestActivation || this.props.expired) {
            if (this.props.pendingRequestActivation)
                var text = this.props.actions.translate.get('Gardener_pending');
            if (this.props.expired)
                text = this.props.actions.translate.get('FliwerButtonProgramDetail_expired');
            card.push(
                    <TouchableOpacity key={"cardFront6_"+this.props.idHome} style={[this.style.layerEdit]} onPress={() => {
                            if (this.props.modalDelete) {
                                this.props.modalDelete(true, this.state.iduserGardener);
                            }
                        }} >
                        <Text style={[this.style.layerText]}>{text}</Text>
                    </TouchableOpacity>
                    )
        }

        return (
            <View key={"cardFront7_"+this.props.idHome} activeOpacity={1} style={{width: "100%", height: "100%"}}>
                {card}
            </View>
        )
    }

    renderCardBack(){
        var card = [];

        if (typeof this.props.onPressAdd === 'function')
            return (
                <TouchableOpacity key={"cardFront1_"+this.props.idHome} style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}}
                    onPress={()=>this.props.onPressAdd()}
                    >
                    <Text key={987} style={{fontSize: 100, marginTop: -15, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                </TouchableOpacity>
            );

        card.push(
                <View  key={"cardFront2_"+this.props.idHome}  style={this.style.topTextCard}>
                    <View style={this.style.topCardLeft}>
                        <Image source={{uri: this.props.photoProfile}} draggable={false} resizeMode={"cover"} style={this.style.imgProfileTop}/>
                    </View>
                    <View style={this.style.topCardCenter}>
                        {this.renderTopText()}
                    </View>
                    <View style={this.style.topCardRight}>
                    </View>
                </View>);

        if (!this.props.isVisitor && this.props.modalDelete && this.state.idUser!=this.props.userData.user_id)
            card.push(
                    <TouchableOpacity
                        key={"cardFront3_"+this.props.idHome}
                        style={this.style.trashIconWrapper}
                        activeOpacity={1}
                        onPress={() => {
                            //toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                            this.props.modalDelete(true, this.state.idUser, this.props.homeInfo.userInfo);
                        }} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}>
                        <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                    </TouchableOpacity>
                    );

        if(!this.props.isVisitor && this.props.modalModifyClientObject && this.state.idUser!=this.props.userData.user_id/*myself*/){
            card.push(
                <FliwerGreenButton
                    containerStyle={{alignSelf:"center",marginTop: 20, width: 150, height: 30}}
                    style={{borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.primary.green}}
                    onPress={()=>{
                        this.props.modalModifyClientObject(true, this.state.idUser, this.props.homeInfo.userInfo);
                    }}
                    text={this.props.actions.translate.get('general_client_modify')}
                />
            )
        }

        return (
            <View key={"cardFront7_"+this.props.idHome} activeOpacity={1} style={{width: "100%", height: "100%"}}>
                {card}
            </View>
        )
    }

    //Changed for sliderless variant
    /*
    getSlides()
    {
        var slide = [];
        var maxItem = 6;
        var printed = 0;
        var slides = []
        var alerts = [];
        var sensor = null;
        var gardens = this.props.homeInfo.gardens;
        var numSlides = gardens.length / maxItem

        for (var x = 0; (x < numSlides); x++) {
            var slide = [];
            var alerts = [];
            var sensor = null;

            for (var i = 0 + printed; (i < gardens.length && i < maxItem + printed); i++) {

                for (var z = 0; z < gardens[i].zones.length; z++) {
                    slide.push(gardens[i].imageName)
                    sensor = gardens[i].zones[z].genericInfo.sensors
                    var total = sensor.light.alerts + sensor.temp.alerts + sensor.airh.alerts + sensor.soilm.alerts + sensor.fert.alerts + sensor.maint.alerts + sensor.meteo.alerts
                    alerts.push(total)
                }
            }
            printed = printed + maxItem;
            slides.push({values: slide, alerts: alerts})
        }
        return slides;
    }
    */

    getGardens()
    {
      var maxItem=this.props.directAccess?500:6;
      var gardens = this.props.homeInfo.gardens;
      var zones=[];

      for(var i=0;i< gardens.length;i++){
        for(var j=0;j< gardens[i].zones.length;j++){
          var zone=gardens[i].zones[j];
          zone.imageName=gardens[i].imageName
          zones.push(zone)
        }
      }

      zones.sort((a,b)=>{
        var sensor = a.genericInfo.sensors
        var total1 = sensor.light.alerts + sensor.temp.alerts + sensor.airh.alerts + sensor.soilm.alerts + sensor.fert.alerts + sensor.maint.alerts + sensor.meteo.alerts
        sensor = b.genericInfo.sensors
        var total2 = sensor.light.alerts + sensor.temp.alerts + sensor.airh.alerts + sensor.soilm.alerts + sensor.fert.alerts + sensor.maint.alerts + sensor.meteo.alerts

        return total1>total2?-1:1;
      })
      
      var slide= zones.slice(0, maxItem);
      var alerts=[];
      var images=[];
      var ids=[];
      for(var i=0;i< slide.length;i++){
        var sensor =slide[i].genericInfo.sensors
        var total = sensor.light.alerts + sensor.temp.alerts + sensor.airh.alerts + sensor.soilm.alerts + sensor.fert.alerts + sensor.maint.alerts + sensor.meteo.alerts
        alerts.push(total);
        images.push(slide[i].imageName)
        ids.push(slide[i].idZone)
      }

      return {values: images, alerts: alerts, ids:ids};
    }

    renderFliwerCarousel() {
        var card = [];
        //var slides = this.getSlides()
        var gardens = this.getGardens();
        //var x = gardens.length > 0 && slides[0].values ? {uri: slides[0].values[0]} : (!global.envVars.TARGET_RAINOLVE?noImageBG:rainolveNoImageBG)
        var x= gardens && gardens.values.length>0? {uri: gardens.values[0],cache:'force-cache'} : (!global.envVars.TARGET_RAINOLVE?noImageBG:rainolveNoImageBG)

        card.push(<View style={[this.style.backgroundImageCarousel, gardens.values.length>0 ? {} : {opacity: 0.9}]} ><Image style={[this.style.carouselGardenImageBG]} source={x} draggable={false} /></View>)

        if(gardens.length==0){
        //if (slides.length == 0) {
            card.push(
                <TouchableOpacity activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                        if (this.props.unfocused && typeof this.props.onSelectUnfocused === "function")
                            this.props.onSelectUnfocused(this.state.idHome);
                        /*
                        else
                            this.props.goToHome(this.state.idHome, this.state.iduserGardener, this.state.isVisitorCard)
                        */
                        }}>
                </TouchableOpacity>
            );
        }
        else{
          card.push((
            <TouchableOpacity  key={"cardCarouselItem_"+this.props.idHome} activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                    if (this.props.unfocused && typeof this.props.onSelectUnfocused === "function")
                            this.props.onSelectUnfocused(this.state.idHome);
                    else if(this.props.onMark){
                        this.props.onMark(this.state.idHome);
                    }
                        /*
                        else
                            this.props.goToHome(this.state.idHome, this.state.iduserGardener, this.state.isVisitorCard)
                        */
                    }}>
                <View style={[this.style.carouseSlide, Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout.width < 300 ? {height: 200} : {}) : {},(this.props.directAccess?this.style.carouseSlideShowAll:{})]}>
                    {this.drawGardensInsideCarousel({item:gardens})}
                </View>
            </TouchableOpacity>
          ))
        }
        //Blocked for performance issues and some image loading errors.
        /*
        else
            card.push(<FliwerCarousel
                        autoplay={false}
                        renderItem={(slide) => {
                                return (
                                        <TouchableOpacity  key={"cardCarouselItem_"+slide.index+"_"+this.props.idHome} activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                                                    if (this.props.unfocused && typeof this.props.onSelectUnfocused === "function")
                                                        this.props.onSelectUnfocused(this.state.idHome);
                                                    else
                                                        this.props.goToHome(this.state.idHome, this.state.iduserGardener, this.state.isVisitorCard)
                                                }}>
                                            <View style={[this.style.carouseSlide, Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout.width < 300 ? {height: 200} : {}) : {}]}>
                                                {this.drawGardensInsideCarousel(slide)}
                                            </View>
                                        </TouchableOpacity>
                                        )
                            }}
                        style={this.style.carousel}
                        textPrevStyle={this.style.textWithShadow}
                        textNextStyle={this.style.textWithShadow}
                        data={slides}
          />);
        */

        if (this.isZoneAlerts())
            card.push(<View style={this.style.imageTopAlertBar}></View>)
        else
            card.push(<View style={[this.style.imageTopAlertBar, {backgroundColor: "gray"}]}></View>)

        if (this.isZoneAlerts())
            card.push(<View style={this.style.imageBottomAlertBar}></View>)
        else
            card.push(<View style={[this.style.imageBottomAlertBar, {backgroundColor: "gray"}]}></View>)

        return card;
    }

    drawGardensInsideCarousel(gardens)
    {
        var card = [];

        var selectedZone= this.props.match && this.props.match.params && this.props.match.params.idZone?this.props.match.params.idZone:null;

        for (var i = 0; i < gardens.item.values.length; i++)
        {

            var source = {
                uri: gardens.item.values[i]
            };

            if (Platform.OS == 'ios')
                source.cache = 'force-cache';

            var imageComponent = [];
            /*
            if (gardens.item.values[i] && Platform.OS != 'android')
                    imageComponent.push(
                        <FliwerImage
                            key={"cardFrontCarouselIn_i"+gardens.item.values[i]+"_"+this.props.idHome}
                            draggable={false}
                            containerStyle={this.style.carouselGardenImage}
                            style={{width: "100%", height: "100%", borderRadius: 16}}
                            setLoading={(loading)=>{}}
                            resizeMode={"cover"}
                            source={source}
                            loaderStyle={{width: 40, height: 40}}
                        />
                    );
            else */if(gardens.item.values[i]){
              imageComponent.push(
                <FastImage
                  key={"cardFrontCarouselIn_i"+gardens.item.ids[i]+"_"+this.props.idHome}
                  style={[this.style.carouselGardenImageAndroid,selectedZone==gardens.item.ids[i]?this.style.selectedZoneLayer:{}]}
                  source={{uri: gardens.item.values[i]}}
                  resizeMode={FastImage.resizeMode.cover}
                  draggable={false}
                />
              );
            }

                /*
            else
                imageComponent.push(<FliwerImage
                  key={"cardFrontCarouselIn_i"+gardens.item.values[i]+"_"+this.props.idHome}
                  style={[this.style.carouselGardenImage]}
                  source={{uri: gardens.item.values[i]}}
                  setLoading={(loading)=>{console.log("cardFrontCarouselIn_i"+gardens.item.values[i]+"_"+this.props.idHome+" is loading:"+loading)}}
                  loaderStyle={{width: 40, height: 40}}
                  draggable={false}
                  />
                );*/

            var visitedZone= (!this.props.match || !this.props.match.params || !this.props.match.params.idZone || this.props.match.params.idZone!=gardens.item.ids[i]) && this.props.visitedZones.indexOf(gardens.item.ids[i])!==-1;


            if(this.props.directAccess){
                card.push((() => {
                    const gardenId = gardens.item.ids[i];
                    return (
                        <TouchableOpacity onPress={() => {

                            if(this.props.marked || !this.props.onMark){
                                this.props.actions.gardenerActions.addVisitedZone(gardenId);
                                if(this.props.directAccess && this.props.onDirectAccess){
                                    this.props.onDirectAccess(gardenId);
                                }

                                if(this.props.directAccess=="devices")this.setState({goToDevices: true, idZone: gardenId});
                                else this.setState({goToGarden: true, idZone: gardenId});
                            }else if(this.props.onMark){
                                this.props.onMark(this.state.idHome);
                            }
                        }} style={[this.style.carouselGardenImageOut,this.style.carouselGardenImageOutShowAll,visitedZone?this.style.visitedGardenLayer:{}]}>
                            {imageComponent}
                            {this.drawAlert(gardens.item.alerts[i])}
                        </TouchableOpacity>
                    );
                })());
            }else{
                card.push(<View style={this.style.carouselGardenImageOut}>
                    {imageComponent}
                    {this.drawAlert(gardens.item.alerts[i])}
                </View>)
            }
        }
        if (card.length > 0)
            return card;
        else
            return [];
    }

    drawAlertTotal() {
        var fsize = this.props.nalerts < 100 ? (this.props.nalerts < 10 ? 30 : 24) : 17;
        if (this.props.nalerts > 0) {
            return (<View style={this.style.dotAlertTotalStyle}>
                <View  pointerEvents="none" style={this.style.circleAlertNumberOut}>
                    <Text style={[this.style.circleAlertNumber, {fontSize: fsize}]}>{this.props.nalerts}</Text>
                </View>
            </View>)
        }
    }

    drawAlert(alerts) {
        if (alerts > 0) {
            return (<View style={this.style.dotAlertStyle}>{this.drawAlertText(alerts)}</View>)
        }
    }

    drawAlertText(alerts) {
        if (alerts > 0) {

            if (alerts == 1)
                var fsize = 17;
            else if (alerts > 3 && alerts < 10)
                var fsize = 13;
            else if (alerts > 9 && alerts < 1000)
                var fsize = 11;
            return (
                        <View  pointerEvents="none" style={this.style.circleAlertNumberOut}>
                            <Text style={[this.style.circleAlertNumber, {fontSize: fsize}]}>{alerts}</Text>
                        </View>
                    )
        }
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        devices: state.fliwerDeviceReducer.devices,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        userData: state.sessionReducer.data,
        visitedZones: state.gardenerReducer.visitedZones,
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
            gardenerActions: bindActionCreators(ActionGardener, dispatch)
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
        flexDirection: "row",
        paddingBottom: 14
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
        paddingBottom: 6,
        width: "17%",
        alignItems: "center",
    },
    imgProfileTop: {
        height: 30,
        borderRadius: 25,
        width: 30,
        marginLeft: 8,
    },
    topCardCenter: {
        width: "66%",

    },
    topCardRight: {
        width: "17%",
    },
    topTextCard: {
        height: 64,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    textWithShadow: {
        textShadowColor: "black",
        textShadowOffset: {width: -1, height: 0},
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
        height: "auto",
        padding: 8,
    },
    carouseSlideShowAll: {
        height: "auto",
        padding:6
        //minHeight: 223,
    },
    carouselGardenImageOut: {
        width: "33.33%",
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
        padding: 1,

    },
    carouselGardenImageOutShowAll:{
        width: 105,
        height: 105
    },

    visitedGardenLayer:{
        filter: "brightness(150%) contrast(30%) grayscale(1)"
    },

    selectedZoneLayer:{
        borderColor: FliwerColors.primary.green,
        borderWidth: 5,
        borderRadius: 10
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
        //height: 329,
        width: "100%"
    },
    frontCardShowAll:{
        height: "auto",
        //minHeight: 329
    },
    markedCard:{
        borderColor: FliwerColors.primary.green,
        borderWidth: 5,
        borderRadius: 10
    },
    imageCarouselContainer: {
        //height: 223,
        height:"auto",
        width: "100%"
    },
    imageCarouselContainerShowAll:{
        height:"auto",
    },
    /*
     image:{
     width: "100%",
     height:223,
     alignItems:"center"
     },
     */
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
        fontSize: 11
    },
    title: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        marginTop: 15,
        fontSize: 18,
        marginBottom: 7
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        color: FliwerColors.primary.black,
        marginBottom: 15,
        marginTop: -2,
        fontSize: 10
    },
    text: {
        width: '100%',
        textAlign: 'center'
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(70%)"
        }
    }
};

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, HomeGardenerCard)));