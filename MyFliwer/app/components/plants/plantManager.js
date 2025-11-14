'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, TouchableOpacity, Image, Platform} = require('react-native');
import MainFliwerTopBar from '..//mainFliwerTopBar.js'
import FliwerLoading from '../fliwerLoading'
import CardCollection from '../custom/cardCollection.js'
import FliwerPlant from './fliwerPlant.js'
import FliwerMyPlant from './fliwerMyPlant.js'

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

import * as ActionsLang from '../../actions/languageActions.js'; //Import your actions
import * as ActionsCreateZone from '../../actions/createZoneActions.js'; //Import your actions
import * as ActionsPlant from '../../actions/fliwerPlantActions.js'; //Import your actions
import * as ActionsZone from '../../actions/fliwerZoneActions.js'; //Import your actions

import { uniqueStorage } from '../../utils/uniqueStorage/uniqueStorage';

import {mediaConnect} from '../../utils/mediaStyleSheet.js'

import { Redirect,withRouter } from '../../utils/router/router'

import FliwerNextBackButton from '../custom/FliwerNextBackButton.js'
import FliwerSearchInput from '../custom/FliwerSearchInput.js'

import {FliwerColors} from '../../utils/FliwerColors'
import {toast} from '../../widgets/toast/toast'

import {MediaPicker,FileDrop,getBase64} from '../../utils/uploadMedia/MediaPicker'
import Icon from 'react-native-vector-icons/Entypo';

import soilBackground  from '../../assets/img/5-bgMyplants.png'

class PlantManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idZone: this.props.match.params.idZone,
            idCategory: this.props.match.params.idCategory,
            idPlant: null,
            goNext: false,
            goBack: false,
            addPlant: null,
            modalVisible: false,
            searchResult: null,
            loading: false,
            firstLoop: true,
        };
    }

    componentWillUnmount() {
        clearTimeout(this.searchTimeout);
        clearTimeout(this.loadingTimeout)
    };

    componentWillMount = () => {
        this.getZonePlants();
    }

    componentDidUpdate() {
        this.getZonePlants();
    }

    searchByImage(image) {
        this.setState({loading: true});
        this.props.actions.fliwerPlantActions.plantSearchByImage(image).then((results) => {
            this.setState({loading: false, searchResult: results.map((p) => {
                    return p.idPlant
                })});
        }, (err) => {
            this.setState({loading: false})
        })
    }

    getZonePlants() {
        if (!this.props.zonePlantsLoaded && this.state.idZone && !this.state.goNext) {
            var zone = this.props.zoneData[this.state.idZone];
            if (Object.keys(this.props.plants).length > 0) {
                var plants = Object.values(zone.plants);
                plants.sort((a, b) => (this.props.plants[a.idPlant].common_name > this.props.plants[b.idPlant].common_name) ? 1 : ((this.props.plants[b.idPlant].common_name > this.props.plants[a.idPlant].common_name) ? -1 : (a.idPlant > b.idPlant ? 1 : -1)));
                for (var index in plants) {
                    if (plants[index]) {
                        var plant = this.props.plants[plants[index].idPlant];
                        this.props.actions.createZoneActions.addPlantZone(plant.idPlant, 1);
                    }
                }
                this.props.actions.createZoneActions.loadedZonePlants();
            }
        }
    }

    async nextScreen() {
        var plantsZone = Object.values(this.props.plantsZone).length;
        if (!plantsZone)
            toast.error(this.props.actions.translate.get('dragablePlantsVC_no_plants'));
        else {
            if (this.state.idZone) {
                //Save the changes in the structure and clean the createZone data
                await this.props.actions.fliwerZoneActions.setZonePlant(this.state.idZone, Object.values(this.props.plantsZone)).then(() => {
                    this.setState({goNext: true})
                }, (err) => {
                    if (err.reason)
                        toast.error(err.reason);
                })
            } else
                this.setState({goNext: true})
        }
    }

    searchPlant(text) {
        if (text && text.length > 2) {
            if (this.searchTimeout)
                clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                var plants = [];
                var categories = Object.values(this.props.categories);
                for (var i = 0; i < categories.length; i++)
                    plants = plants.concat(categories[i].plant)

                plants = plants.filter((a) => {
                    return ((this.props.plants[a].common_name && this.props.plants[a].common_name.trim().toLowerCase().search(text.trim().toLowerCase()) > -1) || (this.props.plants[a].scientific && this.props.plants[a].scientific.trim().toLowerCase().search(text.trim().toLowerCase()) > -1) || (this.props.plants[a].synonims && this.props.plants[a].synonims.trim().toLowerCase().search(text.trim().toLowerCase()) > -1))
                }).sort((a, b) => (this.props.plants[a].common_name > this.props.plants[b].common_name) ? 1 : ((this.props.plants[b].common_name > this.props.plants[a].common_name) ? -1 : (a > b ? 1 : -1)));
                this.setState({searchResult: plants});
            }, 500);
        } else
            this.setState({searchResult: null});
    }

    addPlants(id) {
        this.state.addPlant = id;
        if (this.state.addPlant) {
            this.props.actions.createZoneActions.addPlantZone(this.state.addPlant, 1);
        }
        this.state.addPlant = null;
    }

    render() {
        var that = this;
        if (this.state.goNext) {
            if (this.state.idZone) {
                this.props.actions.createZoneActions.stopCreatingNewZone();
                return (<Redirect push to={"/zone/" + this.state.idZone + "/plants"} />)
            } else
                return (<Redirect push to={"/zone/new/chooseImage"} />)
        } else if (this.state.idPlant) {
            if (this.state.idZone)
                return (<Redirect push to={"/zone/" + this.state.idZone + "/plant/" + this.state.idPlant} />)
            else
                return (<Redirect push to={"/plant/" + this.state.idPlant} />)
        } else if (this.state.goBack) {
            if (this.state.idZone)
                return (<Redirect push to={"/zone/" + this.state.idZone + "/plants/new"} />)
            else
                return (<Redirect push to={"/zone/new"} />)
        } else
            return (
                    <View style={this.style.background} resizeMode={"cover"}>
                        <MainFliwerTopBar title={this.props.actions.translate.get('dragablePlantsVC_title')}/>
                        <View style={this.style.container}>
                            <View style={this.style.seatchContainer}>
                                <FileDrop style={this.style.fileDrop} onDrop={this.handleDrop} onFrameDragEnter ={() => {
                            that.setState({dragging: true})
                        }} onFrameDragLeave={() => {
                            that.setState({dragging: false})
                        }}>
                                    <View style={this.style.fileDropIn}>
                                        <FliwerSearchInput
                                            placeholder={this.props.actions.translate.get('dragablePlantsVC_search')}
                                            containerStyle={[this.style.search]}
                                            inputStyle={{}}
                                            onChangeText={(text) => {
                                                this.searchPlant(text)
                                            }}
                                            ref={(input) => {
                                                this.searchInput = input;
                                            }}
                                            onSubmitEditing={() => {
                                            }}
                                            blurOnSubmit={false}
                                            />

                                        <TouchableOpacity style={this.style.cameraIconView} onPress={() => {
                                            this.getPhotos()
                                        }}>
                                            <Icon name="camera" style={this.style.cameraIcon} ></Icon>
                                        </TouchableOpacity>
                                        {this.renderInputFile()}
                                    </View>
                                </FileDrop>
                            </View>
                            <View style={this.style.containerIn}>
                                {this.renderMyPlantsLandscape()}
                                <ScrollView style={this.style.containerObjects} contentContainerStyle={this.style.containerInContainer}>
                                    { this.renderObjects() }
                                </ScrollView>
                                {this.renderMyPlantsPortrait()}
                            </View>
                            <View style={this.style.buttonBackContainer}>
                                <View style={this.style.zoneNameContainer}>
                                    <Text style={this.style.zoneNameText}>{this.renderZoneName()}</Text>
                                </View>
                                <FliwerNextBackButton onPress={async () => {
                                    await this.nextScreen()
                                }} onBack={async () => {
                                    if (this.state.searchResult) {
                                        this.searchInput.clearText();
                                        this.setState({searchResult: null})
                                    } else {
//                                        this.setState({goBack: true});
                                        //await this.props.history.goBack();
                                        this.props.router.navigate(-1);
                                    }
                                }} text={this.props.actions.translate.get('general_next')} containerStyle={this.style.nextButton}/>

                            </View>
                        </View>
                        {(this.state.firstLoop || this.state.loading ? (<FliwerLoading />) : [])}
                    </View>
                    );
    }

    renderZoneName() {
        var zoneName;
        if (this.state.idZone && this.props.zoneData[this.state.idZone]) {
            zoneName = this.props.zoneData[this.state.idZone].name;
        }
        return zoneName;
    }

    renderObjects() {
        if (this.state.searchResult)
            return this.renderSearch();
        else
            return this.renderPlants();
    }

    renderPlants() {
        var indents = [];
        var disable = false;
        if (this.state.firstLoop) {
            this.loadingTimeout = setTimeout(() => {
                this.setState({firstLoop: false})
            }, 1000);
        } else {
            var that = this;
            var plants = (this.props.categories[this.state.idCategory] ? this.props.categories[this.state.idCategory].plant : []);
            plants.sort((a, b) => (this.props.plants[a].common_name > this.props.plants[b].common_name) ? 1 : ((this.props.plants[b].common_name > this.props.plants[a].common_name) ? -1 : (a > b ? 1 : -1)));

            for (var index in plants) {
                disable = this.isIncompatibilityPlant(plants, index);
                if (!this.props.plantsZone[plants[index]])
                    indents.push(<FliwerPlant id={plants[index]} disabled={disable} onPress={(id) => {
                                                this.setState({idPlant: id})
                                            }}
                                            borderColorStyle={{}}
                                            textStyle={[this.style.text, {color: FliwerColors.primary.black}]} onPressAdd={(id) => {
                                                this.addPlants(id);
                                            }} />);
                disable = false;
            }
        }
        return indents;
    }

    isIncompatibilityPlant(plants, index) {
        var disable = false;
        var myPlantsZone = Object.values(this.props.plantsZone);
        var j = 0;
        while (!disable && j < myPlantsZone.length) {
            if (this.props.incompatibilityPlants[this.props.plants[plants[index]].variety] && this.props.incompatibilityPlants[this.props.plants[plants[index]].variety][this.props.plants[myPlantsZone[j].idPlant].variety])
                disable = true;
            else
                j++;
        }
        return disable;
    }

    renderSearch() {
        var indents = [];
        var disable = false;
        var plants = this.state.searchResult;
        for (var index = 0; index < plants.length && index < 100; index++) {
            disable = !this.props.plants[plants[index]] || this.isIncompatibilityPlant(plants, index);
            if (!this.props.plantsZone[plants[index]] && this.props.plants[plants[index]])
                indents.push(<FliwerPlant key={index} id={plants[index]} disabled={disable} onPress={(id) => {
                                        this.setState({idPlant: id})
                                    }} borderColorStyle={{}} textStyle={[this.style.text, {color: FliwerColors.primary.black}]} onPressAdd={(id) => {
                                        this.addPlants(id);
                                    }} />);
            disable = false;
        }
        if (plants.length == 0) {
            indents.push(<Text style={this.style.textSearchNoPlants}>{this.props.actions.translate.get('dragablePlantsVC_searchNoPlants')}</Text>)
        }
        return indents;
    }

    renderMyPlantsBar() {
        return (
                <ScrollView style={this.style.myPlantsContainer} contentContainerStyle={this.style.myPlantsContainerStyle}>
                    <View style={this.style.myPlantsList}>
                        <Image style={this.style.myPlantsListImage} draggable={false} source={soilBackground}  resizeMode={"cover"} />
                        {this.renderMyPlantsList()}
                    </View>
                    <View style={this.style.myPlantsTitle}>
                        <Text style={this.style.myPlantsTitleText}>{this.props.actions.translate.getComponent('dragablePlantsVC_myplants_title', {boldColor: FliwerColors.primary.green})}</Text>
                    </View>
                </ScrollView>
                )
    }

    renderMyPlantsList() {
        var indents = [];
        var plantsZone = Object.values(this.props.plantsZone);
        plantsZone.sort((a, b) => {
            return (this.props.plants[a.idPlant].common_name > this.props.plants[b.idPlant].common_name) ? 1 : ((this.props.plants[b.idPlant].common_name > this.props.plants[a.idPlant].common_name) ? -1 : (a.idPlant > b.idPlant ? 1 : -1))
        });
        for (var index in plantsZone) {
            indents.push(<FliwerMyPlant key={index} id={plantsZone[index].idPlant} onPress={(id) => {
                                this.setState({idPlant: id})
                            }} onPressRemove={(id) => {
                                this.props.actions.createZoneActions.removePlantZone(id);
                                this.forceUpdate()
                            }}/>)
        }
        return indents;
    }

    renderMyPlantsLandscape() {
        if (this.state.mediaStyle.orientation == "landscape")
            return this.renderMyPlantsBar();
        else
            return [];
    }

    renderMyPlantsPortrait() {
        if (this.state.mediaStyle.orientation == "portrait")
            return this.renderMyPlantsBar();
        else
            return [];
    }

    renderInputFile() {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => this.fileInput = fileInput} style={this.style.fileInput} type="file"  />);
        else
            return [];
    }


    handleDrop = (files, event) => {
        var ValidImageTypes = ["image/gif", "image/jpeg", "image/png"];
        if (ValidImageTypes.indexOf(files[0].type) != -1) {
          getBase64(files[0]).then((file) => {
              this.setState({dragging: false});
              this.searchByImage(file);
          },()=>{});
        } else {
            this.setState({dragging: false})
            toast.error(this.props.actions.translate.get('zoneImageSelectorVC_photoalert_image_type'));
        }
    }

    getPhotos() {
        var that = this;
        const options = {
            fileInput: this.fileInput
        };

        MediaPicker.openPicker(options).then((response)=>{
          if(!response || response.didCancel){
            console.log('User cancelled image picker');
          }else{
            this.setState({dragging: false});
            this.searchByImage(response.base64);
          }
        },()=>{console.log("Error gathering image");});

    }

};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        language: state.languageReducer.language,
        lastUpdate: state.languageReducer.lastUpdate,
        translation: state.languageReducer.translation,
        creatingZone: state.createZoneReducer.creating,
        plantsZone: state.createZoneReducer.plants,
        zonePlantsLoaded: state.createZoneReducer.zonePlantsLoaded,
        zoneData: state.fliwerZoneReducer.data,
        categories: state.fliwerPlantReducer.categories,
        plants: state.fliwerPlantReducer.plants,
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
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch),
            fliwerPlantActions: bindActionCreators(ActionsPlant, dispatch),
            fliwerZoneActions: bindActionCreators(ActionsZone, dispatch)
        }
    }
}

