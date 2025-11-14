import React, { useEffect, useState } from "react";
import FliwerWrapper from "../../FliwerWrapper";
import { withRouter } from "../../../utils/router/router";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentApp, setPortraitScreen } from "../../../actions/wrapperActions";
import FliwerLoading from "../../fliwerLoading";
import { useMediaInfo } from "../../../utils/mediaStyleSheet";
import { BackHandler, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import { CurrentTheme } from "../../../utils/FliwerColors";
import FrontLayerWrapper from "../../frontLayerWrapper";
import FliwerDeleteModal from "../../custom/FliwerDeleteModal";
import { get } from "../../../actions/languageActions";
import { toast } from "../../../widgets/toast/toast";
import ProductsList from "./components/ProductsList";
import ProductsSecondaryView from "./components/ProductsSecondaryView";
import { Redirect } from "../../../utils/router/router";
import { deleteProduct, getProducts } from "../../../reducers/productsSlice";

const ProductsApp = ({ currentPath, match }) => {

    const dispatch = useDispatch();

    const { orientation } = useMediaInfo();

    const mobile = orientation !== "landscape";

    const portraitScreen = useSelector(state => state.wrapperReducer.portraitScreen);
    const loading = useSelector(state => state.invoiceReducer.loading);

    const [indents, setIndents] = useState([[], [], []]);
    const [redirects, setRedirects] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [productStatus, setProductStatus] = useState({});

    const renderSecondaryView = () => {
        if (!match.params?.idProduct) return [];
        return [
            <ProductsSecondaryView
                key="product-secondary-view"
                idProduct={match.params.idProduct}
                editMode={editMode}
                //setProductStatus={setProductStatus}
                //productStatus={productStatus}
            />
        ];
    };

    const renderFilterMenu = () => {
        var mobile = orientation == "landscape";
        switch (currentPath) {
            case "/app/products/details/:idProduct":
                return (
                    <View
                        style={{
                            flex: mobile ? 1 : 0,
                            display: "flex",
                            flexDirection: mobile ? "column" : "row",
                            justifyContent: mobile ? "flex-start" : "space-around",
                            paddingTop: mobile ? 0 : 0,
                            alignItems: "center",
                            backgroundColor: mobile ? CurrentTheme.filterMenu : CurrentTheme.filterMenu,
                            gap: '15px',
                        }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.switchModeButton
                            ]}
                            activeOpacity={1}
                            onPress={() => setEditMode(!editMode)}
                        >
                            <IconFontAwesome name={editMode ? "close" : "pencil"} size={30} style={{ color: "white" }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.switchModeButton
                            ]}
                            activeOpacity={1}
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <IconFontAwesome name="trash-o" size={30} style={{ color: CurrentTheme.primaryText }} />
                        </TouchableOpacity>
                    </View>
                )
            default:
                return (
                    <View
                        style={{
                            flex: mobile ? 1 : 0,
                            display: "flex",
                            flexDirection: mobile ? "column" : "row",
                            justifyContent: mobile ? "flex-start" : "space-around",
                            paddingTop: mobile ? 0 : 0,
                            alignItems: "center",
                            backgroundColor: mobile ? CurrentTheme.filterMenu : CurrentTheme.filterMenu,
                            gap: '15px',
                        }}
                    ></View>
                )
        }
    };

    const renderDeleteModal = () => {
        if (!showDeleteModal) return null;

        return (
            <FrontLayerWrapper key="renderDeleteProductModal">
                <FliwerDeleteModal
                    visible={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={async () => {
                        try {
                            await dispatch(deleteProduct(match.params.idProduct)).unwrap();
                            setRedirects([<Redirect to={`/app/products`} />]);
                            setShowDeleteModal(false);
                        } catch (error) {
                            toast.error(dispatch(get("Academy_error_deleting_product")));
                        }
                    }}
                    title={dispatch(get("Academy_delete_prodcut_confirmation"))}
                    hiddeText={true}
                    password={false}
                    loadingModal={loading}
                />
            </FrontLayerWrapper>
        );
    };

    useEffect(() => {
        dispatch(setCurrentApp("products"));
        dispatch(getProducts());
    }, []);

    useEffect(() => {
        setIndents([
            [
                <ProductsList
                    match={match}
                    redirects={redirects}
                    setRedirects={setRedirects}
                    //productStatus={productStatus}
                />
            ],
            renderSecondaryView(),
            renderFilterMenu()
        ]);

        if (currentPath === "/app/products" && orientation !== "landscape" && portraitScreen !== 1) {
            dispatch(setPortraitScreen(1));
        }
    }, [currentPath, match, editMode, productStatus]);

    useEffect(() => {
        if (redirects.length > 0) {
            const timeout = setTimeout(() => setRedirects([]), 0);
            return () => clearTimeout(timeout);
        }
    }, [redirects]);


    useEffect(() => {
        const backHandler = () => {
            const isInSecondaryView = currentPath?.startsWith("/app/products/details/");
            if (isInSecondaryView) {
                setRedirects([<Redirect to={`/app/products`} />]);

                if (mobile && portraitScreen !== 1) {
                    dispatch(setPortraitScreen(1));
                }

                return true;
            }

            return false;
        };

        if (Platform.OS === "android") {
            BackHandler.addEventListener("hardwareBackPress", backHandler);
        }

        return () => {
            if (Platform.OS === "android") {
                BackHandler.removeEventListener("hardwareBackPress", backHandler);
            }
        };
    }, [currentPath, mobile, portraitScreen]);

    return [
        <FliwerWrapper key="fliwerWrapper">{indents}</FliwerWrapper>,
        loading ? <FliwerLoading /> : null,
        renderDeleteModal(),
        redirects
    ];

};

export default withRouter(ProductsApp);

const styles = StyleSheet.create({
    switchModeButton: {
        width: 50,
        height: 50,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
});