
import {store} from '../store'; //Import the store

const CurrentTheme = {  
  get type() {
    return store.getState().theme.type;
  },
  get primaryColor() {
    return store.getState().theme.primaryColor;
  },
  get primaryText() {
    return store.getState().theme.primaryText;
  },
  get secondaryColor() {
    return store.getState().theme.secondaryColor;
  },
  get secondaryText() {
    return store.getState().theme.secondaryText;
  },
  get complementaryColor() {
    return store.getState().theme.complementaryColor;
  },
  get complementaryText() {
    return store.getState().theme.complementaryText;
  },
  get complementaryBackgroundText() {
    return store.getState().theme.complementaryBackgroundText;
  },
  get cardColor() {
    return store.getState().theme.cardColor;
  },
  get componentCardColor() {
    return store.getState().theme.componentCardColor;
  },
  get componentTextCardColor() {
    return store.getState().theme.componentTextCardColor;
  },
  get darkerCardColor() {
    return store.getState().theme.darkerCardColor;
  },
  get lighterCardColor() {
    return store.getState().theme.lighterCardColor;
  },
  get complementaryCardColor() {
    return store.getState().theme.complementaryCardColor;
  },
  get cardText() {
    return store.getState().theme.cardText;
  },
  get acceptColor() {
    return store.getState().theme.acceptColor;
  },
  get acceptText() {
    return store.getState().theme.acceptText;
  },
  get cancelColor() {
    return store.getState().theme.cancelColor;
  },
  get cancelText() {
    return store.getState().theme.cancelText;
  },
  get topBar() {
    return store.getState().theme.topBar;
  },
  get mainMenu() {
    return store.getState().theme.mainMenu;
  },
  get primaryView() {
    return store.getState().theme.primaryView;
  },
  get secondaryView() {
    return store.getState().theme.secondaryView;
  },
  get filterMenu() {
    return store.getState().theme.filterMenu;
  },
  get selectedColor() {
    return store.getState().theme.selectedColor;
  },
}


import fliwerIcon  from '../assets/img/fliwer_icon_new.png'
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFeather from 'react-native-vector-icons/Feather';

var apps= {
  fliwer:{
    icon:fliwerIcon,
    iconProvider:null,
    name:'Fliwer',
    redirect:'/app/fliwer',
    size:30
  },
  tickets:{
    icon:'ticket-confirmation',
    iconProvider:IconMaterialCommunityIcons,
    name:'Tickets',
    redirect:'/app/tickets',
  },
  projects:{
    icon:'archive',
    iconProvider:IconEntypo,
    name:'Projects',
    redirect:'/app/projects'
  },
  tasks:{
    icon:'calendar',
    iconProvider:IconMaterialCommunityIcons,
    name:'Tasks',
    redirect:'/app/tasks',
  },
  clients:{
    icon:'users',
    iconProvider:IconFontAwesome,
    name:'Clients',
    redirect:'/app/clients',
  },
  workers:{
    icon:'account-hard-hat',
    iconProvider:IconMaterialCommunityIcons,
    name:'Workers',
    redirect:'/app/workers',
    size:30
  },
  providers:{
    icon:'account-tie',
    iconProvider:IconMaterialCommunityIcons,
    name:'Providers',
    redirect:'/app/providers',
    size:30
  },
  workSites:{
    icon:'location',
    iconProvider: IconEntypo,
    name:'Work sites',
    redirect:'/app/workSites',
  },
  clockIn:{
    icon:'clock-time-four',
    iconProvider:IconMaterialCommunityIcons,
    name:'Clock In',
    redirect:'/app/clockIn',
  },
  workOrder:{
    icon:'list',
    iconProvider:IconEntypo,
    name:'Work Order',
    redirect:'/app/workOrder'
  },
  products:{
    icon:'package',
    iconProvider:IconFeather,
    name:'Products',
    redirect:'/app/products',
    size:30
  },
  crm:{
    icon:'account-arrow-left',
    iconProvider:IconMaterialCommunityIcons,
    name:'CRM',
    redirect:'/app/crm',
    size:30
  },
  contracts:{
    icon:'file-document-edit',
    iconProvider:IconMaterialCommunityIcons,
    name:'Contracts',
    redirect:'/app/contracts',
    size:30
  },
  quotes:{
    icon:'file-cog',
    iconProvider:IconMaterialCommunityIcons,
    name:'Quotes',
    redirect:'/app/quotes',
    size:30
  },
  invoices:{
    icon:'file-compare',
    iconProvider:IconMaterialCommunityIcons,
    name:'Invoices',
    redirect:'/app/invoices',
    size:30
  },
  newOrder:{
    icon:'cart-plus',
    iconProvider:IconFontAwesome,
    name:'Order',
    redirect:'/app/order',
    size:30
  }
}

