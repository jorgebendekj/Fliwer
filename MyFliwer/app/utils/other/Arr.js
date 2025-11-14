/**
 * @file Extends array methods
 * @version 0.0.1
 * @module
 */
 
/**
 * Class that extends Array methods.
 * @class Arr
 */
export default class Arr {
	/**
	 * This funtion sorts the items of an array by the attributes passed.
	 * @param {array} array - Array to be sorted+
	 * @param {array} attrs - Atributes used to sort
	 * @return {array} The sorted array.
	 */
	static sortByAttribute(array, ...attrs) {
		let predicates = attrs.map(pred => {
			let descending = pred.charAt(0) === '-' ? -1 : 1;
			pred = pred.replace(/^-/, '');
			return { getter: o => o[pred], descend: descending };
		});

		return array.sort((o1, o2) => {
			var v1 = predicates.map(predicate => predicate.getter(o1));
			var v2 = predicates.map(predicate => predicate.getter(o2));
			let i = -1, result = 0;
			while (++i < predicates.length) {
				if (v1[i] < v2[i]) result = -1;
				if (v1[i] > v2[i]) result = 1;
				if (result *= predicates[i].descend) break;
			}
			return result;
		});
	}
}
export const sortByAttribute = Arr.sortByAttribute;

Array.prototype.sortByAttribute = function(...attrs){ return Arr.sortByAttribute(this,...attrs);};