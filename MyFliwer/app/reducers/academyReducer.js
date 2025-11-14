import structuredClone from "@ungap/structured-clone";
// @flow
import {UPDATE_NEW_COURSE, ACADEMY_RESPONDED_ANSWERS, ACADEMY_GET_DATA, ACADEMY_RELOAD_COMPONENT, CLEAN_ACADEMY, CLEAR_NEW_COURSE, SET_CURRENT_INDEX_ACADEMY_CATEGORY, SET_GARDENER_DATA, SET_USER_INDEX, ACADEMY_GET_EMAIL_TEMPLATES, ACADEMY_GET_DEFAULT_EMAIL_TEMPLATES, SET_ACADEMY_INVITATION, RESET_GOTTEN_ACADEMY_DATA, RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES, ACADEMY_WIPE_DATA,ACADEMY_GET_TEMPLATES,ACADEMY_DELETE_TEMPLATE,ACADEMY_GET_WORKORDERS,ACADEMY_DELETE_WORKORDER, UPDATE_LAST_TIME_WORKORDER, ACADEMY_ADD_WORKORDERS, ACADEMY_ADD_TASKS, ACADEMY_CREATE_TASK, ACADEMY_GET_TASK, ACADEMY_EDIT_TASK, ACADEMY_DELETE_TASK} from "../actions/academyActions.js"

import {toast} from '../widgets/toast/toast'

let dataState = {data: [],templates:[], workOrders:[], task: null, tasks: [], gottenAcademyData: false, newCourse: null, files: null, loading: true, currentIndexAcademyCategory: 2, gardenerUsersList: null, userIndex: null, emailTemplates: null, emailDefaultTemplates: null, gottenEmailDefaultTemplates: false, invitation: null, invitationChecked: false};

