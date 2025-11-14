// @flow
import structuredClone from "@ungap/structured-clone";
import {ZONE_ADD_MORE_DATA, UPDATE_REPLANTTIME, SET_URCUSTOM, MODIFY_ZONE, IRRIGATION_PROGRAM_MODIFY, IRRIGATION_PROGRAM_DELETE, ZONE_ADD_IRRIGATION_PROGRAMS, ZONE_IRRIGATION_PROGRAMS, ZONE_ADD_ENTRY, ZONE_SET_LOADING, ZONE_IRRIGATION_HISTORY, ZONE_FINISH_LOADING, ZONE_SET_LOADINGDATA, ZONE_FINISH_LOADINGDATA, ZONE_SET_STORAGE_INFO, ZONE_WIPE_STORAGE_INFO, ZONE_ADD_DATA, ZONE_DELETE, ALERT_DELETE, ZONE_TASKMANAGER_HISTORY, ZONE_SET_LOADINGIRRIGATIONDATA, ZONE_FINISH_LOADINGIRRIGATIONDATA, USER_HOME_HAS_BEEN_VISITED,IRRIGATION_HISTORYDATA_DELETE} from "../actions/fliwerZoneActions.js" //Import the actions types constant we defined in our action

//import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
let dataState = {data: {}, loading: false, loadingData: false, lastUpdatedZone: null, loadingIrrigationData: false, userHomeHasBeenVisited: false};

const fliwerZoneReducer = (state = dataState, action) => {
    switch (action.type) {
        case ZONE_SET_LOADING:
            state = Object.assign({}, state, {loading: true});

            return state;
        case ZONE_FINISH_LOADING:
            state = Object.assign({}, state, {loading: false});

            return state;
        case ZONE_SET_LOADINGDATA:
            state = Object.assign({}, state, {loadingData: true});

            return state;
        case ZONE_FINISH_LOADINGDATA:
            state = Object.assign({}, state, {loadingData: false});

            return state;
        case ZONE_SET_LOADINGIRRIGATIONDATA:
            state = Object.assign({}, state, {loadingIrrigationData: true});

            return state;
        case ZONE_FINISH_LOADINGIRRIGATIONDATA:
            state = Object.assign({}, state, {loadingIrrigationData: false});

            return state;
        case ZONE_ADD_ENTRY:

            var knownData = state.data[Object.keys(action.data)[0]] ? state.data[Object.keys(action.data)[0]].data : null;
            var knownIrrigationHistoryData = state.data[Object.keys(action.data)[0]] ? state.data[Object.keys(action.data)[0]].irrigationHistoryData : null;
            var knowntaskManagerHistoryData = state.data[Object.keys(action.data)[0]] ? state.data[Object.keys(action.data)[0]].taskManagerHistoryData : null;
            var knownIrrigationProgramsData = state.data[Object.keys(action.data)[0]] ? state.data[Object.keys(action.data)[0]].irrigationProgramsData : null;

            state = Object.assign({}, state, {data: Object.assign({}, state.data, action.data)});
            if (knownData)
                state.data[Object.keys(action.data)[0]].data = knownData;
            if (knownIrrigationHistoryData)
                state.data[Object.keys(action.data)[0]].irrigationHistoryData = knownIrrigationHistoryData;
            if (knowntaskManagerHistoryData)
                state.data[Object.keys(action.data)[0]].taskManagerHistoryData = knowntaskManagerHistoryData;
            if (knownIrrigationProgramsData)
                state.data[Object.keys(action.data)[0]].irrigationProgramsData = knownIrrigationProgramsData;



            return state;
        case ZONE_ADD_DATA:
            
             var newdata = structuredClone(state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].data = Object.assign({}, newdata.data[action.data.idZone].data, action.data.data);
            newdata.data[action.data.idZone].irrigationHistoryData = Object.assign({}, newdata.data[action.data.idZone].irrigationHistoryData, action.data.irrigationHistoryData);
            newdata.data[action.data.idZone].taskManagerHistoryData = Object.assign({}, newdata.data[action.data.idZone].taskManagerHistoryData, action.data.taskManagerHistoryData);
            newdata.data[action.data.idZone].genericInfo = Object.assign({}, newdata.data[action.data.idZone].genericInfo, action.data.genericInfo);
            newdata.data[action.data.idZone].firstIrrigation = Object.assign({}, newdata.data[action.data.idZone].firstIrrigation, action.data.firstIrrigation);
            
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return newdata;

        case ZONE_ADD_MORE_DATA:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].data.light = action.data.data.light.concat(newdata.data[action.data.idZone].data.light).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.fert = action.data.data.fert.concat(newdata.data[action.data.idZone].data.fert).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.hum = action.data.data.hum.concat(newdata.data[action.data.idZone].data.hum).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.hum_inst = action.data.data.hum_inst.concat(newdata.data[action.data.idZone].data.hum_inst).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.light_inst = action.data.data.light_inst.concat(newdata.data[action.data.idZone].data.light_inst).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.meteo = action.data.data.meteo.concat(newdata.data[action.data.idZone].data.meteo).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.temp = action.data.data.temp.concat(newdata.data[action.data.idZone].data.temp).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.water = action.data.data.water.concat(newdata.data[action.data.idZone].data.water).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.water2 = action.data.data.water2.concat(newdata.data[action.data.idZone].data.water2).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.water3 = action.data.data.water3.concat(newdata.data[action.data.idZone].data.water3).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.anemometer = action.data.data.anemometer.concat(newdata.data[action.data.idZone].data.anemometer).sort((a, b) => {
                return a.time - b.time
            })
            newdata.data[action.data.idZone].data.pluviometer = action.data.data.pluviometer.concat(newdata.data[action.data.idZone].data.pluviometer).sort((a, b) => {
                return a.time - b.time
            })
            
            // flow
            var flow = action.data.data.flow.concat([]);
            var flowObj = {};
            for (var k = 0; k < flow.length; k++)
                flowObj[flow[k].DeviceSerialNumber] = flow[k];
            var devices = [];
            for (var i = 0; i < newdata.data[action.data.idZone].data.flow.length; i++) {
                if (flowObj[newdata.data[action.data.idZone].data.flow[i].DeviceSerialNumber]) {
                    devices.push(newdata.data[action.data.idZone].data.flow[i].DeviceSerialNumber);
                    newdata.data[action.data.idZone].data.flow[i].data = flowObj[newdata.data[action.data.idZone].data.flow[i].DeviceSerialNumber].data.concat(newdata.data[action.data.idZone].data.flow[i].data).sort((a, b) => {
                        return a.time - b.time;
                    });
                }
            }
            flow = flow.filter((f) => {
                return devices.indexOf(f.DeviceSerialNumber) == -1
            });
            for (var i = 0; i < flow.length; i++) {
                newdata.data[action.data.idZone].data.flow.push(flow[i]);
            }
            
            // pluviometer
            /*
            var pluviometer = action.data.data.pluviometer.concat([]);
            var pluviometerObj = {};
            for (var k = 0; k < pluviometer.length; k++)
                pluviometerObj[pluviometer[k].DeviceSerialNumber] = pluviometer[k];
            var devices = [];
            for (var i = 0; i < newdata.data[action.data.idZone].data.pluviometer.length; i++) {
                if (pluviometerObj[newdata.data[action.data.idZone].data.pluviometer[i].DeviceSerialNumber]) {
                    devices.push(newdata.data[action.data.idZone].data.pluviometer[i].DeviceSerialNumber);
                    newdata.data[action.data.idZone].data.pluviometer[i].data = pluviometerObj[newdata.data[action.data.idZone].data.pluviometer[i].DeviceSerialNumber].data.concat(newdata.data[action.data.idZone].data.pluviometer[i].data).sort((a, b) => {
                        return a.time - b.time;
                    });
                }
            }
            pluviometer = pluviometer.filter((f) => {
                return devices.indexOf(f.DeviceSerialNumber) == -1
            });
            for (var i = 0; i < pluviometer.length; i++) {
                newdata.data[action.data.idZone].data.pluviometer.push(pluviometer[i]);
            }
            */
           
            // anemometer
            /*
            var anemometer = action.data.data.anemometer.concat([]);
            var anemometerObj = {};
            for (var k = 0; k < anemometer.length; k++)
                anemometerObj[anemometer[k].DeviceSerialNumber] = anemometer[k];
            var devices = [];
            for (var i = 0; i < newdata.data[action.data.idZone].data.anemometer.length; i++) {
                if (anemometerObj[newdata.data[action.data.idZone].data.anemometer[i].DeviceSerialNumber]) {
                    devices.push(newdata.data[action.data.idZone].data.anemometer[i].DeviceSerialNumber);
                    newdata.data[action.data.idZone].data.anemometer[i].data = anemometerObj[newdata.data[action.data.idZone].data.anemometer[i].DeviceSerialNumber].data.concat(newdata.data[action.data.idZone].data.anemometer[i].data).sort((a, b) => {
                        return a.time - b.time;
                    });
                }
            }
            anemometer = anemometer.filter((f) => {
                return devices.indexOf(f.DeviceSerialNumber) == -1
            });
            for (var i = 0; i < anemometer.length; i++) {
                newdata.data[action.data.idZone].data.anemometer.push(anemometer[i]);
            }
            */
            
            newdata.data[action.data.idZone].data.dataGathered = action.data.data.dataGathered;
            newdata.data[action.data.idZone].irrigationHistoryData = Object.assign({}, newdata.data[action.data.idZone].irrigationHistoryData, action.data.irrigationHistoryData.irrigationHistory)
            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */

            return state;

        case IRRIGATION_HISTORYDATA_DELETE:
            var newdata = Object.assign({}, state);

            if (newdata.data[action.data.idZone])
            {
                var filtered=Object.values(newdata.data[action.data.idZone].taskManagerHistoryData).filter(d=> d.message && d.message.id==action.data.idIrrigationProgram);
                if(filtered.length>0) delete newdata.data[action.data.idZone].taskManagerHistoryData[filtered[0].id]
            }
            state = Object.assign({}, state, newdata);

            return state;


        case ZONE_TASKMANAGER_HISTORY:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].taskManagerHistoryData = Object.assign({}, newdata.data[action.data.idZone].taskManagerHistoryData, action.data.taskManagerHistoryData);
            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case ZONE_IRRIGATION_HISTORY:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].irrigationHistoryData = Object.assign({}, newdata.data[action.data.idZone].irrigationHistoryData, action.data.irrigationHistoryData);
            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case ZONE_IRRIGATION_PROGRAMS:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].irrigationProgramsData = Object.assign({}, newdata.data[action.data.idZone].irrigationProgramsData, action.data.irrigationProgramsData);
            state = Object.assign({}, state, newdata);
            //console.log("REDUCER 3", state)
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case ZONE_ADD_IRRIGATION_PROGRAMS:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].irrigationProgramsData = Object.assign({}, newdata.data[action.data.idZone].irrigationProgramsData, action.data.irrigationProgramsData);
            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case IRRIGATION_PROGRAM_DELETE:
            var newdata = Object.assign({}, state);

            //console.log("daquesta taula esborrar: "+newdata.data.idZone.irrigationProgramsData+ " la id: ")
            if (newdata.data[action.data.idZone])
            {
                delete newdata.data[action.data.idZone].irrigationProgramsData[action.data.idIrrigationProgram]
            }
            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;


        case IRRIGATION_PROGRAM_MODIFY:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};

            newdata.data[action.data.idZone].irrigationProgramsData = Object.assign({}, newdata.data[action.data.idZone].irrigationProgramsData, action.data.irrigationProgramsData);


            state = Object.assign({}, state, newdata);

            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case MODIFY_ZONE:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};

            newdata.data[action.data.idZone] = Object.assign({}, newdata.data[action.data.idZone], action.data.zoneInformation);

            //state = Object.assign({}, state, newdata );
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;



        case ZONE_SET_STORAGE_INFO:
            state = Object.assign({}, state, action.data, {loadingData: state.loadingData});

            return state;
        case ZONE_WIPE_STORAGE_INFO:
            state = Object.assign({}, state, {data: {}, loading: true});
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */

            return state;
        case ZONE_DELETE:
            console.log("ZONE_DELETE", action.data.idZone);
            var newdata = Object.assign({}, state);
            if (newdata.data[action.data.idZone])
                delete newdata.data[action.data.idZone];
            console.log("newdata.data", newdata.data);
            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;
        case ALERT_DELETE:
            var found = false;
            var i = 0;
            var newdata = Object.assign({}, state);

            if (action.data.isAdvice) {
                while (!found && i < newdata.data[action.data.idZone].advices.length) {
                    if (newdata.data[action.data.idZone].advices[i].id === action.data.idAlerta)
                        found = true;
                    else
                        i++;
                }
                newdata.data[action.data.idZone].advices.splice(i, 1);
            } else {
                while (!found && i < newdata.data[action.data.idZone].alerts.length) {
                    if (newdata.data[action.data.idZone].alerts[i].id === action.data.idAlerta)
                        found = true;
                    else
                        i++;
                }
                newdata.data[action.data.idZone].alerts.splice(i, 1);
                newdata.data[action.data.idZone].genericInfo.sensors[action.data.filter].alerts--;

            }

            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;
        case UPDATE_REPLANTTIME:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].replantTime = action.data.replantTime;
            newdata.data[action.data.idZone].maxCalibrationTime = action.data.maxCalibrationTime?action.data.maxCalibrationTime:null;

            state = Object.assign({}, state, newdata);
            /*
             uniqueStorage.setItem('zoneInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case SET_URCUSTOM:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idZone])
                newdata.data[action.data.idZone] = {};
            newdata.data[action.data.idZone].data.limits.water[33] = action.data.limit33;
            state = Object.assign({}, state, newdata);
            return state;
            
        case USER_HOME_HAS_BEEN_VISITED:
            state = Object.assign({}, state, {userHomeHasBeenVisited: action.userHomeHasBeenVisited});
            return state;

        default:
            return state;
    }
};

export default fliwerZoneReducer;
