'use strict';

import React, { Component } from 'react';
import {View, Text, TextInput, Image, ScrollView} from 'react-native';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerCalmButton from '../custom/FliwerCalmButton.js'
import FliwerConditionsModal from '../custom/FliwerConditionsModal.js'

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'

import Modal from '../../widgets/modal/modal'

class LoginBottomBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            legalModalVisible: false,
            legalConditionsModalVisible: false,
            legalConditionsType: ''
        };
    }

    render() {

        return(
            <View style={this.style.barContainer}>
                <View style={this.style.leftContainer}>
                    {this.renderLeftArrow()}
                </View>
                <View style={this.style.centerContainer}>
                    {this.renderCenterButton()}
                </View>
                <View style={this.style.rightContainer}>
                    {this.renderRightArrow()}
                </View>
                {this.renderLegalModal()}
            </View>
        );
    }

    renderLeftArrow() {
        var indents = []

        if (this.props.arrowLeft)
            indents.push(
                <FliwerCalmButton 
                    buttonStyle={{}} 
                    onPress={async () => {
                        if (typeof this.props.arrowLeft === 'function')
                            await this.props.arrowLeft();
                    }} 
                    iconData={{
                        name: "chevron-left",
                        style: this.style.eyeIcon
                    }} 
                    skipView={true}
                />
            );

        return indents;
    }

    renderCenterButton() {
        var indents = [];

        var defaultCenterText = this.props.defaultCenterText? this.props.defaultCenterText : this.props.actions.translate.get('legalVC_legal_conditions');
        
        indents.push(
                <FliwerCalmButton 
                    buttonStyle={this.style.legal} 
                    onPress={() => {
                        global.frontLayer.display(true);
                        this.setState({legalModalVisible: true});
                    }}
                    text={"- " + defaultCenterText + " -"}
                    textStyle={{fontStyle: "italic", color: "gray", textAlign: "center"}}
                    skipView={true}
                />
                );

        return indents;
    }

    renderRightArrow() {
        var indents = []

        if (this.props.hasNext)
            indents.push(
                <FliwerCalmButton 
                    buttonStyle={{}} 
                    onPress={async () => {
                        if (typeof this.props.arrowRight === 'function')
                            await this.props.arrowRight();
                    }} 
                    iconData={{
                        name: "chevron-right",
                        style: this.style.eyeIcon
                    }} 
                    skipView={true}
                />
            );

        return indents;
    }
    
    renderLegalModal() {
        
        if (this.state.legalModalVisible) {
            global.frontLayer.renderLayer(() => {
                return (      
                    <Modal animationType="fade" loadingModal={false} inStyle={[FliwerStyles.modalIn, {maxWidth: 300}]} visible={true} onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({legalModalVisible: false});
                        }}>
                        <View style={FliwerStyles.modalView}>
                            <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}>
                                <View style={{width: "100%"}}>

                                    <View style={{ alignItems: "center", width: "100%"}}>
                                    
                                        <FliwerCalmButton 
                                            buttonStyle={[this.style.legalTouch, this.style.legalAdvise]} 
                                            onPress={() => {
                                                this.setState({legalModalVisible: false, legalConditionsModalVisible: true, legalConditionsType: 'legal-advise'});
                                            }}
                                            text={this.props.actions.translate.get('legalVC_legal_advise')}
                                            textStyle={this.style.legalTouchText}
                                            skipView={true}
                                        />
                                    
                                        <FliwerCalmButton 
                                            buttonStyle={[this.style.legalTouch, this.style.pricacyPolicy]} 
                                            onPress={() => {
                                                this.setState({legalModalVisible: false, legalConditionsModalVisible: true, legalConditionsType: 'pricacy-policy'});
                                            }}
                                            text={this.props.actions.translate.get('legalVC_privacy_policy')}
                                            textStyle={this.style.legalTouchText}
                                            skipView={true}
                                        />
                                    
                                        <FliwerCalmButton 
                                            buttonStyle={[this.style.legalTouch, this.style.termsOfUse]} 
                                            onPress={() => {
                                                this.setState({legalModalVisible: false, legalConditionsModalVisible: true, legalConditionsType: 'terms-of-use'});
                                            }}
                                            text={this.props.actions.translate.get('legalVC_terms_of_use')}
                                            textStyle={this.style.legalTouchText}
                                            skipView={true}
                                        />
                                    
                                        <FliwerCalmButton 
                                            buttonStyle={[this.style.legalTouch, this.style.cookiesPolicy]} 
                                            onPress={() => {
                                                this.setState({legalModalVisible: false, legalConditionsModalVisible: true, legalConditionsType: 'cookies-policy'});
                                            }}
                                            text={this.props.actions.translate.get('legalVC_cookies_policy')}
                                            textStyle={this.style.legalTouchText}
                                            skipView={true}
                                        />
                                        
                                    </View>  

                                    {false?<View style={{alignSelf: "center", marginTop: 20}}>
                                        <FliwerGreenButton 
                                            text={this.props.actions.translate.get('general_close')} 
                                            style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: FliwerColors.primary.gray}]} 
                                            containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {marginBottom: 10, width: 150}]}
                                            onPress={() => {
                                                global.frontLayer.display(false);
                                                this.setState({legalModalVisible: false});
                                            }}/>                       
                                    </View>:null}                          

                                </View>                  
                            </ScrollView>
                        </View>
                    </Modal>
                );             
            });
        } else if (this.state.legalConditionsModalVisible) {
            global.frontLayer.renderLayer(() => {
                return (
                    <FliwerConditionsModal onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({legalConditionsModalVisible: false});                            
                        }}
                        type={this.state.legalConditionsType}
                    />
                );             
            });
            
        } else
            return [];

    }

};


function mapStateToProps(state, props) {
    return {

    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {

    eyeIcon: {
        fontSize: 35,
        textAlign: "center",
        color: "back"
    },
    barContainer: {
        position: "absolute",
        bottom: 0,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1,
        width: "100%",
        backgroundColor: "rgb(240,240,240)",
        justifyContent: "center",
        //paddingTop: 10,
    },
    leftContainer: {
        width: "30.33%",
        justifyContent: "center",
        alignItems: "flex-start"

    },
    centerContainer: {
        width: "30.33%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"

    },
    rightContainer: {
        width: "30.33%",
        justifyContent: "center",
        alignItems: "flex-end"

    },
    legal: {
        height: 35,
        justifyContent: "center",
        width: 200,
        paddingLeft: 10, paddingRight: 10
    },
    legalTouch: {
        padding: 20
    },
    legalTouchText: {
        fontSize: 16, fontWeight: "bold", color: "gray"
    },
    legalAdvise: {
        
    },
    pricacyPolicy: {
        
    },
    termsOfUse: {
        
    },
    cookiesPolicy: {
        
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, LoginBottomBar));
