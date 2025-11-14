import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from "react-native";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';

const PRIORITY_OPTIONS = [
    { name: "very low", color: "#0084ff" },
    { name: "low", color: "#a3ff82", darkText: true },
    { name: "normal", color: "#ffcc00" },
    { name: "high", color: "#ff9000" },
    { name: "very high", color: "#ff0000" },
    { name: "urgent", color: "#000000" }
];
const STATUS_OPTIONS = [
    { name: "pending", color: "#ff9000" },
    { name: "in progress", color: "#224470" },
    { name: "paused", color: "#797979" },
    { name: "finished", color: "#a3ff82", darkText: true }
];

const TaskCard = ({ item, hanldeRedirects, selectedTask, status }) => {

    const statusInfo = STATUS_OPTIONS.find(s => s.name === item.status);
    const priorityInfo = PRIORITY_OPTIONS.find(p => p.name === item.priority);

    return (
        <TouchableOpacity
            style={{
                backgroundColor: selectedTask == item.id ? CurrentTheme.lighterCardColor : CurrentTheme.darkerCardColor,
                marginVertical: 10,
                borderRadius: 8,
                padding: 10,
                borderWidth: selectedTask == item.id ? 2 : 0,
                borderColor: FliwerColors.primary.green
            }}
            onPress={hanldeRedirects}
        >
            <Text style={[styles.textTitle, { color: CurrentTheme.cardText }]}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {item.id} - {item.title}
            </Text>

            <Text
                style={[styles.textDescription, { color: CurrentTheme.cardText }]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {item.description || "—"}
            </Text>

            <View style={styles.statusPriorityRow}>
                {priorityInfo && (
                    <View
                        style={[
                            styles.statusBox,
                            { backgroundColor: priorityInfo.color }
                        ]}
                    >
                        <Text
                            style={{
                                color: priorityInfo.darkText ? "black" : "white",
                                fontSize: 12,
                                fontFamily: FliwerColors.fonts.regular
                            }}
                        >
                            {item.priority}
                        </Text>
                    </View>
                )}
                {statusInfo && (
                    <View
                        style={[
                            styles.statusBox,
                            { backgroundColor: statusInfo.color }
                        ]}
                    >
                        <Text
                            style={{
                                color: statusInfo.darkText ? "black" : "white",
                                fontSize: 12,
                                fontFamily: FliwerColors.fonts.regular
                            }}
                        >
                            {item.status}
                        </Text>
                    </View>
                )}
            </View>
            {item.clients?.length > 0 && (
                <View style={styles.avatarRow}>
                    <Text style={styles.avatarLabel}>Clientes:</Text>
                    <View style={styles.avatarContainer}>
                        {item.clients.map((client) => (
                            Platform.OS === "web" ? (
                                <img
                                    key={`client-${client.idUser}`}
                                    src={client.photo_url || "https://old.fliwer.com/social/img/users_img/fliwer.png"}
                                    title={client.name || "Cliente"}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: "white",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : (
                                <Image
                                    key={`client-${client.idUser}`}
                                    source={{ uri: client.photo_url || "https://old.fliwer.com/social/img/users_img/fliwer.png" }}
                                    style={styles.avatar}
                                />
                            )

                        ))}
                    </View>
                </View>
            )}
            {item.assigned?.length > 0 && (
                <View style={styles.avatarRow}>
                    <Text style={styles.avatarLabel}>Trabajadores:</Text>
                    <View style={styles.avatarContainer}>
                        {item.assigned.map((worker) => (
                            Platform.OS === "web" ? (
                                <img
                                    key={`worker-${worker.idUser}`}
                                    src={worker.photo_url || "https://old.fliwer.com/social/img/users_img/fliwer.png"}
                                    title={worker.name || "Trabajador"}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: "white",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : (
                                <Image
                                    key={`worker-${worker.idUser}`}
                                    source={{ uri: worker.photo_url || "https://old.fliwer.com/social/img/users_img/fliwer.png" }}
                                    style={styles.avatar}
                                />
                            )
                        ))}
                    </View>
                </View>
            )}
            {status && (
                <View style={styles.statusRow}>
                    {status === "saved" && (
                        <>
                            <IoniconsIcon name="cloud-done-outline" size={16} color="white" />
                            <Text style={styles.statusLabel}>Guardado</Text>
                        </>
                    )}
                    {status === "saving" && (
                        <>
                            <IoniconsIcon name="cloud-upload-outline" size={16} color="white" />
                            <Text style={styles.statusLabel}>Guardando...</Text>
                        </>
                    )}
                    {status === "editing" && (
                        <>
                            <IoniconsIcon name="create-outline" size={16} color="white" />
                            <Text style={styles.statusLabel}>Editando...</Text>
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <IoniconsIcon name="alert-circle-outline" size={16} color="white" />
                            <Text style={styles.statusLabel}>Error al guardar</Text>
                        </>
                    )}
                </View>
            )}


        </TouchableOpacity>
    );
};

export default React.memo(TaskCard);

const styles = StyleSheet.create({
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        fontSize: 16,
        marginBottom: 6
    },
    textDescription: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 13,
        marginBottom: 2
    },
    statusPriorityRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 4
    },
    statusBox: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 6
    },
    avatarLabel: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 13,
        color: CurrentTheme.cardText
    },
    avatarContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "white"
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
        alignSelf: "flex-end"
    },
    statusLabel: {
        fontSize: 12,
        color: "white",
        fontFamily: FliwerColors.fonts.regular,
    },

});
