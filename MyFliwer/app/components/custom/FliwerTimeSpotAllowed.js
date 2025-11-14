'use strict';

import React, { Component } from 'react';
var {View,  ScrollView,  Text,  TouchableOpacity,  Image,  Platform, StyleSheet, RefreshControl} = require('react-native');

import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions




class FliwerTimeSpotAllowed extends Component {
    constructor(props) {
        super(props);
        //console.log(this.props.modifyZone);
        this.state={
          hoveri:null,
          idZone:this.props.idZone?this.props.idZone:null,
          hoursAllowedGMT:[],
          hoursAllowed:this.props.idZone?(this.props.modifyZone.hoursAllowed?(this.props.modifyZone.hoursAllowed.length>0?this.props.modifyZone.hoursAllowed:this.props.zoneData[this.props.idZone].hoursAllowed.concat([])):this.props.zoneData[this.props.idZone].hoursAllowed.concat([])):[],

        }

        if(this.props.hoursAllowed) this.state.hoursAllowed = this.state.hoursAllowed.concat(this.props.hoursAllowed)

    }

    addTimeAllowed(i){

      //var hoursAllowed = this.props.zoneData[this.props.idZone].hoursAllowed.concat([])
      //this.setState({hoveri:i})

      var indexGMT = this.state.hoursAllowedGMT.findIndex((s)=>{return s==i});
      if(indexGMT != -1)
      {
          this.state.hoursAllowedGMT.splice(indexGMT,1);
      }
      else
      {
            this.state.hoursAllowedGMT.push(i);
      }

      //hoursAllowedGMT cap a hoursAllowed, restant/suman les dues hores, es adir, convertir de local a UTC.
      var d=[];
      for(var h in this.state.hoursAllowedGMT)
      {
        var dateToLocal=  moment(this.state.hoursAllowedGMT[h],"H")/1000 + (new Date().getTimezoneOffset()/60*3600);
        d[h]= parseInt(moment(dateToLocal*1000).format("H"));

        //this.setState({hoursAllowedGMT[h]: parseInt(moment(dateToUTC*1000).format("H"))})
      }
      //this.state.hoursAllowed=[];
      //this.state.hoursAllowed= d.concat([]);

      this.setState({hoursAllowed:[].concat(d)})
      this.props.addTime(d);
      //this.setState({hoursAllowed:[].concat(d)})////////cridar funcio del pare


      //console.log("la taula de hores permeses local queda aixi: "+ this.state.hoursAllowedGMT);
      //console.log("la taula de hores permeses UTC queda aixi: "+ this.state.hoursAllowed);

      //this.hoverOut('timeSpotHover')()
    }

    render() {

      var indents=[]

      indents.push(
        <View style={this.style.timeSpotContainer}>
           {this.renderTimeSpotSize()}
        </View>
      )

      return indents;
    }

    renderTimeSpotSize()
    {
      if(this.state.mediaStyle.width<=450) {
        return(
          <View style={this.style.timeSpotContainerOut}>
            <View style={this.style.timeSpotContainerIn}>
              {this.renderTimeSpot(0,5)}
            </View>
            <View style={this.style.timeSpotContainerIn}>
              {this.renderTimeSpot(6,11)}
            </View>
            <View style={this.style.timeSpotContainerIn}>
              {this.renderTimeSpot(12,17)}
            </View>
            <View style={this.style.timeSpotContainerIn}>
              {this.renderTimeSpot(18,23)}
            </View>
          </View>
        )
      }
      else
      {
        return(
          <View style={this.style.timeSpotContainerOut}>
            <View style={this.style.timeSpotContainerIn}>
              {this.renderTimeSpot(0,11)}
            </View>
            <View style={this.style.timeSpotContainerIn}>
              {this.renderTimeSpot(12,23)}
            </View>
          </View>
       )
      }

    }

