/**
 * @file Manage storage
 * @version 0.0.1
 * @module
 */

/**
 * Set an item to the local storage
 * @param {string} iname - Item name
 * @param {object} item
 */
export function setLocalStorageItem(iname, item){
	if(typeof(item) == "object"){
		item = JSON.stringify(item);
	}
	localStorage.setItem(iname, item);
}

/**
 * Get an item from the local storage
 * @param {string} iname - Item name
 * @return {object} The item from the storage
 */
export function getLocalStorageItem(iname){
	var ret = localStorage.getItem(iname);
    try { ret = JSON.parse(ret); }
	catch(e) { return localStorage.getItem(iname); };  
    return ret;
}

/**
 * Remove an item from the local storage
 * @param {string} iname - Item name
 */
export function removeLocalStorageItem(iname){
	localStorage.removeItem(iname);
}