// @flow

import {REMOVE_MAP_COORDS,MODIFY_GARDEN,GARDEN_ADD_ENTRY,GARDEN_SET_LOADING,GARDEN_FINISH_LOADING,GARDEN_SET_STORAGE_INFO,GARDEN_WIPE_STORAGE_INFO, DELETE_GARDEN} from "../actions/fliwerGardenActions.js" //Import the actions types constant we defined in our action

//import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
let dataState = { data: {}, loading:false};

const fliwerGardenReducer = (state = dataState, action) => {
    switch (action.type) {
        case GARDEN_SET_LOADING:
          state = Object.assign({}, state, { loading: true});
          return state;

        case MODIFY_GARDEN:
          var newdata=Object.assign({}, state);
          if(!newdata.data[action.data.idGarden]) newdata.data[action.data.idGarden]={};

          newdata.data[action.data.idGarden]=Object.assign({},newdata.data[action.data.idGarden],action.data.gardenInformation);
          state = Object.assign({}, state, newdata );
            /*
          uniqueStorage.setItem('gardenInfo',JSON.stringify(state)).then(function(){
            return state;
          });
          */
          return state;

        case GARDEN_FINISH_LOADING:
          state = Object.assign({}, state, { loading: false});
          return state;
        case GARDEN_ADD_ENTRY:
          state = Object.assign({}, state, { loading: false, data: Object.assign({}, state.data,action.data) });
          /*
          uniqueStorage.setItem('gardenInfo',JSON.stringify(state)).then(function(){
            return state;
          });
          */
          return state;
        case GARDEN_SET_STORAGE_INFO:
          state = Object.assign({}, state, action.data);
          return state;
        case REMOVE_MAP_COORDS:
          var newdata=Object.assign({}, state);
          if(!newdata.data[action.data.idGarden]) newdata.data[action.data.idGarden]={};
          var d={latitude:null,longitude:null,zoom:null};
          newdata.data[action.data.idGarden]=Object.assign({},newdata.data[action.data.idGarden],d);
          state = Object.assign({}, state, newdata );
          return state;
        case GARDEN_WIPE_STORAGE_INFO:
          state = Object.assign({}, state, {data:{}, loading:true});
          /*
          uniqueStorage.setItem('gardenInfo',JSON.stringify(state)).then(function(){
            return state;
          });
          */
          return state;
            
        case DELETE_GARDEN:
            var newdata = Object.assign({}, state);
            if (newdata.data[action.data.idGarden])
                delete newdata.data[action.data.idGarden];
            state = Object.assign({}, state, newdata);
        
            return state;
            
        default:
          return state;
    }
};

export default fliwerGardenReducer;
