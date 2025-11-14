// @flow

import {PLANTS_NEW_DATA_AVAILABLE,PLANTS_DATA_AVAILABLE} from "../actions/fliwerPlantActions.js" //Import the actions types constant we defined in our action

import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

let dataState = { plants: [], categories:[], incompatibilityPlantCategory:[], lastUpdate:0, language:''};

const fliwerPlantReducer = (state = dataState, action) => {
    switch (action.type) {
        case PLANTS_NEW_DATA_AVAILABLE:
            state = Object.assign({}, state, { plants: action.data.plants, incompatibilityPlantCategory: action.data.incompatibilityPlant, categories:action.data.categories, lastUpdate:action.data.lastUpdate, language:action.data.language});
            uniqueStorage.setItem('plantInfo',JSON.stringify(state)).then(function(){
              return state;
            });
        case PLANTS_DATA_AVAILABLE:
        default:
            return state;
    }
};

export default fliwerPlantReducer;
