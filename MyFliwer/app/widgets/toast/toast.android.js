import { ToastAndroid } from 'react-native';

/**
 * Class that offers uniqueStorage for android.
 */
class Toast {

  notification(text){
    if(text)
    ToastAndroid.show(text,ToastAndroid.LONG);
  }

  error(text){
    if(text)
    ToastAndroid.show(text,ToastAndroid.LONG);
  }

}

export var
	toast = new Toast();
