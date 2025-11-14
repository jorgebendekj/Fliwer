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
    PanResponder,
    Animated,
    Dimensions,
    FlatList
} = require('react-native');

import WorkOrderCard from './workOrderCard.js'
import CardCollection from '../../../components/custom/cardCollection.js'
import ImageBackground from '../../../components/imageBackground.js'
import FliwerUpdateAppModal from '../../../components/custom/FliwerUpdateAppModal.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { useMediaInfo, MediaInfo } from "../../../utils/mediaStyleSheet";

import * as Actions from '../../../actions/sessionActions.js'; //Import your actions
import * as ActionsLang from '../../../actions/languageActions.js'; //Import your actions
import * as ActionsHome from '../../../actions/fliwerHomeActions.js'; //Import your actions
import * as ActionsGarden from '../../../actions/fliwerGardenActions.js'; //Import your actions
import * as ActionsZone from '../../../actions/fliwerZoneActions.js'; //Import your actions
import * as ActionsCreateZone from '../../../actions/createZoneActions.js'; //Import your actions
import * as ActionsModifyZone from '../../../actions/modifyZoneActions.js'; //Import your actions
import * as ActionsDevice from '../../../actions/fliwerDeviceActions.js'; //Import your actions
import * as ActionGardener from '../../../actions/gardenerActions.js'; //Import your actions
import * as ActionVisitor from '../../../actions/visitorActions.js'; //Import your actions
import * as ActionAcademy from '../../../actions/academyActions.js'; //Import your actions
import * as ActionPoly from '../../../actions/polyActions.js';
import * as ActionInvoice from '../../../actions/invoiceActions.js';
import * as ActionsWrapper from '../../../actions/wrapperActions.js'; //Import your actions


import { toast } from '../../../widgets/toast/toast'
import ClientObjectModal from '../../../components/gardener/ClientObjectModal.js'
import { FliwerColors, CurrentTheme } from '../../../utils/FliwerColors'
import { FliwerCommonUtils } from '../../../utils/FliwerCommonUtils'


import { Redirect } from '../../../utils/router/router'
import moment from 'moment';
import { Divider } from 'react-native-elements';
import FilwerDivider from '../../custom/FliwerDivider.js';
import FrontLayerWrapper from '../../frontLayerWrapper.js';
import SearchWorkerModal from './SearchWorkerModal.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DynamicFilterModal from '../../../widgets/filters/DynamicFilterModal.js';
import IconIoniconsIcons from 'react-native-vector-icons/Ionicons';

