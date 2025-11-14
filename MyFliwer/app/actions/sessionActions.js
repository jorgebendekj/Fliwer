export const LOGIN_OK = 'LOGIN_OK';
export const LOGIN_KO = 'LOGIN_KO';
export const RELOGIN_DATA = 'RELOGIN_DATA';
export const INIT_PRELOADING_DATA = 'INIT_PRELOADING_DATA';
export const FINISH_PRELOADING_DATA = 'FINISH_PRELOADING_DATA';
export const PRELOADED_UNTIL_ZONES = 'PRELOADED_UNTIL_ZONES';
export const LOADED_STORAGE_DATA = 'LOADED_STORAGE_DATA';
export const WIPED_STORAGE_DATA = 'WIPED_STORAGE_DATA'
export const LOCK_LANDSCAPE = 'LOCK_LANDSCAPE';
export const UNLOCK_LANDSCAPE = 'UNLOCK_LANDSCAPE';
export const DEFAULT_LOCK_PORTRAIT = 'DEFAULT_LOCK_PORTRAIT';
export const DEVICE_TOKEN = 'DEVICE_TOKEN';
export const RELOAD_NOTIFICATION = 'RELOAD_NOTIFICATION';
export const NOT_PRELOADED = 'NOT_PRELOADED';
export const ADD_USER_ID_GARDENER = 'ADD_USER_ID_GARDENER';
export const CLEAN_GARDENER = 'CLEAN_GARDENER';
export const ADD_USER_ID_VISITOR = 'ADD_USER_ID_VISITOR';
export const CLEAN_VISITOR = 'CLEAN_VISITOR';
export const CANCEL_PHONE_VERIFICATION = 'CANCEL_PHONE_VERIFICATION';
export const SET_PETITION = 'SET_PETITION';
export const SET_FLIWER_CONFIG_IS_INSIDE_APP = 'SET_FLIWER_CONFIG_IS_INSIDE_APP';
export const VERSION = 'VERSION';
export const CHECKED_VERSION = 'CHECKED_VERSION';
export const SET_LAST_CHECKED_VERSION_TIME = 'SET_LAST_CHECKED_VERSION_TIME';
export const GET_REALTIME_PROGRAMS = 'GET_REALTIME_PROGRAMS';
export const REALTIME_PROGRAM_DELETE = 'REALTIME_PROGRAM_DELETE';
export const REALTIME_PROGRAM_ADD_PROGRAM = 'REALTIME_PROGRAM_ADD_PROGRAM';
export const REFRESH_GENERALALERTS = 'REFRESH_GENERALALERTS';
export const REFRESH_EMPLOYEES = 'REFRESH_EMPLOYEES';
export const REMOVE_EMPLOYEE = 'REMOVE_EMPLOYEE';
export const ADD_EMPLOYEE = 'ADD_EMPLOYEE';
export const UPDATE_EMPLOYEE= 'UPDATE_EMPLOYEE';
export const REFRESH_ACESSLOGS = 'REFRESH_ACESSLOGS';
export const GETTING_GLOBAL_DATA = 'GETTING_GLOBAL_DATA';
export const GET_GLOBAL_DATA = 'GET_GLOBAL_DATA';
export const GET_WALLET ='GET_WALLET';
export const GET_APPS = 'GET_APPS';
export const UPDATE_APP = 'UPDATE_APP';

//Import the api calls
import firebase from '../utils/firebase/firebase';
import Keychain from '../utils/keychain/keychain';

import { userService, extraService } from '../utils/apiService.js';
import { Orientation } from '../utils/orientation/orientation'
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

import * as ActionsHome from '../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsDevice from '../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionsGardener from '../actions/gardenerActions.js'; //Import your actions
import * as ActionsVisitor from '../actions/visitorActions.js'; //Import your actions
import * as ActionsAcademy from '../actions/academyActions.js'; //Import your actions
import * as ActionsInvoice from '../actions/invoiceActions.js'; //Import your actions
import * as ActionsPoly from '../actions/polyActions.js';
import * as ActionsBackgroundUploading from '../actions/backgroundUploadActions.js';

import { toast } from '../widgets/toast/toast'
import { Platform } from 'react-native';
import { setOfflineUserData } from '../reducers/offlineAccessSlice.js';
import { setUserOfflineData } from '../reducers/userOfflineSlice.js';

export function getStorageData(dispatch, getState) {
    return new Promise(function (resolve, reject) {

        //ActionsHome.getHomeStorage()(dispatch,getState).then(function(){
        //ActionsGarden.getGardenStorage()(dispatch,getState).then(function(){
        //ActionsZone.getZoneStorage()(dispatch,getState).then(function(){
        //ActionsDevice.getDeviceStorage()(dispatch,getState).then(function(){
        dispatch({ type: LOADED_STORAGE_DATA });
        resolve();
        //},resolve)
        //},resolve)
        //},resolve);
        //},resolve);
    });
}

