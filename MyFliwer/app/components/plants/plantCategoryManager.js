'use strict';

import React, { Component } from 'react';
var {View, ScrollView, Text, TouchableOpacity, Image, Platform} = require('react-native');
import stringCompariton from 'string-comparison'

import MainFliwerTopBar from '../mainFliwerTopBar.js'
import FliwerLoading from '../fliwerLoading'
import CardCollection from '../custom/cardCollection.js'
import FliwerPlantCategory from './fliwerPlantCategory.js'
import FliwerMyPlant from './fliwerMyPlant.js'
import FliwerPlant from './fliwerPlant.js'
import PlantPhaseModal from './plantPhaseModal.js'

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

import soilBackground  from '../../assets/img/5-bgMyplants.png';

//{cosine, diceCoefficient, jaccardIndex, lcs, levenshtein, mlcs}
var levenshtein=stringCompariton.levenshtein;

class PlantCategoryManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idZone: this.props.match.params.idZone,
            idCategory: null,
            idPlant: null,
            goNext: false,
            searchResult: null,
            addPlant: null,
            modalVisible: false,
            dragging: false,
            loading: false,
            goBack: false
        };
    }

    componentWillUnmount() {
        clearTimeout(this.searchTimeout);
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
                        this.props.actions.createZoneActions.addPlantZone(plant.idPlant, plants[index].plant_phase);
                    }
                }
                this.props.actions.createZoneActions.loadedZonePlants();
            }
        }
    }

    searchPlant(text) {
        if (this.searchTimeout)
            clearTimeout(this.searchTimeout);
        if (text && text.length > 2) {
            this.searchTimeout = setTimeout(() => {

                /*
                var array = Object.keys(this.props.plants);
                var plantsNames = Object.values(this.props.plants).map((p)=>{
                    var searchName="";
                    if(p.common_name)searchName+=p.common_name+" ";
                    if(p.synonims)searchName+=p.synonims;
                    return searchName.trim();
                });


                var similary1 = cosine.sortMatch(text.trim(), plantsNames);
                var similary2 = diceCoefficient.sortMatch(text.trim(), plantsNames);
                var similary3 = jaccardIndex.sortMatch(text.trim(), plantsNames);
                var similary4 = levenshtein.sortMatch(text.trim(), plantsNames);
                var similary5 = lcs.sortMatch(text.trim(), plantsNames);
                var similary6 = mlcs.sortMatch(text.trim(), plantsNames);

                similary1=similary1.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                }).slice(0,60);

                similary2=similary2.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                }).slice(0,60);

                similary3=similary3.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                }).slice(0,60);

                similary4=similary4.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                }).slice(0,60);

                similary5=similary5.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                }).slice(0,60);

                similary6=similary6.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                }).slice(0,60);

                
                var searchResult1=similary1.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                
                var searchResult2=similary2.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                
                var searchResult3=similary3.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                
                var searchResult4=similary4.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                
                var searchResult5=similary5.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                
                var searchResult6=similary6.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                */

                //////Separating by words

                var plants=Object.values(this.props.plants);
                var plantSearchObj=[];
                for(var i=0;i<plants.length;i++){
                    var strings=[];
                    if(plants[i].common_name){
                        strings=strings.concat(plants[i].common_name.split(" ").filter((s)=>{return s.length>2}));
                        //add entire common name string
                        strings.push(plants[i].common_name);
                    }
                    if(plants[i].synonims){
                        strings=strings.concat(plants[i].synonims.split(/[ ,]/).filter((s)=>{return s.length>2}));
                        //add entire synonims strings
                        strings=strings.concat(plants[i].synonims.split(",").map(s=>s.trim()));
                    }

                    //remove repeated and empty strings
                    strings = strings.filter((element, index) => {
                        return strings.indexOf(element) === index && element;
                    });
                    strings= strings.map((s)=>{return {strings:s,index:plants[i].idPlant}})
                    plantSearchObj=plantSearchObj.concat(strings);
                }
                console.log(plantSearchObj)
                

                //mount the structure to reference indexes with the search
                var array=plantSearchObj.map(p=>p.index);
                var plantsNames=plantSearchObj.map(p=>p.strings);

                /*
                var similary1 = cosine.sortMatch(text.trim(), plantsNames);
                var similary2 = diceCoefficient.sortMatch(text.trim(), plantsNames);
                var similary3 = jaccardIndex.sortMatch(text.trim(), plantsNames);
                */
                var similary4 = levenshtein.sortMatch(text.trim(), plantsNames);
                /*
                var similary5 = lcs.sortMatch(text.trim(), plantsNames);
                var similary6 = mlcs.sortMatch(text.trim(), plantsNames);
                */
                
                /*
                similary1=similary1.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                });

                similary2=similary2.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                });

                similary3=similary3.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                });*/

                similary4=similary4.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                });
                /*
                similary5=similary5.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                });

                similary6=similary6.sort((a,b)=>{
                    if (a.rating > b.rating)return -1;
                    else if (a.rating === b.rating)return 0;
                    else return 1;
                });*/

                /*
                var searchResult1=similary1.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                searchResult1=searchResult1.filter((p,index)=>{
                    return searchResult1.map(p => p.idPlant).indexOf(p.idPlant) === index;
                }).slice(0,60).map((p)=>{return p.common_name+" | "+p.synonims});
                
                var searchResult2=similary2.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                searchResult2=searchResult2.filter((p,index)=>{
                    return searchResult2.map(p => p.idPlant).indexOf(p.idPlant) === index;
                }).slice(0,60).map((p)=>{return p.common_name+" | "+p.synonims});
                
                var searchResult3=similary3.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                searchResult3=searchResult3.filter((p,index)=>{
                    return searchResult3.map(p => p.idPlant).indexOf(p.idPlant) === index;
                }).slice(0,60).map((p)=>{return p.common_name+" | "+p.synonims});
                
                var searchResult4=similary4.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                searchResult4=searchResult4.filter((p,index)=>{
                    return searchResult4.map(p => p.idPlant).indexOf(p.idPlant) === index;
                }).slice(0,60).map((p)=>{return p.common_name+" | "+p.synonims});
                
                var searchResult5=similary5.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                searchResult5=searchResult5.filter((p,index)=>{
                    return searchResult5.map(p => p.idPlant).indexOf(p.idPlant) === index;
                }).slice(0,60).map((p)=>{return p.common_name+" | "+p.synonims});
                
                var searchResult6=similary6.map((s)=>{
                    return this.props.plants[array[s.index]];
                })
                searchResult6=searchResult6.filter((p,index)=>{
                    return searchResult6.map(p => p.idPlant).indexOf(p.idPlant) === index;
                }).slice(0,60).map((p)=>{return p.common_name+" | "+p.synonims});
                */
                
                var searchResult=similary4.map((s)=>{
                    return array[s.index];
                })
                searchResult=searchResult.filter((idPlant,index)=>{
                    return searchResult.indexOf(idPlant) === index;
                }).slice(0,60)
                



                /*
                let duplicates = [];

                    for(let y = commonSimilary.length -1; y >= 0; y--){
                        for(let i = 1; i <= parseInt(array[array.length-1]); i++){
                        if(this.props.plants[i] != undefined){
                            if(this.props.plants[i].common_name !=null){
                                if(commonSimilary[y] == this.props.plants[i].common_name){
                                    duplicates.push(this.props.plants[i].idPlant);
                                }
                            }
                        }   
                    }
                }
                let result = duplicates.filter((item,index)=>{
                    return duplicates.indexOf(item) === index;
                  });
                let plantsDuplicates = plants.concat(result);
                plants = plantsDuplicates.filter((item,index)=>{
                    return plantsDuplicates.indexOf(item) === index;
                  });
                  */
                this.setState({searchResult: searchResult/*plants*/});
            }, 500);
        } else
            this.setState({searchResult: null});
    }

    phaseCallback(phase) {
        if (phase != null) {
            this.props.actions.createZoneActions.addPlantZone(this.state.addPlant, phase);
        }
        this.setState({addPlant: null, modalVisible: false})
    }

    addPlantPress(idPlant, phase) {
        if (phase != null) {
            this.props.actions.createZoneActions.addPlantZone(idPlant, phase);
        }
        this.setState({addPlant: null/*,modalVisible:false*/})
    }

    render() {
        var that = this;
        if (this.state.goNext) {
            if (this.state.idZone) {
                this.props.actions.createZoneActions.stopCreatingNewZone();
                return (<Redirect push to={"/zone/" + this.state.idZone + "/plants"} />)
            } else
                return (<Redirect push to={"/zone/new/chooseImage"} />)
        } else if (this.state.goBack) {
            return (<Redirect push to={"/zone"} />)
        } else if (this.state.idCategory) {
            if (this.state.idZone)
                return (<Redirect push to={"/zone/" + this.state.idZone + "/plants/new/plantcategory/" + this.state.idCategory} />)
            else
                return (<Redirect push to={"/zone/new/plantcategory/" + this.state.idCategory} />)
        } else if (this.state.idPlant) {
            return (<Redirect push to={"/plant/" + this.state.idPlant} />)
        } else

            return (
                    <View style={this.style.background}>
                        <MainFliwerTopBar showTextBar={true} title={this.props.actions.translate.get('dragablePlantsVC_title')}/>
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
                            <PlantPhaseModal visible={this.state.modalVisible} callback={(i) => {
                                this.phaseCallback(i)
                            }}/>

                            <View style={this.style.buttonBackContainer}>
                                <View style={this.style.zoneNameContainer}>
                                    <Text style={this.style.zoneNameText}>{this.renderZoneName()}</Text>
                                </View>
                                <FliwerNextBackButton onPress={async () => {
                                        await this.nextScreen()
                                    }} onBack={async () => {
                                        console.log("this.state.searchResult", this.state.searchResult)
                                        if (this.state.searchResult) {
                                            this.searchInput.clearText();
                                            this.setState({searchResult: null})
                                        } else {
                                            //await this.props.history.goBack();
                                            this.setState({goBack: true});
                                        }
                                    }} text={this.props.actions.translate.get('general_next')} containerStyle={this.style.nextButton} />

                            </View>
                        </View>
                        {(this.state.loading ? (<FliwerLoading />) : [])}
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
            return this.renderCategories();
    }

    renderCategories() {
        var indents = [];
        var categories = Object.keys(this.props.categories).map(key => {
            return this.props.categories[key];
        })
        categories.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        for (var index in categories) {
            indents.push(<FliwerPlantCategory id={categories[index].idPlantCategory} textStyle={[this.style.text, {color: FliwerColors.primary.black}]} onPress={(id) => {
                                this.setState({idCategory: id})
                            }} />);
        }
        if (this.state.mediaStyle.orientation == "landscape") {
            indents = [(
                        <ScrollView style={this.style.myPlantsListScroll} contentContainerStyle={this.style.myPlantsListScrollContainer}>
                            {indents}
                        </ScrollView>
                        )]
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
                indents.push(<FliwerPlant id={plants[index]} disabled={disable} onPress={(id) => {
                                        this.setState({idPlant: id})
                                    }}
                                    borderColorStyle={{}}
                                    textStyle={[this.style.text, {color: FliwerColors.primary.black}]}
                                    onPressAdd={(id) => {
                                        this.addPlantPress(id, 1)
                                    }} />);
            disable = false;
        }
        if (plants.length == 0) {
            indents.push(<Text style={this.style.textSearchNoPlants}>{this.props.actions.translate.get('dragablePlantsVC_searchNoPlants')}</Text>)
        }
        return indents;
    }

    renderMyPlantsBar(orientation) {
        return (
                <ScrollView style={this.style.myPlantsContainer} contentContainerStyle={this.style.myPlantsContainerStyle}>
                    <View style={this.style.myPlantsList}>
                        <Image  style={this.style.myPlantsListImage} draggable={false} source={soilBackground}  resizeMode={"cover"} />
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
        plantsZone.sort((a, b) => (this.props.plants[a.idPlant].common_name > this.props.plants[b.idPlant].common_name) ? 1 : ((this.props.plants[b.idPlant].common_name > this.props.plants[a.idPlant].common_name) ? -1 : (a.idPlant > b.idPlant ? 1 : -1)));
        for (var index in plantsZone) {
            indents.push(<FliwerMyPlant id={plantsZone[index].idPlant} onPress={(id) => {
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
                this.setState({dragging: false, loading: true});
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
            this.setState({dragging: false, loading: true});
            this.searchByImage(response.base64);
          }
        },()=>{console.log("Error gathering image");});

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
        flexDirection: "column"
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
        top: 80,
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
        flexGrow: 0,
        //marginBottom:10
    },
    myPlantsList: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        alignContent: "flex-start",
        flexGrow: 1
    },
    myPlantsListImage: {
        width: "100%",
        height: "100%",
        position: "absolute"
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
            maxHeight: "40%"
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
            marginBottom: 0
        },
        myPlantsListScroll: {
            height: "100%"
        },
        myPlantsListScrollContainer: {
            flexGrow: 1,
            flexDirection: "row",
            flexWrap: "wrap",
            height: "100%"
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(mediaConnect(styles, PlantCategoryManager)));
