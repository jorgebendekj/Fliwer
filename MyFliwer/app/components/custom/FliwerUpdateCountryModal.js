'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import Modal from '../../widgets/modal/modal'
import Dropdown from '../../widgets/dropdown/dropdown';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class FliwerUpdateCountryModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            country_code: null,
            searchingCountry: false,
            searchedCountry: false
        }
        this.checkCountry();
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.countries && Object.entries(this.props.countries).length > 0) && nextProps.firstTryLogIn && nextProps.countries && Object.entries(nextProps.countries).length > 0) {
            this.checkCountry(nextProps.countries)
        }
    }

    checkCountry(countries) {
        if (((this.props.countries && Object.entries(this.props.countries).length > 0) || (countries && Object.entries(countries).length > 0))) {
            if (!this.state.country_code && !this.props.country)
            {
                this.getLocation(countries);
            } else {
                this.setState({searchedCountry: true});
                this.state.searchedCountry = true;
            }
        }
    }

    printCountries() {
        var that = this;
        if (!this.props.countries)
            return [];
        var arr = Object.keys(this.props.countries).map(function (key) {
            return {label: that.props.countries[key].Name, value: that.props.countries[key].Code};
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

    getLocation(countries) {
        if (!countries)
            countries = this.props.countries;
        if (countries && Object.entries(countries).length > 0 && !this.state.searchingCountry)
        {
            this.setState({searchingCountry: true});
            this.getCurrentPositionByAPI().then((data) => {
                this.props.actions.translate.setCountry(data.country_code);
                this.setState({country_code: this.props.country ? this.props.country : data.country_code, searchingCountry: false, searchedCountry: true});
            }, (err) => {
                this.setState({searchingCountry: false, searchedCountry: true});
                console.log("Error:", err);
            })
        }
    }

    getCurrentPositionByAPI() {
        return new Promise((resolve, reject) => {
            
            var defaultRet = {
                country_code: "ES"
            };
            
            console.log("Start getCurrentPositionByAPI");
            
            try {
                /*
                fetch("https://geolocation-db.com/json/0f761a30-fe14-11e9-b59f-e53803842572", {
                    method: "GET"
                }).then((data) => {
                    this.analyzeCurrentPositionData(data).then((data2) => {
                        if (data2.country_code) {
                            console.log("End getCurrentPositionByAPI", data2);
                            resolve(data2);
                        }
                        else {
                            console.log("Error fetching current position 1");
                            resolve(defaultRet);
                        }
                    }, (err) => {
                        console.log("Error fetching current position 2", err);
                        resolve(defaultRet);
                    })
                }, (err) => {*/
                    console.log("Error fetching current position 3", err);
                    resolve(defaultRet);/*
                }).catch(err => {
                    console.log("Error fetching current position 4", err);
                    resolve(defaultRet);
                });*/
            } catch (err) {
                console.log("Error fetching current position 5", err);
                resolve(defaultRet);
            }

        });
    }
    
    analyzeCurrentPositionData(data) {
        return new Promise((resolve, reject) => {
            console.log("Start analyzeCurrentPositionData");
            try {
                data.json().then((data2) => {
                    if (data2.country_code) {
                        console.log("End analyzeCurrentPositionData", data2);
                        resolve(data2);
                    }
                    else {
                        //alert("Error analyzeCurrentPositionData 1")
                        console.log("Error analyzeCurrentPositionData 1");
                        reject(data2);
                    }
                }, (err) => {
                    //alert("Error analyzeCurrentPositionData 2")
                    console.log("Error analyzeCurrentPositionData 2", err);
                    reject(err);
                })
            } catch (err) {
                //alert("Error analyzeCurrentPositionData 3")
                console.log("Error analyzeCurrentPositionData 3", err);
                reject(err);
            }             
        }); 
    }

    render() {
        var {animationType, visible, text, textCancel, textConfirm, onClose, onConfirm} = this.props;

        let title = this.props.actions.translate.get('we_need_you_to_give_us_some_information');

        return (
                <Modal animationType={animationType ? animationType : "fade"} loadingModal={this.props.loadingModal} inStyle={this.style.modalIn} visible={visible} onClose={() => {
                        if (typeof onClose === "function")
                                            onClose()
                                    }}>
                    <View style={this.style.modalView}>
                        <Text style={this.style.modalViewTitle}>{title}</Text>
                        {this.renderSubtitle()}
                        <View style={this.style.form}>
                            <View style={[this.style.selectContainer]}>
                                <Dropdown placeholder={"Country"} selectedValue={this.state.country_code} style={this.style.select} styleOptions={{textAlign: "center", fontFamily: FliwerColors.fonts.light}} options={this.printCountries()} onChange={
                                    (code) => {
                                        if (code)
                                            this.props.actions.translate.setCountry(code);
                                        this.setState({country_code: code})
                                    }
                               }/>
                            </View>
                        </View>
                        <View style={this.style.modalButtonContainer}>
                            <TouchableOpacity style={[this.style.modalButton, this.style.modalButton2]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')}
                                              onPress={
                                                () => {
                                                    if (typeof onConfirm === "function")
                                                        onConfirm(this.state.country_code)
                                                }
                                              }>
                                <Text style={[this.style.modalButtonText, this.style.modalButtonTextYes]}>{(textConfirm ? textConfirm : this.props.actions.translate.get('accept'))}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                )
    }

    renderSubtitle()
    {
        let subtitle = this.props.actions.translate.get('please_select_your_country_of_residence');
        return (<Text style={this.style.modalViewSubtitle}>{subtitle}</Text>)
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        translation: state.languageReducer.translation,
        countries: state.locationReducer.countries
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}

var style = {
    buttonRequest: {
        height: 31,
        width: 140,
        marginTop: 5,
        //marginLeft:"5%",
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 700
    },
    modalView: {
        paddingTop: 20
    },
    modalViewTitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center"
    },
    requestText: {
        width: "90%",
        //marginLeft:"5%",
        //marginBottom:20,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        zIndex: -1
    },
    modalButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)"
    },
    modalButton1: {
        borderBottomLeftRadius: 20
    },
    modalButton2: {
        borderRightWidth: 0,
        borderBottomRightRadius: 20
    },
    modalButtonText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonTextNo: {
        color: "blue"
    },
    modalButtonTextYes: {
        color: "red"
    },
    form: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 40,
        zIndex: 0
    },
    selectContainer: {
        paddingLeft: 40,
        paddingRight: 40,
        width: "100%",
        height: 40,
        zIndex: 1,
        justifyContent: "space-between"
    },
    select: {
        width: "100%",
        position: "relative",
        zIndex: 999
    },
    ":hover": {
        modalButton1: {
            backgroundColor: "rgba(175,215,255,0.3)"
        },
        modalButton2: {
            backgroundColor: "rgba(255,175,175,0.3)"
        }
    }
};


//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, FliwerUpdateCountryModal));
