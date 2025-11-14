'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, ScrollView, BackHandler, Dimensions, Platform} from 'react-native';

import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import ImageBackground from '../../components/imageBackground.js'
import Dropdown from '../../widgets/dropdown/dropdown';
import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { Redirect, withRouter } from '../../utils/router/router'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'
import {loginStyles} from '../login/loginStyles.js'
import {wifiConnection} from '../../utils/wifiConnection/wifiConnection'
import {toast} from '../../widgets/toast/toast'

import DomSelector from 'react-native-dom-parser';
import Icon from 'react-native-vector-icons/EvilIcons';
import link  from '../../assets/img/device_linkwifi2.png'
import link_config_ssid_example  from '../../assets/img/devices/link_config_ssid_example.png'
import link_config_wifi_plugged  from '../../assets/img/devices/link_config_wifi_plugged.png'
import link_config_wifi_reset  from '../../assets/img/devices/link_config_wifi_reset.png'
import link_config_wifi_empty_led  from '../../assets/img/devices/link_config_wifi_empty_led_2.png'

class connectLinkWifi extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idZone: this.props.match.params.idZone,
            idLink: this.props.match.params.idLink,
            goDevices: false,
            connecting: false,
            connected: false,
            showPassword: false,
            wifiList: [],
            wifiSelected: 0,
            wifiSSID: "",
            htmlVersion:1,
            wifiPassword: "",
