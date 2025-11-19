/**
 * @file Manage ajax's call configurations.
 * @version 0.0.1
 * @todo UserService.getGardensUsers (admin)
 * @todo ExtraService.getMessages (chatBot)
 * @todo ExtraService.sendMessage (chatBot)
 * @todo ExtraService.getAdvertisementCard
 * @module
 */

import React, { Component } from 'react';
import {Platform} from 'react-native';

import { store } from '../store'; //Import the store
import * as ActionsSession from '../actions/sessionActions.js'; //Import your actions
import * as ActionsLanguage from '../actions/languageActions.js'; //Import your actions
import {toast} from '../widgets/toast/toast'

var axios = require('axios');
var setCookie = require('set-cookie-parser');
import CookieManager from '../utils/CookieManager/CookieManager';

import download from '../utils/download/download'
import upload from '../utils/upload/upload'
import { max } from 'moment';

const MAX_INTENTS = 20;
var cookie;
var logingOut=false;
/**
 * Class representing ajax service's.
 */
class Service {

    /**
     * Create a Service.
     * @param {string} base_url - Base url for ajax calls
     */

    constructor(base_url) {
        let url;
        if (Platform.OS === 'android' || Platform.OS === 'ios')
        {
            url = "https://fliwer.com:7100"; // Production
//            url = "http://192.168.1.27:8123"; // Wifi feina
//            url = "http://192.168.100.40:8123"; // Lan casa
//            url = "http://192.168.100.34:8123"; // Wifi casa
        } else
        {/*
            if (location.hostname === 'localhost')
            {
//                url = "http://fliwer.com:7090"; // Connect to production
                url = "http://localhost:8123"; // Connect to localhost
            } else
            {*/
            var hostname = location.hostname.split('.');
            var subdomain = hostname[0];
            var domain = hostname[1] + '.' + hostname[2];
            //Special case: iff app.fliwer.com remove "app.", but only if domain is app.fliwer.com
            
            if (subdomain == 'app' && domain == 'fliwer.com')
                subdomain = '';
            
            if(subdomain == "127" || subdomain=="localhost"){
                subdomain="";
                domain="api.fliwer.com";
            }
            
            url = (location.protocol === 'http:' ? /*"http://fliwer.com:7198"*/"http://" + subdomain + (subdomain?'.':'') + domain + ":7090" : /*"https://fliwer.com:7199"*/"https://" + subdomain + (subdomain?'.':'') + domain + ":7100");
            //}
        }
        console.log(url);

        this.BASE_URL = base_url || url;
    }

    pureAjax(data) {
        data.credentials = 'include';
        return fetch(data.url, data)
    }

    ajax(data, ignore, iteration) {

        //console.log("data:",data);
        //console.log("iteration:",iteration);
        var that = this;
        if (!iteration)
            iteration = 0;
        else
            console.log("iteration", iteration, "!!", data);
        data.credentials = 'include'
        return new Promise((resolve, reject) => {
            var exbody = data.body ? JSON.parse(data.body) : null;
            if (!ignore && data && (ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState) || ActionsSession.getVisitorCheckUserID()(store.dispatch, store.getState)))
            {
                if (!data.body)
                {
                    if (ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState) && data.method!="GET")
                        data.body = {gardenerCheckidUser: ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState)}
                    else if (ActionsSession.getVisitorCheckUserID()(store.dispatch, store.getState) && data.method!="GET")
                        data.body = {visitorCheckidUser: ActionsSession.getVisitorCheckUserID()(store.dispatch, store.getState)}
                    var bd = JSON.stringify(data.body)
                } else
                {
                    var b = JSON.parse(data.body)
                    if (ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState))
                        b.gardenerCheckidUser = ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState)
                    else if (ActionsSession.getVisitorCheckUserID()(store.dispatch, store.getState))
                        b.visitorCheckidUser = ActionsSession.getVisitorCheckUserID()(store.dispatch, store.getState)
                    var bd = JSON.stringify(b)
                    //console.log("afegit gardenerCheckidUser: ",bd.body.gardenerCheckidUser);
                }
                data.body = bd

            }
            var url = data.url;
            //console.log("SENDING URL:",url);
            //console.log("fetching url", url);
            //console.log("data api",data);
 
            
            
            if (Platform.OS === 'android' || Platform.OS === 'ios')
            {
                data.headers = {
                    ...data.headers,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'If-None-Match': '', // remove or clear etags
                    'If-Modified-Since': ''
                };
            }
            

            
            fetch(data.url, data).then((response) => {
                //console.log("response cookie:",response.headers.get('Set-Cookie'))
                /*
                 var combinedCookieHeader = data.headers.get('Set-Cookie');
                 var splitCookieHeaders = setCookie.splitCookiesString(combinedCookieHeader)
                 var cookies = setCookie.parse(splitCookieHeaders);
                 if(cookies && cookies[0])console.log('cookies',cookies,'url',url)*/


                CookieManager.get(this.BASE_URL).then((res) => {
                    //console.log("cookie url ",url);
                    //console.log("cookie res ",res);
                    var isRegisterRequest = false;
                    if (url.length > 4) {
                        var urlPieces = url.split("/");
                        isRegisterRequest = (urlPieces[urlPieces.length-1] == "user");
                    }
                    if (res && (isRegisterRequest || url.search("/login") != -1 || url.search("/logout") != -1 || url.search("/polyRequestLogin") != -1)) {
                        cookie = Platform.OS === 'ios'? res["connect.cookie"].value : res["connect.cookie"];
                        console.log('new cookie', cookie); // => 'user_session=abcdefg; path=/;'
                    } else {
                        if (Platform.OS === 'ios')
                            if (res && cookie != res["connect.cookie"].value) {
                                CookieManager.setFromResponse(this.BASE_URL, "connect.cookie=" + cookie + ";").then((res) => {
                                    console.log('changing cookie from', res["connect.cookie"], "to", cookie, res);
                                });
                            }
                        else
                            if (res && cookie != res["connect.cookie"]) {
                                CookieManager.setFromResponse(this.BASE_URL, "connect.cookie=" + cookie + ";").then((res) => {
                                    console.log('changing cookie from', res["connect.cookie"], "to", cookie, res);
                                });
                            }

                    }
                });

                //console.log(url,"cookie",data.headers.get('Set-Cookie'))
                response.json().then((responseData) => {
                    if (responseData.ok == false) {
                        if (responseData.id == 1 || responseData.id == 2 || responseData.id == 3 || responseData.id == 4 || responseData.id == 25 || responseData.id == 70) {
                            //Losed session.
                            console.log("losed session. url:",url,"data:",responseData)
                            //debugger;
                            if(!logingOut){
                              logingOut=true;
                              ActionsSession.logout(null,true)(store.dispatch, store.getState).then(()=>{
                                ActionsSession.login("", "")(store.dispatch, store.getState).then(()=>{

                                }).finally(()=>{
                                  logingOut=false;
                                });
                              });
                            }
                        }
                        reject(responseData);
                    } else
                        resolve(responseData);
                }, (err) => {
                    reject(err)
                })
            }, function (data2) {
                console.log("id error3: ", data2,"data:",data);
                const isOffline = store.getState().sessionReducer.offline;

                if (isOffline) {
                    console.log("🔌 En modo offline, se omite logout por error de red.");
                    reject(data2); // No reintentar ni desloguear
                    } else if (iteration < MAX_INTENTS) {
                    setTimeout(() => {
                        that.ajax(data, ignore, iteration + 1).then(resolve, reject);
                    }, 500);
                    } else {
                    reject(data2);
                    toast.error(ActionsLanguage.get('api_connection_error')(store.dispatch, store.getState));
                    ActionsSession.logoutNoAPi()(store.dispatch, store.getState);
                    }
            })

        });
    }
    blob(method, url, filename, body, asBase64, iteration) {
        if (method == "POST") {
            if (!body)
            {
                body = {gardenerCheckidUser: ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState)}
                var bd = JSON.stringify(body)
            } else
            {
                var b = JSON.parse(body)
                b.gardenerCheckidUser = ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState)
                var bd = JSON.stringify(b)
            }
            body = bd
        }
        return new Promise((resolve, reject) => {
            download.fetch(method, url, filename, body, asBase64).then(resolve, (data2) => {
                console.log("id error1: ", data2);
                if (iteration < MAX_INTENTS) {
                    setTimeout(() => {
                        that.blob(method, url, filename, body, asBase64, iteration + 1).then(resolve, reject)
                    }, 500);
                } else {
                    reject(data2);
                    toast.error(ActionsLanguage.get('api_connection_error')(store.dispatch, store.getState));
                    ActionsSession.logoutNoAPi()(store.dispatch, store.getState);
                }
            });
        });
    }

    multipartFormData(method, url, body, files, onProgress, ignore, iteration) {
        //console.log("multipartFormData ", method, url, body, files, onProgress, ignore, iteration);
        /* files: [{uri:,type:}]*/
        if (!iteration)
            iteration = 0;
        if (method == "POST" && !ignore) {
            console.log("0");
            if (!body) {
                body = {gardenerCheckidUser: ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState)}
            } else {
                body.gardenerCheckidUser = ActionsSession.getGardenerCheckUserID()(store.dispatch, store.getState)
            }
        }
        console.log("1");
        return new Promise((resolve, reject) => {
            console.log("promise");
            //reject({id: 34, reason:"Fuck", from: "multipartFormData reject 1"});
            upload.fetch(method, url, body, files, onProgress).then(resolve, (data2) => {
                if (typeof data2 != 'string')
                    data2.from = "upload.fetch data2";
                console.log("data22", data2);
                if (data2.controled) {
                    console.log("2");
                    reject(data2.data);
                } else {
                    console.log("id error2: ", data2);
                    if (iteration < MAX_INTENTS) {
                        setTimeout(() => {
                            this.multipartFormData(method, url, body, files, onProgress, ignore, iteration + 1).then(resolve, reject)
                        }, 500);
                    } else {
                        reject(data2);
                        toast.error(ActionsLanguage.get('api_connection_error')(store.dispatch, store.getState));
                        ActionsSession.logoutNoAPi()(store.dispatch, store.getState);
                    }
                }
            });
        });
    }

}

/**
 * Class that offers user services.
 * @extends Service
 */
class UserService extends Service {
    /**
     * Get call configuration to get the active session.
     * @return {object} The ajax's call configuration.
     */
    getSession() {
        return this.getProfile();
    }

