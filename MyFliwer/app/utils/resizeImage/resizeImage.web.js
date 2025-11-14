'use strict';

import React, { Component } from 'react';
import Resizer from 'react-image-file-resizer';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

class ResizeImage {

    resize(imagePath) {
        console.log("imagePath", imagePath);
        return new Promise(function (resolve, reject) {

            // Full HD o Full High Definition
            //var w = 1920;
            //var h = 1080;
            // High Definition
            var w = 1280;
            var h = 720;

            try {
                Resizer.imageFileResizer(
                        imagePath, //is the file of the new image that can now be uploaded...
                        w, // is the maxWidth of the  new image
                        h, // is the maxHeight of the  new image
                        "JPEG", // is the compressFormat of the  new image
                        80, // is the quality of the  new image
                        0, // is the rotatoion of the  new image
                        uri => {
                            resolve(uri);
                        }, // is the callBack function of the new image URI
                        "base64" //  is the output type of the new image
                        );                
            } catch (err) {
                console.log("Error resizing", err);
                reject();
            }

        });
    }
}

export var resizeImage = new ResizeImage();
