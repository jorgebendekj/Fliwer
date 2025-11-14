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
    TextInput
} = require('react-native');


//Baesed on CourseSettings.js, but more simple and generalized

import { CheckBox  } from 'react-native-elements'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconSimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import Clipboard from '@react-native-clipboard/clipboard';

import {academyCommonUtils} from '../../fliwerAcademy/academyCommonUtils.js';
import MainFliwerTopBar from '../../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../../mainFliwerMenuBar.js'
import AcademyBottomBar from '../../fliwerAcademy/academyBottomBar.js'
import * as ActionAcademy from '../../../actions/academyActions.js';
import * as ActionsLang from '../../../actions/languageActions.js';
import * as ActionGardener from '../../../actions/gardenerActions.js';
import ImageBackground from '../../imageBackground.js'
import DatePicker from '../../../widgets/datePicker/datePicker';
import FliwerGreenButton from '../../custom/FliwerGreenButton.js'
import FliwerLoading from '../../fliwerLoading.js';
import FliwerExitButton from '../../custom/FliwerExitButton2.js'
import Dropdown from '../../../widgets/dropdown/dropdown';
import FliwerMailing from '../../custom/FliwerMailing.js';
import FliwerLocationModal from '../../custom/FliwerLocationModal.js'

import {FliwerStyles} from '../../../utils/FliwerStyles.js'
import {FliwerColors, CurrentTheme} from '../../../utils/FliwerColors.js'
import {FliwerCommonUtils} from '../../../utils/FliwerCommonUtils.js'
import {fileStyles} from '../../fliwerFiles/fileStyles.js'

import moment from 'moment';
import { Redirect } from '../../../utils/router/router'
import {Orientation} from '../../../utils/orientation/orientation'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../../utils/mediaStyleSheet.js'
import {MediaPicker,FileDrop,getBase64} from '../../../utils/uploadMedia/MediaPicker.js'
import {resizeImage} from '../../../utils/resizeImage/resizeImage'
import {DocumentPicker} from '../../../utils/uploadFile/uploadFile'
import Modal from '../../../widgets/modal/modal'
import {toast} from '../../../widgets/toast/toast'
import ZoomImage from '../../../widgets/zoomImage/zoomImage.js'

import background from '../../../assets/img/homeBackground.jpg'
import emptyPicture  from '../../../assets/img/empty-picture.png'
import MainFliwerCourseBar from '../../MainFliwerCourseBar.js';

class WorkOrderSettings extends Component {
    constructor(props) {
        super(props);
        if(props.fastCreate) {
            this.addCourse();
        }
        this.state = {
            idCategory: 15,
            idCourse: this.props.match.params.idCourse,
            nextId: this.props.match.params.nextId,
            academy: this.props.academyDataReducer,
            uriImage: null,
            descriptionForm: "",
            titleForm: "",
            permissionCourse: [
                {id: 0, value: "user", isChecked: false},
                {id: 1, value: "gardener", isChecked: false},
                {id: 2, value: "angel", isChecked: false},
                {id: 3, value: "expert", isChecked: false}
            ],
            goMainScreen: false,
            gotoCourse: false,
            course: null,
            loading: false,
            initialLoading: true,
            auditedUserEmail: null,
            userData: null,
            auditing: false,
            datetime: null,
            datetimeManual: null,
            coords: null,
            visibleModalDeviceLocation: false,
            isTicket: (this.props.currentIndexAcademyCategory? (this.props.currentIndexAcademyCategory==4? 1 : 0) : 0),
            status: null,
            score: null,
            creatorEmail: "",
            clientEmail: "",
            isMailingMode: false,
            templateId: null,
            zoomImageVisible: false
        };

        this.state.status = this.state.isTicket? "pending" : "inprocess";
        

        this.state.auditing = true;

    }

    shouldComponentUpdate(nextProps, nextState) {
        //if not same idCourse than this.state.idCourse
        if (nextProps.match.params.idCourse != this.state.idCourse) {
            this.state.idCourse = nextProps.match.params.idCourse;
            this.setState({initialLoading: true});
            this.props.actions.academyActions.clearNewCourse().finally((response) => {
                this.afterComponentDidMount();
            })
            return true;
        }else return true;
    }

