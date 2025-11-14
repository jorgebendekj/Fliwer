/* global Promise */

export const DEVICE_ADD_ALL = 'DEVICE_ADD_ALL';
export const DEVICE_ADD_ENTRY = 'DEVICE_ADD_ENTRY';
export const DEVICE_SET_LOADING = 'DEVICE_SET_LOADING';
export const DEVICE_FINISH_LOADING = 'DEVICE_FINISH_LOADING';
export const DEVICE_SET_STORAGE_INFO = 'DEVICE_SET_STORAGE_INFO';
export const DEVICE_WIPE_STORAGE_INFO = 'DEVICE_WIPE_STORAGE_INFO';
export const DEVICE_ADD_VALVES = 'DEVICE_ADD_VALVES';
export const DEVICE_MODIFY_ZONE = 'DEVICE_MODIFY_ZONE';
export const DEVICE_MODIFY_VALVE = 'DEVICE_MODIFY_VALVE';
export const DEVICE_MODIFY = 'DEVICE_MODIFY';
export const DEVICE_VALVES_LOADING = 'DEVICE_VALVES_LOADING';
export const DEVICE_SET_LOADINGDATA = 'DEVICE_SET_LOADINGDATA';
export const DEVICE_FINISH_LOADINGDATA = 'DEVICE_FINISH_LOADINGDATA';
export const DEVICE_ADD_DATA = 'DEVICE_ADD_DATA';
export const DEVICE_ADD_MORE_DATA = 'DEVICE_ADD_MORE_DATA';
export const DEVICE_ADD_PACKET_DATA = 'DEVICE_ADD_PACKET_DATA';
export const DEVICE_ADD_MORE_PACKET_DATA = 'DEVICE_ADD_MORE_PACKET_DATA';
export const DEVICE_SIMULTANEITY_ACTIVATED = 'DEVICE_SIMULTANEITY_ACTIVATED';
export const DEVICE_REALTIME_SET_DEVICES_VALVES = 'DEVICE_REALTIME_SET_DEVICES_VALVES';
export const DEVICE_REALTIME_SET_STATUS='DEVICE_REALTIME_SET_STATUS';
export const DEVICE_DELETE = 'DEVICE_DELETE';
export const DEVICE_REALTIME_SET_IRRIGATIONSTATUS='DEVICE_REALTIME_SET_IRRIGATIONSTATUS';
export const DEVICE_REALTIME_SET_FLOW='DEVICE_REALTIME_SET_FLOW';
export const DEVICE_REALTIME_PING_TEST='DEVICE_REALTIME_PING_TEST';


//Import the api calls
import { userService, deviceService, homeService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
import {socketManager} from '../utils/socketManager.js';


export function getDeviceValves(idDevice) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.getControlConfig(idDevice).then(function (response) {
                dispatch({ type: DEVICE_ADD_VALVES, data: { idDevice: idDevice, data: response } });
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function getAllDeviceValves() {
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_VALVES_LOADING, data: { loading: true } });
        return new Promise(function (resolve, reject) {
            var devices = Object.values(getState().fliwerDeviceReducer.devices);
            Promise.all(devices.map((device) => {
                return new Promise((resolve, reject) => {
                    if (device.type.indexOf("UNIPRO") != -1 || device.type.indexOf("TBD") != -1 || device.type.indexOf("CONTROL") != -1 || device.type=="SENS")
                        getDeviceValves(device.DeviceSerialNumber)(dispatch, getState).then(resolve, reject);
                    else
                        resolve();
                })
            })).then(() => {
                dispatch({ type: DEVICE_VALVES_LOADING, data: { loading: false } });
                resolve();
            }, /*reject*/(error) => {
                console.log(error);
                dispatch({ type: DEVICE_VALVES_LOADING, data: { loading: false } });
                resolve();
            });
        });
    }
}


export function getDeviceList(data,idHome) {
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_SET_LOADING, data: {} });
        return new Promise(function (resolve, reject) {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    if(idHome){
                        
                        homeService.getHomeDevices(idHome,{pingTests:true}).then(function (response) {
                            resolveApi(response);
                        }, (error) => {
                            rejectApi(error)
                        });
                    }else{
                        
                        userService.getUserDevices({pingTests:true}).then(function (response) {
                            resolveApi(response);
                        }, (error) => {
                            rejectApi(error)
                        });
                    }

            }).then((response) => {
                const data = normalize({ devices: response }, schema.deviceList);
                dispatch({ type: DEVICE_ADD_ALL, data: data.entities.device });
                
                socketManager.updateDeviceSockets();
                getAllDeviceValves()(dispatch, getState).then(() => {
                    resolve(response);
                });

            }, (err) => {
                reject(err);
            });
        });
    };
}


