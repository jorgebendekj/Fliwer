export const ACADEMY_GET_DATA = 'ACADEMY_GET_DATA';
export const ACADEMY_RELOAD_COMPONENT = 'ACADEMY_RELOAD_COMPONENT';
export const ACADEMY_RESPONDED_ANSWERS = 'ACADEMY_RESPONDED_ANSWERS';
export const UPDATE_NEW_COURSE = 'UPDATE_NEW_COURSE';
export const CLEAN_ACADEMY = 'CLEAN_ACADEMY';
export const CLEAR_NEW_COURSE = 'CLEAR_NEW_COURSE';
export const SET_CURRENT_INDEX_ACADEMY_CATEGORY = 'SET_CURRENT_INDEX_ACADEMY_CATEGORY';
export const SET_GARDENER_DATA = 'SET_GARDENER_DATA';
export const SET_USER_INDEX = 'SET_USER_INDEX';
export const ACADEMY_GET_EMAIL_TEMPLATES = 'ACADEMY_GET_EMAIL_TEMPLATES';
export const ACADEMY_GET_DEFAULT_EMAIL_TEMPLATES = 'ACADEMY_GET_DEFAULT_EMAIL_TEMPLATES';
export const SET_ACADEMY_INVITATION = 'SET_ACADEMY_INVITATION';
export const GET_SEPA_DOCUMENTS = 'GET_SEPA_DOCUMENTS';
export const RESET_GOTTEN_ACADEMY_DATA = 'RESET_GOTTEN_ACADEMY_DATA';
export const RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES = 'RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES';
export const ACADEMY_WIPE_DATA = 'ACADEMY_WIPE_DATA';
export const ACADEMY_GET_TEMPLATES = 'ACADEMY_GET_TEMPLATES';
export const ACADEMY_DELETE_TEMPLATE = 'ACADEMY_DELETE_TEMPLATE';
export const ACADEMY_GET_WORKORDERS = 'ACADEMY_GET_WORKORDERS';
export const ACADEMY_ADD_WORKORDERS = 'ACADEMY_ADD_WORKORDERS';
export const ACADEMY_DELETE_WORKORDER = 'ACADEMY_DELETE_WORKORDER';
export const LOGIN_OK = 'LOGIN_OK';
export const FINISH_PRELOADING_DATA = 'FINISH_PRELOADING_DATA';
export const UNASSING_EMPLOYEE_TEMPLATE = 'UNASSING_EMPLOYEE_TEMPLATE';
export const UPDATE_LAST_TIME_WORKORDER = 'UPDATE_LAST_TIME_WORKORDER';

export const ACADEMY_ADD_TASKS = 'ACADEMY_ADD_TASKS';
export const ACADEMY_CREATE_TASK = 'ACADEMY_CREATE_TASK';
export const ACADEMY_EDIT_TASK = 'ACADEMY_EDIT_TASK';
export const ACADEMY_GET_TASK = 'ACADEMY_GET_TASK';
export const ACADEMY_DELETE_TASK = 'ACADEMY_DELETE_TASK';

import {toast} from '../widgets/toast/toast'
import { academyService, emailService, userService } from '../utils/apiService.js';
import * as ActionsSession from './sessionActions';
import schema from '../utils/schema';
import { normalize } from 'normalizr';

import iconAirh  from '../assets/img/alert_airh.png'
import iconFert  from '../assets/img/alert_fert.png'
import iconLight  from '../assets/img/alert_light.png'
import iconMaint  from '../assets/img/alert_maint.png'


export function getAcademyData(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    academyService.getCourses({fast:true}).then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: ACADEMY_GET_DATA, data: response, loading: false});

                var invCourse = getState().academyReducer.invitation;

                if (invCourse && (invCourse.invitationType == 'ticket' || invCourse.invitationType == 'audit'))
                    addInvitationCourse(invCourse)(dispatch, getState).then(function (response2) {
                        resolve(response2);
                    });
                else
                    resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    };
}

