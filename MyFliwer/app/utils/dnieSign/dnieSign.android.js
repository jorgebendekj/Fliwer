'use strict';
import React, { Component } from 'react';
import {toast} from '../../widgets/toast/toast'

class DnieSigner {

    sign(dataB64,options) {
      return new Promise((resolve, reject) => {
          reject();
      });
    }

}

var dnieSign = new DnieSigner();
export { dnieSign };
