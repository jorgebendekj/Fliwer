/**
 * @file Manages cookies.
 * @version 0.0.1
 * @module
 */
 
/**
 * Set a cookie to the current path.
 * @param {string} cname - Cookie name
 * @param {object} cvalue - Cookie value
 * @param {number} exdays - Number of days the cookie will expire until now
 */
export function setCookie(cname, cvalue, exdays) {
	cvalue = cvalue || "";
	exdays = exdays || 0;
    var date = new Date();
    date.setTime(date.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ date.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Get the value of a cookie.
 * @param {string} cname - Cookie name
 * @return {string} The value of the cookie or "" if the cookie isn't set.
 */
export function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/**
 * Delete a cookie.
 * @param {string} cname - Cookie name
 */
export function deleteCookie(cname){ setCookie(cname); }