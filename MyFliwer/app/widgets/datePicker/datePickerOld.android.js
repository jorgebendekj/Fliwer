'use strict';
import React, { Component } from 'react';
import DatePicker from 'react-native-datepicker'
//export default DatePicker;

export default class MyDatePicker extends Component {
  constructor(props){
    super(props)
    this.state={
    }
  }

  touchableHandlePress(){
    this._datepicker.onPressDate();
  }

  render(){
    const {style,date,placeholder,format,minDate,maxDate,confirmText,cancelText,customStyles,onChange,mode } = this.props

    return (
      <DatePicker
        style={style}
        date={this.props.date}
        mode={mode?mode:'date'}
        placeholder={placeholder}
        format={format?format:"YYYY-MM-DD"}
        minDate={minDate}
        maxDate={maxDate}
        ref={(d)=>{this._datepicker=d}}
        is24Hour={true}
        confirmBtnText={confirmText}
        cancelBtnText={cancelText}
        customStyles={customStyles}
        onDateChange={(value,date)=>{
            console.log(value,date);
            if(typeof onChange==='function')onChange(date);
        }}
        showIcon={false}
      />
    )
  }
}
