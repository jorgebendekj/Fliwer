'use strict';
import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
} = require('react-native');


import {CurrentTheme, FliwerColors} from '../../../utils/FliwerColors'
import FliwerCard from '../../../components/custom/FliwerCard.js'
import * as ActionsLang from '../../../actions/languageActions.js'; //Import your actions
import * as ActionsAcademy from '../../../actions/academyActions.js';
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';
import { Redirect } from '../../../utils/router/router'
import {Orientation} from '../../../utils/orientation/orientation'
import {toast} from '../../../widgets/toast/toast'
import Dropdown from '../../../widgets/dropdown/dropdown';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../../utils/mediaStyleSheet.js'

import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

import FrontLayerWrapper from '../../frontLayerWrapper.js';
import FliwerDeleteModal from '../../custom/FliwerDeleteModal.js'

import trashImage  from '../../../assets/img/trash.png'

class TemplateCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderDeleteModal:false,
            goBack:false
        };
    }

    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    getNoteConverted(note)
    {
        var text = null;

        if (note >= 9)
            text = this.props.actions.translate.get('Academy_merit')
        else if (note >= 7)
            text = this.props.actions.translate.get('Academy_good')
        else if (note >= 5)
            text = this.props.actions.translate.get('Academy_pass')
        else if (note >= 0)
            text = this.props.actions.translate.get('Academy_failed')

        return text;
    }

    createdByMe()
    {
        var createdByMe = false;
        if (this.props.course && this.props.course.creator)
        {
            if (this.props.course.creator.idUser == this.props.sessionData.idUser)
            {
                createdByMe = true;
            }
        }
        return createdByMe;
    }

    componentDidUpdate(prevProps){
        if(!prevProps?.deletingItem && this.props.deletingItem){
            if(this.props.deletingItem == this.props?.course?.id){
                this.setState({renderDeleteModal: true});
            }
            this.props.enDeleteItem()
        }
    }

    render() {
        var extraStyle ={height: 100}; // 188

        var indents=[];

        if(this.state.goBack){
            indents.push(<Redirect push to={"/app/workOrder/assignTemplate"} />)
        }
        
        indents.push (
                <FliwerCard/*  ref="card" touchableFront={false} touchableBack={false} 
                        cardInStyle={(Platform.OS == "web" && this.state.mediaStyle.orientation == "landscape") ? {maxWidth: 380} : {}} 
                        style={(Platform.OS == "web" && this.state.mediaStyle.orientation == "landscape") ? {maxWidth: 381} : {}}
                        cardStyle={[{borderRadius: 7, borderColor: "gray", borderWidth: 2}, !this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)}]} */
                        ref="card" 
                        touchableFront={false} 
                        touchableBack={false} 
                        cardStyle={!this.props.onPressAdd ? {} : { opacity: (Platform.OS == "android" ? 0.6 : 0.4) }}
                    >
                    <View>
                        <View style={[this.style.frontCard,this.props.styleCard]}>
                            {this.renderCardFront()}
                            {this.renderDeleteModal()}
                        </View>
                    </View>
                </FliwerCard>
                );

        return indents;
    }

    toggle(){
        var that=this;
        return function(){
            that.refs.card._toggleCard()
        }
    }

    renderCardFront()
    {
        if (typeof this.props.onPressAdd === 'function')
            return (
                <TouchableOpacity style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}} 
                    onPress={()=>this.props.onPressAdd()}
                    >
                    <Text key={987} style={{fontSize: 50, marginTop: -5, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                </TouchableOpacity>
            );
    
        var indents = [];
        var course = this.props.course;

        indents.push(
                <View 
                    style={{
                        width: "100%", 
                        height: 100, 
                        flexDirection: "row", 
                        alignItems: "center",
                        backgroundColor: CurrentTheme.cardColor,
                        borderRadius:7,
                        borderWidth: this.props.selectedTemplate == course.id ? 1: 0,
                        borderColor: CurrentTheme.selectedColor
                    }}
                >
                <View style={{ flex: 1, paddingLeft: 10 }}>
                        <IconFontAwesome name="copy" size={60} style={{color: "white"}}/>
                    </View>
                    <View style={{ flex: 3 }}>
                        <View style={{paddingTop:10,paddingRight:10,paddingBottom:8}}>
                            <Text style={[this.style.textTitle, {color: CurrentTheme.cardText, fontSize: 14, opacity: 1}]} ellipsizeMode='tail' numberOfLines={1}>{course.softId}</Text>
                        </View>
                        <View style={{ paddingRight:26,height: 58}}>
                            <Text style={[this.style.textDescription, {color: CurrentTheme.cardText, fontSize: 12, opacity: 1}]} ellipsizeMode='tail' numberOfLines={4} >{course.title}</Text>
                        </View>
                    </View>
                        
                    
                    {/* {this.drawTrashButton()} */}
                    
                </View>
                );            
        
            
        return (
            <TouchableOpacity activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                    this.props.gotoCourse(course.id)
                    this.props.setTemplateSelected(course.id)
                }} >
                {indents}
            </TouchableOpacity>
            );

    }


    drawTrashButton() {

        if (this.props.roles.fliwer || (this.props.roles.angel && this.createdByMe()) || this.createdByMe())
            return (
                    <View style={this.style.deleteButtonContainer}>
                        <TouchableOpacity style={{}} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
                            this.setState({renderDeleteModal: true});
                        }}>
                            <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                        </TouchableOpacity>
                    </View>
                    );
    }

    renderDeleteModal(){
        if(this.state.renderDeleteModal){
            //Render a delete Modal that ask in spanish if the user is new or already exist. The modal is inside the frontLayerWrapper
            return(
                <FrontLayerWrapper key="renderDeleteTemplate">
                    <FliwerDeleteModal
                        visible={this.state.renderDeleteModal}
                        onClose={() => {
                            this.setState({renderDeleteModal: false});
                        }}
                        onConfirm={async (password) => {
                            if(this.props.onLoading) this.props.onLoading(true);
                            this.setState({goBack:true});
                            await this.props.actions.academyActions.deleteWorkOrderTemplate(this.props.course.id);
                            if(this.props.onLoading) this.props.onLoading(false);
                            this.setState({renderDeleteModal: false,});
                        }}
                        title={"¿Quieres borrar la plantilla?"}
                        hiddeText={true}
                        password={false}
                        loadingModal={this.props.loading}
                        />
                </FrontLayerWrapper>
            );
        }else return [];
    }

};

