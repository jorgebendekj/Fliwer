    
const customFetch = function (url, opts = {}, onProgress) {
    return new Promise((res, rej) => {
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.open(opts.method || 'get', url);
        for (var k in opts.headers || {})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => {
            res({
                json: () => {
                    return new Promise((res, rej) => {
                        res(JSON.parse(e.target.responseText));
                    })
                }
            })
        }
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
//            xhr.upload.addEventListener("progress", onProgress);
           xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
    });
}

export default customFetch
