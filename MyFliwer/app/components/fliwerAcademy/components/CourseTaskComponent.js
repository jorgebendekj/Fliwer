import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
    ActivityIndicator,
} from "react-native";
import dayjs from "dayjs";
import { CurrentTheme } from "../../../utils/FliwerColors";
import Dropdown from "../../../widgets/dropdown/dropdown";
import FliwerButtonDateTimePicker from "../../custom/FliwerButtonDateTimePicker";
import moment from "moment";
import TaskUsersSelector from "./TaskUsersSelector";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { editTask, getTask } from "../../../actions/academyActions";
import { get } from "../../../actions/languageActions";
import { toast } from "../../../widgets/toast/toast";
import IconMaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import TaskSelectorModal from "./TaskSelectorModal";
import { useMediaInfo } from "../../../utils/mediaStyleSheet";

const PRIORITY_OPTIONS = [
    {
        name: "very low",
        color: "#0084ff"
    },
    {
        name: "low",
        color: "#a3ff82",
        darkText: true
    },
    {
        name: "normal",
        color: "#ffcc00"
    },
    {
        name: "high",
        color: "#ff9000"
    },
    {
        name: "very high",
        color: "#ff0000"
    },
    {
        name: "urgent",
        color: "#000000"
    }
];
const STATUS_OPTIONS = [
    {
        name: "pending",
        color: "#ff9000"
    },
    {
        name: "in progress",
        color: "#224470"
    },
    {
        name: "paused",
        color: "#797979"
    },
    {
        name: "finished",
        color: "#a3ff82",
        darkText: true
    }
];

const IMMEDIATE_FIELDS = new Set([
    "priority",
    "status",
    "estimatedStartTime",
    "estimatedEndTime",
    "startTime",
    "endTime",
]);

const DEBOUNCE_FIELDS = new Set([
    "title",
    "description",
    "solution",
    "tags",
    "clients",
    "assigned",
    "estimatedHours",
    "estimatedMinutes",
    "realHours",
    "realMinutes",
]);