    renderTimeSpot(start,end)
    {
      var indents=[]

      for(var h in this.state.hoursAllowed)
      {
        var dateToUTC=  moment(this.state.hoursAllowed[h],"H")/1000 - (new Date().getTimezoneOffset()/60*3600);
        this.state.hoursAllowedGMT[h]= parseInt(moment(dateToUTC*1000).format("H"));
      }

      for(var i = start;i<=end;i++)
      {
        indents.push(
          <TouchableOpacity disabled={this.props.disabled} style={[this.style.timeSpotTouchable,(this.state.hoveri==i?this.style.timeSpotHover:{}),(this.state.hoursAllowedGMT.filter((s)=>{return s==i }).length>=1)?this.style.timeSpotSelected:{}]} activeOpacity={1} onMouseEnter={this.timeSpotHoverEnter(i)} onMouseLeave={this.hoverOut('timeSpotHover')} onPress={this.handleTimeSpot(i)}>
            <View style={[this.props.disabled?this.style.disabledSlayer:this.style.timeSpotCircle]}>
              <Text style={[this.style.timeSpotCircleText,!this.props.disabled?((this.state.hoursAllowedGMT.filter((s)=>{return s==i }).length>=1)?this.style.timeSpotSelectedText:{}):{}]}>{this.state.mediaStyle.width<=400?i+"h":i+"h"}</Text>
            </View>
         </TouchableOpacity>
        )
      }

      return indents;
    }

    timeSpotHoverEnter(i) {
      return ()=> {
        if(!this.props.disabled){
          this.setState({hoveri:i})
          this.hoverIn('timeSpotHover')()
        }
      };
    }

    handleTimeSpot(i) {
      return ()=> {
        this.hoverIn('timeSpotHover')()
        this.addTimeAllowed(i);
        this.setState({hoveri:i})
      };
    }




  };


  // The function takes data from the app current state,
  // and insert/links it into the props of our component.
  // This function makes Redux know that this component needs to be passed a piece of the state
  function mapStateToProps(state, props) {
      return {
        zoneData: state.fliwerZoneReducer.data,
        modifyZone: state.modifyZoneReducer,

      }
  }

  // Doing this merges our actions into the component’s props,
  // while wrapping them in dispatch() so that they immediately dispatch an Action.
  // Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
  function mapDispatchToProps(dispatch) {
      return {
        actions: {
          translate: bindActionCreators(ActionsLang, dispatch),

        }
      }
  }


  var style={
    disabledSlayer:{
      backgroundColor:"#e3e3e3",
      //width:"100%",
      //height:"100%",
      //borderWidth:1,
      borderRadius:50,
      height: 28,
      width: 28,
      alignItems: "center",
      justifyContent: "center",
      //marginRight:2,
      //marginLeft:2,
      position:"absolute"
      //padding:14,


    },
    timeSpotContainer:
    {
      marginBottom:2,
      width:"100%",
    },
    timeSpotTitle:
    {
      marginBottom:9,
    },
    timeSpotTitleText:
    {
      fontFamily:"AvenirNext-Regular",
      fontSize:20,
    },
    timeSpotContainerOut:
    {
      width:"100%",
    },
    timeSpotContainerIn:
    {
      flexDirection:"row",
      justifyContent:"center",
      marginBottom:10,
    },
    timeSpotTouchable:
    {
      borderWidth:1,
      borderRadius:50,
      height: 27,
      width: 27,
      alignItems: "center",
      justifyContent: "center",
      marginRight:2,
      marginLeft:2,
      padding:14,
    },

    timeSpotSelected:{
      backgroundColor:FliwerColors.primary.green,
    },
    timeSpotCircle:
    {
      height: 27,
      width: 27,
      justifyContent:"center",
      alignItems:"center",
    },
    timeSpotCircleText:
    {
      fontSize:15,
    },
    timeSpotSelectedText:{
      color:"white",
    },
    "@media (width<=450)":{//optimize space
      timeSpotContainerIn:{
        marginBottom:5,
      },
      timeSpotTouchable:{
        marginRight:10,
      },
      timeSpotTouchable:{
        marginRight:10,
      },
      timeSpotCircleText:
      {
        fontSize:13,
      },
    },
    ":hover":{
      timeSpotHover:{
        filter:"contrast(0.2)",
      },
    },


  };

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style,FliwerTimeSpotAllowed));
