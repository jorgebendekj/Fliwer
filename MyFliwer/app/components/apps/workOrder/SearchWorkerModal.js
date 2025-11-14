import React, { useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "../../../widgets/modal/modal";
import { useDispatch, useSelector } from "react-redux";
import { FliwerColors } from "../../../utils/FliwerColors";

const SearchWorkerModal = ({
    visible,
    onClose,
    onSelect
}) => {

    const employees = useSelector(state => state.sessionReducer.employees) || [];
    const user = useSelector(state => state.sessionReducer.data) || null;

    const [searchText, setSearchText] = useState("");

    const filteredEmployees = useMemo(() => {
        const term = searchText.toLowerCase().trim();
        if (!term) return employees;

        return employees.filter(emp => {
            const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
            return fullName.includes(term);
        });
    }, [employees, searchText]);

    return (
        <Modal
            animationType="fade"
            inStyle={[styles.modalIn]}
            visible={visible}
            onClose={() => {
                if (onClose) onClose()
            }}
        >
            <ScrollView contentContainerStyle={styles.modalView}>
                <View style={{ width: "100%" }}>
                    <View style={{}}>
                        <Text
                            style={{
                                textAlign: "center",
                                fontFamily: FliwerColors.fonts.title,
                                fontSize: 21,
                                marginBottom: 10
                            }}
                        >
                            Search worker
                        </Text>
                    </View>

                    <Text style={{ marginBottom: 5 }}>
                        Name
                    </Text>
                    <TextInput
                        style={{
                            height: 40,
                            width: "100%",
                            borderColor: 'gray',
                            borderWidth: 1,
                            padding: 5,
                            marginTop: 5,
                            backgroundColor: "white",
                            marginBottom: 10
                        }}
                        onChangeText={(text) => {
                            setSearchText(text);
                        }}
                        value={searchText}
                        multiline={false}
                        textAlign={'left'}
                    />
                    {user ? (
                        <TouchableOpacity
                            style={{
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: "#e0e0e0"
                            }}
                            onPress={() => {
                                if (onSelect) onSelect(user.user_id);
                                if (onClose) onClose();
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>
                                {user.first_name} {user.last_name}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                    <FlatList
                        data={filteredEmployees}
                        keyExtractor={(item, index) => item.id?.toString() || `${item.first_name}_${item.last_name}_${index}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 10,
                                    borderBottomWidth: 1,
                                    borderColor: "#e0e0e0"
                                }}
                                onPress={() => {
                                    if (onSelect) onSelect(item.idUser);
                                    if (onClose) onClose();
                                }}
                            >
                                <Text style={{ fontSize: 16 }}>
                                    {item.first_name} {item.last_name}
                                </Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginVertical: 10, color: "#999" }}>
                                No results
                            </Text>
                        }
                        style={{ maxHeight: 250 }}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </ScrollView>
        </Modal>
    );
};


export default SearchWorkerModal;

const styles = StyleSheet.create({
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center"
    },
});