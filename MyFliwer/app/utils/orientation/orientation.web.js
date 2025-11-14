import {store} from '../../store'; //Import the store
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

const  Orientation = {
    lockToLandscape: (component) => {
        //ActionsSession.lockToLandscape()(store.dispatch,store.getState);
        //if(typeof component==="object")component.forceUpdate();
    },
    unlockAllOrientations: (component) => {
        //ActionsSession.unlockAllOrientations()(store.dispatch,store.getState);
        //if(typeof component==="object")component.forceUpdate();
    },
    lockToPortrait: () => {
    }
}
export {Orientation}
