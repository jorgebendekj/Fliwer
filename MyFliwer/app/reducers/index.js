import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import sessionReducer from './sessionReducer.js';
import languageReducer from './languageReducer.js';
import locationReducer from './locationReducer.js';
import fliwerHomeReducer from './fliwerHomeReducer.js';
import fliwerGardenReducer from './fliwerGardenReducer.js';
import fliwerZoneReducer from './fliwerZoneReducer.js';
import fliwerPlantReducer from './fliwerPlantReducer.js';
import transitionReducer from './transitionReducer.js';
import historyReducer from './historyReducer.js';
import createZoneReducer from './createZoneReducer.js';
import fliwerDeviceReducer from './fliwerDeviceReducer.js';
import modifyZoneReducer from './modifyZoneReducer.js';
import gardenerReducer from './gardenerReducer.js';
import initialReducer from './initialReducer.js';
import createHomeReducer from './createHomeReducer.js';
import academyReducer from './academyReducer.js';
import visitorReducer from './visitorReducer.js';
import invoiceReducer from './invoiceReducer.js';
import agendaCalendarReducer from './agendaCalendarReducer.js';
import backgroundUploadingReducer from './backgroundUploadingReducer.js';

import themeReducer from './themeReducer.js';
import wrapperReducer from './wrapperReducer.js';
import clockInReducer from './clockInReducer.js';

//slices
import offlineAccessReducer from './offlineAccessSlice';
import userOfflineReducer from './userOfflineSlice';
import orderReducer from './orderSlice';
import productsReducer from './productsSlice'; // Ajustá la ruta

const offlineAccessPersistConfig = {
  key: 'offlineAccess',
  storage: AsyncStorage,
  whitelist: ['userId', 'userName', 'allowedModules', 'lastSync']
};

const persistedOfflineAccessReducer = persistReducer(
  offlineAccessPersistConfig,
  offlineAccessReducer
);

const sessionPersistConfig = {
  key: 'session',
  storage: AsyncStorage,
  whitelist: ['data', 'logedIn', 'offline', 'roles', 'reloginData']
};

const persistedSessionReducer = persistReducer(sessionPersistConfig, sessionReducer);

const userOfflinePersistConfig = {
  key: 'userOffline',
  storage: AsyncStorage,
  whitelist: ['data']
};

const persistedUserOfflineReducer = persistReducer(
  userOfflinePersistConfig,
  userOfflineReducer
);

const languagePersistConfig = {
  key: 'language',
  storage: AsyncStorage,
  whitelist: [
    'translation',
    'translationDefault',
    'languages',
    'lastUpdate',
    'language',
    'country',
    'languageHasChangeManually',
    'initialized',
    'cookiesPolicyAccepted'
  ]
};

const persistedLanguageReducer = persistReducer(languagePersistConfig, languageReducer);

const orderPersistConfig = {
  key: 'orders',
  storage: AsyncStorage,
  whitelist: ['orders', 'currentOrderId']
};

const persistedOrderReducer = persistReducer(orderPersistConfig, orderReducer);

const productsPersistConfig = {
  key: 'products',
  storage: AsyncStorage,
  whitelist: ['products']
};

const persistedProductsReducer = persistReducer(productsPersistConfig, productsReducer);

// Root Reducer
const rootReducer = combineReducers({
  sessionReducer: persistedSessionReducer,
  languageReducer: persistedLanguageReducer,
  locationReducer: locationReducer,
  transitionReducer: transitionReducer,
  /* Fliwer explicit reducers */
  fliwerHomeReducer: fliwerHomeReducer,
  fliwerGardenReducer: fliwerGardenReducer,
  fliwerZoneReducer: fliwerZoneReducer,
  fliwerPlantReducer: fliwerPlantReducer,
  fliwerDeviceReducer: fliwerDeviceReducer,
  historyReducer: historyReducer,
  gardenerReducer: gardenerReducer,
  initialReducer: initialReducer,
  createHomeReducer: createHomeReducer,
  academyReducer: academyReducer,
  visitorReducer: visitorReducer,
  invoiceReducer: invoiceReducer,
  agendaCalendarReducer: agendaCalendarReducer,
  /* create structure reducers */
  createZoneReducer: createZoneReducer,
  modifyZoneReducer: modifyZoneReducer,
  backgroundUploadingReducer: backgroundUploadingReducer,
  theme: themeReducer,
  wrapperReducer: wrapperReducer,
  clockInReducer: clockInReducer,
  /* slices reducers */
  offlineAccess: persistedOfflineAccessReducer,
  userOffline: persistedUserOfflineReducer,
  orders: persistedOrderReducer,
  products: persistedProductsReducer,
});

export default rootReducer;
