'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, Image, TouchableOpacity, Platform, Switch} = require('react-native');

import FliwerCard from '../../components/custom/FliwerCard.js'
import Modal from '../../widgets/modal/modal'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import { Redirect } from '../../utils/router/router'


class AlertCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            idAdvice: null,
        };
    }

    render() {
        return (
                <FliwerCard ref="card" whiteArrow={true} touchable={true} cardInStyle={this.style.cardInStyle} cardStyle={[this.style.cardOut, {borderColor: FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).color, backgroundColor: FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).color}]}>
                    <View>
                        <View style={{width: "100%", height: "100%"}}>
                            <View style={{justifyContent: "space-evenly", height: "73%"}}>
                                <Text key={1} style={this.style.category}> {FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).titleCategory} </Text>
                                <Image key={3} style={this.style.image} draggable={false} source={FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).img} resizeMode={"contain"} />
                            </View>
                            <View style={ {flexGrow: 1}}>
                                <Text key={3} style={this.style.title}>{(this.props.title ? this.props.title : FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).title)}</Text>
                                <Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>
                            </View>
                            <TouchableOpacity style={this.style.deleteAlertButton} onPress={() => {
                        if (this.props.modalFunc)
                            this.props.modalFunc(true, this.props.idAdvice)
                    }}><Text style={this.style.deleteAlertButtonX}>x</Text ></TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <View style={ {height: "100%", width: "100%"}}>
                            {this.renderCardBack()}
                        </View>
                    </View>
                </FliwerCard>
                );
    }

    toggle() {
        var that = this;
        return function () {
            that.refs.card._toggleCard()
        }
    }

    renderCardFront() {
        var card = [];
        if (this.props.category)
            card.push(<Text key={1} style={this.style.category}> {FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).titleCategory} </Text>)
        if (this.props.category)
            card.push(<Image key={3} style={this.style.image} draggable={false} source={FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).img} resizeMode={"contain"} />)
        card.push(<View style={{}}>
            <Text key={3} style={this.style.title}>{(this.props.title ? this.props.title : FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).title)}</Text>
            <Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>
        </View>
                )
        card.push(<TouchableOpacity style={this.style.deleteAlertButton} onPress={() => {
                        if (this.props.modalFunc)
                            this.props.modalFunc(true, this.props.idAdvice)
                    }}><Text style={this.style.deleteAlertButtonX}>x</Text ></TouchableOpacity>)

        return
        (
                <View style={{justifyContent: 'space-evenly', backgroundColor: "red", width: 60, height: 50}}>
                    {card}
                </View>
                )
    }

    renderCardBack() {
        var card = [];
        var br = '\n';
        if (this.props.category)
            card.push(<Text key={1} style={this.style.titleBack}> {(this.props.title ? this.props.title : FliwerAlertMedia.subCategoryToMedia(this.props.subcategory).title)} </Text>)
        if (this.props.text)
            card.push(<View style={this.style.contentTextBackOut} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} ><ScrollView style={this.style.contentTextBackScroll} contentContainerStyle={this.style.contentTextBack}><Text key={2} style={this.style.textBack}>{this.props.text.replace(/<br></g, "\n") + br + br}</Text></ScrollView></View>)
        return card;
    }

};

function mapStateToProps(state, props) {
    return {

    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            languageActions: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

var style = {
    image: {
        width: "100%",
        height: 140,
        //alignItems:"center",
        //marginBottom:10,
        borderRadius: 5
    },
    title: {
        ////width:"100%",
        textAlign: "center",
        //marginTop:10,
        //marginBottom:4,
        fontSize: 20,
        //paddingLeft:19,
        //paddingRight:19,
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.title,
    },
    category: {
        width: "100%",
        textAlign: "center",
        //marginTop:20,
        //marginBottom:10,
        fontSize: 20,
        //paddingLeft:20,
        //paddingRight:20,
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.light,
    },
    titleBack: {
        width: "100%",
        textAlign: "center",
        marginTop: 0,
        fontSize: 18,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 15,
        paddingBottom: 8,
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.title,
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        //marginTop:1,
        //marginBottom:5,
        fontSize: 10,
        //paddingLeft:20,
        //paddingRight:20,
        color: FliwerColors.secondary.white
    },
    textBack: {
        //width: '100%',
        textAlign: 'left',
        justifyContent: "center",
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.regular,
        wordSpacing: -1
    },
    cardInStyle: {
        width: '100%',
        height: '100%',
    },
    contentTextBackOut: {
        paddingLeft: 20,
        paddingRight: 20,
        maxHeight: 203,
        marginBottom: 15,
    },
    contentTextBackScroll: {

    },
    contentTextBack: {
        justifyContent: "center"
    },
    cardOut: {
        height: 285,
    },
    /*
     card:{
     //minHeight:290,
     height: 285,
     //alignItems: "center",
     display: "flex",
     flexDirection: "column",
     //alignItems: "flex-start",
     justifyContent: "center",
     padding: 20
     },*/
    deleteAlertButton: {
        position: "absolute",
        right: 25,
        paddingRight: 10,
        top: 1,
    },
    deleteAlertButtonX: {
        textAlign: 'left',
        fontSize: 20,
        color: FliwerColors.secondary.white,
        fontFamily: FliwerColors.fonts.light,

    }
}

//Connect everything
//export default mediaConnect(style,AlertCard);
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, AlertCard));
