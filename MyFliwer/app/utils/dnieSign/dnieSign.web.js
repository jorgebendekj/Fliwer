'use strict';
import React, { Component } from 'react';
import {toast} from '../../widgets/toast/toast'

if(!window.AutoScript){
  const script = document.createElement("script");
  script.src = "./autoscript/autoscript.js";
  script.async = true;
  document.body.appendChild(script);
}


class DnieSigner {

    sign(dataB64,options) {
      return new Promise((resolve, reject) => {
        /*
          dataB64: facturaE in base64
          options:{
            format: "FacturaE"
          }

          return: facturaE in base64 signed
        */

        window.AutoScript.cargarAppAfirma();
        window.AutoScript.setServlets("http://appprueba:8080/afirma-signature-storage/StorageService", "http://appprueba:8080/afirma-signature-retriever/RetrieveService");

        if(!options)options={};
        if(!options.format)options.format="FacturaE"
        var params = 	"mode=explicit\n"+"serverUrl=http://appprueba:8080/afirma-server-triphase-signer/SignatureService";
        if(options.format=="PAdES"){
          var lowerLeftX=50;
          var lowerLeftY=0;
          var upperRightX=300;
          var upperRightY=70;
          var fontSize=8;
          var page=-1;
          var text="\nlayer2Text= Firmado por $$SUBJECTCN$$ el día $$SIGNDATE=dd/MM/yyyy$$ con un certificado emitido por $$ISSUERCN$$";
          if(options.position && options.position.preset=="left"){
            lowerLeftX=50;
            lowerLeftY=0;
            upperRightX=290;
            upperRightY=70;
            fontSize=8;
          }else if(options.position && options.position.preset=="right"){
            lowerLeftX=320;
            lowerLeftY=0;
            upperRightX=550;
            upperRightY=70;
            fontSize=8;
          }else if(options.position){
            if(options.position.lowerLeftX)lowerLeftX=options.position.lowerLeftX;
            if(options.position.lowerLeftY)lowerLeftY=options.position.lowerLeftY;
            if(options.position.upperRightX)upperRightX=options.position.upperRightX;
            if(options.position.upperRightY)upperRightY=options.position.upperRightY;
            if(options.position.fontSize)fontSize=options.position.fontSize;
          }
          params+=text+"\nsignaturePositionOnPageLowerLeftX = "+lowerLeftX+"\nsignaturePositionOnPageLowerLeftY = "+lowerLeftY+"\nsignaturePositionOnPageUpperRightX = "+upperRightX+"\nsignaturePositionOnPageUpperRightY = "+upperRightY+"\nlayer2FontSize="+fontSize+"\nsignaturePage = "+page;
        }
        window.AutoScript.sign(dataB64, "SHA256withRSA", options.format, params,(signedB64, certB64)=>{
          resolve({signedB64:signedB64,certB64:certB64});
        },(errorType, errorMessage)=>{
          debugger;
          toast.error(errorMessage);
          reject();
        });
      });
    }

}

var dnieSign = new DnieSigner();
export { dnieSign };
