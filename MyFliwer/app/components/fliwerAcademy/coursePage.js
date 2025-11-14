'use strict';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
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
    TextInput,
    Linking,
    Dimensions,
    Switch,
    Touchable,
    Switch
} = require('react-native');

import { CheckBox } from 'react-native-elements'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import * as _ from 'lodash';

import { FliwerColors, CurrentTheme } from '../../utils/FliwerColors'
import { FliwerCommonUtils } from '../../utils/FliwerCommonUtils'
import { fileStyles } from '../fliwerFiles/fileStyles'
import MainFliwerTopBar from '../mainFliwerTopBar.js'
import MainFliwerMenuBar from '../mainFliwerMenuBar.js'
import AcademyBottomBar from './academyBottomBar.js'
import Icon from 'react-native-vector-icons/Feather';
import IconEntypo from 'react-native-vector-icons/Entypo';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconEvil from 'react-native-vector-icons/EvilIcons';

import * as ActionAcademy from '../../actions/academyActions.js';
import * as ActionsLang from '../../actions/languageActions.js';
import * as ActionInvoice from '../../actions/invoiceActions.js';
import * as ActionBackgroundUpload from '../../actions/backgroundUploadActions.js';

import FliwerGreenButton from '../custom/FliwerGreenButton.js'
import FliwerDeleteModal from '../custom/FliwerDeleteModal.js'
import FliwerCarousel from '../custom/FliwerCarousel'
import FliwerExitButton from '../custom/FliwerExitButton2.js'
import FliwerImage from '../custom/FliwerImage.js'
import FliwerLocationModal from '../custom/FliwerLocationModal.js'
import CourseAddComponentInline from './courseAddComponentInline.js'

import { MediaPicker, FileDrop, getBase64 } from '../../utils/uploadMedia/MediaPicker'
import { DocumentPicker } from '../../utils/uploadFile/uploadFile'
import ImageBackground from '../../components/imageBackground.js'
import FliwerLoading from '../fliwerLoading'
import { Redirect, withRouter } from '../../utils/router/router'
import { Orientation } from '../../utils/orientation/orientation'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { mediaConnect } from '../../utils/mediaStyleSheet.js'
import { resizeImage } from '../../utils/resizeImage/resizeImage'
import { gpsUtils } from '../../utils/gpsUtils'
import { RNFS } from '../../utils/fs/fs'

import Modal from '../../widgets/modal/modal'
import Video from '../../widgets/video/video'
//import VideoRecorder from '../../widgets/videoRecorder/videoRecorder'
import { toast } from '../../widgets/toast/toast'
import ZoomImage from '../../widgets/zoomImage/zoomImage.js'

import addButton from '../../assets/img/add.png'
import deletePage from '../../assets/img/trash.png'
import roundedSquare from '../../assets/img/rounded-square.png'
import emptyPicture from '../../assets/img/empty-picture.png'
import MainFliwerCourseBar from '../MainFliwerCourseBar.js';
import moment from 'moment';
import MainFliwerTaskBar from '../MainFliwerTaskBar.js';
import CourseTaskComponent from './components/CourseTaskComponent.js';
import TaskSelectorComponent from './components/TaskSelectorComponent.js';

