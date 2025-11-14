// QRScanner.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Camera } from "react-native-camera-kit";
import { useDispatch } from "react-redux";
import { get } from "../../../../actions/languageActions";

const QRScanner = ({ onRead, onCancel }) => {

    const dispatch = useDispatch();

    const translate = (text) => {
        return dispatch(get(text));
    };
    
    return (
        <View style={{ flex: 1 }}>
            <Camera
                scanBarcode={true}
                onReadCode={(event) => {
                    if (event?.nativeEvent?.codeStringValue) {
                        onRead(event.nativeEvent.codeStringValue);
                    }
                }}
                showFrame={true}
                laserColor={"#FF3D00"}
                frameColor={"#00C853"}
                style={{
                    flex: 1
                }}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelText}>
                    {translate("Orders_button_cancel")}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cancelButton: {
        position: "absolute",
        bottom: 40,
        alignSelf: "center",
        backgroundColor: "#00000088",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    cancelText: {
        color: "white",
        fontSize: 16,
    },
});

export default QRScanner;
