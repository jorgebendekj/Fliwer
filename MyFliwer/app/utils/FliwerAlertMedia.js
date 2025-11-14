
import { dispatch } from 'redux';
import {store} from '../store'; //Import the store
import {get} from '../actions/languageActions.js'; //Import your actions

import {FliwerColors} from '../utils/FliwerColors'

import defaultIcon from '../assets/img/fliwer_icon1.png'
import alertFertilizer from '../assets/img/3_fert_white.png'
import alertHumidity from '../assets/img/3_hum_white.png'
import alertMaintenance from '../assets/img/3_mant_white.png'
import alertMeteo from '../assets/img/3_meteo_white.png'
import alertLight from '../assets/img/3_sun_white.png'
import alertTemperature from '../assets/img/3_temp_white.png'
import alertWater from '../assets/img/3_water_white.png'

import automaticIrrigation from '../assets/img/5_riego_auto.png'
import manualIrrigation from '../assets/img/5_riego_manual.png'

import alerConnection from '../assets/img/7_Alert-NoConection.png'
import alertPower from '../assets/img/7_Alert-FuenteAlimentacion.png'
import alertLeak from '../assets/img/7_Alert-FugaAgua.png'

import iconLight from '../assets/img/alert_light.png'
import iconTemp from '../assets/img/alert_temp.png'
import iconAirh from '../assets/img/alert_airh.png'
import iconSoilm from '../assets/img/alert_soilm.png'
import iconFert from '../assets/img/alert_fert.png'
import iconMaint from '../assets/img/alert_maint.png'
import iconMeteo from '../assets/img/alert_meteo.png'

