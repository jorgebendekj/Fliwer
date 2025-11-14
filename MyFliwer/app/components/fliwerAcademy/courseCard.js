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

import {academyCommonUtils} from './academyCommonUtils.js';
import {FliwerColors} from '../../utils/FliwerColors'
import FliwerCard from '../../components/custom/FliwerCard.js'
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import IconEvilIcons from 'react-native-vector-icons/EvilIcons';
import { Redirect } from '../../utils/router/router'
import {Orientation} from '../../utils/orientation/orientation'
import {toast} from '../../widgets/toast/toast'
import Dropdown from '../../widgets/dropdown/dropdown';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import moment from 'moment';

import trashImage  from '../../assets/img/trash.png'
import turn1 from '../../assets/img/3_Turn1.png'
import turn2 from '../../assets/img/3_Turn2.png'
import turn1white from '../../assets/img/3_Turn1white.png'
import turn2white from '../../assets/img/3_Turn2white.png'
import ticketsIconTransp  from '../../assets/img/academy/tickets-icon-transp.png'
import auditsIconTransp  from '../../assets/img/academy/audits-icon-transp.png'

class CourseCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
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

    render() {
        var extraStyle = this.props.audit? {} : {height: 200}; // 188
        
        return (
                <FliwerCard ref="card" touchableFront={false} touchableBack={false} 
                        cardInStyle={(Platform.OS == "web" && this.state.mediaStyle.orientation == "landscape") ? {maxWidth: 380} : {}} 
                        style={(Platform.OS == "web" && this.state.mediaStyle.orientation == "landscape") ? {maxWidth: 381} : {}}
                        cardStyle={[{borderRadius: 7, borderColor: "gray", borderWidth: 2}, !this.props.onPressAdd? {} : {opacity: (Platform.OS == "android"? 0.6 : 0.4)}]}
                    >
                    <View style={{}}>
                        <View style={[this.style.frontCard, extraStyle]}>
                            {this.renderCardFront()}
                        </View>
                    </View>
                    <View style={{}}>
                        <View style={[this.style.frontCard, extraStyle]}>
                            {this.renderCardBack()}
                        </View>
                    </View>
                </FliwerCard>
                );
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
                    <Text key={987} style={{fontSize: 100, marginTop: -5, color: "gray", fontFamily: FliwerColors.fonts.regular}}>{"+"}</Text>
                </TouchableOpacity>
            );
    
        var indents = [];
        var course = this.props.course;
        var borderRadius = 5;

        if (this.props.audit)
        {
            var statusColor = academyCommonUtils.getColorByStatus(course.status, course.isTicket);
            var statusName = academyCommonUtils.getStatusName(course.status, course.isTicket, this.props.actions.translate).toUpperCase();
            //var iconUri = course.isTicket? "https://fliwer.com:7100/getFile/academy/tickets-icon-transp.png" : "https://fliwer.com:7100/getFile/academy/audits-icon-transp.png";
            var iconUri = course.isTicket? ticketsIconTransp : auditsIconTransp;
            var idTicketAudit = course.idTicketAudit? course.idTicketAudit : course.id;
            var idTicketAuditText = (course.isTicket? this.props.actions.translate.get('Files_incident').toUpperCase() : this.props.actions.translate.get('Files_audit').toUpperCase()) + " Nº " + academyCommonUtils.getFormattedNumber(idTicketAudit, course.isTicket);

            indents.push(
                    <View style={{}}>
                        
                        <TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                            <Image style={[this.style.turnButtonImage, {top: 5}]} source={course.status==="anulled"? turn1white : turn1} resizeMode={"contain"}/>
                        </TouchableOpacity>
                        {!this.isStatusChangeable()?<TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                            <Image style={[this.style.turnButtonImage, {bottom: 5}]} source={course.status==="anulled"? turn2white : turn2} resizeMode={"contain"}/>
                        </TouchableOpacity>:null}
          
                        <View style={{padding: 5, flexDirection: "row", height: 54, backgroundColor: statusColor, 
                                        borderTopLeftRadius: borderRadius,
                                        borderTopRightRadius: borderRadius}}>
                            <Image style={[{width: 40, height: 40, marginTop: 2, marginLeft: 20, marginRight: 20}]} draggable={false} resizeMode={"contain"} source={/*uri: */iconUri}/>
                            <View style={{
                                flexDirection: "column", 
                                //borderColor: "red", borderWidth: 1, 
                                flex: 1}}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.textTitle, this.style.textTitleTicketAuditText, Platform.OS == "web"? {marginTop: 3} : {marginTop: 0}]}>{idTicketAuditText}</Text>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.textDescription, {color: "white", fontSize: 13}, Platform.OS == "web"? {marginTop: 3} : {marginTop: 0}]}>{course.title}</Text>
                            </View>
                        </View>
                    
                        <View style={{flexDirection: "row", flexGrow: 1, paddingTop: 10, paddingBottom: 10, paddingLeft: 17, paddingRight: 13, }}>
                            <View style={{flexDirection: "row", flexShrink: 1}}>
                                <View style={{}}>
                                    <Image style={[{borderColor: "lightGrey", backgroundColor: "#F7F4F4", borderRadius: 8, height: 75, width: 75}]} draggable={false} resizeMode={"cover"} source={{uri: course.image}}/>
                                </View>
                                <View style={{paddingLeft: 10, justifyContent: "space-evenly", flexGrow: 1, flexShrink: 1}}>
                                    <View style={{}}>
                                        <Text ellipsizeMode='tail' numberOfLines={4} style={this.style.textDescription}>{course.description}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    
                        <View style={{flexDirection: "row", height: 39, alignItems: "center", backgroundColor: statusColor, 
                                        borderBottomLeftRadius: borderRadius,
                                        borderBottomRightRadius: borderRadius}}>
                            <View style={{height: "100%", justifyContent: "center", width: "50%", borderRightWidth: 1, borderRightColor: "white", paddingRight: 5, paddingLeft: 9}}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.textDescription, {alignSelf: "center", color: "white", fontSize: 14, fontWeight: "bold"}]}>{moment(course.createTime * 1000).format('L')}</Text>
                            </View>
                            {this.renderStatus(statusName)}
                        </View>
                    
                    </View>
                    );
            
        } else {
           
            var resizeMode = course.id == 44? "contain" : "cover";
            var maskHeight = 105;
            var anyExam = this.anyExam(this.props.course);
            indents.push(
                    <View style={{width: "100%", height: "100%"/*, borderColor: "violet", borderWidth: 1*/}}>
                        <Image style={{position: "absolute", left: 0, top: 0, width: "100%", height: "100%", borderRadius: borderRadius}} draggable={false} resizeMode={resizeMode} source={{uri: course.image}}/>
                        <View style={{position: "absolute", bottom: 0, width: "100%", height: maskHeight,
                                        /*, borderColor: "red", borderWidth: 1,*/
                                        backgroundColor: "black", opacity: 0.6, padding: 10, 
                                        borderBottomLeftRadius: borderRadius,
                                        borderBottomRightRadius: borderRadius
                                    }}>
                        </View>
                        <View style={{position: "absolute", bottom: 0, width: "100%", height: maskHeight,
                                        /*, borderColor: "red", borderWidth: 1,*/
                                        backgroundColor: "transparent", padding: 10
                                    }}>
                            <View style={{}}>
                                <Text style={[this.style.textTitle, {color: "white", fontSize: 16, opacity: 1}]} ellipsizeMode='tail' numberOfLines={1}>{course.title}</Text>
                            </View>
                            <View style={{height: 32}}>
                                <Text style={[this.style.textDescription, {marginTop: 5, color: "white", fontSize: 12, opacity: 1}]} ellipsizeMode='tail' numberOfLines={2} >{course.description}</Text>
                            </View>
                             
                            {anyExam? this.renderProgressBar(this.props.progress) : null}
                            {anyExam? this.renderExamResults() : null}
                            
                        </View>
                        
                        {this.drawTrashButton()}
                        
                    </View>
                    );            
        }
            
        return (
            <TouchableOpacity activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                    this.props.gotoCourse(course.id)
                }} >
                {indents}
            </TouchableOpacity>
            );

    }
    
    isStatusChangeable() {
        return this.props.audit && (this.props.roles.fliwer || this.props.roles.angel || (this.props.roles.gardener && this.props.gardenerCheckidUser));
    }
    
    renderStatus(statusName) {
        
        var changeable = this.isStatusChangeable();
        
        var style = {height: "100%", justifyContent: "center", width: "50%"};
        var textStyle = {/*fontFamily: FliwerColors.fonts.regular,*/ textAlign: "center", color: "white", fontSize: 12, fontWeight: "bold", width: "100%"};
                            
        if (changeable) {
            var course = this.props.course;
            var status = course.status;
            
            return (
                <View style={[style, {paddingLeft: 3, paddingRight: 3}]}>  
                    <Dropdown modal={true} 
                        selectedValue={status} 
                        style={[Platform.OS == "android" || Platform.OS == 'ios'? {borderWidth: 1, borderRadius: 4, borderColor: "gray"} : {}, {width: "100%"}]} 
                        styleOptions={{}} options={this.printStatus()} 
                        textStyle={textStyle} 
                        upperCase={true}
                        onChange={(value) => {
                            this.props.onChangeStatus(value, course.isTicket, course.id);
                        }} 
                    />         
                </View>
            );
        }
        else
            return (
                <View style={style}>
                    <Text 
                        ellipsizeMode='tail' 
                        numberOfLines={1} 
                        style={textStyle}>
                        {statusName}
                    </Text>
                </View> 
            );
    }

    printStatus() {
        if (this.props.course.isTicket)
        {
            return [
                {value: "pending", label: "Pendiente".toUpperCase()},
                {value: "solved", label: "Solventada".toUpperCase()},
                {value: "anulled", label: "Anulada".toUpperCase()}
            ];            
        }
        else
        {
            return [
                {value: "inprocess", label: "En proceso".toUpperCase()},
                {value: "finalized", label: "Finalizada".toUpperCase()}
            ];            
        }
    }
    
    anyExam(course)
    {
        var ret = false;
        if (!course || course.pages.length == 0)
            return ret;
        
        console.log(course);
        
        var page, component;
        for (var i in course.pages)
        {
            page = course.pages[i];
            //console.log("page", page);
            if (page.components && page.components.length >0)
            {
                for (var ii in page.components)
                {
                    component = page.components[ii];
                    //console.log("component", component);
                    if (component.type == 4)
                    {
                        ret = true;
                        return true;
                    }
                }                
            }
        }
        
        return ret;
    }

    renderCardBack()
    {
        if (typeof this.props.onPressAdd === 'function')
            return null;
        
        var indents = [];
        var borderRadius = 5;
        var course = this.props.course;
        var statusColor = academyCommonUtils.getColorByStatus(course.status, course.isTicket);
        var statusName = academyCommonUtils.getStatusName(course.status, course.isTicket, this.props.actions.translate).toUpperCase();
            
        var creator = "";
        var client = "";
//        if (this.state.userData)
//        {
//            client += this.state.userData.first_name;
//            if (this.state.userData.last_name)
//            {
//                client += " " + this.state.userData.last_name;
//            }
//        }
        creator += course.creator.first_name;

        if (course.creator.last_name)
        {
            creator += " " + course.creator.last_name;
        }
        var datetimeText = "";
        if (!course.datetime)
        {
            datetimeText = moment(course.createTime * 1000).format("DD/MM/YYYY HH:mm");
        }
        else
        {
            datetimeText = moment(course.datetime * 1000).format("DD/MM/YYYY HH:mm");
        }
        var latitudeText = "- - -";
        var longitudeText = "";
        if (course.coords && course.coords.split(",").length == 2)
        {
            var [latitude, longitude] = course.coords.split(",");
            if (latitude.length > 7) latitude = latitude.substring(0,7);
            if (longitude.length > 7) longitude = longitude.substring(0,7);
            latitudeText = latitude;
            longitudeText = longitude;
        }
        var idTicketAudit = course.idTicketAudit? course.idTicketAudit : course.id;
        var idTicketAuditText = "Nº " + academyCommonUtils.getFormattedNumber(idTicketAudit, course.isTicket);
        
        var invoicesIndents = [];
        if (course && course.invoices && course.invoices.length > 0)
        {
            var invoices = course.invoices, invoice;
            var i = 0;
            while (i<invoices.length) {

                invoice = invoices[i];
                var invoicesIndent = [];
                invoicesIndent.push(<Text style={{fontSize: 14}}>{invoice.idBill}</Text>);
                i++;

                if (invoices[i])
                {
                    invoice = invoices[i];
                    invoicesIndent.push(
                        <Text style={{fontSize: 14, marginLeft: 30}}>{invoice.idBill}</Text>
                    );
                    i++;
                }

                if (invoices[i])
                {
                    invoice = invoices[i];
                    invoicesIndent.push(<Text style={{fontSize: 14, marginLeft: 30}}>{invoice.idBill}</Text>);
                    i++;
                }

                invoicesIndents.push(
                    <View style={{flexDirection: "row", marginTop: 5, width: "100%"}}>
                        {invoicesIndent}
                    </View>
                );
            }  
        }
        
        indents.push(
            <View style={{width: "100%", height: "100%"}}>
                        
                <TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonUp} onMouseEnter={this.hoverIn('turnButtonUp')} onMouseLeave={this.hoverOut('turnButtonUp')}>
                    <Image style={this.style.turnButtonImage} source={turn1} resizeMode={"contain"}/>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1}  onPress={this.toggle()} style={this.style.turnButtonDown} onMouseEnter={this.hoverIn('turnButtonDown')} onMouseLeave={this.hoverOut('turnButtonDown')}>
                    <Image style={[this.style.turnButtonImage, {bottom: 0}]} source={course.status==="anulled"? turn2white : turn2} resizeMode={"contain"}/>
                </TouchableOpacity>  

                <View style={{padding: 5, flexDirection: "column", height: 149,  
                                borderTopLeftRadius: borderRadius,
                                borderTopRightRadius: borderRadius}}>
                    <View style={{flexDirection: "row", marginTop: 10, paddingLeft: 20}}>
                        <Text style={[{width: 100, fontSize: 12}]}>{this.props.actions.translate.get('general_made_by')+":"}</Text>
                        <Text style={[{fontWeight: "bold"}]}>{creator? creator : client}</Text>
                    </View>
                    <View style={{flexDirection: "row", marginTop: 0, paddingLeft: 20}}>
                        <Text style={[{width: 100, fontSize: 12}]}>{this.props.actions.translate.get('Academy_day_and_time')+":"}</Text>
                        <Text style={[{fontWeight: "bold"}]}>{datetimeText + "h"}</Text>
                    </View>
                    <View style={{marginTop: 15, paddingLeft: 20, width: "100%"}}>
                        <Text style={[{fontSize: 10}]}>{course.isTicket? (this.props.actions.translate.get('Academy_associated_invoices').toUpperCase() + " : ") : ""}</Text>
                    </View>
                    <View style={{marginTop: 5, paddingLeft: 20, width: "100%", height: 65}}>
                        <ScrollView scrollEventThrottle={1000} style={{flex: 1}} contentContainerStyle={{}}>
                            {invoicesIndents}
                        </ScrollView>                    
                    </View>
                </View>

                <View style={{flexDirection: "row", height: 39, alignItems: "center", backgroundColor: statusColor, 
                                borderBottomLeftRadius: borderRadius,
                                borderBottomRightRadius: borderRadius}}>
                    <View style={{height: "100%", justifyContent: "center", width: "50%", borderRightWidth: 1, borderRightColor: "white", paddingRight: 5, paddingLeft: 9}}>
                        <View style={{flexDirection: "row", alignSelf: "center"}}>
                            <Text style={[this.style.textTitle, {color: "white", fontSize: 12, fontWeight: "bold"}]}>{"GPS:"}</Text>
                            <Text style={{marginRight: 5}}>{""}</Text>
                            <Text style={[this.style.textTitle, {color: "white", fontSize: 12, fontWeight: "bold"}]}>{latitudeText}</Text>
                            <Text style={{marginRight: 8}}>{""}</Text>
                            <Text style={[this.style.textTitle, {color: "white", fontSize: 12, fontWeight: "bold"}]}>{longitudeText}</Text>
                        </View>
                    </View>
                    <View style={{height: "100%", width: "50%", justifyContent: "center"}}>
                        <Text style={[this.style.textTitle, {fontSize: 12, width: "100%", textAlign: "center", color: "white", fontWeight: "bold", marginTop: 0}]}>
                            {idTicketAuditText}
                        </Text>
                    </View>
                </View>
                    
                <View style={{position: "absolute", right: 5, bottom: 50}}>
                    {false ? this.drawTrashButton() : null}
                </View>

            </View>
        );        
            
        return (
            <TouchableOpacity activeOpacity={1} style={{width: "100%", height: "100%"}} onPress={() => {
                    this.props.gotoCourse(course.id)
                }} >
                {indents}
            </TouchableOpacity>
            );
    }

    renderExamResults()
    {
        var indents = [];
        
        if (this.props.course.scoreTime)
        {
            var date = moment.utc(this.props.course.scoreTime * 1000).format("L");
            //var result =this.getNoteConverted(this.props.course.score);
            //FliwerColors.primary.green
            indents.push(
                    <View style={{width: "100%", marginTop: 15}}>
                        <Text style={[this.style.textDescription, {color: "lime" , fontStyle: "italic", fontSize: 10, fontWeight: "bold"}]}>{this.props.actions.translate.get('general_finalized') + " - " + date}</Text>
                    </View>
                    );            
        }
        else
        {
            indents.push(
                    <View style={{width: "100%", marginTop: 15}}>
                        <Text style={[this.style.textDescription, {color: "yellow", fontStyle: "italic", fontSize: 10}]}>{this.props.actions.translate.get('Academy_pending')}</Text>
                    </View>
                    ); 
            
        }

        return indents;
    }

    drawTrashButton() {

        if (this.props.roles.fliwer || (this.props.roles.angel && this.createdByMe()) || this.createdByMe())
            return (
                    <View style={this.style.deleteButtonContainer}>
                        <TouchableOpacity style={{}} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
                            this.props.deleteCourse(this.props.course.id)
                        }}>
                            <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
                        </TouchableOpacity>
                    </View>
                    );
    }
    

    getBarColor(progress)
    {
        //return "orange";
        
        var color = "purple";
        if (progress == 100)
        {
            color = "#97F63E";
        } else if (progress >= 80)
        {
            color = "#C7F63E";
        } else if (progress >= 60)
        {
            color = "#F6E83E";
        } else if (progress >= 40)
        {
            color = "#F6B33E";
        } else if (progress >= 20)
        {
            color = "#F6863E";
        } else if (progress >= 0)
        {
            color = "#F6493E";
        }

        return color;
    }

    renderProgressBar(progress, colorBar)
    {
        var indents = [];

        /*
        indents.push(
                <View style={[this.style.progressBarContainer]}>
                    <View style={this.style.progressBarOut}>
                        <View style={[this.style.progressBarIn, {justifyContent: "center", height: "100%", width: progress + "%", backgroundColor: this.getBarColor(progress), alignItems: "center"}]}>
                            <View style={[{justifyContent: "center", height: "100%"}]}><Text style={[this.style.textPercent]}>{this.props.progress > 11 ? this.props.progress + "%" : ""}</Text></View>
                        </View>
                    </View>
                    <View style={[{flexDirection: "row"}]}>
                        <View style={[{}]}><Text style={this.style.textPercent}>{"0%"}</Text></View>
                        <View style={[{flexGrow: 1, alignItems: "flex-end"}]}>
                            <View style={[{width: 30, left: 0}]}>
                                <Text style={[this.style.textPercent, {left: 8, position: "absolute"}]}>{"100%"}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                );
         */
        
        progress = this.props.course.score * 10;

        indents.push(
                <View style={[this.style.progressBarContainer]}>
                    <View style={this.style.progressBarOut}>
                        <View style={[this.style.progressBarIn, {justifyContent: "center", height: "100%", width: progress + "%", backgroundColor: this.getBarColor(progress), alignItems: "center"}]}>
                            {false?<View style={[{justifyContent: "center", height: "100%"}]}><Text style={[this.style.textPercent]}>{this.props.progress > 11 ? this.props.progress + "%" : ""}</Text></View>:null}
                        </View>
                    </View>
                    <View style={[{flexDirection: "row"}]}>
                        <View style={[{}]}><Text style={this.style.textPercent}>{"0"}</Text></View>
                        <View style={[{flexGrow: 1, alignItems: "flex-end"}]}>
                            <View style={[{width: 30, left: 0}]}>
                                <Text style={[this.style.textPercent, {right: 0, position: "absolute"}]}>{"10"}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                );
        
        return indents;
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
            translate: bindActionCreators(ActionsLang, dispatch)
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
        width: 15,
        height: 15,
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
        height: 188,
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

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, CourseCard));
