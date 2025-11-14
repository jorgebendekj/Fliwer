'use strict';

import React, { Component } from 'react';
import {View, Text,ScrollView,TextInput,Platform, TouchableOpacity,Image  } from 'react-native';

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

class SearchUserModal extends Component {
    constructor(props) {
        super(props);
        
        var {idUser,type="gardener"}=this.props;

        this.state = {
            searchText:"",
            searchResults:[]
        }
        
    }

    search(searchText){
        var userList;
        if(!searchText)userList=Object.values(this.props.gardenerUsersList)
        else userList=Object.values(this.props.gardenerUsersList).filter((u)=>{
            var first_name=u.first_name;
            var last_name=u.last_name;
            var company_name=u.company_name;
            var email=u.email;
            if(u.clientObject){
                if(u.clientObject.first_name)first_name=u.clientObject.first_name;
                if(u.clientObject.last_name)last_name=u.clientObject.last_name;
                if(u.clientObject.companyName)company_name=u.clientObject.companyName;
                if(u.clientObject.email)email=u.clientObject.email;
            }
            return (first_name+" "+last_name).toUpperCase().includes(searchText.toUpperCase()) ||  (company_name?(company_name.toUpperCase()).includes(searchText.toUpperCase()):false) || email.toUpperCase().includes(searchText.toUpperCase())
        })
        
        //filter by type
        if(this.props.searchForCompany){
            userList=userList.filter((u)=>{return /*!u.clientObject ||*/ (u.clientObject && u.clientObject.isProvider) || u.idUser==this.props.sessionData.idUser})
            /*
            var self=Object.assign({},this.props.sessionData)
            self.photo_url=self.image
            userList.push(self)
            */
        }
        if(this.props.searchForClient){
            userList=userList.filter((u)=>{return !u.clientObject || u.clientObject.isClient && u.idUser!=this.props.sessionData.idUser})
            /*
            var self=Object.assign({},this.props.sessionData)
            self.photo_url=self.image
            userList.push(self)
            */
        }

        userList=userList.sort((a,b)=>{return a.first_name.localeCompare(b.first_name)})

        this.state.searchResults=userList;
    }

    render() {
        //
        var {idUser, visible, onClose, searchForCompany,searchForClient, text, textCancel, textConfirm, onConfirm, nested, type="gardener"} = this.props;

        return (
                <Modal animationType="fade" inStyle={[this.style.modalIn2]} visible={visible}
                    onClose={() => {
                        if(onClose)onClose()
                    }}
                    >
                    <ScrollView contentContainerStyle ={[this.style.modalView]}>
                        <View style={{width: "100%"}}>
                            <View style={{}}>
                                <Text style={[this.style.modalTitle]}>{
                                    /*
                                    this.props.actions.translate.get(idUser?(type=="gardener"?"general_client_modify":"general_employee_modify"):(type=="gardener"?"general_client_add":"general_employee_add"))
                                    */
                                   (searchForCompany?"Search Provider":(searchForClient?"Search Client":"Search User"))
                                }</Text>
                            </View>
    
                            <Text style={this.style.modalInputTitle}>{"Name of email:"}</Text>
                            <TextInput
                                style={this.style.modalInputArea}
                                onChangeText={(text) => {
                                    this.search(text);
                                    this.setState({searchText: text});
                                }}
                                value={this.state.searchText}
                                multiline={false}
                                textAlign= {'left'}
                            />
                            
                            <View style={this.style.selectContainer}>
                                {this.renderResults()}
                            </View>

    
                        </View>
                        <FliwerGreenButton
                            text={"Cancel"}
                            style={{paddingLeft: 8, paddingRight: 8, width: null, marginTop: 10, backgroundColor: FliwerColors.primary.gray}}
                            containerStyle={{height: 33, marginBottom: 1, alignSelf: "center", marginTop: 10, width: null, minWidth: 135}}
                            onPress={() => {
                                if(onClose)onClose()
                            }}/>
                    </ScrollView>
                </Modal>
            )
    }

    renderResults(){
        var indents=[];
        
        for(var i=0;i<this.state.searchResults.length;i++){

            var first_name=this.state.searchResults[i].first_name;
            var last_name=this.state.searchResults[i].last_name;
            var company_name=this.state.searchResults[i].company_name;
            var email=this.state.searchResults[i].email;
            if(this.state.searchResults[i].clientObject){
                if(this.state.searchResults[i].clientObject.first_name)first_name=this.state.searchResults[i].clientObject.first_name;
                if(this.state.searchResults[i].clientObject.last_name)last_name=this.state.searchResults[i].clientObject.last_name;
                if(this.state.searchResults[i].clientObject.companyName)company_name=this.state.searchResults[i].clientObject.companyName;
                if(this.state.searchResults[i].clientObject.email)email=this.state.searchResults[i].clientObject.email;
            }

            indents.push(
                <TouchableOpacity key={"_searchResults"+i} style={this.style.modalOptionsSelectorItem} onPress={((searchResult)=>{return ()=>{
                    if(this.props.onSelect)this.props.onSelect(searchResult)
                }})(this.state.searchResults[i])
                }>
                    <Image source={{uri:this.state.searchResults[i].photo_url}} resizeMode={"cover"} style={{width: 40,height: 40,marginRight:5,borderRadius:5}} />
                    <Text style={{marginLeft:5}}>{(company_name?(company_name+" - "):"")+first_name+" "+last_name}</Text>
                </TouchableOpacity>
            )
        }

        return indents;
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
        employees: state.sessionReducer.employees,
        sessionData: state.sessionReducer.dataLogin
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
        height: 50,
        alignItems: "center"
    },
    modalOptionsSelectorItemImage:{
        width: 40,
        height: 40,
        marginRight:5
    },
    
    selectContainer: {
        minHeight: 400,
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
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, SearchUserModal));