const MenuTheme = {
  getApp:(name)=>{
    var userApps=[...store.getState().sessionReducer.apps]; //array with app names
    //find app by name and assign to apps[name]
    var app = userApps.find((app)=>app.app==name);
    return Object.assign(apps[name],app);
  },
    get apps() {
    const state = store.getState();
    const isOffline = state.sessionReducer.offline;

    if (isOffline) {
      const offlineModules = state.offlineAccess.allowedModules || [];
      return offlineModules
        .map((name) => {
          const base = apps[name];
          if (!base) return null;
          return Object.assign({}, base, { app: name, access: true });
        })
        .filter(Boolean); // quita nulls
    }

    const userApps = [...(state.sessionReducer.apps || [])];
    return userApps
      .filter((app) => app.access )
      .map((app) => Object.assign({}, apps[app.app], app));
  },
  get allApps(){
    var userApps=[...store.getState().sessionReducer.apps]; //array with app names
    return userApps.map((app)=>{return Object.assign(apps[app.app],app)})
  }
}

const FliwerColors = {
  primary:{
    green: 'rgb(208, 223, 0)',
    black:'#4A4A49',
    gray:'#969696'
  },
  secondary:{
    green:  '#89A100',
    black:'#2B2B2B',
    gray:'#DDDDDD',
    white:'#FFFFFF',
    red:'#FF5D5D',
    lightGreen:'#F0FCAD',
  },
  complementary:{
    yellow:'#FEC229',
    red:'#F3744F',
    purple:'#6B3E98',
    skyblue:'#70D0F6',
    blue:'#3882C4',
    darkblue:'#2D4EA2',
    //gold:'#FFD700',
    gold:'#d5a82e'
  },
  parameters:{
    light:'#FEC229',
    temp:'#FF5D5D',
    airh:'#70D0F6',
    soilm:'#3882C4',
    meteo:'#2D4EA2',
    fert:'#723c9c',
    mant:'#F3744F',
    pluviometer: '#5DADE2',
    anemometer: '#2ECC71'
  },
  subparameters:{
    light:'#f39f00',
    temp:'#fe001c',
    airh:'#01a6ea',
    soilm:'#015bb1',
    soilm2:'#00a8ff',
    soilm3:'#003af5',
    fert:'#5d1497',
    meteo:'#002685',
    mant:'#d94c21',
    pluviometer: '#2E86C1',
    anemometer: '#1D8348'
  },
  business:{
    employees:"rgba(255, 115, 115,1)",
    clients:"rgba(191, 205, 92,1)",
    providers:"rgba(230, 189, 29,1)",
    products:"rgba(94, 112, 255,1)"
  },
  location: {
      default: '#3882C4'
  },
  hexToRgb:(hex, alpha)=>{
     hex   = hex.replace('#', '');
     var r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
     var g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
     var b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
     if ( alpha ) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
     }
     else {
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
     }
  },
  fonts:{
    superTitle:"Montserrat-Bold",
    title:"Montserrat-Medium",//"ManifoldExtendedCF-ExtraBold",
    regular:"Montserrat-Regular",//"ManifoldExtendedCF-Regular",
    light:"Montserrat-Thin"//"ManifoldExtendedCF-Thin"
  },
  printNumberContable:(number)=>{
    //prints a number in a contable format, (1.000.000,00)
    var numberString = number.toString();
    var isNegative = number < 0;
    if (isNegative) {
      numberString = numberString.slice(1);
    }
    //if doesn't have decimals, add .00
    if (numberString.indexOf('.') == -1) {
      numberString += '.00';
    }
    //replace . with ,
    numberString = numberString.replace(/\./g, ',');
    //add . every 3 digits until , is found or end
    var index = numberString.indexOf(',');
    var i = index - 3;
    while (i > 0) {
      numberString = numberString.slice(0, i) + '.' + numberString.slice(i);
      i -= 3;
    }
    if (isNegative) {
      numberString = '-' + numberString;
    }
    return numberString;
  }


}

export const applyThemeToCSSVariables = () => {
  const root = document.documentElement;
  const theme = store.getState().theme;

  root.style.setProperty('--primary-color', theme.primaryColor);
  root.style.setProperty('--primary-text', theme.primaryText);
  root.style.setProperty('--secondary-color', theme.secondaryColor);
  root.style.setProperty('--secondary-text', theme.secondaryText);
  root.style.setProperty('--card-color', theme.cardColor);
  root.style.setProperty('--component-card-color', theme.componentCardColor);
  root.style.setProperty('--component-text-card-color', theme.componentTextCardColor);
  root.style.setProperty('--darker-card-color', theme.darkerCardColor);
  root.style.setProperty('--lighter-card-color', theme.lighterCardColor);
  root.style.setProperty('--complementary-card-color', theme.complementaryCardColor);
  root.style.setProperty('--card-text', theme.cardText);
  root.style.setProperty('--accept-color', theme.acceptColor);
  root.style.setProperty('--accept-text', theme.acceptText);
  root.style.setProperty('--cancel-color', theme.cancelColor);
  root.style.setProperty('--cancel-text', theme.cancelText);
  // Agregá más si querés
};

export {FliwerColors,CurrentTheme,MenuTheme};
