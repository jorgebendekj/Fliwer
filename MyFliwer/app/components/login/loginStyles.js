
import {Dimensions} from 'react-native';
import {FliwerColors} from '../../utils/FliwerColors';

const loginStyles = {

    maxWidth: 450,
    formWidth: 300,
    contentView: {
        width: "100%",
        height: "100%"
    },
    contentViewContainer: {
        flexDirection: 'column',
//        height: "100%", // Be careful, don´t enable this line. Scrolling problems on iOS
        alignItems: 'center'
    },
    contentViewIn: {
        width: "100%",
        height: "100%",
        flexGrow: 1,
        alignItems: "center",
//        borderColor: "red", borderWidth: 1,
        paddingLeft: 40, paddingRight: 40
    },
    content: {
        width: "100%",
//        borderColor: "violet", borderWidth: 1,
        alignItems: "center"
    },
    logoContainer: {
        marginTop: 40,
//        borderColor: "green", borderWidth: 1,
        width: 350,
        height: 200
    },
    imageLogo: {
        width: "100%",
        height: "100%"
    },
    titleStyle: {
        color: FliwerColors.primary.gray,
        fontSize: 24,
        marginTop: 30,
        textAlign: "center",
        fontWeight: "bold"
    },
    descriptionStyle: {
        color: FliwerColors.primary.gray,
        fontSize: 18,
        marginTop: 40,
        textAlign: "center"
    },
    littleTextStyle: {
        //color: "rgb(66,66,66)",
        color: FliwerColors.primary.gray,
        fontSize: 14,
        fontFamily: FliwerColors.fonts.regular,
        textAlign: "center",
        lineHeight: 20
    },
    selectStyle: {
        width: "100%",
        position: "relative",
        textAlign: "center",
        zIndex: 1
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
    textFieldStyle: {},
    lineDelimiter: {
        height: 1,
        width: 150,
        marginTop: 10,
        borderBottomColor: FliwerColors.secondary.gray,
        borderBottomWidth: 1
    },
    showPasswordStyle: {position: "absolute", top: 4, right: 3, width: 40, height: 40, alignItems: "center", justifyContent: "center"},

    scrollView: {
        width: "100%",
        position: "absolute",
        top: 0,
        bottom: 50
    },
    scrollViewContainer: {
        minHeight: "100%",
        alignItems: "center"
    },

    tableCellColor: "rgb(240,240,240)",

    getMaxWidth: function() {
        const dimensions = Dimensions.get('window');
        var dimensionWidth = dimensions.width;
        var dimensionHeight = dimensions.height;

        var maxWidth = loginStyles.maxWidth;
        if (dimensionWidth < maxWidth)
        {
            maxWidth = dimensionWidth;
        }

        /*if (dimensionHeight < 745)
        {
            var ratio = 745 / dimensionHeight;
            maxWidth = loginStyles.maxWidth / ratio;
            console.log("getMaxWidth", ratio, maxWidth);
        }*/

        return maxWidth;
    },

    getFormWidth: function() {
        const dimensions = Dimensions.get('window');
        var dimensionWidth = dimensions.width;
        var dimensionHeight = dimensions.height;

        var formWidth = loginStyles.formWidth;
        if (dimensionWidth < formWidth)
        {
            formWidth = dimensionWidth - 40;
        }
        return formWidth;
    },

    getLogoSize: function() {
        const dimensions = Dimensions.get('window');
        var dimensionWidth = dimensions.width;
        var dimensionHeight = dimensions.height;
        if(!dimensionHeight){
          if(window && window.screen && window.screen.height)dimensionHeight=window.screen.height;
          else dimensionHeight=200;
          console.log("Warn: no height detected");
        }
        if(!dimensionWidth){
          if(window && window.screen && window.screen.width)dimensionWidth=window.screen.height;
          else dimensionWidth=200;
          console.log("Warn: no width detected");
        }

        var newWidth = loginStyles.logoContainer.width;
        var newHeight = loginStyles.logoContainer.height;
        var newMarginTop = loginStyles.logoContainer.marginTop;

        var maxWidth = loginStyles.maxWidth;
        if (dimensionHeight < 745)
        {
            var ratio = 745 / dimensionHeight;
            dimensionWidth = loginStyles.maxWidth / ratio;
            //console.log("getLogoSize", ratio, dimensionWidth);
            newMarginTop = 0;
        }

        if (dimensionWidth < maxWidth)
        {
            newWidth = dimensionWidth - (maxWidth - loginStyles.logoContainer.width);
            var ratio = newWidth / loginStyles.logoContainer.width;
            newHeight = loginStyles.logoContainer.height * ratio;
        }
        return {width: newWidth, height: newHeight, marginTop: newMarginTop};
    },

    getFliwerButtonMarginBottom: function()
    {
        const dimensions = Dimensions.get('window');
        var dimensionHeight = dimensions.height;
        if(!dimensionHeight){
          if(window && window.screen && window.screen.height)dimensionHeight=window.screen.height;
          else dimensionHeight=200;
          console.log("Warn: no height detected");
        }

        var ret = 80;
        if (dimensionHeight < 770)
        {
            //ret = 20; // Without bottombar
            ret = 70; // With bottombar
        }
        return ret;
    },


    getMarginTopBetweenLogoAndTitle: function()
    {
        const dimensions = Dimensions.get('window');
        var dimensionHeight = dimensions.height;
        if(!dimensionHeight){
          if(window && window.screen && window.screen.height)dimensionHeight=window.screen.height;
          else dimensionHeight=200;
          console.log("Warn: no height detected");
        }

        var marginTop = loginStyles.titleStyle.marginTop;

        if (dimensionHeight < 745)
        {
            marginTop = 5;
        }

        return marginTop;
    },


    getMarginTopBetweenTopAndTitle: function()
    {
        const dimensions = Dimensions.get('window');
        var dimensionHeight = dimensions.height;
        if(!dimensionHeight){
          if(window && window.screen && window.screen.height)dimensionHeight=window.screen.height;
          else dimensionHeight=200;
          console.log("Warn: no height detected");
        }

        var marginTop = loginStyles.titleStyle.marginTop;

        if (dimensionHeight < 670)
        {
            marginTop = 10;
        }

        return marginTop;
    },


    isLittleHeight: function()
    {
        const dimensions = Dimensions.get('window');
        var dimensionHeight = dimensions.height;
        if(!dimensionHeight){
          if(window && window.screen && window.screen.height)dimensionHeight=window.screen.height;
          else dimensionHeight=200;
          console.log("Warn: no height detected");
        }
        return dimensionHeight < 745;
    }

};

export {loginStyles};
