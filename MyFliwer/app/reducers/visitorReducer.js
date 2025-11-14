// @flow
import {VISITOR_WIPE_STORAGE_INFO ,VISITOR_DELETE_USER,VISITOR_PUT_USERS,VISITOR_GET_HOMES,VISITOR_GET_USERS} from "../actions/visitorActions.js"


let dataState = { usersListData:{},visitorHomes:{}, loading:false,loadingData:false,lastUpdatedZone:null};

const visitorReducer = (state = dataState, action) => {

    switch (action.type) {

      case VISITOR_GET_HOMES:
      var newdata=Object.assign({}, state);
      newdata.visitorHomes=Object.assign({},newdata.visitorHomes,action.data);
      state = Object.assign({}, state, newdata  );
      return state;

      case VISITOR_GET_USERS:
      var newdata=Object.assign({}, state);
      newdata.usersListData=Object.assign({},newdata.usersListData,action.data);
      state = Object.assign({}, state, newdata  );
      return state;


      case VISITOR_DELETE_USER:
      var newdata=Object.assign({}, state);
      delete newdata.visitorHomes[action.id_user]

      var visitorHomes=Object.values(newdata.visitorHomes);
      var visitorFound=visitorHomes.filter((element)=>{ return element.idUser == action.id_user});

      for(var index in visitorFound)
      {
        delete newdata.visitorHomes[visitorFound[index].id]
      }

      var usersListTable=Object.values(newdata.usersListData);
      var usersListIndexToDelete=usersListTable.findIndex((element)=>{ return element.user_id == action.id_user});
      delete newdata.usersListData[usersListIndexToDelete]

      state = Object.assign({}, state, newdata  );
      return state;

      case VISITOR_WIPE_STORAGE_INFO:
        state = Object.assign({}, state, {usersListData:{},visitorHomes:{}, loading:true});
        /*
        uniqueStorage.setItem('gardenInfo',JSON.stringify(state)).then(function(){
          return state;
        });
        */
        return state;



      default:
          return state;
    }
};

export default visitorReducer;
