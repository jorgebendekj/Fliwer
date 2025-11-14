'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Platform, Dimensions} from 'react-native';

import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import { extraService } from '../../utils/apiService.js';

import Modal from '../../widgets/modal/modal'
import WebView from '../../widgets/webView/webView'


class FliwerConditionsModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            languageCode: this.props.language,
            type: this.props.type,
            acceptConditionsUrl: null
        };

        this.state.acceptConditionsUrl = extraService.BASE_URL + "/htmlConditions?" +
                "lang=" + this.state.languageCode +
                "&type=" + this.state.type +
                "&platformOS=" + Platform.OS;
    }

    render() {
        var {title, checked, onClose, buttonType} = this.props;

        const dimensions = Dimensions.get('window');
        var height = 450;
        var webviewHeight = height - 150;
        if (Platform.OS === 'ios') {
            height = dimensions.height - 300;
            webviewHeight = height - 150;
        }

        return (
            <Modal animationType="fade" loadingModal={false} inStyle={[FliwerStyles.modalIn,this.style.modal]} visible={true} onClose={() => {
                    if (buttonType != 'accept')
                        onClose();
                }}>
                <View style={[FliwerStyles.modalView,this.style.modalView]}>
                        <ScrollView style={[this.style.scrollView,{height:height}]} contentContainerStyle={[this.style.scrollViewContainer]}>

                            <View style={this.style.conditionsView}>
                                <WebView
                                    url={this.state.acceptConditionsUrl}
                                    height={Platform.OS === 'web'? '100%' : webviewHeight}
                                    width={'100%'}
                                    style={this.style.webView}
                                />
                            </View>

                            <View style={[this.style.buttonView/*, Platform.OS === 'ios'? {height: 80} : {}*/]}>
                                <FliwerGreenButton
                                    text={buttonType == 'accept'?this.props.actions.translate.get('accept'):this.props.actions.translate.get('general_close')}
                                    style={[FliwerStyles.fliwerGreenButtonStyle, buttonType == 'accept'? {} : {backgroundColor: FliwerColors.primary.gray}]}
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {marginBottom: 0, width: 150}]}
                                    onPress={() => {
                                        onClose();
                                    }}/>
                            </View>

                        </ScrollView>
                </View>
            </Modal>
        );

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
  modal: {
    maxWidth: 600,
    flexGrow: 1
  },
  modalView: {
    paddingLeft: 20,
    paddingRight: 20,
    height:"100%",
    flexGrow: 1
  },
  scrollView:{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1
  },
  scrollViewContainer:{
    flexGrow: 1
  },
  conditionsView:{
    width: "100%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "silver",
    padding: 10
  },
  buttonView:{
    alignSelf: "center",
    marginTop: 15
  },
  webView:{
  }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FliwerConditionsModal));
