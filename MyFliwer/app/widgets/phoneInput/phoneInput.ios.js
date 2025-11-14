import React, { Component } from 'react'
import {
    StyleSheet,
    View
} from 'react-native'

import PhoneInput2 from "react-native-phone-number-input";

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class PhoneInput extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            defaultValue: this.props.value? this.props.value : '',
            value: '',
            initialized: false,
            cicle: null
        };
        
    }    
    
    componentDidMount() {
//        console.log('El componente está disponible en el DOM');
        setTimeout(() => {
            if (!this.state.initialized) {
                var countryCode = this.phone.getCallingCode();
                var phoneNumber = this.state.defaultValue;
                if (countryCode && phoneNumber && phoneNumber.length > countryCode.length) {
                    var code = phoneNumber.substring(0, countryCode.length);
                    console.log("code", code);
                    if (code == countryCode)
                        phoneNumber = phoneNumber.substring(countryCode.length);
                }
                
                console.log("componentDidUpdate", phoneNumber);
                this.setState({value: phoneNumber, initialized: true});
            }            
        }, 500); 
    }

    componentDidUpdate(prevProps)
    {
//        if (!this.state.initialized) {
//            var countryCode = this.phone.getCallingCode();
//            var phoneNumber = this.state.defaultValue.replace(countryCode, '');
//            console.log("componentDidUpdate", phoneNumber);
//            this.setState({value: phoneNumber, initialized: true});
//        }
    }

    render() {
        const {country, value, height, marginTop, marginBottom, maxWidth, noAutoFocus, dialCodeTopPadding, textColor, backgroundColor, fontSize, disabled} = this.props;
        
        let theCountry = country? country : 'ES';
        let theHeight = height? height : 48;
        let theMarginTop = marginTop? marginTop : 10;
        let theMarginBottom = marginBottom? marginBottom : 10;
        let theAutoFocus = noAutoFocus? false : true;
        let theDialCodeTopPadding = dialCodeTopPadding? dialCodeTopPadding : 15;
        let theTextColor = textColor? textColor : "black";
        let theBackgroundColor = backgroundColor? backgroundColor : "white";
        let theFontSize = fontSize? fontSize : 14;
        
        let codeTextStyle = true? {height: theHeight, paddingTop: theDialCodeTopPadding} : {};
        codeTextStyle.color = theTextColor;
        codeTextStyle.fontSize = theFontSize;
        
        return (
          <PhoneInput2 
            ref={(ref) => { this.phone = ref; }}
            value={this.state.value}
            defaultCode={theCountry.toUpperCase()}
            onChangeText={(text) => {
                this.setState({value: text});
            }}
            onChangeFormattedText={(text) => {
                var phoneNumber = text.replace('+', '');
                console.log("onChange phoneNumber", phoneNumber);
                this.props.onChange(phoneNumber);
            }}
            withDarkTheme={false}
            withShadow={true}
            autoFocus={false} 
            containerStyle={{width: "100%", marginTop: theMarginTop, marginBottom: theMarginBottom, height: theHeight, borderRadius: 4}} 
            textInputProps={{height: theHeight, color: theTextColor, fontSize: theFontSize}} 
            textContainerStyle={{borderTopRightRadius: 4, borderBottomRightRadius: 4, backgroundColor: theBackgroundColor}} 
            codeTextStyle={codeTextStyle}
            placeholder={" "}
            disabled={disabled}
            disableArrowIcon={disabled}
          />
        );
    }
    
}

var style = {
    
};

export default mediaConnect(style, PhoneInput);