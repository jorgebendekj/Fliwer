import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View, TextInput, Platform, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setPortraitScreen } from "../../../../actions/wrapperActions";
import TaskCard from "./TaskCard";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import { Redirect } from "../../../../utils/router/router";
import FilwerDivider from "../../../custom/FliwerDivider";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIoniconsIcons from 'react-native-vector-icons/Ionicons';
import { createTask } from "../../../../actions/academyActions";
import { toast } from "../../../../widgets/toast/toast";
import FrontLayerWrapper from "../../../frontLayerWrapper";
import Modal from "../../../../widgets/modal/modal";
import moment from "moment";
import { get } from "../../../../actions/languageActions";
import DynamicFilterModal from "../../../../widgets/filters/DynamicFilterModal";

const TasksList = ({ match, setRedirects, taskStatus }) => {

    const { orientation } = useMediaInfo();

    const dispatch = useDispatch();

    const tasks = useSelector(state => state.academyReducer.tasks);

    const [search, setSearch] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({});

    const handleCreateTask = async () => {
        if (!title.trim()) return toast.error("Debe ingresar un título.");
        const response = await dispatch(createTask({ title: title.trim() }));
        if (response?.id) {
            setModalVisible(false);
            setTitle("");
            hanldeRedirects(response.id);
        } else {
            toast.error("Error al crear la tarea.");
        }
    };

    const hanldeRedirects = (id) => {
        setRedirects([
            <Redirect to={`/app/tasks/details/${id}`} />
        ]);
        if (orientation !== "landscape") {
            dispatch(setPortraitScreen(2));
        }
    };

    const translator = (label) => {
        return dispatch(get(label))
    }

    const filteredTasks = useMemo(() => {
        const sorted = [...tasks].sort((a, b) => b.insertTime - a.insertTime);

        let filtered = sorted;

        Object.entries(filters).forEach(([property, value]) => {
            if (value === null || value === undefined) return;

            filtered = filtered.filter(task => {
                const propValue = task[property];

                if (Array.isArray(propValue) && typeof value === "string") {
                    return propValue.includes(value);
                }

                if (Array.isArray(propValue) && typeof value === "number") {
                    return propValue.some(item => item?.idUser === value);
                }

                return propValue === value;
            });
        });

        if (!search.trim()) return filtered;

        const term = search.toLowerCase();

        return filtered.filter(task =>
            task.title?.toLowerCase().includes(term) ||
            task.id?.toString().includes(term)
        );
    }, [tasks, search, filters]);

    const groupedTasksFlat = useMemo(() => {
        const groups = {};

        filteredTasks.forEach(task => {
            const date = moment.unix(task.insertTime).format("DD/MM/YYYY");
            if (!groups[date]) groups[date] = [];
            groups[date].push(task);
        });

        const result = [];

        Object.entries(groups)
            .sort((a, b) => moment(b[0], "DD/MM/YYYY").valueOf() - moment(a[0], "DD/MM/YYYY").valueOf())
            .forEach(([date, tasks]) => {
                result.push({ type: "header", date });
                tasks.forEach(task => result.push({ type: "task", task }));
            });

        return result;
    }, [filteredTasks]);

    const filterFields = useMemo(() => {
        const priorities = new Set();
        const statuses = new Set();
        const tags = new Set();
        const assignedUsers = new Map();

        tasks.forEach(task => {
            if (task.priority) priorities.add(task.priority);
            if (task.status) statuses.add(task.status);

            task.tags?.forEach(tag => tags.add(tag));

            task.assigned?.forEach(user => {
                if (user?.idUser && user?.name) {
                    assignedUsers.set(user.idUser, user.name);
                }
            });
        });

        return [
            {
                label: translator("Priority"),
                property: "priority",
                options: [{ label: translator("store_All"), value: null }, ...Array.from(priorities).map(p => ({ label: p, value: p }))]
            },
            {
                label: translator("Status"),
                property: "status",
                options: [{ label: translator("store_All"), value: null }, ...Array.from(statuses).map(s => ({ label: s, value: s }))]
            },
            {
                label: "Tags",
                property: "tags",
                options: [{ label: translator("store_All"), value: null }, ...Array.from(tags).map(tag => ({ label: tag, value: tag }))]
            },
            {
                label: translator("Academy_associated_workers"),
                property: "assigned",
                options: [{ label: translator("store_All"), value: null }, ...Array.from(assignedUsers.entries()).map(([id, name]) => ({
                    label: name,
                    value: id
                }))]
            }
        ];
    }, [tasks]);


    return (
        <View style={{ flex: 1, backgroundColor: CurrentTheme.primaryView }}>
            <FilwerDivider>
                <Text
                    style={{
                        padding: 10,
                        color: CurrentTheme.primaryText,
                        fontFamily: FliwerColors.fonts.title,
                        textAlign: "center",
                        fontSize: 18
                    }}
                >
                    Tasks{dispatch(get("General_tasks"))}
                </Text>
            </FilwerDivider>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginHorizontal: 20,
                    gap: 10
                }}
            >
                <TextInput
                    placeholder={dispatch(get("General_tasks"))}
                    value={search}
                    onChangeText={setSearch}
                    style={{
                        padding: Platform.OS === 'web' ? 10 : 8,
                        fontSize: 15,
                        backgroundColor: "white",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        flex: 1
                    }}
                />
                <IconIoniconsIcons
                    name="filter"
                    size={30}
                    color={CurrentTheme.cardText}
                    onPress={() => setFilterModalVisible(true)}
                />
            </View>
            <FlatList
                data={groupedTasksFlat}
                keyExtractor={(item, index) =>
                    item.type === "header" ? `header-${item.date}` : `task-${item.task.id}`
                }
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    if (item.type === "header") {
                        return (
                            <FilwerDivider>
                                <Text
                                    style={[styles.groupDate, { color: CurrentTheme.primaryText, fontFamily: FliwerColors.fonts.title }]}
                                >
                                    {item.date}
                                </Text>
                            </FilwerDivider>
                        );
                    }

                    return (
                        <TaskCard
                            item={item.task}
                            hanldeRedirects={() => hanldeRedirects(item.task.id)}
                            selectedTask={match.params?.idTask}
                            status={taskStatus[item.task.id]}
                        />
                    );
                }}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={{
                            borderRadius: 10,
                            padding: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: FliwerColors.secondary.white,
                            marginBottom: 10,
                            opacity: Platform.OS == "android" ? 0.6 : 0.4
                        }}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text key={987} style={{ fontSize: 70, color: "gray", fontFamily: FliwerColors.fonts.regular }}>+</Text>
                    </TouchableOpacity>
                }
            />
            {modalVisible && (
                <FrontLayerWrapper key="renderCreateTaskScreenModal">
                    <Modal
                        visible={modalVisible}
                        animationType="fade"
                        inStyle={styles.modalIn}
                        onClose={() => {
                            setModalVisible(false);
                            setTitle("");
                        }}
                    >
                        <View style={styles.modalView}>
                            <Text style={[styles.title, { fontFamily: FliwerColors.fonts.title }]}>{dispatch(get("Add_task"))}</Text>
                            <TextInput
                                placeholder={dispatch(get("Title"))}
                                value={title}
                                onChangeText={setTitle}
                                style={styles.inputSearch}
                            />
                            <TouchableOpacity
                                style={[styles.createButtonConfirm, { backgroundColor: CurrentTheme.cardColor }]}
                                onPress={handleCreateTask}
                            >
                                <Text style={[styles.createButtonText, { color: CurrentTheme.cardText }]}>{dispatch(get("confirm"))}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                                <Text style={{ color: "#007AFF" }}>{dispatch(get("general_cancel"))}</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            )}
            <DynamicFilterModal
                key={"renderFilterTaskScreenModal"}
                visible={filterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                fields={filterFields}
                values={filters}
                onChange={setFilters}
            />
        </View>
    );
};

export default TasksList;

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    createButton: {
        borderWidth: 2,
        borderColor: "gray",
        borderStyle: "dashed",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    createButtonText: {
        color: "gray",
        fontSize: 16,
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1,
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center",
    },
    title: {
        textAlign: "center",
        fontSize: 21,
        marginBottom: 10,
    },
    inputSearch: {
        height: 40,
        width: "100%",
        borderColor: "gray",
        borderWidth: 1,
        padding: 5,
        backgroundColor: "white",
        marginBottom: 10,
    },
    createButtonConfirm: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    groupDate: {
        textAlign: "center",
        fontSize: 18
    },

});