    componentDidMount()
    {
        var userData = this.props.sessionReducerData;
        if(this.props.gardenerUsersList){
            var aux=Object.values(this.props.gardenerUsersList).find(x=>x.user_id==this.props.gardenerCheckidUser)
            if(aux) userData=aux;
        }
        var auditedUserEmail = userData.email;
        //console.log("userData", userData);
        this.state.auditedUserEmail = auditedUserEmail;
        this.state.userData = userData;
        this.props.actions.academyActions.clearNewCourse().finally((response) => {
            this.afterComponentDidMount();
        })
        

    }

    afterComponentDidMount()
    {
        if (this.props.match.params.npage)
        {
            //console.log("this.props.match.params.npage", this.props.match.params.npage);
            this.props.actions.academyActions.cleanAcademyReducer().then((response) => {
                this.setState({gotoCourse: true, idCourse: this.props.match.params.idCourse, initialLoading: false});
            }, (error) => {
                //if(error.ok==false && error.id==21) toast.error(this.props.actions.translate.get('Academy_email_no_exist'))

                //this.setState({loading:false})
            });

        } else {
            if (this.props.newCourseReducer)
            {
                this.state.descriptionForm = this.props.newCourseReducer.description;
                this.state.titleForm = this.props.newCourseReducer.title;
                this.state.permissionCourse[0].isChecked = this.props.newCourseReducer.forUser;
                this.state.permissionCourse[1].isChecked = this.props.newCourseReducer.forGardener;
                this.state.permissionCourse[2].isChecked = this.props.newCourseReducer.forAngel;
                this.state.permissionCourse[3].isChecked = this.props.newCourseReducer.forExpert;
                //this.state.auditedUserEmail = this.props.newCourseReducer.email;
                this.state.datetime = this.props.newCourseReducer.datetime? this.props.newCourseReducer.datetime : "";
                this.state.coords = this.props.newCourseReducer.coords? this.props.newCourseReducer.coords : "";
                this.state.isTicket = this.props.newCourseReducer.isTicket? this.props.newCourseReducer.isTicket : 0;
                this.state.status = this.props.newCourseReducer.status? this.props.newCourseReducer.status : (this.state.isTicket? "pending" : "inprocess");
                this.state.score = this.props.newCourseReducer.score;
                this.setState({uriImage: this.props.newCourseReducer.image, course: this.props.newCourseReducer, initialLoading: false});

                //console.log("this.props.newCourseReducer", this.props.newCourseReducer);
            } else
            {
                if (/*this.props.academyDataReducer.length > 0 && this.props.match.params.idCategory &&*/ this.props.match.params.idCourse)
                {

                    this.props.actions.academyActions.getCourse(this.state.idCourse).then((course) => {
                        this.state.descriptionForm = course.description;
                        this.state.titleForm = course.title;
                        this.state.auditedUserEmail = course.email;
                        this.state.userData = {company_name:course.name,email:course.email};
                        this.state.permissionCourse[0].isChecked = course.forUser;
                        this.state.permissionCourse[1].isChecked = course.forGardener;
                        this.state.permissionCourse[2].isChecked = course.forAngel;
                        this.state.permissionCourse[3].isChecked = course.forExpert;
                        this.state.auditedUserEmail = course.email;
                        this.state.datetime = course.datetime? course.datetime : "";
                        this.state.coords = course.coords? course.coords : "";
                        this.state.isTicket = course.isTicket? course.isTicket : 0;
                        this.state.status = course.status? course.status : (this.state.isTicket? "pending" : "inprocess");
                        this.state.score = course.score;
                        this.setState({uriImage: course.image, course: course, initialLoading: false});
                    }, (error) => {
                        this.setState({initialLoading:false})
                    })

                }
                else
                {
                    this.setState({initialLoading: false});
                }
            }
        }

    }

