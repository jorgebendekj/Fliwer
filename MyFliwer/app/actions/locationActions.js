export const COUNTRY_NEW_DATA_AVAILABLE = 'COUNTRY_NEW_DATA_AVAILABLE';
export const COUNTRY_DATA_AVAILABLE = 'COUNTRY_DATA_AVAILABLE';

//Import the api calls
import { locationService } from '../utils/apiService.js';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
import schema from '../utils/schema';
import { normalize } from 'normalizr';

export function getCountries(data){
  return (dispatch, getState) => {
    var loadStorage= data?true:false;
    var items = loadStorage?data:getState().locationReducer;
    var needCall=false;

    var itemsCountry=items.countries?Object.keys(items.countries).map(function (key) { return items.countries[key]; }).length:0;
    if(!loadStorage || !itemsCountry){
      locationService.getCountries().then(function(countries){
        const data = normalize({countries:countries}, schema.countryList);
        dispatch({type: COUNTRY_NEW_DATA_AVAILABLE, data:{ countries: data.entities.country}});
      });
    }else{
        dispatch({type: COUNTRY_NEW_DATA_AVAILABLE, data:{ countries: items.countries }});
    }

  }
}

export function loadStorageCountries(){
  return (dispatch) => {
    uniqueStorage.getItem('locationInfo').then(function(data){
      if(data)data=JSON.parse(data);
      return dispatch(getCountries(data));
    });
  }
}

export function searchCities(country,name){
  return (dispatch) => {
    return new Promise(function(resolve,reject){
      locationService.searchCities(country,name).then(function(cities){
        resolve(cities);
      },function(error){
        reject(error);
      })
    });
  }
}

export function searchGeolocalitzacion(query){
  return (dispatch) => {
    return new Promise(function(resolve,reject){
      locationService.getGeolocation(query).then(function(data){
        resolve(data);
      },function(error){
        reject(error);
      })
    });
  }
}

export function getRegionGeoLocation(address){
  return (dispatch) => {
    return new Promise(function(resolve,reject){
      locationService.getRegionGeoLocation(address).then(function(data){
        resolve(data);
      },function(error){
        reject(error);
      })
    });
  }
}
