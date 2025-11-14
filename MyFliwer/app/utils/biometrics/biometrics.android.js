import ReactNativeBiometrics from 'react-native-biometrics'
import  { BiometryTypes } from 'react-native-biometrics'
var bio= new ReactNativeBiometrics({ allowDeviceCredentials: true });
export {bio as ReactNativeBiometrics,BiometryTypes };
