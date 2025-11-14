import React, { Component } from 'react'
import {
    StyleSheet
} from 'react-native'

import PhoneInput2 from 'react-phone-input-2'
//import 'react-phone-input-2/lib/style.css'
import 'react-phone-input-2/lib/bootstrap.css'

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class PhoneInput extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            
        };
        
    }  

    render() {
        const {country, value, height, marginTop, marginBottom, maxWidth, noAutoFocus, textColor, backgroundColor, borderColor} = this.props;
        
        let theCountry = country? country : 'es';
        let theHeight = height? height : 48;
        let theMarginTop = marginTop? marginTop : 10;
        let theMarginBottom = marginBottom? marginBottom : 10;
        let theAutoFocus = noAutoFocus? false : true;
        let theTextColor = textColor? textColor : "black";
        let theBackgroundColor = backgroundColor? backgroundColor : "white";
        let theBorderColor = borderColor? borderColor : "white";
        
        let containerStyle = {width: "100%", marginTop: theMarginTop, marginBottom: theMarginBottom};
        if (maxWidth)
            containerStyle.maxWidth = maxWidth;
        
        return (
            <PhoneInput2
                country={theCountry.toLowerCase()}
                value={value}
                onChange={(text) => {
                    this.props.onChange(text);
                }} 
                inputProps={{
                    required: true,
                    autoFocus: theAutoFocus
                }} 
                countryCodeEditable={false}
                inputStyle={{color: theTextColor, width: "100%", height: theHeight, backgroundColor: theBackgroundColor, borderColor: theBorderColor}}
                buttonStyle={{}}
                dropdownStyle={{}}
                containerStyle={containerStyle}
                />
            );
    }
    
}

var style = {
    
};

export default mediaConnect(style, PhoneInput);