export const UPDATE_CALENDAR = 'UPDATE_CALENDAR';
export const UPDATING_CALENDAR = 'UPDATING_CALENDAR';
export const CALENDAR_WIPE_DATA = 'CALENDAR_WIPE_DATA';
export const ADD_ALL_TASKS = 'ADD_ALL_TASKS';

import {toast} from '../widgets/toast/toast'
import { calendarService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';

import * as ActionsAcademy from './academyActions.js'; //Import your actions


export function getMonthTasks(month,year) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: UPDATING_CALENDAR, data: {}});
            calendarService.getCalendarTasks(month,year).then((response) => {
                dispatch({type: UPDATE_CALENDAR, data: {tasks:response,month:month,year:year}});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getAllTasks(){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: UPDATING_CALENDAR, data: {}});
            calendarService.getAllCalendarTasks().then((response) => {
                dispatch({type: ADD_ALL_TASKS, data: response});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function addCalentarTask(task) {
    /*
        task  = {
            title: "title",
            description: "description",
            allDay: true,
            start: date string,
            end: date string,
            users:[],
            clients:[],
            attachments:[]
        }
    */
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            calendarService.addCalentarTask(task).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function modifyCalendarTask(idTask,task) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            calendarService.modifyCalentarTask(idTask,task).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function deleteCalentarTask(idTask) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            calendarService.deleteCalentarTask(idTask).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}