'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, TouchableOpacity, Image, Platform, Dimensions} = require('react-native');
import MainFliwerTopBar from '../mainFliwerTopBar.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';


import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsPlant from '../../actions/fliwerPlantActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions

import WebView from '../../widgets/webView/webView'

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import { Redirect,withRouter } from '../../utils/router/router'

import PlantPhaseModal from './plantPhaseModal.js'
import FliwerNextBackButton from '../custom/FliwerNextBackButton.js'
import FliwerBackButton from '../custom/FliwerBackButton.js'

import {FliwerColors} from '../../utils/FliwerColors'
import {toast} from '../../widgets/toast/toast'

import defaultIcon  from '../../assets/img/fliwer_icon1.png'

class PlantInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addPlant: null,
        };
    }

    async addPlants(id) {
        this.state.addPlant = id;
        if (this.state.addPlant) {
            await this.props.actions.createZoneActions.addPlantZone(this.state.addPlant, 1);
        }
        this.state.addPlant = null;
       this.props.router.navigate(-1);
    }

    render() {

        return (
                <View style={this.style.background}>
                    <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('dragablePlantsVC_title')}/>
                    <View style={this.style.container}>
                        { this.renderImageLandscape() }
                        <View style={this.style.containerInfoButton}>
                            <ScrollView style={this.style.containerIn} contentContainerStyle={this.style.containerInContainer}>
                                { this.renderImagePortrait() }
                                <View style={this.style.containerInfoContainer}>
                                    { this.renderInfo() }
                                </View>
                            </ScrollView>
                            <View style={this.style.containerBackButton}>
                                {this.renderButton()}
                            </View>
                        </View>
                    </View>
                </View>
                );
    }

    renderImageLandscape() {
        if (this.state.mediaStyle.orientation == "landscape")
            return this.renderImage();
        else
            return [];
    }

    renderImagePortrait() {
        if (this.state.mediaStyle.orientation == "portrait")
            return this.renderImage();
        else
            return [];
    }

    renderImage() {
        var id = this.props.match.params.id;
        var indents = [];
        var plant = this.props.plants[id];

        if (this.props.plants.length == 0) {

        } else {
            //image
            indents.push(<Image style={[this.style.image,(plant.moreInfo.alternative_info?this.style.imageAlternative:{})]} draggable={false}  source={(plant.plant_image1 ? {uri: plant.plant_image1} : defaultIcon)}  resizeMode={(plant.plant_image1 && (!plant.moreInfo || !plant.moreInfo.alternative_info) ? "cover" : "contain")}/>)

        }
        return indents;
    }

    renderStyleTextLineTitle() {
            return ([this.style.textLineTitle])
    }

    renderStyleTextLineText() {
            return ([this.style.textLineText])
    }

    renderStyleLine() {
            return ([this.style.line2])
    }

    renderInfo() {
        var id = this.props.match.params.id;
        var indents = [];
        var plant = this.props.plants[id];

        if (this.props.plants.length == 0 || !plant) {

        } else if(plant.moreInfo.alternative_info){
            //title
            indents.push(<Text style={this.style.title}>{plant.common_name}</Text>)
            //scientific
            indents.push(<Text style={this.style.subtitle}>{plant.scientific}</Text>)

            indents.push(<View style={this.style.line}></View>)

            const dimensions = Dimensions.get('window');
            var webviewHeight = dimensions.height - 488;

            var html=plant.moreInfo.alternative_info;
            if(Platform.OS != "web") html='<meta name="viewport" content="initial-scale=1.0" />'+html;
            indents.push(<WebView style={this.style.webView} width={"100%"} height={webviewHeight} source={{html:html}}/>)   
        } else {
            //title
            indents.push(<Text style={this.style.title}>{plant.common_name}</Text>)
            //scientific
            indents.push(<Text style={this.style.subtitle}>{plant.scientific}</Text>)

            indents.push(<View style={this.style.line}></View>)

            //Familia
            if (plant.moreInfo.family) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_family") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.family}</Text></Text>)
            }
            //Sinonimos
            if (plant.synonims) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_synonims") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.synonims}</Text></Text>)
            }
            //Luz solar
            if (plant.moreInfo.plant_sunlight_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_sunlight") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_sunlight_name}</Text></Text>)
            }
            //Humedad del suelo
            if (plant.moreInfo.plant_moisture_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_soilMoisture") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_moisture_name}</Text></Text>)
            }
            //pH
            if (plant.moreInfo.plant_acidity_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_pH") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_acidity_name}</Text></Text>)
            }
            //Textura del suelo
            if (plant.moreInfo.plant_soiltype_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_soilTexture") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_soiltype_name}</Text></Text>)
            }
            //Orientación
            if (plant.moreInfo.plant_planting_places_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_orientation") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_planting_places_name}</Text></Text>)
            }
            //Exposición al clima
            if (plant.moreInfo.plant_weather_exposure_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_weatherExposure") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_weather_exposure_name}</Text></Text>)
            }
            //Resiliencia
            if (plant.moreInfo.plant_resilience_name) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_resilience") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.plant_resilience_name}</Text></Text>)
            }
            //Tamaño de la planta
            if (plant.moreInfo.size) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_size") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.size}</Text></Text>)
            }
            //Toxicidad
            if (plant.moreInfo.toxicity) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_toxicity") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.toxicity}</Text></Text>)
            }
            //Fruta
            if (plant.moreInfo.fruit) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_fruit") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.fruit}</Text></Text>)
            }
            //Flor
            if (plant.moreInfo.flower) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_flower") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.flower}</Text></Text>)
            }
            //Follaje
            if (plant.moreInfo.foliage) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_follage") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.foliage}</Text></Text>)
            }

            //Consejos de cultivo
            if (plant.moreInfo.suggestions) {
                indents.push(<Text style={[this.style.textLine, this.style.sectionInit]}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_cultivation")}</Text></Text>)
                indents.push(<View style={this.renderStyleLine()}></View>)
            }
            //Sugerido en
            if (plant.moreInfo.suggestions) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_suggested") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.suggestions}</Text></Text>)
            }

            //Cómo propagar
            if (plant.moreInfo.propagation) {
                indents.push(<Text style={[this.style.textLine, this.style.sectionInit]}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_propagate")}</Text></Text>)
                indents.push(<View style={this.renderStyleLine()}></View>)
            }
            //Cómo propagar
            if (plant.moreInfo.propagation) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.propagation}</Text></Text>)
            }

            //Poda
            if (plant.moreInfo.pruning || plant.moreInfo.pruning_month) {
                indents.push(<Text style={[this.style.textLine, this.style.sectionInit]}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_pruning")}</Text></Text>)
                indents.push(<View style={this.renderStyleLine()}></View>)
            }
            //Cómo propagar
            if (plant.moreInfo.pruning) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.pruning}</Text></Text>)
            }
            //Meses de poda
            if (plant.moreInfo.pruning_month) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_pruningMonths") + ":"}</Text><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.pruning_month}</Text></Text>)
            }

            //Plagas y enfermedades
            if (plant.moreInfo.pests || plant.moreInfo.pruning_month) {
                indents.push(<Text style={[this.style.textLine, this.style.sectionInit]}><Text style={this.renderStyleTextLineTitle()}>{this.props.actions.translate.get("plantInfoVC_plagues")}</Text></Text>)
                indents.push(<View style={this.renderStyleLine()}></View>)
            }
            //Plagas
            if (plant.moreInfo.pests) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.pests}</Text></Text>)
            }
            //Enfermedades
            if (plant.moreInfo.diseases) {
                indents.push(<Text style={this.style.textLine}><Text style={this.renderStyleTextLineText()}>{plant.moreInfo.diseases}</Text></Text>)
            }
        }
        return indents;
    }

    renderButton() {
        var id = this.props.match.params.id;
        var plantsZone = Object.values(this.props.plantsZone);
        var plant = plantsZone.find((a) => {
            return a.idPlant == id
        });
        var disable = false;

        var pathSplit = this.props.match.url.split('/');

        disable = this.isIncompatibilityPlant();
        if (pathSplit[5] == "info") {
            return (<FliwerBackButton onPress={async () => {
                               this.props.router.navigate(-1); 
                            }} text={this.props.actions.translate.get('general_back')} />);
        } else if (!plant)
            return (<FliwerNextBackButton onBack={async () => {
                               this.props.router.navigate(-1);
                            }} disabled={disable} onPress={async () => {
                                await this.addPlants(id);
                            }} text={this.props.actions.translate.get('plantInfoVC_add_button')}/>);
        else {
            return (<FliwerBackButton onPress={async () => {
                               this.props.router.navigate(-1);
                            }} text={this.props.actions.translate.get('general_back')} />);
        }
    }

    isIncompatibilityPlant() {
        var id = this.props.match.params.id;
        var disable = false;
        var myPlantsZone = Object.values(this.props.plantsZone);
        var j = 0;
        while (!disable && j < myPlantsZone.length) {
            if (this.props.incompatibilityPlants[this.props.plants[id].variety] && this.props.incompatibilityPlants[this.props.plants[id].variety][this.props.plants[myPlantsZone[j].idPlant].variety])
                disable = true;
            else
                j++;
        }
        return disable;
    }

}
;



// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
        categories: state.fliwerPlantReducer.categories,
        plants: state.fliwerPlantReducer.plants,
        plantsZone: state.createZoneReducer.plants,
        incompatibilityPlants: state.fliwerPlantReducer.incompatibilityPlantCategory
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerPlantActions: bindActionCreators(ActionsPlant, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch),
        }
    }
}

//Connect everything

var styles = {
    background: {
        backgroundColor: "white",
        height: "100%",
    },
    containerBackButton: {
        backgroundColor: "white",
        width: "100%",
        alignItems: "center",
        paddingTop: 10,
    },
    container: {
        position: "absolute",
        width: "100%",
        top: 80,
        bottom: 0,
        alignItems: "center"
    },
    containerInfoButton: {
        width: "100%",
        flexDirection: "column",
        //flexWrap:"wrap",
        justifyContent: "center",
        alignItems: "center",
        height: "100%"
    },
    containerInContainer: {
        width: "100%",
        flexDirection: "column",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    containerIn: {
        width: "100%",
        display: "flex",
    },

    image: {
        height: 250,
        width: "100%"
    },
    imageAlternative:{
        height: 200,
    },
    containerInfoContainer: {
        width: "100%",
        paddingLeft: 40,
        paddingRight: 40,
        paddingBottom: 20
    },
    title: {
        width: "100%",
        textAlign: "center",
        color: FliwerColors.secondary.green,
        fontSize: 28,
        fontFamily: FliwerColors.fonts.regular,
        fontWeight: "bold",
        paddingTop: 14
    },
    subtitle: {
        width: "100%",
        textAlign: "center",
        fontStyle: "italic",
        fontFamily: FliwerColors.fonts.light,
        fontSize: 18,
        paddingBottom: 5
    },
    line: {
        width: "100%",
        height: 1,
        backgroundColor: FliwerColors.primary.green
    },
    line2: {
        width: "100%",
        height: 1,
        backgroundColor: FliwerColors.secondary.black
    },
    textLine: {
        paddingTop: 10,
        width: "100%"
    },
    textLineTitle: {
        fontFamily: FliwerColors.fonts.light,
        fontWeight: "bold",
        fontSize: 16
    },
    textLineText: {
        fontFamily: FliwerColors.fonts.light,
        fontSize: 16,
        marginLeft: 10
    },
    sectionInit: {
        paddingTop: 20
    },
    webView:{
        marginTop:10
    },

    "@media (orientation:landscape)": {
        image: {
            width: "30%",
            height: "100%"
        },
        imageAlternative:{
            height:"100%"
        },
        container: {
            flexDirection: "row"
        },
        containerInfoButton: {
            width: "70%"
        }
    },
    ":hover": {
    }
};

if (Platform.OS === "ios") {
    styles.containerBackButton.height = 133;
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, PlantInfo)));
