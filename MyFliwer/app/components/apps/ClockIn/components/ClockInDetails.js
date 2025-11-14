import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    Switch
} from "react-native";
import moment from "moment";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import Geolocation from '@react-native-community/geolocation';
import { useSelector, useDispatch } from "react-redux";
import FliwerLoading from "../../../fliwerLoading";
import {
    addClockInRecord,
    deleteAction,
    setClockInTimer,
    updateClockInAction
} from "../../../../actions/clockInActions";
import { useNow } from '../../../../utils/useNow';
import FliwerButtonDateTimePicker from "../../../custom/FliwerButtonDateTimePicker";
import { get } from "../../../../actions/languageActions";
import { toast } from "../../../../widgets/toast/toast";
import Modal from "../../../../widgets/modal/modal";
import FliwerGreenButton from "../../../custom/FliwerGreenButton";
import { useNowPause } from "../../../../utils/useNowPause";
import FliwerDeleteModal from "../../../custom/FliwerDeleteModal";
import FilwerDivider from "../../../custom/FliwerDivider";
import ClockInItem from "./ClockInItem";
import ClockInStartButton from "./ClockInStartButton";
import ClockInWorked from "./ClockInWorked";
import ClockInPlayPauseButton from "./ClockInPlayPauseButton";
import CLockInRestHours from "./CLockInRestHours";
import ClockInStopButton from "./ClockInStopButton";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import ClockInMobileHeader from "./ClockInMobileHeader";