export function reloadData(dispatch, getState) {

    dispatch({ type: WIPED_STORAGE_DATA });
    ActionsHome.wipeData()(dispatch).then(function () {
        ActionsGarden.wipeData()(dispatch).then(function () {
            ActionsZone.wipeData()(dispatch).then(function () {
                ActionsDevice.wipeData()(dispatch).then(function () {
                    //ActionsGardener.wipeData()(dispatch).then(function () {
                    ActionsVisitor.wipeData()(dispatch).then(function () {
                        getWallet({startDataTime:Math.ceil(Date.now()/1000),endDataTime:Math.ceil(Date.now()/1000)})(dispatch,getState).finally(function(){
                            preloadData(dispatch, getState);
                        });
                    });
                    //});
                });
            });
        });
    });
}

export function wipeData(dispatch, getState) {
    ActionsHome.wipeData()(dispatch).then(function () {
        ActionsGarden.wipeData()(dispatch).then(function () {
            ActionsZone.wipeData()(dispatch).then(function () {
                //ActionsGardener.wipeData()(dispatch).then(function () {
                ActionsVisitor.wipeData()(dispatch).then(function () {
                    //ActionsDevice.wipeData()(dispatch).then(function () {
                        ActionsInvoice.wipeData()(dispatch).then(function () {
                            ActionsAcademy.wipeData()(dispatch);
                        });
                    //});
                });
                //});
            });
        });
    });
}

export function preloadData(dispatch, getState) {

    var homeListOptions = {
        genericInfo: 1, meteo: 1, garden: 1, zone: 1, moreInfo: 0, devices: 0,
        //        alerts: 0, advices: 0, plants: 0,
        hoursAllowed: 1, firstIrrigation: 1, alerts: 1, advices: 1, plants: 1
    };
    var requests = [
        { url: '/user/homeList', params: JSON.stringify(homeListOptions) },
        { url: '/devices', params: JSON.stringify({}) },
        { url: '/user/generalAlerts', params: JSON.stringify({ notSignedContracts: 1 }) }
        /*
        {url: '/store/contracts', params: JSON.stringify({type: 'not-signed'})},
        {url: '/store/getAngelContracts', params: JSON.stringify({type: 'not-signed'})}
        */
    ];

    if (!getGardenerCheckUserID()(dispatch, getState) && getState().sessionReducer.roles && (getState().sessionReducer.roles.manager || getState().sessionReducer.roles.fliwer || getState().sessionReducer.roles.angel))
        requests.push({ url: '/business/employees', params: JSON.stringify({}) });

    ActionsPoly.polyRequest(requests)(dispatch, getState).then((response) => {
        var homeData = Array.isArray(response[0]) ? response[0] : null;
        var devicesData = Array.isArray(response[1]) ? response[1] : null;
        var generalAlerts = typeof response[2] === 'object' ? response[2] : null;
        var employeesData = Array.isArray(response[3]) ? response[3] : null;
        if (generalAlerts.ok) delete generalAlerts.ok;


        /*
        var notSignedContractsData = Array.isArray(response[2])? response[2] : null;
        var notSignedAngelContractsData = Array.isArray(response[3])? response[3] : null;
        */

        // Get gardens
        var gardensData = [];
        for (let i = 0; i < homeData.length; i++) {
            gardensData = gardensData.concat(homeData[i].gardens);
        }

        
        dispatch({ type: INIT_PRELOADING_DATA, data: {} });
        ActionsHome.getHomeList(homeListOptions, homeData)(dispatch).then(function (test) {
            ActionsGarden.getGardenList(homeData)(dispatch, getState).then(function (test) {
                dispatch({ type: PRELOADED_UNTIL_ZONES, data: {} });
                ActionsZone.getZoneList(gardensData)(dispatch, getState).then(function () {
                    ActionsDevice.getDeviceList(devicesData)(dispatch, getState).then(function () {
                        
                        getWallet({startDataTime:Math.ceil(Date.now()/1000),endDataTime:Math.ceil(Date.now()/1000)})(dispatch,getState).finally(function(){
                            dispatch({ type: REFRESH_GENERALALERTS, data: generalAlerts });
                            if(!getGardenerCheckUserID()(dispatch, getState))
                                dispatch({ type: REFRESH_EMPLOYEES, data: employeesData })
                            dispatch({ type: FINISH_PRELOADING_DATA, data: {} });
                        });
                        /*
                        ActionsInvoice.getNotSignedContracts(notSignedContractsData)(dispatch, getState).then(function () {
                            ActionsInvoice.getNotSignedAngelContracts(notSignedAngelContractsData)(dispatch, getState).then(function () {
                                dispatch({type: FINISH_PRELOADING_DATA, data: {}});
                            });
                        });
                        */
                    });
                });
            });
        });

    });


}

export function wrongData() {
    return (dispatch, getState) => {
        dispatch({ type: NOT_PRELOADED, data: {} });
        reloadData(dispatch, getState);
    };
}

export function wrongData2(force) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: NOT_PRELOADED, data: {} });
            if(force){
                ActionsInvoice.wipeData()(dispatch).then(function () {
                    ActionsAcademy.wipeData()(dispatch).then(function () {
                        reloadData(dispatch, getState);
                        resolve();
                    });
                });
            }else{
                preloadData(dispatch, getState);
                resolve();
            }
        });
    };
}

