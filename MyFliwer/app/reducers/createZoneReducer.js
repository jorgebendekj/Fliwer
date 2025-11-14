// @flow
import {CREATE_ZONE_NEW,CREATE_ZONE_ADDPLANT,CREATE_ZONE_DELETEPLANT,LOAD_ZONE_PLANTS,CREATE_ZONE_FINISH,CREATE_ZONE_ADDPHOTO,CREATE_ZONE_DELETEPHOTO,CREATE_ZONE_ADDCONFIG,CREATE_ZONE_DELETECONFIG,CREATE_ZONE_ADDHOME} from "../actions/createZoneActions.js" //Import the actions types constant we defined in our action

let dataState = { plants:{}, photo:null, idHome:null,name:null,extension:null,outdoor:null,light:null,hoursAllowed:null,zonePlantsLoaded:false, creating:false};

const createZoneReducer = (state = dataState, action) => {
    switch (action.type) {
        case CREATE_ZONE_NEW:
          state = Object.assign({}, state, { creating: true, plants:{}, photo:null, idHome:null,name:null,extension:null,outdoor:null,light:null,hoursAllowed:null,zonePlantsLoaded:false});
          return state;
        case CREATE_ZONE_ADDPLANT:
          state = Object.assign({}, state, { plants:Object.assign({}, state.plants,action.data.plants)});
          return state;
        case CREATE_ZONE_DELETEPLANT:
          var plants=state.plants;
          delete plants[action.data.idPlant];
          state = Object.assign({}, state, { plants:plants});
          return state;
        case LOAD_ZONE_PLANTS:
          state = Object.assign({}, state, { zonePlantsLoaded:true});
          return state;
        case CREATE_ZONE_ADDPHOTO:
          state = Object.assign({}, state, { photo:action.data.photo});
          return state;
        case CREATE_ZONE_DELETEPHOTO:
          state = Object.assign({}, state, { photo:null});
          return state;
        case CREATE_ZONE_ADDCONFIG:
          state = Object.assign({}, state, {idHome:action.data.idHome,name:action.data.name,extension:action.data.extension,outdoor:action.data.outdoor,light:action.data.light,hoursAllowed:action.data.hoursAllowed,map:action.data.map});
          return state;
        case CREATE_ZONE_DELETECONFIG:
          state = Object.assign({}, state, {idHome:null,name:null,extension:null,outdoor:null,light:null,hoursAllowed:null});
          return state;
        case CREATE_ZONE_ADDHOME:
          state = Object.assign({}, state, {idHome:action.data.idHome});
          return state;
        case CREATE_ZONE_FINISH:
          state = Object.assign({}, state, {creating: false, plants:{}, photo:null, idHome:null,name:null,extension:null,outdoor:null,light:null,hoursAllowed:null,zonePlantsLoaded:false});
          return state;
        default:
          return state;
    }
};

export default createZoneReducer;
