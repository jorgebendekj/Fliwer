import {Platform} from 'react-native';
import {FliwerColors} from './FliwerColors';

const FliwerStyles = {
    modalIn: {
        backgroundColor: "white",
        borderRadius: 10,
        overflow: "hidden",
        width: "90%",
        maxWidth: 1000,
        height: "auto",
        maxHeight: "80%"
    },
    modalView: {
        width: "100%",
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 40,
        paddingRight: 40
    },
    modalScrollViewStyle: {
        width: "100%"
    },
    fliwerGreenButtonStyle: {
        
    },
    fliwerGreenButtonContainerStyle: {
        height: 33, width: 200, alignSelf: "center"
    },    
    titleStyle: {
        color: FliwerColors.primary.gray, 
        fontSize: 24, 
        textAlign: "center", 
        fontWeight: "bold"        
    },
    descriptionStyle: {
        color: FliwerColors.primary.gray, 
        fontSize: 18, 
        textAlign: "center"
    },
    littleTextStyle: {
        color: FliwerColors.primary.gray, 
        fontSize: 14,
        fontFamily: FliwerColors.fonts.regular,
        textAlign: "center",
        lineHeight: 20
    },
    buttonStyle: {width: "100%", height: 40, borderRadius: 4, paddingBottom: 3},
    buttonTextStyle: {fontWeight: "bold"},
    
    littleButtonStyle: {height: 30, paddingLeft: 10, paddingRight: 10, minWidth: 160},
    littleButtonTextStyle: {fontSize: 12, lineHeight: 18},
                                
    textFieldContainerStyle: {
        borderColor: FliwerColors.primary.gray,
        borderWidth: 1,
        borderRadius: 4,
        paddingTop: 0,
        maxWidth: null        
    },
    textFieldStyle: {}
};

if (Platform.OS == "web") {
    FliwerStyles.modalView.height = "100%";
    FliwerStyles.modalScrollViewStyle.height = "100%";
}

export {FliwerStyles};
