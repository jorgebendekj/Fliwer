var { StyleSheet, Dimensions, Platform} = require('react-native');
import {store} from '../store'; //Import the store
import {CurrentTheme} from './FliwerColors';
// Importa los hooks de React que vamos a necesitar
import { useEffect, useState, useMemo, useCallback } from 'react';

/*
  Syntax example:

  inside component: this.style


  var style={
    title:{
      color:"red",
    },
    "@media (width<=1000 && height<=600) || (orientation:landscape)":{
      title:{
        color:"blue"
      },
      "@media (orientation:portrait)":{
        title:{
          color:"green"
        }
      }
    },
    ":hover":{

    }
  }
  export default mediaConnect(style,Component);



*/

function getOritentation(w,h){
  if(parseInt(w)>parseInt(h) && (h>550 || store.getState().sessionReducer.lockLandscape ))return "landscape";
  else return "portrait";
}

function getAscpectRatio(w,h){
  return parseInt(w)/parseInt(h);
}

function isMediaQuery(s){
  return s=s.split("@media")[1]?true:false;
}

function parseMediaQuery(s){
  // @media (width>=700 && height<=600) || (orientation:landscape)
  s=s.split("@media")[1];
  if(s){
    s=s.replace(/landscape/g,'"landscape"').replace(/portrait/g,'"portrait"').replace(/android/g,'"android"').replace(/web/g,'"web"').replace(/:/g,'==');
    return s.trim();
  }else return null;

}

var activatedebugger=0

function evaluateThemeProperties(style) {
  for (var key in style) {
    if (typeof style[key] === 'string' && style[key].startsWith('@theme ')) {
      var themeProperty = style[key].split(' ')[1];
      style[key] = CurrentTheme[themeProperty];
    } else if (typeof style[key] === 'object') {
      evaluateThemeProperties(style[key]);
    }
  }
}

function generateFinalStyle(mediaStyle,width,height,orientation,aspectRatio,platform,style){
  if(!style)style={original:{},hover:{}};
  if(!style.original)style.original={};
  if(!style.hover)style.hover={};
  for(var index in mediaStyle) {
    if(index==":hover"){
      if(Platform.OS==='web'){//hover
        style.hover=Object.assign(style.hover?style.hover:{},generateFinalStyle(mediaStyle[index],width,height,orientation,aspectRatio,platform,Object.assign({},style.hover)).original);
      }
    }else if(isMediaQuery(index)){
      var condition = Function("width","height","orientation","aspectRatio","platform","return "+parseMediaQuery(index));
      if(condition(width,height,orientation,aspectRatio,platform)){
        style.original=Object.assign(style.original?style.original:{},generateFinalStyle(mediaStyle[index],width,height,orientation,aspectRatio,platform,style).original);
      }
    }else {
      style.original[index] = Object.assign(style.original[index] ? style.original[index] : {}, mediaStyle[index]);
      evaluateThemeProperties(style.original[index]);
    }

  }
  return style;
}