export function loginOffline() {
  return (dispatch, getState) => {
    const { userId, userName, allowedModules } = getState().offlineAccess;

    const hasAccess =
      userId &&
      Array.isArray(allowedModules) &&
      (allowedModules.includes('products') || allowedModules.includes('newOrder'));

    if (hasAccess) {
      const fakeData = {
        id: userId,
        first_name: userName,
        email: '',
        reloginEmail: '',
        gardener: false,
        user_id: userId,
      };

      const fakeRoles = {
        visitor: false
      };

      dispatch({
        type: LOGIN_OK,
        data: fakeData,
        roles: fakeRoles,
        dataLogin: {},
        notificationData: [],
        offline: true
      });

      return Promise.resolve();
    }

    return Promise.reject('No offline access allowed');
  };
}


export function login(email, password, lang, petition, hash) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var originalLoginEmail = email;
            var loginParams = userService.getLoginRequestBodyObject(email, password, lang, petition, hash);
            ActionsPoly.polyRequest([
                { url: '/login', params: loginParams },
                { url: '/getVersion', params: { platformOS: Platform.OS } }
            ], false, "polyRequestLogin")(dispatch, getState).then((polyResponse1) => {
                //console.log("polyRequest polyResponse1", polyResponse1);
                var dataLogin = polyResponse1[0];
                var versionObject = polyResponse1[1];
                dispatch({ type: VERSION, versionCode: versionObject.versionCode, versionName: versionObject.versionName, forceUpdateApp: versionObject.forceUpdateApp });

                if (dataLogin && (dataLogin.ok || dataLogin.id == 5)) {
                    ActionsPoly.polyRequest([
                        { url: '/user/profile', params: {} },
                        { url: '/user/notificationTypes', params: {} }
                    ])(dispatch, getState).then((polyResponse2) => {
                        //console.log("polyRequest polyResponse2", polyResponse2);
                        var data = polyResponse2[0];
                        var notificationData = Array.isArray(polyResponse2[1]) ? polyResponse2[1] : null;

                        if (data && data.photo_url)
                            data.photo_url += "?v=" + Date.now();
                        
                        if (dataLogin.ok) {
                            if (data && (data.ok == undefined || data.ok == true)) {
                                if (!notificationData) {
                                    reject(data);
                                }
                                else {
                                    data.reloginEmail=originalLoginEmail;
                                    dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                                    dispatch(setUserOfflineData(data/*{
                                        ...data,
                                        customProductFields: [
                                                {
                                                    id: 1,
                                                    name: "nom_botanic",
                                                    label: "NOM BOTANIC",
                                                    type: "string"
                                                },
                                                {
                                                    id: 2,
                                                    name: "cont",
                                                    label: "CONT",
                                                    type: "string"
                                                },
                                                {
                                                    id: 3,
                                                    name: "mesura_marcada",
                                                    label: "MESURA MARCADA",
                                                    type: "string"
                                                },
                                                {
                                                    id: 4,
                                                    name: "mesura_prevista",
                                                    label: "MESURA PREVISTA",
                                                    type: "string"
                                                },
                                                {
                                                    id: 5,
                                                    name: "cost",
                                                    label: "COST",
                                                    type: "number"
                                                },
                                                {
                                                    id: 6,
                                                    name: "minim",
                                                    label: "MINIM",
                                                    type: "number"
                                                },
                                                {
                                                    id: 7,
                                                    name: "p1",
                                                    label: "P1",
                                                    type: "price"
                                                },
                                                {
                                                    id: 8,
                                                    name: "p2",
                                                    label: "P2",
                                                    type: "price"
                                                },
                                                {
                                                    id: 9,
                                                    name: "p3",
                                                    label: "P3",
                                                    type: "price"
                                                },
                                                {
                                                    id: 10,
                                                    name: "prof",
                                                    label: "PROF",
                                                    type: "price"
                                                }
                                            ]
                                    }*/));
                                    getApps()(dispatch, getState);

                                    ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                                    
                                    var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginEmail:originalLoginEmail, relogin: false });
                                    //console.log("stringify", stringify);

                                    uniqueStorage.setItem('reloginData', stringify).then(function () {

                                        Keychain.setGenericPassword(email, password).catch((err) => {
                                            console.log("Keychain error:", err);
                                        }).finally(() => {
                                            registerDeviceToken()(dispatch, getState);
                                            if (data.email) {
                                                firebase.crashlytics().setUserId(data.email);
                                                firebase.crashlytics().setAttribute("email", data.email);
                                            }
                                            reloadData(dispatch, getState);
                                            resolve();
                                        });
                                    });
                                }
                            }
                            else {
                                toast.error(data.reason);
                                dispatch({ type: LOGIN_KO, data: data });
                                reject(data);
                            }
                        }
                        else {
                            if (dataLogin.id == 5) {
                                if (data && (data.ok == undefined || data.ok == true)) {
                                    if (!notificationData) {
                                        reject(data);
                                    }
                                    else {
                                        data.reloginEmail = originalLoginEmail;
                                        dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                                        dispatch(setUserOfflineData(data/*{
                                            ...data,
                                            customProductFields: [
                                                {
                                                    id: 1,
                                                    name: "nom_botanic",
                                                    label: "NOM BOTANIC",
                                                    type: "string"
                                                },
                                                {
                                                    id: 2,
                                                    name: "cont",
                                                    label: "CONT",
                                                    type: "string"
                                                },
                                                {
                                                    id: 3,
                                                    name: "mesura_marcada",
                                                    label: "MESURA MARCADA",
                                                    type: "string"
                                                },
                                                {
                                                    id: 4,
                                                    name: "mesura_prevista",
                                                    label: "MESURA PREVISTA",
                                                    type: "string"
                                                },
                                                {
                                                    id: 5,
                                                    name: "cost",
                                                    label: "COST",
                                                    type: "number"
                                                },
                                                {
                                                    id: 6,
                                                    name: "minim",
                                                    label: "MINIM",
                                                    type: "number"
                                                },
                                                {
                                                    id: 7,
                                                    name: "p1",
                                                    label: "P1",
                                                    type: "price"
                                                },
                                                {
                                                    id: 8,
                                                    name: "p2",
                                                    label: "P2",
                                                    type: "price"
                                                },
                                                {
                                                    id: 9,
                                                    name: "p3",
                                                    label: "P3",
                                                    type: "price"
                                                },
                                                {
                                                    id: 10,
                                                    name: "prof",
                                                    label: "PROF",
                                                    type: "price"
                                                }
                                            ]
                                        }*/));                                       
                                        getApps()(dispatch, getState);

                                        ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);

                                        var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginData:originalLoginEmail, relogin: false });
                                        //console.log("stringify", stringify);
                                        uniqueStorage.setItem('reloginData', stringify).then(function () {

                                            Keychain.setGenericPassword(email, password).catch((err) => {
                                                console.log("Keychain error:", err);
                                            }).finally(() => {
                                                registerDeviceToken()(dispatch, getState);
                                                if (data.email) {
                                                    firebase.crashlytics().setUserId(data.email);
                                                    firebase.crashlytics().setAttribute("email", data.email);
                                                }
                                                //reloadData(dispatch, getState);
                                                preloadData(dispatch, getState);
                                                resolve();
                                            });
                                        });

                                    }
                                }
                                else {
                                    toast.error(data.reason);
                                    dispatch({ type: LOGIN_KO, data: data });
                                    reject(data);
                                }
                            }
                        }
                    });
                }
                else {
                    if (email == "" && password == "") {

                        if (Platform.OS != "web" && (!getState().sessionReducer.reloginData || !getState().sessionReducer.reloginData.relogin)) {
                            Keychain.getGenericPassword().then((credentials) => {
                                if (credentials && credentials.username) {
                                    console.log('Credentials successfully loaded for user ' + credentials.username);

                                    login(credentials.username, credentials.password)(dispatch, getState).then(() => {
                                    }, (error) => {
                                        dispatch({ type: LOGIN_KO, data: {} });
                                        reject();
                                    });
                                } else {
                                    console.log('No credentials stored');
                                    dispatch({ type: LOGIN_KO, data: {} });
                                    reject();
                                }
                            }, (err) => {
                                console.log("keychain error:", err)
                                dispatch({ type: LOGIN_KO, data: {} });
                                reject();
                            })

                        } else {
                            dispatch({ type: LOGIN_KO, data: {} });
                            reject();
                        }
                    } else {
                        if (dataLogin) toast.error(dataLogin.reason);
                        dispatch({ type: LOGIN_KO, data: dataLogin });
                        reject();
                    }
                }

            });
        });
    };
}

