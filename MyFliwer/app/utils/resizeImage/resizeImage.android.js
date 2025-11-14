
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { RNFS } from '../../utils/fs/fs'
import Exif from 'react-native-exif'

/**
 * Class for android.
 */
class ResizeImage {

    resize(imageUri, path) {

        return new Promise(function (resolve, reject) {

            Exif.getExif(path).then((responseExif) => {
                //.then(msg => console.warn('OK: ' + JSON.stringify(msg)))
                //.catch(msg => console.warn('ERROR: ' + msg))
                var rotation = 0;
                console.log("responseExif", responseExif);

                if (responseExif.Orientation >= 3 && responseExif.Orientation <= 8)
                {
                    if (responseExif.Orientation == 3)
                        rotation = 180;
                    else if (responseExif.Orientation == 4)
                        rotation = 180;
                    else if (responseExif.Orientation == 5)
                        rotation = 90;
                    else if (responseExif.Orientation == 6)
                        rotation = 90;
                    else if (responseExif.Orientation == 7)
                        rotation = 270;
                    else if (responseExif.Orientation == 8)
                        rotation = 270;
                }

                // Full HD o Full High Definition
                //var w = 1920;
                //var h = 1080;
                // High Definition
                var w = 1280;
                var h = 720;

                // Bug fixing
                var maxWidth = w;
                var maxHeight = h;
                //rotation = 0;
                if (responseExif.ImageHeight > responseExif.ImageWidth || responseExif.Orientation == 6) {
                    maxWidth = h;
                    maxHeight = w;
                }

                ImageResizer.createResizedImage(imageUri, maxWidth, maxHeight, "JPEG", 80, rotation,undefined,false).then((response) => {
                    // response.uri is the URI of the new image that can now be displayed, uploaded...
                    // response.path is the path of the new image
                    // response.name is the name of the new image with the extension
                    // response.size is the size of the new image
                    /*
                     RNFS.readFile(response.uri,'base64').then((file) =>{


                     });
                     */

                    RNFS.readFile(response.uri, 'base64').then((file) => {
                        RNFS.unlink(response.uri);

                        resolve('data:image/jpeg;base64,' + file)
                    });

                }).catch((error) => {
                    console.log("errorR", error);
                    reject(error)
                    // Oops, something went wrong. Check that the filename is correct and
                    // inspect err to get more details.
                });

//                // Without resize
//                RNFS.unlink(path);
//                console.log("Resolve resize", imageUri);
//                resolve(imageUri);

            }).catch((error) => {
                console.log("errorR", error);
                reject(error)
                // Oops, something went wrong. Check that the filename is correct and
                // inspect err to get more details.
            });
        });
    }

};

export var
        resizeImage = new ResizeImage();
