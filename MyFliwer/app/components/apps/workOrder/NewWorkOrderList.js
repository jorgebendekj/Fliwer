import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import DynamicFilterModal from "../../../widgets/filters/DynamicFilterModal";
import { View } from "react-native";
import FilwerDivider from "../../custom/FliwerDivider";
import { Text } from "react-native";
import IconIoniconsIcons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import { CurrentTheme, FliwerColors } from "../../../utils/FliwerColors";
import { get } from "../../../actions/languageActions";
import WorkOrderCard from "./workOrderCard";
import { addWorkOrder, getWorkOrders } from "../../../actions/academyActions";
import moment from "moment";
import { toast } from "../../../widgets/toast/toast";
import SearchWorkerModal from "./SearchWorkerModal";
import FrontLayerWrapper from "../../frontLayerWrapper";
import FliwerLoading from "../../fliwerLoading";

const NewWorkOrderList = ({ match, goNewWorkOrder }) => {

    const dispatch = useDispatch();

    const workOrdersState = useSelector(state => state.academyReducer.workOrders);
    const employees = useSelector(state => state.sessionReducer.employees) || [];

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [searchDate, setSearchDate] = useState(null);
    const [filters, setFilters] = useState({
        fromDate: null,
        toDate: null
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [goADDWorkOrder, setGoADDWorkOrder] = useState(null);
    const [redirects, setRedirects] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const PAGE_SIZE = 10;

    const getFilterFields = (workOrders) => {
        const usersMap = new Map();

        Object.values(workOrders).forEach(order => {
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
            /*             {
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
    };


    const paginatedDataWithHeaders = useMemo(() => {
        let workOrders = workOrdersState ? Object.values(workOrdersState) : [];

        if (filters) {
            workOrders = workOrders.filter(order => {
                const orderDate = moment.unix(order.createTime);
                let pass = true;
                if (filters.fromDate) {
                    const fromDate = moment.unix(filters.fromDate).startOf("day");
                    if (orderDate.isBefore(fromDate)) pass = false;
                }
                if (filters.toDate) {
                    const toDate = moment.unix(filters.toDate).endOf("day");
                    if (orderDate.isAfter(toDate)) pass = false;
                }
                if (filters.assigned) {
                    if (!order.user || order.user.idUser !== filters.assigned) pass = false;
                }
                return pass;
            });
        }

        workOrders.sort((a, b) => b.createTime - a.createTime);
        const mostRecentId = workOrders.length ? workOrders[0].id : null;
        const limitedWorkOrders = workOrders.slice(0, visibleCount);

        const data = [];
        let previousDay = null;
        const todayFormatted = moment().locale('es').format('dddd DD/MM/YYYY');
        let hasToday = false;

        for (let workOrder of limitedWorkOrders) {
            const currentDay = moment.unix(workOrder.createTime).locale("es").format("dddd DD/MM/YYYY");
            const isToday = moment.unix(workOrder.createTime).isSame(moment(), "day");
            if (isToday) hasToday = true;

            const isMostRecent = workOrder.id === mostRecentId;
            const currentDayCapitalized = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);

            if (currentDay !== previousDay) {
                const sameDayOrders = limitedWorkOrders.filter(w =>
                    moment.unix(w.createTime).locale('es').format('dddd DD/MM/YYYY') === currentDay
                );
                const maxTimestamp = Math.max(...sameDayOrders.map(w => w.createTime));

                data.push({
                    type: "header",
                    id: `header-${workOrder.id}`,
                    day: currentDayCapitalized,
                    timestamp: maxTimestamp + 1,
                });
                previousDay = currentDay;
            }

            data.push({
                type: "item",
                id: workOrder.id,
                workOrder,
                isToday,
                isMostRecent,
            });
        }

        if (!hasToday) {
            const todayCapitalized = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);
            data.unshift({
                type: "header",
                id: "header-today",
                day: todayCapitalized,
                timestamp: moment().unix(),
            });
            data.splice(1, 0, { type: "empty", id: "empty-today" });
        }

        return data;
    }, [workOrdersState, filters, visibleCount]);

    const filterFields = useMemo(() => {
        return getFilterFields(workOrdersState || {});
    }, [workOrdersState]);

    const renderWorkOrdersFlatList = () => (
        <FlatList
            data={paginatedDataWithHeaders}
            keyExtractor={(item, index) => item.id?.toString() || `key-${index}`}
            onEndReachedThreshold={0.5}
            onEndReached={() => setVisibleCount(prev => prev + PAGE_SIZE)}
            renderItem={({ item }) => {
                if (item.type === "empty") {
                    return (
                        <View style={{ alignItems: "center", padding: 10 }}>
                            <Text style={{ color: CurrentTheme.secondaryText, fontSize: 14 }}>
                                {dispatch(get("Academy_no_work_orders"))}
                            </Text>
                        </View>
                    );
                }

                if (item.type === "header") {
                    return (
                        <View
                            key={item.id}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginHorizontal: 10,
                                paddingVertical: 5,
                            }}
                        >
                            <Text style={{ color: CurrentTheme.primaryText, fontSize: 16 }}>
                                {item.day}
                            </Text>
                            <TouchableOpacity
                                onPress={async () => {
                                    try {
                                        if (employees?.length > 0) {
                                            setSearchModalVisible(true);
                                            setSearchDate(item.timestamp);
                                        } else {
                                            const response = await dispatch(addWorkOrder({
                                                idUser: null,
                                                datetime: item.timestamp
                                            }));
                                            setGoADDWorkOrder(response.id);
                                        }
                                    } catch (err) {
                                        toast.error(err.reason);
                                    }
                                }}
                            >
                                <IconIoniconsIcons name="add-outline" size={28} color={CurrentTheme.primaryText} />
                            </TouchableOpacity>
                        </View>
                    );
                }

                if (item.type === "item") {
                    return (
                        <View key={`templateCard${item.workOrder.id}`} style={{ alignItems: "center" }}>
                            <WorkOrderCard
                                key={`template${item.workOrder.id}`}
                                course={item.workOrder}
                                onLoading={(loading) => setLoading(loading)}
                                gotoCourse={(id) => setGoADDWorkOrder(id)}
                                match={match}
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

    useEffect(() => {
        dispatch(getWorkOrders());
    }, []);

    useEffect(() => {
        if (redirects.length > 0) {
            const timeout = setTimeout(() => setRedirects([]), 0);
            return () => clearTimeout(timeout);
        }
    }, [redirects]);

    useEffect(() => {
        if (goADDWorkOrder) {
            goNewWorkOrder(goADDWorkOrder)
        }
    }, [goADDWorkOrder]);

    if (!workOrdersState) {
        return (
            <View style={[{ flex: 1, zIndex: 9995 }]}>
                <FliwerLoading style={{ zIndex: 999999 }} />
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: CurrentTheme.primaryView }}>
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
                    {dispatch(get('Academy_work_order')).toUpperCase()}
                </Text>
                <IconIoniconsIcons
                    name="filter"
                    size={30}
                    color={CurrentTheme.cardText}
                    onPress={() => setModalVisible(true)}
                />
            </FilwerDivider>

            {renderWorkOrdersFlatList()}

            <DynamicFilterModal
                key={"renderFilterTaskScreenModal"}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                fields={filterFields}
                values={filters}
                onChange={setFilters}
            />

            {searchModalVisible && (
                <FrontLayerWrapper key="renderSearchWorkerOrder">
                    <SearchWorkerModal
                        visible={searchModalVisible}
                        onClose={() => {
                            setSearchDate(null)
                            setSearchModalVisible(false)
                        }}
                        onSelect={async (idUser) => {
                            try {
                                const response = await dispatch(addWorkOrder({
                                    idUser: idUser,
                                    datetime: searchDate
                                }));
                                setSearchDate(null)
                                setSearchModalVisible(false)
                                setGoADDWorkOrder(response.id)
                            } catch (err) {
                                setSearchDate(null)
                                setSearchModalVisible(false)
                                toast.error(err.reason);
                            }
                        }}
                    />
                </FrontLayerWrapper>
            )}
        </View>
    );
};


export default NewWorkOrderList;