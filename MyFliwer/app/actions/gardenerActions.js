export const GARDENER_GET_HOMES = 'GARDENER_GET_HOMES';
export const GARDENER_GET_USERS = 'GARDENER_GET_USERS';
export const GARDENER_PUT_USERS = 'GARDENER_PUT_USERS';
export const GARDENER_DELETE_USER = 'GARDENER_DELETE_USER';
export const GARDENER_WIPE_STORAGE_INFO = 'GARDENER_WIPE_STORAGE_INFO';
export const GARDENER_ALLOW_REFRESH_HOMES = 'GARDENER_ALLOW_REFRESH_HOMES';
export const GARDENER_WIPE_ALLOW_REFRESH_HOMES = 'GARDENER_WIPE_ALLOW_REFRESH_HOMES';
export const VISITED_ZONES_ADD = 'VISITED_ZONES_ADD';
export const VISITED_ZONES_RESET = 'VISITED_ZONES_RESET';

import { gardenerService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';


export function getGardenerHomesGenericInfo() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            gardenerService.getGardenerHomes({genericInfo: true}).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function getGardenerHomes(data,wipeDataBeforeGet) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    gardenerService.getGardenerHomes({}).then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                const data2 = normalize({gardeners: response}, schema.gardenerList);
                if(wipeDataBeforeGet){
                  wipeData()(dispatch, getState).then(()=>{
                    dispatch({type: GARDENER_GET_HOMES, data: data2.entities.gardener});
                  })
                }else dispatch({type: GARDENER_GET_HOMES, data: data2.entities.gardener});
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    }
}

export function getGardenerUsers(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    gardenerService.getGardenerUsers().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: GARDENER_GET_USERS, data: response});
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    }
}

export function putGardenerUser(email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            gardenerService.putGardenerUser(email).then((response) => {
                resolve(response);
            }, (error) => {
                console.log(error);
                reject(error)
            });
        });
    }
}

export function deleteGardenerUser(id_user) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            gardenerService.deleteGardenerUser(id_user).then((response) => {
                dispatch({type: GARDENER_DELETE_USER, data: response, id_user: id_user});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}



export function getGardenerUserInformation(email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            gardenerService.getGardenerUserInformation(email).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function wipeData(disableLoading) {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: GARDENER_WIPE_STORAGE_INFO, disableLoading: disableLoading});
            resolve();
        })
    }
}

export function setAllowRefreshGardenerHomes(allowRefreshGardenerHomes, visitorHomes, visitorUsers) {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            const normalizedVisitorHomesData = normalize({visitors: visitorHomes}, schema.visitorList);

            dispatch({type: GARDENER_ALLOW_REFRESH_HOMES, allowRefreshGardenerHomes: allowRefreshGardenerHomes, gardenerVisitorHomes: normalizedVisitorHomesData.entities.visitor, gardenerVisitorUsers: visitorUsers});
            resolve();
        });
    };
}

export function modifyUserClientObject(idUser,data){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            gardenerService.modifyUserClientObject(idUser,data).then((response) => {
                getGardenerHomes(null,true)(dispatch, getState).then(() => {
                    getGardenerUsers()(dispatch, getState).then(() => {
                        resolve(response);
                    },resolve);
                },resolve);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function addClientObject(data){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            gardenerService.addClientObject(data).then((response) => {
                getGardenerHomes(null,true)(dispatch, getState).then(() => {
                    getGardenerUsers()(dispatch, getState).then(() => {
                        resolve(response);
                    },resolve);
                },resolve);
            }, (error) => {
                reject(error)
            });
        });
    }
}


export function wipeAllowRefreshGardenerHomes() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: GARDENER_WIPE_ALLOW_REFRESH_HOMES});
            resolve();
        });
    };
}

export function addVisitedZone(data) {
    return (dispatch) => {
        dispatch({type: VISITED_ZONES_ADD, data: data});
    };
}

export function resetVisitedZones() {
    return (dispatch) => {
        dispatch({type: VISITED_ZONES_RESET});
    };
}