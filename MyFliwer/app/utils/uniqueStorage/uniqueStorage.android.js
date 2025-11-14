/**
 * @file Manage ajax's call configurations.
 * @version 0.0.1
 * @todo UserService.getGardensUsers (admin)
 * @todo ExtraService.getMessages (chatBot)
 * @todo ExtraService.sendMessage (chatBot)
 * @todo ExtraService.getAdvertisementCard
 * @module
 */
 //import { AsyncStorage } from 'react-native';
 import FilesystemStorage from 'redux-persist-filesystem-storage'
/**
 * Class that offers uniqueStorage for android.
 */
class UniqueStorage {


	async getItem(key,callback){
		return  new Promise(function(resolve,reject){
      FilesystemStorage.getItem(key,callback).then(function(value){
		      resolve(value);
      },function(err){
          resolve(null);
      });
		});
	}

	async setItem(key,value,callback){
		return FilesystemStorage.setItem(key,value,callback);
	}

	async removeItem(key,callback){
		return new Promise((resolve,reject)=>{
      FilesystemStorage.removeItem(key).then(()=>{
        callback();
      },()=>{
        callback();
      })
    })
	}

	async mergeItem(key,value,callback){
		return FilesystemStorage.mergeItem(key,value,callback);
	}

	async getAllKeys(callback){
		return FilesystemStorage.getAllKeys(callback);
	}

	async multiGet(keys,callback){
		return FilesystemStorage.multiGet(keys,callback);
	}

	async multiSet(keyValuePairs,callback){
		return FilesystemStorage.multiSet(keyValuePairs,callback);
	}

	async multiRemove(keys,callback){
		return FilesystemStorage.multiRemove(keys,callback);
	}

	async multiMerge(keyValuePairs,callback){
		return FilesystemStorage.multiMerge(keyValuePairs,callback);
	}

}

export var
	uniqueStorage = new UniqueStorage();
