import React, { useState, useEffect, useRef } from "react";
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
import FileViewer from 'react-native-file-viewer';
import OrderMobileHeader from "./OrderMobileHeader";
import { useDispatch } from "react-redux";
import { deleteOrderItem, upsertOrderItem } from "../../../../reducers/orderSlice";
import OrdersCartMobileCard from "./OrdersCartMobileCard";

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
    "Otra cantidad",
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


    // Get price respecting product priceType
    const getPriceByType = (product) => {
        const type = product.priceType || "price";
        if (type === "price") return parseFloat(product.price || 0);
        const id = parseInt(type.replace("cf_", ""), 10);
        const field = product.customFields?.find((f) => f.id === id);
        if (!field?.value) return 0;
        return parseFloat(field.value.replace("€", "").replace(",", ".") || 0);
    };


    // Local UI state
    const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);

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
                    {translate("Orders_label_subtotal")} {formatEuro(currentOrder.totalPrice)}
                </Text>
                <Text style={[styles.cartTitleBig, { color: CurrentTheme.cardText }]}>
                    {(currentOrder?.totalQuantity || 0)} {(translate("Orders_label_products") || "ítems")}
                </Text>
            </View>


            <ScrollView>
                {currentOrder.products.map((prod) => {
                    return (
                        <OrdersCartMobileCard key={"o"+prod.id+"|"+prod.priceType} translate={translate} currentOrder={currentOrder} product={prod} changeQty={changeQty} />
                    )
                })}
                {
                    false && currentOrder.products.length > 0 &&
                    /* Button Save PDF */
                    <TouchableOpacity 
                        onPress={async () => {
                            try {   
                                /*
                                let options = {
                                html: '<h1>PDF TEST</h1>',
                                fileName: String(currentOrder?.reference || currentOrder?.id),
                                base64: false,
                                };

                                let results = await generatePDF(options);
                                console.log('PDF file:', results.filePath);

                                // Open the generated PDF file
                                await FileViewer.open(results.filePath, {
                                showOpenWithDialog: true, // (optional) shows "Open with..." dialog on Android
                                showAppsSuggestions: true, // (optional) only Android
                                });
                                */
                            } catch (error) {
                                console.log('Error opening file:', error);
                            }
                        }}
                        style={{ flexGrow:1,borderColor: CurrentTheme.cardText, borderWidth: 1, borderRadius: 8, paddingVertical: 12, marginTop: 10,marginBottom:16,marginLeft:10,marginRight:10, alignItems: "center" }}>
                        <Text style={{ color: CurrentTheme.cardText, alignItems: "center" }}>Descargar PDF</Text>
                    </TouchableOpacity>
                }
            </ScrollView>

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
        fontSize: 17,
        fontWeight: "400",
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
        fontSize: 14,
    },
    totalPriceText: {
        fontSize: 18,
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
        fontSize: 16, fontWeight: "bold", color: "#000", marginBottom: 8, textAlign: "center"
    },
    modalConfirmBtn: {
        paddingVertical: 10, borderRadius: 8,
    },
});
