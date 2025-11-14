'use strict';

import React, { Component } from 'react';
import {StyleSheet, View, Image, Text, Platform, TouchableOpacity} from 'react-native';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {FliwerColors,CurrentTheme} from '../utils/FliwerColors'
import {mediaConnect} from '../utils/mediaStyleSheet.js'
import FliwerCalmButton from '../components/custom/FliwerCalmButton.js'

import { Redirect } from '../utils/router/router'

import fliwer_logo_app_dark  from '../assets/img/logo_fliwer_new_dark.png'
import fliwer_logo_app_light  from '../assets/img/logo_fliwer_new_light.png'

class MainFliwerTopBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            returnHome: false,
            goProfile: false
        };

    }

    render() {

        var indents=[];

        if (this.state.returnHome)
        {
            this.setState({returnHome: false})
            indents.push(<Redirect push to={"/app/"+this.props.defaultApp} />)
        } else if (this.state.goProfile) {
            this.setState({goProfile: false})
            indents.push(<Redirect push to={"/profile"}/>)
        }

        indents.push(
            <View style={[this.style.bar, this.props.barStyle, {backgroundColor: CurrentTheme.topBar}]}>
                {this.showMainBar()?this.renderMainBar():null}
                {/*this.showTextBar()?this.renderTextBar():*/null}
            </View>

        )

        return indents;
        
    }

    renderMainBar() {
        var {title} = this.props;
        return (
            <View style={[this.style.mainBar, this.showTextBar()?{borderBottomColor: CurrentTheme.topBar,}:{borderBottomWidth:0}]}>
                <TouchableOpacity style={{/*flex: 1, */marginLeft: 8}} onPress={()=>{this.setState({returnHome: true})}}>
                    {this.renderFliwerLogoApp()}
                </TouchableOpacity>

                <View style={this.style.zoneTitleSpace}>
                    <View style={this.style.zoneTitleSpaceIn}>
                        <Text ellipsizeMode='tail' numberOfLines={1} style={this.style.textCenter}>{title}</Text>
                    </View>
                </View>

                <View style={{flexDirection: "row", height: "100%", width: 50, padding: 5, justifyContent: "center" }}>
                    {this.renderProfile()}
                </View>
            </View>
        );
    }

    renderTextBar() {
        return (
            <View style={[this.style.textBar, {}]}>
                {this.renderTextBarContent()}
            </View>
        );
    }

    renderFliwerLogoApp()
    {
        return (<Image style={{width: 150, height: 30}} resizeMode={"contain"} source={CurrentTheme.type=='light'?fliwer_logo_app_dark:fliwer_logo_app_light} draggable={false}/>)
    }

    renderProfile()
    {
        return (
            <FliwerCalmButton
                containerStyle={{marginLeft: 8}}
                buttonStyle={this.style.buttonRight}
                imageData={{
                    style: this.style.buttonRightIn,
                    source: {uri: this.props.userData.photo_url},
                    resizeMode: "cover",
                    draggable: false
                }}
                onPress={async () => {
                    if (typeof this.props.onPressCheckSSID === 'function')
                    {
                        await this.props.onPressCheckSSID().then(() => {
                            this.goProfilePressed();
                        });
                    } else
                        await this.goProfilePressed();
                }}
            />
        );
    }

    renderTextBarContent() {
        var {title} = this.props;

        if (this.props.mode == 'zone') {
            var displaynone = {};
            if (!this.props.textIcon)
                displaynone = {display: "none"}

            return(
                    <View style={this.style.zoneSpace}>
                        {typeof this.props.onPressPreviousGarden === 'function'?<FliwerCalmButton
                            containerStyle={{}}
                            buttonStyle={[{marginLeft: 10}]}
                            iconData={{
                                style: this.style.eyeIcon,
                                name: "chevron-left"
                            }}
                            onPress={() => {
                                this.props.onPressPreviousGarden();
                            }}
                        />:null}

                        <View style={this.style.zoneTitleSpace}>
                            <View style={this.style.zoneTitleSpaceIn}>
                                <Text ellipsizeMode='tail' numberOfLines={1} style={this.style.textCenter}>{title}</Text>
                            </View>
                        </View>

                        {typeof this.props.onPressNextGarden === 'function'?<FliwerCalmButton
                            containerStyle={{}}
                            buttonStyle={[{marginRight: 10}]}
                            iconData={{
                                style: this.style.eyeIcon,
                                name: "chevron-right"
                            }}
                            onPress={() => {
                                this.props.onPressNextGarden();
                            }}
                        />:null}

                    </View>
                    )
        } else {
            var items = [];
            if (title)
                items.push(<Text ellipsizeMode='tail' numberOfLines={1} key={1} style={this.style.textCenter}>{title}</Text>)
            return items;
        }

    }

    goProfilePressed() {
        this.setState({goProfile: true});
    }

    showTextBar() {
        if (!this.props.showTextBar)
            return false;

        //return this.props.title? true : false;
        return true;

    }

    showMainBar() { 
        return this.props.hideMainBar? false : true;
    }

    async returnHome() {
        if (this.props.creatingZone)
            await this.props.actions.createZoneActions.stopCreatingNewZone();
        if (this.props.isModifyingZone)
            await this.props.actions.modifyZoneActions.stopModifyingZone();

        this.setState({returnHome: true});

    }

};


function mapStateToProps(state, props) {
    return {
        loading: state.sessionReducer.loading,
        userData: state.sessionReducer.data,
        defaultApp: state.sessionReducer.defaultApp
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {

        }
    };
}


var styles = {
    bar: {
        zIndex: 2,
        alignItems: 'center',
        justifyContent: "center",
        borderBottomColor: "@theme primaryCoñpr",
        borderBottomWidth: 1, 
        width: "100%"
    },
    mainBar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        borderBottomWidth: 1,
        width: "100%"
    },
    textBar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
//        borderBottomColor: '#aaaaaa',
//        borderBottomWidth: 1,
        width: "100%",
        paddingLeft: 10,
        paddingRight: 10
    },
    eyeIcon: {
        fontSize: 29,
        textAlign: "center",
        zIndex: 1,
        //height:30,
        color: "back"
    },
    buttonRight: {
        flex: 1
    },
    buttonRightIn: {
        height: 30,
        width: 30,
        borderRadius: 500,
        top: 0
    },
    textCenter: {
        textAlign: 'center',
        justifyContent: 'center',
        flex: 5,
        fontFamily: "XenoisSoftPro-Bold",
        fontSize: 16,
        color: "@theme primaryText"
//        color: FliwerColors.primary.gray
    },
    zoneSpace: {
        flex: 1,
        display: "flex",
        flexDirection: "row",
        height: 40,
        alignItems: "center",
    },
    zoneTitleSpace: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

    },
    "@media (orientation:landscape)": {
        zoneSpace: {
        },
        zoneTitleSpace: {
        },
        zoneTitleSpaceIn: {
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }
    },
    "@media (orientation:portrait)": {
        zoneTitleSpace: {
        },
        zoneTitleSpaceIn: {
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }
    }
};

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, MainFliwerTopBar));
