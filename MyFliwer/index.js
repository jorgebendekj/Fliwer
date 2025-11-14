/**
 * @format
 */
global.envVars={TARGET_RAINOLVE:false};

import { AppRegistry, Platform } from 'react-native';
import App from './app/App';

AppRegistry.registerComponent("Taskium", () => App);

//This is what needs to be pasted
if (window.document) {
    AppRegistry.runApplication("Taskium", {
        initialProps: {},
        rootTag: document.getElementById("react-root")
    });
}
