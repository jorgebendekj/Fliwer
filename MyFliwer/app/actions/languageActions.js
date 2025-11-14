export const NEW_DATA_AVAILABLE = 'NEW_DATA_AVAILABLE';
export const DATA_AVAILABLE = 'DATA_AVAILABLE';
export const SET_COUNTRY = 'SET_COUNTRY';
export const SET_LANGUAGE = 'SET_LANGUAGE';
export const ACTIVATE_LANGUAGES_HAS_CHANGE_MANUALLY = 'ACTIVATE_LANGUAGES_HAS_CHANGE_MANUALLY';
export const INITIALIZE = 'INITIALIZE';
export const SET_COOKIES_POLICY_ACCEPTED = 'SET_COOKIES_POLICY_ACCEPTED';


//Import the api calls
import { extraService } from '../utils/apiService.js';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
import * as ActionsPlants from '../actions/fliwerPlantActions.js'; //Import your actions
import * as ActionsSession from '../actions/sessionActions.js'; //Import your actions

import moment from 'moment';
import 'moment/min/locales';

import React, { Component } from 'react';
import {Text, Platform} from 'react-native';
import DomSelector from 'react-native-dom-parser';

export function getTranslation(language, data, needCall) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            //console.log("getTranslation", language, data);
            var loadStorage = data ? true : false;
            var items = loadStorage ? data : getState().languageReducer;
            //var needCall = false;
            var lastUpdate = items.lastUpdate;
            var itemsLanguages = items.languages ? Object.keys(items.languages).map(function (key) {
                return items.languages[key];
            }) : [];
            //console.log("itemsLanguages", itemsLanguages);
            //console.log("items.language", items.language);
            //console.log("language", language);
            if (!items.translation || items.language != language) {
                needCall = true;
            }
            extraService.getTranslationLastUpdate(language).then(function (lastUpdateTime) {
                if (lastUpdateTime.lastUpdate > lastUpdate || needCall) {
                    lastUpdate = lastUpdateTime.lastUpdate;
                    needCall = true;
                }

                extraService.getLanguages().then(function (languages) {
                    var langObj = {};
                    for (var i = 0; i < languages.length; ++i) {
                        if (languages[i].enable)
                            langObj[languages[i].name] = languages[i];
                    }

                    if (languages.length != itemsLanguages.length)
                        needCall = true;
                    moment.locale(language);
                    //console.log("needCall", needCall);
                    //console.log("loadStorage", loadStorage);
                    if (needCall) {
                        extraService.getTranslation(language).then(function (translation) {
                            extraService.getTranslation("en", true).then(function (d) {
                                //dispatch({type: NEW_DATA_AVAILABLE, data: {translation: translation, translationDefault: d, lastUpdate: lastUpdate, language: language, languages: langObj}});
                                var translateInfoData = {translation: translation, translationDefault: d, lastUpdate: lastUpdate, language: language, languages: langObj};
                                dispatch({type: NEW_DATA_AVAILABLE, data: translateInfoData});
                                //console.log("translateInfoData", translateInfoData);
                                var stringify = JSON.stringify(translateInfoData);
                                //console.log("stringify", stringify);
                                uniqueStorage.setItem('translateInfo', stringify).then(function () {
                                    console.log("translateInfo");
                                    ActionsPlants.loadStoragePlants()(dispatch, getState);
                                    //ActionsSession.reloadNotificationTypes()(dispatch, getState);
                                    console.log("getTranslation 1");
                                    resolve();
                                });
                            });
                        });
                    } else if (loadStorage) {
                        //dispatch({type: NEW_DATA_AVAILABLE, data: {translation: items.translation, translationDefault: items.translationDefault, lastUpdate: items.lastUpdate, language: items.language, languages: items.languages}});
                        var translateInfoData = {translation: items.translation, translationDefault: items.translationDefault, lastUpdate: items.lastUpdate, language: items.language, languages: items.languages};
                        dispatch({type: NEW_DATA_AVAILABLE, data: translateInfoData});
                        uniqueStorage.setItem('translateInfo', JSON.stringify(translateInfoData)).then(function () {
                            ActionsPlants.loadStoragePlants()(dispatch, getState);
                            //ActionsSession.reloadNotificationTypes()(dispatch, getState);
                            //console.log("getTranslation 2");
                            resolve();
                        });
                    } else
                        dispatch({type: DATA_AVAILABLE, data: {}});
                        //console.log("getTranslation 3");
                        resolve();
                });

            });
        });
    };
}

