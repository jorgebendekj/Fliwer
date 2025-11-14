import React, { useEffect, useState } from "react";
import { Text, View, FlatList, TouchableOpacity, TextInput, Image, Platform } from "react-native";
import { CheckBox } from "react-native-elements";
import { useSelector } from "react-redux";
import FrontLayerWrapper from "../../frontLayerWrapper";
import Modal from "../../../widgets/modal/modal";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';

const GenericSelector = ({
    title,
    reducerSelector,
    workerField,
    worker,
    setWorker,
    mobile
}) => {
    const dataReducer = useSelector(reducerSelector);

    const [allItems, setAllItems] = useState([]);
    const [search, setSearch] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!dataReducer) return;

        const items = Object.keys(dataReducer).map((key) => ({
            first_name: dataReducer[key]?.first_name,
            last_name: dataReducer[key]?.last_name,
            user_id: dataReducer[key]?.user_id,
            photo_url: dataReducer[key]?.photo_url,
        }));

        items.sort((a, b) => {
            const nameA = `${a.first_name} ${a.last_name}`;
            const nameB = `${b.first_name} ${b.last_name}`;
            return nameA.localeCompare(nameB);
        });

        setAllItems(items);
    }, [dataReducer]);

    const toggleItem = (item) => {
        const currentIds = worker[workerField] || [];
        let updatedIds;
        if (currentIds.includes(item.user_id)) {
            updatedIds = currentIds.filter((id) => id !== item.user_id);
        } else {
            updatedIds = [...currentIds, item.user_id];
        }
        setWorker({ ...worker, [workerField]: updatedIds });
    };

    const toggleAll = () => {
        const currentIds = worker[workerField] || [];
        if (currentIds.length === allItems.length) {
            setWorker({ ...worker, [workerField]: [] });
        } else {
            const allIds = allItems.map((i) => i.user_id);
            setWorker({ ...worker, [workerField]: allIds });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
                paddingVertical: 6,
                paddingHorizontal: 8,
            }}
            onPress={() => toggleItem(item)}
        >
            <CheckBox
                checked={(worker[workerField] || []).includes(item.user_id)}
                onPress={() => toggleItem(item)}
            />
            {item.photo_url ? (
                <Image
                    source={{ uri: item.photo_url }}
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        marginLeft: 6,
                    }}
                />
            ) : (
                <View
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#ccc",
                        marginLeft: 6,
                    }}
                />
            )}
            <Text
                style={{
                    marginLeft: 8,
                    fontSize: 14,
                    fontFamily: "Montserrat-Regular",
                }}
            >
                {item.first_name} {item.last_name}
            </Text>
        </TouchableOpacity>
    );

    const selectedItems = allItems.filter((i) =>
        (worker[workerField] || []).includes(i.user_id)
    );

    const filteredItems = allItems.filter((i) => {
        const fullName = `${i.first_name} ${i.last_name}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    return (
        <>
            <View
                style={{
                    padding: 20,
                    backgroundColor: "#161616",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#323232",
                    flex: 1,
                    width: mobile ? "50%" : "100%",
                    marginTop: 10
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 6,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            color: "white",
                            fontFamily: "Montserrat-Regular",
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {title}
                    </Text>
                    <IoniconsIcon
                        name="pencil"
                        color={"white"}
                        size={20}
                        onPress={() => setModalVisible(true)}
                        style={{
                            position: "absolute",
                            right: 0,
                        }}
                    />
                </View>

                {selectedItems.length === 0 ? (
                    <Text
                        style={{
                            textAlign: "center",
                            color: "#999",
                            fontFamily: "Montserrat-Regular",
                        }}
                    >
                        No hay elementos seleccionados
                    </Text>
                ) : (
                    <FlatList
                        data={selectedItems}
                        keyExtractor={(item) => item.user_id.toString()}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#323232",
                                    paddingVertical: 4,
                                    paddingHorizontal: 6,
                                }}
                            >
                                {item.photo_url ? (
                                    <Image
                                        source={{ uri: item.photo_url }}
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            marginRight: 6,
                                        }}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: "#ccc",
                                            marginRight: 6,
                                        }}
                                    />
                                )}
                                <Text
                                    style={{
                                        fontSize: 14,
                                        color: "white",
                                        fontFamily: "Montserrat-Regular",
                                    }}>
                                    {item.first_name} {item.last_name}
                                </Text>
                            </View>
                        )}
                        contentContainerStyle={{
                            maxHeight: 300,
                        }}
                    />
                )}
            </View>

            {modalVisible ? (
                <FrontLayerWrapper key={"genericSelector"}>
                    <Modal
                        visible={modalVisible}
                        animationType="fade"
                        inStyle={{
                            backgroundColor: "rgba(255,255,255,0.95)",
                            borderRadius: 20,
                            width: "90%",
                            maxWidth: Platform.OS === "web" ? 600 : 400,
                            flexShrink: 1,
                        }}
                        onClose={() => setModalVisible(false)}
                    >
                        <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    alignSelf: "flex-end",
                                    marginBottom: 10,
                                    padding: 6,
                                }}
                            >
                                <Text style={{ color: "#007AFF", fontSize: 16, fontFamily: "Montserrat-Regular", }}>Cerrar</Text>
                            </TouchableOpacity>

                            <TextInput
                                placeholder="Buscar..."
                                value={search}
                                onChangeText={setSearch}
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    height: 40,
                                    marginBottom: 10,
                                    fontFamily: "Montserrat-Regular",
                                }}
                            />

                            <TouchableOpacity
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: "#fff",
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#ddd",
                                    paddingVertical: 6,
                                    paddingHorizontal: 8,
                                }}
                                onPress={toggleAll}
                            >
                                <CheckBox
                                    checked={
                                        (worker[workerField] || []).length === allItems.length &&
                                        allItems.length > 0
                                    }
                                    onPress={toggleAll}
                                />
                                <Text
                                    style={{
                                        marginLeft: 8,
                                        fontSize: 14,
                                        fontFamily: "Montserrat-Regular",
                                    }}
                                >
                                    {(worker[workerField] || []).length === allItems.length
                                        ? "Quitar todos"
                                        : "Agregar todos"}
                                </Text>
                            </TouchableOpacity>

                            <FlatList
                                data={filteredItems}
                                keyExtractor={(item) => item.user_id.toString()}
                                renderItem={renderItem}
                                contentContainerStyle={{
                                    maxHeight: 300
                                }}
                            />
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            ) : null}
        </>
    );
};

export default GenericSelector;
