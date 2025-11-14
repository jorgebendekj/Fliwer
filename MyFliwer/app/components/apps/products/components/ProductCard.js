import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from "react-native";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import { useDispatch } from "react-redux";
import { get } from "../../../../actions/languageActions";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';

const ProductCard = ({ item, hanldeRedirects, selectedProduct, status }) => {
    const dispatch = useDispatch();

    const translator = (text) => dispatch(get(text));

    const imageUrl = item.images?.[0]?.url || "https://my.fliwer.com/no-image.jpg";

    return (
        <TouchableOpacity
            style={{
                backgroundColor: selectedProduct == item.id ? CurrentTheme.lighterCardColor : CurrentTheme.darkerCardColor,
                marginVertical: 10,
                borderRadius: 8,
                padding: 10,
                borderWidth: selectedProduct == item.id ? 2 : 0,
                borderColor: FliwerColors.primary.green
            }}
            onPress={hanldeRedirects}
        >
            <View style={{ flexDirection: "row", gap: 10 }}>
                <Image
                    style={{
                        width: 90,
                        height: 90,
                        borderRadius: 10,
                        backgroundColor: "white"
                    }}
                    source={{ uri: imageUrl }}
                    resizeMode={"cover"}
                />

                <View style={{ flex: 1 }}>
                    <Text style={[styles.textTitle, { color: CurrentTheme.cardText }]} numberOfLines={1}>
                        {item.id} {item.name || "—"}
                    </Text>

                    <Text
                        style={[styles.textDescription, { color: CurrentTheme.cardText }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.description || "—"}
                    </Text>

                    <View style={styles.statusPriorityRow}>
                        <Text style={{ color: CurrentTheme.cardText, fontSize: 13 }}>
                            {translator("general_price")}: {item.price ?? "—"}€
                        </Text>
                        {item.stockQuantity !== null && item.stockQuantity !== undefined && (
                            <Text style={{ color: CurrentTheme.cardText, fontSize: 13 }}>
                                {translator("general_stock")}: {item.stockQuantity}
                            </Text>
                        )}
                    </View>
                </View>

                {status && (
                    <View style={styles.statusRow}>
                        <IoniconsIcon
                            name={
                                status === "saved" ? "cloud-done-outline" :
                                    status === "saving" ? "cloud-upload-outline" :
                                        status === "editing" ? "create-outline" :
                                            "alert-circle-outline"
                            }
                            size={16}
                            color="white"
                        />
                        <Text style={styles.statusText}>
                            {status === "saved" && "Guardado"}
                            {status === "saving" && "Guardando..."}
                            {status === "editing" && "Editando..."}
                            {status === "error" && "Error"}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(ProductCard);

const styles = StyleSheet.create({
    textTitle: {
        fontFamily: FliwerColors.fonts.title,
        fontSize: 16,
        marginBottom: 6
    },
    textDescription: {
        fontFamily: FliwerColors.fonts.regular,
        fontSize: 13,
        marginBottom: 2
    },
    statusPriorityRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 4
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4
    },
    statusText: {
        fontSize: 14,
        color: "white"
    }
});
