/**
 * @file Manage language settings & configuration.
 * @version 0.0.1
 * @module
 */

import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// Imports utils to change their language
import plant from '../Utils/Plant.js';

/**
 * Language configuration.
 */
i18n.use(XHR).use(LanguageDetector).init({
	debug: false, // Set to true to see the logs
	fallbackLng: 'en',
	load: [ 'es', 'en', 'ca' ],
	interpolation: { escapeValue: false, /* not needed for react!! */ },
	// react i18next special options (optional)
	react: {
		wait: true, // set to true if you like to wait for loaded in every translated hoc
		nsMode: 'fallback' // set it to fallback to let passed namespaces to translated hoc act as fallbacks or just put default
	}
});
export default i18n;

/**
 * Set language of the page and make sure all data change its language.
 * @param {string} lang - Language to set to the page
 */
export function setLanguage(lang){
	i18n.setLanguage(lang);
	plant.setLanguage(lang);
}