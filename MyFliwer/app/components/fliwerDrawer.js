'use strict';

import React, { Component } from 'react';
import {StyleSheet, View, Animated, Text} from 'react-native';
import {Drawer, Avatar, ListItem  } from 'react-native-material-ui';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsSession from '../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../actions/languageActions.js'; //Import your actions

import { Link } from '../utils/router/router'

class FliwerDrawer extends Component {

    state = {
      moveAnim: new Animated.Value(0),  // Initial value for opacity: 0
      open:false
    }

    constructor(props) {
        super(props);
    }


    componentDidMount() {
      this.open();
    }

    open(){
      this.state.open=true;
      Animated.timing(                  // Animate over time
        this.state.moveAnim,            // The animated value to drive
        {
            toValue: this.state.moveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
            }),                   // Animate to opacity: 1 (opaque)
            duration: 5000,       // Make it take a while
            useNativeDriver: true
        }
      ).start();                // Starts the animation
    }

    close(){
      this.state.open=false;
      Animated.timing(                  // Animate over time
        this.state.moveAnim,            // The animated value to drive
        {
            toValue: this.state.moveAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
            }),                   // Animate to opacity: 1 (opaque)
            duration: 5000,       // Make it take a while
            useNativeDriver: true
        }
      ).start();                // Starts the animation
    }

    toggle(){
      if(this.state.open)this.close();
      else this.open();
    }


    render() {
        let { moveAnim } = this.state;
        return (
          <View style={styles.drawerView}>
            <Drawer>
              <Drawer.Header >
                  { this.renderHeaderSession() }
                  <Link to={`/`} animation="zoomIn" >
                      <Text>Components</Text>
                  </Link>
              </Drawer.Header>
              <Drawer.Section
                  divider
                  items={[
                      { icon: 'bookmark-border', value: 'Notifications' },
                      { icon: 'today', value: 'Calendar', active: true },
                      { icon: 'people', value: 'Clients' },
                  ]}
              />
              <Drawer.Section
                  title="Personal"
                  items={[
                      { icon: 'info', value: 'Info' },
                      { icon: 'settings', value: 'Settings' },
                  ]}
              />
            </Drawer>
          </View>
        )
    }

    renderHeaderSession(){
      if(this.props.logedIn){
        return (
          <Drawer.Header.Account
            avatar={<Avatar text="A" />}
            footer={{
                dense: true,
                centerElement: {
                    primaryText: 'Reservio',
                    secondaryText: 'business@email.com',
                },
                rightElement: 'arrow-drop-down',
            }}
          />
        )
      } else {
        return (
          <Text style={styles.description}>{"Not logged in."}</Text>
        )
      }
    }

};



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        sessionLoading: state.sessionReducer.loading,
        logedIn: state.sessionReducer.logedIn,
        sessionData: state.sessionReducer.data,
        language: state.languageReducer.language
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
      actions: {
        sessionActions: bindActionCreators(ActionsSession, dispatch),
        languageActions: bindActionCreators(ActionsLang, dispatch)
      }
    }
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps,null,{forwardRef: true})(FliwerDrawer);

var styles = StyleSheet.create({
    drawerView:{flex:1, width:"100%",height:"100%",zIndex: 2,backgroundColor: 'white', position:"absolute"}
});
