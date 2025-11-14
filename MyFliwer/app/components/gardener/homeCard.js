'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/Ionicons';

class HomeCard extends Component {

    constructor(props) {
        super(props);
    }
    render() {
        return (
                <FliwerCard ref="card" touchable={true}>
                    <View>
                        {this.renderCardFront()}
                    </View>
                    <View>
                        {this.renderCardBack()}
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
        /*
         card.push(<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.configOut}>
         <Icon key={5} name="md-settings" style={this.style.config}/>
         </TouchableOpacity>)
         */
        if (this.props.title)
            card.push(<Text key={1} style={this.style.title}>{this.props.title}</Text>)
        if (this.props.subtitle)
            card.push(<Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>)
        if (this.props.image)
            card.push(<Image key={3} style={this.style.image} source={{uri: this.props.image}} />)
        //if(this.state.mediaStyle)card.push (<Text key={2} style={this.style.text}>{JSON.stringify(this.state.mediaStyle)}</Text>)
        return card;
    }

    //md-settings

    renderCardBack() {
        var card = [];

        card.push(<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.configOut}>
            <Icon key={5} name="md-settings" style={this.style.config}/>
        </TouchableOpacity>)
        if (this.props.title)
            card.push(<Text key={1} style={this.style.title}>{this.props.title}</Text>)
        if (this.props.subtitle)
            card.push(<Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>)
        //if(this.props.image)card.push(<Image key={3} style={this.style.image} source={{uri: this.props.image}} />)
        if (this.state.mediaStyle)
            card.push(<Text key={2} style={this.style.text}>{JSON.stringify(this.state.mediaStyle)}</Text>)
        return card;
    }

};

var style = {
    configOut: {
        position: "absolute",
        right: 10,
        top: 5,
        zIndex: 1
    },
    config: {
        fontSize: 35,
        color: "#cecece"
    },
    image: {
        width: "88%",
        height: 200,
        alignItems: "center",
        marginBottom: 10,
        borderRadius: 5
    },
    title: {
        width: "100%",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 2,
        fontSize: 18
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        marginTop: 1,
        marginBottom: 5,
        fontSize: 14
    },
    text: {
        width: '100%',
        textAlign: 'center'
    }
}

//Connect everything
export default mediaConnect(style, HomeCard);
