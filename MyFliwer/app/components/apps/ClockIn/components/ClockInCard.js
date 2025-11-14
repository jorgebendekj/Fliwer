import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import moment from "moment";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';

const ClockInCard = ({
    item,
    hanldeRedirects,
    selectedClockIn,
    id,
    isToday,
    isMostRecent,
    status
}) => {

    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [total, setTotal] = useState(null)
    const [rest, setRest] = useState(null)

    const formatDate = (date) => {
        return date.format("hh:mm A");
    };

    const formatSeconds = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const hoursPart = hours > 0 ? `${hours} hs` : "";
        const minutesPart = minutes > 0 ? `${minutes} m` : "";

        return `${hoursPart} ${minutesPart}`.trim() || "0 m";
    };

    useEffect(() => {
        if (!item.actions || item.actions.length === 0) return;

        const validActions = [...item.actions.filter(r => r.deleted !== 1)].sort((a, b) => a.insertTime - b.insertTime);

        const start = validActions[0]?.insertTime;
        const end = validActions.find(r => r.action === "stop")?.insertTime;

        if (start) setStartDate(moment.unix(start));
        if (end) setEndDate(moment.unix(end));
    }, [item.actions]);


    useEffect(() => {
        if (!item?.actions?.length) return;

        const sortedActions = [...item.actions.filter(r => !r.deleted)].sort(
            (a, b) => a.insertTime - b.insertTime
        );

        let total = 0;
        let lastStart = null;

        for (const action of sortedActions) {
            const ts = moment.unix(action.insertTime);

            if (action.action === "start") {
                lastStart = ts;
            }

            if ((action.action === "pause" || action.action === "stop") && lastStart?.isValid() && ts.isValid()) {
                const diff = ts.diff(lastStart, "seconds");
                total += Math.max(diff, 0);
                lastStart = null;
            }
        }

        setTotal(total);
    }, [item.actions]);

    useEffect(() => {
        if (!item?.actions?.length) return;

        const sortedActions = [...item.actions.filter(r => !r.deleted)].sort(
            (a, b) => a.insertTime - b.insertTime
        );

        let total = 0;
        let lastPause = null;

        for (const action of sortedActions) {
            const ts = moment.unix(action.insertTime);

            if (action.action === "pause") {
                lastPause = ts;
            }

            if (action.action === "start" && lastPause?.isValid() && ts.isValid()) {
                const diff = ts.diff(lastPause, "seconds");
                total += Math.max(diff, 0);
                lastPause = null;
            }
        }

        const lastAction = sortedActions[sortedActions.length - 1];
        if (lastAction?.action === "pause" && lastPause?.isValid()) {
            const now = moment();
            const diff = now.diff(lastPause, "seconds");
            total += Math.max(diff, 0);
        }

        setRest(total);
    }, [item.actions]);

    return (
        <TouchableOpacity
            style={{
                backgroundColor: isToday ? isMostRecent ? CurrentTheme.lighterCardColor : CurrentTheme.cardColor : CurrentTheme.darkerCardColor,
                marginVertical: 10,
                borderRadius: 8,
                padding: 10,
                borderWidth: selectedClockIn == id ? 2 : 0,
                borderColor: CurrentTheme.selectedColor
            }}
            onPress={hanldeRedirects}
        >
            <Text
                style={[
                    styles.textTitle,
                    {
                        color: CurrentTheme.cardText,
                        fontSize: 16,
                        opacity: 1
                    }
                ]}
                ellipsizeMode='tail'
                numberOfLines={1}
            >
                {item.softId} {item.userName}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    flexShrink: 1,
                    gap: 10
                }}
            >
                <View
                    style={{
                        display: "flex"
                    }}
                >
                    <Image
                        source={{
                            uri: item.image ? item.image : "https://old.fliwer.com/social/img/users_img/fliwer.png?v=1745588927277"
                        }}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: 10,
                            backgroundColor: "white"
                        }}
                        resizeMode={"cover"}
                    />
                </View>
                <View
                    style={{
                        flexGrow: 1,
                        justifyContent: "flex-start",
                        flexShrink: 1
                    }}
                >
                    {
                        item.actions?.length === 0
                        &&
                        <Text
                            style={[
                                styles.textDescription,
                                {
                                    color: CurrentTheme.cardText,
                                    fontSize: 12,
                                    opacity: 1,
                                    flexShrink: 1
                                }
                            ]}
                        >
                            Sin registros
                        </Text>
                    }
                    {
                        startDate && (
                            <Text
                                style={[
                                    styles.textDescription,
                                    {
                                        color: CurrentTheme.cardText,
                                        fontSize: 12,
                                        opacity: 1,
                                        flexShrink: 1
                                    }
                                ]}
                            >
                                Entrada a las {formatDate(startDate)}
                            </Text>
                        )
                    }
                    {
                        endDate && (
                            <Text
                                style={[
                                    styles.textDescription,
                                    {
                                        color: CurrentTheme.cardText,
                                        fontSize: 12,
                                        opacity: 1,
                                        flexShrink: 1
                                    }
                                ]}
                            >
                                Salida a las {formatDate(endDate)}
                            </Text>
                        )
                    }
                    {rest !== null && (
                        <Text
                            style={[
                                styles.textDescription,
                                {
                                    color: CurrentTheme.cardText,
                                    fontSize: 12,
                                    opacity: 1,
                                    flexShrink: 1
                                }
                            ]}
                        >
                            {formatSeconds(rest)} descanso
                        </Text>
                    )}
                    {total !== null && (
                        <Text
                            style={[
                                styles.textDescription,
                                {
                                    color: CurrentTheme.cardText,
                                    fontSize: 12,
                                    opacity: 1,
                                    flexShrink: 1
                                }
                            ]}
                        >
                            {formatSeconds(total)} trabajado
                        </Text>
                    )}
                </View>
                {status && (
                    <View style={styles.statusRow}>
                        <IoniconsIcon
                            name={
                                status === "saved" ? "cloud-done-outline" :
                                    status === "saving" ? "cloud-upload-outline" :
                                        status === "editing" ? "create-outline" :
                                            "alert-circle-outline"
                            }
                            size={16}
                            color="white"
                        />
                        <Text style={styles.statusText}>
                            {status === "saved" && "Guardado"}
                            {status === "saving" && "Guardando..."}
                            {status === "editing" && "Editando..."}
                            {status === "error" && "Error al guardar"}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(ClockInCard);

const styles = StyleSheet.create({
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        color: FliwerColors.primary.black,
        fontSize: 21,
        marginBottom: 10
    },
    textDescription: {
        fontFamily: FliwerColors.fonts.regular,
        color: FliwerColors.primary.black,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
        alignSelf: "flex-end"
    },
    statusText: {
        fontSize: 14,
        color: "white"
    }

});