export function register(email, password, name, surname, country, lang, petition, hash) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.registerRequest(email, password, name, surname, country, lang, petition, hash).then(function () {
                login(email, password, lang, petition, hash)(dispatch, getState);
            }, function (data) {
                reject(data)
            });
        })
    };
}

export function reloadNotificationTypes() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.getNotificationTypes().then(function (notificationData) {
                dispatch({ type: RELOAD_NOTIFICATION, notificationData: notificationData });
                resolve()
            }, function (data) {
                reject(data);
            });
        });
    }
}

export function updateProfile(profile, alertConfiguration) {
    /*
     profile:
     email
     first_name
     last_name
     phone
     sex
     born
     photo_url
     gardener
     iban
     address
     cif
     city
     zipCode
     country
     billingEmail
     receiveInvoicesByEmail
     receiveQuotationsByEmail
     receiveTicketsByEmail
     receiveAuditsByEmail
     */
    console.log("PROFILE sending...", profile);
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.updateProfile(profile).then(function (resp) {
                console.log("resp ", resp);
                userService.modifyNotificationTypes(alertConfiguration).then(function () {
                    userService.getSession().then(function (data) {
                        userService.getNotificationTypes().then(function (notificationData) {
                            dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData });
                            getApps()(dispatch, getState);
                            if (data.email) {
                                firebase.crashlytics().setUserId(data.email);
                                firebase.crashlytics().setAttribute("email", data.email);
                            }
                            reloadData(dispatch, getState);
                            resolve(data);
                        }, function (data) {
                            reject(data)
                        });
                    }, function (data) {
                        toast.error(data.reason);
                        dispatch({ type: LOGIN_KO, data: data });
                        reject(data);
                    });
                }, function (data) {
                    reject(data)
                });
            }, function (data) {
                reject(data)
            });

        })
    }
}

