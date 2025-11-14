// @flow
import { CHANGE_THEME } from "../actions/themeActions.js"
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

let dataState = {
  name: "I've Work App",
  type: "dark",
  primaryColor: "#161616",
  primaryText: "#FFFFFF",
  secondaryColor: "#323232",
  secondaryText: "#FFFFFF",
  complementaryColor: "#323232",
  complementaryText: "#FFFFFF",
  complementaryBackgroundText: "#FFFFFF",
  cardColor: "#323232",
  componentCardColor: "rgb(38,38,38)",
  componentTextCardColor: "#FFFFFF",
  darkerCardColor: "#323232",
  lighterCardColor: "#0c0c0c",
  complementaryCardColor: "rgb(38,38,38)",
  cardText: "#FFFFFF",
  acceptColor: "#208bfb",
  selectedColor: "#208bfb",
  acceptText: "#FFFFFF",
  cancelColor: "#DC3545",
  cancelText: "#FFFFFF",
  topBar: "rgb(38,38,38)",
  mainMenu: "#0c0c0c",
  primaryView: "rgb(38,38,38)",
  secondaryView: "#0c0c0c",
  filterMenu: "#323232",
};

const themeReducer = (state = dataState, action) => {

  switch (action.type) {

    case CHANGE_THEME:
      var newdata = Object.assign({}, state);
      newdata.name = action.name;
      newdata.type = action.themeType;
      newdata.primaryColor = action.primaryColor;
      newdata.primaryText = action.primaryText;
      newdata.secondaryColor = action.secondaryColor;
      newdata.secondaryText = action.secondaryText;
      newdata.complementaryColor = action.complementaryColor;
      newdata.complementaryText = action.complementaryText;
      newdata.complementaryBackgroundText = action.complementaryBackgroundText;
      newdata.cardColor = action.cardColor;
      newdata.componentCardColor = action.componentCardColor;
      newdata.componentTextCardColor = action.componentTextCardColor;
      newdata.darkerCardColor = action.darkerCardColor;
      newdata.lighterCardColor = action.lighterCardColor;
      newdata.complementaryCardColor = action.complementaryCardColor;
      newdata.cardText = action.cardText;
      newdata.acceptColor = action.acceptColor;
      newdata.selectedColor = action.selectedColor;
      newdata.acceptText = action.acceptText;
      newdata.cancelColor = action.cancelColor;
      newdata.cancelText = action.cancelText;
      newdata.topBar = action.topBar;
      newdata.mainMenu = action.mainMenu;
      newdata.primaryView = action.primaryView;
      newdata.secondaryView = action.secondaryView;
      newdata.filterMenu = action.filterMenu;
      state = Object.assign({}, state, newdata);

      uniqueStorage.setItem('theme', JSON.stringify(state)).then(function () { });

      return state;

    default:
      return state;
  }
};

export default themeReducer;
