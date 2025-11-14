
class PermissionsAndroid {

	PERMISSIONS = {

	}

	RESULTS = {
		GRANTED:1
	}

	requestMultiple(){
		return new Promise((resolve,reject)=>{
			resolve({
				'android.permission.ACCESS_COARSE_LOCATION':1,
				'android.permission.ACCESS_FINE_LOCATION':1
			});
		})
	}


}
var permissionsAndroid = new PermissionsAndroid();

export {permissionsAndroid as PermissionsAndroid}
