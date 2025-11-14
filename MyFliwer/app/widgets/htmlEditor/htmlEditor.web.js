'use strict';

import React, { Component } from 'react';
import { View, TextInput } from 'react-native'

import JoditEditor from "jodit-react";

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

    render() {
        const {onChange, disabled, height, removeButtons} = this.props;
        
        var removeB = ['fullsize', 'about', 'video', 'print', 'superscript', 'subscript', 'file', 'copyformat', 'eraser'];
        // Items to remove: addcolumn, addrow, attachment, bin, bold, brush, cancel, check, source, eraser, folder, font, fullsize, image, indent-decrease, indent-increase, italic, link, ol, ul, list2, lock, menu, merge, hr, center, justify, left, right, pencil, paragraph, plus, redo, resize, shrink, splitg, splitv, strikethrough, table, fontsize, underline, undo, unlock, update, upload, valign                        
        if (removeButtons)
            removeB = removeB.concat(removeButtons);
        
        return (
            <View style={{width: "100%"}}>
                <JoditEditor
                    ref={obj => this.state.editor = obj}
                    value={this.props.value}
                    config={{
                        // all options from https://xdsoft.net/jodit/doc/
                        readonly: false,
                        disabled: disabled,
                        height: height,
                        enableDragAndDropFileToEditor: true,
                        imageDefaultWidth: 100,
                        uploader: {
                            insertImageAsBase64URI: true,
                            url: 'file/upload',
                            isSuccess: function (resp) {
                                return resp;
                            },
                            process: function (resp) {                       
                                return {
                                    files: resp.data.files,
                                    path: resp.data.path,
                                    baseurl: resp.data.baseurl,
                                    error: resp.data.error,
                                    message: resp.data.message
                                }
                            },
                            defaultHandlerSuccess: function (data) {
                                var i, field = 'files';                      
                                if (data[field] && data[field].length) {
                                    for (i = 0; i < data[field].length; i += 1) {
                                        this.selection.insertImage(data.baseurl + data[field][i]);
                                    }
                                }
                            }
                        },          
                        removeButtons: removeB,
                        enter: 'br'/*,
                        zIndex: 0,
                        activeButtonsInReadOnly: ['source', 'fullsize', 'print', 'about'],
                        toolbarButtonSize: 'middle',
                        theme: 'default',
                        enableDragAndDropFileToEditor: true,
                        saveModeInCookie: false,
                        spellcheck: true,
                        editorCssClass: false,
                        triggerChangeEvent: true,
                        direction: 'ltr',
                        language: 'en',
                        debugLanguage: false,
                        i18n: 'en',
                        toolbar: true,
                        useSplitMode: false,
                        colorPickerDefaultTab: 'background',
                        imageDefaultWidth: 100,
                        disablePlugins: ['paste', 'stat'],
                        events: {},
                        textIcons: false*/
                    }}
                    tabIndex={1}
                    onBlur={(obj) =>{
                        //console.log("onBlur", obj);
                    }} 
                    onChange={(text) =>{
                        onChange(text);
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
    
    
