'use strict';

import React, { Component } from 'react';
import {Text} from 'react-native';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';

import moment from 'moment';

class RealtimeCountdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            interval: null,
            endTime: this.props.endTime,
            remainingTime: this.props.endTime-Date.now()/1000
        };
        
        //clearTimeout(this.state.realtimeInterval); 
       this.startInterval();
    }

    startInterval(){
        this.state.interval = setInterval(() => {
            var remainingTime=this.state.endTime-Date.now()/1000;
            this.setState({remainingTime: remainingTime>0?remainingTime:0});
            if(Date.now()/1000>this.state.endTime){
                if(this.props.onEnd)this.props.onEnd();
                clearInterval(this.state.interval);
                this.state.interval=null;
            }else{
                if(this.props.onTick)this.props.onTick( remainingTime>0?this.getRealtimeRemainingTime():"");
            }
        }, 1000);   
    }

    componentWillReceiveProps(nextProps) {
        
        if (this.state.endTime != nextProps.endTime) {
            this.setState({endTime: nextProps.endTime});
            if(this.state.interval==null)this.startInterval();
        }
    }
    
    componentWillUnmount = () => {
        if (this.state.interval != null)
            clearInterval(this.state.interval);
    }

    render() {
        
        var {style,textOnEnd,hidden}=this.props;

        var remainingTime = this.state.remainingTime>0 && textOnEnd?this.getRealtimeRemainingTime():textOnEnd;

        if(hidden)return null;
        return (
            <Text style={[{fontWeight: "bold", fontSize: 20},style]}>{remainingTime}</Text>
        );  

    }
    
    getRealtimeRemainingTime() {
        var {format}=this.props;
        var remainingTime = this.state.remainingTime;
        
        if (remainingTime >= 3600)
            return moment.utc(remainingTime * 1000).format(format?format:"hh:mm:ss");
        else
            return moment.utc(remainingTime * 1000).format(format?format:"mm:ss");        
    }
};


function mapStateToProps(state, props) {
    return {
     
    };
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {

        }
    };
}

var style = {

};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, RealtimeCountdown));
