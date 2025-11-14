export const MODIFY_ZONE_NEW = 'MODIFY_ZONE_NEW';
export const MODIFY_ZONE_FINISH = 'MODIFY_ZONE_FINISH';
export const ADD_CURRENT_ZONE_MODIFICATIONS = 'ADD_CURRENT_ZONE_MODIFICATIONS';
export const ADD_NEW_HOME = 'ADD_NEW_HOME';
export const ADD_MAP = 'ADD_MAP';
export const REMOVE_MAP = 'REMOVE_MAP';

export function createNewModification(){
  return (dispatch, getState) => {
    var reducer = getState().modifyZoneActions;
    //if(reducer.modifying)dispatch({type:MODIFY_ZONE_FINISH,data:{}});
    dispatch({type:MODIFY_ZONE_NEW,data:{}});
  }
}

export function stopModifyingZone(){
  return (dispatch, getState) => {
    dispatch({type:MODIFY_ZONE_FINISH,data:{}});
  }
}

export function addCurrentZoneModifications(idZone, idHome, name, extension, outdoor, light,irrigationEnabled, hoursAllowed, picture){
  return (dispatch, getState) => {
    dispatch({type:ADD_CURRENT_ZONE_MODIFICATIONS,data:{idZone:idZone, idHome:idHome, name:name, extension:extension, outdoor:outdoor, light:light,irrigationEnabled:irrigationEnabled,hoursAllowed:hoursAllowed,picture:picture}});
  }
}

export function addMap(idZone, lat, long, zoom){
  return (dispatch, getState) => {
    dispatch({type:ADD_MAP,data:{idZone:idZone, lat:lat,long:long,zoom:zoom}});
  }
}

export function removeMap(idZone){
  return (dispatch, getState) => {
    dispatch({type:REMOVE_MAP,data:{idZone:idZone, lat:null,long:null,zoom:null}});
  }
}

export function addHomeZone(idHome){
  return (dispatch, getState) => {
    dispatch({type:ADD_NEW_HOME,data:{idHome:idHome}});
  }
}
