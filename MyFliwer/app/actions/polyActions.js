
import { extraService } from '../utils/apiService.js';

export function polyRequest(data, ignore, method) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            extraService.polyRequest(data, ignore, method).then((response) => {
                resolve(response);
            }, (error) => {
                console.log("polyRequest error: ", error);
                reject(error);
            });
        });
    };
}