'use strict';

import React, { Component } from 'react';
import {View, TouchableOpacity, Text, Image} from 'react-native';

//import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import Icon from 'react-native-vector-icons/Entypo';

import debounce from 'lodash/debounce';

class FliwerCalmButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: false
        };
    }
    
    componentWillMount() {

       this.onPressDelayed = debounce(this.handleClick.bind(this), 200);
    }    

    async handleClick(e) {

        this.setState({clicked: true});
        
        try {
            await this.props.onPress();
        } finally {
            this.setState({clicked: false});
        }        
        
    }   

    render() {
        var {disabled, containerStyle, skipView} = this.props;

        disabled = disabled || this.state.clicked;

        if (skipView)
        {
            return (
                this.renderButton()
            );
        }
        
        return (
            <View style={[this.style.container, containerStyle, (disabled?(this.style.containerDisabled):{})]}>
                {this.renderButton()}
            </View>                
        );

    }   

    renderButton() {
        var {disabled, onMouseEnter, onMouseLeave, buttonStyle} = this.props;
        
        disabled = disabled || this.state.clicked;
        //console.log("disabled", disabled);
        
        return (
            <TouchableOpacity 
                disabled={disabled} 
                style={[this.style.button, buttonStyle]} 
                onPress={disabled ? () => {console.log("disabled")} : this.onPressDelayed.bind(this)} 
                onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
            >
                {this.renderInsideButton()}
            </TouchableOpacity>
        );            

    }
    
    renderInsideButton()
    {
        var {imageData, text, textStyle, textKey, iconData} = this.props;
        
        if (text)
        {
            if (textKey)
            {
                return (
                    <Text key={textKey} style={[this.style.text, textStyle]}>{text}</Text>
                );                   
            }
            else
            {
                return (
                    <Text style={[this.style.text, textStyle]}>{text}</Text>
                );                   
            }         
        }
        
        if (imageData)
        {
            var draggable = imageData.draggable || false;
            return (
                <Image style={imageData.style} source={imageData.source} resizeMode={imageData.resizeMode} draggable={draggable}/>
            );            
        }
        
        if (iconData)
        {
            return (
                <Icon style={iconData.style} name={iconData.name} />
            );            
        }
        
        return (<View></View>); 
    }
    
};

var style = {
    container: {

    },
    containerDisabled: {
        filter:"opacity(20%)",
    },
    button: {

    },
    text: {

    }
};

//Connect everything
export default mediaConnect(style, FliwerCalmButton);
