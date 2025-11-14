'use strict';

import React, { Component } from 'react';
var {Text, View, TouchableOpacity, Animated, Platform, Image} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

import turnTop  from '../../assets/img/3_Turn1.png'
import turnBottom  from '../../assets/img/3_Turn2.png'
import turnTopWhite  from '../../assets/img/3_Turn1white.png'
import turnBottomWhite  from '../../assets/img/3_Turn2white.png'

class FliwerCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            flipped: false,
            flippedTrigger: false,
            squareHeight: 0,
            opacity: this.props.square ? 0 : 1
        };

    }

    measure(callback) {
        this._card.measure(callback);
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(0);
        this.state.value = 0;
        this.animatedValue.addListener(({value}) => {
            if (!this.state.flippedTrigger && ((this.state.flipped && value > 90) || (!this.state.flipped && value < 90))) {
                this.setState({value: value});
                this.state.flippedTrigger = true;
            } else
                this.state.value = value;
        })
        if (Platform.OS === 'web') {
            this.frontInterpolate = this.animatedValue.interpolate({
                inputRange: [0, 180],
                outputRange: ['0deg', '180deg']//there is a bug in some degrees
            })
            this.backInterpolate = this.animatedValue.interpolate({
                inputRange: [0, 180],
                outputRange: ['180deg', '360deg']//there is a bug in some degrees
            })
        } else {
            this.frontInterpolate = this.animatedValue.interpolate({
                inputRange: [0, 180],
                outputRange: ['0deg', '180deg']//there is a bug in some degrees
            })
            this.backInterpolate = this.animatedValue.interpolate({
                inputRange: [0, 180],
                outputRange: ['180deg', '360deg']//there is a bug in some degrees
            })
        }
    }

    _toggleCard(value) {
        const {OntoggleEnd} = this.props
        var that = this;
        if (this.state.value > 90 && (value == null || value == false)) {
            this.state.flipped = false;
            this.state.flippedTrigger = false;
            Animated.timing(this.animatedValue, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true
            }).start(()=>{
              if(OntoggleEnd && typeof(OntoggleEnd)==='function')OntoggleEnd();
            });
        } else if (this.state.value <= 90 && (value == null || value == true)) {
            this.state.flipped = true;
            this.state.flippedTrigger = false;
            Animated.timing(this.animatedValue, {
                toValue: 180,
                duration: 600,
                useNativeDriver: true
            }).start(()=>{
              if(OntoggleEnd && typeof(OntoggleEnd)==='function')OntoggleEnd();
            });
        }
         
    }

    render() {
        return this.renderCardIn();
    }

    renderCardIn() {
        const {children, style, cardStyle, frontCardStyle, backCardStyle, cardInStyle, square, whiteArrow, unfocused} = this.props

        const fronAnimatedStyle = {
            transform: [
                {rotateY: this.frontInterpolate}
            ]
        }
        const backAnimatedStyle = {
            transform: [
                {rotateY: this.backInterpolate}
            ]
        }

        if (this.state.value > 90) {
            var extraStyleBack = {};
            var extraStyleFront = {position: "absolute", opacity: 0}
            var cardStyleBack = {};
            var cardStyleFront = {height: 0}
        } else {
            var extraStyleBack = {position: "absolute", opacity: 0}
            var extraStyleFront = {};
            var cardStyleBack = {height: 0};
            var cardStyleFront = {};
        }

        var intCardStyle = Object.assign({}, this.style.card);
        if (unfocused)
            intCardStyle = Object.assign({}, intCardStyle, this.style.unfocused);

        if (children.length > 1 && this.props.touchableFront && !this.props.touchableBack) {
            return (
                    <View ref={(view) => {
                            this._card = view;
                              }} onLayout={(event) => {
                            var {width} = event.nativeEvent.layout;
                            if (this.state.squareHeight != width)
                                this.setState({squareHeight: width, opacity: 1})
                        }} style={[this.style.cardOut, style]}>
                        <Animated.View style={[fronAnimatedStyle, extraStyleFront, frontCardStyle]} pointerEvents={this.state.flipped ? "none" : "auto"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                <TouchableOpacity activeOpacity={1} style={[this.style.cardIn, cardInStyle]}  onPress={() => {
                                        this._toggleCard();
                                    }}>
                                    <Image style={this.style.arrowTurnTop} resizeMode={"contain"} source={(whiteArrow ? turnTopWhite : turnTop)} draggable={false}/>
                                    <Image style={this.style.arrowTurnBottom} resizeMode={"contain"} source={(whiteArrow ? turnBottomWhite : turnBottom)} draggable={false}/>
                                    {children[0].props.children}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                        <Animated.View style={[backAnimatedStyle, extraStyleBack, backCardStyle]} pointerEvents={this.state.flipped ? "auto" : "none"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                <View style={[this.style.cardIn, cardInStyle]}>
                                    {children[1].props.children}
                                </View>
                            </View>
                        </Animated.View>
                    </View>
                    )
        } else if (children.length > 1 && !this.props.touchableFront && this.props.touchableBack) {
            return (
                    <View ref={(view) => {
                            this._card = view;
                        }}  onLayout={(event) => {
                            var {width} = event.nativeEvent.layout;
                            if (this.state.squareHeight != width)
                                this.setState({squareHeight: width, opacity: 1})
                        }}  style={[this.style.cardOut, style]}>
                        <Animated.View style={[fronAnimatedStyle, extraStyleFront, frontCardStyle]} pointerEvents={this.state.flipped ? "none" : "auto"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                <View style={[this.style.cardIn, cardInStyle]}>
                                    {children[0].props.children}
                                </View>
                            </View>
                        </Animated.View>
                        <Animated.View style={[backAnimatedStyle, extraStyleBack, backCardStyle]} pointerEvents={this.state.flipped ? "auto" : "none"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                <TouchableOpacity activeOpacity={1}  style={[this.style.cardIn, cardInStyle]} onPress={() => {
                            this._toggleCard();
                        }}>
                                    <Image style={this.style.arrowTurnTop} resizeMode={"contain"} source={(whiteArrow ? turnTopWhite : turnTop)} draggable={false}/>
                                    <Image style={this.style.arrowTurnBottom} resizeMode={"contain"} source={(whiteArrow ? turnBottomWhite : turnBottom)} draggable={false}/>
                                    {children[1].props.children}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                    )
        } else if (children.length > 1 && (this.props.touchable || (this.props.touchableFront && this.props.touchableBack))) {
            return (
                    <TouchableOpacity ref={(view) => {
                            this._card = view;
                        }}  onLayout={(event) => {
                            var {width} = event.nativeEvent.layout;
                            if (this.state.squareHeight != width)
                                this.setState({squareHeight: width, opacity: 1})
                        }}  activeOpacity={1} style={[this.style.cardOut, style]} onPress={() => {
                            this._toggleCard();
                        }}>
                        <Animated.View style={[fronAnimatedStyle, extraStyleFront, frontCardStyle]} pointerEvents={this.state.flipped ? "none" : "auto"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                <View style={[this.style.cardIn, cardInStyle]}>
                                    <Image style={this.style.arrowTurnTop} resizeMode={"contain"} source={(whiteArrow ? turnTopWhite : turnTop)} draggable={false}/>
                                    <Image style={this.style.arrowTurnBottom} resizeMode={"contain"} source={(whiteArrow ? turnBottomWhite : turnBottom)} draggable={false}/>
                                    {children[0].props.children}
                                </View>
                            </View>
                        </Animated.View>
                        <Animated.View style={[backAnimatedStyle, extraStyleBack, backCardStyle]} pointerEvents={this.state.flipped ? "auto" : "none"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                <View style={[this.style.cardIn, cardInStyle]}>
                                    <Image style={this.style.arrowTurnTop} resizeMode={"contain"} source={(whiteArrow ? turnTopWhite : turnTop)} draggable={false}/>
                                    <Image style={this.style.arrowTurnBottom} resizeMode={"contain"} source={(whiteArrow ? turnBottomWhite : turnBottom)} draggable={false}/>
                                    {children[1].props.children}
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                    )
        } else if (children.length > 1) {
            return (
                    <View ref={(view) => {
                            this._card = view;
                        }}  onLayout={(event) => {
                            var {width} = event.nativeEvent.layout;
                            if (this.state.squareHeight != width)
                                this.setState({squareHeight: width, opacity: 1})
                        }}  style={[this.style.cardOut, style]}>
                        <Animated.View style={[fronAnimatedStyle, extraStyleFront, frontCardStyle]} pointerEvents={this.state.flipped ? "none" : "auto"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                {unfocused?
                                    <TouchableOpacity style={[this.style.cardIn, cardInStyle, cardStyleFront]}  onPress={() => {
                                            this.props.onSelectUnfocused();
                                        }}>
                                        {children[0].props.children}
                                    </TouchableOpacity>
                                :
                                    <View style={[this.style.cardIn, cardInStyle, cardStyleFront]}>
                                        {children[0].props.children}
                                    </View>
                                }
                            </View>
                        </Animated.View>
                        <Animated.View style={[backAnimatedStyle, extraStyleBack, backCardStyle]} pointerEvents={this.state.flipped ? "auto" : "none"}>
                            <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                                {unfocused?
                                    <TouchableOpacity style={[this.style.cardIn, cardInStyle, cardStyleBack]}  onPress={() => {
                                            this.props.onSelectUnfocused();
                                        }}>
                                        {children[1].props.children}
                                    </TouchableOpacity>
                                :
                                    <View style={[this.style.cardIn, cardInStyle, cardStyleBack]}>
                                        {children[1].props.children}
                                    </View>
                                }
                            </View>
                        </Animated.View>
                    </View>
                    )
        } else {
            return (
                    <View ref={(view) => {
                            this._card = view;
                        }}  onLayout={(event) => {
                            var {width} = event.nativeEvent.layout;
                            if (this.state.squareHeight != width)
                                this.setState({squareHeight: width, opacity: 1})
                        }}  style={[this.style.cardOut, style]}>
                        <View style={[intCardStyle, cardStyle, (!square ? {} : {height: this.state.squareHeight, opacity: this.state.opacity})]}>
                            {unfocused?
                                <TouchableOpacity style={[this.style.cardIn, cardInStyle]}  onPress={() => {
                                        this.props.onSelectUnfocused();
                                    }}>
                                    {children.props.children}
                                </TouchableOpacity>
                            :
                                <View style={[this.style.cardIn, cardInStyle]}>
                                    {children.props.children}
                                </View>
                            }
                        </View>
                    </View>
                    )
        }

    }

};

var style = {
    cardOut: {
        flexBasis: "auto",
        flexDirection: "column",
        height: "auto"
    },
    card: {
        borderRadius: 10,
        backgroundColor: FliwerColors.secondary.white,
        shadowColor: FliwerColors.primary.black,
        shadowOffset: {width: 0, height: 5, },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 7,
        flexBasis: "auto",
        flexDirection: "column",
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 4,
        zIndex: 1
    },
    cardIn: {
        //height:"100%",
        flexDirection: 'column',
        alignItems: "center"
    },
    arrowTurnTop: {
        width: 22,
        height: 14,
        position: "absolute",
        right: 5,
        top: 10
    },
    arrowTurnBottom: {
        width: 22,
        height: 14,
        position: "absolute",
        right: 5,
        bottom: 10
    },
    unfocused: {
        height: "auto",
        opacity: 0.4
    },
    "@media (orientation:landscape)": {
        cardIn: {
            maxWidth: 350,
            alignItems: "center"
        },
        cardOut: {
            width: "100%",
            maxWidth: 350
        }
    },
    "@media (orientation:portrait)": {
        cardOut: {
            width: "100%",
            maxWidth: 500
        }
    }
};

//Connect everything
export default mediaConnect(style, FliwerCard);
