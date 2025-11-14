export const GARDEN_ADD_ENTRY = 'GARDEN_ADD_ENTRY';
export const GARDEN_SET_LOADING = 'GARDEN_SET_LOADING';
export const GARDEN_FINISH_LOADING = 'GARDEN_FINISH_LOADING';
export const GARDEN_SET_STORAGE_INFO = 'GARDEN_SET_STORAGE_INFO';
export const GARDEN_WIPE_STORAGE_INFO = 'GARDEN_WIPE_STORAGE_INFO';
export const CREATE_ZONE_FINISH = 'CREATE_ZONE_FINISH';
export const MODIFY_ZONE = 'MODIFY_ZONE';
export const MODIFY_GARDEN = 'MODIFY_GARDEN';
export const REMOVE_MAP_COORDS = 'REMOVE_MAP_COORDS';
export const DELETE_GARDEN = 'DELETE_GARDEN';
export const ZONE_DELETE = 'ZONE_DELETE';
export const HOME_ADD_GARDEN = 'HOME_ADD_GARDEN';


//Import the api calls
import { gardenService, extraService, homeService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
import * as ActionsZone from '../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsSession from '../actions/sessionActions.js'; //Import your actions

/*
 import { Alert } from 'react-native'
 Alert.alert('Test',JSON.stringify(img),[{text: 'OK', onPress: () => console.log('OK Pressed')}],{ cancelable: false })
 */

export function modifyZoneInformation(idGarden, idZone, information,uuid,verificationCode) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            function getLight(out, light) {
                if (out) {
                    switch (light) {
                        case 0:
                            return 3;
                            break;
                        case 1:
                            return 2;
                            break;
                        case 2:
                            return 4;
                            break;
                        case 3:
                            return 1;
                            break;
                    }
                } else {
                    switch (light) {
                        case 0:
                            return 7;
                            break;
                        case 1:
                            return 6;
                            break;
                        case 2:
                        case 3:
                            return 5;
                            break;
                    }
                }
            }


            var gardenInformation = {};
            var zone = {idZone: idZone};

            if (information.idHome != null) {
                zone = Object.assign(zone, {idHome: information.idHome});
            }

            if (information.zoneName != null) {
                zone = Object.assign(zone, {name: information.zoneName});
            }

            if (information.indexSun != null)
                zone = Object.assign(zone, {light: getLight(information.outdoor, information.indexSun)});

            if (information.irrigationEnabled != null)
                zone = Object.assign(zone, {irrigationType: information.irrigationEnabled ? 2 : 3})

            if (information.hoursAllowed != null)
            {
                if (information.hoursAllowed.length > 0)
                    information.hoursAllowed.sort((a, b) => a - b);
                zone = Object.assign(zone, {hoursAllowed: information.hoursAllowed});
            }

            if (information.extension != null)
                zone = Object.assign(zone, {area: information.extension});

            if (information.outdoor != null)
                zone = Object.assign(zone, {zoneSituation: information.outdoor ? 2 : 1});

            if (information.irrigationMinTemp != null)
                zone = Object.assign(zone, {irrigationMinTemp: information.irrigationMinTemp});

            if (information.irrigationMaxWind != null)
                zone = Object.assign(zone, {irrigationMaxWind: information.irrigationMaxWind});

            if (information.enableLightParam != null)
                zone = Object.assign(zone, {enableLightParam: information.enableLightParam});

            if (information.enableTempParam != null)
                zone = Object.assign(zone, {enableTempParam: information.enableTempParam});

            if (information.enableAirHumParam != null)
                zone = Object.assign(zone, {enableAirHumParam: information.enableAirHumParam});

            if (information.enableFertilizerParam != null)
                zone = Object.assign(zone, {enableFertilizerParam: information.enableFertilizerParam});

            if (information.enableWaterParam != null)
                zone = Object.assign(zone, {enableWaterParam: information.enableWaterParam});

            if (information.enableMeteoParam != null)
                zone = Object.assign(zone, {enableMeteoParam: information.enableMeteoParam});
            
            var zoneInformation = {zones: [zone]}

            if (information.zoneName != null) {
                zoneInformation.name = information.zoneName;
                gardenInformation.name = information.zoneName;
            }

            if(information.idHome){
                zoneInformation.idHome = information.idHome;
                gardenInformation.idHome = information.idHome;
            }

            if (information.isMap) {
                if (information.photoMap)
                {
                    zoneInformation.map = information.map;
                    zoneInformation.image = information.photoMap;
                    gardenInformation.latitude = information.map.lat;
                    gardenInformation.longitude = information.map.long;
                    gardenInformation.zoom = information.map.zoon;
                }

            } else {

                if (information.picture && information.picture64)
                    zoneInformation.image = information.picture64;
            }

            gardenService.modifyZoneInformation(idGarden, zoneInformation,uuid,verificationCode).then(function (response) {
                console.log("response2: ", response);
                zone.zone_situation = zone.zoneSituation;
                zone.irrigation_type = zone.irrigationType == 2 ? 4 : zone.irrigationType;
                delete zone.zoneSituation;
                delete zone.irrigationType;
                delete gardenInformation.image;

                if (response.data.imageName != null) {
                    gardenInformation.imageName = response.data.imageName;
                }
                dispatch({type: MODIFY_GARDEN, data: {idZone: idZone, idGarden: idGarden, gardenInformation: gardenInformation}});
                dispatch({type: MODIFY_ZONE, data: {idZone: idZone, idGarden: idGarden, zoneInformation: zone}});
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });
    }
}

