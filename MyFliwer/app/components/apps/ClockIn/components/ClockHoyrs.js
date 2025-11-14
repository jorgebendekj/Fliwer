import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Animated,
    Easing,
    FlatList,
    Pressable,
    Switch
} from "react-native";
import moment from "moment";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import Geolocation from '@react-native-community/geolocation';
import { useSelector, useDispatch } from "react-redux";
import FliwerLoading from "../../../fliwerLoading";
import {
    addClockInRecord,
    updateClockInComment,
    setClockInTimer,
    updateClockInTime
} from "../../../../actions/clockInActions";
import { useNow } from '../../../../utils/useNow';
import { deleteClockInRecord } from "../../../../actions/clockInActions";
import FliwerButtonDateTimePicker from "../../../custom/FliwerButtonDateTimePicker";
import { get } from "../../../../actions/languageActions";
import { toast } from "../../../../widgets/toast/toast";
import Modal from "../../../../widgets/modal/modal";
import FliwerGreenButton from "../../../custom/FliwerGreenButton";
import { useNowPause } from "../../../../utils/useNowPause";

const ClockInDetails = ({ selectedClockIn }) => {

    const dispatch = useDispatch();

    const clockIn = useSelector(state =>
        state.clockInReducer.data.find(x => x.id === selectedClockIn)
    );
    const isCurrentlyPaused = useMemo(() => {
        const validRecords = clockIn?.records?.filter(r => !r.deleted);
        if (!validRecords?.length) return false;

        const sorted = [...validRecords].sort((a, b) =>
            moment(a.timestamp).diff(moment(b.timestamp))
        );

        const last = sorted[sorted.length - 1];

        return last?.action === "PAUSE";
    }, [clockIn?.records]);

    const now = useNow(clockIn?.isRunning);
    const nowPause = useNowPause(isCurrentlyPaused);

    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [comment, setComment] = useState("")
    const [siwtchMode, setSwitchMode] = useState(false)
    const [currentTimeString, setCurrentTimeString] = useState(moment().format("HH:mm"));
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [insertTargetRecord, setInsertTargetRecord] = useState(null);
    const [insertStartTime, setInsertStartTime] = useState(null);
    const [insertEndTime, setInsertEndTime] = useState(null);

    const elapsedSeconds = useMemo(() => {
        if (!clockIn?.records?.length) return 0;

        const sortedRecords = [...clockIn.records].sort((a, b) =>
            moment(a.timestamp).diff(moment(b.timestamp))
        );

        let total = 0;
        let lastStart = null;

        for (const record of sortedRecords) {
            const ts = moment(record.timestamp);

            if (record.action === "PLAY") {
                lastStart = ts;
            }

            if (record.action === "PAUSE" && lastStart?.isValid() && ts.isValid()) {
                const diff = ts.diff(lastStart, "seconds");
                total += Math.max(diff, 0);
                lastStart = null;
            }
        }

        if (clockIn.isRunning && lastStart?.isValid()) {
            const runningDiff = moment(now).diff(lastStart, "seconds");
            total += Math.max(runningDiff, 0);
        }

        return total;
    }, [clockIn.records.length, clockIn.isRunning, now]);

    const pauseTime = useMemo(() => {
        if (!clockIn?.records?.length) return 0;

        const sortedRecords = [...clockIn.records]
            .filter(r => !r.deleted)
            .sort((a, b) => moment(a.timestamp).diff(moment(b.timestamp)));

        let totalPause = 0;
        let lastPauseStart = null;

        for (const record of sortedRecords) {
            const ts = moment(record.timestamp);

            if (record.action === "PAUSE") {
                lastPauseStart = ts;
            }

            if (record.action === "PLAY" && lastPauseStart?.isValid()) {
                totalPause += Math.max(ts.diff(lastPauseStart, "seconds"), 0);
                lastPauseStart = null;
            }
        }

        const lastRecord = sortedRecords[sortedRecords.length - 1];
        if (lastRecord?.action === "PAUSE" && lastPauseStart?.isValid()) {
            totalPause += Math.max(moment(nowPause).diff(lastPauseStart, "seconds"), 0);
        }

        return totalPause;
    }, [clockIn.records, nowPause]);

    useEffect(() => {
        if (clockIn) setLoading(false);
    }, [clockIn]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimeString(moment().format("HH:mm"));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const registerClockInAction = (action) => {
        const timestamp = Date.now();

        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                dispatch(addClockInRecord(selectedClockIn, {
                    action,
                    timestamp,
                    comment: comment,
                    location: { latitude, longitude }
                }));
            },
            (error) => {
                dispatch(addClockInRecord(selectedClockIn, {
                    action,
                    timestamp,
                    comment: comment,
                    location: null
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000
            }
        );

        dispatch(setClockInTimer(
            selectedClockIn,
            !clockIn?.isRunning,
            !clockIn?.isRunning ? moment().toISOString() : null
        ));

        setComment("")
        setSwitchMode(false);
    };

    const handlePlayPause = () => {
        if (clockIn?.isRunning) {
            setShowPauseModal(true);
            return;
        }

        registerClockInAction("PLAY");
    };


    const handleCommentChange = useCallback((text, recordId) => {
        dispatch(updateClockInComment(selectedClockIn, recordId, text));
    }, [dispatch, selectedClockIn]);

    const handleDelete = useCallback((recordId) => {
        dispatch(deleteClockInRecord(selectedClockIn, recordId));
    }, [dispatch, selectedClockIn]);

    const formatSeconds = (seconds) => {
        return moment.utc(seconds * 1000).format("HH:mm:ss");
    };

    const handleInsertBetween = (record, nextRecord) => {
        setInsertTargetRecord({ record, nextRecord });
        setInsertStartTime(null);
        setInsertEndTime(null);
        setShowInsertModal(true);
    };

    const confirmInsertBetween = () => {
        if (!insertStartTime || !insertEndTime) {
            toast.error("Debe seleccionar hora de inicio y fin");
            return;
        }

        const startMs = insertStartTime * 1000;
        const endMs = insertEndTime * 1000;

        const { record, nextRecord } = insertTargetRecord;
        const min = moment(record.timestamp).valueOf();
        const max = nextRecord ? moment(nextRecord.timestamp).valueOf() : Infinity;

        if (startMs <= min || endMs >= max || startMs >= endMs) {
            toast.error("Los horarios deben estar entre los registros actuales y en orden");
            return;
        }

        // Inferimos la acción según el registro actual
        const isBreakInsert = record.action === "PLAY";
        const insertedActions = isBreakInsert
            ? ["PAUSE", "PLAY"]
            : ["PLAY", "PAUSE"];

        const insertRecords = [
            {
                action: insertedActions[0],
                timestamp: startMs,
                comment: "",
                location: null,
            },
            {
                action: insertedActions[1],
                timestamp: endMs,
                comment: "",
                location: null,
            }
        ];

        insertRecords.forEach(r => {
            dispatch(addClockInRecord(selectedClockIn, r));
        });

        setShowInsertModal(false);
        setInsertTargetRecord(null);
    };

    const lastAction = clockIn.records?.[0]?.action;
    const isStopped = lastAction === "STOP";
    const date = moment.unix(clockIn.createTime).format('DD/MM/YYYY');

    const sortedRecords = [...clockIn.records].sort((a, b) =>
        moment(a.timestamp).diff(moment(b.timestamp))
    );

    const generateDynamicHours = () => {
        const blocks = new Set();
        const records = [...clockIn.records].filter(r => !r.deleted);

        for (let i = 0; i < records.length; i++) {
            const start = moment(records[i].timestamp);
            const end = records[i + 1] ? moment(records[i + 1].timestamp) : moment(start).add(10, "minutes");

            const startMin = start.hours() * 60 + start.minutes();
            const endMin = end.hours() * 60 + end.minutes();

            const startBlock = Math.floor(startMin / 30) * 30;

            const needsSplit = startMin % 30 !== 0 || (endMin - startMin) < 30;

            if (needsSplit) {
                for (let m = startBlock; m < startBlock + 30; m += 5) {
                    blocks.add(m);
                }
            } else {
                blocks.add(startBlock);
            }
        }

        // Rellenar el resto del día normalmente
        for (let m = 6 * 60; m <= 22 * 60; m += 30) {
            if (!blocks.has(m)) blocks.add(m);
        }

        return Array.from(blocks)
            .sort((a, b) => a - b)
            .map(m => moment().startOf("day").add(m, "minutes").format("HH:mm"));
    };

    const hours = useMemo(generateDynamicHours, [clockIn.records]);

    const HOUR_HEIGHT = 80;

    const getMinutes = (ts) => moment(ts).hours() * 60 + moment(ts).minutes();
    const getTop = (start) => ((getMinutes(start) - 360) / 60) * HOUR_HEIGHT;
    const getHeight = (start, end) => ((getMinutes(end) - getMinutes(start)) / 60) * HOUR_HEIGHT;


    if (loading || !clockIn) return <FliwerLoading />;

    return (
        <View
            style={{
                flex: 1
            }}
        >
            <View style={styles.headerRow}>
                <View style={{ paddingLeft: 10 }}>
                    <Text style={styles.title}>{clockIn.title} - {date}</Text>
                </View>
                <View style={{ paddingRight: 10 }}>
                    <Text style={styles.title}>{clockIn.softId || "WO-6430-21"}</Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                {!isStopped && (
                    <View style={styles.centered}>
                        <TouchableOpacity onPress={handlePlayPause} style={styles.circleButton}>
                            <View>
                                <Text style={styles.circleTimer}>{currentTimeString}</Text>
                            </View>
                            {/*                             <Text style={styles.circleTitle}>{clockIn.isRunning ? "Clock Out" : "Clock In"}</Text>
 */}                            <IoniconsIcon
                                name={clockIn.isRunning ? "pause-outline" : "play-outline"}
                                size={48}
                                color={CurrentTheme.cardText}
                            />
                            <View style={{ alignItems: "center" }}>
                                <Text style={styles.circleTimer}>
                                    Trabajado: {formatSeconds(elapsedSeconds)}
                                </Text>
                                <Text style={[styles.circleTimer]}>
                                    Descanso: {formatSeconds(pauseTime)}
                                </Text>
                            </View>

                        </TouchableOpacity>
                    </View>
                )}


                <View style={{ flexDirection: "row" }}>
                    <View style={{ width: 60 }}>
                        {hours.map((h, i) => (
                            <Text
                                key={h}
                                style={{ height: HOUR_HEIGHT / 2, fontSize: 12, color: CurrentTheme.cardText, textAlign: "right", paddingRight: 6 }}
                            >
                                {h}
                            </Text>
                        ))}
                    </View>

                    <View style={{ flex: 1, height: hours.length * (HOUR_HEIGHT / 2), position: "relative" }}>
                        {sortedRecords.map((item, index) => {
                            const start = item.timestamp;
                            const end = sortedRecords[index + 1]?.timestamp || Date.now();
                            const top = getTop(start);
                            const height = getHeight(start, end);

                            return (
                                <View
                                    key={item.id}
                                    style={{
                                        position: "absolute",
                                        top,
                                        left: 0,
                                        right: 0,
                                        width: "100%"
                                    }}
                                >
                                    <ClockInItem
                                        record={item}
                                        nextRecord={sortedRecords[index + 1] ?? null}
                                        nextNextRecord={sortedRecords[index + 2] ?? null}
                                        prevRecord={sortedRecords[index - 1] ?? null}
                                        isEditing={editingIndex === index}
                                        onEdit={() => setEditingIndex(index)}
                                        onSave={() => setEditingIndex(null)}
                                        handleCommentChange={(text) => handleCommentChange(text, item.id)}
                                        handleDelete={handleDelete}
                                        clockInId={selectedClockIn}
                                        handleInsertBetween={(record) =>
                                            handleInsertBetween(record, sortedRecords[index + 1] ?? null)
                                        }
                                        height={height}
                                    />
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView >
            <Modal
                animationType={"fade"}
                inStyle={styles.showPauseModal}
                visible={showPauseModal}
                onClose={() => {
                    setShowPauseModal(false);
                    setComment("");
                    setSwitchMode(false);
                }}
            >
                <View
                    style={{
                        padding: 10,
                        width: 500,
                        borderRadius: 8
                    }}
                >
                    <Text
                        style={styles.modalViewTitle}
                    >
                        Parar el contador
                    </Text>
                    <Text
                        style={styles.modalInputTitle}
                    >
                        Ingrese una observación:
                    </Text>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        style={{
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            padding: 5,
                            backgroundColor: "white",
                            minWidth: 150,
                            marginBottom: 20
                        }}
                        autoFocus
                    />
                    <View style={styles.localizationSwitchContainer}>
                        <Text
                            style={[styles.localizationSwitchTitle, styles.localizationSwitchTitle1]}
                        >
                            Pausar
                        </Text>
                        <Switch
                            style={styles.localizationSwitch}
                            onValueChange={(value) => {
                                setSwitchMode(value ? true : false)
                            }}
                            value={siwtchMode}
                            ios_backgroundColor={"#a5cd07"}
                            thumbColor={"white"}
                            trackColor={"#a5cd07"}
                        />
                        <Text
                            style={[styles.localizationSwitchTitle, styles.localizationSwitchTitle2]}
                        >
                            Finalizar
                        </Text>
                    </View>
                    <FliwerGreenButton
                        text={dispatch(get('general_save'))}
                        style={{}}
                        containerStyle={{
                            width: "50%",
                            alignSelf: "center",
                            height: 40
                        }}
                        onPress={() => {
                            registerClockInAction(siwtchMode ? "STOP" : "PAUSE")
                            setShowPauseModal(false);
                        }}
                    />
                </View>
            </Modal>
            <Modal
                animationType="fade"
                visible={showInsertModal}
                onClose={() => setShowInsertModal(false)}
                inStyle={styles.modalIn}
            >
                <View style={{ padding: 20 }}>
                    <Text style={styles.modalViewTitle}>Insertar nueva acción</Text>
                    <Text style={styles.modalInputTitle}>Hora de inicio</Text>
                    <FliwerButtonDateTimePicker
                        mode="time"
                        date={insertStartTime}
                        timeIntervals={1}
                        onChange={setInsertStartTime}
                    />
                    <Text style={[styles.modalInputTitle, { marginTop: 15 }]}>Hora de fin</Text>
                    <FliwerButtonDateTimePicker
                        mode="time"
                        date={insertEndTime}
                        timeIntervals={1}
                        onChange={setInsertEndTime}
                    />

                    <FliwerGreenButton
                        text="Guardar"
                        style={{ marginTop: 20 }}
                        containerStyle={{ width: "50%", alignSelf: "center" }}
                        onPress={confirmInsertBetween}
                    />
                </View>
            </Modal>
        </View >
    );
};

const ClockInItem = React.memo(({
    record,
    nextRecord,
    nextNextRecord,
    prevRecord,
    isEditing,
    onEdit,
    onSave,
    handleCommentChange,
    handleDelete,
    clockInId,
    handleInsertBetween,
    height
}) => {

    const dispatch = useDispatch();

    const [animation] = useState(new Animated.Value(0));

    const [localComment, setLocalComment] = useState(record.comment);
    const [showLogs, setShowLogs] = useState(false);

    const validateNewTimestamp = (newTimestampMs) => {
        if (nextRecord && newTimestampMs >= nextRecord.timestamp) {
            toast.error("No puede ingresar un horario mayor al siguiente registro.");
            return false;
        }
        if (prevRecord && newTimestampMs <= prevRecord.timestamp) {
            toast.error("No puede ingresar un horario menor al resigro previo.");
            return false;
        }
        return true;
    };

    const validateNextTimestamp = (newTimestampMs) => {
        if (newTimestampMs <= record.timestamp) {
            toast.error("No puede ingresar un horario menor al resigro previo.");
            return false;
        }

        if (nextNextRecord && newTimestampMs >= nextNextRecord.timestamp) {
            toast.error("No puede ingresar un horario mayor al siguiente registro.");
            return false;
        }

        return true;
    };


    useEffect(() => {
        if (showLogs) {
            Animated.timing(animation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease)
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
                easing: Easing.in(Easing.ease)
            }).start();
        }
    }, [showLogs]);

    return (
        <View
            style={{
                paddingVertical: 10,
                backgroundColor: CurrentTheme.complementaryColor,
                borderRadius: 8
            }}
        >
            <View style={[styles.recordItem, { height: height, minHeight: 80 }]}>
                <View style={{ flex: 1 }}>
                    <View style={styles.rowContainer}>
                        <View style={[styles.rowContainer, {
                            borderColor: CurrentTheme.cardText,
                            borderWidth: 1,
                            padding: 5,
                            width: 130
                        }]}>
                            <IoniconsIcon
                                name={record.action === "PLAY" ? "arrow-forward" : record.action === "PAUSE" ? "cafe-outline" : "stop-outline"}
                                size={20}
                                color={CurrentTheme.cardText}
                            />
                            <Text style={styles.recordTimestamp}>
                                {record.action === "PLAY" ? "Clocked in" : record.action === "PAUSE" ? "Break" : "Stop"}
                            </Text>
                        </View>

                        {isEditing ? (
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10
                                }}
                            >
                                <FliwerButtonDateTimePicker
                                    mode={"time"}
                                    date={new Date(record.timestamp)}
                                    timeIntervals={1}
                                    styleButtonContainer={{ width: "100%" }}
                                    onChange={(date) => {
                                        const newTimestamp = date * 1000;

                                        if (validateNewTimestamp(newTimestamp)) {
                                            dispatch(updateClockInTime(clockInId, record.id, newTimestamp));
                                            onSave(); // cerrar edición
                                        }
                                    }}
                                    customRenderItem={
                                        <View style={styles.recordTimeEditContainer}>
                                            <Text style={styles.recordTimestampEdit}>
                                                {moment(record.timestamp).format("hh:mm A")}
                                            </Text>
                                        </View>
                                    }
                                />
                                <Text style={styles.recordTimestamp}>
                                    a
                                </Text>
                                {isEditing && nextRecord && (
                                    <FliwerButtonDateTimePicker
                                        mode={"time"}
                                        date={new Date(nextRecord.timestamp)}
                                        timeIntervals={1}
                                        styleButtonContainer={{ width: "100%" }}
                                        onChange={(date) => {
                                            const newTimestamp = date * 1000;

                                            if (validateNextTimestamp(newTimestamp)) {
                                                dispatch(updateClockInTime(clockInId, nextRecord.id, newTimestamp));
                                                onSave(); // cerrar edición
                                            }
                                        }}
                                        customRenderItem={
                                            <View style={styles.recordTimeEditContainer}>
                                                <Text style={styles.recordTimestampEdit}>
                                                    {moment(nextRecord.timestamp).format("hh:mm A")}
                                                </Text>
                                            </View>
                                        }
                                    />
                                )}
                            </View>
                        ) : (
                            <Text style={styles.recordTimestamp}>
                                {moment(record.timestamp).format("hh:mm A")}
                                {nextRecord
                                    ? ` a ${moment(nextRecord.timestamp).format("hh:mm A")}`
                                    : ""}
                            </Text>
                        )}


                        {!isEditing ? (
                            <Text style={styles.recordTimestamp}>
                                {record.comment || "Sin observación"}
                            </Text>
                        ) : (
                            <TextInput
                                value={localComment}
                                onChangeText={setLocalComment}
                                style={{
                                    height: 40,
                                    borderColor: 'gray',
                                    borderWidth: 1,
                                    padding: 5,
                                    backgroundColor: "white",
                                    minWidth: 150
                                }}
                                autoFocus
                            />
                        )}
                    </View>

                    {record.logs?.length > 0 && (
                        <Animated.View
                            style={{
                                marginTop: 10,
                                marginLeft: 8,
                                opacity: animation,
                                transform: [
                                    {
                                        scaleY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.85, 1]
                                        })
                                    }
                                ]
                            }}
                            pointerEvents={showLogs ? 'auto' : 'none'}
                        >
                            {showLogs && record.logs.map((log, idx) => (
                                <Text key={idx} style={styles.recordTimestamp}>
                                    • {log.user} — {log.action} — {moment(log.date).format("DD/MM HH:mm")}
                                </Text>
                            ))}
                        </Animated.View>
                    )}

                </View>

                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    {isEditing ? (
                        <IoniconsIcon
                            name="save-outline"
                            size={24}
                            color={CurrentTheme.cardText}
                            onPress={() => {
                                handleCommentChange(localComment);
                                onSave();
                            }}
                        />
                    ) : (
                        <IoniconsIcon
                            name="pencil-outline"
                            size={24}
                            color={CurrentTheme.cardText}
                            onPress={onEdit}
                        />
                    )}

                    {isEditing ? (
                        <IoniconsIcon
                            name="add-circle-outline"
                            size={24}
                            color={CurrentTheme.cardText}
                            onPress={() => {
                                handleInsertBetween(record)
                            }}
                        />
                    ) : (
                        <>
                            <IoniconsIcon
                                name={showLogs ? "chevron-up-outline" : "time-outline"}
                                size={24}
                                color={CurrentTheme.cardText}
                                onPress={() => setShowLogs(prev => !prev)}
                            />

                            <IoniconsIcon
                                name="trash-outline"
                                size={24}
                                color={CurrentTheme.cardText}
                                onPress={() => handleDelete(record.id)}
                            />
                        </>
                    )}


                </View>
            </View>
        </View>
    );
});


