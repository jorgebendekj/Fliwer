import React, { Component } from 'react';
import { G,Line } from 'react-native-svg'
import {mediaConnect} from '../../utils/mediaStyleSheet.js'



class FliwerChartGrid extends Component {

    render() {
      return (
        <G>
          <Line
              key={1}
              x1={ '0%' }
              x2={ '100%' }
              y1={ '33.33%' }
              y2={ '33.33%' }
              strokeDasharray='6,3'
              stroke={ 'rgba(0,0,0,0.5)' }
          />
          <Line
              key={2}
              x1={ '0%' }
              x2={ '100%' }
              y1={ '66.66%' }
              y2={ '66.66%' }
              strokeDasharray='6,3'
              stroke={ 'rgba(0,0,0,0.5)' }
          />
        </G>
      )
    }

}

//Connect everything
export default FliwerChartGrid;