const ClockInDetails = ({ selectedClockIn, setClockInStatus, clockInStatus }) => {

    const dispatch = useDispatch();

    const { orientation } = useMediaInfo();

    const clockIn = useSelector(state =>
        state.clockInReducer.data.find(x => x.id == selectedClockIn)
    );

    //console.log(clockIn)
    const isCurrentlyPaused = useMemo(() => {
        const validActions = clockIn?.actions?.filter(r => r?.deleted === 0);
        if (!validActions?.length) return false;

        const sorted = [...validActions].sort((a, b) =>
            moment.unix(a.insertTime).diff(moment.unix(b.insertTime))
        );

        const last = sorted[sorted.length - 1];

        return last?.action === "pause";
    }, [clockIn?.actions]);

    const now = useNow(clockIn?.isRunning);
    const nowPause = useNowPause(isCurrentlyPaused);

    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showPauseModal, setShowPauseModal] = useState(false);
    const [comment, setComment] = useState("")
    const [modalComment, setModalComment] = useState("")
    const [siwtchMode, setSwitchMode] = useState(false)
    const [currentTimeString, setCurrentTimeString] = useState(Math.floor(Date.now() / 1000));
    const [showInsertModal, setShowInsertModal] = useState(false);
    const [insertTargetRecord, setInsertTargetRecord] = useState(null);
    const [insertStartTime, setInsertStartTime] = useState(null);
    const [insertEndTime, setInsertEndTime] = useState(null);
    const [modalVisible, setModalVisible] = useState(null);
    const [startStopModalVisible, setStartStopModalVisible] = useState(false);

    const elapsedSeconds = useMemo(() => {
        
        if (!clockIn?.actions?.length) return 0;

        const sortedActions = [...clockIn.actions]
            .filter(action => action.deleted !== 1)
            .sort((a, b) =>
                moment.unix(a.insertTime).diff(moment.unix(b.insertTime))
            );

        let total = 0;
        let lastStart = null;

        for (const action of sortedActions) {
            const ts = moment.unix(action.insertTime);

            if (action?.action === "start") {
                lastStart = ts;
            }

            if ((action?.action === "pause" || action?.action === "stop") && lastStart?.isValid() && ts.isValid()) {
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
    }, [clockIn?.actions.length, clockIn?.isRunning, now]);

    const pauseTime = useMemo(() => {
        if (!clockIn?.actions?.length) return 0;

        const sortedActions = [...clockIn?.actions]
            .filter(r => r?.deleted !== 1)
            .sort((a, b) => moment.unix(a.insertTime).diff(moment.unix(b.insertTime)));

        let totalPause = 0;
        let lastPauseStart = null;

        for (const action of sortedActions) {
            const ts = moment.unix(action.insertTime);

            if (action?.action === "pause") {
                lastPauseStart = ts;
            }

            if (action?.action === "start" && lastPauseStart?.isValid()) {
                totalPause += Math.max(ts.diff(lastPauseStart, "seconds"), 0);
                lastPauseStart = null;
            }
        }

        // SI está actualmente en pausa (último fue pause y no hubo start después)
        const lastAction = sortedActions[sortedActions.length - 1];
        if (lastAction?.action === "pause" && lastPauseStart?.isValid()) {
            totalPause += Math.max(moment(nowPause).diff(lastPauseStart, "seconds"), 0);
        }

        return totalPause;
    }, [clockIn?.actions, nowPause]);

    useEffect(() => {
        if (clockIn) setLoading(false);
    }, [clockIn]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimeString(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const registerClockInAction = (action) => {
        setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saving" }));
        //usar getCurrentPosition gpsUtils
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                dispatch(addClockInRecord({
                    id: selectedClockIn,
                    action,
                    latitude: latitude,
                    longitude: longitude,
                    comment: comment
                }));
                dispatch(setClockInTimer(
                    selectedClockIn,
                    !clockIn?.isRunning
                ));
                setTimeout(() => {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
                }, 1500);
            },
            (error) => {
                dispatch(addClockInRecord({
                    id: selectedClockIn,
                    action,
                    latitude: 1,
                    longitude: 2,
                    comment: comment
                }));
                dispatch(setClockInTimer(
                    selectedClockIn,
                    !clockIn?.isRunning
                ));
                setTimeout(() => {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "error" }));
                }, 1500);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000
            }
        );

        setComment("")
        setSwitchMode(false);
    };

    const handlePlayPause = (action = null) => {

        
        const isToday = clockIn && moment.unix(clockIn.insertTime).isSame(moment(), 'day');
        
        if( (!action || (action && action.action === "start")) && !isToday){
           //If not today, ask in a new modal for the startTIme and stopTime
           setStartStopModalVisible(true);
        }else{
            //return clockInService.addClockIn()
            setLoading(true);

            if (action) {
                if (action.action === "start") {
                    registerClockInAction("stop");
                } else {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saving" }));
                    dispatch(updateClockInAction({
                        id: action.id,
                        action: "stop"
                    }))
                    setTimeout(() => {
                        setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
                    }, 1500);
                }
            } else {
                if (clockIn?.isRunning) {
                    registerClockInAction("pause");
                } else {
                    registerClockInAction("start");
                }
            }
        }
        
    };


    const updateAction = useCallback(({ actionId, nextActionId, comment, actionTime, nextActionTime }) => {
        setLoading(true);
        setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saving" }));
        if (comment || actionTime) {
            let actionData = {
                id: actionId
            }
            if (comment) actionData.comment = comment
            if (actionTime) actionData.insertTime = actionTime
            //console.log(actionData)
            dispatch(updateClockInAction(actionData))
            setTimeout(() => {
                setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
            }, 1500);
        }
        if (nextActionTime) {
            let actionData = {
                id: nextActionId,
                insertTime: nextActionTime
            }
            dispatch(updateClockInAction(actionData))
            setTimeout(() => {
                setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
            }, 1500);
        }
    }, [dispatch, selectedClockIn]);

    const handleDelete = useCallback((recordId) => {
        setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saving" }));
        dispatch(deleteAction(recordId));
        setTimeout(() => {
            setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
        }, 1500);
    }, [dispatch, selectedClockIn]);

    const formatSeconds = (seconds) => {
        const duration = moment.utc(seconds * 1000) || null;
        const minutesPart = seconds == 1 ? '-- : --' : duration.format("HH:mm") || '00:00'
        const secondsPart = seconds == 1 ? '--' : duration.format("ss") || '00'
        return (
            <View
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Text
                    style={{
                        color: CurrentTheme.cardText,
                        fontSize: 22,
                        fontWeight: "bold",
                        alignSelf: "center"
                    }}
                >
                    {minutesPart}
                </Text>
                <Text
                    style={{
                        color: CurrentTheme.cardText,
                        fontSize: 14,
                        alignSelf: "flex-end"
                    }}
                >
                    {secondsPart}
                </Text>
            </View>
        )
    };

    const formatSeconds2 = (seconds) => {
        const duration = moment(seconds * 1000) || null;
        const minutesPart = seconds == 1 ? '-- : --' : duration.format("HH:mm") || '00:00'
        const secondsPart = seconds == 1 ? '--' : duration.format("ss") || '00'
        return (
            <View
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Text
                    style={{
                        color: CurrentTheme.cardText,
                        fontSize: 24,
                        fontWeight: "bold",
                        alignSelf: "center"
                    }}
                >
                    {minutesPart}
                </Text>
                <Text
                    style={{
                        color: CurrentTheme.cardText,
                        fontSize: 14,
                        alignSelf: "flex-end"
                    }}
                >
                    {secondsPart}
                </Text>
            </View>
        )
    };

    const sortedRecords = [...clockIn?.actions].sort((a, b) =>
        moment.unix(a.insertTime).diff(moment.unix(b.insertTime))
    );

    const validRecords = useMemo(() => {
        return clockIn?.actions
            ?.filter(r => !r.deleted)
            ?.sort((a, b) => moment.unix(a.insertTime).diff(moment.unix(b.insertTime))) ?? [];
    }, [clockIn?.actions]);


    const handleInsertBetween = (record, nextAction) => {
        setInsertTargetRecord({ record, nextAction });
        setInsertStartTime(null);
        setInsertEndTime(null);
        setShowInsertModal(true);
    };

    const confirmInsertBetween = () => {
        if (!insertStartTime || !insertEndTime) {
            toast.error("Debe seleccionar hora de inicio y fin");
            return;
        }

        const start = insertStartTime * 1000;
        const end = insertEndTime * 1000;

        const { record, nextAction } = insertTargetRecord;

        if (start <= record.insertTime * 1000) {
            toast.error("La hora de inicio debe ser mayor al registro anterior.");
            return;
        }
        if (end >= nextAction.insertTime * 1000) {
            toast.error("La hora de fin debe ser menor al siguiente registro.");
            return;
        }
        if (start >= end) {
            toast.error("La hora de inicio debe ser menor que la de fin.");
            return;
        }
        setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saving" }));
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                dispatch(addClockInRecord({
                    id: selectedClockIn,
                    action: record?.action == "start" ? "pause" : "start",
                    latitude: latitude,
                    longitude: longitude,
                    comment: modalComment,
                    startDate: start / 1000,
                    endDate: end / 1000
                }));
                setTimeout(() => {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
                }, 1500);
            },
            (error) => {
                dispatch(addClockInRecord({
                    id: selectedClockIn,
                    action: record?.action == "start" ? "pause" : "start",
                    latitude: 1,
                    longitude: 2,
                    comment: modalComment,
                    startDate: start / 1000,
                    endDate: end / 1000
                }));
                setTimeout(() => {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
                }, 1500);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000
            }
        );

        setShowInsertModal(false);
        setInsertTargetRecord(null);
        setModalComment("");
        setEditingIndex(null);
    };

    const confirmInsertStartStop = () => {
        if (!insertStartTime || !insertEndTime) {
            toast.error("Debe seleccionar hora de inicio y fin");
            return;
        }

        const start = insertStartTime * 1000;
        const end = insertEndTime * 1000;

        if (start >= end) {
            toast.error("La hora de inicio debe ser menor que la de fin.");
            return;
        }

        setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saving" }));
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                dispatch(addClockInRecord({
                    id: selectedClockIn,
                    action: "start",
                    latitude: latitude,
                    longitude: longitude,
                    comment: modalComment,
                    startDate: start / 1000,
                    endDate: end / 1000,
                    endIsStop: true
                }));
                setTimeout(() => {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
                }, 1500);
            },
            (error) => {
                dispatch(addClockInRecord({
                    id: selectedClockIn,
                    action: "start",
                    latitude: 1,
                    longitude: 2,
                    comment: modalComment,
                    startDate: start / 1000,
                    endDate: end / 1000,
                    endIsStop: true
                }));
                setTimeout(() => {
                    setClockInStatus(prev => ({ ...prev, [selectedClockIn]: "saved" }));
                }, 1500);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000
            }
        );

        setStartStopModalVisible(false);
        setModalComment("");
    };

    const lastAction = useMemo(() => {
        const validActions = clockIn?.actions?.filter(action => !action.deleted);
        return validActions?.[validActions.length - 1];
    }, [clockIn?.actions]);

    const isStopped = lastAction?.action === "stop";

    const date = moment.unix(clockIn?.insertTime).format('DD/MM/YYYY');
    const isToday = clockIn && moment.unix(clockIn.insertTime).isSame(moment(), 'day');

    
    var defaultStart = clockIn?.insertTime ? new Date(clockIn.insertTime * 1000) : new Date();
    defaultStart.setHours(9);
    defaultStart.setMinutes(30);
    defaultStart.setSeconds(0);
    var defaultEnd = clockIn?.insertTime ? new Date(clockIn.insertTime * 1000) : new Date();
    defaultEnd.setHours(18);
    defaultEnd.setMinutes(30);
    defaultEnd.setSeconds(0);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: CurrentTheme.secondaryView
            }}
        >
            {orientation !== "landscape" && (
                <ClockInMobileHeader
                    clockInStatus={clockInStatus}
                    idClockIn={selectedClockIn}
                />
            )}
            <View style={[styles.headerRow, { backgroundColor: CurrentTheme.filterMenu }]}>
                <View style={{ paddingLeft: 10 }}>
                    <Text style={[styles.title, { color: CurrentTheme.cardText }]}>{clockIn.userName} - {date}</Text>
                </View>
                {
                    /*
                        <View style={{ paddingRight: 10 }}>
                            <Text style={[styles.title, { color: CurrentTheme.cardText }]}>{clockIn.softId || "WO-6430-21"}</Text>
                        </View>
                    */
                }
            </View>
            <ScrollView contentContainerStyle={styles.container}>

                {
                    orientation === 'portrait'
                        ?
                        <View style={styles.columnContainer}>

                            <View style={styles.centered}>
                                <ClockInStartButton
                                    handlePlayPause={handlePlayPause}
                                    formatSeconds2={formatSeconds2}
                                    validRecords={validRecords}
                                    isToday={isToday}
                                />
                                <ClockInStopButton
                                    handlePlayPause={handlePlayPause}
                                    formatSeconds2={formatSeconds2}
                                    validRecords={validRecords}
                                    lastAction={lastAction}
                                    isStopped={isStopped}
                                />
                            </View>
                            
                            <View style={styles.centered}>
                                <ClockInPlayPauseButton
                                    handlePlayPause={handlePlayPause}
                                    formatSeconds2={formatSeconds2}
                                    validRecords={validRecords}
                                    isToday={isToday}
                                    isStopped={isStopped}
                                    currentTimeString={currentTimeString}
                                    isRunning={clockIn?.isRunning}
                                />
                            </View>

                            <View style={styles.centered}>
                                <ClockInWorked
                                    formatSeconds={formatSeconds}
                                    elapsedSeconds={elapsedSeconds}
                                />
                                <CLockInRestHours
                                    formatSeconds={formatSeconds}
                                    pauseTime={pauseTime}
                                />
                            </View>
                        </View>
                        :
                        <View style={styles.centered}>

                            <ClockInStartButton
                                handlePlayPause={handlePlayPause}
                                formatSeconds2={formatSeconds2}
                                validRecords={validRecords}
                                isToday={isToday}
                            />

                            <ClockInWorked
                                formatSeconds={formatSeconds}
                                elapsedSeconds={elapsedSeconds}
                            />

                            <ClockInPlayPauseButton
                                handlePlayPause={handlePlayPause}
                                formatSeconds2={formatSeconds2}
                                validRecords={validRecords}
                                isToday={isToday}
                                isStopped={isStopped}
                                currentTimeString={currentTimeString}
                                isRunning={clockIn?.isRunning}
                            />

                            <CLockInRestHours
                                formatSeconds={formatSeconds}
                                pauseTime={pauseTime}
                            />

                            <ClockInStopButton
                                handlePlayPause={handlePlayPause}
                                formatSeconds2={formatSeconds2}
                                validRecords={validRecords}
                                lastAction={lastAction}
                                isStopped={isStopped}
                            />

                        </View>
                }

                <FilwerDivider />

                <FlatList
                    data={sortedRecords}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.recordsContainer}
                    renderItem={({ item }) => {

                        const indexInValid = validRecords.findIndex(r => r.id === item.id);
                        const isFirst = indexInValid === 0;

                        const currentValidIndex = validRecords.findIndex(r => r.id === item.id);
                        const nextAction = currentValidIndex !== -1 ? validRecords[currentValidIndex + 1] ?? null : null;
                        const nextNextAction = currentValidIndex !== -1 ? validRecords[currentValidIndex + 2] ?? null : null;
                        const prevRecord = currentValidIndex !== -1 ? validRecords[currentValidIndex - 1] ?? null : null;

                        const index = sortedRecords.findIndex(r => r.id === item.id); // Para edición

                        return (
                            <ClockInItem
                                action={item}
                                isFirst={isFirst}
                                nextAction={nextAction}
                                nextNextAction={nextNextAction}
                                prevRecord={prevRecord}
                                isEditing={editingIndex === index}
                                onEdit={() => setEditingIndex(index)}
                                onSave={() => setEditingIndex(null)}
                                updateAction={({
                                    actionId,
                                    nextActionId,
                                    comment,
                                    actionTime,
                                    nextActionTime
                                }) => updateAction({
                                    actionId: actionId,
                                    nextActionId: nextActionId,
                                    comment: comment,
                                    actionTime: actionTime,
                                    nextActionTime: nextActionTime
                                })}
                                handleDelete={(id) => setModalVisible(id)}
                                clockInId={selectedClockIn}
                                handleInsertBetween={(record) => handleInsertBetween(record, nextAction)}
                            />
                        )
                    }}
                />
            </ScrollView>
            <Modal
                animationType={"fade"}
                inStyle={styles.modalIn}
                visible={showPauseModal}
                onClose={() => {
                    setShowPauseModal(false);
                    setComment("");
                    setSwitchMode(false);
                }}
            >
                <View
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
                            registerClockInAction(siwtchMode ? "stop" : "pause")
                            setShowPauseModal(false);
                        }}
                    />
                </View>
            </Modal>
            <Modal
                animationType="fade"
                visible={showInsertModal}
                onClose={() => {
                    setShowInsertModal(false)
                    setModalComment("")
                    setInsertStartTime(null)
                    setInsertEndTime(null)
                }}
                inStyle={styles.modalIn}
            >
                <View style={{ padding: 20 }}>
                    <Text style={styles.modalViewTitle}>Insertar nueva acción</Text>

                    {insertTargetRecord && (
                        <Text style={{ textAlign: "center", color: "gray", marginBottom: 10 }}>
                            Rango permitido: {moment.unix(insertTargetRecord.record.insertTime).format("HH:mm")} - {moment.unix(insertTargetRecord.nextAction.insertTime).format("HH:mm")}
                        </Text>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalInputTitle}>Observación</Text>
                        <TextInput
                            value={modalComment}
                            onChangeText={setModalComment}
                            style={{
                                height: 40,
                                borderColor: 'gray',
                                borderWidth: 1,
                                padding: 5,
                                backgroundColor: "white",
                                width: "100%"
                            }}
                            autoFocus
                        />
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalInputTitle}>Hora de inicio</Text>
                            <FliwerButtonDateTimePicker
                                mode="time"
                                date={insertStartTime ? new Date(insertStartTime * 1000) : (insertTargetRecord?new Date(insertTargetRecord.record.insertTime*1000):null)}
                                timeIntervals={1}
                                onChange={(date) => {
                                    const newTimestamp = date * 1000;
                                    setInsertStartTime(Math.floor(newTimestamp / 1000));
                                }}
                                customRenderItem={
                                    <View style={styles.recordTimeEditContainer}>
                                        <Text style={styles.recordTimestampEdit}>
                                            {insertStartTime ? moment.unix(insertStartTime).format("h:mm a") : "Seleccione hora"}
                                        </Text>
                                    </View>
                                }
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.modalInputTitle}>Hora de fin</Text>
                            <FliwerButtonDateTimePicker
                                mode="time"
                                date={insertEndTime ? new Date(insertEndTime * 1000) : (insertTargetRecord?new Date(insertTargetRecord.record.insertTime*1000):null)}
                                timeIntervals={1}
                                onChange={(date) => {
                                    const newTimestamp = date * 1000;
                                    setInsertEndTime(Math.floor(newTimestamp / 1000));
                                }}
                                customRenderItem={
                                    <View style={styles.recordTimeEditContainer}>
                                        <Text style={styles.recordTimestampEdit}>
                                            {insertEndTime ? moment.unix(insertEndTime).format("h:mm a") : "Seleccione hora"}
                                        </Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>

                    <FliwerGreenButton
                        text="Guardar"
                        style={{ marginTop: 30 }}
                        containerStyle={{ width: "50%", alignSelf: "center" }}
                        onPress={confirmInsertBetween}
                    />
                </View>
            </Modal>

            <Modal
                animationType="fade"
                visible={startStopModalVisible}
                onClose={() => {
                    setStartStopModalVisible(false)
                }}
                inStyle={[styles.modalIn,{maxWidth:"80%",width:"auto"}]}
            >
                <View style={{ padding: 10 }}>
                    <Text style={styles.modalViewTitle}>Registro de día anterior</Text>
                </View>
                <View style={{display:"flex"}}>
                    <View style={{display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom: 10}}>
                        <Text style={{}}>Hora de inicio</Text>
                        <FliwerButtonDateTimePicker
                            mode="time"
                            date={insertStartTime ? new Date(insertStartTime * 1000) : defaultStart}
                            timeIntervals={1}
                            onChange={(date) => {
                                const newTimestamp = date * 1000;
                                setInsertStartTime(Math.floor(newTimestamp / 1000));
                            }}
                            customRenderItem={
                                <View style={[styles.recordTimeEditContainer,{width:120}]}>
                                    <Text style={styles.recordTimestampEdit}>
                                        {insertStartTime ? moment.unix(insertStartTime).format("h:mm a") : "Selecciona hora"}
                                    </Text>
                                </View>
                            }
                        />               
                    </View>
                    <View style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexDirection:"row",marginBottom: 10}}>
                        <Text style={{}}>Hora de fin</Text>
                        <FliwerButtonDateTimePicker
                            mode="time"
                            date={insertEndTime ? new Date(insertEndTime * 1000) : defaultEnd}
                            timeIntervals={1}
                            onChange={(date) => {
                                const newTimestamp = date * 1000;
                                setInsertEndTime(Math.floor(newTimestamp / 1000));
                            }}
                            customRenderItem={
                                <View style={[styles.recordTimeEditContainer,{width:120}]}>
                                    <Text style={styles.recordTimestampEdit}>
                                        {insertEndTime ? moment.unix(insertEndTime).format("h:mm a") : "Selecciona hora"}
                                    </Text>
                                </View>
                            }
                        />         
                    </View>
                </View>

                <FliwerGreenButton
                    text="Guardar"
                    style={{width: "50%",alignSelf: "center",marginBottom:10}}
                    containerStyle={{ alignSelf: "center"  }}
                    onPress={confirmInsertStartStop}
                />

            </Modal>

            <FliwerDeleteModal
                visible={modalVisible !== null}
                onClose={() => {
                    setModalVisible(null);
                }}
                onConfirm={async () => {
                    handleDelete(modalVisible)
                    setModalVisible(null);
                }}
                title={"¿Quieres borrar el registro?"}
                hiddeText={true}
                password={false}
            />
            {loading || !clockIn ? (<FliwerLoading />) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "80%",
        maxWidth: 700,
        padding: 10
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
        fontSize: 18
    },
    headerRow: {
        width: "100%",
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        height: 40
    },
    centered: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 0,
        padding: 16,
        width: "100%",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center"
    },
    columnContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 0,
        padding: 16
    },
    circleButton: {
        width: 150,
        height: 150,
        borderRadius: 100,
        alignItems: 'center',
        overflow: 'hidden',
        justifyContent: "space-between"
    },
    header: {
        flex: 1,
        paddingVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        textAlign: "center",
        width: '100%',
        padding: 5
    },
    content: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
    },
    bottom: {
        flex: 1
    },
    circleButton2: {
        width: 100,
        height: 100,
        borderRadius: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4
    },
    circleTimer: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
        textAlign: "center"
    },
    recordsContainer: {
        marginTop: 20
    },
    recordTimeEditContainer: {
        display: "flex",
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: 5,
        height: 40,
        borderWidth: 1,
        borderColor: "black"
    }
});


export default ClockInDetails;
