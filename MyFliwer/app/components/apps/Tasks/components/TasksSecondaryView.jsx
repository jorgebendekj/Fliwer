import React from "react";
import CourseTaskComponent from "../../../fliwerAcademy/components/CourseTaskComponent";
import { View } from "react-native";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import TaskMobileHeader from "./TaskMobileHeader";
import { useSelector } from "react-redux";

const TasksSecondaryView = ({ idTask, setTaskStatus, taskStatus }) => {

    if (!idTask) return null;

    const { orientation } = useMediaInfo();

    const mobile = orientation != "landscape";

    const task = useSelector(state =>
        state.academyReducer.tasks.find(t => t.id == idTask)
    );

    return (
        <View
            style={{
                backgroundColor: CurrentTheme.secondaryView,
                flex: 1
            }}
            key={`TasksSecondaryView${idTask}`}
        >
            {mobile && (
                <TaskMobileHeader
                    taskStatus={taskStatus}
                    idTask={idTask}
                    task={task}
                />
            )}
            <View style={{ padding: 10 }}>
                <CourseTaskComponent
                    idTask={idTask}
                    setTaskStatus={setTaskStatus}
                />
            </View>
        </View>
    );
};

export default TasksSecondaryView;