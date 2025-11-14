export const TRANSITION_CHANGE = 'TRANSITION_CHANGE';

export function setTransition(object){
  return (dispatch,getState) => {
    dispatch({type: TRANSITION_CHANGE, data:object});
  }
}
