import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CurrentTheme } from "../../../utils/FliwerColors";
import CustomTextInput from "../../textInput/CustomTextInput";

const fields = [
    { label: "NIF:", key: "nif" },
    { label: "Dirección:", key: "address" },
    { label: "Código Postal:", key: "zipCode" },
    { label: "Ciudad:", key: "city" },
    { label: "IBAN:", key: "iban" },
];

const ExpandedInfo = ({
    worker,
    setWorker,
    mobile,
    isUser,
    editMode
}) => {

    const isMobile = !mobile;

    return (
        <View
            style={[
                {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginTop: 10
                },
                isMobile && {
                    flexDirection: "column"
                }
            ]}
        >
            {fields.map(({ label, key }) => (
                <View
                    key={key}
                    style={[
                        styles.inputGridItem,
                        isMobile && {
                            width: "100%",
                            gap: 5
                        }
                    ]}
                >
                    <Text style={styles.modalInputTitle}>{label}</Text>
                    {editMode ? (
                        <CustomTextInput
                            value={worker[key] || ""}
                            onChangeText={(text) => setWorker({ ...worker, [key]: text })}
                            editable={!isUser}
                        />
                    ) : (
                        <Text style={styles.viewValueText}>{worker[key] || "-"}</Text>
                    )}
                </View>
            ))}
            <View style={styles.inputGridItem} />
        </View>
    );
};

export default ExpandedInfo;

const styles = StyleSheet.create({
    modalInputTitle: {
        marginBottom: 5,
        color: CurrentTheme.cardText,
        fontFamily: "Montserrat-Regular",
    },
    inputGridItem: {
        width: '32%',
        marginBottom: 10,
    },
    viewValueText: {
        color: "white",
        fontFamily: "Montserrat-Regular",
    },
});
