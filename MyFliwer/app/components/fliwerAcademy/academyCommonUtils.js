

import * as ActionsLang from '../../actions/languageActions.js';
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

const academyCommonUtils = {
    
    getColorByStatus: (status, isTicket) => {
        if (isTicket)
            switch (status) {
                case "solved":
                    return "#D0DF00";
                case "anulled":
                    return "#4A4A49";
                default:
                    // pending
                    return "#FE9148";
            }
        else
            switch (status) {
                case "finalized":
                    return "#D0DF00";
                default:
                    // inprocess
                    return "#7AB6F2";
            }
            
    },
  
    getStatusName: (status, isTicket, trans) => {
        if (isTicket)
            switch (status) {
                case "solved":
                    return trans.get('Academy_solved');// "Solventada";
                case "anulled":
                    return trans.get('Academy_anulled');// "Anulada";
                default:
                    // pending
                    return trans.get('Academy_pending');// "Pendiente";
            }
        else
            switch (status) {
                case "finalized":
                    return trans.get('Academy_finalized');// "Finalizada";
                default:
                    // inprocess
                    return trans.get('Academy_inprogress');// "En proceso";
            }
        
    },
    
    getFormattedNumber: (number, isTicket) => {
        
        var overText = "000000" + number;
        var numberText = overText.substring(overText.length - 6);
        
        if (isTicket)
            return "INC" + numberText;
        else
            return "AUD" + numberText;
    }

};

export {academyCommonUtils};