export function loadStorageTranslation() {
    return (dispatch) => {
        uniqueStorage.getItem('translateInfo').then(function (data) {
            //console.log("loadStorageTranslation data", data)
            if (data)
                data = JSON.parse(data);
            //console.log("loadStorageTranslation data2", data)
            return dispatch(getTranslation(data && Object.keys(data).length > 0 ? data.language : "en", data));
        });
    }
}

export function get(id) {
    return (dispatch, getState) => {
        var items = getState().languageReducer;
        var text = items.translation && items.translation[id] ? items.translation[id] : (items.translationDefault && items.translationDefault[id] ? items.translationDefault[id] : '');
        return text;
    }
}

export function getHTMLToTextNode(html, options, properties) {
    return (dispatch) => {
        try {
            const rootNodeTmp = DomSelector("<html>" + html + "</html>");
            return HTMLToTextNode(rootNodeTmp, options, properties);
        } catch (e) {
            console.log("getHTMLToTextNode error", e);
            return html;
        }
    };
};

function HTMLToTextNode(html, options, properties) {
    /*
     properties: bold:true,italic:true
     */
    if (!properties)
        properties = {bold: false, italic: false};
    var array = [];
    var style = {};
    if (properties.bold)
        style.fontWeight = "bold";
    if (properties.italic)
        style.fontStyle = "italic";
    for (var i = 0; i < html.children.length; i++) {
        if (!html.children[i].tagName) {
            array.push(<Text style={style}>{html.children[i].text}</Text>);
        } else if (html.children[i].tagName == "b") {
            array = array.concat(HTMLToTextNode(html.children[i], options, {bold: true, italic: properties.italic}));
        } else if (html.children[i].tagName == "i") {
            array = array.concat(HTMLToTextNode(html.children[i], options, {bold: properties.italic, italic: true}));
        }
    }
    return array;
}

export function getComponent(id, options) {
    /*
     options:{
     boldColor:"#color"
     }
     */
    return (dispatch, getState) => {
        if (!options)
            options = {};
        var items = getState().languageReducer;
        var text = items.translation && items.translation[id] ? items.translation[id] : (items.translationDefault && items.translationDefault[id] ? items.translationDefault[id] : '');
        if (text.search("<") != -1 && text.search(">") != -1) {
            const rootNode = DomSelector("<html>" + text + "</html>");
            var array = HTMLToTextNode(rootNode, options);
            return array;
        } else
            return text;
    }
}

export function setCountry(country) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_COUNTRY, country: country});
            uniqueStorage.setItem('country', JSON.stringify({value: country})).then(function () {
                resolve();
            }, reject);
        });
    };
}

export function setLanguage(language) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_LANGUAGE, language: language});
            uniqueStorage.setItem('language', JSON.stringify({value: language})).then(function () {
                resolve();
            }, reject);
        });
    };
}

export function activateLanguageHasChangeManually() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: ACTIVATE_LANGUAGES_HAS_CHANGE_MANUALLY, data: {}});
        });
    }
}

export function initialize() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIALIZE, data: {}});
        });
    }
}

export function setCookiesPolicyAccepted(accepted) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_COOKIES_POLICY_ACCEPTED, value: accepted});
            uniqueStorage.setItem('cookiesPolicyAccepted', JSON.stringify({value: accepted})).then(function () {
                resolve();
            }, reject);
        });
    };
}
