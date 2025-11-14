import React, { Component } from 'react';
import { View, StatusBar, Platform, Dimensions, Linking, Text, TextInput, BackHandler } from 'react-native';
import { Provider } from 'react-redux';
import { PortalProvider } from '@gorhom/portal'
import firebase from './utils/firebase/firebase';
import { Orientation } from './utils/orientation/orientation'
import { applyThemeToCSSVariables, FliwerColors } from './utils/FliwerColors'
//import InAppUpdate from './utils/InAppUpdate'
import Keychain from './utils/keychain/keychain';
//import {trackingTransparency} from './utils/trackingTransparency/trackingTransparency'
import { PersistGate } from 'redux-persist/integration/react';
import NetInfo from '@react-native-community/netinfo';


import Home from './components/home/Home' //Import the component file
import LoginStart from './components/login/start' //Import the component file
import LoginWelcome from './components/login/welcome' //Import the component file
import LoginPreregister from './components/login/preregister' //Import the component file
import LoginRegister from './components/login/register' //Import the component file
import LoginLogin from './components/login/login' //Import the component file
import LoginRemember from './components/login/loginRemember' //Import the component file
import LoginRecoveryPass from './components/login/recoveryPass' //Import the component file
import LoginNewPassword from './components/login/newPassword' //Import the component file
import GardenerHome from './components/gardener/home' //Import the component file
import Profile from './components/profile' //Import the component file
import Zone from './components/zones/zone' //Import the component file
import ZoneInfo from './components/zones/zoneInfo' //Import the component file
import Plants from './components/plants/plants'
import Devices from './components/devices/devices'
//import ComponentTransition from './components/componentTransition' //Import the component file
import RegisterDevice from './components/devices/registerDevice'
import ConnectLinkWifi from './components/devices/connectLinkWifi'
import ConnectLink3G from './components/devices/connectLink3G'
import ControlValves from './components/devices/controlValves'
//import AndroidBrowser from './components/androidBrowser'
import AcademyCourses from './components/fliwerAcademy/academyCourses'
import CoursePage from './components/fliwerAcademy/coursePage'
import CourseSettings from './components/fliwerAcademy/courseSettings'

import PlantCategoryManager from './components/plants/plantCategoryManager'
import PlantManager from './components/plants/plantManager'
import PlantInfo from './components/plants/plantInfo'
import History from './components/history/history'
import TaskManager from './components/tasks/taskManager'
import GardenerHomes from './components/gardener/gardenerHomes'
import GardenerHomesMap from './components/gardener/gardenerHomesMap'
import GardenerAdd from './components/gardener/gardenerAdd'
import ClientAdd from './components/gardener/gardenerAdd'
import ProviderAdd from './components/gardener/gardenerAdd'
import BusinessClients from './components/business/businessClients'
import BusinessProviders from './components/business/businessProviders'
//import TestPage from '../testPage'


//New Dual View System
import FliwerMainView from './components/MainView'
import FliwerAPP from './components/apps/fliwer/fliwerApp'
import WorksitesAPP from './components/apps/workSites/workSitesApp'
import ClientsAPP from './components/apps/clients/clientsApp'
import WorkersAPP from './components/apps/workers/workersApp'
import ProvidersAPP from './components/apps/providers/providersApp'
import ProductsAPP from './components/apps/products/productsApp'
import TicketsApp from './components/apps/tickets/ticketsApp'
import ProjectsApp from './components/apps/projects/projectsApp.js';
import AppStoreApp from './components/apps/appStore/appStoreApp.js';
import WorkOrderApp from './components/apps/workOrder/workOrderApp.js';
//


import { Router, Route, PublicRoute, PrivateRoute, Routes, BackButton, Redirect, withRouter } from './utils/router/router'
import _FrontLayer from './components/old_frontLayer'
import FrontLayer from './components/frontLayer'

