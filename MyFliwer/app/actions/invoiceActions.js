export const GET_CLIENT_INFORMATION = 'GET_CLIENT_INFORMATION';
export const GET_PROVIDER_INFORMATION = 'GET_PROVIDER_INFORMATION';
export const GET_PRODUCTS = 'GET_PRODUCTS';
export const PUT_PRODUCTS = 'PUT_PRODUCTS';
export const EDIT_PRODUCTS = 'EDIT_PRODUCTS';
export const DELETE_PRODUCTS = 'DELETE_PRODUCTS';
export const GET_CART = 'GET_CART';
export const PUT_CART = 'PUT_CART';
export const EDIT_CART = 'EDIT_CART';
export const DELETE_ITEM_CART = 'DELETE_ITEM_CART';
export const DELETE_CART = 'DELETE_CART';
export const PUT_INVOICE = 'PUT_INVOICE';
export const GET_INVOICES = 'GET_INVOICES';
export const GET_ORDERS = 'GET_ORDERS';
export const GET_CONTRACTS = 'GET_CONTRACTS';
export const GET_NOT_SIGNED_CONTRACTS = 'GET_NOT_SIGNED_CONTRACTS';
export const SET_NOT_SIGNED_CONTRACTS_CHECKED = 'SET_NOT_SIGNED_CONTRACTS_CHECKED';
export const GET_SEPA_DOCUMENTS = 'GET_SEPA_DOCUMENTS';
export const INVOICE_WIPE_DATA = 'INVOICE_WIPE_DATA';
export const SET_ACADEMY_INVITATION = 'SET_ACADEMY_INVITATION';
export const GET_INVITATIONS = 'GET_INVITATIONS';
export const GET_ANGEL_CONTRACTS = 'GET_ANGEL_CONTRACTS';
export const GET_NOT_SIGNED_ANGEL_CONTRACTS = 'GET_NOT_SIGNED_ANGEL_CONTRACTS';
export const RESET_GOTTEN_INVOICES = 'RESET_GOTTEN_INVOICES';
export const RESET_GOTTEN_CONTRACTS = 'RESET_GOTTEN_CONTRACTS';
export const RESET_GOTTEN_SEPA_DOCUMENTS = 'RESET_GOTTEN_SEPA_DOCUMENTS';
export const RESET_GOTTEN_INVITATIONS = 'RESET_GOTTEN_INVITATIONS';
export const RESET_GOTTEN_ANGEL_CONTRACTS = 'RESET_GOTTEN_ANGEL_CONTRACTS';
export const GET_FACTURAE = 'GET_FACTURAE';
export const RESET_INVOICE_REDUCER = 'RESET_INVOICE_REDUCER';

import { invoiceService } from '../utils/apiService.js';

import * as ActionsAcademy from '../actions/academyActions.js'; //Import your actions

export function getClientInformation(idUser) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getClientInformation(idUser).then((response) => {
                dispatch({type: GET_CLIENT_INFORMATION, clientData: response});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function resetProviderData(){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: GET_PROVIDER_INFORMATION, providerData: null});
            resolve();
        });
    }

}

export function getProviderInformation(idUser) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getClientInformation(idUser).then((response) => {
                dispatch({type: GET_PROVIDER_INFORMATION, providerData: response});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function getOrders(options){
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getOrders(options).then((response) => {
                dispatch({type: GET_ORDERS, data: response});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
    
}

export function getCart(cartData) {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch({ type: GET_CART, cart: cartData });
      resolve(cartData);
    });
  };
}

export function putCart(newItem) {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch({ type: PUT_CART, item: newItem });
      resolve(newItem);
    });
  };
}

export function editCart(editedItem) {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch({ type: EDIT_CART, item: editedItem });
      resolve(editedItem);
    });
  };
}

export function deleteItemCart(itemId) {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch({ type: DELETE_ITEM_CART, itemId });
      resolve(itemId);
    });
  };
}

export function deleteCart() {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch({ type: DELETE_CART });
      resolve();
    });
  };
}
export function putAmendedBill(idOrder,data) {
    console.log("putAmendedBill", idOrder);
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.putAmendedBill(idOrder,data).then((response) => {
                console.log("putAmendedBill response", response);
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("putAmendedBill error", error);
            });
        });
    }
}

