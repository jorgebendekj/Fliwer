import {Dimensions} from 'react-native';
import {FliwerColors} from '../../utils/FliwerColors';

const fileStyles = {
    
    getBasicSheetStyles: function() {
        const dimensions = Dimensions.get('window');
        var maxWidth = 700;
        var marginTop = 20;
        var marginBottom = 30;
        if (dimensions.width < maxWidth)
        {
            maxWidth = dimensions.width;
            marginTop = 0;
            marginBottom = 0;
        }
        
        return {
            maxWidth: maxWidth,
            marginTop: marginTop,
            marginBottom: marginBottom
        };
    },
    
    scrollViewStyle: {
        flex: 1, backgroundColor: "#F0F0F0"
    },
    pageWrapper: {
        //borderColor: "red", borderWidth: 1, 
        backgroundColor: "white",

        paddingTop: 20,
        paddingLeft: 40, paddingRight: 40,

        shadowColor: FliwerColors.primary.black,
        shadowOffset:{  width: 0,  height: 5},
        shadowOpacity: 0.8,
        shadowRadius: 10            
    },
    titleFormatContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 20,
        marginTop: 10
    },
    textFormat: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
    },
    titleFormat: {
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        fontSize: 26,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    textInput: {
        height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, marginTop: 3
    },
    saveButton: {
        position: "absolute",
        //right: 30,
        right: 18,
        bottom: 30,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: FliwerColors.complementary.blue,
        justifyContent: "center"
    },
    saveButtonHoverColor: "#5AA2E3",
    switchModeButton: {
        position: "absolute",
        //right: 30,
        right: 18,
        bottom: 90,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: "orange",
        justifyContent: "center"
    },
    switchModeButtonHoverColor: "#FFCC66",
    switchMailingButton: {
        position: "absolute",
        //right: 30,
        right: 18,
        bottom: 150,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: FliwerColors.complementary.purple,
        justifyContent: "center"
    },
    switchMailingButtonHoverColor: "#9F81F7",
    deleteButton: {
        position: "absolute",
        //right: 30,
        right: 18,
        bottom: 280,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: FliwerColors.complementary.red,
        justifyContent: "center"
    },
    deleteButtonHoverColor: "#FF8686"   
 
};

export {fileStyles};
