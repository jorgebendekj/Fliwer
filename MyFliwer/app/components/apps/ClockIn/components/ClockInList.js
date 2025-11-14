import React, { useMemo, useState } from "react";
import { FlatList, Platform, StyleSheet, View } from "react-native";
import ClockInCard from "./ClockInCard"; // ajustá el path según tu estructura
import FilwerDivider from "../../../custom/FliwerDivider";
import { CurrentTheme, FliwerColors } from "../../../../utils/FliwerColors";
import { Text } from "react-native";
import { Redirect } from "../../../../utils/router/router";
import { useDispatch, useSelector } from "react-redux";
import { setPortraitScreen } from "../../../../actions/wrapperActions";
import moment from "moment";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import { get } from "../../../../actions/languageActions";

const ClockInList = ({
    match,
    setRedirects,
    clockInStatus
}) => {

    const clockInReducer = useSelector(state => state.clockInReducer.data)

    const { orientation } = useMediaInfo();

    const dispatch = useDispatch();

    const hanldeRedirects = (id) => {
        setRedirects([
            <Redirect to={`/app/clockIn/details/${id}`} />
        ])
        if (orientation != "landscape") {
            dispatch(setPortraitScreen(2))
        }
    };

    const groupedData = useMemo(() => {
        const groups = {};

        clockInReducer.forEach((item) => {
            const date = moment.unix(item.insertTime).format('DD/MM/YYYY');
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
        });

        return Object.entries(groups)
            .sort((a, b) => {
                const dateA = moment(a[0], 'DD/MM/YYYY');
                const dateB = moment(b[0], 'DD/MM/YYYY');
                return dateB.valueOf() - dateA.valueOf();
            })
            .map(([date, items]) => ({
                date,
                items
            }));
    }, [clockInReducer]);

    const mostRecentId = useMemo(() => {
        if (!clockInReducer?.length) return null;
        return clockInReducer.reduce(
            (prev, curr) => (curr.insertTime > prev.insertTime ? curr : prev)
        ).id;
    }, [clockInReducer]);

    return (
        <FlatList
            data={groupedData}
            keyExtractor={(group) => group.date}
            contentContainerStyle={[styles.list, { backgroundColor: CurrentTheme.primaryView }]}
            renderItem={({ item: group }) => {
                const isToday = group.date === moment().format('DD/MM/YYYY');
                return (
                    <View>
                        <FilwerDivider>
                            <Text
                                style={{
                                    padding: 5,
                                    color: CurrentTheme.primaryText,
                                    fontFamily: FliwerColors.fonts.title,
                                    textAlign: "center",
                                    fontSize: 18
                                }}
                            >
                                {group.date}
                            </Text>
                        </FilwerDivider>
                        {group.items.map((item) => (
                            <ClockInCard
                                key={item.id}
                                id={item.id}
                                item={item}
                                description={item.description}
                                hanldeRedirects={() => hanldeRedirects(item.id)}
                                selectedClockIn={match.params.idClockIn}
                                isToday={isToday}
                                isMostRecent={item.id === mostRecentId}
                                status={clockInStatus[item.id]}
                            />
                        ))}
                    </View>
                )
            }}
            ListHeaderComponent={
                orientation != "landscape"
                    ?
                    <FilwerDivider >
                        <Text
                            style={{
                                padding: 10,
                                color: CurrentTheme.primaryText,
                                fontFamily: FliwerColors.fonts.title,
                                textAlign: "center",
                                fontSize: 18
                            }}
                        >
                            {dispatch(get("Clock_In"))}
                        </Text>
                    </FilwerDivider >
                    :
                    null
            }
        />

    )
};

export default ClockInList;

const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
});