class AcademyCourses extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            initialLoading: true,
            idCategory: this.props.match.params.idCategory,
            idCourse: this.props.match.params.idCourse,
            urlUUID: this.props.match.params.uuid ? this.props.match.params.uuid : null,
            goMainScreen: false,
            course: null,
            selectedNewComponent: null,
            indexModifyComponent: null,
            lastIndexModifyComponent: null,
            auditing: false,
            visibleModalAddComponentList: false,
            visibleComponentModalADD: false,
            addIndex: -1,
            modalDeleteVisible: false,
            modalDeleteType: '',
            componentToDelete: null,
            isSwitchModeButtonInEditionModePosition: true,
            showPaggingModal: false,
            pageNumber: 0,
            totalPages: 1,
            goToPageNumber: '',
            goToSettings: false,
            showMovePageToModal: false,
            movePageTo: '',
            showErrorModal: false,
            errorText: "",
            errorText2: "",
            visibleModalDeviceLocation: false,
            coords: null,
            titleForm: '',
            // Image component
            images: {},
            uriImage: null,
            imageHeight: null,
            imageWidth: null,
            imageSize: 'medium',

            // Video component
            uriVideo: null,
            videoMute: true,
            fileVideo: null,
            recVideo: false,
            videoIsRecorded: false,
            videoUploaded: false,

            // Title component
            titleFormNew: null,
            titleGreenFormNew: null,

            // Subtitle component
            subtitleFormNew: null,
            subtitle1FormNew: null,
            subtitle2FormNew: null,

            // Text component
            textFormNew: null,
            justifiedText: false,

            // Exam component
            exam: {},
            examScore: null,
            examSelectedOptions: [],

            // File component
            uriFile: null,
            files: null,
            file: null,
            filePicker: null,

            // Delimiter component
            delimiterHeightFormNew: null,
            delimiterAddLineFormNew: null,
            delimiterHeightDefaultValue: 60,
            delimiterAddLineDefaultValue: true,

            // Upd/Down component
            timeout_up_down: null,

            zoomImageVisible: false,
            zoomImage: '',

            selectedTab: 'editable'
        };

        this.currentLoadId = 0;

        /*  if (this.state.urlUUID) {
             //Get course by uuid
 
             this.props.actions.academyActions.getCourseByUUID(this.state.urlUUID).then((response) => {
                 this.state.idCourse = response.id;
                 this.load();
                 this.setState({ initialLoading: false });
             }, (error) => {
                 this.setState({ initialLoading: false })
             })
         } else {
 
             this.props.actions.academyActions.getCourse(this.state.idCourse).then((course) => {
                 this.load();
                 this.setState({ initialLoading: false });
             }, (error) => {
                 this.setState({ initialLoading: false })
             })
         } */
    }

    loadCourse = (idCourse) => {
        this.currentLoadId += 1;
        const loadId = this.currentLoadId;

        this.props.actions.academyActions.getCourse(idCourse).then((course) => {
            if (this.currentLoadId !== loadId) return;

            const newState = {
                course,
                titleForm: course?.title || '',
                totalPages: (course?.pages?.length > 0) ? course.pages.length : 1,
                examScore: course?.score ?? null,
                auditing: true,
                initialLoading: false
            };

            this.setState(newState, () => {
                if (!this.hasPermissionToEdit() && !this.state.urlUUID) {
                    this.props.actions.academyActions.setMaxPage(idCourse, 0);
                }

                if (this.props.isGardener) {
                    this.props.actions.invoiceActions.getClientInformation();
                }
            });
        }).catch(() => {
            if (this.currentLoadId !== loadId) return;
            this.setState({ initialLoading: false });
        });
    };

    async load() {
        const response = this.getCourse();

        const newState = {
            auditing: true,
            course: response,
            titleForm: response?.title || '',
            files: this.props.newCourseFilesReducer || [],
            totalPages: (response?.pages?.length > 0) ? response.pages.length : 1,
            examScore: response?.score ?? null,
        };

        this.setState(newState, () => {
            if (!this.hasPermissionToEdit() && !this.state.urlUUID) {
                this.props.actions.academyActions.setMaxPage(this.state.idCourse, 0);
            }

            if (this.props.isGardener) {
                this.props.actions.invoiceActions.getClientInformation().then(() => {
                });
            }
        });
    }

    handleCourseTitle() {
        const workOrder = this.state.course

        const currentDay = moment.unix(workOrder?.createTime).locale('es').format('dddd DD/MM/YYYY');
        const currentDayCapitalized = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);

        return this.state?.course?.softId
        return `${this.state?.course?.softId} - ${currentDayCapitalized}`
    }

    validateTitleForm() {
        if (!this.state.titleForm) {
            this.setState({ titleForm: this.state.course.title })
        } else {
            if (this.state.titleForm !== this.state.course.title) {
                this.modifyTitleCourse();
            }
        }
    }

    async modifyTitleCourse() {
        var newCourse = {};

        newCourse.title = this.state.titleForm;
        newCourse.description = this.state.course.descriptionForm;
        newCourse.datetime = this.state.course.datetime;
        newCourse.coords = this.state.course.coords;
        newCourse.pages = this.state.course.pages;
        newCourse.creator = this.state.course.creator;
        newCourse.createTime = this.state.course.createTime;
        newCourse.idTicketAudit = this.state.course.idTicketAudit;

        this.setState({ loading: true })

        try {
            await this.props.actions.academyActions.updateWorkOrderTemplate(this.state.course.id, newCourse);
            this.setState({
                loading: false,
                idCourse: this.state.course.id,
                course: {
                    ...this.state.course,
                    title: newCourse.title
                }
            });
        } catch (err) {
            toast.error(err.reason)
            this.setState({ loading: false });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const prevCourseId = prevProps.match.params.idCourse;
        const currentCourseId = this.props.match.params.idCourse;

        if (prevCourseId !== currentCourseId) {
            this.setState({ initialLoading: true, idCourse: currentCourseId }, () => {
                this.loadCourse(currentCourseId);
            });
        }

        if (!prevProps.isDeleting && this.props.isDeleting === true) {
            if (this.props.asTemplate || this.props.asWorkOrder) {
                this.props.setDeletingItem?.(this.state.course?.id);
            }
        }

        if (prevState?.pageNumber !== this.state.pageNumber) {
            this.refs._scrollView?.scrollTo?.(0);
        }
    }

    componentDidMount() {
        const { uuid, idCourse } = this.props.match.params;

        if (uuid) {
            this.props.actions.academyActions.getCourseByUUID(uuid).then((response) => {
                this.setState({ idCourse: response.id }, () => {
                    this.loadCourse(response.id);
                });
            }).catch(() => {
                this.setState({ initialLoading: false });
            });
        } else {
            this.loadCourse(idCourse);
        }
    }


    /*
     *
     *
     *
     *
     *
     *
     *
     *
     *
     * START RENDER
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */

    render() {
        //console.log('RENDER', this.state.course)
        if (this.state.initialLoading) {
            return (
                <ImageBackground style={{ backgroundColor: CurrentTheme.complementaryColor }} loading={false}>
                    {!this.props.asComponent && <MainFliwerTopBar />}
                    <FliwerLoading />
                </ImageBackground>
            )
        } else if (!this.state.idCourse) {
            if (this.state.auditing) {
                return (<Redirect push to={"/audit"} />)
            } else {
                return (<Redirect push to={"/academyCourses"} />)
            }
        } else if (this.state.goMainScreen) {
            this.setState({ goMainScreen: false })
            if (this.state.auditing) {
                return (<Redirect push to={"/files"} />)
            } else {
                return (<Redirect push to={"/academyCourses"} />)
            }
        } else if (this.state.gotoModifyCourseInformation) {
            this.setState({ gotoModifyCourseInformation: false })

            if (!this.state.idCategory) {
                var idCategory = this.getCategoryID()
            } else {
                var idCategory = this.state.idCategory
            }

            if (this.state.auditing) {
                return (<Redirect push to={"/audit/courseSettings/category/" + idCategory + "/course/" + this.state.idCourse} />)
            } else {
                return (<Redirect push to={"/academyCourses/courseSettings/category/" + idCategory + "/course/" + this.state.idCourse} />)
            }

        } else {
            var hasPage = false;
            if (this.isEditionMode() && this.state.course && this.state.course.pages.length > 0 && this.state.course.pages[this.state.pageNumber] && this.state.course.pages[this.state.pageNumber].components.length > 0 && this.state.pageNumber == this.state.totalPages - 1)
                hasPage = true;

            // Set icons
            var topIcons = [];
            var bottomIcons = [];

            if (this.state.auditing) {
                if (this.state.course.isTicket == 1)
                    topIcons.push("ticket");
                else
                    topIcons.push("audit");
            }
            else {
                topIcons.push("course");
            }
            topIcons.push("pages");

            if (this.props.isGardener)
                bottomIcons.push("gardener");
            bottomIcons.push("zone", "files", "academy");

            var showTextBar = false;
            var client = "";
            if (this.props.isGardener && this.props.clientDataReducer && this.props.clientDataReducer.first_name) {
                client = this.props.clientDataReducer.first_name + " " + this.props.clientDataReducer.last_name;
                showTextBar = true;
            }

            var topIcons = [];
            var bottomIcons = [];
            topIcons.push("ticket");
            topIcons.push("pages");
            var currentIcon = "pages";

            return (
                <ImageBackground style={{ backgroundColor: CurrentTheme.complementaryColor }} loading={this.state.loading}
                    onLayout={() => {
                        this.setState({ images: {} })
                    }}
                >
                    {!this.props.asComponent && <MainFliwerTopBar showTextBar={showTextBar} title={client} />}
                    {this.props.asComponent && !this.props.asWorkOrder && !this.props.asTemplate &&
                        <MainFliwerMenuBar idZone={null} current={currentIcon} icons={topIcons} position={"top"}
                        >
                            <View
                                style={{
                                    width: "100%",
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <View style={{ width: "60%" }}>
                                    <TextInput
                                        style={{ height: 30, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, color: CurrentTheme.primaryText }}
                                        onChangeText={(text) => {
                                            this.setState({ titleForm: text })
                                        }}
                                        value={this.state.titleForm}
                                        maxLength={200}
                                        onBlur={() => {
                                            this.validateTitleForm()
                                        }}
                                    />
                                </View>
                                <View style={{}}>
                                    <Text style={[this.style.textFormat2]}>{this.state?.course?.softId || ''}</Text>
                                </View>
                            </View>
                        </MainFliwerMenuBar>
                    }

                    {this.props.asComponent && (this.props.asTemplate || this.props.asWorkOrder) &&
                        <MainFliwerCourseBar
                            idZone={null}
                            current={currentIcon}
                            icons={topIcons}
                            position={"top"}
                        /* onPress={[
                            () => {
                                this.setState({goToSettings:true})
                            },
                            () => {
                            console.log("pages pressed");
                        }]}  */
                        >
                            <View
                                style={{
                                    width: "100%",
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <View style={{ flex: 1, paddingLeft: '10px' }}>
                                    {
                                        this.props.asWorkOrder
                                            ?
                                            <Text style={[this.style.textFormat2, { color: CurrentTheme.cardText }]}>
                                                {this.state?.course?.title}
                                            </Text>
                                            :
                                            <TextInput
                                                style={{ height: 30, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, color: CurrentTheme.primaryText }}
                                                onChangeText={(text) => {
                                                    this.setState({ titleForm: text })
                                                }}
                                                value={this.state.titleForm}
                                                maxLength={200}
                                                onBlur={() => {
                                                    this.validateTitleForm()
                                                }}
                                            />
                                    }
                                </View>
                                <View style={{ flex: 1, alignItems: 'center' }}>
                                    <Text style={[this.style.textFormat2, { color: CurrentTheme.cardText }]}>
                                        {`${this.props.isEditionMode ? 'Modo edición' : 'Modo visualización'}`}
                                    </Text>
                                </View>


                                <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: '10px' }}>
                                    {
                                        this.props.asWorkOrder
                                            ?
                                            <Text style={[this.style.textFormat2, { color: CurrentTheme.cardText }]}>
                                                {this.handleCourseTitle()}
                                            </Text>
                                            :
                                            <Text style={[this.style.textFormat2]}>{this.state?.course?.softId || ''}</Text>
                                    }
                                </View>
                            </View>
                        </MainFliwerCourseBar>
                    }

                    {false ? <MainFliwerMenuBar idZone={null} current={"pages"} icons={topIcons} position={"top"} /> : null}
                    <ScrollView
                        scrollEventThrottle={1000} style={[fileStyles.scrollViewStyle, { width: "100%", padding: 20, backgroundColor: CurrentTheme.secondaryView }]}
                        contentContainerStyle={{ paddingBottom: Platform.OS != "web" ? 50 : 0 }} ref='_scrollView'>
                        <View
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                                maxWidth: 1000,
                                //                                    borderColor: "red",
                                //                                    borderWidth: 1,
                                marginTop: 0,
                                marginBottom: 0,
                                backgroundColor: CurrentTheme.cardColor,

                                shadowColor: FliwerColors.primary.black,
                                shadowOffset: { width: 0, height: 5 },
                                shadowOpacity: 0.8,
                                shadowRadius: 10,

                                paddingTop: 20, paddingBottom: 30,
                                paddingLeft: 20, paddingRight: 20,
                                marginLeft: "auto",
                                marginRight: "auto"
                            }}
                        >
                            {
                                this.props.asWorkOrder
                                    ?
                                    <View
                                        style={{
                                            position: "absolute",
                                            left: 10,
                                            top: 10
                                        }}
                                    >
                                        <Text style={[this.style.textFormat2, { color: CurrentTheme.cardText }]}>
                                            Parte {this.handleCourseTitle()}
                                        </Text>
                                    </View>
                                    :
                                    null
                            }
                            {this.renderPage()}
                            {
                                (this.props.asWorkOrder && this.state.course.lastUpdateTime)
                                    ?
                                    <View
                                        style={{
                                            margintop: 10,
                                            width:"100%",
                                            textAlign:"right"
                                        }}
                                    >
                                        <Text style={[this.style.textFormat2, { color: CurrentTheme.cardText }]}>
                                            {this.props.actions.translate.get('Last_update')} {moment.unix(this.state.course.lastUpdateTime).locale('es').format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </View>
                                    :
                                    null
                            }
                            {!this.props.asComponent && <FliwerExitButton onPress={() => this.setState({ goMainScreen: true })} containerStyle={[this.style.exitButton, this.isEditionMode() ? {/*backgroundColor: "white", borderWidth: 1, borderColor: "gray", */right: 15, top: 15 } : {}]} />}
                        </View>
                    </ScrollView>

                    {
                        this.props.asWorkOrder &&
                        <>
                            <MainFliwerTaskBar
                                addPhoto={(component) => {
                                    this.getPhotos(null, ({ uriImage, error }) => {
                                        if (error || !uriImage) return;

                                        setTimeout(() => {
                                            this.addComponent(component);
                                        }, 500) //Not the best solution, but at the moment works
                                    });
                                }}
                                addFile={(component) => {
                                    this.getFiles(({ filePicker, error }) => {
                                        if (error || !filePicker) return;

                                        this.setState(
                                            { visibleModalAddComponentList: false },
                                            () => this.addComponent(component)
                                        );
                                    });
                                }}
                                addVideo={(component) => {
                                    this.PickVideo(component);
                                }}
                                addText={(text, component) => {
                                    this.setState({
                                        textFormNew: text
                                    })
                                    setTimeout(() => {
                                        this.addComponent(component);
                                    }, 500)
                                }}
                                idUser={this.state.course.idUser}
                            />

                            {this.renderInputFileImage()}
                            {this.renderInputFile("video")}
                        </>
                    }
                    {
                        !this.props.asTemplate && !this.props.asWorkOrder
                        &&
                        <AcademyBottomBar
                            addPageFunction={hasPage ? () => {
                                this.addPage()
                            } : null}
                            barContainerCustomStyle={{}}
                            actualScreen={this.state.pageNumber + 1}
                            totalScreens={this.state.totalPages}
                            arrowLeft={async () => {
                                await this.goBackPressed()
                            }}
                            arrowRight={async () => {
                                await this.goNextPressed()
                            }}
                            hasNext={!hasPage || this.state.pageNumber != this.state.totalPages}
                            pagging={this.state.totalPages > 0 ? () => {
                                this.setState({ showPaggingModal: true, goToPageNumber: this.state.pageNumber + 1 });
                            } : null}
                        />
                    }
                    {!this.props.asComponent && <MainFliwerMenuBar idZone={null} current={"pages"} icons={bottomIcons} />}

                    {this.state.goToSettings && <Redirect push to={'/app/workOrder/templates/' + this.state.idCourse} />}

                    {
                        !this.props.asTemplate && !this.props.asWorkOrder
                        &&
                        <>
                            {this.renderAddButton()}
                            {this.renderDeleteButton()}
                            {this.renderSwitchModeButton()}
                            {this.renderReloadButton()}
                        </>
                    }
                    {this.state.visibleModalAddComponentList ? this.renderModalAddComponentList() : null}
                    {this.state.visibleComponentModalADD ? this.renderModalNewComponent() : null}
                    <FliwerDeleteModal
                        visible={this.state.modalDeleteVisible}
                        onClose={() => {
                            this.setState({ modalDeleteVisible: false })
                        }}
                        onConfirm={() => {
                            this.setState({ modalDeleteVisible: false });
                            if (this.state.modalDeleteType == 'page')
                                this.deletePage();
                            else
                                this.deleteComponent(this.state.componentToDelete);
                        }}
                        title={this.state.modalDeleteType == 'page' ? this.props.actions.translate.get('Academy_delete_page') : this.props.actions.translate.get('Academy_delete_component')}
                        hiddeText={true}
                        password={false}
                        loadingModal={this.state.loading}
                    />
                    {this.state.showPaggingModal ? this.renderModalGoToPage() : null}
                    {this.state.showMovePageToModal ? this.renderModalMovePageTo() : null}
                    {this.renderErrorModal()}
                    {this.renderZoomImageModal()}

                </ImageBackground>
            );
        }
    }

    renderLastUpdate(lastUpdateName, lastUpdateTime, forzeRender = false, cardColor = false) {

        if (!this.isEditionMode() && !forzeRender) return null

        const currentDay = lastUpdateTime ? moment.unix(lastUpdateTime).locale('es').format('DD/MM/YYYY HH:mm') : ''

        var styles = {
            position: 'absolute',
            bottom: 5
        };

        if (this.isEditionMode() || forzeRender) {
            styles = {
                ...styles,
                left: 5
            }
        } else {
            styles = {
                ...styles,
                right: 5,
                bottom: -10
            }
        }

        return (
            <View
                style={styles}
            >
                <Text
                    style={{
                        fontSize: 12,
                        color: cardColor ? CurrentTheme.cardText : (this.isEditionMode() || forzeRender) ? FliwerColors.primary.gray : FliwerColors.secondary.lightGreen
                    }}
                >
                    {lastUpdateName || ''} {currentDay}
                </Text>
            </View>
        )
    }

    renderPage() {
        var indents = [];

        var course = this.state.course;

        if (course && course.pages && course.pages[this.state.pageNumber] && course.pages[this.state.pageNumber].components.length > 0) {
            var dimensions = Dimensions.get('window');
            //console.log("dimensions.width", dimensions.width);
            var that = this;
            //var totalComp = course.pages[this.state.pageNumber].components.length;
            for (var index in course.pages[this.state.pageNumber].components) {
                if (this.isEditionMode())
                    indents.push(<CourseAddComponentInline
                        index={index}
                        onPress={(index) => {
                            this.setState({ visibleModalAddComponentList: true, addIndex: index })
                        }}
                    />);

                var currentComp = course.pages[this.state.pageNumber].components[index];
                var type = currentComp.type;
                //console.log("Index: " + index + ", Type: " + type);
                var values = currentComp.values;
                var previousComp = (index > 0) ? course.pages[this.state.pageNumber].components[index - 1] : null;
                var customMarginTop;
                //console.log('type', currentComp)
                if (type == 0) {
                    var text = values.text.toUpperCase();
                    var greenText = values.greenText ? (" " + values.greenText.toUpperCase()) : "";
                    //                    var text = values.text;
                    //                    var greenText = values.greenText? (" " + values.greenText) : "";
                    var text1 = text, text2 = greenText;

                    indents.push(
                        <View style={[this.isEditionMode() ? this.style.editFormatComponent : index == 0 ? { marginTop: 10 } : { marginTop: 40 }]}>
                            <View style={[this.style.titleFormatContainer, { width: "100%" }]}>
                                <Text style={{
                                    fontSize: 26, fontWeight: "600",
                                    fontFamily: FliwerColors.fonts.title,
                                    //fontFamily: 'Quicksand-Book',
                                    textAlign: "center", color: this.isEditionMode() ? FliwerColors.primary.black : CurrentTheme.cardText
                                }}>
                                    <Text>{text1}</Text>
                                    <Text style={[{ color: FliwerColors.primary.green }]}>{text2}</Text>
                                </Text>
                            </View>
                            {this.renderEditOptions(index)}
                            {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                        </View>
                    );

                } else if (type == 1) {
                    customMarginTop = (previousComp && previousComp.type == 0) ? 20 : 10;
                    //var anyBullet = values.text.includes("{bullet}");
                    //var text = values.text.replace(/{bullet}/g, '');
                    //<Text style={{fontSize: 10}}>{'\u2B24' + text}</Text>

                    var contentText = values.text;
                    var anyHtmlTag = (contentText.indexOf("<b>") != -1 || contentText.indexOf("<i>") != -1);
                    if (anyHtmlTag)
                        contentText = this.props.actions.translate.getHTMLToTextNode(contentText);

                    indents.push(
                        <View style={[this.style.componentWrapper, this.isEditionMode() ? this.style.editFormatComponent : { marginTop: customMarginTop }]}>
                            <View style={[this.style.textFormatContainer]}>
                                <Text style={[this.style.textFormat, { padding: 10, lineHeight: 25, color: this.isEditionMode() ? FliwerColors.primary.black : CurrentTheme.cardText }, values.justified ? { textAlign: "justify" } : {}]}>{contentText}</Text>
                            </View>
                            {this.renderEditOptions(index)}
                            {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                        </View>
                    );

                } else if (type == 2) {
                    if (values && values.url.indexOf("/getFile/academy/data:image/") != -1) {
                        console.log("Img error", values.url);
                    } else {

                        if (!this.state.images) {
                            this.state.images = {};
                        }
                        if (!this.state.images[this.state.pageNumber]) {
                            this.state.images[this.state.pageNumber] = {};
                        }
                        var propindex = "index-" + index;
                        if (!this.state.images[this.state.pageNumber][propindex]) {
                            this.state.images[this.state.pageNumber][propindex] = {
                                width: null,
                                height: null,
                                calculatedSize: false,
                                calculatingSize: false,
                                url: values.url,
                                realImageWidth: (values.realImageWidth ? values.realImageWidth : null),
                                realImageHeight: (values.realImageHeight ? values.realImageHeight : null)
                            };
                        }
                        //console.log("VALUES IMAGE", values);

                        if (!this.state.images[this.state.pageNumber][propindex].height && this.state.images[this.state.pageNumber][propindex].realImageWidth && this.state.images[this.state.pageNumber][propindex].realImageHeight) {
                            var customSize = this.getCustomSize(this.state.images[this.state.pageNumber][propindex].realImageWidth, this.state.images[this.state.pageNumber][propindex].realImageHeight);
                            this.state.images[this.state.pageNumber][propindex].width = customSize.width;
                            this.state.images[this.state.pageNumber][propindex].height = customSize.height;
                        }
                        if (!this.state.images[this.state.pageNumber][propindex].height && !this.state.images[this.state.pageNumber][propindex].calculatedSize && !this.state.images[this.state.pageNumber][propindex].calculatingSize) {
                            this.getSizeImage(this.state.pageNumber, propindex);
                        }

                        var height = this.state.images[this.state.pageNumber][propindex].height ? this.state.images[this.state.pageNumber][propindex].height : null;
                        height = (height && height > 0) ? parseInt(height) : null;
                        //console.log("The height of IMAGE is: ", height);
                        var width = this.state.images[this.state.pageNumber][propindex].width ? this.state.images[this.state.pageNumber][propindex].width : null;
                        width = (width && width > 0) ? parseInt(width) : 0;

                        if (height) {
                            var imageSize = values.imageSize ? values.imageSize : 'medium';
                            var perc = this.getImageHeightPercentage(imageSize, dimensions);
                            height = parseInt(height * perc / 100);
                            var location = values.coords ? values.coords : null;
                            /*width = parseInt(width * perc / 100);
                            console.log(width, dimensions.width)
                            if (width > (dimensions.width - 100)) {
                                width = dimensions.width - 100;
                            }*/

                            indents.push(
                                <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 25, marginBottom: 25 }]}>
                                    {this.renderImage(values.url, height)}
                                    {this.renderLocation(location, values.url)}
                                    {this.renderEditOptions(index)}
                                    {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                                </View>
                            );
                        }
                    }

                } else if (type == 3) {
                    var pendingFile = null;
                    if (values.idAsyncFileUpload) {
                        pendingFile = this.props.backgroundUploadPendingFiles.find(x => x.id == values.idAsyncFileUpload);
                    }

                    //console.log("Video values", values);
                    if (values && values.url && values.url.indexOf("/getFile/academy/data:image/") != -1) {
                        console.log("Img error (video)", values.url);
                    } else {

                        if (values.url && /^file_/.test(values.url)) {
                            var aryIndex = values.url.split("_");
                            var indexIDFile = aryIndex[1]
                            var urlVideo = this.state.files[indexIDFile].uri
                        } else {

                            urlVideo = values.url;
                        }

                        //var poster = values.image? values.image : "http://localhost:8123/getFile/academy/246_kfgjtb5302rz09bbddcuavi1.jpg";
                        var poster, realImageWidth, realImageHeight;
                        if (values.image) {
                            poster = values.image;
                            realImageWidth = values.realImageWidth ? values.realImageWidth : null;
                            realImageHeight = values.realImageHeight ? values.realImageHeight : null;
                        }
                        else {
                            poster = emptyPicture;
                            realImageWidth = 622;
                            realImageHeight = 415;
                        }

                        if (!this.state.images) {
                            this.state.images = {};
                        }
                        if (!this.state.images[this.state.pageNumber]) {
                            this.state.images[this.state.pageNumber] = {};
                        }
                        var propindex = "index-" + index;
                        if (!this.state.images[this.state.pageNumber][propindex]) {
                            this.state.images[this.state.pageNumber][propindex] = {
                                width: null,
                                height: null,
                                calculatedSize: false,
                                calculatingSize: false,
                                url: poster,
                                realImageWidth: realImageWidth,
                                realImageHeight: realImageHeight
                            };
                        }
                        if (!this.state.images[this.state.pageNumber][propindex].height && this.state.images[this.state.pageNumber][propindex].realImageWidth && this.state.images[this.state.pageNumber][propindex].realImageHeight) {
                            //console.log("customSize", this.state.images[this.state.pageNumber][propindex].height, this.state.images[this.state.pageNumber][propindex].realImageWidth, this.state.images[this.state.pageNumber][propindex].realImageHeight);
                            var customSize = this.getCustomSize(this.state.images[this.state.pageNumber][propindex].realImageWidth, this.state.images[this.state.pageNumber][propindex].realImageHeight);
                            this.state.images[this.state.pageNumber][propindex].width = customSize.width;
                            this.state.images[this.state.pageNumber][propindex].height = customSize.height;
                        }
                        if (!this.state.images[this.state.pageNumber][propindex].height && !this.state.images[this.state.pageNumber][propindex].calculatedSize && !this.state.images[this.state.pageNumber][propindex].calculatingSize) {
                            //console.log("getSizeImage");
                            this.getSizeImage(this.state.pageNumber, propindex);
                        }
                        height = this.state.images[this.state.pageNumber][propindex].height ? this.state.images[this.state.pageNumber][propindex].height : null;
                        height = (height && height > 0) ? parseInt(height) : null;
                        //console.log("The height of VIDEO is: ", height);

                        if (height) {
                            //console.log("urlVideo", urlVideo);
                            var imageSize = values.imageSize ? values.imageSize : 'medium';
                            var perc = this.getImageHeightPercentage(imageSize, dimensions);
                            height = parseInt(height * perc / 100);

                            var bgc = this.isEditionMode() ? "#f5f3f0" : "white";

                            if (pendingFile && (!values.url || values.url.includes("null"))) {
                                if (!pendingFile.canceled) {

                                    if (!pendingFile.percentage) pendingFile.percentage = 0;
                                    indents.push(
                                        <View id={pendingFile.id + "_view1"} style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 25, marginBottom: 25 }]}>
                                            <View id={pendingFile.id + "_view2"} style={[this.style.videoWrapper, { paddingLeft: 5, paddingRight: 5, borderRadius: 4, backgroundColor: "rgba(220,220,220,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }, height ? { height: 200 } : {}]}>
                                                <Text id={pendingFile.id + "text1"} style={{ color: "white", fontSize: 12, position: "absolute", left: 5, top: 5 }}>{pendingFile.fileName}</Text>
                                                <TouchableOpacity id={pendingFile.id + "_touchable1"} style={{ width: 80, height: 80, borderRadius: 45, display: "flex", alignItems: "center", justifyContent: "center" }} onPress={() => this.props.actions.backgroundUploadActions.cancelUpload(pendingFile.id)}>
                                                    <AnimatedCircularProgress
                                                        id={pendingFile.id + "_circle1"}
                                                        size={80}
                                                        width={6}
                                                        rotation={0}
                                                        fill={parseFloat(pendingFile.percentage).toFixed(2)}
                                                        tintColor={FliwerColors.primary.green}
                                                        backgroundColor="#3d5875">
                                                        {
                                                            (fill) => {
                                                                return (
                                                                    <Text>
                                                                        {fill.toFixed(1) + "%"}
                                                                    </Text>
                                                                );
                                                            }
                                                        }
                                                    </AnimatedCircularProgress>
                                                </TouchableOpacity>
                                            </View>
                                            {this.renderEditOptions(index)}
                                        </View>
                                    );
                                } else {
                                    indents.push(
                                        <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 25, marginBottom: 25 }]}>
                                            <View style={[this.style.videoWrapper, { paddingLeft: 5, paddingRight: 5, borderRadius: 4, backgroundColor: "rgba(220,220,220,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }, height ? { height: 200 } : {}]}>
                                                <Text style={{ color: "white", fontSize: 12, position: "absolute", left: 5, top: 5 }}>{pendingFile.fileName}</Text>
                                                <TouchableOpacity style={{ backgroundColor: "rgba(0,0,0,0.6)", width: 50, height: 50, borderRadius: 45, display: "flex", alignItems: "center", justifyContent: "center" }} onPress={() => {
                                                    this.props.actions.backgroundUploadActions.retryPendingToUploadFile(pendingFile.id);
                                                }}>
                                                    <Text style={{ color: "white", fontSize: 12, position: "absolute" }}>{"Retry"}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            {this.renderEditOptions(index)}
                                        </View>
                                    );
                                }
                            } else {
                                indents.push(
                                    <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 25, marginBottom: 25 }]}>
                                        <View style={[this.style.videoWrapper, { paddingLeft: 5, paddingRight: 5, borderRadius: 4 }, height ? { height: height } : {}]}>
                                            <Video source={urlVideo}
                                                backgroundColor={bgc}
                                                resizeMode={"contain"}
                                                customStyle={{}}
                                                mute={values.mute}
                                                autoplay={false}
                                                orientation={values.portrait ? "portrait" : ""}
                                                completeURL={true}
                                                poster={values.image ? { uri: poster } : poster} />
                                        </View>
                                        {this.renderEditOptions(index)}
                                        {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                                    </View>
                                );
                            }

                        }
                        else {
                            console.log("No video height");
                            //                        console.log("propindex", propindex);
                            //                        console.log("this.state.images[this.state.pageNumber][propindex]", this.state.images[this.state.pageNumber][propindex]);
                        }
                    }

                } else if (type == 4) {
                    indents.push(
                        <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 20 }]}>
                            {this.renderExam(course, index)}
                            {this.renderEditOptions(index)}
                        </View>
                    )
                } else if (type == 5) {
                    if (/^file_/.test(values.url)) {
                        var aryIndex = values.url.split("_");
                        var indexIDFile = aryIndex[1]
                        var url = this.state.files[indexIDFile].uri

                        var aryExtension = this.state.files[indexIDFile].name.split(".");

                        if (aryExtension.length >= 1)//if dont have extension
                        {
                            if (aryExtension[1].length > 4)
                                var extension = aryExtension[1].substring(0, 4);
                            else
                                var extension = aryExtension[1]
                        } else {
                            if (aryExtension[0].length > 4)
                                var extension = aryExtension[0].substring(0, 4);
                            else
                                var extension = aryExtension[0]
                        }

                        var nameFileNoExtension = this.state.files[indexIDFile].name.split('.').slice(0, -1).join('.');
                        var nameFile = this.state.files[indexIDFile].name
                    } else {

                        if (values.name)//selected file
                        {
                            var nameFile = values.name
                            var nameFileNoExtension = nameFile.split('.').slice(0, -1).join('.');
                            var url = values.url
                            var extension = nameFile.slice((nameFile.lastIndexOf(".") - 1 >>> 0) + 2)

                        } else {//just url
                            var ary = values.url.split("/");
                            var nameFile = ary[ary.length - 1];
                            var nameFileNoExtension = nameFile.split('.').slice(0, -1).join('.');
                            var url = values.url
                            var extension = nameFile.slice((nameFile.lastIndexOf(".") - 1 >>> 0) + 2)
                        }
                    }

                    indents.push(
                        <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 10 }]}>

                            <View style={[this.style.lineContainer]}>
                                <View style={[this.style.lineCenter]}></View>
                            </View>

                            <View style={[this.style.textFormatContainer, { marginTop: 20, marginBottom: 20 }]}>
                                <View style={[{ paddingLeft: 15 }]}>
                                    <TouchableOpacity style={[{ flexDirection: "row", alignSelf: "center", justifyContent: "center", backgroundColor: "#f5f5f5", alignItems: "center", placeSelf: "center", paddingTop: 20, paddingBottom: 20, width: "100%" }]} onPress={this.downloadFileHandle(url, nameFile)} >
                                        <IconFontAwesome name="file-pdf-o" size={15} style={{ color: FliwerColors.primary.black }} />
                                        <Text style={[{ fontFamily: FliwerColors.fonts.regular, paddingLeft: 10, fontSize: 14 }]} ellipsizeMode='tail' numberOfLines={1} >{nameFileNoExtension}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[this.style.lineContainer]}>
                                <View style={[this.style.lineCenter]}></View>
                            </View>

                            {this.renderEditOptions(index)}
                            {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                        </View>
                    )
                } else if (type == 9) // subtitle
                {
                    indents.push(
                        <View style={[this.isEditionMode() ? this.style.editFormatComponent : {}]}>
                            <View style={[this.style.titleFormatContainer, this.isEditionMode() ? {} : { marginTop: 20, marginBottom: 10 }]}>
                                <Text style={[this.style.textFormat, { lineHeight: 25, textAlign: "center", fontWeight: "bold", color: this.isEditionMode() ? {} : CurrentTheme.cardText }]}>{values.text}</Text>
                            </View>
                            {this.renderEditOptions(index)}
                            {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                        </View>
                    )
                } else if (type == 10) // Delimiter
                {
                    var lineHeight = this.state.delimiterHeightDefaultValue; // values.height;
                    var addLine = this.state.delimiterAddLineDefaultValue; // values.addLine;

                    var totalheight = this.isEditionMode() ? (parseInt(lineHeight) + 40) : parseInt(lineHeight);
                    var linewrapperstyle = this.isEditionMode() ? { height: totalheight - 40 } : {};
                    var editboxstyle = this.isEditionMode() ? { height: 40 } : {};

                    //                    console.log("totalheight " + totalheight);
                    //                    console.log("linewrapperstyle", linewrapperstyle);
                    //                    console.log("editboxstyle", editboxstyle);

                    indents.push(
                        <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 10 }, { height: totalheight }]}>
                            {addLine ? <View style={[this.style.lineDelimiter, linewrapperstyle]}>
                                <View style={[this.style.lineCenter, { height: 2 }]}></View>
                            </View> : null}
                            <View style={editboxstyle}>
                                {this.renderEditOptions(index, true, true)}
                            </View>
                            {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}

                        </View>
                    );
                } else if (type == 11) { //new edit text
                    customMarginTop = (previousComp && previousComp.type == 0) ? 20 : 10;

                    const {
                        placeHolder,
                        text
                    } = currentComp.values

                    indents.push(
                        <View
                            key={`textareaRef_${currentComp.id}`}
                            style={[this.style.componentWrapper, this.isEditionMode() ? this.style.editFormatComponent : {}, { marginTop: customMarginTop }]}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: CurrentTheme.primaryColor,
                                    marginBottom: 6,
                                }}
                            >
                                {placeHolder}
                            </Text>
                            {
                                Platform.OS === 'web'
                                    ?
                                    <textarea
                                        ref={(ref) => {
                                            if (ref) {
                                                this[`textareaRef_${currentComp.id}`] = ref;
                                                // Autosize inicial si ya hay texto
                                                ref.style.height = 'auto';
                                                ref.style.height = `${ref.scrollHeight}px`;
                                            }
                                        }}
                                        multiline={true}
                                        placeholderTextColor={CurrentTheme.primaryColor}
                                        style={{
                                            width: '100%',
                                            borderWidth: 1,
                                            borderColor: "gray",
                                            borderRadius: 6,
                                            padding: 12,
                                            textAlignVertical: 'top',
                                            fontSize: 14,
                                            color: "black",
                                            backgroundColor: "white",
                                            opacity: Platform.OS === "android" ? 0.6 : 1
                                        }}
                                        onChange={((currentComp) => {
                                            return (e) => {
                                                const text = e.target.value;
                                                const key = `text${currentComp.id}`;
                                                this.setState({ [key]: text }, () => {
                                                    const ref = this[`textareaRef_${currentComp.id}`];
                                                    if (ref) {
                                                        ref.style.height = 'auto';
                                                        ref.style.height = `${ref.scrollHeight}px`;
                                                    }
                                                });

                                                // Clear previous timer
                                                if (this.debounceTimers?.[key]) {
                                                    clearTimeout(this.debounceTimers[key]);
                                                }

                                                // Set new timer
                                                if (!this.debounceTimers) this.debounceTimers = {};
                                                this.debounceTimers[key] = setTimeout(() => {

                                                    var course = _.cloneDeep(this.state.course);

                                                    var components = course.pages[this.state.pageNumber].components.map(c => {
                                                        if (c.id == currentComp.id) {
                                                            return {
                                                                ...c,
                                                                values: {
                                                                    ...c.values,
                                                                    text: this.state[`text${currentComp.id}`]
                                                                }
                                                            }
                                                        } else {
                                                            return c
                                                        }
                                                    })

                                                    course.pages[this.state.pageNumber].components = components;

                                                    this.modifyCourse(course, undefined, true).then((response) => {
                                                        this.state.indexModifyComponent = null;
                                                        this.state.course = course;
                                                        this.state.visibleComponentModalADD = false;
                                                        this.state.textFormNew = "";
                                                        this.state.justifiedText = false;
                                                        this.updateAfterModifying(response);
                                                    }, (error) => {
                                                        this.showModifyingError(error)
                                                    });

                                                }, 2000);
                                            }
                                        })(currentComp)}
                                        value={this.state[`text${currentComp.id}`]}
                                        defaultValue={text}
                                    />
                                    :
                                    <TextInput
                                        multiline={true}
                                        placeholderTextColor={CurrentTheme.primaryColor}
                                        style={{
                                            width: '100%',
                                            borderWidth: 1,
                                            borderColor: "gray",
                                            borderRadius: 6,
                                            padding: 12,
                                            textAlignVertical: 'top',
                                            fontSize: 14,
                                            color: "black",
                                            backgroundColor: "white",
                                            opacity: Platform.OS === "android" ? 0.6 : 1
                                        }}
                                        onChangeText={((currentComp) => {
                                            return (text) => {
                                                const key = `text${currentComp.id}`;
                                                this.setState({ [key]: text });

                                                // Clear previous timer
                                                if (this.debounceTimers?.[key]) {
                                                    clearTimeout(this.debounceTimers[key]);
                                                }

                                                // Set new timer
                                                if (!this.debounceTimers) this.debounceTimers = {};
                                                this.debounceTimers[key] = setTimeout(() => {

                                                    var course = _.cloneDeep(this.state.course);

                                                    var components = course.pages[this.state.pageNumber].components.map(c => {
                                                        if (c.id == currentComp.id) {
                                                            return {
                                                                ...c,
                                                                values: {
                                                                    ...c.values,
                                                                    text: this.state[`text${currentComp.id}`]
                                                                }
                                                            }
                                                        } else {
                                                            return c
                                                        }
                                                    })

                                                    course.pages[this.state.pageNumber].components = components;

                                                    this.modifyCourse(course, undefined, true).then((response) => {
                                                        this.state.indexModifyComponent = null;
                                                        this.state.course = course;
                                                        this.state.visibleComponentModalADD = false;
                                                        this.state.textFormNew = "";
                                                        this.state.justifiedText = false;
                                                        this.updateAfterModifying(response);
                                                    }, (error) => {
                                                        this.showModifyingError(error)
                                                    });

                                                }, 2000);
                                            }
                                        })(currentComp)}
                                        value={this.state[`text${currentComp.id}`]}
                                        defaultValue={text}
                                    />
                            }
                            {
                                this.isEditionMode()
                                    ?
                                    this.renderEditOptions(index, false, true, false, false, true)
                                    :
                                    this.renderEditOptions(index, false, true, true, true, true)
                            }

                            {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime, true, (this.isEditionMode() ? false : true))}
                        </View>
                    )
                } else if (type == 12) { // new edit image
                    customMarginTop = (previousComp && previousComp.type == 0) ? 20 : 10;

                    if (!values.url) {
                        // Mostrar botón si no hay imagen válida
                        indents.push(
                            <TouchableOpacity
                                style={[this.style.draggableView, { backgroundColor: CurrentTheme.componentCardColor, marginTop: customMarginTop }]}
                                onPress={((currentComp) => {
                                    return () => {
                                        if (this.isHandlingPress) return;
                                        this.isHandlingPress = true;
                                        var course = _.cloneDeep(this.state.course);
                                        const components = course.pages[this.state.pageNumber].components;
                                        const findedIndex = components.findIndex(c => c.id === currentComp.id);
                                        this.newComponentPressed(12, findedIndex);
                                        this.getPhotos(null, (image) => {
                                            setTimeout(() => {
                                                this.addComponent();
                                            }, 500) //Not the best solution, but at the moment works
                                        });
                                        setTimeout(() => {
                                            this.isHandlingPress = false;
                                        }, 500)
                                    };
                                })(currentComp)}
                            >
                                {this.renderInputFileImage()}
                                <IconMaterialCommunityIcons name="camera" color={CurrentTheme.componentTextCardColor} size={25} />
                                <Text style={{ color: CurrentTheme.componentTextCardColor }}>
                                    {this.props.actions.translate.get('Academy_drag_photo')}
                                </Text>
                                {this.renderEditOptions(index)}
                                {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                            </TouchableOpacity>
                        );
                    } else {
                        if (!this.state.images) {
                            this.state.images = {};
                        }
                        if (!this.state.images[this.state.pageNumber]) {
                            this.state.images[this.state.pageNumber] = {};
                        }
                        var propindex = "index-" + index;
                        if (!this.state.images[this.state.pageNumber][propindex]) {
                            this.state.images[this.state.pageNumber][propindex] = {
                                width: null,
                                height: null,
                                calculatedSize: false,
                                calculatingSize: false,
                                url: values.url,
                                realImageWidth: (values.realImageWidth ? values.realImageWidth : null),
                                realImageHeight: (values.realImageHeight ? values.realImageHeight : null)
                            };
                        }
                        //console.log("VALUES IMAGE", values);

                        if (!this.state.images[this.state.pageNumber][propindex].height && this.state.images[this.state.pageNumber][propindex].realImageWidth && this.state.images[this.state.pageNumber][propindex].realImageHeight) {
                            var customSize = this.getCustomSize(this.state.images[this.state.pageNumber][propindex].realImageWidth, this.state.images[this.state.pageNumber][propindex].realImageHeight);
                            this.state.images[this.state.pageNumber][propindex].width = customSize.width;
                            this.state.images[this.state.pageNumber][propindex].height = customSize.height;
                        }
                        if (!this.state.images[this.state.pageNumber][propindex].height && !this.state.images[this.state.pageNumber][propindex].calculatedSize && !this.state.images[this.state.pageNumber][propindex].calculatingSize) {
                            this.getSizeImage(this.state.pageNumber, propindex);
                        }

                        var height = this.state.images[this.state.pageNumber][propindex].height ? this.state.images[this.state.pageNumber][propindex].height : null;
                        height = (height && height > 0) ? parseInt(height) : null;
                        //console.log("The height of IMAGE is: ", height);
                        var width = this.state.images[this.state.pageNumber][propindex].width ? this.state.images[this.state.pageNumber][propindex].width : null;
                        width = (width && width > 0) ? parseInt(width) : 0;

                        if (height) {
                            var imageSize = values.imageSize ? values.imageSize : 'medium';
                            var perc = this.getImageHeightPercentage(imageSize, dimensions);
                            height = parseInt(height * perc / 100);
                            var location = values.coords ? values.coords : null;

                            indents.push(
                                <View style={[this.style.editFormatComponent]}>
                                    {this.renderImage(values.url, height)}
                                    {
                                        this.isEditionMode()
                                            ?
                                            this.renderEditOptions(index)
                                            :
                                            this.renderEditOptions(index, false, false, true, true, true)
                                    }
                                    {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime, true)}
                                </View>
                            );
                        }
                    }
                }
                else if (type == 13) { // new edit video
                    customMarginTop = (previousComp && previousComp.type == 0) ? 20 : 10;

                    var pendingFile = null;
                    if (values.idAsyncFileUpload) {
                        pendingFile = this.props.backgroundUploadPendingFiles.find(x => x.id == values.idAsyncFileUpload);
                    }

                    if (pendingFile && (!values.url || values.url.includes("null"))) {
                        if (!pendingFile.canceled) {

                            if (!pendingFile.percentage) pendingFile.percentage = 0;
                            indents.push(
                                <View id={pendingFile.id + "_view1"} style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 25, marginBottom: 25 }]}>
                                    <View id={pendingFile.id + "_view2"} style={[this.style.videoWrapper, { paddingLeft: 5, paddingRight: 5, borderRadius: 4, backgroundColor: "rgba(220,220,220,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }, height ? { height: 200 } : {}]}>
                                        <Text id={pendingFile.id + "text1"} style={{ color: "white", fontSize: 12, position: "absolute", left: 5, top: 5 }}>{pendingFile.fileName}</Text>
                                        <TouchableOpacity id={pendingFile.id + "_touchable1"} style={{ width: 80, height: 80, borderRadius: 45, display: "flex", alignItems: "center", justifyContent: "center" }} onPress={() => this.props.actions.backgroundUploadActions.cancelUpload(pendingFile.id)}>
                                            <AnimatedCircularProgress
                                                id={pendingFile.id + "_circle1"}
                                                size={80}
                                                width={6}
                                                rotation={0}
                                                fill={parseFloat(pendingFile.percentage).toFixed(2)}
                                                tintColor={FliwerColors.primary.green}
                                                backgroundColor="#3d5875">
                                                {
                                                    (fill) => {
                                                        return (
                                                            <Text>
                                                                {fill.toFixed(1) + "%"}
                                                            </Text>
                                                        );
                                                    }
                                                }
                                            </AnimatedCircularProgress>
                                        </TouchableOpacity>
                                    </View>
                                    {this.renderEditOptions(index)}
                                </View>
                            );
                        } else {
                            indents.push(
                                <View style={[this.isEditionMode() ? this.style.editFormatComponent : { marginTop: 25, marginBottom: 25 }]}>
                                    <View style={[this.style.videoWrapper, { paddingLeft: 5, paddingRight: 5, borderRadius: 4, backgroundColor: "rgba(220,220,220,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }, height ? { height: 200 } : {}]}>
                                        <Text style={{ color: "white", fontSize: 12, position: "absolute", left: 5, top: 5 }}>{pendingFile.fileName}</Text>
                                        <TouchableOpacity style={{ backgroundColor: "rgba(0,0,0,0.6)", width: 50, height: 50, borderRadius: 45, display: "flex", alignItems: "center", justifyContent: "center" }} onPress={() => {
                                            this.props.actions.backgroundUploadActions.retryPendingToUploadFile(pendingFile.id);
                                        }}>
                                            <Text style={{ color: "white", fontSize: 12, position: "absolute" }}>{"Retry"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {this.renderEditOptions(index)}
                                </View>
                            );
                        }
                    } else if (!values.url) {
                        indents.push(
                            <TouchableOpacity
                                style={[this.style.componentWrapper, this.isEditionMode() ? this.style.editFormatComponent : { marginTop: customMarginTop }, { backgroundColor: CurrentTheme.componentCardColor }, this.style.draggableView]}
                                onPress={((currentComp) => {
                                    return () => {
                                        if (this.isHandlingPress) return;
                                        this.isHandlingPress = true;
                                        var course = _.cloneDeep(this.state.course);
                                        const components = course.pages[this.state.pageNumber].components;
                                        const findedIndex = components.findIndex(c => c.id === currentComp.id);
                                        console.log('findedIndex', findedIndex)
                                        this.newComponentPressed(13, findedIndex);
                                        this.PickVideo();
                                        setTimeout(() => {
                                            this.isHandlingPress = false;
                                        }, 500);
                                    };
                                })(currentComp)}
                            >
                                {this.renderInputFile("video")}
                                <IconMaterialCommunityIcons name="video" color={CurrentTheme.componentTextCardColor} size={25} />
                                <Text style={{ color: CurrentTheme.componentTextCardColor }}>
                                    {this.props.actions.translate.get('Academy_drag_video')}
                                </Text>
                                {this.renderEditOptions(index)}
                                {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                            </TouchableOpacity>
                        );
                    } else {
                        let urlVideo;
                        if (/^file_/.test(values.url)) {
                            const aryIndex = values.url.split("_");
                            const indexIDFile = aryIndex[1];
                            urlVideo = this.state.files[indexIDFile]?.uri;
                        } else {
                            urlVideo = values.url;
                        }

                        let poster = values.image || emptyPicture;
                        let realImageWidth = values.realImageWidth || 622;
                        let realImageHeight = values.realImageHeight || 415;

                        if (!this.state.images) this.state.images = {};
                        if (!this.state.images[this.state.pageNumber]) this.state.images[this.state.pageNumber] = {};

                        const propindex = "index-" + index;
                        if (!this.state.images[this.state.pageNumber][propindex]) {
                            this.state.images[this.state.pageNumber][propindex] = {
                                width: null,
                                height: null,
                                calculatedSize: false,
                                calculatingSize: false,
                                url: poster,
                                realImageWidth,
                                realImageHeight
                            };
                        }

                        if (
                            !this.state.images[this.state.pageNumber][propindex].height &&
                            realImageWidth &&
                            realImageHeight
                        ) {
                            const customSize = this.getCustomSize(realImageWidth, realImageHeight);
                            this.state.images[this.state.pageNumber][propindex].width = customSize.width;
                            this.state.images[this.state.pageNumber][propindex].height = customSize.height;
                        }

                        if (
                            !this.state.images[this.state.pageNumber][propindex].height &&
                            !this.state.images[this.state.pageNumber][propindex].calculatedSize &&
                            !this.state.images[this.state.pageNumber][propindex].calculatingSize
                        ) {
                            this.getSizeImage(this.state.pageNumber, propindex);
                        }

                        let height = this.state.images[this.state.pageNumber][propindex].height || null;
                        height = (height && height > 0) ? parseInt(height) : null;

                        if (height) {
                            const imageSize = values.imageSize || 'medium';
                            const perc = this.getImageHeightPercentage(imageSize, dimensions);
                            height = parseInt(height * perc / 100);

                            const bgc = this.isEditionMode() ? "#f5f3f0" : "white";

                            indents.push(
                                <View style={[this.style.editFormatComponent, { marginTop: customMarginTop }]}>
                                    <View style={[this.style.videoWrapper, { paddingLeft: 5, paddingRight: 5, borderRadius: 4 }, height ? { height: height } : {}]}>
                                        <Video
                                            source={urlVideo}
                                            backgroundColor={bgc}
                                            resizeMode={"contain"}
                                            customStyle={{}}
                                            mute={values.mute}
                                            autoplay={false}
                                            orientation={values.portrait ? "portrait" : ""}
                                            completeURL={true}
                                            poster={values.image ? { uri: poster } : poster}
                                        />
                                    </View>
                                    {
                                        this.isEditionMode()
                                            ?
                                            this.renderEditOptions(index)
                                            :
                                            this.renderEditOptions(index, false, false, true, true, true)
                                    }
                                    {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime, true)}
                                </View>
                            );
                        } else {
                            console.log("No video height for type 13");
                        }
                    }
                }
                else if (type == 14) { //new edit file
                    customMarginTop = (previousComp && previousComp.type == 0) ? 20 : 10;

                    if (!values.url) {
                        indents.push(
                            <TouchableOpacity
                                style={[this.style.componentWrapper, this.isEditionMode() ? this.style.editFormatComponent : { marginTop: customMarginTop }, { backgroundColor: CurrentTheme.componentCardColor }, this.style.draggableView]}
                                disabled={this.isEditionMode()}
                                onPress={((currentComp) => {
                                    return () => {
                                        if (this.isHandlingPress) return;
                                        this.isHandlingPress = true;
                                        const course = _.cloneDeep(this.state.course);
                                        const components = course.pages[this.state.pageNumber].components;
                                        const findedIndex = components.findIndex(c => c.id === currentComp.id);
                                        this.newComponentPressed(14, findedIndex);
                                        this.getFiles((image) => {
                                            setTimeout(() => {
                                                this.addComponent();
                                            }, 500) //Not the best solution, but at the moment works
                                        });
                                        setTimeout(() => {
                                            this.isHandlingPress = false;
                                        }, 500)
                                    };
                                })(currentComp)}                        >
                                <IconMaterialCommunityIcons name="file-outline" color={CurrentTheme.componentTextCardColor} size={25} />
                                <Text
                                    style={{
                                        color: CurrentTheme.componentTextCardColor
                                    }}
                                >
                                    {this.props.actions.translate.get('Academy_drag_document')}
                                </Text>
                                {this.renderInputFile()}
                                {this.renderEditOptions(index, false, true, false, false)}
                                {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                            </TouchableOpacity>
                        )
                    } else {

                        if (values.name)//selected file
                        {
                            var nameFile = values.name
                            var nameFileNoExtension = nameFile.split('.').slice(0, -1).join('.');
                            var url = values.url
                            var extension = nameFile.slice((nameFile.lastIndexOf(".") - 1 >>> 0) + 2)

                        } else {//just url
                            var ary = values.url.split("/");
                            var nameFile = ary[ary.length - 1];
                            var nameFileNoExtension = nameFile.split('.').slice(0, -1).join('.');
                            var url = values.url
                            var extension = nameFile.slice((nameFile.lastIndexOf(".") - 1 >>> 0) + 2)
                        }

                        indents.push(
                            <View style={this.style.editFormatComponent}>

                                <View style={[this.style.textFormatContainer, { marginTop: 20, marginBottom: 20 }]}>
                                    <View style={[{ paddingLeft: 15 }]}>
                                        <TouchableOpacity style={[{ flexDirection: "row", alignSelf: "center", justifyContent: "center", backgroundColor: "#f5f5f5", alignItems: "center", placeSelf: "center", paddingTop: 20, paddingBottom: 20, width: "100%" }]} onPress={this.downloadFileHandle(url, nameFile)} >
                                            <IconFontAwesome name="file-pdf-o" size={15} style={{ color: FliwerColors.primary.black }} />
                                            <Text style={[{ fontFamily: FliwerColors.fonts.regular, paddingLeft: 10, fontSize: 14 }]} ellipsizeMode='tail' numberOfLines={1} >{nameFileNoExtension}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {
                                    this.isEditionMode()
                                        ?
                                        this.renderEditOptions(index)
                                        :
                                        this.renderEditOptions(index, false, false, true, true, true)
                                }
                                {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime, true)}
                            </View>
                        )
                    }
                }
                else if (type == 16) { //new edit task
                    customMarginTop = (previousComp && previousComp.type == 0) ? 20 : 10;

                    if (currentComp.values.idTask) {
                        indents.push(

                            <View
                                key={`task${currentComp.id}`}
                                style={[this.isEditionMode() ? this.style.editFormatComponent : index == 0 ? { marginTop: 10 } : { marginTop: customMarginTop }]}
                            >
                                <CourseTaskComponent
                                    currentComp={currentComp}
                                    idTask={currentComp.values.idTask}
                                    onAccept={((currentComp) => {
                                        return (value) => {
                                            var component = {};
                                            component.type = 16;
                                            component.values = {
                                                idTask: value
                                            };

                                            var course = _.cloneDeep(this.state.course);

                                            const compts = course.pages[this.state.pageNumber].components;
                                            const findedIndex = compts.findIndex(c => c.id === currentComp.id);

                                            component.id = this.state.course.pages[this.state.pageNumber].components[findedIndex].id;
                                            var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                                            components[findedIndex] = component;
                                            course.pages[this.state.pageNumber].components = components;

                                            this.modifyCourse(course).then((response) => {
                                                this.state.indexModifyComponent = null;
                                                this.state.course = course;
                                                this.state.visibleComponentModalADD = false;
                                                this.state.delimiterHeightFormNew = 100;
                                                this.state.delimiterAddLineFormNew = false;
                                                this.updateAfterModifying(response);
                                            }, (error) => {
                                                this.showModifyingError(error);
                                            });
                                        }
                                    })(currentComp)}
                                />
                                {
                                    this.isEditionMode()
                                        ?
                                        this.renderEditOptions(index, false, true, false, false, true)
                                        :
                                        this.renderEditOptions(index, false, true, true, true, true)
                                }
                                {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime, true, (this.isEditionMode() ? false : true))}
                            </View>
                        )
                    } else {
                        indents.push(
                            <View
                                key={`taskSelector${currentComp.id}`}
                            >
                                <TaskSelectorComponent
                                    onAccept={((currentComp) => {
                                        return (value) => {
                                            var component = {};
                                            component.type = 16;
                                            component.values = {
                                                idTask: value
                                            };

                                            var course = _.cloneDeep(this.state.course);

                                            const compts = course.pages[this.state.pageNumber].components;
                                            const findedIndex = compts.findIndex(c => c.id === currentComp.id);

                                            component.id = this.state.course.pages[this.state.pageNumber].components[findedIndex].id;
                                            var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                                            components[findedIndex] = component;
                                            course.pages[this.state.pageNumber].components = components;

                                            this.modifyCourse(course).then((response) => {
                                                this.state.indexModifyComponent = null;
                                                this.state.course = course;
                                                this.state.visibleComponentModalADD = false;
                                                this.state.delimiterHeightFormNew = 100;
                                                this.state.delimiterAddLineFormNew = false;
                                                this.updateAfterModifying(response);
                                            }, (error) => {
                                                this.showModifyingError(error);
                                            });
                                        }
                                    })(currentComp)}
                                    customStyles={{ marginTop: customMarginTop }}
                                />
                                {this.renderEditOptions(index)}
                                {this.renderLastUpdate(currentComp?.lastUpdateName, currentComp?.lastUpdateTime)}
                            </View>
                        );
                    }
                }
            } // end loop

            // Add move page to
            if (this.isEditionMode()) {
                if (!this.props.asTemplate && !this.props.asWorkOrder) {
                    indents.push(
                        <View style={[this.style.editFormatComponent]}>
                            <View style={[this.style.titleFormatContainer, this.isEditionMode() ? {} : { marginTop: 20, marginBottom: 10 }]}>
                                <Text style={[this.style.textFormat, { lineHeight: 25, textAlign: "center" }]}>
                                    {"Página " + (this.state.pageNumber + 1).toString() + " de " + this.state.totalPages.toString()}
                                </Text>
                            </View>
                            {this.renderEditOptions("move-page", false, false, true, true)}
                        </View>
                    );
                } else if (this.props.asTemplate || this.props.asWorkOrder) {
                    indents.push(<CourseAddComponentInline
                        index={index}
                        onPress={(index) => {
                            this.setState({ visibleModalAddComponentList: true, addIndex: -1 });
                        }}
                    />)
                }
            }

        } else {
            indents.push(
                <View style={[this.style.noComponentsContainer]}>
                    <Text style={[this.style.textFormat, { color: CurrentTheme.complementaryText }]}>{this.props.actions.translate.get('Academy_no_components')}</Text>
                    {
                        (this.props.asTemplate || this.props.asWorkOrder) && this.isEditionMode()
                        &&
                        <CourseAddComponentInline
                            index={index}
                            onPress={(index) => {
                                this.setState({ visibleModalAddComponentList: true, addIndex: -1 });
                            }}
                        />
                    }
                </View>)
        }

        return (
            <View style={{ flexGrow: 1, width: "100%" }}>
                {indents}
            </View>
        );

    }

    renderImage(imgSrc, height) {
        return (
            <TouchableOpacity style={imgSrc ? { cursor: "zoom-in" } : {}}
                onPress={() => {
                    if (imgSrc) {
                        global.frontLayer.display(true);
                        this.setState({ zoomImageVisible: true, zoomImage: imgSrc });
                    }
                }}>
                <FliwerImage
                    draggable={false}
                    containerStyle={[this.style.imageContainer, { height: height }]}
                    style={[this.style.imageCourse]}
                    resizeMode={"contain"}
                    source={{ uri: imgSrc }}
                    setLoading={() => { }}
                />
            </TouchableOpacity>
        );
    }

    renderLocation(location, imgSrc) {

        if (!location && !imgSrc)
            return null;

        return (
            <View style={{ width: "100%", /*borderColor: "red", borderWidth: 1,*/ alignSelf: "center", alignItems: "center", marginTop: 5, marginBottom: 5 }}>
                <View style={{ flexDirection: "row", flex: 1/*, borderColor: "violet", borderWidth: 1*/ }}>
                    {location ? <TouchableOpacity
                        style={{ flexDirection: "row", cursor: "pointer" }}
                        onPress={() => {
                            var locationPieces = location.split(",");
                            FliwerCommonUtils.openLocationMaps(locationPieces[0], locationPieces[1]);
                        }}>
                        <IconMaterialCommunityIcons name="directions" color={"blue"} size={25} style={{}} ></IconMaterialCommunityIcons>
                        <Text style={{ marginLeft: 3, paddingTop: 3 }}>{location}</Text>
                    </TouchableOpacity> : null}

                    {false && imgSrc ? <TouchableOpacity style={this.style.zoomImage}
                        onPress={() => {
                            global.frontLayer.display(true);
                            this.setState({ zoomImageVisible: true, zoomImage: imgSrc });
                        }}>
                        <IconFeather name="zoom-in" size={25} style={{ color: "black" }} />
                    </TouchableOpacity> : null}
                </View>
            </View>
        );

    }

    renderZoomImageModal() {

        if (this.state.zoomImageVisible) {

            global.frontLayer.renderLayer(() => {
                return (
                    <ZoomImage
                        visible={this.state.zoomImageVisible}
                        source={this.state.zoomImage}
                        onClose={() => {
                            global.frontLayer.display(false);
                            this.setState({ zoomImageVisible: false });
                        }}
                    />
                );
            });
        } else
            return [];
    }

    renderExam(course, index) {
        var indents = [];

        if (course.pages[this.state.pageNumber].components[index].values.text)
            indents.push(
                <Text style={[this.style.textFormat, { marginBottom: 19, fontWeight: "bold" }]}>{course.pages[this.state.pageNumber].components[index].values.text}</Text>
            )

        for (var i in course.pages[this.state.pageNumber].components[index].values.questions) {
            indents.push(
                <Text style={this.style.textFormat}>{course.pages[this.state.pageNumber].components[index].values.questions[i].question}</Text>
            )

            indents.push(
                <View style={{}}>
                    {this.renderAnswers(course, index, i)}
                </View>
            )
        }

        if (this.state.examScore != null)
            indents.push(
                <View style={{ flexDirection: "row", marginBottom: 20, width: "100%", height: 60 }}>
                    <View style={{ justifyContent: "center" }}>
                        <Text style={[this.style.textFormat, { fontSize: 20, fontWeight: "bold" }]}>{this.props.actions.translate.get('Academy_exam_score_is') + " "}</Text>
                    </View>
                    <View style={{ marginLeft: 10, borderRadius: 45, backgroundColor: (this.state.examScore >= 5 ? "#C4FFBF" : "#FFC9BE"), borderColor: "gray", borderWidth: 2, padding: 10, width: 60, height: 60, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000000" }}>{this.roundToTwo(this.state.examScore)}</Text>
                    </View>
                    {false ? <Text style={{}}>{" " + this.props.actions.translate.get('Academy_out_of_10')}</Text> : null}
                </View>
            )


        if (this.state.examScore == null || (this.props.roles.fliwer && this.state.examScore != null))
            indents.push(
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                    {this.state.examScore == null ? <FliwerGreenButton
                        text={this.props.actions.translate.get('Academy_correct_exam_button')}
                        containerStyle={[this.style.correctButton, {}]}
                        onPress={async () => {
                            await this.correctExam(course.pages[this.state.pageNumber].components[index].values.id)
                        }} /> : null}
                    {this.props.roles.fliwer && this.state.examScore != null ? <FliwerGreenButton
                        text={"Reset"}
                        style={{ backgroundColor: FliwerColors.complementary.blue }}
                        containerStyle={[this.style.correctButton, { marginLeft: 10 }]}
                        onPress={async () => {
                            await this.resetExam(course.pages[this.state.pageNumber].components[index].values.id)
                        }} /> : null}
                </View>
            );

        return indents;
    }

    renderAnswers(course, ComponentIndex, questionIndex) {
        var that = this;
        var radioAnswers = [];

        var question = course.pages[this.state.pageNumber].components[ComponentIndex].values.questions[questionIndex];
        var idQuestion = course.pages[this.state.pageNumber].components[ComponentIndex].values.questions[questionIndex].id;

        for (var i in question.answers) {
            var radioAnswer = {};
            var answer = question.answers[i];
            radioAnswer.label = answer.text;
            radioAnswer.idAnswer = answer.id;
            radioAnswer.correct = answer.correct;
            radioAnswer.answered = answer.answered;
            radioAnswer.answeredCorrect = answer.answeredCorrect;
            radioAnswers.push(radioAnswer);
        }

        var indentsAnswers = [];
        for (let i = 0; i < radioAnswers.length; i++) {

            var checked = (this.state.examSelectedOptions[idQuestion] && this.state.examSelectedOptions[idQuestion][radioAnswers[i].idAnswer]) ||
                (this.state.examScore != null && radioAnswers[i].answered);

            (function (i) {
                indentsAnswers.push(
                    <CheckBox
                        title={radioAnswers[i].label}
                        textStyle={{}}
                        disabled={that.state.examScore != null}
                        containerStyle={[{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }, that.state.examScore != null ? { backgroundColor: radioAnswers[i].answeredCorrect ? "#C4FFBF" : "#FFC9BE" } : {}]}
                        checked={checked}
                        onPress={() => {
                            var idAnswer = radioAnswers[i].idAnswer;
                            var obj = radioAnswers[i];

                            var examSelectedOptions = [].concat(that.state.examSelectedOptions);
                            var isSelected = (examSelectedOptions[idQuestion] && examSelectedOptions[idQuestion][idAnswer]) ? true : false;
                            if (!examSelectedOptions[idQuestion])
                                examSelectedOptions[idQuestion] = [];
                            examSelectedOptions[idQuestion][idAnswer] = !isSelected;

                            that.setState({ examSelectedOptions: examSelectedOptions });
                        }}
                    />
                );
            })(i);
        }

        var indents = [];
        indents.push(
            <View style={{ marginTop: 7, marginBottom: 19 }}>
                {indentsAnswers}
            </View>
        );

        return indents;
    }

    renderEditOptions(index, disableEdit, hiddenEdit, hiddenDelete, hiddenArrows, forzeEdit = false) {
        var indents = []
        if (this.isEditionMode() || forzeEdit) {
            indents.push(
                <View style={[{ flexDirection: "row", alignSelf: "flex-end", marginBottom: 7 }]}>
                    {
                        forzeEdit
                            ?
                            <View ><Icon name="trash-2" size={20} style={{ opacity: 0 }} /></View>
                            :
                            null
                    }
                    {!hiddenEdit ? <TouchableOpacity disabled={disableEdit} key={"list_" + index + "edit"} style={[{}]}
                        onPress={() => {
                            this.editComponent(index)
                        }}>
                        <Icon name="edit" size={20} style={{}} />
                    </TouchableOpacity> : null}
                    {!hiddenDelete ? <TouchableOpacity key={"list_" + index + "trash"} style={[{}]}
                        onPress={this.modalDeleteVisiblePressed(true, index)}>
                        <Icon name="trash-2" size={20} style={{}} />
                    </TouchableOpacity> : null}
                    {!hiddenArrows ? <TouchableOpacity key={"list_" + index + "up"} style={[{}]}
                        onPress={() => {
                            this.upComponent(index)
                        }}>
                        <Icon name="arrow-up" size={20} style={{}} />
                    </TouchableOpacity> : null}
                    {!hiddenArrows ? <TouchableOpacity key={"list_" + index + "down"} style={[{}]}
                        onPress={() => {
                            this.downComponent(index)
                        }}>
                        <Icon name="arrow-down" size={20} style={{}} />
                    </TouchableOpacity> : null}
                    {this.renderInputFile()}
                </View>
            );
        }
        return indents;
    }

    renderAddButton() {
        if (this.isEditionMode())
            return (
                <TouchableOpacity style={this.style.addButtonTouch} activeOpacity={1} onPress={() => {
                    this.setState({ visibleModalAddComponentList: true, addIndex: -1 });
                }}>
                    <Image style={this.style.addCourseButtonImage} resizeMode={"contain"} source={addButton} />
                </TouchableOpacity>
            )
    }

    renderDeleteButton() {
        if (this.isEditionMode())
            return (
                <TouchableOpacity style={[this.style.deleteButtonTouch]} activeOpacity={1} onMouseEnter={this.hoverIn('deleteButtonTouch')} onMouseLeave={this.hoverOut('deleteButtonTouch')} onPress={() => {
                    this.setState({ modalDeleteVisible: true, modalDeleteType: "page" });
                }}>
                    <IconFontAwesome name="trash-o" size={30} style={{ color: "white" }} />
                </TouchableOpacity>
            )
    }

    renderSwitchModeButton() {
        if (this.hasPermissionToEdit())
            return (
                <TouchableOpacity style={[this.style.switchModeButton, !this.isEditionMode() ? this.style.switchModeButtonDownPosition : {}]} activeOpacity={1} onMouseEnter={this.hoverIn('switchModeButton')} onMouseLeave={this.hoverOut('switchModeButton')} onPress={() => {
                    this.setState({ isSwitchModeButtonInEditionModePosition: !this.state.isSwitchModeButtonInEditionModePosition });
                }}>
                    <IconFontAwesome name="exchange" size={30} style={{ color: "white" }} />
                </TouchableOpacity>
            )
    }

    renderReloadButton() {
        return (
            <TouchableOpacity style={[this.style.reloadButtonTouch]} activeOpacity={1} onMouseEnter={this.hoverIn('reloadButtonTouch')} onMouseLeave={this.hoverOut('reloadButtonTouch')} onPress={() => {
                this.setState({ loading: true });
                if (this.state.urlUUID) {
                    this.props.actions.academyActions.getCourseByUUID(this.state.urlUUID).then((response) => {
                        this.state.idCourse = response.id;
                        this.load();
                        this.setState({ loading: false });
                    }, (error) => {
                        this.setState({ loading: false })
                    })
                } else {

                    this.props.actions.academyActions.getCourse(this.state.idCourse).then((response) => {
                        if (response) {
                            var category = response.find(x => x.id == 15);
                            if (category && category.courses && category.courses.length > 0) {
                                this.props.actions.academyActions.updateNewCourse(category.courses[0], this.state.files).then((newCourse) => {
                                    this.setState({ loading: false, course: this.getCourse() });
                                });
                            } else {
                                console.log("Error getting course", err);
                                this.setState({ loading: false });
                            }
                        } else {
                            console.log("Error getting course", err);
                            this.setState({ loading: false });
                        }

                    }, (err) => {
                        console.log("Error getting course", err);
                        this.setState({ loading: false });
                    });
                }
            }}>
                <IconFontAwesome name="refresh" size={30} style={{ color: "white" }} />
            </TouchableOpacity>
        )
    }

    renderModalGoToPage() {
        return (
            <Modal animationType="fade" inStyle={[this.style.modalIn]} visible={this.state.showPaggingModal}
                onClose={() => {
                    this.setState({ showPaggingModal: false })
                }}
                onShow={() => {
                    if (this._firstFormField)
                        this._firstFormField.focus();
                }}
            >
                <View style={[this.style.modalView]}>
                    <View style={{ width: "100%" }}>
                        <View style={{}}>
                            <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_goto_page') + ":"}</Text>
                        </View>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, marginTop: 5 }}
                            onChangeText={(text) => {
                                var value = text.replace(/[^0-9]/gi, '');
                                this.setState({ goToPageNumber: value });
                            }}
                            value={this.state.goToPageNumber}
                            maxLength={3}
                            keyboardType='numeric'
                            multiline={false}
                            textAlign={'right'}
                            onSubmitEditing={() => {
                                this.onAcceptPagging();
                            }}
                            ref={(c) => {
                                this._firstFormField = c;
                            }}
                        />
                    </View>
                    <FliwerGreenButton
                        text={this.props.actions.translate.get('accept')}
                        style={{ paddingLeft: 8, paddingRight: 8, width: null, marginTop: 10 }}
                        containerStyle={{ height: 33, marginBottom: 1, alignSelf: "center", marginTop: 10, width: null, minWidth: 135 }}
                        onPress={() => {
                            this.onAcceptPagging();
                        }} />
                </View>
            </Modal>
        )
    }

    renderErrorModal() {
        return (
            <Modal animationType="fade" inStyle={[this.style.modalIn]} visible={this.state.showErrorModal} onClose={() => {
                this.setState({ showErrorModal: false, errorText: "", errorText2: "" });
            }}>
                <View style={[this.style.modalView]}>
                    <View style={{ width: "100%", alignItems: "center" }}>
                        <View style={{}}>
                            <Text style={[this.style.textFormat, { fontSize: 16, fontWeigth: "bold" }]}>{"ERROR"}</Text>
                        </View>
                        <Text style={{ marginTop: 20 }}>{this.state.errorText}</Text>
                        {this.state.errorText2 ? <Text style={{ marginTop: 20 }}>{"Error: " + this.state.errorText2}</Text> : null}
                    </View>
                </View>
            </Modal>
        );
    }

    renderModalMovePageTo() {
        return (
            <Modal animationType="fade" inStyle={[this.style.modalIn]} visible={this.state.showMovePageToModal}
                onClose={() => {
                    this.setState({ showMovePageToModal: false })
                }}
                onShow={() => {
                    if (this._firstFormField)
                        this._firstFormField.focus();
                }}
            >
                <View style={[this.style.modalView]}>
                    <View style={{ width: "100%" }}>
                        <View style={{ marginTop: 0 }}>
                            <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_move_to_page') + ":"}</Text>
                        </View>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, marginTop: 5 }}
                            onChangeText={(text) => {
                                var value = text.replace(/[^0-9]/gi, '');
                                this.setState({ movePageTo: value });
                            }}
                            value={this.state.movePageTo}
                            maxLength={3}
                            keyboardType='numeric'
                            multiline={false}
                            textAlign={'right'}
                            onSubmitEditing={() => {
                                this.onAcceptMovePageTo();
                            }}
                            ref={(c) => {
                                this._firstFormField = c;
                            }}
                        />
                    </View>
                    <FliwerGreenButton
                        text={this.props.actions.translate.get('accept')}
                        style={{ paddingLeft: 8, paddingRight: 8, width: null, marginTop: 10 }}
                        containerStyle={{ height: 33, marginBottom: 1, alignSelf: "center", marginTop: 10, width: null, minWidth: 135 }}
                        onPress={() => {
                            this.onAcceptMovePageTo();
                        }} />
                </View>
            </Modal>
        )
    }

    renderModalNewComponent() {
        return (
            <Modal animationType="fade" loadingModal={this.state.loading}
                nested={true}
                inStyle={[this.style.modalInNew, {}]}
                visible={this.state.visibleComponentModalADD}
                onClose={() => {
                    if (this.state.recVideo) {
                        this.setState({ recVideo: false });
                    }
                }}
                onShow={() => {
                    if (this._firstFormField)
                        this._firstFormField.focus();
                }}
            >
                <View style={[this.style.modalView, { width: "100%"/*, borderWidth: 1, borderColor: "red"*/ }, Platform.OS == "web" ? { height: "100%" } : {}]}>
                    <ScrollView scrollEventThrottle={1000} style={[{ width: "100%" }, Platform.OS == "web" ? { height: "100%" } : {}]} contentContainerStyle={{ justifyContent: "space-between" }}>
                        {this.renderForm()}
                        {!this.state.recVideo ? <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 10 }}>
                            {
                                this.state.selectedNewComponent != 13
                                    ?
                                    <FliwerGreenButton
                                        text={this.props.actions.translate.get('general_save')}
                                        style={{}}
                                        containerStyle={{ height: 33, width: 120, marginRight: 5 }}
                                        onPress={() => {
                                            this.deleteRecordedVideo();
                                            this.addComponent();
                                        }} />
                                    :
                                    null
                            }
                            <FliwerGreenButton
                                text={this.props.actions.translate.get('general_cancel')}
                                style={{ backgroundColor: "silver", color: "black" }}
                                containerStyle={{ height: 33, width: 120, marginLeft: 5 }}
                                onPress={() => {
                                    if (this.state.selectedNewComponent != 13) {
                                        this.deleteRecordedVideo();
                                    }
                                    this.setState({
                                        visibleComponentModalADD: false, titleFormNew: "", titleGreenFormNew: "", subtitleFormNew: "", textFormNew: "", justifiedText: false, videoMute: true, imageSize: 'medium', uriImage: null, uriVideo: null, uriFile: null, filePicker: null, file: null, fileVideo: null, recVideo: false, videoIsRecorded: false, videoUploaded: false, subtitle1FormNew: "", subtitle2FormNew: "",
                                        delimiterHeightFormNew: 0, delimiterAddLineFormNew: false, indexModifyComponent: null, lastIndexModifyComponent: null, exam: {}, imageHeight: null, imageWidth: null,
                                        coords: null, addIndex: -1
                                    });
                                }} />
                        </View> : null}
                    </ScrollView>
                </View>
            </Modal>
        );

    }

    renderForm() {
        var indents = [];

        if (this.state.selectedNewComponent == 1) {
            indents.push(
                <View style={{ marginBottom: 15, width: "100%" }}>
                    <View style={{}}>
                        <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_new_title')}</Text>
                    </View>
                    <View style={{ width: "100%" }}>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }}
                            onChangeText={(text) => {
                                this.setState({ titleFormNew: text })
                            }}
                            value={this.state.titleFormNew}
                            ref={(c) => {
                                this._firstFormField = c;
                            }}
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_green_text')}</Text>
                    </View>
                    <View style={{ width: "100%" }}>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }}
                            onChangeText={(text) => {
                                this.setState({ titleGreenFormNew: text })
                            }}
                            value={this.state.titleGreenFormNew}
                        />
                    </View>
                </View>
            );
        }

        if (this.state.selectedNewComponent == 2)
            indents.push(
                <View style={{ marginBottom: 15, width: "100%" }}>
                    <View style={{}}>
                        <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_new_text')}</Text>
                    </View>
                    <View style={{ width: "100%" }}>
                        <TextInput
                            style={[{ height: 188, width: "100%", borderColor: 'gray', borderWidth: 1, padding: 5, textAlignVertical: "top" }]}
                            onChangeText={(text) => {
                                this.setState({ textFormNew: text })
                            }}
                            value={this.state.textFormNew}
                            multiline
                            ref={(c) => {
                                this._firstFormField = c;
                            }}
                        />
                    </View>
                    <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                        <CheckBox
                            title={this.props.actions.translate.get('Academy_justified')}
                            textStyle={{}}
                            containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                            checked={this.state.justifiedText ? true : false}
                            onPress={this.changeJustifiedTextValue()}
                        />
                    </View>
                </View>
            );
        if (this.state.selectedNewComponent == 111)
            indents.push(
                <View style={{ marginBottom: 15, width: "100%" }}>
                    <View style={{}}>
                        <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_new_text')}</Text>
                    </View>
                    <View style={{ width: "100%" }}>
                        <TextInput
                            style={[{ width: "100%", borderColor: 'gray', borderWidth: 1, padding: 5, textAlignVertical: "top" }]}
                            onChangeText={(text) => {
                                this.setState({ placeHolder: text })
                            }}
                            value={this.state.placeHolder}
                            multiline
                            ref={(c) => {
                                this._firstFormField = c;
                            }}
                        />
                    </View>
                    {/* <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
                        <CheckBox
                            title={this.props.actions.translate.get('Academy_justified')}
                            textStyle={{}}
                            containerStyle={{ backgroundColor: "transparent", borderWidth: 0, marginLeft: -8, marginTop: -4 }}
                            checked={this.state.justifiedText ? true : false}
                            onPress={this.changeJustifiedTextValue()}
                        />
                    </View> */}
                </View>
            );

        if (this.state.selectedNewComponent == 3 || this.state.selectedNewComponent == 12)
            indents.push(this.renderImageForm());

        if ((this.state.selectedNewComponent == 4 || this.state.selectedNewComponent == 13) && Platform.OS === "web")
            indents.push(this.renderVideoForm());
        else if (this.state.selectedNewComponent == 4 || this.state.selectedNewComponent == 13)
            indents.push(this.renderVideoFormBackground());

        if (this.state.selectedNewComponent == 5) {
            var optionalExamText = ""
            if (this.state.course.pages.length > 0 && this.state.course.pages[this.state.pageNumber] && this.state.course.pages[this.state.pageNumber].components.length > 0 && this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent])
                optionalExamText = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].values.text

            indents.push(
                <View style={{}}>
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ width: (Platform.OS == "web" ? "100%" : "95%"), marginBottom: 15 }}>
                            <TextInput
                                placeholder={this.props.actions.translate.get('Academy_optional_text_exam')}
                                defaultValue={optionalExamText}
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }}
                                onChangeText={(text) => {
                                    this.state.exam.text = text
                                }}
                            />
                        </View>
                    </View>
                    {this.renderQuestionsADD()}
                </View>
            )
        }

        if (this.state.selectedNewComponent == 6 || this.state.selectedNewComponent == 14) {
            indents.push(
                <View style={{ marginBottom: 15 }}>
                    <View style={{}}>
                        <Text style={[this.style.textFormat]}>{this.props.actions.translate.get('Academy_enter_url_file')}</Text>
                    </View>
                    <View style={{ width: "100%" }}>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }}
                            onChangeText={(text) => {
                                this.setState({ uriFile: text })
                            }}
                            value={this.state.uriFile}
                        />
                    </View>
                    <Text style={[this.style.textFormat, { marginTop: 10 }]}>{this.props.actions.translate.get('Academy_or_select_file')}</Text>
                    <TouchableOpacity activeOpacity={1} style={{ width: "100%" }} onPress={() => {
                        this.getFiles()
                    }}>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }}
                            value={0/*Platform.OS == 'ios'*/ ? "" : (this.state.filePicker ? this.state.filePicker.name : this.state.file ? this.state.file.name : this.props.actions.translate.get('Academy_select_file'))}
                            disabled={true}
                            editable={false}
                        />
                    </TouchableOpacity>
                    <View style={{ width: "100%", marginTop: 10, alignItems: "center" }}>
                        <TouchableOpacity
                            style={[this.style.noneImageContainer, { backgroundColor: FliwerColors.complementary.blue, width: 200 }]}
                            activeOpacity={1}
                            onPress={() => {
                                this.getFiles()
                            }}>
                            <Text style={{ fontFamily: FliwerColors.fonts.regular, color: "white" }}>{this.props.actions.translate.get('Academy_select_file_button')}</Text>
                            {this.renderInputFile()}
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        if (this.state.selectedNewComponent == 10) {
            indents.push(
                <View style={{ marginBottom: 15, flexGrow: 1, justifyContent: "space-evenly" }}>
                    <View style={{}}>
                        <Text style={{}}>{this.props.actions.translate.get('Academy_enter_subtitle')}</Text>
                    </View>
                    <View style={{ width: "100%", marginTop: 10 }}>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }}
                            onChangeText={(text) => {
                                this.setState({ subtitle1FormNew: text })
                            }}
                            value={this.state.subtitle1FormNew}
                            placeholder={"Texto"}
                            ref={(c) => {
                                this._firstFormField = c;
                            }}
                        />
                    </View>
                </View>
            );
        }

        return indents;
    }

    renderImageForm() {
        var location = this.state.coords !== null ? this.state.coords : '';

        return (
            <View style={[{ marginTop: 10, marginBottom: 20, alignItems: "center" }]}>
                <View style={{ marginTop: 0 }}>
                    <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_select_image')}</Text>
                </View>
                {this.getPreviewImage()}

                {
                    this.state.selectedNewComponent != 12
                        ?
                        <>

                            <View style={{ marginTop: 5 }}>
                                <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_select_image_size')}</Text>
                            </View>
                            <View style={{ marginTop: 0, width: "100%" }}>
                                {this.renderImageSizeSelector()}
                            </View>

                            <View style={{ marginTop: 15 }}>
                                <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_location')}</Text>
                            </View>
                            <View style={{ width: "100%", /*paddingLeft: 30, paddingRight: 30, */maxWidth: 250 }}>
                                <TouchableOpacity
                                    style={{ height: 40, width: "100%", borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, cursor: "pointer" }}
                                    onPress={() => {
                                        global.frontLayer.display(true);
                                        this.setState({ visibleModalDeviceLocation: true });
                                    }}>
                                    <Text style={{ paddingTop: 4, color: "gray", textAlign: "center" }}>{location ? location : this.props.actions.translate.get('Academy_add_coordinates')}</Text>
                                    {location ? <TouchableOpacity
                                        style={{ position: "absolute", right: 5, top: 5, cursor: "pointer" }}
                                        onPress={() => {
                                            var locationPieces = location.split(",");
                                            FliwerCommonUtils.openLocationMaps(locationPieces[0], locationPieces[1]);
                                        }}>
                                        <IconMaterialCommunityIcons name="directions" color={"blue"} size={25} style={{}} ></IconMaterialCommunityIcons>
                                    </TouchableOpacity> : null}
                                </TouchableOpacity>

                            </View>
                            {this.renderModalDeviceLocation()}
                        </>
                        :
                        null
                }
            </View>
        );
    }

    renderModalDeviceLocation() {

        if (!this.state.visibleModalDeviceLocation)
            return null;

        var indents = [];
        indents.push(
            <FliwerLocationModal
                onClose={() => {
                    global.frontLayer.display(false);
                    this.setState({ visibleModalDeviceLocation: false });
                }}
                onAccept={(coords, accuracy) => {
                    global.frontLayer.display(false);
                    this.setState({ visibleModalDeviceLocation: false, coords: coords });
                }}
                loadingModal={this.state.loading}
                setLoading={this.setLoading()}
                coords={this.state.coords}
            />
        );

        if (Platform.OS == 'ios')
            return indents;
        else
            global.frontLayer.renderLayer(() => {
                return indents;
            });

    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({ loading: loading });
        };
    }

    showVideoRecord() {
        this.deleteRecordedVideo();
        this.setState({ recVideo: true });
    }

    deleteRecordedVideo() {
        if (this.state.videoIsRecorded && this.state.filePicker && this.state.filePicker.uri) {
            try {
                RNFS.unlink(this.state.filePicker.uri);
            } catch (err) {
                console.log('err', err)
            }
        }
    }

    renderVideoForm() {

        var indents = [];

        if (this.state.selectedNewComponent == 13) {
            indents.push(
                <View style={{ width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 10, marginBottom: 10, flexDirection: "row" }}>
                    {this.renderInputFile("video")}
                    <FliwerGreenButton
                        text={this.props.actions.translate.get('Academy_upload_video')}
                        style={{}}
                        containerStyle={{ height: 33, width: "100%", marginRight: 5 }}
                        onPress={() => {
                            this.PickVideo();
                        }} />
                </View>
            )
            return indents
        }

        var isServerFile = (this.state.uriVideo && this.state.uriVideo.indexOf("/getFile/") != -1);
        var isEdition = (this.state.indexModifyComponent != null);
        var dimensions = Dimensions.get('window');

        /*
         *
         * Video recorder
         *
         */
        if (!this.state.videoUploaded) {
            /*
              if (this.state.recVideo) {


                  return [];



                  return (
                      <View style={{backgroundColor:"purple",height:"80%"}}>
                          <VideoRecorder
                              containerStyle={{}}
                              onTakeVideo={(data) => {
                                  console.log("onTakeVideo data", data);


                                  var uri_pieces = data.uri.split("/");
                                  var name = uri_pieces[uri_pieces.length-1];
                                  var filePicker = {
                                      name: name,
                                      uri: data.uri,
                                      type: "video/mp4"
                                  };
                                  console.log("onTakeVideo filePicker", filePicker);
                                  this.setState({recVideo: false, videoIsRecorded: true, filePicker: filePicker});

                              }}
                          />
                      </View>
                  );

              }*/

            /*
            indents.push(
                <View style={{width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 10, marginBottom: 10, flexDirection: "row"}}>
                    <TouchableOpacity style={{width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "red", borderRadius: 4, borderColor: "silver"}} activeOpacity={1} onPress={() => {
                            this.showVideoRecord();
                        }}>
                        <Icon name={"video"} size={30} style={{color: "white"}}></Icon>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex: 1, height: 40, justifyContent: "center", marginLeft: 10}} activeOpacity={1} onPress={() => {
                            this.showVideoRecord();
                        }}>
                        <Text style={[this.style.textFormat]}>{"Grabar nuevo video"}</Text>
                    </TouchableOpacity>
                </View>
            );
            */

            indents.push(
                <View style={{ width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 10, marginBottom: 10, flexDirection: "row" }}>
                    {this.renderInputFile("video")}
                    <FliwerGreenButton
                        text={this.props.actions.translate.get('Academy_upload_video')}
                        style={{}}
                        containerStyle={{ height: 33, width: "100%", marginRight: 5 }}
                        onPress={() => {
                            this.PickVideo();
                        }} />
                </View>
            )


        }

        /*
         *
         * Select URL or video file
         *
         */
        if (!this.state.videoUploaded) {
            //isVideoSelected = ((this.state.filePicker && this.state.filePicker.name) || (this.state.fileVideo && this.state.fileVideo.name));
            /*
            var value = this.state.filePicker ? this.state.filePicker.name : (this.state.fileVideo ? this.state.fileVideo.name : this.state.uriVideo);
            var downloadedFilename = '';
            if (isServerFile && !this.state.filePicker) {
                let uriPieces = this.state.uriVideo.split("/");
                downloadedFilename = uriPieces[uriPieces.length-1];
                if (this.state.uriVideo.indexOf(".") == -1)
                    downloadedFilename+=".mp4";
            }

            indents.push(
                <View style={{width: "100%", marginTop: 4, paddingLeft: 40, paddingRight: dimensions.width > 420? 20 : 40}}>
                    <View style={{}}>
                        <Text style={[this.style.textFormat]}>{
                            !this.state.videoIsRecorded?
                                this.props.actions.translate.get('Academy_select_video_or_enter_address')
                                :
                                "Acabas de grabar un video! Ahora tienes que subirlo."
                            }</Text>
                    </View>
                    {!this.state.videoIsRecorded?<View style={{width: "100%", marginTop: 4, flexDirection: "row"}}>
                        <TextInput
                            style={[{flex: 1, height: 40, borderColor: 'gray', borderWidth: 1, padding: 5, borderRadius: 4, borderTopRightRadius: 0, borderBottomRightRadius: 0}, this.state.filePicker? {backgroundColor: "#DFDFDF"} : {}]}
                            onChangeText={(text) => {
                                this.setState({uriVideo: text})
                            }}
                            value={value}
                            disabled={this.state.filePicker}
                            />
                            <TouchableOpacity style={{width: 40, alignItems: "center"}} activeOpacity={1} onPress={() => {
                                    this.getFiles()
                                }}>
                                <View style={{height: 40, width: "100%", backgroundColor: FliwerColors.complementary.blue, padding: 5, borderRadius: 4, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, justifyContent: "center"}}>
                                    <IconEvil name={"plus"} size={30} style={{color: "white"}}></IconEvil>
                                </View>
                                {this.renderInputFile("video")}
                            </TouchableOpacity>
                            {downloadedFilename?<TouchableOpacity style={{width: 40, alignItems: "center"}} activeOpacity={1}
                                onPress={this.downloadFileHandle(this.state.uriVideo, downloadedFilename)}>
                                <View style={{height: 40, width: "100%", backgroundColor: "transparent", padding: 5, justifyContent: "center"}}>
                                    <IconEvil name={"arrow-down"} size={30} style={{color: "blue"}}></IconEvil>
                                </View>
                            </TouchableOpacity>:null}
                    </View>:null}
                    {this.state.filePicker?<TouchableOpacity style={{width: "100%", marginTop: 20}} activeOpacity={1}
                        onPress={() => {
                            this.uploadVideo();
                        }}>
                        <View style={{height: 32, width: null, backgroundColor: FliwerColors.complementary.blue, borderRadius: 4, paddingTop: 7, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, justifyContent: "center", alignSelf: "center"}}>
                            <Text style={{color: "white", fontFamily: FliwerColors.fonts.light, fontSize: 14, textAlign: "center"}}>{
                                this.props.actions.translate.get('Academy_upload_video')
                            }</Text>
                        </View>
                    </TouchableOpacity>:null}
                </View>
            );

            indents.push(
                <View style={{width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 25, marginBottom: 10}}>
                    <View style={{width: "60%", borderColor: "silver", borderBottomWidth: 1, height: 1}}></View>
                </View>
            );

            */
        }

        /*
         *
         * Select Poster
         *
         */
        var responsive = {
            0: { items: 3 },
            568: { items: 4 },
            1024: { items: 4 }
        };
        var carouselWidth = dimensions.width > 568 ? 250 : 200;
        var screenshots = this.getVideoScreenShots();
        indents.push(
            <View style={{}}>
                <View style={{ marginTop: 10 }}>
                    <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_select_image_for_cover_page')}</Text>
                </View>
                {screenshots.length > 0 ?
                    <View style={{ width: "100%", marginTop: 0, marginBottom: 20, height: 60, alignItems: "center", paddingLeft: 20, paddingRight: 20 }}>
                        <FliwerCarousel
                            autoplay={false}
                            responsive={responsive}
                            dotsStyle={{ bottom: -20 }}
                            duration={100}
                            textPrevStyle={{ color: "black", marginRight: 80 }}
                            textNextStyle={{ color: "black", marginLeft: 80 }}
                            itemWidth={60}
                            itemHeight={60}
                            renderItem={(slide) => {
                                return (
                                    <TouchableOpacity
                                        activeOpacity={1}
                                        style={{ width: 60, height: 60 }}
                                        onPress={() => {
                                            this.setState({ uriImage: slide.item });
                                        }}>
                                        <View style={{ width: "100%" }}>
                                            <Image style={{ width: 60, height: 60, borderRadius: 4 }} source={{ uri: slide.item }} draggable={false} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                            style={{ width: carouselWidth }}
                            data={screenshots}
                        />
                    </View> : null}
                {this.getPreviewImage()}
            </View>
        );

        /*
         *
         * Select size
         *
         */
        indents.push(
            <View style={{}}>
                {isEdition ? null : <View style={{}}>
                    <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_select_cover_page_size')}</Text>
                </View>}
                <View style={[{ marginTop: 5 }, isEdition ? { marginTop: 0 } : {}]}>
                    {this.renderImageSizeSelector()}
                </View>
            </View>
        );

        /*
         *
         * Delimiter
         *
         */
        indents.push(
            <View style={{ width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 25, marginBottom: 20 }}>
                <View style={{ width: "60%", borderColor: "silver", borderBottomWidth: 1, height: 1 }}></View>
            </View>
        );

        /*
         *
         * Check Mute or not
         *
         */
        indents.push(
            <View style={{}}>
                <View style={{}}>
                    <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_indicate_if_you_want_to_mute_video')}</Text>
                </View>
                <View style={{ width: "100%", flexDirection: "row", alignItems: 'center' }}>
                    <CheckBox
                        title={"Mute"}
                        textStyle={{ textAlign: "center" }}
                        containerStyle={{ backgroundColor: "transparent", width: "100%", borderWidth: 0, alignItems: 'center', marginTop: -10 }}
                        checked={this.state.videoMute ? true : false}
                        onPress={this.changeMuteVideoValue()}
                    />
                </View>
            </View>
        );

        return (
            <View style={{ marginBottom: 15 }}>
                {indents}
            </View>
        );

    }

    renderVideoFormBackground() {
        var indents = [];
        var isServerFile = (this.state.uriVideo && this.state.uriVideo.indexOf("/getFile/") != -1);
        var isEdition = (this.state.indexModifyComponent != null);
        var dimensions = Dimensions.get('window');

        /*
         *
         * Select size
         *
         */
        indents.push(
            <View style={{}}>
                {isEdition ? null : <View style={{}}>
                    <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_select_cover_page_size')}</Text>
                </View>}
                <View style={[{ marginTop: 5 }, isEdition ? { marginTop: 0 } : {}]}>
                    {this.renderImageSizeSelector()}
                </View>
            </View>
        );

        /*
         *
         * Delimiter
         *
         */
        indents.push(
            <View style={{ width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 25, marginBottom: 20 }}>
                <View style={{ width: "60%", borderColor: "silver", borderBottomWidth: 1, height: 1 }}></View>
            </View>
        );

        /*
         *
         * Check Mute or not
         *
         */
        indents.push(
            <View style={{}}>
                <View style={{}}>
                    <Text style={this.style.videoSubTitle}>{this.props.actions.translate.get('Academy_indicate_if_you_want_to_mute_video')}</Text>
                </View>
                <View style={{ width: "100%", flexDirection: "row", alignItems: 'center' }}>
                    <CheckBox
                        title={"Mute"}
                        textStyle={{ textAlign: "center" }}
                        containerStyle={{ backgroundColor: "transparent", width: "100%", borderWidth: 0, alignItems: 'center', marginTop: -10 }}
                        checked={this.state.videoMute ? true : false}
                        onPress={this.changeMuteVideoValue()}
                    />
                </View>
            </View>
        );


        /*
         *
         * Video recorder
         *
         */
        if (!this.state.videoUploaded) {

            indents.push(
                <View style={{ width: "100%", paddingLeft: 40, paddingRight: 40, alignItems: "center", marginTop: 10, marginBottom: 10, flexDirection: "row" }}>
                    {this.renderInputFile("video")}
                    <FliwerGreenButton
                        text={this.props.actions.translate.get('Academy_upload_video')}
                        style={{}}
                        containerStyle={{ height: 33, width: "100%", marginRight: 5 }}
                        onPress={() => {
                            this.PickVideo();
                        }} />
                </View>
            )

        }

        return (
            <View style={{ marginBottom: 15 }}>
                {indents}
            </View>
        );

    }

    PickVideo(component) {

        const options = {
            fileInput: this.fileInputFiles,
            mediaType: 'video',
            videoQuality: 'high',
            durationLimit: 60,
            nested: true,
            //documentPicker:Platform.OS==='web'?false:true
        };

        MediaPicker.openPicker(options).then((response) => {

            if (!response || response.didCancel || !response.assets || !response.assets[0]) {
                console.log('User cancelled image picker');
            } else {

                var uri_pieces = response.assets[0].uri.split("/");
                var filePicker = {
                    name: response.assets[0].fileName + ".mp4",
                    uri: response.assets[0].uri,
                    fileSize: response.assets[0].fileSize,
                    type: "video/mp4"
                };
                console.log("onTakeVideo filePicker", filePicker);
                this.setState({ recVideo: false, videoIsRecorded: true, filePicker: filePicker });

                this.state.filePicker = filePicker;
                if (Platform.OS === 'web') this.uploadVideo(component);
                else this.uploadVideoBackground(component);
            }
        }, () => { console.log("Error gathering image"); });


    }

    getPreviewImage() {
        var imgSz;
        if (this.state.imageSize == "small")
            imgSz = 40;
        else if (this.state.imageSize == "medium")
            imgSz = 60;
        else
            imgSz = 95;

        return (
            <View style={{ width: "100%", height: 120, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 25 }}>
                <View style={{
                    width: 200, height: 120, alignItems: "center", backgroundColor: "#f0f0f0",
                    borderColor: "gray", borderWidth: 1, justifyContent: "center",
                    borderRadius: 0
                }}>
                    <View style={{
                        width: 120, height: 118, alignItems: "center", backgroundColor: "white",
                        borderColor: "gray",
                        borderRightWidth: 1, borderLeftWidth: 1,
                        justifyContent: "center"

                    }}>
                        <View style={{ width: 100, height: 100, alignItems: "center", backgroundColor: "#f5f3f0", borderColor: "black", borderWidth: 1, justifyContent: "center" }}>
                            <TouchableOpacity
                                style={{ width: "100%", height: "100%", justifyContent: "center" }}
                                activeOpacity={1} onPress={() => {
                                    this.getPhotos();
                                }}>
                                <Image source={this.state.uriImage ? { uri: this.state.uriImage } : emptyPicture} resizeMode={"cover"} style={[this.style.buttonImageIn, { width: imgSz, height: imgSz, justifyContent: "center", alignSelf: "center", borderRadius: 4 }]} />
                                {this.renderInputFileImage()}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );

    }

    getVideoScreenShots() {

        if (!this.state.course ||
            !this.state.course.pages[this.state.pageNumber] ||
            !this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent])
            return [];
        var component = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent];
        if (!component.values.screenshots)
            return [];
        var screenshots = component.values.screenshots;
        return screenshots;
    }

    renderImageSizeSelector() {
        return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={this.style.imageSizeSelectorWrapper}>
                    <TouchableOpacity style={[this.style.imageSizeSelector, this.state.imageSize === 'small' ? { backgroundColor: FliwerColors.primary.green } : {}]} activeOpacity={1} onPress={() => {
                        this.setState({ imageSize: 'small' });
                    }}><Image source={roundedSquare} resizeMode={"contain"} style={{ width: "50%", height: "50%" }} /></TouchableOpacity>
                    <Text style={this.style.imageSizeSelectorText}>{this.props.actions.translate.get('general_small_female')}</Text>
                </View>
                <View style={this.style.imageSizeSelectorWrapper}>
                    <TouchableOpacity style={[this.style.imageSizeSelector, this.state.imageSize === 'medium' ? { backgroundColor: FliwerColors.primary.green } : {}]} activeOpacity={1} onPress={() => {
                        this.setState({ imageSize: 'medium' });
                    }}><Image source={roundedSquare} resizeMode={"contain"} style={{ width: "75%", height: "75%" }} /></TouchableOpacity>
                    <Text style={this.style.imageSizeSelectorText}>{this.props.actions.translate.get('general_medium_female')}</Text>
                </View>
                <View style={this.style.imageSizeSelectorWrapper}>
                    <TouchableOpacity style={[this.style.imageSizeSelector, this.state.imageSize === 'large' ? { backgroundColor: FliwerColors.primary.green } : {}]} activeOpacity={1} onPress={() => {
                        this.setState({ imageSize: 'large' });
                    }}><Image source={roundedSquare} resizeMode={"contain"} style={{ width: "90%", height: "90%" }} /></TouchableOpacity>
                    <Text style={this.style.imageSizeSelectorText}>{this.props.actions.translate.get('general_large_female')}</Text>
                </View>
            </View>
        );
    }

    renderQuestionsADD() {
        var indents = []
        for (var e in this.state.exam.questions) {
            ((e) => {
                indents.push(
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ width: (Platform.OS == "web" ? "100%" : "100%"), marginBottom: 15, flexDirection: "row", alignItems: "center", paddingLeft: (Platform.OS == "web" ? 30 : 10) }}>
                            <TextInput
                                ref={(x) => {
                                    if (this.state.exam.questions && e == this.state.exam.questions.length - 1 && this.state.addedQuestion) {
                                        this.state.addedQuestion = null;
                                        x.focus();
                                    }
                                }}
                                placeholder={this.props.actions.translate.get('Academy_enter_question')}
                                key={"questions_" + this.state.exam.questions[e].id}
                                defaultValue={this.state.exam.questions[e].question}
                                style={[Platform.OS == 'web' ? { width: "100%" } : { width: "90%" }, { height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }]}
                                onChangeText={(text) => {
                                    this.state.exam.questions[e].question = text
                                }}
                            />
                            <TouchableOpacity style={[{}]} onPress={this.deleteQuestion(e)}><IconEntypo name="cross" size={20} style={{}} /></TouchableOpacity>
                        </View>
                        {this.renderAnswersADD(e)}
                    </View>
                )
            })(e)
        }

        indents.push(
            <View style={{ marginBottom: 15 }}>
                <View style={{ width: (Platform.OS == "web" ? "100%" : "100%"), marginBottom: 15, flexDirection: "row", alignItems: "center", paddingLeft: (Platform.OS == "web" ? 30 : 10) }}>
                    <TextInput
                        placeholder={this.props.actions.translate.get('Academy_enter_question')}
                        onFocus={this.addQuestion()}
                        onChangeText={this.addQuestion()}
                        key={"questions_x"}
                        style={[Platform.OS == 'web' ? { width: "100%" } : { width: "90%" }, { height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }]}
                    />
                </View>
            </View>
        )

        return indents;
    }

    renderAnswersADD(indexQuestions) {
        var indents = []

        for (var i in this.state.exam.questions[indexQuestions].answers) {
            ((i, indexQuestions) => {
                indents.push(
                    <View style={{ width: (Platform.OS == "web" ? "100%" : "100%"), marginBottom: 15, paddingLeft: (Platform.OS == "web" ? 85 : 20) }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <TextInput
                                ref={(x) => {
                                    if (this.state.exam.questions && this.state.exam.questions[indexQuestions] && this.state.exam.questions[indexQuestions].answers && i == this.state.exam.questions[indexQuestions].answers.length - 1 && this.state.addedAnswer == indexQuestions && x) {
                                        this.state.addedAnswer = null;
                                        x.focus();
                                    }
                                }}
                                key={"answ_" + i + "_" + indexQuestions + "_" + this.state.exam.questions[indexQuestions].answers[i].id}
                                style={[Platform.OS == 'web' ? { width: "100%" } : { width: "70%" }, { height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }]}
                                defaultValue={this.state.exam.questions[indexQuestions].answers[i].text}
                                onChangeText={(text) => {
                                    this.state.exam.questions[indexQuestions].answers[i].text = text
                                }}
                                placeholder={this.props.actions.translate.get('Academy_enter_the_answer')}
                            />
                            <CheckBox
                                title={""}
                                textStyle={{}}
                                containerStyle={[{ backgroundColor: "transparent", borderWidth: 0/*, marginLeft: -8, marginTop: -4*/ }, this.style.checkboxStyle, Platform.OS == "web" ? { marginLeft: 10, marginRight: 10 } : { marginLeft: 2, marginRight: 2 }]}
                                checked={this.state.exam.questions[indexQuestions].answers[i].correct ? true : false}
                                onPress={this.changeCheckboxCorrectValue(indexQuestions, i)}
                            />
                            <TouchableOpacity style={[{}]} onPress={this.deleteAnswer(indexQuestions, i)}><IconEntypo name="cross" size={20} style={{}} /></TouchableOpacity>
                        </View>
                    </View>
                )
            })(i, indexQuestions)
        }
        indents.push(
            <View style={{ width: (Platform.OS == "web" ? "100%" : "100%"), marginBottom: 15, paddingLeft: (Platform.OS == "web" ? 85 : 20) }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TextInput
                        key={"answ_" + i + "_" + indexQuestions + "_x"}
                        style={[Platform.OS == 'web' ? { width: "100%" } : { width: "70%" }, { height: 40, borderColor: 'gray', borderWidth: 1, padding: 5 }]}
                        placeholder={this.props.actions.translate.get('Academy_enter_the_answer')}
                        onFocus={this.addAnswer(indexQuestions)}
                        onChangeText={this.addAnswer(indexQuestions)}
                    />
                </View>
            </View>
        )
        return indents;
    }

    renderInputFile(typeAccepted) {
        if (Platform.OS === 'web')
            return (<input ref={fileInputFiles => this.fileInputFiles = fileInputFiles} style={this.style.fileInput} type="file" accept={typeAccepted ? typeAccepted + "/*" : ""} />);
    }

    renderInputFileImage() {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => this.fileInput = fileInput} style={this.style.fileInput} type="file" accept={"image/*"} />);
    }

    renderModalAddComponentList() {
        return Platform.OS === 'web'
            ? this.renderModalAddComponentListWeb()      // vista original intacta
            : this.renderModalAddComponentListMobile();  // nueva vista con tabs
    }

    renderModalAddComponentListWeb() {
        return (
            <Modal animationType="fade" inStyle={[this.style.modalIn]} visible={this.state.visibleModalAddComponentList} onClose={() => {
                this.setState({ visibleModalAddComponentList: false })
            }}>
                <View
                    style={{
                        paddingTop: 22,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingBottom: 24,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center"
                        }}
                    >
                        <View style={{ flex: 1, paddingHorizontal: 5 }}>
                            <View style={{ alignItems: "center" }}><Text style={[this.style.textFormat, { fontSize: 18 }]} numberOfLines={1} ellipsizeMode='tail'>{this.props.actions.translate.get('Components_add_readonly')}</Text></View>
                            <View style={[this.style.underLine, { marginBottom: 15 }]}></View>
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: 5 }}>
                            <View style={{ alignItems: "center" }}><Text style={[this.style.textFormat, { fontSize: 18 }]} numberOfLines={1} ellipsizeMode='tail'>{this.props.actions.translate.get('Components_add_editable')}</Text></View>
                            <View style={[this.style.underLine, { marginBottom: 15 }]}></View>
                        </View>
                    </View>
                    <View
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            width: "100%",
                        }}
                    >
                        <View style={{ flex: 1, marginHorizontal: 5, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            {this.renderReadOnlyComponentsADDList()}
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 5, alignItems: "center", justifyContent: "flex-start", flexDirection: "column" }}>
                            {this.renderEditableComponentsADDList()}
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    renderModalAddComponentListMobile() {
        const { selectedTab } = this.state;
        const isEditable = selectedTab === 'editable';

        return (
            <Modal
                animationType="fade"
                inStyle={[this.style.modalIn, { width: "95%" }]}
                visible={this.state.visibleModalAddComponentList}
                onClose={() => this.setState({ visibleModalAddComponentList: false })}
            >
                <View style={{ padding: 10, alignItems: 'center' }}>
                    <Text style={[this.style.textFormat, { fontSize: 20 }]}>
                        {this.props.actions.translate.get('Add_component')}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        borderBottomWidth: 1,
                        borderColor: '#ccc',
                    }}
                >
                    {['editable', 'readonly'].map((tabKey) => (
                        <TouchableOpacity
                            key={tabKey}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 5,
                                borderBottomWidth: selectedTab === tabKey ? 2 : 0,
                                borderColor:
                                    selectedTab === tabKey ? this.style.textFormat.color : 'transparent',
                            }}
                            onPress={() => this.setState({ selectedTab: tabKey })}
                        >
                            <Text style={[this.style.textFormat, { fontSize: 16 }]}>
                                {this.props.actions.translate.get(tabKey === 'editable' ? 'Editable' : 'No_editable')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ padding: 16, alignItems: "center" }}>
                    {isEditable
                        ? this.renderEditableComponentsADDList()
                        : this.renderReadOnlyComponentsADDList()}
                </View>
            </Modal>
        );
    }

    renderReadOnlyComponentsADDList() {
        var indents = [];

        var title = this.props.actions.translate.get('Academy_title');
        var text = this.props.actions.translate.get('Academy_text');
        var image = this.props.actions.translate.get('Academy_image');
        var video = this.props.actions.translate.get('Academy_video');
        var exam = this.props.actions.translate.get('Academy_exam');
        var file = this.props.actions.translate.get('Academy_file');
        var subtitle = this.props.actions.translate.get('Academy_subtitle');
        //var location = this.props.actions.translate.get('Academy_location');
        //var sectionTitle = this.props.actions.translate.get('Academy_sectionTitle');
        //var index = this.props.actions.translate.get('Academy_index');
        //var reference = this.props.actions.translate.get('Academy_reference');


        var componentsList =
            [
                { id: 1, value: title },
                { id: 10, value: subtitle },
                { id: 2, value: text },
                { id: 3, value: image },
                //{id: 12, value: "Combo Imagen y Texto"},
                { id: 4, value: video },
                { id: 5, value: exam },
                { id: 6, value: file },
                { id: 11, value: "Línea" },
                //                    {id: 12, value: "HTML"}
                //{id: ?, value: location},
                //{id: ?, value: sectionTitle},
                //{id: ?, value: index},
                //{id: ?), value: reference},
            ];

        for (var index in componentsList) {
            ((index) => {
                if (!this.state.auditing || (this.state.auditing && componentsList[index].id != 5))
                    indents.push(
                        <TouchableOpacity style={{}} onPress={() => {
                            this.newComponentPressed(componentsList[index].id)
                        }}>
                            <Text style={[this.style.textFormat, { fontSize: 20 }, Platform.OS === 'ios' ? { padding: 10 } : { padding: 5 }]}>{componentsList[index].value}</Text>
                        </TouchableOpacity>
                    )
            })(index)

        }

        return indents;
    }

    renderEditableComponentsADDList() {
        var indents = [];
        var text = this.props.actions.translate.get('Academy_text');
        var image = this.props.actions.translate.get('Academy_image');
        var video = this.props.actions.translate.get('Academy_video');
        var file = this.props.actions.translate.get('Academy_file');
        var task = this.props.actions.translate.get('Academy_task');

        var componentsList =
            [
                { id: 111, value: text },
                { id: 12, value: image },
                { id: 13, value: video },
                { id: 14, value: file },
                { id: 16, value: task },
            ];

        for (var index in componentsList) {
            ((index) => {
                const componentId = componentsList[index].id;
                if (!this.state.auditing || (this.state.auditing && componentId != 5))
                    indents.push(
                        <TouchableOpacity style={{}} onPress={() => {
                            if ([12, 13, 14, 15, 16].includes(componentId)) {
                                this.addComponent(componentsList[index].id)
                                this.setState({
                                    visibleModalAddComponentList: false
                                })
                            } else {
                                this.newComponentPressed(componentId)
                            }
                        }}>
                            <Text style={[this.style.textFormat, { fontSize: 20 }, Platform.OS === 'ios' ? { padding: 10 } : { padding: 5 }]}>{componentsList[index].value}</Text>
                        </TouchableOpacity>
                    )
            })(index)

        }

        return indents;
    }


    /*
     *
     *
     *
     *
     *
     *
     *
     *
     *
     * END RENDER
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */

    roundToTwo(num) {
        return +(Math.round(num + "e+2") + "e-2");
    }

    copy(aObject) {
        if (!aObject) {
            return aObject;
        }

        let v;
        let bObject = Array.isArray(aObject) ? [] : {};
        for (const k in aObject) {
            v = aObject[k];
            bObject[k] = (typeof v === "object") ? this.copy(v) : v;
        }
        return bObject;
    }

    createdByMe() {

        var createdByMe = false;

        if (this.state.course && this.state.course.creator) {
            if (this.state.course.creator.idUser) {
                if (this.props.sessionData && this.state.course.creator.idUser == this.props.sessionData.idUser) {
                    createdByMe = true;
                }

            }
        } else {//si no tinc el creator significa que l'estic creant
            createdByMe = true;
        }

        return createdByMe;
    }

    isValidCoordinates(coordinates) {
        if (!coordinates.match(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/)) {
            return false;
        }
        const [latitude, longitude] = coordinates.split(",");
        if (coordinates.split(",").length > 2)
            return false;
        return (latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180);
    }

    downloadFileHandle(url, name) {
        return () => {

            this.downloadFile(url, name);
        }
    }

    downloadFile(url, name) {
        this.setState({ loading: true })
        this.props.actions.academyActions.getDownloadFile(url, name).then(() => {
            this.setState({ loading: false })
        }, (error) => {
            this.setState({ loading: false })
        })
    }

    deletePage() {
        //var course = Object.assign({}, this.state.course)
        var course = _.cloneDeep(this.state.course);
        if (course.pages.length > 0) {
            if (this.state.totalPages == 1 && course.pages.length == 1 && course.pages[0].components) {
                if (course.pages[0].components.length == 0) {
                    toast.error(this.props.actions.translate.get('Academy_least_one_page_needed'))
                } else {
                    toast.error(this.props.actions.translate.get('Academy_least_one_page_needed'))
                }
            } else {
                if (course.pages.length < this.state.totalPages && this.state.pageNumber + 1 == this.state.totalPages)//si estoy en la ultima pagina y a esta no se le añadieron componentes
                {
                    // Nothing
                } else {
                    course.pages.splice(this.state.pageNumber, 1);
                }

                //                this.setState({pageNumber: 0, totalPages: this.state.totalPages - 1}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course).then((response) => {
                    this.state.pageNumber = 0;
                    this.state.totalPages = this.state.totalPages - 1;
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error)
                });

            }
        } else {
            toast.error(this.props.actions.translate.get('Academy_least_one_page_needed'))
        }
    }

    addPage() {
        //var course = Object.assign({}, this.state.course)
        var course = _.cloneDeep(this.state.course);
        if (course.pages[this.state.pageNumber].components.length > 0) {
            this.setState({ pageNumber: this.state.pageNumber + 1, totalPages: this.state.totalPages + 1 })
        }
    }

    pushComponent(course, component) {
        //If index -1 or not defined, add at the end, otherwise add component at the index maintaning the order

        if (course.pages.length == 0 || !course.pages[this.state.pageNumber] || !course.pages[this.state.pageNumber].components) //prepare to add first component
        {
            var page = {}
            page.components = []
            course.pages.push(page)
        }

        var index = this.state.addIndex;
        var components = [].concat(course.pages[this.state.pageNumber].components);
        if (index === undefined || index === -1) {
            components.push(component);
        } else {
            components.splice(index, 0, component);
        }
        course.pages[this.state.pageNumber].components = components;
        return course;
    }

    addComponent(componentId) //add and modify
    {
        // addIndex -1: add new component at the end, otherwise add component at the index

        if (this.state.selectedNewComponent == 1) {
            if (this.state.titleFormNew != "" && this.state.titleFormNew != null && this.state.titleFormNew != " ") {
                var component = {};
                component.type = 0;
                component.values = {};
                component.values.text = this.state.titleFormNew;
                component.values.greenText = this.state.titleGreenFormNew;
                component.values.subtitle = this.state.subtitleFormNew;

                //var course = Object.assign({}, this.state.course)
                var course = _.cloneDeep(this.state.course);

                if (this.state.indexModifyComponent != null) //modify component
                {
                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                    components[this.state.indexModifyComponent] = component;
                    course.pages[this.state.pageNumber].components = components;
                } else {
                    course = this.pushComponent(course, component);
                }

                //                this.setState({indexModifyComponent: null, course: course, visibleComponentModalADD: false, titleFormNew: "", titleGreenFormNew: "", subtitleFormNew: ""}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course).then((response) => {
                    this.state.indexModifyComponent = null;
                    this.state.course = course;
                    this.state.visibleComponentModalADD = false;
                    this.state.titleFormNew = "";
                    this.state.titleGreenFormNew = "";
                    this.state.subtitleFormNew = "";
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error)
                });

            } else {
                toast.error(this.props.actions.translate.get('Academy_fill_title'))
            }

        }
        else if (this.state.selectedNewComponent == 2 || this.state.selectedNewComponent == 111 || componentId === 111 || componentId === 2) {
            if ((this.state.textFormNew != "" && this.state.textFormNew != null && this.state.textFormNew != " ") || this.state.selectedNewComponent == 111 || componentId === 111 || componentId === 2) {
                var component = {};
                component.type = (this.state.selectedNewComponent == 111 || componentId === 111) ? 11 : 1;
                component.values = {};
                component.values.text = this.state.textFormNew;
                component.values.justified = this.state.justifiedText;
                if (this.state.selectedNewComponent == 111 || componentId === 111) component.values.placeHolder = this.state.placeHolder;

                //var course = Object.assign({}, this.state.course)
                var course = _.cloneDeep(this.state.course);

                if (this.state.indexModifyComponent != null) //modify component
                {
                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                    components[this.state.indexModifyComponent] = component;
                    course.pages[this.state.pageNumber].components = components;
                } else {
                    course = this.pushComponent(course, component);
                }

                //                this.setState({indexModifyComponent: null, course: course, visibleComponentModalADD: false, textFormNew: "", justifiedText: false}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course).then((response) => {
                    this.state.indexModifyComponent = null;
                    this.state.course = course;
                    this.state.visibleComponentModalADD = false;
                    this.state.textFormNew = "";
                    this.state.justifiedText = false;
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error)
                });

            } else {
                toast.error(this.props.actions.translate.get('Academy_fill_description'))
            }


        }
        else if (this.state.selectedNewComponent == 3 || this.state.selectedNewComponent == 12 || componentId == 12 || componentId == 3) {

            if (this.state.selectedNewComponent == 12 || componentId == 12 || (this.state.uriImage != "" && this.state.uriImage != null && this.state.uriImage != " ")) {
                var component = {};
                component.type = (this.state.selectedNewComponent == 12 || componentId == 12) ? 12 : 2;
                component.values = {};
                component.values.url = this.state.uriImage;
                component.values.height = this.state.imageHeight;
                component.values.width = this.state.imageWidth;
                component.values.imageSize = this.state.imageSize;
                component.values.coords = this.state.coords;

                //var course = Object.assign({}, this.state.course)
                var course = _.cloneDeep(this.state.course);
                var lastIndex;

                if (this.state.indexModifyComponent != null) //modify component
                {
                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                    components[this.state.indexModifyComponent] = component;
                    course.pages[this.state.pageNumber].components = components;
                    lastIndex = this.state.indexModifyComponent;
                } else {
                    course = this.pushComponent(course, component);
                    var components = [].concat(course.pages[this.state.pageNumber].components);
                    lastIndex = this.state.addIndex == -1 ? components.length - 1 : this.state.addIndex;
                }

                //                this.setState({indexModifyComponent: null, lastIndexModifyComponent: lastIndex, course: course, visibleComponentModalADD: false, uriImage: null, imageHeight: null, imageWidth: null, imageSize: 'medium', coords: null}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course).then((response) => {
                    this.state.indexModifyComponent = null;
                    this.state.lastIndexModifyComponent = lastIndex;
                    this.state.course = course;
                    this.state.visibleComponentModalADD = false;
                    this.state.uriImage = null;
                    this.state.imageHeight = null;
                    this.state.imageWidth = null;
                    this.state.imageSize = 'medium';
                    this.state.coords = null;
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error)
                });

            } else {
                toast.error(this.props.actions.translate.get('Academy_select_image'))
            }

        }
        else if (this.state.selectedNewComponent == 4 || this.state.selectedNewComponent == 13 || componentId == 13) {

            if (this.state.indexModifyComponent == null) {
                if (this.state.selectedNewComponent == 13 || componentId == 13) {
                    var component = {};
                    component.type = 13;
                    component.values = {};

                    component.values.image = this.state?.uriImage;
                    component.values.imageSize = this.state?.imageSize;
                    component.values.mute = this.state?.videoMute;

                    var course = _.cloneDeep(this.state.course);

                    course = this.pushComponent(course, component);

                    this.modifyCourse(course).then((response) => {
                        this.state.indexModifyComponent = null;
                        this.state.course = course;
                        this.state.visibleComponentModalADD = false;
                        this.state.textFormNew = "";
                        this.state.justifiedText = false;
                        this.updateAfterModifying(response);
                    }, (error) => {
                        this.showModifyingError(error)
                    });
                    return
                }
            }
            if (this.state.uriVideo != "" && this.state.uriVideo != null && this.state.uriVideo != " " || (this.state.filePicker != null) || (this.state.fileVideo != null)) {
                // OK
            } else {
                console.log("1");
                toast.error(this.props.actions.translate.get('Academy_select_video_or_enter_address'));
                return;
            }

            if (this.state.filePicker) {
                console.log("2");
                toast.error(this.props.actions.translate.get('Academy_upload_video'));
                return;
            }
            else {
                if (!FliwerCommonUtils.isValidUrl(this.state.uriVideo)) {
                    console.log("3");
                    toast.error(this.props.actions.translate.get('Academy_video_address_in_not_correct'));
                    return;
                }
            }


            if (!this.state.uriImage) {
                console.log("4");
                toast.error(this.props.actions.translate.get('Academy_select_cover_for_video'));
                return;
            }

            var component = {};
            component.type = this.state.selectedNewComponent == 13 ? 13 : 3;
            component.values = {};

            component.values.image = this.state?.uriImage;
            component.values.imageSize = this.state?.imageSize;
            component.values.mute = this.state?.videoMute;

            if (this.state.files)
                var files = [].concat(this.state.files)
            else
                var files = []

            if (this.state.filePicker) {
                files.push(this.state.filePicker)
                component.values.url = "file_" + (files.length - 1);
                component.values.name = this.state.filePicker.name;
            } else {
                if (this.state.fileVideo && this.state.fileVideo.url) {
                    component.values.url = this.state.fileVideo.url
                    component.values.name = this.state.fileVideo.name;
                } else {
                    component.values.url = this.state.uriVideo;
                }
            }

            //var course = Object.assign({}, this.state.course)
            var course = _.cloneDeep(this.state.course);
            var lastIndex;
            if (this.state.indexModifyComponent != null) //modify component
            {
                component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                components[this.state.indexModifyComponent] = component;
                course.pages[this.state.pageNumber].components = components;
                lastIndex = this.state.indexModifyComponent;
            } else {
                course = this.pushComponent(course, component);
                var components = [].concat(course.pages[this.state.pageNumber].components);
                lastIndex = this.state.addIndex == -1 ? components.length - 1 : this.state.addIndex;
            }

            //            this.setState({
            //                indexModifyComponent: null,
            //                lastIndexModifyComponent: lastIndex,
            //                course: course,
            //                visibleComponentModalADD: false,
            //                uriVideo: "", uriImage: null, videoMute: true, imageSize: 'medium', filePicker: null, files: files, fileVideo: null, recVideo: false, videoIsRecorded: false, videoUploaded: false
            //            }, () => {
            //                this.saveCourse();
            //            });
            this.modifyCourse(course, files).then((response) => {
                this.state.indexModifyComponent = null;
                this.state.lastIndexModifyComponent = lastIndex;
                this.state.course = course;
                this.state.visibleComponentModalADD = false;
                this.state.uriVideo = "";
                this.state.uriImage = null;
                this.state.videoMute = true;
                this.state.imageSize = "medium";
                this.state.filePicker = null;
                this.state.files = files;
                this.state.fileVideo = null;
                this.state.recVideo = false;
                this.state.videoIsRecorded = false;
                this.state.videoUploaded = false;
                this.updateAfterModifying(response);
            }, (error) => {
                this.showModifyingError(error);
            });

        }
        else if (this.state.selectedNewComponent == 5) {
            var validAnswers = true
            var validCorrectAnswers = true
            var validTextQuestions = true
            var validTextAnswers = true
            var foundQuestions = false;

            for (var q in this.state.exam.questions) {
                if (this.state.exam.questions[q].answers.length < 2)
                    validAnswers = false;
                var foundCorrect = false;
                var foundAnswer = false;
                var a = 0;
                if (this.state.exam.questions[q].question.length < 1)
                    foundQuestions = true
                for (var a in this.state.exam.questions[q].answers) {
                    if (this.state.exam.questions[q].answers[a].text.length < 1)
                        foundAnswer = true
                    if (this.state.exam.questions[q].answers[a].correct == true)
                        foundCorrect = true
                    a++;
                }
                if (!foundCorrect)
                    validCorrectAnswers = false
                if (!foundAnswer)
                    validTextAnswers = false
                if (!foundQuestions)
                    validTextQuestions = false
            }

            if (this.state.exam.questions && this.state.exam.questions.length > 0) {
                if (validAnswers) {
                    if (validCorrectAnswers) {
                        if (!validTextAnswers) {
                            if (!validTextQuestions) {
                                var component = {};
                                component.type = 4;
                                component.values = {};
                                component.values = this.state.exam
                                //var course = Object.assign({}, this.state.course)
                                var course = _.cloneDeep(this.state.course);

                                if (this.state.indexModifyComponent != null) //modify component
                                {
                                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                                    components[this.state.indexModifyComponent] = component;
                                    course.pages[this.state.pageNumber].components = components;
                                } else {
                                    course = this.pushComponent(course, component);
                                }

                                //                                this.setState({indexModifyComponent: null, course: course, visibleComponentModalADD: false, exam: {}}, () => {
                                //                                    this.saveCourse();
                                //                                });
                                this.modifyCourse(course).then((response) => {
                                    this.state.indexModifyComponent = null;
                                    this.state.course = course;
                                    this.state.visibleComponentModalADD = false;
                                    this.state.exam = {};
                                    this.updateAfterModifying(response);
                                }, (error) => {
                                    this.showModifyingError(error);
                                });

                            } else {
                                toast.error(this.props.actions.translate.get('Academy_questions_no_empty'))
                            }
                        } else {
                            toast.error(this.props.actions.translate.get('Academy_answers_no_empty'))
                        }
                    } else {
                        toast.error(this.props.actions.translate.get('Academy_correct_answers'))
                    }
                } else {
                    toast.error(this.props.actions.translate.get('Academy_minim_answers'))
                }
            } else {
                toast.error(this.props.actions.translate.get('Academy_minim_questions'))
            }
        }
        else if (this.state.selectedNewComponent == 6 || this.state.selectedNewComponent == 14 || componentId == 14 || componentId == 6) {

            if (this.state.selectedNewComponent == 14 || componentId == 14 || (this.state.uriFile != "" && this.state.uriFile != null && this.state.uriFile != " ") || (this.state.filePicker != null)) {
                var component = {};
                component.type = (this.state.selectedNewComponent == 14 || componentId == 14) ? 14 : 5;
                component.values = {};
                if (this.state.files)
                    var files = [].concat(this.state.files)
                else
                    var files = []

                if (this.state.filePicker) {
                    files.push(this.state.filePicker)
                    component.values.url = "file_" + (files.length - 1);
                    component.values.name = this.state.filePicker.name;

                } else {
                    if (this.state.selectedNewComponent != 14 && componentId !== 14) {
                        if (!FliwerCommonUtils.isValidUrl(this.state.uriFile)) {
                            toast.error(this.props.actions.translate.get('Academy_video_address_in_not_correct'));
                            return;
                        }
                        component.values.url = this.state.uriFile;
                    }
                }

                //var course = Object.assign({}, this.state.course)
                var course = _.cloneDeep(this.state.course);

                if (this.state.indexModifyComponent != null) //modify component
                {
                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                    components[this.state.indexModifyComponent] = component;
                    course.pages[this.state.pageNumber].components = components;
                } else {
                    course = this.pushComponent(course, component);
                }

                //                this.setState({indexModifyComponent: null, course: course, visibleComponentModalADD: false, uriFile: "", files: files, filePicker: null, file: null}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course, files).then((response) => {
                    this.state.indexModifyComponent = null;
                    this.state.course = course;
                    this.state.visibleComponentModalADD = false;
                    this.state.uriFile = "";
                    this.state.files = files;
                    this.state.filePicker = null;
                    this.state.file = null;
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error);
                });

            } else {
                toast.error(this.props.actions.translate.get('Academy_enter_or_select_file'));
            }

        }
        else if (this.state.selectedNewComponent == 10)//subtitle
        {
            if (this.state.subtitle1FormNew != "" && this.state.subtitle1FormNew != null && this.state.subtitle1FormNew != " ") {
                var component = {};
                component.type = 9;
                component.values = {};
                component.values.text = this.state.subtitle1FormNew;
                component.values.text2 = this.state.subtitle2FormNew;

                //var course = Object.assign({}, this.state.course)
                var course = _.cloneDeep(this.state.course);

                if (this.state.indexModifyComponent != null) //modify component
                {
                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                    components[this.state.indexModifyComponent] = component;
                    course.pages[this.state.pageNumber].components = components;
                } else {
                    course = this.pushComponent(course, component);
                }

                //                this.setState({indexModifyComponent: null, course: course, visibleComponentModalADD: false, subtitle1FormNew: "", subtitle2FormNew: ""}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course).then((response) => {
                    this.state.indexModifyComponent = null;
                    this.state.course = course;
                    this.state.visibleComponentModalADD = false;
                    this.state.subtitle1FormNew = "";
                    this.state.subtitle2FormNew = "";
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error);
                });

            } else {
                toast.error(this.props.actions.translate.get('Academy_subtitle_is_required'));
            }
        }
        else if (this.state.selectedNewComponent == 11)//delimiter
        {
            if (this.state.delimiterHeightFormNew && this.state.delimiterHeightFormNew != null && this.state.delimiterHeightFormNew > 0) {
                var component = {};
                component.type = 10;
                component.values = {};
                component.values.height = this.state.delimiterHeightFormNew;
                component.values.addLine = this.state.delimiterAddLineFormNew;

                //var course = Object.assign({}, this.state.course)
                var course = _.cloneDeep(this.state.course);

                if (this.state.indexModifyComponent != null) //modify component
                {
                    component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                    var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                    components[this.state.indexModifyComponent] = component;
                    course.pages[this.state.pageNumber].components = components;
                } else {
                    course = this.pushComponent(course, component);
                }

                //                this.setState({indexModifyComponent: null, course: course, visibleComponentModalADD: false, delimiterHeightFormNew: 100, delimiterAddLineFormNew: false}, () => {
                //                    this.saveCourse();
                //                });
                this.modifyCourse(course).then((response) => {
                    this.state.indexModifyComponent = null;
                    this.state.course = course;
                    this.state.visibleComponentModalADD = false;
                    this.state.delimiterHeightFormNew = 100;
                    this.state.delimiterAddLineFormNew = false;
                    this.updateAfterModifying(response);
                }, (error) => {
                    this.showModifyingError(error);
                });

            } else {
                toast.error("The height of the line is mandatory");
            }
        }
        else if (componentId == 16) {
            var component = {};
            component.type = 16;
            component.values = {};

            var course = _.cloneDeep(this.state.course);

            if (this.state.indexModifyComponent != null) //modify component
            {
                component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                components[this.state.indexModifyComponent] = component;
                course.pages[this.state.pageNumber].components = components;
            } else {
                course = this.pushComponent(course, component);
            }

            this.modifyCourse(course).then((response) => {
                this.state.indexModifyComponent = null;
                this.state.course = course;
                this.state.visibleComponentModalADD = false;
                this.state.delimiterHeightFormNew = 100;
                this.state.delimiterAddLineFormNew = false;
                this.updateAfterModifying(response);
            }, (error) => {
                this.showModifyingError(error);
            });
        }

        this.setState({
            selectedNewComponent: null
        })
    }

    uploadVideo(idComponent) {

        if (!this.state.filePicker) {
            toast.error(this.props.actions.translate.get('Academy_select_video_please'));
            return;
        }

        var component = {};
        component.type = idComponent ? idComponent : 3;
        component.values = {};

        component.values.image = this.state.uriImage;
        component.values.imageSize = this.state.imageSize;
        component.values.mute = this.state.videoMute;

        if (this.state.files)
            var files = [].concat(this.state.files)
        else
            var files = []

        files.push(this.state.filePicker)
        component.values.url = "file_" + (files.length - 1);
        component.values.name = this.state.filePicker.name;

        //var course = Object.assign({}, this.state.course)
        var course = _.cloneDeep(this.state.course);
        console.log('component', component)
        if (this.state.indexModifyComponent != null) //modify component
        {
            component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
            var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
            components[this.state.indexModifyComponent] = component;
            course.pages[this.state.pageNumber].components = components;
        } else {
            course = this.pushComponent(course, component);
        }

        //        this.setState({course: course, files: files, videoUploaded: true}, () => {
        //            this.saveCourse();
        //        });
        this.modifyCourse(course, files).then((response) => {
            this.state.course = course;
            this.state.files = files;
            this.state.videoUploaded = true;
            this.updateAfterModifying(response);
        }, (error) => {
            this.showModifyingError(error);
        });

    }

    uploadVideoBackground(idComponent) {


        this.setState({ loading: true });

        var data = {
            tableFilePath: "fliwer_academyComponentVideo",
            columnFilePath: "url",
            columnId: "id",
            idOriginalTable: 1,
            localPath: this.state.filePicker.uri, //only on frontend
            fileName: this.state.filePicker.name,
            chunkSize: 1000000, //1000KB
            fileSize: this.state.filePicker.fileSize,
        }

        this.props.actions.backgroundUploadActions.addPendingToUploadFile(data).then((response) => {

            var component = {};
            component.type = idComponent ? idComponent : 3;
            component.values = {};
            data.url = response.url;
            data.id = response.id;

            component.values.image = this.state.uriImage;
            component.values.imageSize = this.state.imageSize;
            component.values.mute = this.state.videoMute;
            component.values.idAsyncFileUpload = response.id;
            component.values.name = this.state.filePicker.name;
            if (response.completed) {
                component.values.completed = data;
            }

            var files = []

            var course = _.cloneDeep(this.state.course);


            if (this.state.indexModifyComponent != null) //modify component
            {
                component.id = this.state.course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].id;
                var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
                components[this.state.indexModifyComponent] = component;
                course.pages[this.state.pageNumber].components = components;
            } else {
                course = this.pushComponent(course, component);
            }

            this.modifyCourse(course, files).then((response) => {
                this.state.course = course;
                this.state.files = files;
                this.state.videoUploaded = true;
                this.updateAfterModifying(response);

                //Close modal
                this.setState({
                    visibleComponentModalADD: false, titleFormNew: "", titleGreenFormNew: "", subtitleFormNew: "", textFormNew: "", justifiedText: false, videoMute: true, imageSize: 'medium', uriImage: null, uriVideo: null, uriFile: null, filePicker: null, file: null, fileVideo: null, recVideo: false, videoIsRecorded: false, videoUploaded: false, subtitle1FormNew: "", subtitle2FormNew: "",
                    delimiterHeightFormNew: 0, delimiterAddLineFormNew: false, indexModifyComponent: null, lastIndexModifyComponent: null, exam: {}, imageHeight: null, imageWidth: null,
                    coords: null
                });

            }, (error) => {
                this.showModifyingError(error);
            });


        }, (error) => {
            this.showModifyingError(error);
        });


    }

    deleteComponent(index) {
        var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
        components.splice(index, 1);

        //var course = Object.assign({}, this.state.course)
        //var course = JSON.parse(JSON.stringify(this.state.course));
        var course = _.cloneDeep(this.state.course);
        course.pages[this.state.pageNumber].components = components;

        //        this.setState({course: course}, () => {
        //            this.saveCourse();
        //        });
        this.modifyCourse(course).then((response) => {
            this.state.course = course;
            this.updateAfterModifying(response);
        }, (error) => {
            this.showModifyingError(error);
        });
    }

    upComponent(index) {
        var that = this;
        var index = parseInt(index);
        if (index > 0) {
            var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
            var aux1 = {};
            var aux2 = {};

            aux1 = Object.assign({}, components[index - 1]);
            aux2 = Object.assign({}, components[index]);

            components[index] = aux1;
            components[index - 1] = aux2;

            //var course = Object.assign({}, this.state.course)
            var course = _.cloneDeep(this.state.course);
            course.pages[this.state.pageNumber].components = components;

            /*
            this.modifyCourse(course).then((response) =>  {
                this.state.course = course;
                this.state.images = {};
                this.updateAfterModifying(response);
            }, (error) => {
                this.showModifyingError(error);
            });*/

            clearTimeout(this.state.timeout_up_down);
            this.setState({ course: course, images: {} }, () => {
                that.setUpDownComponent();
            });
        }
    }

    downComponent(index) {
        var that = this;
        var index = parseInt(index);
        if (index < this.state.course.pages[this.state.pageNumber].components.length - 1) {
            var components = [].concat(this.state.course.pages[this.state.pageNumber].components);
            var aux = {};

            aux = Object.assign({}, components[index]);

            components[index] = Object.assign({}, components[index + 1]);
            components[index + 1] = Object.assign({}, aux);

            //var course = Object.assign({}, this.state.course)
            var course = _.cloneDeep(this.state.course);
            course.pages[this.state.pageNumber].components = components;

            /*this.modifyCourse(course).then((response) =>  {
                this.state.course = course;
                this.state.images = {};
                this.updateAfterModifying(response);
            }, (error) => {
                this.showModifyingError(error);
            });*/

            clearTimeout(this.state.timeout_up_down);
            this.setState({ course: course, images: {} }, () => {
                that.setUpDownComponent();
            });
        }
    }

    setUpDownComponent() {

        this.state.timeout_up_down = setTimeout(() => {
            clearTimeout(this.state.timeout_up_down);

            this.modifyCourse(this.state.course, null, true).then((response) => {

                this.props.actions.academyActions.updateNewCourse(this.state.course, this.state.files).then((newCourse) => {

                });

            }, (error) => {
                this.showModifyingError(error);
            });

        }, 2000);

    }

    editComponent(index) {
        if (index === "move-page") {
            this.setState({ showMovePageToModal: true, movePageTo: '' });
            return;
        }

        let type = this.state.course.pages[this.state.pageNumber].components[index].type;
        console.log(type)
        if (type == 0) {
            var title = this.state.course.pages[this.state.pageNumber].components[index].values.text;
            var greenText = this.state.course.pages[this.state.pageNumber].components[index].values.greenText;
            var subtitle = this.state.course.pages[this.state.pageNumber].components[index].values.subtitle;
            this.setState({ indexModifyComponent: index, selectedNewComponent: 1, visibleComponentModalADD: true, titleFormNew: title, titleGreenFormNew: greenText, subtitleFormNew: subtitle })
        }
        else if (type == 1) {
            var text = this.state.course.pages[this.state.pageNumber].components[index].values.text;
            var justifiedText = this.state.course.pages[this.state.pageNumber].components[index].values.justified;
            this.setState({ indexModifyComponent: index, selectedNewComponent: 2, visibleComponentModalADD: true, textFormNew: text, justifiedText: justifiedText })
        }
        else if (type == 2) {
            var uriImage = this.state.course.pages[this.state.pageNumber].components[index].values.url;
            var height = this.state.course.pages[this.state.pageNumber].components[index].values.height;
            var width = this.state.course.pages[this.state.pageNumber].components[index].values.width;
            var posterSize = this.state.course.pages[this.state.pageNumber].components[index].values.imageSize;
            if (!posterSize) posterSize = 'large';
            var coords = this.state.course.pages[this.state.pageNumber].components[index].values.coords;
            this.setState({ indexModifyComponent: index, selectedNewComponent: 3, visibleComponentModalADD: true, uriImage: uriImage, imageHeight: height, imageWidth: width, imageSize: posterSize, coords: coords });
        }
        else if (type == 12) {
            var uriImage = this.state.course.pages[this.state.pageNumber].components[index].values.url;
            var height = this.state.course.pages[this.state.pageNumber].components[index].values.height;
            var width = this.state.course.pages[this.state.pageNumber].components[index].values.width;
            var posterSize = this.state.course.pages[this.state.pageNumber].components[index].values.imageSize;
            if (!posterSize) posterSize = 'large';
            var coords = this.state.course.pages[this.state.pageNumber].components[index].values.coords;
            this.setState({ indexModifyComponent: index, selectedNewComponent: 12, visibleComponentModalADD: true, uriImage: uriImage, imageHeight: height, imageWidth: width, imageSize: posterSize, coords: coords });
        }
        else if (type == 3) {
            var uriVideo = this.state.course.pages[this.state.pageNumber].components[index].values.url;
            var poster = this.state.course.pages[this.state.pageNumber].components[index].values.image;
            var posterSize = this.state.course.pages[this.state.pageNumber].components[index].values.imageSize;
            if (!posterSize) posterSize = 'large';
            var mute = this.state.course.pages[this.state.pageNumber].components[index].values.mute;

            var fileVideo = this.state.course.pages[this.state.pageNumber].components[index].values;

            if (/^file_/.test(this.state.course.pages[this.state.pageNumber].components[index].values.url)) {
                this.setState({ indexModifyComponent: index, selectedNewComponent: 4, visibleComponentModalADD: true, fileVideo: fileVideo, uriImage: poster, videoMute: mute, imageSize: posterSize })
            } else {
                this.setState({ indexModifyComponent: index, selectedNewComponent: 4, visibleComponentModalADD: true, uriVideo: uriVideo, uriImage: poster, videoMute: mute, imageSize: posterSize })
            }
        }
        else if (type == 13) {
            var uriVideo = this.state.course.pages[this.state.pageNumber].components[index].values.url;
            var poster = this.state.course.pages[this.state.pageNumber].components[index].values.image;
            var posterSize = this.state.course.pages[this.state.pageNumber].components[index].values.imageSize;
            if (!posterSize) posterSize = 'large';
            var mute = this.state.course.pages[this.state.pageNumber].components[index].values.mute;

            var fileVideo = this.state.course.pages[this.state.pageNumber].components[index].values;

            if (/^file_/.test(this.state.course.pages[this.state.pageNumber].components[index].values.url)) {
                this.setState({ indexModifyComponent: index, selectedNewComponent: 13, visibleComponentModalADD: true, fileVideo: fileVideo, uriImage: poster, videoMute: mute, imageSize: posterSize })
            } else {
                this.setState({ indexModifyComponent: index, selectedNewComponent: 13, visibleComponentModalADD: true, uriVideo: uriVideo, uriImage: poster, videoMute: mute, imageSize: posterSize })
            }
        }
        else if (type == 14) {
            const course = _.cloneDeep(this.state.course);
            const components = course.pages[this.state.pageNumber].components;
            const findedIndex = components.findIndex(c => c.id === this.state.course.pages[this.state.pageNumber].components[index].id);

            this.setState({ indexModifyComponent: findedIndex });
            this.newComponentPressed(14);
            this.getFiles((image) => {
                setTimeout(() => {
                    this.addComponent();
                }, 500) //Not the best solution, but at the moment works
            });
        }
        else if (type == 4) {
            var exam = this.copy(this.state.course.pages[this.state.pageNumber].components[index].values)
            this.setState({ indexModifyComponent: index, selectedNewComponent: 5, visibleComponentModalADD: true, exam: exam })
        }
        else if (type == 5) {
            var file = this.state.course.pages[this.state.pageNumber].components[index].values;
            if (/^file_/.test(this.state.course.pages[this.state.pageNumber].components[index].values.url)) {
                this.setState({ indexModifyComponent: index, selectedNewComponent: 6, visibleComponentModalADD: true, file: file })
            } else {
                if (this.state.course.pages[this.state.pageNumber].components[index].values.name)//file added
                {
                    this.setState({ indexModifyComponent: index, selectedNewComponent: 6, visibleComponentModalADD: true, file: file })
                } else {//url
                    this.setState({ indexModifyComponent: index, selectedNewComponent: 6, visibleComponentModalADD: true, uriFile: file.url })
                }
            }
        }
        else if (type == 9)//subtitle
        {
            var subtitle1 = this.state.course.pages[this.state.pageNumber].components[index].values.text;
            var subtitle2 = this.state.course.pages[this.state.pageNumber].components[index].values.text2;
            this.setState({ indexModifyComponent: index, selectedNewComponent: 10, visibleComponentModalADD: true, subtitle1FormNew: subtitle1, subtitle2FormNew: subtitle2 })
        }
        else if (type == 10)//delimiter
        {
            //var height = this.state.course.pages[this.state.pageNumber].components[index].values.height;
            //var addLine = this.state.course.pages[this.state.pageNumber].components[index].values.addLine;
            var height = this.state.delimiterHeightDefaultValue;
            var addLine = this.state.delimiterAddLineDefaultValue;
            this.setState({ indexModifyComponent: index, selectedNewComponent: 11, visibleComponentModalADD: true, delimiterHeightFormNew: height, delimiterAddLineFormNew: addLine })
        }

    }

    async correctExam(idExam) {
        var examRespondedAnswers = [];
        for (var idQuestion in this.state.examSelectedOptions) {
            let answers = this.state.examSelectedOptions[idQuestion];
            let question = {};
            question.idQuestion = idQuestion;
            question.idAnswers = [];
            for (var idAnswer in answers) {
                let isSelected = answers[idAnswer];
                if (isSelected)
                    question.idAnswers.push(idAnswer)
            }
            examRespondedAnswers.push(question)
        }

        if (examRespondedAnswers.length == 0) {
            toast.error(this.props.actions.translate.get('Academy_mark_answers'));
            return;
        }

        var correct = 0
        this.setState({ loading: true })
        await this.props.actions.academyActions.checkExam(this.state.idCourse, examRespondedAnswers, idExam).then((response) => {
            console.log("checkExam response", response)
            //this.setState({examScore: response.score});
            this.state.course = response.course;
            this.state.examScore = this.state.course.score;

            this.props.actions.academyActions.updateNewCourse(this.state.course, this.state.files).then((newCourse) => {
                this.props.actions.academyActions.setMaxPage(this.state.idCourse, this.state.pageNumber + 1).then((response) => {
                    this.setState({ loading: false });
                }, (error) => {
                    if (error.reason)
                        toast.error(error.reason);
                    this.setState({ loading: false });
                });
            }, (err) => {
                this.setState({ loading: false });
            });

        }, (error) => {
            if (error.reason)
                toast.error(error.reason);
            this.setState({ loading: false })
        });

    }

    async resetExam(idExam) {
        this.setState({ loading: true })
        await this.props.actions.academyActions.resetExam(this.state.idCourse, idExam).then((response) => {
            console.log("resetExam response", response)
            this.state.course = response.course;

            this.props.actions.academyActions.updateNewCourse(this.state.course, this.state.files).then((newCourse) => {
                this.setState({ loading: false, examSelectedOptions: [], examScore: null });
            }, (err) => {
                this.setState({ loading: false });
            });

        }, (error) => {
            if (error.reason)
                toast.error(error.reason);
            this.setState({ loading: false })
        });
    }

    modifyCourse(course, files, skipLoading) {
        return new Promise((resolve, reject) => {
            this.props?.setIsUpdating && this.props.setIsUpdating(true)
            if (!skipLoading) this.setState({ loading: true });
            var theFiles = !files ? [] : files;
            this.props.actions.academyActions.modifyCourse(this.state.idCourse, course, theFiles, (event) => {
                console.log("on progress event", event);
                //console.log(event.loaded / event.total * 100,event.lengthComputable);
            }).then((response) => {
                this.props?.setIsUpdating && this.props.setIsUpdating(false)
                resolve(response);
            }, (error) => {
                this.props?.setIsUpdating && this.props.setIsUpdating(false)
                reject(error);
            });
        });
    }

    showModifyingError(error) {

        console.log("showModifyingError error", error);

        var showErrorModal = false;
        if (error.id == 142)
            toast.error(this.props.actions.translate.get('Academy_empty_pages'));
        else if (error.id == 21)
            toast.error(this.props.actions.translate.get('Academy_email_no_exist'));
        else if (error.reason) {
            showErrorModal = true;
            toast.error(error.reason);
        }
        else {
            showErrorModal = true;
            toast.error(this.props.actions.translate.get('Academy_an_error_occurred_while_trying_to_save_your_work'));
        }

        var errorText = "";
        var errorText2 = "";
        if (showErrorModal) {
            errorText += this.props.actions.translate.get('Academy_an_error_occurred_while_saving_the_component');
            if (error.id)
                errorText2 += error.id;
            if (error.reason)
                errorText2 += " - " + error.reason;
            if (error.from)
                errorText2 += " - logcode: " + error.from;
        }

        this.setState({ loading: false, showErrorModal: showErrorModal, errorText: errorText, errorText2: errorText2 });
    }

    updateAfterModifying(response) {
        if (response.ok == false && response.id == 142) {
            toast.error(this.props.actions.translate.get('Academy_least_one_component_needed'));
            this.setState({ loading: false });
            return;
        }

        //console.log("saveCourse response.course", response.course);
        this.props.actions.academyActions.updateLastTimeWorkOrder(this.state.idCourse, response.course.lastUpdateName, response.course.lastUpdateTime)

        var course = this.state.course;
        course.pages = response.course.pages;

        // VIDEO STATUS control
        if (this.state.selectedNewComponent == 4 && this.state.filePicker) {
            if (this.state.indexModifyComponent == null) {
                let index = this.state.addIndex == -1 ? course.pages[this.state.pageNumber].components.length - 1 : this.state.addIndex;
                if (index < 0) index = 0;
                this.state.indexModifyComponent = index;
            }

            this.state.uriVideo = course.pages[this.state.pageNumber].components[this.state.indexModifyComponent].values.url;
            this.state.files = null;
            this.state.filePicker = null;
            this.state.fileVideo = null;
        }

        // Refresh image size
        if ((this.state.selectedNewComponent == 3 || this.state.selectedNewComponent == 4) && this.state.lastIndexModifyComponent != null) {
            var propindex = "index-" + this.state.lastIndexModifyComponent;
            if (!this.state.images[this.state.pageNumber])
                console.log("Upss! undefined this.state.images[this.state.pageNumber]", this.state.pageNumber)
            if (this.state.images[this.state.pageNumber] && this.state.images[this.state.pageNumber][propindex]) {
                console.log("Refresh image size");
                //                    this.state.images[this.state.pageNumber][propindex].height = null;
                //                    this.state.images[this.state.pageNumber][propindex].realImageHeight = null;
                //                    this.state.images[this.state.pageNumber][propindex].realImageWidth = null;
                delete this.state.images[this.state.pageNumber][propindex];
            }
        }

        toast.notification(this.props.actions.translate.get('Academy_your_work_is_safe'));

        //this.setState({loading: false, course: course, lastIndexModifyComponent: null});
        this.props.actions.academyActions.updateNewCourse(course, this.state.files).then((newCourse) => {
            this.setState({ loading: false, course: course, lastIndexModifyComponent: null });
        });

    }

    getFiles(onEnd) {
        const options = {
            title: this.props.actions.translate.get('zoneImageSelectorVC_photoalert_title'),
            takePhotoButtonTitle: this.props.actions.translate.get('zoneImageSelectorVC_photoalert_choice2'),
            chooseFromLibraryButtonTitle: this.props.actions.translate.get('zoneImageSelectorVC_photoalert_choice1'),
            fileInput: this.fileInputFiles,
            allowMultipleSelection: false,
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        DocumentPicker.pick(options).then((response) => {
            //if response is an array get first value
            if (Array.isArray(response)) response = response[0];
            var filePicker = Object.assign(response)
            //console.log("DocumentPicker filePicker", filePicker)
            this.setState({ filePicker: filePicker })
            if (onEnd) onEnd({ filePicker: filePicker, error: false });
        }, (error) => {
            console.log('err', error)
            if (onEnd) onEnd({ error: true });
        });
    }

    getPhotos(column, onEnd) {
        var that = this;
        const options = {
            fileInput: this.fileInput
        };

        MediaPicker.openPicker(options).then((response) => {
            if (!response || response.didCancel) {
                console.log('User cancelled image picker');
            } else {

                var path = response.path ? response.path : response.uri;
                this.setState({ loading: true });
                resizeImage.resize(Platform.OS === 'web' ? this.fileInput.files[0] : response.base64, path).then((resultImage) => {
                    if (!column) {
                        this.setState({ uriImage: resultImage, loading: false });
                        if (onEnd) onEnd({ uriImage: resultImage, error: false });
                    }
                    else {
                        this.setState({ loading: false });
                        if (onEnd) onEnd({ error: false });
                    }

                }, (error) => {
                    console.log(error)
                    this.setState({ loading: false })
                    if (onEnd) onEnd({ error: true });
                });
            }
        }, () => { console.log("Error gathering image"); });

    }

    getTotalPages() {
        if (!this.state.idCourse || this.props.academyDataReducer.length == 0) {
            if (this.state.auditing) {
                return (<Redirect push to={"/audit"} />)
            } else {
                return (<Redirect push to={"/academyCourses"} />)
            }

        } else {
            var indents = [];
            var i = 0;
            var found = false;
            while (!found && i < this.props.academyDataReducer.length) {
                var course = this.props.academyDataReducer[i].courses.find((n) => {
                    return n.id == this.state.idCourse
                })
                if (course) {
                    found = true;
                } else
                    i++;
            }
        }

    }

    async goNextPressed() {
        this.setState({ loading: true })
        if (this.state.pageNumber < this.state.totalPages - 1) {

            if (this.hasPermissionToEdit()) {
                this.setState({ pageNumber: this.state.pageNumber + 1 })
                this.setState({ loading: false })
            } else if (!this.state.urlUUID) {
                await this.props.actions.academyActions.setMaxPage(this.state.idCourse, this.state.pageNumber + 1).then((response) => {
                    this.setState({ pageNumber: this.state.pageNumber + 1 })
                    this.setState({ loading: false })
                }, (error) => {
                    this.setState({ loading: false })
                })
            } else this.setState({ loading: false, pageNumber: this.state.pageNumber + 1 })
        } else {
            this.setState({ loading: false })
        }
    }

    async goBackPressed() {
        this.setState({ loading: true })
        if (this.state.pageNumber > 0) {
            this.setState({ pageNumber: this.state.pageNumber - 1 })
            this.setState({ loading: false })
        } else//go page -1
        {
            if (this.hasPermissionToEdit()) {
                await this.props.actions.academyActions.updateNewCourse(this.state.course, this.state.files).then(async (response) => {

                    /*await this.props.actions.academyActions.getAcademyData().then(() => {
                        this.setState({gotoModifyCourseInformation: true, loading: false});
                    }, (error) => {
                        this.setState({loading: false})
                    });*/
                    this.setState({ gotoModifyCourseInformation: true, loading: false });
                });

            } else
                this.setState({ goMainScreen: true, loading: false })
        }
    }

    addAnswer(indexQuestions) {
        return (text) => {
            var answer = {}
            answer.text = text && typeof text === "string" ? text : ""
            answer.correct = false;
            var exam = Object.assign({}, this.state.exam)
            exam.questions[indexQuestions].answers.push(answer)
            this.setState({ exam: exam, addedQuestion: null, addedAnswer: indexQuestions })
        }
    }

    deleteAnswer(indexQuestions, i) {
        return () => {
            var exam = this.copy(this.state.exam);
            exam.questions[indexQuestions].answers.splice(i, 1);
            this.setState({ exam: exam })
        }
    }

    addQuestion() {
        return (text) => {

            if (this.state.exam) {
                var exam = Object.assign({}, this.state.exam)

                var question = {}
                question.question = text && typeof text === "string" ? text : ""
                question.answers = []

                if (!exam.questions) {
                    exam.questions = []
                }
                exam.questions.push(question)
                this.setState({ exam: exam, addedQuestion: true, addedAnswer: null })
            } else {
            }
        }
    }

    deleteQuestion(indexQuestion) {
        return () => {
            var exam = this.copy(this.state.exam);
            exam.questions.splice(indexQuestion, 1);
            this.setState({ exam: exam })
        }
    }

    changeMuteVideoValue() {
        return () => {
            this.setState({ videoMute: !this.state.videoMute })
        }
    }

    changeJustifiedTextValue() {
        return () => {
            this.setState({ justifiedText: !this.state.justifiedText });
        };
    }

    changeCheckboxCorrectValue(indexQuestions, i) {
        return () => {
            var exam = this.copy(this.state.exam)
            exam.questions[indexQuestions].answers[i].correct = !exam.questions[indexQuestions].answers[i].correct;
            this.setState({ exam: exam })
        }
    }

    printCourses() {
        var courses = []

        var findAudit = this.props.academyDataReducer.find((n) => {
            return n.id == 15
        })

        if (findAudit != null && findAudit != "undefined") {
            for (var x in findAudit.courses) {
                var course = {}
                course.label = findAudit.courses[x].title
                course.value = findAudit.courses[x].id
                course.style = {}

                courses.push(course);

            }

        }
        if (Platform.OS == "android" || Platform.OS == 'ios')
            courses.unshift({ label: this.props.actions.translate.get("Academy_select_option"), value: null });
        return courses;
    }

    modalDeleteVisiblePressed(visible, index2) {
        return () => {
            this.setState({ modalDeleteVisible: true, modalDeleteType: "component", componentToDelete: index2 })
        }

    }

    getCategoryID() {
        var course = this.getCourse();
        var ret = 15;
        if (course && course.idCategory)
            ret = course.idCategory;
        return ret;
    }

    getCourse() {
        var course = null;

        if (!this.props.newCourseReducer) {
            var i = 0;
            var found = false;

            while (!found && i < this.props.academyDataReducer.length) {
                course = this.props.academyDataReducer[i].courses.find((n) => {
                    return n.id == this.state.idCourse;
                });
                if (course)
                    found = true;
                else
                    i++;
            }
        }
        else
            course = this.props.newCourseReducer;

        return course;
    }

    onAcceptPagging() {
        if (!this.state.goToPageNumber) {
            return;
        }

        var pageNumber = this.state.pageNumber;

        var pN = parseInt(this.state.goToPageNumber) - 1;
        if (pN < 0)
            pN = 0;
        if (pN >= this.state.totalPages - 1)
            pN = this.state.totalPages - 1;
        pageNumber = pN;

        this.setState({ showPaggingModal: false, pageNumber: pageNumber });
    }

    onAcceptMovePageTo() {
        if (!this.state.movePageTo) {
            return;
        }

        var movePageTo = parseInt(this.state.movePageTo);
        var course = this.state.course;
        var pages = course.pages;
        var srcIndex = this.state.pageNumber;
        var dstIndex = movePageTo - 1;

        if (movePageTo > this.state.totalPages) {
            toast.error(this.props.actions.translate.get('Academy_the_total_number_of_pages_are') + " " + (this.state.totalPages).toString());
            return;
        }
        else if (movePageTo < 1) {
            toast.error(this.props.actions.translate.get('Academy_min_value_page_moving'));
            return;
        }
        else if (srcIndex === dstIndex) {
            toast.error(this.props.actions.translate.get('Academy_landing_page_same_source_page'));
            return;
        }
        else if (!pages[srcIndex]) {
            toast.error(this.props.actions.translate.get('Academy_save_first_before_moving'));
            return;
        }
        else if (!pages[dstIndex]) {
            toast.error(this.props.actions.translate.get('Academy_you_cannot_move_page_to_new_page'));
            return;
        }

        var pageToMove = pages[srcIndex];
        var newPages = [], page, increment = false;

        for (var i = 0; i < pages.length; i++) {
            if (i == srcIndex) {
                newPages.push(pages[((dstIndex > srcIndex) ? (i + 1) : (i - 1))]);
                increment = (dstIndex > srcIndex) ? true : false;
            }
            else if (i == dstIndex) {
                newPages.push(pageToMove);
                increment = (dstIndex > srcIndex) ? false : true;
            }
            else {
                var index = increment ? ((dstIndex > srcIndex) ? (i + 1) : (i - 1)) : i;
                newPages.push(pages[index]);
            }
        }
        course.pages = newPages;

        //        this.setState({showMovePageToModal: false, course: course, pageNumber: dstIndex}, () => {
        //            this.saveCourse();
        //        });
        this.modifyCourse(course).then((response) => {
            this.state.showMovePageToModal = false;
            this.state.course = course;
            this.state.pageNumber = dstIndex;
            this.updateAfterModifying(response);
        }, (error) => {
            this.showModifyingError(error);
        });

    }

    getCustomSize(srcWidth, srcHeight) {
        const dimensions = Dimensions.get('window');
        var newWidth, newHeight;
        if (dimensions.width > 1000) {
            newWidth = 1000 - 40;
        }
        else {
            newWidth = dimensions.width - 40;
        }

        var ratio = newWidth / srcWidth;
        newHeight = srcHeight * ratio;

        return {
            width: newWidth,
            height: newHeight,
        };
    }

    getSizeImage(pageNumber, propindex) {
        //console.log("getSizeImage", pageNumber, propindex);
        if (!this.state.images[pageNumber][propindex].url)
            return;

        this.state.images[this.state.pageNumber][propindex].calculatingSize = true;

        Image.getSize(this.state.images[pageNumber][propindex].url, (srcWidth, srcHeight) => {
            //console.log("srcWidth", srcWidth, "srcHeight", srcHeight);

            var customSize = this.getCustomSize(srcWidth, srcHeight);
            var newWidth = customSize.width;
            var newHeight = customSize.height;

            this.state.images[pageNumber][propindex].width = newWidth;
            this.state.images[pageNumber][propindex].height = newHeight;
            this.state.images[pageNumber][propindex].calculatedSize = true;
            this.state.images[pageNumber][propindex].realImageWidth = srcWidth;
            this.state.images[pageNumber][propindex].realImageHeight = srcHeight;

            //console.log("propindex", propindex);
            var idx = propindex.replace("index-", "");
            if (this.state.course.pages[this.state.pageNumber]) {
                var compId = this.state.course.pages[this.state.pageNumber].components[idx] && this.state.course.pages[this.state.pageNumber].components[idx].id;
                if (compId) {
                    var type = this.state.course.pages[this.state.pageNumber].components[idx].type;
                    this.setSizeImageByComponentId(compId, type, srcWidth, srcHeight);
                }

                this.state.images[pageNumber][propindex].calculatingSize = false;
                this.setState({ images: this.state.images });
            } else {
                console.log("getSizeImage after changing page")
                this.setState({ images: [] });
            }

        }, error => {
            this.state.images[pageNumber][propindex].calculatingSize = false;
            console.log('error:', error);
            console.log('this.state.images[pageNumber][propindex].url', this.state.images[pageNumber][propindex].url);
        });
    }

    setSizeImageByComponentId(id, type, width, height) {
        this.props.actions.academyActions.setSizeImageByComponentId(id, type, width, height).then((response) => {
            console.log("setSizeImageByComponentId", id, type, width, height);
        }, (error) => {
            console.log("ERROR!!!!!!!!. setSizeImageByComponentId", error);
        });
    }

    getImageHeightPercentage(imageSize, dimensions) {
        try {
            var perc = 100;
            if (dimensions.width > 500 && dimensions.width <= 800) {
                if (imageSize === 'small')
                    perc = 50;
                else if (imageSize === 'medium')
                    perc = 80;
            }
            else if (dimensions.width > 800) {
                if (imageSize === 'small')
                    perc = 33;
                else if (imageSize === 'medium')
                    perc = 66;
            }

            return perc;
        } catch {
            return 300;
        }
    }

    hasPermissionToEdit() {
        if (this.props.asWorkOrder) {
            //Only has permission if it's the creator
            var course = this.state.course;
            return (course && this.props.sessionData && course.creator.idUser == this.props.sessionData.idUser);
        } else return (this.props.roles.fliwer || (this.props.roles.angel && this.createdByMe()) || this.createdByMe());
    }

    isEditionMode() {
        if (this.props.asWorkOrder || this.props.asTemplate) {
            return this.props.isEditionMode
        }
        if (!this.hasPermissionToEdit()) {
            return false;
        }

        return this.state.isSwitchModeButtonInEditionModePosition;

    }

    newComponentPressed(component, findedIndex = null) {

        //console.log("component", component);

        if (component == 5) {
            var examFound = false;
            var index = 0;
            while (!examFound && index < this.state.course.pages.length) {
                examFound = this.state.course.pages[index].components.find((n) => {
                    return n.type == 4
                })
                if (!examFound)
                    index++;
            }

            if (examFound) {
                toast.error(this.props.actions.translate.get('Academy_exams_limit_1'))

            } else {
                this.setState({ visibleComponentModalADD: true, visibleModalAddComponentList: false, selectedNewComponent: component })
            }
        }
        else if (component == 11) {
            this.state.delimiterHeightFormNew = this.state.delimiterHeightDefaultValue;
            this.state.delimiterAddLineFormNew = this.state.delimiterAddLineDefaultValue;
            this.state.visibleModalAddComponentList = false;
            this.state.selectedNewComponent = component;
            this.addComponent();
        } else if (component == 12 || component == 13 || component == 14) {
            this.setState({ indexModifyComponent: findedIndex, videoMute: true, imageSize: 'medium', visibleModalAddComponentList: false, selectedNewComponent: component })
        }
        else {
            this.setState({ visibleComponentModalADD: true, videoMute: true, imageSize: 'medium', visibleModalAddComponentList: false, selectedNewComponent: component })
        }
    }

};


