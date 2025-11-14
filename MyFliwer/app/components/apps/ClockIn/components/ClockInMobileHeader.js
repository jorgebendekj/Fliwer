import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import { useDispatch } from "react-redux";
import { setPortraitScreen } from "../../../../actions/wrapperActions";

const ClockInMobileHeader = ({ clockInStatus, idClockIn }) => {
    const dispatch = useDispatch();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity
                    onPress={() => dispatch(setPortraitScreen(1))}
                    style={styles.backButton}
                >
                    <IoniconsIcon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                {clockInStatus?.[idClockIn] && (
                    <View style={styles.statusRow}>
                        <IoniconsIcon
                            name={
                                clockInStatus[idClockIn] === "saved"
                                    ? "cloud-done-outline"
                                    : clockInStatus[idClockIn] === "saving"
                                        ? "cloud-upload-outline"
                                        : clockInStatus[idClockIn] === "editing"
                                            ? "create-outline"
                                            : "alert-circle-outline"
                            }
                            size={16}
                            color="white"
                        />
                        <Text style={styles.statusText}>
                            {clockInStatus[idClockIn] === "saved" && "Guardado"}
                            {clockInStatus[idClockIn] === "saving" && "Guardando..."}
                            {clockInStatus[idClockIn] === "editing" && "Editando..."}
                            {clockInStatus[idClockIn] === "error" && "Error"}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default ClockInMobileHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: FliwerColors.primary.green,
        marginBottom: 8,
        padding: 10
    },
    backButton: {
        padding: 6
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    statusText: {
        fontSize: 14,
        color: "white"
    }
});
