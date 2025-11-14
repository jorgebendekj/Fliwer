'use strict';
import React, { Component } from 'react'
        var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');
import Carousel, { Pagination } from 'react-native-snap-carousel';


import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

        class FliwerCarousel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeSlide: 0,
            width: 1,
            height: 1,
            _carousel:null
        }
    }

    prev() {
        this.state._carousel.snapToPrev();
    }

    next() {
        this.state._carousel.snapToNext();
    }

    goTo(i) {
        this.state._carousel.snapToItem(i);
    }

    render() {
        const {style, autoplay, autoPlayInterval, duration, renderItem, data, onSlideChange, onSlideChanged, buttons, styleOut} = this.props

        if (this.props.draggable === undefined ? true : this.props.draggable) {
            return (
                    <TouchableOpacity style={[this.style.container, style]}>
                        {this.renderSlider()}
                    </TouchableOpacity>
                    )
        } else {
            return (
                    <View style={[this.style.container, style]}>
                        {this.renderSlider()}
                    </View>
                    )
        }
    }

    renderSlider() {
        const {style, autoplay, autoPlayInterval, duration, renderItem, data, onSlideChange, onSlideChanged, buttons, styleOut, itemWidth, itemHeight} = this.props;

        return (
                <View style={{width: "100%"}} onLayout={(event) => {
                        var {width, height} = event.nativeEvent.layout;
                        this.setState({width: width > 0 ? width : 0, height: height > 0 ? height : 0});
                          }}>
                    <View style={{width: "100%"}}>
                        <Carousel
                            ref={(c) => {
                                if(!this.state._carousel)
                                this.setState({_carousel:c});
                            }}
                            data={data}
                            renderItem={renderItem}
                            onSnapToItem={(index) => this.setState({activeSlide: index}) }
                            scrollEnabled={this.props.draggable === undefined ? true : this.props.draggable}
                            sliderWidth={this.state.width}
                            sliderHeight={this.state.height}
                            itemWidth={itemWidth? itemWidth : this.state.width}
                            itemHeight={itemHeight? itemHeight : this.state.height}
                            enableMomentum={false}
                            autoplay={autoplay}
                            autoplayDelay={(autoPlayInterval ? autoPlayInterval : 5000)}
                            autoplayInterval={(duration ? duration : 10000)}
                            scrollEndDragDebounceValue={0}
                            />
                    </View>
                    {(this.state._carousel?this.renderDots():[])}
                </View>)
    }

    renderDots() {
        const {data, dots, dotsStyle, dotStyle} = this.props
        if (dots != false) {
            return(
                    <Pagination
                        carouselRef={this.state._carousel}
                        dotsLength={data.length}
                        activeDotIndex={this.state.activeSlide}
                        containerStyle={[this.style.dotsStyle, dotsStyle]}
                        dotStyle={[this.style.dotStyle, dotStyle]}
                        inactiveDotStyle={{
                            // Define styles for inactive dots here
                        }}
                        tappableDots={true}
                        inactiveDotOpacity={0.4}
                        inactiveDotScale={0.6}
                        />);
        }
    }

}


var style = {
    dotsStyle: {
        position: "absolute",
        display: "flex",
        flexDirection: "row",
        bottom: "5%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 0
    },
    dotStyle: {
        width: 10,
        height: 10,
        borderRadius: 200,
        margin: 5,
        backgroundColor: FliwerColors.secondary.gray
    }
}

export default mediaConnect(style, FliwerCarousel);