var FliwerAlertMedia = {
  subCategoryToMedia(subtype){
    switch(subtype){
        case "alert_light":
          return {img:alertLight,filter:"light",color:FliwerColors.parameters.light,color2:FliwerColors.subparameters.light, titleCategory: store.dispatch(get('fliwerCard_light_plot_title')), title: store.dispatch(get('alertVC_title_lightAlert')) };
        case "advice_light":
          return {img:alertLight,filter:"light",color:FliwerColors.parameters.light,color2:FliwerColors.subparameters.light, titleCategory: store.dispatch(get('fliwerCard_light_plot_title')), title: store.dispatch(get('alertVC_title_lightAdvice')) };
        case "alert_temperature":
          return {img:alertTemperature,filter:"temp",color:FliwerColors.parameters.temp,color2:FliwerColors.subparameters.temp, titleCategory: store.dispatch(get('fliwerCard_temp_plot_title')), title: store.dispatch(get('alertVC_title_tempAlert')) };
        case "advice_temperature":
          return {img:alertTemperature,filter:"temp",color:FliwerColors.parameters.temp,color2:FliwerColors.subparameters.temp, titleCategory: store.dispatch(get('fliwerCard_temp_plot_title')), title: store.dispatch(get('alertVC_title_tempAdvice')) };
        case "alert_soil_moisture":
        case "alert_water":
          return {img:alertWater,filter:"soilm",color:FliwerColors.parameters.soilm,color2:FliwerColors.subparameters.soilm, titleCategory: store.dispatch(get('fliwerCard_water_plot_title')), title: store.dispatch(get('alertVC_title_soilmAlert')) };
        case "advice_soil_moisture":
          return {img:alertWater,filter:"soilm",color:FliwerColors.parameters.soilm,color2:FliwerColors.subparameters.soilm, titleCategory: store.dispatch(get('fliwerCard_water_plot_title')), title: store.dispatch(get('alertVC_title_soilmAdvice')) };
        case "alert_humidity":
          return {img:alertHumidity,filter:"airh",color:FliwerColors.parameters.airh,color2:FliwerColors.subparameters.airh, titleCategory: store.dispatch(get('fliwerCard_hum_plot_title')), title: store.dispatch(get('alertVC_title_humAlert')) };
        case "advice_humidity":
          return {img:alertHumidity,filter:"airh",color:FliwerColors.parameters.airh,color2:FliwerColors.subparameters.airh, titleCategory: store.dispatch(get('fliwerCard_hum_plot_title')), title: store.dispatch(get('alertVC_title_humAlert')) };
        case "alert_fertilizer":
        case "alert_EC":
          return {img:alertFertilizer,filter:"fert",color:FliwerColors.parameters.fert,color2:FliwerColors.subparameters.fert, titleCategory: store.dispatch(get('fliwerCard_fert_plot_title')), title: store.dispatch(get('alertVC_title_fertAlert')) };
        case "advice_fertilizer":
          return {img:alertFertilizer,filter:"fert",color:FliwerColors.parameters.fert,color2:FliwerColors.subparameters.fert, titleCategory: store.dispatch(get('fliwerCard_fert_plot_title')), title: store.dispatch(get('alertVC_title_fertAdvice')) };
        case "alert_meteo":
          return {img:alertMeteo,filter:"meteo",color:FliwerColors.parameters.meteo,color2:FliwerColors.subparameters.meteo, titleCategory: store.dispatch(get('alertVC_title_meteo')), title: store.dispatch(get('alertVC_title_meteoAlert')) };
        case "advice_meteo":
          return {img:alertMeteo,filter:"meteo",color:FliwerColors.parameters.meteo,color2:FliwerColors.subparameters.meteo, titleCategory: store.dispatch(get('alertVC_title_meteo')), title: store.dispatch(get('alertVC_title_meteoAdvice')) };
        case "alert_maintenance":
        case "alert_maintenance_sensor_hit":
        case "alert_maintenance_sensor_unplant":
        case "alert_battery":
        case "Alert_battery":
          return {img:alertMaintenance,filter:"maint",color:FliwerColors.parameters.mant,color2:FliwerColors.subparameters.mant, titleCategory: store.dispatch(get('alertVC_title_maintenance')), title: store.dispatch(get('alertVC_title_maintAlert')) };
        case "advice_battery":
        case "advice_maintenance":
          return {img:alertMaintenance,filter:"maint",color:FliwerColors.parameters.mant,color2:FliwerColors.subparameters.mant, titleCategory: store.dispatch(get('alertVC_title_maintenance')), title: store.dispatch(get('alertVC_title_maintAdvice')) };
        case "alert_maintenance_control_lost":
        case "alert_maintenance_link_lost":
        case "alert_maintenance_sensor_lost":
          return {img:alertPower,filter:"maint",color:FliwerColors.parameters.mant,color2:FliwerColors.subparameters.mant, titleCategory: store.dispatch(get('alertVC_title_maintenance')), title: store.dispatch(get('alertVC_title_maintAlert')) };
        case "alert_maintenance_sensor_dry":
        case "alert_maintenance_flow_leak":
        case "alert_maintenance_flow_less":
        case "alert_maintenance_flow_more":
        case "alert_maintenance_flow_no":
          return {img:alertLeak,filter:"maint",color:FliwerColors.parameters.mant,color2:FliwerColors.subparameters.mant, titleCategory: store.dispatch(get('alertVC_title_maintenance')), title: store.dispatch(get('alertVC_title_maintAlert')) };
        case "alert_maintenance_rssi_low":
        case "alert_maintenance_grps_low":
        case "alert_maintenance_gprs_low":
          return {img:alerConnection,filter:"maint",color:FliwerColors.parameters.mant,color2:FliwerColors.subparameters.mant, titleCategory: store.dispatch(get('alertVC_title_maintenance')), title: store.dispatch(get('alertVC_title_maintAlert')) };
        case "manual":
          return {img:manualIrrigation,type:"irrigationHistory", title: "Manual Irrigation",color:"#3f3f3f",automatic:false};
        case "automatic":
          return {img:automaticIrrigation,type:"irrigationHistory", title: "Fliwer Irrigation",color:FliwerColors.secondary.lightGreen,automatic:true};
        default:
          return {img:defaultIcon,filter:"light",color:FliwerColors.parameters.light,color2:FliwerColors.subparameters.light, titleCategory: "?????", title: "?????"};
    }
  },

  categoryToMedia(category){
    switch(category){
      case "light":
        return {icon:iconLight}
      case "temp":
        return {icon:iconTemp}
      case "airh":
        return {icon:iconAirh}
      case "soilm":
        return {icon:iconSoilm}
      case "fert":
        return {icon:iconFert}
      case "maint":
        return {icon:iconMaint}
      case "meteo":
        return {icon:iconMeteo}
      default:
        return {icon:iconLight}
    }
  }
}


export {FliwerAlertMedia};
