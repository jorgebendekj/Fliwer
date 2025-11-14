// @flow
import structuredClone from "@ungap/structured-clone";

import {HOME_ADD_ENTRY,HOME_SET_LOADING,HOME_SET_STORAGE_INFO,HOME_WIPE_STORAGE_INFO,HOME_ADD_GARDEN} from "../actions/fliwerHomeActions.js" //Import the actions types constant we defined in our action

import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
let dataState = { data: {}, loading:false};

const fliwerHomeReducer = (state = dataState, action) => {
    switch (action.type) {
        case HOME_SET_LOADING:
          state = Object.assign({}, state, { loading: true});
          return state;
        case HOME_ADD_ENTRY:
          state = Object.assign({}, state, { loading: false, data: Object.assign({}, state.data,action.data) });
          /*
          uniqueStorage.setItem('homeInfo',JSON.stringify(state)).then(function(){
            return state;
          });
          */
          return state;
        case HOME_SET_STORAGE_INFO:
          state = Object.assign({}, state, action.data);
          return state;
        case HOME_WIPE_STORAGE_INFO:
          state = Object.assign({}, state, {data:{}, loading:true});
          /*
          uniqueStorage.setItem('homeInfo',JSON.stringify(state)).then(function(){
            return state;
          });
          */
          return state;
        
        case HOME_ADD_GARDEN:
          //
          var newdata = structuredClone(state);

          debugger;
          if(newdata.data[action.data.idHome]){
            if(!newdata.data[action.data.idHome].gardens)newdata.data[action.data.idHome].gardens=[];
            if(newdata.data[action.data.idHome].gardens.indexOf(action.data.id)==-1) //if garden is already defined and not exist
              newdata.data[action.data.idHome].gardens.push(action.data.id);
          }
          

          return newdata;
        default:
          return state;
    }
};

export default fliwerHomeReducer;