export function addFacturae(idOrder,idAmendedBill) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addFacturae(idOrder,idAmendedBill).then((response) => {
                //dispatch({type: GET_FACTURAE,facturae: response.facturae,idOrder:idOrder,idAmendedBill:idAmendedBill});
                resolve(response.facturae);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function signFacturae(id,data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.signFacturae(id,data).then((response) => {
                //dispatch({type: GET_FACTURAE,facturae: response.facturae,idOrder:idOrder,idAmendedBill:idAmendedBill});
                resolve(response.facturae);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function downloadFacturae(idOrder,idAmendedBill,fileName) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.downloadFacturae(idOrder,idAmendedBill,fileName).then((response) => {
                resolve();
            }, reject);

        })
    }
}

export function getInvoices(data) { //Deprecated
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    invoiceService.getInvoices().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: GET_INVOICES, invoices: response});
                resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    }
}

export function getInvoice(idOrder) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getInvoices(idOrder).then((response) => {
                resolve(response[0]);
            }, (error) => {
                reject(error)
            });
        });
    };
}


export function getAmendedBillReasonCodes() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            //in the future this information can be stored
            invoiceService.getAmendedBillReasonCodes().then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function getMinBillDate(idUser){
  return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
          //in the future this information can be stored
          invoiceService.getMinBillDate(idUser).then((response) => {
              resolve(response);
          }, (error) => {
              reject(error)
          });
      });
  };
}

export function deleteFields(idFields) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.deleteFields(idFields).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function convertOrderToInvoice(idOrder, dateInvoiceCustom, isRecurrent, dayOfMonth, sendEmail, emailAddress, dueDays, invoicingPeriodStart, invoicingPeriodEnd) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.convertOrderToInvoice(idOrder, dateInvoiceCustom, isRecurrent, dayOfMonth, sendEmail, emailAddress, dueDays, invoicingPeriodStart, invoicingPeriodEnd).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    }
}

export function modifyOrderBill(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyOrderBill(idOrder, data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyOrderBill error", error);
            });
        });
    }
}

export function getDownloadFile(url, name, asBase64) {
    console.log("getDownloadFile action");
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getDownloadFile(url, name,asBase64).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        })
    }
}

export function setBillStatus(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.setBillStatus(idOrder, data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("setBillStatus error", error);
            });
        });
    }
}

export function setOrderStatus(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.setOrderStatus(idOrder, data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("setOrderStatus error", error);
            });
        });
    }
}

export function addTickets(idOrder, tickets) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addTickets(idOrder, tickets).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("addTickets error", error);
            });
        });
    }
}

export function removeTicket(idOrder, idTicket) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.removeTicket(idOrder, idTicket).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("removeTicket error", error);
            });
        });
    }
}

export function getTicketsByIdUser(idUser) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getTicketsByIdUser(idUser).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("getTicketsByIdUser error", error);
            });
        });
    };
}

export function setRecurrence(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.setRecurrence(idOrder, data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("setRecurrence error", error);
            });
        });
    };
}

export function resendInvoiceEmail(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.resendInvoiceEmail(idOrder, data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("resendInvoiceEmail error", error);
            });
        });
    };
}

export function resendOrderEmail(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.resendOrderEmail(idOrder, data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("resendOrderEmail error", error);
            });
        });
    };
}

export function addFilesToOrder(idOrder, data, files) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addFilesToOrder(idOrder, data, files).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("addFilesToOrder error", error);
            });
        });
    }
}

export function addFilesToBill(idBill, data, files) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addFilesToBill(idBill, data, files).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("addFilesToBill error", error);
            });
        });
    };
}

export function deleteFileFromOrder(idOrder, idFile) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.deleteFileFromOrder(idOrder, idFile).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("deleteFileFromOrder error", error);
            });
        });
    };
}

export function signOrder(idOrder, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.signOrder(idOrder, data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("signOrder error", error);
            });
        });
    }
}

export function canDeleteOrder(idOrder){
  return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
          invoiceService.canDeleteOrder(idOrder).then((response) => {
              /*
                response:
                {
                    canDelete:true,
                    canCreateAmendedBill:true
                }
              */
              resolve(response);
          }, (error) => {
              reject(error)
              console.log("canDeleteOrder error", error);
          });
      });
  }
}

export function deleteOrder(idOrder){
  return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
          invoiceService.deleteOrder(idOrder).then((response) => {
              /*
                response:
                {
                    canDelete:true,
                    canCreateAmendedBill:true
                }
              */
              dispatch({type: RESET_GOTTEN_INVOICES});
              resolve(response);
          }, (error) => {
              reject(error)
              console.log("canDeleteOrder error", error);
          });
      });
  }
}

