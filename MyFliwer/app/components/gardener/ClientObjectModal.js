'use strict';

import React, { Component } from 'react';
import {View, Text,ScrollView,TextInput,Platform } from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionGardener from '../../actions/gardenerActions.js'; //Import your actions
import * as ActionSession from '../../actions/sessionActions.js'; //Import your actions

import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerCalmButton from '../custom/FliwerCalmButton.js'
import {toast} from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import Dropdown from '../../widgets/dropdown/dropdown';
import PhoneInput from '../../widgets/phoneInput/phoneInput';
import FliwerTextInput from '../custom/FliwerTextInput.js'

import {FliwerColors} from '../../utils/FliwerColors.js'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { CheckBox  } from 'react-native-elements'

class ClientObjectModal extends Component {
    constructor(props) {
        super(props);
        
        var {idUser,type="gardener"}=this.props;
        this.state = {
            userData: {
                
            },
        }
        if(idUser){
            var user;
            if(type=="gardener")user=Object.values(this.props.gardenerUsersList).find((user)=>{return user.user_id==idUser});
            else user=Object.values(this.props.employees).find((user)=>{return user.idUser==idUser});

            this.state.userData.email=user.clientObject && user.clientObject.email?user.clientObject.email:(user.email?user.email:"");
            this.state.userData.isCompany=user.clientObject && user.clientObject.isCompany!==undefined && user.clientObject.isCompany!==null?user.clientObject.isCompany:(user.iscompany?user.iscompany:false);
            this.state.userData.companyName=user.clientObject && user.clientObject.companyName?user.clientObject.companyName:(user.company_name?user.company_name:"");
            this.state.userData.firstName=user.clientObject && user.clientObject.firstName?user.clientObject.firstName:(user.first_name?user.first_name:"");
            this.state.userData.lastName=user.clientObject && user.clientObject.lastName?user.clientObject.lastName:(user.last_name?user.last_name:"");
            this.state.userData.nif=user.clientObject && user.clientObject.nif?user.clientObject.nif:(user.nif?user.nif:"");
            this.state.userData.cif=user.clientObject && user.clientObject.cif?user.clientObject.cif:(user.cif?user.cif:"");
            this.state.userData.address=user.clientObject && user.clientObject.address?user.clientObject.address:(user.address?user.address:"");
            this.state.userData.zipCode=user.clientObject && user.clientObject.zipCode?user.clientObject.zipCode:(user.zipCode?user.zipCode:"");
            this.state.userData.city=user.clientObject && user.clientObject.city?user.clientObject.city:(user.city?user.city:"");
            this.state.userData.country=user.clientObject && user.clientObject.country?user.clientObject.country:(user.country?user.country:"ES");
            this.state.userData.idRegion=user.clientObject && user.clientObject.idRegion?user.clientObject.idRegion:(user.idRegion?user.idRegion:"");
            this.state.userData.idProvince=user.clientObject && user.clientObject.idProvince?user.clientObject.idProvince:(user.idProvince?user.idProvince:"");
            this.state.userData.phone=user.clientObject && user.clientObject.phone?user.clientObject.phone:(user.phone?user.phone:"");
            this.state.userData.iban=user.clientObject && user.clientObject.iban?user.clientObject.iban:(user.iban?user.iban:"");
            this.state.userData.language=user.clientObject && user.clientObject.idLangCommunication?user.clientObject.idLangCommunication:"";
            this.state.userData.isClient=user.clientObject && user.clientObject.isClient!==undefined && user.clientObject.isClient!==null?user.clientObject.isClient:(user.isClient?user.isClient:true);
            this.state.userData.isProvider=user.clientObject && user.clientObject.isProvider!==undefined && user.clientObject.isProvider!==null?user.clientObject.isProvider:(user.isProvider?user.isProvider:false);
        }else{
            this.state.userData.email="";
            this.state.userData.password=""; //only for new users
            this.state.userData.confirmPassword=""; //only for new users
            this.state.userData.isCompany=false;
            this.state.userData.companyName="";
            this.state.userData.firstName="";
            this.state.userData.lastName="";
            this.state.userData.nif="";
            this.state.userData.cif="";
            this.state.userData.address="";
            this.state.userData.zipCode="";
            this.state.userData.city="";
            this.state.userData.country="ES";
            this.state.userData.phone="";
            this.state.userData.iban="";
            this.state.userData.language="";
            this.state.userData.isClient=(type=='business'?false:true);
            this.state.userData.isProvider=false;
        }

    }

