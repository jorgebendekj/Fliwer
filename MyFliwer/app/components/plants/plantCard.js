'use strict';

import React, { Component } from 'react';
var {View, Text, Image, TouchableOpacity, Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import {FliwerColors} from '../../utils/FliwerColors'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/EvilIcons';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { Redirect } from '../../utils/router/router'
import trashImage  from '../../assets/img/trash.png'

import phaseGermination  from '../../assets/img/growPhase1.png'
import phaseGrowing  from '../../assets/img/growPhase2.png'
import phaseFlowering  from '../../assets/img/growPhase3.png'
import phaseFructification  from '../../assets/img/growPhase4.png'
import defaultIcon  from '../../assets/img/fliwer_icon1.png'
import {toast} from '../../widgets/toast/toast'

class PlantCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            idPlant: null,
            phase: this.props.phase
        };
    }
    
    render() {

        if (this.state.idPlant) {
            return (<Redirect push to={"/zone/" + this.props.idZone + "/plant/" + this.state.idPlant + "/info"} />)
        } else {
            return (
                    <FliwerCard ref="card" touchableFront={this.props.touchableFront} touchableBack={true}
                            cardStyle={!this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)}} >
                        <View>
                            {this.renderCardFront()}
                        </View>
                        <View>
                            {this.renderCardBack()}
                        </View>
                    </FliwerCard>
                    );
        }
    }

    modifyPhase(new_phase) {
        if (this.props.isVisitor)
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
        else {
            if (this.state.phase != new_phase) {
                var old_phase = this.state.phase;
                this.setState({phase: new_phase})
                this.props.actions.fliwerZoneActions.modifyZonePlant(this.props.idZone, this.props.idPlant, new_phase).then(() => {
                }, (err) => {
                    this.setState({phase: old_phase})
                    if (err.reason)
                        toast.error(err.reason);
                })
            }
        }

    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    toggle(value) {
        var that = this;
        return function () {
            that.refs.card._toggleCard(value)
        }
    }

    renderCardFront() {
        if (typeof this.props.onPressAdd === 'function')
            return (
                <View style={this.style.cardView}>
                    <TouchableOpacity style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}} 
                        onPress={()=>this.props.onPressAdd()}
                        >
                        <Text key={987} style={{fontSize: 100, marginTop: -5, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                    </TouchableOpacity>                
                </View>
            );
    
        var card = [];

        if (this.props.title)
            card.push(<Text key={1} style={this.style.title}>{this.props.title}</Text>)
        card.push(
                <View style={this.style.imageContainer}>
                    <Image key={3} style={this.style.image} draggable={false} source={this.props.image ? {uri: this.props.image} : defaultIcon} resizeMode={(this.props.image ? "cover" : "contain")}/>
                    <View style={this.style.moreInfoTextContainer}>
                        <TouchableOpacity style={this.style.moreInfoContainerIn} onPress={() => {
                        this.setState({idPlant: this.props.idPlant})
                    }}>
                            <Text style={this.style.moreInfoText}>{this.props.actions.translate.get('more_info')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                )
        if (this.props.subtitle)
            card.push(<Text key={4} style={this.style.subtitle}>{this.props.subtitle}</Text>)
        return (
                <View style={this.style.cardView}>
                    {card}
                </View>
                );
    }

    //md-settings

    renderCardBack() {
        if (typeof this.props.onPressAdd === 'function')
            return null;

        return (
                <View style={this.style.backCard}>
                    <Text style={this.style.miniTitle}>{this.props.title}</Text>
                    <Text style={this.style.title}>{this.props.actions.translate.get('plantCard_back_title')}</Text>
                    <View style={this.style.ViewAllPhases}>
                        <TouchableOpacity style={this.style.ViewPhase} onMouseEnter={this.hoverIn('modelImageGermination')} onMouseLeave={this.hoverOut('modelImageGermination')} onPress={() => {
                        this.modifyPhase(0)
                    }}>
                            <View style={[this.style.ViewPhaseImageOut, (this.state.phase == 0 ? this.style.ViewPhaseImageOutSelected : {}), this.style.modelImageGermination]}>
                                <Image style={[this.style.ViewPhaseImage, this.style.modelImageGermination]} draggable={false} source={phaseGermination}  resizeMode={"cover"}/>
                            </View>
                            <Text style={this.style.ViewPhaseText}>{this.props.actions.translate.get('plantCard_back_germination')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={this.style.ViewPhase} onMouseEnter={this.hoverIn('modelImageGrowing')} onMouseLeave={this.hoverOut('modelImageGrowing')} onPress={() => {
                        this.modifyPhase(1)
                    }}>
                            <View style={[this.style.ViewPhaseImageOut, (this.state.phase == 1 ? this.style.ViewPhaseImageOutSelected : {}), this.style.modelImageGrowing]}>
                                <Image style={[this.style.ViewPhaseImage, this.style.modelImageGrowing]} draggable={false} source={phaseGrowing}  resizeMode={"cover"}/>
                            </View>
                            <Text style={this.style.ViewPhaseText}>{this.props.actions.translate.get('plantCard_back_growing')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={this.style.ViewPhase} onMouseEnter={this.hoverIn('modelImageFlowering')} onMouseLeave={this.hoverOut('modelImageFlowering')} onPress={() => {
                        this.modifyPhase(2)
                    }}>
                            <View style={[this.style.ViewPhaseImageOut, (this.state.phase == 2 ? this.style.ViewPhaseImageOutSelected : {}), this.style.modelImageFlowering]}>
                                <Image style={[this.style.ViewPhaseImage, this.style.modelImageFlowering]} draggable={false} source={phaseFlowering}  resizeMode={"cover"}/>
                            </View>
                            <Text style={this.style.ViewPhaseText}>{this.props.actions.translate.get('plantCard_back_flowering')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={this.style.ViewPhase} onMouseEnter={this.hoverIn('modelImageFructification')} onMouseLeave={this.hoverOut('modelImageFructification')} onPress={() => {
                        this.modifyPhase(3)
                    }}>
                            <View style={[this.style.ViewPhaseImageOut, (this.state.phase == 3 ? this.style.ViewPhaseImageOutSelected : {}), this.style.modelImageFructification]}>
                                <Image style={[this.style.ViewPhaseImage, this.style.modelImageFructification]} draggable={false} source={phaseFructification}  resizeMode={"cover"}/>
                            </View>
                            <Text style={this.style.ViewPhaseText}>{this.props.actions.translate.get('plantCard_back_fructification')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={this.style.trashContainer}>
                        {this.drawTrashButton()}
                    </View>
                
                </View>
                );
    }

    drawTrashButton() {
        return (
                <TouchableOpacity style={this.style.deleteButton} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
                        if (this.props.isVisitor)
                            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
                        else if (this.props.modalFunc)
                            this.props.modalFunc(true, this.props.idPlant)
                    }
                                  }>
                    <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                </TouchableOpacity>)
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        isVisitor: state.sessionReducer.visitorCheckidUser,
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
        }
    };
}

var style = {
    /*
     configOut:{
     position: "absolute",
     right: 10,
     top: 5,
     zIndex:1
     },
     config:{
     fontSize: 35,
     color: "#cecece"
     },*/

    trashContainer: {
        width: "100%",
        //height:30,
        paddingBottom: 16,
        alignItems: "flex-end",
        paddingRight: 26,
    },
    cardView: {
        height: 282,
        width: "100%",
        alignItems: "center"
    },
    backCard: {
        height: 282,
        width: "100%"
    },
    backCardMenu: {
        height: "auto",
        position: "absolute",
        width: "100%",
        bottom: 50,
        top: 0
    },
    imageContainer: {
        width: "88%",
        height: 200,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    moreInfoTextContainer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    moreInfoText: {
        fontSize: 50,
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        color: "rgba(255,255,255,0.8)",
    },
    moreInfoContainerIn: {
        width: 180,

    },
    title: {
        width: "100%",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 10,
        fontSize: 18
    },
    miniTitle: {
        width: "100%",
        textAlign: "center",
        marginTop: 10,
        fontSize: 14,
        marginBottom: 5
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        marginTop: 1,
        marginBottom: 5,
        fontSize: 14
    },
    text: {
        width: '100%',
        textAlign: 'center'
    },
    ViewAllPhases: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        width: "90%",
        flexGrow: 1,
        flexWrap: "wrap",
        marginTop: 0,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 45,
        alignItems: "center",
    },
    ViewPhase: {
        width: "25%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    ViewPhaseImageOut: {
        width: 50,
        height: 50,
        borderRadius: 25,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#d9dad7",
        marginBottom: 3
    },
    ViewPhaseImageOutSelected: {
        backgroundColor: "#a6cf07",
    },
    ViewPhaseImage: {
        width: 40,
        height: 40,
        borderRadius: 5
    },
    ViewPhaseText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 10,
        textAlign: "center",
        marginBottom: 10
    },
    deleteButton: {
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        width: 30,
        height: 30,
    },
    trashIcon: {
        width: 25,
        height: 25,
        justifyContent: "flex-end",
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 20
    },
    "@media (orientation:portrait)": {

    },
    ":hover": {
        modelImageGermination: {
            filter: "brightness(105%)"
        },
        modelImageFructification: {
            filter: "brightness(105%)"
        },
        modelImageGrowing: {
            filter: "brightness(105%)"
        },
        modelImageFlowering: {
            filter: "brightness(105%)"
        },
        trashIcon: {
            filter: "brightness(130%)"
        }
    },
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, PlantCard));
