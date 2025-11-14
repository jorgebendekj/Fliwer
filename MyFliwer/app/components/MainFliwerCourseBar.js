import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { CurrentTheme } from "../utils/FliwerColors";

const MainFliwerCourseBar = ({
    position,
    barStyle,
    children
}) => {

    return (
        <View
            style={[
                stlyes.bar,
                { backgroundColor: CurrentTheme.primaryColor },
                Platform.OS == 'ios' && position != "top"
                    ?
                    {
                        height: 60,
                        paddingBottom: 10
                    }
                    :
                    {},
                barStyle,
                position == "top"
                    ?
                    stlyes.barOnTop
                    :
                    stlyes.barOnBottom
            ]}
        >
            {children}
        </View>
    )
};

export default MainFliwerCourseBar

const stlyes = StyleSheet.create({
    bar: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        justifyContent: "center"
    },
    barOnTop: {
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1
    },
    barOnBottom: {
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1
    },
    actionButton: {
        marginLeft: 20, marginRight: 20
    }
})