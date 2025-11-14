import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CurrentTheme } from "../../../../utils/FliwerColors";

const CLockInRestHours = ({
    formatSeconds,
    pauseTime
}) => {
    return (
        <View>
            <View style={{ alignItems: "center" }}>
                <Text style={[styles.circleTimer, { marginBottom: 5, color: CurrentTheme.complementaryBackgroundText }]}>
                    Descansado
                </Text>
            </View>
            <View style={[styles.circleButton2, { backgroundColor: CurrentTheme.complementaryCardColor }]}>
                <View style={{ alignItems: "center" }}>
                    {formatSeconds(pauseTime)}
                </View>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
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
    }
});

export default CLockInRestHours;