    /**
     * Get call configuration to get a new session from the server with the given credentials.
     * @param {string} email
     * @param {string} password
     * @param {string} lang
     * @param {boolean} fliwerpro
     * @return {object} The ajax's call configuration.
     */
    loginRequest(email, password, lang, petition, hash, fliwerpro) {

        var body  = this.getLoginRequestBodyObject(email, password, lang, petition, hash, fliwerpro);
        return super.ajax({
            "url": this.BASE_URL + "/login",
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": JSON.stringify(body)
        });
    }
    getLoginRequestBodyObject(email, password, lang, petition, hash, fliwerpro) {
        email = email || "no_email";
        password = password || "no_pass";
        lang = lang || "es";
        fliwerpro = fliwerpro ? "true" : "false";

        return {
            "email": email,
            "password": password,
            "lang": lang,
            "fliwerpro": fliwerpro,
            "petition": petition,
            "hash": hash
        };
    }

    /**
     * Get call configuration to get a new session from the server with the given facebook credentials.
     * @param {string} token
     * @param {boolean} fliwerpro
     * @return {object} The ajax's call configuration.
     */
    loginFacebookRequest(token, country, lang, petition, hash, fliwerpro) {
        fliwerpro = fliwerpro ? "true" : "false";

        return super.ajax({
            "url": this.BASE_URL + "/loginFacebook",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                "token": token,
                "country": country,
                "lang": lang,
                "fliwerpro": fliwerpro,
                "platformOS": Platform.OS,
                "petition": petition,
                "hash": hash
            })
        });
    }

    /**
     * Get call configuration to get a new session from the server with the given google credentials.
     * @param {string} token
     * @param {boolean} fliwerpro
     * @return {object} The ajax's call configuration.
     */
    loginGoogleRequest(token, country, lang, petition, hash, fliwerpro) {
        fliwerpro = fliwerpro ? "true" : "false";

        return super.ajax({
            "url": this.BASE_URL + "/loginGoogle",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                "token": token,
                "country": country,
                "lang": lang,
                "fliwerpro": fliwerpro,
                "platformOS": Platform.OS,
                "petition": petition,
                "hash": hash
            })
        });
    }

    /**
     * Get call configuration to get a new session from the server with the given google credentials.
     * @param {string} token
     * @param {boolean} fliwerpro
     * @return {object} The ajax's call configuration.
     */
    loginMicrosoftRequest(token, country, lang, petition, hash, fliwerpro) {
        fliwerpro = fliwerpro ? "true" : "false";

        return super.ajax({
            "url": this.BASE_URL + "/loginMicrosoft",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                "token": token,
                "country": country,
                "lang": lang,
                "fliwerpro": fliwerpro,
                "platformOS": Platform.OS,
                "petition": petition,
                "hash": hash
            })
        });
    }

    /**
     * Get call configuration to get a new session from the server with the given apple credentials.
     * @param {string} appleAuthRequestResponse
     * @param {boolean} fliwerpro
     * @return {object} The ajax's call configuration.
     */
    loginAppleRequest(appleAuthRequestResponse, country, lang, petition, hash, fliwerpro) {
        fliwerpro = fliwerpro ? "true" : "false";

        return super.ajax({
            "url": this.BASE_URL + "/loginApple",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                "appleAuthRequestResponse": appleAuthRequestResponse,
                "country": country,
                "lang": lang,
                "fliwerpro": fliwerpro,
                "platformOS": Platform.OS,
                "petition": petition,
                "hash": hash
            })
        });
    }

    /**
     * Get call configuration to make a logout request to the server.
     * @return {object} The ajax's call configuration.
     */
    logoutRequest(token) {

        var body = {};
        if (token)
            body = {
                token: token,
                type: (Platform.OS === 'ios'? 1 : 2)
            };

        return super.ajax({
            "url": this.BASE_URL + "/logout",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(body)
        });
    }

    deleteUserRequest(){
      var body = {};

      return super.ajax({
          "url": this.BASE_URL + "/account/delete",
          "method": "DELETE",
          "headers": {"content-type": "application/json"},
          "body": JSON.stringify(body)
      });
    }

    /**
     * Get call configuration to make a register user request.
     * @param {string} email
     * @param {string} password
     * @param {string} first_name
     * @param {string} last_name
     * @param {string} country
     * @param {string} lang
     * @return {object} The ajax's call configuration.
     */
    registerRequest(email, password, first_name, last_name, country, lang, petition, hash) {
        email = email || "";
        password = password || "";
        first_name = first_name || "";
        last_name = last_name || "";
        country = country || "";
        lang = lang || "";

        return super.ajax({
            "url": this.BASE_URL + "/user",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                "first_name": first_name,
                "last_name": last_name,
                "password": password,
                "email": email,
                "country": country,
                "mobile": true,
                "lang": lang,
                "platformOS": Platform.OS,
                "petition": petition,
                "hash": hash
            })
        });

    }

    /**
     * Get call configuration to confirm user register.
     * @param {number} idUser - id of the user
     * @param {string} hash - hash of the password
     * @param {string} lang - (opcional) laguage
     * @return {object} The ajax's call configuration.
     */
    confirmUser(idUser, hash, lang) {
        var data = {
            "idUser": idUser,
            "hash": hash,
        }
        if (lang != null)
            data.lang = lang;
        return super.ajax({
            "url": this.BASE_URL + "/user/confirm",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        })
    }

    /**
     * Get call configuration to change language of the active session.
     * @param {string} lang - language code
     * @return {object} The ajax's call configuration.
     */
    setLanguage(lang) {
        lang = lang || "es";
        return super.ajax({
            "url": this.BASE_URL + "/setLang",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"lang": lang})
        });
    }

    /**
     * Get call configuration to get the profile of the user.
     * @return {object} The ajax's call configuration.
     */
    getProfile() {
        return new Promise((resolve, reject) => {
            super.ajax({
                "url": this.BASE_URL + "/user/profile",
                "method": "GET"
            }, true).then((data) => {
                if (data.photo_url)
                    data.photo_url += "?v=" + Date.now()
                resolve(data)
            }, (error) => {
                reject(error)
            })
        })
    }

    getUserApps(){
        return super.ajax({
            "url": this.BASE_URL + "/user/apps",
            "method": "GET"
        }, true)
    }

    updateApp(app,enabled){
        return super.ajax({
            "url": this.BASE_URL + "/user/apps/set",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"app": app, "set": enabled})
        }, true)
    }

    
    getAccessLog(){
        return super.ajax({
            "url": this.BASE_URL + "/user/accessLog",
            "method": "GET"
        }, true)
    }

    getGlobalUserData(){
        return super.ajax({
            "url": this.BASE_URL + "/global/currentUsers",
            "method": "GET"
        }, true)
    }

    /**
     * Get call configuration to get the profile of the user.
     * @return {object} The ajax's call configuration.
     */
    getNotificationTypes() {
        return super.ajax({
            "url": this.BASE_URL + "/user/notificationTypes",
            "method": "GET"
        }, true)
    }

    /**
     * Get call configuration to get the profile of the user.
     * @return {object} The ajax's call configuration.
     */
    modifyNotificationTypes(notificationTypes) {
        return super.ajax({
            "url": this.BASE_URL + "/user/modifyNotificationTypes",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(notificationTypes)
        })
    }

    /**
     * @typedef {number} notificationLv
     * <div><b>value 0 =></b> Don't show notifications</div>
     * <div><b>value 1 =></b> Show notifications from lv1 | All notifications</div>
     * <div><b>value 2 =></b> Show notifications from lv2 | Maintenance Advices</div>
     * <div><b>value 3 =></b> Show notifications from lv3 | Advices (except for maintenance)</div>
     * <div><b>value 4 =></b> Show notifications from lv4 | Alerts</div>
     * <div><b>value 5 =></b> Show notifications from lv5 | Maintenance Alerts && Water</div>
     */

    /**
     * Get call configuration to make an update profile request.
     * @param {object} profile
     * @param {string} profile.email
     * @param {string} profile.first_name
     * @param {string} profile.last_name
     * @param {string} profile.phone
     * @param {string} profile.country
     * @param {number} profile.sex - 1->Male | 2->Female | 0->Other
     * @param {string} profile.born - YYYY-MM-DD
     * @param {number} profile.iscompany
     * @param {string} profile.company_name
     * @param {string} profile.company_cif
     * @param {string} profile.company_address
     * @param {string} profile.company_position
     * @param {string} profile.photo_url
     * @param {notificationLv} profile.pushNotificationLevel
     * @return {object} The ajax's call configuration.
     */
    updateProfile(profile) {
        profile.pushNotificationLevel = profile.pushNotificationLevel || 5;
        return super.ajax({
            "url": this.BASE_URL + "/user/profile/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(profile)
        }, true);
    }

    /**
     * Get call configuration to request a reset password link to the user email.
     * @param {object} data
     * @param {string} data.email - Email of the user
     * @param {string} data.lang - Language of the user
     * @param {boolean} data.fliwerpro
     * @return {object} The ajax's call configuration.
     */
    requestResetPassword(data) {
        return super.ajax({
            "url": this.BASE_URL + "/forgotpassword",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    /**
     * Get call configuration to reset the password.
     * @param {Object} data
     * @param {number} data.idUser - ID of the user
     * @param {string} data.hash - Hash of the actual password
     * @param {string} data.password - New password of the user
     * @return {object} The ajax's call configuration.
     */
    resetPassword(data) {
        return super.ajax({
            "url": this.BASE_URL + "/forgotpassword/newPassword",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    /**
     * Get call configuration to add a new home.
     * @param {home} home
     * @return {object} The ajax's call configuration.
     */
    addHome(data) {
        return super.ajax({
            "url": this.BASE_URL + "/user/home",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(data)
        });
    }

    /**
     * Get call configuration to get event log.
     * @param {timestamp} startTime
     * @param {timestamp} endTime
     * @return {object} The ajax's call configuration.
     */
    getEvenLog(startTime, endTime) {
        return super.ajax({
            "url": this.BASE_URL + "/user/eventLog/" + startTime + "/" + endTime,
            "method": "POST",
        })
    }

    /**
     * Get call configuration to get the devices of a user.
     * @return {object} The ajax's call configuration.
     */
    getUserDevices(options) {
        return super.ajax({
            "url": this.BASE_URL + "/devices",
            "headers": {"content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify(options)
        });
    }

    addRealtimeProgram(program) {
        return super.ajax({
            "url": this.BASE_URL + "/user/addRealtimeProgram",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(program)
        });
    }

    getRealtimePrograms() {
        return super.ajax({
            "url": this.BASE_URL + "/user/getRealtimePrograms/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
        });
    }

    deleteRealtimeProgram(idProgram) {
        return super.ajax({
            "url": this.BASE_URL + "/user/realTime/" + idProgram + "/delete",
            "method": "DELETE"
        });
    }

    modifyRealtimeProgram(idProgram, program) {
        return super.ajax({
            "url": this.BASE_URL + "/user/realTime/" + idProgram + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(program)
        });
    }

    checkEmailVerificationSession(){
        return super.ajax({
            "url": this.BASE_URL + "/user/emailVerification/session/email",
            "method": "GET"
        });
    }

    requestEmailVerification(email) {
        return super.ajax({
            "url": this.BASE_URL + "/user/emailVerification/v2/" + email,
            "method": "GET"
        });
    }

    requestPhoneVerification(email) {
        return super.ajax({
            "url": this.BASE_URL + "/user/phoneVerification/" + email,
            "method": "GET"
        });
    }


    getEmployees(){
        return super.ajax({
            "url": this.BASE_URL + "/business/employees",
            "method": "GET"
        }, true);
    }


    modifyUserEmployeeObject(idUser,data){
        return super.ajax({
            "url": this.BASE_URL + "/business/addEmployeeObject/"+idUser,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addEmployeeObject(data){
        return super.ajax({
            "url": this.BASE_URL + "/business/addEmployeeObject/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    checkAddEmployeeObject(){
        return super.ajax({
            "url": this.BASE_URL + "/business/addEmployeeObject/",
            "method": "GET"
        }, true);
    }

    deleteBusinessEmployee(idUser){
        return super.ajax({
            "url": this.BASE_URL + "/business/employee/" + idUser,
            "method": "DELETE"
        }, true);
    }

    addBusinessEmployee(email){
        return super.ajax({
            "url": this.BASE_URL + "/business/employee/" + email,
            "method": "PUT"
        }, true);
    }

    modifyBusinessEmployee(idUser, data){
        return super.ajax({
            "url": this.BASE_URL + "/business/employee/" + idUser + "/modifyPermissions",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(data)
        }, true);
    }

    getUserInformation(email){
        return super.ajax({
            "url": this.BASE_URL + "/business/user/" + email,
            "method": "GET",
            "headers": {"content-type": "application/json"},
        }, true);
    }

    getBusinessEmployeesBasicInfo(){
        return super.ajax({
            "url": this.BASE_URL + "/business/all/",
            "method": "GET",
            "headers": {"content-type": "application/json"},
        }, true);
    }
    
    getWallet(options) {
        if(!options.startDataTime) options.startDataTime = 0;
        return super.ajax({
            "url": this.BASE_URL + "/wallet/"+parseInt(options.startDataTime)+"/"+(options.endDataTime?parseInt(options.endDataTime)+"/":""),
            "method": "POST",
            "headers": {"content-type": "application/json"}
        });
    }

    addWalletMovement(data){
        return super.ajax({
            "url": this.BASE_URL + "/wallet/movement",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    deleteWalletMovement(id,uuid,verificationCode){
        return super.ajax({
            "url": this.BASE_URL + "/wallet/movement/"+id,
            "method": "DELETE",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({uuid:uuid,verificationCode:verificationCode})
        });
    }

    getNotifications(number, page, filterByIdSortida, filterByDate) {
        return super.ajax({
            "url": this.BASE_URL + "/user/notifications" +
                (filterByIdSortida ? "/id/" + filterByIdSortida:"") + (filterByDate ? "/date/" + filterByDate : "") +
                (number ? (page ? ("/" + number + "/"+page) : ("/" + number)) : ""),
            "method": "GET"
        });
    }


};

/**
 * Class that offers location services.
 * @extends Service
 */
class LocationService extends Service {
    /**
     * Get call configuration to get the geolocation information.
     * @param {string} query
     * @return {object} The ajax's call configuration.
     */
    getGeolocation(query) {

        return super.ajax({
            "url": this.BASE_URL + "/geoLocation/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({query: query})
        });
    }

    /**
     * Get call configuration to get the region (Catalunya, Andalucía, etc..) by geolocation
     * @param {float} lat
     * @param {float} long
     * @return {object} The ajax's call configuration.
     */
    getRegionGeoLocation(address) {

        return super.ajax({
            "url": this.BASE_URL + "/regionGeoLocation/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({address: address})
        });
    }

    /**
     * Get call configuration to get the countries of the world.
     * @return {object} The ajax's call configuration.
     */
    getCountries() {
        return super.ajax({
            "url": this.BASE_URL + "/countries",
            "method": "GET"
        })
    }

    /**
     * Get call configuration to get city information.
     * @param {number} id_city
     * @param {boolean} meteo
     * @return {object} The ajax's call configuration.
     */
    getCity(id_city, meteo) {
        id_city = id_city || 0;
        meteo = meteo ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/city/" + id_city,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"meteo": meteo})
        });
    }

    /**
     * Get call configuration to get the meteo of a city.
     * @param {number} id_city
     * @return {object} The ajax's call configuration.
     */
    getMeteo(id_city) {
        return super.ajax({
            "url": this.BASE_URL + "/city/" + id_city + "/meteo",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to search cities that can match the name in the country.
     * @param {string} country
     * @param {string} name - City name or part of the city name
     * @return {object} The ajax's call configuration.
     */
    searchCities(country, name) {
        return super.ajax({
            "url": this.BASE_URL + "/searchCities",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"country": country, "name": name})
        });
    }
}

/**
 * Class that offers plant services.
 * @extends Service
 */
class PlantService extends Service {

    /**
     * Get call configutation to get the list of plants and their information.
     * @param {object} options
     * @param {string} options.lang - Language with which we will receive the information
     * @return {object} The ajax's call configuration.
     */
    getPlants(options) {
        options.moreInfo = options.moreInfo ? "1" : "0";
        return super.ajax({
            "url": this.BASE_URL + "/plant/list",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configutation to get a plant and its information.
     * @param {number} id_plant - Id of the plant
     * @param {object} options
     * @param {boolean} options.moreInfo - Recieve more information about the plant
     * @param {string} options.lang - Language with which we will receive the information
     * @return {object} The ajax's call configuration.
     */
    getPlant(id_plant, options) {
        options = options || {};
        options.moreInfo = options.moreInfo ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/plant/" + id_plant + "/info",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configutation to get a plant and more information.
     * @param {number} id_plant - Id of the plant
     * @return {object} The ajax's call configuration.
     */
    getPlantMoreInfo(id_plant) {
        moreInfo = moreInfo ? "1" : "0";
        return super.ajax({
            "url": this.BASE_URL + "/plant/" + id_plant + "/moreInfo",
            "method": "GET"
        });
    }

    /**
     * Get call configutation to get the plant tree.
     * @param {object} options
     * @param {boolean} options.all - Recieve all information abaout the tree
     * @param {boolean} options.moreInfo - Recieve more information about plants (requires all=true)
     * @param {boolean} options.incompatibilityLightTable - Recieve the incompatibility light table
     * @param {string} options.lang - Language with which we will receive the information
     * @return {object} The ajax's call configuration.
     */
    getPlantTree(options) {
        options.all = options.all ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.incompatibilityLightTable = options.incompatibilityLightTable ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/plant/tree",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configutation to get a plant tree category.
     * @param {number} id_category - Id of the plant tree category
     * @return {object} The ajax's call configuration.
     */
    getPlantTreeCategory(id_category) {
        return super.ajax({
            "url": this.BASE_URL + "/plant/tree/category/" + id_category,
            "method": "GET"
        });
    }

    /**
     * Get call configutation to get a plant tree subcategory (with other subcategories or just plants).
     * @param {number} id_category - Id of the plant tree category
     * @return {object} The ajax's call configuration.
     */
    getPlantTreeSubcategory(id_subcategory) {
        return super.ajax({
            "url": this.BASE_URL + "/plant/tree/subcategory/" + id_subcategory,
            "method": "GET"
        });
    }

    /**
     * Get call configuration to search plants that can match the name.
     * @param {string} name - Plant name or part of the plant name
     * @return {object} The ajax's call configuration.
     */
    searchPlant(name) {
        return super.ajax({
            "url": this.BASE_URL + "/plant/tree/search",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"name": name})
        });
    }

    /**
     * Get call configutation to get the incompatibility table
     * @return {object} The ajax's call configuration.
     */
    getIncompatibilityTable() {
        return super.ajax({
            "url": this.BASE_URL + "/plant/incompatibilityTable",
            "method": "GET"
        }, true);
    }

    /**
     * Get call configutation to get the incompatibility light table
     * @param {object} options
     * @param {string} options.lang - Language with which we will receive the information
     * @return {object} The ajax's call configuration.
     */
    getIncompatibilityLightTable(lang) {
        return super.ajax({
            "url": this.BASE_URL + "/plant/incompatibilityLightTable",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configutation to get the plant regions
     * @return {object} The ajax's call configuration.
     */
    getPlantRegions() {
        return super.ajax({
            "url": this.BASE_URL + "/plant/regions",
            "method": "GET"
        });
    }

    /**
     * Get call configutation to get the last time the plants were updated on the server
     * @return {object} The ajax's call configuration.
     */
    getLastUpdateTime() {
        return super.ajax({
            "url": this.BASE_URL + "/plant/lastUpdateTime",
            "method": "GET"
        }, true);
    }

    plantSearchByImage(image) {
        return super.ajax({
            "url": this.BASE_URL + "/plant/image/search",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"image": image})
        });
    }
}

/**
 * Class that offers device services.
 * @extends Service
 */
class DeviceService extends Service {
    /**
     * @typedef {string} deviceType
     * <b>value =></b> "CONTROL_24" || "CONTROL_9" || "SENS" || "SENS_PRO" || "UNIPRO_16"
     * || "UNIPRO_14" || "UNIPRO_12" || "UNIPRO_9" || etc
     */

    /**
     * Get call configutation to get a device.
     * @param {string} id_device - Id of the device
     * @return {object} The ajax's call configuration.
     */
    getDevice(id_device) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + id_device+"/get",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    /**
     * Get call configutation to check a device.
     * @param {string} id_device - Id of the device
     * @param {deviceType} type - Type of the device
     * @return {object} The ajax's call configuration.
     */
    checkDevice(id_device, type) {
        return super.ajax({
            "url": this.BASE_URL + "/device/check/" + type + "/" + id_device,
            "method": "GET"
        }, true);
    }

    /**
     * Get call configutation to add a device.
     * @param {string} id_device - Id of the device
     * @param {object} data - Information about the device
     * @param {deviceType} data.type - Type of the device
     * @param {number} data.idZone - Zone ID (only if idImageDash == undefined)
     * @param {number} data.idImageDash - Garden ID (only if idZone == undefined)
     * @return {object} The ajax's call configuration.
     */
    addDevice(id_device, data) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + id_device,
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    /**
     * Get call configutation to add devices.
     * @param {object[]} devices - Devices to add
     * @param {string} devices[].idDevice - Id of the device
     * @param {deviceType} device[].type - Type of the device
     * @param {number} device[].idZone - Zone ID (only if idImageDash == undefined)
     * @param {number} device[].idImageDash - Garden ID (only if idZone == undefined)
     * @return {object} The ajax's call configuration.
     */
    addDevices(devices) {
        return super.ajax({
            "url": this.BASE_URL + "/device",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(devices)
        });
    }

    /**
     * Get call configutation to get the configuration of a control device.
     * @param {string} id_device - Id of the device
     * @return {object} The ajax's call configuration.
     */
    getControlConfig(id_device) {
        return super.ajax({
            "url": this.BASE_URL + "/device/control/" + id_device + "/config",
            "method": "POST",
            "headers": {"content-type": "application/json"},
        });
    }

    setControlValveFlowRef(idControl, valveNumber, flowref) {
        return super.ajax({
            "url": this.BASE_URL + "/device/control/" + idControl + "/valve/" + valveNumber + "/flowRef",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({flowRef: flowref})
        })
    }

    /**
     * Get call configutation to modify the device.
     * @param {string} id_device - Id of the device
     * @param {object} place - Place to put the device in
     * @param {number} place.idZone - Zone ID (only if idImageDash == undefined)
     * @param {number} place.idImageDash - Garden ID (only if idZone == undefined)
     * @return {object} The ajax's call configuration.
     */
    modifyDevice(id_device, place) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + id_device + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(place)
        });
    }

    /**
     * Get call configutation to modify the device.
     * @param {string} id_device - Id of the device
     * @param {object} changes - array of changes for any valveNumbers in the control
     * @return {object} The ajax's call configuration.
     */
    modifyControlConfig(id_device, changes) {
        return super.ajax({
            "url": this.BASE_URL + "/device/control/" + id_device + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({valves: changes})
        });
    }

    /**
     * Get call configutation to delete a device.
     * @param {string} id_device - Id of the device
     * @return {object} The ajax's call configuration.
     */
    deleteDevice(id_device, uuid, verificationCode) {
        verificationCode = {
            uuid: uuid,
            verificationCode: verificationCode
        }
        return super.ajax({
            "url": this.BASE_URL + "/device/" + id_device + "/delete",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(verificationCode)
        });
    }

    /**
     * Get call configutation to delete a failed device info.
     * @param {string} id_link - Id of the link
     * @param {string} id_device - Id of the device
     * @return {object} The ajax's call configuration.
     */
    deleteDeviceFailed(id_link, id_device, password) {
        return super.ajax({
            "url": this.BASE_URL + "/device/failed/" + id_link + "/" + id_device + "/delete",
            "body": JSON.stringify({password: password}),
            "headers": {"content-type": "application/json"},
            "method": "POST"
        });
    }

    modifyConfiguration(idDevice,configuration){
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/configV2",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(configuration)
        });
    }

    linkDeviceZone(idDevice, idZone, nsensor) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/linkZone/" + idZone,
            "body": JSON.stringify({sensorId: nsensor}),
            "headers": {"content-type": "application/json"},
            "method": "POST"
        });
    }

    unlinkDeviceZone(idDevice, nsensor) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/unlinkZone/",
            "body": JSON.stringify({sensorId: nsensor}),
            "headers": {"content-type": "application/json"},
            "method": "POST"
        });
    }

    linkDeviceFlowZone(idDevice, idZone) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/linkFlowZone/" + idZone,
            "method": "POST"
        });
    }

    unlinkDeviceFlowZone(idDevice) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/unlinkFlowZone/",
            "method": "POST"
        });
    }

    getDeviceData(idDevice, options) {
        options = options || {};
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/data",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    getDeviceDataPackets(idDevice, options) {
        options = options || {};
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/data/packets",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    getRealtimeDeviceData(idDevice) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/realtimeData",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    startRealTime(idDevice) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/realTime",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    startRealTimeAll(idHome){
        return super.ajax({
            "url": this.BASE_URL + "/home/" + idHome + "/realTime",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    endRealTime(idDevice) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/realTime",
            "method": "DELETE",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    endRealTimeAll(idHome){
        return super.ajax({
            "url": this.BASE_URL + "/home/" + idHome + "/realTime",
            "method": "DELETE",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    openValve(idLink, idControl, valveNumber) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idLink + "/openValve/" + idControl + "/" + valveNumber,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    closeValve(idLink, idControl, valveNumber) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idLink + "/closeValve/" + idControl + "/" + valveNumber,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    realtimeCloseConnection(idLink) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idLink + "/realtimeCloseConnection",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    setLinkWakeupPeriod(idLink,wakeUpPeriod){
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idLink + "/wakeUpPeriod",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({wakeUpPeriod:wakeUpPeriod})
        });
    }

    getDeviceAllPingTest(idDevice) {
        return super.ajax({
            "url": this.BASE_URL + "/device/" + idDevice + "/pingTest",
            "method": "GET"
        });
    }

};

/**
 * Class that offers home services.
 * @extends Service
 */
class HomeService extends Service {
    /**
     * @typedef {object} home
     * @property {string} name - Name of the home
     * @property {string} place_id - Location of the home
     * @property {garden[]} gardens - Gardens of the home
     */

    /**
     * Get call configuration to get the list of homes and some information.
     * @param {object} options - Information that will be recieved
     * @param {boolean} options.genericInfo - Recieve generic information
     * @param {boolean} options.meteo - Recieve meteo information
     * @param {boolean} options.garden - Recieve gardens information
     * @param {boolean} options.zone - Recieve zones information
     * @param {boolean} options.plants - Recieve plants information
     * @param {boolean} options.moreInfo - Recieve more plants information
     * @param {boolean} options.alerts - Recieve alerts
     * @param {boolean} options.advices - Recieve advices
     * @param {boolean} options.devices - Recieve devices information
     * @param {timestamp} options.startDataTime - Start time for zone information received
     * @param {timestamp} options.endDataTime - End time for zone information received
     * @return {object} The ajax's call configuration.
     */
    getHomes(options) {
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.meteo = options.meteo ? 1 : 0;
        options.garden = options.garden ? 1 : 0;
        options.zone = options.zone ? 1 : 0;
        options.plants = options.plants ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.alerts = options.alerts ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        options.devices = options.devices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/user/homeList",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get a home and its information.
     * @param {number} id_home - Id of the home
     * @param {object} options - Information that will be recieved
     * @param {boolean} options.genericInfo - Recieve generic information
     * @param {boolean} options.meteo - Recieve meteo information
     * @param {boolean} options.garden - Recieve gardens information
     * @param {boolean} options.zone - Recieve zones information
     * @param {boolean} options.plants - Recieve plants information
     * @param {boolean} options.moreInfo - Recieve more plant information
     * @param {boolean} options.alerts - Recieve alerts
     * @param {boolean} options.advices - Recieve advices
     * @param {boolean} options.devices - Recieve devices information
     * @param {timestamp} options.startDataTime - Start time for zone information received
     * @param {timestamp} options.endDataTime - End time for zone information received
     * @return {object} The ajax's call configuration.
     */
    getHome(id_home, options) {
        options = options || {};
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.meteo = options.meteo ? 1 : 0;
        options.garden = options.garden ? 1 : 0;
        options.zone = options.zone ? 1 : 0;
        options.plants = options.plants ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.alerts = options.alerts ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        options.devices = options.devices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/info",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get generic information abaout a home.
     * @param {number} id_home - Id of the home
     * @return {object} The ajax's call configuration.
     */
    getHomeGenericInfo(id_home) {
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/genericInfo",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get the meteo of a home.
     * @param {number} id_home - Id of the home
     * @return {object} The ajax's call configuration.
     */
    getHomeMeteo(id_home) {
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/meteo",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get the devices of a home.
     * @param {number} id_home - Id of the home
     * @return {object} The ajax's call configuration.
     */
    getHomeDevices(id_home,options) {
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/devices",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to add a garden to a home.
     * @param {number} id_home - Id of the home
     * @param {garden} garden - Garden object to be added to the home
     * @return {object} The ajax's call configuration.
     */
    addGarden(id_home, garden) {
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/garden",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(garden)
        })
    }

    /**
     * Get call configuration to request a home modification.
     * @param {number} id_home - Id of the home
     * @param {home} home - New home information
     * @return {object} The ajax's call configuration.
     */
    modifyHome(id_home, home) {
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(home)
        })
    }

    /**
     * Get call configuration to request a home deletion.
     * @param {number} id_home - Id of the home
     * @return {object} The ajax's call configuration.
     */
    deleteHome(id_home) {
        id_home = id_home || 0;
        return super.ajax({
            "url": this.BASE_URL + "/home/" + id_home + "/delete",
            "method": "POST"
        });
    }
}

/**
 * Class that offers garden services.
 * @extends Service
 */
class GardenService extends Service {
    /**
     * @typedef {object} garden
     * @property {string} name - Name of the garden
     * @property {base64} image - Image of the garden (required if !map)
     * @property {object} map - Position of the garden in the world map (required if !image)
     * @property {number} map.lat - Latitude
     * @property {number} map.long - Longitude
     * @property {number} map.zoom - Camera zoom
     * @property {zone[]} zones - Zones ot the garden
     */

    /**
     * Get call configuration to get the list of all gardens and their information.
     * @param {object} options - Information that will be recieved
     * @param {boolean} options.genericInfo - Recieve generic information
     * @param {boolean} options.zone - Recieve zones information
     * @param {boolean} options.plants - Recieve plants information
     * @param {boolean} options.moreInfo - Recieve more plants information
     * @param {boolean} options.alerts - Recieve alerts
     * @param {boolean} options.advices - Recieve advices
     * @param {boolean} options.devices - Recieve devices information
     * @param {timestamp} options.startDataTime - Start time for zone information received
     * @param {timestamp} options.endDataTime - End time for zone information received
     * @return {object} The ajax's call configuration.
     */
    getGardens(options) {
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.zone = options.zone ? 1 : 0;
        options.plants = options.plants ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.alerts = options.alerts ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        options.devices = options.devices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/user/gardenList",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get a garden and its information.
     * @param {number} id_garden - Id of the garden
     * @param {object} options - Information that will be recieved
     * @param {boolean} options.genericInfo - Recieve generic information
     * @param {boolean} options.zone - Recieve zones information
     * @param {boolean} options.plants - Recieve plants information
     * @param {boolean} options.moreInfo - Recieve more plants information
     * @param {boolean} options.alerts - Recieve alerts
     * @param {boolean} options.advices - Recieve advices
     * @param {boolean} options.devices - Recieve devices information
     * @param {timestamp} options.startDataTime - Start time for zone information received
     * @param {timestamp} options.endDataTime - End time for zone information received
     * @return {object} The ajax's call configuration.
     */
    getGarden(id_garden, options) {
        options = options || {};
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.zone = options.zone ? 1 : 0;
        options.plants = options.plants ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.alerts = options.alerts ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        options.devices = options.devices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/garden/" + id_garden + "/info",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get the generic information of a garden.
     * @param {number} id_garden - Id of the garden
     * @return {object} The ajax's call configuration.
     */
    getGardenGenericInfo(id_garden) {
        return super.ajax({
            "url": this.BASE_URL + "/garden/" + id_garden + "/genericInfo",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to add a zone to a garden.
     * @param {number} id_garden - Id of the garden
     * @param {zone} zone - Zone object to be added to the garden
     * @return {object} The ajax's call configuration.
     */
    addZone(id_garden, zone) {
        return super.ajax({
            "url": this.BASE_URL + "/garden/" + id_garden + "/zone",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(zone)
        });
    }

    /**
     * Get call configuration to delete a garden.
     * @param {number} id_garden - Id of the garden
     * @return {object} The ajax's call configuration.
     */
    // deleteGarden(id_garden, password) {
    //     return super.ajax({
    //         "url": this.BASE_URL + "/garden/" + id_garden + "/delete",
    //         "method": "POST",
    //         "headers": {"content-type": "application/json"},
    //         "body": JSON.stringify({password: password})
    //     });
    // }
    deleteGarden(id_garden, uuid, verificationCode) {
        
        var verificationCode = {
            uuid: uuid,
            verificationCode: verificationCode
        };
        return super.ajax({
            "url": this.BASE_URL + "/garden/" + id_garden + "/delete",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(verificationCode)
        });
    }


    /**
     * Get call configuration to modify the zone information
     * @param {number} id_garden - Id of the garden
     */
    modifyZoneInformation(id_garden, information, uuid, verificationCode) {
        
        if(!information)information={};
        information.uuid=uuid;
        information.verificationCode=verificationCode;

        return super.ajax({
            "url": this.BASE_URL + "/garden/" + id_garden + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(information)
        });
    }
}

/**
 * Class that offers zone services.
 * @extends Service
 */
class ZoneService extends Service {
    /**
     * @typedef {object} zone
     * @property {string} name - Name of the zone
     * @property {number} zoneSituation - 1 || 2 (indoor || outdoor)
     * @property {number} light - 1,2,3,4 || 5,6,7 (indoor || outdoor)
     * @property {number[]} hoursAllowed - Range: 0 - 23
     * @property {number} irrigationType - 1 || 2 || 3
     * @property {number} caudalRefCustom - Pluviometer
     * @property {number} minutes - Recomended to the user => 5 || 25 (Sprinkler || Drip)
     * @property {number} minutesCustom - Selected by the user
     * @property {number} area
     * @property {object[]} plants
     * @property {number} plants[].idPlant
     * @property {number} plants[].plant_phase
     * @property {object[]} devices
     * @property {string} devices[].idDevice
     * @property {deviceType} devices[].type
     */



    /**
     * Get call configuration to get user zone list and its information.
     * @param {number} id_zone - Id of the zone
     * @param {object} options - Information that will be recieved
     * @param {boolean} options.genericInfo - Recieve generic information
     * @param {boolean} options.plants - Recieve plants information
     * @param {boolean} options.moreInfo - Recieve more plants information
     * @param {boolean} options.alerts - Recieve alerts
     * @param {boolean} options.advices - Recieve advices
     * @param {boolean} options.devices - Recieve devices information
     * @param {timestamp} options.startDataTime - Start time for zone information received
     * @param {timestamp} options.endDataTime - End time for zone information received
     * @return {object} The ajax's call configuration.
     */
    getZones(options) {
        options = options || {};
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.plants = options.plants ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.alerts = options.alerts ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        options.devices = options.devices ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/user/zoneList",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get a zone and its information.
     * @param {number} id_zone - Id of the zone
     * @param {object} options - Information that will be recieved
     * @param {boolean} options.genericInfo - Recieve generic information
     * @param {boolean} options.plants - Recieve plants information
     * @param {boolean} options.moreInfo - Recieve more plants information
     * @param {boolean} options.alerts - Recieve alerts
     * @param {boolean} options.advices - Recieve advices
     * @param {boolean} options.devices - Recieve devices information
     * @param {timestamp} options.startDataTime - Start time for zone information received
     * @param {timestamp} options.endDataTime - End time for zone information received
     * @return {object} The ajax's call configuration.
     */
    getZone(id_zone, options) {
        options = options || {};
        options.genericInfo = options.genericInfo ? 1 : 0;
        options.plants = options.plants ? 1 : 0;
        options.moreInfo = options.moreInfo ? 1 : 0;
        options.alerts = options.alerts ? 1 : 0;
        options.advices = options.advices ? 1 : 0;
        options.devices = options.devices ? 1 : 0;
        options.firstIrrigation = options.firstIrrigation ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/info",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get generic information of a zone.
     * @param {number} id_zone - Id of the zone
     * @return {object} The ajax's call configuration.
     */
    getZoneGenericInfo(id_zone) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/genericInfo",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get plants information of a zone.
     * @param {number} id_zone - Id of the zone
     * @param {number} moreInfo - Recieve more plants information
     * @return {object} The ajax's call configuration.
     */
    getZonePlants(id_zone, moreInfo) {
        moreInfo = moreInfo ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/plants",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({"moreInfo": moreInfo})
        });
    }

    /**
     * Get call configuration to get the alerts of a zone.
     * @param {number} id_zone - Id of the zone
     * @param {object} options - Information that will be recieved
     * @param {number} options.lightSensor
     * @param {number} options.tempSensor
     * @param {number} options.meteoSensor
     * @param {number} options.airhSensor
     * @param {number} options.maintSensor
     * @param {number} options.soilmSensor
     * @param {number} options.fertSensor
     * @return {object} The ajax's call configuration.
     */
    getZoneAlerts(id_zone, options) {
        options = options || {};
        options.lightSensor = options.lightSensor ? 1 : 0;
        options.tempSensor = options.tempSensor ? 1 : 0;
        options.meteoSensor = options.meteoSensor ? 1 : 0;
        options.airhSensor = options.airhSensor ? 1 : 0;
        options.maintSensor = options.maintSensor ? 1 : 0;
        options.soilmSensor = options.soilmSensor ? 1 : 0;
        options.fertSensor = options.fertSensor ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/alerts",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to get the advices of a zone.
     * @param {number} id_zone - Id of the zone
     * @param {object} options - Information that will be recieved
     * @param {number} options.lightSensor
     * @param {number} options.tempSensor
     * @param {number} options.meteoSensor
     * @param {number} options.airhSensor
     * @param {number} options.maintSensor
     * @param {number} options.soilmSensor
     * @param {number} options.fertSensor
     * @return {object} The ajax's call configuration.
     */
    getZoneAdvices(id_zone, options) {
        options = options || {};
        options.lightSensor = options.lightSensor ? 1 : 0;
        options.tempSensor = options.tempSensor ? 1 : 0;
        options.meteoSensor = options.meteoSensor ? 1 : 0;
        options.airhSensor = options.airhSensor ? 1 : 0;
        options.maintSensor = options.maintSensor ? 1 : 0;
        options.soilmSensor = options.soilmSensor ? 1 : 0;
        options.fertSensor = options.fertSensor ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/advices",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    /**
     * Get call configuration to send the action selected by the user on alert or advice
     * @param {number} id_zone - Id of the zone
     * @param {number} id_alert - Id of the alert
     * @param {object} action - One of the actions sended by the server.
     * @return {object} The ajax's call configuration.
     */
    sendAlertAction(id_zone, id_alert, action) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/alertAction/" + id_alert,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(action)
        });
    }

    /**
     * Get call configuration to get zone limits.
     * @param {number} id_zone - Id of the zone
     * @return {object} The ajax's call configuration.
     */
    getZoneLimits(id_zone) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/limits",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get zone data between two times.
     * @param {number} id_zone - Id of the zone
     * @param {number} startTime - Start time for data received
     * @param {number} endTime - End time for data received
     * @return {object} The ajax's call configuration.
     */
    getZoneData(id_zone, startTime, endTime) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/data/" + startTime + "/" + endTime,
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get zone data between two times.
     * @param {number} id_zone - Id of the zone
     * @param {number} startTime - Start time for data received
     * @param {number} endTime - End time for data received
     * @return {object} The ajax's call configuration.
     */
    getZoneDataCSV(id_zone, startTime, endTime) {
        return super.blob("POST", this.BASE_URL + "/zone/" + id_zone + "/data/" + startTime + "/" + endTime + "/csv", "data_" +id_zone+"_"+ Date.now() + ".csv");
    }

    

    /**
     * Get call configuration to get zone flow data between two times.
     * @param {number} id_zone - Id of the zone
     * @param {number} startTime - Start time for data received
     * @param {number} endTime - End time for data received
     * @return {object} The ajax's call configuration.
     */
    getZoneFlowDataCSV(id_zone, startTime, endTime) {
        return super.blob("POST", this.BASE_URL + "/zone/" + id_zone + "/flowData/" + startTime + "/" + endTime + "/csv", "flowData_" +id_zone+"_"+ Date.now() + ".csv");
    }

    /**
     * Get call configuration to get zone data between two times.
     * @param {number} id_zone - Id of the zone
     * @param {number} startTime - Start time for data received
     * @param {number} endTime - End time for data received
     * @return {object} The ajax's call configuration.
     */
    getZoneTaskManagerHistory(id_zone, startTime, endTime) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/taskManagerHistory/" + startTime + "/" + endTime,
            "headers": {"content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({})
        });
    }

    /**
     * Get call configuration to get zone data between two times.
     * @param {number} id_zone - Id of the zone
     * @param {number} startTime - Start time for data received
     * @param {number} endTime - End time for data received
     * @return {object} The ajax's call configuration.
     */
    getZoneIrrigationHistory(id_zone, startTime, endTime) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/irrigationHistory/" + startTime + "/" + endTime,
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get the irrigation program.
     * @param {number} id_zone - Id of the zone
     */
    getZoneIrrigationProgram(id_zone) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/irrigationPrograms/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
        });
    }

    /**
     * Get call configuration to remove the irrigation program.
     * @param {number} id_program - Id of the irrigation program
     */
    deleteIrrigationProgram(id_program,uuid,verificationCode) {
        return super.ajax({
            "url": this.BASE_URL + "/irrigationProgram/" + id_program + "/delete",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({uuid:uuid,verificationCode:verificationCode})
        });
    }

    /**
     * Get call configuration to modify the irrigation program.
     * @param {number} id_program - Id of the irrigation program
     */
    modifyIrrigationProgram(id_program, program, uuid,verificationCode) {
        if(!program)program={};
        program.uuid=uuid;
        program.verificationCode=verificationCode;
        return super.ajax({
            "url": this.BASE_URL + "/irrigationProgram/" + id_program + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(program)
        });
    }

    /**
     * Get call configuration to cancel a manual pending irrigation
     * @param {number} id_program - Id of the manual irrigation program to cancel
     * @param {object} data (optional. It could be empty). - Message of task manager history. Useful for futures implementations
     * @return {object} The ajax's call configuration.
     */
    cancelManualPendingIrrigation(idProgram, data,uuid,verificationCode) {
        if(!data)data={};
        data.uuid=uuid;
        data.verificationCode=verificationCode;
        return super.ajax({
            "url": this.BASE_URL + "/irrigationProgram/" + idProgram + "/cancelManualPendingIrrigation",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(data)
        });
    }

    /**
     * Get call configuration to cancel a manual pending irrigation
     * @param {number} id_program - Id of the manual irrigation program to cancel
     * @param {object} data (optional. It could be empty). - Message of task manager history. Useful for futures implementations
     * @return {object} The ajax's call configuration.
     */
    deleteManualPendingIrrigation(idProgram, data,uuid,verificationCode) {
        if(!data)data={};
        data.uuid=uuid;
        data.verificationCode=verificationCode;
        return super.ajax({
            "url": this.BASE_URL + "/irrigationProgram/" + idProgram + "/deleteManualPendingIrrigation",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(data)
        });
    }


    /**
     * Get call configuration to add a device to a zone.
     * @param {number} id_zone - Id of the zone
     * @param {string} id_device - Id of the device
     * @param {deviceType} type - Type of the device
     * @return {object} The ajax's call configuration.
     */
    addDevice(id_zone, id_device, type) {
        var data = new FormData();
        data.append("type", type);
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/device/" + id_device,
            "method": "PUT",
            "processData": false,
            "contentType": false,
            "mimeType": "multipart/form-data",
            "body": JSON.stringify(data)
        });
    }

    /**
     * Get call configuration to zone alerts history between two times.
     * @param {number} id_zone - Id of the zone
     * @param {timestamp} startTime - Start time
     * @param {timestamp} endTime - End time
     * @return {object} The ajax's call configuration.
     */
    getAlertsHistory(id_zone, startTime, endTime) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/alertsHistory/" + startTime + "/" + endTime,
            "method": "GET"
        });
    }

    /**
     * Get call configuration to add a plant to a zone.
     * @param {number} id_zone - Id of the zone
     * @param {number} id_plant - Id of the plant
     * @param {number} plant_phase -> Phase of the plant
     * @return {object} The ajax's call configuration.
     */
    addPlant(id_zone, id_plant, plant_phase) {
        var data = new FormData();
        data.append("plant_phase", plant_phase);
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/plants/" + id_plant,
            "method": "PUT",
            "processData": false,
            "contentType": false,
            "mimeType": "multipart/form-data",
            "body": JSON.stringify(data)
        });
    }

    /**
     * Get call configuration to set the plants of a zone
     * @param {number} id_zone - Id of the zone
     * @param {object[]} plants - List of plants
     * @param {number} plants[].idPlant - Id of the plant
     * @param {number} plants[].plant_phase - Phase of the plant
     * @return {object} The ajax's call configuration.
     */
    modifyPlants(id_zone, plants) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/modifyPlants",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify({plants: plants})
        });
    }

    /**
     * Get call configuration to delete a zone.
     * @param {number} id_zone - Id of the zone
     * @return {object} The ajax's call configuration.
     */
    deleteZone(id_zone, password) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/delete",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({password: password})
        });
    }

    /**
     * Get call configuration to delete a zone.
     * @param {number} id_zone - Id of the zone
     * @return {object} The ajax's call configuration.
     */
    sendMailRequestDelete(option) {
        return super.ajax({
            "url": this.BASE_URL + "/requestDelete",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(option)
        });
    }

    /**
     * Get call configuration to modify a zone.
     * @param {number} id_zone - Id of the zone
     * @param {zone} zone - New zone information
     * @return {object} The ajax's call configuration.
     */
    modifyZone(id_zone, zone) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(zone)
        });
    }

    /**
     * Get call configuration to put zone irrigation.
     * @param {number} id_zone - Id of the zone
     * @param {object} irrigation - Object with irrigation parameters
     * @param {number} irrigation.restriction - (optional) 0 irrigation, 1 restriction, 2 allowed time
     * @param {number} irrigation.repeat - (optional) 0 none, 1 every year, 2 every month, 3 every week, 4 all
     * @param {timestamp} irrigation.startTime - (only if restriction!=2)
     * @param {timestamp} irrigation.endTime - (only if restriction==1)
     * @param {number[]} irrigation.hoursAllowed - (only if restriction==2) [1,2,3,...,19,20,21,22,23], GMT+0
     *
     * @example Example with restriction 0.
     * // Returns ajax's call configuration to put a manual irrigation every day on zone 1.
     * putZoneIrrigation(1,{ "restriction":0, "repeat":5, "startTime":1502208776 });
     * @example Example with restriction 1.
     * // Returns ajax's call configuration to put an irrigation restriction for all day on zone 1.
     * putZoneIrrigation(1,{ "restriction":1, "repeat":4, "startTime":1502150400 });
     * @example Example with restriction 2.
     * // Returns ajax's call configuration to change the hours that are allowed to irrigate on zone 1.
     * putZoneIrrigation(2,{ "restriction":2, "hoursAllowed":[0,1,2,5,6,7,21,22] });
     *
     * @return {object} The ajax's call configuration.
     */
    putZoneIrrigation(id_zone, irrigation,uuid,verificationCode) {

        if(!irrigation)irrigation={};
        irrigation.uuid=uuid;
        irrigation.verificationCode=verificationCode;
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/irrigation",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "processData": false,
            "body": JSON.stringify(irrigation)
        });
    }

    /**
     * Get call configuration to send the action selected by the user on alert or advice
     * @param {number} id_zone - Id of the zone
     * @param {timestamp} replantTime - Replant time
     * @param {object} action - One of the actions sended by the server.
     * @return {object} The ajax's call configuration.
     */
    updateReplantTime(id_zone, replantTime,maxCalibrationTime) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/updateReplantTime",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({replantTime: replantTime,maxCalibrationTime:maxCalibrationTime})
        });
    }

    /**
     * Get call configuration to set UR Custom (In order to recfact the water limit 33)
     * @param {number} id_zone - Id of the zone
     * @param {string} action - "increase", "decrease" or "default. Increase/Decrease a % respect the current URCustom. If "default" then UR_custom=UR
     * @return {object} The ajax's call configuration.
     */
    setURCustom(id_zone, action) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/setURCustom",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({action: action})
        });
    }

}

