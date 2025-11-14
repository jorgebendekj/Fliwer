export const ZONE_ADD_ENTRY = 'ZONE_ADD_ENTRY';
export const ZONE_SET_LOADING = 'ZONE_SET_LOADING';
export const ZONE_FINISH_LOADING = 'ZONE_FINISH_LOADING';
export const ZONE_SET_LOADINGDATA = 'ZONE_SET_LOADINGDATA';
export const ZONE_FINISH_LOADINGDATA = 'ZONE_FINISH_LOADINGDATA';
export const ZONE_SET_LOADINGIRRIGATIONDATA = 'ZONE_SET_LOADINGIRRIGATIONDATA';
export const ZONE_FINISH_LOADINGIRRIGATIONDATA = 'ZONE_FINISH_LOADINGIRRIGATIONDATA';
export const ZONE_SET_STORAGE_INFO = 'ZONE_SET_STORAGE_INFO';
export const ZONE_WIPE_STORAGE_INFO = 'ZONE_WIPE_STORAGE_INFO';
export const ZONE_ADD_DATA = 'ZONE_ADD_DATA';
export const ZONE_DELETE = 'ZONE_DELETE';
export const ALERT_DELETE = 'ALERT_DELETE';
export const ZONE_TASKMANAGER_HISTORY = 'ZONE_TASKMANAGER_HISTORY';
export const ZONE_IRRIGATION_HISTORY = 'ZONE_IRRIGATION_HISTORY';
export const ZONE_IRRIGATION_PROGRAMS = 'ZONE_IRRIGATION_PROGRAMS';
export const ZONE_ADD_IRRIGATION_PROGRAMS = 'ZONE_ADD_IRRIGATION_PROGRAMS';
export const IRRIGATION_PROGRAM_DELETE = 'IRRIGATION_PROGRAM_DELETE';
export const IRRIGATION_PROGRAM_MODIFY = 'IRRIGATION_PROGRAM_MODIFY';
export const MODIFY_ZONE = 'MODIFY_ZONE';
export const UPDATE_REPLANTTIME = 'UPDATE_REPLANTTIME';
export const ZONE_ADD_MORE_DATA = 'ZONE_ADD_MORE_DATA';
export const SET_URCUSTOM = 'SET_URCUSTOM';
export const USER_HOME_HAS_BEEN_VISITED = 'USER_HOME_HAS_BEEN_VISITED';
export const IRRIGATION_HISTORYDATA_DELETE = 'IRRIGATION_HISTORYDATA_DELETE';



//Import the api calls
import { zoneService, GardenService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';


export function getZoneData(idZone,forcedStart) {
    return (dispatch, getState) => {
        dispatch({type: ZONE_SET_LOADINGDATA, data: {}});
        return new Promise(function (resolve, reject) {
            var startDataTime = forcedStart?forcedStart:Math.floor(Date.now() / 1000) - 604800;
            var endDataTime = Math.floor(Date.now() / 1000);
            zoneService.getZone(idZone, {genericInfo: 1, startDataTime: startDataTime, endDataTime: endDataTime, startHistoryDataTime: startDataTime, endHistoryDataTime: endDataTime}).then(function (response) {
                const data = normalize({taskManagerHistories: response.taskManagerHistoryData}, schema.taskManagerHistoryList);
                const data2 = normalize({irrigationHistories: response.irrigationHistoryData}, schema.irrigationHistoryList);
                response.data.dataGathered = {from: startDataTime, to: endDataTime};
                dispatch({type: ZONE_ADD_DATA, data: {idZone: idZone, genericInfo: response.genericInfo, data: response.data, irrigationHistoryData: data2.entities.irrigationHistory, taskManagerHistoryData: data.entities.taskManagerHistory}});
                dispatch({type: ZONE_FINISH_LOADINGDATA});
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function getZoneMoreData(idZone, start, end) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {

            var getData = false;
            var realStart = start, realEnd = end;
            var reducer = getState().fliwerZoneReducer.data;
            if (reducer[idZone] && reducer[idZone].data) {
                var datag = reducer[idZone].data.dataGathered;
                if (start < datag.from) {
                    end = datag.from;
                    realEnd = datag.to;
                    getData = true;
                } else if (end > datag.to) {
                    start = datag.to;
                    realStart = datag.from;
                    getData = true;
                }
            }
            if (getData) {
                zoneService.getZone(idZone, {startDataTime: start, endDataTime: end, startHistoryDataTime: start, endHistoryDataTime: end}).then((response) => {
                    const data2 = normalize({irrigationHistories: response.irrigationHistoryData}, schema.irrigationHistoryList);
                    response.data.dataGathered = {from: realStart, to: realEnd};
                    dispatch({type: ZONE_ADD_MORE_DATA, data: {idZone: idZone, data: response.data, irrigationHistoryData: data2.entities}})
                    resolve();
                }, function (error) {
                    reject(error)
                })
            } else {
                resolve();
            }
        });
    }
}

export function getZoneDataCSV(idZone, start, end) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            zoneService.getZoneDataCSV(idZone, start, end).then((response) => {
                resolve();
            }, reject);

        })
    }
}