export function updateProfileWithoutNotifications(profile) {
    /*
     profile:
     email
     first_name
     last_name
     phone
     sex
     born
     photo_url
     */
    console.log("PROFILE sending...", profile);
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.updateProfile(profile).then(function (resp) {
                console.log("resp ", resp);
                resolve(resp);
            }, function (data) {
                reject(data)
            });

        })
    }
}

export function loginFacebook(token, country, lang, petition, hash) {
    return (dispatch, getState) => {

        userService.loginFacebookRequest(token, country, lang, petition, hash).then(function (dataLogin) {
            userService.getSession().then(function (data) {
                userService.getNotificationTypes().then(function (notificationData) {
                    data.reloginEmail = "Facebook,"+data.email;
                    dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                    getApps()(dispatch, getState);
                    ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                    registerDeviceToken()(dispatch, getState);
                    if (data.email) {
                        firebase.crashlytics().setUserId(data.email);
                        firebase.crashlytics().setAttribute("email", data.email);
                    }
                    reloadData(dispatch, getState);
                }, function (data) {
                    reject(data)
                });
            }, function (data) {
                dispatch({ type: LOGIN_KO, data: data });
            });
        }, function (dataLogin) {
            if (dataLogin.id == 5) {
                userService.getSession().then(function (data) {
                    userService.getNotificationTypes().then(function (notificationData) {
                        data.reloginEmail = "Facebook,"+data.email;
                        dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                        getApps()(dispatch, getState);
                        ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                        registerDeviceToken()(dispatch, getState);
                        
                        
                        if (data.email) {

                            var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginEmail:"Facebook,"+data.email, relogin: false });

                            uniqueStorage.setItem('reloginData', stringify).then(function () {

                                Keychain.setGenericPassword("Facebook,"+data.email, token).catch((err) => {
                                    console.log("Keychain error:", err);
                                }).finally(() => {
                                    registerDeviceToken()(dispatch, getState);
                                        firebase.crashlytics().setUserId(data.email);
                                        firebase.crashlytics().setAttribute("email", data.email);
                                    //reloadData(dispatch, getState);
                                    preloadData(dispatch, getState);
                                    resolve();
                                });
                            });
                        } else preloadData(dispatch, getState); //else reloadData(dispatch, getState);
                    }, function (data) {
                        reject(data)
                    });
                }, function (data) {
                    dispatch({ type: LOGIN_KO, data: data });
                });
            } else {
                dispatch({ type: LOGIN_KO, data: dataLogin });
            }
        });
    };
}

export function loginGoogle(token, country, lang, petition, hash) {
    return (dispatch, getState) => {
        userService.loginGoogleRequest(token, country, lang, petition, hash).then(function (dataLogin) {
            userService.getSession().then(function (data) {
                userService.getNotificationTypes().then(function (notificationData) {
                    data.reloginEmail = "Google,"+data.email;
                    dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                    getApps()(dispatch, getState);
                    ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                    registerDeviceToken()(dispatch, getState);

                    if (data.email) {

                        var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginEmail:"Google,"+data.email, relogin: false });

                        uniqueStorage.setItem('reloginData', stringify).then(function () {

                            Keychain.setGenericPassword("Google,"+data.email, token).catch((err) => {
                                console.log("Keychain error:", err);
                            }).finally(() => {
                                registerDeviceToken()(dispatch, getState);
                                    firebase.crashlytics().setUserId(data.email);
                                    firebase.crashlytics().setAttribute("email", data.email);
                                reloadData(dispatch, getState);
                                resolve();
                            });
                        });
                    } else  reloadData(dispatch, getState);
                }, function (data) {
                    reject(data)
                });
            }, function (data) {
                dispatch({ type: LOGIN_KO, data: data });
            });
        }, function (dataLogin) {
            if (dataLogin.id == 5) {
                userService.getSession().then(function (data) {
                    userService.getNotificationTypes().then(function (notificationData) {
                        data.reloginEmail = "Google,"+data.email;
                        dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                        getApps()(dispatch, getState);
                        ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                        registerDeviceToken()(dispatch, getState);

                        if (data.email) {

                            var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginEmail:"Google,"+data.email, relogin: false });
    
                            uniqueStorage.setItem('reloginData', stringify).then(function () {
    
                                Keychain.setGenericPassword("Google,"+data.email, token).catch((err) => {
                                    console.log("Keychain error:", err);
                                }).finally(() => {
                                    registerDeviceToken()(dispatch, getState);
                                        firebase.crashlytics().setUserId(data.email);
                                        firebase.crashlytics().setAttribute("email", data.email);
                                    //reloadData(dispatch, getState);
                                    preloadData(dispatch, getState);
                                    resolve();
                                });
                            });
                        } else preloadData(dispatch, getState); //else reloadData(dispatch, getState);
                    }, function (data) {
                        reject(data)
                    });
                }, function (data) {
                    dispatch({ type: LOGIN_KO, data: data });
                });
            } else {
                dispatch({ type: LOGIN_KO, data: dataLogin });
            }
        });
    };
}

