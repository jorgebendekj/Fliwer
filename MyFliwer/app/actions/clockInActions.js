//Import the api calls
import { clockInService } from '../utils/apiService.js';

//Actions types
export const GET_CLOCK_IN = "GET_CLOCK_IN"
export const SET_CLOCK_IN_LOADING = "SET_CLOCK_IN_LOADING"
export const UPDATE_CLOCK_IN = "UPDATE_CLOCK_IN";
export const SET_CLOCK_IN_TIMER_STATE = "SET_CLOCK_IN_TIMER_STATE";

export function getClockInData() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            clockInService.getClockInData().then((response) => {
                dispatch({ type: GET_CLOCK_IN, data: response });
                resolve(response)
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function setClockInLoading(status) {
    return (dispatch, getState) => {
        dispatch({ type: SET_CLOCK_IN_LOADING, data: status });
    }
}

export function addClockInRecord({ id, action, latitude, longitude, comment, startDate, endDate, endIsStop }) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            clockInService.updateClockIn({ id, action, latitude, longitude, comment, startDate, endDate, endIsStop }).then((response) => {
                try {
                    dispatch({
                        type: UPDATE_CLOCK_IN,
                        payload: response.clockIn
                    });
                    resolve(response)
                } catch {
                    //error
                }
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function deleteAction(id) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            clockInService.deleteAction(id).then((response) => {
                try {
                    console.log(response)
                    dispatch({
                        type: UPDATE_CLOCK_IN,
                        payload: response.clockIn
                    });
                    resolve(response)
                } catch {
                    //error
                }
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function updateClockInAction(actionData) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            clockInService.updateAction(actionData).then((response) => {
                try {
                    dispatch({
                        type: UPDATE_CLOCK_IN,
                        payload: response.clockIn
                    });
                    resolve(response)
                } catch (e) {
                    console.log(e)
                    reject(error)
                }
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function setClockInTimer(clockInId, isRunning) {
    return {
        type: SET_CLOCK_IN_TIMER_STATE,
        payload: { clockInId, isRunning }
    };
}