const academyReducer = (state = dataState, action) => {

    switch (action.type) {

        case ACADEMY_GET_DATA:
            var newdata = structuredClone(state);

            /*
                action.data: array of categories with id. Each category has an array of courses with id.
                action.data:[{
                    id:15,
                    courses:[{
                        id:1
                    }]
                }]
                action.data can have a new category or a new course not present in the state.data
            */

            //For every action.data, check if it is already in the state.data
            for(var i=0;i<action.data.length;i++){
                //get index of the element in the state.data using findIndex
                var index = newdata.data.findIndex((element) => {
                    return element.id == action.data[i].id;
                });
                //If the element is in the state.data, the category is already in the state.data. If not, add it
                if(index==-1){
                    newdata.data.push(action.data[i]);
                }else if(action.data[i].courses && action.data[i].courses.length>0){
                    //If the category is already in the state.data, check if the courses are already in the state.data
                    for(var j=0;j<action.data[i].courses.length;j++){
                        //get index of the element in the state.data using findIndex
                        var index2 = newdata.data[index].courses.findIndex((element) => {
                            return element.id == action.data[i].courses[j].id;
                        });
                        //If the element is in the state.data, the course is already in the state.data. If not, add it
                        if(index2==-1){
                            newdata.data[index].courses.push(action.data[i].courses[j]);
                        }else {
                            newdata.data[index].courses[index2] = action.data[i].courses[j];
                        }
                    }
                }
            }

            newdata.gottenAcademyData = true;
            //console.log("ACADEMY_GET_DATA", action.data);
            newdata.loading = action.loading;
            return newdata;

        case ACADEMY_GET_TEMPLATES:
            //Same as ACADEMY_GET_DATA but for templates
            var newdata = structuredClone(state);
            for(var i=0;i<action.data.length;i++){
                var index = newdata.templates.findIndex((element) => {
                    return element.id == action.data[i].id;
                });
                if(index==-1){
                    newdata.templates.push(action.data[i]); 
                }else {
                    newdata.templates[index] = action.data[i];
                }
            }
            newdata.gottenAcademyData = true;
            newdata.loading = action.loading;
            return newdata;

        case ACADEMY_GET_WORKORDERS:
            return {
                ...state,
                workOrders: action.data,
                gottenAcademyData: true,
                loading: action.loading,
            };

        case ACADEMY_ADD_WORKORDERS:
            var oldData = structuredClone(state.workOrders);
            return {
                ...state,
                workOrders: [...oldData, ...action.data],
                gottenAcademyData: true,
                loading: action.loading,
            };

            case ACADEMY_DELETE_TASK: {
                const clonedTasks = structuredClone(state.tasks || []);
                const index = clonedTasks.findIndex(task => task.id === action.id);

                if (index !== -1) {
                    clonedTasks.splice(index, 1);
                }

                return {
                    ...state,
                    tasks: clonedTasks,
                    gottenTasksData: true,
                    loading: action.loading,
                };
            }


        case ACADEMY_GET_TASK: {
            const clonedTasks = structuredClone(state.tasks || []);
            const index = clonedTasks.findIndex(task => task.id === action.data.id);

            if (index !== -1) {
                clonedTasks[index] = action.data;
            } else {
                clonedTasks.push(action.data);
            }

            return {
                ...state,
                tasks: clonedTasks,
                gottenTasksData: true,
                loading: action.loading,
            };
        }

        case ACADEMY_EDIT_TASK: {
            const clonedTasks = structuredClone(state.tasks || []);
            const index = clonedTasks.findIndex(task => task.id === action.data.id);

            if (index !== -1) {
                clonedTasks[index] = action.data;
            } else {
                clonedTasks.push(action.data);
            }

            return {
                ...state,
                tasks: clonedTasks,
                gottenTasksData: true,
                loading: action.loading,
            };
        }


        case ACADEMY_ADD_TASKS:
            return {
                ...state,
                tasks: [...action.data],
                gottenTasksData: true,
                loading: action.loading,
            };

        case ACADEMY_CREATE_TASK:
            var oldData = structuredClone(state.tasks);
            return {
                ...state,
                tasks: [...oldData, action.data],
                gottenTasksData: true,
                loading: action.loading,
            };

        case ACADEMY_DELETE_TEMPLATE:
            //data is idCourse to remove from templates if exist
            var newdata = structuredClone(state);
            var index = newdata.templates.findIndex((element) => {
                return element.id == action.data;
            });
            if(index>-1){
                newdata.templates.splice(index,1);
            }
            newdata.gottenAcademyData = true;
            newdata.loading = action.loading;
            return newdata;

        case ACADEMY_DELETE_WORKORDER:
            var newdata = structuredClone(state);
            var index = newdata.workOrders.findIndex((element) => {
                return element.id == action.data;
            });
            if(index>-1){
                newdata.workOrders.splice(index,1);
            }
            newdata.gottenAcademyData = true;
            newdata.loading = action.loading;
            return newdata;
            
        case UPDATE_LAST_TIME_WORKORDER:
            const { idCourse, lastUpdateName, lastUpdateTime } = action;
            
            var newdata = structuredClone(state);

            return {
                ...newdata,
                    workOrders: newdata.workOrders.map(workorder => {

                    if(workorder.id != idCourse) return workorder

                    return {
                        ...workorder,
                        lastUpdateName: lastUpdateName,
                        lastUpdateTime: lastUpdateTime
                    }
            })
        }

        case ACADEMY_RELOAD_COMPONENT:
            
            var newdata = Object.assign({}, state);
            //Reverse to: Given an id, find the component that has that id
            for(var i=0;i<newdata.newCourse.pages.length;i++){
                for(var j=0;j<newdata.newCourse.pages[i].components.length;j++){
                    if(newdata.newCourse.pages[i].components[j].id==action.data.id){
                        newdata.newCourse.pages[i].components[j]=action.data;
                    }
                }
            }

            state = Object.assign({}, state, newdata);
            return state;


        case UPDATE_NEW_COURSE:
            var newdata = Object.assign({}, state);
            newdata.newCourse = Object.assign(action.newCourse);
            if (action.files)
                newdata.files = [].concat(action.files)
            state = Object.assign({}, state, newdata);
            return state;

        case CLEAR_NEW_COURSE:
            state = Object.assign({}, state, {newCourse: null});
            return state;

        case CLEAN_ACADEMY:
            state = Object.assign({}, state, {newCourse: null, files: null});
            return state;

        case SET_CURRENT_INDEX_ACADEMY_CATEGORY:
            state = Object.assign({}, state, {currentIndexAcademyCategory: action.currentIndexAcademyCategory});
            return state;

        case SET_GARDENER_DATA:
            state = Object.assign({}, state, {gardenerUsersList: action.gardenerUsersList, userIndex: action.userIndex});
            return state;

        case SET_USER_INDEX:
            state = Object.assign({}, state, {userIndex: action.userIndex});
            return state;

        case ACADEMY_GET_EMAIL_TEMPLATES:
            var newdata = Object.assign({}, state);
            newdata.emailTemplates = Object.assign(action.templates);
            state = Object.assign({}, state, newdata);
            return state;

        case ACADEMY_GET_DEFAULT_EMAIL_TEMPLATES:
            var newdata = Object.assign({}, state);
            newdata.emailDefaultTemplates = Object.assign(action.templates);
            newdata.gottenEmailDefaultTemplates = true;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_ACADEMY_INVITATION:
            state = Object.assign({}, state, {invitation: action.invitation, invitationChecked: true});
            return state;
            
        case RESET_GOTTEN_ACADEMY_DATA:
            state = Object.assign({}, state, {gottenAcademyData: false});
            return state;
            
        case RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES:
            state = Object.assign({}, state, {gottenEmailDefaultTemplates: false});
            return state;

        case ACADEMY_WIPE_DATA:
            state = Object.assign({}, state, {data: [],
                gottenAcademyData: false,
                gottenEmailDefaultTemplates: false
            });
            return state;

        default:
            return state;
    }
};

export default academyReducer;
