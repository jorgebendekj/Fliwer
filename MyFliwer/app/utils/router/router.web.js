import { HashRouter as Router, Route, Routes,  Link as _Link, Navigate, Outlet,
  useLocation,
  useNavigate,
  useParams } from "react-router-dom";
import {View as BackButton} from 'react-native';
import React, { Component,forwardRef } from 'react';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import * as ActionsTransition from '../../actions/transitionActions.js'; //Import your actions
import * as ActionsSession from '../../actions/sessionActions.js'; //Import your actions

import {store} from '../../store'; //Import the store


class CustomLink extends Component {

      state = {redirect:false}

      constructor(props){
        super(props);
      }

      setTransition(){
        var that=this;
        return function(){
          ActionsTransition.setTransition({animation:that.props.animation,easing:that.props.easing})(store.dispatch,store.getState);
          that.setState({redirect: true});
        }
      }

      render() {
        if (this.state.redirect) {
          return <Redirect push to={this.props.to} />;
        }
        return (
          <BackButton to={this.props.to} onClick={this.setTransition()} style={{cursor:"pointer"}}>{this.props.children}</BackButton>
        );
      }
}


var _CustomLink=withRouter(CustomLink);



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

/*
class RedirectLogin extends Component{
  render(){
    return (<Redirect to={'/start'} />)
  }
}
*/

/*
const PrivateRoute = () => {
  debugger;
    var session=ActionsSession.getSession()(store.dispatch, store.getState);
    const auth =  session.logedIn || !session.firstTryLogIn
    var location= useLocation();
    console.log("new url:",location.pathname)

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page

    return auth ? <Outlet /> : <Navigate to={'/start'} />;
}*/

class PrivateRoute extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        var location= this.props.location;
        //console.log("new url:",location.pathname,this.props,location)
        if (this.props.logedIn || !this.props.firstTryLogIn) {
            return (<Outlet/>)
        } else {
            return ( <Navigate to={'/start'} />)
        }
    }

}

const Route2 = function(){
    var location= useLocation();
    console.log("new url:",location.pathname)
    return (<Outlet/>)
}




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

export {Router,Route,_Route2 as PublicRoute,_PrivateRoute as PrivateRoute, Routes, _CustomLink as Link,Navigate as Redirect, withRouter,BackButton}
