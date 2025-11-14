/**
 * @file Manages locations
 * @version 0.0.1
 * @module
 */

"use strict";

// React imports
import React from "react";
// Utils imports
import { locationService } from "../Utils/ApiService.js";
import Arr from "../Utils/Arr.js"; // import own Array methods

/**
 * Manages locations
 * @class Locator
 */
export default class Locator {
	constructor(){
		this.countriesLoading = false;
		this.countriesLoaded = false;
		this.countries = [{value: "", name: ""}];
	}
	
	/**
	 * Make an ajax request in order to get all countries in the world.
	 * Order the countries and store them at this.countries.
	 * @function loadCountries
	 */
	loadCountries = () => {
		if (!this.countriesLoaded && !this.countriesLoading){
			this.countriesLoading = true;
			$.ajax(locationService.getCountries()).done((response) => {
				response.splice(0,2); // Remove 2 firsts elemets
				response.sortByAttribute('Name');
				for (var i = 0; i < response.length; i++) {
					var c = response[i];
					this.countries.push({value: c.Code, name: c.Name});
				}
				this.countriesLoading = false;
				this.countriesLoaded = true; console.log("Countries Loaded");
			});
		}
	}	
}
export var locator = new Locator();