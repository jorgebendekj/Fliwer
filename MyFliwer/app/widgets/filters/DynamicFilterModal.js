// DynamicFilterModal.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { get } from "../../actions/languageActions";
import FrontLayerWrapper from "../../components/frontLayerWrapper";
import Modal from "../modal/modal";
import Dropdown from "../dropdown/dropdown";
import { CurrentTheme, FliwerColors } from "../../utils/FliwerColors";
import FliwerButtonDateTimePicker from "../../components/custom/FliwerButtonDateTimePicker";
import moment from "moment";

const DynamicFilterModal = ({ key, visible, onClose, fields, values, onChange }) => {

    const dispatch = useDispatch();

    const [hideModal, setHideModal] = useState(false)

    const translator = (text) => {
        return dispatch(get(text))
    };

    return (
        visible && !hideModal
            ?
            <FrontLayerWrapper key={key}>
                <Modal
                    visible={visible}
                    animationType="fade"
                    inStyle={styles.modalIn}
                    onClose={onClose}
                >
                    <View style={styles.modalView}>
                        <Text style={[styles.title, { fontFamily: FliwerColors.fonts.title }]}>
                            {translator("general_filter")}
                        </Text>

                        {fields.map(field => {
                            return (
                                <View key={field.property} style={{ width: "100%", marginBottom: 10 }}>
                                    <Text>{field.label}</Text>

                                    {field.type === "date" ? (
                                        <FliwerButtonDateTimePicker
                                            mode="datetime"
                                            date={moment().toDate()}
                                            styleButtonContainer={{ width: "100%" }}
                                            maxDate={moment().toDate()}
                                            onChange={(date) => {
                                                console.log('aca', date)
                                                onChange({
                                                    ...values,
                                                    [field.property]: date
                                                });
                                            }}
                                            hideModal={(value) => setHideModal(value)}
                                            customRenderItem={
                                                <View style={{
                                                    padding: 12,
                                                    borderWidth: 1,
                                                    borderColor: "#ccc",
                                                    borderRadius: 4
                                                }}>
                                                    <Text>
                                                        {values[field.property]
                                                            ? moment.unix(values[field.property]).format("DD/MM/YYYY")
                                                            : "Seleccionar"}
                                                    </Text>
                                                </View>
                                            }
                                        />
                                    ) : (
                                        <Dropdown
                                            modal={true}
                                            hideModal={(value) => setHideModal(value)}
                                            placeholder={`Seleccionar ${field.label.toLowerCase()}`}
                                            selectedValue={values[field.property] ?? null}
                                            options={field.options}
                                            onChange={value => {
                                                setHideModal(false);
                                                onChange({
                                                    ...values,
                                                    [field.property]: value
                                                });
                                            }}
                                        />
                                    )}
                                </View>
                            )
                        })}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: CurrentTheme.cardColor }]}
                            onPress={onClose}
                        >
                            <Text style={{ color: CurrentTheme.cardText }}>
                                {translator("general_apply_filters")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                onChange({});
                                onClose();
                            }}
                            style={{ marginTop: 10 }}
                        >
                            <Text style={{ color: "#007AFF" }}>
                                {translator("general_clean_filters")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </FrontLayerWrapper>
            :
            null
    );
};

export default DynamicFilterModal;

const styles = StyleSheet.create({
    modalIn: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        width: "90%",
        maxWidth: 400,
        flexShrink: 1,
    },
    modalView: {
        padding: 20,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
        textAlign: "center"
    },
    button: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
});