export function removeMapCoords(idGarden) {
    return (dispatch, getState) => {
        dispatch({type: REMOVE_MAP_COORDS, data: {idGarden: idGarden}});
    }
}

export function getOneGarden(idGarden, gardenData) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            new Promise((resolveApi, rejectApi) => {
                if (gardenData)
                    resolveApi(gardenData);
                else
                    gardenService.getGarden(idGarden, {genericInfo: 1, zone: 1}).then(function (response) {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                const data = normalize(response, schema.garden);
                dispatch({type: GARDEN_ADD_ENTRY, data: data.entities.gardens});
                resolve(response);                

            }, (err) => {
                reject(err);
            });
        });
    };
}

export function getGarden(idGarden) {
    return (dispatch, getState) => {
        dispatch({type: GARDEN_SET_LOADING, data: {}});
        return getOneGarden(idGarden).then(function (response) {
            dispatch({type: GARDEN_FINISH_LOADING, data: {}});
            return true;
        }, function (a, b, c) {
        });

    }
}

export function getGardenList(homeData) {
    return (dispatch, getState) => {
        
        var homes;
        if (homeData)
            homes = homeData;
        else {
            var obj = getState().fliwerHomeReducer.data;
            homes = Object.keys(obj).map((k) => obj[k])
        }
        
        let p = Promise.resolve();

        for (let i = 0; i < homes.length; i++) {
            for (let j = 0; j < homes[i].gardens.length; j++) {
                (function (i, j) {
                    p = p.then(_ => new Promise(function (resolve, reject) {
                            var idGarden, gardenData = null;
                            if (homeData) {
                                gardenData = homes[i].gardens[j];
                                idGarden = gardenData.id;
                            }
                            else
                                idGarden = homes[i].gardens[j];
                            
                            dispatch(getOneGarden(idGarden, gardenData)).then(resolve, reject);
                            
                        }));
                })(i, j)
            }
        }
        return p;
    };
}

export function getGardenStorage() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            uniqueStorage.getItem('gardenInfo').then(function (data) {
                if (data)
                    data = JSON.parse(data);
                dispatch({type: GARDEN_SET_STORAGE_INFO, data: data});
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
            dispatch({type: GARDEN_WIPE_STORAGE_INFO});
            resolve();
        })
    }
}

