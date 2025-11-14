/**
 * @file Extends String methods
 * @version 0.0.1
 * @module
 */

/**
 * Class that extends String methods
 * @class Str
 */
export default class Str {
	/**
	 * Use upperCase and lowerCase comparition to know if a character is a letter.
	 * @param {string} c - character
	 * @returns {boolean} True if c is a letter.
	 */
	static isLetter(c){ return c.length == 1 && c.toUpperCase() != c.toLowerCase(); }
}
export const isLetter = Str.isLetter;

String.prototype.isLetter = function(){ return Str.isLetter(this)};
