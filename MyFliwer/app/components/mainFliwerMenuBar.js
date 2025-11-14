'use strict';

import React, { Component } from 'react';
import {View, TouchableOpacity, Platform, Image} from 'react-native';

import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../utils/mediaStyleSheet.js'

import * as ActionAcademy from '../actions/academyActions.js'; //Import your actions

import { Redirect } from '../utils/router/router'
import {FliwerColors, CurrentTheme} from '../utils/FliwerColors'

import FliwerCalmButton from './custom/FliwerCalmButton.js'

import fliwer_icon_gray  from '../assets/img/fliwer_icon_gray.png'
import fliwer_icon_green  from '../assets/img/fliwer_icon1.png'
import fliwer_logo from '../assets/img/Poweredbyfliwer.png'

class MainFliwerMenuBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            goTo: null
        };
    }

    render() {
        var that = this;

        var indents = [];

        if (this.state.goTo == 'zone') {
            indents.push(<Redirect push to={"/zone"} />);
        } else if(this.state.goTo == 'plants') {
            indents.push(<Redirect push to={"/zone/"+this.props.idZone+"/plants"} />);
        } else if(this.state.goTo == 'devices') {
            indents.push(<Redirect push to={"/zone/"+this.props.idZone+"/devices"} />);
        } else if(this.state.goTo == 'history') {
            indents.push(<Redirect push to={"/zone/"+this.props.idZone+"/history"} />);
        } else if(this.state.goTo == 'params') {
            indents.push(<Redirect push to={"/zone/"+this.props.idZone} />);
        } else if(this.state.goTo == 'files') {
            indents.push(<Redirect push to={"/files"}/>);
        } else if(this.state.goTo == 'academy') {
            indents.push(<Redirect push to={"/academyCourses"}/>);
        } else if(this.state.goTo == 'gardener') {
            indents.push(<Redirect push to={"/gardener"}/>);
        } else if(this.state.goTo == 'map') {
            indents.push(<Redirect push to={"/app/fliwer"}/>);
        }else if(this.state.goTo == 'business') {
            indents.push(<Redirect push to={"/business"}/>);
        } 

        // Remove icons
        var index;
        /*index = that.props.icons.indexOf("plants");
        if (index !== -1)
            that.props.icons.splice(index, 1);
         */

        var icons=that.props.icons;
        var onPress=that.props.onPress;
        if(icons.find(i=>i=="gardener") && this.props.roles.fliwer && !icons.find(i=>i=="map") )icons.splice(0, 0, "map");
        if(icons.find(i=>i=="gardener") && (this.props.roles.manager || this.props.roles.angel || this.props.roles.fliwer) && !icons.find(i=>i=="business"))icons.splice(0, 0, "business");

        index = icons.indexOf("academy");
        if (index !== -1)
            icons.splice(index, 1);

        for (var i = 0; i < icons.length; i++) {
            (function(i) {
                var icon = icons[i];

                var iconTypeFont = 'IconFontAwesome';
                var iconName;
                var iconSize = 25;
                var iconColor = that.props.current==icon?/*FliwerColors.primary.green*/CurrentTheme.complementaryText:CurrentTheme.primaryText;
                if (icon == 'zone')
                    iconName = 'home';
                else if (icon == 'params')
                    iconName = 'thermometer-half';
                else if (icon == 'devices') {
                    iconTypeFont = 'IconMaterialCommunityIcons';
                    iconName = 'devices';
                }
                else if (icon == 'history')
                    iconName = 'list-ul';
                else if (icon == 'plants')
                    iconName = 'leaf';
                else if (icon == 'files') {
                    iconTypeFont = 'IconMaterialCommunityIcons';
                    iconName = 'angular';
                }
                else if (icon == 'academy') {
                    iconTypeFont = 'IconMaterialCommunityIcons';
                    iconName = 'school';
                }
                else if (icon == 'mapview')
                    iconName = 'map-marker';
                else if (icon == 'mailing') {
                    iconName = 'envelope';
                    iconSize = 20;
                }
                else if (icon == 'pages') {
                    //iconName = 'file';
                    iconName = 'eye';
                    //iconSize = 20;
                }
                else if (icon == 'ticket') {
                    iconTypeFont = 'IconFeather';
                    iconName = 'tool';
                }
                else if (icon == 'course') {
                    iconTypeFont = 'IconMaterialCommunityIcons';
                    iconName = 'teach';
                }
                else if (icon == 'audit')
                    iconName = 'search';
                else if (icon == 'invitation') {
                    iconTypeFont = 'IconMaterialIcons';
                    iconName = 'insert-invitation';
                }
                else if (icon == 'sepa') {
                    iconTypeFont = 'IconEntypo';
                    iconName = 'text-document';
                }
                else if (icon == 'order') {
                    iconTypeFont = 'IconMaterialCommunityIcons';
                    iconName = 'file-document-edit-outline';
                }
                else if (icon == 'invoice')
                    iconName = 'euro';
                else if (icon == 'contract'){
                    iconTypeFont = 'IconEntypo';
                    iconName = 'news';
                }else if(icon == 'business'){
                    iconTypeFont = 'IconMaterialCommunityIcons';
                    iconName = 'office-building';
                }else if(icon=='map'){
                    iconTypeFont = 'IoniconsIcon';
                    iconName = 'map-outline';
                }

                var iconTag = [];
                if (icon == 'gardener') {
                    iconSize = 23;
                    iconTag.push(<Image style={{width: iconSize, height: iconSize}} source={that.props.current==icon?fliwer_icon_green:fliwer_icon_gray} resizeMode={"contain"} draggable={false}/>);
                }
                else {
                    if (iconTypeFont == 'IconMaterialCommunityIcons')
                        iconTag.push(<IconMaterialCommunityIcons name={iconName} size={iconSize} style={{color: iconColor}} />);
                    else if (iconTypeFont == 'IconFeather')
                        iconTag.push(<IconFeather name={iconName} size={iconSize} style={{color: iconColor}} />);
                    else if (iconTypeFont == 'IconMaterialIcons')
                        iconTag.push(<IconMaterialIcons name={iconName} size={iconSize} style={{color: iconColor}} />);
                    else if (iconTypeFont == 'IconEntypo')
                        iconTag.push(<IconEntypo name={iconName} size={iconSize} style={{color: iconColor}} />);
                    else if (iconTypeFont == 'IoniconsIcon')
                        iconTag.push(<IoniconsIcon name={iconName} size={iconSize} style={{color: iconColor}} />);
                    else
                        iconTag.push(<IconFontAwesome name={iconName} size={iconSize} style={{color: iconColor}} />);
                }

                    indents.push(
                        <View  style={that.style.actionButton}>
                            <TouchableOpacity style={{padding: 2}} activeOpacity={1}
                                disabled={false/*that.props.current != "mapview" && that.props.current==icon*/}
                                onPress={() => {
                                    let icon = icons[i];

                                    if(onPress && onPress.length>0 && onPress[i])
                                        onPress[i]();
                                    else{
                                        if (icon == 'mapview')
                                            that.props.onPressMapView();
                                        else if (icon == 'pages')
                                            that.props.onPressPages();
                                        else if (icon == 'mailing' ||
                                                 icon == 'ticket' ||
                                                 icon == 'audit' ||
                                                 icon == 'invitation' ||
                                                 icon == 'sepa' ||
                                                 icon == 'order' ||
                                                 icon == 'invoice' ||
                                                 icon == 'contract')
                                            that.props.onPressMailing();
                                        else if (icon == 'files')
                                            that.onClickFliwerIconFiles();
                                        else
                                            that.setState({goTo: icon});
                                    }

                                }}
                                >
                                {iconTag}
                            </TouchableOpacity>
                            {icon == 'files' && that.props.generalAlerts.notSignedContracts && that.props.generalAlerts.notSignedContracts>0 /*(that.props.notSignedContractsData.length>0 || that.props.notSignedAngelContractsData.length>0)*/ && !that.props.isVisitor?
                            <FliwerCalmButton
                                containerStyle={{
                                    position: 'absolute',
                                    top: 0,
                                    right: -12,
                                    width: 15, height: 15,
                                    borderRadius: 45,
                                    backgroundColor: "blue",
                                    alignItems: "center",
                                    alignContent: "center",
                                    justifyContent: "center"
                                }}
                                buttonStyle={{}}
                                onPress={() => {
                                    //if (that.props.current!=icon)
                                    that.onClickFliwerIconFiles();
                                }}
                                text={that.props.generalAlerts.notSignedContracts/*that.props.notSignedContractsData.length + that.props.notSignedAngelContractsData.length*/}
                                textStyle={{color: "white", fontSize: 10}}
                                disabled={false/*that.props.current==icon*/}
                            />
                            :null}
                        </View>
                    );
                })(i);
            }

            if(!global.envVars.TARGET_RAINOLVE || !(icons[0]=="zone" && icons[1]=="files") ){
              return (
                  <View style={[that.style.bar, Platform.OS == 'ios' && this.props.position != "top" ? {height: 60, paddingBottom: 10} : {}, that.props.barStyle, this.props.position == "top"? that.style.barOnTop : that.style.barOnBottom]}>
                      {indents}
                  </View>
              );
            }else{
              return (
                  <View style={[that.style.bar, Platform.OS == 'ios' && this.props.position != "top" ? {height: 60, paddingBottom: 10} : {}, that.props.barStyle, this.props.position == "top"? that.style.barOnTop : that.style.barOnBottom]}>
                      <Image style={{width: "100%", height: "100%"}} source={fliwer_logo} resizeMode={"contain"} draggable={false}/>
                  </View>
              );
            }

    }

    onClickFliwerIconFiles() {
        if (Platform.OS == 'web') {
            var hash = window.location.hash.replace(/#/g, '');
            hash = hash.replace(/\//g, '');
            console.log("hash", hash);
            if (hash != "files" &&  this.props.generalAlerts.notSignedContracts && this.props.generalAlerts.notSignedContracts>0/*(this.props.notSignedContractsData.length>0 || this.props.notSignedAngelContractsData.length>0)*/) {
                // Show the contracts view
                this.props.actions.academyActions.setCurrentIndexAcademyCategory(0).then(() => {
                    this.setState({goTo: 'files'});
                });
            }
            else
                this.setState({goTo: 'files'});
        }
        else
            this.setState({goTo: 'files'});
    }

};


function mapStateToProps(state, props) {
    return {
        isVisitor: state.sessionReducer.isVisitor,
        generalAlerts: state.sessionReducer.generalAlerts,
        notSignedContractsData: state.invoiceReducer.notSignedContractsData,
        notSignedAngelContractsData: state.invoiceReducer.notSignedAngelContractsData,
        roles: state.sessionReducer.roles
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            academyActions: bindActionCreators(ActionAcademy, dispatch)
        }
    };
}

var styles = {
    bar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        backgroundColor: "@theme primaryColor",
        justifyContent: "center"
    },
    barOnTop: {
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1
    },
    barOnBottom: {
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1
    },
    actionButton: {
        marginLeft: 20, marginRight: 20
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, MainFliwerMenuBar));