export function loginMicrosoft(token, country, lang, petition, hash) {
    return (dispatch, getState) => {
        userService.loginMicrosoftRequest(token, country, lang, petition, hash).then(function (dataLogin) {
            userService.getSession().then(function (data) {
                userService.getNotificationTypes().then(function (notificationData) {
                    data.reloginEmail = "Microsoft,"+data.email;
                    dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                    getApps()(dispatch, getState);
                    ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                    if (data.email) {

                        var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginEmail:"Microsoft,"+data.email, relogin: false });

                        uniqueStorage.setItem('reloginData', stringify).then(function () {

                            Keychain.setGenericPassword("Microsoft,"+data.email, token).catch((err) => {
                                console.log("Keychain error:", err);
                            }).finally(() => {
                                registerDeviceToken()(dispatch, getState);
                                    firebase.crashlytics().setUserId(data.email);
                                    firebase.crashlytics().setAttribute("email", data.email);
                                reloadData(dispatch, getState);
                                resolve();
                            });
                        });
                    } else reloadData(dispatch, getState);
                    
                }, function (data) {
                    reject(data)
                });
            }, function (data) {
                dispatch({ type: LOGIN_KO, data: data });
            });
        }, function (dataLogin) {
            if (dataLogin.id == 5) {
                userService.getSession().then(function (data) {
                    userService.getNotificationTypes().then(function (notificationData) {
                        data.reloginEmail = "Microsoft,"+data.email;
                        dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                        getApps()(dispatch, getState);
                        ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                        registerDeviceToken()(dispatch, getState);

                        if (data.email) {

                            var stringify = JSON.stringify({ firstName: data.first_name, email: data.email, reloginEmail:"Microsoft,"+data.email, relogin: false });
    
                            uniqueStorage.setItem('reloginData', stringify).then(function () {
    
                                Keychain.setGenericPassword("Microsoft,"+data.email, token).catch((err) => {
                                    console.log("Keychain error:", err);
                                }).finally(() => {
                                    registerDeviceToken()(dispatch, getState);
                                        firebase.crashlytics().setUserId(data.email);
                                        firebase.crashlytics().setAttribute("email", data.email);
                                    //reloadData(dispatch, getState);
                                    preloadData(dispatch, getState);
                                    resolve();
                                });
                            });
                        } else preloadData(dispatch, getState); //else reloadData(dispatch, getState);
                    }, function (data) {
                        reject(data)
                    });
                }, function (data) {
                    dispatch({ type: LOGIN_KO, data: data });
                });
            } else {
                dispatch({ type: LOGIN_KO, data: dataLogin });
            }
        });
    };
}

export function loginApple(appleAuthRequestResponse, country, lang, petition, hash) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.loginAppleRequest(appleAuthRequestResponse, country, lang, petition, hash).then(function (dataLogin) {
                console.log("loginAppleRequest", dataLogin);
                userService.getSession().then(function (data) {
                    //console.log("getSession", data);
                    userService.getNotificationTypes().then(function (notificationData) {
                        dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                        getApps()(dispatch, getState);
                        ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                        registerDeviceToken()(dispatch, getState);

                        //At the moment, login apple is not using Keychain (it doesn't have a single token but an object with parameters)
                        
                        if (data.email) {
                            firebase.crashlytics().setUserId(data.email);
                            firebase.crashlytics().setAttribute("email", data.email);
                        }
                        reloadData(dispatch, getState);
                        resolve();
                    }, function (data) {
                        reject(data)
                    });
                }, function (data) {
                    //console.log("getSession error", data);
                    dispatch({ type: LOGIN_KO, data: data });
                    reject(data)
                });
            }, function (dataLogin) {
                console.log("loginAppleRequest error", dataLogin);
                if (dataLogin.id == 5) {
                    userService.getSession().then(function (data) {
                        userService.getNotificationTypes().then(function (notificationData) {
                            dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData, roles: dataLogin.roles, dataLogin: dataLogin });
                            getApps()(dispatch, getState);
                            ActionsBackgroundUploading.loadBackgroundUploadService()(dispatch, getState);
                            registerDeviceToken()(dispatch, getState);
                            if (data.email) {
                                firebase.crashlytics().setUserId(data.email);
                                firebase.crashlytics().setAttribute("email", data.email);
                            }
                            //console.log("reloadData");
                            //reloadData(dispatch, getState);
                            preloadData(dispatch, getState);
                            resolve();
                        }, function (data) {
                            //console.log("reject reloadData");
                            reject(data);
                        });
                    }, function (data) {
                        //console.log("LOGIN_KO 1");
                        dispatch({ type: LOGIN_KO, data: data });
                        reject(data)
                    });
                } else {
                    //console.log("LOGIN_KO 2");
                    dispatch({ type: LOGIN_KO, data: dataLogin });
                    reject(dataLogin)
                }
            });
        });
    };
}

