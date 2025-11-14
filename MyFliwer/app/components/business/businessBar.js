'use strict';

import React, { Component } from 'react';
var {Text, View, TouchableOpacity, Image} = require('react-native');

import { Redirect } from '../../utils/router/router'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
//FontAwesome

class BusinessBar extends Component {

    constructor(props) {
        super(props);
        this.state = {
            goToIndex:null,
        };
    }

    render() {
        var {selected, style, bodyStyle} = this.props;

        var indents=[];

        if(this.state.goToIndex!=null){
            if(this.state.goToIndex==0){
                indents.push (<Redirect push to={"/business/employers"} />)
            } else if(this.state.goToIndex==1){
                indents.push (<Redirect push to={"/business/clients"} />)
            } else if(this.state.goToIndex==2){
                indents.push (<Redirect push to={"/business/providers"} />)
            } else if(this.state.goToIndex==3){
                indents.push (<Redirect push to={"/business/products"} />)
            }
        }

        indents.push (
            <View style={[this.style.container, style]}>
                <View style={[this.style.header, this.props.headerStyle]}>
                    <View style={[this.style.body, bodyStyle]}>

                        <TouchableOpacity style={[this.style.iconTouchable, (selected==0) ? this.style.selectedTabContainer : {}]} activeOpacity={1} key={"business_bar_option_0"} onPress={()=>{
                            this.setState({goToIndex: 0});
                        }}>
                            <IconMaterialCommunityIcons name="account-hard-hat" size={30} style={[this.style.iconInside,(selected==0) ? {color:FliwerColors.business.employees} : {}]}/>
                        </TouchableOpacity>

                    </View>
                    
                    <View style={[this.style.body, bodyStyle]}>

                        <TouchableOpacity style={[this.style.iconTouchable, (selected==1) ? this.style.selectedTabContainer : {}]} activeOpacity={1} key={"business_bar_option_0"} onPress={()=>{
                            this.setState({goToIndex: 1});
                        }}>
                            <IconFontAwesome name="users" size={20} style={[this.style.iconInside,(selected==1) ? {color:FliwerColors.business.clients} : {}]}/>
                        </TouchableOpacity>

                    </View>
                    
                    <View style={[this.style.body, bodyStyle]}>

                        <TouchableOpacity style={[this.style.iconTouchable, (selected==2) ? this.style.selectedTabContainer : {}]} activeOpacity={1} key={"business_bar_option_0"} onPress={()=>{
                            this.setState({goToIndex: 2});
                        }}>
                            <IconMaterialCommunityIcons name="account-tie" size={30} style={[this.style.iconInside,(selected==2) ? {color:FliwerColors.business.providers} : {}]}/>
                        </TouchableOpacity>

                    </View>

                    { this.props.roles.fliwer &&
                        <View style={[this.style.body, bodyStyle]}>

                            <TouchableOpacity style={[this.style.iconTouchable, (selected==3) ? this.style.selectedTabContainer : {}]} activeOpacity={1} key={"business_bar_option_0"} onPress={()=>{
                                this.setState({goToIndex: 3});
                            }}>
                                <IconFontAwesome name="shopping-cart" size={30} style={[this.style.iconInside,(selected==3) ? {color:FliwerColors.business.products} : {}]}/>
                            </TouchableOpacity>

                        </View>
                    }
                </View>
            </View>
        );

        return indents;
    }

    

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
        }
    };
}

var style = {
    container: {
        width: "100%",
//        borderColor: "red",
//        borderWidth: 3,
    },
    header: {
        height: 50,
        width: "100%",
        display: "flex",
        backgroundColor: "rgb(66,66,66)",
        flexDirection: "row",
        borderBottomColor: "rgb(140, 140, 140)",
        borderBottomWidth: 1,
        justifyContent: "space-around",
        alignItems: "center"
    },
    tabContainer: {
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 15
    },
    selectedTabContainer: {
//        borderRadius: 8,
//        backgroundColor: "gray"
    },
    iconTouchable:{
        
    },
    iconInside:{
        color:"white"
    },
    iconInsideSelected:{
        color: FliwerColors.primary.green
    },
    body: {
        alignItems: "center",
        height: "100%",
        width: 60,
        justifyContent: "center"
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, BusinessBar));