'use strict';

import React, { Component } from 'react';
var { View, Text, Image, TouchableOpacity, Platform } = require('react-native');

import FliwerCard from '../../custom/FliwerCard.js'
import FliwerCarousel from '../../custom/FliwerCarousel'
import FliwerImage from '../../custom/FliwerImage.js'
import FastImage from '../../custom/FastImage'
import FliwerCalmButton from '../../custom/FliwerCalmButton.js'
import Dropdown from '../../../widgets/dropdown/dropdown';

import { mediaConnect, MediaInfo } from '../../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import * as ActionGardener from '../../../actions/gardenerActions.js'; //Import your actions
import * as ActionsAcademy from '../../../actions/academyActions.js';

import { Redirect } from '../../../utils/router/router'

import { FliwerColors,CurrentTheme } from '../../../utils/FliwerColors.js'
import { FliwerAlertMedia } from '../../../utils/FliwerAlertMedia.js'
import {toast} from '../../../widgets/toast/toast'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../../actions/createZoneActions.js'; //Import your actions
import * as ActionsWrapper from '../../../actions/wrapperActions.js'; //Import your actions

import homeIcon from '../../../assets/img/5_House.png'

import noImageBG from '../../../assets/img/1_bg_task.jpg'
import rainolveNoImageBG from '../../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

//import trashIcon  from '../../assets/img/9-Configuration.png'
import trashImage from '../../../assets/img/trash.png'
import turn3 from '../../../assets/img/3_Turn3.png'
import turn4 from '../../../assets/img/3_Turn4.png'
import FrontLayerWrapper from '../../frontLayerWrapper.js';
import FliwerDeleteModal from '../../custom/FliwerDeleteModal.js';

class EmployeeAssignCard extends Component {

    constructor(props) {
        super(props);
        
        var emp =  this.props.employees && this.props.employees.find?this.props.employees.find((employee) => employee.idUser == this.props.idUser):null;

        if(!emp && this.props.data.user_id == this.props.idUser){
            emp = this.props.data;
            emp.image=emp.photo_url;
        }
        this.state = {
            employee: emp? emp : (this.props.cardData?this.props.cardData:{}),
            renderDeleteModal:false
        }
        
        this.card= React.createRef();
    }

    componentWillReceiveProps(nextProps) {
        //remount emp from constructor with nextProps and compare this.state.employee
        var emp =  nextProps.employees && nextProps.employees.find?nextProps.employees.find((employee) => employee.idUser == nextProps.idUser):null;

        if(!emp && nextProps.data.user_id == nextProps.idUser){
            emp = nextProps.data;
            emp.image=emp.photo_url;
        }

        if(JSON.stringify(this.state.employee) != JSON.stringify(emp)){
            this.setState({
                employee: emp? emp : (nextProps.cardData?nextProps.cardData:{})
            });
        }
    }

    componentDidUpdate(prevProps){
        var employee = this.state.employee;
        if(!prevProps?.deletingItem && this.props.deletingItem){
            if(this.props.deletingItem == (employee?.workOrderTemplates && employee?.workOrderTemplates[0]?.idCourse)){
                this.setState({renderDeleteModal: true});
            }
            this.props.enDeleteItem();
        }
    }

    render() {

        var indents=[];

        if(this.state.goBack){
            indents.push(<Redirect push to={"/app/workOrder/assignTemplate"} />)
        }

        indents.push(
            <FliwerCard ref={this.card} key={"employee_" + this.state.employee.idUser} touchableFront={false} touchableBack={true}
                cardStyle={!this.props.onPressAdd ? {} : { opacity: (Platform.OS == "android" ? 0.6 : 0.4) }}
                unfocused={this.props.unfocused}
            >
                <View>
                    <View style={[this.style.frontCard,this.props.styleCard]}
                        onLayout={(event) => {
                            this.setState({ layout: event.nativeEvent.layout })
                        }}>
                        {this.renderCardFront()}
                        {this.renderDeleteModal()}
                    </View>
                </View>
            </FliwerCard>
        )

        return indents;
    }

    getTemplateOptions(){
        var options = [];

        options.push({label:"Sin plantilla especifica",value:null});

        this.props.templates.forEach((template) => {
            options.push({label:template.title,value:template.id});
        });

        options.push({label:"Nueva plantilla",value:'new'});

        return options;
    }

