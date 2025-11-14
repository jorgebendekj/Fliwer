import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { CurrentTheme, FliwerColors } from "../../../../../utils/FliwerColors";
import { setPortraitScreen } from "../../../../../actions/wrapperActions";

const ProductMobileHeader = ({ product, productStatus }) => {
  const dispatch = useDispatch();

  const status = productStatus?.[product.id];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: FliwerColors.primary.green }
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => dispatch(setPortraitScreen(1))}
          style={styles.backButton}
        >
          <IoniconsIcon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

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
    </View>
  );
};

export default ProductMobileHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: CurrentTheme.cardColor,
    marginBottom: 8,
    padding: 10
  },
  backButton: {
    marginRight: 10,
    backgroundColor: FliwerColors.primary.green,
    padding: 6,
    borderRadius: 20
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  statusText: {
    fontSize: 14,
    color: "white"
  }
});
