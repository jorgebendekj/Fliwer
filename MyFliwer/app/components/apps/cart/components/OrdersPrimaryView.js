import React, { useMemo, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    TextInput,
} from "react-native";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import { useDispatch, useSelector } from "react-redux";
import OrderCard from "./OrderCard";
import { setPortraitScreen } from "../../../../actions/wrapperActions";
import { Redirect } from "../../../../utils/router/router";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import Ionicons from "react-native-vector-icons/Ionicons";
import { get } from "../../../../actions/languageActions";
import { addOrder, deleteOrder } from "../../../../reducers/orderSlice";

// Mantener este wrapper y modal como pediste
import FrontLayerWrapper from "../../../frontLayerWrapper";
import Modal from "../../../../widgets/modal/modal";
import { toast } from "../../../../widgets/toast/toast";

// Header reusable
import OrderMobileHeader from "./OrderMobileHeader";

/** Helpers locales **/
const printNumberContable = (number) => {
    var numberString = number.toString();
    var isNegative = number < 0;
    if (isNegative) {
        numberString = numberString.slice(1);
    }
    if (numberString.indexOf(".") == -1) {
        numberString += ".00";
    }
    numberString = numberString.replace(/\./g, ",");
    var index = numberString.indexOf(",");
    var i = index - 3;
    while (i > 0) {
        numberString = numberString.slice(0, i) + "." + numberString.slice(i);
        i -= 3;
    }
    if (isNegative) {
        numberString = "-" + numberString;
    }
    return numberString;
};
const formatEuro = (n) =>
    `${printNumberContable(Number(n || 0).toFixed(2))}€`;

