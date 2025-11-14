'use strict';

import React, { useState } from 'react';
import {View, TouchableOpacity, Platform, Image} from 'react-native';

import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';

// 1. Importa el NUEVO HOOK
import { useMediaStyle } from '../utils/mediaStyleSheet.js';


import { Redirect } from '../utils/router/router'
import {CurrentTheme, FliwerColors} from '../utils/FliwerColors.js'

// 2. Mueve la definición de estilos aquí fuera
var styles = {
    bar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        backgroundColor: "@theme primaryColor",
        justifyContent: "center"
    },
    barOnTop: {
        borderBottomColor: '@theme secondaryColor',
        borderBottomWidth: 1
    },
    barOnBottom: {
        borderTopColor: '@theme secondaryColor',
        borderTopWidth: 1
    },
    actionButton: {
        marginLeft: 20, marginRight: 20
    }
};


// Componente funcional
const MainFliwerMenuBar = (props) => {
    
    const [goProfile, setGoProfile] = useState(false);

    // 3. Llama al hook para obtener los estilos y manejadores
    const { style, hoverIn, hoverOut } = useMediaStyle(styles);

    const { 
        position, 
        barStyle, 
        current, 
        onClick, 
        onPressCheckSSID, 
        userData 
    } = props;


    if(goProfile)
    {
        setGoProfile(false); // Limpia el estado
        return <Redirect push to={"/profile"}/>
    }

    // Usa 'style' directamente desde el hook
    return (
        <View key="mainFliwerMenuBar2View1"  style={[style.bar, Platform.OS == 'ios' && position != "top" ? {height: 60, paddingBottom: 10} : {}, barStyle, position == "top"? style.barOnTop : style.barOnBottom]}>
            <View key="mainFliwerMenuBar2View2"  style={style.actionButton}>
                <TouchableOpacity key="mainFliwerMenuBar2HomePress" style={{padding: 2}} activeOpacity={1}
                    disabled={false}
                    onPress={() => {
                        if(onClick)onClick("home")
                    }}
                    >
                    <IoniconsIcon name={"apps"} size={25} style={{color: current==0?CurrentTheme.secondaryText:CurrentTheme.primaryText}} />
                </TouchableOpacity>
            </View>
            <View  key="mainFliwerMenuBar2View3" style={style.actionButton}>
                <TouchableOpacity key="mainFliwerMenuBar2ProfilePress"  style={{padding: 2}} activeOpacity={1}
                    disabled={false}
                    onPress={async () => {
                        if (typeof onPressCheckSSID === 'function')
                        {
                            await onPressCheckSSID().then(() => {
                                setGoProfile(true);
                            });
                        } else
                            setGoProfile(true);
                    }}
                    >
                    <Image key={"profileButton"} source={{uri: userData.photo_url}}   style={{padding: 2,height:30,width:30,borderRadius:30}} resizeMode={"cover"}/>
                </TouchableOpacity>
            </View>
        </View>
    );

};



function mapStateToProps(state, props) {
    return {
        userData: state.sessionReducer.data
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
        }
    };
}

// 4. Exporta el componente conectado SIN mediaConnect
export default connect(mapStateToProps, mapDispatchToProps)(MainFliwerMenuBar);