    printCountries() {
        var that = this;
        if (!this.props.countries)
            return [];
        var arr = Object.keys(this.props.countries).map(function (key) {
            return { label: that.props.countries[key].Name, value: that.props.countries[key].Code };
        });
        function compare(a, b) {
            if (a.label < b.label)
                return -1;
            if (a.label > b.label)
                return 1;
            return 0;
        }
        return arr.sort(compare);
    }
    
    printRegions(country){
        
        if(!this.props.countries[country] || !this.props.countries[country].regions)return [];
        return this.props.countries[country].regions.map(r=>{return {label:r.Name,value:r.idRegion}}).sort((a,b)=>{return a.label<=b.label?-1:1})
    }

    printProvinces(country,idRegion){
        
        if(!this.props.countries[country] || !this.props.countries[country].regions)return [];
        var region=this.props.countries[country].regions.find(r=>r.idRegion==idRegion);
        if(!region)return [];
        return region.provinces.map(r=>{return {label:r.Name,value:r.idProvince}}).sort((a,b)=>{return a.label<=b.label?-1:1});
    }


    printLanguages() {
        var that = this;
        if (!this.props.allLanguages)
            return [];
        var arr = Object.keys(this.props.allLanguages).map(function (key) {
            return { label: that.props.allLanguages[key].complete_name, value: that.props.allLanguages[key].name };
        });
        function compare(a, b) {
            if (a.value < b.value)
                return -1;
            if (a.value > b.value)
                return 1;
            return 0;
        }
        return arr.sort(compare);
    }

