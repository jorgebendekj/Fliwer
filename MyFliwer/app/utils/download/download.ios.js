
import ReactNativeBlobUtil from 'react-native-blob-util'
const {config, fs} = ReactNativeBlobUtil;
//let DownloadDir = fs.dirs['MainBundleDir'];
let DownloadDir = fs.dirs.DocumentDir;
import {toast} from '../../widgets/toast/toast'
import FileViewer from 'react-native-file-viewer';

const Download = {

    fetch: (method, url, filename, body) => {
        return new Promise((resolve, reject) => {
            var path = DownloadDir + "/" + filename;
            let options = {
                path: path
            };

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
        });
    }
};

export default Download
