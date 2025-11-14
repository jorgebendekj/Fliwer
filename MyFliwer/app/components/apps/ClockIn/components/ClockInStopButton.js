import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";

const ClockInStopButton = ({
    handlePlayPause,
    formatSeconds2,
    validRecords,
    lastAction,
    isStopped
}) => {
    const { width } = useMediaInfo();

    return (
        <TouchableOpacity
            onPress={() => {
                handlePlayPause(lastAction)
            }}
            style={[
                styles.circleButton,
                width<400?{
                    width:width <= 300 ? 100 : width >= 400 ? 150 : 100 + (width - 300) * 0.5,
                    height:width <= 300 ? 100 : width >= 400 ? 150 : 100 + (width - 300) * 0.5
                }:{},
                {
                    opacity: (!validRecords.length || isStopped) ? 0.7 : 1,
                    backgroundColor: CurrentTheme.cardColor
                }
            ]}
            disabled={!validRecords.length || isStopped}
        >
            <View style={styles.header}>
                <Text style={[styles.headerText, { color: CurrentTheme.cardText, borderColor: CurrentTheme.cardText }]}>Stop</Text>
            </View>
            <View style={styles.content}>
                {
                    (!validRecords.length || isStopped)
                        ?
                        formatSeconds2(lastAction?.action === "stop" ? lastAction?.insertTime : 1)
                        :
                        <IoniconsIcon
                            name={"stop-outline"}
                            size={48}
                            color={CurrentTheme.cardText}
                        />
                }
            </View>
            <View style={styles.bottom} />
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
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
    }
});

export default ClockInStopButton;