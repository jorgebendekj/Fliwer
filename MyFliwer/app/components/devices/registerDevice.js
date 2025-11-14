'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, Image, TextInput, Platform, ScrollView, Dimensions, Keyboard} from 'react-native';

import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import ImageBackground from '../../components/imageBackground.js'
import Modal from '../../widgets/modal/modal'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerCard from '../custom/FliwerCard.js'
import FliwerNextBackButton from '../custom/FliwerNextBackButton.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { Redirect,withRouter } from '../../utils/router/router'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {loginStyles} from '../login/loginStyles.js'
import {toast} from '../../widgets/toast/toast'

import link  from '../../assets/img/device_linkwifi2.png'
import link_config_backpart  from '../../assets/img/devices/link_config_backpart.png'
import link_config_wifi  from '../../assets/img/devices/link_config_wifi.png'
import link_config_3G  from '../../assets/img/devices/link_config_3G.png'

import ic_launcher  from '../../assets/img/ic_launcher.png'
import applestore  from '../../assets/img/applestore.png'
import googleplay  from '../../assets/img/googleplay.png'

class RegisterDevice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idZone: this.props.match.params.idZone,
            serialNumber: null,
//            serialNumber: "A070710B0F001B49", // Fliwer Link WIFI Real
//            serialNumber: "ABCDEF00112200B1", // Fliwer Link 3G Fake
            goBack: false,
            goWifi: false,
            go3G: false,
            saving: false,
            visibleModalUseApp: false, //(Platform.OS == "web"),
            visibleModalUseAppRemember: false,
            registered: false,
            registeredDeviceType: '',
            gettingSizeImage: false, newWidth: null, newHeight: null,

            keyboardOffset: 0
        };

        this.onLayout();
    }

    componentDidMount() {
        if (Platform.OS === "ios") {
            this.keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                this._keyboardDidShow,
            );
            this.keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                this._keyboardDidHide,
            );
        }
    }

    _keyboardDidShow = event => {
          this.setState({keyboardOffset: event.endCoordinates.height});
    }

    _keyboardDidHide = () => {
          this.setState({keyboardOffset: 0});
    }

    render() {
        var that = this;
        if (this.state.goBack)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices/"} />);
        else if (this.state.goWifi)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices/new/linkwifi/" + this.state.serialNumber} />);
        else if (this.state.go3G)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices/new/link3g/" + this.state.serialNumber} />);
        else {

            var img = link_config_backpart;
            if (this.state.registered) {
                if (this.state.registeredDeviceType === "LINK_GPRS" || this.state.registeredDeviceType === "LINK_GPRS_PRO")
                    img = link_config_3G;
                else
                    img = link_config_wifi;
            }

            var congratulationsTitle = this.props.actions.translate.get('deviceRegisterVC_congratulations');
            if (!congratulationsTitle) congratulationsTitle = "Congratulations!";
            var notRegisteredTitle = this.props.actions.translate.get('deviceRegisterVC_title');
            var title = this.state.registered? congratulationsTitle : notRegisteredTitle;
            //var enterFliwerlinkId = this.props.actions.translate.get('deviceRegisterVC_label');
            var enterFliwerlinkId = this.props.actions.translate.get('deviceRegisterVC_enter_fliwerlink_id');
            if (!enterFliwerlinkId) enterFliwerlinkId = "Type your Fliwer Link Id";

            var dimensions = Dimensions.get('window');
            var titleOutMarginBottom = 20;
            var containerInCenteredMarginTop = 40;
            // Marc screen (610px height)
            if (dimensions.height < 650) {
                if (!this.state.registered) titleOutMarginBottom = 0;
                containerInCenteredMarginTop = 10;
            }

            return (
                    <ImageBackground style={this.style.background} loading={this.state.saving}>
                        <MainFliwerTopBar/>
                        <ScrollView style={this.style.contentView} contentContainerStyle={[this.style.contentViewContainer, {marginTop: this.state.keyboardOffset/2 * (-1)}]}>
                            <View style={[this.style.titleOut, {marginBottom: titleOutMarginBottom}]} onLayout={() => this.onLayout()}>
                                <Text style={[loginStyles.titleStyle, this.style.title]}>{title}</Text>
                            </View>
                            <View style={this.style.container}>
                                <View style={[this.style.containerImage, this.state.newHeight? {height: this.state.newHeight} : {}]}>
                                    <Image source={img} resizeMode={"contain"} style={this.style.image}/>
                                </View >
                                <View style={this.style.containerIn}>
                                    {!this.state.registered?
                                        <View style={[this.style.containerInCentered, {marginTop: containerInCenteredMarginTop}]}>
                                            <Text style={[loginStyles.descriptionStyle, this.style.text]}>{enterFliwerlinkId}</Text>
                                            <View style={this.style.inputContainer}>
                                                <TextInput
                                                    style={this.style.input}
                                                    placeholder={this.props.actions.translate.get('deviceRegisterVC_serial_number')}
                                                    onChangeText={(text) => that.setState({serialNumber: this.filterText(text)})}
                                                    maxLength={16}
                                                    autoCapitalize = 'characters'
                                                    value={this.state.serialNumber}
                                                    onSubmitEditing={() => {
                                                        this.registerDevice();
                                                    }}
                                                    blurOnSubmit={false}
                                                    />
                                            </View>
                                        </View>
                                    : null}
                                </View>
                            </View>
                        </ScrollView >
                        {this.renderBottom()}
                        {this.renderModalUseApp()}
                    </ImageBackground>
                    );
        }
    }

    renderBottom() {
        return (
            <View style={[this.style.bottomContainer, {}]}>
                <View style={this.style.continueButtonContainer}>

                    <FliwerNextBackButton
                        text={this.state.registered? this.props.actions.translate.get('general_continue') : this.props.actions.translate.get('deviceRegisterVC_button')}
                        containerStyle={{}}
                        onPress={() => {

                            if (this.state.registered) {
                                if (this.state.registeredDeviceType === "LINK_GPRS" || this.state.registeredDeviceType === "LINK_GPRS_PRO")
                                    this.setState({go3G: true});
                                else {
                                     if (Platform.OS == "web")
                                         this.setState({goBack: true});
                                     else
                                         this.setState({goWifi: true});
                                }
                            } else {
                                this.registerDevice();
                            }

                        }} onBack={() => {
                            this.setState({goBack: true});
                        }}
                        disabledBackButton={false}
                    />
                </View>
                {this.renderButtonBack()}
            </View>
        );
    }

    renderButtonBack() {
        return(
                <View style={this.style.buttonBackContainer}>
                    <TouchableOpacity style={this.style.buttonBack} onPress={() => {
                        this.setState({goBack: true})
                    }}>
                        <Text style={this.style.textBack}>{this.props.actions.translate.get('general_back')}</Text>
                    </TouchableOpacity>
                </View>
                );
    }

    renderModalUseApp()
    {
        var indents = []
        indents.push(
            <Modal animationType="fade" loadingModal={this.state.loading} inStyle={[this.style.modalIn, this.state.mediaStyle.orientation === "landscape" ? {maxWidth: 500} : {maxWidth: "89%"}]} visible={this.state.visibleModalUseApp} onClose={() => {
                    this.setState({visibleModalUseApp: false, visibleModalUseAppRemember: false})
                }}>
                <View style={[{paddingTop: 25, paddingBottom: 10, paddingLeft: 20, paddingRight: 20}]}>
                    <ScrollView scrollEventThrottle={1000} style={{flexGrow: 0}} contentContainerStyle={{alignItems: "center", alignSelf: "center"}}>
                        <View style={{alignItems: "center"}}>
                            <View style={{marginBottom: 20, width: "66%"}}>
                                <Text style={[{fontFamily: FliwerColors.fonts.title, color: FliwerColors.primary.black, textAlign: "center", fontSize: 18}]}>{this.state.visibleModalUseAppRemember? this.props.actions.translate.get("Devices_only_app_fliwer_lik_wifi") : this.props.actions.translate.get("Devices_only_app")}</Text>
                            </View>
                            <View style={{marginBottom: 20}}>
                                <Image style={{width: 55, height: 55}} resizeMode={"contain"} draggable={false} source={ic_launcher} />
                            </View>
                            <View style={{flexDirection: "row", width: "100%", justifyContent: "space-evenly"}}>
                                <View style={{marginBottom: 12, alignSelf: "center", marginRight: 14}}>
                                    <TouchableOpacity style={{}} onMouseEnter={this.hoverIn('iconAppStore')} onMouseLeave={this.hoverOut('iconAppStore')}  onPress={() => {
                                                window.open("https://apps.apple.com/es/app/fliwer/id1120704069", "_blank")
                                            }}>
                                        <Image style={{width: 120, height: 45}} resizeMode={"contain"} draggable={false} source={applestore} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{marginBottom: 12, alignSelf: "center"}}>
                                    <TouchableOpacity style={{}} onMouseEnter={this.hoverIn('iconGooglePlay')} onMouseLeave={this.hoverOut('iconGooglePlay')}  onPress={() => {
                                                window.open("https://play.google.com/store/apps/details?id=com.myfliwer", "_blank")
                                            }}>
                                        <Image style={{width: 120, height: 45}} resizeMode={"contain"} draggable={false} source={googleplay} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{marginBottom: 12}}>
                                <Text style={[this.style.textFormat, {textAlign: "center", fontSize: 14}]}>{this.props.actions.translate.get("Devices_setup_app")}</Text>
                            </View>
                        </View>
                        <FliwerGreenButton onPress={() => {
                            this.setState({visibleModalUseApp: false, visibleModalUseAppRemember: false})
                        }} text={this.props.actions.translate.get("Devices_button_close")} style={{padding: 7, width: null}} containerStyle={{height: 31, marginTop: 20, marginBottom: 11, width: null, minWidth: 135}}/>
                    </ScrollView>
                </View>
            </Modal>
                );
        return indents;
    }

    registerDevice() {

        if (Platform.OS == "android" || Platform.OS == 'ios' || this.props.roles.fliwer)
        {
            this.addDevice();
        }
        else
        {
            this.setState({saving: true});
            this.props.actions.fliwerDeviceActions.checkDevice(this.state.serialNumber, 'any'/*'LINK'*/).then((type) => {
                //console.log("type", type);
                if (type.includes("LINK_GPRS"))
                    this.addDevice();
                else if (type.includes("LINK_WIFI"))
                    this.setState({visibleModalUseApp: true, saving: false});
                else{
                    toast.error("Dispositivo libre, pero no es un Fliwer Link");
                    this.setState({saving: false});
                }
            }, (err) => {
                this.setState({saving: false});
                if (err && err.reason){
                    var text = err.reason;
                    if (err.email)text+=". id: "+err.idDevice+". Email: "+err.email+". Home: "+err.home;
                    toast.error(text);
                }
            });
        }
    }

    addDevice() {

        this.setState({saving: true});
        this.props.actions.fliwerDeviceActions.addLink(this.state.serialNumber, this.state.idZone).then((type) => {
            if (type.includes("LINK_GPRS"))
                this.setState({registered: true, registeredDeviceType: "LINK_GPRS", saving: false});
            else if (type.includes("LINK_WIFI"))
                this.setState({registered: true, registeredDeviceType: "LINK_WIFI", saving: false});
            else{
                toast.error("Dispositivo libre, pero no es un Fliwer Link");
                this.setState({saving: false});
            }
        }, (err) => {
            this.setState({saving: false});
            if (err && err.reason){
                var text = err.reason;
                if (err.email)text+=". id: "+err.idDevice+". Email: "+err.email;
                toast.error(text);
            }
        });
    }

    filterText(text) {
        text = text.toUpperCase().replace(/[^ABCDEF0-9]/g, "");
        return text;
    }

    onLayout() {
        if (Platform.OS != 'web') return;
        this.getSizeImage(link_config_backpart);
    }

    getSizeImage(url)
    {
        if (!url || this.state.gettingSizeImage) {
            return;
        }

        this.state.gettingSizeImage = true;

        Image.getSize(url, (srcWidth, srcHeight) => {

            //console.log("srcWidth, srcHeight", srcWidth, srcHeight);
            var customSize = this.getCustomSize(srcWidth, srcHeight);
            var newWidth = customSize.width;
            var newHeight = customSize.height;
            console.log("newWidth, newHeight", newWidth, newHeight);
            this.setState({gettingSizeImage: false, newWidth: newWidth, newHeight: newHeight});

        }, error => {
            //console.log('error:', error);
        });
    }

    getCustomSize(srcWidth, srcHeight)
    {
        const dimensions = Dimensions.get('window');
        var newWidth, newHeight;

        if (dimensions.width > 500)
        {
            newWidth = 500 - 40;

            if (dimensions.width > 800)
            {
                // Marc screen (600px height)
                if (dimensions.height < 750) {
                    newWidth = 400 - 40;
                }
            }
        }
        else
        {
            newWidth = dimensions.width - 40;
        }

        var ratio = newWidth / srcWidth;
        newHeight = srcHeight * ratio;

        return {
            width: newWidth,
            height: newHeight,
        };
    }

};


