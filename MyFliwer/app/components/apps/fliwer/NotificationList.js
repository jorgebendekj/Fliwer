import React, { useMemo, useState, useCallback } from "react";
import { SectionList, StyleSheet, SafeAreaView, View, ActivityIndicator, Text } from "react-native";
import { useDispatch } from "react-redux";
import { getNotifications } from '../../../actions/sessionActions';
import { setPortraitScreen } from "../../../actions/wrapperActions";
import { useMediaInfo } from "../../../utils/mediaStyleSheet";
import { Redirect } from "../../../utils/router/router";
import { CurrentTheme } from "../../../utils/FliwerColors";
import moment from "moment";
import { get } from "../../../actions/languageActions";
import NotificationCard from "./NotificationCard";

const NotificationList = ({ setRedirects }) => {
    console.log("--- Renderizando NotificationList (Componente Padre) ---");

    const { orientation } = useMediaInfo();
    const dispatch = useDispatch();

    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const ITEMSPAGE = 100;

    const hanldeRedirects = (id) => {
        setRedirects([
            <Redirect to={`/app/tasks/details/${id}`} />
        ]);
        if (orientation !== "landscape") {
            dispatch(setPortraitScreen(2));
        }
    };

    const loadMoreNotifications = async () => {
        if (loading || !hasMore) {
            return;
        }
        setLoading(true);
        const newItems = await dispatch(getNotifications(ITEMSPAGE, page));
        if (newItems.length > 0) {
            setData(prevData => [...prevData, ...newItems]);
            setPage(prevPage => prevPage + 1);
        } else {
            setHasMore(false);
        }
        setLoading(false);
    };

    // --- SECCIÓN CORREGIDA ---
    const sections = useMemo(() => {
        // 1. Agrupar todas las notificaciones por día. La clave será "DD/MM/YYYY".
        // Guardamos el 'dateObj' para poder ordenar los días fácilmente.
        const groupedByDay = data.reduce((acc, item) => {
            const dateKey = moment(item.creationTimeUnix * 1000).format("DD/MM/YYYY");
            if (!acc[dateKey]) {
                acc[dateKey] = { 
                    items: [], 
                    dateObj: moment(item.creationTimeUnix * 1000).startOf('day') 
                };
            }
            acc[dateKey].items.push(item);
            return acc;
        }, {});

        // 2. Ordenar las claves de los días (de más reciente a más antiguo)
        const sortedDayKeys = Object.keys(groupedByDay).sort((a, b) => {
            return groupedByDay[b].dateObj - groupedByDay[a].dateObj;
        });

        // 3. Mapear cada día a una sección para la SectionList.
        return sortedDayKeys.map(dateKey => {
            const dailyNotifications = groupedByDay[dateKey].items;

            // 4. (ESTA ES LA CORRECCIÓN CRÍTICA)
            // Ordenamos las notificaciones DENTRO del día.
            // El orden es: email, luego home, y finalmente por tiempo.
            // Esto asegura que todas las notificaciones de (User A, Home 1)
            // estén juntas ANTES de que la lógica de agrupación las procese.
            const sortedDailyNotifications = [...dailyNotifications].sort((a, b) => {
                // Primero por email (A-Z)
                const emailA = a.email || '';
                const emailB = b.email || '';
                if (emailA < emailB) return -1;
                if (emailA > emailB) return 1;
                
                // Si el email es igual, por home (A-Z)
                const homeA = a.home || '';
                const homeB = b.home || '';
                if (homeA < homeB) return -1;
                if (homeA > homeB) return 1;

                // Si todo es igual, por tiempo (más reciente primero)
                return b.creationTimeUnix - a.creationTimeUnix;
            });

            // 5. (TU LÓGICA ORIGINAL) Aplicamos la agrupación por (email, home)
            // ahora que los datos están correctamente ordenados.
            const processedItemsForDay = [];
            let currentGroup = null;

            sortedDailyNotifications.forEach(item => {
                // Condición para ser un ítem individual: no tiene 'home'.
                if (!item.home) {
                    if (currentGroup) {
                        processedItemsForDay.push(currentGroup);
                        currentGroup = null;
                    }
                    processedItemsForDay.push({ ...item, isGroup: false });
                    return;
                }

                // Si no hay grupo o el item no pertenece al grupo actual, creamos uno nuevo.
                if (!currentGroup || currentGroup.email !== item.email || currentGroup.home !== item.home) {
                    if (currentGroup) {
                        processedItemsForDay.push(currentGroup);
                    }
                    currentGroup = {
                        isGroup: true,
                        email: item.email,
                        home: item.home,
                        id: `group-${item.id}`, // Key única para el grupo.
                        notifications: [item],
                    };
                } else {
                    // Si pertenece al grupo actual, lo añadimos.
                    currentGroup.notifications.push(item);
                }
            });

            // Añadir el último grupo si existe.
            if (currentGroup) {
                processedItemsForDay.push(currentGroup);
            }
            
            // Devolver la estructura final de la sección para este día.
            return {
                title: dateKey,
                data: processedItemsForDay,
            };
        });
    }, [data]);

    const renderItem = useCallback(({ item }) => {
        if (item.isGroup) {
            return (
                <View style={styles.installationGroupWrapper}>
                    <View style={styles.installationHeader}>
                        <Text style={styles.installationCardTitle}>{item.email}</Text>
                        <Text style={styles.installationCardSubtitle}>{item.home}</Text>
                    </View>
                    {item.notifications.map(notification => (
                        <NotificationCard key={`notification-text-${notification.id}`} item={notification} />
                    ))}
                </View>
            );
        } else {
            return <NotificationCard item={item} />;
        }
    }, []);

    const keyExtractor = useCallback((item) => item.isGroup ? item.id : `notification-${item.id}`, []);

    const renderSectionHeader = useCallback(({ section: { title } }) => (
        <View style={{ padding: 10, width: "100%" }}>
            <Text style={{ textAlign: "center", color: CurrentTheme.primaryText }}>{`--- ${title} ---`}</Text>
        </View>
    ), []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: CurrentTheme.primaryView }}>
            <SectionList
                sections={sections}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.list}
                onEndReached={loadMoreNotifications}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => {
                    if (!loading) return null;
                    return (
                        <View style={styles.footer}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default NotificationList;


const styles = StyleSheet.create({
    list: {
        padding: 5,
    },
    installationGroupWrapper: {
        backgroundColor: CurrentTheme.quaternaryView,
        borderRadius: 8,
        padding: 10, // Un poco de padding interior mejora la estética
        marginBottom: 10,
        marginTop: 10,
    },
    installationHeader: {
        marginBottom: 10,
    },
    installationCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: CurrentTheme.primaryText,
    },
    installationCardSubtitle: {
        fontSize: 14,
        color: CurrentTheme.secondaryText,
    },
    footer: {
        paddingVertical: 20,
    },
});