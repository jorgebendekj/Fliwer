'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import AliceCarousel from 'react-alice-carousel';
import "react-alice-carousel/lib/alice-carousel.css";

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerCarousel extends Component {

    constructor(props) {
        super(props)
        this.state = {
            index: 0
        }
    }

    prev() {
        this.Carousel.slidePrev();
    }

    next() {
        //console.log(this.Carousel);
        this.Carousel.slideNext()
    }

    goTo(i) {
        this.Carousel.slideTo(i)
    }

    render() {
        const {style, autoplay, autoPlayInterval, duration, renderItem, data, onSlideChange, onSlideChanged, buttons, draggable, responsive, controlsStrategy} = this.props

        return (
                <TouchableOpacity style={[this.style.container, style, draggable !== undefined && !draggable ? {cursor: "auto"} : {}]}>
                    <View style={{width: "100%", height: "100%"}}>
                        {responsive?
                        <AliceCarousel
                            ref={(el) => (this.Carousel = el)}
                            duration={duration ? duration : 2000}
                            autoPlay={autoplay}
                            mouseDragEnabled={draggable === undefined ? true : draggable}
                            disableDotsControls={true}
                            disableButtonsControls={true}
                            autoPlayInterval={autoPlayInterval ? autoPlayInterval : 10000}
                            autoPlayDirection="ltr"
                            autoPlayActionDisabled={true}
                            onSlideChange={onSlideChange}
                            onSlideChanged={(obj) => {
                                //console.log("obj", obj);
                                var index = obj.itemsInSlide == 1? obj.slide : obj.item;
                                this.setState({index: index});
                                if (typeof onSlideChanged === "function")
                                    onSlideChanged(obj);
                            }}
                            responsive={responsive}
                            controlsStrategy={controlsStrategy}
                            >
                            {this.renderItems()}
                        </AliceCarousel>:
                        <AliceCarousel
                            ref={(el) => (this.Carousel = el)}
                            duration={duration ? duration : 2000}
                            autoPlay={autoplay}
                            mouseDragEnabled={draggable === undefined ? true : draggable}
                            disableDotsControls={true}
                            disableButtonsControls={true}
                            autoPlayInterval={autoPlayInterval ? autoPlayInterval : 10000}
                            autoPlayDirection="ltr"
                            autoPlayActionDisabled={true}
                            onSlideChange={onSlideChange}
                            onSlideChanged={(obj) => {
                                //console.log("obj", obj);
                                var index = obj.itemsInSlide == 1? obj.slide : obj.item;
                                this.setState({index: index});
                                if (typeof onSlideChanged === "function")
                                    onSlideChanged(obj);
                            }}
                            >
                            {this.renderItems()}
                        </AliceCarousel>}
                        {this.renderButtons()}
                    </View>
                </TouchableOpacity>
                );
    }

    renderItems() {
        const {renderItem, data} = this.props
        var indents = [];

        for (var i = 0; i < data.length; i++) {
            indents.push(renderItem({item: data[i], index: i}));
        }

        return indents;
    }

    renderButtons() {
        const {data, buttons, buttonPrevStyle, buttonNextStyle, textPrevStyle, textNextStyle, dots, dotsStyle, dotStyle} = this.props
        var indents = [];

        if (buttons != false && data.length > 1) {
            indents.push(<TouchableOpacity onPress={() => {
                                                  this.prev();
                                              }} style={[this.style.buttonPrevStyle, buttonPrevStyle]}><Text style={[this.style.textPrevStyle, textPrevStyle]}>{"<"}</Text></TouchableOpacity>)
            indents.push(<TouchableOpacity onPress={() => {
                                                  this.next();
                                }} style={[this.style.buttonNextStyle, buttonNextStyle]}><Text style={[this.style.textNextStyle, textNextStyle]}>{">"}</Text></TouchableOpacity>)
        }

        if (dots != false) {
            indents.push(<View style={[this.style.dotsStyle, dotsStyle]}>{this.renderDots()}</View>)
        }
        return indents;
    }

    renderDots() {
        const {data, dotStyle, currentDotStyle} = this.props
        var indents = data.map((item, i) => {
            return (<TouchableOpacity
                onPress={() => {
                    this.goTo(i);
                }} style={[this.style.dotStyle, dotStyle, (this.state.index == i ? this.style.currentDotStyle : {}), (this.state.index == i ? currentDotStyle : {})]}><View></View></TouchableOpacity>);
        });
        return indents;
    }

}


var style = {
    container: {
        width: "100%",
        height: "100%"
    },
    buttonPrevStyle: {
        position: "absolute",
        left: 5,
        width: 30,
        height: 30,
        top: "50%",
        marginTop: -15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    textPrevStyle: {
        fontSize: 16,
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.secondary.white,
        opacity: 0.7
    },
    buttonNextStyle: {
        position: "absolute",
        right: 5,
        width: 30,
        height: 30,
        top: "50%",
        marginTop: -15,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    textNextStyle: {
        fontSize: 16,
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.secondary.white,
        opacity: 0.7
    },
    dotsStyle: {
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        bottom: "5%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center"

    },
    dotStyle: {
        width: 10,
        height: 10,
        borderRadius: 200,
        margin: 5,
        backgroundColor: FliwerColors.secondary.gray
    },
    currentDotStyle: {
        backgroundColor: FliwerColors.primary.gray
    }
};

//Connect everything
export default mediaConnect(style, FliwerCarousel);
