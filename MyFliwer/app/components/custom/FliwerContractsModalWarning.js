'use strict';

import React, { Component } from 'react';
import {View, Text} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; // Import your actions
import * as ActionAcademy from '../../actions/academyActions.js'; //Import your actions
import * as ActionInvoice from '../../actions/invoiceActions.js'; //Import your actions

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'
import Modal from '../../widgets/modal/modal'

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'

class FliwerContractsModalWarning extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goFiles: false
        };
    }

    render() {
        var {animationType, enabled} = this.props;

        var visible = enabled && !this.props.isNotSignedContractChecked && this.props.generalAlerts.notSignedContracts>0/*(this.props.notSignedContractsData.length > 0 || this.props.notSignedAngelContractsData.length > 0)*/;

        if (this.state.goFiles)
            return (<Redirect push to={"/files/"} />);
        else
            return (
                    <Modal animationType={animationType ? animationType : "fade"} loadingModal={this.props.loadingModal} inStyle={this.style.modalIn} visible={visible}
                        onClose={() => {
                            this.props.actions.invoiceActions.setNotSignedContractsChecked(true);
                        }}>
                        <View style={this.style.modalView}>
                            <Text style={this.style.modalViewTitle}>{this.props.actions.translate.get('Contracts_you_have_contracts_to_sign')}</Text>
                            <Text style={this.style.modalViewSubtitle}>{this.props.actions.translate.get('Contracts_do_you_want_see_pending_contracts')}</Text>
                            <View style={this.style.modalButtonContainer}>
                                <FliwerCalmButton
                                    buttonStyle={[this.style.modalButton, this.style.modalButton1]}
                                    onMouseEnter={this.hoverIn('modalButton1')} onMouseLeave={this.hoverOut('modalButton1')}
                                    onPress={() => {
                                        this.props.actions.invoiceActions.setNotSignedContractsChecked(true);
                                    }}
                                    text={this.props.actions.translate.get('general_no')}
                                    textStyle={[this.style.modalButtonText, this.style.modalButtonTextNo]}
                                    skipView={true}
                                />
                                <FliwerCalmButton
                                    buttonStyle={[this.style.modalButton, this.style.modalButton2]}
                                    onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')}
                                    onPress={async () => {
                                        this.props.actions.academyActions.setCurrentIndexAcademyCategory(0).then(() => {
                                            this.props.actions.invoiceActions.setNotSignedContractsChecked(true);
                                            this.setState({goFiles: true});
                                        });
                                    }}
                                    text={this.props.actions.translate.get('general_yes')}
                                    textStyle={[this.style.modalButtonText, this.style.modalButtonTextYes]}
                                    skipView={true}
                                />
                            </View>
                        </View>
                    </Modal>
                );
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        isNotSignedContractChecked: state.invoiceReducer.isNotSignedContractChecked,
        notSignedContractsData: state.invoiceReducer.notSignedContractsData,
        notSignedAngelContractsData: state.invoiceReducer.notSignedAngelContractsData,
        generalAlerts: state.sessionReducer.generalAlerts

    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            invoiceActions: bindActionCreators(ActionInvoice, dispatch)
        }
    }
}

var style = {
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 700
    },
    modalView: {
        paddingTop: 20
    },
    modalViewTitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    modalButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)"
    },
    modalButton1: {
        borderBottomLeftRadius: 20
    },
    modalButton2: {
        borderRightWidth: 0,
        borderBottomRightRadius: 20
    },
    modalButtonText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonTextNo: {
        color: "blue"
    },
    modalButtonTextYes: {
        color: "red"
    },
    modalpasswordContainer: {
        display: "flex",
        flexDirection: "row",
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 20,
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap"
    },
    modalpasswordText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        paddingRight: 10
    },
    modalpasswordInput: {
        marginBottom: 0
    },
    ":hover": {
        modalButton1: {
            backgroundColor: "rgba(175,215,255,0.3)"
        },
        modalButton2: {
            backgroundColor: "rgba(255,175,175,0.3)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerContractsModalWarning));
