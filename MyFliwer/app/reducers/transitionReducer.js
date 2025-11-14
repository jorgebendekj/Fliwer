// @flow

import {TRANSITION_CHANGE} from "../actions/transitionActions.js" //Import the actions types constant we defined in our action

let dataState = { animation:"fadeIn",easing:"ease-in"};

const transitionReducer = (state = dataState, action) => {
    switch (action.type) {
        case TRANSITION_CHANGE:
            var obj={};
            if(action.data.animation)obj.animation=action.data.animation;
            if(action.data.easing)obj.easing=action.data.easing;
            if(action.data.action)obj.action=action.data.action;
            state = Object.assign({}, state,obj);
            return state;
        default:
            return state;
    }
};

export default transitionReducer;
