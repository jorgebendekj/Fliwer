export const CREATE_ZONE_NEW = 'CREATE_ZONE_NEW';
export const CREATE_ZONE_ADDPLANT = 'CREATE_ZONE_ADDPLANT';
export const CREATE_ZONE_DELETEPLANT = 'CREATE_ZONE_DELETEPLANT';
export const CREATE_ZONE_FINISH = 'CREATE_ZONE_FINISH';
export const CREATE_ZONE_ADDPHOTO = 'CREATE_ZONE_ADDPHOTO';
export const CREATE_ZONE_DELETEPHOTO = 'CREATE_ZONE_DELETEPHOTO';
export const CREATE_ZONE_ADDCONFIG = 'CREATE_ZONE_ADDCONFIG';
export const CREATE_ZONE_DELETECONFIG = 'CREATE_ZONE_DELETECONFIG';
export const CREATE_ZONE_ADDHOME= 'CREATE_ZONE_ADDHOME';
export const LOAD_ZONE_PLANTS= 'LOAD_ZONE_PLANTS';

export function createNewZone(){
  return (dispatch, getState) => {
    var reducer = getState().createZoneReducer;
    if(reducer.creating)dispatch({type:CREATE_ZONE_FINISH,data:{}});
    dispatch({type:CREATE_ZONE_NEW,data:{}});
  }
}

export function stopCreatingNewZone(){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_FINISH,data:{}});
  }
}

export function addPlantZone(idPlant,phase){
  return (dispatch, getState) => {
    var plants={};
    plants[idPlant]={idPlant:idPlant,plant_phase:phase};
    dispatch({type:CREATE_ZONE_ADDPLANT,data:{plants:plants}});
  }
}

export function removePlantZone(idPlant){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_DELETEPLANT,data:{idPlant:idPlant}});
  }
}

export function loadedZonePlants(){
  return (dispatch,getState)=> {
    dispatch({type:LOAD_ZONE_PLANTS,data:{}})
  }
}

export function addPhotoZone(photo){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_ADDPHOTO,data:{photo:photo}});
  }
}

export function removePhotoZone(){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_DELETEPHOTO,data:{}});
  }
}

export function addConfigZone(idHome,name,extension,outdoor,light,hoursAllowed,coords){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_ADDCONFIG,data:{idHome:idHome,name:name,extension:extension,outdoor:outdoor,light:light,hoursAllowed:hoursAllowed,map:coords}});
  }
}

export function addHomeZone(idHome){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_ADDHOME,data:{idHome:idHome}});
  }
}

export function removeConfigZone(){
  return (dispatch, getState) => {
    dispatch({type:CREATE_ZONE_DELETECONFIG,data:{}});
  }
}
