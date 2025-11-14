import {store} from '../../store'; //Import the store
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLanguage from '../../actions/languageActions.js'; //Import your actions

import customFetch from '../../utils/customFetch'

const Upload = {

    fetch: (method, url, body, files, onProgress) => {
        return new Promise((resolve, reject) => {
            let data = new FormData();
            data.append("json", JSON.stringify(body));
            var data2 = [];
            if (!files)
                files = [];
            Promise.all(files.map((item, i) => {
                return new Promise((resolve, reject) => {
//                    console.log("fetch item", item);
                    fetch(item.uri).then(r => r.blob()).then((blob) => {
//                        console.log("fetch blob", blob);
                        data2[i] = blob;
                        resolve();
                    });
                })
            })).then(() => {

                for (var i = 0; i < data2.length; i++) {
                    data.append("doc[]", data2[i]);
                }

//                console.log("fetch data2", data2);
//                console.log("fetch data", data);

                customFetch(url, {
                    method: method,
                    credentials: 'include',
                    body: data
                }, onProgress).then(response => {
                    response.json().then((data) => {
                        if (data.ok == false) {
                            if (data.id == 1 || data.id == 2 || data.id == 3 || data.id == 4 || data.id == 25 || data.id == 70) {
                                //Losed session.
                                ActionsSession.logout()(store.dispatch, store.getState);
                            }
                            reject({controled: true, data: data});
                        } else
                            resolve(data);
                    }, (err) => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            }, reject);
        });
    }

};

export default Upload
