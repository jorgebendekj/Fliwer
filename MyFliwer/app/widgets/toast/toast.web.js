class Toast {

  notification(text){
  	window.$.notify({message: text},{
  		// settings
  		element: 'body',
  		type: "success",
  		allow_dismiss: true,
  		placement: {
  			from: "top",
  			align: "right"
  		},
  		offset: {
  			y:70,
  			x:0
  		},
  		delay: 3000,
  		timer: 100,
  		animate: {
  			enter: 'animated fadeInRight',
  			exit: 'animated fadeOutRight'
  		}
  	});
  }

  error(text){
  	window.$.notify({message: text},{
  		// settings
  		element: 'body',
  		type: "danger",
  		allow_dismiss: true,
  		placement: {
  			from: "bottom",
  			align: "center"
  		},
  		offset: {
  			y:20
  		},
  		delay: 5000,
  		timer: 100,
  		animate: {
  			enter: 'animated fadeInUp',
  			exit: 'animated fadeOutDown'
  		}
  	});
  }


}

export var toast = new Toast();
