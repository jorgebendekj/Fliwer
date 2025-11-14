import {launchCamera,launchImageLibrary} from 'react-native-image-picker';
import {View } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';


const hasCamera = ()=>{return true;}

var getBase64 = (file) =>{
  return new Promise((resolve,reject)=>{
    RNFS.readFile(file, 'base64').then((data)=>{
      var b64='data:image/jpeg;base64,'+data;
      ImageResizer.createResizedImage(b64,2000,2000,"JPEG", 80,0,undefined,false).then((response) => {
          RNFS.readFile(response.uri, 'base64').then((data2)=>{
            resolve('data:image/jpeg;base64,' + data2);
          },reject);
      }).catch((err) => {
        // Oops, something went wrong. Check that the filename is correct and
        // inspect err to get more details.
        reject(err);
      });
    },reject);
  })
}

export {launchCamera,hasCamera,launchImageLibrary, View as FileDrop, getBase64 };
