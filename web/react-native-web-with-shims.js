// Custom react-native module that extends react-native-web with web-compatible shims
const ReactNativeWeb = require('react-native-web');

// Import our ActionSheetIOS shim
const ActionSheetIOS = require('./ActionSheetIOS.web.js');

// Re-export everything from react-native-web
module.exports = {
    ...ReactNativeWeb,
    // Add our shims
    ActionSheetIOS: ActionSheetIOS
};

