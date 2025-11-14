var { Platform, Linking} = require('react-native');
import { VersionNumber } from './versionNumber/versionNumber'

const FliwerCommonUtils = {
  
    validateEmail: (email) => {
        const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regexp.test(email);
    },
    
    /*
     * Returns 1 if the IBAN is valid 
     * Returns 0 if the IBAN's length is not as should be (for CY the IBAN Should be 28 chars long starting with CY )
     * Returns any other number (checksum) when the IBAN is invalid (check digits do not match)
     */
    isValidIBANNumber: (input) => {
        var CODE_LENGTHS = {
            AD: 24, AE: 23, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
            CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
            FI: 18, FO: 18, FR: 27, GB: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
            HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
            LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
            MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
            RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, TN: 24, TR: 26
        };
        var iban = String(input).toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
                code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
                digits;
        // check syntax and length
        if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
            return false;
        }
        // rearrange country code and check digits, and convert chars to ints
        digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, function (letter) {
            return letter.charCodeAt(0) - 55;
        });
        // final check
        return FliwerCommonUtils.mod97(digits);
    },
    mod97: (string) => {
        var checksum = string.slice(0, 2), fragment;
        for (var offset = 2; offset < string.length; offset += 7) {
            fragment = String(checksum) + string.substring(offset, offset + 7);
            checksum = parseInt(fragment, 10) % 97;
        }
        return checksum;
    },
    
    isValidUrl: (string) => {
        
        if (string && string.indexOf("http://localhost") !== -1)
            return true;
            
        var isValidUrlExp = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
        return isValidUrlExp.test(string);   
    },

    toPointsFormat:(value)=>{
        var [whole,dec]= String((value)).split('.');
        if(!dec) dec="00";
        dec=dec.slice(0,2);
        if(whole=="null") var whole=0;
        whole= whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        var fusion = whole+","+dec;
        var result = fusion.replace(/^\s+|\s+$/g, "");
        return result;
    },
    
    toFloatValue: (value) => {
        if (!value)
            return 0;
        // To String
        value = value.toString();
        // Check points and comas
        var comas = value.split(",");
        var nComas = comas.length - 1;
        nComas = nComas >= 0? nComas : 0;
        var points = value.split(".");
        var nPoints = points.length - 1;
        nPoints = nPoints >= 0? nPoints : 0;
        if (nComas == 0 && nPoints == 0) {
            //console.log("nComas == 0 && nPoints == 0", nComas, nPoints);
            return (isNaN(value)? 0 :parseFloat(value));
        } else if (nComas == 0 && nPoints > 0) {
            //console.log("nComas == 0 && nPoints > 0", nComas, nPoints);
            if (nPoints == 1)
                return (isNaN(value)? 0 :parseFloat(value));
            else {
                // Remove all points except the latest
                //console.log("Removing all points except the latest", points);
                var newValue="";
                points.forEach((item, i) => {
                    if (i == nPoints)
                        newValue += ".";
                    newValue += item;
                });
                value = newValue;
                return (isNaN(value)? 0 :parseFloat(value));
            }
        } else if (nComas > 0 && nPoints == 0) {
            //console.log("nComas > 0 && nPoints == 0", nComas, nPoints);
            if (nComas == 1) {
                value = value.replace(/,/g, '.');
                return (isNaN(value)? 0 :parseFloat(value));
            }
            else {
                // Remove all comas except the latest
                //console.log("Removing all comas except the latest", comas);
                var newValue="";
                comas.forEach((item, i) => {
                    if (i == nComas)
                        newValue += ".";
                    newValue += item;
                });
                value = newValue;
                return (isNaN(value)? 0 :parseFloat(value));
            }
        }
        
        //console.log("nComas > 0 && nPoints > 0", nComas, nPoints);
        value = value.replace(/,/g, '.');
        //console.log("Replaced all comas by points", value);
        var points = value.split(".");
        var nPoints = points.length - 1;
        nPoints = nPoints >= 0? nPoints : 0;
        // Remove all points except the latest
        //console.log("Removing all points except the latest");
        var newValue="";
        points.forEach((item, i) => {
            if (i == nPoints)
                newValue += ".";
            newValue += item;
        });
        value = newValue;
        return (isNaN(value)? 0 :parseFloat(value));
    },
    
    isSafariBrowser: () => {

        if (Platform.OS !== 'web') {
            return false;
        }
        
        // Safari 3.0+ "[object HTMLElementConstructor]" 
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        //console.log("isSafari", isSafari);
        return isSafari;
    },
    
    isIphoneBrowser: () => {

        if (Platform.OS !== 'web') {
            return false;
        }
        
        var isIphoneBrowser = (/(iPhone|iPod|iPad)/i.test(navigator.userAgent));
        //console.log("isIphoneBrowser", isIphoneBrowser, navigator.userAgent);
        return isIphoneBrowser;        
    },
    
    getVersion: () => {

        if (Platform.OS == 'web') {
            return null;
        }
        
//        console.log("appVersion", VersionNumber.appVersion);
        console.log("buildVersion", VersionNumber.buildVersion);
//        console.log("bundleIdentifier", VersionNumber.bundleIdentifier);

        return VersionNumber.buildVersion;
    },

    openLocationMaps: (lat, long) => {
        console.log("openLocationMaps", lat, long);
        if (Platform.OS == 'web') {
            var browser_url =
                    "https://www.google.de/maps/@" +
                    lat +
                    "," +
                    long +
                    "?q=" +
                    lat + "," + long;

            window.open(browser_url, "_blank");
        }   
        else if (Platform.OS == 'android') {
            const url = Platform.select({android: "geo:" + lat + "," + long + "?q=" + lat + "," + long});
            Linking.openURL(url);
            
        } 
        else {
            const url = Platform.select({ios: "maps:" + lat + "," + long + "?q=" + lat + "," + long});
            console.log("openLocationMaps url", url);
            Linking.openURL(url);
        }

    },

    isValidCoordinates(coordinates) {
        if (!coordinates.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)) {
            return false;
        }
        const [latitude, longitude] = coordinates.split(",");
        if (coordinates.split(",").length > 2)
            return false;
        return (latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180);
    },

    typeToTitle(type) {
        switch (type) {
            case "SENS":
                return "deviceCard_sensor_front_title";
            case "CONTROL_9":
                return "deviceCard_control9_front_title";
            case "CONTROL_24":
                return "deviceCard_control24_front_title";
            case "LINK_WIFI_PRO":
            case "LINK_WIFI":
                return "deviceCard_wifi_front_title";
            case "LINK_GPRS_PRO":
            case "LINK_GPRS":
                return "deviceCard_3g_front_title";
            case "SENS_PRO":
                return "deviceCard_logger_front_title";
            case "UNIPRO16":
                return "deviceCard_sdial16_front_title";
            case "UNIPRO12":
                return "deviceCard_sdial12_front_title";
            case "UNIPRO9":
                return "deviceCard_sdial9_front_title";
            case "UNIPRO6":
                return "deviceCard_sdial6_front_title";
            case "TBD6":
                return "deviceCard_wdial6_front_title";
            case "TBD4":
                return "deviceCard_wdial4_front_title";
            case "TBD2":
                return "deviceCard_wdial2_front_title";
            case "TBD1":
                return "deviceCard_wdial1_front_title";
            default:
                return null;
        }
    }

};

export {FliwerCommonUtils};
