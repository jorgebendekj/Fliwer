import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
} from "react-native";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import CustomTextInput from "../../../textInput/CustomTextInput";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import _ from "lodash";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import { toast } from "../../../../widgets/toast/toast";
import { get } from "../../../../actions/languageActions";
import { deleteOrderItem, upsertOrderItem } from "../../../../reducers/orderSlice";

const OrderProductCard = ({ product, order, idOrder, onPress }) => {
    const dispatch = useDispatch();
    const { orientation } = useMediaInfo();
    const mobile = orientation !== "landscape";

    const orderItem = order?.products.find((p) => p.id === product.id);
    const isInOrder = !!orderItem;

    const [localQty, setLocalQty] = useState(
        isInOrder ? String(orderItem.quantity) : ""
    );
    const [error, setError] = useState(false);

    const priceType = orderItem?.priceType ?? "price";
    console.log('priceType', priceType)
    const translate = (text) => {
        return dispatch(get(text));
    };

    useEffect(() => {
        if (isInOrder) {
            setLocalQty(String(orderItem.quantity));
        } else {
            setLocalQty("");
        }
    }, [idOrder, orderItem?.quantity]);


    const debouncedUpdate = useRef(
        _.debounce((val) => {
            const q = parseInt(val, 10);
            if (isNaN(q)) return;
            if (q <= 0) {
                dispatch(deleteOrderItem({ orderId: order.id, itemId: product.id }));
            } else {
                dispatch(upsertOrderItem({ orderId: order.id, item: product, quantity: q }));
            }
        }, 1000)
    ).current;

    const minus = () => {
        if (orderItem.quantity === 1) {
            dispatch(deleteOrderItem({ orderId: order.id, itemId: product.id }));
        } else {
            dispatch(upsertOrderItem({ orderId: order.id, item: product, quantity: orderItem.quantity - 1 }));
        }
    };

    const plus = () =>
        dispatch(upsertOrderItem({ orderId: order.id, item: product, quantity: orderItem.quantity + 1 }));

    const addFirstTime = () => {
        if (error) setError(false);
        const fallback = localQty === "" ? "1" : localQty;
        const q = parseInt(fallback, 10);
        if (!/^\d+$/.test(fallback) || q <= 0) {
            toast.error(translate("Orders_toast_invalidQuantity"));
            setError(true);
            return;
        }
        dispatch(upsertOrderItem({ orderId: order.id, item: product, quantity: q }));
    };

    const getPriceFromProduct = (product, priceType) => {
        if (!priceType || priceType === "price") {
            return product.price;
        }

        const customId = parseInt(priceType.replace("cf_", ""), 10);
        const field = product.customFields?.find(f => f.id === customId);
        return field?.value?.replace("€", "").replace(",", ".") || "-";
    };

    const selectedPrice = getPriceFromProduct(product, priceType);

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: CurrentTheme.cardColor, width: mobile ? "45%" : 250 },
            ]}
            activeOpacity={0.9}
            onPress={() => onPress(product)}
        >
            <View>
                <Image
                    source={{
                        uri: product?.images ? product?.images[0]?.url : "https://my.fliwer.com/no-image.jpg",
                    }}
                    style={styles.image}
                />
                <Text
                    style={[
                        styles.title,
                        { color: CurrentTheme.secondaryText, fontFamily: "Montserrat-Regular" },
                    ]}
                    numberOfLines={2}
                >
                    {product.name}
                </Text>
                <Text
                    style={[
                        styles.price,
                        { color: CurrentTheme.secondaryText, fontFamily: "Montserrat-Regular" },
                    ]}
                >
                    {parseFloat(selectedPrice ?? 0).toFixed(2)}€
                </Text>
            </View>

            <TouchableWithoutFeedback onPress={() => { }}>
                <View style={styles.actionContainer}>
                    {!isInOrder && (
                        <>
                            <View style={{ width: "40%" }}>
                                <CustomTextInput
                                    value={localQty}
                                    onChangeText={setLocalQty}
                                    error={error}
                                    keyboardType="numeric"
                                    style={{ marginBottom: 0 }}
                                />
                            </View>
                            <TouchableOpacity onPress={addFirstTime}>
                                <Ionicons name="add" color={CurrentTheme.secondaryText} size={35} />
                            </TouchableOpacity>
                        </>
                    )}

                    {isInOrder && (
                        <>
                            <TouchableOpacity onPress={minus}>
                                <Ionicons
                                    name={orderItem.quantity > 1 ? "remove" : "trash-bin-outline"}
                                    size={26}
                                    color={CurrentTheme.secondaryText}
                                />
                            </TouchableOpacity>

                            <CustomTextInput
                                value={localQty}
                                onChangeText={(val) => {
                                    setLocalQty(val);
                                    debouncedUpdate(val);
                                }}
                                keyboardType="numeric"
                                style={{ padding: 0, marginBottom: 0, width: 50, textAlign: "center" }}
                            />

                            <TouchableOpacity onPress={plus}>
                                <Ionicons name="add-outline" size={26} color={CurrentTheme.secondaryText} />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </TouchableOpacity>
    );
};

export default OrderProductCard;

const styles = StyleSheet.create({
    card: { borderRadius: 8, padding: 10, marginVertical: 6, elevation: 2 },
    image: { width: "100%", height: 200, borderRadius: 8, backgroundColor: "#eee" },
    title: { marginTop: 6, fontWeight: "bold", fontSize: 14 },
    price: { marginTop: 2, color: "#0a0", fontWeight: "600" },
    actionContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "100%",
        gap: 10,
        marginTop: 10,
    },
});
