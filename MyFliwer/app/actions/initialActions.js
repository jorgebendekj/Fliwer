export const INITIAL_GET_DATA = 'INITIAL_GET_DATA';
export const CLEAN_INITIAL_DATA = 'CLEAN_INITIAL_DATA';
export const CLEAN_INITIAL_IMPORTS = 'CLEAN_INITIAL_IMPORTS';
export const INITIAL_GET_COORDS = 'INITIAL_GET_COORDS';
export const INITIAL_GET_IMAGE = 'INITIAL_GET_IMAGE';
export const INITIAL_GET_AREA = 'INITIAL_GET_AREA'
export const INITIAL_GET_ADRESS = 'INITIAL_GET_ADRESS'
export const INITIAL_GET_SIMULING = 'INITIAL_GET_SIMULING'
export const SET_CUSTOMER_BASIC_DATA = 'SET_CUSTOMER_BASIC_DATA'
export const SET_CUSTOMER_DATA = 'SET_CUSTOMER_DATA'
export const SET_SAVING_FLIWER_VALUE = 'SET_SAVING_FLIWER_VALUE'
export const SET_FOR_WHAT = 'SET_FOR_WHAT'
export const SET_MARKERS = 'SET_MARKERS'
export const SET_FARMING_STATION_PRICES = 'SET_FARMING_STATION_PRICES'
export const SET_PROJECT_NAME = 'SET_PROJECT_NAME'
export const SET_INSTALLATION_PRICE = 'SET_INSTALLATION_PRICE'
export const SET_PHONE = 'SET_PHONE'
export const SET_FLIWER_CONFIG_IS_INSIDE_APP = 'SET_FLIWER_CONFIG_IS_INSIDE_APP'
export const RESET_GOTTEN_CONTRACTS = 'RESET_GOTTEN_CONTRACTS';


import { extraService } from '../utils/apiService.js';
import schema from '../utils/schema';
import { normalize } from 'normalizr';


export function setInitialDataValues(data, total_import, total_m3, precioMedioM3) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIAL_GET_DATA, data: data, totalImport: total_import, totalM3: total_m3, precioMedioM3: precioMedioM3});
            resolve();
        });
    }
}

export function cleanInitialData() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: CLEAN_INITIAL_DATA});
            resolve();
        });
    }
}

export function cleanImports() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: CLEAN_INITIAL_IMPORTS});
            resolve();
        });
    }
}

export function setArea(area) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIAL_GET_AREA, area: area});
            resolve();
        });
    }
}


export function setCoords(coords) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIAL_GET_COORDS, coords: coords});
            resolve();
        });
    }
}

export function setImage(imageMap,imageMapSize) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIAL_GET_IMAGE, imageMap: imageMap,imageMapSize:imageMapSize});
            resolve();
        });
    }
}

export function setCustomerBasicData(firstname, lastname, email, phone) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_CUSTOMER_BASIC_DATA, firstname: firstname, lastname: lastname, email: email, phone: phone});
            resolve();
        });
    }
}

export function setAddress(address) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIAL_GET_ADRESS, address: address});
            resolve();
        });
    }
}

export function setInitialSimuling(simuling) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: INITIAL_GET_SIMULING, simuling: simuling});
            resolve();
        });
    }
}

export function setCustomerData(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_CUSTOMER_DATA, data: data});
            resolve();
        });
    }
}

export function setSavingFliwerValue(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_SAVING_FLIWER_VALUE, savingFliwerValue: value});
            resolve();
        });
    }
}

