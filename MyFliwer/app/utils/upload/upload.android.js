import {store} from '../../store'; //Import the store
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLanguage from '../../actions/languageActions.js'; //Import your actions

import customFetch from '../../utils/customFetch'

const Upload = {

    fetch: (method, url, body, files, onProgress) => {
        return new Promise((resolve, reject) => {
            let data = new FormData();
            data.append("json", JSON.stringify(body));
            if (!files)
                files = []
            files.forEach((item, i) => {
                data.append("doc[]", {uri: item.uri, type: item.type, name: "file_" + i});
            });
            console.log("feching");
            customFetch(url, {
                method: method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: data
            }, onProgress).then(response => {
                console.log("feching then");
                response.json().then((data) => {
                    if (data.ok == false) {
                        if (data.id == 1 || data.id == 2 || data.id == 3 || data.id == 4 || data.id == 25 || data.id == 70) {
                            //Losed session.
                            ActionsSession.logout()(store.dispatch, store.getState);
                        }
                        reject({controled: true, data: data, from: "fetch data.ok == false"});
                    } else
                        resolve(data);
                }, (err) => {
                    if (typeof err != 'string')
                        err.from = "fetch response.json()";
                    reject(err)
                })
            }).catch(err => {
                if (typeof err != 'string')
                    err.from = "fetch error-catch";
                console.log("feching catch");
                reject(err);
            })
        });
    }

        }

export default Upload
