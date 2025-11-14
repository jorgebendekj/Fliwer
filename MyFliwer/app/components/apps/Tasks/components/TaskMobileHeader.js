import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import { useDispatch } from "react-redux";
import { setPortraitScreen } from "../../../../actions/wrapperActions";

const TaskMobileHeader = ({ task, taskStatus, idTask }) => {
    const dispatch = useDispatch();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: FliwerColors.primary.green
                }
            ]}
        >
            <View style={styles.content}>
                <TouchableOpacity
                    onPress={() => dispatch(setPortraitScreen(1))}
                    style={styles.backButton}
                >
                    <IoniconsIcon name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                 {taskStatus?.[idTask] && (
                <View style={styles.statusRow}>
                    <IoniconsIcon
                        name={
                            taskStatus[idTask] === "saved" ? "cloud-done-outline" :
                                taskStatus[idTask] === "saving" ? "cloud-upload-outline" :
                                    taskStatus[idTask] === "editing" ? "create-outline" :
                                        "alert-circle-outline"
                        }
                        size={16}
                        color={
                            taskStatus[idTask] === "saved" ? "white" :
                                taskStatus[idTask] === "saving" ? "white" :
                                    taskStatus[idTask] === "editing" ? "white" :
                                        "white"
                        }
                    />
                    <Text style={styles.statusText}>
                        {taskStatus[idTask] === "saved" && "Guardado"}
                        {taskStatus[idTask] === "saving" && "Guardando..."}
                        {taskStatus[idTask] === "editing" && "Editando..."}
                        {taskStatus[idTask] === "error" && "Error"}
                    </Text>
                </View>
            )}
            </View>
           
        </View>
    );
};

export default TaskMobileHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: CurrentTheme.cardColor,
        marginBottom: 8,
        padding: 10
    },
    backButton: {
        marginRight: 10,
        backgroundColor: FliwerColors.primary.green,
        padding: 6,
        borderRadius: 20
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
        gap: 4,
    },
    statusText: {
        fontSize: 14,
        color: "white"
    }
});
