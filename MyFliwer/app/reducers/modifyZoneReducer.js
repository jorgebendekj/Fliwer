// @flow
import {REMOVE_MAP,ADD_MAP,ADD_NEW_HOME,ADD_CURRENT_ZONE_MODIFICATIONS,MODIFY_ZONE_NEW,MODIFY_ZONE_FINISH} from "../actions/modifyZoneActions.js" //Import the actions types constant we defined in our action

let dataState = { data:{}};

const modifyZoneReducer = (state = dataState, action) => {
    switch (action.type) {
        case MODIFY_ZONE_NEW:
          state = Object.assign({}, state, { idHome:null,name:null,extension:null,outdoor:null,light:null,hoursAllowed:null,picture:null, modifying:true,isMap:false});
          return state;
        case MODIFY_ZONE_FINISH:
          state = Object.assign({}, state, { idHome:null,name:null,extension:null,outdoor:null,light:null,hoursAllowed:null,picture:null, modifying:false,isMap:false});
          return state;
        case ADD_CURRENT_ZONE_MODIFICATIONS:
          var d={ idZone:action.data.idZone,idHome:action.data.idHome,name:action.data.name,extension:action.data.extension,outdoor:action.data.outdoor,
            light:action.data.light,irrigationEnabled:action.data.irrigationEnabled,hoursAllowed:action.data.hoursAllowed,picture:action.data.picture,modifying:true};
          state = Object.assign({}, state, d);
        return state;
        case ADD_MAP:
          var d={idZone:action.data.idZone,lat:action.data.lat,long:action.data.long,zoom:action.data.zoom};
          state = Object.assign({}, state, d);
          return state;
        case REMOVE_MAP:
          var d={idZone:action.data.idZone,lat:null,long:null,zoom:null};
          state = Object.assign({}, state, d);
          return state;
        case ADD_NEW_HOME:
          state = Object.assign({}, state, { idHome:action.data.idHome});
          return state;
        default:
          return state;
    }
};

export default modifyZoneReducer;
