import React, { useEffect, useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    FlatList,
    Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createTask, getTasks } from "../../../actions/academyActions";
import Modal from "../../../widgets/modal/modal";
import IconMaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { FliwerColors, CurrentTheme } from "../../../utils/FliwerColors";
import FrontLayerWrapper from "../../frontLayerWrapper";
import { toast } from "../../../widgets/toast/toast";
import { get } from "../../../actions/languageActions";

const TaskSelectorComponent = ({ onAccept, customStyles }) => {
    const dispatch = useDispatch();
    const tasks = useSelector((state) => state.academyReducer.tasks) || [];

    const [visible, setVisible] = useState(false);
    const [createMode, setCreate] = useState(false);
    const [search, setSearch] = useState("");
    const [title, setTitle] = useState("");

    useEffect(() => {
        if (visible) {
            dispatch(getTasks());
        }
    }, [visible]);

    const filteredTasks = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return tasks;
        return tasks.filter((t) =>
            `${t.id} ${t.title}`.toLowerCase().includes(term)
        );
    }, [tasks, search]);

    const extendedTaskList = ["__new__", ...filteredTasks];

    const handleSelect = (task) => {
        onAccept?.(task.id);
        setVisible(false);
    };

    const addNewTask = async (t) => {
        const response = await dispatch(createTask({ title: t }));
        if (response?.id) {
            onAccept(response.id)
            setTitle("");
            setCreate(false);
            setVisible(false);
        } else {
            toast.error("Error")
        }
    };

    const createTaskAndReturn = () => {
        if (!title.trim()) return toast.error("Debe ingresar un titulo.")
        addNewTask(title.trim());
    };

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.draggableView,
                    { backgroundColor: CurrentTheme.componentCardColor },
                    customStyles
                ]}
                onPress={() => {
                    setVisible(true);
                    setCreate(false);
                }}
            >
                <IconMaterialCommunityIcons
                    name="format-list-bulleted"
                    color={CurrentTheme.componentTextCardColor}
                    size={25}
                />
                <Text style={{ color: CurrentTheme.componentTextCardColor }}>
                    {dispatch(get("Select_task"))}
                </Text>
            </TouchableOpacity>

            {visible && (
                <FrontLayerWrapper key="renderSearchTaskModal">
                    <Modal
                        visible={visible}
                        animationType="fade"
                        inStyle={styles.modalIn}
                        onClose={() => {
                            setVisible(false);
                            setCreate(false);
                            setSearch("");
                        }}
                    >
                        <View style={styles.modalView}>
                            {!createMode && (
                                <>
                                    <Text style={styles.title}>{dispatch(get("Select_task"))}</Text>

                                    <TextInput
                                        placeholder={dispatch(get("General_search"))}
                                        value={search}
                                        onChangeText={setSearch}
                                        style={styles.inputSearch}
                                    />

                                    <FlatList
                                        data={extendedTaskList}
                                        keyExtractor={(item, index) =>
                                            item === "__new__" ? "__new__" : `${item.id}_${index}`
                                        }
                                        keyboardShouldPersistTaps="handled"
                                        style={{ maxHeight: 300, width: "100%" }}
                                        ListEmptyComponent={
                                            <Text style={styles.emptyText}>No se encontraron tareas</Text>
                                        }
                                        renderItem={({ item }) => {
                                            if (item === "__new__") {
                                                return (
                                                    <TouchableOpacity
                                                        style={[styles.taskItem, styles.newTaskItem]}
                                                        onPress={() => setCreate(true)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.taskText,
                                                                { fontStyle: "italic" },
                                                            ]}
                                                        >
                                                            + {dispatch(get("Add_task"))}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            }

                                            return (
                                                <TouchableOpacity
                                                    style={styles.taskItem}
                                                    onPress={() => handleSelect(item)}
                                                >
                                                    <Text style={styles.taskText}>
                                                        {item.id} - {item.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </>
                            )}

                            {createMode && (
                                <>
                                    <Text style={styles.title}>
                                        {dispatch(get("Add_task"))}
                                    </Text>

                                    <TextInput
                                        placeholder={dispatch(get("Title"))}
                                        value={title}
                                        onChangeText={setTitle}
                                        style={styles.inputSearch}
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.createButton,
                                            { backgroundColor: CurrentTheme.cardColor },
                                        ]}
                                        onPress={createTaskAndReturn}
                                    >
                                        <Text
                                            style={[
                                                styles.createButtonText,
                                                { color: CurrentTheme.cardText },
                                            ]}
                                        >
                                            {dispatch(get("confirm"))}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setCreate(false)}
                                        style={{ marginTop: 10 }}
                                    >
                                        <Text style={{ color: "#007AFF" }}>
                                            {dispatch(get("Back_list"))}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            )}
        </>
    );
};

export default TaskSelectorComponent;

const styles = StyleSheet.create({
    draggableView: {
        width: Platform.OS === "web" ? "50%" : "100%",
        alignItems: "center",
        justifyContent: "center",
        opacity: Platform.OS === "android" ? 0.6 : 1,
        borderWidth: 2,
        borderColor: "gray",
        borderStyle: "dashed",
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
        alignSelf: "center",
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
        fontFamily: FliwerColors.fonts.title,
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
    taskItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
        width: "100%",
    },
    newTaskItem: {
        backgroundColor: "#f8f8f8",
    },
    taskText: {
        fontSize: 16,
        color: "#333",
    },
    emptyText: {
        textAlign: "center",
        marginVertical: 10,
        color: "#999",
    },
    createButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    createButtonText: {
        fontSize: 16,
    },
});
