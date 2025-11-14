'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, TextInput, Platform, ScrollView, BackHandler } from 'react-native';

import MainFliwerTopBar from '../../components/mainFliwerTopBar.js'
import ImageBackground from '../../components/imageBackground.js'
import FliwerCard from '../../components/custom/FliwerCard.js'
import Dropdown from '../../widgets/dropdown/dropdown';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsDevice from '../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import { Redirect,withRouter } from '../../utils/router/router'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import {toast} from '../../widgets/toast/toast'
import {wifiConnection} from '../../utils/wifiConnection/wifiConnection'

import DomSelector from 'react-native-dom-parser';

import Icon from 'react-native-vector-icons/EvilIcons';

import link  from '../../assets/img/device_linkwifi2.png'

class connectLinkWifi extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idZone: this.props.match.params.idZone,
            idLink: this.props.match.params.idLink,
            goBack: false,
            goNext: false,
            connecting: false,
            connected: false,
            showPassword: false,
            wifiList: [],
            wifiSelected: 0,
            wifiPassword: ""
        };
    }

    componentWillUnmount = () => {
        this.backHandler.remove()
    }
    ;
            componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.checkSSID(true);
        return true;
    }

    checkSSID(goNext)
    {

        return new Promise((resolve, reject) => {
            if (Platform.OS == "android" || Platform.OS == 'ios')
            {
                if (this.state.connected)
                {
                    this.setState({connecting: true});
                    wifiConnection.waitSSIDChange().then(() => {
                        wifiConnection.disconnect();
                        this.setState({connecting: false});
                        if (goNext)
                            this.setState({goNext: true});
                        resolve();
                    }, (err) => {
                        reject();
                    });
                } else
                {
                    this.setState({connecting: false});
                    if (goNext)
                        this.setState({goNext: true});
                    resolve();
                }
            } else
                reject();

        });
    }

    connectToLink() {

        if (!this.state.connecting) {

            this.setState({connecting: true});

            var that = this;
            var tryConnection;

            tryConnection = function (ntryConnection) {
                console.log('ntryConnection', ntryConnection);
                new Promise(function (resolve, reject) {
                    if (Platform.OS == "android" || Platform.OS == 'ios')
                        that.connectToLinkAndroid().then(resolve, reject);
                    else
                        that.connectToLinkWeb().then(resolve, reject);
                }).then((info) => {
                    console.log(info.id, info.networks)
                    if (info.id != that.state.idLink) {
                        that.setState({connecting: false});
                        wifiConnection.disconnect();
                        toast.error(that.props.actions.translate.get("deviceRegisterVC_connection_alert_wrongLink").replace("%IDLINK%", info.id));
                    } else {
                        that.setState({connected: true, connecting: false, wifiList: info.networks});
                    }
                }, (err) => {
                    if (ntryConnection < 10) {
                        setTimeout(() => {
                            tryConnection(ntryConnection + 1);
                        }, 500)
                    } else {
                        wifiConnection.disconnect();
                        that.setState({connecting: false});
                        toast.error(that.props.actions.translate.get("deviceRegisterVC_connection_alert"));
                        console.log('can\'t connect')
                    }
                })

            }
            tryConnection(0)

        }

    }

    connectToLinkAndroid() {
        var that = this;
        return new Promise(function (resolve, reject) {
            wifiConnection.connect('FLIWER').then(() => {
                var tryLoadPage;
                tryLoadPage = function (ntry) {
                    console.log('try page', ntry);
                    wifiConnection.getSSID().then((ssid) => {
                        console.log('ssid', ssid)
                        if (ssid != 'FLIWER') {
                            console.log("losed connection");
                            reject("losed connection")
                        } else {
                            that.getLinkDataUniversal().then((info) => {
                                resolve(info);
                            }, (error) => {
                                console.log(error);
                                if (ntry < 5) {
                                    setTimeout(() => {
                                        tryLoadPage(ntry + 1);
                                    }, 1000)
                                } else {
                                    reject(error)
                                }
                            })
                        }
                    });
                }
                tryLoadPage(0);
            }, (error) => {
                console.log(error)
                reject(error)
            })
        })
    }

    connectToLinkWeb() {
        var that = this;
        return new Promise(function (resolve, reject) {
            var tryLoadPage;
            tryLoadPage = function (ntry) {
                console.log('try page', ntry);
                that.getLinkDataUniversal().then((info) => {
                    resolve(info);
                }, (error) => {
                    console.log(error);
                    if (ntry < 10) {
                        setTimeout(() => {
                            tryLoadPage(ntry + 1);
                        }, 1000)
                    } else {
                        reject(error)
                    }
                })

            }
            tryLoadPage(0);

        })
    }

    getLinkDataUniversal() {
        return new Promise(function (resolve, reject) {

            wifiConnection.request('http://192.168.1.1?_=' + Date.now()).then((html) => {
                console.log(html)
                //wifiConnection.setStayConnected();
                if (html) {
                    const rootNode = DomSelector(html);
                    var idLink = rootNode.getElementById('idLink').children[0].text;
                    var elements = rootNode.getElementsByTagName('option');
                    var networks = [];
                    for (var i = 0; i < elements.length; i++) {
                        var string = elements[i].children[0].text;
                        if (elements[i].children[0].text.split(' ').slice(2, elements[i].children[0].text.split(' ').length).join(' '))
                            networks.push({id: i, sec: parseInt(elements[i].children[0].text.split(' ')[1]), ssid: elements[i].children[0].text.split(' ').slice(2, elements[i].children[0].text.split(' ').length).join(' ')})
                    }
                    resolve({id: idLink, networks: networks})
                } else {
                    console.log("no html loaded", html);
                    reject("no html loaded " + html)
                }
            }, (error) => {
                reject(error)
            });

        })
    }

    sendInfo() {
        if (!this.state.connecting) {
            var that = this;
            this.setState({connecting: true});


            var that = this;
            var tryConnection;

            tryConnection = function (ntryConnection) {

                console.log('ntryConnection', ntryConnection);
                new Promise(function (resolve, reject) {
                    var network = that.state.wifiList.find((n) => {
                        return n.id == that.state.wifiSelected
                    });
                    console.log("request to", 'http://192.168.1.1/man?nw=' + network.ssid + "&pwd=" + that.state.wifiPassword + "&sec=" + network.sec + "&_=" + Date.now())
                    wifiConnection.request('http://192.168.1.1/man?nw=' + network.ssid + "&pwd=" + that.state.wifiPassword + "&sec=" + network.sec + "&_=" + Date.now()).then((html) => {
                        console.log(html)
                        //wifiConnection.setStayConnected();
                        if (html) {
                            const rootNode = DomSelector(html);
                            if (rootNode.getElementsByTagName('h1')[0].children[0].text == "Saved")
                                resolve()
                            else
                                reject()
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
                    if (Platform.OS == 'android' || Platform.OS == 'ios') {
                        console.log("waiting for ssid change");
                        wifiConnection.waitSSIDChange().then(() => {
                            wifiConnection.disconnect();
                            that.setState({connecting: false, goNext: true});
                        })
                    } else
                        that.setState({connecting: false, goNext: true});
                }, (err) => {
                    if (ntryConnection < 10) {
                        if (Platform.OS == 'android' || Platform.OS == 'ios') {
                            wifiConnection.connect('FLIWER').then(() => {
                                setTimeout(() => {
                                    tryConnection(ntryConnection + 1);
                                }, 500)
                            }, (error) => {
                                console.log(error)
                                tryConnection(ntryConnection + 1);
                            })
                        } else
                            tryConnection(ntryConnection + 1);
                    } else {
                        wifiConnection.disconnect();
                        that.setState({connecting: false});
                        toast.error(that.props.actions.translate.get("deviceRegisterVC_connection_alert"));
                        console.log('can\'t connect')
                    }
                })
            }
            tryConnection(0)
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

    render() {
        var that = this;
        if (this.state.goBack)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices/new"} />)
        else if (this.state.goNext)
            return(<Redirect push to={"/zone/" + this.state.idZone + "/devices"} />)
        else {
            return (
                    <ImageBackground style={this.style.background} loading={this.state.connecting}>
                        <MainFliwerTopBar onPressCheckSSID={() => {
                            return this.checkSSID();
                        }}/>
                        <ScrollView style={this.style.contentView} contentContainerStyle={this.style.contentViewContainer}>
                            <View style={this.style.titleOut}>
                                <Text style={this.style.title}>{this.props.actions.translate.get('deviceRegisterVC_title')}</Text>
                            </View>
                            <View style={this.style.container}>
                                <View style={this.style.containerImage}>
                                    <Image source={link} resizeMode={"contain"} style={this.style.image}/>
                                </View >
                                {this.renderConnect()}
                                {this.renderConfig()}

                            </View>
                            {(this.state.mediaStyle.orientation == "portrait") ? this.renderButtonBack() : null}
                        </ScrollView >
                        {(this.state.mediaStyle.orientation == "landscape") ? this.renderButtonBack() : null}
                    </ImageBackground>
                    )
        }
    }

    renderButtonBack()
    {
        return(
                    <View style={this.style.bottomBar}>
                    <TouchableOpacity style={this.style.buttonBack} onPress={() => {
                                                  if (this.state.connected)
                            {
                                this.checkSSID().then(() => {
                                    this.setState({connected: false});
                                }, (err) => {
                                })
                            } else {
                                this.props.history.goBack();
                            }
                            ;

                        }}>
                        <Text style={this.style.textBack}>{this.props.actions.translate.get('general_back')}</Text>
                    </TouchableOpacity>
                </View>
                )
    }

    renderConnect() {
        if (this.state.connected)
            return [];
        else
            return (
                    <View style={this.style.containerIn}>
                        <View style={this.style.containerInCentered}>
                            {this.renderWebMessage()}
                            <View style={this.style.buttonContainer}>
                                <TouchableOpacity style={this.style.buttonAccess}
                                                  onPress={() => {
                            this.connectToLink()
                        }}>
                                    <Text style={this.style.buttonAccessIn}>{/*'Under construction'*/this.props.actions.translate.get('deviceRegisterVC_button_connect_wifi')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    )
    }

    renderWebMessage() {
        if (Platform.OS != 'web')
            return [];
        else
            return (
                                          <Text style={[this.style.ssid, this.style.textWeb]}>{this.props.actions.translate.get('deviceRegisterVC_connect_wifi_web_label')}</Text>
                    )
    }

    renderConfig() {
        if (!this.state.connected)
            return [];
        else
            return (
                    <View style={this.style.configContainer}>

                        <View style={[this.style.ssidContainer, {zIndex: 1}]}>
                            <Text style={this.style.ssid}>{this.props.actions.translate.get('deviceRegisterVC_ssid_label')}</Text>
                            <View style={this.style.selectContainer}>
                                <Dropdown selectedValue={this.state.wifiSelected} style={[this.style.select, {minWidth: 130}]} styleOptions={{}} options={this.printWifiList()} onChange={(value) => {
                            if (value)
                                this.setState({wifiSelected: value})
                        }} />
                            </View>
                        </View>

                        <View style={this.style.ssidContainer}>
                            <Text style={this.style.ssid}>{this.props.actions.translate.get('deviceRegisterVC_password_label')}</Text>
                            <View style={[this.style.inputContainer, this.style.passwordTextInput]}>
                                <TextInput
                                    style={this.style.input}
                                    secureTextEntry={this.state.showPassword ? false : true}
                                    autoCapitalize = 'none'
                                    onChangeText={(text) => this.setState({wifiPassword: text})}
                                    onSubmitEditing={() => {
                            this.sendInfo()
                        }}
                                    />
                            </View>
                            <TouchableWithoutFeedback style={this.style.eyeIconContainer} onPressIn={() => this.setState({showPassword: true})} onPressOut={() => this.setState({showPassword: false})}>
                                <Icon name="eye" style={[this.style.eyeIcon, (this.state.showPassword ? {color: "black"} : {})]} ></Icon>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={this.style.ssidContainer}>
                            <View style={[this.style.buttonContainer, this.style.buttonConfig]}>
                                <TouchableOpacity style={[this.style.buttonAccess, this.style.buttonConfigIn]}
                                                  onPress={() => {
                            this.sendInfo()
                        }}>
                                    <Text style={[this.style.buttonAccessIn, this.style.buttonConfigText]}>{/*'Under construction'*/this.props.actions.translate.get('deviceRegisterVC_button_send')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                    )
    }

}
;


function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    }
}


var style = {
    contentViewContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
    },
    background: {
        backgroundColor: "rgb(240,240,240)"
    },
    contentView: {
        width: "100%",
        bottom: 0,
        display: "flex",
        flexDirection: 'column',
    },
    titleOut: {
        display: "flex",
        width: "100%",
        paddingTop: 10,
    },
    title: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 25,
        width: "100%",
        textAlign: "center",
    },
    subtitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
        paddingBottom: 10
    },
    text: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        paddingBottom: 20
    },
    container: {
        width: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    containerIn: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
        paddingLeft: 15,
        paddingRight: 15,
    },
    containerInCentered: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%"
    },
    containerImage: {
        paddingTop: 25,
        width: "100%",
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 15,
    },
    inputImgContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        paddingBottom: 15
    },
    inputWithTextContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        flexGrow: 1,
        paddingRight: 10
    },
    image: {
        width: "50%",
        maxHeight: "100%"
    },

    buttonContainer: {
        height: 80,
        width: "100%",
        maxWidth: 500,
        marginBottom: 10,
        alignSelf: "center"
    },
    buttonAccess: {
        backgroundColor: "#3476b2",
        height: "100%",
        width: "100%",
        borderRadius: 4,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    buttonAccessIn: {
        fontSize: 20,
        paddingLeft: 30,
        paddingRight: 30,
        color: "white",
        fontFamily: "MyriadPro-Regular",
        textAlign: "center"
    },
    textWeb: {
        marginBottom: 30
    },
    buttonConfigText: {
        padding: 5,
        fontSize: 14
    },

    buttonConfig: {
        width: "100%",
        maxWidth: 9999,
        padding: 5
    },
    buttonConfigIn: {
        flexDirection: 'row'
    },
    buttonReconnect: {
        backgroundColor: "#929292",
    },
    configContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        justifyContent: "space-evenly",
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 15,
    },
    ssidContainer: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center"
    },
    ssid: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
        marginRight: 10,
        flexGrow: 1
    },
    selectContainer: {
        height: 40,
        flexGrow: 1,
        maxWidth: 300,
        borderRadius: 4,
        position: "relative",
        zIndex: 1,
        marginRight: 45,
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
    bottomBar: {
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
    "@media (height<=550)": {//optimize space
        container: {
            //bottom:35
        },
        title: {
            fontSize: 20
        },
        subtitle: {
            fontSize: 16
        },
        homeSelectedTitle: {
            fontSize: 15
        },
        text: {
            fontSize: 14
        },
        textBack: {
            fontSize: 22
        },
        buttonBack: {
            height: 35
        },
        textWeb: {
            marginBottom: 10
        }
    },
    "@media (orientation:landscape)": {
        containerImage: {
            paddingTop: 0,
            width: "40%",
            height: "100%"
        },
        container: {
            flexDirection: "row"
        },
        containerInCentered: {
            maxWidth: 500
        },
        image: {
            height: "90%",
            width: "50%",
        },
        buttonContainer: {
            alignSelf: "flex-start"
        },
        selectContainer: {
            maxWidth: 400
        },
        configContainer: {
            width: "60%"
        },
        buttonConfig: {
            maxWidth: 500
        },
        contentView: {
            bottom: 35,
            position: "absolute",
            top: 40,
        },
    },
    "@media (orientation:portrait)": {
        containerContent: {
            flexDirection: "column",
            flexGrow: 1,
        },
        homeSelectedTitle: {
            fontSize: 15
        },
        buttonAccess: {

        },
        textWeb: {
            marginBottom: 20
        },
        bottomBar: {
            position: "relative",
        },
        "@media (height<650)": {
            image: {
                height: 150
            }
        }
    }
};

if (Platform.OS == "android" || Platform.OS == 'ios') {
    style['@media (orientation:portrait)']['buttonAccess'].flexDirection = null;
    style['selectContainer'].marginBottom = 7;
}
if (Platform.OS === 'web') {
    style.image.height = '100%'
}


//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, connectLinkWifi)));
