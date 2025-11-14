'use strict';

import React, { Component } from 'react';
var {Text, View, TouchableOpacity, Platform, ScrollView} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors, CurrentTheme} from '../../utils/FliwerColors'

class FliwerSimpleTabView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index: this.props.index? this.props.index : 0
        };

    }

    goto(index) {
        this.setState({index: index})
        if(this.props.setSelectedTab)this.props.setSelectedTab(index)
    }

    _goto(index) {
        return () => {
            this.goto(index)
        }
    }

    componentDidUpdate(){
        if(this.props.workOrderApp){
            if(this.props?.forceTabSwitch === 1 && this.state.index === 0){
                this.setState({ index: this.props.forceTabSwitch })
                this.props.setSelectedTab(this.props.forceTabSwitch)
                this.props.resetTabSwitch()
            }
        }
    }

    render() {
        var {children, style, headerStyle, bodyStyle} = this.props;

        return (
                <View style={[this.style.container, style]}>
                    <View style={[this.style.header, headerStyle]}>
                        {Platform.OS == 'android' || Platform.OS == 'ios' ? this.renderHeaderScroll() : this.renderHeader()}
                    </View>
                    <View style={[this.style.body, bodyStyle]}>
                        {children && children[this.state.index]?children[this.state.index].props.children:null}
                    </View>
                </View>
                );
    }

    renderHeaderScroll() {
        return(
                <ScrollView horizontal={true} style={{}}>
                    {this.renderHeader()}
                </ScrollView>
                )

    }

    renderHeader() {
        var {children, tabTextStyle, tabContainerStyle, selectedTabContainerStyle, selectedTabTextStyle, selectedTabBottomStyle} = this.props;

        var that = this;
        var indents = [];
        for (var i = 0; i < children.length; i++) {
            if (this.props.children[i] && (!this.props.hideChildren || !this.props.hideChildren[i]) )
                indents.push(
                        <TouchableOpacity style={[this.style.tabContainer, tabContainerStyle, i == this.state.index ? this.style.selectedTabContainer : {}, i == this.state.index && selectedTabContainerStyle ? selectedTabContainerStyle : {}]} key={i} onPress={this._goto(i)}>
                            <Text style={[this.style.tabText, tabTextStyle, i == this.state.index ? this.style.selectedTabText : {}, i == this.state.index && selectedTabTextStyle ? selectedTabTextStyle : {}]}>{children[i].props.title}</Text>
                            <View style={[this.style.tabBottom, tabTextStyle, i == this.state.index ? this.style.selectedTabBottom : {}, i == this.state.index && selectedTabBottomStyle ? selectedTabBottomStyle : {}]}></View>
                        </TouchableOpacity>
                        )
        }
        return indents;
    }

};

var style = {
    container: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
    },
    header: {
        width: "100%",
        display: "flex",
        backgroundColor: "rgb(66,66,66)",
        flexDirection: "row",
        borderBottomColor: "rgb(140, 140, 140)",
        borderBottomWidth: 1,
        flexWrap: "wrap"
    },
    tabContainer: {
        height: 40,
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 15
    },
    selectedTabContainer: {
        backgroundColor: "rgb(95,95,95)"
    },
    tabText: {
        padding: 10,
        color: "white",
        opacity: 0.6,
        fontSize: 16
    },
    selectedTabText: {
        opacity: 1
    },
    tabBottom: {
        position: "absolute",
        bottom: 0,
        height: 0,
        width: "100%"
    },
    selectedTabBottom: {
        height: 2,
        backgroundColor: CurrentTheme.selectedColor
    },
    body: {
        width: "100%",
        flexGrow: 1
    }
};

//Connect everything
export default mediaConnect(style, FliwerSimpleTabView);