//Get only one course
export function getCourse(idCourse) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.getCourse(idCourse).then((response) => {
                //dispatch ACADEMY_GET_DATA
                //if it's not encapsulated, it will be encapsulated inside a course
                var response2 = response;
                if (response.idTicketAudit) {
                    response2=[{
                        forAngel: false,
                        forExpert: false,
                        forGardener: false,
                        forUser: true,
                        id:15,
                        name:"Auditory",
                        visible:false,
                        icon:"https://fliwer.com:7100/getFile/academy/594_k7ywvn6x0dxg1ea2c60qfv9n.png",
                        courses:[response]
                    }]
                }
                dispatch({type: ACADEMY_GET_DATA, data: response2, loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getCourseByUUID(uuid) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.getCourseByUUID(uuid).then((response) => {
                //dispatch ACADEMY_GET_DATA
                dispatch({type: ACADEMY_GET_DATA, data: response, loading: false});
                //get in response array, id==15, first course parameter
                if(response){
                    var category = response.find((n) => {
                        return n.id == 15;
                    });
                    resolve(category.courses[0]);
                } else reject({ok:false, error:"No data"});
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getTemplates(data) {
    //is like get courses with fast, but also sending type:'template'
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    academyService.getCourses({fast:true,type:'template'}).then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {

                if(response && response.length>0 && response[0].id==15){
                    dispatch({type: ACADEMY_GET_TEMPLATES, data: response[0].courses, loading: false});
                }

                resolve(response);

            }, (err) => {
                reject(err);
            });
        });
    };
};

export function getWorkOrders(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else{
                    //use getState to get the user roles. If angel call academyService.getBusinessWorkOrders. If not, call academyService.getCourses with type:'workorder'

                    if(getState().sessionReducer.roles.angel){
                        academyService.getBusinessWorkOrders().then((response) => {
                            resolveApi([{id:15,courses:response}]);
                        }, (error) => {
                            rejectApi(error)
                        });
                    }else{
                        academyService.getCourses({fast:true,type:'workorder'}).then((response) => {
                            resolveApi(response);
                        }, (error) => {
                            rejectApi(error)
                        });
                    }

                }

            }).then((response) => {

                if(response && response.length>0 && response[0].id==15){
                    dispatch({type: ACADEMY_GET_WORKORDERS, data: response[0].courses, loading: false});
                }

                resolve(response);

            }, (err) => {
                reject(err);
            });
        });
    }
}

export function reloadAcademyComponent(idComponent) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.getComponent(idComponent).then((response) => {
                dispatch({type: ACADEMY_RELOAD_COMPONENT, data: response, loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }

}

export function checkExam(idCourse, respondedAnswers, idExam) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.checkExam(idCourse, respondedAnswers, idExam).then((response) => {
                dispatch({type: RESET_GOTTEN_ACADEMY_DATA});
                resolve(response);
            }, (error) => {
                reject(error)
            });

        });
    }
}

export function resetExam(idCourse, idExam) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.resetExam(idCourse, idExam).then((response) => {
                dispatch({type: RESET_GOTTEN_ACADEMY_DATA});
                resolve(response);
            }, (error) => {
                reject(error)
            });

        });
    }
}

export function addCourse(course) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.addCourse(course).then((response) => {
                dispatch({type: RESET_GOTTEN_ACADEMY_DATA});
                if (Object.keys(response).length === 0)
                    reject()
                else
                    resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function modifyCourse(idCourse, course, files, onProgress) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.modifyCourse(idCourse, course, files, onProgress).then((response) => {
                dispatch({type: RESET_GOTTEN_ACADEMY_DATA});
                if (Object.keys(response).length === 0)
                    reject()
                else
                    resolve(response);
            }, (error) => {
                console.log("modifyCourse error", error)
                reject(error)
            });
        });
    }
}

