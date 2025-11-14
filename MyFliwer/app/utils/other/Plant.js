/**
 * @file Manages plant calls.
 * @version 0.0.1
 * @module
 */

"use strict";

// Utils imports
import i18n from '../Utils/Language.js';
import { plantService } from "../Utils/ApiService.js";
import Arr from "../Utils/Arr.js"; // import own Array methods
import * as STORAGE from "../Utils/Storage.js";

/**
 * Class that manges calls to plantService
 * @class Plant
 */
export default class Plant {
	/**
	 * Recovers the plant tree from the localStorage or gets it from the server.
	 */
	constructor(){
		this.lang = STORAGE.getLocalStorageItem("i18nextLng")
			|| (navigator.languages ? navigator.languages[0] : null)
			|| navigator.language || navigator.userLanguage; // Get language
		this.storageSuported = typeof(Storage) !== "undefined"; // Check storage support
		this.plantTree = {};
		this.plantIndex = [];
		this.loadPlantTree();
	}
	
	/**
	 * Set language of the plant tree and reload it if necessary.
	 */
	setLanguage(lang){if(this.lang != lang){ this.lang=lang; this.loadPlantTree(); }}
	
	/**
	 * Gets plant tree with the current language
	 */
	getPlantTree(){
		return this.plantTree[this.lang];
	}
	
	/**
	 * Recovers the plant tree from the localStorage or gets it from the server.
	 */
	loadPlantTree(){
		if(this.plantTree[this.lang] === undefined){
			if(this.storageSuported){
				this.loadPlantTreeFromLocalStorage();
			}else{
				this.loadPlantTreeFromServer();
			}
		}
	} 
	
	/**
	 * @summary Load the plant tree from the local storage and save it to this.plantTree.
	 * Load the plant tree from the local storage and save it to this.plantTree.
	 * If the storage is empty or the server was updated since last loading then loads plant tree from the server.
	 */
	loadPlantTreeFromLocalStorage(){
		$.ajax(plantService.getLastUpdateTime()).done(response => {
			var storeAux = STORAGE.getLocalStorageItem("plants_" + this.lang);
			if( storeAux != null && storeAux.lastUpdate === response.time){
				this.plantTree[this.lang] = storeAux.plantTree;
				console.log("Plant Tree Loaded");
			}else{
				if( storeAux == null ) storeAux = {};
				storeAux.lastUpdate = response.time;
				STORAGE.setLocalStorageItem("plants_" + this.lang, storeAux);
				this.loadPlantTreeFromServer();
			}
		});
	}
	
	/**
	 * Load the plant tree from the server and save it to this.plantTree.
	 */
	loadPlantTreeFromServer(){
		$.ajax(plantService.getPlantTree({all:true, lang:this.lang})).done(response => {
			this.plantTree[this.lang] = response;
			if(this.storageSuported){
				var storeAux = STORAGE.getLocalStorageItem("plants_" + this.lang) || {};
				storeAux.plantTree = response;
				STORAGE.setLocalStorageItem("plants_" + this.lang, storeAux);
				console.log("Plant Tree Loaded");
			}
		});
	}
	
	/**
	 * Get a plant from the plant tree
	 */
	getPlantFromPlantTree(idPlant){
		let recursiveSearch = (tree) => {
			let res = null;
			tree.forEach(node => {
				if(res == null && node.idPlant != null){
					this.plantIndex[idPlant] = node;
					if(node.idPlant === idPlant){ res = node; }
				}
				else if(res == null && node.subCategories.subcategory != null) res = recursiveSearch(node.subCategories.subcategory);
				else if(res == null && node.subCategories.plant != null) res = recursiveSearch(node.subCategories.plant);
			});
			return res;
		}
		
		if(this.plantIndex[idPlant] != undefined) return this.plantIndex[idPlant];
		return recursiveSearch(this.getPlantTree().category);
	}
	
	/**
	 * Search plant
	 */
	searchPlant(name){
		return $.ajax(plantService.searchPlant(name)).done(response => {return response;});
	}
}

export var plant = new Plant();