function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language,
        roles: state.sessionReducer.roles
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}


var style = {
    background: {
        backgroundColor: "rgb(240,240,240)",
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        maxWidth: "83%",
        overflow: "hidden",
    },
    modalView: {
        paddingTop: 25,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
    },
    contentView: {
        width: "100%",
        flex: 1
    },
    contentViewContainer: {
        alignItems: 'center',
        marginBottom: 40
    },
    titleOut: {
        width: "100%",
//        backgroundColor: "red", borderWidth: 1,
        marginTop: 20,
        paddingLeft: 20,
        paddingRight: 20
    },
    title: {
        marginTop: 0,
    },
    text: {
        paddingBottom: 10,
        marginTop: 0,
        textAlign: "center"
    },
    container: {
        width: "100%",
        alignItems: "center"
    },
    containerIn: {
        width: "100%",
        maxWidth: 300
    },
    containerInCentered: {
        width: "100%",
        paddingLeft: 20,
        paddingRight: 20
    },
    containerImage: {
//        backgroundColor: "red", borderWidth: 1,
        width: "100%",
        height: 300
    },
    image: {
        width: "100%",
        height: "100%"
    },
    inputContainer: {
        height: 40,
        width: "100%",
        marginBottom: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRadius: 4
    },
    input: {
        height: "100%",
        width: "100%",
        fontFamily: "MyriadPro-Regular",
        borderColor: "rgb(115,115,115)",
        borderRadius: 4,
        padding: 10
    },
    buttonContainer: {
        height: 40,
        width: "100%",
        maxWidth: 300,
        marginTop: 20,
        marginBottom: 20,
        alignSelf: "center"
    },
    buttonAccess: {
        backgroundColor: "#d59e0d",
        height: "100%",
        width: "100%",
        borderRadius: 4,
        alignItems: 'center',
        flexDirection: 'row'
    },
    buttonAccessIn: {
        flex: 1,
        fontSize: 20,
        color: "white",
        fontFamily: "MyriadPro-Regular",
        textAlign: "center"
    },
    buttonBackContainer: {
        width: "100%",
        position: "absolute",
        bottom: 0,
        display: "flex",
        flexDirection: "row"
    },
    textBack: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 30,
        textAlign: "center",
        color: "white"
    },
    buttonBack: {
        backgroundColor: "#555555",
        height: 55,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1
    },
    bottomContainer: {
        width: "100%",
        height: 150,
//        backgroundColor: "red",
        paddingTop: 20
    },
    continueButtonContainer: {
        height: 40,
        width: "100%",
        maxWidth: 300,
        marginBottom: 95,
        alignSelf: "center"
    },
    continueButtonAccess: {
        backgroundColor: "#d59e0d",
        height: "100%",
        width: "100%",
        borderRadius: 4,
        alignItems: 'center',
        flexDirection: 'row'
    },
    continueButtonAccessIn: {
        flex: 1,
        fontSize: 20,
        color: "white",
        fontFamily: "MyriadPro-Regular",
        textAlign: "center"
    },
    textFormat: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
    }
};

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, RegisterDevice)));
