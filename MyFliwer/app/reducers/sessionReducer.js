// @flow
import structuredClone from "@ungap/structured-clone";

import {CLEAN_VISITOR,ADD_USER_ID_VISITOR,CLEAN_GARDENER,ADD_USER_ID_GARDENER,NOT_PRELOADED,LOGIN_OK,LOGIN_KO,RELOGIN_DATA,INIT_PRELOADING_DATA,FINISH_PRELOADING_DATA,PRELOADED_UNTIL_ZONES,LOADED_STORAGE_DATA,WIPED_STORAGE_DATA,LOCK_LANDSCAPE,UNLOCK_LANDSCAPE,DEFAULT_LOCK_PORTRAIT,DEVICE_TOKEN,RELOAD_NOTIFICATION,CANCEL_PHONE_VERIFICATION, SET_PETITION, VERSION, CHECKED_VERSION, GET_REALTIME_PROGRAMS, REALTIME_PROGRAM_ADD_PROGRAM, REALTIME_PROGRAM_DELETE, SET_LAST_CHECKED_VERSION_TIME, REFRESH_GENERALALERTS, REFRESH_EMPLOYEES, REMOVE_EMPLOYEE, ADD_EMPLOYEE,UPDATE_EMPLOYEE,REFRESH_ACESSLOGS,GETTING_GLOBAL_DATA,GET_GLOBAL_DATA,GET_WALLET,GET_APPS,UPDATE_APP} from "../actions/sessionActions.js" //Import the actions types constant we defined in our action

import {toast} from '../widgets/toast/toast'
import { UNASSING_EMPLOYEE_TEMPLATE } from "../actions/academyActions.js";

let dataState = { data: {}, wallet:{}, apps:[],defaultApp:null, generalAlerts:{},employees:null, reloginData: {firstName:null,email:null,reloginEmail:null,relogin:false}, notificationData:[], accessLog:[], dataLogin:null, gardenerCheckidUser:null, gardenerCheckidHome: null,roles:{},isGardener:false, visitorCheckidUser:null, visitorCheckidHome: null,roles:{},isVisitor:false,loading:true, logedIn: false, firstTryLogIn:false, preloadingData: false, preloadedData:false, preloadedUntilZones:false,loadedStorageData:false,lockLandscape:false,defaultLockPortrait:false,deviceToken:null,phoneVerificationIsCancelled:false, petition: null, versionCode: null, versionName: null, forceUpdateApp: null, checkedVersion: false, lastCheckedVersionTime: Math.floor(Date.now() / 1000), realTimePrograms: [], loadingGlobalData:false, globalData:[]};

