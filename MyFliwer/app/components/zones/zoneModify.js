'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, TouchableOpacity, Image, Platform, StyleSheet, RefreshControl, TextInput, Switch, Dimensions} = require('react-native');

import { CheckBox  } from 'react-native-elements'

import {FliwerColors} from '../../utils/FliwerColors'
import {FliwerStyles} from '../../utils/FliwerStyles'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerTimeSpotAllowed from '../../components/custom/FliwerTimeSpotAllowed.js'
import FliwerSimpleTabView from '../custom/FliwerSimpleTabView.js';
import * as ActionCreateHome from '../../actions/createHomeActions.js';

import moment from 'moment';
import Modal from '../../widgets/modal/modal'
import Dropdown from '../../widgets/dropdown/dropdown';
import ImageBackground from '../../components/imageBackground.js'
import Icon from 'react-native-vector-icons/Feather';

import {toast} from '../../widgets/toast/toast'
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import { Redirect } from '../../utils/router/router'
import {resizeImage} from '../../utils/resizeImage/resizeImage'

import * as CreateZoneActions from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsModifyZone from '../../actions/modifyZoneActions.js'; //Import your actions
import {MediaPicker,FileDrop,getBase64} from '../../utils/uploadMedia/MediaPicker'

import modifyZone  from '../../assets/img/modifyZone.png'
import modifyHome  from '../../assets/img/5_House.png'

import sun1_off  from '../../assets/img/sun1_off.png'
import sun1_on  from '../../assets/img/sun1_on.png'
import sun2_off  from '../../assets/img/sun2_off.png'
import sun2_on  from '../../assets/img/sun2_on.png'
import sun3_off  from '../../assets/img/sun3_off.png'
import sun3_on  from '../../assets/img/sun3_on.png'
import trashImage  from '../../assets/img/trash.png'

class ZoneModify extends Component {
    constructor(props) {
        super(props);

        var zoneData = this.props.zoneData[this.props.idZone];
        console.log("zoneData", zoneData);
        var gardenData = this.props.gardenData[zoneData.idImageDash];

        this.state = {
            goAddHome: false,
            homeId: this.props.modifyZone.idHome ? this.props.modifyZone.idHome : gardenData.idHome,
            zoneName: this.props.modifyZone.name ? (this.props.modifyZone.idZone == this.props.idZone ? this.props.modifyZone.name : zoneData.name) : zoneData.name,
            indexSun: this.props.modifyZone.light ? this.props.modifyZone.light : this.getLight(zoneData.zone_situation == 1 ? false : true, zoneData.light),
            irrigationEnabled: this.props.modifyZone.irrigationEnabled != undefined && this.props.modifyZone.irrigationEnabled != null && this.props.modifyZone.idZone == this.props.idZone ? this.props.modifyZone.irrigationEnabled : (zoneData.irrigation_type == 3 ? false : true),
            outdoor: null,
            extension: this.props.modifyZone.extension ? this.props.modifyZone.extension : zoneData.area ? zoneData.area : "",
            dragging: false,
            goMaps: false,
            hoursAllowed: this.props.modifyZone.hoursAllowed ? this.props.modifyZone.hoursAllowed : zoneData.hoursAllowed ? zoneData.hoursAllowed : [],
            picture64: null,
            picture: this.props.modifyZone.picture ? this.props.modifyZone.picture : gardenData.imageName,
            map: this.props.modifyZone.lat ? {lat: this.props.modifyZone.lat, long: this.props.modifyZone.long, zoom: this.props.modifyZone.zoom} : {lat: gardenData.latitude, long: gardenData.longitude, zoom: gardenData.zoom},
            isMap: this.props.modifyZone.lat ? true : gardenData.latitude ? true : false,
            uri: gardenData.imageName,
            irrigationMinTemp:this.props.modifyZone.irrigationMinTemp ? this.props.modifyZone.irrigationMinTemp : zoneData.irrigationMinTemp ? zoneData.irrigationMinTemp : 0,
            irrigationMaxWind:this.props.modifyZone.irrigationMaxWind ? this.props.modifyZone.irrigationMaxWind : zoneData.irrigationMaxWind ? zoneData.irrigationMaxWind : 0,

            enableLightParamChanged: false,
            enableTempParamChanged: false,
            enableAirHumParamChanged: false,
            enableFertilizerParamChanged: false,
            enableWaterParamChanged: false,
            enableMeteoParamChanged: false
        };

        var hasSensor_Pro = this.hasSensorPro();
        console.log("hasSensor_Pro", hasSensor_Pro);
        if (this.props.modifyZone.enableLightParam)
            this.state.enableLightParam = this.props.modifyZone.enableLightParam;
        else {
            var disableLight = zoneData.enableLightParam == null? hasSensor_Pro : !zoneData.enableLightParam;
            this.state.enableLightParam = !disableLight;
        }
        if (this.props.modifyZone.enableTempParam)
            this.state.enableTempParam = this.props.modifyZone.enableTempParam;
        else {
            var disableTemp = zoneData.enableTempParam == null? hasSensor_Pro : !zoneData.enableTempParam;
            this.state.enableTempParam = !disableTemp;
        }
        if (this.props.modifyZone.enableAirHumParam)
            this.state.enableAirHumParam = this.props.modifyZone.enableAirHumParam;
        else {
            var disableAirHum = zoneData.enableAirHumParam == null? hasSensor_Pro : !zoneData.enableAirHumParam;
            this.state.enableAirHumParam = !disableAirHum;
        }
        if (this.props.modifyZone.enableFertilizerParam)
            this.state.enableFertilizerParam = this.props.modifyZone.enableFertilizerParam;
        else {
            var disableFertilizer = zoneData.enableFertilizerParam == null? hasSensor_Pro : !zoneData.enableFertilizerParam;
            this.state.enableFertilizerParam = !disableFertilizer;
        }
        if (this.props.modifyZone.enableWaterParam)
            this.state.enableWaterParam = this.props.modifyZone.enableWaterParam;
        else {
            var disableWater = zoneData.enableWaterParam == null? false : !zoneData.enableWaterParam;
            this.state.enableWaterParam = !disableWater;
        }
        if (this.props.modifyZone.enableMeteoParam)
            this.state.enableMeteoParam = this.props.modifyZone.enableMeteoParam;
        else {
            var disableMeteo = zoneData.enableMeteoParam == null? hasSensor_Pro : !zoneData.enableMeteoParam;
            this.state.enableMeteoParam = !disableMeteo;
        }

        //this.setState({uri:this.state.isMap?this.props.photoMap:this.state.picture64?this.state.picture64:this.state.pictureURL})
        if (this.props.modifyZone.outdoor != null)
        {
            if (this.props.modifyZone.outdoor == true)
            {
                this.state.outdoor = true;
            } else {
                this.state.outdoor = false;
            }
        } else {
            this.state.outdoor = zoneData.zone_situation == 1 ? false : true
        }
    };

