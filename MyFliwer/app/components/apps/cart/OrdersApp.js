import React, { useEffect, useState } from "react";
import FliwerWrapper from "../../FliwerWrapper";
import { withRouter } from "../../../utils/router/router";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentApp, setPortraitScreen } from "../../../actions/wrapperActions";
import FliwerLoading from "../../fliwerLoading";
import { useMediaInfo } from "../../../utils/mediaStyleSheet";
import OrderSecondaryView from "./components/OrderSecondaryView";
import OrdersPrimaryView from "./components/OrdersPrimaryView";
import { BackHandler, Platform } from "react-native";
import { Redirect } from "../../../utils/router/router";
import { getProducts } from "../../../reducers/productsSlice";

const OrdersApp = ({ currentPath, match }) => {

    const dispatch = useDispatch();

    const { orientation } = useMediaInfo();

    const mobile = orientation !== "landscape";

    const portraitScreen = useSelector(state => state.wrapperReducer.portraitScreen);
    const loading = useSelector(state => state.invoiceReducer.loading);

    const [indents, setIndents] = useState([[], [], []]);
    const [redirects, setRedirects] = useState([]);
    const [openCartForOrderId, setOpenCartForOrderId] = useState(null);

    const goToOrderCart = (orderId) => {
        setOpenCartForOrderId(orderId);
        setRedirects([<Redirect key={`redir-${orderId}`} to={`/app/order/products/${orderId}`} />]);
        if (mobile) dispatch(setPortraitScreen(2));
    };

    const renderSecondaryView = () => {
        switch (currentPath) {
            case "/app/order/products/:idOrder":
                return (
                    <OrderSecondaryView
                        key="cart-secondary-view"
                        setRedirects={setRedirects}
                        idOrder={match.params.idOrder}
                        openCartForOrderId={openCartForOrderId}
                        onCartConsumed={() => setOpenCartForOrderId(null)}
                    />
                )
            default:
                return [];
        }
    };

    useEffect(() => {
        dispatch(setCurrentApp("newOrder"));
        dispatch(getProducts());
    }, []);

    useEffect(() => {
        setIndents([
            [
                <OrdersPrimaryView
                    key="cart-primary-view"
                    setRedirects={setRedirects}
                    idOrder={match.params.idOrder}
                    onGoToCart={goToOrderCart}
                />
            ],
            renderSecondaryView()
        ]);
        if (currentPath === "/app/order" && orientation !== "landscape" && portraitScreen !== 1) {
            dispatch(setPortraitScreen(1));
        }
    }, [currentPath, match]);

    useEffect(() => {
        const backHandler = () => {
            const isInSecondaryView = currentPath?.startsWith("/app/order/products/");
            if (isInSecondaryView) {
                // Redirigir manualmente a la vista primaria
                setRedirects([<Redirect to={`/app/order`} />]);

                // Cambiar a vista portrait si corresponde
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

    useEffect(() => {
        if (redirects.length > 0) {
            const timeout = setTimeout(() => setRedirects([]), 10);
            return () => clearTimeout(timeout);
        }
    }, [redirects]);

    return [
        <FliwerWrapper key="fliwerWrapper">{indents}</FliwerWrapper>,
        loading ? <FliwerLoading /> : null,
        redirects
    ];

};

export default withRouter(OrdersApp);