import * as ActionsLanguage from './actions/languageActions.js'; //Import your actions
import * as ActionsSession from './actions/sessionActions.js'; //Import your actions
import * as ActionsPlants from './actions/fliwerPlantActions.js'; //Import your actions
import * as ActionsLocation from './actions/locationActions.js'; //Import your actions
import * as ActionsTheme from './actions/themeActions.js'; //Import your actions

// Integrated updates
import { NativeModules } from 'react-native';
import ClockIn from './components/apps/ClockIn/ClockIn.js';
import Tasks from './components/apps/Tasks/Tasks.js';
import OrdersApp from './components/apps/cart/OrdersApp.js';
import { persistor, store } from './store.js';
import { toast } from './widgets/toast/toast';
import FliwerLoading from './components/fliwerLoading.js';

const { InAppUpdate } = NativeModules;

// Notifications push
const CHANNEL_NOTIFICATIONS = {
  fliwer: {
    id: "fliwer1",
    name: "Fliwer channel 1",
    description: "Fliwer high importance"
  },
  fliwer2: {
    id: "fliwer2",
    name: "Fliwer channel 2",
    description: "Fliwer low importance"
  }
};

const getToken = () => {
  //s'ha de fer el getToken
  var fcmToken = "";
  if (!fcmToken) {
    fcmToken = firebase.messaging().getToken().then((fcmToken) => {
      console.log("getToken fcmToken", fcmToken);
      if (fcmToken) {
        ActionsSession.setDeviceToken(fcmToken)(store.dispatch, store.getState);
      }
    }, (err) => {
      console.log('fcmToken Error:', err)
    });
  }
};

const requestPermission = () =>
  firebase
    .messaging()
    .requestPermission()
    .then(() => {
      console.log("requestPermission getToken()");
      getToken();
    })
    .catch(error => {
      console.warn(`${error} permission rejected`);
    });


export const checkPermission = () => {
  const enabled = firebase.messaging().hasPermission().then((enabled) => {
    if (enabled) {
      getToken();
    } else {
      requestPermission();
    }
  }, (err) => {
    console.log('fcmToken Error:', err)
  });
};

/*const notificationListener = () =>
    firebase.notifications().onNotification(notification => {
        console.log("notificationListener notification", notification);
        const {
            notifications: {
                Android: {
                    Priority: {Max}
                }
            }
        } = firebase;
        notification.android.setChannelId(CHANNEL_NOTIFICATIONS.fliwer.id);
        notification.android.setPriority(Max);
        notification.setData(notification.data);
        firebase.notifications().displayNotification(notification);
    });*/

export const createChannels = () => {
  /*
    var channel = new firebase.notifications.Android.Channel(
            CHANNEL_NOTIFICATIONS.fliwer.id,
            CHANNEL_NOTIFICATIONS.fliwer.name,
            firebase.notifications.Android.Importance.High,
            ).setDescription(CHANNEL_NOTIFICATIONS.fliwer.description);
    firebase.notifications().android.createChannel(channel);

    channel = new firebase.notifications.Android.Channel(
            CHANNEL_NOTIFICATIONS.fliwer2.id,
            CHANNEL_NOTIFICATIONS.fliwer2.name,
            firebase.notifications.Android.Importance.Low,
            ).setDescription(CHANNEL_NOTIFICATIONS.fliwer.description);
    firebase.notifications().android.createChannel(channel);
    */
};
// End Notification push declaration

export const checkTrackingTransparency = () => {
  return new Promise(async function (resolve, reject) {
    //        if (Platform.OS === 'ios')
    //            await trackingTransparency.requestTrackingPermission();
    resolve();
  });

};