    render() {

        if(this.state.initialLoading){
          return(
            <ImageBackground style={{backgroundColor:CurrentTheme.complementaryColor}} resizeMode={"cover"} loading={false}>
                {!this.props.asComponent && <MainFliwerTopBar/>}
                <FliwerLoading/>
            </ImageBackground>
          );
        } else
        {
            var sheetStyles = fileStyles.getBasicSheetStyles();

            // Set icons
            var topIcons = [];
            var bottomIcons = [];
            /*
            if (this.state.auditing) {
                if (this.state.isTicket==1)
                    topIcons.push("ticket");
                else
                    topIcons.push("audit");
                
                //No mailing for workOrderTemplate. In the future, normal workOrder can be mailed
                /*
                if (this.state.auditing && this.state.course && (this.props.roles.fliwer || this.props.roles.angel || this.props.roles.gardener))
                    topIcons.push("mailing");
                *//*
            }
            else {
                topIcons.push("course");
            }
            */
            topIcons.push("ticket");
            topIcons.push("pages");

            if (this.props.isGardener)
                bottomIcons.push("gardener");
            bottomIcons.push("zone", "files");

            // Set current icon
            var currentIcon;
            /*
            if (this.state.auditing) {
                if (this.state.isMailingMode)
                    currentIcon = "mailing";
                else {
                    if (this.state.isTicket==1)
                        currentIcon = "ticket";
                    else
                        currentIcon = "audit";
                }
            }
            else
            */
                currentIcon = "ticket";

            var showTextBar = false;
            var client = "";
            
            if (this.props.isGardener) {
                var clientObj = this.getClient();
                client = clientObj.clientName;
                showTextBar = client? true : false;
            }

            return (
                    <ImageBackground style={{backgroundColor:CurrentTheme.complementaryColor}} loading={this.state.loading}>
                        {!this.props.asComponent && <MainFliwerTopBar showTextBar={showTextBar} title={client} />}
                        {
                            this.props.fastCreate
                            ?
                                <MainFliwerCourseBar
                                idZone={null}
                                current={currentIcon} 
                                icons={topIcons} 
                                position={"top"}
                            />
                            :
                        <MainFliwerMenuBar idZone={null} current={currentIcon} icons={topIcons} position={"top"}
                            onPress={[
                                () => {
                                    console.log("settings pressed");
                                },
                                () => {
                                    this.goNextPressed();
                                }]} />
                        }
                        <ScrollView scrollEventThrottle={1000} style={{flex: 1, width: "100%", backgroundColor: CurrentTheme.complementaryColor}} contentContainerStyle={{alignSelf: "center", width: "90%",maxWidth:600}}>
                            <View style={[{padding:10}]}>
                                {this.renderPage()}
                            </View>
                        </ScrollView>
                        {this.state.gotoCourse && <Redirect push to={'/app/workOrder/templates/'+this.state.idCourse+'/pages'}/>}
                        {this.renderModalDeviceLocation()}
                        {this.renderZoomImage()}
                    </ImageBackground>
                    );
        }

    }

    renderPage() {

        var indents = [];
        /*
        if (this.state.isMailingMode && this.state.course) {
            indents.push(this.renderMailing());
        }
        else*/

        if(this.props.fastCreate){
            return (
                <View style={{width: "100%"}}>
                {indents}
            </View>
            )
        }

            indents.push(this.renderTicketAudit());

        if (!this.state.isMailingMode)
            indents.push(
                <View style={{alignSelf: "center", marginTop: 0, marginBottom: 30}}>
                    {this.renderSaveButton()}
                </View>
            );

        return (
            <View style={{width: "100%"}}>
                {indents}
            </View>
        );
    }

