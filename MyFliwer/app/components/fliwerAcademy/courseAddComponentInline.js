'use strict';
import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
} = require('react-native');

import {academyCommonUtils} from './academyCommonUtils.js';
import {FliwerColors} from '../../utils/FliwerColors.js'
import FliwerCard from '../custom/FliwerCard.js'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';
import { Redirect } from '../../utils/router/router'
import {Orientation} from '../../utils/orientation/orientation'
import {toast} from '../../widgets/toast/toast'
import Dropdown from '../../widgets/dropdown/dropdown';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import moment from 'moment';

import addButton  from '../../assets/img/add.png'

class CourseAddComponentInline extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }


    render() {

        const {style,buttonStyle,index,onPress} = this.props;    

        return(
            <View style={[this.style.container,style]}>
                <TouchableOpacity style={[this.style.button,buttonStyle]} onPress={()=>{
                    if(onPress){
                        onPress(index)
                    }
                }}>
                    {/*<Image style={this.style.addCourseButtonImage} resizeMode={"contain"} source={addButton}/>*/}
                    <Text style={this.style.text}>{"Añadir componente"}</Text>
                </TouchableOpacity>
            </View>
        )
    }

};

function mapStateToProps(state, props) {
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
        }
    }
}

var style = {
    container: {
        width: "100%",
        display:"flex",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
    },
    button:{
        width: 120,
        height: 40,
        borderRadius: 10,
        borderColor: "@theme cardText",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        marginBottom: 10,
        borderWidth: 1
    },
    text: {
        fontSize: 12,  
        color: "@theme cardText"  
    },
    addCourseButtonImage: {
        flex: 1,
        width: "47%",
        height: "47%"
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, CourseAddComponentInline));