var mediaConnect= function(mediaStyle,Component){

  return function(props,context){
    var component;
    
    function handler(dims){
      var width=parseInt(dims.window.width);
      var height=parseInt(dims.window.height);
      if(!height){
        if(window && window.screen && window.screen.height)height=window.screen.height;
        else height=200;
        console.log("Warn: no height detected");
      }
      if(!width){
        if(window && window.screen && window.screen.width)width=window.screen.height;
        else width=200;
        console.log("Warn: no width detected");
      }
      var orientation=getOritentation(width,height);
      var ar=getAscpectRatio(width,height);
      var style=generateFinalStyle(mediaStyle,width,height,orientation,ar,Platform.OS);
      component.hoverStyle=style.hover;
      component.originalStyle=style.original;
      component.style=Object.assign({},component.originalStyle);
      component.state.mediaStyle={width:width,height:height,orientation:orientation,aspectRatio:ar,platform:Platform.OS};
      component.forceUpdate()
    }

    function themeHandler(){
      var width=parseInt(Dimensions.get('window').width);
      var height=parseInt(Dimensions.get('window').height);
      if(!height){
        if(window && window.screen && window.screen.height)height=window.screen.height;
        else height=200;
        console.log("Warn: no height detected");
      }
      if(!width){
        if(window && window.screen && window.screen.width)width=window.screen.height;
        else width=200;
        console.log("Warn: no width detected");
      }
      var orientation=getOritentation(width,height);
      var ar=getAscpectRatio(width,height);
      var style=generateFinalStyle(mediaStyle,width,height,orientation,ar,Platform.OS);
      component.hoverStyle=style.hover;
      component.originalStyle=style.original;
      component.style=Object.assign({},component.originalStyle);
      component.state.mediaStyle={width:width,height:height,orientation:orientation,aspectRatio:ar,platform:Platform.OS};
      component.forceUpdate()
    }

    let {width, height} = Dimensions.get('window')
    width=parseInt(width);
    height=parseInt(height);
    if(!height){
      if(window && window.screen && window.screen.height)height=window.screen.height;
      else height=200;
      console.log("Warn: no height detected");
    }
    if(!width){
      if(window && window.screen && window.screen.width)width=window.screen.height;
      else width=200;
      console.log("Warn: no width detected");
    }
    var orientation=getOritentation(width,height);
    var ar=getAscpectRatio(width,height);

    component=new Component(props,context);
    var style=generateFinalStyle(mediaStyle,width,height,orientation,ar,Platform.OS);
    component.originalStyle=style.original;
    component.hoverStyle=style.hover;
    component.style=Object.assign({},component.originalStyle);
    if(!component.state)component.state={}
    component.state.mediaStyle={width:width,height:height,orientation:orientation,aspectRatio:ar,platform:Platform.OS}

    component.hoverIn=function(name){//accepts multiple selectors separated with ,
      return function(){
        if(Platform.OS==='web' && typeof name==="string"){
          name=name.split(",");
          for(var i=0;i<name.length;i++)component.style[name[i]]=Object.assign({},component.style[name[i]],component.hoverStyle[name[i]])
          component.forceUpdate()
        }
      }
    }
    component.hoverOut=function(name){//accepts multiple selectors separated with ,
      return function(){
        if(Platform.OS==='web' && typeof name==="string"){
          name=name.split(",");
          for(var i=0;i<name.length;i++){
            for(var index in component.hoverStyle[name[i]]) {
              if(component.style[name[i]])
                delete component.style[name[i]][index];
            }
          }
          for(var i=0;i<name.length;i++)component.style[name[i]]=Object.assign({},component.style[name[i]],component.originalStyle[name[i]])
          component.forceUpdate()
        }
      }
    }

    var eventListener=Dimensions.addEventListener("change", handler);
    var unsubscribe = store.subscribe(themeHandler);
    var unmount=component.componentWillUnmount;
    component.componentWillUnmount=function(args){
      eventListener.remove();
      unsubscribe();
      if(unmount)unmount.apply(this,args);
    }
    setTimeout(()=>{
      handler({window:Dimensions.get('window')});
    },5000);
    return component;
  };
}

export {mediaConnect}

