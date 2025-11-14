'use strict';

import React, { Component } from 'react';
import { View, TextInput, ScrollView } from 'react-native'

import {actions, defaultActions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

class MyHtmlEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editor:null
        };
    }

    onPressAddImage() {

    }

    render() {
        const {onChange, disabled, height} = this.props;
        
        return (
            <View style={{width: "100%", borderWidth: 1, borderColor: "gray", borderTopLeftRadius: 4, borderTopRightRadius: 4}}>
                    <RichEditor
                        ref={(r) => this.richtext = r}
                        editorInitializedCallback={() => {
                            console.log("editorInitializedCallback");
                        }}
                        initialContentHTML={this.props.value}
                        onChange={(text) =>{
                            onChange(text);
                        }} 
                        disabled={disabled}
                        containerStyle={{borderTopLeftRadius: 4, borderTopRightRadius: 4}}
                        style={{}}
                        scrollEnabled={false}
                    />
                <RichToolbar
                    getEditor={() => this.richtext}
                    actions={[
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList//,
                            //actions.insertImage
                    ]}
                    disabled={disabled}
                    onPressAddImage={() => {
                        // insert URL
                        this.richtext.insertImage(
                            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png',
                        );                      
                    }}
                />        
            </View>
        );
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
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

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, MyHtmlEditor));
    
    
