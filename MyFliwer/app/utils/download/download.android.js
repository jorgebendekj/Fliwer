
import ReactNativeBlobUtil from 'react-native-blob-util'
const {config, fs} = ReactNativeBlobUtil;
let DownloadDir = fs.dirs.DownloadDir;
import {PermissionsAndroid,Platform } from 'react-native';
import {toast} from '../../widgets/toast/toast'
import FileViewer from 'react-native-file-viewer';

const Download = {

    fetch: (method, url, filename, body) => {
        return new Promise((resolve, reject) => {
            var path = DownloadDir + "/" + filename;
            let options = {
                path: path
            }

            PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
                    ).then((permission) => {
                if ( (Platform.OS === 'android' && Platform.constants['Release'] >= 13) || permission['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED) {
                    config(options).fetch(method, url, {"Content-Type": "application/json", credentials: 'include'}, body).then((res) => {
                        toast.error("File downloaded at: " + path);
                        FileViewer.open(path)
                                .then(() => {
                                    resolve();
                                })
                                .catch(error => {
                                    resolve();
                                });
                    }, (error) => {
                        reject(error);
                    });
                } else {
                    console.log('WRITE_EXTERNAL_STORAGE denied');
                    reject({});
                }
            }, (err) => {
                console.log(err);
                reject({});
            });
        });
    }
};

export default Download
