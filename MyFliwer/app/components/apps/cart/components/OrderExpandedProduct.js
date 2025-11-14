import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import { Picker } from "@react-native-picker/picker";
import OrderMobileHeader from "./OrderMobileHeader";
import { useDispatch } from "react-redux";
import { upsertOrderItem } from "../../../../reducers/orderSlice";
import OrdersCartMobileCard from "./OrdersCartMobileCard";

const ExpandedProduct = ({
    product,
    catalog,
    order,
    translate,
    onBack,
    onChangeQty,
    customFields,
    onPressCart
}) => {
    const dispatch = useDispatch();

    const defaultPriceType = (() => {
        const existingItem = order.products.find(p =>
            catalog.some(cp => cp.group === product.group && cp.id === p.id) && p.priceType
        );
        return existingItem?.priceType || "price";
    })();

    const [priceType, setPriceType] = useState(defaultPriceType);
    const [pendingToCart, setPendingToCart] = useState({});

    const relatedProducts = catalog.filter(p => p.group === product.group);

    const orderFilteredProducts = //filter products in order that id is in relatedProducts
        order.products.filter(p => relatedProducts.some(cp => cp.id === p.id && p.quantity > 0));
    const filteredNumberProducts = orderFilteredProducts.reduce((a, p) => a + p.quantity, 0);
    const customPriceFields = customFields.filter(f => f.type === "price");
    const priceOptions = [
        { label: "PVP", value: "price" },
        ...customPriceFields.map((f) => ({
            label: f.label,
            value: `cf_${f.id}`,
        }))
    ];

    const getPriceValue = (product,setPriceType) => {
        if(!setPriceType)setPriceType=priceType;
        if (setPriceType === "price") return product.price && product.price!="0.00" && product.price!="0"? product.price : "-";
        const customId = parseInt(setPriceType.replace("cf_", ""), 10);
        const field = product.customFields.find(f => f.id === customId);
        var value= field?.value?.replace("€", "") || "-";
        return value=="0.00" || value=="0"? "-" : value;
    };

    const changePendingToCart = (prod,qty) => {
        const newPendingToCart = { ...pendingToCart };
        //search product in pendingToCart
        if(newPendingToCart[prod.id]){
            newPendingToCart[prod.id].quantity += qty;
            if(newPendingToCart[prod.id].quantity<0) newPendingToCart[prod.id].quantity=0;
        } else if(qty>0){
            newPendingToCart[prod.id] = { quantity: qty };
        }
        setPendingToCart(newPendingToCart);
    };

    const savePendingToCart = () =>{
        // This function gets all pendingToCart products, saves in the order with the current priceType, and flush pendingToCart
        //Example: dispatch(upsertOrderItem({ orderId: order.id, item: currentProduct, quantity: quantity, priceType: priceType }));
        Object.keys(pendingToCart).forEach(id => {
            const quantity = pendingToCart[id].quantity;
            const currentProduct = relatedProducts.find(p => p.id == id);
            //get current quantity in order for product id and priceType
            const currentQuantity = order.products.find(p => p.id == id && p.priceType == priceType)?.quantity || 0;
            if(currentProduct){
                dispatch(upsertOrderItem({ orderId: order.id, item: currentProduct, quantity: currentQuantity+quantity, priceType: priceType }));
            }
        });
        setPendingToCart({});
    }

    return (
        <View style={{ flex: 1, backgroundColor: CurrentTheme.secondaryView }}>
            <OrderMobileHeader
                order={order}
                showBack
                onBack={onBack}
                showCart
                cartCount={order?.totalQuantity || 0}
                onPressCart={onPressCart}
            />
            <View style={{ flexDirection: "row", gap: 20, marginBottom: 16, padding: 10 }}>
                <Image
                    source={{ uri: product.images?.[0]?.url || "https://my.fliwer.com/no-image.jpg" }}
                    style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: "#ccc" }}
                    resizeMode="cover"
                />
                <View style={{flexShrink: 1}}>
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: CurrentTheme.cardText }}>
                        {product.group}
                    </Text>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: CurrentTheme.primaryText,
                            borderRadius: 8,
                            overflow: "hidden",
                            marginVertical: 16,
                            backgroundColor: "rgba(0,0,0,0.03)",
                            width: 150
                        }}
                    >
                        <Picker
                            selectedValue={priceType}
                            onValueChange={(value) => {
                                setPriceType(value);
                                /*
                                relatedProducts.forEach((p) => {
                                    const orderItem = order.products.find(op => op.id === p.id);
                                    if (orderItem) {
                                        onChangeQty(p, 0, value);
                                    }
                                });
                                */
                            }}
                            dropdownIconColor={CurrentTheme.cardText}
                            style={{
                                color: CurrentTheme.cardText,
                                height: 44,
                            }}
                            itemStyle={{ color: CurrentTheme.cardText }}
                        >
                            {priceOptions.map(opt => (
                                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

            {/* Encabezados tabla */}
            <View style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#ccc",marginLeft:10,marginRight:10 }}>
                <Text style={{ flex: 1, fontWeight: "bold", color: CurrentTheme.cardText }}>Cont</Text>
                <Text style={{ flex: 1, fontWeight: "bold", color: CurrentTheme.cardText }}>Mesura</Text>
                <Text style={{ flex: 1, fontWeight: "bold", color: CurrentTheme.cardText }}>Precio</Text>
                <Text style={{ flex: 1, fontWeight: "bold", color: CurrentTheme.cardText, textAlign: "center" }}>Cantidad</Text>
            </View>

            {/* Filas de productos */}
            <ScrollView style={{paddingLeft:10,paddingRight:10, flex:1}}>
                {relatedProducts.map((p) => {
                    const cont = p.customFields.find(f => f.id === 2)?.value || "-";
                    const mesura = p.customFields.find(f => f.id === 3)?.value || "-";
                    const quantity = pendingToCart[p.id]?.quantity || 0; //order.products.find(prod => prod.id === p.id)?.quantity || 0;

                    return (
                        <View
                            key={p.id}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 12,
                                borderBottomWidth: 1,
                                borderColor: "#eee"
                            }}
                        >
                            <Text style={{ flex: 1, color: CurrentTheme.cardText }}>{cont}</Text>
                            <Text style={{ flex: 1, color: CurrentTheme.cardText }}>{mesura}</Text>
                            <Text style={{ flex: 1, color: CurrentTheme.cardText }}>{(()=>{ console.log("What: ", getPriceValue(p)); return getPriceValue(p)})()}€</Text>

                            <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                                <TouchableOpacity onPress={() => /*onChangeQty(p, -1, priceType)*/changePendingToCart(p, -1)} style={{ padding: 6, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.05)" }}>
                                    <IoniconsIcon name={/*quantity > 1 ?*/ "remove" /*: "trash-bin-outline"*/} size={18} color={CurrentTheme.cardText} />
                                </TouchableOpacity>

                                <Text style={{ marginHorizontal: 10, fontSize: 16, fontWeight: "bold", color: CurrentTheme.cardText }}>
                                    {quantity}
                                </Text>

                                <TouchableOpacity onPress={() => /*onChangeQty(p, 1, priceType)*/changePendingToCart(p, 1)} style={{ padding: 6, borderRadius: 6, backgroundColor: "rgba(0,0,0,0.05)" }}>
                                    <IoniconsIcon name="add" size={18} color={CurrentTheme.cardText} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Botón de añadir al carrito */}
            <View style={{flexDirection:"row",alignItems:"center",paddingLeft:10,paddingRight:10}}>
                <TouchableOpacity style={{ flexGrow:1,borderColor: CurrentTheme.cardText, borderWidth: 1, borderRadius: 8, paddingVertical: 12, marginTop: 16,marginBottom:16,marginLeft:10,marginRight:10, alignItems: "center" }} onPress={savePendingToCart}>
                    <Text style={{ color: CurrentTheme.cardText, alignItems: "center" }}>Añadir al carrito</Text>
                </TouchableOpacity>
                <View onPress={onPressCart} style={styles.roundBtn}>
                    <IoniconsIcon name="cart" size={30} color="white" />
                    {filteredNumberProducts > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{filteredNumberProducts}</Text>
                        </View>
                    )}
                </View>
            </View>


            {/* Productos del subcarrito */}
            <ScrollView style={{paddingLeft:0,paddingRight:0,paddingTop:10,backgroundColor: CurrentTheme.primaryView, flex:1 }}>
                {orderFilteredProducts.map((prod) => {
                    return (
                        <OrdersCartMobileCard key={"o"+prod.id+"|"+prod.priceType} translate={translate} currentOrder={order} product={prod} changeQty={onChangeQty} hideImage={true} customFields={customFields} />
                    )
                })}
            </ScrollView>
            
        </View>
    );
};

export default ExpandedProduct;


const styles = StyleSheet.create({
    roundBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#ff4d4f",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: "white",
        fontSize: 11,
        fontWeight: "700",
    }
});
