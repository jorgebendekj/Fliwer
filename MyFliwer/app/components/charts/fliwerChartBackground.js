import React, { Component } from 'react';
import { G,Rect } from 'react-native-svg'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'



class FliwerChartBackground extends Component {

    render() {
      const { belowChart,divisions,colors } = this.props

      var rectangles=[];

      for(var i=0;i<divisions;i++){
        rectangles.push(<Rect x={(i*(100/divisions))+"%"} width={(100/divisions)+"%"} y={"0%"} height={"100%"} fill={colors[i%colors.length]} />)
      }

      return (
        <G>
          {rectangles}
        </G>
      )
    }

}

//Connect everything
export default FliwerChartBackground;
