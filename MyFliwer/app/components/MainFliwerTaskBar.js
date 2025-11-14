import React, { useRef, useState } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import { CurrentTheme } from "../utils/FliwerColors";
import { useSelector } from "react-redux";

const MainFliwerTaskBar = ({
    addFile,
    addPhoto,
    addVideo,
    addText,
    idUser
}) => {

    const textareaRef = useRef(null);

    const userData = useSelector(state => state.sessionReducer.data);
    const isUser = idUser === userData?.user_id

    const [textValue, setTextValue] = useState("");

    const handleTextareaChange = (e) => {
        const text = e.target.value;
        setTextValue(text);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // reset
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleSend = () => {
        if (textValue.trim() == "") return
        addText(textValue, isUser ? 111 : 2);
        setTextValue("");
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: "#2c2c2c"//CurrentTheme.primaryColor
                }
            ]}
        >
            <View
                style={styles.iconsContainer}
            >
                <IoniconsIcon
                    name="camera-outline"
                    size={24}
                    color={"white"}
                    onPress={() => addPhoto(isUser ? 12 : 3)}
                />
                <IoniconsIcon
                    name="videocam-outline"
                    size={24}
                    color={"white"}
                    onPress={() => addVideo(isUser ? 13 : 3)}
                />
                <IoniconsIcon
                    name="attach-outline"
                    size={24}
                    color={"white"}
                    onPress={() => addFile(isUser ? 14 : 6)}
                />
            </View>
            <View
                style={{
                    flex: 1
                }}
            >
                {
                    Platform.OS === 'web'
                        ?
                        <textarea
                            ref={textareaRef}
                            placeholderTextColor={"white"}
                            placeholder="Escribe un mensaje"
                            rows={1}
                            style={{
                                width: '100%',
                                borderWidth: 0,
                                borderBottomWidth: 1,
                                borderColor: "gray",
                                textAlignVertical: 'top',
                                fontSize: 14,
                                color: "white",
                                opacity: Platform.OS === "android" ? 0.6 : 1,
                                backgroundColor: "#2c2c2c",
                                outline: 'none',
                                resize: 'none',
                                padding: 5,
                                overflow: 'hidden',
                                maxHeight: 150
                            }}
                            onChange={handleTextareaChange}
                            value={textValue}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        :
                        <TextInput
                            multiline={true}
                            numberOfLines={1}
                            placeholder="Escribe un mensaje"
                            placeholderTextColor={"white"}
                            style={{
                                width: '100%',
                                borderWidth: 1,
                                borderColor: "gray",
                                borderRadius: 6,
                                padding: 2,
                                textAlignVertical: 'center',
                                fontSize: 14,
                                color: "white",
                                backgroundColor: "#2c2c2c",// CurrentTheme.complementaryText,
                                opacity: Platform.OS === "android" ? 0.6 : 1,
                                overflow: 'hidden',
                                maxHeight: 150
                            }}
                            onChangeText={(text) => {
                                setTextValue(text);
                            }}
                            value={textValue}
                        />
                }
            </View>
            <TouchableOpacity
                onPress={handleSend}
                disabled={!textValue}
            >
                <IoniconsIcon
                    name="send-outline"
                    size={24}
                    color={"white"}
                    style={{
                        opacity: !textValue ? 0.7 : 1
                    }}
                />
            </TouchableOpacity>
        </View>
    )
};

export default MainFliwerTaskBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: 5,
        gap: 5
    },
    iconsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10
    }
});