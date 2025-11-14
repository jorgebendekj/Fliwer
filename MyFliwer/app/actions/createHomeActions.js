export const CREATE_HOME_NAME= 'CREATE_HOME_NAME';
export const CREATE_HOME_CLEAN= 'CREATE_HOME_CLEAN';
export const CREATE_HOME_COORDS= 'CREATE_HOME_COORDS';
export const CREATE_HOME_ADDRESS= 'CREATE_HOME_ADDRESS';
export const SET_CREATE_HOME_NAME= 'SET_CREATE_HOME_NAME';


export function getCreateHomeName(homeName, placeID, country, city){
  return (dispatch, getState) => {
    return new Promise((resolve,reject)=>{
          dispatch({type:CREATE_HOME_NAME,name:homeName,placeID:placeID,countryCity:country,nameCity:city});
          resolve();
    });
  }
}

export function getCreateHomeCoords(coords){
  return (dispatch, getState) => {
    return new Promise((resolve,reject)=>{
          dispatch({type:CREATE_HOME_COORDS,coords:coords});
          resolve();
    });
  }
}

export function getCreateHomeAddress(address){
  return (dispatch, getState) => {
    return new Promise((resolve,reject)=>{
          dispatch({type:CREATE_HOME_ADDRESS,address:address});
          resolve();
    });
  }
}


export function getCreateHomeClean(){
  return (dispatch, getState) => {
    return new Promise((resolve,reject)=>{
          dispatch({type:CREATE_HOME_CLEAN});
          resolve();
    });
  }
}

export function setCreateHomeName(homeName,countryCity,nameCity,place_id){
  return (dispatch, getState) => {
    return new Promise((resolve,reject)=>{
          dispatch({type:SET_CREATE_HOME_NAME,name:homeName,placeID:place_id,countryCity:countryCity,nameCity:nameCity});
          resolve();
    });
  }
}
