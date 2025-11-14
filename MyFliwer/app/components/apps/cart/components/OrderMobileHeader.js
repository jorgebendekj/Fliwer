import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback,Keyboard} from "react-native";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import FrontLayerWrapper from "../../../frontLayerWrapper";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import IconMaterialIcons from "react-native-vector-icons/MaterialIcons";
import { FliwerColors } from "../../../../utils/FliwerColors";
import CustomTextInput from "../../../textInput/CustomTextInput";
import { useDispatch } from "react-redux";
import { editOrder } from "../../../../reducers/orderSlice";

const OrderMobileHeader = ({
    order,
    showBack,
    onBack,
    showCart,
    cartCount = 0,
    onPressCart,
    handleDelete = undefined,
    handleModifyName = undefined
}) => {
    const dispatch = useDispatch();
    const [orderName, setOrderName] = useState(order?.reference || order?.id);
    const [showModifyOrderNameModal, setShowModifyOrderNameModal] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: FliwerColors.primary.green }]}>
            <View style={styles.content}>
                <View style={styles.leftZone}>
                    {showBack ? (
                        <TouchableOpacity onPress={onBack} style={styles.roundBtn}>
                            <IoniconsIcon name="arrow-back" size={25} color="white" />
                        </TouchableOpacity>
                    ) : null}
                    {order?.reference || order?.id ? (
                        <View style={{display:"flex", flexDirection:"row"}}>
                            <Text style={styles.refText}>{String(order?.reference || order?.id)}</Text>
                            <TouchableOpacity onPress={() => setShowModifyOrderNameModal(true)} style={{paddingLeft:10}}>
                                <IconMaterialIcons name='edit' size={25} color="white" />
                            </TouchableOpacity>
                        </View>
                    ): null}
                </View>

                {(showCart || handleDelete) ? (
                    showCart ? (
                        <TouchableOpacity onPress={onPressCart} style={styles.roundBtn}>
                            <IoniconsIcon name="cart" size={30} color="white" />
                            {cartCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleDelete} style={styles.roundBtn}>
                            <IoniconsIcon name="trash-bin-outline" size={30} color="white" />
                            {cartCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{cartCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                ) : (
                    <View style={{ width: 40 }} />
                )}

            </View>

            {/* Modify order name modal */}
            <FrontLayerWrapper visible={showModifyOrderNameModal} key="modifyOrderNameFrontLayer">
                <Modal
                    visible={showModifyOrderNameModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowModifyOrderNameModal(false)}
                >
                    <TouchableWithoutFeedback
                        onPress={() => {
                            Keyboard.dismiss();
                            setShowModifyOrderNameModal(false);
                        }}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalBox, { backgroundColor: CurrentTheme.primaryText }]}>
                                <Text style={styles.modalTitle}>{"Cambiar el nombre del pedido"}</Text>
                                <CustomTextInput
                                    value={String(orderName)}
                                    onChangeText={(text)=>{setOrderName(text)}}
                                    placeholder="Nombre del pedido"
                                    keyboardType="text"
                                    style={{ flexGrow:1,textAlign: "left", fontSize: 16,marginBottom:16 }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        var editedOrder = {...order};
                                        editedOrder.reference = orderName;
                                        dispatch(editOrder(editedOrder));
                                        setShowModifyOrderNameModal(false);
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
            </FrontLayerWrapper>

        </View>
    );
};

export default OrderMobileHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        marginBottom: 8,
        padding: 10,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    leftZone: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    roundBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    refText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
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
