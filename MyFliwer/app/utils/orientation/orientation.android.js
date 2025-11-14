import Orientation from 'react-native-orientation-locker';
import {store} from '../../store'; //Import the store
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

const  Orientation2 = {
    lockToLandscape: () => {
        Orientation.lockToPortrait()
        Orientation.lockToLandscape()
        ActionsSession.lockToLandscape()(store.dispatch, store.getState);
    },
    unlockAllOrientations: () => {
        var free = ActionsSession.unlockAllOrientations()(store.dispatch, store.getState);
        Orientation.lockToPortrait()
        if (free) {
            Orientation.lockToLandscape()
            Orientation.unlockAllOrientations()
        }
    },
    lockToPortrait: () => {
        Orientation.lockToPortrait()
    }
}


export {Orientation2 as Orientation};