export function getDevice(idDevice,addValves) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.getDevice(idDevice).then(function (response) {
                dispatch({ type: DEVICE_ADD_ENTRY, data: response });
                //socketManager.updateDeviceSockets();
                if(addValves){
                    getDeviceValves(idDevice)(dispatch, getState).then((responseV)=>{
                        socketManager.updateDeviceSockets();
                        resolve(response);
                    },reject);
                }else {
                    socketManager.updateDeviceSockets();
                    resolve(response);
                }
            }, (error) => {
                reject(error)
            });

        });
    };
}

//deleteDevice(id_device)


// export function deleteDevice(idDevice, password) {
//     return (dispatch, getState) => {
//         return new Promise(function (resolve, reject) {
//             deviceService.deleteDevice(idDevice, password).then(function () {
//                 wipeData()(dispatch).then(function () {
//                     getDeviceList()(dispatch, getState).then(function () {
//                         resolve();
//                     }, function (error) {
//                         reject(error);
//                     });
//                 }, function (error) {
//                     reject(error);
//                 });
//             }, function (error) {
//                 reject(error);
//             })
//         })
//     }
// }

export function deleteDevice(idDevice, uiid, verificationCode) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {

            deviceService.deleteDevice(idDevice, uiid, verificationCode).then(function () {
                /*
                wipeData()(dispatch).then(function () {
                    getDeviceList()(dispatch, getState).then(function () {
                        resolve();
                    }, function (error) {
                        reject(error);
                    });
                }, function (error) {
                    reject(error);
                });
                */
               dispatch({ type: DEVICE_DELETE, data: { idDevice: idDevice } });
               resolve();
               //instead delete device from reducer
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function modifyConfiguration(idDevice, configuration) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.modifyConfiguration(idDevice, configuration).then(function () {

                /*
                wipeData()(dispatch).then(function () {
                    getDeviceList()(dispatch, getState).then(function () {
                        resolve();
                    }, function (error) {
                        reject(error);
                    });
                }, function (error) {
                    reject(error);
                });
                */
               //Instead do getDevice
                getDevice(idDevice)(dispatch, getState).then(function () {
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


export function deleteDeviceFailed(idLink, idDevice, password) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.deleteDeviceFailed(idLink, idDevice, password).then(function () {
                wipeData()(dispatch).then(function () {
                    getDeviceList()(dispatch, getState).then(function () {
                        resolve();
                    }, function (error) {
                        reject(error);
                    });
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function linkToZone(idDevice, idZone, nsensor) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            if (idZone) {
                deviceService.linkDeviceZone(idDevice, idZone, nsensor).then(function (deviceChanged) {
                    if (deviceChanged.unlinkedDevice)
                        dispatch({ type: DEVICE_MODIFY_ZONE, data: { idDevice: deviceChanged.unlinkedDevice, idZone: null, nsensor: nsensor } });
                    dispatch({ type: DEVICE_MODIFY_ZONE, data: { idDevice: idDevice, idZone: idZone, nsensor: nsensor } });
                    resolve(deviceChanged);
                }, function (error) {
                    reject(error);
                })
            } else {
                deviceService.unlinkDeviceZone(idDevice, nsensor).then(function (deviceChanged) {
                    dispatch({ type: DEVICE_MODIFY_ZONE, data: { idDevice: idDevice, idZone: null, nsensor: nsensor } });
                    resolve(deviceChanged);
                }, function (error) {
                    reject(error);
                })
            }
        })
    }
}

export function linkToFlowZone(idDevice, idZone) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            if (idZone) {
                deviceService.linkDeviceFlowZone(idDevice, idZone).then(function (deviceChanged) {
                    dispatch({ type: DEVICE_MODIFY_ZONE, data: { idDevice: idDevice, idZone: idZone } });
                    if (deviceChanged.unlinkedDevice)
                        dispatch({ type: DEVICE_MODIFY_ZONE, data: { idDevice: deviceChanged.unlinkedDevice, idZone: null } });
                    resolve(deviceChanged);
                }, function (error) {
                    reject(error);
                })
            } else {
                deviceService.unlinkDeviceFlowZone(idDevice).then(function (deviceChanged) {
                    dispatch({ type: DEVICE_MODIFY_ZONE, data: { idDevice: idDevice, idZone: null } });
                    resolve(deviceChanged);
                }, function (error) {
                    reject(error);
                })
            }
        })
    }
}

export function checkDevice(idLink, type) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            
            deviceService.checkDevice(idLink, type).then(function (ok) {
                resolve(ok.type)
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function addLink(idLink, idZone) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.checkDevice(idLink, 'any'/*'LINK'*/).then(function (ok) {
                deviceService.addDevice(idLink, { type: ok.type, idZone: idZone }).then(function (ok2) {
                    getDeviceList()(dispatch, getState).then(function () {
                        resolve(ok.type)
                    }, function (error) {
                        reject(error);
                    });
                }, function (error) {
                    reject(error);
                })
            }, function (error) {
                reject(error);
            })
        })
    }
}

export function modifyDevice(idDevice, data) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var devices = getState().fliwerDeviceReducer.devices;

            if (devices[idDevice]) {

                deviceService.modifyDevice(idDevice, data).then(function () {
                    dispatch({ type: DEVICE_MODIFY, data: { idDevice: idDevice, data: data } });
                    resolve();

                }, function (error) {
                    reject(error);
                })

            } else
                reject();
        });
    };
}

