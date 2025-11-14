import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";

const ClockInStartButton = ({
    handlePlayPause,
    formatSeconds2,
    validRecords,
    isToday
}) => {
    const { width } = useMediaInfo();
    
    return (
        <TouchableOpacity
            onPress={() => handlePlayPause()}
            style={[
                styles.circleButton,
                width<400?{
                    width:width <= 300 ? 100 : width >= 400 ? 150 : 100 + (width - 300) * 0.5,
                    height:width <= 300 ? 100 : width >= 400 ? 150 : 100 + (width - 300) * 0.5
                }:{},
                {
                    opacity: (validRecords.length > 0 /*|| !isToday*/) ? 0.7 : 1,
                    borderColor: CurrentTheme.selectedColor,
                    borderWidth: (validRecords.length > 0 || !isToday) ? 0 : 1,
                    backgroundColor: CurrentTheme.cardColor
                }
            ]}
            disabled={validRecords.length > 0 /*|| !isToday*/}
        >
            <View style={styles.header}>
                <Text style={[styles.headerText, { color: CurrentTheme.cardText, borderColor: CurrentTheme.cardText }]}>Start</Text>
            </View>
            <View style={styles.content}>
                {
                    validRecords.length
                        ?
                        formatSeconds2(validRecords[0]?.insertTime || null)
                        :
                        <IoniconsIcon
                            name={"play-outline"}
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

export default ClockInStartButton;