export function addWorkOrderTemplate(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.addWorkOrderTemplate(data).then((response) => {
                dispatch({type: ACADEMY_GET_TEMPLATES, data: [response], loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function addWorkOrder(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.addWorkOrder(data).then((response) => {
                dispatch({type: ACADEMY_ADD_WORKORDERS, data: [response.workOrder], loading: false});
                resolve(response.workOrder);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getTask(idTask) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.getTask(idTask).then((response) => {
                dispatch({type: ACADEMY_GET_TASK, data: response?.task, loading: false});
                resolve(response?.task);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function deleteTask(idTask) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.deleteTask(idTask).then((response) => {
                dispatch({type: ACADEMY_DELETE_TASK, data: response?.task, loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getTasks() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.getTasks().then((response) => {
                dispatch({type: ACADEMY_ADD_TASKS, data: response?.tasks, loading: false});
                resolve(response?.tasks);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function createTask(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.createTask(data).then((response) => {
                dispatch({type: ACADEMY_CREATE_TASK, data: response?.task, loading: false});
                resolve(response?.task);
            }, (error) => {
               reject(error)
            });
        });
    }
}

export function editTask(data, idTask) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.editTask(data, idTask).then((response) => {
                dispatch({type: ACADEMY_EDIT_TASK, data: response?.task, loading: false});
                resolve(response);
            }, (error) => {
               reject(error)
            });
        });
    }
}

export function updateWorkOrderTemplate(idCourse,data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.updateWorkOrderTemplate(idCourse,data).then((response) => {
                dispatch({type: ACADEMY_GET_TEMPLATES, data: [response], loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function updateWorkOrder(idCourse,data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.updateWorkOrder(idCourse,data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function deleteWorkOrderTemplate(idCourse) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.deleteWorkOrderTemplate(idCourse).then((response) => {
                dispatch({type: ACADEMY_DELETE_TEMPLATE, data: idCourse, loading: false});
                dispatch({type: UNASSING_EMPLOYEE_TEMPLATE, data: idCourse, loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function deleteWorkOrder(idCourse) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.deleteWorkOrder(idCourse).then((response) => {
                dispatch({type: ACADEMY_DELETE_WORKORDER, data: idCourse, loading: false});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function updateLastTimeWorkOrder(idCourse, lastUpdateName, lastUpdateTime) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({
                type: UPDATE_LAST_TIME_WORKORDER, 
                idCourse: idCourse,
                lastUpdateName: lastUpdateName || null,
                lastUpdateTime: lastUpdateTime || null
            });
            resolve();
        });
    }
}

export function assignEmployeeWorkOrderTemplate(idCourse,idEmployee) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.assignEmployeeWorkOrderTemplate(idCourse,idEmployee).then((response) => {
                //TODO: better refresh
                //First employees
                ActionsSession.refreshEmployees()(dispatch, getState);
                //Then me
                userService.getSession().then(function (data) {
                    userService.getNotificationTypes().then(function (notificationData) {
                        dispatch({ type: LOGIN_OK, data: data, notificationData: notificationData });
                        dispatch({ type: FINISH_PRELOADING_DATA, data: {} });
                        resolve(data);
                    }, function (data) {
                        reject(data)
                    });
                }, function (data) {
                    toast.error(data.reason);
                    dispatch({ type: LOGIN_KO, data: data });
                    reject(data);
                });

                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

    

export function setMaxPage(idCourse, nPage) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var numPage = {};
            numPage.nPage = nPage;
            academyService.setMaxPage(idCourse, numPage).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function deleteCourse(idCourse) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: RESET_GOTTEN_ACADEMY_DATA});
            academyService.deleteCourse(idCourse).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function updateNewCourse(newCourse, files) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: UPDATE_NEW_COURSE, newCourse: newCourse, files: files});
            resolve(newCourse);
        });
    }
}

export function getDownloadFile(url, name) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.getDownloadFile(url, name).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        })
    }
}

export function clearNewCourse() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: CLEAR_NEW_COURSE});
            resolve();
        })
    }
}

export function cleanAcademyReducer() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: CLEAN_ACADEMY});
            resolve();
        });
    }
}


export function setCurrentIndexAcademyCategory(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_CURRENT_INDEX_ACADEMY_CATEGORY, currentIndexAcademyCategory: value});
            resolve(value);
        });
    };
}

export function resetCurrentIndexAcademyCategory() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var value = 2;
            dispatch({type: SET_CURRENT_INDEX_ACADEMY_CATEGORY, currentIndexAcademyCategory: value});
            resolve(value);
        });
    };
}

