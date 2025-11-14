import { NativeRouter as Router, Route, Routes, Link as _Link, Navigate, Outlet,  /*BackButton,*/
  useLocation,
  useNavigate,
  useParams } from "react-router-native";

import {TouchableOpacity, View as BackButton} from 'react-native';
import React, { Component, forwardRef } from 'react';
import * as ActionsTransition from '../../actions/transitionActions.js'; //Import your actions
import firebase from '../../utils/firebase/firebase';
import {store} from '../../store'; //Import the store

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

class CustomLink extends Component {

    state = {redirect: false}

    constructor(props) {
        super(props);
    }

    setTransition() {
        var that = this;
        return function () {
            ActionsTransition.setTransition({animation: that.props.animation, easing: that.props.easing})(store.dispatch, store.getState);
            that.setState({redirect: true});
        }
    }

    render() {
        if (this.state.redirect) {
            return <Navigate push to={this.props.to} />;
        }
        return (
                <TouchableOpacity to={this.props.to} onPress={this.setTransition()}>{this.props.children}</TouchableOpacity>
                );
    }
}



function withRouter(Component) {
    const ComponentWithRouterProp = forwardRef((props, ref) => {
      let location = useLocation();
      let navigate = useNavigate();
      let params = useParams();
      let url = location.pathname;
  
      return (
        <Component
          {...props}
          ref={ref}
          router={{ location, navigate, params }}
          match={{ location, navigate, params, url }}
          location={location}
          history={{
            goBack: () => { navigate(-1); }
          }}
        />
      );
    });

  return ComponentWithRouterProp;
}

var _CustomLink = withRouter(CustomLink);

/*
class RedirectLogin extends Component {
    render() {
        return (<Navigate to={'/start'} />)
    }
}
*/


class PrivateRoute extends Component {

    constructor(props) {
        super(props)
    }

    render() {
      var location= this.props.location;
      console.log("new url:",location.pathname)
        if (location.pathname)
            firebase.crashlytics().setAttribute("url", location.pathname);
        if (this.props.logedIn || !this.props.firstTryLogIn) {
            return (<Outlet/>)
        } else {
            return ( <Navigate to={'/start'} />)
        }
    }

}


const Route2 = () => {
    var location= useLocation();
    console.log("new url:",location.pathname)
    if (location.pathname)
        firebase.crashlytics().setAttribute("url", location.pathname);
    return (<Outlet/>)
}

/*
class Route2 extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        if (this.props.computedMatch.url)
            firebase.crashlytics().setAttribute("url", this.props.computedMatch.url);
        return (<Route {...this.props}/>)
    }

}
*/



function mapStateToProps(state, props) {
    return {
        logedIn: state.sessionReducer.logedIn,
        firstTryLogIn: state.sessionReducer.firstTryLogIn
    }
}

function mapDispatchToProps(dispatch) {
    return {
    }
}


var _PrivateRoute=withRouter(connect(mapStateToProps, mapDispatchToProps)(PrivateRoute));
var _Route2 = Route2;

export {Router,Route,_Route2 as PublicRoute, _PrivateRoute as PrivateRoute, Routes, _CustomLink as Link, Navigate as Redirect, withRouter, BackButton}
