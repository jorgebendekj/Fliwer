import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CurrentTheme, FliwerColors } from "../../../utils/FliwerColors";

const weekDays = [
    { label: 'L', value: 'lunes' },
    { label: 'M', value: 'martes' },
    { label: 'X', value: 'miércoles' },
    { label: 'J', value: 'jueves' },
    { label: 'V', value: 'viernes' },
    { label: 'S', value: 'sábado' },
    { label: 'D', value: 'domingo' }
];
const DaysPicker = ({
    worker,
    setWorker
}) => {

    const toggleDay = (day) => {
        const isSelected = worker?.selectedDays.includes(day);
        const updatedDays = isSelected
            ? worker?.selectedDays.filter(d => d !== day)
            : [...worker?.selectedDays, day];

        setWorker({
            ...worker,
            selectedDays: updatedDays
        });
        onChange?.(updatedDays);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>Dias laborales:</Text>
            <View style={styles.container2}>
                {weekDays.map((day) => {
                    const isSelected = worker?.selectedDays?.includes(day.value);
                    return (
                        <TouchableOpacity
                            key={day.value}
                            style={[styles.circle, isSelected && styles.selectedCircle]}
                            onPress={() => toggleDay(day.value)}
                            disabled={worker?.isUser}
                        >
                            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    )
};

export default DaysPicker;

const styles = StyleSheet.create({
    container: {
        marginTop: 10
    },
    container2: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
        gap: 10
    },
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        color: CurrentTheme.cardText,
        fontSize: 16,
        marginBottom: 6,
        alignSelf: "center"
    },
    columnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#aaa',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectedCircle: {
        backgroundColor: FliwerColors.secondary.green,
        borderColor: FliwerColors.secondary.lightGreen,
    },
    label: {
        fontSize: 16,
        color: '#333',
    },
    selectedLabel: {
        color: '#fff',
        fontWeight: 'bold',
    },
});