import React, { Component } from 'react';
import { Image } from 'react-native-svg';

var loadedImages={};

class SvgImage extends Component {

      constructor(props){
        super(props);

        this.state={
          href:null
        }
      }

      componentDidMount(){
        this.checkHref();
      }

      componentDidUpdate(prevProps){
        if(prevProps.href!=this.props.href){
          this.checkHref();
        }
      }

      checkHref(){
        var that=this;
        if(typeof this.props.href==='string'){
          if(loadedImages[this.props.href])this.setState({href:{uri:loadedImages[this.props.href]}});
          else{
            fetch(this.props.href).then( response => response.blob() )
            .then( blob =>{
                var reader = new FileReader() ;
                reader.onload = function(){ loadedImages[that.props.href]=this.result; /*console.log(loadedImages);*/ that.setState({href:{uri:this.result}});} ; // <--- `this.result` contains a base64 data URI
                reader.readAsDataURL(blob);
            })
          }
        }else this.setState({href:this.props.href});
      }


      render() {
        var props=Object.assign({},this.props);
        if(this.state.href){
          props.href=this.state.href;
          return (
            <Image {...props}/>
          );
        }else return [];
      }
}

export {SvgImage}
