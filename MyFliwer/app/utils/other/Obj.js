/**
 * @file Extends Object methods
 * @version 0.0.1
 * @module
 */
 
'use strict';

/**
 * Add support to Object.keys on legacy browsers
 * @source MDN
 */
if(!Object.keys){
	Object.keys = (function(){
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = [ 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor' ],
			dontEnumsLength = dontEnums.length;
		return function(obj) {
			if (typeof obj!=='object' && (typeof obj!=='function' || obj===null)){
				throw new TypeError('Object.keys called on non-object');
			}
			var result = [], prop, i;
			for (prop in obj) {
				if(hasOwnProperty.call(obj, prop)) result.push(prop);
			}
			if(hasDontEnumBug){
				for(i = 0; i < dontEnumsLength; i++){
					if (hasOwnProperty.call(obj, dontEnums[i])){
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

/**
 * Add suport to Array.prototype.reduce on legacy browsers
 * @source Firefox
 */
if(!Array.prototype.reduce){
	Array.prototype.reduce = function(fun /*, initial*/){
		var longitud = this.length;
		if(typeof fun != "function") throw new TypeError();
		if (longitud == 0 && arguments.length == 1) throw new TypeError();

		var indice = 0;
		if(arguments.length >= 2){ var rv = arguments[1]; }
		else{ do{
			if(indice in this){ rv = this[indice++]; break; }
			if(++indice >= longitud) throw new TypeError();
		}while(true); }

		for(; indice < longitud; indice++){
			if(indice in this) rv = fun.call(null,rv,this[indice],indice,this);
		}
		
		return rv;
	};
}

/**
 * Add suport to Object.assign on legacy browsers
 * @source MDN
 */
if (typeof Object.assign != 'function') {
	Object.assign = function(target, varArgs){ 
		if(target == null){ // TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}
		var to = Object(target);
		for(var index = 1; index < arguments.length; index++){
			var nextSource = arguments[index];
			if(nextSource != null){ for(var nextKey in nextSource){
				if(Object.prototype.hasOwnProperty.call(nextSource, nextKey)){
					to[nextKey] = nextSource[nextKey];
				}
			}}
		}
		return to;
	};
}

/**
 * Class that extends Object methods
 * @class Obj
 */
export default class Obj {
	/**
	 * Merge the objects.
	 * @param {object[]} objs - List of objects
	 * @returns {object} The merged object.
	 */
	static merge(...objs){
		return objs.reduce((res,obj) => {
			obj = obj || {};
			Object.keys(obj).forEach((key) => res[key] = obj[key]);
			return res;
		},{});
	}
}


