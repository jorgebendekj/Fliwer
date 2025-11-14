'use strict';
import React, { Component } from 'react';

class BackgroundServiceClass {

    start(callback) {
        callback();
    }

    stop() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    updateNotification() {
        
    }

}

var BackgroundService = new BackgroundServiceClass();
export { BackgroundService };
