// @flow

import {ACTIVATE_LANGUAGES_HAS_CHANGE_MANUALLY, SET_COUNTRY, SET_LANGUAGE, NEW_DATA_AVAILABLE, DATA_AVAILABLE, INITIALIZE, SET_COOKIES_POLICY_ACCEPTED} from "../actions/languageActions.js" //Import the actions types constant we defined in our action

import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

let dataState = {translation: {}, translationDefault: {}, languages: {}, lastUpdate: 0, language: "", country: "", languageHasChangeManually: false, initialized: false, cookiesPolicyAccepted: ""};

const languageReducer = (state = dataState, action) => {
    switch (action.type) {
        case NEW_DATA_AVAILABLE:
            //console.log("NEW_DATA_AVAILABLE", action.data);
            state = Object.assign({}, state, {translation: action.data.translation, translationDefault: action.data.translationDefault, lastUpdate: action.data.lastUpdate, language: action.data.language, languages: action.data.languages});
            /*uniqueStorage.setItem('translateInfo', JSON.stringify(state)).then(function () {
                return state;
            });*/
            return state;

        case SET_COUNTRY:
            var newdata = Object.assign({}, state);
            var country = action.country? action.country : "";
            if (country) {
                //console.log("SET_COUNTRY", country);
                newdata = Object.assign({}, {country: country});
            }
            state = Object.assign({}, state, newdata);
            return state;

        case SET_LANGUAGE:
            var newdata = Object.assign({}, state);
            var language = action.language? action.language : "";
            if (language) {
                //console.log("SET_LANGUAGE", language);
                newdata = Object.assign({}, {language: language});                
            }
            state = Object.assign({}, state, newdata);
            return state;

        case SET_COOKIES_POLICY_ACCEPTED:
            var newdata = Object.assign({}, state);
            var accepted = action.value? action.value : "";
            if (accepted) {
                //console.log("SET_COOKIES_POLICY_ACCEPTED", accepted);
                newdata = Object.assign({}, {cookiesPolicyAccepted: accepted});                
            }
            state = Object.assign({}, state, newdata);
            return state;

        case ACTIVATE_LANGUAGES_HAS_CHANGE_MANUALLY:
            var newdata = Object.assign({}, state);
            newdata = Object.assign({}, {languageHasChangeManually: true});
            state = Object.assign({}, state, newdata);
            return state;

        case INITIALIZE:
            var newdata = Object.assign({}, state);
            newdata = Object.assign({}, {initialized: true});
            state = Object.assign({}, state, newdata);
            return state;

        case DATA_AVAILABLE:
        default:
            return state;
    }
};

export default languageReducer;