    renderTicketAudit()
    {
        var indents = [];

        var idTicketAudit = null; //this.state.nextId? this.state.nextId : null;
        var dts, dt;
        if (this.state.course)
        {
            idTicketAudit = this.state.course.idTicketAudit? this.state.course.idTicketAudit : null;
            if (!this.state.datetime)
            {
                dts = moment(this.state.course.createTime * 1000).format("DD-MM-YYYY HH") + ":00";
                dt = moment(dts, "DD-MM-YYYY HH:mm").toDate();
                this.state.datetime = Math.floor(dt / 1000);
            }
        }

        var clientObj = this.getClient();
        var client = clientObj.clientName;
        var clientEmail = clientObj.clientEmail;

        var creatorObj = this.getCreator();
        var creator = creatorObj.creatorName;
        var creatorEmail = creatorObj.creatorEmail;

        this.state.creatorEmail = creatorEmail;
        this.state.clientEmail = clientEmail;

        if (this.state.datetimeManual)
        {
            this.state.datetime = this.state.datetimeManual;
        }
        var datetimeText = this.state.datetime ? moment(this.state.datetime * 1000).format('DD/MM/YYYY HH:mm') : "";
        var datetimeDataPicker;
        if (this.state.datetime)
        {
            datetimeDataPicker = this.state.datetime;
        }
        else
        {
            dts = moment().format('DD-MM-YYYY HH') + ":00";
            dt = moment(dts, "DD-MM-YYYY HH:mm").toDate();
            datetimeDataPicker = Math.floor(dt / 1000);
        }
        var location = this.state.coords!==null? this.state.coords : '';

        /*
         *
         *
         *
         * START TO RENDER
         *
         *
         *
         *
         */

        /*
         * TITLE
         */
        var title;
        if(this.props.asTemplate){
            title = this.state.idCourse? "Plantilla de parte de trabajo" /*+ (idTicketAudit ? (" nº " + academyCommonUtils.getFormattedNumber(idTicketAudit, this.state.isTicket)) : "")*/
                    : "Nueva plantilla de parte de trabajo";
        }else{
            title = this.state.idCourse? "Parte de trabajo" /*+ (idTicketAudit ? (" nº " + academyCommonUtils.getFormattedNumber(idTicketAudit, this.state.isTicket)) : "")*/
                    : "Nueva parte de trabajo";
        }
        
        indents.push(
                <View style={[this.style.titleFormatContainer]}>
                    <Text style={this.style.titleFormat}>{title}</Text>
                </View>
                );

        /*
         * BASIC INFO FORM
         */
        indents.push(
            <View style={{marginTop: 10, width: "100%"}}>

                {
                    !this.props.asTemplate && <View style={{flexDirection: "row"}}>
                        <Text style={[this.style.textFormat, {width: 100}]}>{this.props.actions.translate.get('general_client')}</Text>
                        <Text style={[this.style.textFormat, {fontWeight: "bold", flex: 1}]}>{client}</Text>
                    </View>
                }
                

                {!this.props.asTemplate && <View style={this.style.lineDelimiter}></View>}

                <View style={{flexDirection: "row", marginTop: 9}}>
                    <Text style={[this.style.textFormat, {width: 100}]}>{"Creador"/*this.props.actions.translate.get('general_technician')*/}</Text>
                    <Text style={[this.style.textFormat, {fontWeight: "bold", flex: 1}]}>{creator? creator : client}</Text>
                </View>

                {
                    !this.props.asTemplate && this.state.course && this.state.course.urlUUID?[
                        (<View style={this.style.lineDelimiter}></View>),
                        (<View style={{flexDirection: "row",alignItems:"center",marginTop: 9}}>
                            <Text style={[this.style.textFormat, {width: 100}]}>{"url:"}</Text>
                            <TouchableOpacity onPress={()=>{
                                Clipboard.setString("https://my.fliwer.com/#/audit/url/"+this.state.course.urlUUID);
                                toast.notification("Url copiada al portapapeles");
                            }}>
                                <Text style={[this.style.textFormat, {fontSize:11, flex: 1}]}>{"https://my.fliwer.com/#/audit/url/"+this.state.course.urlUUID}</Text>
                            </TouchableOpacity>
                        </View>)
                    ]:null
                }

                <View style={[this.style.lineDelimiter, {marginTop: 8}]}></View>

                {!this.props.asTemplate &&
                    <View style={{marginTop: 10, flexDirection: "row"}}>
                        <Text style={[this.style.textFormat, {width: 100}, Platform.OS === 'web'? {marginTop: 12} : {marginTop: 10}]}>{this.props.actions.translate.get('general_date_time')}</Text>
                        <View key={105} style={[this.style.datePickerContainer, {flex: 1}]}>
                            <View style={[this.style.datePickerContainerIn, Platform.OS === 'ios'? {/*backgroundColor: "gray"*/} : {}]}>
                                <Text pointerEvents="none" style={[this.style.datePickerText, Platform.OS === 'web'? {} : {top: 8}, Platform.OS === 'ios'? {top: 10} : {}]}>{datetimeText}</Text>
                                <DatePicker
                                    ref={(datepicker) => this._datepicker3 = datepicker}
                                    date={moment(datetimeDataPicker * 1000).toDate()}
                                    mode="datetime"
                                    showYearDropdown={true}
                                    style={Platform.OS === 'ios'? this.style.datePickerIOS : this.style.datePicker}
                                    customStyles={{dateInput: this.style.datePicker, dateText: this.style.datePickerText}}
                                    onChange={(newValue) => {
                                        console.log("onChange date", Math.floor(new Date(newValue) / 1000));
                                        this.setState({datetimeManual: Math.floor(new Date(newValue) / 1000)});
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                } 

                {
                    !this.props.asTemplate &&
                    <View style={{marginTop: 10, flexDirection: "row"}}>
                        <Text style={[this.style.textFormat, {width: 100}, Platform.OS === 'web'? {marginTop: 12} : {marginTop: 10}]}>{this.props.actions.translate.get('Academy_location')}</Text>
                        <TouchableOpacity
                            style={{height: 40, flex: 1, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, cursor: "pointer"}}
                            onPress={()=>{
                                this.setState({visibleModalDeviceLocation: true});
                            }}>
                            <Text style={{paddingTop: 5, color: "gray"}}>{location? location : this.props.actions.translate.get('Academy_add_coordinates')}</Text>
                            {location?<TouchableOpacity
                                style={{position: "absolute", right: 5, top: 5, cursor: "pointer"}}
                                onPress={()=>{
                                    var locationPieces = location.split(",");
                                    FliwerCommonUtils.openLocationMaps(locationPieces[0], locationPieces[1]);
                                }}>
                                {false?<IconSimpleLineIcons name="location-pin" style={{color: FliwerColors.location.default, fontSize: 25}}/>:null}
                                <IconMaterialCommunityIcons name="directions" color={"blue"} size={25} style={{}} ></IconMaterialCommunityIcons>
                            </TouchableOpacity>:null}
                        </TouchableOpacity>
                    </View>
                }

                {!this.props.asTemplate &&<View style={[this.style.lineDelimiter, {marginTop: 10}]}></View>}

            </View>
        );

        /*
         * TITLE
         */
        indents.push(this.renderTitle());

        /*
         * DESCRIPTION
         */
        indents.push(this.renderDescription());

        /*
         * STATUS
         */
        if(!this.props.asTemplate){
            indents.push(
                <View style={{marginTop: 10}}>
                    <View style={{}}>
                        <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('general_state')}</Text>
                    </View>
                    <View style={[this.style.selectContainer, {width: 200}]}>
                        <Dropdown
                            modal={true}
                            placeholder={"Selecciona un estado"}
                            selectedValue={this.state.status}
                            style={{}}
                            styleOptions={{}} options={this.printStatus()} onChange={(value) => {
                            this.setState({status: value})
                        }} />
                    </View>
                </View>
            );
        }

        // Bottom delimiter
        indents.push(
            <View style={[this.style.lineDelimiter, {marginTop: 10, marginBottom: 10}]}></View>
        );

        return indents;
    }

    renderTitle() {
        return (
            <View style={{marginTop: 20}}>
                <View style={{}}>
                    <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_title')}</Text>
                </View>
                <View style={{width: "100%"}}>
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4,color:CurrentTheme.primaryText}}
                        onChangeText={(text) => {
                            this.setState({titleForm: text})
                        }}
                        value={this.state.titleForm}
                        maxLength={200}
                        />
                </View>
            </View>
            );
    }

    renderDescription() {
        return (
            <View style={{marginTop: 10}}>
                <View style={{}}>
                    <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_description')}</Text>
                </View>
                <View style={{width: "100%"}}>
                    <TextInput
                        style={{minHeight: 150, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, color: CurrentTheme.primaryText}}
                        onChangeText={(text) => {
                            this.setState({descriptionForm: text})
                        }}
                        value={this.state.descriptionForm}
                        maxLength={1000}
                        multiline
                        />
                </View>
            </View>
            );
    }

    renderZoomImage() {

        if (this.state.uriImage && this.state.zoomImageVisible)
            return (
                <ZoomImage
                    visible={this.state.zoomImageVisible}
                    source={this.state.uriImage}
                    onClose={() => {
                        this.setState({zoomImageVisible: false});
                    }}
                />
            );
    }

    renderImage() {

        return (
            <View style={[{marginTop: 30, alignItems: "center"}]}>
                <TouchableOpacity style={[this.style.pictureImageTouchable]} activeOpacity={1} onPress={() => {
                    this.getPhotos()
                }}>
                    <Image source={this.state.uriImage? {uri: this.state.uriImage} : emptyPicture} resizeMode={"cover"} style={this.style.buttonImageIn}/>
                    {this.renderInputFile("image")}
                    {this.state.uriImage?<TouchableOpacity style={this.style.zoomImage}
                        onPress={() => {
                            this.setState({zoomImageVisible: true});
                        }}>
                            <IconFeather name="zoom-in" size={30} style={{color: "white"}}/>
                    </TouchableOpacity>:null}
                </TouchableOpacity>
            </View>
            );
    }

    printStatus() {
        if (this.state.isTicket)
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

    renderModalDeviceLocation() {

        if (!this.state.visibleModalDeviceLocation)
            return null;

        return (
                <FliwerLocationModal
                    onClose={() => {
                        this.setState({visibleModalDeviceLocation: false});
                    }}
                    onAccept={(coords, accuracy) => {
                        this.setState({visibleModalDeviceLocation: false, coords: coords});
                    }}
                    loadingModal={this.state.loading}
                    setLoading={this.setLoading()}
                    coords={this.state.coords}
                />
        );
    }

    renderInputFile(typeAccepted) {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => this.fileInput = fileInput} style={this.style.fileInput} type="file" accept={typeAccepted ? typeAccepted + "/*" : ""} />);
    }

    renderSaveButton()
    {
        if (this.props.roles.fliwer || this.props.roles.angel || this.props.roles.gardener) {
            var saveButtonText = this.state.isMailingMode? this.props.actions.translate.get('Mailing_save_template') : this.props.actions.translate.get('general_save');
            return(
                <FliwerGreenButton
                    text={saveButtonText}
                    style={FliwerStyles.fliwerGreenButtonStyle}
                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 150}, this.state.isMailingMode? {marginTop: -60, marginBottom: 20} : {}]}
                    onPress={() => {

                        this.saveWorkOrder();
                    }}/>
            );
        }
    }

    renderMailing() {

        var idEmailTemplate = this.state.templateId? this.state.templateId : this.state.course.idEmailTemplate;
        var idTicketAudit = this.state.course.idTicketAudit? this.state.course.idTicketAudit : null;
        var gral_ticket = this.props.actions.translate.get('general_ticket').toUpperCase();
        var gral_audit = this.props.actions.translate.get('general_audit').toUpperCase();
        var title = (this.state.isTicket==1? gral_ticket : gral_audit) + (idTicketAudit ? (" nº " + academyCommonUtils.getFormattedNumber(idTicketAudit, this.state.isTicket)) : "");
        var assignQuestionAsDefault = this.props.actions.translate.get('Mailing_question_assign_as_default');
        var assignSubtitleQuestionAsDefault;
        if (this.state.isTicket==1)
            assignSubtitleQuestionAsDefault = this.props.actions.translate.get('Mailing_using_template_when_new_ticket');
        else
            assignSubtitleQuestionAsDefault = this.props.actions.translate.get('Mailing_using_template_when_new_audit');

        var clientObj = this.getClient();
        var clientEmail = clientObj.clientEmail;

        return (
                <FliwerMailing
                    ref={(fliwerMailing) => this._fliwerMailing = fliwerMailing}
                    title={title}
                    to={clientEmail}
                    type={this.state.isTicket==1? "ticket" : "audit"}
                    assignTo={idTicketAudit}
                    assignQuestionAsDefault={assignQuestionAsDefault}
                    assignSubtitleQuestionAsDefault={assignSubtitleQuestionAsDefault}
                    assignTemplateText={""}
                    assignedTemplate={this.state.course.idEmailTemplate}
                    idEmailTemplate={idEmailTemplate}
                    emailHistory={this.state.course.emailHistory}
                    onSentEmail={(templateId, emailHistory) => {
                        if (templateId)
                            this.state.templateId = templateId;
                        if (emailHistory)
                            this.state.course.emailHistory = emailHistory;
                    }}
                    onSuccess={(templateId, assignTemplateChanged, assignedTemplateId, emailHistory) => {
                        if (templateId)
                            this.state.templateId = templateId;
                        if (assignTemplateChanged)
                            this.state.course.idEmailTemplate = assignedTemplateId;
                        if (emailHistory)
                            this.state.course.emailHistory = emailHistory;
                        this.setState({isMailingMode: false});
                    }}
                    onCancel={() => {
                        this.setState({isMailingMode: false});
                    }}
                    setLoading={this.setLoading()}
                    addSaveButton={true}
                />
            );
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({loading: loading});
        };
    }

    getClient()
    {
        return {
            clientName: this.state.userData.company_name?this.state.userData.company_name:(this.state.userData.first_name+(this.state.userData.last_name?" "+this.state.userData.last_name:"")),
            clientEmail: this.state.userData.email
        };
    }

    getCreator()
    {
        var creator = "";
        var creatorEmail = "";

        if (this.state.course && this.state.course.creator) {
            creator += this.state.course.creator.first_name;
            if (this.state.course.creator.last_name)
            {
                creator += " " + this.state.course.creator.last_name;
            }
            creatorEmail = this.state.course.creator.email;
        }

        if (!creator)
        {
            creator += this.props.sessionReducerData.first_name;
            if (this.props.sessionReducerData.last_name)
            {
                creator += " " + this.props.sessionReducerData.last_name;
            }
            creatorEmail = this.props.sessionReducerData.email;
        }

        return {
            creatorName: creator,
            creatorEmail: creatorEmail
        };
    }

    saveWorkOrder()
    {

        if (!this.props.asTemplate && !this.state.datetime)
        {
            toast.error("Por favor, indica la Fecha y Hora");
            return;
        }

        if (!this.props.asTemplate && this.state.coords && !FliwerCommonUtils.isValidCoordinates(this.state.coords))
        {
            //In the future, the coord will be taken automatically
            toast.error("Las coordenadas indicadas no son correctas");
            return;
        }

        if (!this.state.titleForm)
        {
            toast.error(this.props.actions.translate.get('Academy_fill_title'));
            return;
        }

        if (!this.state.descriptionForm)
        {
            toast.error(this.props.actions.translate.get('Academy_fill_description'));
            return;
        }

        var gardenerUsersList = Object.values(this.props.gardenerUsersList)
        var found = gardenerUsersList.find((n) => {
            return n.email.toUpperCase() == this.state.auditedUserEmail.toUpperCase();
        });

        if (this.state.idCourse && this.state.idCourse!="false")
            this.modifyCourse();
        else
            this.addCourse();
    }

    goBackPressed()
    {
        if (this.state.pageNumber > 0)
        {
            this.setState({gotoCourse: true})
        } else
        {
            //toast.error("first page");
            this.setState({goMainScreen: true})
        }
    }

    goNextPressed()
    {
        this.saveWorkOrder(true);
    }

    async addCourse(nextButtonIsPressed)
    {
        this.setState({loading: true});

        var newCourse = {};

        newCourse.title = this.props.fastCreate ? 'Nueva plantilla' : this.state.titleForm;
        newCourse.description = this.props.fastCreate ? 'Nueva plantilla' :  this.state.descriptionForm;
        newCourse.datetime = this.state?.datetime || null;
        newCourse.coords = this.state?.coords || null;

        var response;

        try{
            if(this.props.asTemplate)
                response= await this.props.actions.academyActions.addWorkOrderTemplate(newCourse);
            else 
            response= await this.props.actions.academyActions.addWorkOrder(newCourse);
                
            this.setState({loading:false,gotoCourse:true,idCourse:response.id});
        }catch(err){
            toast.error(err.reason)
            this.setState({loading:false});
        }

    }


    async modifyCourse(nextButtonIsPressed)
    {

        //console.log("modifyCourse", nextButtonIsPressed, this.state.idCourse);
        var newCourse = {};
        newCourse.title = this.state.titleForm;
        newCourse.description = this.state.descriptionForm;
        newCourse.datetime = this.state.datetime;
        newCourse.coords = this.state.coords;

        if (this.state.idCourse) {
            newCourse.pages = this.state.course.pages; //when modify
            newCourse.creator = this.state.course.creator;
            newCourse.createTime = this.state.course.createTime;
            newCourse.idTicketAudit = this.state.course.idTicketAudit;
        }
        else
            newCourse.pages = []; //when add

        this.setState({loading: true})
        try{
            if(this.props.asTemplate)
                await this.props.actions.academyActions.updateWorkOrderTemplate(this.state.idCourse,newCourse);
            else
                await this.props.actions.academyActions.updateWorkOrder(this.state.idCourse,newCourse);

            this.setState({loading: false,gotoCourse:true,idCourse:this.state.idCourse});
        }catch(err){
            toast.error(err.reason)
            this.setState({loading:false});
        }

    }

    changePermissionsValue(i, permissionCourse) {
        return () => {
            permissionCourse[i].isChecked = !permissionCourse[i].isChecked;
            this.setState({permissionCourse: permissionCourse})
        }
    }

    getPhotos() {
        const options = {
            fileInput: this.fileInput
        };

        MediaPicker.openPicker(options).then((response)=>{
          if(!response || response.didCancel){
            console.log('User cancelled image picker');
          }else{

            var path = response.path? response.path : response.uri;

            this.setState({loading: true})
            resizeImage.resize(Platform.OS === 'web' ? this.fileInput.files[0] : response.base64, path).then((resultImage) => {
                this.setState({dragging: false, uriImage: resultImage});
                this.setState({loading: false})
            }, (error) => {
                this.setState({loading: false})
            });

          }
        },()=>{console.log("Error gathering image");});

    }
};