export function logout(comesFromProfile, setLoading) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            ActionsGardener.wipeAllowRefreshGardenerHomes()(dispatch).then(function () {
                ActionsAcademy.setGardenerData(null, null)(dispatch).then(() => {

                    if (comesFromProfile) {
                        /*
                        Keychain.resetGenericPassword().catch((err)=>{
                          console.log("keychain error:",err)
                        }).finally(()=>{*/
                        var token = null;

                        dispatch({ type: SET_PETITION, petition: null });
                        token = getDeviceToken()(dispatch, getState);

                        userService.logoutRequest(token).then(function () {
                            dispatch({ type: LOGIN_KO, data: {}, loading: setLoading ? true : false, comesFromProfile: true });
                            var obj = { firstName: getState().sessionReducer.reloginData ? getState().sessionReducer.reloginData.firstName : null, email: getState().sessionReducer.reloginData ? getState().sessionReducer.reloginData.email : null, reloginEmail:getState().sessionReducer.reloginData ? getState().sessionReducer.reloginData.reloginEmail:null, relogin: true }
                            var stringify = JSON.stringify(obj);
                            uniqueStorage.setItem('reloginData', stringify).then(function () {
                                dispatch({ type: RELOGIN_DATA, data: obj });
                                dispatch({ type: SET_FLIWER_CONFIG_IS_INSIDE_APP, value: false });
                                wipeData(dispatch);
                                resolve();
                            });
                        });
                        //});
                    } else {

                        var token = null;

                        dispatch({ type: SET_FLIWER_CONFIG_IS_INSIDE_APP, value: false });

                        userService.logoutRequest(token).then(function () {
                            dispatch({ type: LOGIN_KO, data: {}, comesFromProfile: false });
                            wipeData(dispatch);
                            resolve();
                        });

                    }


                });
            });
        })
    };
}

export function deleteUser() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            userService.deleteUserRequest().then(function () {
                resolve();
            }, reject);

        })
    };
}

export function loadReloginData() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            uniqueStorage.getItem('reloginData').then(function (data) {
                console.log("reloginData data", data)
                if (data) {
                    data = JSON.parse(data);
                    console.log("reloginData data2", data)
                    dispatch({ type: RELOGIN_DATA, data: data });
                }
                resolve();
            }, resolve);
        })
    }
}

export function logoutNoAPi() {
    return (dispatch) => {
        dispatch({ type: LOGIN_KO, data: {} });
        wipeData(dispatch);
    };
}

export function logedIn() {
    return (dispatch, getState) => {
        return getState().sessionReducer.logedIn;
    }
}


export function registerDeviceToken() {
    return (dispatch, getState) => {
        var token = getDeviceToken()(dispatch, getState);
        console.log("registerDeviceToken", token);
        if (logedIn()(dispatch, getState) && token) {
            console.log("extraService.registerToken", token);
            extraService.registerToken(token);
        }
    }
}

export function setDeviceToken(token) {
    console.log("setDeviceToken", token);
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_TOKEN, data: { deviceToken: token } });
        registerDeviceToken()(dispatch, getState);
    };
}

export function getDeviceToken() {
    return (dispatch, getState) => {
        return getState().sessionReducer.deviceToken;
    }
}

export function lockToLandscape() {
    return (dispatch) => {
        dispatch({ type: LOCK_LANDSCAPE, data: {} });
    }
};

export function unlockAllOrientations() {
    return (dispatch, getState) => {
        var session = getState().sessionReducer;
        dispatch({ type: UNLOCK_LANDSCAPE, data: {} });
        if (session.defaultLockPortrait) {
            Orientation.lockToPortrait();
            return false;
        }
        return true;

    }
};

export function defaultLockToPortrait() {
    return (dispatch) => {
        dispatch({ type: DEFAULT_LOCK_PORTRAIT, data: {} });
    }
};

export function removeUserNotification(notificationId) {
    return (dispatch) => {
        extraService.removeUserNotification(notificationId);
    }
}


export function addGardenerUserID(idUserGardenerCheck, gardenerCheckidHome) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: ADD_USER_ID_GARDENER, gardenerCheckidUser: idUserGardenerCheck, gardenerCheckidHome: gardenerCheckidHome });
            resolve();
        });
    };
}


export function cleanGardenerUser() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({ type: CLEAN_GARDENER });
            resolve();
        });
    }
}


export function getGardenerCheckUserID() {
    return (dispatch, getState) => {
        return getState().sessionReducer.gardenerCheckidUser;
    }
}

export function getGardenerCheckidHome() {
    return (dispatch, getState) => {
        return getState().sessionReducer.gardenerCheckidHome;
    }
}

export function addVisitorUserID(idUserVisitorCheck, visitorCheckidHome) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: ADD_USER_ID_VISITOR, visitorCheckidUser: idUserVisitorCheck, visitorCheckidHome: visitorCheckidHome });
        })
    };
}

export function cleanVisitorUser() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({ type: CLEAN_VISITOR });
            resolve();
        });
    }
}

export function getVisitorCheckUserID() {
    return (dispatch, getState) => {
        return getState().sessionReducer.visitorCheckidUser;
    }
}

export function getVisitorCheckidHome() {
    return (dispatch, getState) => {
        return getState().sessionReducer.visitorCheckidHome;
    }
}


export function requestResetPassword(email, lang) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var data = { email: email, lang: lang }
            userService.requestResetPassword(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function resetPasswordChange(hash, lang, password) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var data = { hash: hash, lang: lang, password: password }
            userService.resetPassword(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function cancelPhoneVerification() {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: CANCEL_PHONE_VERIFICATION });
            resolve();
        });
    };
}

export function setPetition(petitionId, hash, email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            console.log("setPetition", petitionId, hash);
            dispatch({
                type: SET_PETITION,
                petition: {
                    id: petitionId,
                    hash: hash,
                    email: email ? email : null
                }
            });
            resolve();
        });
    };
}

