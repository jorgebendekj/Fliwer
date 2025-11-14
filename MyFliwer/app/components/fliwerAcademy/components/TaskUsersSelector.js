import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Image,
    Platform
} from "react-native";
import { CheckBox } from "react-native-elements";
import { useDispatch, useSelector } from "react-redux";
import { CurrentTheme } from "../../../utils/FliwerColors";
import FrontLayerWrapper from "../../frontLayerWrapper";
import Modal from "../../../widgets/modal/modal";
import { get } from "../../../actions/languageActions";

/**
 * @param {"clients" | "employees"} type
 * @param {number[]} selectedIds
 * @param {(ids:number[])=>void} onChange
 * @param {boolean} mobile
 */
const TaskUsersSelector = ({ type, selectedIds, onChange, idTask, realData, editable }) => {

    const dispatch = useDispatch();

    const dataReducer = useSelector(state =>
        type === "clients"
            ? state.gardenerReducer.usersListData
            : state.sessionReducer.employees
    );

    const [available, setAvailable] = useState([]);
    const [selected, setSelected] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!dataReducer) return;

        const list = Object.keys(dataReducer).map(k => ({
            first_name: dataReducer[k]?.first_name,
            last_name: dataReducer[k]?.last_name,
            user_id: dataReducer[k]?.user_id,
            image: dataReducer[k]?.image
        }));

        list.sort((a, b) =>
            `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        );

        setSelected(list.filter(u => selectedIds.includes(u.user_id)));
        setAvailable(list.filter(u => !selectedIds.includes(u.user_id)));
    }, [dataReducer, selectedIds]);

    const translator = (label) => {
        return dispatch(get(label))
    }

    const toggle = (user, fromSelected) => {
        const nextIds = fromSelected
            ? selectedIds.filter(id => id !== user.user_id)
            : [...selectedIds, user.user_id];
        onChange(nextIds);

        if (fromSelected) {
            setSelected(prev => prev.filter(u => u.user_id !== user.user_id));
            setAvailable(prev => [...prev, user]);
        } else {
            setAvailable(prev => prev.filter(u => u.user_id !== user.user_id));
            setSelected(prev => [...prev, user]);
        }
    };

    const renderRow = ({ item }, fromSelected) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => toggle(item, fromSelected)}
        >
            <CheckBox
                checked={fromSelected}
                onPress={() => toggle(item, fromSelected)}
            />
            <Text style={styles.text}>{item.first_name} {item.last_name}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            <TouchableOpacity
                style={styles.avatarWrapper}
                disabled={editable}
                onPress={() => setModalVisible(true)}
            >
                {
                    (() => {

                        const combined = [
                            ...(selected || []),
                            ...(realData || [])
                        ];

                        const uniqueUsers = combined.reduce((acc, user) => {
                            if (!acc.find(u => u.user_id === user.user_id)) {
                                acc.push(user);
                            }
                            return acc;
                        }, []);

                        if (uniqueUsers.length === 0) {
                            return (
                                <Text style={{ fontStyle: 'italic', color: '#999' }}>
                                    {translator("Academy_select")}
                                </Text>
                            );
                        }

                        return uniqueUsers.map((user) => {
                            return (
                                Platform.OS === "web" ? (
                                    <img
                                        key={user.user_id}
                                        src={user?.photo_url ? user.photo_url : user.image}
                                        title={user?.name ? user.name : `${user.first_name} ${user.last_name}`}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 16,
                                            objectFit: "cover",
                                            backgroundColor: "white",
                                            marginRight: 6,
                                            marginBottom: 6
                                        }}
                                    />
                                ) : (
                                    <Image
                                        key={user.user_id}
                                        source={{ uri: user.image }}
                                        style={styles.avatar}
                                    />
                                )
                            )
                        });
                    })()
                }
            </TouchableOpacity>

            {modalVisible ? (
                <FrontLayerWrapper key={`${type}Selector${idTask}`}>
                    <Modal
                        visible={modalVisible}
                        animationType="fade"
                        inStyle={styles.modalIn}
                        onClose={() => {
                            setModalVisible(false);
                        }}
                    >
                        <View style={styles.modalView}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>{type === 'clients' ? translator("Academy_associated_clients") : translator("Academy_associated_workers")}</Text>
                                <View style={styles.box}>
                                    <View style={styles.col}>
                                        <Text style={styles.colTitle}>{translator("Available")}</Text>
                                        <FlatList
                                            data={available}
                                            keyExtractor={u => u.user_id.toString()}
                                            renderItem={it => renderRow(it, false)}
                                            ListEmptyComponent={<Text style={styles.empty}>{translator("fliwerCard_no_data")}</Text>}
                                        />
                                    </View>
                                    <View style={styles.col}>
                                        <Text style={styles.colTitle}>{translator("Selected")}</Text>
                                        <FlatList
                                            data={selected}
                                            keyExtractor={u => u.user_id.toString()}
                                            renderItem={it => renderRow(it, true)}
                                            ListEmptyComponent={<Text style={styles.empty}>{translator("fliwerCard_no_data")}</Text>}
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeButton, { backgroundColor: CurrentTheme.cardColor }]}>
                                    <Text style={[styles.closeButtonText, { color: CurrentTheme.cardText }]}>{translator("Devices_button_close")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            ) : null}
        </>
    );
};

export default TaskUsersSelector;

const styles = StyleSheet.create({
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: Platform.OS == "web" ? 600 : 400,
        flexShrink: 1,
    },
    box: { flexDirection: "row", gap: 8, flex: 1 },
    col: { flex: 1, backgroundColor: "#f9f9f9", borderRadius: 8, padding: 8 },
    colTitle: { textAlign: "center", fontWeight: "bold", marginBottom: 8 },
    item: { flexDirection: "row", alignItems: "center", padding: 8, borderBottomWidth: 1, borderBottomColor: "#ddd" },
    text: { marginLeft: 8 },
    empty: { textAlign: "center", marginTop: 16, fontStyle: "italic", color: "#999" },
    avatarWrapper: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', paddingVertical: 6 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ccc' },
    modalContent: { flex: 1, padding: 16, backgroundColor: '#fff' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    closeButton: { marginTop: 16, padding: 12, borderRadius: 8, alignItems: 'center' },
    closeButtonText: { fontWeight: '600' }
});
