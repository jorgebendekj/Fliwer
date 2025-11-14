import React, {PureComponent} from "react"
import {MapView,Marker} from "react-native-maps"
import isEqual from "lodash.isequal"
import PropTypes from "prop-types"


export default class MapMarker extends PureComponent {
    state = {
        tracksViewChanges: true
    }
    componentWillReceiveProps(nextProps) {
        if (!isEqual(this.props, nextProps)) {
            this.setState(() => ({
                tracksViewChanges: true,
            }))
        }
    }
    componentDidUpdate() {
        if (this.state.tracksViewChanges) {
            this.setState(() => ({
                tracksViewChanges: false,
            }))
        }
    }

    render() {
        return (
            <Marker.Animated
                tracksViewChanges={this.state.tracksViewChanges}
                {...this.props}
            >{this.props.children}</Marker.Animated>
        )
    }
}

MapMarker.defaultProps = {
    children: null,
};

MapMarker.propTypes = {
    children: PropTypes.any,
};
