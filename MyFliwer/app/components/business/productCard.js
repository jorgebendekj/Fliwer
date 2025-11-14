'use strict';

import React, { Component } from 'react';
var { View, Text, Image, TouchableOpacity, Platform } = require('react-native');

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

import { FliwerColors } from '../../utils/FliwerColors.js'
import { FliwerAlertMedia } from '../../utils/FliwerAlertMedia.js'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions

import homeIcon from '../../assets/img/5_House.png'

import noImageBG from '../../assets/img/no-image.jpg'

//import trashIcon  from '../../assets/img/9-Configuration.png'
import trashImage from '../../assets/img/trash.png'
import turn3 from '../../assets/img/3_Turn3.png'
import turn4 from '../../assets/img/3_Turn4.png'

class ProductCard extends Component {

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
                <View>
                    <View style={[this.style.frontCard,this.props.styleCard]}
                        onLayout={(event) => {
                            this.setState({ layout: event.nativeEvent.layout })
                        }}>
                        {this.renderCardBack()}
                    </View>
                </View>
            </FliwerCard>
        );
    }

    renderTopCard() {
        var card = [];

        var idProduct=this.state.product.id;
        var name= this.state.product.name;
        var productCode=this.state.product.productCode;
        if(!productCode)productCode="--"

        card.push(
            <View key={"renderTopCardView1_"+idProduct}  style={this.style.topCardTopInfo}>
                <View key={"renderTopCardView2_"+idProduct} style={this.style.topCardTopInfoLeft}>
                    <Text key={"renderTopCardText1_"+idProduct} style={this.style.topCardTopInfoTitle}>{"ID: "}</Text>
                    <Text key={"renderTopCardText2_"+idProduct} style={this.style.topCardTopInfoText}>{idProduct}</Text>
                </View>
                {
                    productCode?(
                        <View key={"renderTopCardView3_"+idProduct} style={this.style.topCardTopInfoRight}>
                            <Text key={"renderTopCardText3_"+idProduct} style={this.style.topCardTopInfoTitle}>{"Code: "}</Text>
                            <Text key={"renderTopCardText4_"+idProduct} style={this.style.topCardTopInfoText}>{productCode}</Text>
                        </View>):null
                }
            </View>
        );
        card.push(<Text key={18} ellipsizeMode='tail' numberOfLines={2} style={this.style.title}>{name}</Text>)


        return card;
    }

    renderCardFront() {
        var card = [];
        
        var idProduct=this.state.product.id;
        var images=this.state.product.images;
        
        if (typeof this.props.onPressAdd === 'function')
            return (
                <TouchableOpacity key={"cardFront1_" + this.state.product.id} style={{ width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center" }}
                    onPress={() => this.props.onPressAdd()}
                >
                    <Text key={987} style={{ fontSize: 100, marginTop: -15, color: "gray", fontFamily: FliwerColors.fonts.regular }}>{"+"}</Text>
                </TouchableOpacity>
            );

        card.push(
            <TouchableOpacity key={"cardFront2_" + this.state.product.id} style={this.style.topTextCard}
                onPress={()=>{
                    if(this.props.onPress)
                        this.props.onPress(this.state.product);
                }}>
                <View style={this.style.topCardCenter}>
                    {this.renderTopCard()}
                </View>
            </TouchableOpacity>);


        if(images && images.length>1){
            //Change to Carousel
            card.push(<TouchableOpacity key={"cardFront4_" + this.state.product.id} style={[this.style.imageCarouselContainer, Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout && this.state.layout.width < 300 ? { height: 200 } : {}) : {}]}
                onPress={()=>{
                    
                    if(this.props.onPress)
                        this.props.onPress(this.state.product);
                }}>
                <Image style={this.style.image} source={{ uri: photo_url}} resizeMode={"contain"}></Image>
            </TouchableOpacity>);
        }else{
            card.push(<TouchableOpacity key={"cardFront4_" + this.state.product.id} style={[this.style.imageCarouselContainer, Platform.OS == "android" || Platform.OS == 'ios' ? (this.state.layout && this.state.layout.width < 300 ? { height: 200 } : {}) : {}]}
                onPress={()=>{
                    
                    if(this.props.onPress)
                        this.props.onPress(this.state.product);
                }}>
                <Image style={this.style.image} source={images && images.length>0?images[0].url:noImageBG} resizeMode={images && images.length>0?"contain":"cover"}></Image>
            </TouchableOpacity>);            
        }

        /*
        if (name)
            card.push(
                <TouchableOpacity key={"cardFront5_" + this.state.product.id} style={[this.style.bottomContainer]}
                onPress={()=>{
                    
                    if(this.props.onPress)
                        this.props.onPress(this.state.product);
                }}>
                    <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.homeText, { alignSelf: "center", paddingTop: 2 }]}>{name}</Text>
                </TouchableOpacity>
            )
        */

        //price and tax
        var price= this.state.product.price;
        var priceCurrancy= "€";
        var priceUnits= this.state.product.unity;
        var defaultPriceUnits="unit";
        var tax= this.state.product.defaultTax?this.state.product.defaultTax:21;
        
        card.push(//Adapt slightly the styles
            <TouchableOpacity style={this.style.bottomTextCard} onPress={()=>{
                if(this.props.onPress)
                    this.props.onPress(this.state.product);
            }}>
                <View key={"renderBottomCardView1_"+idProduct}  style={this.style.topCardTopInfo}>
                    <View key={"renderBottomCardView2_"+idProduct} style={this.style.topCardTopInfoLeft}>
                        <Text key={"renderBottomCardText1_"+idProduct} style={this.style.topCardTopInfoTitle}>{"Price: "}</Text>
                        <Text key={"renderBottomCardText2_"+idProduct} style={this.style.topCardTopInfoText}>{price+priceCurrancy+"/"+(priceUnits?priceUnits:defaultPriceUnits)}</Text>
                    </View>
                    <View key={"renderBottomCardView3_"+idProduct} style={this.style.topCardTopInfoRight}>
                        <Text key={"renderBottomCardText3_"+idProduct} style={this.style.topCardTopInfoTitle}>{"Tax: "}</Text>
                        <Text key={"renderBottomCardText4_"+idProduct} style={this.style.topCardTopInfoText}>{tax+"%"}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )

        //stock and status
        var stock= this.state.product.stockQuantity?this.state.product.stockQuantity:"--";
        var status= this.state.product.status; //TODO: Transform status number to text

        card.push(//Adapt slightly the styles
            <TouchableOpacity style={this.style.bottomTextCard} onPress={()=>{
                if(this.props.onPress)
                    this.props.onPress(this.state.product);
            }}>
                <View key={"renderBottomCardView1_"+idProduct}  style={this.style.topCardTopInfo}>
                    <View key={"renderBottomCardView2_"+idProduct} style={this.style.topCardTopInfoLeft}>
                        <Text key={"renderBottomCardText1_"+idProduct} style={this.style.topCardTopInfoTitle}>{"Stock: "}</Text>
                        <Text key={"renderBottomCardText2_"+idProduct} style={this.style.topCardTopInfoText}>{stock+(priceUnits?" "+priceUnits:"")}</Text>
                    </View>
                    <View key={"renderBottomCardView3_"+idProduct} style={this.style.topCardTopInfoRight}>
                        <Text key={"renderBottomCardText3_"+idProduct} style={this.style.topCardTopInfoTitle}>{"Status: "}</Text>
                        <Text key={"renderBottomCardText4_"+idProduct} style={this.style.topCardTopInfoText}>{status?status:"--"}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )

        return (
            <View key={"cardFront9_" + this.state.product.id} activeOpacity={1} style={{ width: "100%", height: "100%" }}>
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
        width: "100%",
        height: 84,
        alignSelf: "center"
    },
    topCardRight: {
        width: "17%",
    },
    topTextCard: {
        height: 84,//64,
        width:"80%",
        marginLeft:"10%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    bottomTextCard:{
        width:"80%",
        marginLeft:"10%",
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
        height: 365,
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
    topCardTopInfoRight:{
        display: "flex",
        flexDirection: "row",
    },
    topCardTopInfoTitle:{
        fontSize: 14,
    },
    topCardTopInfoText:{
        fontSize: 14,
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(70%)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(mediaConnect(style, ProductCard));