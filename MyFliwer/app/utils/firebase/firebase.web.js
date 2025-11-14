import {initializeApp} from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

let config = {
    apiKey: "AIzaSyBuoCUxxmbO7nbqd2eudWjSeZm68zqECGc",
    authDomain: "fliwer-863cd.firebaseapp.com",
    databaseURL: "https://fliwer-863cd.firebaseio.com",
    projectId: "fliwer-863cd",
    storageBucket: "fliwer-863cd.appspot.com",
    messagingSenderId: "1092770741396",
    appId: "1:1092770741396:web:a464b26fe4536ad8104881"

};

console.log("Start firebase.initializeApp");
const app=initializeApp(config);
const auth = getAuth(app);
console.log("End firebase.initializeApp");

var firebase={initializeApp:initializeApp,auth:auth,RecaptchaVerifier :RecaptchaVerifier, signInWithPhoneNumber:signInWithPhoneNumber };

firebase.crashlytics= () => {
    return {
        crash: () => {
            return null;
        },
        log: () => {
            return null;
        },
        recordError: () => {
            return null;
        },
        setBoolValue: () => {
            return null;
        },
        setFloatValue: () => {
            return null;
        },
        setIntValue: () => {
            return null;
        },
        setStringValue: () => {
            return null;
        },
        setUserIdentifier: () => {
            return null;
        },
        setAttribute: () => {
            return null;
        },

        setUserId:()=>{
            return null;
        },
        enableCrashlyticsCollection: () => {
            return null;
        }
    };
};

firebase.messaging = () => {
    return {
        onTokenRefresh: () => {
            return null;
        }
    };
};

 export default firebase;
