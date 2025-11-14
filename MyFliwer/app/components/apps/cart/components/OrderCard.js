// OrderCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { get } from "../../../../actions/languageActions";

// helpers (mantenemos tu formateo contable)
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
const formatDateTime = (timestamp) => {
    try {
        const d = new Date(timestamp);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
        return String(timestamp);
    }
};

const OrderCard = ({ order, onPress, onLongPress, idOrder }) => {
    const { id, date, totalPrice, totalQuantity, status, reference } = order;
    const dispatch = useDispatch();

    const translate = (text) => dispatch(get(text));

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: idOrder != id ? CurrentTheme.darkerCardColor : CurrentTheme.lighterCardColor,
                    borderWidth: idOrder == id ? 2 : 0,
                    borderColor: FliwerColors.primary.green
                }
            ]}
            activeOpacity={0.9}
            onPress={() => onPress?.(order.id)}
            onLongPress={onLongPress}     // <-- long press para abrir modal de borrado
            delayLongPress={350}
        >
            <View style={styles.topRow}>
                <Text style={[styles.orderId, { color: CurrentTheme.cardText }]}>
                    #{reference || id}
                </Text>
                <Text style={[styles.date, { color: CurrentTheme.cardText }]}>
                    {formatDateTime(date)}
                </Text>
            </View>


            {/* Estado (lo dejamos como estaba, comentado) */}
            {/* <View style={styles.statusRow}>
        <Ionicons name={getStatusIcon()} size={16} color={CurrentTheme.cardText} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View> */}

            <View style={styles.bottomRow}>
                <Text style={[styles.infoText, { color: CurrentTheme.cardText }]}>
                    {translate("Orders_label_products")} {totalQuantity}
                </Text>

                {/* Reemplaza flecha por total grande y formateado */}
                <Text
                    style={[
                        styles.infoText,
                        { color: CurrentTheme.cardText, fontWeight: "700", fontSize: 18 } // + tamaño
                    ]}
                >
                    {formatEuro(totalPrice)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default React.memo(OrderCard);

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        padding: 12,
        marginVertical: 6,
        elevation: 2,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: "600",
    },
    date: {
        fontSize: 14,
        opacity: 0.7,
    },
    referenceText: {
        fontSize: 13,
        marginTop: 2,
    },
    infoText: {
        fontSize: 15,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginLeft: 8
    },
    statusText: {
        fontSize: 14,
        color: CurrentTheme.cardText
    }
});
