import React, { useEffect, useState } from "react";
import FliwerWrapper from "../../FliwerWrapper";
import { withRouter } from "../../../utils/router/router";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentApp, setPortraitScreen } from "../../../actions/wrapperActions";
import FliwerLoading from "../../fliwerLoading";
import TasksList from "./components/TasksList";
import { useMediaInfo } from "../../../utils/mediaStyleSheet";
import { deleteTask, getTasks } from "../../../actions/academyActions";
import TasksSecondaryView from "./components/TasksSecondaryView";
import { Alert, BackHandler, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import { CurrentTheme } from "../../../utils/FliwerColors";
import FrontLayerWrapper from "../../frontLayerWrapper";
import FliwerDeleteModal from "../../custom/FliwerDeleteModal";
import { get } from "../../../actions/languageActions";
import { toast } from "../../../widgets/toast/toast";
import { Redirect } from "../../../utils/router/router";

const Tasks = ({ currentPath, match }) => {

    const dispatch = useDispatch();
    const { orientation } = useMediaInfo();

    const portraitScreen = useSelector(state => state.wrapperReducer.portraitScreen);
    const loading = useSelector(state => state.academyReducer.loading);

    const [indents, setIndents] = useState([[], [], []]);
    const [redirects, setRedirects] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskStatus, setTaskStatus] = useState({});

    const renderSecondaryView = () => {
        if (!match.params?.idTask) return [];
        return [
            <TasksSecondaryView
                key="tasks-secondary-view"
                idTask={match.params.idTask}
                setTaskStatus={setTaskStatus}
                taskStatus={taskStatus}
            />
        ];
    };


    const renderFilterMenu = () => {
        var mobile = orientation == "landscape";
        switch (currentPath) {
            case "/app/tasks/details/:idTask":
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
            <FrontLayerWrapper key="renderDeleteTaskModal">
                <FliwerDeleteModal
                    visible={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={async () => {
                        const res = await dispatch(deleteTask(match.params.idTask));
                        setShowDeleteModal(false);
                        if (res?.ok) {
                            setRedirects([
                                <Redirect to={`/app/tasks`} />
                            ]);
                        } else {
                            toast.error(dispatch(get("Academy_error_deleting_task")))
                        }
                    }}
                    title={dispatch(get("Academy_delete_task_confirmation"))}
                    hiddeText={true}
                    password={false}
                    loadingModal={loading}
                />
            </FrontLayerWrapper>
        );
    };

    useEffect(() => {
        dispatch(setCurrentApp("tasks"));
        dispatch(getTasks());
    }, []);

    useEffect(() => {
        setIndents([
            [
                <TasksList
                    match={match}
                    redirects={redirects}
                    setRedirects={setRedirects}
                    taskStatus={taskStatus}
                />
            ],
            renderSecondaryView(),
            renderFilterMenu()
        ]);

        if (currentPath === "/app/tasks" && orientation !== "landscape" && portraitScreen !== 1) {
            dispatch(setPortraitScreen(1));
        }
    }, [currentPath, match, taskStatus]);

    useEffect(() => {
        const backHandler = () => {
            const isInSecondaryView = currentPath?.startsWith("/app/tasks/details/");
            if (isInSecondaryView) {
                setRedirects([<Redirect to={`/app/tasks`} />]);

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
            const timeout = setTimeout(() => setRedirects([]), 0);
            return () => clearTimeout(timeout);
        }
    }, [redirects]);

    return [
        <FliwerWrapper key="fliwerWrapper">{indents}</FliwerWrapper>,
        loading ? <FliwerLoading /> : null,
        renderDeleteModal(),
        redirects
    ];

};

export default withRouter(Tasks);

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