export function modifyControlValves(idDevice, valves) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var devices = getState().fliwerDeviceReducer.devices;

            if (devices[idDevice].valves) {

                deviceService.modifyControlConfig(idDevice, valves).then(function (response) {
                    for (var i = 0; i < valves.length; i++) {
                        dispatch({ type: DEVICE_MODIFY_VALVE, data: { idDevice: idDevice, data: valves[i] } });
                    }

                    getDeviceValves(idDevice)(dispatch, getState).then(function (response2) {
                        resolve();
                    }, function (error) {
                        reject(error);
                    });

                }, function (error) {
                    console.log("modifyControlValves error", error);
                    reject(error);
                })

            } else
                reject();
        })
    }
}

export function modifyFlowMeterTicks(idDevice, flowMeterTicks) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var devices = getState().fliwerDeviceReducer.devices;
            if (devices[idDevice]) {
                deviceService.modifyDevice(idDevice, { flowMeterTicks: flowMeterTicks }).then(function () {
                    dispatch({ type: DEVICE_MODIFY, data: { idDevice: idDevice, data: { flowMeterTicks: flowMeterTicks } } });
                    resolve();
                }, function (error) {
                    reject(error);
                })

            } else
                reject();
        })
    }
}

export function setControlValveFlowRef(idControl, valveNumber, flowref) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var devices = getState().fliwerDeviceReducer.devices;
            if (devices[idControl]) {
                deviceService.setControlValveFlowRef(idControl, valveNumber, flowref).then(function () {
                    dispatch({ type: DEVICE_MODIFY_VALVE, data: { idDevice: idControl, data: { valveNumber: valveNumber, caudalRef: flowref } } });
                    resolve();
                }, function (error) {
                    reject(error);
                })

            } else
                reject();
        })
    }
}

export function setLinkWakeupPeriod(idLink, wakeUpPeriod) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var devices = getState().fliwerDeviceReducer.devices;
            if (devices[idLink] && devices[idLink].wakeUpPeriod) {
                deviceService.setLinkWakeupPeriod(idLink, wakeUpPeriod).then(function () {
                    dispatch({ type: DEVICE_MODIFY, data: { idDevice: idLink, data: { wakeUpPeriod: wakeUpPeriod } } });
                    resolve();
                }, function (error) {
                    reject(error);
                })

            } else
                reject();
        })
    }
}

export function getDeviceStorage() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            uniqueStorage.getItem('deviceInfo').then(function (data) {
                if (data)
                    data = JSON.parse(data);
                dispatch({ type: DEVICE_SET_STORAGE_INFO, data: data });
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
            dispatch({ type: DEVICE_WIPE_STORAGE_INFO });
            resolve();
        })
    }
}

