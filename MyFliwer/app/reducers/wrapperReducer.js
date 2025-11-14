// @flow
import {SET_PORTALS,SET_FRONTLAYER_PORTALS,SET_CURRENT_APP,SET_PORTRAIT_SCREEN} from "../actions/wrapperActions.js"

let dataState = { 
    portals:3,
    frontLayerPortals:0,
    portraitScreen:1,
    currentApp:null
};

const wrapperReducer = (state = dataState, action) => {

    switch (action.type) {

      case SET_PORTALS:
        var newdata = Object.assign({}, state);
        newdata.portals = action.data;
        state = Object.assign({}, state, newdata);

      return state;

      case SET_FRONTLAYER_PORTALS:
        var newdata = Object.assign({}, state);
        newdata.frontLayerPortals = action.data;
        state = Object.assign({}, state, newdata);

      return state;

      case SET_CURRENT_APP:
        var newdata = Object.assign({}, state);
        newdata.currentApp = action.data;
        state = Object.assign({}, state, newdata);
        

      case SET_PORTRAIT_SCREEN:
        var newdata = Object.assign({}, state);
        newdata.portraitScreen = action.data;
        if(newdata.portraitScreen!=1 && newdata.portraitScreen!=2)newdata.portraitScreen=1;
        state = Object.assign({}, state, newdata);
      return state;

      default:
          return state;
    }
};

export default wrapperReducer;