export function checkedVersion() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({ type: CHECKED_VERSION });
            resolve();
        });
    };
}

export function getVersion() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            ActionsPoly.polyRequest([
                { url: '/getVersion', params: { platformOS: Platform.OS } }
            ])(dispatch, getState).then((polyResponse) => {
                var versionObject = polyResponse[0];
                dispatch({ type: VERSION, versionCode: versionObject.versionCode, versionName: versionObject.versionName, forceUpdateApp: versionObject.forceUpdateApp });
                dispatch({ type: SET_LAST_CHECKED_VERSION_TIME });
                resolve();
            });

        });
    };
}


export function addRealtimeProgram(program) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.addRealtimeProgram(program).then(function (response) {
                dispatch({ type: REALTIME_PROGRAM_ADD_PROGRAM, program: response.data });
                resolve(response.data);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function getRealtimePrograms() {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.getRealtimePrograms().then(function (response) {
                dispatch({ type: GET_REALTIME_PROGRAMS, programs: response });
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function deleteRealtimeProgram(idProgram) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.deleteRealtimeProgram(idProgram).then(function () {
                dispatch({ type: REALTIME_PROGRAM_DELETE, idProgram: idProgram });
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function modifyRealtimeProgram(idProgram, program) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.modifyRealtimeProgram(idProgram, program).then(function (response) {
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function checkEmailVerificationSession(){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.checkEmailVerificationSession().then(function (response) {
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };

}

export function requestEmailVerification(email) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.requestEmailVerification(email).then(function (response) {
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function requestPhoneVerification(phone) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.requestPhoneVerification(phone).then(function (response) {
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function getBusinessEmployeesBasicInfo() {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.getBusinessEmployeesBasicInfo().then(function (response) {
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function deleteBusinessEmployee(idUser) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.deleteBusinessEmployee(idUser).then(function (response) {
                dispatch({ type: REMOVE_EMPLOYEE, data: { idUser: idUser } });
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function addBusinessEmployee(email) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.addBusinessEmployee(email).then(function (response) {
                dispatch({ type: ADD_EMPLOYEE, data: response });
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function modifyBusinessEmployee(idUser,newData){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.modifyBusinessEmployee(idUser,newData).then(function (response) {
                dispatch({ type: UPDATE_EMPLOYEE, data: {permissions:response.permissions,idUser:idUser} });
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function getUserInformation(email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.getUserInformation(email).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getSession() {
    return (dispatch, getState) => {
        return getState().sessionReducer;
    }
}

export function getAccessLog(){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            userService.getAccessLog().then(function (response) {
                dispatch({ type: REFRESH_ACESSLOGS, data: response });
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function getGlobalData(){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: GETTING_GLOBAL_DATA, data: {} });
            userService.getGlobalUserData().then(function (response) {
                dispatch({ type: GET_GLOBAL_DATA, data: response });
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function refreshEmployees(){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.getEmployees().then(function (employeesData) {
                dispatch({ type: REFRESH_EMPLOYEES, data: employeesData });
                resolve(employeesData);
            }, function (error) {
                reject(error);
            });
        });
    }
}


export function modifyUserEmployeeObject(idUser,data){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            //debugger;
            userService.modifyUserEmployeeObject(idUser,data).then((response) => {
                refreshEmployees()(dispatch, getState).then(() => {
                    resolve(response);
                },resolve);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function checkAddEmployeeObject(){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.checkAddEmployeeObject().then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function addEmployeeObject(data){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.addEmployeeObject(data).then((response) => {
                refreshEmployees()(dispatch, getState).then(() => {
                    resolve(response);
                },resolve);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getWallet(options){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.getWallet(options).then((response) => {
                dispatch({type: GET_WALLET, wallet: response,options:options});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
    
}

export function addWalletMovement(data,uuid,verificationCode){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            data.uuid=uuid;
            data.verificationCode=verificationCode;
            userService.addWalletMovement(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function deleteWalletMovement(idMovement,uuid,verificationCode){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.deleteWalletMovement(idMovement,uuid,verificationCode).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getApps(){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.getUserApps().then((response) => {
                dispatch({type:GET_APPS,data:response});

                if (Platform.OS === 'android' || Platform.OS === 'ios') {

                    const allowedModules = response
                    .filter(app => (app.id === 11 || app.id === 16) && app.disabled === 0)
                    .map(app => app.app);
                    
                    const sessionData = getState().sessionReducer?.data;
                    const userId = sessionData?.user_id;
                    const userName = sessionData?.first_name;
                    
                    if (userId && allowedModules.length > 0) {
                        dispatch(setOfflineUserData({
                            userId,
                            userName,
                            allowedModules
                        }));
                    }
                }

                resolve(response);
            })
        });
    }
}

export function updateApp(app,enabled){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {

            userService.updateApp(app,enabled).then((response) => {
                dispatch({type:UPDATE_APP,data:{app:app,enabled:enabled}});
                resolve();
            })
            
        });
    }
}


export function getNotifications(number,page, filterByIdSortida, filterByDate){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            userService.getNotifications(number,page, filterByIdSortida, filterByDate).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}