'use strict';

import React, { Component } from 'react';
var {TouchableOpacity, View, Text, ScrollView, TextInput} = require('react-native');

import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import {FliwerStyles} from '../../utils/FliwerStyles'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import Modal from '../../widgets/modal/modal'

import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

class Dropdown extends Component {

    constructor(props) {
        super(props);

        this.state = {
            display: false,
            selected: null,
            filter: '',
            widthModal: null,
            heightModal: null
        };
    }

    render() {
        var {style, disabled, textStyle, upperCase, modal, customRender} = this.props;
        if (this.props.styleOptions) {
            for (var i = 0; i < this.props.options.length; i++) {
                this.props.options[i].style = Object.assign(this.props.options[i].style ? this.props.options[i].style : {}, this.props.styleOptions);
            }
        }
        var selectedValue = this.props.options.find((obj) => {
            return obj.value == this.props.selectedValue
        });
        
        var color = this.props.style && this.props.style.color ? this.props.style.color : null;
        var textValue = selectedValue?selectedValue.label: (this.props.placeholder?this.props.placeholder:"Sin plantilla especifica");
        if (upperCase)
            textValue = textValue.toUpperCase();
        
        if(modal){
            return (
                <View style={[this.style.container, style]}>
                    <TouchableOpacity 
                        style={[this.style.dropdownStyle]} 
                         disabled={disabled} 
                         onPress={() => {
                            if(this.props?.hideModal) this.props?.hideModal(true)
                             this.openModal();
                         }}
                        >
                            {
                                customRender
                                ?
                                customRender
                                :
                                <View style={{
                                    flexDirection: "row", 
                                    height: 35
                                }}>
                                    <View style={{flex: 1, 
                                        height: 35,
                                        paddingLeft: 4, paddingRight: 2,
                                        justifyContent: "center", 
                                        alignItems: "center"}}>
                                        <Text ellipsizeMode='tail' numberOfLines={1} style={[{textAlign: "center"}, textStyle, color ? {color: color} : {},this.props.textStyle]}>{textValue}</Text>
                                    </View>
                                    <View style={{
                                        width: 40,
                                        height: 35,
                                        justifyContent: "center", 
                                        alignItems: "center"
                                    }}>
                                        <View style={{
                                            borderColor: "gray",
                                            width: "100%",
                                            height: 26,
                                            borderLeftWidth: 1,
                                            justifyContent: "center", 
                                            alignItems: "center"
                                        }}>
                                            <IconMaterialIcons name="keyboard-arrow-down" 
                                                size={24} 
                                                style={{
                                                    color: "gray"
                                                }}/>                    
                                        </View>                 
                                    </View>                    
                                </View>
                            }
                    </TouchableOpacity>
                    {this.renderModal()}
                </View>
            );
        }else{
            return (
                <View style={[this.style.container, style]}>
                    <TextInput
                        style={[this.style.dropdownStyle,{height:"100%"}]} 
                        disabled={disabled} 
                        value={this.state.filter}
                        onChangeText={(text) => {
                            //If text has at least one character
                            if (text.length > 0) {
                                this.openInlineModal();
                            }

                            this.setState({filter: text});
                            if (typeof this.props.onChangeFilter === 'function')
                                this.props.onChangeFilter(text);
                        }}
                    >
                    </TextInput>
                    {this.renderInlineModal()}
                </View>
            )
        }
    }

    openModal() {
        global.frontLayer.display(true);
        this.setState({display: true});
    }

    openInlineModal(){
        this.setState({display: true});
    }

    renderInlineModal(){
        if(this.state.display){
            return (
                <View style={[this.style.modalIn, this.style.modalInIphoneBrowser]}>
                    <View style={[this.style.modalView, {height: "auto"}]}>
                        <View style={this.style.optionsContainer}>
                            {this.renderModalOptions()}
                        </View>
                    </View>
                </View>
            )
        }else return [];
    }

