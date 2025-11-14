import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ImageBackground from "../imageBackground";
import { CurrentTheme } from "../../utils/FliwerColors";
import { useDispatch, useSelector } from "react-redux";
import { MediaPicker } from "../../utils/uploadMedia/MediaPicker";
import ExpandedInfo from "./components/ExpandedInfo";
import { toast } from "../../widgets/toast/toast";
import { addEmployeeObject, modifyBusinessEmployee, modifyUserEmployeeObject } from "../../actions/sessionActions";
import { get } from "../../actions/languageActions";
import FliwerDeleteModal from "../custom/FliwerDeleteModal";
import GenericSelector from "./components/GenericSelector";
import WorkerHeader from "./components/WorkerHeader";
import PasswordChange from "./components/PasswordChange";

window.React = React;
global.React = React;

const tabs = [
    "Datos del trabajador",
    "Seguridad",
    "Asignación de clientes",
    "Asignación de empleados",
    "Calendario laboral"
]

const WorkersDetails = ({
    idWorker,
    setIsUpdating,
    isEditing,
    resetEditing,
    isDeleting,
    resetDeleting,
    setDeletingItem,
    mobile,
    onCreateSucces
}) => {

    const dispatch = useDispatch();

    const employees = useSelector(state => state.sessionReducer.employees);
    const sessionData = useSelector(state => state.sessionReducer.data);

    const [loading, setLoading] = useState(true);
    const [worker, setWorker] = useState(null);
    const [profileImage, setProfileImage] = useState("");
    const [formErrors, setFormErrors] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [currentTab, setCurrentTab] = useState("Datos del trabajador");

    var fileInputRef;

    const getPhotos = () => {
        const options = {
            fileInput: fileInputRef
        };

        MediaPicker.openPicker(options).then((response) => {
            if (!response || response.didCancel) {
                console.log('User cancelled image picker');
            } else {
                setProfileImage(response.base64)
            }
        }, () => { console.log("Error gathering image"); });
    }

    const renderInputFile = () => {
        if (Platform.OS === 'web')
            return (<input ref={fileInput => fileInputRef = fileInput} style={{ display: "none" }} type="file" />);
        else
            return [];
    }

    const renderTabItem = () => {
        switch (currentTab) {
            case "Datos del trabajador":
                return (
                    <ExpandedInfo
                        worker={worker}
                        setWorker={setWorker}
                        mobile={mobile}
                        isUser={worker.isUser}
                        editMode={isEditing}
                    />
                );

            case "Seguridad":
                return (
                    <PasswordChange
                        mobile={mobile}
                    />
                );

            case "Asignación de clientes":
                return (
                    <GenericSelector
                        title="Clientes asignados al empleado"
                        reducerSelector={(state) => state.gardenerReducer.usersListData}
                        workerField="gardenerUsers"
                        worker={worker}
                        setWorker={setWorker}
                        mobile={mobile}
                    />
                );

            case "Asignación de empleados":
                return (
                    <GenericSelector
                        title="Trabajadores que controla"
                        reducerSelector={(state) => state.sessionReducer.employees}
                        workerField="employees"
                        worker={worker}
                        setWorker={setWorker}
                        mobile={mobile}
                    />
                );

            case "Calendario laboral":
                return (
                    []
                );

            default:
                return null;
        }
    };


    const validateForm = () => {

        let requiredFields = [/* 'businessPosition', */ 'email', 'first_name', 'last_name'];
        const errors = {};

        if (worker.password || worker.confirmPassword) {
            requiredFields = [...requiredFields, 'password', 'confirmPassword']
        }

        requiredFields.forEach((field) => {
            if (!worker[field] || worker[field].trim() === '') {
                errors[field] = true;
            }
        });

        if (worker.isCompany) {
            if (!worker.companyName || worker.companyName.trim() === '') {
                errors.companyName = true;
            }

            if (!worker.cif || worker.cif.trim() === '') {
                errors.cif = true;
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            resetEditing();
            return;
        }

        if (formErrors !== null) setFormErrors(null)

        if (!worker.isNew) {
            editBussinessInfo();
        } else {
            createWorker();
        }
    };

    const createWorker = () => {

        if (worker.password || worker.confirmPassword) {
            if (worker.password !== worker.confirmPassword) {
                return toast.error(dispatch(get('loginVC_passwords_are_not_identical')));
            }
        }

        setLoading(true);
        setIsUpdating(true)

        var newData = {
            address: worker.address,
            businessPosition: worker.businessPosition,
            cif: worker.cif,
            city: worker.city,
            companyName: worker.companyName,
            country: worker.country,
            email: worker.email,
            firstName: worker.first_name,
            iban: worker.iban,
            isClient: worker.isClient,
            isCompany: worker.isCompany,
            isProvider: worker.isProvider,
            language: worker.language,
            idLangCommunication: worker.language,
            lastName: worker.last_name,
            nif: worker.nif,
            phone: worker.phone,
            roles: worker.roles,
            zipCode: worker.zipCode,
            selectedDays: worker.selectedDays,
            weeklyHours: worker.weeklyHours,
            password: worker.password,
            photo_url: profileImage
        };
        //console.log('newData', newData)
        dispatch(addEmployeeObject(newData)).then((res) => {
            setLoading(false);
            resetEditing();
            onCreateSucces(res.idUser);
            setIsUpdating(false)
        }, (err) => {
            setLoading(false);
            resetEditing(false);
            setIsUpdating(false)
            if (err && err.reason)
                toast.error(err.reason);
        })
    };

    const editBussinessInfo = () => {

        setLoading(true)
        setIsUpdating(true)

        var newData = {
            businessPosition: worker.businessPosition,
            roles: worker.roles,
            gardener: worker.gardenerUsers,
            employees: worker.employees
        };

        dispatch(modifyBusinessEmployee(worker.idUser, newData)).then((res) => {
            editEmployee();
        }, (err) => {
            setLoading(false);
            setIsUpdating(false);
            resetEditing();
            if (err && err.reason)
                toast.error(err.reason);
        })
    }

    const editEmployee = () => {

        var newData = {
            email: worker.email,
            cif: worker.cif,
            nif: worker.nif,
            address: worker.address,
            city: worker.city,
            zipCode: worker.zipCode,
            country: worker.country,
            phone: worker.phone,
            iban: worker.iban,
            isCompany: worker.isCompany,
            companyName: worker.companyName,
            firstName: worker.first_name,
            lastName: worker.last_name,
            idLangCommunication: worker.language,
            isClient: worker?.isClient ? 1 : 0,
            isProvider: worker?.isProvider ? 1 : 0,
            password: worker.password
        };

        if (!newData.cif) newData.cif = null;
        if (!newData.nif) newData.nif = null;
        if (!newData.address) newData.address = null;
        if (!newData.city) newData.city = null;
        if (!newData.zipCode) newData.zipCode = null;
        if (!newData.country) newData.country = null;
        if (!newData.phone) newData.phone = null;
        if (!newData.iban) newData.iban = null;
        if (!newData.companyName) newData.companyName = null;
        if (!newData.firstName) newData.firstName = null;
        if (!newData.lastName) newData.lastName = null;
        if (!newData.idLangCommunication) newData.idLangCommunication = null;
        if (!newData.isClient) newData.isClient = 1;
        if (!newData.isProvider) newData.isProvider = 0;
        if (!newData.password) newData.password = null;

        dispatch(modifyUserEmployeeObject(worker.idUser, newData)).then((res) => {
            setLoading(false);
            setIsUpdating(false);
            resetEditing();
        }, (err) => {
            setLoading(false);
            setIsUpdating(false);
            resetEditing();
            if (err && err.reason)
                toast.error(err.reason);
        });
    };

    useEffect(() => {
        if (isDeleting) {
            setModalVisible(true);
        }
    }, [isDeleting]);

    useEffect(() => {

        if (idWorker === "create") {
            setWorker({
                email: "",
                password: "",
                confirmPassword: "",
                isCompany: false,
                companyName: "",
                firstName: "",
                lastName: "",
                nif: "",
                cif: "",
                address: "",
                zipCode: "",
                city: "",
                country: "ES",
                phone: "",
                iban: "",
                language: "",
                isClient: false,
                isProvider: false,
                selectedDays: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
                weeklyHours: 40,
                isNew: true,
                roles: {
                    gardener: 0,
                    angel: 0,
                    manager: 0,
                    expert: 0,
                    fliwer: 0,
                    translator: 0,
                    plantsAdmin: 0,
                    visitor: 0,
                    accountant: 0
                },
                photo_url: "",
                isUser: false
            })
            setLoading(false)
        }

        let worker = null

        if (sessionData.user_id == idWorker) {
            worker = sessionData
        } else {

            if (!employees || !employees.length) return

            if (employees.find(employee => employee.idUser == idWorker)) {
                worker = employees.find(employee => employee.idUser == idWorker);
            }
        }

        if (worker) {
            //console.log(worker)
            var licenses = [];

            for (var i = 0; i < Object.keys(worker.license).length; i++) {
                //translate
                if (worker.license[Object.keys(worker.license)[i]] == 1)
                    licenses.push(dispatch(get('general_license_' + Object.keys(worker.license)[i])));
            }

            setWorker({
                ...worker,
                selectedDays: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
                licensesNames: licenses,
                isUser: sessionData.user_id == idWorker,
                nif: worker.cif,
                cif: worker.companyCif,
                companyName: worker.company_name,
                isCompany: worker.iscompany == true ? true : false,
                language: worker?.clientObject?.idLangCommunication ? worker?.clientObject?.idLangCommunication : "",
                password: "",
                confirmPassword: ""
            })
            setLoading(false)
        }

    }, [employees, idWorker]);

    return (
        <ImageBackground
            style={{ backgroundColor: CurrentTheme.secondaryView }}
            loading={loading}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 20,
                }}
            >
                {
                    worker
                        ?
                        <View >
                            <WorkerHeader
                                getPhotos={getPhotos}
                                worker={worker}
                                mobile={mobile}
                                setWorker={setWorker}
                                formErrors={formErrors}
                                editMode={isEditing}
                            />
                            <View
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    padding: 10,
                                    backgroundColor: "#161616",
                                    margin: 10,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: "#323232"
                                }}
                            >
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        gap: 5,
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                    }}
                                    style={{
                                        width: "100%",
                                        marginBottom: 20,
                                    }}
                                >
                                    {tabs.map((item) => {
                                        if (item === "Asignación de clientes" && !(!worker.isNew && !worker.isUser)) return null;
                                        if (item === "Asignación de empleados" && !(!worker.isNew && !worker.isUser && worker?.roles?.manager)) return null;

                                        return (
                                            <TouchableOpacity
                                                key={item}
                                                style={{
                                                    borderBottomWidth: item === currentTab ? 1 : 0,
                                                    backgroundColor: item === currentTab ? CurrentTheme.selectedColor : "#161616",
                                                    opacity: item === "Calendario laboral" ? 0.7 : 1,
                                                    marginRight: 5, // Extra separación si prefieres
                                                    borderRadius: 4,
                                                }}
                                                onPress={() => {
                                                    if (currentTab !== item) setCurrentTab(item);
                                                }}
                                                disabled={item === "Calendario laboral"}
                                            >
                                                <Text
                                                    style={{
                                                        color: "white",
                                                        padding: 8,
                                                        fontFamily: item === currentTab ? "Montserrat-Bold" : "Montserrat-Regular",
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>


                                {renderTabItem()}
                            </View>
                            {renderInputFile()}
                        </View>
                        :
                        []
                }
            </ScrollView>
            <FliwerDeleteModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    resetDeleting();
                }}
                onConfirm={async () => {
                    setDeletingItem(worker.idUser);
                    setModalVisible(false);
                }}
                title={dispatch(get('masterVC_remove_user_gardener'))}
                hiddeText={true}
                password={false}
                loadingModal={loading}
            />
        </ImageBackground >
    )
};

export default WorkersDetails;


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