//            wifiPassword: "2hhd5ej9", // Feina
//            wifiPassword: "Julia2905", // Casa 5G
//            wifiPassword: "jNuxgbvjwfim", // Casa 2.4G
            status: 'connect-to-supply',
            statusMsg: '',
            simulator: false,
            timeout: null,
            blink: false,
            gettingSizeImage: false, newWidth: null, newHeight: null,
            exitModal:false,
            blankPasswordModal:false
        };
    }

    componentWillUnmount = () => {

        if (Platform.OS == "android")
            this.backHandler.remove();

        clearTimeout(this.state.timeout);
    };

    componentDidMount() {

        if (Platform.OS == "android")
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        //if (this.state.status === 'get-your-wifi-credentials')
        this.exit();
    }

    render() {
        if (this.state.goDevices)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices"} />)
        else {
            return [(
                    <ImageBackground style={this.style.background} loading={this.state.connecting}>
                        <MainFliwerTopBar />
                        <ScrollView style={this.style.contentView} contentContainerStyle={this.style.contentViewContainer}>
                            {this.renderPage()}
                        </ScrollView >
                        {
                          this.state.connecting?(
                          <View style={{width: "100%", padding: 10}}>
                              <Text style={{color: "#646464", textAlign: "center"}}>{this.state.connecting? this.state.statusMsg : ""}</Text>
                          </View>):null
                        }
                        {this.renderBottom()}
                        <FliwerDeleteModal
                          visible={this.state.exitModal}
                          onClose={() => {this.setState({exitModal:false})}}
                          onConfirm={() => {
                              this.setState({exitModal:false})
                              this.exit();
                          }}
                          title={this.props.actions.translate.get('WIFI_modal_exit')}
                          password={false}
                          loadingModal={this.state.loading}
                        />
                        <FliwerDeleteModal
                          visible={this.state.blankPasswordModal}
                          onClose={() => {this.setState({blankPasswordModal:false})}}
                          onConfirm={() => {
                              this.setState({blankPasswordModal:false})
                              this.sendInfo();
                          }}
                          title={this.props.actions.translate.get('WIFI_modal_blan_password')}
                          password={false}
                          loadingModal={this.state.loading}
                        />
                    </ImageBackground>
                  ),
                  this.renderButtonBack()];
        }
    }

    setBlink(status)
    {
        switch (status) {
            case "wait-until-steady-light":
            case "getting-link-data-universal":
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
        var subtitle2 = "";
        var info = "";
        var infoColor = "red";
        var img = link;
        var img2;
        var blinkColor = "transparent";
        var blinkColor2 = "transparent";
        var ledFixedColor = null;
        var ledFixedColor2 = null;
        var showLed = false;
        var showLed2 = false;

        if (this.state.status === 'get-your-wifi-credentials') { //unused
            title = this.props.actions.translate.get('WIFI_prepare_ssid_pass');
            img = link_config_ssid_example;
        } else if (this.state.status === 'connect-to-supply') {
            title = this.props.actions.translate.get('WIFI_connect_link_to_power_supply');
            img = link_config_wifi_plugged;
        } else if (this.state.status === 'wait-until-steady-light') {
            title = this.props.actions.translate.get('WIFI_light_will_blink_light_blue');
            subtitle2 = this.props.actions.translate.get('WIFI_wait_until_solid_blue');
            img = link_config_wifi_empty_led;
            showLed = true;
            blinkColor = "#00fdff"; // Cian
            img2 = link_config_wifi_empty_led;
            showLed2 = true;
            ledFixedColor2 = "#00fdff"; // Cian
            //info = this.props.actions.translate.get('WIFI_reset_the_link');
            //infoColor = "gray";
        } else if (this.state.status === 'connect-to-fliwer-network') {
            title = this.props.actions.translate.get('WIFI_press_connect_network');
            subtitle2 = this.props.actions.translate.get('WIFI_your_mobile_is_connected_to_link');
            img = link_config_wifi_empty_led;
            showLed = true;
            ledFixedColor = "#00fdff"; // Cian
            img2 = link_config_wifi_empty_led;
            showLed2 = true;
            ledFixedColor2 = "#ff63f7"; // Cian
            //info = this.props.actions.translate.get('WIFI_reset_the_link');
            //infoColor = "gray";
        } else if (this.state.status === 'setting-fliwer-network') {
            title = this.props.actions.translate.get('WIFI_your_mobile_is_connecting_to_link');
            img = link_config_wifi_empty_led;
            showLed = true;
            ledFixedColor = "#00fdff"; // Cian
        } else if (this.state.status === 'getting-link-data-universal') {
            title = this.props.actions.translate.get('WIFI_your_mobile_is_connecting_to_link');
            img = link_config_wifi_empty_led;
            showLed = true;
            ledFixedColor = "#ff63f7"; // Purple
        } else if (this.state.status === 'connected') {
            title = this.props.actions.translate.get('WIFI_choose_wifi');
            subtitle = this.props.actions.translate.get('WIFI_choose_wifi_subtitle')+(this.state.htmlVersion==1?"":".");
            img = null;
            this.state.connected = true;
        } else if (this.state.status === 'connecting-to-router-network') {
            title = this.props.actions.translate.get('WIFI_disconnecting_from_fliwer');
            img = link_config_wifi_empty_led;
            showLed = true;
            ledFixedColor = "#ff63f7"; // Purple
        } else if (this.state.status === 'finish') {
            title = this.props.actions.translate.get('WIFI_change_purple_blue_green');
            img = link_config_wifi_empty_led;
            showLed = true;
            ledFixedColor = "lime"; // Green
            subtitle2 = this.props.actions.translate.get('LINK_link_configured');
        } else if (this.state.status === 'first-reset') {
            title = this.props.actions.translate.get('LINK_fliwer_link_reset');
            subtitle2 = this.props.actions.translate.get('LINK_reset_instructions');
            img = link_config_wifi_reset;
        }

        if (this.state.status === 'finish' && this.state.statusAux === 'error-connecting-router-network')
            info = this.props.actions.translate.get('WIFI_error_connecting_usual_network') + ": " + this.state.wifiSSID + ". " + this.props.actions.translate.get('WIFI_connect_manually');

        var dimensions = Dimensions.get('window');
        var titleOutMarginBottom = 20;
        // Marc screen (610px height)
        if (dimensions.height < 650 || showLed) {
            titleOutMarginBottom = 0;
        }

        return(
            <View style={{width: "100%", height: "100%"}}>
                <View style={[this.style.titleOut, {marginBottom: titleOutMarginBottom}, img? {/*height: 82*/} : {}]}>
                    <Text style={[loginStyles.titleStyle, this.style.title]}>{title}</Text>
                </View>
                {subtitle?
                    <View style={{width: "100%", marginTop: 0, paddingLeft: 20, paddingRight: 20}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text]}>{subtitle}</Text>
                    </View>:null}
                {img?
                <View style={{width: "100%", alignItems: "center"}}>
                    <View style={[this.style.containerImage, showLed? {height: 200, width: 350} : (this.state.newHeight? {height: this.state.newHeight} : {})]}>
                        <Image source={img} resizeMode={"contain"} style={this.style.image}/>
                        {showLed?<View style={[this.style.led, {backgroundColor: ledFixedColor? ledFixedColor : (this.state.blink? blinkColor : "gray")}]}></View>:null}
                    </View>
                </View>:null}
                {subtitle2?
                    <View style={{width: "100%", marginTop: 10, paddingLeft: 20, paddingRight: 20}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text]}>{subtitle2}</Text>
                    </View>:null}

                {subtitle2 && this.state.status === 'connect-to-fliwer-network'?
                  <View style={{width: "100%", marginTop: 10, paddingLeft: 20, paddingRight: 20, alignItems: "center"}}>
                      <FliwerGreenButton onPress={() => {
                        this.setBlink("");
                        this.connectToFliwerNetwork();
                      }} text={this.props.actions.translate.get('WIFI_press_connect_button')} style={{padding: 0, backgroundColor: "gray", color: "white", fontSize: 12}} containerStyle={{height: 25, width: 100}}/>
                  </View>:null}

                {img2?
                <View style={{width: "100%", alignItems: "center"}}>
                    <View style={[this.style.containerImage, showLed2? {height: 200, width: 350} : (this.state.newHeight? {height: this.state.newHeight} : {})]}>
                        <Image source={img2} resizeMode={"contain"} style={this.style.image}/>
                        {showLed2?<View style={[this.style.led, {backgroundColor: ledFixedColor2? ledFixedColor2 : (this.state.blink? blinkColor2 : "gray")}]}></View>:null}
                    </View>
                </View>:null}
                {info?
                    <View style={{width: "100%", marginTop: 10, paddingLeft: 40, paddingRight: 40}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text, {fontSize: 14, color: infoColor}]}>{info}</Text>
                    </View>:null}
                {info && this.state.status === 'wait-until-steady-light'?
                    <View style={{width: "100%", marginTop: 10, paddingLeft: 20, paddingRight: 20, alignItems: "center"}}>
                        <FliwerGreenButton onPress={() => {
                            this.setBlink('first-reset');
                            this.setState({status: 'first-reset'});
                        }} text={"Reset"} style={{padding: 2, backgroundColor: "gray", color: "white", fontSize: 12}} containerStyle={{height: 25, width: 100}}/>
                    </View>:null}

                {this.state.status === 'connected'?
                    <View style={{width: "100%", marginTop: 60, paddingLeft: 20, paddingRight: 20}}>
                        {this.renderConfig()}
                    </View>:null}
            </View>
        );

