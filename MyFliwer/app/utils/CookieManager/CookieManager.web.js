const  CookieManager ={
  get:()=>{
    return new Promise((resolve,reject)=>{
      resolve();
    })
  },
  setFromResponse:()=>{
    return new Promise((resolve,reject)=>{
      resolve(true);
    })
  },
}
export default CookieManager
