import React, { useState, memo } from "react";
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from "react-native"; // FlatList eliminado de los imports
import { useDispatch } from "react-redux";
import { getNotifications } from '../../../actions/sessionActions';
import { CurrentTheme } from "../../../utils/FliwerColors";
import moment from "moment";
import { get } from "../../../actions/languageActions";
import { Image } from "react-native-elements";

const DETAILS_LIMIT = 100;

const NotificationCard = ({ item }) => {
    
    const dispatch = useDispatch();

    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedType, setExpandedType] = useState(null);
    const [detailsData, setDetailsData] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    
    const translate = (label) => {
        return dispatch(get(label));
    };

    const handleCounterPress = async (type) => {
        if (isExpanded && expandedType === type) {
            setIsExpanded(false);
            return;
        }

        setIsLoadingDetails(true);
        setDetailsData([]);
        
        if (!isExpanded) {
            setIsExpanded(true);
        }
        setExpandedType(type);
        
        try {
            const date = new Date(item.creationTimeUnix * 1000);
            const dateString = moment(date).format('YYYY-MM-DD');
            const newDetails = await dispatch(getNotifications(DETAILS_LIMIT, 1, item.idSortida, type==='alertsToday' ? dateString : null));
            setDetailsData(newDetails);
        } catch (error) {
            console.error("Error fetching notification details:", error);
        } finally {
            setIsLoadingDetails(false);
        }
    };
    
    const renderTitle = () => {
        var title="";
        if(item.idDevice){
            var shortIdDevice=item.idDevice?item.idDevice.slice(-4):null;
            if (item.titleTranslationKey)
                title= translate(item.titleTranslationKey);
            else if (item.title)
                title = item.title;
            title = title.replace(/{idDevice}/g, shortIdDevice);
        }else{
            if (item.titleTranslationKey)
                title=( (item.name?item.name+". ":""))+translate(item.titleTranslationKey);
            else if (item.title)
                title = ( (item.name?item.name+". ":""))+item.title;
        }
        return title.toUpperCase();
    }

    const renderBody = () => {
        var body="";
        if (item.descriptionTranslationKey)
            body=translate(item.descriptionTranslationKey);

        if(item.idDevice){        
            if(item.name)body = translate("Notficication_device_affected") +": "+ item.name + ". " + body;
            body = body.replace(/{idDevice}/g, item.idDevice);
        }
        return body;
    };
    
    return (
        <View style={styles.cardContainer}>
            <View style={styles.mainContent}>
                <Image source={{ uri: item.zoneImage }} style={styles.mainImage} />
                <Image source={{ uri: item.imageBig ? item.imageBig : item.icon }} style={styles.mainImage} />
                <View style={styles.infoContainer}>
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 }}>
                        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.titleText}>
                            {renderTitle()}
                        </Text>
                    </View>
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.bodyText}>
                        {renderBody()}
                    </Text>
                </View>
                <View style={styles.countersContainer}>
                    <View>
                        <Text style={styles.dateText}>{moment(item.creationTimeUnix * 1000).format("HH:mm")}</Text>
                    </View>
                    <View style={styles.badgesRow}>
                        {item.consecutiveCount > 0 && (
                            <TouchableOpacity onPress={() => handleCounterPress('consecutiveCount')}>
                                <View style={[styles.badgeBase, styles.badgeConsecutive]}>
                                    <Text style={styles.badgeText}>{item.consecutiveCount > 99 ? "+99" : item.consecutiveCount}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {isExpanded && (
                <View style={styles.detailsContainer}>
                    {isLoadingDetails ? (
                        <ActivityIndicator size="small" color={CurrentTheme.primaryText} />
                    ) : (
                        // --- MODIFICADO --- Se reemplaza FlatList por un bucle .map()
                        <>
                            {detailsData.length > 0 ? (
                                detailsData.map(detailItem => (
                                    <View key={detailItem.id.toString()} style={styles.detailItem}>
                                        <Text style={styles.detailText}>- {moment.unix(detailItem.creationTimeUnix).format("DD/MM/yyyy HH:mm")}</Text>
                                        {detailItem.seenTimeUnix ? <Text style={styles.detailText}>Visto:  {moment.unix(detailItem.seenTimeUnix).format("DD/MM/yyyy HH:mm")}</Text> : null}
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No hay detalles para mostrar.</Text>
                            )}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

// ... (El resto del componente y los estilos permanecen igual)
const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: CurrentTheme.cardColor,
        borderRadius: 8,
        marginBottom: 10,
        padding: 8,
    },
    mainContent: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    mainImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    infoContainer: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
    },
    titleText: {
        color: CurrentTheme.cardText,
        fontWeight: "bold",
    },
    bodyText: {
        color: CurrentTheme.cardText,
    },
    countersContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
    },
    dateText: {
        color: CurrentTheme.cardText,
        fontSize: 12,
    },
    iconImage: {
        width: 20,
        height: 20,
        borderRadius: 5,
    },
    badgesRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "100%",
        gap: 10,
    },
    badgeBase: {
        borderRadius: 45,
        width: 28,
        height: 28,
        padding: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeAlerts: {
        backgroundColor: "blue",
    },
    badgeConsecutive: {
        backgroundColor: "red",
    },
    badgeText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    detailsContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: CurrentTheme.secondaryText,
    },
    detailItem: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    detailText: {
        color: CurrentTheme.cardText,
        fontSize: 14,
    },
    emptyText: {
        color: CurrentTheme.secondaryText,
        textAlign: 'center',
        fontStyle: 'italic',
        marginTop: 10,
    }
});

export default memo(NotificationCard);