// =================================================================
// NUEVO HOOK (PARA COMPONENTES FUNCIONALES)
// =================================================================
export function useMediaStyle(mediaStyle) {
  // 1. Usa useMediaInfo para reaccionar a cambios de pantalla
  const mediaInfo = useMediaInfo();

  // 2. Crea un estado simple para forzar la actualización cuando cambie el tema
  const [themeVersion, setThemeVersion] = useState(0);
  useEffect(() => {
    // Suscríbete al store de Redux
    const themeHandler = () => {
      setThemeVersion(v => v + 1); // Simplemente incrementa un contador
    };
    const unsubscribe = store.subscribe(themeHandler);
    // Limpia la suscripción al desmontar
    return () => unsubscribe();
  }, []); // El array vacío asegura que esto solo se ejecute al montar/desmontar

  // 3. Calcula los estilos base y de hover
  // useMemo asegura que esto solo se recalcule si mediaInfo o el tema cambian
  const { originalStyle, hoverStyle } = useMemo(() => {
    const { width, height, orientation, aspectRatio, platform } = mediaInfo;
    // Llama a tu función de utilidad existente
    const style = generateFinalStyle(mediaStyle, width, height, orientation, aspectRatio, platform);
    return { originalStyle: style.original, hoverStyle: style.hover };
  }, [mediaInfo, themeVersion, mediaStyle]); // Dependencias

  // 4. Maneja el estado de hover
  const [hoveredKeys, setHoveredKeys] = useState(new Set());

  // useCallback asegura que estas funciones no se recreen en cada render
  const hoverIn = useCallback((name) => () => {
    if (Platform.OS !== 'web' || typeof name !== "string") return;
    const keys = name.split(',');
    setHoveredKeys(prevKeys => {
      const newKeys = new Set(prevKeys);
      keys.forEach(k => { if(k) newKeys.add(k); });
      return newKeys;
    });
  }, []);

  const hoverOut = useCallback((name) => () => {
    if (Platform.OS !== 'web' || typeof name !== "string") return;
    const keys = name.split(',');
    setHoveredKeys(prevKeys => {
      const newKeys = new Set(prevKeys);
      keys.forEach(k => { if(k) newKeys.delete(k); });
      return newKeys;
    });
  }, []);

  // 5. Calcula el objeto de estilo final
  // Combina originalStyle con los estilos de hover activos
  const style = useMemo(() => {
    // Clona profundamente para evitar mutaciones
    const final = JSON.parse(JSON.stringify(originalStyle));
    
    hoveredKeys.forEach(key => {
      if (hoverStyle[key]) {
        // Fusiona el estilo de hover sobre el original
        final[key] = Object.assign(final[key] || {}, hoverStyle[key]);
      }
    });
    return final;
  }, [originalStyle, hoverStyle, hoveredKeys]);

  // 6. Devuelve todo lo que el componente necesita
  return { style, hoverIn, hoverOut, mediaInfo };
}

export function useMediaInfo() {
  
  const getMedia = () => {
    const { width, height } = Dimensions.get('window');
    const w = parseInt(width) || 200;
    const h = parseInt(height) || 200;
    const orientation = getOritentation(w, h);
    const aspectRatio = getAscpectRatio(w, h);
    return {
      width: w,
      height: h,
      orientation,
      aspectRatio,
      platform: Platform.OS
    };
  };

  const [mediaInfo, setMediaInfo] = useState(getMedia);

  useEffect(() => {
    const handler = () => {
      setMediaInfo(getMedia());
    };
    const subscription = Dimensions.addEventListener('change', handler);
    return () => subscription.remove();
  }, []);

  return mediaInfo;
}


const MediaInfo = {
  get w() {
    const { width, height } = Dimensions.get('window');
    const w = parseInt(width) || 200;
    return w;
  },
  get h() {
    const { width, height } = Dimensions.get('window');
    const h = parseInt(height) || 200;
    return h;
  },
  get width() {
    const { width, height } = Dimensions.get('window');
    const w = parseInt(width) || 200;
    return w;
  },
  get height() {
    const { width, height } = Dimensions.get('window');
    const h = parseInt(height) || 200;
    return h;
  },
  get orientation() {
    const { width, height } = Dimensions.get('window');
    const w = parseInt(width) || 200;
    const h = parseInt(height) || 200;
    return getOritentation(w, h);
  },
  get aspectRatio() {
    const { width, height } = Dimensions.get('window');
    const w = parseInt(width) || 200;
    const h = parseInt(height) || 200;
    return getAscpectRatio(w, h);
  },
  get platform() {
    return Platform.OS;
  }
}

export {MediaInfo}