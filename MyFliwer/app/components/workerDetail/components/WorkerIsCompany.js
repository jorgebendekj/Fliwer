import React from "react";
import { TextInput, View } from "react-native";
import { StyleSheet, Text } from "react-native";
import { CheckBox } from "react-native-elements";
import { CurrentTheme, FliwerColors } from "../../../utils/FliwerColors";

const WorkerIsCompany = ({
    worker,
    setWorker,
    formErrors,
    mobile,
    isUser
}) => {

    return (
        <View
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%"
            }}
        >
            <CheckBox
                title={"Trabajador de una empresa externa"}
                textStyle={styles.modalInputCheckboxText}
                containerStyle={styles.modalInputCheckbox}
                checked={worker.isCompany ? true : false}
                checkedColor={CurrentTheme.cardText}
                onPress={() => {
                    setWorker({
                        ...worker,
                        isCompany: !worker.isCompany
                    })
                }}
                disabled={isUser}
            />

            {
                worker.isCompany
                &&
                <View
                    style={{
                        display: "flex",
                        flexDirection: !mobile ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%"
                    }}
                >
                    <View
                        style={{
                            width: !mobile ? "100%" : "50%",
                            paddingRight: !mobile ? 0 : 10
                        }}
                    >
                        <Text
                            style={styles.modalInputTitle}
                        >
                            Nombre empresa:
                        </Text>
                        <TextInput
                            style={[styles.modalInputArea, (formErrors?.companyName && !worker.companyName) ? styles.modalInputAreaError : {}]}
                            onChangeText={(text) => {
                                setWorker({
                                    ...worker,
                                    companyName: text
                                })
                            }}
                            value={worker.companyName || ""}
                            multiline={false}
                            textAlign="left"
                        />
                    </View>
                    <View
                        style={{
                            width: !mobile ? "100%" : "50%",
                            paddingRight: !mobile ? 0 : 10
                        }}
                    >
                        <Text
                            style={styles.modalInputTitle}
                        >
                            CIF:
                        </Text>
                        <TextInput
                            style={[styles.modalInputArea, (formErrors?.cif && !worker.cif) ? styles.modalInputAreaError : {}]}
                            onChangeText={(text) => {
                                setWorker({
                                    ...worker,
                                    cif: text
                                })
                            }}
                            value={worker.cif || ""}
                            multiline={false}
                            textAlign="left"
                        />
                    </View>
                </View>
            }

        </View>
    )
};

export default WorkerIsCompany;

const styles = StyleSheet.create({
    modalInputCheckboxText: {
        fontWeight: "regular",
        fontFamily: FliwerColors.fonts.title,
        color: CurrentTheme.cardText,
    },
    modalInputCheckbox: {
        backgroundColor: "transparent",
        borderWidth: 0,
        alignSelf: "flex-start"
    },
    modalInputTitle: {
        marginBottom: 5,
        color: CurrentTheme.cardText,
    },
    modalInputArea: {
        height: 40,
        width: "100%",
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        marginTop: 5,
        backgroundColor: "white",
        marginBottom: 10
    },
    modalInputAreaError: {
        borderColor: 'red'
    }
});