const styles = StyleSheet.create({
    container: {},
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 700
    },
    localizationSwitchTitle: {
        fontSize: 14,
        color: FliwerColors.primary.black,
    },
    localizationSwitchTitle1: {
        marginRight: 20
    },
    localizationSwitchTitle2: {
        marginLeft: 20
    },
    localizationSwitch: {
        transform: [{ scaleX: 1 }, { scaleY: 1 }]
    },
    localizationSwitchContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        paddingBottom: 10,
        paddingLeft: 10,
        marginBottom: 20
    },
    modalViewTitle: {
        width: "100%",
        marginBottom: 20,
        fontFamily: "AvenirNext-Bold",
        fontSize: 20,
        textAlign: "center",
    },
    modalInputTitle: {
        marginBottom: 5,
        color: "black"
    },
    title: {
        fontSize: 18,
        color: CurrentTheme.cardText
    },
    headerRow: {
        width: "100%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: CurrentTheme.cardColor,
        marginBottom: 10,
        height: 40
    },
    centered: {
        alignItems: "center",
        marginBottom: 30
    },
    circleButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        backgroundColor: CurrentTheme.cardColor
    },
    circleTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 6,
        color: CurrentTheme.cardText,
        textAlign: "center"
    },
    circleTimer: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
        color: CurrentTheme.cardText,
        textAlign: "center"
    },
    recordsContainer: {
        marginTop: 20
    },
    recordItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: 16,
        backgroundColor: CurrentTheme.cardColor,
        marginHorizontal: 10,
        borderRadius: 8
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexWrap: 'wrap'
    },
    recordTimestamp: {
        fontSize: 14,
        color: CurrentTheme.cardText
    },
    recordTimeEditContainer: {
        display: "flex",
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 5,
        height: 40
    }
});


export default ClockInDetails;
