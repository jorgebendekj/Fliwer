'use strict';

import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image
} = require('react-native');

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import FliwerLoading from '../fliwerLoading'
import PlantCard from './plantCard.js'
import CardCollection from '../custom/cardCollection.js'
import ImageBackground from '../imageBackground.js'
import Modal from '../../widgets/modal/modal'
import {FliwerColors} from '../../utils/FliwerColors'
import {toast} from '../../widgets/toast/toast'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as Actions from '../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions

import * as ActionsHome from '../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsPlant from '../../actions/fliwerPlantActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import { Redirect,withRouter } from '../../utils/router/router'

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'
import addButton  from '../../assets/img/add.png'


class Plants extends Component {
    constructor(props) {
        super(props);

        this.state = {
            idZone: this.props.match.params.idZone,
            addPlants: false,
            modalVisible: false
        };
        this._cards = []
    }

    componentWillMount() {
        this.props.actions.createZoneActions.stopCreatingNewZone();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.match.params.idZone != nextProps.match.params.idZone)
        {
            this.props.actions.fliwerZoneActions.getZoneData(nextProps.match.params.idZone).then(() => {
                this.state.idZone = nextProps.match.params.idZone;
                this.setState({loading: false})
                this.forceUpdate();
            });
        }
        return true;
    }

    setModalVisible(visible, idPlant) {
        this.setState({modalVisible: visible, idPlant: idPlant});
    }

    deletePlant() {
        this.props.actions.fliwerZoneActions.deleteZonePlant(this.state.idZone, this.state.idPlant).then(() => {
            for (var i = 0; i < this._cards.length; i++) {
                if (this._cards[i] && this._cards[i].toggle)
                    this._cards[i].toggle(false)()
            }
            this.setModalVisible(false);
        }, (err) => {
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    storeCard(index) {
        return ((v) => this._cards[index] = v ? v : null)
    }

    addPlants() {

        if (this.props.isVisitor)
            toast.error(this.props.actions.translate.get('DemoUser_no_permition_message'));
        else {
            //Move plantData to the "createZone" structure
            var zone = this.props.zoneData[this.state.idZone];
            if (Object.keys(this.props.plants).length > 0) {
                var plants = Object.values(zone.plants);
                plants.sort((a, b) => (this.props.plants[a.idPlant].common_name > this.props.plants[b.idPlant].common_name) ? 1 : ((this.props.plants[b.idPlant].common_name > this.props.plants[a.idPlant].common_name) ? -1 : (a.idPlant > b.idPlant ? 1 : -1)));
                for (var index in plants) {
                    if (plants[index]) {
                        var plant = this.props.plants[plants[index].idPlant];
                        this.props.actions.createZoneActions.addPlantZone(plant.idPlant, plants[index].plant_phase);
                    }
                }
                this.props.actions.createZoneActions.loadedZonePlants();
            }

            this.setState({addPlants: true})
        }

    }

    nextGarden = () => {

        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() < this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return -1;
            } else if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() > this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return 1;
            } else {

                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else
                    return 0
            }
            return 0;
        });

        var zonesTable = Object.values(sortedZones).map((k) => {
            return k.idZone
        })
        var foundZoneId = zonesTable.findIndex(element => element == this.props.match.params.idZone);

        if (foundZoneId + 1 >= zonesTable.length)
            this.state.foundZoneId = zonesTable[0];
        else
            this.state.foundZoneId = zonesTable[foundZoneId + 1];

        this.setState({goNextGarden: true});
    }

    previousGarden = () => {
        var sortedZones = Object.values(this.props.zoneData);

        sortedZones.sort((a, b) => {
            if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() < this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return -1;
            } else if (this.props.homeData[this.props.gardenData[a.idImageDash].idHome].name.toUpperCase() > this.props.homeData[this.props.gardenData[b.idImageDash].idHome].name.toUpperCase()) {
                return 1;
            } else {

                if (a.name.toUpperCase() < b.name.toUpperCase()) {
                    return -1;
                } else if (a.name.toUpperCase() > b.name.toUpperCase()) {
                    return 1;
                } else
                    return 0
            }

            return 0;
        });

        var zonesTable = Object.values(sortedZones).map((k) => {
            return k.idZone
        })
        var foundZoneId = zonesTable.findIndex(element => element == this.props.match.params.idZone);

        if (foundZoneId - 1 < 0)
            this.state.foundZoneId = zonesTable[zonesTable.length - 1];
        else
            this.state.foundZoneId = zonesTable[foundZoneId - 1];

        this.setState({goNextGarden: true});
    }

    render() {
        if (this.state.goNextGarden) {
            this.setState({loading: true})
            this.state.goNextGarden = false;
            return (<Redirect push to={"/zone/" + this.state.foundZoneId + "/plants/"} />)
        } else
        {
            if (this.state.addPlants)
                return (<Redirect push to={"/zone/" + this.state.idZone + "/plants/new"} />)
            else if (!this.props.preloadedData /*&& !this.props.loadedStorageData*/) {

                var title = "";
                var zone = this.props.zoneData[this.state.idZone];
                if (zone && zone.idImageDash) {
                    var garden = this.props.gardenData[zone.idImageDash];
                    if (garden) {
                        var home = this.props.homeData[garden.idHome];
                        if (home)
                            title = home.name + " - " + zone.name;
                    }
                }

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener)
                    bottomIcons.push("gardener");
                bottomIcons.push("zone", "files");

                return (
                        <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"}>
                            <MainFliwerTopBar showTextBar={true} mode={'zone'} title={title}/>
                            <MainFliwerMenuBar idZone={this.state.idZone} current={"plants"} icons={topIcons} position={"top"} />
                            <FliwerLoading/>
                            <View style={{width: "100%", flex: 1}}></View>
                            <MainFliwerMenuBar idZone={this.state.idZone} current={"plants"} icons={bottomIcons} />
                        </ImageBackground>
                        );
            } else {
                var zone = this.props.zoneData[this.state.idZone];
                var garden = this.props.gardenData[zone.idImageDash];
                var home = this.props.homeData[garden.idHome];

                /*
                var meteoTime;
                if (home.meteo && home.meteo.icon) {
                    var date = new Date(home.meteo.lastMeteoUpdateTime * 1000);
                    meteoTime = (date.getHours() < 10 ? "0" : "") + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes()
                }*/

                var topIcons = [];
                var bottomIcons = [];
                topIcons.push("params", "devices", "history", "plants");
                if (this.props.isGardener)
                    bottomIcons.push("gardener");
                bottomIcons.push("zone", "files");

                var zones = Object.values(this.props.zoneData);

                return (
                        <ImageBackground  source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)/*{uri:garden.imageName?garden.imageName:home.imageName}*/} resizeMode={"cover"} style={this.style.background}>
                            <MainFliwerTopBar showTextBar={true} mode={'zone'} title={home.name + " - " + zone.name} onPressNextGarden={zones.length>1?this.nextGarden:null} onPressPreviousGarden={zones.length>1?this.previousGarden:null}/>
                            <MainFliwerMenuBar idZone={this.state.idZone} current={"plants"} icons={topIcons} position={"top"} />
                            <ScrollView scrollEventThrottle={1000} style={{flex: 1}}>
                                <CardCollection style={this.style.collection}>
                                    { this.renderPlants(zone) }
                                </CardCollection>
                            </ScrollView>
                            <MainFliwerMenuBar idZone={this.state.idZone} current={"plants"} icons={bottomIcons} />
                            {false?<TouchableOpacity style={this.style.addZone} activeOpacity={1} onMouseEnter={this.hoverIn('addZone')} onMouseLeave={this.hoverOut('addZone')} onPress={() => {
                                this.addPlants();
                            }}>
                                <Image style={this.style.addZoneImg} resizeMode={"contain"} source={addButton}/>
                            </TouchableOpacity>:null}
                            <Modal animationType="fade" inStyle={this.style.modalIn} visible={this.state.modalVisible} onClose={() => {
                                this.setModalVisible(!this.state.modalVisible);
                            }}>
                                <View style={this.style.modalView}>
                                    <Text style={this.style.modalViewTitle}>{this.props.actions.translate.get('masterVC_plant_remove_title') + " " + zone.name}</Text>
                                    <Text style={this.style.modalViewSubtitle}>{this.props.actions.translate.get('general_sure')}</Text>
                                    <View style={this.style.modalButtonContainer}>
                                        <TouchableOpacity style={[this.style.modalButton, this.style.modalButton1]} onMouseEnter={this.hoverIn('modalButton1')} onMouseLeave={this.hoverOut('modalButton1')} onPress={() => {
                                this.setModalVisible(false);
                            }}>
                                            <Text style={[this.style.modalButtonText, this.style.modalButtonTextNo]}>{this.props.actions.translate.get('general_no')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[this.style.modalButton, this.style.modalButton2]} onMouseEnter={this.hoverIn('modalButton2')} onMouseLeave={this.hoverOut('modalButton2')} onPress={() => {
                                this.deletePlant()
                            }}>
                                            <Text style={[this.style.modalButtonText, this.style.modalButtonTextYes]}>{this.props.actions.translate.get('general_yes')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        </ImageBackground>
                        );
            }
        }
    }

    renderPlants(zone) {
        var indents = [];
        if (Object.keys(this.props.plants).length > 0) {
            var plants = Object.values(zone.plants);
            plants.sort((a, b) => (this.props.plants[a.idPlant].common_name > this.props.plants[b.idPlant].common_name) ? 1 : ((this.props.plants[b.idPlant].common_name > this.props.plants[a.idPlant].common_name) ? -1 : (a.idPlant > b.idPlant ? 1 : -1)));
            for (var index in plants) {
                if (plants[index]) {
                    var plant = this.props.plants[plants[index].idPlant];
                    indents.push(<PlantCard key={index} ref={this.storeCard(index)}
                                    touchableFront={true}
                                    idZone={zone.idZone} idPlant={plant.idPlant} phase={plants[index].plant_phase} title={plant.common_name} subtitle={plant.scientific} image={plant.plant_image1_mini} modalFunc={(v, p) => this.setModalVisible(v, p)} />);
                }
            }
        }

        // Add new card
        indents.push(<PlantCard key={999}
                        idZone={zone.idZone}
                        touchableFront={false}
                        onPressAdd={()=> this.addPlants()}
                     />);

        return indents;
    }

};

// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        preloadedData: state.sessionReducer.preloadedData,
        loadedStorageData: state.sessionReducer.loadedStorageData,
        translation: state.languageReducer.translation,
        homeData: state.fliwerHomeReducer.data,
        gardenData: state.fliwerGardenReducer.data,
        zoneData: state.fliwerZoneReducer.data,
        categories: state.fliwerPlantReducer.categories,
        plants: state.fliwerPlantReducer.plants,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.visitorCheckidUser,
    }
}

// Doing this merges our actions into the component’s props,
// while wrapping them in dispatch() so that they immediately dispatch an Action.
// Just by doing this, we will have access to the actions defined in out actions file (action/home.js)
function mapDispatchToProps(dispatch) {
    return {
        actions: {
            sessionActions: bindActionCreators(Actions, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            fliwerHomeActions: bindActionCreators(ActionsHome, dispatch),
            fliwerGardenActions: bindActionCreators(ActionsGarden, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch),
            fliwerPlantActions: bindActionCreators(ActionsPlant, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch)
        }
    }
}

//Connect everything

var styles = {
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 400
    },
    modalView: {
        paddingTop: 20
    },
    modalViewTitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center"
    },
    modalViewSubtitle: {
        width: "90%",
        marginLeft: "5%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    modalButton: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 45,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: "rgb(190,190,190)"
    },
    modalButton1: {
        borderBottomLeftRadius: 20
    },
    modalButton2: {
        borderRightWidth: 0,
        borderBottomRightRadius: 20
    },
    modalButtonText: {
        fontFamily: "AvenirNext-Regular",
        fontSize: 16,
        textAlign: "center"
    },
    modalButtonTextNo: {
        color: "blue"
    },
    modalButtonTextYes: {
        color: "red"
    },
    addZone: {
        position: "absolute",
        backgroundColor: FliwerColors.secondary.green,
        bottom: 65,
        right: 18,
        width: 60,
        height: 60,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
    },
    addZoneImg: {
        color: "white",
        flex: 1,
        width: "47%",
        height: "47%",
        textAlign: "center",
    },
    collection: {
        marginBottom: 85
    },
    ":hover": {
        addZone: {
            backgroundColor: "#f8ff7d"
        },
        modalButton1: {
            backgroundColor: "rgba(175,215,255,0.3)"
        },
        modalButton2: {
            backgroundColor: "rgba(255,175,175,0.3)"
        }
    }
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, Plants)));
