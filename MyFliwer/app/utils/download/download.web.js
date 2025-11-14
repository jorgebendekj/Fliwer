
const Download={

  fetch:(method,url,filename,body,asBase64)=>{
    return new Promise((resolve,reject)=>{
      fetch(url,{"headers": { "Content-Type": "application/json" },method:method,credentials:'include',body:body}).then((response)=>{
        response.blob().then(blob => {
          if(asBase64){
            const reader = new FileReader;
            reader.onerror = reject;
            reader.onload = () => {
              //Remove data:application/octet-stream;base64,
              var result = reader.result.substr(reader.result.indexOf(',') + 1);
              resolve(result);
            };
            reader.readAsDataURL(blob);
          }else{
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download=filename;
            a.click();
            resolve();
          }
        });
      },reject)
    })
  }

}

export default Download