    renderCardFront() {
    var card = [];

    var employee = this.state.employee;
    if(!employee.idUser)employee.idUser=employee.user_id;
    
    if(!employee || !employee.idUser) return null;

    var employTemplateSoftId ="";

    if(employee.workOrderTemplates && employee.workOrderTemplates[0] && employee.workOrderTemplates[0]?.idCourse){
        let template = this.props.templates.find(template => template.id === employee.workOrderTemplates[0]?.idCourse);
        if(template?.softId){
            employTemplateSoftId = template.softId
        }
    }

    if (this.state.goEDITTemplate){
        card.push(<Redirect push to={`/app/workOrder/assignTemplate/${this.state.goEDITTemplate}/pages`} />)
        this.state.goEDITTemplate=false;
        if(MediaInfo.orientation != "landscape"){
            this.props.actions.wrapperActions.setPortraitScreen(2);
        }
    }
    
    if (this.state.goADDTemplate){
        card.push(<Redirect push to={"/app/workOrder/assignTemplate/templates/"+this.state.goADDTemplate} />)
        this.state.goADDTemplate=null;
    } 
    
    card.push(
        <TouchableOpacity key={"cardFront_" + employee.idUser} 
            style={{ 
                width: "100%", 
                height: 100, 
                flexDirection: "row", 
                alignItems: "center",
                backgroundColor: CurrentTheme.cardColor,
                borderRadius:7,
                borderWidth: !employee.workOrderTemplates ? 0 : this.props.selectedTemplate == (employee.workOrderTemplates && employee.workOrderTemplates[0] && employee.workOrderTemplates[0].idCourse) ? 1: 0,
                borderColor: CurrentTheme.selectedColor
            }}
            onPress={() => {
                if(employee.workOrderTemplates && employee.workOrderTemplates[0] && employee.workOrderTemplates[0].idCourse){
                    this.setState({
                        ...this.state,
                        goEDITTemplate: employee.workOrderTemplates[0].idCourse
                    })
                }
                this.props.setTemplateSelected(employee.workOrderTemplates[0].idCourse)
            }}
            disabled={!(employee.workOrderTemplates && employee.workOrderTemplates[0] && employee.workOrderTemplates[0].idCourse)}
        >
            <View style={{ flex: 1, paddingLeft: 10 }}>
                <Image source={{ uri: this.state.employee.image}} style={{ width: 60, height: 60, borderRadius: 10,backgroundColor:"white" }} resizeMode={"cover"} />
            </View>
            <View style={{ flex: 3, justifyContent: "center", paddingRight:10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 14,marginBottom:5,color:CurrentTheme.cardText }}>{`${employee.first_name.toUpperCase()} ${employee.last_name.toUpperCase()}`}</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 12,marginBottom:5,color:CurrentTheme.cardText }}>{employTemplateSoftId}</Text>
                <Dropdown
                    modal={true} 
                    options={this.getTemplateOptions()}
                    selectedValue={employee.workOrderTemplates && employee.workOrderTemplates[0] && employee.workOrderTemplates[0].idCourse? employee.workOrderTemplates[0].idCourse: null}
                    style={{color:CurrentTheme.cardText}}
                    onChange={async (value) => {
                        //assignEmployeeWorkOrderTemplate(idCourse,idEmployee)
                        if(value === 'new'){
                            this.setState({goADDTemplate: 'new'})
                            return
                        }
                        if(this.props.onLoading)this.props.onLoading(true);
                        try{
                            await this.props.actions.academyActions.assignEmployeeWorkOrderTemplate(value,employee.idUser);
                            if(this.props.onLoading)this.props.onLoading(false);
                        } catch(err){
                            if(this.props.onLoading)this.props.onLoading(false);
                            toast.error(err.reason);
                        }
                    }}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <View activeOpacity={1} style={{ width: "100%", height: "100%" }}>
            {card}
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
                            await this.props.actions.academyActions.deleteWorkOrderTemplate(this.state.employee?.workOrderTemplates[0]?.idCourse);
                            if(this.props.onLoading) this.props.onLoading(false);
                            this.props.setEmployeeSelected(null)
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

   /*  renderCardBack(){
        var card = [];


        card.push(<View style={this.style.topCardCenter}>
            {this.renderTopText()}
        </View>)

        if(this.state.employee.license && Object.keys(this.state.employee.license).length >0){
            card.push(
                <TouchableOpacity key={"cardFront6_" + this.state.employee.idUser} style={[this.style.bottomContainer,{marginLeft:10,alignItems:"start",marginBottom:10}]}
                onPress={()=>{
                    
                    if(this.props.onPress)
                        this.props.onPress(this.state.employee);
                }}>
                    <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.homeText, { alignSelf: "start", paddingTop: 2 }]}>{"Licencias activas:"}</Text>
                </TouchableOpacity>
            )
            
            var licenses=[];
            for(var i=0;i<Object.keys(this.state.employee.license).length;i++){
                //translate
                if(this.state.employee.license[Object.keys(this.state.employee.license)[i]]==1)
                licenses.push(<Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.homeText, {paddingTop: 2 }]}>{this.props.actions.translate.get('general_license_'+Object.keys(this.state.employee.license)[i])}</Text>);
            }

            card.push(
                <TouchableOpacity key={"cardFront7_" + this.state.employee.idUser} style={[this.style.bottomContainer,{marginLeft:10,alignItems:"start"}]}
                onPress={()=>{
                    
                    if(this.props.onPress)
                        this.props.onPress(this.state.employee);
                }}>
                    {licenses}
                </TouchableOpacity>
            )
        }

        return card;
    } */


};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        data: state.sessionReducer.data,
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        devices: state.fliwerDeviceReducer.devices,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        employees: state.sessionReducer.employees,
        templates: state.academyReducer.templates

    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch),
            academyActions: bindActionCreators(ActionsAcademy, dispatch),
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch),
        }
    }
}