//Connect everything

var styles = {
    background: {
        backgroundColor: "white",
        height: "100%",
    },
    buttonBackContainer: {
        backgroundColor: "white",
        width: "100%",
        alignItems: "center",
        flexDirection: "column",
    },
    zoneNameContainer: {
        marginTop: 3,
    },
    zoneNameText: {
        fontFamily: FliwerColors.fonts.light,
    },
    container: {
        position: "absolute",
        width: "100%",
        top: 40,
        bottom: 0,
        alignItems: "center"
    },
    seatchContainer: {
        marginTop: 10,
        width: "100%",
        height: 56
    },
    search: {
        marginRight: 10
    },
    containerInContainer: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        paddingLeft: 10,
        paddingRight: 10
    },
    containerIn: {
        display: "flex",
        flexDirection: "column",
        flexShrink: 1,
        width: "100%"
    },
    containerObjects: {
        width: "100%",
        display: "flex"
    },
    myPlantsContainer: {
        width: "100%",
        flexShrink: 0,
        flexGrow: 0
                //marginBottom:10
    },
    myPlantsContainerStyle: {

    },
    myPlantsList: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        alignContent: "flex-start",
        flexGrow: 1,
    },
    myPlantsListImage: {
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    myPlantsTitle: {
        width: "100%",
        padding: 3,
        backgroundColor: "black",
        alignItems: "center"
    },
    myPlantsTitleText: {
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.secondary.white
    },
    nextButton: {
        margin: 10
    },

    cameraIconView: {
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: FliwerColors.primary.green,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start"
    },
    cameraIcon: {
        color: "white",
        fontSize: 22
    },
    fileInput: {
        display: "none" //display: "none" only works on web
    },
    fileDrop: {
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    fileDropIn: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    textSearchNoPlants: {
        marginTop: 20
    },
    "@media (orientation:portrait)": {
        myPlantsContainer: {
            maxHeight: "40%",
        },
        myPlantsContainerStyle: {
            //flexGrow: 1,
        },
        containerIn: {
            flexGrow: 1,
        },
    },
    "@media (orientation:landscape)": {
        containerIn: {
            flexDirection: "row",
            height: "100%"
        },
        myPlantsContainerStyle: {
            height: "100%",
        },
        containerObjects: {
            width: "80%",
            marginLeft: "20%"
        },
        myPlantsContainer: {
            width: "20%",
            position: "absolute",
            top: 0,
            bottom: 0,
            marginBottom: 0,
        },
        myPlantsTitle: {

        },
        myPlantsList: {
        },
        myPlantsListImage: {
        },
    },
    ":hover": {
    }
};

if (Platform.OS == "android" || Platform.OS == 'ios') {
    styles.containerIn.flexShrink = 1;
    styles["@media (orientation:portrait)"].myPlantsContainer.maxHeight = "75%";
}

if (Platform.OS === "ios") {
    styles.buttonBackContainer.height = 150;
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, PlantManager)));
