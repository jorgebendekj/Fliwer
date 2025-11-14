import React, { useEffect, useRef, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMediaInfo } from "../../../../../utils/mediaStyleSheet";
import { CurrentTheme, FliwerColors } from "../../../../../utils/FliwerColors";
import CustomTextInput from "../../../../textInput/CustomTextInput";
import Dropdown from "../../../../../widgets/dropdown/dropdown";
import { MediaPicker } from "../../../../../utils/uploadMedia/MediaPicker";
import QRCode from "react-native-qrcode-svg";
import FrontLayerWrapper from "../../../../frontLayerWrapper";
import Modal from "../../../../../widgets/modal/modal";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../../../../../actions/languageActions";
import { captureRef } from "react-native-view-shot";
import _ from "lodash";
import { toast } from "../../../../../widgets/toast/toast";
import { editProduct, editProductLocally } from "../../../../../reducers/productsSlice";

const IMMEDIATE_FIELDS = new Set([
  "images"
]);

const DEBOUNCE_FIELDS = new Set([
  "name",
  "price",
  "manufacturer",
  "minimumOrderQuantityPrice",
  "description",
  "stockQuantity",
  "unity",
  "minimumOrderQuantity",
  "customFields"
]);


const ProductForm = ({ product, setProduct, editMode, setProductStatus }) => {

  const dispatch = useDispatch();
  const viewRef = useRef(null);
  const textareaRef = useRef(null);

  const customFieldsDefs = useSelector(
    state => state.userOffline.data?.customProductFields || []
  );

  const { orientation } = useMediaInfo();

  const mobile = orientation !== "landscape";
  const [modalVisible, setModalVisible] = useState(false);

  const debouncedSave = useRef(
    _.debounce((idProduct,field, value) => {
      saveField(idProduct,field, value);
    }, 1000)
  ).current;

  const handleFieldChange = (field, value) => {
    console.log("handleFieldChange for product",product.id, field, value);
    setProduct((prev) => ({ ...prev, [field]: value }));
    if (IMMEDIATE_FIELDS.has(field)) {
      saveField(product.id,field, value);
    } else if (DEBOUNCE_FIELDS.has(field)) {
      debouncedSave(product.id,field, value);
    }
  };

  const translator = (label) => {
    return dispatch(get(label))
  }

  const saveField = async (idProduct,field, value) => {
    if (["name", "price"].includes(field) && !value) return;

    if (setProductStatus) {
      setProductStatus(prev => ({ ...prev, [idProduct]: "saving" }));
    }

    try {
      await dispatch(
        editProduct({
          product: idProduct,
          data: {
            [field]: field === "images" ? [{ base64: value }] : value
          }
        })
      ).unwrap();

      /*
      dispatch(editProductLocally({
        product: product.id,
        data: {
          [field]: field === "images" ? [{ base64: value }] : value
        }
      }));*/


      if (setProductStatus) {
        setTimeout(() => {
          setProductStatus(prev => ({ ...prev, [idProduct]: "saved" }));
        }, 1500);
      }
    } catch (error) {
      if (setProductStatus) {
        setProductStatus(prev => ({ ...prev, [idProduct]: "error" }));
      }
    }

  };


  if (typeof __DEV__ === "undefined") {
    global.__DEV__ = process.env.NODE_ENV !== "production";
  }

  const downloadViewAsImage = async () => {
    if (Platform.OS === "web" && viewRef.current) {
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
        result: "data-uri"
      });

      const link = document.createElement("a");
      link.download = `${product.name.replace(" ", "_")}_qr.png`;
      link.href = uri;
      link.click();
    }
  };

  var fileInputRef;

  const getPhotos = () => {
    const options = {
      fileInput: fileInputRef
    };
    MediaPicker.openPicker(options).then(
      (response) => {
        debugger;
        if (!response || response.didCancel) {
          console.log("User cancelled image picker");
        } else {
          handleFieldChange("images", response.base64)
        }
      },
      () => {
        console.log("Error gathering image");
      }
    );
  };

  const renderInputFile = () => {
    if (Platform.OS === "web")
      return <input ref={(fileInput) => (fileInputRef = fileInput)} style={{ display: "none" }} type="file" />;
    return null;
  };

  const renderInput = (label, key, fontSize = 16, keyboardType = "default", multiline = false) => {
    const value = product?.[key] ?? "";
    const hasLabel = !["name", "price"].includes(key)
    return (
      <View style={{ width: mobile ? "100%" : "48%" }}>
        {hasLabel && <Text style={[styles.modalInputTitle, { fontSize }]}>{label}</Text>}
        {editMode ? (
          (Platform.OS == "web" && multiline)
            ?
            <textarea
              ref={(ref) => {
                if (ref) {
                  textareaRef.current = ref;
                  ref.style.height = 'auto';
                  ref.style.height = `${ref.scrollHeight}px`;
                }
              }}
              value={String(value)}
              rows={1}
              onChange={(e) => {
                const text = e.target.value;
                handleFieldChange(key, text);
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
              }}
              style={{
                width: '100%',
                textAlignVertical: 'top',
                opacity: Platform.OS === "android" ? 0.6 : 1,
                minHeight: 40,
                maxHeight: 300,
                height: 40,
                padding: 5,
                marginBottom: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#323232",
                backgroundColor: CurrentTheme.componentCardColor,
                color: CurrentTheme.secondaryText,
                fontFamily: "Montserrat-Regular",
                outlineStyle: "none"
              }}
            />
            :
            <CustomTextInput
              value={String(value)}
              onChangeText={(val) => handleFieldChange(key, val)}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              keyboardType={keyboardType}
              style={{
                fontSize,
                textAlignVertical: multiline ? "top" : "center"
              }}
            />
        ) : (
          <Text style={[styles.editText, { fontSize }]}>
            {value === "" || value === null ? "—" : value}{key === "price" ? "€" : ""}
          </Text>
        )}
      </View>
    );
  };

  const renderCustomFields = () => {
    return customFieldsDefs.map((fieldDef) => {
      const key = `customFields.${fieldDef.id}`;
      const label = fieldDef.label || fieldDef.name;
      const value = product.customFields?.find(f => f.id === fieldDef.id)?.value || "";

      const onChange = newValue => {
          // Use 'let' instead of 'var' for block-scoping
          let updated = [...(product.customFields || [])];
          const index = updated.findIndex(f => f.id === fieldDef.id);

          if (index !== -1) {
            // 1. Create a new object by copying the old one
            const updatedItem = {
              ...updated[index],
              value: newValue // 2. Set the new value on the copy
            };
            // 3. Replace the old object with the new one in the new array
            updated[index] = updatedItem;
          } else {
            // This part was already correct, as it creates a new object
            updated.push({
              id: fieldDef.id,
              value: newValue
            });
          }

          handleFieldChange("customFields", updated);
      };

      return (
        <View key={fieldDef.id} style={{ width: mobile ? "100%" : "48%" }}>
          <Text style={[styles.modalInputTitle]}>{label}</Text>
          {editMode ? (
            <CustomTextInput
              value={value}
              onChangeText={onChange}
            />
          ) : (
            <Text style={styles.editText}>{value || "—"}</Text>
          )}
        </View>
      );
    });
  };

  const qrValue = React.useMemo(
    () =>
      JSON.stringify({
        app: "Taskium",
        version: 1,
        type: "product",
        data: { id: product.id },
      }),
    [product.id]
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: CurrentTheme.cardColor,
        margin: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#323232",
        padding: 20
      }}
    >
      <View
        style={{
          flexDirection: mobile ? "column" : "row",
          alignItems: "flex-start",
          width: "100%",
          gap: 10,
        }}
      >
        <View
          style={{
            flexDirection: mobile ? "row" : "column",
            justifyContent: mobile ? "flex-start" : "space-between",
            alignItems: mobile ? "center" : "stretch",
            gap: 10,
            height: mobile ? "auto" : "100%",
            flex: mobile ? 0 : 0.3
          }}
        >
          <View style={[{ width: 200, height: 200 }, mobile ? { alignSelf: "center" } : {}]}>
            <TouchableOpacity
              onPress={getPhotos}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#eee",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Image
                source={product?.images?.length > 0 ? { uri: product.images[0]?.url } : "https://my.fliwer.com/no-image.jpg"}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>
          </View>

          <View style={mobile ? {} : { marginTop: "auto", alignSelf: "flex-start" }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QRCode
                value={qrValue}
                size={150}
                ecl={"M"}
                quietZone={8}
              />
            </TouchableOpacity>
          </View>

        </View>

        <View style={[{ flexDirection: "column", gap: 10 }, mobile ? {} : { flex: 1 }]}>
          <View style={{ flexDirection: mobile ? "column" : "row", gap: 10 }}>
            {renderInput(translator("Products_form_name"), "name", 28)}
            {renderInput(translator("Products_form_price"), "price", 28, "decimal-pad")}
          </View>

          <View style={{ flexDirection: mobile ? "column" : "row", gap: 10 }}>
            {renderInput(translator("Products_form_manufacturerCode"), "manufacturer", 20)}
            {renderInput(translator("Products_form_stockQuantity"), "stockQuantity", 20, "numeric")}
          </View>

          <View style={{ flexDirection: mobile ? "column" : "row", gap: 10 }}>
            {renderInput(translator("Products_form_unit"), "unity", 16)}
            {renderInput(translator("Products_form_minOrder"), "minimumOrderQuantity", 16, "numeric")}
          </View>

          <View style={{ flexDirection: mobile ? "column" : "row", gap: 10 }}>
            {renderInput(translator("Products_form_minPrice"), "minimumOrderQuantityPrice", 16, "decimal-pad")}
            {renderInput(translator("Products_form_description"), "description", 16, "default", true)}
          </View>

          <View style={{ flexDirection: mobile ? "column" : "row", flexWrap: "wrap", gap: 10 }}>
            {renderCustomFields()}
          </View>

        </View>
      </View>
      {modalVisible && (
        <FrontLayerWrapper key={`renderProductQRScreenModal${product.id}`}>
          <Modal
            visible={modalVisible}
            animationType="fade"
            inStyle={styles.modalIn}
            onClose={() => {
              setModalVisible(false);
            }}
          >
            <View style={styles.modalView}>
              <Text style={[styles.title, { fontFamily: FliwerColors.fonts.title }]}>{product.name}</Text>
              <View ref={viewRef} >
                <QRCode
                  value={qrValue}
                  size={400}
                  ecl={"M"}
                  quietZone={8}
                />
              </View>
              <TouchableOpacity
                style={[styles.createButtonConfirm, { backgroundColor: CurrentTheme.cardColor }]}
                onPress={downloadViewAsImage}
              >
                <Text style={[styles.createButtonText, { color: CurrentTheme.cardText }]}>{translator("downloadData_button")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                <Text style={{ color: "#007AFF" }}>{translator("general_cancel")}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </FrontLayerWrapper>
      )}
      {renderInputFile()}
    </ScrollView>
  );

};

export default ProductForm;

const styles = StyleSheet.create({
  modalInputTitle: {
    marginBottom: 5,
    color: "white",
    fontFamily: "Montserrat-Regular"
  },
  editText: {
    paddingVertical: 5,
    paddingRight: 5,
    marginBottom: 10,
    color: "white",
    fontFamily: "Montserrat-Regular"
  },
  select: {
    width: "100%",
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#323232",
    backgroundColor: "rgb(38,38,38)",
    fontFamily: "Montserrat-Regular",
    marginBottom: 10,
    color: "white"
  },
  modalIn: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    width: "90%",
    maxWidth: 450,
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
  createButtonConfirm: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
});