class AppIn extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirectFilter: null,
      redirectZone: null,
      linkingEventListener: null,
      backAgtionEventListener: null
    };

    console.disableYellowBox = true;
  }

  openNotificationCallback(data) {
    console.log("openNotificationCallback data", data);
    console.log("openNotificationCallback this.props", this.props);
    if (data.idAlert) {
      //firebase.notifications().removeDeliveredNotification(data.notificationId);
      ActionsSession.removeUserNotification(data.notificationId)();
      this.props.history.push("/zone/" + data.idZone + "/filter/" + data.filter)
    }
  }

  notificationOpenBackListener() {
    /*
      firebase.notifications().getInitialNotification().then((notificationOpen) => {
          console.log("notificationOpenBackListener", notificationOpen);
          if (notificationOpen) {
              this.openNotificationCallback(Object.assign({notificationId: notificationOpen.notification.notificationId}, notificationOpen.notification.data));
              // Agregar el codigo que se considere necesario
          }
      }, (err) => {
          console.log('fcmToken Error:', err)
      });
    */
  }

  notificationOpenedListener() {
    /*
      firebase.notifications().onNotificationOpened(notificationOpen => {
          console.log("notificationOpenedListener", notificationOpen);
          this.openNotificationCallback(Object.assign({notificationId: notificationOpen.notification.notificationId}, notificationOpen.notification.data));
          // Agregar el codigo que se considere necesario
      });
    */
  }

  componentDidMount() {
    checkTrackingTransparency().then(() => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        checkPermission();
        createChannels();
        //notificationListener();
        this.notificationOpenedListener();
        this.notificationOpenBackListener();

        Linking.getInitialURL().then((url) => {
          if (url) {
            this._handleOpenURL(url)
          }
        }).catch(err => console.error('An error occurred', err));
        this.state.linkingEventListener = Linking.addEventListener('url', (ev) => {
          this._handleOpenURL(ev.url)
        });
      }

      if (Platform.OS === 'android') {
        this.state.backAgtionEventListener = BackHandler.addEventListener("hardwareBackPress", () => {
          this.props.router.navigate(-1);
          return true;
        });
        //InAppUpdate.checkUpdate();
      }
    });
  }

  _handleOpenURL(url) {
    //this.props.history.push("/" + url.split("wer.com/#/")[1])
  }

  componentWillUnmount() {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      /*
      firebase.notifications().onNotificationOpened();
      firebase.notifications().onNotification();
      */
      this.notificationOpenBackListener();
      if (this.state.linkingEventListener) this.state.linkingEventListener.remove();
      if (this.state.backAgtionEventListener) this.state.backAgtionEventListener.remove();
    }
  }

  //<Route exact path='/androidBrowser' element={<AndroidBrowser/>} style={{height: "100%"}}/>

  /*
    <Route exact path='/test' element={<PublicRoute/>}>
      <Route exact path='/test' element={<TestPage/>} style={{height: "100%"}}/>
    </Route>
  */

  render() {
    return (
      <View style={{ height: "100%" }}>
        <StatusBar backgroundColor={FliwerColors.primary.green} barStyle="dark-content" />
        {Platform.OS === 'ios' ? <View style={{ width: "100%", height: 45, backgroundColor: FliwerColors.primary.green }}></View> : null}
        <FliwerMainView key={"FliwerMainView1"} currentPath='/app/clockIn' />
        <Routes style={{ height: "100%" }}>
          <Route exact path='/' element={<LoginLogin />} style={{ height: "100%" }} />
          <Route exact path='/start' element={<PublicRoute />}>
            <Route exact path='/start' element={<LoginStart />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/welcome' element={<PublicRoute />}>
            <Route exact path='/welcome' element={<LoginWelcome />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/welcome/:petition/:country/:lang/:hash' element={<PublicRoute />}>
            <Route exact path='/welcome/:petition/:country/:lang/:hash' element={<LoginWelcome />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/welcome/:petition/:hash' element={<PublicRoute />}>
            <Route exact path='/welcome/:petition/:hash' element={<LoginWelcome />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/preregister' element={<PublicRoute />}>
            <Route exact path='/preregister' element={<LoginPreregister />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/register' element={<PublicRoute />}>
            <Route exact path='/register' element={<LoginRegister />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/register/:petition/:hash' element={<PublicRoute />}>
            <Route exact path='/register/:petition/:hash' element={<LoginRegister />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/register/:petition/:hash/:email' element={<PublicRoute />}>
            <Route exact path='/register/:petition/:hash/:email' element={<LoginRegister />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/register/:petition/:country/:lang/:hash' element={<PublicRoute />}>
            <Route exact path='/register/:petition/:country/:lang/:hash' element={<LoginRegister />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/loginUser' element={<PublicRoute />}>
            <Route exact path='/loginUser' element={<LoginRemember />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/login' element={<PublicRoute />}>
            <Route exact path='/login' element={<LoginLogin />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/login/:email/:country/:lang' element={<PublicRoute />}>
            <Route exact path='/login/:email/:country/:lang' element={<LoginLogin />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/confirm/:idUser/:hash' element={<PublicRoute />}>
            <Route ecact path='/confirm/:idUser/:hash' element={<LoginLogin />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/recoveryPass' element={<PublicRoute />}>
            <Route exact path='/recoveryPass' element={<LoginRecoveryPass />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/newPassword/:lang/:hash' element={<PublicRoute />}>
            <Route exact path='/newPassword/:lang/:hash' element={<LoginNewPassword />} style={{ height: "100%" }} />
          </Route>



          <Route exact path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} style={{ height: "100%" }} />
          </Route>


          <Route exact path='app/clients/create' element={<PrivateRoute />}>
            <Route path='app/clients/create' element={<ClientsAPP currentPath='app/clients/create' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/clients' element={<PrivateRoute />}>
            <Route path='/app/clients' element={<ClientsAPP currentPath='/app/clients' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/clients/details/:idWorker' element={<PrivateRoute />}>
            <Route path='/app/clients/details/:idWorker' element={<ClientsAPP currentPath='/app/clients/details/:idWorker' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='app/workers/create' element={<PrivateRoute />}>
            <Route path='app/workers/create' element={<WorkersAPP currentPath='app/workers/create' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workers' element={<PrivateRoute />}>
            <Route path='/app/workers' element={<WorkersAPP currentPath='/app/workers' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workers/details/:idWorker' element={<PrivateRoute />}>
            <Route path='/app/workers/details/:idWorker' element={<WorkersAPP currentPath='/app/workers/details/:idWorker' />} style={{ height: "100%" }} />
          </Route>
          
          <Route exact path='/app/providers' element={<PrivateRoute />}>
            <Route path='/app/providers' element={<ProvidersAPP currentPath='/app/providers' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/products' element={<PrivateRoute />}>
            <Route path='/app/products' element={<ProductsAPP currentPath='/app/products' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/products/details/:idProduct' element={<PrivateRoute />}>
            <Route path='/app/products/details/:idProduct' element={<ProductsAPP currentPath='/app/products/details/:idProduct' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/tickets' element={<PrivateRoute />}>
            <Route path='/app/tickets' element={<TicketsApp currentPath='/app/tickets' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/projects' element={<PrivateRoute />}>
            <Route path='/app/projects' element={<ProjectsApp currentPath='/app/projects' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/appStore' element={<PrivateRoute />}>
            <Route path='/app/appStore' element={<AppStoreApp currentPath='/app/appStore' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='/app/clockIn' element={<PrivateRoute />}>
            <Route path='/app/clockIn' element={<ClockIn currentPath='/app/clockIn' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/clockIn/details/:idClockIn' element={<PrivateRoute />}>
            <Route path='/app/clockIn/details/:idClockIn' element={<ClockIn currentPath='/app/clockIn/details/:idClockIn' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='/app/tasks' element={<PrivateRoute />}>
            <Route path='/app/tasks' element={<Tasks currentPath='/app/tasks' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/tasks/details/:idTask' element={<PrivateRoute />}>
            <Route path='/app/tasks/details/:idTask' element={<Tasks currentPath='/app/tasks/details/:idTask' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='/app/order' element={<PrivateRoute />}>
            <Route path='/app/order' element={<OrdersApp currentPath='/app/order' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='/app/order/products/:idOrder' element={<PrivateRoute />}>
            <Route path='/app/order/products/:idOrder' element={<OrdersApp currentPath='/app/order/products/:idOrder' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='/app/workOrder' element={<PrivateRoute />}>
            <Route path='/app/workOrder' element={<WorkOrderApp currentPath='/app/workOrder' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/in/:idCourse' element={<PrivateRoute />}>
            <Route path='/app/workOrder/in/:idCourse' element={<WorkOrderApp currentPath='/app/workOrder/in/:idCourse' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/templates' element={<PrivateRoute />}>
            <Route path='/app/workOrder/templates' element={<WorkOrderApp currentPath='/app/workOrder/templates' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/templates/new' element={<PrivateRoute />}>
            <Route path='/app/workOrder/templates/new' element={<WorkOrderApp currentPath='/app/workOrder/templates/new' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/templates/:idCourse' element={<PrivateRoute />}>
            <Route path='/app/workOrder/templates/:idCourse' element={<WorkOrderApp currentPath='/app/workOrder/templates/:idCourse' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/templates/:idCourse/pages' element={<PrivateRoute />}>
            <Route path='/app/workOrder/templates/:idCourse/pages' element={<WorkOrderApp currentPath='/app/workOrder/templates/:idCourse/pages' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/assignTemplate' element={<PrivateRoute />}>
            <Route path='/app/workOrder/assignTemplate' element={<WorkOrderApp currentPath='/app/workOrder/assignTemplate' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/assignTemplate/:idCourse/pages' element={<PrivateRoute />}>
            <Route path='/app/workOrder/assignTemplate/:idCourse/pages' element={<WorkOrderApp currentPath='/app/workOrder/assignTemplate/:idCourse/pages' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/assignTemplate/templates/:idCourse/pages' element={<PrivateRoute />}>
            <Route path='/app/workOrder/assignTemplate/templates/:idCourse/pages' element={<WorkOrderApp currentPath='/app/workOrder/assignTemplate/templates/:idCourse/pages' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/workOrder/assignTemplate/templates/new' element={<PrivateRoute />}>
            <Route path='/app/workOrder/assignTemplate/templates/new' element={<WorkOrderApp currentPath='/app/workOrder/assignTemplate/templates/new' />} style={{ height: "100%" }} />
          </Route>

          
          <Route exact path='/app/workSites' element={<PrivateRoute />}>
            <Route path='/app/workSites' element={<WorksitesAPP currentPath='/app/workSites' />} style={{ height: "100%" }} />
          </Route>

          <Route exact path='/app/fliwer' element={<PrivateRoute />}>
            <Route path='/app/fliwer' element={<FliwerAPP currentPath='/app/fliwer' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/fliwer/zone/:idZone' element={<PrivateRoute />}>
            <Route path='/app/fliwer/zone/:idZone' element={<FliwerAPP currentPath='/app/fliwer/zone/:idZone' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/fliwer/zone/:idZone/:filter' element={<PrivateRoute />}>
            <Route path='/app/fliwer/zone/:idZone/:filter' element={<FliwerAPP currentPath='/app/fliwer/zone/:idZone/:filter' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/fliwer/zone/:idZone/:filter/:timestamp' element={<PrivateRoute />}>
            <Route path='/app/fliwer/zone/:idZone/:filter/:timestamp' element={<FliwerAPP currentPath='/app/fliwer/zone/:idZone/:filter/:timestamp' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/fliwer/devices/:idZone' element={<PrivateRoute />}>
            <Route path='/app/fliwer/devices/:idZone' element={<FliwerAPP currentPath='/app/fliwer/devices/:idZone' />} style={{ height: "100%" }} />
          </Route>
          <Route exact path='/app/fliwer/devices/:idZone/:idDevice/valves' element={<PrivateRoute />}>
            <Route path='/app/fliwer/devices/:idZone/:idDevice/valves' element={<FliwerAPP currentPath='/app/fliwer/devices/:idZone/:idDevice/valves' />} style={{ height: "100%" }} />
          </Route>

          {this.renderRedirects()}
        </Routes>
      </View>
    );
  }

  renderRedirects() {
    /*
     var indents=[];
     if(this.state.redirectFilter){
     indents.push(<Redirect push to={"/zone/"+this.state.redirectZone+"/filter/"+this.state.redirectFilter} />)
     //this.setState({redirectFilter:null,redirectZone:null})
     }
     return indents;
     */
  }
}

var AppInRouter = withRouter(AppIn);


export default class App extends Component {

  constructor(props) {
    super(props);

    ActionsTheme.loadTheme()(store.dispatch);

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      let { width, height } = Dimensions.get('window')
      if (width < 500 || height < 500)
        ActionsSession.defaultLockToPortrait()(store.dispatch, store.getState);
    }
    Orientation.unlockAllOrientations();
    ActionsLanguage.loadStorageTranslation()(store.dispatch);
    ActionsLocation.loadStorageCountries()(store.dispatch);
    ActionsSession.loadReloginData()(store.dispatch, store.getState).then(() => {
      if (Platform.OS != "web" && (!store.getState().sessionReducer.reloginData || !store.getState().sessionReducer.reloginData.relogin)) {
        Keychain.getGenericPassword().then((credentials) => {

          if (credentials && credentials.username) {
            NetInfo.fetch().then((state) => {
              const isOffline = !state.isConnected;

              if (isOffline && (Platform.OS === 'android' || Platform.OS === 'ios')) {
                ActionsSession.loginOffline()(store.dispatch, store.getState).then(() => {
                  console.log('✅ Acceso offline permitido');
                  //toast.notification("login loginOffline correcto")
                }).catch(() => {
                  console.log('🚫 Acceso offline denegado');
                  //toast.error("entra al catch de loginOffline")
                  ActionsSession.login("", "")(store.dispatch, store.getState).then(() => { }, () => { });
                });
              } else {
                console.log('Password credentials successfully loaded for user ' + credentials.username);
                ActionsSession.login(credentials.username, credentials.password)(store.dispatch, store.getState).then(() => { }, () => { });
              }
            });
          } else {
            // toast.error("no encuentra credenciales")
            ActionsSession.login("", "")(store.dispatch, store.getState).then(() => { }, () => { });
          }

        });
      } else ActionsSession.login("", "")(store.dispatch, store.getState).then(() => { }, () => { });

    });

    // Disable font scaling
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
  }

  componentDidMount() {
    // Integrated updates ANDROID
    if (Platform.OS === 'android') {
      InAppUpdate.checkAndUpdate()
        .then((result) => {
          console.log('¿Actualización lanzada?', result);
        })
        .catch((err) => {
          console.warn('Error al chequear actualizaciones', err);
        });
    }

    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const { offline, logedIn } = store.getState().sessionReducer;

      if (offline && state.isConnected && logedIn) {
        console.log('🔁 Reconexión detectada, iniciando login online');

        const credentialsPromise = Keychain.getGenericPassword();
        if (credentialsPromise) {
          credentialsPromise.then(credentials => {
            if (credentials && credentials.username) {
              ActionsSession.login(credentials.username, credentials.password)(
                store.dispatch,
                store.getState
              ).then(() => {
                console.log('✅ Sesión reactivada online');
              }, () => {
                console.warn('🚫 Falló el login online tras reconexión');
              });
            }
          });
        }
      }
    });

    this.setState({
      appLoading: true
    })
  }

  componentWillUnmount() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={<FliwerLoading />} persistor={persistor}>
          {
            this.state?.appLoading
              ?
              <PortalProvider>
                <Router>
                  <BackButton style={{ height: "100%" }}>
                    {this.renderAppIn()}
                  </BackButton>
                </Router>
                <_FrontLayer key={"FrontLayer1"} />
                <FrontLayer key={"FrontLayer2"} />
              </PortalProvider>
              :
              <FliwerLoading />
          }

        </PersistGate>
      </Provider>
    );
  }

  renderAppIn() {
    //        if (false && Platform.OS !== 'android' && /Android/i.test(navigator.userAgent)) {//only for android web Browser
    //            return (<AndroidBrowser />)
    //        } else {
    return (<AppInRouter />)
    //        }
  }
}
