import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from "react-native";
import { Camera } from "react-native-camera-kit";
import { useDispatch } from "react-redux";
import { get } from "../../../../actions/languageActions";
import { toast } from "../../../../widgets/toast/toast";

const QRScanner = ({ onRead, onCancel }) => {
    const dispatch = useDispatch();
    const [hasPermission, setHasPermission] = useState(false);
    const [checkedPermission, setCheckedPermission] = useState(false); // para evitar mostrar la cámara mientras se chequean

    const translate = (text) => {
        return dispatch(get(text));
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === "android") {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Permiso para usar la cámara",
                        message: "La aplicación necesita acceso a la cámara para escanear códigos QR.",
                        buttonNeutral: "Preguntar después",
                        buttonNegative: "Cancelar",
                        buttonPositive: "Aceptar",
                    }
                );
                setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
            } catch (err) {
                console.warn(err);
                setHasPermission(false);
            }
        } else {
            // iOS ya gestiona los permisos automáticamente con react-native-camera-kit
            setHasPermission(true);
        }
        setCheckedPermission(true);
    };

    useEffect(() => {
        requestCameraPermission();
    }, []);

    /* useEffect(() => {
        setTimeout(() => {
            onRead("https://qr2.mobi/203dr")
        }, 2000);
    }, []) */

    if (!checkedPermission) {
        return (
            <View style={styles.centeredView}>
                <Text>{translate("Verificando permisos...")}</Text>
            </View>
        );
    }

    if (!hasPermission) {
        return (
            <View style={styles.centeredView}>
                <Text style={{ marginBottom: 20 }}>{translate("No se otorgaron permisos para usar la cámara.")}</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.cancelText}>{translate("Orders_button_cancel")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Camera
                scanBarcode={true}
                onReadCode={(event) => {
                    console.log("event1", event);
                    if (event?.nativeEvent?.codeStringValue) {
                        onRead(event.nativeEvent.codeStringValue);
                    }
                }}
                showFrame={true}
                laserColor={"#FF3D00"}
                frameColor={"#00C853"}
                style={{ flex: 1 }}
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
});

export default QRScanner;