class WorkOrderList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: this.props.allowRefreshGardenerHomes,
            alreadyAskingData: false,
            disablePreloading: false,
            refreshGardenerHomesInitializing: false,
            refreshGardenerHomesInitialized: !this.props.allowRefreshGardenerHomes,
            refreshing: false,
            idHome: null,
            goADDusers: false,
            modalVisible: false,
            modalClientObjectVisible: false,
            idUser: null,
            userInfo: null,
            pan: new Animated.ValueXY(),
            marginTopPan: new Animated.Value(0),
            marginBottomPan: new Animated.Value(0),
            mapVisible: false,
            isDeletingVisitor: false,
            allowShowVerifyPhoneModal: false,
            allowShowContractsModalWarning: false,
            petition: this.props.petition ? this.props.petition.id : null,
            hash: this.props.petition ? this.props.petition.hash : null,
            email: this.props.petition && this.props.petition.email ? this.props.petition.email : null,
            gotoInvitation: false,
            idInvitation: null,
            invitationErrorModalVisible: false,
            highlightedHomeId: null,
            gardenerHomesCanvasHeight: null,
            filterModalVisible: false,
            filters: {
                fromDate: null,
                toDate: null
            },
            versionCode: this.props.versionCode,
            versionName: this.props.versionName,
            forceUpdateApp: this.props.forceUpdateApp,
            lastCheckedVersionTime: this.props.lastCheckedVersionTime,
            updateAppModalVisible: false,

            searchModal: false,
            searchDate: null
        };

        if (this.props.preloadedData) {
            if (this.props.allowRefreshWorkOrders || this.props.asComponent) {
                this.props.actions.sessionActions.cleanGardenerUser().then(() => {
                    this.props.actions.sessionActions.cleanVisitorUser().then(() => {
                        this.props.actions.sessionActions.wrongData2().then(() => {
                            this.refreshWorkOrders();
                        });
                    });
                });
            }
            else
                this.checkGardenerHomesGenericInfo();
        }

        this._gardenerHomeADDList = {};

        // Reset Current index academy
        this.props.actions.academyActions.resetCurrentIndexAcademyCategory();

        if (Platform.OS != 'web' && Platform.OS != 'android') {
            var now = Math.floor(Date.now() / 1000);
            if (now > (this.state.lastCheckedVersionTime + 86400)) {
                // 86400 (1 day)
                this.props.actions.sessionActions.getVersion().then(() => {
                    this.state.versionCode = this.props.versionCode;
                    this.state.versionName = this.props.versionName;
                    this.state.forceUpdateApp = this.props.forceUpdateApp;
                    this.checkVersion();
                });
            }
        }
    }



    componentDidUpdate(prevProps) {

        if (this.props.preloadedData && !prevProps.preloadedData) {
            this.refreshWorkOrders();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        //console.log("shouldComponentUpdate nextProps", nextProps);
        return !this.state.disablePreloading;
    }

    checkVersion() {

        if (Platform.OS != 'android' && this.state.versionCode != null) {
            setTimeout(() => {
                var version = FliwerCommonUtils.getVersion();
                if (version != null && version < this.state.versionCode) {
                    this.setState({ updateAppModalVisible: true });
                }
            }, 200);
        }

    }

    renderUpdateAppModal() {

        if (!this.state.updateAppModalVisible)
            return null;

        return (
            <FliwerUpdateAppModal onClose={() => {
                this.setState({ updateAppModalVisible: false });
            }}
                forceUpdateApp={this.state.forceUpdateApp}
                versionCode={this.state.versionCode}
                versionName={this.state.versionName}
            />
        );
    }

    renderClientObjectModal() {
        if (!this.state.modalClientObjectVisible)
            return null;
        return (
            <ClientObjectModal
                visible={this.state.modalClientObjectVisible}
                onClose={() => { this.setState({ modalClientObjectVisible: false }) }}
                onLoading={(loading) => { this.setState({ loading: loading }) }}
                onConfirm={(client) => {
                    this.setState({ loading: true });
                    this.props.actions.invoiceActions.getClientInformation().then(() => {
                        this.setState({ loading: false, modalClientObjectVisible: false });
                    });
                }}
                idUser={this.state.idUser}
            />)
    }

    /*
     * Check if we must refresh gardener homes
     */
    checkGardenerHomesGenericInfo() {
        console.log("checkGardenerHomesGenericInfo...");
        this.props.actions.fliwerGardenerActions.getGardenerHomesGenericInfo().then((response) => {
            //console.log("checkGardenerHomesGenericInfo response", response);

            if (this.state.refreshGardenerHomesInitializing) {
                return;
            }

            var gardensOnCare = Object.values(this.props.gardensOnCare);
            if (gardensOnCare.length != response.length) {
                console.log("refreshGardenerHomes by checkGardenerHomesGenericInfo");
                this.refreshGardenerHomes(true, true);
                return;
            }

            if (gardensOnCare.length == 0 && response.length == 0) {
                return;
            }

            gardensOnCare.sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                } else if (a.id > b.id) {
                    return 1;
                } else {
                    return 0;
                }
            });

            response.sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                } else if (a.id > b.id) {
                    return 1;
                } else {
                    return 0;
                }
            });

            var genericInfo1, genericInfo2;
            var anyDiff = false;
            for (var i = 0; i < gardensOnCare.length; i++) {
                genericInfo1 = gardensOnCare[i].genericInfo;
                genericInfo2 = response[i].genericInfo;

                if (genericInfo1.advices != genericInfo2.advices) {
                    console.log("Diff -> advices", genericInfo1.advices, genericInfo2.advices);
                    anyDiff = true;
                    break;
                }

                if (genericInfo1.alerts != genericInfo2.alerts) {
                    console.log("Diff -> alerts", genericInfo1.alerts, genericInfo2.alerts);
                    anyDiff = true;
                    break;
                }

                if (genericInfo1.zones != genericInfo2.zones) {
                    console.log("Diff -> zones", genericInfo1.zones, genericInfo2.zones);
                    anyDiff = true;
                    break;
                }
            }

            if (true || anyDiff) {
                console.log("refreshGardenerHomes by checkGardenerHomesGenericInfo");
                this.refreshGardenerHomes(true, true);
                return;
            }

        });
    }

    refreshWorkOrders() {
        if (this.state.alreadyAskingData) return;

        this.setState({ loading: true, alreadyAskingData: true });
        this.props.actions.academyActions.getWorkOrders().then((response) => {
            this.setState({ loading: false, alreadyAskingData: false });
        });
    }

    renderSearchModal() {
        if (this.state.searchModal && this.state.searchDate !== null) {
            return (
                <FrontLayerWrapper key="renderSearchWorkerOrder">
                    <SearchWorkerModal
                        visible={this.state.searchModal}
                        onClose={() => this.setState({ searchModal: false, searchDate: null })}
                        onSelect={async (idUser) => {
                            try {
                                const response = await this.props.actions.academyActions.addWorkOrder({
                                    idUser: idUser,
                                    datetime: this.state.searchDate
                                });
                                this.setState({ goADDWorkOrder: response.id, searchModal: false, searchDate: null });
                            } catch (err) {
                                this.setState({ searchModal: false, searchDate: null })
                                toast.error(err.reason);
                            }
                        }}
                    />
                </FrontLayerWrapper>
            );
        } else return [];
    }

    getFilterFields() {
        const usersMap = new Map();

        Object.values(this.props.workOrders).forEach(order => {
            if (order.user && order.user.idUser) {
                const fullName = `${order.user.first_name} ${order.user.last_name}`;
                usersMap.set(order.user.idUser, fullName);
            }
        });

        const userOptions = [{ label: "Todos", value: null }].concat(
            Array.from(usersMap.entries()).map(([id, name]) => ({
                label: name,
                value: id
            }))
        );

        return [
            /* {
                label: "Desde",
                property: "fromDate",
                type: "date"
            },
            {
                label: "Hasta",
                property: "toDate",
                type: "date"
            }, */
            {
                label: "Responsable",
                property: "assigned",
                type: "dropdown",
                options: userOptions
            }
        ];
    }

    render() {

        var indents = [];

        if (this.state.goADDWorkOrder) {
            indents.push(<Redirect push to={"/app/workOrder/in/" + this.state.goADDWorkOrder} />)
            this.state.goADDWorkOrder = false;
            if (MediaInfo.orientation != "landscape") {
                this.props.actions.wrapperActions.setPortraitScreen(2);
            }
        }

        var loading = this.state.loading || this.state.refreshing;

        indents.push(
            <ImageBackground style={{ backgroundColor: CurrentTheme.secondaryColor }} loading={loading}>

                <View style={{ flexDirection: "row", flex: 1, backgroundColor: CurrentTheme.primaryView }} >

                    <View
                        style={[{ width: "100%", flex: 1 }]}
                        onLayout={(e) => {
                            this.state.gardenerHomesCanvasHeight = e.nativeEvent.layout.height;
                        }}
                    >
                        <ScrollView
                            ref={(s) => {
                                this._scrollView = s;
                            }} scrollEventThrottle={1000}
                            style={{ flex: 1 }}
                            onScroll={({ nativeEvent }) => {
                                //this.state.lastScrollContentY = nativeEvent.contentOffset.y;
                            }}
                            refreshControl={< RefreshControl refreshing={this.state.refreshing} onRefresh={() => {
                                this.refreshWorkOrders()
                            }} />}>
                            {true
                                ?
                                <FilwerDivider
                                    styles={{
                                        gap: 20
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: CurrentTheme.primaryText,
                                            fontFamily: FliwerColors.fonts.title,
                                            textAlign: "center",
                                            fontSize: 18
                                        }}
                                    >
                                        {this.props.actions.translate.get('Academy_work_order').toUpperCase()}
                                    </Text>
                                    <IconIoniconsIcons
                                        name="filter"
                                        size={30}
                                        color={CurrentTheme.cardText}
                                        onPress={() => this.setState({ filterModalVisible: true })}
                                    />
                                </FilwerDivider>
                                : null}
                            <CardCollection style={{ marginBottom: 85 }}>

                                {this.renderWorkOrdersFlatList()}
                                {this.renderSearchModal()}
                            </CardCollection>
                        </ScrollView>
                    </View>
                    <DynamicFilterModal
                        key={"renderFilterWorkOrderListScreenModal"}
                        visible={this.state.filterModalVisible}
                        onClose={() => this.setState({ filterModalVisible: false })}
                        fields={this.getFilterFields()}
                        values={this.state.filters}
                        onChange={(value) => this.setState({ filters: value })}
                    />
                </View>



            </ImageBackground>
        );

        return indents;

    }

    renderWorkOrdersFlatList() {
        var workOrders = Object.values(this.props.workOrders);

        const { filters } = this.state;

        if (filters) {
            workOrders = workOrders.filter(order => {
                const orderDate = moment.unix(order.createTime);
                let pass = true;

                if (filters.fromDate) {
                    const fromDate = moment.unix(filters.fromDate).startOf("day");
                    if (orderDate.isBefore(fromDate)) {
                        pass = false;
                    }
                }
                if (filters.toDate) {
                    const toDate = moment.unix(filters.toDate).endOf("day");
                    if (orderDate.isAfter(toDate)) {
                        pass = false;
                    }
                }
                if (filters.assigned) {
                    if (!order.user || order.user.idUser !== filters.assigned) {
                        pass = false;
                    }
                }
                return pass;
            });
        }

        workOrders.sort((a, b) => b.createTime - a.createTime);

        const mostRecentId = workOrders.length ? workOrders[0].id : null;

        // Build a new array with header + items
        const dataWithHeaders = [];

        let previousDay = null;
        const todayFormatted = moment().locale('es').format('dddd DD/MM/YYYY');
        let hasToday = false;

        for (let workOrder of workOrders) {
            const currentDay = moment
                .unix(workOrder.createTime)
                .locale('es')
                .format('dddd DD/MM/YYYY');

            const isToday = moment.unix(workOrder.createTime).isSame(moment(), 'day');
            if (isToday) hasToday = true;

            const isMostRecent = workOrder.id === mostRecentId;
            const currentDayCapitalized = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);

            if (currentDay !== previousDay) {
                // Obtener máximo timestamp del día actual
                const sameDayOrders = workOrders.filter(w =>
                    moment.unix(w.createTime).locale('es').format('dddd DD/MM/YYYY') === currentDay
                );
                const maxTimestamp = Math.max(...sameDayOrders.map(w => w.createTime));

                dataWithHeaders.push({
                    type: 'header',
                    id: `header-${workOrder.id}`,
                    day: currentDayCapitalized,
                    timestamp: maxTimestamp + 1
                });
                previousDay = currentDay;
            }

            dataWithHeaders.push({
                type: 'item',
                id: workOrder.id,
                workOrder: workOrder,
                isToday,
                isMostRecent
            });
        }

        // Si no hay órdenes de hoy, agregar header + mensaje vacío
        if (!hasToday) {
            const todayCapitalized = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

            dataWithHeaders.unshift({
                type: 'header',
                id: 'header-today',
                day: todayCapitalized,
                timestamp: moment().unix()
            });

            dataWithHeaders.splice(1, 0, {
                type: 'empty',
                id: 'empty-today'
            });
        }

        return (
            <FlatList
                data={dataWithHeaders}
                keyExtractor={(item, index) => item.id?.toString() || `add-${index}`}
                renderItem={({ item }) => {

                    if (item.type === 'empty') {
                        return (
                            <View key="empty-today" style={{ alignItems: 'center', padding: 10 }}>
                                <Text style={{ color: CurrentTheme.secondaryText, fontSize: 14 }}>
                                    {this.props.actions.translate.get('Academy_no_work_orders')}
                                </Text>
                            </View>
                        );
                    }

                    if (item.type === 'header') {
                        return (
                            <View
                                key={item.id}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginHorizontal: 10,
                                    paddingVertical: 5
                                }}
                            >
                                <Text
                                    style={{
                                        color: CurrentTheme.primaryText,
                                        fontSize: 16
                                    }}
                                >
                                    {item.day}
                                </Text>
                                <TouchableOpacity
                                    onPress={async () => {
                                        try {
                                            if (this.props?.employees?.length > 0) {
                                                this.setState({
                                                    searchModal: true,
                                                    searchDate: item.timestamp
                                                })
                                            } else {
                                                const response = await this.props.actions.academyActions.addWorkOrder({
                                                    idUser: null,
                                                    datetime: item.timestamp
                                                });
                                                this.setState({ goADDWorkOrder: response.id });
                                            }
                                        } catch (err) {
                                            toast.error(err.reason);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name="add-outline"
                                        size={30}
                                        color={CurrentTheme.primaryText}
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    if (item.type === 'item') {
                        return (
                            <View key={`templateCard${item.workOrder.id}`} style={{ alignItems: 'center' }}>
                                <WorkOrderCard
                                    key={`template${item.workOrder.id}`}
                                    course={item.workOrder}
                                    onLoading={(loading) => this.setState({ loading })}
                                    gotoCourse={(id) => this.setState({ goADDWorkOrder: id })}
                                    deletingItem={this.props?.deletingItem}
                                    enDeleteItem={this.props.enDeleteItem}
                                    match={this.props.match}
                                    isToday={item.isToday}
                                    isMostRecent={item.isMostRecent}
                                />
                            </View>
                        );
                    }

                    return null;
                }}
            />
        );
    }

    setLoading() {
        var that = this;
        return (loading) => {
            that.setState({ loading: loading });
        };
    }


};


// The function takes data from the app current state,
// and insert/links it into the props of our component.
// This function makes Redux know that this component needs to be passed a piece of the state
function mapStateToProps(state, props) {
    return {
        data: state.sessionReducer.data,
        preloadedData: state.sessionReducer.preloadedData,
        language: state.languageReducer.language,
        translation: state.languageReducer.translation,
        workOrders: state.academyReducer.workOrders,

        gardensOnCare: state.gardenerReducer.gardenerHomes,
        usersListData: state.gardenerReducer.usersListData,
        allowRefreshGardenerHomes: state.gardenerReducer.allowRefreshGardenerHomes,
        gardenerVisitorHomes: state.gardenerReducer.gardenerVisitorHomes,
        gardenerVisitorUsers: state.gardenerReducer.gardenerVisitorUsers,
        visitorsListData: state.visitorReducer.usersListData,
        visitorHomeList: state.visitorReducer.visitorHomes,
        isGardener: state.sessionReducer.isGardener,
        isVisitor: state.sessionReducer.isVisitor,
        phoneVerificationIsCancelled: state.sessionReducer.phoneVerificationIsCancelled,
        petition: state.sessionReducer.petition,
        versionCode: state.sessionReducer.versionCode,
        versionName: state.sessionReducer.versionName,
        forceUpdateApp: state.sessionReducer.forceUpdateApp,
        checkedVersion: state.sessionReducer.checkedVersion,
        lastCheckedVersionTime: state.sessionReducer.lastCheckedVersionTime,
        checkGardeneridHome: state.sessionReducer.gardenerCheckidHome,
        invitationChecked: state.academyReducer.invitationChecked,
        homeData: state.fliwerHomeReducer.data,
        loadingData: state.gardenerReducer.loadingData,
        wallet: state.sessionReducer.wallet,
        employees: state.sessionReducer.employees
    };
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
            fliwerDeviceActions: bindActionCreators(ActionsDevice, dispatch),
            createZoneActions: bindActionCreators(ActionsCreateZone, dispatch),
            modifyZoneActions: bindActionCreators(ActionsModifyZone, dispatch),
            fliwerGardenerActions: bindActionCreators(ActionGardener, dispatch),
            fliwerVisitorActions: bindActionCreators(ActionVisitor, dispatch),
            academyActions: bindActionCreators(ActionAcademy, dispatch),
            invoiceActions: bindActionCreators(ActionInvoice, dispatch),
            polyActions: bindActionCreators(ActionPoly, dispatch),
            wrapperActions: bindActionCreators(ActionsWrapper, dispatch),
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(WorkOrderList); 
