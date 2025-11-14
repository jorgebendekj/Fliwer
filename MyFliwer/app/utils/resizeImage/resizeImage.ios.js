
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { RNFS } from '../../utils/fs/fs'
import Exif from 'react-native-exif'

/**
 * Class for ios.
 */
class ResizeImage {

    resize(imageUri, path) {

        return new Promise(function (resolve, reject) {

            Exif.getExif(path).then((responseExif) => {
                //.then(msg => console.warn('OK: ' + JSON.stringify(msg)))
                //.catch(msg => console.warn('ERROR: ' + msg))
                var rotation = 0;

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


                ImageResizer.createResizedImage(path, maxWidth, maxHeight, "JPEG", 80, 0,"file://"+path,false).then((response) => {

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
