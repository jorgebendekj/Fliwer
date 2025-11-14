'use strict';

import React, { Component } from 'react';
var { View,Text, Image,TouchableOpacity,Platform} = require('react-native');

import FliwerCard from '../custom/FliwerCard.js'
import IrrigationList from './irrigationList.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

import { Redirect } from '../../utils/router/router'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import Icon from 'react-native-vector-icons/SimpleLineIcons';

import icon from '../../assets/img/controladoragua-ico.png'

class IrrigationListCard extends Component {

    constructor(props) {
        super(props);

    }

    render() {
      const { style,cardStyle,fullScreen,onFullScreen } = this.props
      return (
        <FliwerCard ref="card" touchable={false} style={[this.style.fliwerCardStyle,style]} cardStyle={cardStyle} cardInStyle={this.style.cardInStyle}>
          <View>
            {this.renderCardFront()}
            <TouchableOpacity style={this.style.resizeButton} onMouseEnter={this.hoverIn('resizeIcon')} onMouseLeave={this.hoverOut('resizeIcon')}  onPress={()=>{if(typeof onFullScreen==="function")onFullScreen(true)}}>
              <Icon name={fullScreen?"size-actual":"size-fullscreen"} style={[this.style.icon,this.style.resizeIcon]} ></Icon>
            </TouchableOpacity>
          </View>
        </FliwerCard>
      );
    }

    renderCardFront(){
      var card=[];
      const { fullScreen, idZone} = this.props

      card.push(
        <View style={this.style.cardFront}>
          <View style={[this.style.title,fullScreen?this.style.fullScreenTitle:{}]}>
            <Text style={this.style.titleText}>{this.props.actions.languageActions.get('irrigationListCard_title')}</Text>
            <Image style={[this.style.titleImage,fullScreen?this.style.fullScreenTitleImage:{}]} source={icon} resizeMode={"contain"} />
          </View>
          <View style={this.style.listContainer}>
            <IrrigationList
                idZone={idZone}
                setLoading={(loading) => {if(this.props.setLoading)this.props.setLoading(loading)} }
                initialLines={15} increaseLines={10} containerStyle={this.style.list}/>
          </View>
        </View>
      )

      return card;
    }

};

function mapStateToProps(state, props) {
    return {
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
        languageActions: bindActionCreators(ActionsLang, dispatch)
      }
    }
}

var style={

  resizeButton:{
    position:"absolute",
    top:0,
    left:0
  },
  modeButton:{
    position:"absolute",
    top:0,
    left:30
  },
  icon:{
    fontSize:20,
    textAlign:"center",
    zIndex:1,
    paddingLeft:10,
    paddingRight:10,
    paddingBottom:10,
    height:30,
    color:"rgb(150,150,150)",
    marginTop:5
  },
  gridIcon:{
    fontSize:25
  },
  cardFront:{
    width:"100%",
    height:"100%",
    display:"flex",
    flexDirection:"column"
  },
  cardBack:{
    width:"100%",
    height:"100%",
    display:"flex",
    flexDirection:"column"
  },
  title:{
    paddingTop:15,
    height:60,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    width:"100%"
  },
  titleText:{
    fontFamily:FliwerColors.fonts.light,
    fontSize:14,
    textTransform: "uppercase"
  },
  titleImage:{
    height:53,
    width:60,
    right:1,
    top:2,
    position:"absolute"
  },
  listContainer:{
    flexGrow:1,
    width:"100%",
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10
  },
  list:{
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10
  },
  fullScreenTitle:{

  },
  fullScreenTitleImage:{

  },
  "@media (orientation:landscape)":{
    cardInStyle:{
      maxWidth:"100%",
      height:"100%"
    },
    fliwerCardStyle:{
      paddingBottom: 16
    },
    "@media (height<=500)":{
      fullScreenTitle:{
        height:38,
        paddingTop:0
      },
      fullScreenTitleImage:{
        width:55,
        height:35
      }
    }
  },
  "@media (orientation:portrait)":{
    cardInStyle:{
      height:"100%",
      width: "100%"
    }
  },
  ":hover":{
    resizeIcon:{
      filter:"brightness(130%)"
    },
    modeIcon:{
      filter:"brightness(130%)"
    }
  }
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style,IrrigationListCard));