export function deleteFileFromBill(idBill, idFile) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.deleteFileFromBill(idBill, idFile).then((response) => {
                dispatch({type: RESET_GOTTEN_INVOICES});
                resolve(response);
            }, (error) => {
                reject(error);
                console.log("deleteFileFromBill error", error);
            });
        });
    };
}

export function modifyContract(idContract, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyContract(idContract, data).then((response) => {
                dispatch({type: RESET_GOTTEN_CONTRACTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyContract error", error);
            });
        });
    }
}

export function signContract(idContract, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.signContract(idContract, data).then((response) => {
                dispatch({type: RESET_GOTTEN_CONTRACTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("signContract error", error);
            });
        });
    }
}

export function getContracts(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    invoiceService.getContracts().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((contracts) => {

                var notSignedContracts = [];
                for (let i = 0; i < contracts.length; i++) {
                    let contract = contracts[i];
                    //console.log("contract", contract);
                    if (!contract.signed || !contract.signedByOwner || !contract.signedByAngel)
                        notSignedContracts.push(contract);
                }

                dispatch({type: GET_NOT_SIGNED_CONTRACTS, contracts: notSignedContracts});
                dispatch({type: GET_CONTRACTS, contracts: contracts});
                resolve(contracts);

            }, (err) => {
                reject(err);
            });
        });
    }
}

export function getNotSignedContracts(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    invoiceService.getContracts('not-signed').then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: GET_NOT_SIGNED_CONTRACTS, contracts: response});
                resolve(response);

            }, (err) => {
                reject(err);
            });
        });
    };
}

export function setNotSignedContractsChecked(value) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: SET_NOT_SIGNED_CONTRACTS_CHECKED, value: value});
            resolve();
        });
    }
}

export function getSepaDocuments(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    invoiceService.getSepaDocuments().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: GET_SEPA_DOCUMENTS, docs: response});

                var invDoc = getState().academyReducer.invitation;
                if (invDoc && invDoc.invitationType == 'sepa')
                    ActionsAcademy.addInvitationSepa(invDoc, response)(dispatch, getState).then(function (response2) {
                        resolve(response2);
                    });
                else
                    resolve(response);
            }, (err) => {
                reject(err);
            });
        });
    };
}


export function getSepaDocument(options){
    //options: {urlUUID:this.state.urlUUID}
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getSepaDocument(options).then((response) => {
                dispatch({type: GET_SEPA_DOCUMENTS, docs: response});
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function getSepaAuthorization() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getSepaAuthorization().then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
            });
        });
    };
}

export function addSepa(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addSepa(data).then((response) => {
                dispatch({type: RESET_GOTTEN_SEPA_DOCUMENTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("addSepa error", error);
            });
        });
    };
}

export function modifySepa(idSepa, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifySepa(idSepa, data).then((response) => {
                dispatch({type: RESET_GOTTEN_SEPA_DOCUMENTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifySepa error", error);
            });
        });
    };
}

export function signSepa(idSepa, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.signSepa(idSepa, data).then((response) => {
                dispatch({type: RESET_GOTTEN_SEPA_DOCUMENTS});

                var doc = response.sepa;
                var invDoc = getState().academyReducer.invitation;
                if (invDoc && invDoc.invitationType == 'sepa') {
                    if (invDoc.id == doc.id) {
                        doc.invitationType = 'sepa';
                        dispatch({type: SET_ACADEMY_INVITATION, invitation: doc});
                    }
                    resolve(doc);
                }
                else
                    resolve(doc);

            }, (error) => {
                reject(error)
                console.log("signSepa error", error);
            });
        });
    }
}

export function getInvitations(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    invoiceService.getInvitations().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: GET_INVITATIONS, data: response});
                resolve(response);

            }, (err) => {
                reject(err);
            });
        });
    };
}

export function addInvitation(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addInvitation(data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVITATIONS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("addInvitation error", error);
            });
        });
    };
}

export function modifyInvitation(idInvitation, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyInvitation(idInvitation, data).then((response) => {
                dispatch({type: RESET_GOTTEN_INVITATIONS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyInvitation error", error);
            });
        });
    };
}

export function addAngelContract(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addAngelContract(data).then((response) => {
                dispatch({type: RESET_GOTTEN_ANGEL_CONTRACTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("addAngelContract error", error);
            });
        });
    };
}

