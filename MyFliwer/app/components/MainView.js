'use strict';

// Se importa useState y useEffect, y se elimina Component
import React, { useState, useEffect } from 'react'; 
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
    PanResponder,
    Animated,
    Dimensions
} = require('react-native');


import FliwerLoading from './fliwerLoading.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {PortalHost} from '@gorhom/portal'

import ImageBackground from './imageBackground.js'
import MainFliwerTopBar from './mainFliwerTopBar.js'
import MainFliwerMenuBar from './mainFliwerMenuBar.js'
import MainFliwerMenuBar2 from './mainFliwerMenuBar2.js'
import Home from './home/Home.js'

import {FliwerColors,CurrentTheme,MenuTheme} from '../utils/FliwerColors.js'
import {FliwerStyles} from '../utils/FliwerStyles.js'
import {FliwerCommonUtils} from '../utils/FliwerCommonUtils.js'

import {MediaInfo} from '../utils/mediaStyleSheet.js'
import { Redirect } from '../utils/router/router'

import * as Actions from '../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../actions/languageActions.js'; //Import your actions


import IconEntypo from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';

import background from '../assets/img/homeBackground.jpg'
import { max } from 'moment';

// El componente se define como una función que recibe 'props'
const FliwerMainView = (props) => {
    
    // 1. Reemplazo del constructor y this.state con hooks 'useState'
    const [primaryViewPercentage, setPrimaryViewPercentage] = useState(70);
    const [redirect, setRedirect] = useState(null);
    const [renderHome, setRenderHome] = useState(MediaInfo.orientation === "landscape" ? false : true);
    const [menuMode, setMenuMode] = useState("full");

    // 2. Reemplazo del efecto secundario en render() con 'useEffect'
    // El original tenía 'this.state.redirect=null;' dentro de render(), lo cual es una mutación
    // y una mala práctica. 'useEffect' es la forma correcta de manejar esto.
    // Se ejecutará después de que el componente se renderice con el <Redirect>.
    useEffect(() => {
        if (redirect) {
            setRedirect(null); // Limpia el estado de redirección después de renderizar
        }
    }, [redirect]); // Este efecto depende solo de la variable 'redirect'

    
    /* calculatePrimaryView(children){ ... } */ // Comentado igual que en el original

    // 3. Las funciones de la clase se convierten en funciones locales (const)
    // Se elimina 'this.state' y se usan las variables de estado directamente.
    const calculateSecondaryView = () => {
        //Get the width of the screen and substract 10px, then apply primaryViewPercentage over the result
        const screenWidth = Dimensions.get('window').width - 270;
        const primaryViewWidth = screenWidth * (primaryViewPercentage / 100); // Usa 'primaryViewPercentage'

        return {
            width: (primaryViewWidth + (menuMode === "icons" ? 150 : 0)) - 150, // Usa 'menuMode'
            flexGrow: 1,
            height: "100%"
        };
    }

    // 4. renderMenuItem se convierte en una función local
    // Se elimina 'this.state.menuMode' por 'menuMode'
    const renderMenuItem = (iconProvider, icon, text, onPress, size = 25, style, disabled, highlighted, key) => {
        
        const SpecificIcon = iconProvider;
        const Containter = disabled ? View : TouchableOpacity;
        return (
            <Containter key={key} style={[{width:"100%",height:40,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-start"}]} onPress={() => {
                if(onPress)onPress();
            }}>
                <View  style={[{flexGrow:1,marginRight:5,borderRadius:22,height:"100%",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-start",marginLeft:5},highlighted?{backgroundColor:CurrentTheme.complementaryColor}:{}]}>
                    <View style={[{paddingLeft:5,width:40,height:40,justifyContent:"center",paddingLeft:0}]}>
                        {iconProvider?
                            (
                                <SpecificIcon name={icon} style={[{fontSize:size,color:highlighted?CurrentTheme.selectedColor:CurrentTheme.primaryText,textAlign:"center",opacity:(disabled?0.3:1)}]}/>
                            ):
                            (
                                <Image resizeMode={"contain"} source={icon} style={[{width: size, height: size,alignSelf:"center",opacity:(disabled?0.3:1)},style?style:{}]}/>
                            )
                        }
                    </View>
                    {
                        menuMode === "full" ? // Usa 'menuMode'
                        (
                            <Text style={{position:"absolute",color:highlighted?CurrentTheme.selectedColor:CurrentTheme.secondaryText,left:60,fontSize:15,fontFamily:FliwerColors.fonts.superTitle,opacity:(disabled?0.3:1) }}>{text}</Text>
                        ):null
                    }
                </View>
            </Containter>
        )
    }

    // 5. renderMainMenu se convierte en una función local
    // Se elimina 'this.' y 'that.', y se usa 'setMenuMode' y 'setRedirect'
    const renderMainMenu = () => {
        var indents=[];
        // 'that' ya no es necesario
        var apps=MenuTheme.apps;

        //Add a back arrow <- in absolute at the top right corner
        if(menuMode === "full") // Usa 'menuMode'
            indents.push(
                <TouchableOpacity key="back" style={{width:"100%",height:25,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-end",paddingRight:10}} onPress={() => {
                    setMenuMode("icons"); // Usa 'setMenuMode'
                }}>
                    <IconMaterialCommunityIcons name="arrow-left" style={{fontSize:30,color:CurrentTheme.primaryText}}/>
                </TouchableOpacity>
            );
        else{
            indents.push(
                <TouchableOpacity key="forward" style={{width:"100%",height:25,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-end",paddingRight:10}} onPress={() => {
                    setMenuMode("full"); // Usa 'setMenuMode'
                }}>
                    <IconMaterialCommunityIcons name="arrow-right" style={{fontSize:30,color:CurrentTheme.primaryText}}/>
                </TouchableOpacity>
            );
        }

        for (var i = 0; i < apps.length; i++) {
            if (apps[i]) {
                var redirectApp = apps[i].redirect;
                indents.push(renderMenuItem( // Llama a 'renderMenuItem' local
                    apps[i].iconProvider,
                    apps[i].icon,
                    apps[i].name,
                    // Pasa 'setRedirect' directamente
                    ((r) => () => setRedirect(r))(redirectApp),
                    apps[i].size,
                    apps[i].style,
                    apps[i].disabled,
                    apps[i].app === props.currentApp, // Usa 'props.'
                    `menuItem-${i}`
                ));
            }
        }
        
        return (
            <View style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center",backgroundColor:CurrentTheme.mainMenu,userSelect: 'none'}}>            
                <ScrollView style={{width:"100%"}} contentContainerStyle={{paddingLeft:0,paddingTop:10,display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"center"}}>
                    {indents}
                </ScrollView>
                <TouchableOpacity style={{width:"100%",height:40,display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-start",marginBottom:5}} onPress={() => {
                    setRedirect("/app/appstore"); // Usa 'setRedirect'
                }}>
                    <View  style={[{flexGrow:1,marginRight:5,borderRadius:22,height:"100%",display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"flex-start",paddingLeft:5,marginLeft:5},props.currentApp=="appStore"?{backgroundColor:CurrentTheme.complementaryColor}:{}]}>
                        <IconMaterialCommunityIcons name="store" style={{fontSize:30,color:props.currentApp=="appStore"?CurrentTheme.selectedColor:CurrentTheme.primaryText}}/>
                        {
                            menuMode === "full"? // Usa 'menuMode'
                            <Text style={{position:"absolute",color:props.currentApp=="appStore"?CurrentTheme.selectedColor:CurrentTheme.secondaryText,left:60,fontSize:15,fontFamily:FliwerColors.fonts.superTitle }}>{"App Store"}</Text>
                            :null
                        }
                    </View>
                </TouchableOpacity>
            </View>
        );
    }


    // 6. El método 'render()' se convierte en el cuerpo principal de la función
    var indents=[];

    if(redirect){ // Usa 'redirect'
        indents.push(<Redirect key={"redirect-" + redirect} to={redirect} />);
        // La limpieza del 'redirect' ahora la hace el 'useEffect'
    }

    //If landscape render dual view, if portrait render a view with red background
    if (MediaInfo.orientation == "landscape") {
        indents.push (
            <View key="mainView1" style={{position:"absolute",height:"100%",width:"100%",flexDirection:"row",height:"100%"}}>
                <ImageBackground  key="mainView2"  style={{backgroundColor:CurrentTheme.secondaryColor}} resizeMode={"cover"}>
                    {/* Se reemplaza 'this.props' por 'props' */}
                    <MainFliwerTopBar showTextBar={true} title={props.actions.translate.get('hello') + " " + props.data.first_name} />
                    <View style={[{flex: 1, flexDirection: "row",},{justifyContent: "flex-start", alignItems: "center"}]}>
                        <ScrollView style={[{width: 200, maxWidth: 200, height: "100%"},{width:menuMode=="full"?200:50,maxWidth:menuMode=="full"?200:50}]} contentContainerStyle={{flexGrow:1}}>
                            {renderMainMenu()} {/* Llama a la función local */}
                        </ScrollView>
                        <View style={{width: props.currentApp=="fliwer"?580:380, height: "100%",backgroundColor:CurrentTheme.primaryView}}> 
                            <PortalHost key="PortalHost0" name="MainViewPortal0" />
                        </View>
                        
                        {
                            props.portals>1?(
                                <View style={[{backgroundColor:CurrentTheme.secondaryView},calculateSecondaryView()]}> {/* Llama a la función local */}
                                    <PortalHost key="PortalHost1" name="MainViewPortal1" />
                                </View>
                            ):null
                        }
                        {
                            props.portals>2?(
                                <View style={[{width: 70, height: "100%"}]}>
                                    <PortalHost key="PortalHost2" name="MainViewPortal2" />
                                </View>
                            ):null
                        } 
                    </View>
                </ImageBackground>
            </View>
        );
    } else{
        //console.log('portraitScreen mainview',props.portraitScreen)
        indents.push (
            <View  key="mainView1" style={{position:"absolute",height:"100%",width:"100%"}}>
                <ImageBackground  key="mainView2" style={[{backgroundColor:CurrentTheme.secondaryColor, flex: 1}]}>
                    
                    {/* Contenedor para la VISTA DE APP (PORTALES) */}
                    {/* Sigue existiendo, pero se oculta si renderHome es true */}
                    <View 
                        style={{
                            flex: 1,
                            opacity: renderHome ? 0 : 1,
                            zIndex: renderHome ? 1 : 10
                        }}
                        pointerEvents={renderHome ? 'none' : 'auto'}
                    >
                        {[
                            (<PortalHost key={"PortalHost"+(props.portraitScreen-1)} name={"MainViewPortal"+(props.portraitScreen-1)} />),
                            props.portraitScreen == 2?(<PortalHost key={"PortalHost2"} name={"MainViewPortal2"} />):null
                        ]}
                    </View>

                    <ScrollView 
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor:"rgb(100,100,100)",
                            opacity: renderHome ? 1 : 0,
                            zIndex: renderHome ? 10 : 1 // Se pone por encima de la vista de app
                        }}
                        pointerEvents={renderHome ? 'auto' : 'none'} // Desactiva clics si está oculto
                        key="mainView3"
                    >
                        <Home key="mainViewHome" onAppPress={(redirectPath)=>{ setRedirect(redirectPath); setRenderHome(false); }}/>
                    </ScrollView>
                    
                </ImageBackground>
                <MainFliwerMenuBar2 key="mainViewMainFliwerMenuBar2" onClick={(button)=>{
                    if(button=="home") setRenderHome(true); // Usa 'setRenderHome'
                }} />
            </View>
        );
    }

    // El return principal del componente
    return indents;
            
};


// 7. 'mapStateToProps' y 'mapDispatchToProps' no cambian.
// Siguen funcionando igual con el HOC 'connect'.
function mapStateToProps(state, props) {
    return {
        data: state.sessionReducer.data,
        portals: state.wrapperReducer.portals,
        currentApp: state.wrapperReducer.currentApp,
        portraitScreen: state.wrapperReducer.portraitScreen
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
        }
    };
}

// 8. La exportación con 'connect' sigue siendo la misma.
export default connect(mapStateToProps, mapDispatchToProps)(FliwerMainView);