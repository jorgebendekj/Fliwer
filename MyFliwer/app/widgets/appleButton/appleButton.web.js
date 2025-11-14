'use strict';
import React, { Component } from 'react';
import {View, StyleSheet, Text} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

class MyAppleButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        return null;
    }

};

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

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(MyAppleButton);