    render() {

        console.log("zoneData m: ", this.props.zoneData[this.props.idZone]);
        console.log("hoursAllowed", this.state.hoursAllowed);
        var {placeholder} = this.props;
        //console.log("has entrat a la zona:"+this.props.idZone);
        //console.log("dara: " +new Date().getTimezoneOffset());

        //this.state.uri=this.state.isMap?this.props.photoMap:this.state.picture64?this.state.picture64:this.state.pictureURL

        if (!this.state.isMap)
        {
            if (this.state.picture64)
                this.state.uri = this.state.picture64;
            else
                this.state.uri = this.state.picture;
        } else {
            if (this.props.photoMap)
                this.state.uri = this.props.photoMap;
            else
                this.state.uri = this.state.picture;
        }


        if (this.state.goAddHome)
            return(<Redirect push to={"/zone/" + this.props.idZone + "/home"} />)
        else if (this.state.goModifyHome)
            return(<Redirect push to={"/zone/new/home/" + this.state.homeId} />)
        else if (this.state.goMaps)
        {
            //this.handleMap();
            return(<Redirect push to={"/zone/" + this.props.idZone + "/new/gps"} />)
        } else
        {
            if (this.props.visible) {

                const dimensions = Dimensions.get('window');
                var tabHeight = 400;
                if (dimensions.height < 700)
                    tabHeight = dimensions.height - 320;

                return (
                        <Modal animationType="fade" inStyle={[FliwerStyles.modalIn, {maxWidth: 500}]} visible={this.props.visible} onClose={() => {
                                this.onClose();
                            }}>
                            <View style={[FliwerStyles.modalView, {
                                    paddingLeft: 20,
                                    paddingRight: 20}]
                                }>

                                {this.renderModalPlaceHolder()}

                                <FliwerSimpleTabView
                                    style={{height: "auto"}}
                                    headerStyle={{backgroundColor: "white", borderBottomWidth: 0}}
                                    tabContainerStyle={{backgroundColor: "white"}}
                                    tabTextStyle={{color: "silver"}}
                                    selectedTabContainerStyle={{backgroundColor: "white"}}
                                    selectedTabTextStyle={{color: "black"}}
                                    >
                                    <View title={"General"}>
                                        <View style={[this.style.tab, {height: tabHeight}]}>
                                            <ScrollView scrollEventThrottle={1000} style={[FliwerStyles.modalScrollViewStyle, this.style.scrollView]}
                                                contentContainerStyle={{
                                                    justifyContent: "center"
                                                }}>
                                                {this.renderGeneralTab()}
                                            </ScrollView>
                                        </View>
                                    </View>
                                    <View title={this.props.actions.translate.get("ModifyZone_irrigation")}>
                                        <View style={[this.style.tab, {height: tabHeight}]}>
                                            <ScrollView scrollEventThrottle={1000} style={[FliwerStyles.modalScrollViewStyle, this.style.scrollView]}
                                                contentContainerStyle={{
                                                    justifyContent: "center"
                                                }}>
                                                {this.renderIrrigationTab()}
                                            </ScrollView>
                                        </View>
                                    </View>
                                    {this.props.roles.fliwer || this.props.roles.angel?<View title={this.props.actions.translate.get("gardenCard_back_alerts")}>
                                        <View style={[this.style.tab, {height: tabHeight}]}>
                                            <ScrollView scrollEventThrottle={1000} style={[FliwerStyles.modalScrollViewStyle, this.style.scrollView]}
                                                contentContainerStyle={{
                                                    justifyContent: "center"
                                                }}>
                                                {this.renderParametersTab()}
                                            </ScrollView>
                                        </View>
                                    </View>:null}
                                </FliwerSimpleTabView>

                                {this.renderBottomBar()}
                            </View>
                        </Modal>
                );
            }
            else
                return []
        }
    }