const sessionReducer = (state = dataState, action) => {
    switch (action.type) {
        case INIT_PRELOADING_DATA:
            state = Object.assign({}, state, { preloadingData:true,preloadedUntilZones:false });
            return state;

        case GET_APPS:
            var defaultApp="appStore";
            //set as default App the first action.data[something].app where access=true
            var found=false;
            var i=0;
            while(!found && i<action.data.length){
                if(action.data[i].access){
                    defaultApp=action.data[i].app;
                    found=true; 
                }
                i++;
            }
            state = Object.assign({}, state, { apps:action.data,defaultApp:defaultApp });
            return state;

        case UPDATE_APP:
            //in data: {app:app,enabled:enabled}

            var apps=state.apps;
            var index=apps.findIndex((app)=>app.app==action.data.app);
            if(index!=-1){
                apps[index].access=action.data.enabled;
            }
            state=Object.assign({}, state, { apps:apps });
            return state;
                

        case FINISH_PRELOADING_DATA:
            state = Object.assign({}, state, { preloadingData:false, preloadedData:true,preloadedUntilZones:true });
            return state;

        case REFRESH_GENERALALERTS:
            state = Object.assign({}, state, { generalAlerts:action.data });
            return state;

        case REFRESH_EMPLOYEES:
            state = Object.assign({}, state, { employees:action.data });
            return state;
        
        case REMOVE_EMPLOYEE:
            var employees=state.employees;
            employees=employees.filter((employee)=>employee.idUser!=action.data.idUser);
            state=Object.assign({}, state, { employees:employees });
            return state;

        case UNASSING_EMPLOYEE_TEMPLATE:
            var employees=state.employees;
            employees=employees.map((employee)=>{
                if(!employee.workOrderTemplates) return employee
                if(employee.workOrderTemplates[0].idCourse === action.data){
                    delete employee.workOrderTemplates
                    return employee
                }else{
                    return employee
                }
            });
            state=Object.assign({}, state, { employees:employees });
            return state;

        case ADD_EMPLOYEE:
            var employees=state.employees;
            //Find if user is already in the list
            var index=employees.findIndex((employee)=>employee.idUser==action.data.idUser);
            if(index!=-1){
                //If user is already in the list, update it
                employees[index]=action.data;
            }else{
                employees.push(action.data);
            }
            state=Object.assign({}, state, { employees:employees });
            return state;

        case UPDATE_EMPLOYEE:
            var employees=state.employees;
            var index=employees.findIndex((employee)=>employee.idUser==action.data.idUser);

            if(index!=-1){
                employees[index].roles=action.data.permissions.roles;
                employees[index].gardenerUsers=action.data.permissions.gardener;
                employees[index].employees=action.data.permissions.employees;
                employees[index].businessPosition=action.data.permissions.businessPosition;
            }
            state=Object.assign({}, state, { employees:employees });
            return state;


        case PRELOADED_UNTIL_ZONES:
            state = Object.assign({}, state, { preloadingData:false, preloadedData:false,preloadedUntilZones:true });
            return state;

        case LOGIN_OK:
            var roles=action.roles?action.roles:state.roles;
            var dataLogin=action.dataLogin?action.dataLogin:state.dataLogin;
            state = Object.assign({}, state, {  data: action.data,dataLogin:dataLogin, reloginData: {firstName:action.data.first_name,email:action.data.email,reloginEmail:action.data.reloginEmail,relogin:false},notificationData:action.notificationData,roles:roles,isGardener: action.data.gardener, isVisitor: roles.visitor,loading:false, logedIn:true, offline: action.offline || false,firstTryLogIn:true,preloadedData:false,preloadedUntilZones:false });
            if(roles.visitor && action.data && action.data.user_id){
                state = Object.assign({}, state, { visitorCheckidUser: action.data.user_id });
            }
            return state;

        case LOGIN_KO:
            state = Object.assign({}, state, { data: action.data,notificationData:action.notificationData, roles:{},isGardener:null, isVisitor:false,loading:action.loading, logedIn: false,firstTryLogIn:true, loadedStorageData:false, gardenerCheckidUser: null, gardenerCheckidHome: null,phoneVerificationIsCancelled:false, visitorCheckidUser: null, visitorCheckidHome: null});
            return state;
        case RELOGIN_DATA:
          state = Object.assign({}, state, { reloginData: action.data});
          return state;
        case RELOAD_NOTIFICATION:
            state = Object.assign({}, state, {notificationData:action.notificationData});
            return state;

        case LOADED_STORAGE_DATA:
            state = Object.assign({}, state, { loadedStorageData:true });
            return state;

        case WIPED_STORAGE_DATA:
            state = Object.assign({}, state, { loadedStorageData:false,preloadingData:true,preloadedUntilZones:false });
            return state;

        case LOCK_LANDSCAPE:
            state = Object.assign({}, state, { lockLandscape:true });
            return state;

        case UNLOCK_LANDSCAPE:
            state = Object.assign({}, state, { lockLandscape:false });
            return state;

        case DEFAULT_LOCK_PORTRAIT:
            state = Object.assign({}, state, { defaultLockPortrait:true });
            return state;

        case DEVICE_TOKEN:
            state = Object.assign({}, state, { deviceToken:action.data.deviceToken});
            return state;

        case NOT_PRELOADED:
            state = Object.assign({}, state, { preloadedData:false });
            return state;

        case ADD_USER_ID_GARDENER:
            state = Object.assign({}, state, { gardenerCheckidUser: action.gardenerCheckidUser, gardenerCheckidHome: action.gardenerCheckidHome,wallet:{}  });
            console.log("gardener actual: ", state.gardenerCheckidUser);
            return state;

        case CLEAN_GARDENER:
            state = Object.assign({}, state, {gardenerCheckidUser: null, gardenerCheckidHome: null, wallet: {}});
            console.log("gardener actual clean: ", state.gardenerCheckidUser);
            return state;

        case ADD_USER_ID_VISITOR:
            state = Object.assign({}, state, { visitorCheckidUser: action.visitorCheckidUser, visitorCheckidHome: action.visitorCheckidHome });
            //console.log("visitor actual: ", state.visitorCheckidUser);
            return state;

        case CLEAN_VISITOR:
            state = Object.assign({}, state, {visitorCheckidUser: state.roles && state.roles.visitor && state.data && state.data.user_id?state.data.user_id:null, visitorCheckidHome: null});
            //console.log("visitor actual clean: ", state.visitorCheckidUser);
            return state;

        case CANCEL_PHONE_VERIFICATION:
            state = Object.assign({}, state, { phoneVerificationIsCancelled: true} );
            return state;

        case SET_PETITION:
            var newdata = Object.assign({}, state);
            newdata = Object.assign({}, {petition: action.petition});
            state = Object.assign({}, state, newdata);
            return state;

        case VERSION:
            console.log("VERSION", action)
            state = Object.assign({}, state, { versionCode: action.versionCode, versionName: action.versionName, forceUpdateApp: action.forceUpdateApp} );
            return state;

        case CHECKED_VERSION:
            state = Object.assign({}, state, { checkedVersion: true });
            return state;

        case SET_LAST_CHECKED_VERSION_TIME:
            state = Object.assign({}, state, { lastCheckedVersionTime: Math.floor(Date.now() / 1000) });
            return state;

        case GET_REALTIME_PROGRAMS:
            var newdata = Object.assign({}, state);
            newdata.realTimePrograms = Object.assign(action.programs);
            state = Object.assign({}, state, newdata);
            return state;

        case REALTIME_PROGRAM_ADD_PROGRAM:
            var newdata = Object.assign({}, state);
            newdata.realTimePrograms.push(action.program);
            state = Object.assign({}, state, newdata);
            return state;

        case REALTIME_PROGRAM_DELETE:
            var newdata = Object.assign({}, state);

            var programs = [];
            for(var index in newdata.realTimePrograms) {
                let program = newdata.realTimePrograms[index];
                if (program.id != action.idProgram)
                    programs.push(program);
            }
            newdata.realTimePrograms = Object.assign(programs);
            state = Object.assign({}, state, newdata);
            return state;

        case REFRESH_ACESSLOGS:
            var newdata = Object.assign({}, state);
            newdata = Object.assign({}, {accessLog: action.data});
            state = Object.assign({}, state, newdata);

            return state;

        case GET_WALLET:
            var newdata = structuredClone(state);

            /*
                wallet:
                       "id": replace,
                        "idUser": replace,
                        "money": replace,
                        "currency":replace,
                        "insertTime": replace,
                        "insertTimeUnix": replace,
                        "movements": {
                            replace only ids
                        }

                action.wallet.movements is an array. Moevement id:
                {
                    "id": 3,
                }
            */

            if(!newdata.wallet)newdata.wallet={};
            newdata.wallet.id=action.wallet.id;
            newdata.wallet.idUser=action.wallet.idUser;
            newdata.wallet.money=action.wallet.money;
            newdata.wallet.currency=action.wallet.currency;
            newdata.wallet.insertTime=action.wallet.insertTime;
            newdata.wallet.insertTimeUnix=action.wallet.insertTimeUnix;
            newdata.wallet.license=action.wallet.license;
            if(!newdata.wallet.movements)newdata.wallet.movements={};

            //Remove all movements in newdata.waller.movemements (is an object) that are between action.options.startDataTime and action.options.endDataTime
            //if not action.options.startDataTime, make = 0, if not action.options.endDataTime,make  = Date.now()/1000
            console.log("before removal -> newdata.wallet.movements",newdata.wallet.movements);
            if(action.options){
                var startDataTime=action.options.startDataTime?action.options.startDataTime:0;
                var endDataTime=action.options.endDataTime?action.options.endDataTime:Math.floor(Date.now()/1000);
                console.log("removal options: startDataTime",startDataTime,"endDataTime",endDataTime);
                Object.keys(newdata.wallet.movements).forEach((i) => {
                    if(newdata.wallet.movements[i].movementTimeUnix>=startDataTime && newdata.wallet.movements[i].movementTimeUnix<=endDataTime){
                        delete newdata.wallet.movements[i];
                    }
                });
                console.log("after removal -> newdata.wallet.movements",newdata.wallet.movements);
            }

            if(action.wallet && action.wallet.movements){
                for(var i=0;i<action.wallet.movements.length;i++){
                    newdata.wallet.movements[action.wallet.movements[i].id]=action.wallet.movements[i];
                }
            }
            state = Object.assign({}, state, newdata);

            return state;


        case GET_WALLET:
            var newdata = structuredClone(state);

            /*
                wallet:
                       "id": replace,
                        "idUser": replace,
                        "money": replace,
                        "currency":replace,
                        "insertTime": replace,
                        "insertTimeUnix": replace,
                        "movements": {
                            replace only ids
                        }

                action.wallet.movements is an array. Moevement id:
                {
                    "id": 3,
                }
            */

            if(!newdata.wallet)newdata.wallet={};
            newdata.wallet.id=action.wallet.id;
            newdata.wallet.idUser=action.wallet.idUser;
            newdata.wallet.money=action.wallet.money;
            newdata.wallet.currency=action.wallet.currency;
            newdata.wallet.insertTime=action.wallet.insertTime;
            newdata.wallet.insertTimeUnix=action.wallet.insertTimeUnix;
            newdata.wallet.license=action.wallet.license;
            if(!newdata.wallet.movements)newdata.wallet.movements={};

            //Remove all movements in newdata.waller.movemements (is an object) that are between action.options.startDataTime and action.options.endDataTime
            //if not action.options.startDataTime, make = 0, if not action.options.endDataTime,make  = Date.now()/1000
            console.log("before removal -> newdata.wallet.movements",newdata.wallet.movements);
            if(action.options){
                var startDataTime=action.options.startDataTime?action.options.startDataTime:0;
                var endDataTime=action.options.endDataTime?action.options.endDataTime:Math.floor(Date.now()/1000);
                console.log("removal options: startDataTime",startDataTime,"endDataTime",endDataTime);
                Object.keys(newdata.wallet.movements).forEach((i) => {
                    if(newdata.wallet.movements[i].movementTimeUnix>=startDataTime && newdata.wallet.movements[i].movementTimeUnix<=endDataTime){
                        delete newdata.wallet.movements[i];
                    }
                });
                console.log("after removal -> newdata.wallet.movements",newdata.wallet.movements);
            }

            if(action.wallet && action.wallet.movements){
                for(var i=0;i<action.wallet.movements.length;i++){
                    newdata.wallet.movements[action.wallet.movements[i].id]=action.wallet.movements[i];
                }
            }
            state = Object.assign({}, state, newdata);

            return state;

        case GETTING_GLOBAL_DATA:
            state = Object.assign({}, state, { loadingGlobalData: true });
            return state;

        case GET_GLOBAL_DATA:
            var newdata = Object.assign({}, state);
            newdata = Object.assign({}, {globalData: action.data,loadingGlobalData: false});
            state = Object.assign({}, state, newdata);
            return state;

        default:
            return state;
    }
};

export default sessionReducer;
