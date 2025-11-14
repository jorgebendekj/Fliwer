'use strict';

import React, { Component } from 'react';
var {TouchableOpacity, View, Text, ScrollView} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import Modal from '../../widgets/modal/modal'

import Select from 'react-select';

class Dropdown extends Component {

    constructor(props) {
        super(props);

        /*
         Props:
         selectedValue:  index
         style:          json
         styleOptions:   json
         onChange:       (itemValue)=>
         placeholder:    text
         options:        [{
         value:'',
         label:''
         },..]
         */
        this.state = {
            display: false,
            selected: null
        };
    }

    render() {
        var {modal, style, disabled} = this.props;
        if (this.props.styleOptions) {
            for (var i = 0; i < this.props.options.length; i++) {
                this.props.options[i].style = Object.assign(this.props.options[i].style ? this.props.options[i].style : {}, this.props.styleOptions);
            }
        }
        var selectedValue = this.props.options.find((obj) => {
            return obj.value == this.props.selectedValue
        });
        var that = this;
        if (!modal) {
            return (
                    <Select simpleValue isClearable={false} isSearchable={true} style={[this.style.dropdownStyle, style]} isDisabled={disabled}
                            styles={{
                                            placeholder: base => ({...base, height: "100%"}),
                                        }} options={this.props.options} onChange={(option) => {
                                    if (typeof that.props.onChange == 'function')
                                        that.props.onChange(option.value)
                                }} value={selectedValue} placeholder={this.props.placeholder} />
                    )
        } else {
            return (
                    <TouchableOpacity style={[this.style.dropdownStyle, style]} disabled={disabled} onPress={() => {
                            this.openModal()
                        }}>
                        <Select
                            simpleValue
                            isClearable={false}
                            isSearchable={false}
                            isDisabled={disabled}
                            styles={{
                                    menu: base => ({...base, display: "none"}),
                                    placeholder: base => ({...base, height: "100%"}),
                                    borderRadius: 25
                                }}
                            defaultMenuIsOpen={false}
                            options={this.props.options}
                            openMenuOnClick={false}
                            onChange={() => {
                                    if (typeof that.props.onChange == 'function')
                                        that.props.onChange(option.value)
                                }}
                            value={selectedValue}
                            placeholder={this.props.placeholder}
                            />
                        {this.renderModal()}
                    </TouchableOpacity>
                    )
        }
    }

    openModal() {
        global.frontLayer.display(true);
        this.setState({display: true});
    }

    renderModal() {
        if (this.state.display) {
            global.frontLayer.renderLayer(() => {
                return (
                        <Modal animationType="fade" inStyle={this.style.modalIn} visible={this.state.display} onClose={() => {
                                global.frontLayer.display(false);
                                this.setState({display: false})
                                   }}>
                            <ScrollView scrollEventThrottle={1000} style={{flex: 1}}>
                                <View style={this.style.modalView}>
                                    {this.renderModalPlaceHolder()}
                                    <View style={this.style.optionsContainer}>
                                        {this.renderModalOptions()}
                                    </View>
                                </View>
                            </ScrollView>
                        </Modal>
                        );
            });
        } else
            return [];
    }

    renderModalPlaceHolder() {
        if (this.props.placeholder)
            return (
                    <View style={this.style.placeHolderContainer}>
                        <Text style={this.style.placeHolder} >{this.props.placeholder}</Text>
                        <View style={this.style.underLine}></View>
                    </View>
                    )
        else
            return [];
    }

    renderModalOptions() {
        var that = this;
        var options = [];
        for (var i = 0; i < this.props.options.length; i++) {
            options.push(
                    <TouchableOpacity style={[this.style.option, (this.state.selected == i ? this.style.optionHover : {})]} onKeyPress={(e) => console.log(e.nativeEvent.key)}  onMouseEnter={this.selectOption(i)} onMouseLeave={() => {
                            this.setState({selected: null})
                                          }} onPress={(function (o) {
                                              return function () {
                                                  if (typeof that.props.onChange === 'function')
                                                      that.props.onChange(o.value);
                                                  global.frontLayer.display(false);
                                                  that.setState({display: false, selected: null})
                                              }
                                          })(this.props.options[i])}>
                        <Text style={[this.style.optionText, this.props.options[i].value == (typeof this.props.selectedValue === "undefined" ? 0 : this.props.selectedValue) ? this.style.optionTextSelected : {}]} >{this.props.options[i].label}</Text>
                    </TouchableOpacity>
                    )
        }
        return options;
    }

    selectOption(index) {
        return () => {
            this.setState({selected: index})
        }
    }

};


var style = {
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        minWidth: 200,
        maxWidth: "80%",
        maxHeight: "80%"
    },
    modalView: {
        paddingTop: 20,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 20,
        //maxHeight:"80%",
        display: "flex"
    },
    placeHolderContainer: {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 31
    },
    dropdownStyle: {
        borderWidth: null, borderRadius: null, borderColor: null,
        backgroundColor: null, height: 35
    },
    optionsContainer: {
        //height:"20%",
        //maxHeight:"65%",
        flexShrink: "!important",
        overflowY: "auto"
    },
    placeHolder: {
        fontSize: 20
    },
    underLine: {
        height: 1,
        backgroundColor: "black"
    },
    option: {
        paddingTop: 10,
        paddingBottom: 10
    },
    optionText: {
        fontSize: 16,
        paddingLeft: 5,
    },
    optionTextSelected: {
        fontFamily: "AvenirNext-Bold"
    },
    optionHover: {
        backgroundColor: "rgb(220,220,220)"
    },
    "@media (orientation:portrait)": {

    }
}

//Connect everything
export default mediaConnect(style, Dropdown);
