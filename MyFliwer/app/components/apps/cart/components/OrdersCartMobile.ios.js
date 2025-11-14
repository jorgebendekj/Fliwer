import React, { useState, useRef } from "react";
import {
    Image,
    Modal,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    LayoutAnimation,
    UIManager,
    Platform,
} from "react-native";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import CustomTextInput from "../../../textInput/CustomTextInput";
import ActionSheet from "react-native-actionsheet";
import OrderMobileHeader from "./OrderMobileHeader";
import { useDispatch } from "react-redux";
import { deleteOrderItem } from "../../../../reducers/orderSlice";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Accounting format: 125.000,00
const printNumberContable = (number) => {
    var numberString = number.toString();
    var isNegative = number < 0;
    if (isNegative) numberString = numberString.slice(1);
    if (numberString.indexOf(".") == -1) numberString += ".00";
    numberString = numberString.replace(/\./g, ",");
    var index = numberString.indexOf(",");
    var i = index - 3;
    while (i > 0) {
        numberString = numberString.slice(0, i) + "." + numberString.slice(i);
        i -= 3;
    }
    if (isNegative) numberString = "-" + numberString;
    return numberString;
};
const formatEuro = (n) => `${printNumberContable(Number(n || 0).toFixed(2))}€`;

const qtyOptions = [
    "1 unidad",
    "2 unidades",
    "3 unidades",
    "4 unidades",
    "5 unidades",
    "Más de 6 unidades",
    "Cancelar",
];

