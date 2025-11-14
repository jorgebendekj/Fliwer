// @flow
import structuredClone from "@ungap/structured-clone";

import {GET_ORDERS,GET_INVOICES, GET_CLIENT_INFORMATION, GET_PROVIDER_INFORMATION, GET_CONTRACTS, GET_NOT_SIGNED_CONTRACTS, SET_NOT_SIGNED_CONTRACTS_CHECKED, GET_SEPA_DOCUMENTS, GET_INVITATIONS, GET_ANGEL_CONTRACTS, GET_NOT_SIGNED_ANGEL_CONTRACTS, INVOICE_WIPE_DATA, RESET_GOTTEN_INVOICES, RESET_GOTTEN_CONTRACTS, RESET_GOTTEN_SEPA_DOCUMENTS, RESET_GOTTEN_INVITATIONS, RESET_GOTTEN_ANGEL_CONTRACTS,GET_FACTURAE, RESET_INVOICE_REDUCER, DELETE_CART, DELETE_ITEM_CART, EDIT_CART, PUT_CART, GET_CART} from "../actions/invoiceActions.js"

let dataState = {orderData:{},invoicesData: null, orders: [], currentOrderId: null, cart: [], gottenInvoices: false, clientData: null, providerData:null, products: [], loaded: false, contractsData: null, gottenContracts: false, angelContractsData: null, gottenAngelContracts: false, /*deprecated*/ notSignedContractsData: [],/*deprecated*/  notSignedAngelContractsData: [], isNotSignedContractChecked: false, sepaDocuments: null, gottenSepaDocuments: false, invitations: [], gottenInvitations: false};

const invoiceReducer = (state = dataState, action) => {

    switch (action.type) {

        case GET_CLIENT_INFORMATION:
            var newdata = Object.assign({}, state);
            newdata.clientData = Object.assign(action.clientData);
            state = Object.assign({}, state, newdata);
            return state;
        case GET_PROVIDER_INFORMATION:
            var newdata = Object.assign({}, state);
            newdata.providerData = action.providerData?Object.assign(action.providerData):null;
            state = Object.assign({}, state, newdata);
            return state;

        case GET_CART:
            var newdata = Object.assign({}, state);
            newdata.cart = Object.assign(action.cart);
            state = Object.assign({}, state, newdata);
            return state;

        case PUT_CART:
            const currentCart = structuredClone(state.cart || []);
            const existingIndex = currentCart.findIndex(prod => prod.id === action.item.id);

            if (existingIndex !== -1) {
                currentCart[existingIndex] = action.item;
            } else {
                currentCart.push(action.item);
            }

            return {
                ...state,
                cart: currentCart
            };

        case EDIT_CART:
            const clonedCart = structuredClone(state.cart || []);
            const index = clonedCart.findIndex(prod => prod.id === action.item.id);
            
            if (index !== -1) {
                clonedCart[index] = action.item;
            } else {
                clonedCart.push(action.item);
            }
        
            return {
                ...state,
                cart: clonedCart,
            };

        case DELETE_ITEM_CART:
             var newdata =  structuredClone(state);

            var findIndex = newdata.cart.findIndex((n) => {
                return n.id == action.itemId
            })
            if (findIndex!=-1)
            {
                newdata.cart.splice(findIndex, 1)
            }

            state = Object.assign({}, state, newdata);
            return state;

        case DELETE_CART:
            return {
                ...state,
                cart: []
            };

        case GET_ORDERS:
            var newdata = structuredClone(state);
            
            //for every object in action.data:
            for(var i=0;i<action.data.length;i++){
                if(!newdata.orderData[action.data[i].id])
                    newdata.orderData[action.data[i].id]=action.data[i];
                else {
                    newdata.orderData[action.data[i].id]=Object.assign(newdata.orderData[action.data[i].id],action.data[i]);
                }
            }
            return newdata;

        case GET_INVOICES:
            var newdata = Object.assign({}, state);
            //newdata.clientData=[].concat(action.clientData);
            newdata.invoicesData = Object.assign(action.invoices);
            newdata.gottenInvoices = true;
            //newdata.loading=action.loading;
            state = Object.assign({}, state, newdata);
            return state;

        case GET_CONTRACTS:
            var newdata = Object.assign({}, state);
            newdata.contractsData = Object.assign(action.contracts);
            newdata.gottenContracts = true;
            state = Object.assign({}, state, newdata);
            return state;

        case GET_NOT_SIGNED_CONTRACTS:
            /*deprecated*/
            var newdata = Object.assign({}, state);
            newdata.notSignedContractsData = Object.assign(action.contracts);
            state = Object.assign({}, state, newdata);
            return state;

        case GET_ANGEL_CONTRACTS:
            var newdata = Object.assign({}, state);
            newdata.angelContractsData = Object.assign(action.contracts);
            newdata.gottenAngelContracts = true;
            state = Object.assign({}, state, newdata);
            return state;

        case GET_NOT_SIGNED_ANGEL_CONTRACTS:
            /*deprecated*/
            var newdata = Object.assign({}, state);
            newdata.notSignedAngelContractsData = Object.assign(action.contracts);
            state = Object.assign({}, state, newdata);
            return state;

        case SET_NOT_SIGNED_CONTRACTS_CHECKED:
            var newdata = Object.assign({}, state);
            newdata.isNotSignedContractChecked = Object.assign(action.value);
            state = Object.assign({}, state, newdata);
            return state;

        case GET_SEPA_DOCUMENTS:
            var newdata = Object.assign({}, state);
            newdata.sepaDocuments = Object.assign(action.docs);
            newdata.gottenSepaDocuments = true;
            state = Object.assign({}, state, newdata);
            return state;

        case GET_INVITATIONS:
            var newdata = Object.assign({}, state);
            newdata.invitations = Object.assign(action.data);
            newdata.gottenInvitations = true;
            state = Object.assign({}, state, newdata);
            return state;

        case RESET_INVOICE_REDUCER:
            state = Object.assign({}, state, {
                orderData:{},
                invoicesData: null,
                gottenInvoices: false,
                clientData: null,
                providerData:null,
                products: null,
                loaded: false,
                contractsData: null,
                gottenContracts: false,
                angelContractsData: null,
                gottenAngelContracts: false,
                notSignedContractsData: [],
                notSignedAngelContractsData: [],
                isNotSignedContractChecked: false,
                sepaDocuments: null,
                gottenSepaDocuments: false,
                invitations: [],
                gottenInvitations: false
            });
            return state;

        case RESET_GOTTEN_INVOICES:
            state = Object.assign({}, state, {gottenInvoices: false});
            return state;

        case RESET_GOTTEN_CONTRACTS:
            state = Object.assign({}, state, {gottenContracts: false});
            return state;

        case RESET_GOTTEN_ANGEL_CONTRACTS:
            state = Object.assign({}, state, {gottenAngelContracts: false});
            return state;

        case RESET_GOTTEN_SEPA_DOCUMENTS:
            state = Object.assign({}, state, {gottenSepaDocuments: false});
            return state;

        case RESET_GOTTEN_INVITATIONS:
            state = Object.assign({}, state, {gottenInvitations: false});
            return state;

       case GET_FACTURAE:
            var newdata = Object.assign({}, state);
            //TODO
           return state;

        case INVOICE_WIPE_DATA:
            state = Object.assign({}, state, {
                //isNotSignedContractChecked: false,
                gottenInvoices: false,
                gottenContracts: false,
                gottenAngelContracts: false,
                gottenSepaDocuments: false,
                gottenInvitations: false
            });
            return state;

        default:
            return state;
    }
};

export default invoiceReducer;
