// @flow
import {GARDENER_WIPE_STORAGE_INFO, GARDENER_DELETE_USER, GARDENER_PUT_USERS, GARDENER_GET_HOMES, GARDENER_GET_USERS, GARDENER_ALLOW_REFRESH_HOMES, GARDENER_WIPE_ALLOW_REFRESH_HOMES, VISITED_ZONES_ADD, VISITED_ZONES_RESET} from "../actions/gardenerActions.js"

let dataState = {usersListData: {},visitedZones:[],userListLoaded:false, gardenerHomes: {}, loading: false, loadingData: true, lastUpdatedZone: null, allowRefreshGardenerHomes: true, gardenerVisitorHomes:{}, gardenerVisitorUsers:{}};

const gardenerReducer = (state = dataState, action) => {

    switch (action.type) {

        case GARDENER_GET_HOMES:
            var newdata = Object.assign({}, state);
            newdata.gardenerHomes = Object.assign({}, newdata.gardenerHomes, action.data);
            newdata.loadingData = false;
            state = Object.assign({}, state, newdata);
            return state;

        case GARDENER_GET_USERS:
            var newdata = Object.assign({}, state);
            newdata.userListLoaded=true;
            newdata.usersListData = Object.assign({}, newdata.usersListData, action.data);
            state = Object.assign({}, state, newdata);
            return state;

        case GARDENER_DELETE_USER:
            var newdata = Object.assign({}, state);
            delete newdata.gardenerHomes[action.id_user]

            var gardenerHomes = Object.values(newdata.gardenerHomes);
            var gardensFound = gardenerHomes.filter((element) => {
                return element.idUser == action.id_user
            });

            for (var index in gardensFound)
            {
                delete newdata.gardenerHomes[gardensFound[index].id]
            }

            var usersListTable = Object.values(newdata.usersListData);
            var usersListIndexToDelete = usersListTable.findIndex((element) => {
                return element.user_id == action.id_user
            });
            delete newdata.usersListData[usersListIndexToDelete]

            state = Object.assign({}, state, newdata);
            return state;

        case GARDENER_WIPE_STORAGE_INFO:
            //console.log("GARDENER_WIPE_STORAGE_INFO");
            state = Object.assign({}, state, {usersListData: {}, gardenerHomes: {}, loading: action.disableLoading? false : true});
            /*
             uniqueStorage.setItem('gardenInfo',JSON.stringify(state)).then(function(){
             return state;
             });
             */
            return state;
            
        case GARDENER_ALLOW_REFRESH_HOMES:
          var newdata = Object.assign({}, state, {allowRefreshGardenerHomes: action.allowRefreshGardenerHomes});
          //newdata.allowRefreshGardenerHomes = Object.assign({}, newdata.allowRefreshGardenerHomes, action.allowRefreshGardenerHomes);
          newdata.gardenerVisitorHomes = Object.assign({}, newdata.gardenerVisitorHomes, action.gardenerVisitorHomes);
          newdata.gardenerVisitorUsers = Object.assign({}, newdata.gardenerVisitorUsers, action.gardenerVisitorUsers);
          state = Object.assign({}, state, newdata);
          return state;

        case GARDENER_WIPE_ALLOW_REFRESH_HOMES:
            state = Object.assign({}, state, {allowRefreshGardenerHomes: true, gardenerVisitorHomes: {}, gardenerVisitorUsers: {}});
            return state;

        case VISITED_ZONES_ADD:
            var newdata = Object.assign({}, state);
            newdata.visitedZones = Object.assign([], newdata.visitedZones);
            //push if not exists
            if(newdata.visitedZones.indexOf(action.data) === -1){
                newdata.visitedZones.push(action.data);
            }
            state = Object.assign({}, state, newdata);
            return state;

        case VISITED_ZONES_RESET:
            state = Object.assign({}, state, {visitedZones: []});
            return state;
            
        default:
            return state;
    }
};

export default gardenerReducer;
