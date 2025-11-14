
export const LOAD_PENDING_TO_UPLOAD_FILES = 'LOAD_PENDING_TO_UPLOAD_FILES';
export const ADD_PENDING_TO_UPLOAD_FILE = 'ADD_PENDING_TO_UPLOAD_FILE';
export const UPDATE_PENDING_TO_UPLOAD_FILE = 'UPDATE_PENDING_TO_UPLOAD_FILE';
export const DELETE_PENDING_TO_UPLOAD_FILE = 'DELETE_PENDING_TO_UPLOAD_FILE';
export const DELETE_PENDING_TO_UPLOAD_FILES= 'DELETE_PENDING_TO_UPLOAD_FILES';
export const SET_UPLOADING = 'SET_UPLOADING';

import { BackgroundService } from'../utils/backgroundActions/backgroundActions';

import * as ActionsAcademy from '../actions/academyActions.js'; //Import your actions

import { toast } from '../widgets/toast/toast'
import { RNFS } from '../utils/fs/fs'
import { backgroundUploadService } from '../utils/apiService.js';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage'; 
import { Buffer } from "buffer";
import md5 from 'md5'; 


const _startBackgroundUploadService = async (dispatch,getState) => {
    const options = {
        taskName: 'FileUpload',
        taskTitle: 'Uploading Files',
        taskDesc: 'Progress',
        taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
        },
        color: '#ff00ff',
        //change this for opening the app from notification
        linkingURI: 'uploadFiles',
    };

    console.log("Starting background service...");

    var uploadingReducer= getState().backgroundUploadingReducer;
    
    var idUser = getState().sessionReducer.data.user_id;
    var pendingFiles=uploadingReducer.pendingFiles.filter((p)=>p.idUser==idUser && !p.canceled);

    if(uploadingReducer.userUploading==idUser){
        console.log("Already uploading");
    }else{
        await BackgroundService.start(() => uploadFileInChunks(dispatch,getState), options);
    }
};