const OrdersCartMobile = ({
    setShowCartMobile,
    translate,
    currentOrder,
    changeQty,
}) => {
    const dispatch = useDispatch();
    const actionSheetRef = useRef(null);

    // Local UI state
    const [discounts, setDiscounts] = useState({}); // { [productId]: percent }
    const [expanded, setExpanded] = useState({});   // { [productId]: boolean }
    const [selectedQtyProduct, setSelectedQtyProduct] = useState(null);
    const [showCustomQtyModal, setShowCustomQtyModal] = useState(false);
    const [customQtyInput, setCustomQtyInput] = useState("");
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [customDiscountInput, setCustomDiscountInput] = useState("");
    const [selectedDiscountProduct, setSelectedDiscountProduct] = useState(null);

    // Get price respecting product priceType
    const getPriceByType = (product) => {
        const type = product.priceType || "price";
        if (type === "price") return parseFloat(product.price || 0);
        const id = parseInt(type.replace("cf_", ""), 10);
        const field = product.customFields?.find((f) => f.id === id);
        if (!field?.value) return 0;
        return parseFloat(field.value.replace("€", "").replace(",", ".") || 0);
    };

    // Toggle expand with animation
    const toggleExpanded = (pid) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((prev) => ({ ...prev, [pid]: !prev[pid] }));
    };

    // Open ActionSheet for quantity
    const showQtyActionSheet = (product) => {
        setSelectedQtyProduct(product);
        actionSheetRef.current?.show();
    };

    // Handle ActionSheet quantity choice
    const handleQtyOptionPress = (index) => {
        const product = selectedQtyProduct;
        if (!product) return;

        if (index >= 0 && index < 5) {
            const qty = index + 1;
            // changeQty expects a delta; we pass (newQty - currentQty)
            changeQty(product, qty - (product.quantity || 0));
            setSelectedQtyProduct(null);
        } else if (index === 5) {
            setCustomQtyInput("");
            setShowCustomQtyModal(true);
        }
    };

    // Ask confirmation to delete a single product
    const confirmDeleteProduct = (prod) => {
        setProductToDelete(prod);
        setDeleteModalVisible(true);
    };

    // Confirm deletion of a single product
    const handleDeleteConfirmed = () => {
        if (productToDelete) {
            dispatch(deleteOrderItem({ orderId: currentOrder.id, itemId: productToDelete.id }));
        }
        setDeleteModalVisible(false);
        setProductToDelete(null);
    };

    // Ask confirmation to delete all products
    const handleDeleteAll = () => {
        setDeleteAllModalVisible(true);
    };

    // Confirm delete all products
    const handleDeleteAllConfirmed = () => {
        currentOrder.products.forEach((p) => {
            dispatch(deleteOrderItem({ orderId: currentOrder.id, itemId: p.id }));
        });
        setDeleteAllModalVisible(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: CurrentTheme.primaryView }}>
            <OrderMobileHeader
                order={currentOrder}
                showBack
                onBack={() => setShowCartMobile(false)}
                showCart={false}
                handleDelete={() => setDeleteAllModalVisible(true)}
            />

            {/* row: subtotal (left)  —  total items (right) */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, marginBottom: 6 }}>
                <Text style={[styles.cartTitleBig, { color: CurrentTheme.cardText }]}>
                    {translate("Orders_label_subtotal")} {formatEuro(currentOrder?.totalPrice || 0)}
                </Text>
                <Text style={[styles.cartTitleBig, { color: CurrentTheme.cardText }]}>
                    {(currentOrder?.totalQuantity || 0)} {(translate("Orders_label_products") || "ítems")}
                </Text>
            </View>


            <ScrollView>
                {currentOrder.products.map((prod) => {
                    const unitPrice = getPriceByType(prod);
                    const qty = prod.quantity || 0;
                    const total = unitPrice * qty;

                    const discountPercent = discounts[prod.id] || 0;
                    const discountedUnit = unitPrice * (1 - discountPercent / 100);
                    const discountedTotal = discountedUnit * qty;

                    return (
                        <TouchableOpacity
                            key={prod.id}
                            style={[styles.cartItemRow, { backgroundColor: CurrentTheme.secondaryView }]}
                            onLongPress={() => confirmDeleteProduct(prod)}
                            delayLongPress={350}
                            activeOpacity={0.9}
                        >
                            {/* Row 1: image + product name + expand toggle */}
                            <View style={{ flexDirection: "row", }}>
                                <Image
                                    source={{ uri: prod.images?.[0]?.url || "https://my.fliwer.com/no-image.jpg" }}
                                    style={styles.cartImageMobile}
                                    resizeMode="cover"
                                />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                        <Text
                                            style={[styles.productNameMobile, { color: CurrentTheme.cardText }]}
                                            numberOfLines={1}
                                        >
                                            {prod.name}
                                        </Text>
                                        <TouchableOpacity onPress={() => toggleExpanded(prod.id)} style={{ padding: 6 }}>
                                            <IoniconsIcon
                                                name={expanded[prod.id] ? "chevron-up" : "chevron-down"}
                                                size={18}
                                                color={CurrentTheme.cardText}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.rowLine}>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity
                                                onPress={() => showQtyActionSheet(prod)}
                                                style={styles.qtyPill}
                                            >
                                                <Text style={[styles.qtyText, { color: CurrentTheme.cardText }]}>{qty} u</Text>
                                                <IoniconsIcon name="chevron-down" size={14} color={CurrentTheme.cardText} />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={[styles.cellText, { color: CurrentTheme.cardText }]}>
                                                {formatEuro(unitPrice)}
                                            </Text>
                                        </View>

                                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                                            <Text
                                                style={[
                                                    styles.cellText,
                                                    {
                                                        color: CurrentTheme.cardText,
                                                        fontWeight: "700",
                                                        textDecorationLine: discountPercent > 0 ? "line-through" : "none",
                                                        opacity: discountPercent > 0 ? 0.6 : 1,
                                                    },
                                                ]}
                                            >
                                                {formatEuro(total)}
                                            </Text>
                                        </View>

                                    </View>
                                </View>
                            </View>

                            {/* Divider and expandable area */}
                            {expanded[prod.id] && (
                                <>
                                    <View style={styles.divider} />

                                    <View style={styles.rowLine}>
                                        {/* Columna izquierda: botón que abre el modal de descuento */}
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setSelectedDiscountProduct(prod);
                                                    setCustomDiscountInput(String(discounts[prod.id] ?? 0));
                                                    setShowDiscountModal(true);
                                                }}
                                                activeOpacity={0.7}
                                                style={styles.discountPill}
                                            >
                                                <Text style={{ color: CurrentTheme.cardText }}>
                                                    {(translate("discount") || "Descuento")}: {discountPercent}%
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Columna centro: precio unitario con descuento */}
                                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                            <Text style={[styles.cellText, { color: CurrentTheme.cardText }]}>
                                                {formatEuro(discountedUnit)}
                                            </Text>
                                        </View>

                                        {/* Columna derecha: total con descuento */}
                                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                                            <Text style={[styles.cellText, { color: CurrentTheme.cardText, fontWeight: "700" }]}>
                                                {formatEuro(discountedTotal)}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Quantity ActionSheet */}
            <ActionSheet
                ref={actionSheetRef}
                title={"Elegí una cantidad"}
                options={qtyOptions}
                cancelButtonIndex={6}
                onPress={handleQtyOptionPress}
            />

            {/* Custom Quantity Modal */}
            <Modal
                visible={showCustomQtyModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCustomQtyModal(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        setShowCustomQtyModal(false);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: CurrentTheme.primaryText }]}>
                            <Text style={styles.modalTitle}>Cantidad personalizada</Text>
                            <CustomTextInput
                                value={customQtyInput}
                                onChangeText={setCustomQtyInput}
                                placeholder="Ingresá una cantidad"
                                keyboardType="numeric"
                                style={{ textAlign: "left", fontSize: 16, marginBottom: 16 }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    const parsed = parseInt(customQtyInput, 10);
                                    if (!isNaN(parsed) && parsed > 0) {
                                        changeQty(selectedQtyProduct, parsed);
                                        setShowCustomQtyModal(false);
                                        setSelectedQtyProduct(null);
                                    }
                                }}
                                style={[styles.modalConfirmBtn, { backgroundColor: CurrentTheme.secondaryColor }]}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                    CONFIRMAR
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Delete single product modal */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: CurrentTheme.primaryText }]}>
                            <Text style={styles.modalTitle}>Borrar producto</Text>
                            <Text style={{ color: CurrentTheme.secondaryView, marginBottom: 12, textAlign: "center" }}>
                                ¿Eliminar este producto del carrito?
                            </Text>
                            <TouchableOpacity
                                onPress={handleDeleteConfirmed}
                                style={[styles.modalConfirmBtn, { backgroundColor: "#d9534f" }]}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                    BORRAR
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={{ marginTop: 10 }}>
                                <Text style={{ color: "#007AFF", textAlign: "center" }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            {/* Discount modal */}
            <Modal
                visible={showDiscountModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDiscountModal(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss();
                        setShowDiscountModal(false);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: CurrentTheme.primaryText }]}>
                            <Text style={styles.modalTitle}>Ingresar descuento</Text>
                            <CustomTextInput
                                value={customDiscountInput}
                                onChangeText={setCustomDiscountInput}
                                placeholder="% descuento"
                                keyboardType="numeric"
                                style={{ textAlign: "left", fontSize: 16, marginBottom: 16 }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    const parsed = parseInt(customDiscountInput, 10);
                                    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100 && selectedDiscountProduct) {
                                        setDiscounts((prev) => ({
                                            ...prev,
                                            [selectedDiscountProduct.id]: parsed,
                                        }));
                                        setShowDiscountModal(false);
                                        setSelectedDiscountProduct(null);
                                    }
                                }}
                                style={[styles.modalConfirmBtn, { backgroundColor: CurrentTheme.secondaryColor }]}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                    CONFIRMAR
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Delete all modal */}
            <Modal
                visible={deleteAllModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteAllModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDeleteAllModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: CurrentTheme.primaryText }]}>
                            <Text style={styles.modalTitle}>Eliminar todo</Text>
                            <Text style={{ color: CurrentTheme.secondaryView, marginBottom: 12, textAlign: "center" }}>
                                ¿Seguro que querés eliminar todos los productos del carrito?
                            </Text>
                            <TouchableOpacity
                                onPress={handleDeleteAllConfirmed}
                                style={[styles.modalConfirmBtn, { backgroundColor: "#d9534f" }]}
                            >
                                <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                    ELIMINAR TODO
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setDeleteAllModalVisible(false)} style={{ marginTop: 10 }}>
                                <Text style={{ color: "#007AFF", textAlign: "center" }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

export default OrdersCartMobile;

const styles = StyleSheet.create({
    cartTitleBig: {
        fontSize: 20,
        fontWeight: "bold",
    },
    cartItemRow: {
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 12,
        marginBottom: 12,
    },
    cartImageMobile: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#ccc",
    },
    productNameMobile: {
        fontSize: 18,
        fontWeight: "500",
    },
    rowLine: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    qtyPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: CurrentTheme.cardColor,
        alignSelf: "flex-start",
    },
    qtyText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    cellText: {
        fontSize: 16,
    },
    divider: {
        marginTop: 12,
        height: 1,
        backgroundColor: "rgba(0,0,0,0.1)",
    },
    discountPill: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 6,
        backgroundColor: CurrentTheme.cardColor,
        alignSelf: "flex-start",
    },
    // Modals
    modalOverlay: {
        flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalBox: {
        width: "80%", padding: 20, borderRadius: 12,
    },
    modalTitle: {
        fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8, textAlign: "center"
    },
    modalConfirmBtn: {
        paddingVertical: 10, borderRadius: 8,
    },
});
