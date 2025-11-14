// @flow
import {INITIAL_GET_SIMULING, INITIAL_GET_ADRESS, SET_CUSTOMER_BASIC_DATA, INITIAL_GET_AREA, INITIAL_GET_COORDS,INITIAL_GET_IMAGE, CLEAN_INITIAL_DATA, CLEAN_INITIAL_IMPORTS, INITIAL_GET_DATA, SET_CUSTOMER_DATA, SET_SAVING_FLIWER_VALUE, SET_FOR_WHAT, SET_MARKERS, SET_FARMING_STATION_PRICES, SET_PROJECT_NAME, SET_INSTALLATION_PRICE, SET_PHONE, SET_FLIWER_CONFIG_IS_INSIDE_APP} from "../actions/initialActions.js"


        let dataState = {
            data: [{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""}],
            totalImport: 0.00, totalm3: 0, area: null, precio_medio_m3: null, coords: {}, imageMap:null,imageMapSize:null, email: null, phone: null, address: null, simuling: false,
            firstname: null,
            lastname: null,
            customerAddress: null,
            city: null,
            zipCode: null,
            nif: null,
            iban: null,
            companyName: null,
            companyCif: null,
            password: null,
            repeatPassword: null,
            savingFliwerValue: 60,
            forWhat: null,
            projectName: "",
            markers: [
//                {lat: 41.849298241045524, long: 3.12878105789423, id: "fliwer_1"},
//                {lat: 41.85135613091994, long: 3.125575482845307, id: "fliwer_2"}
            ],
            farmingStationPrices: [],
            installationPrice: 0,
            isFliwerConfigInsideApp: false
        };

const initialReducer = (state = dataState, action) => {

    switch (action.type) {

        case INITIAL_GET_DATA:
            var newdata = Object.assign({}, state);
            newdata.data = [].concat(action.data);
            newdata.totalImport = action.totalImport;
            newdata.totalm3 = action.totalM3;
            newdata.precio_medio_m3 = action.precioMedioM3;
            state = Object.assign({}, state, newdata);
            return state;

        case INITIAL_GET_AREA:
            var newdata = Object.assign({}, state);
            newdata.area = action.area;
            state = Object.assign({}, state, newdata);
            return state;

        case INITIAL_GET_COORDS:
            var newdata = Object.assign({}, state);
            newdata.coords = Object.assign({}, action.coords);
            state = Object.assign({}, state, newdata);
            return state;

        case INITIAL_GET_IMAGE:
            var newdata = Object.assign({}, state);
            newdata.imageMap = action.imageMap;
            newdata.imageMapSize = Object.assign({}, action.imageMapSize);
            state = Object.assign({}, state, newdata);
            return state;

        case SET_CUSTOMER_BASIC_DATA:
            var newdata = Object.assign({}, state);
            newdata.firstname = action.firstname;
            newdata.lastname = action.lastname;
            newdata.email = action.email;
            newdata.phone = action.phone;
            state = Object.assign({}, state, newdata);
            return state;

        case INITIAL_GET_ADRESS:
            var newdata = Object.assign({}, state);
            newdata.address = action.address;
            state = Object.assign({}, state, newdata);
            return state;

        case INITIAL_GET_SIMULING:
            var newdata = Object.assign({}, state);
            newdata.simuling = action.simuling;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_CUSTOMER_DATA:
            var newdata = Object.assign({}, state);
            //console.log("SET_CUSTOMER_DATA", action.data);
            newdata.email = action.data.email;
            newdata.phone = action.data.phone;
            newdata.firstname = action.data.firstname;
            newdata.lastname = action.data.lastname;
            newdata.customerAddress = action.data.customerAddress;
            newdata.city = action.data.city;
            newdata.zipCode = action.data.zipCode;
            newdata.nif = action.data.nif;
            newdata.iban = action.data.iban;
            newdata.companyName = action.data.companyName;
            newdata.companyCif = action.data.companyCif;
            newdata.password = action.data.password;
            newdata.repeatPassword = action.data.repeatPassword;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_SAVING_FLIWER_VALUE:
            var newdata = Object.assign({}, state);
            newdata.savingFliwerValue = action.savingFliwerValue;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_FOR_WHAT:
            var newdata = Object.assign({}, state);
            newdata.forWhat = action.forWhat;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_PHONE:
            var newdata = Object.assign({}, state);
            newdata.phone = action.phone;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_PROJECT_NAME:
            var newdata = Object.assign({}, state);
            newdata.projectName = action.projectName;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_MARKERS:
            var newdata = Object.assign({}, state);
            newdata.markers = action.markers;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_FARMING_STATION_PRICES:
            var newdata = Object.assign({}, state);
            newdata.farmingStationPrices = action.prices;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_INSTALLATION_PRICE:
            var newdata = Object.assign({}, state);
            newdata.installationPrice = action.price;
            state = Object.assign({}, state, newdata);
            return state;

        case SET_FLIWER_CONFIG_IS_INSIDE_APP:
            var newdata = Object.assign({}, state);
            newdata.isFliwerConfigInsideApp = action.value;
            state = Object.assign({}, state, newdata);
            return state;

        case CLEAN_INITIAL_DATA:
            state = Object.assign({}, state, {
                data: [{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""}],
                totalImport: 0.00, totalm3: 0, area: null, precio_medio_m3: null, coords: {}, email: null, phone: null, address: null, simuling: false,
                firstname: null,
                lastname: null,
                customerAddress: null,
                city: null,
                zipCode: null,
                nif: null,
                iban: null,
                companyName: null,
                companyCif: null,
                password: null,
                repeatPassword: null,
                savingFliwerValue: 60,
                forWhat: null,
                projectName: "",
                markers: [],
                imageMap:null,
                imageMapSize:null
            });
            return state;

        case CLEAN_INITIAL_IMPORTS:
            state = Object.assign({}, state, {
                data: [{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""},{import: null, m3: null, importText: "", m3Text: ""}],
                totalImport: 0.00, totalm3: 0, precio_medio_m3: null
            });
            return state;

        default:
            return state;
    }
};

export default initialReducer;