/**
 * Class that offers extra services.
 * @extends Service
 */
class ExtraService extends Service {
    /**
     * Get call configuration to get any bad alert on your zones.
     * @return {object} The ajax's call configuration.
     */
    getBadAlerts() {
        return super.ajax({
            "url": this.BASE_URL + "/zones/badAlert",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get a list with all existing errors.
     * @return {object} The ajax's call configuration.
     */
    getErrors() {
        return super.ajax({
            "url": this.BASE_URL + "/errors",
            "method": "GET"
        });
    }

    /**
     * Get call configuration to get a list with all existing errors.
     * @param {object} token
     * @param {number} token.type - Type of the token (1->iOs || 2->android)
     * @param {string} token.token - Token of the device
     * @return {object} The ajax's call configuration.
     */
    registerToken(token) {
        return super.ajax({
            "url": this.BASE_URL + "/registerToken",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({token: token, type: (Platform.OS === 'ios'? 1 : 2)})
        });
    }

    removeUserNotification(notificationId) {
        return super.ajax({
            "url": this.BASE_URL + "/notificationPush" + "/delete",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({id: notificationId, type: 2})
        });
    }

    /**
     * Get call configuration to get the last update for the lenguage update.
     * @return {object} The ajax's call configuration.
     */
    getTranslationLastUpdate(language) {
        return super.ajax({
            "url": this.BASE_URL + "/translate/app/" + language + "/last",
            "method": "GET"
        }, true);
    }

    /**
     * Get call configuration to get a list with all existing strings in the language selected.
     * @return {object} The ajax's call configuration.
     */
    getTranslation(language, mantainLang) {
        mantainLang = mantainLang? "true" : "false";
        return super.ajax({
            "url": this.BASE_URL + "/translate/app/" + language + "/" + mantainLang,
            "method": "GET"
        }, true);
    }

    /**
     * Get a large image to do a test connection
     * @return {image}
     */
    connectionTest(language) {
        return super.pureAjax({
            "url": this.BASE_URL + "/connectionTest",
            "method": "GET"
        }, true);
    }

    /**
     * Get a image in base64
     * @return {image}
     */
    getImage(url) {
        return new Promise(function (resolve, reject) {
            axios.get(url, {responseType: 'arraybuffer'}).then(function (img) {

                var imgString;
                if (img.request && img.request._response) {
                    imgString = img.request._response;
                } else if (img.data) {
                    var uarr = new Uint8Array(img.data);
                    var strings = [], chunksize = 0x1fff;
                    var len = uarr.length;

                    // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
                    for (var i = 0; i * chunksize < len; i++) {
                        strings.push(String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize)));
                    }
                    imgString = btoa(strings.join(''));
                }
                resolve('data:image/png;base64,' + imgString);

            }, reject);
        });

    }

    getLanguages() {
        return super.ajax({
            "url": this.BASE_URL + "/languages",
            "method": "GET"
        }, true);
    }

    sendInitialData(data) {
        return super.ajax({
            "url": this.BASE_URL + "/initialCostData",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    testing(data) {
        return super.ajax({
            "url": this.BASE_URL + "/testing",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    /**
     * Get the farming station price
     * @return {number}
     */
    getFarmingStationPrices(forWhat,markers) {
        return super.ajax({
            "url": this.BASE_URL + "/farmingStationPrices",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({markers: markers,forWhat:forWhat})
        });
    }

    /**
     * Get the installation price
     * @return {number}
     */
    getInstallationPrice(data) {
        return super.ajax({
            "url": this.BASE_URL + "/installationPrice",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    getHtmlContract(data) {
        return super.ajax({
            "url": this.BASE_URL + "/htmlTerms",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    /**
     * Poly request
     */
    polyRequest(data, ignore, method) {
        var method = method? method : "polyRequest";
        return super.ajax({
            "url": this.BASE_URL + "/" + method,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({urls: data})
        }, ignore? true : false);
    }

};


/**
 * Class that offers gardener services.
 * @extends Service
 */
class GardenerService extends Service {

    getGardenerHomes(options) {
        options.genericInfo = options.genericInfo ? 1 : 0;
        return super.ajax({
            "url": this.BASE_URL + "/gardener/home",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        }, true);
    }

    getGardenerUsers() {
        return super.ajax({
            "url": this.BASE_URL + "/gardener/users",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    putGardenerUser(email) {
        return super.ajax({
            "url": this.BASE_URL + "/gardener/user/" + email,
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        }, true);
    }

    deleteGardenerUser(id_user) {
        return super.ajax({
            "url": this.BASE_URL + "/gardener/user/" + id_user,
            "method": "DELETE"
        });
    }

    getGardenerUserInformation(email) {
        return super.ajax({
            "url": this.BASE_URL + "/gardener/user/" + email,
            "method": "GET",
            "headers": {"content-type": "application/json"},
        }, true);
    }

    modifyUserClientObject(idUser,data){
        return super.ajax({
            "url": this.BASE_URL + "/gardener/addClientObject/"+idUser,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addClientObject(data){
        return super.ajax({
            "url": this.BASE_URL + "/gardener/addClientObject/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

}

/**
 * Class that offers academy services.
 * @extends Service
 */
class AcademyService extends Service {

    getCourses(data) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/courses",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    getCourse(idCourse) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/course/" + idCourse,
            "method": "POST",
            "headers": {"content-type": "application/json"}
        });
    }

    getCourseByUUID(uuid) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/course/url/" + uuid,
            "method": "POST",
            "headers": {"content-type": "application/json"}
        });
    }

    getComponent(idComponent){
        return super.ajax({
            "url": this.BASE_URL + "/academy/component/"+idComponent,
            "method": "GET",
            "headers": {"content-type": "application/json"}
        });
    }

    checkExam(idCourse, data, idExam) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/checkExam/" + idCourse + "/" + idExam,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    resetExam(idCourse, idExam) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/resetExam/" + idCourse + "/" + idExam,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        }, true);
    }

    addCourse(course, files, onProgress) {
        return super.multipartFormData("PUT", this.BASE_URL + "/academy/course2/", course, [], onProgress, true)
    }

    deleteCourse(idCourse) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/course/" + idCourse,
            "method": "DELETE",
        }, true);
    }

    getBusinessWorkOrders() {
        return super.ajax({
            "url": this.BASE_URL + "/academy/businessWorkOrders",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }
    
    addWorkOrderTemplate(data) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/workOrderTemplate",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addWorkOrder({
        idUser,
        datetime
    }) {
        console.log("apiService addWorkOrder", idUser, datetime)
        let url = "";
        if (idUser) {
            url = `/academy/${idUser}/workOrder`
        } else {
            url = `/academy/workOrder`
        }
        return super.ajax({
            "url": this.BASE_URL + url,
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                datetime: datetime
            })
        }, true);
    }

    getTask(idTask) {
        return super.ajax({
            "url": this.BASE_URL + `/taskManager/task/${idTask}`,
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    deleteTask(idTask) {
        return super.ajax({
            "url": this.BASE_URL + `/taskManager/task/${idTask}`,
            "method": "DELETE",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    getTasks() {
        return super.ajax({
            "url": this.BASE_URL + "/taskManager/tasks",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    createTask(data) {
        return super.ajax({
            "url": this.BASE_URL + "/taskManager/task",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    editTask(data, idTask) {
        return super.ajax({
            "url": this.BASE_URL + `/taskManager/task/${idTask}/modify`,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    updateWorkOrderTemplate(idCourse, data) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/workOrderTemplate/" + idCourse,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    updateWorkOrder(idCourse, data) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/workOrder/" + idCourse,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    deleteWorkOrderTemplate(idCourse) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/workOrderTemplate/" + idCourse,
            "method": "DELETE",
        }, true);
    }

    deleteWorkOrder(idCourse) {        
        return super.ajax({
            "url": this.BASE_URL + "/academy/workOrder/" + idCourse,
            "method": "DELETE",
        }, true); 
    }

    assignEmployeeWorkOrderTemplate(idCourse,idEmployee) {
        /*
            body:{
                idCourse
                idUser
            }
        */
        return super.ajax({
            "url": this.BASE_URL + "/academy/workOrderTemplate/"+idEmployee+"/assign",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                idCourse:idCourse
            })
        }, true);
    }


    setMaxPage(idCourse, numPage) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/course/" + idCourse + "/setMaxPage",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(numPage)
        }, true);
    }
    modifyCourse(idCourse, course, files, onProgress) {
        console.log("AcademyService modifyCourse", idCourse);
        return super.multipartFormData("POST", this.BASE_URL + "/academy/course/" + idCourse + "/modify2", course, files, onProgress, true);
//        return new Promise((resolve, reject) => {
//            super.multipartFormData("POST", this.BASE_URL + "/academy/course/" + idCourse + "/modify2", course, files, onProgress, true).then(response => {
//                resolve(response);
//            }, err => {
//                reject(err);
//            });
//        });
    }

    getDownloadFile(url, name,asBase64) {
        return super.blob("GET", url, name,null,asBase64);
    }

    setSizeImageByComponentId(id, type, width, height) {
        return super.ajax({
            "url": this.BASE_URL + "/academy/course/" + id + "/setSizeImage",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({type: type, width: width, height: height})
        });
    }

};


/**
 * Class that offers visitor services.
 * @extends Service
 */
class VisitorService extends Service {

    getVisitorHomes() {
        return super.ajax({
            "url": this.BASE_URL + "/visitor/home",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    getVisitorUsers() {
        return super.ajax({
            "url": this.BASE_URL + "/visitor/users",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    putVisitorUser(email) {
        return super.ajax({
            "url": this.BASE_URL + "/visitor/user/" + email,
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    deleteVisitorUser(id_user) {
        return super.ajax({
            "url": this.BASE_URL + "/visitor/user/" + id_user,
            "method": "DELETE",
        });
    }

    getVisitorUserInformation(email) {
        return super.ajax({
            "url": this.BASE_URL + "/visitor/user/" + email,
            "method": "GET",
            "headers": {"content-type": "application/json"},
        }, true);
    }

};


/**
 * Class that offers invoice services.
 * @extends Service
 */
class InvoiceService extends Service {

    getClientInformation(idUser) {
        return super.ajax({
            "url": this.BASE_URL + "/user/profile/"+(idUser?idUser:""),
            "method": "POST",
            "headers": {"content-type": "application/json"},
        });
    }

    getOrders(options) {
        return super.ajax({
            "url": this.BASE_URL + "/store/orders/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    getProducts() {
        return super.ajax({
            "url": this.BASE_URL + "/store/products/",
            "method": "GET",
            "headers": {"content-type": "application/json"},
        }, true);
    }

    putProduct(data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/product/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);

    }

    modifyProduct(product,data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/product/"+product+"/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);

    }

    deleteProduct(product) {
        return super.ajax({
            "url": this.BASE_URL + "/store/product/" + product,
            "method": "DELETE",
        }, true);
    }

    putOrder(invoice) {
        console.log("putInvoice api", invoice);
        return super.ajax({
            "url": this.BASE_URL + "/store/order/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(invoice)
        }, true);
    }

    getInvoices(idOrder) {
        var body = {};
        if (idOrder)
            body.idOrder = idOrder;

        return super.ajax({
            "url": this.BASE_URL + "/store/orders/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(body)
        });
    }

    convertOrderToInvoice(idOrder, dateInvoiceCustom, isRecurrent, dayOfMonth, sendEmail, emailAddress, dueDays, invoicingPeriodStart, invoicingPeriodEnd) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/bill",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({date: dateInvoiceCustom, isRecurrent: isRecurrent, dayOfMonth: dayOfMonth, sendEmail: sendEmail, emailAddress: emailAddress, dueDays: dueDays,invoicingPeriodStart:invoicingPeriodStart,invoicingPeriodEnd:invoicingPeriodEnd})
        }, true);
    }

    setURCustom(id_zone, action) {
        return super.ajax({
            "url": this.BASE_URL + "/zone/" + id_zone + "/setURCustom",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({action: action})
        });
    }

    modifyOrderBill(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/modify/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    getDownloadFile(url, name, asBase64) {
        console.log("blob", url, name);
        return super.blob("GET", url, name, null, asBase64);
    }

    deleteFields(idFields) {
        console.log("deleting order " + idFields);
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idFields,
            "method": "DELETE",
        });
    }

    setBillStatus(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/setBillStatus",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    setOrderStatus(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/setOrderStatus",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addTickets(idOrder, tickets) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/addTickets",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(tickets)
        }, true);
    }

    removeTicket(idOrder, idTicket) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/removeTicket",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({idTicket: idTicket})
        }, true);
    }

    getTicketsByIdUser(idUser) {
        return super.ajax({
            "url": this.BASE_URL + "/store/getTicketsByIdUser/" + idUser,
            "method": "GET",
            "headers": {"content-type": "application/json"},
        }, true);
    }

    setRecurrence(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/setRecurrence",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    resendInvoiceEmail(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/resendInvoiceEmail",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    resendOrderEmail(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/resendOrderEmail",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addFilesToOrder(idOrder, data, files, onProgress) {
        //console.log("InvoiceService addFilesToOrder", idOrder, data, files, onProgress);
        return super.multipartFormData("POST", this.BASE_URL + "/store/" + idOrder + "/addFilesToOrder", data, files, onProgress, true)
    }

    addFilesToBill(idBill, data, files, onProgress) {
        //console.log("InvoiceService addFilesToBill", idBill, data, files, onProgress);
        return super.multipartFormData("POST", this.BASE_URL + "/store/" + idBill + "/addFilesToBill", data, files, onProgress, true)
    }

    deleteFileFromOrder(idOrder, idFile) {
        return super.ajax({
            "url": this.BASE_URL + "/store/deleteFileFromOrder/" + idOrder + "/" + idFile,
            "method": "DELETE",
        });
    }

    signOrder(idOrder, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/signOrder/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    canDeleteOrder(idOrder) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder + "/canDelete/",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    deleteOrder(idOrder){
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idOrder,
            "method": "DELETE",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    deleteFileFromBill(idBill, idFile) {
        return super.ajax({
            "url": this.BASE_URL + "/store/deleteFileFromBill/" + idBill + "/" + idFile,
            "method": "DELETE",
        });
    }

    modifyContract(idContract, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idContract + "/modifyContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    signContract(idContract, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idContract + "/signContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    /*
     * type:
     *  - not-signed
     *  - signed
     *  - all
     */
    getContracts(type) {
        if (!type) type = 'all';
        return super.ajax({
            "url": this.BASE_URL + "/store/contracts/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({type: type})
        });
    }

    getSepaDocuments() {
        return super.ajax({
            "url": this.BASE_URL + "/store/getSepaDocuments/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }
    
    getSepaDocument(options){
        return super.ajax({
            "url": this.BASE_URL + "/store/getSepaDocument/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    getSepaAuthorization() {
        return super.ajax({
            "url": this.BASE_URL + "/store/getSepaAuthorization/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    addSepa(data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/addSepa/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    modifySepa(idSepa, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idSepa + "/modifySepa/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    signSepa(idSepa, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idSepa + "/signSepa/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    getInvitations() {
        return super.ajax({
            "url": this.BASE_URL + "/store/getInvitations/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    addInvitation(data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/addInvitation/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    modifyInvitation(idInvitation, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idInvitation + "/modifyInvitation/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addAngelContract(data) {
        var test =false;
        return super.ajax({
            "url": this.BASE_URL + "/store/addAngelContract/",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    /*
     * type:
     *  - not-signed
     *  - signed
     *  - all
     */
    getAngelContracts(type) {
        if (!type) type = 'all';
        return super.ajax({
            "url": this.BASE_URL + "/store/getAngelContracts/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({type: type})
        });
    }

    getAngelContract(options){
        return super.ajax({
            "url": this.BASE_URL + "/store/getAngelContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(options)
        });
    }

    modifyAngelContract(idContract, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idContract + "/modifyAngelContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    modifyGenericContract(idContract,data){
        return super.ajax({
            "url": this.BASE_URL + "/store/contract/"+idContract+"/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addContractTemplate(data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/contracts/template",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    modifyContractTemplate(idTemplate,data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/contracts/template/"+idTemplate+"/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    deleteContractTemplate(idTemplate) {
        return super.ajax({
            "url": this.BASE_URL + "/store/contracts/template/"+idTemplate,
            "method": "DELETE",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    signAngelContract(idContract, data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idContract + "/signAngelContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    getParentHtmlAngelContract() {
        return super.ajax({
            "url": this.BASE_URL + "/store/getParentHtmlAngelContract/",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    getContractTemplates() {
      return super.ajax({
          "url": this.BASE_URL + "/store/contracts/templates",
          "method": "GET",
          "headers": {"content-type": "application/json"}
      }, true);
    }

    modifyParentAngelContract(data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/modifyParentAngelContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    deleteAngelContract(idContract) {
        return super.ajax({
            "url": this.BASE_URL + "/store/" + idContract + "/deleteAngelContract/",
            "method": "DELETE",
        }, true);
    }

    getParentHtmlContract() {
        return super.ajax({
            "url": this.BASE_URL + "/store/getParentHtmlContract/",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    modifyParentContract(data) {
        return super.ajax({
            "url": this.BASE_URL + "/store/modifyParentContract/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    addFacturae(idOrder,idAmendedBill) {
      return super.ajax({
          "url": this.BASE_URL + "/store/facturae/" + (idAmendedBill?"amended/"+idAmendedBill:""+idOrder),
          "method": "PUT",
          "headers": {"content-type": "application/json"}
      }, true);
    }

    getFacturae(idOrder,idAmendedBill) {
      return super.ajax({
          "url": this.BASE_URL + "/store/facturae/" + (idAmendedBill?"amended/"+idAmendedBill:""+idOrder),
          "method": "GET",
          "headers": {"content-type": "application/json"}
      }, true);
    }

    downloadFacturae(idOrder,idAmendedBill,fileName) {
      /*
        return super.ajax({
            "url": this.BASE_URL + "/store/facturae/download/" + (idAmendedBill?"amended/"+idAmendedBill:""+idOrder),
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
      */
      return super.blob("GET", this.BASE_URL + "/store/facturae/download/" + (idAmendedBill?"amended/"+idAmendedBill:""+idOrder),fileName);
    }

    signFacturae(id,data) {
      return super.ajax({
          "url": this.BASE_URL + "/store/facturae/sign/"+id,
          "method": "POST",
          "headers": {"content-type": "application/json"},
          "body": JSON.stringify(data)
      }, true);
    }

    getAmendedBillReasonCodes(){
      return super.ajax({
          "url": this.BASE_URL + "/store/amendedbill/reasonCodes",
          "method": "GET",
          "headers": {"content-type": "application/json"}
      }, true);
    }

    putAmendedBill(idOrder,data){
      if(!data)data={};
      return super.ajax({
          "url": this.BASE_URL + "/store/"+idOrder+"/amendedbill",
          "method": "PUT",
          "headers": {"content-type": "application/json"},
          "body": JSON.stringify(data)
      }, true);
    }

    getMinBillDate(idUser){
      return super.ajax({
        "url": this.BASE_URL + "/store/user/"+idUser+"/minBillDate",
        "method": "GET",
        "headers": {"content-type": "application/json"}
      })
    }


};


/**
 * Class that offers invoice services.
 * @extends Service
 */
class CalendarService extends Service {

    getCalendarTasks(month, year) {
        return super.ajax({
            "url": this.BASE_URL + "/calendar/tasks/"+month+"/"+year,
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    getAllCalendarTasks(){
        return super.ajax({
            "url": this.BASE_URL + "/calendar/tasks",
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    addCalentarTask(data) {
        if(!data)data={};
        return super.ajax({
            "url": this.BASE_URL + "/calendar/task",
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    modifyCalentarTask(id,data) {
        return super.ajax({
            "url": this.BASE_URL + "/calendar/task/"+id+"/modify",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    deleteCalentarTask(id) {
        return super.ajax({
            "url": this.BASE_URL + "/calendar/task/" + id,
            "method": "DELETE"
        }, true);
    }

};


/**
 * Class that offers academy services.
 * @extends Service
 */
class EmailService extends Service {

    getNewMailingTemplate(type, assignTo, lang) {
        return super.ajax({
            "url": this.BASE_URL + "/email/getNewMailingTemplate",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({type: type, assignTo: assignTo, lang: lang})
        });
    }

    sendEmail(data) {
        return super.ajax({
            "url": this.BASE_URL + "/email/sendEmail",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    getEmailTemplates(type) {
        return super.ajax({
            "url": this.BASE_URL + "/email/getEmailTemplates/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({type: type})
        });
    }

    getDefaultEmailTemplates() {
        return super.ajax({
            "url": this.BASE_URL + "/email/getDefaultEmailTemplates/",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({})
        });
    }

    saveEmailTemplate(data) {
        return super.ajax({
            "url": this.BASE_URL + "/email/saveEmailTemplate",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        });
    }

    deleteEmailTemplate(id) {
        return super.ajax({
            "url": this.BASE_URL + "/email/deleteEmailTemplate/" + id,
            "method": "DELETE"
        }, true);
    }

    getInvitation(type, hash, email) {
        return super.ajax({
            "url": this.BASE_URL + "/email/getInvitation",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({type: type, hash: hash, email: (email? email : '')})
        });
    }

};


class BackgroundUploadService extends Service {

    backgroundUploadFile(data){
        return super.ajax({
            "url": this.BASE_URL + "/asyncUpload",
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify(data)
        }, true);
    }

    deleteBackgroundUploadFile(data) {
        return super.ajax({
            "url": this.BASE_URL + "/asyncUpload/"+data.id,
            "method": "DELETE"
        }, true);
    }

};

class ClockInService extends Service {
    getClockInData() {
        return super.ajax({
            "url": `${this.BASE_URL}/clockin`,
            "method": "GET",
            "headers": {"content-type": "application/json"}
        }, true);
    }

    updateClockIn({ id, action, latitude, longitude, comment, startDate, endDate, endIsStop }) {
        return super.ajax({
            "url": `${this.BASE_URL}/clockin/${id}/update`,
            "method": "PUT",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                action: action, 
                latitude: latitude, 
                longitude: longitude,
                comment: comment || "",
                startDate: startDate || null,
                endDate: endDate || null,
                endIsStop: endIsStop || false
            })

        }, true);
    }

    updateAction(actionData) {
        /* console.log({
            ...actionData
        }) */
        return super.ajax({
            "url": `${this.BASE_URL}/clockin/update/${actionData.id}`,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                ...actionData
            })
        }, true);
    }

    deleteAction(id) {
        return super.ajax({
            "url": `${this.BASE_URL}/clockin/update/${id}`,
            "method": "POST",
            "headers": {"content-type": "application/json"},
            "body": JSON.stringify({
                deleted : 1
            })

        }, true);
    }

    addClockIn() {
        return super.ajax({
            "url": `${this.BASE_URL}/clockin`,
            "method": "PUT",
            "headers": {"content-type": "application/json"}
        }, true);
    }
}

export var
        userService = new UserService(),
        locationService = new LocationService(),
        plantService = new PlantService(),
        deviceService = new DeviceService(),
        homeService = new HomeService(),
        gardenService = new GardenService(),
        zoneService = new ZoneService(),
        extraService = new ExtraService(),
        gardenerService = new GardenerService(),
        academyService = new AcademyService(),
        invoiceService = new InvoiceService(),
        calendarService = new CalendarService(),
        visitorService = new VisitorService(),
        emailService = new EmailService(),
        backgroundUploadService = new BackgroundUploadService(),
        clockInService = new ClockInService()
