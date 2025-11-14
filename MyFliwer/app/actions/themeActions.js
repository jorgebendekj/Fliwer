export const CHANGE_THEME = 'CHANGE_THEME';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

var themes={
/*     'Taskium':{
        name:"Taskium",
        type:"dark",
        primaryColor:"#221c35",
        primaryText:"#FFFFFF", 
        secondaryColor:"#332c54", 
        secondaryText:"#FFFFFF", 
        complementaryColor:"#5c5676", 
        complementaryText:"#FFFFFF",
        complementaryBackgroundText: "#FFFFFF",
        cardColor:"#444f59",
        componentCardColor:"#FFFFFF",
        componentTextCardColor:"#221c35",
        darkerCardColor:"#2f3840",
        lighterCardColor:"#5a6774",
        complementaryCardColor:"#5d6670",
        cardText:"#FFFFFF",
        acceptColor:"#79b869", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF",
        topBar: "#332c54",
        mainMenu: "#221c35",
        primaryView: "#332c54",
        secondaryView: "#5c5676",
        filterMenu: "#221c35"

    }, */
    'ivework':{
        name:"I've Work App",
        type:"dark",
        primaryColor:"#161616",
        primaryText:"#FFFFFF", 
        secondaryColor:"#323232", 
        secondaryText:"#FFFFFF", 
        complementaryColor:"#323232", 
        complementaryText:"#FFFFFF",
        complementaryBackgroundText: "#FFFFFF",
        cardColor:"#323232",
        componentCardColor:"rgb(38,38,38)",
        componentTextCardColor:"#FFFFFF",
        darkerCardColor:"#323232",
        lighterCardColor:"#0c0c0c",
        complementaryCardColor:"rgb(38,38,38)",
        cardText:"#FFFFFF",
        acceptColor:"#208bfb", 
        selectedColor:"#208bfb", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF",
        topBar: "rgb(38,38,38)",
        mainMenu: "#0c0c0c",
        primaryView: "rgb(38,38,38)",
        secondaryView: "#0c0c0c",
        filterMenu: "#323232",
    },
    'Light':{
        name:"Light",
        type:"light",
        primaryColor:"#edf1f5",
        primaryText:"#5B728A", 
        secondaryColor:"rgb(238, 238, 238)", 
        secondaryText:"#5c728a", 
        complementaryColor:"#e8eff6", 
        complementaryText:"#3db4f2", 
        complementaryBackgroundText: "#425A73",
        cardColor:"rgb(179, 218, 235)",
        componentCardColor:"#FFFFFF",
        componentTextCardColor:"#425A73",
        darkerCardColor:"rgb(142, 174, 188)",
        lighterCardColor:"rgb(208, 233, 244)",
        complementaryCardColor:"#d9d9d9",
        cardText:"#425A73",
        acceptColor:"#208bfb", 
        selectedColor:"#208bfb", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF", 
        topBar: "rgb(238, 238, 238)", //secondary
        mainMenu: "#edf1f5",  //primary
        primaryView: "rgb(238, 238, 238)", //  secondary
        secondaryView: "#e8eff6", // complementary
        filterMenu: "#edf1f5", //primary color
    },
    'Dark':{
        name:"Dark",
        type:"dark",
        primaryColor:"#0b1622", 
        primaryText:"#edf1f5", 
        secondaryColor:"#151f2e", 
        secondaryText:"#c0c4cc", 
        complementaryColor:"#242F3F", 
        complementaryText:"#3db4f2", 
        complementaryBackgroundText: "rgb(215, 234, 242)",
        cardColor:"rgb(215, 234, 242)",
        componentCardColor:"#FFFFFF",
        componentTextCardColor:"#425A73",
        darkerCardColor:"rgb(179, 204, 213)",
        lighterCardColor:"rgb(235, 245, 250)",
        complementaryCardColor:"#b0c1cc",
        cardText:"#425A73",
        acceptColor:"#208bfb", 
        selectedColor:"#208bfb", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF", 
        topBar: "#151f2e", //secondary
        mainMenu: "#edf1f5",  //primary
        primaryView: "#151f2e", //  secondary
        secondaryView: "#242F3F", // complementary
        filterMenu: "#edf1f5", //primary color
    },
    'High Contrast Light':{
        name:"High Contrast Light",
        type:"light",
        primaryColor:"rgb(245, 245, 245)", 
        primaryText:"#0000000", 
        secondaryColor:"rgb(216, 216, 216)", 
        secondaryText:"#000000", 
        complementaryColor:"rgb(235, 235, 235)", 
        complementaryText:"#000000", 
        complementaryBackgroundText: "rgb(0, 0, 0)",
        cardColor:"rgb(201, 196, 196)",
        componentCardColor:"#FFFFFF",
        componentTextCardColor:"rgb(0, 0, 0)",
        darkerCardColor:"rgb(162, 158, 158)",
        lighterCardColor:"rgb(220, 217, 217)",
        complementaryCardColor:"#e0e0e0",
        cardText:"rgb(0, 0, 0)",
        acceptColor:"#208bfb", 
        selectedColor:"#208bfb", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF", 
        topBar: "rgb(216, 216, 216)", //secondary
        mainMenu: "rgb(245, 245, 245)",  //primary
        primaryView: "rgb(216, 216, 216)", //  secondary
        secondaryView: "rgb(235, 235, 235)", // complementary
        filterMenu: "rgb(245, 245, 245)", //primary color
    },
    'High Contrast Dark':{
        name:"High Contrast Dark",
        type:"dark",
        primaryColor:"rgb(0, 0, 0)", 
        primaryText:"#FFFFFF", 
        secondaryColor:"rgb(40, 40, 40)", 
        secondaryText:"#FFFFFF", 
        complementaryColor:"rgb(70, 70, 70)", 
        complementaryText:"#000000", 
        complementaryBackgroundText: "rgb(255, 255, 255)",
        cardColor:"rgb(255, 255, 255)",
        componentCardColor:"rgb(70, 70, 70)",
        componentTextCardColor:"rgb(255, 255, 255)",
        darkerCardColor:"rgb(230, 230, 230)",
        lighterCardColor:"rgb(255, 255, 255)",
        complementaryCardColor:"#cccccc",
        cardText:"rgb(0, 0, 0)",
        acceptColor:"#208bfb", 
        selectedColor:"#208bfb", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF",
        topBar: "rgb(40, 40, 40)", //secondary
        mainMenu: "#FFFFFF",  //primary
        primaryView: "rgb(40, 40, 40)", //  secondary
        secondaryView: "rgb(70, 70, 70)", // complementary
        filterMenu: "#FFFFFF", //primary color 
    },
    'Cherry Dark':{
        name:"Cherry Dark",
        type:"dark",
        primaryColor:"#1f1a19", 
        primaryText:"#ffacba", 
        secondaryColor:"#322826", 
        secondaryText:"#d6b7bb", 
        complementaryColor:"#504442", 
        complementaryText:"#rgb(255, 227, 227)", 
        complementaryBackgroundText: "rgb(252, 214, 214)",
        cardColor:"rgb(252, 214, 214)",
        componentCardColor:"#FFFFFF",
        componentTextCardColor:"rgb(100, 61, 61)",
        darkerCardColor:"rgb(216, 180, 180)",
        lighterCardColor:"rgb(255, 230, 230)",
        complementaryCardColor:"#e8c8c8",
        cardText:"rgb(100, 61, 61)",
        acceptColor:"rgb(251, 136, 136)", 
        selectedColor:"rgb(251, 136, 136)", 
        acceptText:"#FFFFFF", 
        cancelColor:"#DC3545", 
        cancelText:"#FFFFFF", 
        topBar: "#322826", //secondary
        mainMenu: "#1f1a19",  //primary
        primaryView: "#322826", //  secondary
        secondaryView: "#504442", // complementary
        filterMenu: "#1f1a19", //primary color
    }
}

