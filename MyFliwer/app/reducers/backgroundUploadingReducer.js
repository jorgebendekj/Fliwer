// @flow
import structuredClone from "@ungap/structured-clone";
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';

import {LOAD_PENDING_TO_UPLOAD_FILES,
        ADD_PENDING_TO_UPLOAD_FILE,
        UPDATE_PENDING_TO_UPLOAD_FILE,
        DELETE_PENDING_TO_UPLOAD_FILE,
        DELETE_PENDING_TO_UPLOAD_FILES,
        SET_UPLOADING
} from "../actions/backgroundUploadActions.js"


let dataState = {pendingFiles: [],userUploading:null};

const backgroundUploadingReducer = (state = dataState, action) => {

    switch (action.type) {

        case LOAD_PENDING_TO_UPLOAD_FILES:
            var newdata = structuredClone(state);
            if(action.data){
                newdata = action.data;
                newdata.userUploading=null;
                state= Object.assign({}, newdata);
            }
            return state;

        case ADD_PENDING_TO_UPLOAD_FILE:
            var newdata = structuredClone(state);
            newdata.pendingFiles.push(action.data);
            state= Object.assign({}, newdata);
            uniqueStorage.setItem('backgroundUploadingReducer',JSON.stringify(state)); //promise without waiting
            return state;

        case UPDATE_PENDING_TO_UPLOAD_FILE:
            var newdata = structuredClone(state);
            //Search id with filter
            let index = newdata.pendingFiles.findIndex(x => x.id === action.data.id);
            if(index>=0){
                newdata.pendingFiles[index]=action.data;
            }
            state= Object.assign({}, newdata);
            uniqueStorage.setItem('backgroundUploadingReducer',JSON.stringify(state)); //promise without waiting
            return state;

        case DELETE_PENDING_TO_UPLOAD_FILE:
            var newdata = structuredClone(state);
            if(action.data.canceled){
                //Set canceled
                let index = newdata.pendingFiles.findIndex(x => x.id === action.data.id);
                if(index>=0){
                    newdata.pendingFiles[index].canceled=true;
                }
                state= Object.assign({}, newdata);
            }else{
                //Remove from pendingFiles
                newdata.pendingFiles = newdata.pendingFiles.filter(x => x.id !== action.data.id);
                state= Object.assign({}, newdata);
            }
            uniqueStorage.setItem('backgroundUploadingReducer',JSON.stringify(state)); //promise without waiting
            return state;

        case DELETE_PENDING_TO_UPLOAD_FILES:
            var newdata = structuredClone(state);
            //Remove all
            newdata = {pendingFiles: [],userUploading:null};
            state= Object.assign({}, newdata);
            uniqueStorage.setItem('backgroundUploadingReducer',JSON.stringify(state)); //promise without waiting
            return state;

        case SET_UPLOADING:
            var newdata = structuredClone(state);
            newdata.userUploading = action.data;
            state= Object.assign({}, newdata);
            return state;

        default:
            return state;
    }
};

export default backgroundUploadingReducer;
