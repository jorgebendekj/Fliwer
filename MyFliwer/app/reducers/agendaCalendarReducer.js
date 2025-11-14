// @flow
import {UPDATE_CALENDAR, UPDATING_CALENDAR, CALENDAR_WIPE_DATA,ADD_ALL_TASKS} from "../actions/agendaCalendarActions.js"

import {toast} from '../widgets/toast/toast'
let dataState = {tasks: {}, allTasks:[], updating: false};

const agendaCalendarReducer = (state = dataState, action) => {

    switch (action.type) {

        case UPDATING_CALENDAR:
            state = Object.assign({}, state, {updating:true});
            return state;

        case UPDATE_CALENDAR:

            var tasks=action.data.tasks;
            var currentMonthYear=action.data.month+"-"+action.data.year;
            /*
            var previousMonthYear=(action.data.month-1)+"-"+action.data.year;
            if(action.data.month==1)previousMonthYear="12-"+(action.data.year-1);
            var nextMonthYear=(action.data.month+1)+"-"+action.data.year;
            if(action.data.month==12)nextMonthYear="1-"+(action.data.year+1);
            */

            var newdata = state.tasks;
            newdata[currentMonthYear]=action.data.tasks;
            newdata.updating=false;
            /*
            newdata[previousMonthYear]=[];
            newdata[nextMonthYear]=[];
            */

            state = Object.assign({}, state, newdata);
            return state;

        case ADD_ALL_TASKS:
            state = Object.assign({}, state, {allTasks:action.data,updating:false});
            return state;

        case CALENDAR_WIPE_DATA:
            state = Object.assign({}, state, {
                tasks: {},
                updating: false
            });
            return state;

        default:
            return state;
    }
};

export default agendaCalendarReducer;
