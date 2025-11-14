'use strict';

import React, { Component } from 'react';
import {View, TouchableOpacity, ScrollView, Platform, Text} from 'react-native';
import { CheckBox  } from 'react-native-elements'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

import FliwerConditionsModal from '../custom/FliwerConditionsModal.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'


class FliwerAcceptConditions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            languageCode: this.props.language,
            acceptConditionsModalVisible: false
        };
        
    }

    render() {
        var {containerStyle, title, checked, onPress, showConditions} = this.props;
        
        var theTitle = title? title : this.props.actions.translate.get('acceptCond_I_accept');
        
        return (
            <View style={[{alignItems: "center", width: "100%", marginTop: -10, marginLeft: -30}, containerStyle]}>
                <View style={{flexDirection: "row", width: 200, marginLeft: -20}}>
                    <CheckBox 
                        title={theTitle} 
                        textStyle={{fontSize: 12, fontWeight: "normal"}} 
                        containerStyle={{backgroundColor: "transparent", borderWidth: 0}} 
                        checked={checked} 
                        onPress={()=> {onPress();}}
                    />
                    <View style={{}}>
                        <TouchableOpacity style={{marginTop: 16, marginLeft: -15}} 
                                onPress={()=> {showConditions();}}
                            >
                            <IconFontAwesome name="info-circle" size={20} style={{color: FliwerColors.primary.black}}/>
                        </TouchableOpacity>                                            
                    </View>
                </View>
                {this.renderModal()}
            </View>
        );

    }
    
    onPressShowConditions() {
        global.frontLayer.display(true);
        this.setState({acceptConditionsModalVisible: true});
    }
    
    renderModal() {

        if (this.state.acceptConditionsModalVisible) {
            global.frontLayer.renderLayer(() => {
                return (
                    <FliwerConditionsModal onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({acceptConditionsModalVisible: false});                            
                        }}
                        type={this.props.type}
                    />
                );             
            });
        } else
            return [];

    }
    
};


function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
        }
    };
}

var style = {
    
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FliwerAcceptConditions));