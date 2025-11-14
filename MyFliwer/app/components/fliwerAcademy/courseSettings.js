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

import { CheckBox  } from 'react-native-elements'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconSimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import Clipboard from '@react-native-clipboard/clipboard';

import {academyCommonUtils} from './academyCommonUtils.js';
import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import AcademyBottomBar from './academyBottomBar.js'
import * as ActionAcademy from '../../actions/academyActions.js';
import * as ActionsLang from '../../actions/languageActions.js';
import * as ActionGardener from '../../actions/gardenerActions.js';
import ImageBackground from '../../components/imageBackground.js'
import DatePicker from '../../widgets/datePicker/datePicker';
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerLoading from '../../components/fliwerLoading';
import FliwerExitButton from '../../components/custom/FliwerExitButton2.js'
import Dropdown from '../../widgets/dropdown/dropdown';
import FliwerMailing from '../custom/FliwerMailing';
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerLocationModal from '../custom/FliwerLocationModal.js'

import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import {fileStyles} from '../fliwerFiles/fileStyles'

import moment from 'moment';
import { Redirect,withRouter } from '../../utils/router/router'
import {Orientation} from '../../utils/orientation/orientation'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {MediaPicker,FileDrop,getBase64} from '../../utils/uploadMedia/MediaPicker'
import {resizeImage} from '../../utils/resizeImage/resizeImage'
import {DocumentPicker} from '../../utils/uploadFile/uploadFile'
import Modal from '../../widgets/modal/modal'
import {toast} from '../../widgets/toast/toast'
import ZoomImage from '../../widgets/zoomImage/zoomImage.js'

import background from '../../assets/img/homeBackground.jpg'
import emptyPicture  from '../../assets/img/empty-picture.png'

class CourseSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idCategory: this.props.match.params.idCategory,
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
            modalDeleteVisible: false,
            zoomImageVisible: false
        };

        this.state.status = this.state.isTicket? "pending" : "inprocess";

        var n = this.props.location.pathname.indexOf("audit");
        if (n != -1)
        {
            this.state.auditing = true;
        }

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
        this.afterComponentDidMount();

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
                if (this.props.academyDataReducer.length > 0 && this.props.match.params.idCategory && this.props.match.params.idCourse)
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

        if (this.props.academyDataReducer.length == 0 || this.state.goMainScreen) {
            this.state.goMainScreen = false;
            if (this.state.auditing)
            {
                return (<Redirect push to={"/files/"} />)
            } else {
                return (<Redirect push to={"/academyCourses/"}/>)
            }

        } else if (this.state.gotoCourse) {
            this.setState({gotoCourse: false})
            if (this.state.auditing)
            {
                return (<Redirect push to={"/audit/" + this.state.idCourse} />)
            } else {
                return (<Redirect push to={"/academyCourses/" + this.state.idCourse} />)
            }

        } else if(this.state.initialLoading){
          return(
            <ImageBackground source={background} resizeMode={"cover"} loading={false}>
              <MainFliwerTopBar/>
              <FliwerLoading/>
            </ImageBackground>
          );
        } else
        {
            var sheetStyles = fileStyles.getBasicSheetStyles();

            // Set icons
            var topIcons = [];
            var bottomIcons = [];
            if (this.state.auditing) {
                if (this.state.isTicket==1)
                    topIcons.push("ticket");
                else
                    topIcons.push("audit");

                if (this.state.auditing && this.state.course && (this.props.roles.fliwer || this.props.roles.angel || this.props.roles.gardener))
                    topIcons.push("mailing");
            }
            else {
                topIcons.push("course");
            }
            topIcons.push("pages");

            if (this.props.isGardener)
                bottomIcons.push("gardener");
            bottomIcons.push("zone", "files");

            // Set current icon
            var currentIcon;
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
                currentIcon = "course";

            var showTextBar = false;
            var client = "";
            
            if (this.props.isGardener) {
                var clientObj = this.getClient();
                client = clientObj.clientName;
                showTextBar = client? true : false;
            }

            return (
                    <ImageBackground loading={this.state.loading}>
                        <MainFliwerTopBar showTextBar={showTextBar} title={client} />
                        <MainFliwerMenuBar idZone={null} current={currentIcon} icons={topIcons} position={"top"}
                            onPressPages={() => {
                                this.goNextPressed();
                            }}
                            onPressMailing={() => {
                                this.setState({isMailingMode: !this.state.isMailingMode});
                            }} />
                        <ScrollView scrollEventThrottle={1000} style={{flex: 1, width: "100%", backgroundColor: "#F0F0F0"}} contentContainerStyle={{alignSelf: "center"}}>
                        <View style={[fileStyles.pageWrapper, this.style.pageWrapper, {
                                width: sheetStyles.maxWidth,
                                marginTop: sheetStyles.marginTop,
                                marginBottom: sheetStyles.marginBottom
                            }]}>
                                {this.renderPage()}
                            </View>
                        </ScrollView>
                        {false?<AcademyBottomBar barContainerCustomStyle={{position: "absolute", bottom: 0}} goMainScreen={() => {
                                this.setState({goMainScreen: true})
                            }} actualScreen={this.state.pageNumber + 1}
                            totalScreens={this.state.totalPages}
                            arrowLeft={() => {
                                this.goBackPressed();
                            }} arrowRight={() => {
                                this.goNextPressed();
                            }} hasNext={true} />:null}
                        <MainFliwerMenuBar idZone={null} current={null} icons={bottomIcons} />
                        {this.renderModalDeviceLocation()}
                        <FliwerDeleteModal
                            visible={this.state.modalDeleteVisible}
                            onClose={() => {
                                this.setState({modalDeleteVisible: false})
                            }}
                            onConfirm={() => {
                                this.deleteCourse();
                            }}
                            title={this.props.actions.translate.get('general_are_you_sure_you_want_to_delete_it_female')}
                            hiddeText={true}
                            password={false}
                            />
                        {this.renderZoomImage()}
                    </ImageBackground>
                    );
        }

    }

    renderPage() {

        var indents = [];
        if (this.state.auditing) {
            if (this.state.isMailingMode && this.state.course) {
                indents.push(this.renderMailing());
            }
            else
                indents.push(this.renderTicketAudit());
        }
        else
            indents.push(this.renderCourse());

        if (!this.state.isMailingMode)
            indents.push(
                <View style={{alignSelf: "center", marginTop: 0, marginBottom: 30}}>
                    {this.renderSaveButton()}
                </View>
            );

        return (
            <View style={{width: "100%"}}>
                {indents}
                <FliwerExitButton onPress={()=>{
                        this.setState({goMainScreen: true});
                    }} containerStyle={this.style.exitButton} />
                {this.renderDeleteButton()}
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
        var title = (this.state.nextId? (this.props.actions.translate.get('general_new_male') + " ") : "") + (this.state.isTicket==1? this.props.actions.translate.get('general_ticket') : this.props.actions.translate.get('general_audit')) + (idTicketAudit ? (" nº " + academyCommonUtils.getFormattedNumber(idTicketAudit, this.state.isTicket)) : "");
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

                <View style={{flexDirection: "row"}}>
                    <Text style={[this.style.textFormat, {width: 100}]}>{this.props.actions.translate.get('general_client')}</Text>
                    <Text style={[this.style.textFormat, {fontWeight: "bold", flex: 1}]}>{client}</Text>
                </View>

                <View style={this.style.lineDelimiter}></View>

                <View style={{flexDirection: "row", marginTop: 9}}>
                    <Text style={[this.style.textFormat, {width: 100}]}>{this.props.actions.translate.get('general_technician')}</Text>
                    <Text style={[this.style.textFormat, {fontWeight: "bold", flex: 1}]}>{creator? creator : client}</Text>
                </View>

                {
                    this.state.course && this.state.course.urlUUID?[
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

                <View style={[this.style.lineDelimiter, {marginTop: 10}]}></View>

            </View>
        );

        /*
         * IMAGE
         */
        indents.push(this.renderImage());

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

        // Bottom delimiter
        indents.push(
            <View style={{width: "100%", height: 50}}></View>
        );

        return indents;
    }

    renderCourse() {
        var indents = [];

        indents.push(
                <View style={[this.style.titleFormatContainer]}>
                    <Text style={this.style.titleFormat}>{this.props.actions.translate.get('Academy_course_settings')}</Text>
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
         * IMAGE
         */
        indents.push(this.renderImage());


        indents.push(
                <View style={{marginTop: 30, marginBottom: 10}}>
                    <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_available') + ":"}</Text>
                </View>
                )

        var permissionCourse = [].concat(this.state.permissionCourse)

        for (var i in permissionCourse)
        {
            indents.push(
                    <View style={{flexDirection: "row", marginLeft: 30, marginTop: 8, alignItems: "center"}}>
                        <CheckBox
                            title={permissionCourse[i].value}
                            textStyle={{}}
                            containerStyle={{backgroundColor: "transparent", borderWidth: 0, marginTop: -4}}
                            checked={this.state.permissionCourse[i].isChecked? true : false}
                            onPress={this.changePermissionsValue(i, permissionCourse)}
                        />
                    </View>
                    );
        }

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
                        style={{height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4}}
                        onChangeText={(text) => {
                            this.setState({titleForm: text})
                        }}
                        value={this.state.titleForm}
                        maxLength={30}
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
                        style={{height: 80, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4}}
                        onChangeText={(text) => {
                            this.setState({descriptionForm: text})
                        }}
                        value={this.state.descriptionForm}
                        maxLength={this.state.auditing ? 175 : 81}
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

                        if (this.state.auditing && (this.state.isMailingMode && this.state.course))
                            this._fliwerMailing.onSaveButtonPress();
                        else
                            this.saveCourse(this.state.idCourse? false : true);
                    }}/>
            );
        }
    }

    renderDeleteButton()
    {

        if (this.state.course && this.state.auditing && !this.state.isMailingMode && (this.props.roles.fliwer || this.props.roles.angel || this.props.roles.gardener))
            return(
                <TouchableOpacity style={this.style.deleteButtonWrapper} onMouseEnter={this.hoverIn('deleteButton')} onMouseLeave={this.hoverOut('deleteButton')}
                    onPress={() => {
                        this.setState({modalDeleteVisible: true});
                    }}>
                    <IconFontAwesome style={this.style.deleteButton} name="trash-o" size={25} />
                </TouchableOpacity>
            );
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

    saveCourse(nextButtonIsPressed)
    {
        //console.log("saveCourse", nextButtonIsPressed, this.state.idCourse);

        if (!this.state.datetime && this.state.auditing)
        {
            toast.error("Por favor, indica la Fecha y Hora");
            return;
        }

        if (this.state.coords && !FliwerCommonUtils.isValidCoordinates(this.state.coords))
        {
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

        if (!this.state.uriImage)
        {
            toast.error(this.props.actions.translate.get('Academy_select_image'));
            return;
        }

        if (this.state.auditing)
        {
            if (!this.state.auditedUserEmail)
            {
                toast.error(this.props.actions.translate.get('Academy_enter_audited_email'));
                return;
            }

            var gardenerUsersList = Object.values(this.props.gardenerUsersList)
            var found = gardenerUsersList.find((n) => {
                return n.email.toUpperCase() == this.state.auditedUserEmail.toUpperCase();
            });

             // De moment no ens podem crear incidencies o tickets quan creator i client és el mateix. Està xapat en el server. Retorna: {ok: false, id: 21, reason: "Usuario no encontrado"}
            if (found || this.props.sessionReducerData.email.toUpperCase()==this.state.auditedUserEmail.toUpperCase() || this.props.roles.fliwer || this.props.roles.angel/* ||
               (this.state.creatorEmail && this.state.clientEmail && this.state.creatorEmail == this.state.clientEmail)*/)
            {
                if (this.state.idCourse)
                    this.modifyCourse(nextButtonIsPressed);
                else
                    this.addCourse(nextButtonIsPressed);
            } else {
                toast.error(this.props.actions.translate.get('Academy_your_user_gardener'));
            }


        } else {
            if (this.state.idCourse)
                this.modifyCourse(nextButtonIsPressed);
            else
                this.addCourse(nextButtonIsPressed);
        }
    }

    updateCourse()
    {
        if (!this.state.datetime && this.state.auditing)
        {
            toast.error("Por favor, indica la Fecha y Hora");
            return;
        }

        if (this.state.coords && !FliwerCommonUtils.isValidCoordinates(this.state.coords))
        {
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

        if (!this.state.uriImage)
        {
            toast.error(this.props.actions.translate.get('Academy_select_image'));
            return;
        }

        if (this.state.auditing)
        {
            if (!this.state.auditedUserEmail)
            {
                toast.error(this.props.actions.translate.get('Academy_enter_audited_email'));
                return;
            }

            var gardenerUsersList = Object.values(this.props.gardenerUsersList)
            var found = gardenerUsersList.find((n) => {
                return n.email.toUpperCase() == this.state.auditedUserEmail.toUpperCase()
            });

             // De moment no ens podem crear incidencies o tickets quan creator i client és el mateix. Està xapat en el server. Retorna: {ok: false, id: 21, reason: "Usuario no encontrado"}
            if (found || this.props.roles.fliwer || this.props.roles.angel/* ||
               (this.state.creatorEmail && this.state.clientEmail && this.state.creatorEmail == this.state.clientEmail)*/)
            {
                this.updateCourseFunction();
            } else {
                toast.error(this.props.actions.translate.get('Academy_your_user_gardener'));
            }

        } else {
            this.updateCourseFunction();
        }
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
        this.saveCourse(true);
    }

    addCourse(nextButtonIsPressed)
    {
        var newCourse = {};
        newCourse.title = this.state.titleForm;
        newCourse.description = this.state.descriptionForm;
        newCourse.image = this.state.uriImage;
        newCourse.idCategory = parseInt(this.state.idCategory);
        newCourse.forUser = this.state.permissionCourse[0].isChecked;
        newCourse.forGardener = this.state.permissionCourse[1].isChecked;
        newCourse.forAngel = this.state.permissionCourse[2].isChecked;
        newCourse.forExpert = this.state.permissionCourse[3].isChecked;
        newCourse.email = this.state.auditedUserEmail;
        newCourse.datetime = this.state.datetime;
        newCourse.coords = this.state.coords;
        newCourse.isTicket = this.state.isTicket;
        newCourse.status = this.state.status;
        newCourse.score = this.state.score;
        newCourse.pages = [];

        this.setState({loading: true});
        this.props.actions.academyActions.updateNewCourse(newCourse).then((response) => {

            this.props.actions.academyActions.addCourse(newCourse).then((response) => {

//                if (this.state.auditing) {
//                    if (response.sentEmail) {
//
//                    }
//                }

                if (nextButtonIsPressed)
                    this.setState({gotoCourse: true, idCourse: response.id, loading: false});
                else
                    this.setState({goMainScreen: true, idCourse: response.id, loading: false})

            }, (error) => {
                if (error.ok == false && error.id == 21)
                    toast.error(this.props.actions.translate.get('Academy_email_no_exist'))

                this.setState({loading: false})
            });
        });

    }

    deleteCourse() {
        this.setState({loading: true});
        this.props.actions.academyActions.deleteCourse(this.state.idCourse).then((response) => {
            this.setState({goMainScreen: true, loading: false});
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
            this.setState({loading: false});
        });

    }

    updateCourseFunction()
    {
        var updateCourse = {}
        updateCourse.title = this.state.titleForm;
        updateCourse.description = this.state.descriptionForm;
        updateCourse.image = this.state.uriImage;
        updateCourse.forUser = this.state.permissionCourse[0].isChecked;
        updateCourse.forGardener = this.state.permissionCourse[1].isChecked;
        updateCourse.forAngel = this.state.permissionCourse[2].isChecked;
        updateCourse.forExpert = this.state.permissionCourse[3].isChecked;
        updateCourse.email = this.state.auditedUserEmail;
        updateCourse.pages = (this.state.course && this.state.course.pages)? this.state.course.pages : [];
        updateCourse.datetime = this.state.datetime;
        updateCourse.coords = this.state.coords;
        updateCourse.isTicket = this.state.isTicket;
        updateCourse.status = this.state.status;
        updateCourse.score = this.state.score;

        this.setState({loading: true});

        this.props.actions.academyActions.modifyCourse(this.state.idCourse, updateCourse).then((response) => {

            //console.log("updateCourseFunction response.course", response.course);
            toast.notification(this.getSavedText());

            //this.setState({goMainScreen: true, loading: false});
            this.setState({loading: false});

        }, (error) => {
            if (error.ok == false && error.id == 21)
                toast.error(this.props.actions.translate.get('Academy_email_no_exist'))
            this.setState({loading: false});
        });

    }

    getSavedText() {
        if (this.state.auditing)
        {
            if (this.state.isTicket==1)
                return this.props.actions.translate.get('Files_incident_saved_succesfully');
            else
                return this.props.actions.translate.get('Files_audit_saved_succesfully');
        }
        else
        {
            return this.props.actions.translate.get('Files_course_saved_succesfully');
        }
    }

    modifyCourse(nextButtonIsPressed)
    {

        //console.log("modifyCourse", nextButtonIsPressed, this.state.idCourse);

        var newCourse = {};
        newCourse.title = this.state.titleForm;
        newCourse.description = this.state.descriptionForm;
        newCourse.image = this.state.uriImage;
        newCourse.forUser = this.state.permissionCourse[0].isChecked;
        newCourse.forGardener = this.state.permissionCourse[1].isChecked;
        newCourse.forAngel = this.state.permissionCourse[2].isChecked;
        newCourse.forExpert = this.state.permissionCourse[3].isChecked;
        newCourse.email = this.state.auditedUserEmail;
        newCourse.datetime = this.state.datetime;
        newCourse.coords = this.state.coords;
        newCourse.isTicket = this.state.isTicket;
        newCourse.status = this.state.status;
        newCourse.score = this.state.score;

        if (this.state.idCourse) {
            newCourse.pages = this.state.course.pages; //when modify
            newCourse.creator = this.state.course.creator;
            newCourse.createTime = this.state.course.createTime;
            newCourse.idTicketAudit = this.state.course.idTicketAudit;
        }
        else
            newCourse.pages = []; //when add

        this.setState({loading: true})
        this.props.actions.academyActions.updateNewCourse(newCourse).then((response) => {
            if (nextButtonIsPressed)
                this.setState({gotoCourse: true, loading: false});
            else
                this.updateCourseFunction();
        });

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
        color: FliwerColors.primary.black,
        fontSize: 26,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    textFormat: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
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
    deleteButtonWrapper: {
        position: "absolute",
        bottom: 20,
        right: -20
    },
    deleteButton: {
        color: "red"
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
        deleteButton: {
            filter: "brightness(115%)"
        }
    },
    "@media (width<=500)": {
        pageWrapper: {
            paddingLeft: 20, paddingRight: 20
        },
        exitButton: {
            right: -15
        },
        deleteButtonWrapper: {
            right: 0
        }
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, CourseSettings)));