export function changeTheme(theme) {
    return (dispatch) => {
        if(themes[theme]){
            dispatch({
                type: CHANGE_THEME,
                name:themes[theme].name.trim(),
                themeType:themes[theme].type.trim(),
                primaryColor:themes[theme].primaryColor.trim(),
                primaryText:themes[theme].primaryText.trim(),
                secondaryColor:themes[theme].secondaryColor.trim(),
                secondaryText:themes[theme].secondaryText.trim(),
                complementaryColor:themes[theme].complementaryColor.trim(),
                complementaryText:themes[theme].complementaryText.trim(),
                complementaryBackgroundText:themes[theme].complementaryBackgroundText.trim(),
                cardColor:themes[theme].cardColor.trim(),
                componentCardColor:themes[theme].componentCardColor.trim(),
                componentTextCardColor:themes[theme].componentTextCardColor.trim(),
                darkerCardColor:themes[theme].darkerCardColor.trim(),
                lighterCardColor:themes[theme].lighterCardColor.trim(),
                complementaryCardColor:themes[theme].complementaryCardColor.trim(),
                cardText:themes[theme].cardText.trim(),
                acceptColor:themes[theme].acceptColor.trim(),
                selectedColor:themes[theme].selectedColor.trim(),
                acceptText:themes[theme].acceptText.trim(),
                cancelColor:themes[theme].cancelColor.trim(),
                cancelText:themes[theme].cancelText.trim(),
                topBar:themes[theme].topBar.trim(),
                mainMenu:themes[theme].mainMenu.trim(),
                primaryView:themes[theme].primaryView.trim(),
                secondaryView:themes[theme].secondaryView.trim(),
                filterMenu:themes[theme].filterMenu.trim()
            });
        }
    }
}

export function getThemes() {
    return (dispatch) => {
        return themes;
    }
}

export function loadTheme() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            uniqueStorage.getItem('theme').then(function(theme){
                if(theme){
                    var themeData = JSON.parse(theme);
                    changeTheme(themeData.name)(dispatch);
                }
                resolve();
            });
        })
    }
}

export function wipeData() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            resolve();
        })
    }
}
