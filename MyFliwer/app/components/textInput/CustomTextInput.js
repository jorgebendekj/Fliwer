import React, { useState } from "react";
import { TextInput } from "react-native";
import { CurrentTheme } from "../../utils/FliwerColors";

const CustomTextInput = ({
    value,
    onChangeText,
    error = false,
    disabled = false,
    style = {},
    placeholder = "",
    focusBorderColor = "#79b869",
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={!disabled}
            placeholder={placeholder}
            placeholderTextColor={CurrentTheme.secondaryText}
            style={[
                {
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
                },
                isFocused && { borderColor: focusBorderColor },
                error && { borderColor: "red" },
                style,
            ]}
            {...rest}
        />
    );
};

export default CustomTextInput;
