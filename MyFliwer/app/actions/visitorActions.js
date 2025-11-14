export const VISITOR_GET_HOMES = 'VISITOR_GET_HOMES';
export const VISITOR_GET_USERS = 'VISITOR_GET_USERS';
export const VISITOR_PUT_USERS = 'VISITOR_PUT_USERS';
export const VISITOR_DELETE_USER = 'VISITOR_DELETE_USER';
export const VISITOR_WIPE_STORAGE_INFO = 'VISITOR_WIPE_STORAGE_INFO';

import { visitorService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';

export function getVisitorHomes(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    visitorService.getVisitorHomes().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });
                    
            }).then((response) => {
                const data2 = normalize({visitors: response}, schema.visitorList);
                dispatch({type: VISITOR_GET_HOMES, data: data2.entities.visitor});
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    };
}

export function getVisitorUsers(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    visitorService.getVisitorUsers().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error);
                    });
                    
            }).then((response) => {
                dispatch({type: VISITOR_GET_USERS, data: response});
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    };
}

export function putVisitorUser(email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            visitorService.putVisitorUser(email).then((response) => {
                resolve(response);
            }, (error) => {
                console.log(error);
                reject(error)
            });
        });
    }
}

export function deleteVisitorUser(id_user) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            visitorService.deleteVisitorUser(id_user).then((response) => {
                dispatch({type: VISITOR_DELETE_USER, data: response, id_user: id_user});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}



export function getVisitorUserInformation(email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            visitorService.getVisitorUserInformation(email).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function wipeData() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: VISITOR_WIPE_STORAGE_INFO});
            resolve();
        })
    }
}
