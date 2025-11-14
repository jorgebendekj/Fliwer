//import firebase from 'react-native-firebase';
import firebaseApp from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import messaging from '@react-native-firebase/messaging';

/*
if(!app){
  const firebaseConfig = {
    apiKey: "AIzaSyBuoCUxxmbO7nbqd2eudWjSeZm68zqECGc",
    projectId: "fliwer-863cd",
    appId: "1:1092770741396:android:4a3f41c6948bf429",
  };
  const app = firebaseApp.initializeApp(firebaseConfig);
}
*/

export default {auth:auth,crashlytics:crashlytics,messaging:messaging};