export function setSizeImageByComponentId(id, type, width, height) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            academyService.setSizeImageByComponentId(id, type, width, height).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        })
    }
}

export function setGardenerData(gardenerUsersList, userIndex) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_GARDENER_DATA, gardenerUsersList: gardenerUsersList, userIndex: userIndex});
            resolve();
        });
    };
}

export function setUserIndex(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_USER_INDEX, userIndex: value});
            resolve();
        });
    };
}

export function getNewMailingTemplate(type, assignTo, lang) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            emailService.getNewMailingTemplate(type, assignTo, lang).then((response) => {
                dispatch({type: RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function sendEmail(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            emailService.sendEmail(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function getEmailTemplates(type) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            emailService.getEmailTemplates(type).then((response) => {
                dispatch({type: ACADEMY_GET_EMAIL_TEMPLATES, templates: response});
                resolve(response);
            }, (error) => {
                reject(error);
            });
        });
    };
}

export function getDefaultEmailTemplates(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    emailService.getDefaultEmailTemplates().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });
            }).then((response) => {
                dispatch({type: ACADEMY_GET_DEFAULT_EMAIL_TEMPLATES, templates: response});
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    };
}

export function saveEmailTemplate(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            emailService.saveEmailTemplate(data).then((response) => {
                dispatch({type: RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES});
                resolve(response.template);
            }, (error) => {
                reject(error);
            });
        });
    };
}

export function deleteEmailTemplate(id) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            emailService.deleteEmailTemplate(id).then((response) => {
                dispatch({type: RESET_GOTTEN_EMAIL_DEFAULT_TEMPLATES});
                resolve(response);
            }, (error) => {
                reject(error);
            });
        });
    };
}

export function getInvitation(type, hash, email) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            emailService.getInvitation(type, hash, email).then((response) => {

                var data = response.data;
                if (data)
                    data.invitationType = type;

                dispatch({type: SET_ACADEMY_INVITATION, invitation: data});
                if (type == 'ticket' || type == 'audit') {
                    if (data)
                        addInvitationCourse(data)(dispatch, getState).then(function (responseAdd) {
                            resolve(data);
                        });
                    else
                        reject();
                }
                else if (type == 'sepa') {
                    if (data)
                        addInvitationSepa(data)(dispatch, getState).then(function (responseAdd) {
                            resolve(data);
                        });
                    else
                        reject();
                }
                else
                    resolve(null);

            }, (error) => {
                reject(error);
            });
        });
    };
}

export function addInvitationCourse(course) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var obj = getState().academyReducer.data;
            let data = [];
            if (obj)
                data = Object.keys(obj).map((k) => obj[k]);

            var i = 0;
            var found = false;
            var thecourse = null;
            var index15 = null;

            while (!found && i < data.length)
            {
                if (data[i].id == 15) {
                    index15 = i;
                }
                thecourse = data[i].courses.find((n) => {
                    return n.id == course.id;
                });
                if (thecourse)
                    found = true;
                else
                    i++;
            }

            if (!found) {
                var courses;
                if (index15) {
                    data[index15].courses.push(course);
                }
                else {
                    courses = [];
                    courses.push(course);
                    data.push({
                        id: 15,
                        courses: courses
                    });
                }
                dispatch({type: ACADEMY_GET_DATA, data: data});
            }

            resolve(data);
        });

    };
}

export function addInvitationSepa(doc, obj) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            if (!obj)
                obj = getState().invoiceReducer.sepaDocuments;
            let data = [];
            if (obj)
                data = Object.keys(obj).map((k) => obj[k]);

            var i = 0;
            var found = false;
            var foundIndex = null;
            var thedoc = null;

            while (!found && i < data.length)
            {
                thedoc = data.find((n) => {
                    return n.id == doc.id;
                });
                if (thedoc) {
                    found = true;
                    foundIndex = i;
                }
                else
                    i++;
            }

            if (!found)
                data.push(doc);
            else
                data[foundIndex] = doc;
            dispatch({type: GET_SEPA_DOCUMENTS, docs: data});

            resolve(data);
        });

    };
}

export function wipeData() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: ACADEMY_WIPE_DATA});
            resolve();
        });
    };
}
