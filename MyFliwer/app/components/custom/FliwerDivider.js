import React from "react";
import { View } from "react-native";
import { CurrentTheme } from "../../utils/FliwerColors";

const FilwerDivider = ({
    children,
    styles
}) => {

    if (children) {
        return (
            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    width: '100%',
                    marginVertical: '10px',
                    ...styles
                }}
            >
                <View
                    style={{
                        flex: 1,
                        borderBottomWidth: 1,
                        borderBottomColor: CurrentTheme.primaryText,
                        marginHorizontal: 10
                    }}
                />
                {children}
                <View
                    style={{
                        flex: 1,
                        borderBottomWidth: 1,
                        borderBottomColor: CurrentTheme.primaryText,
                        marginHorizontal: 10
                    }}
                />
            </View>
        )
    }

    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                width: '100%',
                marginVertical: '10px',
            }}
        >
            <View
                style={{
                    flex: 1,
                    borderBottomWidth: 1,
                    borderBottomColor: CurrentTheme.primaryText,
                    marginHorizontal: 10
                }}
            />
        </View>
    )
}

export default FilwerDivider