function mapStateToProps(state, props) {
    return {
        roles: state.sessionReducer.roles,
        sessionData: state.sessionReducer.dataLogin,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        userData: state.sessionReducer.data,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            academyActions: bindActionCreators(ActionsAcademy, dispatch),
        }
    }
}

var style = {
    deleteButtonContainer: {
        position: "absolute", 
        right: 5, bottom: 5,
        alignItems: "flex-end",
        justifyContent: "flex-end"
    },
    trashIcon: {
        width: 20,
        height: 20,
        justifyContent: "flex-end",
    },
    progressBarContainer: {
        width: "100%",
        height: 2,
        backgroundColor: "white",
        marginTop: 5
    },
    progressBarOut: {
        width: "100%",
        height: "100%"/*,
        borderWidth: 1,
        borderColor: FliwerColors.primary.black,
        borderRadius: 4*/

    },
    progressBarIn: {
        height: "100%",
        position: "absolute",
        borderRadius: 2


    },
    frontCard: {
        height: 100,
        width: "100%"
    },
    imageCourse: {
        width: 65,
        height: 65,
        backgroundColor: "#F7F4F4",
        borderRadius: 12,
        borderColor: "lightGrey"
    },
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        fontSize: 21
    },
    textDescription: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
    },
    textPercentContainer: {

    },
    textPercent: {
        fontSize: 10,
        fontFamily: FliwerColors.fonts.regular,
        color: "white"
    },
    turnButtonUp: {
      position:"absolute",
      width:40,
      height:40,
      top: 0,
      right: 0,
      zIndex: 999
    },
    turnButtonDown: {
      position:"absolute",
      width:40,
      height:40,
      bottom: 0,
      right: 0,
      zIndex: 999
    },
    turnButtonImage:{
      position:"absolute",
      right: 0,
      width: 20,
      height: 20,
      marginRight: 4
    },
    textTitleTicketAuditText: {
        color: "white", fontSize: 18, fontWeight: "bold"
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(115%)"
        },
        turnButtonUp:{
          filter:"brightness(150%)"
        },
        turnButtonDown:{
          filter:"brightness(150%)"
        }
    },
    "@media (width<=480)":{
        textTitleTicketAuditText: {
            fontSize: 16
        }
    },
    "@media (width<=410)":{
        textTitleTicketAuditText: {
            fontSize: 14
        }
    },
    "@media (width<=380)":{
        textTitleTicketAuditText: {
            fontSize: 12
        }
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, TemplateCard));
