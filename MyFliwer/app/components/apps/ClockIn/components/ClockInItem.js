import React, {
    useEffect,
    useState
} from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Animated,
    Easing
} from "react-native";
import moment from "moment";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import FliwerButtonDateTimePicker from "../../../custom/FliwerButtonDateTimePicker";
import { toast } from "../../../../widgets/toast/toast";
import FliwerDeleteModal from "../../../custom/FliwerDeleteModal";
import CustomTextInput from "../../../textInput/CustomTextInput";

const ClockInItem = React.memo(({
    action,
    isFirst,
    nextAction,
    nextNextAction,
    prevRecord,
    isEditing,
    onEdit,
    onSave,
    updateAction,
    handleDelete,
    handleInsertBetween
}) => {

    const [animation] = useState(new Animated.Value(0));

    const [showHistory, setShowHistory] = useState(false);
    const [confirmEditModal, setConfirmEditModal] = useState(false);

    const [localComment, setLocalComment] = useState(action?.comment);
    const [actionTime, setActionTime] = useState(null)
    const [nextActionTime, setNextActionTime] = useState(null)

    const validateNewTimestamp = (newTimestampMs) => {
        if (nextAction && newTimestampMs >= nextAction.insertTime * 1000) {
            toast.error("No puede ingresar un horario mayor al siguiente registro.");
            return false;
        }
        if (prevRecord && newTimestampMs <= prevRecord.insertTime * 1000) {
            toast.error("No puede ingresar un horario menor al registro previo.");
            return false;
        }
        return true;
    };


    const validateNextTimestamp = (newTimestampMs) => {
        if (newTimestampMs <= action.insertTime * 1000) {
            toast.error("No puede ingresar un horario menor al registro previo.");
            return false;
        }

        if (nextNextAction && newTimestampMs >= nextNextAction.insertTime * 1000) {
            toast.error("No puede ingresar un horario mayor al siguiente registro.");
            return false;
        }

        return true;
    };

    useEffect(() => {
        if (showHistory) {
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
    }, [showHistory]);

    return (
        <View style={[styles.recordItem, { opacity: action?.deleted ? 0.5 : 1, backgroundColor: CurrentTheme.cardColor }]}>
            <View style={{ flex: 1 }}>
                <View style={styles.rowContainer}>
                    <View style={[styles.rowContainer, {
                        borderColor: CurrentTheme.cardText,
                        borderWidth: 1,
                        padding: 5,
                        width: 130
                    }]}>
                        <IoniconsIcon
                            name={action?.action === "start" ? "arrow-forward" : action?.action === "pause" ? "cafe-outline" : "stop-outline"}
                            size={20}
                            color={CurrentTheme.cardText}
                        />
                        <Text style={[styles.recordTimestamp, { color: CurrentTheme.cardText }]}>
                            {action?.action === "start" ? "Clocked in" : action?.action === "pause" ? "Break" : "Stop"}
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
                                date={action.insertTime}
                                timeIntervals={1}
                                styleButtonContainer={{ width: "100%" }}
                                onChange={(date) => {
                                    const selectedMoment = moment(date * 1000);
                                    const originalMoment = moment.unix(action.insertTime);

                                    const combinedMoment = originalMoment
                                        .hour(selectedMoment.hour())
                                        .minute(selectedMoment.minute())
                                        .second(0);

                                    const newTimestamp = combinedMoment.valueOf();

                                    if (validateNewTimestamp(newTimestamp)) {
                                        setActionTime(Math.floor(newTimestamp / 1000));
                                    }
                                }}
                                customRenderItem={
                                    <View style={styles.recordTimeEditContainer}>
                                        <Text style={styles.recordTimestampEdit}>
                                            {moment.unix(actionTime ? actionTime : action.insertTime).format("h:mm a")}
                                        </Text>
                                    </View>
                                }
                            />
                            {isEditing && nextAction && (
                                <Text style={[styles.recordTimestamp, { color: CurrentTheme.cardText }]}>
                                    a
                                </Text>
                            )}
                            {isEditing && nextAction && (
                                <FliwerButtonDateTimePicker
                                    mode={"time"}
                                    date={moment.unix(nextAction.insertTime).format("h:mm a")}
                                    timeIntervals={1}
                                    styleButtonContainer={{ width: "100%" }}
                                    onChange={(date) => {
                                        const selectedMoment = moment(date * 1000);
                                        const originalMoment = moment.unix(nextAction.insertTime);

                                        const combinedMoment = originalMoment
                                            .hour(selectedMoment.hour())
                                            .minute(selectedMoment.minute())
                                            .second(0);

                                        const newTimestamp = combinedMoment.valueOf();

                                        if (validateNextTimestamp(newTimestamp)) {
                                            setNextActionTime(Math.floor(newTimestamp / 1000));
                                        }
                                    }}
                                    customRenderItem={
                                        <View style={styles.recordTimeEditContainer}>
                                            <Text style={styles.recordTimestampEdit}>
                                                {moment.unix(nextActionTime ? nextActionTime : nextAction.insertTime).format("h:mm a")}
                                            </Text>
                                        </View>
                                    }
                                />
                            )}
                        </View>
                    ) : (
                        <Text style={[styles.recordTimestamp, { color: CurrentTheme.cardText }]}>
                            {moment.unix(action.insertTime).format("h:mm a")}
                            {nextAction
                                ? ` a ${moment.unix(nextAction.insertTime).format("h:mm a")}`
                                : ""}
                        </Text>
                    )}


                    {!isEditing ? (
                        <Text style={[styles.recordTimestamp, { color: CurrentTheme.cardText }]}>
                            {action?.comment || "Sin observación"}
                        </Text>
                    ) : (
                        <CustomTextInput
                            value={localComment}
                            onChangeText={setLocalComment}
                            autoFocus
                            onSubmitEditing={() => {
                                setConfirmEditModal(true);
                            }}
                            style={{
                                height: 40,
                                borderWidth: 1,
                                minWidth: 150,
                                flex: 1,
                                marginRight: 10,
                                marginBottom: 0
                            }}
                        />

                    )}
                </View>

                {action.history?.length > 0 && (
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
                        pointerEvents={showHistory ? 'auto' : 'none'}
                    >
                        {showHistory && action?.history.map((log, index) => {
                            const formattedDate = moment.unix(log?.insertTime).format("DD/MM HH:mm");
                            const userName = log?.updateName;
                            const messages = [];

                            const isFirstEntry = index === 0;
                            const isDeleted = log?.deleted === 1;

                            const commentChanged =
                                log?.previousComment !== null &&
                                log?.newComment !== null &&
                                log?.previousComment !== log?.newComment;

                            const timeChanged =
                                log?.previousInsertTime !== null &&
                                log?.newInsertTime !== null &&
                                log?.previousInsertTime !== log?.newInsertTime;

                            if (isFirstEntry) {
                                messages.push(`Registro añadido por ${userName} el ${formattedDate}`);
                            } else {
                                if (commentChanged) {
                                    messages.push(
                                        `${userName} cambió el comentario de "${log.previousComment}" a "${log.newComment}" el ${formattedDate}`
                                    );
                                }

                                if (timeChanged) {
                                    const prevTime = moment.unix(log.previousInsertTime).format("HH:mm");
                                    const newTime = moment.unix(log.newInsertTime).format("HH:mm");
                                    messages.push(
                                        `${userName} cambió la hora de "${prevTime}" a "${newTime}" el ${formattedDate}`
                                    );
                                }

                                if (isDeleted) {
                                    messages.push(`${userName} eliminó este registro el ${formattedDate}`);
                                }
                            }

                            return messages.map((message, subIndex) => (
                                <Text key={`${index}-${subIndex}`} style={[styles.recordTimestamp, { color: CurrentTheme.cardText }]}>
                                    • {message}
                                </Text>
                            ));
                        })}
                    </Animated.View>
                )}
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, height: '100%' }}>
                {isEditing ? (
                    <IoniconsIcon
                        name="save-outline"
                        size={24}
                        color={CurrentTheme.cardText}
                        onPress={() => {
                            if (localComment == action.comment && !actionTime && !nextActionTime) {
                                onSave();
                            } else {
                                setConfirmEditModal(true);
                            }
                        }}
                    />
                ) :
                    !action?.deleted
                    && (
                        <IoniconsIcon
                            name="pencil-outline"
                            size={24}
                            color={CurrentTheme.cardText}
                            onPress={onEdit}
                        />
                    )}

                {isEditing && nextAction ? (
                    <IoniconsIcon
                        name="add-circle-outline"
                        size={24}
                        color={CurrentTheme.cardText}
                        onPress={() => {
                            handleInsertBetween(action)
                        }}
                    />
                ) : (
                    <>
                        <IoniconsIcon
                            name={showHistory ? "chevron-up-outline" : "time-outline"}
                            size={24}
                            color={CurrentTheme.cardText}
                            onPress={() => setShowHistory(prev => !prev)}
                        />

                        {
                            !action?.deleted && !isFirst
                            &&
                            <IoniconsIcon
                                name="trash-outline"
                                size={24}
                                color={CurrentTheme.cardText}
                                onPress={() => handleDelete(action.id)}
                            />
                        }
                    </>
                )}


            </View>

            <FliwerDeleteModal
                visible={confirmEditModal}
                onClose={() => {
                    setConfirmEditModal(false);
                    onSave();
                    setLocalComment(action?.comment)
                    setActionTime(null)
                    setNextActionTime(null)
                }}
                onConfirm={async () => {
                    updateAction({
                        actionId: action.id,
                        nextActionId: nextAction?.id || null,
                        comment: localComment == action.comment ? "" : localComment,
                        actionTime: actionTime,
                        nextActionTime: nextActionTime
                    });
                    onSave();
                    setConfirmEditModal(false);
                }}
                title={"¿Quieres actualizar el registro?"}
                hiddeText={true}
                password={false}
            />
        </View>
    );
});

export default ClockInItem

const styles = StyleSheet.create({
    recordItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        marginBottom: 12,
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
        fontSize: 14
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
        borderColor: "black",
    }
});