// @flow

import {HISTORY_PUSH,HISTORY_POP} from "../actions/historyActions.js" //Import the actions types constant we defined in our action

let dataState = { past:[],present:{animation:"nothing",easing:"ease-in"},future:[],lastAction:"-",animation:"",easing:""};

function reverseAnimation(anim){
  switch(anim){
    case "zoomIn": return "zoomOut"; break;
    case "zoomOut": return "zoomIn"; break;
    case "realSlideLeftIn": return "realSlideLeftOut"; break;
    case "realSlideLeftOut": return "realSlideLeftIn"; break;
    case "nothing": return "nothing"; break;
  }
  return "fadeIn";
}


const transitionReducer = (state = dataState, action) => {
    switch (action.type) {
      case HISTORY_PUSH:

        var past=state.past;
        if(state.present){
          past.push(state.present);
        }
        var present={key:action.data.key,animation:action.data.animation,easing:action.data.easing};
        state = Object.assign({}, state,{past:past,present:present,lastAction:"PUSH",animation:present.animation,easing:present.easing,change:0});
        return state;
      case HISTORY_POP:
        function findHistoryEntry(element) {
          return element.key==action.data.key;
        }

        var reload=false;
        var past,present,future,animation,easing,action2;

        function goPast(index){
          if(index==-1)index=0;
          animation=reverseAnimation(state.present.animation);
          easing=state.present.easing;
          future=state.past.slice(index+1,state.past.length);
          future.push(state.present);
          future=future.concat(state.future);
          present=state.past[index];
          past=state.past.slice(0,index);
          action2="POP";
        }

        function goFuture(index){
          past=state.past;
          past.push(state.present);
          past=past.concat(state.future.slice(0,index));
          present=state.future[index];
          future=state.future.slice(index+1,state.future.length);
          animation=present.animation;
          easing=present.easing;
          action2="FORWARD";
        }

        function loadStatic(){
          present=state.present;
          future=state.future;
          past=state.past;
          animation="nothing";
          easing="ease-in";
          action2="POP";
        }

        var index;
        index=state.past.findIndex(findHistoryEntry);
        if(index>-1){//It's in the past
          goPast(index);
        }else{//Search in the future
          index=state.future.findIndex(findHistoryEntry);
          if(index==-1 && state.past.length==0 && state.future.length==0){//Search in the pesent
            loadStatic()
          }else if(index>-1){//It's in the future
            goFuture(index);
          } else { //Force past
            goPast(index);
          }
        }

        if(!reload)state = Object.assign({}, state,{past:past,present:present,future:future,lastAction:action2,animation:animation,easing:easing,change:state.change?0:1});
        return state;

      default:
          return state;
    }
};

export default transitionReducer;