const OrdersPrimaryView = ({ setRedirects, idOrder, onGoToCart }) => {
    const { orientation } = useMediaInfo();
    const mobile = orientation !== "landscape";
    const dispatch = useDispatch();

    const orders = useSelector((s) => s.orders.orders || []);
    const selectedOrder = useMemo(
        () => orders.find((o) => o.id == idOrder),
        [orders, idOrder]
    );

    const totalValue = useMemo(() => {
        return orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    }, [orders]);

    const translate = (text) => dispatch(get(text));

    const [modalVisible, setModalVisible] = useState(false);
    const [newRef, setNewRef] = useState("");

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    const handleRedirect = (id) => {
        setRedirects([<Redirect key={`redir-${id}`} to={`/app/order/products/${id}`} />]);
        if (orientation != "landscape") {
            dispatch(setPortraitScreen(2));
        }
    };

    const handleOpenCreateOrder = () => {
        setNewRef("");
        setModalVisible(true);
    };

    const handleConfirmCreateOrder = () => {
        const reference = (newRef || "").trim();
        if (!reference) {
            toast.error("Ingresá una referencia para el pedido.");
            return;
        }

        const newOrder = {
            id: Date.now(),
            date: Date.now(),
            products: [],
            totalQuantity: 0,
            totalPrice: 0,
            reference
        };

        dispatch(addOrder(newOrder));
        setModalVisible(false);
        handleRedirect(newOrder.id);
    };

    const handleAskDelete = (order) => {
        setOrderToDelete(order);
        setDeleteModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (orderToDelete?.id != null) {
            dispatch(deleteOrder(orderToDelete.id));
        }
        setDeleteModalVisible(false);
        setOrderToDelete(null);
    };

    const openCartFromPrimary = () => {
        if (selectedOrder) onGoToCart(selectedOrder.id);
    };

    return (
        <View style={{ flex: 1, backgroundColor: CurrentTheme.primaryView }}>
            {mobile && selectedOrder ? (
                <OrderMobileHeader
                    order={selectedOrder}
                    showBack={false}
                    showCart
                    cartCount={selectedOrder.totalQuantity || 0}
                    onPressCart={openCartFromPrimary}
                />
            ) : null}

            <View style={styles.headerRow}>
                <Text
                    style={[
                        styles.textTitle,
                        { color: CurrentTheme.cardText, fontFamily: "Montserrat-Regular" },
                    ]}
                >
                    {translate("Orders_label_orders")} {orders.length} — {translate("Orders_label_total")} {formatEuro(totalValue)}
                </Text>
            </View>

            <TouchableOpacity
                style={{
                    borderRadius: 10,
                    padding: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: FliwerColors.secondary.white,
                    marginVertical: 10,
                    marginHorizontal: 16,
                    opacity: Platform.OS === "android" ? 0.6 : 0.4,
                }}
                onPress={handleOpenCreateOrder}
            >
                <Ionicons name="add" color={"gray"} size={30} />
            </TouchableOpacity>

            <FlatList
                data={[...orders].sort((a, b) => b.date - a.date)}
                keyExtractor={(o) => `order-${o.id}`}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    return (
                        <OrderCard
                            order={item}
                            onPress={(id) => handleRedirect(id)}
                            idOrder={idOrder}
                            onLongPress={() => handleAskDelete(item)} // esto abre el modal
                        />

                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>{translate("Orders_empty_list")}</Text>
                }
            />

            {/* MODAL crear con referencia */}
            {modalVisible && (
                <FrontLayerWrapper key="createOrderModal">
                    <Modal
                        visible={modalVisible}
                        animationType="fade"
                        inStyle={styles.modalIn}
                        onClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalView}>
                            <Text style={[styles.title]}>Nueva orden</Text>
                            <TextInput
                                placeholder="Referencia del pedido"
                                value={newRef}
                                onChangeText={setNewRef}
                                style={styles.inputSearch}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.createButtonConfirm,
                                    { backgroundColor: CurrentTheme.cardColor },
                                ]}
                                onPress={handleConfirmCreateOrder}
                            >
                                <Text
                                    style={{
                                        color: CurrentTheme.cardText,
                                        fontWeight: "700",
                                        textAlign: "center",
                                    }}
                                >
                                    Confirmar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{ marginTop: 10 }}
                            >
                                <Text style={{ color: "#007AFF" }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            )}

            {/* MODAL confirmar borrado (long press) */}
            {deleteModalVisible && (
                <FrontLayerWrapper key="deleteOrderModal">
                    <Modal
                        visible={deleteModalVisible}
                        animationType="fade"
                        inStyle={styles.modalIn}
                        onClose={() => setDeleteModalVisible(false)}
                    >
                        <View style={styles.modalView}>
                            <Text style={[styles.title]}>Borrar pedido</Text>
                            <Text style={{ textAlign: "center", marginBottom: 12 }}>
                                ¿Querés borrar{" "}
                                {orderToDelete?.reference
                                    ? `"${orderToDelete.reference}"`
                                    : `#${orderToDelete?.id}`}
                                ?
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.createButtonConfirm,
                                    { backgroundColor: "#d9534f" },
                                ]}
                                onPress={handleConfirmDelete}
                            >
                                <Text
                                    style={{ color: "white", fontWeight: "700", textAlign: "center" }}
                                >
                                    Borrar
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                style={{ marginTop: 10 }}
                            >
                                <Text style={{ color: "#007AFF" }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            )}
        </View>
    );
};

export default OrdersPrimaryView;

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 10,
    },
    textTitle: {
        fontSize: 20,
        marginBottom: 6,
        fontWeight: "500",
        alignSelf: "center",
        marginVertical: 10,
    },
    emptyText: {
        textAlign: "center",
        color: "#888",
        fontSize: 16,
        marginTop: 20,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 6,
    },
    addMoreText: {
        fontSize: 20,
        textDecorationLine: "underline",
    },
    // estilos modal
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1,
    },
    modalView: {
        paddingTop: 22,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 24,
        alignItems: "center",
    },
    title: {
        textAlign: "center",
        fontSize: 21,
        marginBottom: 10,
    },
    inputSearch: {
        height: 40,
        width: "100%",
        borderColor: "gray",
        borderWidth: 1,
        padding: 5,
        backgroundColor: "white",
        marginBottom: 10,
    },
    createButtonConfirm: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
});
