// @flow
import {SET_CREATE_HOME_NAME,CREATE_HOME_ADDRESS,CREATE_HOME_COORDS,CREATE_HOME_NAME,CREATE_HOME_CLEAN} from "../actions/createHomeActions.js"

let dataState = { name: null,placeID:null,nameCity:null,address:null,countryCity:null,coords:{} };

const createHomeReducer = (state = dataState, action) => {

    switch (action.type) {

      case CREATE_HOME_NAME:
        var newdata=Object.assign({}, state);
        newdata.name=action.name;
        newdata.placeID=action.placeID;
        newdata.countryCity=action.countryCity;
        newdata.nameCity=action.nameCity;
        state = Object.assign({}, state, newdata  );
          console.log("reducer createHome: ",state);
      return state;

      case CREATE_HOME_COORDS:
        var newdata=Object.assign({}, state);
        newdata.coords=Object.assign({},action.coords);
        state = Object.assign({}, state, newdata  );
      return state;

      case CREATE_HOME_ADDRESS:
        var newdata=Object.assign({}, state);
        newdata.address=action.address;
        state = Object.assign({}, state, newdata  );
      return state;


      case CREATE_HOME_CLEAN:
          state = Object.assign({}, state, { name: null,placeID:null,nameCity:null,address:null,countryCity:null,coords:{} });
      return state;

      case SET_CREATE_HOME_NAME:
        var newdata=Object.assign({}, state);
        newdata.name=action.name;
        newdata.placeID=action.placeID;
        newdata.countryCity=action.countryCity;
        newdata.nameCity=action.nameCity;
        state = Object.assign({}, state, newdata  );
          console.log("new statee ",state);
      return state;

      default:
          return state;
    }
};

export default createHomeReducer;