export function addGarden(gardenInfo) {
    //{plants:{}, photo: base64, idHome,name,extension(opt),outdoor:bool,light:int 0-4}
    return new Promise(function (resolve, reject) {
        debugger;
        function getLight(out, light) {
            if (out) {
                switch (light) {
                    case 0:
                        return 3;
                        break;
                    case 1:
                        return 2;
                        break;
                    case 2:
                        return 4;
                        break;
                    case 3:
                        return 1;
                        break;
                }
            } else {
                switch (light) {
                    case 0:
                        return 7;
                        break;
                    case 1:
                        return 6;
                        break;
                    case 2:
                    case 3:
                        return 5;
                        break;
                }
            }
        }

        var plants = [], _plants = Object.values(gardenInfo.plants)
        for (var i in _plants) {
            plants.push({idPlant: _plants[i].idPlant, plant_phase: _plants[i].plant_phase});
        }


        var obj = {
            "name": gardenInfo.name,
            "image": gardenInfo.photo,
            "map": gardenInfo.map,
            "zones": [
                {
                    "name": gardenInfo.name,
                    "zoneSituation": gardenInfo.outdoor ? 2 : 1,
                    "light": getLight(gardenInfo.outdoor, gardenInfo.light),
                    "hoursAllowed": gardenInfo.hoursAllowed,
                    "plants": plants,
                    "irrigationType": 2,
                    "minutes": 1
                }
            ]
        }
        if (gardenInfo.extension)
            obj.zones[0].area = parseInt(gardenInfo.extension);

        homeService.addGarden(gardenInfo.idHome, obj).then(function (response) {
            resolve(response.id);
        }, function (error) {
            reject(error);
        });
    })
}

export function saveGarden() {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var reducer = getState().createZoneReducer;
            addGarden(reducer).then(function (id) {
                getOneGarden(id)(dispatch, getState).then(function (response) {
                    dispatch({type: HOME_ADD_GARDEN, data: {idHome:response.idHome,id:id}});
                    ActionsZone.getOneZone(response.zones[0].idZone)(dispatch, getState).then(function (response2) {

                        //If there is a gardenerCheeckidHome right now, and the home is not the same as the one we are adding the garden to, we need to change the home of the gardenerCheck
                        var sessionReducer=getState().sessionReducer;
                        var idUserGardenerCheck=sessionReducer.gardenerCheckidUser;
                        var gardenerCheckidHome=sessionReducer.gardenerCheckidHome;
                        if(idUserGardenerCheck && gardenerCheckidHome && gardenerCheckidHome!=response.idHome){
                            ActionsSession.addGardenerUserID(idUserGardenerCheck, response.idHome)(dispatch, getState);
                        }

                        dispatch({type: CREATE_ZONE_FINISH, data: {}});
                        resolve(id);
                    }, function (error) {
                        reject(error);
                    });
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        })
    }
}

export function deleteGarden(idGarden, uiid, verificationCode) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {         
            
            gardenService.deleteGarden(idGarden, uiid, verificationCode).then(function (d) {
            
                var obj = getState().fliwerZoneReducer.data;
                let zones = Object.keys(obj).map((k) => obj[k]);

                for (let i = 0; i < zones.length; i++) {
                    let zone = zones[i];
                    if (zone.idImageDash == idGarden)
                        dispatch({type: ZONE_DELETE, data: {idZone: zone.idZone}});
                }    
                
                dispatch({type: DELETE_GARDEN, data: {idGarden: idGarden}});
                resolve();   

            }, function (error) {
                reject(error);
            });
        });
    }
    
}
// export function deleteGarden(idGarden, password) {
//     return (dispatch, getState) => {
//         return new Promise(function (resolve, reject) {         
            
//             gardenService.deleteGarden(idGarden, password).then(function (d) {
            
//                 var obj = getState().fliwerZoneReducer.data;
//                 let zones = Object.keys(obj).map((k) => obj[k]);

//                 for (let i = 0; i < zones.length; i++) {
//                     let zone = zones[i];
//                     if (zone.idImageDash == idGarden)
//                         dispatch({type: ZONE_DELETE, data: {idZone: zone.idZone}});
//                 }    
                
//                 dispatch({type: DELETE_GARDEN, data: {idGarden: idGarden}});
//                 resolve();   

//             }, function (error) {
//                 reject(error);
//             });
//         });
//     }
    
// }