const CourseTaskComponent = ({
    customStyles,
    idTask,
    onAccept,
    setTaskStatus
}) => {

    const dispatch = useDispatch();
    const { orientation } = useMediaInfo();

    const isMobile = orientation === "portrait";

    const task = useSelector((state) => {
        const list = state.academyReducer.tasks || [];
        return list.find(t => t.id == idTask) || null;
    });
    const sessionReducer = useSelector(state => state.sessionReducer);

    const textareaRef = useRef(null);
    const textareaRef2 = useRef(null);

    useEffect(() => {
        dispatch(getTask(idTask))
    }, [])

    const [form, setForm] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [canEditAll, setCanEditAll] = useState(false);
    const [selectorVisible, setSelectorVisible] = useState(false);

    const translator = (label) => {
        return dispatch(get(label))
    }

    const saveField = async (field, value) => {
        if (field === "title" && !value) return;

        let finalValue = value;

        if (
            ["startTime", "endTime", "estimatedStartTime", "estimatedEndTime"].includes(field) &&
            value instanceof Date
        ) {
            finalValue = value.getTime() / 1000;
        }

        setTaskStatus(prev => ({ ...prev, [idTask]: "saving" }));

        const res = await dispatch(editTask({ [field]: finalValue }, idTask));

        if (res?.ok) {
            //toast.notification(dispatch(get('Academy_your_work_is_safe')));
            setTimeout(() => {
                setTaskStatus(prev => ({ ...prev, [idTask]: "saved" }));
            }, 1500);
        } else {
            setTimeout(() => {
                setTaskStatus(prev => ({ ...prev, [idTask]: "error" }));
            }, 1500);
        }
    };


    const debouncedSave = useRef(
        _.debounce((field, value) => {
            saveField(field, value);
        }, 1000)
    ).current;

    const handleFieldChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));

        if (IMMEDIATE_FIELDS.has(field)) {
            // guarda al instante
            saveField(field, value);
        } else if (DEBOUNCE_FIELDS.has(field)) {
            // espera 1 s de inactividad
            debouncedSave(field, value);
        }
    };

    const handleTagRemove = (tagToRemove) => {
        const nextTags = form.tags.filter(tag => tag !== tagToRemove);
        handleFieldChange("tags", nextTags);
    };


    const renderRow = (label, right) => (
        <View
            style={[
                styles.row,
                isMobile && {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    width: "100%",
                    gap: 10
                }
            ]}
        >
            {label && <Text style={[styles.label, { color: CurrentTheme.componentTextCardColor }]}>{label}</Text>}
            <View
                style={[
                    styles.field,
                    isMobile && {
                        width: "100%"
                    }
                ]}
            >
                {right}

            </View>
        </View>
    );
    useEffect(() => {
        dispatch(getTask(idTask));
    }, [idTask]);

    useEffect(() => {
        if (task && task.id == idTask) {
            const userId = sessionReducer?.data?.user_id;
            const hasFullAccess =
                userId == task.idUserBusiness ||
                userId == task.idUserCreator;
            setCanEditAll(hasFullAccess);
            setForm({
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                estimatedHours: task.estimatedHours !== null ? String(task.estimatedHours) : null,
                estimatedMinutes: task.estimatedMinutes !== null ? String(task.estimatedMinutes) : null,
                estimatedStartTime: task.estimatedStartTime ? new Date(task.estimatedStartTime * 1000) : null,
                estimatedEndTime: task.estimatedEndTime ? new Date(task.estimatedEndTime * 1000) : null,
                startTime: task.startTime ? new Date(task.startTime * 1000) : null,
                endTime: task.endTime ? new Date(task.endTime * 1000) : null,
                solution: task.solution || '',
                tags: task.tags || [],
                clients: task.clients.map(c => c.idUser),
                assigned: task.assigned.map(e => e.idUser),
                realHours: task.realHours !== null ? String(task.realHours) : null,
                realMinutes: task.realMinutes !== null ? String(task.realMinutes) : null,
                realClients: task.clients,
                realAssigned: task.assigned
            });
        }
    }, [task, idTask, sessionReducer]);

    if (!form) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: CurrentTheme.componentCardColor },
                customStyles
            ]}
        >
            <View
                style={[
                    styles.rowLine,
                    { gap: 5 },
                    isMobile && {
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }
                ]}
            >
                <View
                    style={{ flex: 1, alignItems: "center", flexDirection: "row", gap: 5 }}
                >
                    {
                        onAccept
                            ?
                            <TouchableOpacity onPress={() => setSelectorVisible(true)}>
                                <IconMaterialCommunityIcons name="pencil" size={20} color="#333" />
                            </TouchableOpacity>
                            :
                            null
                    }
                    <TextInput
                        style={[styles.textInput, { flex: 1 }]}
                        placeholder=""
                        value={form.title}
                        onChangeText={v => handleFieldChange("title", v)}
                        editable={canEditAll}
                    />
                </View>
                <View
                    style={[
                        {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 5
                        },
                        isMobile && {
                            width: "100%",
                            marginTop: 10
                        }
                    ]}
                >
                    <View
                        style={[
                            styles.selectorsCointainer,
                            isMobile && {
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }
                        ]}
                    >
                        <Text style={[styles.dropdownLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("Priority")}</Text>
                        <Dropdown
                            modal={true}
                            filterEnabled={true}
                            placeholder={translator("Priority")}
                            selectedValue={form.priority}
                            style={styles.select}
                            styleOptions={{}}
                            options={PRIORITY_OPTIONS.map(opt => ({ label: opt.name, value: opt.name }))}
                            onChange={(value) => handleFieldChange("priority", value)}
                            customRender={
                                <View
                                    style={{
                                        borderRadius: 20,
                                        backgroundColor: PRIORITY_OPTIONS.find(opt => opt.name == form.priority)?.color || "white",
                                        paddingHorizontal: 20,
                                        paddingVertical: 5
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: PRIORITY_OPTIONS.find(opt => opt.name == form.priority)?.darkText ? "black" : "white"
                                        }}
                                    >
                                        {form.priority || "Seleccione"}
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                    <View
                        style={[
                            styles.selectorsCointainer,
                            isMobile && {
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }
                        ]}
                    >
                        <Text style={[styles.dropdownLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("Status")}</Text>
                        <Dropdown
                            modal={true}
                            filterEnabled={true}
                            placeholder={translator("Status")}
                            selectedValue={form.status}
                            style={styles.select}
                            styleOptions={{}}
                            options={STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.name }))}
                            onChange={(value) => handleFieldChange("status", value)}
                            customRender={
                                <View
                                    style={{
                                        borderRadius: 20,
                                        backgroundColor: STATUS_OPTIONS.find(opt => opt.name == form.status)?.color || "white",
                                        paddingHorizontal: 20,
                                        paddingVertical: 5
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: STATUS_OPTIONS.find(opt => opt.name == form.status)?.darkText ? "black" : "white"
                                        }}
                                    >
                                        {form.status || "Seleccione"}
                                    </Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </View>

            {renderRow(
                translator("Academy_description"),
                Platform.OS === 'web' ? (
                    <textarea
                        ref={(ref) => {
                            if (ref) {
                                textareaRef.current = ref;
                                ref.style.height = 'auto';
                                ref.style.height = `${ref.scrollHeight}px`;
                            }
                        }}
                        placeholder={translator("Academy_description") + ".."}
                        value={form.description}
                        readOnly={!canEditAll}
                        onChange={(e) => {
                            const text = e.target.value;
                            handleFieldChange("description", text);

                            if (textareaRef.current) {
                                textareaRef.current.style.height = 'auto';
                                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                            }
                        }}
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
                            opacity: Platform.OS === "android" ? 0.6 : 1,
                            maxHeight: 300
                        }}
                    />
                ) : (
                    <TextInput
                        multiline
                        numberOfLines={3}
                        placeholder={translator("Academy_description") + ".."}
                        value={form.description}
                        onChangeText={(text) => {
                            handleFieldChange("description", text);
                        }}
                        editable={canEditAll}
                        placeholderTextColor={CurrentTheme.primaryColor}
                        style={[
                            styles.textInput,
                            styles.multiInput,
                            {
                                color: "black",
                                backgroundColor: "white",
                                padding: 12,
                                opacity: Platform.OS === "android" ? 0.6 : 1
                            }
                        ]}
                    />
                )
            )}

            {renderRow(
                "Tags",
                <View style={[styles.tagInputWrapper, { backgroundColor: "#fff", borderColor: "#d1d5db", borderWidth: 1, borderRadius: 6, padding: 6, flexWrap: 'wrap', flexDirection: 'row' }]}>
                    {form.tags.map((tag, index) => (
                        <View
                            key={`${tag}_${index}`}
                            style={[styles.tagChip, {
                                backgroundColor: CurrentTheme.cardColor,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12,
                                marginRight: 6,
                                marginBottom: 6
                            }]}
                        >
                            <Text style={[styles.tagText, { color: CurrentTheme.cardText, marginRight: 4 }]}>{tag}</Text>
                            <TouchableOpacity onPress={() => handleTagRemove(tag)}>
                                <Text style={{ color: CurrentTheme.cardText }}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {Platform.OS === 'web' ? (
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === ' ') {
                                    const newTag = tagInput.trim();
                                    if (newTag && !form.tags.includes(newTag)) {
                                        handleFieldChange('tags', [...form.tags, newTag]);
                                    }
                                    setTagInput('');
                                    e.preventDefault();
                                } else if (e.key === 'Backspace' && tagInput === '' && form.tags.length > 0) {
                                    handleFieldChange('tags', form.tags.slice(0, -1));
                                }
                            }}
                            placeholder={translator("Add_tag")}
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: 15,
                                padding: 6,
                                minWidth: 80,
                                flex: 1
                            }}
                        />
                    ) : (
                        <TextInput
                            style={{
                                fontSize: 15,
                                padding: 4,
                                minWidth: 80,
                                flex: 1
                            }}
                            placeholder={translator("Add_tag")}
                            value={tagInput}
                            onChangeText={(text) => {
                                if (text.endsWith(' ')) {
                                    const newTag = text.trim();
                                    if (newTag && !form.tags.includes(newTag)) {
                                        handleFieldChange('tags', [...form.tags, newTag]);
                                    }
                                    setTagInput('');
                                } else {
                                    setTagInput(text);
                                }
                            }}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace' && tagInput === '' && form.tags.length > 0) {
                                    handleFieldChange('tags', form.tags.slice(0, -1));
                                }
                            }}
                        />
                    )}
                </View>
            )}

            <View
                style={[
                    styles.rowLine,
                    { gap: 15 },
                    isMobile && {
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }
                ]}
            >
                <View style={styles.taskUserCointainer}>
                    <Text style={[styles.selectorLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("Academy_associated_clients")}</Text>
                    <TaskUsersSelector
                        type="clients"
                        mobile={false}
                        selectedIds={form.clients}
                        onChange={(ids) => handleFieldChange("clients", ids)}
                        idTask={idTask}
                        realData={form.realClients}
                        editable={!canEditAll}
                    />
                </View>
                <View style={styles.taskUserCointainer}>
                    <Text style={[styles.selectorLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("Academy_associated_workers")}</Text>
                    <TaskUsersSelector
                        type="employees"
                        mobile={false}
                        selectedIds={form.assigned}
                        onChange={(ids) => handleFieldChange("assigned", ids)}
                        idTask={idTask}
                        realData={form.realAssigned}
                        editable={!canEditAll}
                    />
                </View>
            </View>

            <View
                style={[
                    styles.timeRow,
                    isMobile && {
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }
                ]}
            >
                <Text style={[styles.selectorLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("Academy_estimated_time")}</Text>
                <View
                    style={[
                        {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "75%"
                        },
                        isMobile && {
                            width: "100%"
                        }
                    ]}
                >
                    <View
                        style={[
                            styles.timeField,
                            isMobile && {
                                flexDirection: "column",
                                minWidth: 0,
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <Text style={[styles.timeLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("general_from")}:</Text>
                        <FliwerButtonDateTimePicker
                            mode="datetime"
                            date={form.estimatedStartTime ? form.estimatedStartTime.getTime() / 1000 : Date.now() / 1000}
                            onChange={(ts) => {
                                const newDate = new Date(ts * 1000);
                                if (form.estimatedEndTime && newDate > form.estimatedEndTime) {
                                    return toast.error(translator("Academy_estimated_start_time_must_be_before_end_time"));
                                }
                                handleFieldChange("estimatedStartTime", newDate);
                            }}
                            disabled={!canEditAll}
                            customRenderItem={
                                <Text style={styles.inputFake}>
                                    {form.estimatedStartTime
                                        ? moment(form.estimatedStartTime).format("DD/MM/YYYY HH:mm")
                                        : "—"}
                                </Text>
                            }
                        />
                    </View>

                    <View
                        style={[
                            styles.timeField,
                            isMobile && {
                                flexDirection: "column",
                                minWidth: 0,
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <Text style={[styles.timeLabel, { color: CurrentTheme.componentTextCardColor }]}>{translator("general_to")}:</Text>
                        <FliwerButtonDateTimePicker
                            mode="datetime"
                            date={form.estimatedEndTime ? form.estimatedEndTime.getTime() / 1000 : Date.now() / 1000}
                            onChange={(ts) => {
                                const newDate = new Date(ts * 1000);
                                if (form.estimatedStartTime && newDate < form.estimatedStartTime) {
                                    return toast.error(translator("Academy_estimated_end_time_must_be_after_start_time"));
                                }
                                handleFieldChange("estimatedEndTime", newDate);
                            }}
                            disabled={!canEditAll}
                            customRenderItem={
                                <Text style={styles.inputFake}>
                                    {form.estimatedEndTime
                                        ? moment(form.estimatedEndTime).format("DD/MM/YYYY HH:mm")
                                        : "—"}
                                </Text>
                            }
                        />
                    </View>

                    <View
                        style={[
                            styles.timeField,
                            isMobile && {
                                flexDirection: "column",
                                minWidth: 0,
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <Text style={[styles.timeLabel, { color: CurrentTheme.componentTextCardColor }]}>
                            {translator("Duration")}:
                        </Text>

                        {canEditAll ? (
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: isMobile ? 6 : 0 }}>
                                <TextInput
                                    placeholder="HH"
                                    value={form.estimatedHours}
                                    onChangeText={(text) => {
                                        const onlyNums = text.replace(/[^0-9]/g, '');
                                        handleFieldChange("estimatedHours", onlyNums);
                                    }}
                                    keyboardType="number-pad"
                                    placeholderTextColor={CurrentTheme.primaryColor}
                                    style={[
                                        styles.textInput,
                                        {
                                            width: 60,
                                            color: "black",
                                            backgroundColor: "white",
                                            height: 30,
                                            opacity: Platform.OS === "android" ? 0.6 : 1
                                        }
                                    ]}
                                />
                                <Text style={{ alignSelf: 'center', color: CurrentTheme.componentTextCardColor }}>:</Text>
                                <TextInput
                                    placeholder="MM"
                                    value={form.estimatedMinutes}
                                    onChangeText={(text) => {
                                        let onlyNums = text.replace(/[^0-9]/g, '');
                                        let minutes = parseInt(onlyNums || '0');
                                        if (minutes > 59) minutes = 59;
                                        handleFieldChange("estimatedMinutes", String(minutes));
                                    }}
                                    keyboardType="number-pad"
                                    placeholderTextColor={CurrentTheme.primaryColor}
                                    style={[
                                        styles.textInput,
                                        {
                                            width: 60,
                                            color: "black",
                                            backgroundColor: "white",
                                            opacity: Platform.OS === "android" ? 0.6 : 1,
                                            height: 30
                                        }
                                    ]}
                                />
                            </View>
                        ) : (
                            <Text style={[styles.inputFake, { marginTop: isMobile ? 6 : 0 }]}>
                                {form?.estimatedHours
                                    ? `${form?.estimatedHours?.padStart(2, "0")}:${form && form.estimatedMinutes?form.estimatedMinutes.padStart(2, "0"):"00"}`
                                    : "—"}
                            </Text>
                        )}
                    </View>

                </View>
            </View>

            <View
                style={[
                    styles.timeRow,
                    isMobile && {
                        flexDirection: "column",
                        alignItems: "flex-start"
                    }
                ]}
            >
                <Text
                    style={[
                        styles.selectorLabel,
                        { color: CurrentTheme.componentTextCardColor }
                    ]}
                >
                    {translator("Real_time")}
                </Text>

                <View
                    style={[
                        {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "75%"
                        },
                        isMobile && {
                            width: "100%"
                        }
                    ]}
                >
                    {/* FROM */}
                    <View
                        style={[
                            styles.timeField,
                            isMobile && {
                                flexDirection: "column",
                                minWidth: 0,
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.timeLabel,
                                { color: CurrentTheme.componentTextCardColor }
                            ]}
                        >
                            {translator("general_from")}:
                        </Text>
                        <FliwerButtonDateTimePicker
                            mode="datetime"
                            date={form.startTime ? form.startTime.getTime() / 1000 : Date.now() / 1000}
                            onChange={(ts) => {
                                const newDate = new Date(ts * 1000);
                                if (form.endTime && newDate > form.endTime) {
                                    return toast.error(translator("Academy_start_time_must_be_before_end_time"));
                                }
                                handleFieldChange("startTime", newDate);
                            }}
                            customRenderItem={
                                <Text style={styles.inputFake}>
                                    {form?.startTime
                                        ? moment(form.startTime).format("DD/MM/YYYY HH:mm")
                                        : "—"}
                                </Text>
                            }
                        />
                    </View>

                    {/* TO */}
                    <View
                        style={[
                            styles.timeField,
                            isMobile && {
                                flexDirection: "column",
                                minWidth: 0,
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.timeLabel,
                                { color: CurrentTheme.componentTextCardColor }
                            ]}
                        >
                            {translator("general_to")}:
                        </Text>
                        <FliwerButtonDateTimePicker
                            mode="datetime"
                            date={form.endTime ? form.endTime.getTime() / 1000 : Date.now() / 1000}
                            onChange={(ts) => {
                                const newDate = new Date(ts * 1000);
                                if (form.startTime && newDate < form.startTime) {
                                    return toast.error(translator("Academy_end_time_must_be_after_start_time"));
                                }
                                handleFieldChange("endTime", newDate);
                            }}
                            customRenderItem={
                                <Text style={styles.inputFake}>
                                    {form.endTime
                                        ? moment(form.endTime).format("DD/MM/YYYY HH:mm")
                                        : "—"}
                                </Text>
                            }
                        />
                    </View>

                    {/* DURATION (manual inputs) */}
                    <View
                        style={[
                            styles.timeField,
                            isMobile && {
                                flexDirection: "column",
                                minWidth: 0,
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.timeLabel,
                                { color: CurrentTheme.componentTextCardColor }
                            ]}
                        >
                            {translator("Duration")}:
                        </Text>

                        <View style={{ flexDirection: "row", gap: 10, marginTop: isMobile ? 6 : 0 }}>
                            <TextInput
                                placeholder="HH"
                                value={form.realHours}
                                onChangeText={(text) => {
                                    const onlyNums = text.replace(/[^0-9]/g, "");
                                    handleFieldChange("realHours", onlyNums);
                                }}
                                keyboardType="number-pad"
                                placeholderTextColor={CurrentTheme.primaryColor}
                                style={[
                                    styles.textInput,
                                    {
                                        width: 60,
                                        color: "black",
                                        backgroundColor: "white",
                                        height: 30,
                                        opacity: Platform.OS === "android" ? 0.6 : 1
                                    }
                                ]}
                            />
                            <Text style={{ alignSelf: "center", color: CurrentTheme.componentTextCardColor }}>
                                :
                            </Text>
                            <TextInput
                                placeholder="MM"
                                value={form.realMinutes}
                                onChangeText={(text) => {
                                    let onlyNums = text.replace(/[^0-9]/g, "");
                                    let minutes = parseInt(onlyNums || "0");
                                    if (minutes > 59) minutes = 59;
                                    handleFieldChange("realMinutes", String(minutes));
                                }}
                                keyboardType="number-pad"
                                placeholderTextColor={CurrentTheme.primaryColor}
                                style={[
                                    styles.textInput,
                                    {
                                        width: 60,
                                        color: "black",
                                        backgroundColor: "white",
                                        height: 30,
                                        opacity: Platform.OS === "android" ? 0.6 : 1
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </View>


            {renderRow(
                translator("Solution"),
                Platform.OS === 'web' ? (
                    <textarea
                        ref={(ref) => {
                            if (ref) {
                                textareaRef2.current = ref;
                                ref.style.height = 'auto';
                                ref.style.height = `${ref.scrollHeight}px`;
                            }
                        }}
                        placeholder={translator("Solution") + ".."}
                        value={form.solution}
                        onChange={(e) => {
                            const text = e.target.value;
                            handleFieldChange("solution", text);

                            if (textareaRef2.current) {
                                textareaRef2.current.style.height = 'auto';
                                textareaRef2.current.style.height = `${textareaRef2.current.scrollHeight}px`;
                            }
                        }}
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
                            opacity: Platform.OS === "android" ? 0.6 : 1,
                            maxHeight: 300
                        }}
                    />
                ) : (
                    <TextInput
                        multiline
                        numberOfLines={3}
                        placeholder={translator("Solution") + ".."}
                        value={form.solution}
                        onChangeText={(text) => {
                            handleFieldChange("solution", text);
                        }}
                        placeholderTextColor={CurrentTheme.primaryColor}
                        style={[
                            styles.textInput,
                            styles.multiInput,
                            {
                                color: "black",
                                backgroundColor: "white",
                                padding: 12,
                                opacity: Platform.OS === "android" ? 0.6 : 1
                            }
                        ]}
                    />
                )
            )}
            <TaskSelectorModal
                visible={selectorVisible}
                onClose={() => setSelectorVisible(false)}
                onAccept={(id) => {
                    // Aquí cambias la tarea
                    onAccept(id);
                    //navigation.replace(`/app/tasks/details/${id}`);
                }}
            />
        </ScrollView>
    );
};

export default CourseTaskComponent;

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 8
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
    },
    select: {
        borderRadius: 10,
        borderWidth: 0,
        height: "100%"
    },
    label: {
        width: "25%",
        fontWeight: "600",
        fontSize: 15,
    },
    selectorLabel: {
        width: "25%",
        fontWeight: "600",
        fontSize: 15
    },
    dropdownLabel: {
        fontWeight: "600",
        fontSize: 15
    },
    field: {
        flex: 1
    },
    selectorsCointainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10
    },
    taskUserCointainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flex: 1
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontSize: 15,
        backgroundColor: "white"
    },
    multiInput: {
        maxHeight: 300
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        marginTop: 10
    },
    tagChip: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2
    },
    tagText: {
        fontSize: 15
    },
    avatarWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 4
    },
    avatarName: {
        maxWidth: 96,
        fontSize: 12
    },
    hoursWrapper: {
        flexDirection: "row",
        alignItems: "center"
    },
    hoursInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6,
        paddingHorizontal: 4,
        width: 40,
        textAlign: "center"
    },
    colon: {
        marginHorizontal: 4,
        fontWeight: "600"
    },
    saveBtn: {
        marginTop: 16,
        backgroundColor: "#2563eb",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center"
    },
    saveTxt: {
        color: "#fff",
        fontWeight: "600"
    },
    dropdownTrigger: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 6
    },
    dropdownItem: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: "#f3f4f6",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb"
    },
    rowLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    recordTimeEditContainer: {
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1
    },
    recordTimestampEdit: {
        borderWidth: 1,
        color: "black",
        padding: 5,
        borderRadius: 5,
        flex: 1
    },
    timeBlock: {
        marginBottom: 16
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 16
    },
    selectorLabel: {
        fontWeight: "600",
        fontSize: 15,
        minWidth: 140 // <= para que se alinee como una columna más
    },
    timeField: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 180
    },
    timeLabel: {
        fontWeight: '500',
        fontSize: 14,
    },
    inputFake: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 14,
        minWidth: 110,
        textAlign: 'center',
        color: 'black',
        backgroundColor: 'white',
    }

});
