import React, { useState, useMemo } from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import { Redirect } from "../../../../utils/router/router";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import { Text } from "react-native";
import ProductCard from "./ProductCard";
import { setPortraitScreen } from "../../../../actions/wrapperActions";
import { get } from "../../../../actions/languageActions";
import FrontLayerWrapper from "../../../frontLayerWrapper";
import Modal from "../../../../widgets/modal/modal";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { toast } from "../../../../widgets/toast/toast";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { putProduct } from "../../../../reducers/productsSlice";
import CustomTextInput from "../../../textInput/CustomTextInput";

const ProductsList = ({ match, setRedirects, productStatus }) => {

    const { orientation } = useMediaInfo();
    const dispatch = useDispatch();

    const products = useSelector(state => state.products.products) || [];
    const customProductFields = useSelector(state => state.userOffline.data?.customProductFields || []);

    const [modalVisible, setModalVisible] = useState(false);
    const [productData, setProductData] = useState({ name: "", price: "" });
    const [searchQuery, setSearchQuery] = useState("");


    const hanldeRedirects = (id) => {
        setRedirects([
            <Redirect to={`/app/products/details/${id}`} />
        ]);
        if (orientation !== "landscape") {
            dispatch(setPortraitScreen(2));
        }
    };

    const translator = (label) => {
        return dispatch(get(label))
    }

    const buildCustomFields = (flatObject, fieldDefs) => {
        return fieldDefs.map((def, idx) => ({
            id: def.id,
            value: flatObject[def.name]
        }));
    };

    const filteredProducts = useMemo(() => {
        const ids = searchQuery.split(",").map(id => id.trim()).filter(Boolean);
        return products.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const idMatch = ids.includes(String(p.id));
            return nameMatch || idMatch;
        });
    }, [products, searchQuery]);

    const handleCreateProduct = async () => {
        if (!productData.name?.trim()) return toast.error("Nombre necesario.");
        if (!productData.price?.trim()) return toast.error("Precio necesario.");

        try {
            /*
            const fakeProduct = {
                id: Date.now(),
                name: productData.name,
                price: productData.price,
                manufacturer: "",
                description: "",
                stockQuantity: 0,
                insertTime: new Date().toISOString(),
                insertTimeUnix: Math.floor(Date.now() / 1000),
                images: [],
                customFields: customProductFields.map(f => ({ id: f.id, value: null }))
            };
            dispatch({ type: 'products/addFakeProduct', payload: fakeProduct });*/
            var newProduct=await dispatch(putProduct(productData));

            setModalVisible(false);
            setProductData({});
            hanldeRedirects(newProduct.payload.id);
        } catch (error) {
            console.log(error)
            toast.error("Error al crear el producto.");
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: CurrentTheme.primaryView }}>
            {orientation !== "landscape" ? (
                <Text
                    style={{
                        paddingHorizontal: 10,
                        color: CurrentTheme.primaryText,
                        fontFamily: FliwerColors.fonts.title,
                        textAlign: "center",
                        fontSize: 18,
                        marginVertical: 5
                    }}
                >
                    {translator("Products_list_title")}
                </Text>
            ) : null}


            <View style={styles.topBar}>
                <CustomTextInput
                    placeholder={"Buscar un producto..."}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[styles.searchInput,{margin:10,backgroundColor:CurrentTheme.primaryColor}]}
                />
            </View>

            <FlatList
                data={[...filteredProducts].sort((a, b) => a.id - b.id)}
                keyExtractor={(item) => `product-${item.id}`}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={{
                            borderRadius: 10,
                            padding: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: FliwerColors.secondary.white,
                            marginVertical: 10,
                            opacity: Platform.OS == "android" ? 0.6 : 0.4
                        }}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons
                            name="add"
                            color={"gray"}
                            size={30}
                        />
                    </TouchableOpacity>
                }
                renderItem={({ item }) => (
                    <ProductCard
                        item={item}
                        hanldeRedirects={() => hanldeRedirects(item.id)}
                        selectedProduct={match.params?.idProduct}
                        //status={productStatus[item.id]}
                    />
                )}
            />
            {modalVisible && (
                <FrontLayerWrapper key="renderCreateProductScreenModal">
                    <Modal
                        visible={modalVisible}
                        animationType="fade"
                        inStyle={styles.modalIn}
                        onClose={() => {
                            setModalVisible(false);
                            setProductData({});
                        }}
                    >
                        <View style={styles.modalView}>
                            <Text style={[styles.title, { fontFamily: FliwerColors.fonts.title }]}>{translator("Files_create_new_product")}</Text>
                            <TextInput
                                placeholder="Nombre del producto"
                                value={productData.name}
                                onChangeText={(val) => setProductData(prev => ({ ...prev, name: val }))}
                                style={styles.inputSearch}
                            />
                            <TextInput
                                placeholder="Precio"
                                value={productData.price}
                                onChangeText={(val) => setProductData(prev => ({ ...prev, price: val }))}
                                keyboardType="decimal-pad"
                                style={styles.inputSearch}
                            />
                            <TouchableOpacity
                                style={[styles.createButtonConfirm, { backgroundColor: CurrentTheme.cardColor }]}
                                onPress={handleCreateProduct}
                            >
                                <Text style={[styles.createButtonText, { color: CurrentTheme.cardText }]}>{translator("confirm")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
                                <Text style={{ color: "#007AFF" }}>{translator("general_cancel")}</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </FrontLayerWrapper>
            )}
        </View>
    );
};

export default ProductsList;

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 10,
    },
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
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
    inputSearch: {
        height: 40,
        width: "100%",
        borderColor: "gray",
        borderWidth: 1,
        padding: 5,
        backgroundColor: "white",
        marginBottom: 10,
    },
    createButtonConfirm: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
});
