'use strict';

import React, { Component } from 'react';
var {View,  Text,  TouchableOpacity,  Image,  Platform} = require('react-native');

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsPlant from '../../actions/fliwerPlantActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import Modal from '../../widgets/modal/modal'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect } from '../../utils/router/router'
import {FliwerColors} from '../../utils/FliwerColors'

import phaseGermination from '../../assets/img/growPhase1.png'
import phaseGrowing from '../../assets/img/growPhase2.png'
import phaseFlowering from '../../assets/img/growPhase3.png'
import phaseFructification from '../../assets/img/growPhase4.png'

class PlantPhaseModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
      var {callback,visible} =this.props;
      return (
        <Modal animationType="fade" inStyle={this.style.modalIn} visible={visible} onClose={() => {if(typeof callback==='function')callback() }}>
          <View style={this.style.modalView}>
            <Text style={this.style.modalViewTitle}>{this.props.actions.translate.get('plantCard_back_title')}</Text>
            <View style={this.style.modalViewAllPhases}>
              <TouchableOpacity style={this.style.modalViewPhase} onMouseEnter={this.hoverIn('modelImageGermination')} onMouseLeave={this.hoverOut('modelImageGermination')} onPress={()=>{if(typeof callback==='function')callback(0)}}>
                <View style={[this.style.modalViewPhaseImageOut,this.style.modelImageGermination]}>
                  <Image style={[this.style.modalViewPhaseImage,this.style.modelImageGermination]} draggable={false} source={phaseGermination}  resizeMode={"cover"}/>
                </View>
                <Text style={this.style.modalViewPhaseText}>{this.props.actions.translate.get('plantCard_back_germination')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.style.modalViewPhase} onMouseEnter={this.hoverIn('modelImageGrowing')} onMouseLeave={this.hoverOut('modelImageGrowing')} onPress={()=>{if(typeof callback==='function')callback(1)}}>
                <View style={[this.style.modalViewPhaseImageOut,this.style.modelImageGrowing]}>
                  <Image style={[this.style.modalViewPhaseImage,this.style.modelImageGrowing]} draggable={false} source={phaseGrowing}  resizeMode={"cover"}/>
                </View>
                <Text style={this.style.modalViewPhaseText}>{this.props.actions.translate.get('plantCard_back_growing')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.style.modalViewPhase} onMouseEnter={this.hoverIn('modelImageFlowering')} onMouseLeave={this.hoverOut('modelImageFlowering')} onPress={()=>{if(typeof callback==='function')callback(2)}}>
                <View style={[this.style.modalViewPhaseImageOut,this.style.modelImageFlowering]}>
                  <Image style={[this.style.modalViewPhaseImage,this.style.modelImageFlowering]} draggable={false} source={phaseFlowering}  resizeMode={"cover"}/>
                </View>
                <Text style={this.style.modalViewPhaseText}>{this.props.actions.translate.get('plantCard_back_flowering')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={this.style.modalViewPhase} onMouseEnter={this.hoverIn('modelImageFructification')} onMouseLeave={this.hoverOut('modelImageFructification')} onPress={()=>{if(typeof callback==='function')callback(3)}}>
                <View style={[this.style.modalViewPhaseImageOut,this.style.modelImageFructification]}>
                  <Image style={[this.style.modalViewPhaseImage,this.style.modelImageFructification]} draggable={false} source={phaseFructification}  resizeMode={"cover"}/>
                </View>
                <Text style={this.style.modalViewPhaseText}>{this.props.actions.translate.get('plantCard_back_fructification')}</Text>
              </TouchableOpacity>
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
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
        translate: bindActionCreators(ActionsLang, dispatch)
      }
    }
}

//Connect everything

var styles ={

  modalIn:{
    backgroundColor:"rgba(255,255,255,0.9)",
    borderRadius:10
  },
  modalView:{
    paddingLeft:10,
    paddingRight:10,
    paddingTop:20,
    paddingBottom:20
  },
  modalViewTitle:{
    width: 460,
    marginLeft:10,
    fontFamily:"AvenirNext-Regular",
    fontSize:20,
    textAlign:"center"
  },
  modalViewAllPhases:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    width: 460,
    marginTop:30,
    marginLeft:10,
    marginRight:10,
    marginBottom:10
  },
  modalViewPhase:{
    width:115,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems:"center",
  },
  modalViewPhaseImageOut:{
    width:90,
    height:90,
    borderRadius:45,
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor:FliwerColors.secondary.gray,
    marginBottom:10
  },
  modalViewPhaseImage:{
    width:"90%",
    height:"90%",
    borderRadius:45
  },
  modalViewPhaseText:{
    fontFamily:"AvenirNext-Regular",
    fontSize:14,
    textAlign:"center"
  },
  "@media (width<=750)":{//modal
      modalViewTitle:{
        width: 340
      },
      modalViewAllPhases:{
        width:340
      },
      modalViewPhase:{
        width:85,
      },
      modalViewPhaseImageOut:{
        width:70,
        height:70,
      },
      modalViewPhaseText:{
        fontSize:12
      }
  },
  "@media (width<=500)":{//modal
      modalViewTitle:{
        width: 280
      },
      modalViewAllPhases:{
        width:280
      },
      modalViewPhase:{
        width:70,
      },
      modalViewPhaseImageOut:{
        width:65,
        height:65
      },
      modalViewPhaseText:{
        fontSize:10
      }
  },
  "@media (width<=300)":{//modal
      modalViewTitle:{
        width: 160
      },
      modalViewAllPhases:{
        width:160
      },
      modalViewPhase:{
        width:40,
      },
      modalViewPhaseImageOut:{
        width:30,
        height:30
      },
      modalViewPhaseText:{
        fontSize:8
      }
  },
  ":hover":{
    modelImageGermination:{
      //filter:"brightness(105%)"
      backgroundColor:FliwerColors.primary.green,
    },
    modelImageFructification:{
      //filter:"brightness(105%)"
      backgroundColor:FliwerColors.primary.green,
    },
    modelImageGrowing:{
      //filter:"brightness(105%)"
      backgroundColor:FliwerColors.primary.green,
    },
    modelImageFlowering:{
      //filter:"brightness(105%)"
      backgroundColor:FliwerColors.primary.green,
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles,PlantPhaseModal));