export function sendInitialData(sendEmail) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var initialData = getState().initialReducer;
            console.log("initialData", initialData);
            /*
             forWhat: "string" ("garden" or "farming" or "vertical-garden")
             projectName: "string"
             data:
                0: {import: "456", m3: "123"}
                1: {m3: "789", import: "1011"}
                2: {}
             totalImport: 1467
             totalm3: 912
             area: "500"
             precio_medio_m3: "1.61"
             address: "string"
             email: "email"
             phone: "phone"
             coords:{lat:,long:,zoom:}
             firstname: "string"
             lastname: "string"
             customerAddress: "string"
             city: "string"
             zipCode: "string"
             nif: "string"
             iban: "string"
             password: "string"
             repeatPassword: "string"
             savingFliwerValue: "string"
             markers:{lat:,long:,id:}

             transform to
             {
             forWhat: String ("garden" or "farming" or "vertical-garden")
             projectName: "string"
             costs:[{import:Float,m3:Float}],
             total:{import:Float,m3:Float,avg:Float},
             area: Float,
             adress: String,
             email: String,
             phone: String,
             coords:{lat:,lng:,zoom:}
             country: String
             firstname: String
             lastname: String
             customerAddress: String
             city: String
             zipCode: String
             nif: String
             iban: String
             companyName: String
             companyCif: String
             password: String
             repeatPassword: String
             savingFliwerValue: String
             markers:{lat:,long:,id:}
             sendEmail: Boolean
             }
             */
            var d = Object.values(initialData.data);

            var table;
            if (d.length < 12)
                table = d.slice(0, d.length - 1);
            else
                table = d;

            // Convert to float
            var area = null;
            if (initialData.area)
            {
                //console.log("initialData.area", initialData.area);
                area = initialData.area.toString().replace(/\./g, '');
                area = area.replace(/,/g, '.');
                //console.log("area", area);
            }

            var data = {
                forWhat: initialData.forWhat,
                projectName: initialData.projectName,
                costs: table,
                total: {import: initialData.totalImport, m3: initialData.totalm3, avg: initialData.precio_medio_m3},
                adress: initialData.address,
                email: initialData.email,
                phone: initialData.phone,
                coords: initialData.coords,
                country: "ES",
                area: area,
                firstname: initialData.firstname,
                lastname: initialData.lastname,
                customerAddress: initialData.customerAddress,
                city: initialData.city,
                zipCode: initialData.zipCode,
                nif: initialData.nif,
                password: initialData.password,
                repeatPassword: initialData.repeatPassword,
                iban: initialData.iban,
                companyName: initialData.companyName,
                companyCif: initialData.companyCif,
                savingFliwerValue: initialData.savingFliwerValue,
                markers: initialData.markers,
                htmlText: '',
                sendEmail: sendEmail,
                imageMap: initialData.imageMap
            };
            console.log("initialData", data);

            extraService.sendInitialData(data).then((response) => {
                cleanInitialData()(dispatch, getState).then(() => {
                    dispatch({type: RESET_GOTTEN_CONTRACTS});
                    resolve();
                }, (error) => {
                    console.log("error 1: ", error);
                    reject(error);
                });
            }, (error) => {
                console.log("error 2: ", error);
                reject(error);
            });
        });
    };
}

export function testing(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            extraService.testing(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("error: ", error);
            });
        });
    };
}

export function setForWhat(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_FOR_WHAT, forWhat: value});
            resolve();
        });
    }
}

export function setProjectName(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_PROJECT_NAME, projectName: value});
            resolve();
        });
    }
}

export function setMarkers(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_MARKERS, markers: value});
            resolve();
        });
    }
}

export function setPhone(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_PHONE, phone: value});
            resolve();
        });
    }
}

export function getFarmingStationPrices(forWhat,markers) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            extraService.getFarmingStationPrices(forWhat,markers).then((response) => {
                dispatch({type: SET_FARMING_STATION_PRICES, prices: response.prices});
                resolve(response.prices);
            }, (error) => {
                reject(error);
                console.log("error: ", error);
            });
        });
    };
}

export function getInstallationPrice(forWhat, paramValue) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            var data;
            if (forWhat == "garden" || forWhat == 'vertical-garden')
                data = {forWhat: forWhat, area: paramValue};
            else
                data = {forWhat: forWhat, markers: paramValue};

            extraService.getInstallationPrice(data).then((response) => {
                dispatch({type: SET_INSTALLATION_PRICE, price: response.price});
                resolve(response.price);
            }, (error) => {
                reject(error);
                console.log("error: ", error);
            });
        });
    };
}

export function getHtmlContract(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            extraService.getHtmlContract(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("error: ", error);
            });
        });
    };
}

export function setFliwerConfigIsInsideApp(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_FLIWER_CONFIG_IS_INSIDE_APP, value: value});
            resolve();
        });
    };
}
