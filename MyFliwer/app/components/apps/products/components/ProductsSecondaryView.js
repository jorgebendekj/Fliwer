import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import ProductForm from "./sections/ProductForm";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import ProductMobileHeader from "./sections/ProductMobileHeader";

const ProductsSecondaryView = ({ idProduct, editMode, setProductStatus, productStatus }) => {

    const { orientation } = useMediaInfo();

    const products = useSelector(state => state.products.products) || [];
    const originalProduct = products.find(p => p.id == idProduct);

    const [product, setProduct] = useState(null);

    useEffect(() => {
        if (originalProduct) setProduct(originalProduct);
    }, [originalProduct]);

    if (!product) return null;

    return (
        <View
            style={{
                backgroundColor: CurrentTheme.secondaryView,
                flex: 1,
            }}
            key={`ProductSecondaryView${idProduct}`}
        >
            {orientation === "portrait" && (
                <ProductMobileHeader product={product} productStatus={productStatus} />
            )}
            <ProductForm
                product={product}
                setProduct={setProduct}
                editMode={editMode}
                setProductStatus={setProductStatus}
            />
        </View>
    );
};

export default ProductsSecondaryView;