const uploadFileInChunks = async (dispatch,getState) => {

    //First check in getState if there are pending files and uploading is false


    //Iterate over getState().pendingFiles and upload each file in chunks

    /*
        A pendingFile object will look like this:
        
        obj:{
          id: (if null, create a new fliwer_asyncFileUpload),
          tableFilePath: (table were the file path will be stored),
          columnFilePath: (column were the file path will be stored),
          columnId: (id of the row where the file path will be stored),
          idOriginalTable: (id of the table where the file path will be stored),
          localPath: (local path of the file), //only on frontend
          fileName: (name of the file),
          chunk: (number of the chunk),
          totalChunks: (total number of chunks),
          chunkSize: (size of the chunk),
          fileSize: (size of the file),
          data: (data of the chunk)
        }

    */

    var uploadingReducer= getState().backgroundUploadingReducer;
    
    var idUser = getState().sessionReducer.data.user_id;
    var pendingFiles=uploadingReducer.pendingFiles.filter((p)=>p.idUser==idUser && !p.canceled);

    if(uploadingReducer.userUploading==idUser){
        console.log("Already uploading");
    }else{

        if(idUser!=uploadingReducer.userUploading){
            dispatch({ type: SET_UPLOADING, data: idUser });
            uploadingReducer= getState().backgroundUploadingReducer;
        }

        console.log("Starting upload for user",idUser);
        var userUpdated=idUser;
        while(pendingFiles.length>0 && userUpdated==idUser){
            //Get the first pending file and chunk
            var pendingFile = pendingFiles[0];

            
            if (pendingFile.localPath.startsWith('content://')) {
                const uriComponents = pendingFile.localPath.split('/')
                const fileNameAndExtension = uriComponents[uriComponents.length - 1]
                const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`
                await RNFS.copyFile(pendingFile.localPath, destPath)
                pendingFile.localPath=destPath;
            }
            
            
            console.log("Uploading file:",pendingFile);

            var response;
    
            try {
                pendingFile.chunk=pendingFile.chunk+1;
                //Add data
                pendingFile.data = await RNFS.read(pendingFile.localPath, pendingFile.chunkSize, pendingFile.chunk*pendingFile.chunkSize, 'base64');
                
                var dataBin=Buffer.from(pendingFile.data, 'base64');
                var hash = md5(dataBin);
                if(!pendingFile.checksum)pendingFile.checksum=[];
                pendingFile.checksum[pendingFile.chunk]=hash;

                response= await updatePendingToUploadFile(pendingFile)(dispatch, getState);

                delete pendingFile.data; //In case occupies memory

                console.log("Response uploading file:",response);
                
            } catch (error) {
                console.log("Error uploading file:",pendingFile);
                //For the moment remove the file from the pendingFiles
                await deletePendingToUploadFile(pendingFile)(dispatch, getState);
            }

            if(response && (response.lastChunk>=pendingFile.totalChunks-1 || response.completed)){
                console.log("File uploaded");
                try{
                    //get academy reducer
                    var academyReducer= getState().academyReducer;
                    //Get components with pendingFile.id as idAsyncFileUpload
                    
                    var component=academyReducer.newCourse.pages.map((p)=>p.components).flat().find((c)=>c.values && c.values.idAsyncFileUpload==pendingFile.id)
                    if(component){
                        await ActionsAcademy.reloadAcademyComponent(component.id)(dispatch, getState)
                    }
                }catch(err){
                    console.log("Error reloading academy data",err);
                }
                await deletePendingToUploadFile(pendingFile,true)(dispatch, getState);
            }else if(response && response.lastChunk!=pendingFile.totalChunks){
                //TODO: Update percentage?
                /*
                await BackgroundService.updateNotification({
                    progressBar: {
                        max: 100,
                        value: response.percentage,
                    },
                    taskDesc: `Uploading file ${pendingFile.fileName}: ${response.percentage}% completed`,
                });
                */
            }

            //Update info from the reducer
            uploadingReducer= getState().backgroundUploadingReducer;
            pendingFiles=uploadingReducer.pendingFiles.filter((p)=>p.idUser==idUser && !p.canceled);
            userUpdated=uploadingReducer.userUploading;
            if(userUpdated!=idUser){
                console.log("User changed, stopping upload for user",idUser);
            }

        }

        dispatch({ type: SET_UPLOADING, data: null });
        await BackgroundService.stop();

    }

    //filePath
    /*
    const uploadUrl =
        'https://example.com/upload';
    const chunkSize = 1023; //READ THE POINTS BELOW THE CODE
    const currentFile = selectedFile[0]; //File which we are getting from our picker

    try {
        const fileSize = currentFile.size;
        let offset = 0;
        while (offset < fileSize) {
            //here we are reading only a small chunk of the file.
            const chunk = await RNFS.read(filePath, chunkSize, offset, 'base64');
            const requestBody = {
                fileContent: chunk,
                offset: offset.toString(),
                totalSize: fileSize.toString(),
            };

            await axios({
                method: 'POST',
                url: uploadUrl,
                headers: {
                    Authorization:
                        'Bearer YOUR_TOKEN_HERE',
                    'Content-Type': 'application/json', // since we are sending base64 in JSON format
                },
                data: JSON.stringify(requestBody),
            });

            let percentage = Math.round((offset / fileSize) * 100);
            console.log('filesize, offset ', fileSize, offset);
            await BackgroundService.updateNotification({
                progressBar: {
                    max: 100,
                    value: percentage,
                },
                taskDesc: `Uploading file: ${percentage}% completed`,
            });
            offset += chunkSize;
        }
        console.log('Upload complete');
        await BackgroundService.updateNotification({
            taskDesc: 'File Uploaded',
        });
    } catch (error) {
        console.error('Error during chunk upload:', error);
        await BackgroundService.updateNotification({
            taskDesc: 'File upload Failed',
        });
    }
    */
};

export function startBackgroundUploadService(){
    return (dispatch, getState) => {
        return _startBackgroundUploadService(dispatch,getState);
    }
}

export function loadBackgroundUploadService() {
    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            //dispatch({ type: DELETE_PENDING_TO_UPLOAD_FILE, data: {} });
            uniqueStorage.getItem('backgroundUploadingReducer').then((data) => {
                data = JSON.parse(data);
                dispatch({ type: LOAD_PENDING_TO_UPLOAD_FILES, data: data });
                //Start background service if there are pending files
                _startBackgroundUploadService(dispatch,getState);
                resolve();
            }, reject);
        })
    }
}

export function addPendingToUploadFile(data) {
    /*
        Data will be the base of the pending file object.
        A pendingFile object will look like this:
        
        obj:{
          id: (if null, create a new fliwer_asyncFileUpload),
          tableFilePath: (table were the file path will be stored),
          columnFilePath: (column were the file path will be stored),
          columnId: (id of the row where the file path will be stored),
          idOriginalTable: (id of the table where the file path will be stored),
          localPath: (local path of the file), //only on frontend
          fileName: (name of the file),
          chunk: (number of the chunk),
          totalChunks: (total number of chunks),
          chunkSize: (size of the chunk),
          fileSize: (size of the file),
          data: (data of the chunk)
        }

    */

    return (dispatch, getState) => {
        return new Promise(async function (resolve, reject) {
            
            var pendingFile = {
                id: null,
                tableFilePath: data.tableFilePath,
                columnFilePath: data.columnFilePath,
                localPath: data.localPath,
                fileName: data.fileName,
                columnId: data.columnId,
                idOriginalTable: data.idOriginalTable,
                chunk: 0,
                totalChunks: Math.ceil(data.fileSize / data.chunkSize),
                chunkSize: data.chunkSize,
                fileSize: data.fileSize,
                data: null
            }
            
            var idUser = getState().sessionReducer.data.user_id;
            //Send the first chunk
            if(!idUser){
                console.log("Error adding pending file, idUser is null", pendingFile);
                reject();
            }else{
                
                var lastPath=pendingFile.localPath;
                if (pendingFile.localPath.startsWith('content://')) {
                    const uriComponents = pendingFile.localPath.split('/')
                    const fileNameAndExtension = uriComponents[uriComponents.length - 1]
                    const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`
                    await RNFS.copyFile(pendingFile.localPath, destPath)
                    pendingFile.localPath=destPath;
                }
                /*
                //iterate over the chunks to print pendingFile.localPath's buffer
                for(var i=0;i<pendingFile.totalChunks;i++){
                    var chunkData=await RNFS.read(pendingFile.localPath, pendingFile.chunkSize, i*pendingFile.chunkSize, 'base64');
                    console.log("Chunk",i,":",chunkData);
                }

                //Same with lastPath
                for(var i=0;i<pendingFile.totalChunks;i++){
                    var chunkData=await RNFS.read(lastPath, pendingFile.chunkSize, i*pendingFile.chunkSize, 'base64');
                    console.log("Chunk",i,":",chunkData);
                }

                debugger;
                */

                RNFS.read(pendingFile.localPath, pendingFile.chunkSize, pendingFile.chunk, 'base64').then((chunkData)=>{
                    
                    var dataBin=Buffer.from(chunkData, 'base64');         
                    var hash = md5(dataBin);
                    if(!pendingFile.checksum)pendingFile.checksum=[];
                    pendingFile.checksum[pendingFile.chunk]=hash;
                    
                    pendingFile.data=chunkData;
                    backgroundUploadService.backgroundUploadFile(pendingFile).then((response) => {
                        
                        delete pendingFile.data; //In case occupies memory
                        if (response.id) {
                            pendingFile.id = response.id;
                            pendingFile.idUser=idUser;
                            //Start background service if there are pending files
                            if(pendingFile.totalChunks>1){
                                dispatch({ type: ADD_PENDING_TO_UPLOAD_FILE, data: pendingFile });
                                _startBackgroundUploadService(dispatch,getState);
                            }
                            resolve(response);
                        } else {
                            console.log("Error adding pending file", pendingFile, "with response", response);
                            reject();
                        }
                    }, (err) => {
                        console.log("Error adding pending file", pendingFile, "with error", err);
                        reject(err);
                    });
                },(err)=>{
                    console.log("Error reading file", pendingFile.localPath, "with error", err);
                    reject(err);
                })
            }


        })
    }
}


