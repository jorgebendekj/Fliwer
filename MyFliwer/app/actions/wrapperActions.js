export const SET_PORTALS = 'SET_PORTALS';
export const SET_FRONTLAYER_PORTALS = 'SET_FRONTLAYER_PORTALS';
export const SET_PORTRAIT_SCREEN = 'SET_PORTRAIT_SCREEN';
export const SET_CURRENT_APP = 'SET_CURRENT_APP';

export function setPortals(portals) {
    return (dispatch) => {
        dispatch({type: SET_PORTALS,data:portals});
    }
}

export function setFrontLayerPortals(portals) {
    return (dispatch) => {
        dispatch({type: SET_FRONTLAYER_PORTALS,data:portals});
    }
}

export function setCurrentApp(app) {
    return (dispatch) => {
        dispatch({type: SET_CURRENT_APP,data:app});
    }
}

export function setPortraitScreen(screen) {
    //screen should be 1 or 2
    return (dispatch) => {
        dispatch({type: SET_PORTRAIT_SCREEN,data:screen});
    }
}