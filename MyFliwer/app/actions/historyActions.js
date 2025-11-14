export const HISTORY_PUSH = 'HISTORY_PUSH';
export const HISTORY_POP = 'HISTORY_POP';

export function historyPush(key,animation,easing){
  return (dispatch,getState) => {
    dispatch({type: HISTORY_PUSH, data:{key:key,animation:animation,easing:easing}});
  }
}

export function historyPop(key){
  return (dispatch,getState) => {
    dispatch({type: HISTORY_POP, data:{key:key}});
  }
}