    renderGeneralTab() {
        var indents = [];

        indents.push(
                <View style={this.style.homeSelected}>
                    <Image style={[this.style.imageIconHome]} draggable={false} source={modifyHome} resizeMode={"contain"} />
                    <View style={this.style.selectAndPlusConatiner}>
                        <View style={this.style.selectContainer}>
                            <Dropdown disabled={false} modal={true} style={this.style.selectPicker} placeholder={this.props.actions.translate.get("modifyZone_select_home")} selectedValue={this.state.homeId} styleOptions={{}} options={this.printHomes()} onChange={value => {
                        if (value)
                            this.setState({homeId: value})
                    }} />
                        </View>
                        {this.renderEditHomeButton()}
                    </View>
                </View>
                )
        if (this.props.zoneData[this.props.idZone])
            indents.push(
                    <View style={this.style.zoneSelected}>
                        <Text style={this.style.homeSelectedTitle}>{this.props.actions.translate.get('deviceCard_back_garden')}</Text>
                        <View style={this.style.inputZoneContainer}>
                            <TextInput
                                style={this.style.inputGarden}
                                autoCapitalize = 'none'
                                maxLength={19}
                                defaultValue={this.state.zoneName}
                                placeholder={this.props.actions.translate.get('gardenDefine2VC_extension')}
                                onChangeText={(text) => this.setState({zoneName: text})}
                                />
                        </View>
                    </View>
                    )

        indents.push(
                <View style={this.style.switchContainer}>
                    <View style={this.style.localizationTitleContainer}>
                        <Text style={this.style.localizationTitle}>{this.props.actions.translate.get('gardenDefine2VC_localization_label')}</Text>
                    </View>
                    <View style={this.style.localizationSwitchContainer}>
                        <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle1]}>{this.props.actions.translate.get('gardenDefine2VC_indoor')}</Text>
                        <Switch style={this.style.localizationSwitch} onValueChange = {(value) => this.setState({outdoor: value, indexSun: (!value && this.state.indexSun == 3 ? 2 : this.state.indexSun)})} value = {this.state.outdoor} thumbColor={"white"} trackColor={"#a5cd07"}/>
                        <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle2]}>{this.props.actions.translate.get('gardenDefine2VC_outdoor')}</Text>
                    </View>
                </View>
                )

        if (this.props.zoneData[this.props.idZone])
            indents.push(
                    <View style={this.style.gardenExtension}>
                        <Text style={this.style.homeSelectedTitle}>{this.props.actions.translate.get('gardenDefine2VC_extension')}</Text>
                        <View style={this.style.gardenExtensionInput}>
                            <View  style={[this.style.inputContainer]}>
                                <TextInput
                                    style={this.style.inputExtension}
                                    autoCapitalize = 'none'
                                    defaultValue={this.state.extension + ""}
                                    maxLength={4}
                                    keyboardType='numeric'
                                    onChangeText={(text) => this.setState({extension: text})}
                                    />
                            </View>
                            <Text style={this.style.gardenExtensionText}>{'m²'}</Text>
                        </View>
                    </View>
                    );

        indents.push(
                <View style={this.style.lightContainer}>
                    <View style={this.style.lightTitleContainer}>
                        <Text style={this.style.lightTitle}>{this.state.outdoor ? this.props.actions.translate.get('gardenDefine2VC_outdoor_light') : this.props.actions.translate.get('gardenDefine2VC_indoor_light')}</Text>
                    </View>
                    <View style={this.style.lightButtonContainer}>
                        <TouchableOpacity style={[this.style.lightButton, this.state.indexSun == 0 ? this.style.lighButtonActive : {}]} activeOpacity={1} onPress={() => {
                                this.setState({indexSun: 0})
                            }}>
                            <Image style={this.style.lightButtonImage} resizeMode={"contain"} source={this.state.indexSun == 0 ? sun1_on : sun1_off} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[this.style.lightButton, this.state.indexSun == 1 ? this.style.lighButtonActive : {}]} activeOpacity={1} onPress={() => {
                                this.setState({indexSun: 1})
                            }}>
                            <Image style={this.style.lightButtonImage} resizeMode={"contain"} source={this.state.indexSun == 1 ? sun2_on : sun2_off} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[this.style.lightButton, this.state.indexSun == 2 ? this.style.lighButtonActive : {}]} activeOpacity={1} onPress={() => {
                                this.setState({indexSun: 2})
                            }}>
                            <Image style={this.style.lightButtonImage} resizeMode={"contain"} source={this.state.indexSun == 2 ? sun3_on : sun3_off} />
                        </TouchableOpacity>
                        {this.renderLastLightButton()}
                    </View>
                </View>
                )

        indents.push(
                <View style={this.style.pictureContainer}>
                    <View style={this.style.pictureTitleZoneContainer}>
                        <Text style={this.style.pictureTitle}>{this.state.isMap ? this.props.actions.translate.get('modifyGarden_map') : this.props.actions.translate.get('ModifyZone_picture')}</Text>
                    </View>
                    <View style={this.style.pictureConatinerIn}>
                        <TouchableOpacity style={[this.style.pictureImageTouchable]} activeOpacity={1}
                            onPress={() => {
                                this.state.isMap ? this.getMaps() : this.getPhotos()
                            }}>
                            <Image source={{uri: this.state.uri}} resizeMode={"cover"} style={this.style.buttonImageIn}/>
                        </TouchableOpacity>
                    </View>
                    <View style={this.style.buttonGPSContainer}>
                        <FliwerGreenButton textStyle={this.style.changeMaptoImageButtonText} text={this.state.isMap ? this.props.actions.translate.get('modifyGarden_change_to_picture') : this.props.actions.translate.get('modifyGarden_change_to_map')} containerStyle={this.style.buttonGPS}
                            onPress={async () => {
                                this.state.isMap ? await this.getPhotos() : await this.getMaps()
                            }}/>
                    </View>
                    {this.renderInputFile()}
                </View>

                )

        return indents;
    }

    renderIrrigationTab() {
        var indents = [];

        indents.push(
                <View style={this.style.switchContainer}>
                    <View style={this.style.localizationTitleContainer}>
                        <Text style={[this.style.localizationTitle, {fontWeight: "bold"}]}>{this.props.actions.translate.get('ModifyZone_irrigation')}</Text>
                    </View>
                    <View style={this.style.localizationSwitchContainer}>
                        <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle1]}>{this.props.actions.translate.get('ModifyZone_irrigation_disabled')}</Text>
                        <Switch style={this.style.localizationSwitch} onValueChange = {(value) => this.setState({irrigationEnabled: value})} value = {this.state.irrigationEnabled} thumbColor={"white"} trackColor={"#a5cd07"}/>
                        <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle2]}>{this.props.actions.translate.get('ModifyZone_irrigation_enabled')}</Text>
                    </View>
                </View>
                )

        indents.push(
            <View style={{width: "100%", marginTop: 20}}>
                <FliwerTimeSpotAllowed disabled={!this.state.irrigationEnabled} idZone={this.props.idZone} addTime={(d) => {
                        this.addTime(d)
                    }}/>
            </View>
        );

        if (this.props.zoneData[this.props.idZone]) {
            indents.push(
                    <View style={{width: "100%", marginTop: 20}}>
                        <Text style={[this.style.homeSelectedTitle, {fontWeight: "bold"}]}>{this.props.actions.translate.get('ModifyZone_irrigation_restrictions')}</Text>

                        <View style={{flexDirection: "row", width: "100%", marginTop: 10, paddingLeft: 20, marginBottom: 5}}>
                            <View  style={{flex: 1, justifyContent: "center"}}>
                                <Text style={[this.style.homeSelectedTitle, {fontSize: 16}]}>{this.props.actions.translate.get('ModifyZone_temperature_below')}</Text>
                            </View>
                            <View style={{width: 100}}>
                                <View  style={{width: "100%", flexDirection: "row"}}>
                                    <View  style={[this.style.inputContainer, {width: 60}]}>
                                        <TextInput
                                            style={this.style.inputExtension}
                                            autoCapitalize = 'none'
                                            value={this.state.irrigationMinTemp}
                                            maxLength={8}
                                            keyboardType='numeric'
                                            onChangeText={(text) => {
                                                text = text.replace(/[^0-9,\.-]/gi, '');
                                                this.setState({irrigationMinTemp: text})
                                            }}
                                            />
                                    </View>
                                    <Text style={[this.style.gardenExtensionText, {paddingTop: 8, fontSize: 16}]}>{'°C'}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{flexDirection: "row", width: "100%", paddingLeft: 20, marginBottom: 10}}>
                            <View  style={{flex: 1, justifyContent: "center"}}>
                                <Text style={[this.style.homeSelectedTitle, {fontSize: 16}]}>{this.props.actions.translate.get('ModifyZone_wind_up_to')}</Text>
                            </View>
                            <View style={{width: 100}}>
                                <View  style={{width: "100%", flexDirection: "row"}}>
                                    <View  style={[this.style.inputContainer, {width: 60}]}>
                                        <TextInput
                                            style={this.style.inputExtension}
                                            autoCapitalize = 'none'
                                            value={this.state.irrigationMaxWind}
                                            maxLength={8}
                                            keyboardType='numeric'
                                            onChangeText={(text) => {
                                                text = text.replace(/[^0-9,\.]/gi, '');
                                                this.setState({irrigationMaxWind: text})
                                            }}
                                            />
                                    </View>
                                    <Text style={[this.style.gardenExtensionText, {paddingTop: 8, fontSize: 16}]}>{'Km/h'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    );
        }

        return indents;
    }

    renderParametersTab() {
        var indents = [];

        indents.push(
            <View style={this.style.checkboxWrapper}>
                <CheckBox key={101}
                    title={"Información lumínica"}
                    textStyle={{}}
                    containerStyle={this.style.checkboxContainerStyle}
                    checked={this.state.enableLightParam? true : false}
                    onPress={this.changeCheckboxEnableLightParam()}
                />
            </View>
        );

        indents.push(
            <View style={this.style.checkboxWrapper}>
                <CheckBox key={102}
                    title={"Información de temperatura"}
                    textStyle={{}}
                    containerStyle={this.style.checkboxContainerStyle}
                    checked={this.state.enableTempParam? true : false}
                    onPress={this.changeCheckboxEnableTempParam()}
                />
            </View>
        );

        indents.push(
            <View style={this.style.checkboxWrapper}>
                <CheckBox key={103}
                    title={"Información de la humedad ambiental"}
                    textStyle={{}}
                    containerStyle={this.style.checkboxContainerStyle}
                    checked={this.state.enableAirHumParam? true : false}
                    onPress={this.changeCheckboxEnableAirHumParam()}
                />
            </View>
        );

        indents.push(
            <View style={this.style.checkboxWrapper}>
                <CheckBox key={105}
                    title={"Información de la humedad del suelo"}
                    textStyle={{}}
                    containerStyle={this.style.checkboxContainerStyle}
                    checked={this.state.enableWaterParam? true : false}
                    onPress={this.changeCheckboxEnableWaterParam()}
                />
            </View>
        );

        indents.push(
            <View style={this.style.checkboxWrapper}>
                <CheckBox key={104}
                    title={"Información del fertilizante"}
                    textStyle={{}}
                    containerStyle={this.style.checkboxContainerStyle}
                    checked={this.state.enableFertilizerParam? true : false}
                    onPress={this.changeCheckboxEnableFertilizerParam()}
                />
            </View>
        );

        indents.push(
            <View style={this.style.checkboxWrapper}>
                <CheckBox key={105}
                    title={"Información metereológica"}
                    textStyle={{}}
                    containerStyle={this.style.checkboxContainerStyle}
                    checked={this.state.enableMeteoParam? true : false}
                    onPress={this.changeCheckboxEnableMeteoParam()}
                />
            </View>
        );

        return indents;
    }

    changeCheckboxEnableLightParam() {
        return () => {
            this.setState({enableLightParam: !this.state.enableLightParam, enableLightParamChanged: true})
        };
    }

    changeCheckboxEnableTempParam() {
        return () => {
            this.setState({enableTempParam: !this.state.enableTempParam, enableTempParamChanged: true})
        };
    }

    changeCheckboxEnableAirHumParam() {
        return () => {
            this.setState({enableAirHumParam: !this.state.enableAirHumParam, enableAirHumParamChanged: true})
        };
    }

    changeCheckboxEnableFertilizerParam() {
        return () => {
            this.setState({enableFertilizerParam: !this.state.enableFertilizerParam, enableFertilizerParamChanged: true})
        };
    }

    changeCheckboxEnableWaterParam() {
        return () => {
            this.setState({enableWaterParam: !this.state.enableWaterParam, enableWaterParamChanged: true})
        };
    }

    changeCheckboxEnableMeteoParam() {
        return () => {
            this.setState({enableMeteoParam: !this.state.enableMeteoParam, enableMeteoParamChanged: true})
        };
    }

    renderEditHomeButton()
    {
        if (true)
            return(
                    <TouchableOpacity style={[this.style.buttonAddHome]} onPress={() => {
                            this.modifyHome()
                        }}>
                        <Icon name="edit" style={[{fontSize: 25}]} ></Icon>
                    </TouchableOpacity>
                    )
    }

    renderInputFile() {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => this.fileInput = fileInput} style={this.style.fileInput} type="file"  />);
    }

    addTime(d) {
        this.setState({hoursAllowed: [].concat(d)})

        this.props.actions.modifyZoneActions.addCurrentZoneModifications(this.props.idZone, this.state.homeId, this.state.zoneName, this.state.extension,
                this.state.outdoor, this.state.indexSun, this.state.irrigationEnabled, this.state.hoursAllowed, this.state.picture);
    }

    renderLastLightButton() {
        if (this.state.outdoor)
            return (
                    <TouchableOpacity style={[this.style.lightButton, this.state.indexSun == 3 ? this.style.lighButtonActive : {}]} activeOpacity={1} onPress={() => {
                            this.setState({indexSun: 3})
                        }}>
                        <Image style={this.style.lightButtonImage} resizeMode={"contain"} source={this.state.indexSun == 3 ? sun3_on : sun3_off} />
                    </TouchableOpacity>
                    )
    }

    renderModalPlaceHolder() {
        return (
                <View style={this.style.placeHolderContainer}>
                    <View style={this.style.placeHolderTextContainer}><Text style={this.style.placeHolder}>{this.props.actions.translate.get('ModifyZone_garden_info')}</Text></View>
                    <View style={this.style.underLine}></View>
                </View>
                )
    }

    renderBottomBar()
    {
        return(
                <View style={{width: "100%"}}>
                    <View style={this.style.underLine}></View>
                    <View style={this.style.buttonBottomContainer}>
                        <View style={[this.style.updateButtonContainer, {marginRight: 10}]}>
                            <FliwerGreenButton text={this.props.actions.translate.get('general_save')} containerStyle={this.style.updateButtonTouchable} onPress={async () => {
                                await this.save()
                            }}/>
                        </View>
                        <View style={[this.style.updateButtonContainer, {marginLeft: 10}]}>
                            <FliwerGreenButton text={this.props.actions.translate.get('general_close')}
                                style={{backgroundColor: FliwerColors.secondary.gray}}
                                containerStyle={this.style.updateButtonTouchable} onPress={() => {
                                this.onClose();
                            }}/>
                        </View>
                        {this.drawTrashButton()}
                    </View>
                </View>
        );
    }

    drawTrashButton() {

        return (<TouchableOpacity style={this.style.deleteButton} onMouseEnter={this.hoverIn('trashIcon')} onMouseLeave={this.hoverOut('trashIcon')}  onPress={() => {
            var idGarden = this.props.zoneData[this.props.idZone].idImageDash;
            var idZone = this.props.idZone;

            var zoneInformation = {
            zoneName: this.state.zoneName, indexSun: this.state.indexSun, irrigationEnabled: this.state.irrigationEnabled, hoursAllowed: this.state.hoursAllowed, extension: this.state.extension, outdoor: this.state.outdoor, picture64: this.state.picture64, picture: this.state.picture, map: this.state.map, isMap: this.state.isMap, photoMap: this.props.photoMap,
            irrigationMinTemp: this.state.irrigationMinTemp, irrigationMaxWind: this.state.irrigationMaxWind,
            enableLightParam: this.state.enableLightParam, enableTempParam: this.state.enableTempParam, enableAirHumParam: this.state.enableAirHumParam, enableFertilizerParam: this.state.enableFertilizerParam, enableWaterParam: this.state.enableWaterParam, enableMeteoParam: this.state.enableMeteoParam
            };            
                        if (this.props.deleteFunc)this.props.deleteFunc(idGarden, idZone);
                        // if(this.props.modifyFunc)this.pro<ps.modifyFunc(idGarden, idZone, zoneInformation);

                        // if (this.props.modalFunc)
                        //     this.props.modalFunc(true, this.props.idZone);
                        this.props.modalClosed();
                    }}>
            <Image style={this.style.trashIcon} source={trashImage} resizeMode={"contain"}/>
        </TouchableOpacity>)
    }

    getLight(out, light) {
        if (out) {
            switch (light) {
                case 3:
                    return 0;
                    break;
                case 2:
                    return 1;
                    break;
                case 4:
                    return 2;
                    break;
                case 1:
                    return 3;
                    break;
                default:
                    return light;
            }
        } else {
            switch (light) {
                case 7:
                    return 0;
                    break;
                case 6:
                    return 1;
                    break;
                case 5:
                    return 2;
                    break;
                case 5:
                    return 3;
                    break;
                default:
                    return light;
            }
        }
    }

    modifyHome()
    {
        //loading
        this.props.actions.createHomeActions.setCreateHomeName(this.props.homeData[this.state.homeId].name, this.props.homeData[this.state.homeId].countryCity, this.props.homeData[this.state.homeId].nameCity).then((response) => {
            //loading
            this.setState({goModifyHome: true})
        }, (err) => {
            if (err.reason)
                toast.error(err.reason);
        })
    }

    async getPhotos() {
        var that = this;
        const options = {
            fileInput: this.fileInput
        };

        try {
          var response = await MediaPicker.openPicker(options);
          if(!response || response.didCancel){
            console.log('User cancelled image picker');
          }else{

            var path = response.path? response.path : response.uri;
            await resizeImage.resize(Platform.OS === 'web' ? this.fileInput.files[0] : response.base64, path).then(async (resultImage) => {

                await this.props.actions.modifyZoneActions.removeMap();
                await this.props.actions.fliwerGardenActions.removeMapCoords(this.props.zoneData[this.props.idZone].idImageDash);
                this.setState({dragging: false, picture64: resultImage, isMap: false, picture: resultImage});
                //console.log("map removed! ", this.props.gardenData[this.props.zoneData[this.props.idZone].idImageDash]);

            }, (error) => {
                console.log(error)
            });


          }
        } catch(err) {
          console.log("Error gathering image");
        }

    }

    printHomes() {
        var array = [];
        //console.log("home",this.props.homeData);
        //console.log("zone",this.props.zoneData);
        //console.log("garden",this.props.gardenData);
        for (var index in this.props.homeData) {
            array.push({label: this.props.homeData[index].name, value: this.props.homeData[index].id});
        }
        array.sort(function (a, b) {
            if (a.label < b.label) {
                return -1;
            } else if (a.label > b.label) {
                return 1;
            } else
                return 0;
        })
        if (!this.state.homeId && array.length > 0)
            this.state.homeId = array[0].value;
        return array;
    }

    async save()
    {
        /*
         console.log("homeId"+this.state.homeId);
         console.log("zone name"+this.state.zoneName);
         console.log("indexSun"+this.state.indexSun);
         console.log("outdoor"+this.state.outdoor);
         ;
         console.log("picture"+this.state.picture);
         console.log("horas permitidas"+this.state.hoursAllowed);
         */

        var idGarden = this.props.zoneData[this.props.idZone].idImageDash;
        var idZone = this.props.idZone;

        var zoneInformation = {
            zoneName: this.state.zoneName, indexSun: this.state.indexSun, irrigationEnabled: this.state.irrigationEnabled, hoursAllowed: this.state.hoursAllowed, extension: this.state.extension, outdoor: this.state.outdoor, picture64: this.state.picture64, picture: this.state.picture, map: this.state.map, isMap: this.state.isMap, photoMap: this.props.photoMap,
            irrigationMinTemp: this.state.irrigationMinTemp, irrigationMaxWind: this.state.irrigationMaxWind,
            idHome:this.state.homeId,
            enableLightParam: this.state.enableLightParam, enableTempParam: this.state.enableTempParam, enableAirHumParam: this.state.enableAirHumParam, enableFertilizerParam: this.state.enableFertilizerParam, enableWaterParam: this.state.enableWaterParam, enableMeteoParam: this.state.enableMeteoParam
        };

        console.log("modify: ", zoneInformation);

        if(this.props.modifyFunc)this.props.modifyFunc(idGarden, idZone, zoneInformation);
        /*
        this.props.loading();
        await this.props.actions.fliwerGardenActions.modifyZoneInformation(idGarden, idZone, zoneInformation).then(async (response) => {
            await this.props.actions.modifyZoneActions.removeMap();
            await this.props.actions.createZoneActions.removePhotoZone();

            toast.notification(this.props.actions.translate.get("modifyGarde_modify_correct"));
            this.props.loadingOff();

        }, (error) => {
            this.props.loadingOff();
            if (error.reason)
                toast.error(error.reason);
        });
        this.props.modalClosed();
        */

    }

    addHome() {

        this.props.actions.modifyZoneActions.addCurrentZoneModifications(this.props.idZone, this.state.homeId, this.state.zoneName, this.state.extension,
                this.state.outdoor, this.state.indexSun, this.state.irrigationEnabled, this.state.hoursAllowed, this.state.picture,
                this.state.irrigationMinTemp, this.state.irrigationMaxWind);
        this.setState({goAddHome: true});
    }

    async getMaps() {

        await this.props.actions.modifyZoneActions.addCurrentZoneModifications(this.props.idZone, this.state.homeId, this.state.zoneName, this.state.extension,
                this.state.outdoor, this.state.indexSun, this.state.irrigationEnabled, this.state.hoursAllowed, this.state.picture,
                this.state.irrigationMinTemp, this.state.irrigationMaxWind);
        this.setState({goMaps: true});
    }

    /*
     handleMap() {
     return ()=> {
     this.setState({isMap:true});
     };
     }
     */

    onClose() {
        this.props.actions.modifyZoneActions.removeMap();
        this.props.actions.createZoneActions.removePhotoZone();
        this.props.modalClosed();
    }

    hasSensorPro() {
        var hasSensorPro = false;
        var devices = Object.values(this.props.devices);
        if (devices) {
            for (var index in devices) {
                var device = devices[index];
                //console.log("els tipus son: " +index+ "->" +device.type +" idzone->" + device.idZone);
                if (device.type == "SENS_PRO" && device.idZone == this.props.idZone)
                    hasSensorPro = true;
            }
        }
        return hasSensorPro;
    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        zoneData: state.fliwerZoneReducer.data,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        modifyZone: state.modifyZoneReducer,
        userData: state.sessionReducer.data,
        roles: state.sessionReducer.roles,
        photoMap: state.createZoneReducer.photo,
        devices: state.fliwerDeviceReducer.devices
    }
}