function mapStateToProps(state, props) {
    return {
        academyDataReducer: state.academyReducer.data,
        roles: state.sessionReducer.roles,
        newCourseReducer: state.academyReducer.newCourse,
        newCourseFilesReducer: state.academyReducer.files,
        sessionData: state.sessionReducer.dataLogin,
        isGardener: state.sessionReducer.isGardener,
        clientDataReducer: state.invoiceReducer.clientData,
        gardenerCheckidUser: state.sessionReducer.gardenerCheckidUser,
        backgroundUploadPendingFiles: state.backgroundUploadingReducer.pendingFiles,
        backgroundUserUploading: state.backgroundUploadingReducer.userUploading,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            translate: bindActionCreators(ActionsLang, dispatch),
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            invoiceActions: bindActionCreators(ActionInvoice, dispatch),
            backgroundUploadActions: bindActionCreators(ActionBackgroundUpload, dispatch)
        }
    }
}

var style = {
    correctButton: {
        width: 148,
        height: 33,
        marginBottom: 19
    },
    noneImageContainer:
    {
        width: "100%",
        height: 30,
        backgroundColor: FliwerColors.primary.green,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4
    },
    buttonImageIn: {
        width: 220,
        height: 220,
        backgroundColor: "white",
        borderRadius: 4
    },
    componentWrapper: {

    },
    editFormatComponent:
    {
        marginBottom: 10,
        paddingTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
        borderWidth: 1,
        backgroundColor: "#f5f3f0"
    },
    underLine: {
        height: 1,
        backgroundColor: FliwerColors.primary.black,
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center"
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        overflow: "hidden",
    },
    modalInNew: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        overflow: "hidden",
        width: "90%",
        maxWidth: 500,
        height: "auto",
        maxHeight: "80%"
    },
    addCourseButtonImage: {
        flex: 1,
        width: "47%",
        height: "47%"
    },
    addButtonTouch: {
        position: "absolute",
        bottom: 278,
        right: 18,
        backgroundColor: FliwerColors.secondary.green,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
    },
    deleteButtonTouch: {
        position: "absolute",
        bottom: 218,
        right: 18,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: FliwerColors.secondary.red,
        justifyContent: "center"
    },
    switchModeButton: {
        position: "absolute",
        bottom: 158,
        right: 18,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: "#FFCC66",
        backgroundColor: "orange",
        justifyContent: "center"
    },
    reloadButtonTouch: {
        position: "absolute",
        bottom: 98,
        right: 18,
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 45,
        borderColor: FliwerColors.secondary.white,
        backgroundColor: FliwerColors.parameters.soilm,
        justifyContent: "center"
    },
    switchModeButtonDownPosition: {
        //        bottom: 58 // Old
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: 329
    },
    imageCourse: {
        width: "100%",
        height: "100%"
    },
    imageCourseSectionTitle: {
        width: "100%",
        height: "100%",
    },
    noComponentsContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    titleFormatContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    textFormatContainer: {
        width: "100%",
        justifyContent: "center",
    },
    textFormat: {
        fontFamily: FliwerColors.fonts.regular,
        //        fontFamily: "Helvetica",
        //fontFamily: "Helvetica-400",
        //color: FliwerColors.primary.black
        fontSize: 15,
        color: "#565656",
        fontWeight: "500",
        fontStyle: "normal"
    },
    draggableView: {
        width: Platform.OS == "web" ? "50%" : "100%",
        alignItems: "center",
        justifyContent: "center",
        opacity: Platform.OS === "android" ? 0.6 : 1,
        borderWidth: 2,
        borderColor: "gray",
        borderStyle: "dashed",
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
        cursor: "pointer",
        alignSelf: "center"
    },
    textFormat2: {
        fontFamily: FliwerColors.fonts.regular,
        //        fontFamily: "Helvetica",
        //fontFamily: "Helvetica-400",
        //color: FliwerColors.primary.black
        fontSize: 15,
        color: CurrentTheme.primaryText,
        fontWeight: "500",
        fontStyle: "normal"
    },
    titleFormat: {
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        fontSize: 26,
        textAlign: "center",
    },
    fileInput: {
        display: "none" //display: "none" only works on web
    },
    locationContainer: {
        height: 35,
        paddingRight: 1,
        marginBottom: 3,
        borderRadius: 25,
        backgroundColor: FliwerColors.primary.green,
        flexDirection: "row",
        alignSelf: "center"
    },
    locationContainerModal: {
        height: 35,
        paddingRight: 1,
        marginBottom: 3,
        borderRadius: 25,
        backgroundColor: FliwerColors.primary.green,
        flexDirection: "row",
        alignSelf: "center"
    },
    leftContainerLocation: {
        width: 39,
        marginLeft: 1,
        marginTop: 1,
        borderBottomLeftRadius: 50,
        borderTopLeftRadius: 50,
        height: 33,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: "white",
    },
    rightContainerLocationModal: {
        //marginLeft:1,
        marginTop: 1,
        paddingRight: 6,
        paddingLeft: 6,
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        //flexGrow:1,
        height: 33,
        //alignItems: 'center',
        flexDirection: 'row',
        //justifyContent:'center',
        backgroundColor: "white",
        borderLeftWidth: 1,
        borderLeftColor: FliwerColors.primary.green,
        minWidth: 150,
        justifyContent: "center",
    },
    leftContainerLocationModal: {
        width: 39,
        marginLeft: 1,
        marginTop: 1,
        borderBottomLeftRadius: 50,
        borderTopLeftRadius: 50,
        height: 33,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: "white",
    },
    rightContainerLocation: {
        width: 40,
        marginLeft: 1,
        marginTop: 1,
        borderBottomRightRadius: 50,
        borderTopRightRadius: 50,
        height: 35,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        //backgroundColor:"white",
        backgroundColor: FliwerColors.primary.gray,
        overflow: "hidden"
    },
    centerContainerLocation: {
        marginTop: 1,
        paddingRight: 8,
        paddingLeft: 8,
        height: 35,
        flexDirection: 'row',
        backgroundColor: "white",
        borderLeftWidth: 1,
        borderLeftColor: FliwerColors.primary.green
    },
    getLocationTouchableModal: {
        backgroundColor: FliwerColors.primary.gray,
        borderRadius: 25,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: "center"
    },
    lineTextO: {
        fontSize: 15,
    },
    lineContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        marginBottom: 20
    },
    lineCenter: {
        backgroundColor: FliwerColors.secondary.gray,
        height: 1,
        width: "20%",
    },
    lineDelimiter: {
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    switchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        paddingTop: 10,
        paddingLeft: 45
    },
    switchTitle: {
        fontSize: 14
    },
    switchTitle1: {
        marginRight: 20
    },
    switchTitle2: {
        marginLeft: 20
    },
    switch: {
        transform: [{ scaleX: 1 }, { scaleY: 1 }]
    },
    videoWrapper: {
        width: "100%",
        alignSelf: "center"
    },
    imageSizeSelectorWrapper: {
        flex: 1,
        //        borderColor: "red", borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        margin: 5
    },
    imageSizeSelector: {
        alignItems: "center",
        justifyContent: "center",
        width: 50, height: 50, borderWidth: 1, borderColor: "gray", backgroundColor: "white", borderRadius: 4
    },
    imageSizeSelectorText: {
        fontFamily: FliwerColors.fonts.light, fontSize: 14, textAlign: "center", color: "black",
        marginTop: 5
    },
    videoSubTitle: {
        width: "100%", textAlign: "center", marginBottom: 20, fontSize: 16
    },
    exitButton: {

    },
    zoomImage: {
        width: 25,
        height: 25,
        marginLeft: 10,
        justifyContent: "center"
    },
    ":hover": {
        addButtonTouch: {
            backgroundColor: FliwerColors.secondary.green,
            backgroundColor: "#E8EE73"
        },
        deleteButtonTouch: {
            backgroundColor: "#FF8686"
        },
        switchModeButton: {
            backgroundColor: "#FFCC66"
        },
        getLocationTouchableModal: {
            filter: "brightness(110%)"
        },
        leftContainerGPS: {
            filter: "brightness(110%)"
        },
        centerContainerLocation: {
            filter: "contrast(50%)"
        },
        gpsIconTouchable: {
            filter: "contrast(50%)"
        }
    },
    "@media (platform:android)": {
        correctButton: {
            alignSelf: "center",
        }
    }


}

export default connect(mapStateToProps, mapDispatchToProps)(mediaConnect(style, AcademyCourses));
