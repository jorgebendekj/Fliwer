'use strict';

import React, { Component } from 'react';
var {Text, View, TouchableOpacity, Image} = require('react-native');

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {FliwerColors} from '../../utils/FliwerColors'

class CategoryBarView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            index: this.props.index ? this.props.index : 0
        };
    }

    componentDidUpdate(prevProps, nextState)
    {

        if (this.props.index!=prevProps.index && this.state.index!=this.props.index)
        {
            this.setState({index: this.props.index});
        }

    }

    goto(indexCategory) {
//        console.log("goto indexCategory", indexCategory);
        this.setState({index: indexCategory})
        this.props.getCategoryID(indexCategory);
    }

    _goto(indexCategory) {
        return () => {
            this.goto(indexCategory)
        };
    }

    render() {
        var {children, style, bodyStyle} = this.props;

        return (
            <View style={[this.style.container, style]}>
                {/*this.props.visible ? this.renderBarCategory() : []*/}
                <View style={[this.style.body, bodyStyle]}>
                    {children[this.state.index] ? children[this.state.index].props.children : []}
                </View>
            </View>
        );
    }

    renderBarCategory()
    {
        return(
                <View style={[this.style.header, this.props.headerStyle]}>
                    {this.renderHeader()}
                </View>);
    }

    renderHeader() {
        var {children} = this.props;

        //console.log("renderHeader children", children);
        var indents = [], indexCategory, key, source;
        for (var i = 0; i < children.length; i++) {
            if (this.props.children[i])
            {
                //console.log("renderHeader children props", this.props.children[i].props);
                indexCategory = i; //children[i].props.idCat? children[i].props.idCat : i;
                //console.log("renderHeader indexCategory", indexCategory);
                key = "cbw_" + indexCategory;
                source = (i == this.state.index) ? children[i].props.icon : (children[i].props.iconDisabled? children[i].props.iconDisabled : children[i].props.icon);

                var isSourceString = (source && (typeof source === 'string'));
                var isUrl = (isSourceString && source.indexOf("http") !== -1);

                indents.push(
                        <TouchableOpacity style={[this.style.iconTouchable, (i == this.state.index) ? this.style.selectedTabContainer : {}]} activeOpacity={1} key={key} onPress={this._goto(indexCategory)}>
                            <View style={this.style.iconInside}>
                                <Image style={[{width: 37, height: 37, borderRadius: 20}]} draggable={false} resizeMode={"cover"} source={isUrl? {uri: source} : source}/>
                            </View>
                        </TouchableOpacity>
                        );
            }
        }

        return indents;
    }

};

var style = {
    container: {
        width: "100%",
//        borderColor: "red",
//        borderWidth: 3,
        flex: 1
    },
    header: {
        height: 50,
        width: "100%",
        display: "flex",
        backgroundColor: "rgb(66,66,66)",
        flexDirection: "row",
        borderBottomColor: "rgb(140, 140, 140)",
        borderBottomWidth: 1,
        justifyContent: "space-around",
        alignItems: "center"
    },
    tabContainer: {
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 15
    },
    selectedTabContainer: {
//        borderRadius: 8,
//        backgroundColor: "gray"
    },
    body: {
        width: "100%",
        flex: 1
    }
};

//Connect everything
export default mediaConnect(style, CategoryBarView);
