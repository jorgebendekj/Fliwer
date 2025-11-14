import React, { useEffect, useState } from "react";
import FliwerWrapper from "../../FliwerWrapper";
import ClockInList from "./components/ClockInList";
import { withRouter } from "../../../utils/router/router";
import ClockInDetails from "./components/ClockInDetails";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentApp, setPortraitScreen } from "../../../actions/wrapperActions";
import FliwerLoading from "../../fliwerLoading";
import { getClockInData } from "../../../actions/clockInActions";
import { useMediaInfo } from "../../../utils/mediaStyleSheet";
import { CurrentTheme } from "../../../utils/FliwerColors";
import { BackHandler, Platform, View } from "react-native";
import { Redirect } from "../../../utils/router/router";

const ClockIn = ({
    currentPath,
    match
}) => {

    const dispatch = useDispatch();

    const clockInReducer = useSelector(state => state.clockInReducer)
    const portraitScreen = useSelector(state => state.wrapperReducer.portraitScreen)

    const { orientation } = useMediaInfo();

    const [indents, setIndents] = useState([[], [], []]);
    const [redirects, setRedirects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clockInStatus, setClockInStatus] = useState({});

    const renderSecondaryView = () => {
        if (clockInReducer.data.length == 0) return [];
        switch (currentPath) {
            case "/app/clockIn/details/:idClockIn":
                return (
                    <ClockInDetails
                        key={"ClockInDetails-" + match.params.idClockIn}
                        selectedClockIn={match.params.idClockIn}
                        setClockInStatus={setClockInStatus}
                        clockInStatus={clockInStatus}
                    />
                )
            default:
                return [];
        }
    };

    useEffect(() => {
        setIndents([
            [
                <ClockInList
                    match={match}
                    redirects={redirects}
                    setRedirects={setRedirects}
                    clockInStatus={clockInStatus}
                />
            ],
            renderSecondaryView(),
            []
        ])
        if (currentPath === "/app/clockIn" && orientation != "landscape" && portraitScreen != 1) {
            dispatch(setPortraitScreen(1))
        }
        if (currentPath === "/app/clockIn/details/:idClockIn" && orientation != "landscape" && portraitScreen == 1) {
            dispatch(setPortraitScreen(2))
        }
    }, [currentPath, match, clockInReducer.data, clockInStatus]);

    useEffect(() => {
        if (loading !== clockInReducer.loading) {
            setLoading(clockInReducer.loading)
        }
    }, [clockInReducer.loading])

    useEffect(() => {
        const backHandler = () => {
            const isInSecondaryView = currentPath?.startsWith("/app/clockIn/details/");
            if (isInSecondaryView) {
                setRedirects([<Redirect to={`/app/clockIn`} />]);

                if (portraitScreen !== 1) {
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
    }, [currentPath, portraitScreen]);

    useEffect(() => {
        if (redirects.length > 0) {
            const timeout = setTimeout(() => {
                setRedirects([]); // Limpiás después de un tick
            }, 0);
            return () => clearTimeout(timeout);
        }
    }, [redirects]);


    useEffect(() => {
        dispatch(setCurrentApp("clockIn"))
        dispatch(getClockInData())
    }, []);

    return [
        <FliwerWrapper key={"fliwerWrapper"}>{indents}</FliwerWrapper>,
        loading ? <FliwerLoading /> : null,
        redirects
    ]
};

export default withRouter(ClockIn);