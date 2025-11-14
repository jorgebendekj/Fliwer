'use strict';
import React, { Component } from 'react';
import FileDrop from 'react-file-drop';

class FileUploader {

    pick(options) {
        return new Promise((resolve, reject) => {
            var response = {didCancel: false, error: false, invalidFile: false, customButton: false};

            if (options.fileInput) {
                options.fileInput.onchange = function (e) {
                    var file = e.target.files[0];
                    var uri = URL.createObjectURL(file);
                    resolve({uri: uri, type: file.type, name: file.name});
                };
                options.fileInput.click();
            } else {
                response.error = true;
                reject(response);
            }
        });
    }

}

var DocumentPicker = new FileUploader();
export { DocumentPicker, FileDrop  };