/*
        return(
            <View style={{width: "100%", height: "100%"}}>
                <View style={[this.style.titleOut, {marginBottom: titleOutMarginBottom}, img? {} : {}]}>
                    <Text style={[loginStyles.titleStyle, this.style.title]}>{title}</Text>
                </View>
                {img?
                <View style={{width: "100%", alignItems: "center"}}>
                    <View style={[this.style.containerImage, showLed? {height: 250, width: 350} : (this.state.newHeight? {height: this.state.newHeight} : {})]}>
                        <Image source={img} resizeMode={"contain"} style={this.style.image}/>
                        {showLed?<View style={[this.style.led, {backgroundColor: ledFixedColor? ledFixedColor : (this.state.blink? blinkColor : "gray")}]}></View>:null}
                    </View>
                </View>:null}
                {subtitle?
                    <View style={{width: "100%", marginTop: 0, paddingLeft: 20, paddingRight: 20}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text]}>{subtitle}</Text>
                    </View>:null}
                {info?
                    <View style={{width: "100%", marginTop: 20, paddingLeft: 40, paddingRight: 40}}>
                        <Text style={[loginStyles.descriptionStyle, this.style.text, {fontSize: 14, color: infoColor}]}>{info}</Text>
                    </View>:null}
                {info && this.state.status === 'wait-until-steady-light'?
                    <View style={{width: "100%", marginTop: 10, paddingLeft: 20, paddingRight: 20, alignItems: "center"}}>
                        <FliwerGreenButton onPress={() => {
                            this.setBlink('first-reset');
                            this.setState({status: 'first-reset'});
                        }} text={"Reset"} style={{padding: 2, backgroundColor: "gray", color: "white", fontSize: 12}} containerStyle={{height: 25, width: 100}}/>
                    </View>:null}
                {this.state.status === 'connected'?
                    <View style={{width: "100%", marginTop: 60, paddingLeft: 20, paddingRight: 20}}>
                        {this.renderConfig()}
                    </View>:null}
            </View>
        );
  */
    }

    renderBottom() {
        return (
            <View style={[this.style.bottomContainer, {}]}>
                <View style={this.style.continueButtonContainer}>

                    <FliwerGreenButton
                        text={this.state.status === 'finish'? this.props.actions.translate.get('general_finalize') : this.props.actions.translate.get('general_continue')}
                        containerStyle={{}}
                        onPress={() => {
                            var status = "";

                            if (this.state.status === 'get-your-wifi-credentials')
                                status = 'connect-to-supply';
                            else if (this.state.status === 'connect-to-supply')
                                status = 'wait-until-steady-light';
                            else if (this.state.status === 'wait-until-steady-light') {
                                status = 'connect-to-fliwer-network';
                                /*
                                this.setBlink("");
                                this.connectToFliwerNetwork();
                                return;
                                */
                            }
                            else if (this.state.status === 'connect-to-fliwer-network') {
                                this.setBlink("");
                                this.connectToFliwerNetwork();
                                return;
                            }
                            else if (this.state.status === 'connected') {
                                this.setBlink("");
                                if(!this.state.wifiPassword) this.setState({blankPasswordModal:true})
                                else this.sendInfo();
                                return;
                            }
                            else if (this.state.status === 'first-reset')
                                status = 'wait-until-steady-light';
                            else {
                                // 'finish'
                                this.exit();
                                return;
                            }

                            this.setBlink(status);
                            this.setState({status: status});

                        }}
                        disabledBackButton={/*this.state.status === 'finish'? true : */false}
                    />

                </View>
            </View>
        );
    }

    renderButtonBack()
    {
        return(
            <View style={this.style.buttonBackContainer}>
                <TouchableOpacity style={this.style.buttonBack} onPress={() => {
                        //this.props.history.goBack();
                        //this.exit();
                        var status = "";
                        var exitModal=false;

                        if (this.state.status === 'first-reset'){
                            status = 'wait-until-steady-light';
                        }else if (this.state.status === 'connected'){
                            status = 'connect-to-fliwer-network';
                        }else if (this.state.status === 'connect-to-fliwer-network'){
                            status = 'wait-until-steady-light';
                        }else if (this.state.status === 'wait-until-steady-light'){
                            status = 'connect-to-supply';
                        }else if (this.state.status === 'connect-to-supply'){
                            //status = 'get-your-wifi-credentials';
                            //this.exit();
                            exitModal=true;
                        }
                        else {
                            // 'get-your-wifi-credentials'
                            // 'finish'
                            this.exit();
                            return;
                        }

                        this.setBlink(status);
                        this.setState({status: status?status:this.state.status,exitModal:exitModal});
                    }}>
                    <Text style={this.style.textBack}>{this.props.actions.translate.get('general_back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderConfig() {
        if (this.state.status === 'connected')
            return (
                    <View style={{width: "100%"}}>

                        <View style={{zIndex: 1, width: "100%"}}>
                            <Text style={this.style.ssid}>{this.props.actions.translate.get('deviceRegisterVC_ssid_label')}</Text>
                            <View style={this.style.selectContainer}>
                                <Dropdown
                                    selectedValue={this.state.wifiSelected}
                                    style={{}}
                                    styleOptions={{textAlign: "center", fontFamily: FliwerColors.fonts.light}}
                                    options={this.printWifiList()}
                                    onChange={(value) => {
                                        if (value)
                                            this.setState({wifiSelected: value});
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{width: "100%"}}>
                            <Text style={this.style.ssid}>{this.props.actions.translate.get('deviceRegisterVC_password_label')}</Text>
                            <View style={this.style.passwordContainer}>
                                <View style={[this.style.inputContainer, this.style.passwordTextInput]}>
                                    <TextInput
                                        style={this.style.input}
                                        secureTextEntry={this.state.showPassword ? false : true}
                                        autoCapitalize = 'none'
                                        value={this.state.wifiPassword}
                                        onChangeText={(text) => this.setState({wifiPassword: text})}
                                        onSubmitEditing={() => {
                                            if(!this.state.wifiPassword) this.setState({blankPasswordModal:true})
                                            else this.sendInfo();
                                        }}
                                        autoComplete={ Platform.OS === 'web' ? 'none' : 'off' }
                                        />
                                </View>
                                <TouchableWithoutFeedback style={this.style.eyeIconContainer} onPress={() => this.setState({showPassword: !this.state.showPassword})} >
                                    <Icon name="eye" style={[this.style.eyeIcon, (this.state.showPassword ? {color: "black"} : {})]} ></Icon>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </View>
                    );
            else
                return null;
    }

    connectToFliwerNetwork() {

        var that = this;

        this.setBlink('setting-fliwer-network');
        this.setState({status: 'setting-fliwer-network', statusMsg: 'Connecting to FLIWER network...', connecting: true});

        // Simulator
        if (this.state.simulator)
        {
            setTimeout(() => {
                that.setBlink('getting-link-data-universal');
                that.setState({status: 'getting-link-data-universal', statusMsg: "Getting data from Fliwer link..."});
                setTimeout(() => {
                    var wList = [{id: 'id_0', sec: 0, ssid: "SIMULATOR"}];
                    that.setBlink('connected');
                    that.setState({status: 'connected', statusMsg: "Connected to Fliwer Link", connecting: false, wifiList: wList, wifiSelected: wList[0].id});
                }, 5000);
            }, 5000);
            return;
        }

        wifiConnection.requestLocationPermission().then(()=>{
            console.log("requestLocationPermission success");
            wifiConnection.isEnabled().then((enabled) => {
                console.log("isEnabled", enabled);
                if (!enabled) wifiConnection.setEnabled(true);
                wifiConnection.reScan().then(() => {
                    console.log("reScan success");
                    var tryConnection = function (ntry) {
                        wifiConnection.getSSID().then((ssid) => {
                            console.log("ssid", ssid);
                            if (ssid == 'FLIWER') {
                              that.getLinkData().then(()=>{},(error)=>{
                                if (ntry < 5)
                                  tryConnection(ntry + 1);
                              });
                            } else {
                                wifiConnection.connect("FLIWER").then((ssidConnected) => {
                                    //that.setState({statusMsg: 'Connected to ' + ssidConnected});
                                    if(ssidConnected=='FLIWER'){
                                      that.getLinkData().then(()=>{},(error)=>{
                                        if (ntry < 5)
                                          tryConnection(ntry + 1);
                                      });
                                    }else if (ntry < 5) {
                                        setTimeout(() => {
                                            tryConnection(ntry + 1);
                                        }, 1000);
                                    } else {
                                        that.setBlink('wait-until-steady-light');
                                        that.setState({status: 'wait-until-steady-light', connecting: false});
                                    }

                                }, (error) => {
                                    console.log("error", error);
                                    console.log("ntry error:",ntry)
                                    that.setState({statusMsg: error.message});
                                    // Look out!
                                    // Starting Android 9, apps are only allowed to scan wifi networks a few times.
                                    if (ntry < 5 && error.message.indexOf("approval") == -1 && error.code!='userDenied') {
                                        setTimeout(() => {
                                            tryConnection(ntry + 1);
                                        }, 1000);
                                    } else {
                                        console.log("hhmmmm");
                                        that.setBlink('wait-until-steady-light');
                                        that.setState({status: 'wait-until-steady-light', connecting: false});
                                    }
                                });
                            }
                        }, (err) => {
                          if (ntry < 5) {
                              setTimeout(() => {
                                  tryConnection(ntry + 1);
                              }, 1000);
                          } else {
                              toast.error(JSON.stringify(err));
                              that.setBlink('wait-until-steady-light');
                              that.setState({status: 'wait-until-steady-light', connecting: false});
                          }
                        });
                    };

                    tryConnection(Platform.OS == "android"?5:0);

                }, (err) => {
                    toast.error(JSON.stringify(err));
                    that.setBlink('wait-until-steady-light');
                    that.setState({status: 'wait-until-steady-light', connecting: false});
                });

            });
        }, (err) => {
            toast.error(JSON.stringify(err));
            that.setBlink('wait-until-steady-light');
            that.setState({status: 'wait-until-steady-light', connecting: false});
        });

    }

    getLinkData() {
      var that=this;
      return new Promise((resolve,reject)=>{
        that.setBlink('getting-link-data-universal');
        that.setState({status: 'getting-link-data-universal', statusMsg: "Getting data from Fliwer link..."});
        that.gettingLinkDataUniversal().then(info => {
             if (info.id != that.state.idLink) {
                 let errMsg = that.props.actions.translate.get("deviceRegisterVC_connection_alert_wrongLink").replace("%IDLINK%", info.id);
                 that.setBlink('wait-until-steady-light');
                 that.setState({status: 'wait-until-steady-light', connecting: false, statusMsg: errMsg});
                 toast.error(JSON.stringify(errMsg));
                 wifiConnection.disconnect('FLIWER');
                 reject();
             } else {
                 that.setBlink('connected');
                 that.setState({status: 'connected', statusMsg: "Connected to Fliwer Link", connecting: false, htmlVersion:(info.htmlVersion && info.htmlVersion>1?info.htmlVersion:1) ,wifiList: info.networks, wifiSelected: info.networks[0].id});
                 resolve();
             }
        }, (err) => {
            that.setBlink('wait-until-steady-light');
            that.setState({status: 'wait-until-steady-light', connecting: false, statusMsg: "Oups. Error getting link universal data"});
            //toast.error(that.props.actions.translate.get("deviceRegisterVC_connection_alert"));
            wifiConnection.disconnect('FLIWER');
            reject();
        });
      })

    }

    exit() {
        var that = this;

        /*
        if (!this.state.connected) {
            this.setBlink("");
            this.setState({goDevices: true, connecting: false});
            return;
        }

        // Simulator
        if (this.state.simulator) {
            this.setBlink("");
            this.setState({goDevices: true, connecting: false, connected: false});
            return;
        }
        */

        //Allways has to disconnect from FLIWER, even if now it's not in the network, to remove the enformcent of wifi network usage.
        var tryConnection = function (ntry) {
            that.setState({statusMsg: 'Desconnecting from FLIWER network...', connecting: true});
            wifiConnection.disconnect('FLIWER').then(() => {
              that.setState({statusMsg: 'Disconnected from FLIWER'});
            }, (err) => {
              console.log(err)
            }).finally(()=>{
              that.setBlink("");
              that.setState({goDevices: true, connecting: false, connected: false});
              return;
            });
        };

        tryConnection(0);
    }

    connectingToRouterNetwork() {

        var that = this;
        that.setBlink('connecting-to-router-network');
        that.setState({status: 'connecting-to-router-network', connecting: true});

        // Simulator
        if (this.state.simulator)
        {
            setTimeout(() => {
                that.setBlink('finish');
                //that.setState({status: 'finish', statusAux: 'error-connecting-router-network', connecting: false});
                that.setState({status: 'finish', statusAux: '', connecting: false});
            }, 5000);
            return;
        }

        var tryConnection = function (ntry, isWep) {
            that.setState({statusMsg: "Connecting to " + that.state.wifiSSID});
            wifiConnection.disconnect('FLIWER').then(() => {
            }, (err) => {
              console.log(err)
            }).finally(()=>{
              /*
              wifiConnection.getSSID().then((ssid) => {
                if (Platform.OS==='android' || ssid == that.state.wifiSSID) {
                */
                    that.setBlink('finish');
                    that.setState({status: 'finish', statusAux: '', connecting: false});
                /*
                } else {
                    wifiConnection.connect(that.state.wifiSSID, that.state.wifiPassword, isWep).then((ssidConnected) => {
                        //that.setState({statusMsg: 'Connected to ' + ssidConnected});
                        if (ntry < 5) {
                            setTimeout(() => {
                                tryConnection(ntry + 1, !isWep);
                            }, 1000);
                        } else {
                            that.setBlink('finish');
                            that.setState({status: 'finish', statusAux: 'error-connecting-router-network', connecting: false});
                        }

                    }, (error) => {
                        console.log("error", error);
                        that.setState({statusMsg: error});
                        if (ntry < 5 && error.indexOf("approval") == -1) {
                            setTimeout(() => {
                                tryConnection(ntry + 1, !isWep);
                            }, 1000);
                        } else {
                            that.setBlink('finish');
                            that.setState({status: 'finish', statusAux: 'error-connecting-router-network', connecting: false});
                        }
                    });
                }
            }, (err) => {
                toast.error(err);
                that.setBlink('finish');
                that.setState({status: 'finish', statusAux: 'error-connecting-router-network', connecting: false});
            });
            */
          });
        };

        tryConnection(0, true);

    }

    gettingLinkDataUniversal() {
        var that = this;
        return new Promise(function (resolve, reject) {
            var tryGettingLinkDataUniversal = function (ntry) {
                that.setState({statusMsg: "Getting data from Fliwer Link"});
                that.getLinkDataUniversal().then((info) => {
                    resolve(info);
                }, (error) => {
                    if (ntry < 10) {
                      wifiConnection.getSSID().then((ssid) => {
                        if(ssid=='FLIWER'){
                          setTimeout(() => {
                              tryGettingLinkDataUniversal(ntry + 1);
                          }, 1000);
                        }else{
                          reject("Disconnected from FLIWER");
                        }
                      },(error)=>{
                        reject(error);
                      });

                    } else {
                        reject(error);
                    }
                });
            };
            tryGettingLinkDataUniversal(0);
        });
    }

    getLinkDataUniversal() {
        return new Promise(function (resolve, reject) {
            wifiConnection.request('http://192.168.1.1?_=' + Date.now()).then((html) => {
                console.log(html);
                if (html) {
                    const rootNode = DomSelector(html);
                    var idLink = rootNode.getElementById('idLink').children[0].text;
                    var htmlVersionNode = rootNode.getElementById('htmlVersion');
                    var htmlVersion = htmlVersionNode?parseInt(htmlVersionNode.children[0].text):1;
                    var elements = rootNode.getElementsByTagName('option');
                    var networks = [];
                    for (var i = 0; i < elements.length; i++) {
                        var string = elements[i].children[0].text;
                        if (elements[i].children[0].text.split(' ').slice(2, elements[i].children[0].text.split(' ').length).join(' '))
                            networks.push({id: "id_" + i, sec: parseInt(elements[i].children[0].text.split(' ')[1]), ssid: elements[i].children[0].text.split(' ').slice(2, elements[i].children[0].text.split(' ').length).join(' ')});
                    }
                    resolve({id: idLink, networks: networks,htmlVersion:htmlVersion});
                } else {
                    console.log("no html loaded", html);
                    reject("no html loaded " + html);
                }
            }, (error) => {
                reject(error);
            });

        });
    }

    encodeURL(url) {
        return encodeURIComponent(url).replace(/%20/g, '+'); 
    }

    sendInfo() {
        var that = this;

        if (!this.state.connecting) {
            this.setState({connecting: true});

            // Simulator
            if (this.state.simulator)
            {
                that.setState({statusMsg: "Sending data to Fliwer Link. ntry: " + 0});
                setTimeout(() => {
                    that.connectingToRouterNetwork();
                }, 5000);
                return;
            }

            var tryConnection = function (ntryConnection) {

                that.setState({statusMsg: "Sending data to Fliwer Link. ntry: " + ntryConnection});
                new Promise(function (resolve, reject) {
                    var network = that.state.wifiList.find((n) => {
                        return n.id == that.state.wifiSelected;
                    });

                    that.state.wifiSSID = network.ssid;

                    //console.log("request to", 'http://192.168.1.1/man?nw=' + network.ssid + "&pwd=" + that.state.wifiPassword + "&sec=" + network.sec + "&_=" + Date.now());
                    wifiConnection.request('http://192.168.1.1/man?nw=' + (that.state.htmlVersion==1?network.ssid:that.encodeURL(network.ssid)) + "&pwd=" + (that.state.htmlVersion==1?that.state.wifiPassword:that.encodeURL(that.state.wifiPassword)) + "&sec=" + network.sec + "&_=" + Date.now()).then((html) => {
                        console.log(html);
                        if (html && html.match(/.*Saved.*/g)) {
                            const rootNode = DomSelector(html);
                            if (rootNode.getElementsByTagName('h1')[0].children[0].text == "Saved")
                                resolve();
                            else
                                reject();
                        } else {
                            reject("no html loaded " + html)
                            reject();
                        }
                    }, (error) => {
                        console.log(error);
                        reject(error);
                    });

                }).then((info) => {
                    //info enviada
                        that.connectingToRouterNetwork();
                }, (err) => {
                    if (ntryConnection < 10) {
                      wifiConnection.getSSID().then((ssid) => {
                          console.log("ssid", ssid);
                          if (ssid == 'FLIWER') {
                            setTimeout(() => {
                                tryConnection(ntryConnection + 1);
                            }, 500)
                          }else{
                            wifiConnection.connect('FLIWER').then(() => {
                                setTimeout(() => {
                                    tryConnection(ntryConnection + 1);
                                }, 500)
                            }, (error) => {
                                console.log(error.message)
                                tryConnection(ntryConnection + 1);
                            });
                          }
                        },()=>{
                          wifiConnection.connect('FLIWER').then(() => {
                              setTimeout(() => {
                                  tryConnection(ntryConnection + 1);
                              }, 500)
                          }, (error) => {
                              console.log(error.message)
                              tryConnection(ntryConnection + 1);
                          });
                        })
                    } else {
                        wifiConnection.disconnect('FLIWER');
                        that.setState({connecting: false});
                        toast.error(that.props.actions.translate.get("deviceRegisterVC_connection_alert"));
                        console.log('can\'t connect');
                    }
                });
            };
            tryConnection(0);
        }
    }

    printWifiList() {
        var that = this;
        if (!this.state.wifiList)
            return [];
        var arr = Object.keys(this.state.wifiList).map(function (key) {
            return {label: that.state.wifiList[key].ssid, value: that.state.wifiList[key].id};
        });
        function compare(a, b) {
            if (a.label.toUpperCase() < b.label.toUpperCase())
                return -1;
            if (a.label.toUpperCase() > b.label.toUpperCase())
                return 1;
            return 0;
        }
        //return [{"label":"12389123","value":4},{"label":"eduroam","value":6},{"label":"eduroam","value":7},{"label":"inolve","value":3},{"label":"PARC TECNOLOGIC","value":5},{"label":"PARC TECNOLOGIC","value":8},{"label":"WIGs","value":2},{"label":"WIGsSAT","value":0},{"label":"WiGS_enterprise","value":1}];
        return arr.sort(compare);
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
//        top: 93,
//        right: 98,
        top: 48,
        right: 85,
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
    passwordContainer: {
        flexDirection: "row",
        width: "100%"
    },
    ssid: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
        marginRight: 10,
        flexGrow: 1
    },
    selectContainer: {
        height: 40,
        width: "100%",
        borderRadius: 4,
        position: "relative",
        zIndex: 1,
    },
    select: {
        width: "100%",
        zIndex: 1
    },
    passwordTextInput: {
        flexGrow: 1
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
    eyeIcon: {
        fontSize: 45,
        textAlign: "center",
        zIndex: 1,
        height: 55,
        color: "rgb(150,150,150)"
    },
    bottomContainer: {
        width: "100%",
        height: 120,
//        backgroundColor: "red",
        paddingTop: 5
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, connectLinkWifi)));
