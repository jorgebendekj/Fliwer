export const PLANTS_NEW_DATA_AVAILABLE = 'PLANTS_NEW_DATA_AVAILABLE';
export const PLANTS_DATA_AVAILABLE = 'PLANTS_DATA_AVAILABLE';

//Import the api calls
import { plantService } from '../utils/apiService.js';
import { uniqueStorage } from '../utils/uniqueStorage/uniqueStorage';
import schema from '../utils/schema';
import { normalize } from 'normalizr';

export function getPlantList(language,data){
  return (dispatch, getState) => {
    var loadStorage= data?true:false;
    var items = loadStorage?data:getState().fliwerPlantReducer;
    var language= getState().languageReducer.language;
    var needCall=false;
    var lastUpdate=items.lastUpdate;
    if((!items.plants || (items.plants && items.plants.length==0) || items.language!=language) && items.language){needCall=true;}
    if(!items.incompatibilityPlantCategory || items.incompatibilityPlantCategory.length == 0) needCall=true


    plantService.getLastUpdateTime().then(function(lastUpdateTime){
      if(lastUpdateTime.time>lastUpdate || needCall){
        lastUpdate=lastUpdateTime.time;
        needCall=true;
      }

      if(needCall){
        plantService.getPlants({lang:language,moreInfo:1}).then(function(plants){
          plantService.getIncompatibilityTable().then(function(incompatibilityPlantCategory){
            const data = normalize(plants, schema.plantList);
            var ip = {};
            for(let i=0;i<incompatibilityPlantCategory.length;i++){
               if(!ip[incompatibilityPlantCategory[i][0]]) ip[incompatibilityPlantCategory[i][0]]= {}
               if(!ip[incompatibilityPlantCategory[i][1]]) ip[incompatibilityPlantCategory[i][1]]= {}
               ip[incompatibilityPlantCategory[i][0]][incompatibilityPlantCategory[i][1]]= true
               ip[incompatibilityPlantCategory[i][1]][incompatibilityPlantCategory[i][0]]= true
            }
            dispatch({type: PLANTS_NEW_DATA_AVAILABLE, data:{ incompatibilityPlant: ip, plants: data.entities.plants, categories: data.entities.plantCategory, lastUpdate:lastUpdate, language:language }});
          });
        });
      }else if(loadStorage)dispatch({type: PLANTS_NEW_DATA_AVAILABLE, data:{ incompatibilityPlant: items.incompatibilityPlantCategory, plants: items.plants, categories:items.categories, lastUpdate:items.lastUpdate, language:items.language }});
      else dispatch({type: PLANTS_DATA_AVAILABLE, data:{}});

    });

  }
}

export function loadStoragePlants(){
  return (dispatch,getState) => {
    uniqueStorage.getItem('plantInfo').then(function(data){
      if(data)data=JSON.parse(data);
      var language= getState().languageReducer.language;
      return dispatch(getPlantList(language,data));
    });
  }
}

export function getPlant(id){
  return (dispatch, getState) => {
    var items = getState().fliwerPlantReducer;
    return items.plants && items.plants[id]?items.plants[id]:'';
  }
}

export function getCategory(id){
  return (dispatch, getState) => {
    var items = getState().fliwerPlantReducer;
    return items.categories && items.categories[id]?items.categories[id]:'';
  }
}

export function plantSearchByImage(image){
  return (dispatch, getState) => {
    return new Promise(function(resolve,reject){
      plantService.plantSearchByImage(image).then(function(plants){
        resolve(plants);
      },function(error){
        reject(error);
      })
    })
  }
}