export function getAngelContracts(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data != null && data != undefined)
                    resolveApi(data);
                else
                    invoiceService.getAngelContracts().then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((contracts) => {

                var notSignedAngelContracts = [];
                for (let i = 0; i < contracts.length; i++) {
                    let contract = contracts[i];
                    if (!contract.signedByOwner || !contract.signedByAngel)
                        notSignedAngelContracts.push(contract);
                }

                dispatch({type: GET_NOT_SIGNED_ANGEL_CONTRACTS, contracts: notSignedAngelContracts});
                dispatch({type: GET_ANGEL_CONTRACTS, contracts: contracts});
                resolve(contracts);
            }, (err) => {
                reject(err);
            });
        });
    };
}

export function getAngelContract(options){
    //options: {urlUUID:this.state.urlUUID}
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getAngelContract(options).then((response) => {
                var notSignedAngelContracts = [];
                if (!response.contract.signedByOwner || !response.contract.signedByAngel)
                    notSignedAngelContracts.push(response.contract);

                var contracts=[response.contract];

                dispatch({type: GET_NOT_SIGNED_ANGEL_CONTRACTS, contracts: notSignedAngelContracts});
                dispatch({type: GET_ANGEL_CONTRACTS, contracts: contracts});
                resolve(response.contract);

            }, (error) => {
                reject(error)
            });
        });
    };
}

export function getNotSignedAngelContracts(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            new Promise((resolveApi, rejectApi) => {
                if (data)
                    resolveApi(data);
                else
                    invoiceService.getAngelContracts('not-signed').then((response) => {
                        resolveApi(response);
                    }, (error) => {
                        rejectApi(error)
                    });

            }).then((response) => {
                dispatch({type: GET_NOT_SIGNED_ANGEL_CONTRACTS, contracts: response});
                resolve(response);

            }, (err) => {
                reject(err);
            });
        });
    };
}

export function modifyAngelContract(idContract, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyAngelContract(idContract, data).then((response) => {
                dispatch({type: RESET_GOTTEN_ANGEL_CONTRACTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyContract error", error);
            });
        });
    }
}

export function modifyGenericContract(idContract, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyGenericContract(idContract, data).then((response) => {
                dispatch({type: RESET_GOTTEN_ANGEL_CONTRACTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyContract error", error);
            });
        });
    }
}

export function addContractTemplate(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.addContractTemplate(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("addContractTemplate error", error);
            });
        });
    }
  }


  export function modifyContractTemplate(idTemplate,data) {
      return (dispatch, getState) => {
          return new Promise((resolve, reject) => {
              invoiceService.modifyContractTemplate(idTemplate,data).then((response) => {
                  resolve(response);
              }, (error) => {
                  reject(error)
                  console.log("addContractTemplate error", error);
              });
          });
      }
  }

  export function deleteContractTemplate(idTemplate) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.deleteContractTemplate(idTemplate).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("deleteContractTemplate error", error);
            });
        });
    }
  }

export function signAngelContract(idContract, data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.signAngelContract(idContract, data).then((response) => {
                dispatch({type: RESET_GOTTEN_ANGEL_CONTRACTS});
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("signAngelContract error", error);
            });
        });
    }
}

export function getParentHtmlAngelContract() {
  return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
          invoiceService.getParentHtmlAngelContract().then((response) => {
              resolve(response);
          }, (error) => {
              reject(error)
          });
      });
  };
}

export function getContractTemplates() {
  return (dispatch, getState) => {
      return new Promise((resolve, reject) => {
          invoiceService.getContractTemplates().then((response) => {
              resolve(response);
          }, (error) => {
              reject(error)
          });
      });
  };
}

export function modifyParentAngelContract(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyParentAngelContract(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyParentAngelContract error", error);
            });
        });
    }
}

export function deleteAngelContract(idContract) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch({type: RESET_GOTTEN_ANGEL_CONTRACTS});
            invoiceService.deleteAngelContract(idContract).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error);
            });
        });
    };
}

export function getParentHtmlContract() {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.getParentHtmlContract().then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
            });
        });
    };
}

export function modifyParentContract(data) {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            invoiceService.modifyParentContract(data).then((response) => {
                resolve(response);
            }, (error) => {
                reject(error)
                console.log("modifyParentContract error", error);
            });
        });
    }
}

export function wipeData() {
    return (dispatch) => {
        return new Promise(function (resolve, reject) {
            dispatch({type: RESET_INVOICE_REDUCER});
            dispatch({type: INVOICE_WIPE_DATA});
            resolve();
        });
    };
}
