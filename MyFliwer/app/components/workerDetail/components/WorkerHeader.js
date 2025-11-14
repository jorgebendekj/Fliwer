import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CustomTextInput from "../../textInput/CustomTextInput";
import Dropdown from "../../../widgets/dropdown/dropdown";
import { get } from "../../../actions/languageActions";
import { useDispatch } from "react-redux";
import PhoneInput from "../../../widgets/phoneInput/phoneInput";
import RadioForm from 'react-native-simple-radio-button';

const workerType = [
    { label: 'Trabajador interno', value: 'trabajador interno' },
    { label: 'Trabajador externo', value: 'trabajador externo' }
];

const WorkerHeader = ({
    getPhotos,
    worker,
    mobile,
    setWorker,
    formErrors,
    editMode
}) => {
    console.log(mobile)
    const dispatch = useDispatch();

    const renderInput = (label, value) => {
        const isNameField = ["first_name", "last_name"].includes(value);
        const secondaryStyles = ["workerType", "workerStatus"].includes(value);
        const fieldValue = worker[value];

        if (value === "tipotrabajador") {
            label = "Grupo";
        }

        let textFontSize = 16;
        if (["first_name", "last_name"].includes(value)) {
            textFontSize = 28;
        } else if (["businessPosition", "tipotrabajador"].includes(value)) {
            textFontSize = 20;
        } else if (["email", "phone"].includes(value)) {
            textFontSize = 18;
        }

        if (editMode) {
            return (
                <View
                    style={[
                        secondaryStyles
                            ? { flex: 1 }
                            : { width: !mobile ? "100%" : "50%" },
                    ]}
                >
                    <Text style={[styles.modalInputTitle, { fontSize: textFontSize }]}>
                        {label}
                    </Text>

                    {value === "tipotrabajador" && (
                        <Dropdown
                            modal
                            filterEnabled
                            placeholder="Tipo"
                            selectedValue={worker.tipotrabajador}
                            style={styles.select}
                            styleOptions={{}}
                            options={[
                                { label: "Visitante", value: "Visitante" },
                                { label: "Operario", value: "Operario" },
                                { label: "Supervisor", value: "Supervisor" },
                                { label: "Manager", value: "Manager" },
                                { label: "Contable", value: "Contable" },
                            ]}
                            onChange={(newValue) =>
                                setWorker({ ...worker, tipotrabajador: newValue })
                            }
                            disabled={worker.isUser}
                        />
                    )}

                    {value === "phone" && (
                        <PhoneInput
                            country={worker.country}
                            value={worker.phone}
                            onChange={(text) =>
                                setWorker({ ...worker, phone: text })
                            }
                            height={40}
                            marginTop={-2}
                            marginBottom={0}
                            noAutoFocus={true}
                            dialCodeTopPadding={Platform.OS === "android" ? 8 : 11}
                            disabled={worker.isUser}
                            textColor={"white"}
                            borderColor={"#323232"}
                            backgroundColor={"rgb(38,38,38)"}
                        />
                    )}

                    {value === "workerStatus" && (
                        <Dropdown
                            modal
                            filterEnabled
                            placeholder="Estado"
                            selectedValue={worker.workerStatus}
                            style={styles.select}
                            styleOptions={{}}
                            options={[
                                { label: "Alta", value: "Alta" },
                                { label: "Baja médica", value: "Baja médica" },
                                { label: "Vacaciones", value: "Vacaciones" },
                                { label: "Baja indefinida", value: "Baja indefinida" },
                            ]}
                            onChange={(value) =>
                                setWorker({ ...worker, workerStatus: value })
                            }
                            disabled={worker.isUser}
                        />
                    )}

                    {value === "workerType" && (
                        <RadioForm
                            radio_props={workerType}
                            initial={workerType.findIndex(
                                (opt) => opt.value === worker.workerType
                            )}
                            onPress={(value) =>
                                setWorker({ ...worker, workerType: value })
                            }
                            buttonColor={"white"}
                            selectedButtonColor={"white"}
                            labelStyle={{
                                marginRight: 10,
                                fontSize: 14,
                                color: "white",
                            }}
                            buttonInnerColor={"white"}
                            buttonSize={10}
                            buttonOuterSize={20}
                            buttonStyle={{}}
                            buttonWrapStyle={{
                                padding: 5,
                                marginBottom: 10,
                                height: 40,
                            }}
                            disabled={worker.isUser}
                        />
                    )}

                    {!["tipotrabajador", "phone", "workerStatus", "workerType"].includes(
                        value
                    ) && (
                            <CustomTextInput
                                value={fieldValue}
                                onChangeText={(text) =>
                                    setWorker({ ...worker, [value]: text })
                                }
                                error={formErrors?.[value] && !fieldValue}
                                style={{ fontSize: textFontSize }}
                            />
                        )}
                </View>
            );
        }

        // Modo visualización
        return (
            <View
                style={[
                    secondaryStyles
                        ? { flex: 1, marginTop: 20 }
                        : { width: !mobile ? "100%" : "50%" },
                ]}
            >
                {value === "workerType" ? (
                    // Mostrar RadioForm en visualización igual que en edición pero deshabilitado
                    <>
                        <Text style={[styles.modalInputTitle, { fontSize: textFontSize }]}>
                            {label}
                        </Text>
                        <RadioForm
                            radio_props={workerType}
                            initial={workerType.findIndex(
                                (opt) => opt.value === worker.workerType
                            )}
                            onPress={() => { }}
                            buttonColor={"white"}
                            selectedButtonColor={"white"}
                            labelStyle={{
                                marginRight: 10,
                                fontSize: 14,
                                color: "white",
                            }}
                            buttonInnerColor={"white"}
                            buttonSize={10}
                            buttonOuterSize={20}
                            buttonStyle={{}}
                            buttonWrapStyle={{
                                padding: 5,
                                marginBottom: 10,
                                height: 40,
                            }}
                            disabled={true}
                        />
                    </>
                ) : isNameField ? (
                    <Text style={[styles.editText, { fontSize: 28 }]}>
                        {value === "first_name"
                            ? `${worker.first_name} ${worker.last_name}`
                            : ""}
                    </Text>
                ) : (
                    <>
                        <Text style={[styles.modalInputTitle, { fontSize: textFontSize }]}>
                            {label}
                        </Text>
                        <Text style={[styles.editText, { fontSize: textFontSize }]}>
                            {fieldValue || "-"}
                        </Text>
                    </>
                )}
            </View>
        );
    };


    return (
        mobile ?

            <View
                style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#161616",
                    margin: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#323232",
                    padding: 20,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        width: "100%",
                        gap: 10,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "column",
                            gap: editMode ? 20 : 5,
                            marginRight: 10,
                        }}
                    >
                        <View
                            style={{
                                width: 200,
                                height: 200,
                            }}
                        >
                            <TouchableOpacity
                                onPress={getPhotos}
                                disabled={worker.isUser}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 8,
                                    overflow: "hidden",
                                    backgroundColor: "#eee",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    source={{ uri: worker.photo_url || "" }}
                                    resizeMode="cover"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {renderInput("Trabajador Interno/Externo", "workerType")}
                        {renderInput("Estado del trabajador", "workerStatus")}
                    </View>

                    <View
                        style={{
                            flex: 1,
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            {renderInput("Nombre", "first_name")}
                            {renderInput("Apellido", "last_name")}
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            {renderInput("Posición en la empresa", "businessPosition")}
                            {renderInput("Tipo de trabajador", "tipotrabajador")}
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            {renderInput(dispatch(get("userProfileVC_email")), "email")}
                            {renderInput("Teléfono", "phone")}
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                            }}
                        >
                            {worker.workerType && renderInput("Nombre de la empresa", "nombreEmpresa")}
                        </View>
                    </View>
                </View>
            </View>
            :
            <View
                style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#161616",
                    margin: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#323232",
                    padding: 20,
                }}
            >
                {mobile ? (
                    // 👇 tu diseño original en filas y columnas
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            width: "100%",
                            gap: 10,
                        }}
                    >
                        {/* Imagen + secundarios */}
                        <View
                            style={{
                                flexDirection: "column",
                                gap: editMode ? 20 : 5,
                                marginRight: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: 200,
                                    height: 200,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={getPhotos}
                                    disabled={worker.isUser}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        backgroundColor: "#eee",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Image
                                        source={{ uri: worker.photo_url || "" }}
                                        resizeMode="cover"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>

                            {renderInput("Trabajador Interno/Externo", "workerType")}
                            {renderInput("Estado del trabajador", "workerStatus")}
                        </View>

                        {/* Datos principales */}
                        <View
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                }}
                            >
                                {renderInput("Nombre", "first_name")}
                                {renderInput("Apellido", "last_name")}
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                }}
                            >
                                {renderInput("Posición en la empresa", "businessPosition")}
                                {renderInput("Tipo de trabajador", "tipotrabajador")}
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                }}
                            >
                                {renderInput(dispatch(get("userProfileVC_email")), "email")}
                                {renderInput("Teléfono", "phone")}
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                }}
                            >
                                {worker.workerType && renderInput("Nombre de la empresa", "nombreEmpresa")}
                            </View>
                        </View>
                    </View>
                ) : (
                    // 👇 nuevo bloque en columna
                    <View
                        style={{
                            width: "100%",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        <View
                            style={{
                                width: 200,
                                height: 200,
                                alignSelf: "center",
                            }}
                        >
                            <TouchableOpacity
                                onPress={getPhotos}
                                disabled={worker.isUser}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 8,
                                    overflow: "hidden",
                                    backgroundColor: "#eee",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Image
                                    source={{ uri: worker.photo_url || "" }}
                                    resizeMode="cover"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </TouchableOpacity>
                        </View>

                        {renderInput("Nombre", "first_name")}
                        {renderInput("Apellido", "last_name")}
                        {renderInput("Posición en la empresa", "businessPosition")}
                        {renderInput("Tipo de trabajador", "tipotrabajador")}
                        {renderInput("Trabajador Interno/Externo", "workerType")}
                        {renderInput("Estado del trabajador", "workerStatus")}
                        {renderInput(dispatch(get("userProfileVC_email")), "email")}
                        {renderInput("Teléfono", "phone")}
                        {worker.workerType && renderInput("Nombre de la empresa", "nombreEmpresa")}
                    </View>
                )}
            </View>

    )
};

