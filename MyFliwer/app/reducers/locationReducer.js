// @flow

import {COUNTRY_DATA_AVAILABLE, COUNTRY_NEW_DATA_AVAILABLE} from "../actions/locationActions.js" //Import the actions types constant we defined in our action

import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

let dataState = {countries: {}};

const languageReducer = (state = dataState, action) => {
    switch (action.type) {
        case COUNTRY_NEW_DATA_AVAILABLE:
            state = Object.assign({}, state, {countries: action.data.countries});
            uniqueStorage.setItem('locationInfo', JSON.stringify(state)).then(function () {
                return state;
            });
        case COUNTRY_DATA_AVAILABLE:
        default:
            return state;
    }
};

export default languageReducer;