function mapStateToProps(state, props) {
    return {
        academyDataReducer: state.academyReducer.data,
        newCourseReducer: state.academyReducer.newCourse,
        roles: state.sessionReducer.roles,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        sessionReducerData: state.sessionReducer.data,
        isGardener: state.sessionReducer.isGardener,
        gardenerUsersList: state.gardenerReducer.usersListData,
        currentIndexAcademyCategory: state.academyReducer.currentIndexAcademyCategory
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
        }
    }
}

var style = {
    titleFormatContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 20,
        marginTop: 10,
    },
    titleFormat: {
        fontFamily: FliwerColors.fonts.title,
        color: "@theme primaryText",
        fontSize: 26,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    textFormat: {
        fontFamily: FliwerColors.fonts.regular,
        color: "@theme primaryText",
    },
    buttonImageIn: {
        width: 220,
        height: 220,
        backgroundColor: "white",
        borderRadius: 15
    },
    pictureImageTouchable: {
        width: 220
    },
    fileInput: {
        display: "none" //display: "none" only works on web
    },
    inputContainer: {
        height: 40,
        width: "100%",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRadius: 4,
        borderColor: "gray"
    },
    datePickerContainer: {
        height: 40,
        marginBottom: 0,
        borderRadius: 4,
        borderColor: "gray",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    datePickerContainerIn: {
        height: "100%",
        flexGrow: 1,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: "gray",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    datePicker: {
        width: "100%",
        height: "100%",
        borderRadius: 4,
        borderWidth: 0,
        paddingLeft: 5,
        alignItems: "flex-start",
        opacity: 0
    },
    datePickerText: {
        position: "absolute",
        width: "100%",
        top: 12,
        display: "flex",
        alignItems: "center",
        paddingLeft: 6
    },
    datePickerIOS: {
//        position: "absolute",
//        width: "100%",
//        height: "100%",
//        overflow: "hidden"
    },
    lineDelimiter: {
        height: 1,
        width: "100%",
        marginTop: 5,
        borderBottomColor: FliwerColors.secondary.gray,
        borderBottomWidth: 1
    },
    selectContainer: {
        height: 40,
        width: "100%",
        marginBottom: 10,
        borderRadius: 4,
        position: "relative",
        zIndex: 1
    },
    select: {
        width: "100%",
        position: "relative",
        zIndex: 1,
        alignItems: "center"
    },
    exitButton: {
        right: -35, top: -15
    },
    zoomImage: {
        position: "absolute",
        top: 5, right: 5,
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center"
    },
    ":hover": {
        gpsIconTouchable: {
            filter: "contrast(50%)"
        },
        editIconTouchable: {
            filter: "contrast(50%)"
        },
    },
    "@media (width<=500)": {
        pageWrapper: {
            paddingLeft: 20, paddingRight: 20
        },
        exitButton: {
            right: -15
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, WorkOrderSettings));