// Doing this merges our actions into the componentâ€™s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch),
            modifyZoneActions: bindActionCreators(ActionsModifyZone, dispatch),
            createZoneActions: bindActionCreators(CreateZoneActions, dispatch),
            createHomeActions: bindActionCreators(ActionCreateHome, dispatch),
        }
    }
}


var style = {
    scrollView: {
        paddingLeft: 10, paddingRight: 10
    },
    buttonImageIn: {
        width: 100,
        height: 60,
        backgroundColor: "white",
        borderRadius: 15
    },
    fileInput: {
        display: "none" //display: "none" only works on web
    },
    pictureTitleZoneContainer: {
        alignSelf: "center",
        marginRight: 10,

    },
    selectAndPlusConatiner: {
        flexDirection: "row",
        alignItems: "center",

    },
    buttonBottomContainer: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        paddingTop: 15
    },
    trashIcon: {
        width: 20,
        height: 20
    },
    deleteButton: {
        height: "100%",
        position: "absolute",
        right: 2,
        top: 6,
        justifyContent: "center",
    },
    updateButtonTouchable: {
        height: "100%",
        width: "100%",
        marginBottom: 0,
    },
    updateButtonContainer: {
        height: 31,
        width: 100,
    },
    buttonGPS: {
        height: 31,
        width: 140,
    },
    buttonGPSContainer: {
        justifyContent: "center",
        marginLeft: 15,
    },
    pictureContainer: {
        marginBottom: 10,
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",

    },
    pictureImageTouchable:
            {

            },
    pictureTitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
    },
    lightContainer: {
        width: "100%",
        //maxWidth:800,
        marginBottom: 10,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexDirection: "row",

    },
    lightTitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
    },
    lightTitleContainer: {
        marginRight: 3,
    },
    lightButtonContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        //width:"100%"
    },
    lighButtonActive: {
        backgroundColor: "#a6cf07"
    },
    lightButton: {
        width: 70,
        height: 70,
        backgroundColor: "#f4f4f4",
        borderRadius: 5
    },
    lightButtonImage: {
        width: "100%",
        height: "100%",
        marginTop: "0%",
        marginLeft: "0%"
    },
    gardenExtension: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    gardenExtensionText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
    },
    gardenExtensionInput: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    inputContainer: {
        height: 35,
        width: 37,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRadius: 4,
        marginRight: 10,
        //backgroundColor:"white",
    },
    switchContainer: {
        marginTop: 10,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
    },
    localizationTitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
    },
    localizationSwitchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    localizationSwitch: {
        transform: [{scaleX: 1.5}, {scaleY: 1.5}]
    },
    localizationSwitchTitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
    },
    localizationSwitchTitle1: {
        marginRight: 20
    },
    localizationSwitchTitle2: {
        marginLeft: 20
    },
    inputGarden: {
        //height:"100%",
        //width:"100%",
        fontFamily: "MyriadPro-Regular",
        borderColor: FliwerColors.secondary.gray,
        borderRadius: 4,
        padding: 5,
        backgroundColor: "white",
        borderWidth: 1,
        height: 36,
    },
    inputExtension: {
        //height:"100%",
        //width:"100%",
        fontFamily: "MyriadPro-Regular",
        borderColor: FliwerColors.secondary.gray,
        borderRadius: 4,
        padding: 2,
        //backgroundColor:"white",
        borderWidth: 0,
        height: 33,
        textAlign: "center"
    },
    imageIconHome: {
        height: 25,
        width: 25,
    },
    inputZoneContainer: {
        height: 36,
        borderRadius: 4,
        width: 220,
        marginRight: 32,
    },
    selectContainer: {
        height: 36,
        //width:200,
        borderRadius: 4,
        //zIndex:2,
        //flexGrow:1,
        width: 220,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#d3d3d3"
    },
    selectPicker: {
        height: 36,
    },
    buttonAddHome: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 15,
    },
    placeHolderTextContainer: {
        alignItems: "center",
        marginBottom: 5,
    },
    placeHolderContainer: {
        width: "100%",
    },
    placeHolder: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20
    },
    underLine: {
        height: 1,
        backgroundColor: "black"
    },
    homeContainer: {
        //width:"90%",
        //maxWidth:800,
        marginBottom: 10,
        //display:"flex",
        flexDirection: "column",
        alignItems: "center",
        //justifyContent:"space-evenly",
        //flexGrow:1,
        //zIndex:1
    },
    zoneSelected: {
        //display:"flex",
        flexDirection: "row",
        marginBottom: 18,
        height: 36,
        alignSelf: "flex-start",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
    },
    homeSelected: {
        //display:"flex",
        flexDirection: "row",
        marginBottom: 20,
        height: 36,
        alignSelf: "flex-start",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 10,
    },
    homeSelectedTitle: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
        marginRight: 10
    },
    textNext: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 20,
        textAlign: "center"
    },
    tab: {
        marginTop: 10, padding: 5
    },
    checkboxWrapper: {
        flexDirection: "row", width: "100%"
    },
    checkboxContainerStyle: {
        backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4
    },
    "@media (orientation:landscape)": {
        homeContainer: {
            //flexDirection:"row",
            //marginBottom:10,
            //justifyContent:"center"
        },
        homeSelectedName: {
            //height:50,
            //marginRight:10,
            //marginBottom:0,
            //justifyContent:"center",
            //alignItems:"center",
            //alignSelf:"center"
        },
        homeSelected: {
            //width:"100%"
        },
        homeSelectedTitle: {
            //fontSize:15
        },
        buttonAddHome: {
            //flexGrow:1,
        }

    },
    "@media (width<=450)": {
        homeSelectedTitle: {
            fontSize: 15,
        },
        textNext: {
            fontSize: 15
        },
        placeHolder: {
            //fontSize:10
        },
        localizationTitle: {
            fontSize: 15
        },
        gardenExtensionText: {
            fontSize: 15
        },
        lightTitle: {
            fontSize: 15
        },
        pictureTitle: {
            fontSize: 15
        },
        changeMaptoImageButtonText: {
            fontSize: 15
        },
        buttonGPS: {
            width: 130,
        },
        localizationSwitchTitle: {
            fontSize: 15
        },
        lightButton: {
            width: 52,
            height: 52,
        }
    },
    "@media (width<=400)": {
        changeMaptoImageButtonText: {
            fontSize: 12
        },
        buttonGPS: {
            width: 110,
        }
    },
    ":hover": {
        trashIcon: {
            filter: "brightness(70%)"
        },
    },
};


export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, ZoneModify));
