import React, {Component} from 'react';
var {Image, StyleSheet, View} = require('react-native');
import FliwerLoading from './fliwerLoading'

class ImageBackground extends Component {

    render() {
        const {children, style, imageStyle, loading, ...props} = this.props;

        if (loading)
            return(
                    <View style={[{flex: 1, zIndex:9995}, style]}>
                        {this.props.source?this.drawImage():null}
                        {children}
                        <FliwerLoading style={{zIndex:999999}}/>
                    </View>
                    );
        else
            return (
                    <View
                        style={[{flex: 1, height: "100%"}, style]}
                        onLayout={() => {
                            if (typeof this.props.onLayout === 'function') {
                                this.props.onLayout();
                            }
                        }}
                    >
                        {this.props.source?this.drawImage():null}
                        {children}
                    </View>
                    );
    }

    drawImage() {
        const {children, style, imageStyle, loading, ...props} = this.props;
        if (this.props.source) {
            return (
                    <Image
                        {...props}
                        style={[
                                StyleSheet.absoluteFill,
                                    {
                                        width: null,
                                        height: null,
                                    },
                                    imageStyle,
                                ]}
                        />
                    )
        } else {
            return [];
        }
    }
}
export default ImageBackground;