export function getDeviceData(idDevice) {
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_SET_LOADINGDATA, data: {} });
        return new Promise(function (resolve, reject) {
            var startDataTime = Math.floor(Date.now() / 1000) - 604800;
            var endDataTime = Math.floor(Date.now() / 1000);
            deviceService.getDeviceData(idDevice, { startDataTime: startDataTime, endDataTime: endDataTime/*, startHistoryDataTime: startDataTime, endHistoryDataTime: endDataTime*/ }).then(function (response) {
                //const data = normalize({taskManagerHistories: response.taskManagerHistoryData}, schema.taskManagerHistoryList);
                //const data2 = normalize({irrigationHistories: response.irrigationHistoryData}, schema.irrigationHistoryList);
                response.data.dataGathered = { from: startDataTime, to: endDataTime };

                dispatch({
                    type: DEVICE_ADD_DATA,
                    data: {
                        idDevice: idDevice,
                        //genericInfo: response.genericInfo,
                        data: response.data//,
                        //irrigationHistoryData: data2.entities.irrigationHistory,
                        //taskManagerHistoryData: data.entities.taskManagerHistory
                    }
                });
                dispatch({ type: DEVICE_FINISH_LOADINGDATA });
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function getDeviceMoreData(idDevice, start, end) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {

            var getData = false;
            var realStart = start, realEnd = end;
            var reducer = getState().fliwerDeviceReducer.data;
            if (reducer[idDevice] && reducer[idDevice].data) {
                var datag = reducer[idDevice].data.dataGathered;
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
                deviceService.getDeviceData(idDevice, { startDataTime: start, endDataTime: end/*, startHistoryDataTime: start, endHistoryDataTime: end*/ }).then((response) => {
                    //const data2 = normalize({irrigationHistories: response.irrigationHistoryData}, schema.irrigationHistoryList);
                    response.data.dataGathered = { from: realStart, to: realEnd };
                    dispatch({ type: DEVICE_ADD_MORE_DATA, data: { idDevice: idDevice, data: response.data/*, irrigationHistoryData: data2.entities*/ } })
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

export function getDeviceDataPackets(idDevice) {
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_SET_LOADINGDATA, data: {} });
        return new Promise(function (resolve, reject) {
            var startDataTime = Math.floor(Date.now() / 1000) - 604800;
            var endDataTime = Math.floor(Date.now() / 1000);
            deviceService.getDeviceDataPackets(idDevice, { startDataTime: startDataTime, endDataTime: endDataTime/*, startHistoryDataTime: startDataTime, endHistoryDataTime: endDataTime*/ }).then(function (response) {
                //const data = normalize({taskManagerHistories: response.taskManagerHistoryData}, schema.taskManagerHistoryList);
                //const data2 = normalize({irrigationHistories: response.irrigationHistoryData}, schema.irrigationHistoryList);
                response.data.dataGathered = { from: startDataTime, to: endDataTime };

                dispatch({
                    type: DEVICE_ADD_PACKET_DATA,
                    data: {
                        idDevice: idDevice,
                        //genericInfo: response.genericInfo,
                        packetData: response.data//,
                        //irrigationHistoryData: data2.entities.irrigationHistory,
                        //taskManagerHistoryData: data.entities.taskManagerHistory
                    }
                });
                dispatch({ type: DEVICE_FINISH_LOADINGDATA });
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}


export function getDeviceMoreDataPackets(idDevice, start, end) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {

            var getData = false;
            var realStart = start, realEnd = end;
            var reducer = getState().fliwerDeviceReducer.packetData;
            if (reducer[idDevice] && reducer[idDevice].packetData) {
                var datag = reducer[idDevice].packetData.dataGathered;
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
                deviceService.getDeviceDataPackets(idDevice, { startDataTime: start, endDataTime: end/*, startHistoryDataTime: start, endHistoryDataTime: end*/ }).then((response) => {
                    //const data2 = normalize({irrigationHistories: response.irrigationHistoryData}, schema.irrigationHistoryList);
                    response.data.dataGathered = { from: realStart, to: realEnd };
                    dispatch({ type: DEVICE_ADD_MORE_PACKET_DATA, data: { idDevice: idDevice, packetData: response.data/*, irrigationHistoryData: data2.entities*/ } })
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


export function setSimultaneity(value) {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: DEVICE_SIMULTANEITY_ACTIVATED, simultaneityActivated: value });
            resolve();
        });
    };
}

export function getRealtimeDeviceData(idDevice) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.getRealtimeDeviceData(idDevice).then(function (response) {
                resolve(response.data);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function openValve(idDevice, idControl, valveNumber) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.openValve(idDevice, idControl, valveNumber).then(function () {
                dispatch({ type: DEVICE_REALTIME_SET_DEVICES_VALVES, idDevice: idControl, valveNumber: valveNumber, status: 'open' });
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function closeValve(idDevice, idControl, valveNumber) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.closeValve(idDevice, idControl, valveNumber).then(function () {
                dispatch({ type: DEVICE_REALTIME_SET_DEVICES_VALVES, idDevice: idControl, valveNumber: valveNumber, status: 'closed' });
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function realtimeCloseConnection(idDevice) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.realtimeCloseConnection(idDevice).then(function () {
                resolve();
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function setStatusValve(idDevice, idControl, valveNumber, status) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: DEVICE_REALTIME_SET_DEVICES_VALVES, idDevice: idControl, valveNumber: valveNumber, status: status });
            resolve();
        });
    };
}

export function getFlowDevices(type) {
    return (dispatch, getState) => {
        var devices = Object.values(getState().fliwerDeviceReducer.devices);
        return Object.values(devices).filter((d)=>{return d.reedSensorType==type}).sort((d1,d2)=>{return d1<d2?-1:(d2<d1?1:0)});
    };
}

export function updateRealtimeConnectionStatus(idDevice,status){
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_REALTIME_SET_STATUS, idDevice: idDevice, data: status });
        //if device status==1 and device.realTimeConfig.connectionTime is null, then getDevice again
        var device = getState().fliwerDeviceReducer.devices[idDevice];
        if(device && device.realTimeConfig && device.realTimeConfig.connectionTime==null && status==1){
            getDevice(idDevice)(dispatch, getState);
        }
    }
}

export function updateRealTimeIrrigationStatus(idDevice,status){
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_REALTIME_SET_IRRIGATIONSTATUS, idDevice: idDevice, data: status });
    };
}

export function updateRealTimeFlow(idDevice,flow){
    return (dispatch, getState) => {
        dispatch({ type: DEVICE_REALTIME_SET_FLOW, idDevice: idDevice, data: flow });
    };
}

export function getDeviceAllPingTest(idDevice){
    //DEVICE_REALTIME_PING_TEST
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.getDeviceAllPingTest(idDevice).then(function (response) {
                dispatch({ type: DEVICE_REALTIME_PING_TEST, idDevice: idDevice, data: response });
                resolve(response)
            }, function (error) {
                reject(error)
            });
        });
    }
}

export function updateDevicePingTest(idDevice,test){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            dispatch({ type: DEVICE_REALTIME_PING_TEST, idDevice: idDevice, data: test });
            resolve()
        });
    }
}

export function startRealTime(idDevice,idHome) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.startRealTime(idDevice).then(function (result) {
                getDeviceList(null,idHome)(dispatch, getState).then(function () {
                    resolve(result)
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function startRealTimeAll(idHome){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.startRealTimeAll(idHome).then(function (result) {
                getDeviceList(null,idHome)(dispatch, getState).then(function () {
                    resolve(result)
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function endRealTime(idDevice,idHome) {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.endRealTime(idDevice).then(function (result) {
                getDeviceList(null,idHome)(dispatch, getState).then(function () {
                    resolve(result)
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function endRealTimeAll(idHome){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            deviceService.endRealTimeAll(idHome).then(function (result) {
                getDeviceList(null,idHome)(dispatch, getState).then(function () {
                    resolve(result)
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function sendDataRealTime(idDevice,command,data,retry,retryTimeout){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            socketManager.sendData(idDevice,command,data,retry,retryTimeout).then(function (data) {
                resolve(data);
            }, function (error) {
                reject(error);
            });
        });
    };
}

export function realTimeStartPingTest(idDevice,packetSize,pingPeriod,duration){
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            //Get device
            var device = getState().fliwerDeviceReducer.devices[idDevice];
            if(device && device.LinkSerialNumber ){
                //Send this websocket message: {"command":"pingTestRequest","data":{"idDevice":"A37070750F000988","idParent":"A07071481800368A","testDuration":60,"packetSize":97,"pingPeriodSeconds":1}}
                var data = {idDevice:idDevice,idParent:device.LinkSerialNumber,testDuration:duration,packetSize:packetSize,pingPeriodSeconds:pingPeriod};
                
                sendDataRealTime(idDevice,"pingTestRequest",data,null)(dispatch, getState).then(function (response) {
                    resolve(response);
                }, function (error) {
                    reject(error);
                });
            }
        });
    };
}