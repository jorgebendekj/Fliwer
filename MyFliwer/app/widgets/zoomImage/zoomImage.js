'use strict';

import React, { Component } from 'react';
import { View, Image } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import FliwerExitButton from '../../components/custom/FliwerExitButton2.js'
import {FliwerCommonUtils} from '../../utils/FliwerCommonUtils'
import {FliwerStyles} from '../../utils/FliwerStyles'
import Modal from '../../widgets/modal/modal'

class ZoomImage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        var {visible, source, onClose} = this.props;

        //url: 'https://avatars2.githubusercontent.com/u/7970947?v=3&s=460',
        console.log("source", source)
        const images = [{
            // Simplest usage.
            url: source,

            // width: number
            // height: number
            // Optional, if you know the image size, you can set the optimization performance

            // You can pass props to <Image />.
            props: {
                // headers: ...
            }
        }];

        return (
            <Modal animationType="fade"
                inStyle={[
                    FliwerStyles.modalIn,
                    FliwerCommonUtils.isIphoneBrowser()? this.style.modalInIphoneBrowser : {},
                    {
                        width: "90%",
                        height: "90%"/*,
                        maxWidth: 500,
                        maxHeight: 500 */
                    }
                ]}
                visible={visible}
                onClose={() => {
                    onClose();
                }}
                >
                    <ImageViewer imageUrls={images}
                        renderIndicator={(currentIndex, allSize) => {
                            return null;
                        }}
                        />
                    <FliwerExitButton onPress={()=>{
                            onClose();
                        }}
                        color={"white"}
                        containerStyle={this.style.exitButton} />
            </Modal>
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
    exitButton: {

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, ZoomImage));