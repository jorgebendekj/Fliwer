export const HOME_ADD_ENTRY = 'HOME_ADD_ENTRY';
export const HOME_SET_LOADING = 'HOME_SET_LOADING';
export const HOME_SET_STORAGE_INFO = 'HOME_SET_STORAGE_INFO';
export const HOME_WIPE_STORAGE_INFO = 'HOME_WIPE_STORAGE_INFO';
export const HOME_ADD_ZONE = 'HOME_ADD_ZONE';
export const HOME_ADD_GARDEN = 'HOME_ADD_GARDEN';

//Import the api calls
import { homeService, extraService, userService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';


export function getOneHome(idHome) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            homeService.getHome(idHome, {genericInfo: 1, meteo: 1, garden: 1}).then(function (response) {
                const data = normalize(response, schema.home);
                dispatch({type: HOME_ADD_ENTRY, data: data.entities.homes});
                resolve(response);
            }, function (a, b, c) {
                reject(a)
            });
        })
    }
}

export function getHomeList(options, data) {
    return (dispatch, getState) => {
        dispatch({type: HOME_SET_LOADING, data: {}});
        return new Promise(function (resolve, reject) {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    homeService.getHomes(options).then(function (response) {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                let p = Promise.resolve();
                for (let i = 0; i < response.length; i++) {
                    (function (i) {
                        p = p.then(_ => new Promise(function (resolve, reject) {
                                /*
                                 extraService.getImage(response[i].imageName).then(function(image){
                                 response[i].image=image;
                                 resolve();
                                 },function(){
                                 resolve();
                                 });
                                 */
                                resolve();
                            }));
                    })(i);
                }
                p.then(function () {
                    const data = normalize(response, [schema.home]);
                    dispatch({type: HOME_ADD_ENTRY, data: data.entities.homes});
                    resolve(true);
                });
            }, (err) => {
                reject(err);
            });
        });
    };
}


export function getHomeStorage() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            uniqueStorage.getItem('homeInfo').then(function (data) {
                if (data)
                    data = JSON.parse(data);
                dispatch({type: HOME_SET_STORAGE_INFO, data: data});
                if (data)
                    resolve();
                else
                    reject();
            }, reject);
        })
    }
}


export function wipeData() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: HOME_WIPE_STORAGE_INFO});
            resolve();
        })
    }
}


export function addHome(name, place_id, coords, address) {
    //{plants:{}, photo: base64, idHome,name,extension(opt),outdoor:bool,light:int 0-4}
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            console.log("createe home: ", obj);
            var obj = {
                name: name,
                place_id: place_id,
                map: coords,
                address: address,
            }
            userService.addHome(obj).then(function (response) {
                var id = response.id;
                getOneHome(id)(dispatch, getState).then(function (response) {
                    resolve(id);
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        })
    }
}

export function modifyHome(id_home, name, location, coords, address) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {

            console.log("object! ", id_home, name, location, coords, address);
            var obj = {
                name: name,
                place_id: location,
                map: coords,
                address: address,

            }
            homeService.modifyHome(id_home, obj).then(function (response) {
                getOneHome(id_home)(dispatch, getState).then(function (response2) {
                    resolve(response2);
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        })
    }
}

export function getZonesFromHome(idHome) {
    return (dispatch, getState) => {
        debugger;
        //First check if the homes is in the user or in the gardener
        var homes = getState().fliwerHomeReducer.data;
        if(homes[idHome]){
            //Means that the home is in the user
            //Get list of zones from the home

            //check if homes[idHome].gardens is an array of numbers or an array of objects
            if(homes[idHome].gardens[0].zones){
                return homes[idHome].gardens.map(g=>g.zones).flat();
            }else{
                //If it's an array of numbers, then we need to get the garden info
                var gardens=getState().fliwerGardenReducer.data 
                var zones=[];
                homes[idHome].gardens.forEach(gardenId => {
                    zones.push(...gardens[gardenId].zones);
                });
                //Get zone info for every id in array
                zones=zones.map(zoneId => getState().fliwerZoneReducer.data[zoneId]);

                return zones;
            }
        }else{
            //Check the gardener
            var gardenerHomes = getState().gardenerReducer.gardenerHomes;
            if(gardenerHomes[idHome]){
                //Means that the home is in the gardener
                return gardenerHomes[idHome].gardens.map(g=>g.zones).flat();
            }
        }
        return [];
    }
}