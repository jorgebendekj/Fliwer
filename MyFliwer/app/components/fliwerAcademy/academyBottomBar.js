'use strict';

import React, { Component } from 'react';
import {View, Text, TextInput, Platform, TouchableOpacity, Image} from 'react-native';

import {FliwerColors} from '../../utils/FliwerColors'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import Icon from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FliwerGreenButton from '../../components/custom/FliwerGreenButton.js'
import FliwerCalmButton from '../../components/custom/FliwerCalmButton.js'
import Modal from '../../widgets/modal/modal'

class AcademyBottomBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {barContainerCustomStyle, child} = this.props;

        return(
                <View style={[this.style.barContainer, barContainerCustomStyle]}>
                    <View style={this.style.leftContainer}>
                        {this.renderLeftArrow()}
                    </View>
                    <View style={this.style.centerContainer}>
                        {this.renderCenterButton()}
                    </View>
                    <View style={[this.style.rightContainer]}>
                        {this.renderRightArrow()}
                        {this.props.buttonText ? this.renderButton() : null}
                    </View>
                </View>
                )
    }

    renderButton()
    {
        return(
                <View style={[this.style.exitContainer]}>
                    <FliwerGreenButton text={this.props.buttonText} style={{paddingLeft: 4, paddingRight: 4}} containerStyle={[{height: 33, marginBottom: 1, width: null}]} onPress={async () => {
                        if (typeof this.props.buttonFunction === 'function')
                            await this.props.buttonFunction();
                    }}/>
                </View>
                )
    }

    renderLeftArrow() {
        var indents = []

        if (this.props.arrowLeft)
            indents.push(
                    <FliwerCalmButton 
                        buttonStyle={[this.style.leftArrowTouchable]} 
                        onPress={async () => {
                            if (typeof this.props.arrowLeft === 'function')
                                await this.props.arrowLeft();
                        }} 
                        iconData={{
                            name: "chevron-left",
                            style: this.style.eyeIcon
                        }} 
                        skipView={true}
                    />
            );

        return indents;
    }

    renderCenterButton() {
        var indents = [];
        
        if (this.props.centerClick && this.props.centerText)
        {
            indents.push(
                    <FliwerGreenButton onPress={async () => {
                            if (typeof this.props.centerClick === 'function')
                                await this.props.centerClick();
                            }} 
                            text={this.props.centerText} containerStyle={{height: 35, marginBottom: 2}}/>
                    );
        } else if (this.props.totalScreens && this.props.actualScreen) {
            
            if (typeof this.props.pagging !== 'function') {
                if (this.props.totalScreens <= 5)
                {
                    for (var i = 1; i <= this.props.totalScreens; i++)
                    {
                        indents.push(<View key={"spot_" + i} style={[this.style.spot, this.props.actualScreen == i ? {backgroundColor: FliwerColors.primary.black} : null]}></View>)
                    }
                } else {
                    indents.push(<Text style={this.style.pagesStyle}>{this.props.actualScreen + "/ " + this.props.totalScreens}</Text>)
                }                
            }
            else {
                indents.push(
                        <View style={{flexDirection: 'row', justifyContent: "center"}}>
                            <TouchableOpacity 
                                style={[this.style.pagesStyle, this.style.textInputPagging]}
                                onPress={() => {                              
                                    this.props.pagging()
                                }}>
                                    <Text style={[this.style.pagesStyle, {}]}>{this.props.actualScreen}</Text>
                            </TouchableOpacity>                
                            <Text style={[this.style.pagesStyle, {marginLeft: 5, marginTop: 5}]}>{"/ " + this.props.totalScreens}</Text>
                        </View>
                );                
            }
        }
        
        return indents;
    }

    renderRightArrow() {
        var indents = []
        if (this.props.hasNext)
        {
            if (this.props.totalScreens != this.props.actualScreen)
            {
                indents.push(
                    <FliwerCalmButton 
                        buttonStyle={[this.style.rightArrowTouchable]} 
                        onPress={async () => {
                            if (typeof this.props.arrowRight === 'function')
                                await this.props.arrowRight();
                        }} 
                        iconData={{
                            name: "chevron-right",
                            style: this.style.eyeIcon
                        }} 
                        skipView={true}
                    />
                );
            } else
            {
                if (this.props.addPageFunction)
                {
                    indents.push(
                            <TouchableOpacity style={[this.style.addPageTouchable]} onPress={() => {
                                    if (typeof this.props.addPageFunction === 'function')
                                        this.props.addPageFunction();
                                }}>
                                <IoniconsIcon name="add-circle-outline" style={[this.style.eyeIcon]}></IoniconsIcon>
                            </TouchableOpacity>
                            )
                } else {
                    indents.push(<View style={{width: 45, height: 20}}></View>)
                }
            }

        }
        return indents;
    }

};

var style = {
    pagesStyle: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
    },
    textInputPagging: {
//        height: 10,
        padding: 5,
        width: 40,
        borderWidth: 1,
        borderColor: "gray",
        textAlign: 'right',
        borderRadius: 4      
    },
    spot: {
        borderRadius: 10,
        width: 10,
        height: 10,
        backgroundColor: FliwerColors.primary.gray,
        marginRight: 6,

    },
    spotsContainer: {
        alignItems: 'center',
        justifyContent: "center"
    },
    eyeIcon: {
        fontSize: 35,
        textAlign: "center",
        color: "back"
    },
    barContainer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1,
        width: "100%",
        backgroundColor: "rgb(240,240,240)",
        justifyContent: "center",
    },
    leftContainer: {
        width: "33.33%",
        alignItems: "flex-end"

    },
    centerContainer: {
        width: "33.33%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"

    },
    rightContainer: {
        width: "33.33%",
        flexDirection: "row"

    },
    exitContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 10,
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center"
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        overflow: "hidden",
    }
};

//Connect everything
export default mediaConnect(style, AcademyBottomBar);
