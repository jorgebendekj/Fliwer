'use strict';

import React, { Component } from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import ActionSheet from 'react-native-actionsheet'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';

class Dropdown extends Component {

    constructor(props) {
        super(props);

        this.state = {
            options: [],
            values: [],
            selectedIndex: -1,
            label: "",
            lastValue: "",
        };
    }

    showActionSheet = () => {
        this.ActionSheet.show();
    }

    render() {
        var that = this;

        if (this.state.selectedIndex < 0 || (this.props.selectedValue && this.props.selectedValue !== this.state.lastValue))
        {
            this.state.options = [];
            this.state.values = [];
            this.state.label = "";
            this.state.selectedIndex = 0;

            this.props.options.map((prop, index) => {
                this.state.options.push(prop.label);
                this.state.values.push(prop.value);

                if (this.props.selectedValue && this.props.selectedValue == prop.value)
                {
                    this.state.label = prop.label;
                    this.state.selectedIndex = index;
                    this.state.lastValue = prop.value;
                }
            });

            this.state.options.push("Cancel");
            this.state.values.push("*cancel*");
        }

        return (
                <View style={[this.style.container, this.props.style]}>
                    <TouchableOpacity
                        style={this.style.dropdownStyle}
                        onPress={this.props.disabled? ()=>{} : this.showActionSheet}
                        >
                        <Text style={[{textAlign: "center",flexGrow:1}, this.props.style && this.props.style.color ? {color: this.props.style.color} : {},this.props.textStyle]}>{this.state.label}</Text>
                        <IconMaterialIcons name="keyboard-arrow-down" size={25} style={[{marginTop:-6},this.props.style && this.props.style.color ? {color: this.props.style.color} : {color: "black"}]}/>
                        <ActionSheet
                            ref={o => this.ActionSheet = o}
                            style={{}}
                            title={'Which one do you like ?'}
                            options={this.state.options}
                            cancelButtonIndex={this.state.options.length-1}
                            destructiveButtonIndex={null}
                            onPress={(index) => {
                                var value = that.state.values[index];
                                if (value !== '*cancel*')
                                    this.setState({selectedIndex: index, label: this.state.options[index]}, () => {
                                        that.props.onChange(that.state.values[index]);
                                    });

                            }}
                            />
                    </TouchableOpacity>
                </View>
                );
    }

};

var style = {
    container: {
        borderWidth: 1, borderRadius: 4, borderColor: "gray",
        backgroundColor: null, height: 35
    },
    dropdownStyle: {
        width: "100%",
        height: "100%",
        paddingTop: 8,
        display:"flex",
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center"
    }
};

export default mediaConnect(style, Dropdown);
