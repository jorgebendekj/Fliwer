'use strict';

import React, { Component } from 'react';
import {View, ScrollView, Platform, Text, Linking, TouchableOpacity} from 'react-native';

import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'

import Modal from '../../widgets/modal/modal'
import {toast} from '../../widgets/toast/toast'


class FliwerUpdateAppModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {forceUpdateApp, versionCode, versionName} = this.props;
        
        return (
            <Modal animationType="fade" loadingModal={false} inStyle={[FliwerStyles.modalIn, {maxWidth: 500}]} visible={true} onClose={() => {
                    if (!forceUpdateApp)
                        this.onPressLater();
                }}>
                <View style={[FliwerStyles.modalView, {
                        paddingLeft: 20,
                        paddingRight: 20, height: null}]
                    }>
                    <ScrollView scrollEventThrottle={1000} style={FliwerStyles.modalScrollViewStyle} contentContainerStyle={{justifyContent: "space-between"}}>
                        <View style={{width: "100%", alignItems: "center"}}>

                            <Text style={FliwerStyles.titleStyle} >{
                                //"Hay una nueva actualización disponible"
                                this.props.actions.translate.get('UpdateApp_new_available_version')
                            }</Text>
                            <Text style={[FliwerStyles.littleTextStyle, {marginTop: 5}]} >{versionName + " (" + versionCode + ")"}</Text>
                            
                            <Text style={[FliwerStyles.littleTextStyle, {marginTop: 30}]} >{
                                //"Puedes descargarte la nueva versión de Fliwer, haciendo clic en el siguiente botón."
                                this.props.actions.translate.get('UpdateApp_download_new_version')
                            }</Text>

                            <View style={{alignSelf: "center", marginTop: 15}}>
                                <FliwerGreenButton 
                                    text={
                                        //"ACTUALIZAR AHORA" 
                                        this.props.actions.translate.get('UpdateApp_update_now').toUpperCase()
                                    } 
                                    style={[FliwerStyles.fliwerGreenButtonStyle]} 
                                    containerStyle={[FliwerStyles.fliwerGreenButtonContainerStyle, {width: 350}]}
                                    onPress={() => {
                                        if (Platform.OS === 'android' || Platform.OS === 'ios') {
                                           
                                            var url;
                                            if (Platform.OS === 'android')
                                                url = "https://play.google.com/store/apps/details?id=com.myfliwer";
                                            else
                                                url = "https://apps.apple.com/es/app/fliwer/id1120704069";
                                            
                                            Linking.openURL(url).catch((err) => {
                                                if (err) {
                                                    toast.error(err)
                                                }
                                            });
                                        } else {
                                            url = "https://play.google.com/store/apps/details?id=com.myfliwer";
                                            window.open(url, "_blank");
                                        }
                                        
                                    }}/>                       
                            </View>
                        </View>                  
                    </ScrollView>
                </View>
                    {!forceUpdateApp?<View style={this.style.closeButtonContainer}>
                        <TouchableOpacity style={this.style.closeButton} onMouseEnter={this.hoverIn('closeButton')} onMouseLeave={this.hoverOut('closeButton')}
                            onPress={() => {
                                this.onPressLater();
                              }
                            }>
                            <Text style={[FliwerStyles.littleTextStyle, this.style.closeButtonText]}>{
                                //"Quiero hacerlo en otro momento"
                                this.props.actions.translate.get('UpdateApp_i_wanna_do_later')
                            }</Text>
                        </TouchableOpacity>
                    </View>:null}
            </Modal>
        );

    }

    onPressLater() {
        this.props.actions.sessionActions.checkedVersion().then(() => {
            this.props.onClose();
        });        
    }
    
};


function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            sessionActions: bindActionCreators(ActionsSession, dispatch)
        }
    };
}

var style = {
    closeButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: -1
    },
    closeButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)",
        borderBottomLeftRadius: 10,
        borderRightWidth: 0,
        borderBottomRightRadius: 10
    },
    closeButtonText: {
        color: "red",
        //paddingBottom: 3
    },
    ":hover": {
        closeButton: {
            backgroundColor: "rgba(255,175,175,0.3)"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, FliwerUpdateAppModal));