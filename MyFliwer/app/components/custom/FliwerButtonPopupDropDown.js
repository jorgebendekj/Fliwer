'use strict';

import React, { Component } from 'react';
import {View, Text, Platform, TouchableOpacity} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import Dropdown from '../../widgets/dropdown/dropdown';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import FliwerButtonPopup from '../../components/custom/FliwerButtonPopup.js'

class FliwerButtonPopupDropDown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedValue: this.props.selectOptionValue
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.selectOptionValue != nextProps.selectOptionValue)
            this.state.selectedValue = nextProps.selectOptionValue;
        return  true
    }

    valueChanged(value)
    {
        this.setState({selectedValue: value});
        this.props.onChange(value)

    }

    render()
    {
        var {modal, style, disabled, options, onBack, text} = this.props;
        var indents = [];
        //(this.props.options.find((obj)=>{return obj.value==this.props.selectOptionValue})).value
        var labelIrrigationSelected = (this.props.options.find((obj) => {
            return obj.value == this.props.selectOptionValue
        })).label;

        indents.push(
            <View style={this.style.bContainer}>
                <FliwerButtonPopup style={{}} text={labelIrrigationSelected}/>
                <Dropdown 
                    disabled={disabled? true : false}
                    modal={true} 
                    selectedValue={this.state.selectedValue} 
                    placeholder={this.props.placeholder ? this.props.placeholder : this.props.actions.translate.get('taskManagerCard_want_to')} 
                    style={[{opacity: 0, position: "absolute", width: "100%", height: "100%"}]} 
                    options={options} 
                    onChange={(value) => (this.valueChanged(value))}/>
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
    bContainer: {
        height: 40,
        width: "100%",
        maxWidth: 301,
        //marginBottom:10,
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerButtonPopupDropDown));
