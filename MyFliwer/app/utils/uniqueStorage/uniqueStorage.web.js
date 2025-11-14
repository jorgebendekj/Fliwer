/**
 * @file Manage ajax's call configurations.
 * @version 0.0.1
 * @todo UserService.getGardensUsers (admin)
 * @todo ExtraService.getMessages (chatBot)
 * @todo ExtraService.sendMessage (chatBot)
 * @todo ExtraService.getAdvertisementCard
 * @module
 */

/**
 * Class that offers uniqueStorage for web.
 */

 var lzString = require('lz-string');

class UniqueStorage {


	getItem(key,callback){
		return new Promise(function(resolve,reject){
			var value=localStorage.getItem(key)
			if(value)value=lzString.decompress(value);
			if(typeof callback === "function")callback(null,value);
			resolve(value);
		});
	}

	setItem(key,value,callback){
		return new Promise(function(resolve,reject){
			localStorage.setItem(key,lzString.compress(value));
			if(typeof callback === "function")callback();
			resolve();
		});
	}

	removeItem(key,callback){
		return new Promise(function(resolve,reject){

			var value=localStorage.removeItem(key);
			if(typeof callback === "function")callback();
			resolve();
		});
	}

	mergeItem(key,value,callback){
            return new Promise(function(resolve,reject){

                var orig=localStorage.getItem(key);
                try {
                    value = JSON.parse(value);
                    orig = JSON.parse(orig);
                    value=Object.assign(orig, value);
                    localStorage.setItem(key,JSON.stringify(value));
                    if(typeof callback === "function")callback();
                    resolve();
                } catch(e) {
                    reject(e);
                    callback(e);
                }
            });
	}

	getAllKeys(callback){
		return new Promise(function(resolve,reject){

			var arr=[];
			for ( var i = 0, len = localStorage.length; i < len; ++i ) {
			  arr.push(localStorage.key(i));
			}
			if(typeof callback === "function")callback(null,arr);
			resolve(arr);
		});
	}

	multiGet(keys,callback){
		return new Promise(function(resolve,reject){

			var arr=[];
			for ( var i = 0, len = keys.length; i < len; ++i ) {
			  arr.push([keys[i],localStorage.getItem(keys[i])]);
			}
			if(typeof callback === "function")callback(null,arr);
			resolve(arr);
		});
	}

	multiSet(keyValuePairs,callback){
		return new Promise(function(resolve,reject){

			try {
				for ( var i = 0, len = keyValuePairs.length; i < len; ++i ) {
					localStorage.setItem(keyValuePairs[i][0],keyValuePairs[i][1]);
				}
				if(typeof callback === "function")callback();
				resolve();
			} catch(e) {
 	      reject(e);
 				callback(e);
 	    }
		});
	}

	multiRemove(keys,callback){
		return new Promise(function(resolve,reject){

			for ( var i = 0, len = keys.length; i < len; ++i ) {
				localStorage.removeItem(keys[i]);
			}
			if(typeof callback === "function")callback();
			resolve();
		});
	}

	multiMerge(keyValuePairs,callback){
		return new Promise(function(resolve,reject){

			try {
				for ( var i = 0, len = keyValuePairs.length; i < len; ++i ) {
					var orig=localStorage.getItem(keyValuePairs[i][0]);
					var value = JSON.parse(keyValuePairs[i][1]);
		      orig = JSON.parse(orig);
					value=Object.assign(orig, value);
					localStorage.setItem(keyValuePairs[i][0],JSON.stringify(value));
				}
				if(typeof callback === "function")callback();
				resolve();
			} catch(e) {
 	      reject(e);
 				callback(e);
 	    }
		});
	}



}

export var
	uniqueStorage = new UniqueStorage();