export function retryPendingToUploadFile(id) {

    return (dispatch, getState) => {
        return new Promise(function (resolve, reject) {
            var uploadingReducer= getState().backgroundUploadingReducer;
            var idUser = getState().sessionReducer.data.user_id;
            var pendingFiles=uploadingReducer.pendingFiles.filter((p)=>p.idUser==idUser && p.id==id);
            if(pendingFiles.length>0){
                addPendingToUploadFile(pendingFiles[0])(dispatch, getState).then((response)=>{
                    resolve(response);
                },(err)=>{
                    reject(err);
                });
            }else{
                resolve();
            }
        })
    }
}

export function updatePendingToUploadFile(data) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            backgroundUploadService.backgroundUploadFile(data).then((response) => {
                if (data.chunk != response.lastChunk) data.chunk = response.lastChunk;
                data.percentage = response.percentage;
                dispatch({ type: UPDATE_PENDING_TO_UPLOAD_FILE, data: data });
                resolve(response);
            }, (err) => {
                console.log("Error updating pending file", data, "with error", err);
                reject(err);
            });


        })
    }
}

export function deletePendingToUploadFile(data,deleteServer) {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            if(deleteServer){
                //At the moment there is no need to delete the file from the server. There server will delete the file after moving it to the final location
                /*
                backgroundUploadService.deleteBackgroundUploadFile(data).then((response) => {
                    console.log("Deleted pending file", data, "with response", response);
                }, (err) => {
                    console.log("Error deleting pending file", data, "with error", err);
                }).finally(() => {
                    dispatch({ type: DELETE_PENDING_TO_UPLOAD_FILE, data: data });
                    resolve();
                })*/

                dispatch({ type: DELETE_PENDING_TO_UPLOAD_FILE, data: data });
                RNFS.unlink(data.localPath).then(()=>{
                    console.log('finish delete');
                }).finally(()=>{
                    resolve();
                });

            }else{
                data.canceled=true;
                //Only remove to the automatic background service
                dispatch({ type: DELETE_PENDING_TO_UPLOAD_FILE, data: data });
                RNFS.unlink(data.localPath).then(()=>{
                    console.log('finish delete');
                }).finally(()=>{
                    resolve();
                });
                resolve();
            }
        })
    }
}

export function cancelUpload(id){
    return (dispatch,getState) => {
        return new Promise(function (resolve, reject) {
            var uploadingReducer= getState().backgroundUploadingReducer;
            var idUser = getState().sessionReducer.data.user_id;
            var pendingFiles=uploadingReducer.pendingFiles.filter((p)=>p.idUser==idUser && p.id==id);
            if(pendingFiles.length>0){
                deletePendingToUploadFile(pendingFiles[0],true)(dispatch, getState).then(()=>{
                    resolve();
                },(err)=>{
                    reject(err);
                });
            }else{
                resolve();
            }
        })
    }
}