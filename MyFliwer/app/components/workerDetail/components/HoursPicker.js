import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { CurrentTheme, FliwerColors } from '../../../utils/FliwerColors';

const HoursPicker = ({
    worker,
    setWorker
}) => {

    const handleChange = (text) => {
        // Solo permitir números
        const numeric = text.replace(/[^0-9]/g, '');

        // Limitar entre 0 y 60
        const value = Math.min(Number(numeric), 60);
        setWorker({
            ...worker,
            weeklyHours: numeric
        })

        if (!isNaN(value)) {
            onChange?.(value);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>Horas laborales:</Text>
            <View style={styles.container2}>
                <TextInput
                    value={worker?.weeklyHours || 40}
                    onChangeText={handleChange}
                    keyboardType="numeric"
                    maxLength={2}
                    style={[styles.modalInputArea]}
                    placeholder="0"
                    disabled={worker?.isUser}
                />
                <Text style={styles.label}>HS</Text>
            </View>
        </View>
    );
};

export default HoursPicker;

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
    },
    container2: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        color: CurrentTheme.cardText,
        fontSize: 16,
        marginBottom: 6,
        alignSelf: "center"
    },
    modalInputArea: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        backgroundColor: "white",
        width: 50
    },
    label: {
        fontSize: 16,
        color: CurrentTheme.cardText,
        marginLeft: 5
    },
});