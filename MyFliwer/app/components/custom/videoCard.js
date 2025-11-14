'use strict';

import React, { Component } from 'react';
var {View, Text, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../../components/custom/FliwerCard.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import { Redirect } from '../../utils/router/router'

import {FliwerColors} from '../../utils/FliwerColors'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import Video from '../../widgets/video/video'

class VideoCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
                <FliwerCard ref="card" touchableFront={false} cardStyle={this.props.cardStyle} cardInStyle={this.props.cardInStyle} style={this.props.cardOutStyle}>
                    <View>
                        <View style={[this.style.frontCard, this.props.style]}>
                            {this.renderCardFront()}
                        </View>
                    </View>
                </FliwerCard>
                );
    }

    renderCardFront() {
        var card = [];

        if (this.props.title)
            card.push(<Text key={1} style={this.style.title}>{this.props.title.toUpperCase()}</Text>)
        if (this.props.subtitle)
            card.push(<Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>)

        card.push(<View key={3} style={[this.style.video, this.props.subtitle ? {} : this.style.videoNoSubTitle, this.props.title && !this.props.subtitle ? {} : this.style.videoNoTitle, this.props.videoStyle]}>
                    <Video source={this.props.source} autoplay={false} orientation={this.props.orientation} poster={this.props.poster} onFullScreen={this.props.onFullScreen} onlyWeb={this.props.onlyWeb} />
                </View>);

        return card;
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {
    frontCard: {
        height: 329,
        width: "100%"
    },
    title: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        marginTop: 10,
        fontSize: 20,
        height: 30
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        marginBottom: 15,
        marginTop: -2,
        fontSize: 10
    },
    text: {
        width: '100%',
        textAlign: 'center'
    },
    video: {
        height: 236,
        width: "100%"
    },
    videoNoSubTitle: {
        height: 266
    },
    videoNoTitle: {
        height: "100%",
        borderRadius: 4,
        overflow: "hidden"
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, VideoCard));
