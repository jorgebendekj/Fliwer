'use strict';

import React, { Component } from 'react';
import { View, ScrollView, Image, Text, TextInput, TouchableOpacity, Switch, Platform } from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';
import FliwerLoading from './fliwerLoading'
import Dropdown from '../widgets/dropdown/dropdown';
import MainFliwerTopBar from '../components/mainFliwerTopBar.js'
import ImageBackground from '../components/imageBackground.js'
import DatePicker from '../widgets/datePicker/datePicker';
//import CheckBox from '../widgets/checkbox/checkbox';
import { CheckBox } from 'react-native-elements'
import Modal from '../widgets/modal/modal'
import PhoneAuth from '../widgets/phoneAuth/phoneAuth'

import FliwerSimpleTabView from '../components/custom/FliwerSimpleTabView.js';
import FliwerDeleteModal from '../components/custom/FliwerDeleteModal.js'
import FliwerCalmButton from '../components/custom/FliwerCalmButton.js'
import FliwerGreenButton from '../components/custom/FliwerGreenButton.js'
import FliwerVerifyPhoneModal from '../components/custom/FliwerVerifyPhoneModal.js'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../actions/languageActions.js'; //Import your actions
import * as ActionGardener from '../actions/gardenerActions.js'; //Import your actions
import * as ActionsTheme from '../actions/themeActions.js'; //Import your actions

import { Redirect, withRouter } from '../utils/router/router'
import Icon from 'react-native-vector-icons/Entypo';
import IconFeather from 'react-native-vector-icons/Feather';
import { mediaConnect } from '../utils/mediaStyleSheet.js'
import { toast } from '../widgets/toast/toast'
import PhoneInput from '../widgets/phoneInput/phoneInput';
import { MediaPicker, FileDrop, getBase64 } from '../utils/uploadMedia/MediaPicker'
import { Orientation } from '../utils/orientation/orientation'
import { FliwerCommonUtils } from '../utils/FliwerCommonUtils'
import { FliwerColors, CurrentTheme } from '../utils/FliwerColors'
import { FliwerStyles } from '../utils/FliwerStyles'
import { loginStyles } from './login/loginStyles.js';

import moment from 'moment';

import icon2 from '../assets/img/fliwer_icon2.png'
import trashImage from '../assets/img/trash.png'

import NetInfo from '@react-native-community/netinfo';


class ProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: this.props.userData.email,
            profileImage: null,
            name: this.props.userData.first_name,
            surname: this.props.userData.last_name,
            phone: this.props.userData.phone,
            born: this.props.userData.born,
            gender: this.props.userData.sex,
            iscompany: this.props.userData.iscompany ? true : false,
            company_name: this.props.userData.company_name,
            company_cif: this.props.userData.company_cif,
            gardener: this.props.userData.gardener,
            alertConfiguration: {},
            managementConfiguration: {},
            saving: false,
            loading: false,
            dragging: false,
            modalDeleteVisible: false,
            modalVerifyPhoneVisible: false,
            logout: false,
            userToDelete: null,
            isGardener: this.props.isGardener,
            cif: this.props.userData.cif,
            address: this.props.userData.address,
            city: this.props.userData.city,
            zipCode: this.props.userData.zipCode,
            iban: this.props.userData.iban,
            country: this.props.userData.country,
            idRegion: this.props.userData.idRegion,
            idProvince: this.props.userData.idProvince,
            billingEmail: this.props.userData.billingEmail,
            receiveInvoicesByEmail: this.props.userData.receiveInvoicesByEmail,
            receiveInvoicesByEmailChanged: false,
            receiveQuotationsByEmail: this.props.userData.receiveQuotationsByEmail,
            receiveQuotationsByEmailChanged: false,
            receiveTicketsByEmail: this.props.userData.receiveTicketsByEmail,
            receiveTicketsByEmailChanged: false,
            receiveAuditsByEmail: this.props.userData.receiveAuditsByEmail,
            receiveAuditsByEmailChanged: false,
            receiveSepaByEmail: this.props.userData.receiveSepaByEmail,
            receiveSepaByEmailChanged: false,
            Aica_buyer: this.props.userData.Aica_buyer,
            Aica_id: this.props.userData.Aica_id,
            Aica_secret: this.props.userData.Aica_secret,
            isConnected: true
        };

        Orientation.unlockAllOrientations();

    }

    componentDidMount() {
        //console.log("componentDidMount this.props.userData.phone", this.props.userData.phone);

        if (this.props.isGardener) {
            this.setState({ saving: true });
            this.props.actions.fliwerGardenerActions.getGardenerUsers().then((response2) => {
                this.setState({ saving: false });
                //this.forceUpdate();
            }, (err) => {
                this.setState({ saving: false });
                if (err && err.reason)
                    toast.error(err.reason);
            });

        }

        this.props.actions.sessionActions.getAccessLog().then((response3) => {
        });
    }

    componentDidMount() {
        NetInfo.fetch().then(state => {
            this.setState({ isConnected: state.isConnected });
        });
    }

    componentDidUpdate(prevProps, nextState) {
        //console.log("componentDidUpdate this.props.userData.phone", this.props.userData.phone);

        if (prevProps.isGardener != this.props.isGardener) {
            if (this.props.isGardener) {
                this.setState({ saving: true });
                this.props.actions.fliwerGardenerActions.getGardenerUsers().then((response2) => {
                    this.setState({ saving: false });
                    //this.forceUpdate();
                }, (err) => {
                    this.setState({ saving: false });
                    if (err && err.reason)
                        toast.error(err.reason);
                });

            } else {
                this.setState({ saving: false });
            }
        }

    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({ loading: loading });
        };
    }

    onChangePhoneAuth(phone) {
        this.state.phone = phone;
    }

    onValidatePhoneAuth(verifiedPhone, verifiedCode, verificationId) {
        return new Promise((resolve, reject) => {
            console.log("validating!", verifiedPhone)
            if (!verifiedPhone) {
                reject(this.props.actions.translate.get('PhoneAuth_please_indicate_your_mobile_number'));
                return;
            }
            this.setState({ logout: true });
            this.props.actions.sessionActions.deleteUser().then(() => {
                this.props.actions.sessionActions.logout(true);
            }, (err) => {
                reject(err);
            });

        });
    }

    render() {
        var that = this;

        //if has a session opened redirects to home screen
        var born = this.state.born ? this.state.born : this.props.userData.born;
        if (born) {
            var bornYear = born.split("-")[0]
            var bornMonth = born.split("-")[1]
            var bornDay = born.split("-")[2]
            born = (new Date(bornYear, bornMonth - 1, bornDay)).getTime()
        } else
            born = 1000;

        var addressTitle = this.props.actions.translate.get('general_address');
        var cityTitle = this.props.actions.translate.get('general_city');
        var zipCodeTitle = this.props.actions.translate.get('general_zip_code');
        var receiveInvoicesByEmailTitle = this.props.actions.translate.get('userProfileVC_receive_invoices_by_email');
        var receiveQuotationsByEmailTitle = this.props.actions.translate.get('userProfileVC_receive_quotations_by_email');
        var receiveTicketsByEmailTitle = this.props.actions.translate.get('userProfileVC_receive_tickets_by_email');
        var receiveAuditsByEmailTitle = this.props.actions.translate.get('userProfileVC_receive_audits_by_email');
        var receiveSepaByEmailTitle = this.props.actions.translate.get('userProfileVC_receive_sepa_by_email');

        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline

        if (!userData.email) {
            return (
                <FliwerLoading />
            );
        } else {
            if (this.state.gender == null)
                this.state.gender = userData.sex;
            if (this.state.iscompany == null)
                this.state.iscompany = userData.iscompany ? true : false;

            return (
                <ImageBackground style={{ height: "100%", backgroundColor: CurrentTheme.primaryColor }} resizeMode={"cover"} loading={this.state.saving || this.state.loading}>
                    <MainFliwerTopBar />
                    <ScrollView style={[this.style.contentView]} contentContainerStyle={this.style.contentViewContainer}>
                        <View style={this.style.contentViewIn}>
                            <View style={this.style.topContainer}
                                ref={(view) => {
                                    this._view = view;
                                    if (!this.state.rect)
                                        this.measureView();
                                }} onLayout={() => this.measureView()}>
                                <FileDrop style={this.style.fileDrop} onDrop={this.handleDrop} onFrameDragEnter={() => {
                                    that.setState({ dragging: true })
                                }} onFrameDragLeave={() => {
                                    that.setState({ dragging: false })
                                }}>
                                    <View style={this.style.fileDropIn}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                this.getPhotos()
                                            }}
                                            style={[
                                                this.style.buttonImage,
                                                {
                                                    width: this.state.imageWidth,
                                                    height: this.state.imageWidth

                                                }
                                            ]}
                                            disabled={!this.state.isConnected}
                                        >
                                            <Image source={{ uri: this.state.profileImage ? this.state.profileImage : userData.photo_url }} resizeMode={"cover"} style={this.style.buttonImageIn} />
                                        </TouchableOpacity>
                                        {this.renderInputFile()}
                                        <View style={this.style.topContainerIn}>
                                            <Text style={this.style.textBig}>{userData.first_name + (userData.company_name ? (" - " + userData.company_name) : "")}</Text>
                                            <View style={[this.style.buttonSignOut]}>
                                                <TouchableOpacity style={[this.style.buttonAccess, this.style.buttonBack]} onPress={() => {
                                                    this.props.actions.sessionActions.logout(true)
                                                }}>
                                                    <Text style={[this.style.buttonAccessIn, this.style.buttonBackIn, this.style.buttonSignOutIn]}>{this.props.actions.translate.get('userProfileVC_close_sesion')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {this.renderDragHere()}
                                    </View>
                                </FileDrop>
                            </View>

                            <View style={this.style.formOut}>

                                <FliwerSimpleTabView style={{ height: "auto" }} hideChildren={[false, true, true, true, true, true, true]} headerStyle={{ backgroundColor: CurrentTheme.secondaryColor }} tabTextStyle={{ color: CurrentTheme.primaryText }} selectedTabContainerStyle={{ backgroundColor: CurrentTheme.complementaryColor }}>
                                    <View title={this.props.actions.translate.get('userProfileVC_tabGeneral')}>
                                        <View key={"tab_General"} style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form}>
                                            <View style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in}>

                                                <Text style={this.style.titleInput}>{this.props.actions.translate.get('general_language')}</Text>
                                                <View style={this.style.selectContainer}>
                                                    <Dropdown
                                                        modal={true}
                                                        placeholder={this.props.actions.translate.get('general_language')}
                                                        selectedValue={that.props.language}
                                                        style={this.style.select}
                                                        styleOptions={{ color: "white" }}
                                                        options={this.printLanguages()}
                                                        onChange={function (value) {
                                                            if (value)
                                                                that.props.actions.translate.getTranslation(value);
                                                        }}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                <Text style={this.style.titleInput}>{this.props.actions.translate.get('general_country')}</Text>
                                                <View style={this.style.selectContainer}>
                                                    <Dropdown
                                                        modal={true}
                                                        filterEnabled={true}
                                                        placeholder={this.props.actions.translate.get('general_country')}
                                                        selectedValue={that.state.country}
                                                        style={this.style.select}
                                                        styleOptions={{}}
                                                        options={this.printCountries()}
                                                        onChange={(value) => {
                                                            this.setState({ country: value });
                                                        }}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                {/*
                                                {
                                                    this.state.country == 'ES' ?
                                                        <Text style={this.style.titleInput}>{this.props.actions.translate.get('general_region')}</Text>
                                                        : null
                                                }
                                                {
                                                    this.state.country == 'ES' ?
                                                        <View style={this.style.selectContainer}>
                                                            <Dropdown
                                                                modal={true}
                                                                filterEnabled={true}
                                                                placeholder={this.props.actions.translate.get('general_region')}
                                                                selectedValue={that.state.idRegion}
                                                                style={this.style.select}
                                                                styleOptions={{}}
                                                                options={this.printRegions(this.state.country)}
                                                                onChange={(value) => {
                                                                    this.setState({ idRegion: value });
                                                                }} />
                                                        </View>
                                                        : null
                                                }

                                                {
                                                    this.state.country == 'ES' && this.state.idRegion!=null ?
                                                        <Text style={this.style.titleInput}>{this.props.actions.translate.get('general_province')}</Text>
                                                        : null
                                                }
                                                {
                                                    this.state.country == 'ES' && this.state.idRegion!=null?
                                                        <View style={this.style.selectContainer}>
                                                            <Dropdown
                                                                modal={true}
                                                                filterEnabled={true}
                                                                placeholder={this.props.actions.translate.get('general_province')}
                                                                selectedValue={that.state.idProvince}
                                                                style={this.style.select}
                                                                styleOptions={{}}
                                                                options={this.printProvinces(this.state.country,this.state.idRegion)}
                                                                onChange={(value) => {
                                                                    this.setState({ idProvince: value });
                                                                }} />
                                                        </View>
                                                        : null
                                                }
*/}

                                                <Text style={this.style.titleInput}>{"Theme"}</Text>
                                                <View style={this.style.selectContainer}>
                                                    <Dropdown
                                                        modal={true}
                                                        filterEnabled={true}
                                                        placeholder={"Theme"}
                                                        selectedValue={that.props.theme.name}
                                                        style={this.style.select}
                                                        styleOptions={{}}
                                                        options={this.printThemes()}
                                                        onChange={(value) => {
                                                            this.props.actions.themeActions.changeTheme(value);
                                                        }}
                                                    //disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                <View style={this.style.separator}></View>

                                                {1/*this.state.country == 'ES'*/ ? <Text style={[this.style.titleInput, { marginTop: 20 }]}>{this.props.actions.translate.get('userProfileVC_individual_or_company')}</Text> : null}
                                                {1/*this.state.country == 'ES'*/ ? <View style={this.style.localizationSwitchContainer}>
                                                    <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle1]}>{this.props.actions.translate.get('userProfileVC_individual')}</Text>
                                                    <Switch
                                                        style={this.style.localizationSwitch}
                                                        onValueChange={(value) => {
                                                            var iscompanyValue = (value ? true : false);
                                                            this.setState({ iscompany: iscompanyValue });
                                                        }}
                                                        value={this.state.iscompany}
                                                        ios_backgroundColor={"#a5cd07"}
                                                        thumbColor={"white"}
                                                        trackColor={"#a5cd07"}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                    <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle2]}>{this.props.actions.translate.get('userProfileVC_company')}</Text>
                                                </View> : null}

                                                {1 /*his.state.country == 'ES'*/ && this.state.iscompany ? <Text style={this.style.titleInput}>{this.props.actions.translate.get('general_company_name')}</Text> : null}
                                                {1/*this.state.country == 'ES'*/ && this.state.iscompany ? <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={[this.style.input, this.state.iscompany ? {} : this.style.inputDisabled]}
                                                        defaultValue={userData.company_name}
                                                        autoCapitalize='none'
                                                        onChangeText={(text) => that.setState({ company_name: text })}
                                                        ref={(input) => {
                                                            this.companyNameTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.companyCifTextInput.focus();
                                                        }}
                                                        disabled={!this.state.iscompany || this.state.isConnected}
                                                        editable={this.state.iscompany || this.state.isConnected}
                                                        maxLength={50}
                                                    />
                                                </View> : null}

                                                {1/*this.state.country == 'ES'*/ && this.state.iscompany ? <Text style={this.style.titleInput}>{this.props.actions.translate.get('general_company_bin')}</Text> : null}
                                                {1/*this.state.country == 'ES'*/ && this.state.iscompany ? <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={[this.style.input, this.state.iscompany ? {} : this.style.inputDisabled]}
                                                        defaultValue={userData.company_cif}
                                                        autoCapitalize='none'
                                                        onChangeText={(text) => that.setState({ company_cif: text })}
                                                        ref={(input) => {
                                                            this.companyCifTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.firstTextInput.focus();
                                                        }}
                                                        disabled={!this.state.iscompany || this.state.isConnected}
                                                        editable={this.state.iscompany || this.state.isConnected}
                                                        maxLength={45}
                                                    />
                                                </View> : null}

                                                {false ? <Text style={[this.style.titleInput, { marginTop: 20 }]}>{this.props.actions.translate.get('userProfileVC_sex')}</Text> : null}
                                                {false ? <View style={this.style.localizationSwitchContainer}>
                                                    <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle1]}>{this.props.actions.translate.get('userProfileVC_male')}</Text>
                                                    <Switch
                                                        style={this.style.localizationSwitch}
                                                        onValueChange={(value) => this.setState({ gender: (value ? 2 : 1) })}
                                                        value={(this.state.gender == 1 ? false : true)}
                                                        ios_backgroundColor={"#a5cd07"}
                                                        thumbColor={"white"}
                                                        trackColor={"#a5cd07"}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                    <Text style={[this.style.localizationSwitchTitle, this.style.localizationSwitchTitle2]}>{this.props.actions.translate.get('userProfileVC_female')}</Text>
                                                </View> : null}

                                                <Text style={[this.style.titleInput, { marginTop: 20 }]}>{this.props.actions.translate.get('userProfileVC_email')}</Text>
                                                <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        disabled={true}
                                                        editable={false}
                                                        style={this.style.input}
                                                        defaultValue={userData.email}
                                                        autoCapitalize='none'
                                                        ref={(input) => {
                                                            this.emailTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.firstTextInput.focus()
                                                        }}
                                                    />
                                                </View>

                                                <Text style={this.style.titleInput}>{this.props.actions.translate.get('userProfileVC_first_name')}</Text>
                                                <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={this.style.input}
                                                        defaultValue={userData.first_name}
                                                        autoCapitalize='none'
                                                        onChangeText={(text) => that.setState({ name: text })}
                                                        ref={(input) => {
                                                            this.firstTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.secondTextInput.focus()
                                                        }}
                                                        editable={this.state.isConnected}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>
                                                <Text style={this.style.titleInput}>{this.props.actions.translate.get('userProfileVC_last_name')}</Text>
                                                <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={this.style.input}
                                                        defaultValue={userData.last_name}
                                                        autoCapitalize='none'
                                                        onChangeText={(text) => that.setState({ surname: text })}
                                                        ref={(input) => {
                                                            this.secondTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.threeTextInput.focus()
                                                        }}
                                                        editable={this.state.isConnected}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                <Text style={this.style.titleInput}>{this.props.actions.translate.get('userProfileVC_phone')}</Text>
                                                <PhoneInput
                                                    country={that.state.country}
                                                    value={this.state.phone}
                                                    onChange={(text) => {
                                                        this.setState({ phone: text });
                                                    }}
                                                    height={40}
                                                    marginTop={-2}
                                                    marginBottom={0}
                                                    maxWidth={this.state.mediaStyle.orientation == "landscape" ? 400 : null}
                                                    noAutoFocus={true}
                                                    backgroundColor={"rgb(40,40,40)"}
                                                    textColor={"white"}
                                                    dialCodeTopPadding={Platform.OS === 'android' ? 8 : 11}
                                                    borderColor={"black"}
                                                //disabled={!this.state.isConnected}
                                                />

                                                <Text style={this.style.titleInput}>{this.props.actions.translate.get('userProfileVC_born')}</Text>
                                                <View style={[this.style.inputContainer, this.style.datePickerContainer]}>
                                                    <Text pointerEvents="none" style={this.style.datePickerText}>{moment(born).format('L')}</Text>
                                                    <DatePicker
                                                        date={moment(born).toDate()}
                                                        maxDate={moment().toDate()}
                                                        showYearDropdown={true}
                                                        mode="date"
                                                        style={this.style.datePickerOut}
                                                        withPortal={true}
                                                        customStyles={{ dateInput: this.style.datePicker, dateText: this.style.datePickerText }}
                                                        onChange={(born) => {
                                                            this.setState({ born: born.getFullYear() + "-" + (born.getMonth() + 1) + "-" + born.getDate() })
                                                        }}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                <Text style={this.style.titleInput}>{addressTitle}</Text>
                                                <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={this.style.input}
                                                        defaultValue={userData.address}
                                                        autoCapitalize='none'
                                                        onChangeText={(text) => that.setState({ address: text })}
                                                        ref={(input) => {
                                                            this.fourthTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.fiftTextInput.focus()
                                                        }}
                                                        editable={this.state.isConnected}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                <Text style={this.style.titleInput}>{cityTitle}</Text>
                                                <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={this.style.input}
                                                        defaultValue={userData.city}
                                                        autoCapitalize='none'
                                                        onChangeText={(text) => that.setState({ city: text })}
                                                        ref={(input) => {
                                                            this.fiftTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.sixTextInput.focus()
                                                        }}
                                                        editable={this.state.isConnected}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                <Text style={this.style.titleInput}>{zipCodeTitle}</Text>
                                                <View style={this.style.inputContainer}>
                                                    <TextInput
                                                        style={this.style.input}
                                                        defaultValue={userData.zipCode}
                                                        autoCapitalize='characters'
                                                        onChangeText={(text) => that.setState({ zipCode: text })}
                                                        ref={(input) => {
                                                            this.sixTextInput = input;
                                                        }}
                                                        onSubmitEditing={() => {
                                                            this.eightTextInput.focus()
                                                        }}
                                                        editable={this.state.isConnected}
                                                        disabled={!this.state.isConnected}
                                                    />
                                                </View>

                                                {this.renderCifTitle()}
                                                {this.renderCif()}

                                                {this.renderIBANtitle()}
                                                {this.renderIBANfield()}

                                                {this.renderBillingEmailTitle()}
                                                {this.renderBillingEmail()}

                                                {this.state.isConnected && (
                                                    <View style={{ flexDirection: "row", width: "100%" }}>
                                                        <CheckBox key={101}
                                                            title={receiveInvoicesByEmailTitle}
                                                            textStyle={{ color: CurrentTheme.primaryText }}
                                                            containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                                            checked={this.state.receiveInvoicesByEmail ? true : false}
                                                            onPress={this.changeCheckboxReceiveInvoicesByEmailValue()}
                                                        />
                                                    </View>
                                                )}

                                                {false ? <View style={{ flexDirection: "row", width: "100%" }}>
                                                    <CheckBox key={102}
                                                        title={receiveQuotationsByEmailTitle}
                                                        textStyle={{ color: "white" }}
                                                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                                        checked={this.state.receiveQuotationsByEmail ? true : false}
                                                        onPress={this.changeCheckboxReceiveQuotationsByEmailValue()}
                                                    />
                                                </View> : null}

                                                {false ? <View style={{ flexDirection: "row", width: "100%" }}>
                                                    <CheckBox key={103}
                                                        title={receiveTicketsByEmailTitle}
                                                        textStyle={{ color: "white" }}
                                                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                                        checked={this.state.receiveTicketsByEmail ? true : false}
                                                        onPress={this.changeCheckboxReceiveTicketsByEmailValue()}
                                                    />
                                                </View> : null}

                                                {false ? <View style={{ flexDirection: "row", width: "100%" }}>
                                                    <CheckBox key={104}
                                                        title={receiveAuditsByEmailTitle}
                                                        textStyle={{ color: "white" }}
                                                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                                        checked={this.state.receiveAuditsByEmail ? true : false}
                                                        onPress={this.changeCheckboxReceiveAuditsByEmailValue()}
                                                    />
                                                </View> : null}

                                                {false ? <View style={{ flexDirection: "row", width: "100%" }}>
                                                    <CheckBox key={105}
                                                        title={receiveSepaByEmailTitle}
                                                        textStyle={{ color: "white" }}
                                                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                                        checked={this.state.receiveSepaByEmail ? true : false}
                                                        onPress={this.changeCheckboxReceiveSepaByEmailValue()}
                                                    />
                                                </View> : null}
                                                {/*
                                                <View style={{ flexDirection: "row", width: "100%" }}>
                                                    <CheckBox key={105}
                                                        title={this.props.actions.translate.get('general_aica_buyer')}
                                                        textStyle={{ color: "white" }}
                                                        containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                                        checked={this.state.Aica_buyer ? true : false}
                                                        onPress={()=>{
                                                            this.setState({ Aica_buyer: !this.state.Aica_buyer, Aica_id: null, Aica_secret: null});
                                                        }}
                                                    />
                                                </View>

                                                {
                                                    this.state.Aica_buyer ?
                                                        
                                                    <Text style={this.style.titleInput}>AICA ID</Text>
                                                    : null
                                                }

                                                {
                                                    this.state.Aica_buyer ?
                                                        <View style={this.style.inputContainer}>
                                                            <TextInput
                                                                style={this.style.input}
                                                                defaultValue={this.state.Aica_id}
                                                                autoCapitalize='none'
                                                                onChangeText={(text) => that.setState({ Aica_id: text })}
                                                                ref={(input) => {
                                                                    this.AicaIdTextInput = input;
                                                                }}
                                                                onSubmitEditing={() => {
                                                                    this.AicaSecretTextInput.focus()
                                                                }}
                                                            />
                                                        </View>
                                                        : null
                                                }

                                                {
                                                    this.state.Aica_buyer ?
                                                        <Text style={this.style.titleInput}>AICA Secret</Text>
                                                        : null
                                                }

                                                {
                                                    this.state.Aica_buyer ?
                                                        <View style={this.style.inputContainer}>
                                                            <TextInput
                                                                style={this.style.input}
                                                                defaultValue={this.state.Aica_secret}
                                                                autoCapitalize='none'
                                                                onChangeText={(text) => that.setState({ Aica_secret: text })}
                                                                ref={(input) => {
                                                                    this.AicaSecretTextInput = input;
                                                                }}
                                                                onSubmitEditing={() => {
                                                                    this.AicaSecretTextInput.focus()
                                                                }}
                                                            />
                                                        </View>
                                                        : null
                                                }
*/}
                                                {this.state.isConnected && (
                                                    <View style={this.style.deleteButtonContainer}>
                                                        <FliwerCalmButton
                                                            containerStyle={this.style.deleteButtonContainerIn}
                                                            buttonStyle={[this.style.buttonAccess, this.style.buttonBack]}
                                                            text={this.props.actions.translate.get('acoountDeletion_button')}
                                                            textStyle={[this.style.buttonDeleteIn]}
                                                            onPress={() => { this.setState({ modalVerifyPhoneVisible: true }) }}
                                                        />
                                                    </View>
                                                )}

                                                <View style={{ width: "100%", height: 1, marginBottom: 40 }}></View>

                                            </View>
                                        </View>

                                    </View>

                                    <View title={this.props.actions.translate.get('userProfileVC_tabAlertConfig')}>
                                        <View style={/*FliwerCommonUtils.isIphoneBrowser()? {} :*/ this.style.form}>
                                            <View style={[/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in, { flexDirection: "row", flexWrap: "wrap", paddingTop: 10, paddingBottom: 10, alignItems: "flex-start" }]}>
                                                {this.renderAlertConfiguration()}
                                            </View>
                                        </View>
                                    </View>

                                    {this.props.isGardener ? this.renderGardenerUsersList() : null}

                                    {userData.license ? this.renderLicense() : null}

                                    {userData.license && userData.license.clientManagement ? this.renderClientManagement() : null}
                                    {userData.license && userData.license.facturae ? this.renderFacturae() : null}

                                    {userData.license ? this.renderAccessLog() : null}

                                </FliwerSimpleTabView>


                                <View style={this.style.buttonsContainer}>
                                    <FliwerCalmButton
                                        containerStyle={this.style.buttonContainer}
                                        buttonStyle={[this.style.buttonAccess, this.style.buttonBack]}
                                        text={this.props.actions.translate.get('userRegisterVC_back_button')}
                                        textStyle={[this.style.buttonAccessIn, this.style.buttonBackIn]}
                                        onPress={() => { this.props.router.navigate(-1); }}
                                    />
                                    <FliwerCalmButton
                                        containerStyle={[this.style.buttonContainer, this.style.buttonContainer2]}
                                        buttonStyle={this.style.buttonAccess}
                                        text={this.props.actions.translate.get('general_save')}
                                        textStyle={this.style.buttonAccessIn}
                                        onPress={async () => { await this.modifyUser(); }}
                                        disabled={!this.state.isConnected}
                                    />
                                </View>
                            </View>
                        </View>

                    </ScrollView >
                    <FliwerDeleteModal
                        visible={this.state.modalDeleteVisible}
                        onClose={() => {
                            this.setState({ modalDeleteVisible: false })
                        }}
                        onConfirm={async () => { await this.deleteUserOnCare(this.state.userToDelete) }}
                        title={this.props.actions.translate.get('masterVC_remove_user_gardener')}
                        hiddeText={true}
                        password={false}
                        loadingModal={this.state.saving}
                    />
                    {this.state.modalVerifyPhoneVisible ? this.renderDeleteUserVerifyPhone() : null}
                </ImageBackground>
            )

        }
    }

    renderDeleteUserVerifyPhone() {
        return (
            <Modal animationType="fade" loadingModal={Platform.OS != 'web' ? this.state.loading : false} inStyle={[FliwerStyles.modalIn, { width: null }]}
                visible={this.state.modalVerifyPhoneVisible}
                onClose={() => {
                    this.setState({ modalVerifyPhoneVisible: false });
                }}>
                <View style={[FliwerStyles.modalView, { marginBottom: 10, maxWidth: 400 }]}>

                    <Text style={[loginStyles.descriptionStyle, { marginTop: 20 }]}>{this.props.actions.translate.get('acoountDeletion_title')}</Text>

                    <Text style={[loginStyles.descriptionStyle, { marginTop: 20, fontSize: 14 }]}>{this.props.actions.translate.get('acoountDeletion_warning')}</Text>

                    <PhoneAuth
                        containerStyle={{ marginTop: 20 }}
                        phone={this.state.phone}
                        setLoading={this.setLoading()}
                        setLoadingMobile={(loading) => this.setState({ loading: loading })}
                        onValidate={(verifiedPhone, verifiedCode, verificationId) => this.onValidatePhoneAuth(verifiedPhone, verifiedCode, verificationId)}
                        onChangePhone={(phone) => this.onChangePhoneAuth(phone)}
                        confirmTextButton={this.props.actions.translate.get('acoountDeletion_button')}
                        confirmStyleButton={{ backgroundColor: FliwerColors.secondary.red }}
                        setInfoModalVisible={(visible, signed, colorMsg, modalMsg) => {
                            this.setState({ modalPhoneAuthInfoVisible: visible, colorMsg: colorMsg, modalMsg: modalMsg });
                        }}
                    />

                </View>
                {this.renderPhoneAuthInfoModal()}
            </Modal>
        );
    }

    renderPhoneAuthInfoModal() {

        return (
            <Modal animationType={"fade"} loadingModal={false} inStyle={[FliwerStyles.modalIn, { width: null }]} visible={this.state.modalPhoneAuthInfoVisible} onClose={() => {

            }}>
                <View style={[FliwerStyles.modalView, { alignItems: "center" }]}>

                    <View style={[{ width: "100%", marginTop: 0 }, Platform.OS === 'web' ? { alignItems: "justify" } : {}]}>
                        <Text style={[loginStyles.littleTextStyle, { textAlign: "center" }, this.state.colorMsg ? { color: this.state.colorMsg } : {}]}>{this.state.modalMsg}</Text>
                    </View>

                    <FliwerGreenButton
                        containerStyle={{ marginTop: 20, width: 100, height: 30 }}
                        style={{ borderRadius: 4, paddingBottom: 3, height: 30, backgroundColor: FliwerColors.primary.green }}
                        textStyle={[loginStyles.buttonTextStyle, loginStyles.littleButtonTextStyle]}
                        onPress={() => {
                            if (this.state.logout)
                                this.props.actions.sessionActions.logout(true)
                            else
                                this.setState({ modalPhoneAuthInfoVisible: false });
                        }}
                        text={this.props.actions.translate.get('accept')}
                    />
                </View>
            </Modal>
        );
    }

    changeCheckboxReceiveInvoicesByEmailValue() {
        return () => {
            this.setState({ receiveInvoicesByEmail: !this.state.receiveInvoicesByEmail, receiveInvoicesByEmailChanged: true })
        };
    }

    changeCheckboxReceiveQuotationsByEmailValue() {
        return () => {
            this.setState({ receiveQuotationsByEmail: !this.state.receiveQuotationsByEmail, receiveQuotationsByEmailChanged: true })
        };
    }

    changeCheckboxReceiveTicketsByEmailValue() {
        return () => {
            this.setState({ receiveTicketsByEmail: !this.state.receiveTicketsByEmail, receiveTicketsByEmailChanged: true })
        };
    }

    changeCheckboxReceiveAuditsByEmailValue() {
        return () => {
            this.setState({ receiveAuditsByEmail: !this.state.receiveAuditsByEmail, receiveAuditsByEmailChanged: true })
        };
    }

    changeCheckboxReceiveSepaByEmailValue() {
        return () => {
            this.setState({ receiveSepaByEmail: !this.state.receiveSepaByEmail, receiveSepaByEmailChanged: true })
        };
    }

    renderIBANtitle() {
        //if (this.state.country == 'ES')
        return (<Text style={this.style.titleInput}>{"IBAN"}</Text>);
    }

    renderIBANfield() {
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline
        return (
            <View style={this.style.inputContainer}>
                <TextInput
                    style={this.style.input}
                    defaultValue={userData.iban}
                    autoCapitalize='characters'
                    onChangeText={(text) => this.setState({ iban: text })}
                    ref={(input) => {
                        this.nineTextInput = input;
                    }}
                    onSubmitEditing={() => {
                        this.billingEmailTextInput.focus()
                    }}
                    editable={this.state.isConnected}
                    disabled={!this.state.isConnected}
                />
            </View>
        );
    }

    renderCifTitle() {
        if (this.state.country == 'ES')
            return (<Text style={this.style.titleInput}>{this.props.actions.translate.get('general_id_card')}</Text>);
    }

    renderCif() {
        var that = this;
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline
        if (this.state.country == 'ES')
            return (
                <View style={this.style.inputContainer}>
                    <TextInput
                        style={this.style.input}
                        defaultValue={userData.cif}
                        autoCapitalize='characters'
                        onChangeText={(text) => that.setState({ cif: text })}
                        ref={(input) => {
                            this.eightTextInput = input;
                        }}
                        onSubmitEditing={() => {
                            this.nineTextInput.focus()
                        }}
                        editable={this.state.isConnected}
                        disabled={!this.state.isConnected}
                    />
                </View>
            );

    }

    renderBillingEmailTitle() {
        if (this.state.country == 'ES')
            return (<Text style={this.style.titleInput}>{this.props.actions.translate.get('userProfileVC_billing_email')}</Text>);
    }

    renderBillingEmail() {
        var that = this;
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline
        if (this.state.country == 'ES')
            return (
                <View style={this.style.inputContainer}>
                    <TextInput
                        style={this.style.input}
                        defaultValue={userData.billingEmail}
                        autoCapitalize='none'
                        onChangeText={(text) => that.setState({ billingEmail: text })}
                        ref={(input) => {
                            this.billingEmailTextInput = input;
                        }}
                        editable={this.state.isConnected}
                        disabled={!this.state.isConnected}
                    />
                </View>
            );
    }

    renderGardenerUsersList() {
        var indents = [];

        if (this.props.gardenerUsersList) {

            var gardenerUsersList = Object.values(this.props.gardenerUsersList)
            gardenerUsersList.sort((a, b) => {
                if (a.email.toUpperCase() < b.email.toUpperCase()) {
                    return -1;
                } else if (a.email.toUpperCase() > b.email.toUpperCase()) {
                    return 1;
                } else {
                    return 1;
                }
            });


            for (var i = 0; i < gardenerUsersList.length; i++) {

                var state = ""
                if (gardenerUsersList[i].uuid == null) {
                    if (gardenerUsersList[i].expired) {
                        var state = " (expired)"
                    } else {
                        var state = " (caring)"
                    }

                } else {
                    var state = " (pending)"
                }

                indents.push(
                    <View key={"_gardenerUser" + i} style={[this.style.gardenerEmailsContainer]}>

                        <TouchableOpacity style={[this.style.notificationTitleContainer, { flexDirection: "row", width: "100%", maxWidth: 350 }]} onPress={this.setClipBoardIdHandle(gardenerUsersList[i].email)}>
                            <View style={[this.style.iconContainer]}>
                                <Image key={1} style={[this.style.imageUser]} draggable={false} source={{ uri: gardenerUsersList[i].photo_url }} resizeMode={"cover"} />
                            </View>

                            <View style={[this.style.textEmailContainer]}>
                                <View style={{ width: "55%", justifyContent: "flex-start" }}>
                                    <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { alignSelf: "center", paddingLeft: 10 }]}>{gardenerUsersList[i].email}</Text>
                                </View>
                                <Text style={[this.style.notificationTitle, { alignSelf: "center", paddingLeft: 3 }]}>{state}</Text>
                                <IconFeather name="copy" style={[this.style.emailText, { marginLeft: 10, fontSize: 14, alignSelf: "center" }]} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.modalDeleteVisiblePressed(true, gardenerUsersList[i].user_id)} style={[this.style.trashContainer]}>
                            <Image key={1} style={[{ width: 20, height: 20 }]} draggable={false} source={trashImage} resizeMode={"contain"} />
                        </TouchableOpacity>
                    </View>
                );
            }
        }

        return (
            <View title={this.props.actions.translate.get('Profile_gardener_users')}>
                <View style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form}>
                    <View style={[/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in, { flexDirection: "column", flexWrap: "wrap", paddingTop: 10, paddingBottom: 10, alignItems: "flex-start" }]}>
                        {indents}
                    </View>
                </View>
            </View>
        )

    }

    renderLicense() {
        var indents = [];
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline
        var nLicenses = this.props.employees ? this.props.employees.length + 1 : 1;
        var nMaxLicenses = userData.license.maxEmployees;

        return (
            <View title={"Licencias"}>
                <View key={"tab_Licencias"} style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form}>
                    <View style={[/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in, { flexDirection: "column", flexWrap: "wrap", paddingTop: 10, paddingBottom: 10, alignItems: "flex-start" }]}>

                        {this.renderLicenseRowTitle("Oficina Virtual")}

                        {this.renderLicenseRow("Licencia", (userData.license.virtualOffice ? "Activa" : "Inactiva") + (userData.license.virtualOffice ? (nMaxLicenses ? " (" + nLicenses + "/" + nMaxLicenses + ")" : "") : ""))}

                        {/*this.props.actions.translate.get('Full_storage')*/this.renderLicenseRow("Almacenamiento", "Ilimitado")}

                        <View style={this.style.separator}></View>

                        {this.renderLicenseRowTitle("Gestión de Clientes")}

                        {this.renderLicenseRow("Licencia", (userData.license.clientManagement ? "Activa" : "Inactiva") + (userData.license.clientManagement ? (nMaxLicenses ? " (" + nLicenses + "/" + nMaxLicenses + ")" : "") : ""))}

                        <View style={this.style.separator}></View>

                        {this.renderLicenseRowTitle("Facturae")}

                        {this.renderLicenseRow("Licencia", (userData.license.facturae ? "Activa" : "Inactiva") + (userData.license.facturae ? (nMaxLicenses ? " (" + nLicenses + "/" + nMaxLicenses + ")" : "") : ""))}

                        {/*this.props.actions.translate.get('Full_storage')*/this.renderLicenseRow("Almacenamiento", "Ilimitado")}

                        {this.renderLicenseRow("Clientes", "Ilimitados")}

                        {this.renderLicenseRow("Productos", "Ilimitados")}

                        {this.renderLicenseRow("Facturas", "Ilimitadas")}

                        {this.renderLicenseRow("Contratos", "Ilimitados")}

                        {this.renderLicenseRow("Copias de seguridad de facturas", "Diarias")}

                        {this.renderLicenseRow("Copias de seguridad de contratos", "Diarias")}


                    </View>
                </View>
            </View>
        )

        return indents;
    }

    renderLicenseRowTitle(title) {
        return (
            <View key={"_license_title_" + title} style={[this.style.gardenerEmailsContainer]}>
                <View style={[this.style.notificationTitleContainer, { flexDirection: "row", width: "100%", maxWidth: 1000 }]}>

                    <View style={[this.style.textEmailContainer]}>
                        <View style={{ width: "55%", justifyContent: "flex-start" }}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { opacity: 1, fontFamily: FliwerColors.fonts.title, alignSelf: "flex-start", paddingLeft: 10, color: "white" }]}>{title}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    renderLicenseRow(title, value) {
        return (
            <View key={"_license_" + title + "_" + value} style={[this.style.gardenerEmailsContainer, { marginTop: 10, marginBottom: 10 }]}>

                <View style={[this.style.notificationTitleContainer, { flexDirection: "row", width: "100%", maxWidth: 1000 }]}>

                    <View style={[this.style.textEmailContainer]}>
                        <View style={{ width: "55%", justifyContent: "flex-start" }}>
                            <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { opacity: 1, alignSelf: "flex-start", paddingLeft: 10, color: "white" }]}>{title + ": " + value}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    renderClientManagement() {

        var nLicenses = this.props.employees ? this.props.employees.length + 1 : 1;
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline
        var nMaxLicenses = userData.license.maxEmployees;

        return (
            <View title={"Gestión de Clientes"}>
                <View key={"tab_ClientManagement"} style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form}>
                    <View style={[/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in, { flexDirection: "column", flexWrap: "wrap", paddingTop: 10, paddingBottom: 10, alignItems: "flex-start" }]}>

                        {this.renderLicenseRowTitle("Alertas de gestión")}

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Nuevo presupuesto"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["addOrder"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("addOrder")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Presupuesto aceptado"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["acceptOrder"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("acceptOrder")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Presupuesto rechazado"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["cancelOrder"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("cancelOrder")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Nueva factura"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["addBill"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("addBill")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Factura aceptada"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["acceptBill"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("acceptBill")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Factura rechazada"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["cancelBill"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("cancelBill")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Factura cerca de vencimiento"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["presupuesto"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("presupuesto")}
                                />
                            </View>
                        </View>

                        <View key={"_notif" + 0} style={this.style.notificationContainer}>
                            <View style={{ flex: 1 }}>
                                <CheckBox key={"checkbox_alert_" + 0}
                                    title={"Recordatorio de contratos pendientes de firmar"}
                                    textStyle={{ color: "white", fontWeight: "normal" }}
                                    containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                    checked={this.state.managementConfiguration["pendingContract"] ? true : false}
                                    onPress={this.changeNotificationValueManagement("pendingContract")}
                                />
                            </View>
                        </View>



                    </View>
                </View>
            </View>
        )

    }

    renderFacturae() {


        var nLicenses = this.props.employees ? this.props.employees.length + 1 : 1;
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline
        var nMaxLicenses = userData.license.maxEmployees;

        return (
            <View title={"Personalización de facturas"}>
                <View key={"tab_Facturae"} style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form}>
                    <View style={[/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in, { flexDirection: "column", flexWrap: "wrap", paddingTop: 10, paddingBottom: 10, alignItems: "flex-start" }]}>

                        {this.renderLicenseRow("Logotipo empresa (recomendado 400x200 píxeles)", "")}
                        <TouchableOpacity onPress={() => {
                            this.getBillLogo()
                        }} style={[this.style.buttonImage, { width: 400, height: 200 }]}>
                            <Image source={{ uri: this.state.billLogo ? this.state.billLogo : (this.state.profileImage ? this.state.profileImage : userData.photo_url) }} resizeMode={"contain"} style={this.style.buttonImageIn} />
                        </TouchableOpacity>
                        {this.renderInputFileBillLogo()}

                        {this.renderColorPicker("Color presupuesto", "colorOrder")}


                        {this.renderColorPicker("Color factura", "colorBill")}


                        {this.renderColorPicker("Color factura rectificativa", "colorAmendedBill")}


                        {this.renderColorPicker("Color albarán", "colorDeliveryNote")}

                    </View>
                </View>
            </View>
        )
    }

    getDefaultColor(property) {
        switch (property) {
            case "colorOrder":
                return "#31869B"
            case "colorBill":
                return "#D0DF00"
            case "colorAmendedBill":
                return "#ac5bce"
            case "colorDeliveryNote":
                return "#ffc800"
        }
    }

    renderColorPicker(title, property) {
        return (
            <View style={[this.style.textEmailContainer, { marginBottom: 10 }]}>
                <View style={{ width: "55%", justifyContent: "flex-start" }}>
                    <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { opacity: 1, alignSelf: "flex-start", paddingLeft: 10, color: "white" }]}>{title + ":"}</Text>
                </View>
                <TextInput
                    style={[this.style.input, this.state.iscompany ? {} : this.style.inputDisabled, this.state[property] ? { backgroundColor: this.state[property] } : { backgroundColor: this.getDefaultColor(property) }]}
                    defaultValue={this.state[property] ? this.state[property] : this.getDefaultColor(property)}
                    autoCapitalize='none'
                    onChangeText={(text) => {
                        if (this.state[property] == this.getDefaultColor(property)) text = null
                        this.setState({ [property]: text })
                    }}
                    maxLength={7}
                    editable={this.state.isConnected}
                    disabled={!this.state.isConnected}
                />
            </View>
        )
    }

    renderAccessLog() {
        var indentsUserId = [];
        var indentEmail = [];
        var indentTime = [];


        if (this.props.accessLog && this.props.accessLog.length > 1) {
            for (var i = 0; i < this.props.accessLog.length; i++) {
                indentsUserId.push(<View>
                    <Text style={[this.style.titleInput, { paddingLeft: 10 }]}>{this.props.accessLog[i].idUser}</Text>
                </View>)
                indentEmail.push(<View>
                    <Text style={[this.style.titleInput, { paddingLeft: 10 }]}>{this.props.accessLog[i].email}</Text>
                </View>)
                indentTime.push(<View>
                    <Text style={[this.style.titleInput, { paddingLeft: 10 }]}>{new Date(this.props.accessLog[i].accessDate * 1000).toLocaleDateString() + " " + new Date(this.props.accessLog[i].accessDate * 1000).toLocaleTimeString([], { hour12: false })}</Text>
                </View>)
            }
        }


        return (
            <View title={"Log de accesos"}>
                <View style={/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form}>
                    <View style={[/*FliwerCommonUtils.isIphoneBrowser()? {} : */this.style.form_in, { flexDirection: "column", flexWrap: "wrap", paddingTop: 10, paddingBottom: 10, alignItems: "flex-start" }]}>
                        <View style={{ flexDirection: "row" }}>
                            <View style={{ marginRight: 20 }}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { opacity: 1, fontFamily: FliwerColors.fonts.title, alignSelf: "flex-start", paddingLeft: 10, color: "white" }]}>{"Usuario"}</Text>
                                {indentsUserId}
                            </View>
                            <View style={{ marginRight: 20 }}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { opacity: 1, fontFamily: FliwerColors.fonts.title, alignSelf: "flex-start", paddingLeft: 10, color: "white" }]}>{"Correo Electrónico"}</Text>
                                {indentEmail}
                            </View>
                            <View>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={[this.style.notificationTitle, { opacity: 1, fontFamily: FliwerColors.fonts.title, alignSelf: "flex-start", paddingLeft: 10, color: "white" }]}>{"Acceso"}</Text>
                                {indentTime}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    renderDragHere() {
        if (Platform.OS === 'web')
            return (
                <View style={[(this.state.dragging ? this.style.dragHere : { display: "none" })]}>
                    <Text style={this.style.titleDrag}>{this.props.actions.translate.get('userProfileVC_drag')}</Text>
                </View>
            );
        else
            return [];
    }

    renderInputFile() {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => this.fileInput = fileInput} style={this.style.fileInput} type="file" />);
        else
            return [];
    }

    renderInputFileBillLogo() {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => this.fileInput2 = fileInput} style={this.style.fileInput} type="file" />);
        else
            return [];
    }

    renderAlertConfiguration() {
        var indents = [];

        var notificationData = this.props.notificationData.concat([]);

        notificationData = notificationData.sort((a, b) => {
            return a.title.localeCompare(b.title);
        });

        for (var i = 0; i < notificationData.length; i++) {
            let checkvalue;
            if (this.state.alertConfiguration[notificationData[i].type] != undefined)
                checkvalue = this.state.alertConfiguration[notificationData[i].type];
            else {
                checkvalue = notificationData[i].enabled;
                this.state.alertConfiguration[notificationData[i].type] = checkvalue;
            }
            ((i) => {

                indents.push(
                    <View key={"_notif" + i} style={this.style.notificationContainer}>
                        <View style={{ flex: 1 }}>
                            <CheckBox key={"checkbox_alert_" + i}
                                title={notificationData[i].title}
                                textStyle={{ color: "white" }}
                                containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                                checked={checkvalue ? true : false}
                                onPress={this.changeNotificationValue(notificationData[i].type)}
                            />
                        </View>
                    </View>
                );
            })(i);
        }

        return indents;
    }

    modalDeleteVisiblePressed(visible, userID) {
        return () => {
            this.setState({ modalDeleteVisible: true, userToDelete: userID })
        }

    }

    async deleteUserOnCare() {
        return async () => {
            this.setState({ saving: true, modalDeleteVisible: false });
            await this.props.actions.fliwerGardenerActions.deleteGardenerUser(this.state.userToDelete).then(() => {
                this.setState({ saving: false });
            }, (err) => {
                this.setState({ saving: false });
                if (err && err.reason)
                    toast.error(err.reason);
            })
        }
    }

    async modifyUser() {
        var userData = this.state.isConnected ? this.props.userData : this.props.userOffline

        let country = (this.state.country ? this.state.country : userData.country);

        if (!country) {
            toast.error(this.props.actions.translate.get('Country_cannot_be_empty'));
            return;
        }

        if (this.state.billingEmail && !FliwerCommonUtils.validateEmail(this.state.billingEmail)) {
            var wrongBillingEmailMsg = this.props.actions.translate.get('userProfileVC_wrong_billing_email') ? this.props.actions.translate.get('userProfileVC_wrong_billing_email') : "The billing Email is not correct";
            toast.error(wrongBillingEmailMsg);
            return;
        }

        this.setState({ saving: true });
        var notificationData = [];
        var alerts = Object.keys(this.state.alertConfiguration);
        for (var i = 0; i < alerts.length; i++) {
            notificationData.push({ type: alerts[i], enabled: this.state.alertConfiguration[alerts[i]] })
        }
        await this.props.actions.sessionActions.updateProfile({
            email: this.state.email,
            first_name: (this.state.name ? this.state.name : this.props.userData.first_name),
            last_name: (this.state.surname ? this.state.surname : this.props.userData.last_name),
            phone: (this.state.phone ? this.state.phone : this.props.userData.phone),
            sex: (this.state.gender ? this.state.gender : this.props.userData.sex),
            iscompany: (this.state.iscompany ? 1 : 0),
            company_name: (this.state.iscompany ? (this.state.company_name ? this.state.company_name : this.props.userData.company_name) : ""),
            company_cif: (this.state.iscompany ? (this.state.company_cif ? this.state.company_cif : this.props.userData.company_cif) : ""),
            born: (this.state.born ? this.state.born : this.props.userData.born),
            photo_url: (this.state.profileImage ? this.state.profileImage : this.props.userData.photo_url),
            gardener: this.state.gardener,
            iban: (this.state.iban ? this.state.iban : this.props.userData.iban),
            address: (this.state.address ? this.state.address : this.props.userData.address),
            cif: (this.state.cif ? this.state.cif : this.props.userData.cif),
            city: (this.state.address ? this.state.city : this.props.userData.city),
            zipCode: (this.state.zipCode ? this.state.zipCode : this.props.userData.zipCode),
            country: country,
            billingEmail: (this.state.billingEmail ? this.state.billingEmail : this.props.userData.billingEmail),
            receiveInvoicesByEmail: (this.state.receiveInvoicesByEmailChanged ? this.state.receiveInvoicesByEmail : this.props.userData.receiveInvoicesByEmail),
            receiveQuotationsByEmail: (this.state.receiveQuotationsByEmailChanged ? this.state.receiveQuotationsByEmail : this.props.userData.receiveQuotationsByEmail),
            receiveTicketsByEmail: (this.state.receiveTicketsByEmailChanged ? this.state.receiveTicketsByEmail : this.props.userData.receiveTicketsByEmail),
            receiveAuditsByEmail: (this.state.receiveAuditsByEmailChanged ? this.state.receiveAuditsByEmail : this.props.userData.receiveAuditsByEmail),
            receiveSepaByEmail: (this.state.receiveSepaByEmailChanged ? this.state.receiveSepaByEmail : this.props.userData.receiveSepaByEmail)
        }, notificationData).then(() => {
            this.props.router.navigate(-1);
        }, (error) => {
            if (error.reason) toast.error(error.reason);
            this.setState({ saving: false });
        });
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

    setClipBoardIdHandle(i) {
        return () => {
            Clipboard.setString(i);
            toast.notification(this.props.actions.translate.get("userProfile_clip_email").replace("%SN%", i))
        };
    }

    setClipBoardId(str) {
        Clipboard.setString(str);
        toast.notification(this.props.actions.translate.get("userProfile_clip_email").replace("%SN%", str))
    }

    changeNotificationValue(type) {
        return () => {
            var alertConfiguration = this.state.alertConfiguration;
            var currentvalue = alertConfiguration[type];
            alertConfiguration[type] = !currentvalue;
            this.setState({ alertConfiguration: alertConfiguration });
        };
    }

    changeNotificationValueManagement(type) {
        return () => {
            var managementConfiguration = this.state.managementConfiguration;
            var currentvalue = managementConfiguration[type];
            managementConfiguration[type] = !currentvalue;
            this.setState({ managementConfiguration: managementConfiguration });
        };
    }

    measureView() {
        if (this._view) {
            this._view.measure((ox, oy, width, height, px, py) => {
                var x = 245, h, w, t = null;
                if (this.state.mediaStyle.orientation == "landscape") {
                    h = 9999;
                    w = width * 0.8;
                } else {
                    h = 99999;
                    w = width * 0.3;
                }
                if (h < w)
                    x = h;
                else
                    x = w;

                if (x > 300) x = 300;
                if (x != this.state.imageWidth)
                    this.setState({ imageWidth: x });
            })
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

    printRegions(country) {

        if (!this.props.countries[country] || !this.props.countries[country].regions) return [];
        return this.props.countries[country].regions.map(r => { return { label: r.Name, value: r.idRegion } }).sort((a, b) => { return a.label <= b.label ? -1 : 1 })
    }

    printProvinces(country, idRegion) {

        if (!this.props.countries[country] || !this.props.countries[country].regions) return [];
        var region = this.props.countries[country].regions.find(r => r.idRegion == idRegion);
        if (!region) return [];
        return region.provinces.map(r => { return { label: r.Name, value: r.idProvince } }).sort((a, b) => { return a.label <= b.label ? -1 : 1 });
    }

    printThemes() {
        return Object.values(this.props.actions.themeActions.getThemes()).map((theme) => {
            return { value: theme.name, label: theme.name }
        })
    }

    /*
        getBase64(file, callback) {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                callback(reader.result)
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                callback(null)
            };
        }
    */
    handleDrop = (files, event) => {
        var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
        if (ValidImageTypes.indexOf(files[0].type) != -1) {
            getBase64(files[0]).then((file) => {
                this.setState({ dragging: false, profileImage: file });
            }, () => { });
        } else {
            this.setState({ dragging: false })
            toast.error(this.props.actions.translate.get('zoneImageSelectorVC_photoalert_image_type'));
        }
    }

    getPhotos() {
        const options = {
            fileInput: this.fileInput
        };

        MediaPicker.openPicker(options).then((response) => {
            if (!response || response.didCancel) {
                console.log('User cancelled image picker');
            } else {
                this.setState({ dragging: false, profileImage: response.base64 });
            }
        }, () => { console.log("Error gathering image"); });
    }

    getBillLogo() {
        const options = {
            fileInput: this.fileInput2
        };

        MediaPicker.openPicker(options).then((response) => {
            if (!response || response.didCancel) {
                console.log('User cancelled image picker');
            } else {
                this.setState({ dragging: false, billLogo: response.base64 });
            }
        }, () => { console.log("Error gathering image"); });
    }

};


function mapStateToProps(state, props) {
    return {
        userData: state.sessionReducer.data,
        userOffline: state.userOffline.data,
        notificationData: state.sessionReducer.notificationData,
        language: state.languageReducer.language,
        allLanguages: state.languageReducer.languages,
        translation: state.languageReducer.translation,
        gardenerUsersList: state.gardenerReducer.usersListData,
        isGardener: state.sessionReducer.isGardener,
        roles: state.sessionReducer.roles,
        countries: state.locationReducer.countries,
        employees: state.sessionReducer.employees,
        accessLog: state.sessionReducer.accessLog,
        theme: state.theme
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(ActionsSession, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
            themeActions: bindActionCreators(ActionsTheme, dispatch)
        }
    }
}


var style = {
    textEmailContainer: {
        flexDirection: "row",
        width: "100%",
        alignItems: "center"
    },
    gardenerEmailsContainer: {
        marginTop: 20,
        flexDirection: "row",
        width: "100%"
    },
    imageUser: {
        borderRadius: 25,
        width: 25,
        height: 25
    },
    iconContainer: {
        borderRadius: 25,
        backgroundColor: "white"
    },
    contentView: {
        backgroundColor: "@theme primaryColor",
        width: "100%",
        bottom: 0
    },
    contentViewContainer: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    contentViewIn: {
        width: "100%",
        flexGrow: 1,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 20,
    },

    fileDrop: {
        position: "absolute",
        height: "100%",
        width: "100%"
    },
    fileDropIn: {
        flexDirection: "row",
        display: "flex"
    },
    dragHere: {
        backgroundColor: FliwerColors.primary.green,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    titleDrag: {
        color: "white",
        fontSize: 20
    },
    topContainer: {
        paddingBottom: 10
    },
    buttonImage: {
        width: "30%",
        height: 100
    },
    topContainerIn: {
        flexDirection: "column",
        paddingLeft: 20,
        alignItems: "center",
        flexGrow: 1,
        justifyContent: "center"
    },
    buttonImageIn: {
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        borderRadius: 15
    },
    textBig: {
        color: "@theme primaryText",
        fontSize: 20,
        paddingBottom: 5
    },
    buttonSignOut: {
        width: "80%",
        height: 30,
        maxWidth: 300,
        marginBottom: 10
    },
    buttonSignOutIn: {
        fontSize: 14
    },

    separator: {
        height: 1,
        width: "100%",
        backgroundColor: "@theme primaryText"
    },
    formOut: {
        flex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'start'
    },
    form: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center'
    },
    form_in: {
        flex: 5,
        flexDirection: 'column',
        alignItems: 'center'
    },
    titleInput: {
        color: "@theme primaryText",
        fontSize: 14,
        paddingTop: 10,
        paddingBottom: 3,
        alignSelf: "flex-start"
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
    inputText: {
        height: 40,
        width: "100%",
    },
    emailText: {
        color: "white",
        fontFamily: "MyriadPro-Regular"
    },
    inputEmailTouchable: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100%"
    },
    input: {
        width: "100%",
        fontFamily: "MyriadPro-Regular",
        borderColor: "rgb(115,115,115)",
        backgroundColor: "rgb(40,40,40)",
        borderRadius: 4,
        color: "white",
        padding: 10
    },
    inputDisabled: {
        backgroundColor: "silver"
    },
    buttonsContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row"
    },
    deleteButtonContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 15
    },
    deleteButtonContainerIn: {
        height: 32,
        maxWidth: 400,
        flexGrow: 1,
        marginBottom: 10,
        paddingRight: 10
    },
    buttonContainer: {
        height: 40,
        maxWidth: 300,
        flexGrow: 1,
        marginBottom: 10,
        paddingRight: 10
    },
    buttonContainer2: {
        paddingRight: 0,
        paddingLeft: 10,
    },
    buttonAccess: {
        backgroundColor: FliwerColors.primary.green,
        height: "100%",
        width: "100%",
        borderRadius: 4,
        alignItems: 'center',
        flexDirection: 'row'
    },
    buttonAccessIn: {
        flex: 1,
        fontSize: 20,
        color: "rgb(66,66,66)",
        fontFamily: "MyriadPro-Regular",
        textAlign: "center"
    },
    buttonDeleteIn: {
        flex: 1,
        fontSize: 14,
        color: FliwerColors.secondary.red,
        fontFamily: "MyriadPro-Regular",
        textAlign: "center"
    },
    buttonBack: {
        backgroundColor: "rgb(40,40,40)"
    },
    buttonBackIn: {
        color: FliwerColors.primary.green,
    },
    button: {
        height: "100%",
        width: "100%",
        fontFamily: "MyriadPro-Regular"
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
        borderColor: "rgb(115,115,115)",
        backgroundColor: "rgb(40,40,40)",
        borderRadius: 4,
        color: "white"
    },
    datePickerContainer: {
        borderRadius: 4,
        borderWidth: 0,
        paddingLeft: 5,
        backgroundColor: "rgb(40,40,40)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    datePickerOut: {
        position: "absolute",
        width: "100%",
        height: "100%",
        overflow: "hidden"
    },
    datePicker: {
        width: "100%",
        height: "100%",
        borderRadius: 4,
        borderWidth: 0,
        paddingLeft: 5,
        alignItems: "flex-start",
        opacity: 0,
        backgroundColor: "rgb(40,40,40)"
    },
    datePickerText: {
        color: "white",
        position: "absolute",
        width: "100%",
        display: "flex",
        alignItems: "center",
        paddingLeft: 10
    },

    localizationSwitchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        paddingBottom: 10,
        paddingLeft: 10
    },
    localizationSwitchTitle: {
        fontSize: 14,
        color: "@theme primaryText",
    },
    localizationSwitchTitle1: {
        marginRight: 20
    },
    localizationSwitchTitle2: {
        marginLeft: 20
    },
    localizationSwitch: {
        transform: [{ scaleX: 1 }, { scaleY: 1 }]
    },

    fileInput: {
        display: "none" //display: "none" only works on web
    },

    notificationContainer: {
        width: "50%",
        display: "flex",
        flexDirection: "row",
        marginTop: 8,
        marginBottom: 8,
        paddingLeft: 10,
        paddingRight: 10,
    },
    notificationTitleContainer: {
        flexShrink: 1
    },
    notificationTitle: {
        color: "white",
        opacity: 0.6,
        paddingLeft: 15
    },
    notificationTitleSelected: {
        opacity: 1
    },

    "@media (orientation:landscape)": {
        contentView: {
        },
        contentViewContainer: {
            flexDirection: "column",
            display: 'flex',
            alignItems: 'center',
            top: 0,
            minHeight: "100%",
            position: "absolute",
            width: "100%"
        },
        contentViewIn: {
            flexDirection: "row",
            display: 'flex',
            alignItems: 'center',
            width: "100%",
            bottom: 0,
            top: 0,
            paddingLeft: "5%",
            paddingRight: "5%",
            flexGrow: 1
        },
        topContainer: {
            width: "40%",
            paddingRight: 20,
            height: "100%"
        },
        fileDropIn: {
            flexDirection: "column",
            alignItems: "center"
        },
        topContainerIn: {
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            flexGrow: 0,
            paddingLeft: 0
        },
        buttonImage: {
            width: "70%",
            marginBottom: 30
        },
        form: {
            flex: 4,
        },
        inputContainer: {
            maxWidth: 400
        },
        buttonContainer: {
            maxWidth: 400
        },
        selectContainer: {
            maxWidth: 400
        },
        localizationSwitchContainer: {
            maxWidth: 400
        }
    },
    "@media (orientation:landscape && width>1300)": {
        notificationContainer: {
            width: "33.33%"
        }
    },
    "@media (orientation:landscape && height<510)": {
        title1Out: {
            height: 45
        },
        title1: {
            fontSize: 20
        }
    },
    "@media (orientation:landscape && height<485)": {

        title1Out: {
            display: "none",
            flex: 0
        },
        contentViewIn: {
        }
    },
    "@media (orientation:landscape && height<400)": {
        form: {
            alignSelf: "flex-start",
            paddingTop: 15,
            paddingBottom: 10
        }
    },
    "@media (orientation:portrait)": {
        contentViewContainer: {
        },
        form: {
            flex: 5,
            flexDirection: 'column',
            alignItems: 'center'
        },
        form_in: {
            width: "100%"
        }
    },
    "@media (orientation:portrait && height<672)": {
        title1Out: {
            height: 45
        },
        title1: {
            fontSize: 20
        }
    },
    "@media (orientation:portrait && height<550)": {

    }
};

if (Platform.OS !== 'web') {
    style.fileDrop = {};
}

//Connect everything
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, ProfileScreen)));