    renderModal() {
        if (this.state.display) {
            global.frontLayer.renderLayer(() => {

                return (
                        <Modal animationType="fade" 
                            inStyle={[
                                FliwerStyles.modalIn, 
                                this.style.modalIn, 
                                FliwerCommonUtils.isIphoneBrowser()? this.style.modalInIphoneBrowser : {}
                            ]} 
                            visible={this.state.display} 
                            onClose={() => {
                                if(this.props?.hideModal) this.props?.hideModal(false)
                                global.frontLayer.display(false);
                                this.setState({display: false})
                            }}
                            >
                            <View style={[FliwerStyles.modalView, {
                                paddingLeft: 20,
                                paddingRight: 20},/*
                                this.state.widthModal && this.state.heightModal? {width: this.state.widthModal, height: this.state.heightModal} : */{}, 
                            ]}
                            onLayout={(event) => {
                                var {width, height} = event.nativeEvent.layout;
                                if (width > 0) this.state.widthModal = width;
                                if (height > 0) this.state.heightModal = height;
                            }}
                            >
                                {this.renderModalPlaceHolder()}
                            
                                {this.props.filterEnabled?<View style={{}}>
                                    <TextInput
                                        style={{marginTop: 5, marginBottom: 5, height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, width: "100%"}}
                                        onChangeText={(text) => {
                                            this.setState({filter: text})
                                        }}
                                        value={this.state.filter}
                                        maxLength={20} 
                                        placeholder={this.props.actions.translate.get('general_filter')}
                                    />            
                                </View>:null}                                   

                                <ScrollView scrollEventThrottle={1000} style={{flex: 1, marginTop: 5, marginBottom: 5}}>
                                    <View style={this.style.modalView}>
                                        <View style={this.style.optionsContainer}>
                                            {this.renderModalOptions()}
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
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
            
            var add = false;
            if (this.state.filter) {
                if (this.props.options[i].label.toLowerCase().includes(this.state.filter.toLowerCase()))
                    add = true;
            }
            else
                add = true;
        
            if (add)
                options.push(
                    <TouchableOpacity 
                        style={[this.style.option, (this.state.selected == i ? this.style.optionHover : {})]} 
                        onKeyPress={(e) => console.log(e.nativeEvent.key)}  
                        onMouseEnter={this.selectOption(i)} 
                        onMouseLeave={() => {
                            this.setState({selected: null})
                        }} 
                        onPress={(function (o) {
                            return function () {
                                global.frontLayer.display(false);
                                that.setState({display: false, selected: null});
                                if (typeof that.props.onChange === 'function')
                                    that.props.onChange(o.value);
                            }
                        })(this.props.options[i])}>
                        <Text style={[this.style.optionText, this.props.options[i].value == (typeof this.props.selectedValue === "undefined" ? 0 : this.props.selectedValue) ? this.style.optionTextSelected : {}]} >{this.props.options[i].label}</Text>
                    </TouchableOpacity>
                );
        }
        return options;
    }

    selectOption(index) {
        return () => {
            this.setState({selected: index})
        }
    }

};

function mapStateToProps(state, props) {
    return {
        
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch)
        }
    };
}


var style = {
    container: {
        borderWidth: 1, 
        borderRadius: 4, 
        borderColor: "gray",
        backgroundColor: null, 
        height: 35
    },
    dropdownStyle: {
        width: "100%"
        //height: "100%"
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        minWidth: 200,
        height: "auto",
        maxHeight: "80%",
        width: null
    },
    modalInIphoneBrowser: {
        height: "80%",
        maxHeight: 500
    },
    modalView: {
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 20,
        display: "flex",
        alignItems: "center"
    },
    placeHolderContainer: {

    },
    placeHolder: {
        fontSize: 20, textAlign: "center"
    },
    optionsContainer: {
        flexShrink: "!important",
        overflowY: "auto"
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
        textAlign: "center"
    },
    optionTextSelected: {
        fontFamily: "AvenirNext-Bold"
    },
    optionHover: {
        backgroundColor: "rgb(220,220,220)"
    }   
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true})(mediaConnect(style, Dropdown));
