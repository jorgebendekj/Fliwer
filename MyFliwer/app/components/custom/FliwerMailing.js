'use strict';

import React, { Component } from 'react';
import {View, Text, ScrollView, Platform, TouchableOpacity, Dimensions} from 'react-native';
import { CheckBox  } from 'react-native-elements'
import EvilIcon from 'react-native-vector-icons/EvilIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

import FliwerTextInput from '../custom/FliwerTextInput.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerSimpleTabView from '../custom/FliwerSimpleTabView.js';

import {loginStyles} from '../login/loginStyles.js';
import FliwerGreenButton from './FliwerGreenButton.js'

import * as ActionAcademy from '../../actions/academyActions.js';
import * as ActionsLang from '../../actions/languageActions.js';

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { extraService } from '../../utils/apiService.js';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import Dropdown from '../../widgets/dropdown/dropdown';
import {toast} from '../../widgets/toast/toast'
import Modal from '../../widgets/modal/modal'
import WebView from '../../widgets/webView/webView'
import HtmlEditor from '../../widgets/htmlEditor/htmlEditor'
import moment from 'moment';

class FliwerMailing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            initialLoading: true,
            templates: [],
            selectedTemplate: 999991998,
            templateName: '',
            headerText: '',
            subject: '',
            to: this.props.to? this.props.to : '',
            message: '',
            showHtmlEditor: true,
            assignTemplate: false,
            assignTemplateChanged: false,
            assignedTemplate: this.props.assignedTemplate? this.props.assignedTemplate : false,
            modalAssignTemplateAsDefaultVisible: false,
            assignTemplateAsDefault: false,
            modalSendEmailVisible: false,
            testTo: '',
            modalLanguageSelectionVisible: false,
            modalDeleteTemplateVisible: false,
            lang: (this.props.language=='en'?2:1),
            emailDefaultTemplates: this.props.emailDefaultTemplatesReducer? this.props.emailDefaultTemplatesReducer : null,
            emailHistory: this.props.emailHistory? this.props.emailHistory : [],
            emailHistoryModalVisible: false,
            emailHistoryId: null,
            tabHeight: null
        };
    }

    componentDidMount()
    {
        var that = this;
        this.props.setLoading(true);
        this.props.actions.academyActions.getEmailTemplates(this.props.type).then((templates) => {
            this.props.setLoading(false);
            
            var idEmailTemplate = this.props.idEmailTemplate;
            
            var defaultT = null;
            if (!idEmailTemplate && that.state.emailDefaultTemplates) {
                defaultT = that.state.emailDefaultTemplates.find((n) => {
                    return (n.type == that.props.type && n.lang == that.state.lang);
                });  
                if (defaultT)
                    idEmailTemplate = defaultT.idEmailTemplate;
            }
            
            //console.log("componentDidMount idEmailTemplate", idEmailTemplate);
            var template = null;
            if (idEmailTemplate) {
                template = templates.find((n) => {
                    return n.id == idEmailTemplate;
                });
                //console.log("componentDidMount template", template);
            }                
                                
            if (!template)
                this.setState({initialLoading: false, templates: templates});
            else {
                new Promise(function (resolve, reject) {
                    if (Platform.OS == "web")
                        resolve();
                    else
                        that.setState({showHtmlEditor: false}, () => {
                            resolve();
                        });                                        
                }).then(() => {
                    that.setState({showHtmlEditor: true, initialLoading: false, templates: templates, selectedTemplate: idEmailTemplate, templateName: template.name, headerText: template.headerText, subject: template.subject, message: template.message, lang: template.lang, assignTemplate: (template.id == that.state.assignedTemplate)});
                });                                
            }                
                
        }, (error) => {
            this.props.setLoading(false);
            toast.error(error.reason);
            this.setState({initialLoading: false});
        });          
    }

    render() {
      
        var that = this;
        var {title, containerStyle, onCancel} = this.props;
        
        return (
            <View style={[{width: "100%", height: "100%"}, containerStyle]}>
                <View style={{alignSelf: "center", width: "100%", marginTop: 10, marginBottom: 12}}>
                    <Text style={[this.style.titleFormat, {textAlign: "center"}]}>{title}</Text>
                </View>
                <View style={{alignSelf: "center", width: "100%", marginBottom: 12}}>
                    <Text style={[this.style.titleFormat, {textAlign: "center", fontSize: 20, color: "gray"}]}>{"MAILING"}</Text>
                </View>

                <FliwerSimpleTabView 
                    style={{height: "auto"}} 
                    headerStyle={{backgroundColor: "white", borderBottomWidth: 0}} 
                    tabContainerStyle={{backgroundColor: "white"}} 
                    tabTextStyle={{color: "silver"}} 
                    selectedTabContainerStyle={{backgroundColor: "white"}}
                    selectedTabTextStyle={{color: "black"}} 
                    >
                    <View title={this.props.actions.translate.get('Mailing_new_email')}>
                        <View style={this.style.tab}
                            onLayout={(e) => {
                                this.setState({tabHeight: e.nativeEvent.layout.height});
                            }}>
                            <View style={{marginTop: 5, marginBottom: 3}}>
                                <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Mailing_template')}</Text>
                            </View>

                            <Dropdown modal={false} 
                                disabled={false} 
                                placeholder={this.props.actions.translate.get('Mailing_select_template')} 
                                selectedValue={this.state.selectedTemplate} style={{}} 
                                styleOptions={{}} options={this.printTemplates()} 
                                onChange={(value) => {

                                    if (value == 999991999) {
                                        global.frontLayer.display(true);  
                                        that.setState({modalLanguageSelectionVisible: true});
                                    }
                                    else {
                                        var template = this.state.templates.find((n) => {
                                            return n.id == value;
                                        });
                                        if (template) {
                                            new Promise(function (resolve, reject) {
                                                if (Platform.OS == "web")
                                                    resolve();
                                                else
                                                    that.setState({showHtmlEditor: false}, () => {
                                                        resolve();
                                                    });                                        
                                            }).then(() => {
                                                that.setState({showHtmlEditor: true, selectedTemplate: value, templateName: template.name, headerText: template.headerText, subject: template.subject, message: template.message, lang: template.lang, assignTemplate: (template.id == that.state.assignedTemplate)});
                                            });                                
                                        }
                                    }

                                }} />

                            <View style={{marginTop: 15}}>
                                <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Mailing_template_name')}</Text>
                            </View>
                            <FliwerTextInput
                                containerStyle={[loginStyles.textFieldContainerStyle, this.style.textInputContainerStyle]}
                                style={this.style.textInputStyle}
                                autoCapitalize = 'none'
                                returnKeyType = {"next"}
                                placeholder={this.props.actions.translate.get('Mailing_template_name')}
                                onChangeText={(text) => {
                                    this.setState({templateName: text});
                                }}
                                textInputRef={(input) => {
                                    //this.firstnameTextInput = input;
                                }}
                                onSubmitEditing={() => {
                                    //this.lastnameTextInput.focus()
                                }}
                                keyboardType={"default"} 
                                value={this.state.templateName} 
                                disabled={this.isDisabled()}
                            />

                            <View style={{marginTop: 5}}>
                                <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Mailing_subject')}</Text>
                            </View>
                            <FliwerTextInput
                                containerStyle={[loginStyles.textFieldContainerStyle, this.style.textInputContainerStyle]}
                                style={this.style.textInputStyle}
                                autoCapitalize = 'none'
                                returnKeyType = {"next"}
                                placeholder={this.props.actions.translate.get('Mailing_subject')}
                                onChangeText={(text) => {
                                    this.setState({subject: text});
                                }}
                                textInputRef={(input) => {
                                    //this.firstnameTextInput = input;
                                }}
                                onSubmitEditing={() => {
                                    //this.lastnameTextInput.focus()
                                }}
                                keyboardType={"default"} 
                                value={this.state.subject}
                                disabled={this.isDisabled()}
                            />

                            {!this.props.hideTo?<View style={{marginTop: 5}}>
                                <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Mailing_to')}</Text>
                            </View>:null}
                            {!this.props.hideTo?<FliwerTextInput
                                containerStyle={[loginStyles.textFieldContainerStyle, this.style.textInputContainerStyle]}
                                style={this.style.textInputStyle}
                                autoCapitalize = 'none'
                                returnKeyType = {"next"}
                                placeholder={this.props.actions.translate.get('Mailing_to')}
                                onChangeText={(text) => {
                                    this.setState({to: text});
                                }}
                                textInputRef={(input) => {
                                    //this.firstnameTextInput = input;
                                }}
                                onSubmitEditing={() => {
                                    //this.lastnameTextInput.focus()
                                }}
                                keyboardType={"default"} 
                                value={this.state.to}
                                disabled={this.isDisabled()}
                            />:null}

                            <View style={{marginTop: 5, marginBottom: 2}}>
                                <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Mailing_message')}</Text>
                            </View>
                            {this.state.showHtmlEditor?
                                <HtmlEditor 
                                    onChange={(text) => {
                                        //console.log("onChange", text);
                                        this.state.message = text;
                                        //this.setState({message: text});
                                    }}
                                    value={this.state.message} 
                                    disabled={this.isDisabled()}
                                    height={Platform.OS == "web"? 700 : 400}
                                />
                            :
                                <View style={{width: "100%", height: Platform.OS == "web"? 700 : 400}}></View> 
                            }

                            {this.props.assignTemplateText?<View style={{flexDirection: "row", width: "100%", marginTop: 10, marginBottom: 0}}>
                                <CheckBox key={101} 
                                    title={this.props.assignTemplateText} 
                                    textStyle={{fontWeight: "normal"}} 
                                    containerStyle={{backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4}} 
                                    checked={this.state.assignTemplate? true : false} 
                                    onPress={() => {
                                        this.setState({assignTemplate: !this.state.assignTemplate, assignTemplateChanged: true});
                                    }}
                                />                                                   
                            </View>:null}

                            <View style={{flexDirection: "row", alignSelf: "center", marginTop: 30}}>
                                <FliwerGreenButton 
                                    text={this.props.actions.translate.get('Mailing_send_email')} 
                                    style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: FliwerColors.complementary.blue}]} 
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 150}]}
                                    disabled={this.isDisabled()}
                                    onPress={() => {

                                        if (this.state.selectedTemplate == 999991998 || this.state.selectedTemplate == null) {
                                            toast.error(this.props.actions.translate.get('Mailing_select_template_or_create_new_one'));
                                            return;
                                        }

                                        global.frontLayer.display(true);
                                        this.setState({modalSendEmailVisible: true});

                                    }}/>                       
                            </View>                     

                            {this.props.addSaveButton?<View style={{alignSelf: "center", marginTop: 30, marginBottom: 25}}>
                                <FliwerGreenButton 
                                    text={this.props.actions.translate.get('Mailing_save_template')} 
                                    style={FliwerStyles.fliwerGreenButtonStyle} 
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 150}]}
                                    disabled={this.isDisabled()}
                                    onPress={() => {
                                        this.onSaveButtonPress();
                                    }}/>                       
                                </View>
                            :
                                <View style={{width: "100%", height: 30}}></View>}
                        </View>
                    </View>   
                    
                    <View title={this.props.actions.translate.get('Mailing_sent_emails')}>
                        <View style={[this.style.tab, {minHeight: this.state.tabHeight?this.state.tabHeight:300, paddingBottom: 50}]}>
                            {this.renderEmailHistory()}
                        </View>
                    </View>
                </FliwerSimpleTabView>  
                
                {this.renderModalAssignTemplateAsDefault()}
                {this.renderModalDeleteTemplate()}
                {this.renderSendEmailModal()}
                {this.renderLanguageSelectionModal()}
                {this.renderEmailHistoryModalView()}
                {this.renderDeleteButton()}
                
            </View>
        );

    }

    renderDeleteButton()
    {
        if (!this.isDisabled())
            return(
                <TouchableOpacity style={this.style.deleteButtonWrapper} onMouseEnter={this.hoverIn('deleteButton')} onMouseLeave={this.hoverOut('deleteButton')} 
                    onPress={() => {

                        this.onDeleteButtonPress();

                    }}>
                    <IconFontAwesome style={this.style.deleteButton} name="trash-o" size={25} />
                </TouchableOpacity>
            );
    }
    
    renderEmailHistory() {
        var that = this;
        if (!this.state.emailHistory) {
            return null;
        }
        
        var indents = [];
        
        const dimensions = Dimensions.get('window');
        var isMobile = (dimensions.width <= 800);

        if (!isMobile)
            indents.push(
                <View style={{width: "100%", flexDirection: "row", alignSelf: "center", padding: 10, borderBottomWidth: 1}}> 
                    <View style={{flex: 1, flexDirection: "row"}}> 
                        <Text style={{width: 20}}>{""}</Text>
                        <Text style={{width: 120, marginLeft: 10, fontSize: 12}}>{"Fecha/Hora"}</Text>
                        <Text style={{width: 100, marginLeft: 10, fontSize: 12}}>{"Plantilla"}</Text>
                        <Text style={{marginLeft: 10, fontSize: 12}}>{"Asunto"}</Text>   
                    </View>      
                    <View style={{width: 50}}>

                    </View>                  
                </View>
            );        
        
        for (var i = 0; i < this.state.emailHistory.length; i++) {
            (function (i) {
                var his = that.state.emailHistory[i];
                var date = moment(his.date * 1000).format("DD-MM-YYYY HH:mm");
                
                if (!isMobile)
                    indents.push(
                        <View style={{width: "100%", flexDirection: "row", alignSelf: "center", padding: 10}}> 
                            <View style={{flex: 1, flexDirection: "row"}}> 
                                <Text style={{width: 20, fontWeight: "bold", fontSize: 18}}>{(i + 1).toString() + "."}</Text>
                                <Text style={{width: 120, marginLeft: 10, fontSize: 12, paddingTop: 5}}>{date}</Text>
                                <Text style={{width: 100, marginLeft: 10, fontSize: 12, paddingTop: 5}}>{his.emailTemplateName}</Text>
                                <Text style={{marginLeft: 10, fontWeight: "bold", fontSize: 12, paddingTop: 5}}>{his.subject}</Text>   
                            </View>
                            <TouchableOpacity style={{width: 50}} activeOpacity={1}  
                                onPress={() => {
                                    global.frontLayer.display(true);    
                                    that.setState({emailHistoryModalVisible: true, emailHistoryId: that.state.emailHistory[i].emailHistoryId});
                                }}>
                                <EvilIcon name="eye" size={30} style={{color:"black"}} ></EvilIcon>
                            </TouchableOpacity>                        
                        </View>
                    );
                else
                    indents.push(
                        <View style={{width: "100%", padding: 10}}> 
                            <View style={{flexDirection: "row"}}> 
                                <Text style={{width: 20, fontWeight: "bold", fontSize: 18}}>{(i + 1).toString() + "."}</Text>
                                <Text style={{width: 120, marginLeft: 10, fontSize: 12, paddingTop: 5}}>{date}</Text>
                                <TouchableOpacity style={{width: 50}} activeOpacity={1}  
                                    onPress={() => {
                                        global.frontLayer.display(true);    
                                        that.setState({emailHistoryModalVisible: true, emailHistoryId: that.state.emailHistory[i].emailHistoryId});
                                    }}>
                                    <EvilIcon name="eye" size={30} style={{color:"black"}} ></EvilIcon>
                                </TouchableOpacity>   
                            </View>
                            <Text style={{width: "100%", marginLeft: 10, fontSize: 12, paddingTop: 5}}>{his.emailTemplateName}</Text>
                            <Text style={{width: "100%", marginLeft: 10, fontWeight: "bold", fontSize: 12, paddingTop: 5}}>{his.subject}</Text>  
                        </View>
                    );
                    
            })(i);
        }        
        
        return indents;
    }
    
    onSaveButtonPress() {
        
        if (this.state.selectedTemplate == 999991998 || this.state.selectedTemplate == null) {
            toast.error(this.props.actions.translate.get('Mailing_select_template_or_create_new_one'));
            return;
        }
        
        var defaultT = null;
        if (this.state.emailDefaultTemplates)
            defaultT = this.state.emailDefaultTemplates.find((n) => {
                return n.idEmailTemplate == this.state.selectedTemplate;
            });
                
        if (defaultT)
            this.saveTemplate();
        else {
            global.frontLayer.display(true);
            this.setState({modalAssignTemplateAsDefaultVisible: true});
        }
    }
    
    onDeleteButtonPress() {
        var {type} = this.props;
        var that = this;
        
        if (this.state.selectedTemplate == 999991999) {
            toast.error(this.props.actions.translate.get('Mailing_you_cannot_delete_not_saved_template'));
            return;
        }
        
        if (this.state.selectedTemplate == 999991998 || this.state.selectedTemplate == null) {
            toast.error(this.props.actions.translate.get('Mailing_select_template_for_deleting'));
            return;
        }
        
        global.frontLayer.display(true);
        this.setState({modalDeleteTemplateVisible: true});
    }

    renderSendEmailModal() {

        if (this.state.modalSendEmailVisible) {
            global.frontLayer.renderLayer(() => {
                return (
                        <Modal animationType="fade" loadingModal={false} inStyle={[this.style.modalIn, {maxWidth: 400}]} visible={this.state.modalSendEmailVisible} onClose={() => {
                                global.frontLayer.display(false);      
                                this.setState({modalSendEmailVisible: false});
                            }}>
                            <View style={[this.style.modalView, {width: "100%"/*, borderWidth: 1, borderColor: "red"*/}, Platform.OS == "web"? {height: "100%"} : {}]}>
                                <ScrollView scrollEventThrottle={1000} style={[{width: "100%"}, Platform.OS == "web"? {height: "100%"} : {}]} contentContainerStyle={{justifyContent: "space-between"}}>
                                    <View style={{width: "100%", paddingLeft: 40, paddingRight: 40}}>

                                        <View style={{marginTop: 5}}>
                                            <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Mailing_enter_email_to_send_test')}</Text>
                                        </View>
                                        <FliwerTextInput 
                                            textInputRef={(input) => {
                                                this._testTo = input;
                                            }}
                                            containerStyle={[loginStyles.textFieldContainerStyle, this.style.textInputContainerStyle]}
                                            style={this.style.textInputStyle}
                                            autoCapitalize = 'none'
                                            returnKeyType = {"next"}
                                            placeholder={"E-mail"}
                                            keyboardType={"default"} 
                                        />

                                        <View style={{alignSelf: "center", marginTop: 0}}>
                                            <FliwerGreenButton 
                                                text={this.props.actions.translate.get('Mailing_send_test_email')} 
                                                style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: FliwerColors.complementary.blue}]} 
                                                containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 200}]}
                                                onPress={() => {
                                                    //console.log("this._testTo",this._testTo)
                                                    var testTo = this._testTo.value;
                                                    if (!testTo) {
                                                        toast.error(this.props.actions.translate.get('Mailing_enter_email_to_send_test'));
                                                        return;
                                                    }
                                                    if (!FliwerCommonUtils.validateEmail(testTo)) {
                                                        toast.error(this.props.actions.translate.get('Mailing_email_is_not_valid'));
                                                        return;
                                                    }
                                                    
                                                    this.state.testTo = testTo;
                                                    this.sendEmail(true);
                                                }}/>                       
                                        </View> 

                                        <View style={{flexDirection: "row", alignSelf: "center", marginTop: 30, marginBottom: 10}}>
                                            <FliwerGreenButton 
                                                text={this.props.actions.translate.get('Mailing_send_email')} 
                                                style={FliwerStyles.fliwerGreenButtonStyle} 
                                                containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 120}]}
                                                onPress={() => {
                                                    this.sendEmail();
                                                }}/>       
                                            <FliwerGreenButton 
                                                text={this.props.actions.translate.get('general_cancel')} 
                                                style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: "silver", color: "black"}]} 
                                                containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 120, marginLeft: 10, marginRight: 10}]}
                                                onPress={() => {
                                                    global.frontLayer.display(false);
                                                    this.setState({modalSendEmailVisible: false});
                                                }}/>                        
                                        </View>  

                                    </View>                  
                                </ScrollView>
                            </View>
                        </Modal>
                    );          
            });
        } else
            return [];

    }
    
    isDisabled() {
        return (!this.state.selectedTemplate || this.state.selectedTemplate==999991998);
    }
    
    renderModalAssignTemplateAsDefault() {

        if (this.state.modalAssignTemplateAsDefaultVisible) {
            global.frontLayer.renderLayer(() => {
                return (      
                    <FliwerDeleteModal
                        visible={this.state.modalAssignTemplateAsDefaultVisible}
                        onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({modalAssignTemplateAsDefaultVisible: false, assignTemplateAsDefault: false}, () => {
                                this.saveTemplate();
                            });
                        }}
                        onConfirm={() => {
                            global.frontLayer.display(false);
                            this.setState({modalAssignTemplateAsDefaultVisible: false, assignTemplateAsDefault: true}, () => {
                                this.saveTemplate();
                            });
                        }}
                        title={this.props.assignQuestionAsDefault}
                        subtitle={true}
                        text={this.props.assignSubtitleQuestionAsDefault}
                        hiddeText={false}
                        password={false}
                        loadingModal={false}
                        />
                );             
            });
        } else
            return [];

    }
    
    renderModalDeleteTemplate() {

        if (this.state.modalDeleteTemplateVisible) {
            global.frontLayer.renderLayer(() => {
                return (      
                    <FliwerDeleteModal
                        visible={this.state.modalDeleteTemplateVisible}
                        onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({modalDeleteTemplateVisible: false});
                        }}
                        onConfirm={() => {
                            global.frontLayer.display(false);
                            this.setState({modalDeleteTemplateVisible: false});
                            this.deleteTemplate(); 
                        }}
                        title={this.props.actions.translate.get('Mailing_are_you_sure_to_delete_the_template')}
                        hiddeText={true}
                        password={false}
                        loadingModal={false}
                        />
                );             
            });
        } else
            return [];

    }

    printTemplates()
    {
        var templates = [];
            
        if (Platform.OS == "android" || Platform.OS == 'ios')
            templates.push({label: this.props.actions.translate.get('Mailing_select_template'), value: 999991998});

        templates.push({label: this.props.actions.translate.get('Mailing_create_new_template'), value: 999991999});

        if (this.state.templates)
        {
            this.state.templates.sort((a, b) => {
                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else {
                    return 0;
                }
            });

            for (var index in this.state.templates)
            {
                var template = {};
                let id = this.state.templates[index].id;
                var defaultT = null;
                if (this.state.emailDefaultTemplates)
                    defaultT = this.state.emailDefaultTemplates.find((n) => {
                        return n.idEmailTemplate == id;
                    });
                template.label = this.state.templates[index].name + (defaultT? (" (" + this.props.actions.translate.get('general_main').toUpperCase() + ")") : "");
                template.value = id;
                templates.push(template);
            }
        }

        return templates;
    }

    renderLanguageSelectionModal() {
        
        if (this.state.modalLanguageSelectionVisible) {
            global.frontLayer.renderLayer(() => {
                return (
                        <Modal animationType="fade" loadingModal={false} inStyle={[this.style.modalIn, {maxWidth: 400}]} visible={this.state.modalLanguageSelectionVisible} onClose={() => {
                                global.frontLayer.display(false);    
                                this.setState({modalLanguageSelectionVisible: false});
                            }}>
                            <View style={[this.style.modalView, {width: "100%"/*, borderWidth: 1, borderColor: "red"*/}, Platform.OS == "web"? {height: "100%"} : {}]}>
                                <ScrollView scrollEventThrottle={1000} style={[{width: "100%"}, Platform.OS == "web"? {height: "100%"} : {}]} contentContainerStyle={{justifyContent: "space-between"}}>
                                    <View style={{width: "100%", paddingLeft: 40, paddingRight: 40}}>

                                        <View style={{marginTop: 5}}>
                                            <Text style={[this.style.textFormat, {textAlign: "center"}]}>{this.props.actions.translate.get('Mainling_select_template_lang')}</Text>
                                        </View>

                                        <View style={{flexDirection: "row", alignSelf: "center", marginTop: 30, marginBottom: 10}}>
                                            <FliwerGreenButton 
                                                text={"Castellano"} 
                                                style={FliwerStyles.fliwerGreenButtonStyle} 
                                                containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 120}]}
                                                onPress={() => {
                                                    this.getNewMailingTemplate(1);
                                                }}/>       
                                            <FliwerGreenButton 
                                                text={"English"} 
                                                style={[FliwerStyles.fliwerGreenButtonStyle, {}]} 
                                                containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 120, marginLeft: 10, marginRight: 10}]}
                                                onPress={() => {
                                                    this.getNewMailingTemplate(2);
                                                }}/>                        
                                        </View>  

                                    </View>                  
                                </ScrollView>
                            </View>
                        </Modal>
                    );                
            });
        } else
            return [];

    }

    renderEmailHistoryModalView() {

        if (this.state.emailHistoryModalVisible) {
            global.frontLayer.renderLayer(() => {    
                
                var url = extraService.BASE_URL + "/htmlEmail?" + 
                    "id=" + this.state.emailHistoryId + 
                    "&platformOS=" + Platform.OS;
            
                return (
                    <Modal animationType="fade" loadingModal={false} inStyle={[FliwerStyles.modalIn, {maxWidth: 600}]} visible={true} onClose={() => {
                            global.frontLayer.display(false);    
                            this.setState({emailHistoryModalVisible: false});
                        }}>
                        <View style={[FliwerStyles.modalView, {
                                paddingLeft: 20,
                                paddingRight: 20}]
                            }>
                            <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}>
                                <View style={{width: "100%", height: 500}}>

                                    <View style={{width: "100%", flex: 1, borderWidth: 1, borderRadius: 4, borderColor: "silver", padding: 10}}>
                                        <WebView 
                                            url={url} 
                                            height={Platform.OS === 'web'? '100%' : 300} 
                                            width={'100%'} 
                                        />           
                                    </View>  

                                    <View style={{alignSelf: "center", marginTop: 15}}>
                                        <FliwerGreenButton 
                                            text={this.props.actions.translate.get('general_close')} 
                                            style={[FliwerStyles.fliwerGreenButtonStyle, {backgroundColor: FliwerColors.primary.gray}]} 
                                            containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {marginBottom: 0, width: 150}]}
                                            onPress={() => {
                                                global.frontLayer.display(false);    
                                                this.setState({emailHistoryModalVisible: false});
                                            }}/>                       
                                    </View>                          

                                </View>                  
                            </ScrollView>
                        </View>
                    </Modal>
                );         
            });
        } else
            return [];
        
    }
    
    getNewMailingTemplate(lang) {
        var {title, type, assignTo} = this.props;
        var that = this;
        this.props.actions.academyActions.getNewMailingTemplate(type, assignTo, lang).then((response) => {
            var template = response.template;
            new Promise(function (resolve, reject) {
                if (Platform.OS == "web")
                    resolve();
                else
                    that.setState({showHtmlEditor: false}, () => {
                        resolve();
                    });                                        
            }).then(() => {
                global.frontLayer.display(false);
                that.setState({modalLanguageSelectionVisible: false, showHtmlEditor: true, selectedTemplate: 999991999, templateName: template.name, headerText: template.headerText, subject: (template.subject? template.subject : title), message: template.message, lang: lang});
            });

        }, (error) => {
            toast.error(error.reason);
        });    
    }
    
    isValidTemplate() {
        var that = this;
        return new Promise(function (resolve, reject) {
            if (!that.state.templateName) {
                reject(that.props.actions.translate.get('Mailing_template_name_cannot_be_left_blank'));
                return;
            }

            if (!that.state.subject) {
                reject(that.props.actions.translate.get('Mailing_template_subject_cannot_be_left_blank'));
                return;
            }

            if (!that.state.to) that.state.to= that._testTo.value;
            if (!that.state.to) {
                reject(that.props.actions.translate.get('Mailing_template_recipient_cannot_be_left_blank'));
                return;
            }
            
            var isEmailValid = true;
            var toPieces = that.state.to.split(";");
            for (var i=0; i<toPieces.length; i++) {
                var to = toPieces[i].trim();
                if (!FliwerCommonUtils.validateEmail(to))
                    isEmailValid = false;
            }
            if (!isEmailValid) {
                reject(that.props.actions.translate.get('Mailing_email_is_not_valid'));
                return;
            } 

            if (!that.state.message) {
                reject(that.props.actions.translate.get('Mailing_email_message_cannot_be_blank'));
                return;
            }       
            
            resolve();
        });           
    }

    sendEmail(isTest) {
        var that = this;
        
        this.isValidTemplate().then(() => {
            
            global.frontLayer.display(false);
            that.setState({modalSendEmailVisible: false});
            
            var isNewTemplate = (that.state.selectedTemplate == 999991999);
            
            that.props.setLoading(true);
            that.props.actions.academyActions.sendEmail({
                templateId: that.state.selectedTemplate,
                isNewTemplate: isNewTemplate,
                assignTemplate: false,
                assignTemplateAsDefault: false,
                assignTo: that.props.assignTo,
                templateType: that.props.type,
                templateName: that.state.templateName,
                headerText: that.state.headerText,
                subject: that.state.subject,
                to: isTest? that.state.testTo : that.state.to,
                message: that.state.message,
                isTest: isTest,
                lang: that.state.lang
            }).then((response) => {
                //console.log("response", response);
                var template = response.template;
                that.props.setLoading(false);
                toast.notification(that.props.actions.translate.get('Mailing_email_has_been_sent_successfully'));
                global.frontLayer.display(false);
                that.setState({modalSendEmailVisible: false, message: template.message, emailHistory: response.emailHistory});
                if (isNewTemplate) {
                    that.props.actions.academyActions.getDefaultEmailTemplates();
                    console.log("emailHistory", response.emailHistory);
                    that.props.onSuccess(null, null, null, response.emailHistory);
                }
                else
                    that.props.onSentEmail(that.state.assignTemplateAsDefault? template.id : null, response.emailHistory);
            }, (error) => {
                that.props.setLoading(false);
                toast.error(error.reason);
            });  
        }, (err) => {
            toast.error(err);
        });
          
    }

    saveTemplate() {
        var that = this;
        
        this.isValidTemplate().then(() => {
            that.props.setLoading(true);
            that.props.actions.academyActions.saveEmailTemplate({
                templateId: that.state.selectedTemplate,
                isNewTemplate: (that.state.selectedTemplate == 999991999),
                assignTemplate: that.state.assignTemplateChanged,
                desassignedTemplate: !that.state.assignTemplate,
                assignTemplateAsDefault: that.state.assignTemplateAsDefault,
                assignTo: that.props.assignTo,
                templateType: that.props.type,
                templateName: that.state.templateName,
                headerText: that.state.headerText,
                subject: that.state.subject,
                to: that.state.to,
                message: that.state.message,
                lang: that.state.lang
            }).then((template) => {
                //console.log("template", template);
                that.props.setLoading(false);
                toast.notification(that.props.actions.translate.get('Mailing_template_has_been_saved_successfully'));
                // Refresh default email templates asyncronously
                that.props.actions.academyActions.getDefaultEmailTemplates();
                that.props.onSuccess(that.state.assignTemplate || that.state.assignTemplateAsDefault? template.id : null, 
                                     that.state.assignTemplateChanged, 
                                     that.state.assignTemplate? template.id : null);
            }, (error) => {
                that.props.setLoading(false);
                toast.error(error.reason);
            });  
        }, (err) => {
            toast.error(err);
        });
          
    }

    deleteTemplate() {
        var that = this;
        
        that.props.setLoading(true);
        that.props.actions.academyActions.deleteEmailTemplate(that.state.selectedTemplate).then((response) => {
            //console.log("template", template);
            that.props.setLoading(false);
            toast.notification(that.props.actions.translate.get('Mailing_template_has_been_removed_successfully'));
            that.props.onSuccess();
        }, (error) => {
            that.props.setLoading(false);
            toast.error(error.reason);
        });  
          
    }
    
};

function mapStateToProps(state, props) {
    return {
        academyDataReducer: state.academyReducer.data,
        language: state.languageReducer.language,
        emailDefaultTemplatesReducer: state.academyReducer.emailDefaultTemplates
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            academyActions: bindActionCreators(ActionAcademy, dispatch)
        }
    };
}

var style = {
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        overflow: "hidden",
        width: "90%",
        maxWidth: 1000,
        height: "auto",
        maxHeight: "80%"
    },
    modalView: {
        paddingTop: 25,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
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
        fontSize: 15,
        color: "gray",
        fontStyle: "normal"
    },
    textInputContainerStyle: {
        marginTop: 2, height: 40
    },
    textInputStyle: {
        textAlign: 'left', backgroundColor: "white", borderRadius: 4
    },
    tab: {
        marginTop: 10, padding: 5
    },
    deleteButtonWrapper: {
        position: "absolute",
        bottom: 20,
        right: -20
    },
    deleteButton: {
        color: "red"
    },
    ":hover": {
        deleteButton: {
            filter: "brightness(115%)"
        }
    },
    "@media (width<=500)": {
        deleteButtonWrapper: {
            right: 0
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FliwerMailing));