    render() {
        //
        var {idUser, visible, onClose, title, text, textCancel, textConfirm, onConfirm, nested, type="gardener"} = this.props;


        return (
                <Modal animationType="fade" inStyle={[this.style.modalIn2]} visible={visible}
                    onClose={() => {
                        if(onClose)onClose()
                    }}
                    >
                    <ScrollView contentContainerStyle ={[this.style.modalView]}>
                        <View style={{width: "100%"}}>
                            <View style={{}}>
                                <Text style={[this.style.modalTitle]}>{this.props.actions.translate.get(idUser?(type=="gardener"?"general_client_modify":"general_employee_modify"):(type=="gardener"?"general_client_add":"general_employee_add"))}</Text>
                            </View>
    
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('userProfileVC_email')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.email = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.email}
                                multiline={false}
                                textAlign= {'left'}
                            />

                            {
                                //if is a new user
                                !idUser?[
                                    <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('loginVC_pass_placeholder')+":"}</Text>,
                                    <TextInput
                                        style={this.style.modalInputArea}
                                        onChangeText={(text) => {
                                            var userData = this.state.userData;
                                            userData.password = text;
                                            this.setState({userData: userData});
                                        }}
                                        secureTextEntry={true}
                                        value={this.state.userData.password}
                                        multiline={false}
                                        textAlign= {'left'}
                                    />,
                                    <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('userRegisterVC_repeat_password_tf')+":"}</Text>,
                                    <TextInput
                                        style={this.style.modalInputArea}
                                        onChangeText={(text) => {
                                            var userData = this.state.userData;
                                            userData.confirmPassword = text;
                                            this.setState({userData: userData});
                                        }}
                                        secureTextEntry={true}
                                        value={this.state.userData.confirmPassword}
                                        multiline={false}
                                        textAlign= {'left'}
                                    />
                                ]:null
                            }
                            

                            {
                                this.props.type=="business"?null:
                                [
                                    (<CheckBox
                                        title={this.props.actions.translate.get('general_its_client')}
                                        textStyle={this.style.modalInputCheckboxText}
                                        containerStyle={this.style.modalInputCheckbox}
                                        checked={this.state.userData.isClient?true:false}
                                        onPress={()=>{
                                            var userData = this.state.userData;
                                            userData.isClient= !userData.isClient;
                                            this.setState({userData: userData});
                                        }}
                                    />),
                                    
                                    (<CheckBox
                                        title={this.props.actions.translate.get('general_its_provider')}
                                        textStyle={this.style.modalInputCheckboxText}
                                        containerStyle={this.style.modalInputCheckbox}
                                        checked={this.state.userData.isProvider?true:false}
                                        onPress={()=>{
                                            var userData = this.state.userData;
                                            userData.isProvider= !userData.isProvider;
                                            this.setState({userData: userData});
                                        }}
                                    />),
                                ]


                            }
                            
                            
                            <CheckBox
                                title={this.props.actions.translate.get('general_its_company')}
                                textStyle={this.style.modalInputCheckboxText}
                                containerStyle={this.style.modalInputCheckbox}
                                checked={this.state.userData.isCompany?true:false}
                                onPress={()=>{
                                    var userData = this.state.userData;
                                    userData.isCompany= !userData.isCompany;
                                    this.setState({userData: userData});
                                }}
                            />
    
                            {
                                this.state.userData.isCompany?[
                                    (<Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_company_name')+":"}</Text>),
                                    (<TextInput
                                        style={this.style.modalInputArea}
                                        onChangeText={(text) => {
                                            var userData = this.state.userData;
                                            userData.companyName = text;
                                            this.setState({userData: userData});
                                        }}
                                        value={this.state.userData.companyName}
                                        multiline={false}
                                        textAlign= {'left'}
                                    />),
                                    (<Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_cif')+":"}</Text>),
                                    (<TextInput
                                        style={this.style.modalInputArea}
                                        onChangeText={(text) => {
                                            var userData = this.state.userData;
                                            userData.cif = text;
                                            this.setState({userData: userData});
                                        }}
                                        value={this.state.userData.cif}
                                        multiline={false}
                                        textAlign= {'left'}
                                    />),
                                ]:[
                                ]
                                    
                            }
                            
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('userProfileVC_first_name')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.firstName = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.firstName}
                                multiline={false}
                                textAlign= {'left'}
                            />
    
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('userProfileVC_last_name')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.lastName = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.lastName}
                                multiline={false}
                                textAlign= {'left'}
                            />
    
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_id_card')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.nif = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.nif}
                                multiline={false}
                                textAlign= {'left'}
                            />

                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('userProfileVC_phone')+":"}</Text>
                            <PhoneInput
                                country={this.state.userData.country}
                                value={this.state.userData.phone}
                                onChange={(text) => {
                                    var userData = this.state.userData;
                                    userData.phone = text;
                                    this.setState({userData: userData});
                                }}
                                height={40}
                                marginTop={-2}
                                marginBottom={0}
                                maxWidth={this.state.mediaStyle.orientation == "landscape" ? 400 : null}
                                noAutoFocus={true}
                                backgroundColor={"white"}
                                textColor={"black"}
                                dialCodeTopPadding={Platform.OS === 'android' ? 8 : 11}
                                borderColor={"gray"}
                            />
    
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_address')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.address = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.address}
                                multiline={false}
                                textAlign= {'left'}
                            />
    
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_zip_code')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.zipCode = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.zipCode}
                                multiline={false}
                                textAlign= {'left'}
                            />
    
                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_city')+":"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.city = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.city}
                                multiline={false}
                                textAlign= {'left'}
                            />
                            
                            <Text style={this.style.modalInputTitle}>{"IBAN:"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    var userData = this.state.userData;
                                    userData.iban = text;
                                    this.setState({userData: userData});
                                }}
                                value={this.state.userData.iban}
                                multiline={false}
                                textAlign= {'left'}
                            />

                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_country')+":"}</Text>
                            <View style={this.style.selectContainer}>
                                <Dropdown
                                    modal={true}
                                    filterEnabled={true}
                                    placeholder={this.props.actions.translate.get('general_country')}
                                    selectedValue={this.state.userData.country}
                                    style={this.style.select}
                                    styleOptions={{}}
                                    options={this.printCountries()}
                                    onChange={(value) => {
                                        var userData = this.state.userData;
                                        userData.country = value;
                                        this.setState({userData: userData});
                                    }} />
                            </View>

                            {
                                this.state.userData.country=="ES"?
                                <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_region')+":"}</Text>
                                :null
                            }
                            {
                                this.state.userData.country=="ES"?
                                <View style={this.style.selectContainer}>
                                    <Dropdown
                                        modal={true}
                                        filterEnabled={true}
                                        placeholder={this.props.actions.translate.get('general_region')}
                                        selectedValue={this.state.userData.idRegion}
                                        style={this.style.select}
                                        styleOptions={{}}
                                        options={this.printRegions(this.state.userData.country)}
                                        onChange={(value) => {
                                            var userData = this.state.userData;
                                            userData.idRegion = value;
                                            this.setState({userData: userData});
                                        }} />
                                </View>
                                :null
                            }

                            {
                                this.state.userData.country=="ES"?
                                <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_province')+":"}</Text>
                                :null
                            }
                            {
                                this.state.userData.country=="ES"?
                                <View style={this.style.selectContainer}>
                                    <Dropdown
                                        modal={true}
                                        filterEnabled={true}
                                        placeholder={this.props.actions.translate.get('general_province')}
                                        selectedValue={this.state.userData.idProvince}
                                        style={this.style.select}
                                        styleOptions={{}}
                                        options={this.printProvinces(this.state.userData.country,this.state.userData.idRegion)}
                                        onChange={(value) => {
                                            var userData = this.state.userData;
                                            userData.idProvince = value;
                                            this.setState({userData: userData});
                                        }} />
                                </View>
                                :null
                            }

                            <Text style={this.style.modalInputTitle}>{this.props.actions.translate.get('general_communication_language')+":"}</Text>
                            <View style={this.style.selectContainer}>
                                <Dropdown
                                    modal={true}
                                    placeholder={this.props.actions.translate.get('general_language')}
                                    selectedValue={this.state.userData.language}
                                    style={this.style.select}
                                    styleOptions={{}}
                                    options={this.printLanguages()}
                                    onChange={(value)=>{
                                        debugger;
                                        var userData = this.state.userData;
                                        userData.language = value;
                                        this.setState({userData: userData});
                                    }} />
                            </View>

    
                        </View>
                        <FliwerGreenButton
                            text={this.props.actions.translate.get('Academy_save')}
                            style={{paddingLeft: 8, paddingRight: 8, width: null, marginTop: 10}}
                            containerStyle={{height: 33, marginBottom: 1, alignSelf: "center", marginTop: 10, width: null, minWidth: 135}}
                            onPress={() => {

                                //if is a new user, check password and confirm password
                                if(!idUser && this.state.userData.password!=this.state.userData.confirmPassword){
                                    toast.error(this.props.actions.translate.get('loginVC_passwords_are_not_identical'));
                                    return;
                                }else if(!idUser && !this.state.userData.password.length){
                                    toast.error("Un nuevo usuario debe tener una contraseña");
                                    return;
                                }

                                if(typeof this.props.onLoading === "function")this.props.onLoading(true);
                                this.setState({loading: true});
                                
                                var newData = {
                                    email: this.state.userData.email,
                                    cif: this.state.userData.cif,
                                    nif: this.state.userData.nif,
                                    address: this.state.userData.address,
                                    city: this.state.userData.city,
                                    zipCode: this.state.userData.zipCode,
                                    country: this.state.userData.country,
                                    phone: this.state.userData.phone,
                                    iban: this.state.userData.iban,
                                    isCompany: this.state.userData.isCompany,
                                    companyName: this.state.userData.companyName,
                                    firstName: this.state.userData.firstName,
                                    lastName: this.state.userData.lastName,
                                    idLangCommunication: this.state.userData.language,
                                    isClient: this.state.userData.isClient?1:0,
                                    isProvider: this.state.userData.isProvider?1:0
                                };
                                if(!newData.cif)newData.cif=null;
                                if(!newData.nif)newData.nif=null;
                                if(!newData.address)newData.address=null;
                                if(!newData.city)newData.city=null;
                                if(!newData.zipCode)newData.zipCode=null;
                                if(!newData.country)newData.country=null;
                                if(!newData.phone)newData.phone=null;
                                if(!newData.iban)newData.iban=null;
                                if(!newData.companyName)newData.companyName=null;
                                if(!newData.firstName)newData.firstName=null;
                                if(!newData.lastName)newData.lastName=null;
                                if(!newData.idLangCommunication)newData.idLangCommunication=null;
                                if(!newData.isClient)newData.isClient=1;
                                if(!newData.isProvider)newData.isProvider=0;

                                //if is a new user
                                if(!idUser){
                                    newData.password=this.state.userData.password;
                                }

                                if(type=="gardener"){
                                    if(idUser){
                                        //Modify
                                        this.props.actions.fliwerGardenerActions.modifyUserClientObject(idUser,newData).then((res)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            if(onConfirm)onConfirm(res)
                                            else if(onClose)onClose(res)
                                        },(err)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            this.setState({loading:false});
                                            if (err && err.reason)
                                                toast.error(err.reason);
                                        });
                                    }else{
                                        //Add
                                        this.props.actions.fliwerGardenerActions.addClientObject(newData).then((res)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            if(onConfirm)onConfirm(res)
                                            else if(onClose)onClose(res)
                                        },(err)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            this.setState({loading:false});
                                            if (err && err.reason)
                                                toast.error(err.reason);
                                        });
                                    }
                                }else{
                                    
                                    if(idUser){
                                        //Modify
                                        this.props.actions.sessionActions.modifyUserEmployeeObject(idUser,newData).then((res)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            if(onConfirm)onConfirm(res)
                                            else if(onClose)onClose(res)
                                        },(err)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            this.setState({loading:false});
                                            if (err && err.reason)
                                                toast.error(err.reason);
                                        });
                                    }else{
                                        //Add
                                        this.props.actions.sessionActions.addEmployeeObject(newData).then((res)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            if(onConfirm)onConfirm(res)
                                            else if(onClose)onClose(res)
                                        },(err)=>{
                                            if(typeof this.props.onLoading === "function")this.props.onLoading(false);
                                            this.setState({loading:false});
                                            if (err && err.reason)
                                                toast.error(err.reason);
                                        });
                                    }
                                }

    

                            }}/>
                    </ScrollView>
                </Modal>
            )
    }


};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        countries: state.locationReducer.countries,
        allLanguages: state.languageReducer.languages,
        gardenerUsersList: state.gardenerReducer.usersListData,
        employees: state.sessionReducer.employees
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
            sessionActions: bindActionCreators(ActionSession, dispatch),
        }
    }
}

var style = {
    modalIn2: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center"
    },
    modalTitle:{
        textAlign: "center",
        fontFamily: FliwerColors.fonts.title,
        fontSize: 21,
        marginBottom:10
    },
    modalInputTitle:{
        marginBottom:5
    },
    modalOptionsSelector:{
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20
    },
    modalOptionsSelectorItem:{
        marginBottom:5,
        flexDirection:"row",
    },
    modalOptionsSelectorItemImage:{
        width: 40,
        height: 40,
        marginRight:5
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
        borderColor: 'gray',
        backgroundColor:"white",
        borderRadius: 4,
        color: "black"
    },

    modalInputArea:{
        height: 40, 
        width:"100%",
        borderColor: 'gray',
        borderWidth: 1, 
        padding: 5, 
        marginTop: 5,
        backgroundColor:"white",
        marginBottom:10
    }, modalInputCheckbox:{
        backgroundColor: "transparent",
        borderWidth: 0, 
        marginLeft: -8, 
        marginTop: -4
    },
    modalInputCheckboxText:{
        fontWeight: "regular",
    },
};


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, ClientObjectModal));
