import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckBox } from "react-native-elements";
import { useSelector } from "react-redux";
import { CurrentTheme, FliwerColors } from "../../../utils/FliwerColors";

const WorkerPermissions = ({
    worker,
    setWorker,
    mobile
}) => {

    const data = useSelector(state => state.sessionReducer.data);

    return (
        <View
            style={{
                display: "flex",
                flexDirection: !mobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%"
            }}
        >
            <Text style={[styles.textTitle]}>{"Permisos:"}</Text>
            <CheckBox
                title={"Trabajador"}
                textStyle={styles.modalInputCheckboxText}
                containerStyle={styles.modalInputCheckbox}
                checked={worker.roles && worker.roles.gardener ? true : false}
                checkedColor={"white"}
                onPress={() => {
                    setWorker({
                        ...worker,
                        roles: {
                            ...worker.roles,
                            gardener: worker.roles.gardener ? 0 : 1
                        }
                    })
                }}
            />
            <CheckBox
                title={"Contable"}
                textStyle={styles.modalInputCheckboxText}
                containerStyle={styles.modalInputCheckbox}
                checked={worker.roles && worker.roles.accountant ? true : false}
                checkedColor={"white"}
                onPress={() => {
                    setWorker({
                        ...worker,
                        roles: {
                            ...worker.roles,
                            accountant: worker.roles.accountant ? 0 : 1
                        }
                    })
                }}
            />

            {
                data.bussinessOwner == data.user_id
                &&
                <CheckBox
                    title={"Manager"}
                    textStyle={styles.modalInputCheckboxText}
                    containerStyle={styles.modalInputCheckbox}
                    checked={worker.roles && worker.roles.manager ? true : false}
                    checkedColor={"white"}
                    onPress={() => {
                        setWorker({
                            ...worker,
                            roles: {
                                ...worker.roles,
                                manager: worker.roles.manager ? 0 : 1
                            }
                        })
                    }}
                />
            }
        </View>
    )
};

export default WorkerPermissions;

const styles = StyleSheet.create({
    textTitle: {
        fontFamily: "Montserrat-Regular",
        color: "white",
        fontSize: 16
    },
    modalInputArea: {
        height: 40,
        width: "100%",
        borderColor: 'gray',
        borderWidth: 1,
        padding: 5,
        marginTop: 5,
        backgroundColor: "white",
    },
    modalInputCheckboxText: {
        fontWeight: "regular",
            fontFamily: "Montserrat-Regular",
        color: "white",
    },
    modalInputCheckbox: {
        backgroundColor: "transparent",
        borderWidth: 0,
    },
});