export function getZoneFlowDataCSV(idZone, start, end) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            zoneService.getZoneFlowDataCSV(idZone, Math.trunc(start), Math.trunc(end)).then((response) => {
                resolve();
            }, reject);
        })
    }
}

export function getZoneDataTaskManagerHistory(idZone, startTime, endTime) {
    return (dispatch, getState) => {
        dispatch({type: ZONE_SET_LOADINGIRRIGATIONDATA, data: {}});
        return new Promise(function (resolve, reject) {
            zoneService.getZoneTaskManagerHistory(idZone, startTime, endTime).then(function (response) {
                const data = normalize({taskManagerHistories: response}, schema.taskManagerHistoryList);
                dispatch({type: ZONE_TASKMANAGER_HISTORY, data: {idZone: idZone, taskManagerHistoryData: data.entities.taskManagerHistory}});
                dispatch({type: ZONE_FINISH_LOADINGIRRIGATIONDATA});
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function getZoneDataIrrigationHistory(idZone, startTime, endTime) {
    return (dispatch, getState) => {
        dispatch({type: ZONE_SET_LOADINGDATA, data: {}});
        return new Promise(function (resolve, reject) {
            zoneService.getZoneIrrigationHistory(idZone, startTime, endTime).then(function (response) {
                const data = normalize({irrigationHistories: response}, schema.irrigationHistoryList);
                dispatch({type: ZONE_IRRIGATION_HISTORY, data: {idZone: idZone, irrigationHistoryData: data.entities.irrigationHistory}});
                dispatch({type: ZONE_FINISH_LOADINGDATA});
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function getZoneDataIrrigationPrograms(idZone) {
    return (dispatch, getState) => {
        //dispatch({type:ZONE_SET_LOADINGDATA,data:{}});
        return new Promise(function (resolve, reject) {
            zoneService.getZoneIrrigationProgram(idZone).then(function (response) {
                const data = normalize({irrigationPrograms: response}, schema.irrigationProgramList);
                dispatch({type: ZONE_IRRIGATION_PROGRAMS, data: {idZone: idZone, irrigationProgramsData: data.entities.irrigationProgram}});
                //dispatch({type:ZONE_FINISH_LOADINGDATA});
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function modifyIrrigationProgram(idZone, idProgram, program, uuid,code) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.modifyIrrigationProgram(idProgram, program, uuid,code).then(function (response) {
                const data = normalize({irrigationPrograms: response}, schema.irrigationProgramList);
                dispatch({type: IRRIGATION_PROGRAM_MODIFY, data: {idZone: idZone, irrigationProgramsData: data.entities.irrigationProgram}});
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function cancelManualPendingIrrigation(idZone, idProgram, data,uuid,code) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.cancelManualPendingIrrigation(idProgram, data,uuid,code).then(function () {
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function deleteManualPendingIrrigation(idZone, idProgram, data,uuid,code) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.deleteManualPendingIrrigation(idProgram, data,uuid,code).then(function () {
                dispatch({type: IRRIGATION_HISTORYDATA_DELETE, data: {idZone: idZone, idIrrigationProgram: idProgram}});
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function addZoneDataIrrigationPrograms(idZone, program,uuid,code) {
    return (dispatch, getState) => {
        dispatch({type: ZONE_SET_LOADINGDATA, data: {}});
        return new Promise(function (resolve, reject) {
            zoneService.putZoneIrrigation(idZone, program,uuid,code).then(function (response) {
                const data = normalize({irrigationPrograms: response}, schema.irrigationProgramList);
                dispatch({type: ZONE_ADD_IRRIGATION_PROGRAMS, data: {idZone: idZone, irrigationProgramsData: data.entities.irrigationProgram}});
                dispatch({type: ZONE_FINISH_LOADINGDATA});
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function deleteIrrigationPrograms(idZone, idIrrigationProgram, uuid,code) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.deleteIrrigationProgram(idIrrigationProgram,uuid,code).then(function () {
                dispatch({type: IRRIGATION_PROGRAM_DELETE, data: {idZone: idZone, idIrrigationProgram: idIrrigationProgram}});
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function getOneZone(idZone, zoneData) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            new Promise((resolveApi, rejectApi) => {
                if (zoneData)
                    resolveApi(zoneData);
                else
                    zoneService.getZone(idZone, {genericInfo: 1, hoursAllowed: 1, firstIrrigation: 1, alerts: 1, advices: 1, plants: 1}).then(function (response) {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                const data = normalize(response, schema.zone);
                dispatch({type: ZONE_ADD_ENTRY, data: data.entities.zones});
                resolve(response);

            }, (err) => {
                reject(err);
            });
        });
    };
}


export function getZone(idZone) {
    return (dispatch, getState) => {
        dispatch({type: ZONE_SET_LOADING, data: {}});
        return getOneZone(idZone).then(function (response) {
            dispatch({type: ZONE_FINISH_LOADING, data: {}});
            return true;
        }, function (a, b, c) {
        });
    };
}


export function getZoneList(gardensData) {
    return (dispatch, getState) => {

        var gardens;
        if (gardensData)
            gardens = gardensData;
        else {
            var obj = getState().fliwerGardenReducer.data;
            gardens = Object.keys(obj).map((k) => obj[k]);
        }

        let p = Promise.resolve();

        for (let i = 0; i < gardens.length; i++) {
            for (let j = 0; j < gardens[i].zones.length; j++) {
                (function (i, j) {
                    p = p.then(_ => new Promise(function (resolve, reject) {
                            var idZone, zoneData = null;
                            if (gardensData) {
                                zoneData = gardens[i].zones[j];
                                idZone = zoneData.idZone;
                            }
                            else
                                idZone = gardens[i].zones[j];

                            dispatch(getOneZone(idZone, zoneData)).then(resolve, reject);
                        }));
                })(i, j);
            }
        }
        return p;
    };
}

export function getZoneStorage() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            uniqueStorage.getItem('zoneInfo').then(function (data) {
                data = JSON.parse(data);
                dispatch({type: ZONE_SET_STORAGE_INFO, data: data});
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
            dispatch({type: ZONE_WIPE_STORAGE_INFO});
            resolve();
        })
    }
}


export function setZonePlant(idZone, data) {
    /*[{idPlant:x,plant_phase:x},...]*/
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.modifyPlants(idZone, data).then(function () {
                getOneZone(idZone)(dispatch, getState).then(function (response2) {
                    resolve();
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function modifyZonePlant(idZone, idPlant, phase) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var zones = getState().fliwerZoneReducer.data;
            var plants = zones[idZone].plants;
            if (plants) {
                var i = 0, found = false;
                while (i < plants.length && !found) {
                    if (plants[i].idPlant == idPlant)
                        found = true;
                    else
                        i++;
                }
                if (found) {
                    plants[i].plant_phase = phase;
                    zoneService.modifyPlants(idZone, plants).then(function () {
                        getOneZone(idZone)(dispatch, getState).then(function (response2) {
                            resolve();
                        }, function (error) {
                            reject(error);
                        });
                    }, function (error) {
                        reject(error);
                    })
                } else
                    reject();
            } else
                reject();
        })
    }
}

export function deleteZonePlant(idZone, idPlant) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var zones = getState().fliwerZoneReducer.data;
            var plants = zones[idZone].plants;
            if (plants) {
                var i = 0, found = false;
                while (i < plants.length && !found) {
                    if (plants[i].idPlant == idPlant)
                        found = true;
                    else
                        i++;
                }
                if (found) {
                    plants.splice(i, 1);
                    zoneService.modifyPlants(idZone, plants).then(function () {
                        getOneZone(idZone)(dispatch, getState).then(function (response2) {
                            resolve();
                        }, function (error) {
                            reject(error);
                        });
                    }, function (error) {
                        reject(error);
                    })
                } else
                    reject();
            } else
                reject();
        })
    }
}

export function deleteZone(idZone, password) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.deleteZone(idZone, password).then(function (d) {
                console.log("DELETE ZONE", idZone);
                dispatch({type: ZONE_DELETE, data: {idZone: idZone}});
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function sendMailRequestDelete(idZone) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.sendMailRequestDelete(idZone).then(function () {
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function deleteAlert(idZone, idAlerta, action, isAdvice, filter) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.sendAlertAction(idZone, idAlerta, action).then(function () {
                dispatch({type: ALERT_DELETE, data: {idZone: idZone, idAlerta: idAlerta, isAdvice: isAdvice, filter: filter}});
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function updateReplantTime(idZone, replantTime,maxCalibrationTime) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.updateReplantTime(idZone, replantTime,maxCalibrationTime).then(function () {
                dispatch({type: UPDATE_REPLANTTIME, data: {idZone: idZone, replantTime: replantTime,maxCalibrationTime:maxCalibrationTime}});
                resolve();
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function setURCustom(idZone, action) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            zoneService.setURCustom(idZone, action).then(function (values) {
                dispatch({type: SET_URCUSTOM, data: {idZone: idZone, action: action, limit33: values.limit33}});
                resolve(values.limit33);
            }, function (error) {
                reject(error);
            })
        })
    }
}


export function setUserHomeHasBeenVisited(value) {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: USER_HOME_HAS_BEEN_VISITED, userHomeHasBeenVisited: value});
            resolve();
        });
    };
}

/*
    Transform this function with states to a function that checks the store and returns an object with zone, garden and home:

            if(!this.state.zone){

            this.state.zone = this.props.zoneData[this.state.idZone];
            //console.log("zone", zone);

            if(!this.state.garden && this.state.home){
                this.state.garden = this.state.zone?this.props.gardenData[this.state.zone.idImageDash]:null;
                this.state.home = this.state.garden?this.props.homeData[this.state.garden.idHome]:null;

                //if is a gardener, search for the garden in gardenerHomes
                if(this.state.zone && !this.state.garden && !this.state.home && this.props.isGardener){
                    //transform this find to be a find and obtain the garden: Object.values(this.props.gardenerHomes).find(h=>h.gardens && h.gardens.find(g=>g.id==zone.idImageDash))
                    this.state.home = Object.values(this.props.gardenerHomes).find(h=>h.gardens && h.gardens.find(g=>g.id==this.state.zone.idImageDash));
                    if(this.state.home){
                        this.state.garden = this.state.home.gardens.find(g=>g.id==this.state.zone.idImageDash);
                    }
                }
            }
        }
*/

export function getZoneGardenHome(idZone) {
    return (dispatch, getState) => {
        var zone = getState().fliwerZoneReducer.data[idZone];
        var garden = zone ? getState().fliwerGardenReducer.data[zone.idImageDash] : null;
        var home = garden ? getState().fliwerHomeReducer.data[garden.idHome] : null;
        if (!garden || !home) {
            var gardenerHomes = getState().gardenerReducer.gardenerHomes;
            if (zone && !garden && !home && gardenerHomes) {
                home = Object.values(gardenerHomes).find(h => h.gardens && h.gardens.find(g => g.id == zone.idImageDash));
                if (home) {
                    garden = home.gardens.find(g => g.id == zone.idImageDash);
                }
            }
        }
        return {zone: zone, garden: garden, home: home};
    };
}