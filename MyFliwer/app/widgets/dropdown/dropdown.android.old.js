'use strict';

import React, { Component } from 'react';
import {View, Text, Image, Switch} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Picker} from '@react-native-picker/picker';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

class Dropdown extends Component {

    constructor(props) {
        super(props);

        this.state={
            selectedValue: this.props.selectedValue
        }
    }

    openModal() {
        /*
         if (this.picker) {
         }*/
    }

    render() {
        var that = this;
        var selectedLabel = this.props.options.find((option) => { return option.value == this.props.selectedValue; });
        var color = this.props.style && this.props.style.color ? this.props.style.color:(this.props.styleOptions && this.props.styleOptions.color?this.props.styleOptions.color:"#4A4A49");
        if(selectedLabel) selectedLabel = selectedLabel.label;

        return (
            <View style={[this.style.container, this.props.style]}>
                <Picker
                    ref={(ref) => {
                        this.picker = ref;
                    }}
                    numberOfLines={1}
                    selectedValue={this.props.selectedValue}
                    style={[this.style.dropdownStyle,this.props.style]}
                    enabled={!this.props.disabled}
                    onValueChange={this.props.onChange}>

                    {this.props.options.map((prop, key) => {
                        return (
                            <Picker.Item 
                                key={prop.value} 
                                label={prop.label} 
                                color={color} 
                                value={prop.value} 
                                style={Object.assign(this.style.styleOptions,this.props.styleOptions)} />
                        );
                    })}
                </Picker>
                
                <View style={this.style.selectedLabel}>
                    <Text style={[this.style.selectedLabelText,this.props.styleOptions,{color:color}]}>{selectedLabel?selectedLabel:""}</Text>
                </View>
            </View>
        )
    }

};

var style = {
    container: {
        borderWidth: 1, borderRadius: 4, borderColor: "gray", backgroundColor: null, height:35,
        backgroundColor:"white"
    },
    selectedLabel:{
        position:"absolute",left:0,right:48,height:"100%",display:"flex",justifyContent:"center"
    },
    selectedLabelText:{
        paddingLeft:10
    },
    styleOptions:{
        backgroundColor:"white"
    },
    dropdownStyle: { width: "100%", height: "100%", justifyContent:"center", height:"100%"
    }
};

export default mediaConnect(style, Dropdown);
