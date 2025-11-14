//import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

const PasswordChange = ({
    mobile
}) => {

    return (
        <>
            <View
                style={{
                    padding: 20,
                    flex: 1,
                    width: mobile ? "50%" : "100%",
                    marginTop: 10
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 6,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            color: "white",
                            fontFamily: "Montserrat-Regular",
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        Recuperación de credenciales del trabajador.
                    </Text>
                </View>
                {/* <LinearGradient
                    colors={[
                        "#332c54",
                        "#79b869"
                    ]}

                    style={{ margin: 10, borderRadius: 30, alignSelf: "center", padding: 20 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text
                        style={{
                            color: "white",
                            fontFamily: "Montserrat-Regular",
                        }}
                    >
                        CAMBIAR CONTRASEÑA
                    </Text>
                </LinearGradient> */}
            </View>
        </>
    );
};

export default PasswordChange;