export default WorkerHeader;

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: "row",
        padding: 10,
        alignItems: "flex-start",
    },
    columnContainer: {
        flexDirection: "column",
        padding: 10,
        alignItems: "center"
    },
    workerImageContainer: {
        width: 190,
        alignItems: "center",
        marginRight: 20,
    },
    workerInfoContainer: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "100%"
    },
    buttonImage: {
        width: "100%",
        height: "100%",
        marginBottom: 10,
    },
    homeText: {
        fontFamily: "Montserrat-Regular",
        fontSize: 15
    },
    buttonImageIn: {
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        borderRadius: 15,
    },
    iconContainer: {
        marginTop: 5,
        backgroundColor: "#333",
        padding: 6,
        borderRadius: 8,
    },
    textTitle: {
        fontFamily: "Montserrat-Regular",
        color: "white",
        fontSize: 16,
        marginBottom: 6,
        alignSelf: "center"
    },
    modalInputTitle: {
        marginBottom: 5,
        color: "white",
        fontFamily: "Montserrat-Regular",
    },
    editText: {
        height: 40,
        paddingVertical: 5,
        paddingRight: 5,
        marginBottom: 10,
        color: "white",
        fontFamily: "Montserrat-Regular",
    },
    modalInputArea: {
        height: 40,
        padding: 5,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#323232",
        backgroundColor: "rgb(38,38,38)",
        color: "white",
        fontFamily: "Montserrat-Regular",
    },
    modalInputAreaError: {
        borderColor: 'red'
    },
    select: {
        width: "100%",
        color: "white",
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#323232",
        backgroundColor: "rgb(38,38,38)",
        fontFamily: "Montserrat-Regular",
        marginBottom: 10,
    },
});