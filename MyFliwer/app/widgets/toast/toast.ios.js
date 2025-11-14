import Toast from 'react-native-simple-toast';

class ToastIOS {

  notification(text){
        Toast.show(text, Toast.LONG);
  }

  error(text){
        Toast.show(text, 8);
  }

}

export var toast = new ToastIOS();