var style = {
    addHomesImage: {
        width: 80,
        height: 80,
        alignItems: "center",
        justifyContent: "center",

    },
    layerEdit: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
        backgroundColor: "rgba(150,150,150,0.8)",
        justifyContent: "center",
        top: 0,
    },
    layerText: {
        width: "100%",
        fontSize: 33,
        //padding:"20%",
        paddingLeft: "10%",
        paddingRight: "10%",
        color: "white",
        textAlign: "center",
    },
    bottomContainer: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",

    },
    bottomContainerIn: {
        //paddingLeft:20,
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        paddingTop: 3,
        flexDirection: "row",
    },
    trashIconWrapper: {
        position: "absolute",
        top: 14,
        right: 10
    },
    trashIcon: {
        width: 20,
        height: 20
    },
    topCardLeft: {
        paddingBottom: 6,
        width: "17%",
        alignItems: "center",
    },
    imgProfileTop: {
        height: 30,
        borderRadius: 25,
        width: 30,
        marginLeft: 8,
    },
    topCardCenter: {
        width: "66%",
        alignSelf: "center"
    },
    topCardRight: {
        width: "17%",
    },
    topTextCard: {
        height: 64,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    textWithShadow: {
        textShadowColor: "black",
        textShadowOffset: { width: -1, height: 0 },
        textShadowRadius: 5,
    },
    circleAlertNumberOut: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "absolute",
    },
    circleAlertNumber: {
        color: "white",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        flex: 1,
        //paddingBottom:3,
    },
    backgroundImageCarousel: {
        resizeMode: "cover",
        flexGrow: 1,
        width: "100%",
        height: "100%",
        position: "absolute",
        opacity: 0.2,
    },
    dotAlertStyle: {
        width: 26,
        height: 26,
        borderRadius: 200,
        backgroundColor: FliwerColors.secondary.red,
        position: "absolute",
        top: 4,
        right: 1
    },
    dotAlertTotalStyle: {
        width: 40,
        height: 40,
        borderRadius: 200,
        backgroundColor: FliwerColors.secondary.red,
        position: "absolute",
        right: 30,
        top: 11,
    },
    carouseSlide: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        height: 223,
        padding: 8,
    },
    carouselGardenImageOut: {
        width: "33.33%",
        height: "50%",
        alignItems: "center",
        justifyContent: "center",
        padding: 1,

    },
    carouselGardenImage: {
        width: "80%",
        resizeMode: "cover",
        height: "80%",
        borderRadius: 16,
    },
    carouselGardenImageAndroid: {
        width: "80%",
        height: "80%",
        borderRadius: 16,
    },
    carouselGardenImageBG: {
        width: "100%",
        resizeMode: "cover",
        height: "100%",
    },
    frontCard: {
        height: 100,
        width: "100%"
    },
    imageCarouselContainer: {
        height: 223,
        width: "100%",
        marginBottom:10
    },
    image:{ 
        width: "100%", 
        height: "100%",
    },
    imageTopAlertBar: {
        width: "100%",
        backgroundColor: "#fe4b4b",
        position: "absolute",
        top: 0,
        height: 4
    },
    imageBottomAlertBar: {
        width: "100%",
        backgroundColor: "#fe4b4b",
        position: "absolute",
        bottom: 0,
        height: 4
    },
    carousel: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    carouselAlertText: {
        fontFamily: FliwerColors.fonts.regular,
        color: "white",
        fontSize: 16,
        paddingBottom: 20
    },
    sensorIcon: {
        width: "100%",
        height: "100%",
    },
    homeView: {
        height: 20,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        //marginBottom:11,
        marginTop: 5,
        maxWidth: "45%",
        marginLeft: 7,
    },
    homeViewConatainer: {
        //display:"flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 20,
        //marginBottom:11,
        marginTop: 5,
        maxWidth: "45%",
        marginRight: 7,
    },
    homeIcon: {
        width: 20,
        height: 20,
        marginRight: 5
    },
    locationIcon: {
        marginRight: 3,
        fontSize: 20
    },
    homeText: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 15
    },
    title: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        marginTop: 15,
        fontSize: 18,
        marginBottom: 10
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        fontFamily: FliwerColors.fonts.light,
        color: FliwerColors.primary.black,
        marginBottom: 15,
        marginTop: -2,
        fontSize: 16
    },
    text: {
        width: '100%',
        textAlign: 'center'
    },
    buttonContainer: {
        height: 40,
        width: "50%",
        marginLeft: "25%",
        flexGrow: 1,
        marginTop: 5
    },
    buttonAccess: {
        backgroundColor: FliwerColors.primary.green,
        height: 32,
        borderRadius: 4,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center"
    },
    buttonTextIn:{
        color: "rgb(255, 255, 255)",
        fontSize: 18
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(70%)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(mediaConnect(style, EmployeeAssignCard));
