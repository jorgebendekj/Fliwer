'use strict';

import React, { Component } from 'react';
var {View,  ScrollView,  Text,  TouchableOpacity,  Image,  Platform, StyleSheet, RefreshControl} = require('react-native');

import {FliwerAlertMedia} from '../../utils/FliwerAlertMedia'
import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerButtonDateTimePicker from '../../components/custom/FliwerButtonDateTimePicker.js'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import Modal from '../../widgets/modal/modal'
import moment from 'moment';



class FliwerHistoryFilter extends Component {
  constructor(props) {
      super(props);
      this.state = {
          filterDisabled:[].concat(this.props.filterList),
          date: moment().toDate(),
      };
      //this.state.filterDisabled=this.state.filterDisabled.concat(this.props.filterList);

   };

  changeFilterValuePress(i)
  {
    return ()=>{
      var findIndex=this.state.filterDisabled.findIndex((element)=>{return element == i})
      if(findIndex != -1)
      {
        this.state.filterDisabled.splice(findIndex,1);
        this.setState({filterDisabled:this.state.filterDisabled.concat([])});
      }
      else {
        this.setState({filterDisabled:this.state.filterDisabled.concat(i)});
      }
    }
   }

   updateFilter()
   {
     this.props.onUpdate(this.state.filterDisabled);
     this.props.modalClosed();
   }
   onChangeDate(d)
   {
     //debugger;
     this.setState({date:moment(d*1000).toDate()});

   }


   render(){
     var {modalStyle}=this.props;
     if(this.props.visible)
       return (
         <Modal animationType="fade" inStyle={this.style.modalIn} visible={this.props.visible} onClose={() => {this.props.modalClosed();}}>
           <View style={[this.style.modalView,modalStyle]}>
             <View style={this.style.optionsContainer}>
              {this.renderGoTo()}
              <View style={this.style.line1}></View>
              {this.renderFilter()}
              {this.renderApplyButton()}
             </View>
           </View>
         </Modal>
       )
      else return []
   }

   renderGoTo()
   {
     //console.log("ask: "+moment(this.props.minData*1000).toDate());
     return(
       <View style={this.style.goToContainer}>
         <View style={this.style.goTo}><Text style={this.style.goToTitle}>Go to </Text></View>
         <FliwerButtonDateTimePicker mode={"date"} showYearDropdown={true} showMonthDropdown={true} date={this.state.date} maxDate={moment().toDate()} minDate={moment(this.props.minData*1000).toDate()} format={"DD-MM-YYYY"} onChange={(v)=>(this.onChangeDate(v))}/>
       </View>
     )
   }


   renderFilter()
   {

       var indents=[];

       /*
       indents.push(
         <View style={[this.style.filterTopTitleContainer,{opacity:0}]}>
           <Text style={this.style.filterTopTitle}>Filter</Text>
         </View>
       )
       */
       for(var i in this.props.filterAllList)
       {
         var media=FliwerAlertMedia.subCategoryToMedia(this.props.filterAllList[i]);

         var find=this.state.filterDisabled.find((element)=>{return element == this.props.filterAllList[i]});

         indents.push (
           <TouchableOpacity style={[this.style.filterCointainer,find?{backgroundColor:media.color}:{backgroundColor:"#c3c3c3"}]} onPress={this.changeFilterValuePress(this.props.filterAllList[i])}>
             <View style={this.style.filterImageContainer}>
               <Image style={[this.style.imageFilter]} draggable={false} source={media.img} resizeMode={"contain"} />
             </View>
             <View style={this.style.filterTitleContainer}>
               <Text style={[this.style.filterTitle,(find && !media.automatic)?{color:"white"}:{color:"black"}]}>{media.title}</Text>
             </View>
           </TouchableOpacity>
         )
       }

       return(
         <View style={this.style.filterCoinainer}>
           {indents}
         </View>
       )
   }

   renderApplyButton(){
     return (
       <View style={this.style.updateButtonContainer}>
         <FliwerGreenButton onPress={()=>this.updateFilter()}  text={this.props.actions.translate.get('general_update').toUpperCase()} containerStyle={this.style.updateButtonTouchable} />
       </View>
      )
   }




};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,

    }
}

// Doing this merges our actions into the componentâ€™s props,
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
  modalIn:{
    backgroundColor:"rgba(255,255,255,0.95)",
    borderRadius:20,
    minWidth:200,
    maxWidth:"90%",
    //maxHeight:"85%",
    overflow:"hidden"
  },
  modalView:{
    paddingTop:10,
    paddingLeft:4,
    paddingRight:4,
    paddingBottom:5,
    display:"flex",
    //maxHeight:"100%"
  },
  optionsContainer:{
    flexShrink:1,
    overflowY:"auto",
    //maxHeight:"100%",
    //alignItems:"center",
    marginLeft:10,
    marginRight:10,
  },
  notificationTitleContainer:{

  },
  filterCointainer:{
    flexDirection:"row",
    alignItems:"center",
    borderRadius:45,
    paddingLeft:10,
    paddingRight:10,
    marginBottom:7,

  },
  imageFilter:{
    height:30,
    width:30,
  },
  filterImageContainer:{
    marginRight:10,
    //height:"100%",
    //width:"100%",
  },
  line1:{
    height:1,
    backgroundColor: FliwerColors.secondary.gray,
    marginTop:10,
    marginBottom:10,
    width:"90%",
  },
  goToContainer:{
    flexDirection:"column",
    alignItems:"center",
    width:"100%",
  },
  goTo:{
    width:"100%",
  },
  goToTitle:{
    flexShrink:0,
  },
  filterTopTitleContainer:{
    paddingBottom:6,

  },
  filterTopTitle:{

  },
  updateButtonContainer:{
    width: "60%",
    height:30,
    marginBottom:10,
    alignSelf:"center",
  },
  updateButtonTouchable:{
    height:"100%",
    width:"100%"
  },
  filterCoinainer:{
    //height:"100%",
    //width:"100%"
    //marginLeft:9,
    alignItems:"center",
  },
  filterTitle:{
    //color:"white",
  },



};


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style,FliwerHistoryFilter));
