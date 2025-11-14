'use strict';
import React, { Component } from 'react';
var {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    RefreshControl,
} = require('react-native');
import { CheckBox  } from 'react-native-elements'

import * as ActionsLang from '../../actions/languageActions.js';
import {FliwerColors} from '../../utils/FliwerColors'
import CardCollection from '../../components/custom/cardCollection.js'
import ImageBackground from '../../components/imageBackground.js'
import CategoryBarView from './categoryBarView.js'
import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import CourseCard from './courseCard.js'
import FliwerLoading from '../fliwerLoading'
import FliwerDeleteModal from '../../components/custom/FliwerDeleteModal.js'

import * as ActionAcademy from '../../actions/academyActions.js';
import * as ActionPoly from '../../actions/polyActions.js';


import { Redirect } from '../../utils/router/router'
import {Orientation} from '../../utils/orientation/orientation'
import {toast} from '../../widgets/toast/toast'
import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import {mediaConnect} from '../../utils/mediaStyleSheet.js'
import moment from 'moment';

import background from '../../assets/img/homeBackground.jpg'
import rainolveBackground  from '../../assets/img/rainolve background_dark_Mesa de trabajo 1.jpg'

class AcademyCourses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idCourse: null,
            gotoCourse: false,
            goCourseADD: false,
            idCategory: null,
            modalDeleteVisible: false,
            loading: true,
            initialLoading: true
        };

    }

    componentDidMount() {
        this.refreshData();
    }

    refreshData() {

        var polyParams = [];

        var courses = this.props.gottenAcademyData? this.props.academyData : null;
        //console.log("courses", courses, this.props.gottenAcademyData)
        if (courses == null)
            polyParams.push({url: '/academy/courses', params: JSON.stringify({})});

        new Promise((resolve, reject) => {
            if (polyParams.length == 0)
                resolve(null);
            else
                this.props.actions.polyActions.polyRequest(polyParams).then((response) => {
                    resolve(response);
                }, reject);
        }).then((response) => {
            if (response != null) {
                var respIndex = 0;
                if (courses == null) {
                    courses = Array.isArray(response[respIndex])? response[respIndex] : null;
                    respIndex++;
                }
            }

            this.props.actions.academyActions.getAcademyData(courses).then((responseAcademyData) => {
                this.props.actions.academyActions.cleanAcademyReducer().then(() => {
                    this.setState({loading: false, initialLoading: false});
                });
            }, (err) => {
                this.setState({loading: false, initialLoading: false});
            });
        }, (err) => {
            this.setState({loading: false, initialLoading: false});
        });
    }

    componentDidUpdate(prevProps, prevState)
    {

        if (this._scrollView != "undefined" && this._scrollView != null)
            if (this.state.mediaStyle.orientation != "landscape")
            {
                if (Platform.OS == "android" || Platform.OS == 'ios')
                {
                    setTimeout(() => this._scrollView.scrollToEnd({animated: false}), 10);
                } else {
                    this._scrollView.scrollToEnd({animated: false});
                }
            }

    }

    createdByMe()
    {
        var createdByMe = false;

        var courseIndex = this.props.academyData.findIndex((n) => {
            return n.id == 7;
        });

        //console.log("this.state.idCourse", this.state.idCourse);
        if (courseIndex != -1)
        {
            if (this.props.academyData[courseIndex].courses.length > 0)
            {
                //console.log("this.props.academyData[courseIndex].courses", this.props.academyData[courseIndex].courses);
                var course = this.props.academyData[courseIndex].courses.find((n) => {
                    return n.id == this.state.idCourse;
                });
                if (course.creator.idUser == this.props.sessionData.idUser)
                {
                    createdByMe = true;
                }
            }
        }

        console.log("createdByMe", createdByMe);
        return createdByMe;
    }

    async deleteCourse()
    {
        console.log("deleteCourse");
        this.setState({loading: true});
        await this.props.actions.academyActions.deleteCourse(this.state.idCourse).then((response) => {

            console.log("deleteCourse response", response);

            this.setState({modalDeleteVisible: false});
            this.props.actions.academyActions.getAcademyData().then(() => {
                this.setState({loading: false});
            }, (error) => {
                this.setState({loading: false});
            });
        }, (error) => {
            this.setState({modalDeleteVisible: false, loading: false});
        });
    }

    deleteCoursePressed(idCourse)
    {
        this.setState({modalDeleteVisible: true, idCourse: idCourse})
    }

    render() {

        if (this.props.loadingReducer || this.state.initialLoading || this.props.sessionData == null || this.props.sessionData == "undefined") {

            var icons = [];
            if (this.props.isGardener)
                icons.push("gardener");
            icons.push("zone", "files", "academy");

            return(
                    <ImageBackground source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"} loading={false}>
                        <MainFliwerTopBar/>
                        <CategoryBarView ref={(r) => {
                                this._categoryBarView = r;
                            }}
                            visible={true} bodyStyle={{}} headerStyle={{}}
                            getCategoryID={(indexCategory) => {
                            }}>
                            {this.renderCategories(false)}
                        </CategoryBarView>
                        <FliwerLoading/>
                        <View style={{width: "100%", flex: 1}}></View>
                        <MainFliwerMenuBar idZone={null} current={"academy"} icons={icons} />
                    </ImageBackground>
                    );

            return(
                    <ImageBackground source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"} loading={false}>
                        <MainFliwerTopBar/>
                        <FliwerLoading/>
                    </ImageBackground>
                    )
        } else if (this.state.goCourseADD)
        {
            this.setState({goCourseADD: false})
            if (this.state.idCategory == null) {
                var idCategory = this.props.academyData[0].id;
                return (<Redirect push to={"/academyCourses/courseSettings/category/" + idCategory} />);
            } else {
                return (<Redirect push to={"/academyCourses/courseSettings/category/" + this.state.idCategory} />);
            }

        } else if (this.state.gotoCourse) {
            this.setState({gotoCourse: false});

            if (this.props.roles.fliwer || (this.props.roles.angel && this.createdByMe()))
            {
                var idCategory;
                if (!this.state.idCategory) {
                    idCategory = this.props.academyData[0].id;
                } else {
                    idCategory = this.state.idCategory;
                }

                return (<Redirect push to={"/academyCourses/courseSettings/category/" + idCategory + "/course/" + this.state.idCourse} />);

            } else {
                return (<Redirect push to={"/academyCourses/" + this.state.idCourse} />);
            }

        } else {

            var icons = [];
            if (this.props.isGardener)
                icons.push("gardener");
            icons.push("zone", "files", "academy");

            return (
                    <ImageBackground source={(!global.envVars.TARGET_RAINOLVE?background:rainolveBackground)} resizeMode={"cover"} loading={this.state.loading}>
                        <MainFliwerTopBar/>
                        <CategoryBarView ref={(r) => {
                                this._categoryBarView = r;
                            }}
                            visible={true}
                            getCategoryID={(indexCategory) => {
                                this.setState({idCategory: this.props.academyData[indexCategory].id})
                            }}>
                            {this.renderCategories(true)}
                        </CategoryBarView>
                        <MainFliwerMenuBar idZone={null} current={"academy"} icons={icons} />
                        <FliwerDeleteModal
                            visible={this.state.modalDeleteVisible}
                            onClose={() => {
                                this.setState({modalDeleteVisible: false})
                            }}
                            onConfirm={async () => {
                                console.log("FliwerDeleteModal - onConfirm");
                                await this.deleteCourse();
                            }}
                            title={this.props.actions.translate.get('Academy_delete_course_question')}
                            hiddeText={true}
                            password={false}
                            />

                    </ImageBackground>
                    );
        }

    }

    renderCategories(showCategoriesIn)
    {
        //console.log("render categoris ",this.props.academyData);
        var indents = [];

        if (this.props.academyData.length > 1)
        {
            var indexFound = this.props.academyData.findIndex((n) => {
                return n.id == 15;
            });
            var academy = [].concat(this.props.academyData);
            academy.splice(indexFound, 1);

            for (var index in academy)
            {
                indents.push(
                        <View key={"generalKey_" + index} title={academy[index].name} icon={academy[index].icon}>
                            <ScrollView scrollEventThrottle={1000} style={{flex: 1}} ref={(view) => this._scrollView = view}>
                                <CardCollection style={{}} cardView={[this.style.cardView]}>
                                    {showCategoriesIn?this.renderCourses(index, academy):null}
                                </CardCollection>
                            </ScrollView>
                        </View>)
            }

        }
        return indents;
    }

    renderCourses(index, academy)
    {
        var indents = []
        var coursesSorted = Object.assign(academy[index].courses)
        coursesSorted.sort((a, b) => {

            if (a.createTime < b.createTime) {
                return -1;
            } else if (a.createTime > b.createTime) {
                return 1;
            } else {

                if (a.email < b.email) {
                    return -1;
                } else if (a.email > b.email) {
                    return 1;
                } else
                    return 0
            }

            return 0;
        });

        for (var i in coursesSorted)
        {

            //actuallyMonth = moment(coursesSorted[i].createTime * 1000).format("MMM YYYY");
            var progress = Math.trunc(coursesSorted[i].maxPage / (coursesSorted[i].pages.length) * 100);
            if (progress > 100)
                progress = 100;
            if (coursesSorted[i].pages.length == 0)
                progress = 0;

            indents.push(<CourseCard key={"ccard_" + coursesSorted[i].id + i} audit={false} progress={progress} course={coursesSorted[i]} deleteCourse={(idCourse) => {
                                this.deleteCoursePressed(idCourse)
                            }} gotoCourse={(idCourse) => {
                                this.setState({gotoCourse: true, idCourse: idCourse});
                            }}/>);


        }

        // Add new card
        if (this.props.roles.fliwer || this.props.roles.angel)
            indents.push(
                <CourseCard key={999}
                    audit={false}
                    touchableFront={false}
                    onPressAdd={()=> this.setState({goCourseADD: true})}
            />);

        return indents;
    }

};

function mapStateToProps(state, props) {
    return {
        loadingReducer: state.academyReducer.loading,
        academyData: state.academyReducer.data,
        gottenAcademyData: state.academyReducer.gottenAcademyData,
        roles: state.sessionReducer.roles,
        isGardener: state.sessionReducer.isGardener,
        sessionData: state.sessionReducer.dataLogin
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            translate: bindActionCreators(ActionsLang, dispatch),
            polyActions: bindActionCreators(ActionPoly, dispatch)
        }
    };
}

var style = {
    background: {
        backgroundColor: "white",
        height: "100%",
    },
    contentViewContainer: {
        alignItems: "center",
        width: "100%",
        flexGrow: 1
    },
    collection: {

    },
    cardView: {

    },
    "@media (orientation:portrait)": {
        cardView: {
            maxWidth: 400,
            marginBottom: 71
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, AcademyCourses));
