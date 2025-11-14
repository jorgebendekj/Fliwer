'use strict';
import React, { Component,useState } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
} = require('react-native');

import {FliwerColors} from '../../utils/FliwerColors.js'
import * as ActionsLang from '../../actions/languageActions.js';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Dropdown from '../../widgets/dropdown/dropdown';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


class FliwerAgendaCalendarOptionsBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options?this.props.options:{}
        };
    }

    
    componentDidUpdate(prevProps, nextState)
    {

        if (this.props.options!=prevProps.options && this.state.options!=this.props.options)
        {
            this.setState({options: this.props.options});
        }

    }

    render() {

        return (
            <View style={[this.style.barContainer,this.props.style]}>
                <View style={this.style.displaySelectorContainer}>
                    <Text style={this.style.displaySelectorText}>{this.props.actions.translate.get('Display')}</Text>
                    <Dropdown   modal={true} style={this.style.displaySelectorDropdown} textStyle={this.style.displaySelectorDropdownText} selectedValue={this.state.options.view}
                                options={[{label:this.props.actions.translate.get('Month'),value:0},{label:this.props.actions.translate.get('Day'),value:1}/*,{label:this.props.actions.translate.get('Calendar_byStatus'),value:2}*/]} onChange={(value) => {
                        var options=this.state.options;
                        options.view=value;
                        if(typeof this.props.changeOptions === "function")this.props.changeOptions(options)
                    }} />
                </View>
                <View style={this.style.space}></View>
                
                {null/*<TouchableOpacity style={this.style.filterContainer} onPress={()=>{

                }}
                    <IconMaterialCommunityIcons name={"filter-menu"} size={30} style={{color: "black"}} />
                </TouchableOpacity>
                >*/}
            </View>
        )
    }

}
;

function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        sessionData: state.sessionReducer.dataLogin,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        userData: state.sessionReducer.data,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}

var style = {
    barContainer: {
        width: "100%",
        height: 40,
        backgroundColor:"white",
        display:"flex",
        flexDirection:"row",
        borderBottomColor: "rgb(150,150,150)",
        borderBottomWidth: 1
    },
    displaySelectorContainer:{
        height:"100%",
        flexDirection:"row",
        marginLeft:10,
        alignItems:"center"
    },
    displaySelectorDropdown:{
        marginLeft:10,
        width:150,

    },
    displaySelectorDropdownText:{
        paddingLeft:10,
        paddingRight:10
    },
    space:{
        flexGrow:1
    },
    filterContainer:{
        marginRight:10,
        height:"100%",
        flexDirection:"row",
        alignItems:"center"
    },
    ":hover": {
        
    },
    "@media (width<=480)": {

    },
    "@media (orientation:portrait)": {

    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerAgendaCalendarOptionsBar));
