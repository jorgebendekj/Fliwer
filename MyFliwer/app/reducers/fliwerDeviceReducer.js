// @flow
import structuredClone from "@ungap/structured-clone";

import {DEVICE_SET_LOADING, DEVICE_FINISH_LOADING, DEVICE_ADD_ALL, DEVICE_ADD_ENTRY, DEVICE_SET_STORAGE_INFO, DEVICE_WIPE_STORAGE_INFO, DEVICE_ADD_VALVES, DEVICE_MODIFY_ZONE, DEVICE_MODIFY_VALVE, DEVICE_MODIFY, DEVICE_VALVES_LOADING, DEVICE_SET_LOADINGDATA, DEVICE_FINISH_LOADINGDATA, DEVICE_ADD_DATA, DEVICE_ADD_MORE_DATA, DEVICE_SIMULTANEITY_ACTIVATED, DEVICE_REALTIME_SET_DEVICES_VALVES,DEVICE_ADD_PACKET_DATA,DEVICE_ADD_MORE_PACKET_DATA,DEVICE_REALTIME_SET_STATUS,DEVICE_DELETE,DEVICE_REALTIME_SET_IRRIGATIONSTATUS,DEVICE_REALTIME_SET_FLOW,DEVICE_REALTIME_PING_TEST} from "../actions/fliwerDeviceActions.js" //Import the actions types constant we defined in our action

//import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
let dataState = {devices: {}, deviceRealTimeInfo:{}, lastUpdate: 0, loading: false, allValvesLoading: false, allValvesLoaded: false, loadingData: false, data: {},packetData:{}, simultaneityActivated: false, realtimeDevicesValves: {}};

const fliwerDeviceReducer = (state = dataState, action) => {
    switch (action.type) {
        case DEVICE_SET_LOADING:
            state = Object.assign({}, state, {loading: true});
            return state;
        case DEVICE_FINISH_LOADING:
            state = Object.assign({}, state, {loading: false});
            return state;
        case DEVICE_VALVES_LOADING:
            if (action.data.loading)
                state = Object.assign({}, state, {allValvesLoading: true});
            else
                state = Object.assign({}, state, {allValvesLoading: false, allValvesLoaded: true});
            return state;
        case DEVICE_ADD_ALL:
            var knownData = [];
            
            var newDevices={};
            if (action.data) {
                for (var i = 0; i < Object.keys(action.data).length; i++) {
                    knownData[i] = {id: Object.keys(action.data)[i], data: state.devices[Object.keys(action.data)[i]] ? state.devices[Object.keys(action.data)[i]].valves : null};
                }
                // Create a new devices object that includes devices from the original state if they meet the conditions
                newDevices = Object.assign({}, action.data);
                Object.keys(state.devices).forEach(deviceId => {
                    if (!action.data[deviceId]) {
                        newDevices[deviceId] = state.devices[deviceId];
                    }
                });
            }else{
                //maintain the devices that are already in the state
                newDevices = state.devices;
            }


            state = Object.assign({}, state, {devices: newDevices});
            for (var i = 0; i < knownData.length; i++) {
                state.devices[knownData[i].id].valves = knownData[i].data;
            }
            return state;
        
        case DEVICE_ADD_ENTRY:
            var knownData = [];
            if (action.data) {
                knownData = state.devices[action.data.DeviceSerialNumber] ? state.devices[action.data.DeviceSerialNumber].valves : null;
            }
            var device={};
            device[action.data.DeviceSerialNumber]=action.data;
            state = Object.assign({}, state, {devices: Object.assign({}, state.devices, device)});
            if (knownData && action.data)
                state.devices[action.data.DeviceSerialNumber].valves = knownData;
            /*
             uniqueStorage.setItem('deviceInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case DEVICE_ADD_VALVES:
            var newdata = Object.assign({}, state);
            if (!newdata.devices[action.data.idDevice])
                newdata.devices[action.data.idDevice] = {};
            newdata.devices[action.data.idDevice].valves = Object.assign({}, newdata.devices[action.data.idDevice].data, action.data.data);
            state = Object.assign({}, state, newdata, {lastUpdate: Date.now()});
            /*
             uniqueStorage.setItem('deviceInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;
        case DEVICE_MODIFY_VALVE:
            var newdata = Object.assign({}, state);
            if (!newdata.devices[action.data.idDevice])
                newdata.devices[action.data.idDevice] = {};
            
            var index;
            if(newdata.devices[action.data.idDevice].valves.config[0].valveNumber==0) index=action.data.data.valveNumber;
            else index=action.data.data.valveNumber - 1;


            newdata.devices[action.data.idDevice].valves.config[index] = Object.assign({}, newdata.devices[action.data.idDevice].valves.config[index], action.data.data);
            state = Object.assign({}, state, newdata, {lastUpdate: Date.now()});
            /*
             uniqueStorage.setItem('deviceInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case DEVICE_DELETE:
             var newdata = structuredClone(state);
            if (newdata.devices[action.data.idDevice]) {
                delete newdata.devices[action.data.idDevice];
            }
            state = Object.assign({}, state, newdata, {lastUpdate: Date.now()});
            return state;

        case DEVICE_SET_STORAGE_INFO:
            state = Object.assign({}, state, action.data);
            return state;

        case DEVICE_WIPE_STORAGE_INFO:
            state = Object.assign({}, state, {devices: {}, lastUpdate: 0, loading: true});
            /*
             uniqueStorage.setItem('deviceInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;
        case DEVICE_MODIFY_ZONE: //For sensors

            var newdata = structuredClone(state);
            if (!newdata.devices[action.data.idDevice])
                newdata.devices[action.data.idDevice] = {};

            newdata.devices[action.data.idDevice].idZone = action.data.idZone;

            
            if (action.data.nsensor) {
                if (!newdata.devices[action.data.idDevice].zones){
                    if(newdata.devices[action.data.idDevice].idZone)
                        newdata.devices[action.data.idDevice].zones = [{idZone: newdata.devices[action.data.idDevice].idZone, loggerSensor: 1}]
                    else newdata.devices[action.data.idDevice].zones = []
                }


                newdata.devices[action.data.idDevice].zones = newdata.devices[action.data.idDevice].zones.filter((z) => {
                    return z.loggerSensor != action.data.nsensor && z.idZone != action.data.idZone
                })
                if(action.data.idZone)
                    newdata.devices[action.data.idDevice].zones.push({idZone: action.data.idZone, loggerSensor: action.data.nsensor})

            }

            state= Object.assign({}, newdata);
            /*
             uniqueStorage.setItem('de)viceInfo',JSON.stringify(state)).then(()=>{
             return state;
             });
             */
            return state;
        case DEVICE_MODIFY: //For sensors
            var newdata = Object.assign({}, state);
            if (!newdata.devices[action.data.idDevice])
                newdata.devices[action.data.idDevice] = {};
            newdata.devices[action.data.idDevice] = Object.assign({}, newdata.devices[action.data.idDevice], action.data.data);
            state = Object.assign({}, state, newdata, {lastUpdate: Date.now()});
            /*
             uniqueStorage.setItem('deviceInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;

        case DEVICE_SET_LOADINGDATA:
            state = Object.assign({}, state, {loadingData: true});
            return state;

        case DEVICE_FINISH_LOADINGDATA:
            state = Object.assign({}, state, {loadingData: false});
            return state;

        case DEVICE_ADD_DATA:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idDevice])
                newdata.data[action.data.idDevice] = {};
            
            newdata.data[action.data.idDevice].data = Object.assign({}, newdata.data[action.data.idDevice].data, action.data.data);

            //Add nulls between data losts battery values

            var wakeupPeriod  = 60*60;
            if(newdata.devices[action.data.idDevice] && newdata.devices[action.data.idDevice].config){
                wakeupPeriod  = newdata.devices[action.data.idDevice].config.wakeUpPeriod*(newdata.devices[action.data.idDevice].config.wakeUpPeriodUnits?3600:60);
            }

            if(newdata.data[action.data.idDevice].data && newdata.data[action.data.idDevice].data.battery){
                var newData_battery = [];
                for(var i=0;i<newdata.data[action.data.idDevice].data.battery.length;i++){
                    if(i>0 && newdata.data[action.data.idDevice].data.battery[i].time-newdata.data[action.data.idDevice].data.battery[i-1].time>2*wakeupPeriod )newData_battery.push({time: (newdata.data[action.data.idDevice].data.battery[i].time+newdata.data[action.data.idDevice].data.battery[i-1].time)/2, value: null, percent: null});
                    newData_battery.push(newdata.data[action.data.idDevice].data.battery[i]);
                }
    
                if(newdata.data[action.data.idDevice].data.battery[0] && action.data.data.battery[action.data.data.battery.length-1] && action.data.data.battery[action.data.data.battery.length-1].time<newdata.data[action.data.idDevice].data.battery[0].time && newdata.data[action.data.idDevice].data.battery[0].time+action.data.data.battery[action.data.data.battery.length-1].time>2*60*60)newData_battery.unshift({time: (newdata.data[action.data.idDevice].data.battery[0].time+action.data.data.battery[action.data.data.battery.length-1].time)/2, value: null, percent: null});
    
                newdata.data[action.data.idDevice].data.battery=newData_battery;
            }
            //
//            newdata.data[action.data.idDevice].irrigationHistoryData = Object.assign({}, newdata.data[action.data.idDevice].irrigationHistoryData, action.data.irrigationHistoryData);
//            newdata.data[action.data.idDevice].taskManagerHistoryData = Object.assign({}, newdata.data[action.data.idDevice].taskManagerHistoryData, action.data.taskManagerHistoryData);
//            newdata.data[action.data.idDevice].genericInfo = Object.assign({}, newdata.data[action.data.idDevice].genericInfo, action.data.genericInfo);
//            newdata.data[action.data.idDevice].firstIrrigation = Object.assign({}, newdata.data[action.data.idDevice].firstIrrigation, action.data.firstIrrigation);
            state = Object.assign({}, state, newdata);

            return state;

        case DEVICE_ADD_MORE_DATA:
            var newdata = Object.assign({}, state);
            if (!newdata.data[action.data.idDevice])
                newdata.data[action.data.idDevice] = {};
            newdata.data[action.data.idDevice].data.battery = action.data.data.battery.concat(newdata.data[action.data.idDevice].data.battery).sort((a, b) => {
                return a.time - b.time;
            });

            //Add nulls between data losts battery values

            if(newdata.data[action.data.idDevice].data && newdata.data[action.data.idDevice].data.battery){


                var wakeupPeriod  = 60*60;
                if(newdata.devices[action.data.idDevice] && newdata.devices[action.data.idDevice].config){
                    wakeupPeriod  = newdata.devices[action.data.idDevice].config.wakeUpPeriod*(newdata.devices[action.data.idDevice].config.wakeUpPeriodUnits?3600:60);
                }

                var newData_battery = [];
                for(var i=0;i<newdata.data[action.data.idDevice].data.battery.length;i++){
                    if(i>0 && newdata.data[action.data.idDevice].data.battery[i].time-newdata.data[action.data.idDevice].data.battery[i-1].time>2*wakeupPeriod)newData_battery.push({time: (newdata.data[action.data.idDevice].data.battery[i].time+newdata.data[action.data.idDevice].data.battery[i-1].time)/2, value: null, percent: null});
                    newData_battery.push(newdata.data[action.data.idDevice].data.battery[i]);
                }
    
                if(action.data.data.battery[action.data.data.battery.length-1].time<newdata.data[action.data.idDevice].data.battery[0].time && newdata.data[action.data.idDevice].data.battery[0].time-action.data.data.battery[action.data.data.battery.length-1].time>2*60*60)newData_battery.unshift({time: (newdata.data[action.data.idDevice].battery[0].time+action.data.data.battery[action.data.data.battery.length-1].time)/2, value: null, percent: null});
    
                newdata.data[action.data.idDevice].data.battery=newData_battery;
            }
            //

            newdata.data[action.data.idDevice].data.dataGathered = action.data.data.dataGathered;
            state = Object.assign({}, state, newdata);

            return state;

        case DEVICE_ADD_PACKET_DATA:
            var newdata = Object.assign({}, state);
            if (!newdata.packetData[action.data.idDevice])
                newdata.packetData[action.data.idDevice] = {};
            newdata.packetData[action.data.idDevice].packetData = Object.assign({}, newdata.packetData[action.data.idDevice].packetData, action.data.packetData);
            state = Object.assign({}, state, newdata);
            return state;

        case DEVICE_ADD_MORE_PACKET_DATA:
            var newdata = Object.assign({}, state);
            if (!newdata.packetData[action.data.idDevice])
                newdata.packetData[action.data.idDevice] = {};
            newdata.packetData[action.data.idDevice].packetData.packets = action.data.packetData.packets.concat(newdata.packetData[action.data.idDevice].packetData.packets).sort((a, b) => {
                return a.time - b.time;
            });

            newdata.packetData[action.data.idDevice].packetData.dataGathered = action.data.packetData.dataGathered;
            state = Object.assign({}, state, newdata);
            return state;

        case DEVICE_SIMULTANEITY_ACTIVATED:
            state = Object.assign({}, state, {simultaneityActivated: action.simultaneityActivated});
            return state;

        case DEVICE_REALTIME_SET_DEVICES_VALVES:
            var newdata = Object.assign({}, state);
            if (!newdata.realtimeDevicesValves[action.idDevice])
                newdata.realtimeDevicesValves[action.idDevice] = {};
            if (!newdata.realtimeDevicesValves[action.idDevice][action.valveNumber])
                newdata.realtimeDevicesValves[action.idDevice][action.valveNumber] = {};
            newdata.realtimeDevicesValves[action.idDevice][action.valveNumber] = {
                time: Date.now(),
                status: action.status
            };

            return newdata;

        case DEVICE_REALTIME_SET_STATUS:
            //deviceRealTimeInfo
            
            var newdata = structuredClone(state);
            if (!newdata.deviceRealTimeInfo[action.idDevice])
                newdata.deviceRealTimeInfo[action.idDevice] = {irrigationStatus:[]};

            newdata.deviceRealTimeInfo[action.idDevice] = {
                time: Date.now(),
                status: action.data.status,
                irrigationStatus:newdata.deviceRealTimeInfo[action.idDevice].irrigationStatus?newdata.deviceRealTimeInfo[action.idDevice].irrigationStatus:[]
            };
            state= Object.assign({}, newdata);
            return state;
        case DEVICE_REALTIME_SET_IRRIGATIONSTATUS:
            //deviceRealTimeInfo

            var newdata = structuredClone(state);
            if (!newdata.deviceRealTimeInfo[action.idDevice])
                newdata.deviceRealTimeInfo[action.idDevice] = {irrigationStatus:[]};

            newdata.deviceRealTimeInfo[action.idDevice].irrigationStatus=action.data;
            
            state= Object.assign({}, newdata);
            return state;

        case DEVICE_REALTIME_SET_FLOW:
            //deviceRealTimeInfo

            var newdata = structuredClone(state);
            if(!newdata.devices[action.idDevice].realTimeConfig)newdata.devices[action.idDevice].realTimeConfig={};

            newdata.devices[action.idDevice].realTimeConfig.flow=action.data;
            
            return newdata;

        case DEVICE_REALTIME_PING_TEST:
            //state.devices[action.idDevice].pingTests is an array obj ping tests Objects. This objects have and idTest. Search if exists and replace with the new test or add it if not exists
            var newdata = structuredClone(state);

            if (!newdata.devices[action.idDevice])
                newdata.devices[action.idDevice] = {};
            if (!newdata.devices[action.idDevice].pingTests)
                newdata.devices[action.idDevice].pingTests = [];

            for(var i=0;i<action.data.length;i++){

                var index = newdata.devices[action.idDevice].pingTests.findIndex((test) => {
                    return test.idTest == action.data[i].idTest;
                });
                if (index >= 0) {
                    newdata.devices[action.idDevice].pingTests[index] = action.data[i];
                } else {
                    newdata.devices[action.idDevice].pingTests.unshift(action.data[i]);
                }

            }

            return newdata;

        default:
            return state;
    }
};

export default fliwerDeviceReducer;
