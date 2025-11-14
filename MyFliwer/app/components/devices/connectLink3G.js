'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, Platform, ScrollView, Dimensions } from 'react-native';

import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import ImageBackground from '../../components/imageBackground.js'
import FliwerNextBackButton from '../custom/FliwerNextBackButton.js'
import FliwerGreenButton from '../custom/FliwerGreenButton.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { Redirect, withRouter } from '../../utils/router/router'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {loginStyles} from '../login/loginStyles.js'
import {toast} from '../../widgets/toast/toast'

import link  from '../../assets/img/device_linkgprs.png'
import link_config_3G_plugged  from '../../assets/img/devices/link_config_3G_plugged.png'
import link_config_3G_reset  from '../../assets/img/devices/link_config_3G_reset.png'
import link_config_3G_empty_led  from '../../assets/img/devices/link_config_3G_empty_led_2.png'

class connectLink3G extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idZone: this.props.match.params.idZone,
            idLink: this.props.match.params.idLink,
            goDevices: false,
            status: 'connect-to-supply',
            statusMsg: '',
            timeout: null,
            blink: false,
            gettingSizeImage: false, newWidth: null, newHeight: null
        };

        this.onLayout();
    }

    render() {
        if (this.state.goDevices)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices"} />)
        else {
            return (
                    <ImageBackground style={this.style.background} loading={false}>
                        <MainFliwerTopBar/>
                        <ScrollView style={this.style.contentView} contentContainerStyle={this.style.contentViewContainer}>
                            {this.renderPage()}
                        </ScrollView >
                        <View style={{width: "100%", padding: 10}}>
                            <Text style={{color: "green", textAlign: "center"}}>{false? this.state.statusMsg : ""}</Text>
                        </View>
                        {this.renderBottom()}
                    </ImageBackground>
                    );
        }
    }

    setBlink(status)
    {
        switch (status) {
            case "wait-until-steady-light":
                this.state.timeout = setTimeout(() => {
                    this.setState({blink: !this.state.blink});
                    this.setBlink(this.state.status);
                }, 500);
                break;

            default:
                this.setState({blink: false});
                clearTimeout(this.state.timeout);
        }
    }

    renderPage()
    {
        var title = "";
        var subtitle = "";
        var info = "";
        var infoColor = "red";
        var img = link;
        var blinkColor = "transparent";
        var ledFixedColor = null;
        var showLed = false;

        if (this.state.status === 'connect-to-supply') {
            title = this.props.actions.translate.get('WIFI_connect_link_to_power_supply');
            img = link_config_3G_plugged;
        } else if (this.state.status === 'wait-until-steady-light') {
            title = this.props.actions.translate.get('LINK3G_trying_connect_network');
            subtitle = "Espera y, cuando esté en verde fijo, pulsa Continuar";
            img = link_config_3G_empty_led;
            showLed = true;
            blinkColor = "#ff63f7"; // Purple
        } else if (this.state.status === 'finish') {
            title = this.props.actions.translate.get('LINK3G_congrats_configured');
            //subtitle = "La luz pasará a verde fijo. Si no lo hace, repite el proceso";
            img = link_config_3G_empty_led;
            showLed = true;
            ledFixedColor = "lime"; // Green
//            info = "Si no consigues que la luz se quede verde fija, haz un reset del Fliwer Link";
//            infoColor = "gray";
        } else if (this.state.status === 'first-reset') {
            title = this.props.actions.translate.get('LINK_fliwer_link_reset');
            subtitle = this.props.actions.translate.get('LINK_reset_instructions');
            img = link_config_3G_reset;
        }

        var dimensions = Dimensions.get('window');
        var titleOutMarginBottom = 20;
        //var containerInCenteredMarginTop = 40;
        // Marc screen (610px height)
        if (dimensions.height < 650 || showLed) {
            titleOutMarginBottom = 0;
            //containerInCenteredMarginTop = 10;
        }

        return(
            <View style={{width: "100%", height: "100%"}} onLayout={() => this.onLayout()}>
                <View style={[this.style.titleOut, {marginBottom: titleOutMarginBottom}, img? {/*height: 82*/} : {}]}>
                    <Text style={[loginStyles.titleStyle, this.style.title]}>{title}</Text>
                </View>
                {img?
                <View style={{width: "100%", alignItems: "center"}}>
                    <View style={[this.style.containerImage, showLed? {height: 300, width: 400} : (this.state.newHeight? {height: this.state.newHeight} : {})]}>
                        <Image source={img} resizeMode={"contain"} style={this.style.image}/>
                        {showLed?<View style={[this.style.led, {backgroundColor: ledFixedColor? ledFixedColor : (this.state.blink? blinkColor : "gray")}]}></View>:null}
                    </View>
                </View>:null}
                {subtitle?
                    <View style={{width: "100%", marginTop: 0, paddingLeft: 20, paddingRight: 20}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text]}>{subtitle}</Text>
                    </View>:null}
                {info?
                    <View style={{width: "100%", marginTop: 40, paddingLeft: 40, paddingRight: 40}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text, {fontSize: 14, color: infoColor}]}>{info}</Text>
                    </View>:null}
                {info && this.state.status === 'finish'?
                    <View style={{width: "100%", marginTop: 10, paddingLeft: 20, paddingRight: 20, alignItems: "center"}}>
                        <FliwerGreenButton onPress={() => {
                            this.setBlink('first-reset');
                            this.setState({status: 'first-reset'});
                        }} text={"Reset"} style={{padding: 2, backgroundColor: "gray", color: "white", fontSize: 12}} containerStyle={{height: 25, width: 100}}/>
                    </View>:null}
            </View>
        );
    }

    renderBottom() {
        return (
            <View style={[this.style.bottomContainer, {}]}>
                <View style={this.style.continueButtonContainer}>

                    <FliwerNextBackButton
                        text={this.state.status === 'finish'? this.props.actions.translate.get('general_finalize') : this.props.actions.translate.get('general_continue')}
                        containerStyle={{}}
                        onPress={() => {
                            var status = "";

                            if (this.state.status === 'connect-to-supply')
                                status = 'wait-until-steady-light';
                            else if (this.state.status === 'wait-until-steady-light')
                                status = 'finish';
                            else if (this.state.status === 'first-reset')
                                status = 'wait-until-steady-light';
                            else {
                                // 'finish'
                                this.setBlink("");
                                this.setState({goDevices: true});
                                return;
                            }

                            this.setBlink(status);
                            this.setState({status: status});

                        }} onBack={() => {
                            var status = "";

                            if (this.state.status === 'first-reset')
                                status = 'wait-until-steady-light';
                            else if (this.state.status === 'finish')
                                status = 'wait-until-steady-light';
                            else if (this.state.status === 'wait-until-steady-light')
                                status = 'connect-to-supply';
                            else {
                                // 'connect-to-supply'
                                this.setBlink("");
                                this.setState({goDevices: true});
                                return;
                            }

                            this.setBlink(status);
                            this.setState({status: status});

                        }}
                    />

                </View>
                {this.renderButtonBack()}
            </View>
        );
    }

    renderButtonBack()
    {
        return(
            <View style={this.style.buttonBackContainer}>
                <TouchableOpacity style={this.style.buttonBack} onPress={() => {
                        this.setBlink('connect-to-supply');
                        this.setState({goDevices: true, status: 'connect-to-supply'});
                    }}>
                    <Text style={this.style.textBack}>{this.props.actions.translate.get('general_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    onLayout() {
        if (Platform.OS != 'web') return;

        switch (this.state.status) {
            case 'connect-to-supply':
                this.getSizeImage(link_config_3G_plugged);
                break;
            case 'first-reset':
                this.getSizeImage(link_config_3G_reset);
                break;
            default:
                //this.getSizeImage(link_config_3G_empty_led);
        }
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
        language: state.languageReducer.language
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}


var style = {
    background: {
        backgroundColor: "rgb(240,240,240)"
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
        marginTop: 0
    },
    subtitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
        paddingBottom: 10
    },
    text: {
        paddingBottom: 10,
        marginTop: 0,
        textAlign: "center"
    },
    containerImage: {
//        backgroundColor: "red", borderWidth: 1,
        width: "100%", height: 350, paddingLeft: 20, paddingRight: 20
    },
    image: {
        width: "100%",
        height: "100%"
    },
    led: {
        position: "absolute",
        top: 93,
        right: 98,
        width: 32,
        height: 32,
        borderRadius: 45,
        borderWidth: 1,
        borderColor: "silver"
    },
    continueButtonContainer: {
        height: 40,
        width: "100%",
        maxWidth: 300,
        alignSelf: "center"
    },
    inputContainer: {
        height: 40,
        marginBottom: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRadius: 4,
        backgroundColor: "white",
        maxWidth: 400,
        width: 150,
    },
    input: {
        height: "100%",
        width: "100%",
        fontFamily: "MyriadPro-Regular",
        borderColor: "rgb(115,115,115)",
        borderRadius: 4,
        padding: 10,
        flexGrow: 1
    },
    bottomContainer: {
        width: "100%",
        height: 140,
//        backgroundColor: "red",
        paddingTop: 10
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
    }
};

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, connectLink3G)));
