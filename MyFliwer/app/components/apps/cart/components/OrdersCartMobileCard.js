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
import OrderMobileHeader from "./OrderMobileHeader";
import { useDispatch } from "react-redux";
import { deleteOrderItem, upsertOrderItem } from "../../../../reducers/orderSlice";
import { current } from "@reduxjs/toolkit";

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

const OrdersCartMobileCard = ({
    translate,
    currentOrder,
    product,
    changeQty,
    hideImage=false,
    customFields
}) => {
    const dispatch = useDispatch();
    const actionSheetRef = useRef(null);

    const customPriceFields = customFields?customFields.filter(f => f.type === "price"):[];
    const priceOptions = [
        { label: "PVP", value: "price" },
        ...customPriceFields.map((f) => ({
            label: f.label,
            value: `cf_${f.id}`,
        }))
    ];

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

    const [expanded, setExpanded] = useState(false);   // { [productId]: boolean }
    const [isDiscount,setIsDiscount] = useState((()=>{
        return product.discount>0?false:true || true;
    }));
    const [showCustomQtyModal, setShowCustomQtyModal] = useState(false);
    const [customQtyInput, setCustomQtyInput] = useState("");
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [customDiscountInput, setCustomDiscountInput] = useState("");
    const [comment, setComment] = useState(product.comment?product.comment:"");

    // Toggle expand with animation
    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    // Open ActionSheet for quantity
    const showQtyActionSheet = () => {
        actionSheetRef.current?.show();
    };

    // Handle ActionSheet quantity choice
    const handleQtyOptionPress = (index) => {
        if (!product) return;

        if (index >= 0 && index < 5) {
            const qty = index + 1;
            // changeQty expects a delta; we pass (newQty - currentQty)
            
            changeQty(product, qty );
            /*
            const finalPrice=calculateFinalPrice(product,qty);
            setFinalPrices((prev) => ({
                ...prev,
                [product.id+"|"+product.priceType]: finalPrice
            }))
            */
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
            dispatch(deleteOrderItem({ orderId: currentOrder.id, itemId: product.id, priceType:product.priceType }));
        }
        setDeleteModalVisible(false);
        setProductToDelete(null);
    };

    const handleCommentChange = (text) => {
        setComment(text);
        product.comment=text;
        dispatch(upsertOrderItem({ orderId: currentOrder.id, item: product, quantity: product.quantity, priceType: product.priceType, comment: text }));
    };
    

    const unitPrice = getPriceByType(product);
    const qty = product.quantity || 0;
    const total = unitPrice * qty;

    const discountPercent = product.discount || 0;                    
    const discountedUnit = Math.round((discountPercent<0?(unitPrice * (1 - (-1*discountPercent) / 100)):(unitPrice * (1 + discountPercent / 100))) * 100) / 100;
    const discountedTotal = discountedUnit * qty;

    return (
        <TouchableOpacity
            key={product.id+"|"+product.priceType}
            style={[styles.cartItemRow, { backgroundColor: CurrentTheme.secondaryView }]}
            onLongPress={() => confirmDeleteProduct()}
            delayLongPress={350}
            activeOpacity={0.9}
        >
            {/* Row 1: image + product name + expand toggle */}
            <View style={{ flexDirection: "row", }}>
                {!hideImage && (
                    <Image
                        source={{ uri: product.images?.[0]?.url || "https://my.fliwer.com/no-image.jpg" }}
                        style={styles.cartImageMobile}
                        resizeMode="cover"
                    />
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text
                            style={[styles.productNameMobile, { color: CurrentTheme.cardText }]}
                            numberOfLines={expanded?5:3}
                        >
                            {product.name}
                        </Text>
                        <TouchableOpacity onPress={() => toggleExpanded()} style={{ padding: 6 }}>
                            <IoniconsIcon
                                name={expanded? "chevron-up" : "chevron-down"}
                                size={18}
                                color={CurrentTheme.cardText}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.rowLine}>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                onPress={() => showQtyActionSheet()}
                                style={styles.qtyPill}
                            >
                                <Text style={[styles.qtyText, { color: CurrentTheme.cardText }]}>{qty} u</Text>
                                <IoniconsIcon name="chevron-down" size={14} color={CurrentTheme.cardText} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Text style={[styles.cellText, { color: CurrentTheme.cardText }]}>
                                {formatEuro(expanded?unitPrice:discountedUnit)}
                            </Text>
                        </View>

                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                            <Text
                                style={[
                                    styles.cellText,
                                    (!expanded?styles.totalPriceText:{}),
                                    {
                                        color: CurrentTheme.cardText,
                                        fontWeight: "700",
                                        textDecorationLine: (expanded && discountPercent  > 0) || (expanded && discountPercent > 0)? "line-through" : "none",
                                        opacity: (expanded && discountPercent > 0) || (expanded && discountPercent > 0) ? 0.6 : 1,
                                    },
                                ]}
                            >
                                {formatEuro(expanded?total:discountedTotal)}
                            </Text>
                        </View>

                    </View>
                </View>
            </View>

            {/* Divider and expandable area */}
            {expanded && (
                <>
                    <View style={styles.divider} />

                    <View style={styles.rowLine}>
                        {/* Columna izquierda: botón que abre el modal de descuento */}
                        <View style={{ flex: 2 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setCustomDiscountInput(String(product.discount?product.discount:0));
                                    setShowDiscountModal(true);
                                }}
                                activeOpacity={0.7}
                                style={styles.discountPill}
                            >
                                <Text style={{ color: CurrentTheme.cardText }}>
                                    {discountPercent<=0?(translate("discount") || "Descuento"):(translate("incremento") || "Incremento")}: {discountPercent}%
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Solo si existen campos personalizados */}
                        {
                            customFields && (
                                <View style={{ flex: 0.5, alignItems: "center", justifyContent: "center" }}>
                                    <Text style={[styles.cellText, { color: CurrentTheme.cardText }]}>
                                        { priceOptions.find((option) => option.value === product.priceType).label}
                                    </Text>
                                </View>
                            )
                        }

                        {/* Columna centro: precio unitario con descuento */}
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Text style={[styles.cellText, { color: CurrentTheme.cardText }]}>
                                {formatEuro(discountedUnit)}
                            </Text>
                        </View>

                        {/* Columna derecha: total con descuento */}
                        <View style={{ flex: 1, alignItems: "flex-end" }}>
                            <Text style={[styles.cellText,styles.totalPriceText, { color: CurrentTheme.cardText, fontWeight: "700" }]}>
                                {formatEuro(discountedTotal)}
                            </Text>
                        </View>
                    </View>


                    <View style={[styles.rowLine,{alignItems:"center"}]}>
                        {/* Columna izquierda: botón que abre el modal de descuento */}
                        <View style={{ flexGrow: 1, flexShrink: 1 }}>
                            <CustomTextInput
                                value={comment}
                                onChangeText={handleCommentChange}
                                placeholder={translate("comment") || "Comentario"}
                                placeholderTextColor={CurrentTheme.cardText}
                                style={[styles.cellText, { color: CurrentTheme.cardText }]}
                            />
                        </View>

                        {/* Columna derecha: Botón de eliminar */}
                        
                        <TouchableOpacity onPress={()=>{setProductToDelete(product);setDeleteModalVisible(true)}} style={{ width:40, alignItems: "flex-end" }}>
                            <IoniconsIcon name="trash-bin-outline" size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                </>
            )}

            
                {/* Quantity ActionSheet */}
                <ActionSheet
                    ref={actionSheetRef}
                    title={"Elige una cantidad"}
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
                                    placeholder="Escribe una cantidad"
                                    keyboardType="numeric"
                                    style={{ textAlign: "left", fontSize: 16, marginBottom: 16 }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        const parsed = parseInt(customQtyInput, 10);
                                        if (!isNaN(parsed) && parsed > 0) {
                                            changeQty(product, parsed);
                                            /*
                                            const finalPrice=calculateFinalPrice(selectedQtyProduct,parsed);
                                            setFinalPrices((prev) => ({
                                                ...prev,
                                                [selectedQtyProduct.id+"|"+selectedQtyProduct.priceType]: finalPrice
                                            }))
                                            */
                                            setShowCustomQtyModal(false);
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
                                <Text style={styles.modalTitle}>{isDiscount?"Escribir descuento":"Escribir incremento"}</Text>
                                <View style={{ flexDirection: "row", justifyContent: "space-between",gap:10,alignItems:"center", marginBottom: 16}}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsDiscount(true);
                                        }}
                                        style={[{width:30,height:30,borderRadius: 8,justifyContent:"center",opacity:isDiscount?1:0.5}, { backgroundColor: CurrentTheme.secondaryColor }]}
                                    >
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                            -
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsDiscount(false);
                                        }}
                                        style={[{width:30,height:30,borderRadius: 8,justifyContent:"center",opacity:isDiscount?0.5:1}, { backgroundColor: CurrentTheme.secondaryColor }]}
                                    >
                                        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                                            +
                                        </Text>
                                    </TouchableOpacity>
                                    <CustomTextInput
                                        value={customDiscountInput.replace("-","")}
                                        onChangeText={setCustomDiscountInput}
                                        placeholder="% descuento"
                                        keyboardType="numeric"
                                        style={{ flexGrow:1,textAlign: "left", fontSize: 16,marginBottom:0 }}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        var parsed = parseInt(customDiscountInput, 10);
                                        if (!isNaN(parsed) && (parsed <= 100 || !isDiscount)) {
                                            if(parsed<0)parsed*=-1;
                                            if(isDiscount)parsed*=-1;
                                            dispatch(upsertOrderItem({ orderId: currentOrder.id, item: product, quantity: product.quantity, priceType: product.priceType, discount: parsed }));
                                            setIsDiscount(parsed>0?false:true);
                                            setShowDiscountModal(false);
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

        </TouchableOpacity>
    );
                

};

export default OrdersCartMobileCard;

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
