'use strict';

import React, { useEffect } from 'react'; 
var {
    View, 
} = require('react-native');


import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {Portal} from '@gorhom/portal'

import * as ActionsWrapper from '../actions/wrapperActions.js'

// 1. Ya no necesitas importar mediaConnect
// import {mediaConnect} from '../utils/mediaStyleSheet.js'


const FliwerWrapper = (props) => {
    
    const { children, portals, actions } = props;

    const length = children ? (children.length === undefined ? 1 : children.length) : 0;

    useEffect(() => {
        if (portals !== length) {
            actions.wrapper.setPortals(length);
        }
    }, [length, portals, actions.wrapper]);


    var indents=[];
    
    if (length === 0) {
        return null; 
    }

    if (length === 1) {
        indents.push(
            <Portal key="Portal0" hostName={"MainViewPortal0"}>
                {children}
            </Portal>
        )
    } else {
        for(var i = 0; i < length; i++){ 
            indents.push(
                <Portal key={"Portal"+i} hostName={"MainViewPortal"+i}>
                    {children[i]}
                </Portal>
            )
        }
    }
    return indents;
};


function mapStateToProps(state, props) {
    return {
        portals: state.wrapperReducer.portals
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            wrapper: bindActionCreators(ActionsWrapper, dispatch),
        }
    };
}

// 2. Define el objeto de estilos (aunque esté vacío)
var styles = {
};

// 3. Exporta SIN mediaConnect
export default connect(mapStateToProps, mapDispatchToProps)(FliwerWrapper);