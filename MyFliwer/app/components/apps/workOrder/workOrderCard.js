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
import * as ActionsWrapper from '../../../actions/wrapperActions.js';
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';
import { Redirect } from '../../../utils/router/router'
import {Orientation} from '../../../utils/orientation/orientation'
import {toast} from '../../../widgets/toast/toast'
import Dropdown from '../../../widgets/dropdown/dropdown';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {useMediaInfo,MediaInfo} from '../../../utils/mediaStyleSheet.js'
import moment from 'moment';

import FrontLayerWrapper from '../../frontLayerWrapper.js';
import FliwerDeleteModal from '../../custom/FliwerDeleteModal.js'

import trashImage  from '../../../assets/img/trash.png'
import SearchWorkerModal from './SearchWorkerModal.js';

class WorkOrderCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            renderDeleteModal:false,
            searchModal: false,
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
            this.props.enDeleteItem();
        }
    }

    render() {
        var extraStyle ={height: 110}; // 188

        var indents=[];

        if(this.state.goBack){
            indents.push(<Redirect push to={"/app/workOrder"} />)
        }
        
        indents.push (
                <FliwerCard key={"WorkOrderCardFliwerCard"+this.props.course?.id} ref="card" touchableFront={false} touchableBack={false} 
                        cardInStyle={(Platform.OS == "web" && MediaInfo.orientation == "landscape") ? {maxWidth: 380} : {}} 
                        style={(Platform.OS == "web" && MediaInfo.orientation == "landscape") ? {maxWidth: 381} : {}}
                        cardStyle={[{borderRadius: 7, 
                        borderWidth: this.props?.match?.params?.idCourse == this.props?.course?.id ? 15: 1,
                        borderColor:this.props?.match?.params?.idCourse == this.props?.course?.id ? CurrentTheme.selectedColor : "gray",
                         borderWidth: 2}, !this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)}]}
                    >
                    <View key={"WorkOrderCardView1"+this.props.course?.id} style={{}}>
                        <View key={"WorkOrderCardView2"+this.props.course?.id} style={[{height: 188,
        width: "100%"}, extraStyle]}>
                            {this.renderCardFront()}
                            {this.renderDeleteModal()}
                            {this.renderSearchModal()}
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

    printCreator(){
        var course= this.props.course;
        var name=course.creator.first_name;
        if (course.creator.last_name) name+=" "+course.creator.last_name;
        return name;
    }

    renderCardFront()
    {
        if (typeof this.props.onPressAdd === 'function')
            return (
                <TouchableOpacity style={{width: "100%", height: "100%", borderRadius: 10, alignItems: "center", justifyContent: "center"}} 
                    onPress={()=> {
                        if(this.props?.employees?.length > 0){
                            this.setState({
                                searchModal: true
                            })
                        }else{
                            this.props.onPressAdd()
                        }
                    }}
                    >
                    <Text key={987} style={{fontSize: Platform.OS == "web"?100:70, marginTop: -5, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                </TouchableOpacity>
            );
    
        var indents = [];
        var course = this.props.course;

        var employee = this.props?.employees?.find(e => e.idUser == course.idUser) || null

        if (!employee) {
            if(course.idUser === this.props.userData.user_id){
                employee = {
                    first_name: this.props.userData.first_name,
                    last_name: this.props.userData.last_name
                }
            }
        }

        const currentDay = moment.unix(course.createTime).locale('es').format('dddd DD/MM/YYYY');
        const currentDayCapitalized = currentDay.charAt(0).toUpperCase() + currentDay.slice(1)

        indents.push(
                <View 
                    key={"WorkOrderCardFrontView1"+this.props.course?.id}
                    style={{
                        width: "100%", 
                        height: "100%",
                        backgroundColor: this.props.isToday ? this.props.isMostRecent ? CurrentTheme.lighterCardColor : CurrentTheme.cardColor : CurrentTheme.darkerCardColor
                        //opacity: this.props.match.params?.idCourse == course.id ? 1: 0,
                        /*, borderColor: "violet", borderWidth: 1*/
                        }}
                >

                    <View style={{padding: 10}}>
                        <Text style={[{fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        fontSize: 21}, {color: CurrentTheme.cardText, fontSize: 16, opacity: 1}]}  ellipsizeMode='tail' numberOfLines={1}>
                            {/* {"Parte de "+this.printCreator()} */}
                            {`${course.softId} - ${currentDayCapitalized}`}
                        </Text>
                    </View>
                    <View style={{flexDirection:"row",gap:10,paddingLeft:10,paddingRight:10, flexShrink: 1}}>
                        <View style={{ display:"flex" }}>
                            <Image source={{ uri: course.creator.image}} style={{ width: 60, height: 60, borderRadius: 10,backgroundColor:"white" }} resizeMode={"cover"} />
                        </View>
                        <View style={{flexGrow:1,justifyContent:"flex-start",gap:5, flexShrink: 1}}>
                                {/* <Text style={[this.style.textDescription, {color: CurrentTheme.cardText, fontSize: 12, opacity: 1}]} ellipsizeMode='tail' numberOfLines={4} >{"Fecha: "+moment(course.date).format("DD/MM/YYYY")}</Text>

                                <Text style={[this.style.textDescription, {color: CurrentTheme.cardText, fontSize: 12, opacity: 1}]} ellipsizeMode='tail' numberOfLines={4} >{"Fecha de creación: "+moment(course.createTime*1000).format("DD/MM/YYYY HH:mm")}</Text> */}
                                
                                {
                                    employee
                                    &&
                                    <Text 
                                    style={[{fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,}, {color: CurrentTheme.cardText, fontSize: 12, opacity: 1, flexShrink:1}]} 
                                    numberOfLines={2}
                                    >
                                        {employee.first_name} {employee.last_name}
                                    </Text>
                                    }

                                <Text style={[{fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,}, {color: CurrentTheme.cardText, fontSize: 12, opacity: 1}]} ellipsizeMode='tail' numberOfLines={4} >{"Plantilla usada: "+course.title}</Text>
                        </View>
                    </View>
                        
                    
                 {/* {this.drawTrashButton()}  */}
                    
                </View>
                );   

         if (this.state.goCourse){
            indents.push(<Redirect key={"redirect-" + this.state.goCourse} push to={"/app/workOrder/in/"+this.state.goCourse} />)
            this.state.goCourse=false;
            if(useMediaInfo.orientation != "landscape"){
                this.props.actions.wrapperActions.setPortraitScreen(2);
            }
            }
            
        return (
            <TouchableOpacity activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                    //this.props.gotoCourse(course.id)
                    this.setState({ goCourse: course.id})
                    //console.log(' course.id', course.id, course.softId)
                }} >
                {indents}
            </TouchableOpacity>
            );

    }


    drawTrashButton() {

        if (this.props.roles.fliwer || (this.props.roles.angel && this.createdByMe()) || this.createdByMe())
            return (
                    <View style={{
                            position: "absolute", 
                            right: 5, bottom: 5,
                            alignItems: "flex-end",
                            justifyContent: "flex-end"
                    }}>
                        <TouchableOpacity style={{}}  onPress={() => {
                            this.setState({renderDeleteModal: true});
                        }}>
                            <Image style={{
                                width: 20,
                                height: 20,
                                justifyContent: "flex-end",
                            }} source={trashImage} resizeMode={"contain"}/>
                        </TouchableOpacity>
                    </View>
                    );
    }

    renderDeleteModal(){
        if(this.state.renderDeleteModal){
            //Render a delete Modal that ask in spanish if the user is new or already exist. The modal is inside the frontLayerWrapper
            return(
                <FrontLayerWrapper key="renderDeleteWorkOrder">
                    <FliwerDeleteModal
                        visible={this.state.renderDeleteModal}
                        onClose={() => {
                            this.setState({renderDeleteModal: false});
                        }}
                        onConfirm={async (password) => {
                            if(this.props.onLoading) this.props.onLoading(true);
                            this.setState({goBack:true});
                            await this.props.actions.academyActions.deleteWorkOrder(this.props.course.id);
                            if(this.props.onLoading) this.props.onLoading(false);
                            this.setState({renderDeleteModal: false,});
                        }}
                        title={"¿Quieres borrar el parte de trabajo?"}
                        hiddeText={true}
                        password={false}
                        loadingModal={this.props.loading}
                        />
                </FrontLayerWrapper>
            );
        }else return [];
    }

    renderSearchModal(){
        if(this.state.searchModal){
            return(
                <FrontLayerWrapper key="renderSearchWorkerOrder">
                    <SearchWorkerModal
                        visible={this.state.searchModal}
                        onClose={() => this.setState({ searchModal: false })}
                        onSelect={(idUser) => this.props.onPressAdd2(idUser)}
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
        employees: state.sessionReducer.employees
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            academyActions: bindActionCreators(ActionsAcademy, dispatch),
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch),
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(WorkOrderCard);
