import React, { useEffect, useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Platform,
    TouchableOpacity,
    Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { CurrentTheme } from "../../../../utils/FliwerColors";
import OrderProductCard from "./OrderProductCard";
import { useMediaInfo } from "../../../../utils/mediaStyleSheet";
import CustomTextInput from "../../../textInput/CustomTextInput";
import IoniconsIcon from "react-native-vector-icons/Ionicons";
import { setPortraitScreen } from "../../../../actions/wrapperActions";
import { Redirect } from "../../../../utils/router/router";
import QRScanner from "./QRScanner";
import { toast } from "../../../../widgets/toast/toast";
import Ionicons from "react-native-vector-icons/Ionicons";
import { get } from "../../../../actions/languageActions";
import { deleteOrderItem, upsertOrderItem } from "../../../../reducers/orderSlice";
import OrderMobileHeader from "./OrderMobileHeader";
import ExpandedProduct from "./OrderExpandedProduct";
import OrdersCartMobile from "./OrdersCartMobile";

const OrderSecondaryView = ({ openCartForOrderId, idOrder, onCartConsumed }) => {
    const { orientation } = useMediaInfo();
    const mobile = orientation !== "landscape";

    const dispatch = useDispatch();

    const catalog = useSelector((s) => s.products.products || []);
    const ordersList = useSelector((s) => s.orders.orders || []);
    const customProductFields = useSelector(state => state.userOffline.data?.customProductFields || []);

    const currentOrder = useMemo(
        () => ordersList.find((o) => o.id == idOrder),
        [ordersList, idOrder]
    );

    const [expandedProduct, setExpandedProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [scanningQR, setScanningQR] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);

    const pageSize = mobile ? 10 : 20;

    const translate = (text) => {
        return dispatch(get(text));
    };

    const filteredProducts = useMemo(() => {
        const ids = searchQuery.split(",").map(id => id.trim()).filter(Boolean);
        return catalog.filter(p => {
            const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const idMatch = ids.includes(String(p.id));
            return nameMatch || idMatch;
        });
    }, [catalog, searchQuery]);


    const visibleProducts = useMemo(
        () => filteredProducts.slice(0, page * pageSize),
        [filteredProducts, page]
    );

    const goPrimaryView = () => {
        //setRedirects([<Redirect to={`/app/order`} />]);
        dispatch(setPortraitScreen(1));
    };

    const changeQty = (product, newQty, priceType) => {
        const orderItem = currentOrder.products.find(p => p.id === product.id);

        const currentQty = parseInt(orderItem?.quantity, 10) || 0;

        /*
        if (delta === 0) {
            dispatch(upsertOrderItem({ orderId: idOrder, item: product, quantity: currentQty, priceType:priceType?priceType:product.priceType }));
        }*/


        /*if (newQty <= 0) {
            dispatch(deleteOrderItem({ orderId: idOrder, itemId: product.id }));
        } else {*/
            dispatch(upsertOrderItem({ orderId: idOrder, item: product, quantity: newQty<0?0:newQty, priceType:priceType?priceType:product.priceType }));

        //}
    };

    const onQrRead = (value) => {
        setScanningQR(false);
        try {
           const QRS = {
    "https://qr2.mobi/203dr": [
        2005,
        2006,
        2007
    ],
    "https://uqr.to/1v47p": [
        2008
    ],
    "https://qr2.mobi/20b8h": [
        2009,
        2010,
        2011
    ],
    "https://uqr.to/1ts34": [
        2012,
        2013
    ],
    "https://qr2.mobi/203ds": [
        2014,
        2015,
        2016,
        2017
    ],
    "https://qr2.mobi/204os": [
        2018,
        2019
    ],
    "https://uqr.to/1rb3x": [
        2020,
        2021,
        2022
    ],
    "https://qr2.mobi/20by0": [
        2023
    ],
    "https://uqr.to/1t036": [
        2024
    ],
    "https://qr2.mobi/1wnmj": [
        2025,
        2026,
        2027,
        2028,
        2029,
        2030,
        2031,
        2032,
        2033
    ],
    "https://uqr.to/1q9an": [
        2034,
        2035,
        2036,
        2037,
        2038,
        2039,
        2040,
        2041,
        2042,
        2043
    ],
    "https://uqr.to/1spl4": [
        2044
    ],
    "https://uqr.to/1nf4e": [
        2045
    ],
    "https://uqr.to/1vy98": [
        2046,
        2047
    ],
    "https://qr2.mobi/1ze2r": [
        2048
    ],
    "https://qr2.mobi/201ld": [
        2049,
        2050,
        2051,
        2052,
        2053,
        2054,
        2055,
        2056,
        2057,
        2058,
        2059
    ],
    "https://uqr.to/1ovp0": [
        2060,
        2061,
        2062,
        2063,
        2064,
        2065,
        2066,
        2067,
        2068,
        2069,
        2070,
        2071,
        2072,
        2073,
        2074,
        2075,
        2076,
        2077,
        2078,
        2079,
        2080,
        2081,
        2082,
        2083
    ],
    "https://qr2.mobi/1z8cy": [
        2084,
        2085,
        2086,
        2087,
        2088,
        2089,
        2090,
        2091,
        2092
    ],
    "https://qr2.mobi/20swc": [
        2093
    ],
    "https://qr2.mobi/20bxr": [
        2094
    ],
    "https://uqr.to/1m1hd": [
        2095,
        2096,
        2097,
        2098
    ],
    "https://uqr.to/1q5jg": [
        2099,
        2100,
        2101,
        2102,
        2103,
        2104,
        2105,
        2106,
        2107,
        2108,
        2109,
        2110,
        2111,
        2112,
        2113,
        2114
    ],
    "https://uqr.to/1q67v": [
        2115,
        2116,
        2117,
        2118,
        2119,
        2120,
        2121,
        2122
    ],
    "https://qr2.mobi/204ja": [
        2123,
        2124,
        2125,
        2126,
        2127,
        2128,
        2129,
        2130
    ],
    "https://qr2.mobi/1zwqz": [
        2131,
        2132,
        2133,
        2134,
        2135,
        2136,
        2137,
        2138,
        2139,
        2140
    ],
    "https://uqr.to/1q67x": [
        2141,
        2142,
        2143,
        2144,
        2145,
        2146,
        2147,
        2148,
        2149,
        2150
    ],
    "https://qr2.mobi/1zzxg": [
        2151,
        2152,
        2153,
        2154,
        2155
    ],
    "https://qr2.mobi/20cm9": [
        2156,
        2157,
        2158
    ],
    "https://uqr.to/1sei8": [
        2159,
        2160,
        2161
    ],
    "https://uqr.to/1ts4o": [
        2162,
        2163,
        2164
    ],
    "https://uqr.to/1wc4g": [
        2165,
        2166
    ],
    "https://uqr.to/1xfbw": [
        2167,
        2168,
        2169,
        2170,
        2171,
        2172,
        2173
    ],
    "https://uqr.to/1ntmk": [
        2174
    ],
    "https://uqr.to/1ngp4": [
        2175,
        2176,
        2177,
        2178
    ],
    "https://uqr.to/1u1xb": [
        2179,
        2180
    ],
    "https://qr2.mobi/203du": [
        2181
    ],
    "https://uqr.to/1sxu7": [
        2182
    ],
    "https://qr2.mobi/238mj": [
        2183,
        2184
    ],
    "https://qr2.mobi/238t1": [
        2185
    ],
    "https://uqr.to/1xic0": [
        2186,
        2187
    ],
    "https://qr2.mobi/1yt8j": [
        2188,
        2189
    ],
    "https://uqr.to/1v4e2": [
        2190
    ],
    "https://qr2.mobi/20s9n": [
        2191,
        2192,
        2195,
        2196,
        2197
    ],
    "https://uqr.to/1st6w": [
        2193,
        2194
    ],
    "https://uqr.to/1sfdk": [
        2198
    ],
    "https://uqr.to/1shj2": [
        2199,
        2200
    ],
    "https://qr2.mobi/1wgr1": [
        2201,
        2202,
        2203,
        2204,
        2205,
        2206,
        2207,
        2208,
        2209,
        2210,
        2211,
        2212,
        2213,
        2214,
        2215,
        2216,
        2217,
        2218,
        2219,
        2220,
        2221,
        2222,
        2223,
        2224,
        2225,
        2226
    ],
    "https://uqr.to/1n199": [
        2227,
        2228
    ],
    "https://uqr.to/1pke3": [
        2229,
        2230,
        2231,
        2232,
        2233,
        2234,
        2235,
        2236,
        2237,
        2238,
        2239,
        2240,
        2241,
        2242,
        2243,
        2244,
        2245
    ],
    "https://qr2.mobi/1ze1z": [
        2246
    ],
    "https://uqr.to/1tgh9": [
        2247,
        2248
    ],
    "https://uqr.to/1rdk7": [
        2249,
        2250
    ],
    "https://qr2.mobi/1ze2m": [
        2251,
        2252
    ],
    "https://uqr.to/1wm4c": [
        2253
    ],
    "https://uqr.to/1vjcx": [
        2254
    ],
    "https://uqr.to/1t4uy": [
        2255
    ],
    "https://qr2.mobi/1wth7": [
        2256,
        2257,
        2258,
        2259,
        2260,
        2261,
        2262,
        2263,
        2264,
        2265,
        2266,
        2267,
        2268,
        2269,
        2270,
        2271,
        2272
    ],
    "https://uqr.to/1rexf": [
        2273,
        2274,
        2275,
        2276,
        2277,
        2278,
        2279,
        2280,
        2281,
        2282,
        2283,
        2284,
        2285,
        2286,
        2287,
        2288,
        2289
    ],
    "https://qr2.mobi/1wgrf": [
        2290,
        2291,
        2292,
        2293,
        2294,
        2295,
        2296,
        2297,
        2298,
        2299,
        2300,
        2301,
        2302,
        2303,
        2304,
        2305,
        2306,
        2307,
        2308
    ],
    "https://uqr.to/1m57a": [
        2309,
        2310,
        2311,
        2312
    ],
    "https://uqr.to/1ri5b": [
        2313,
        2314,
        2315,
        2316,
        2317,
        2318,
        2319,
        2320,
        2321,
        2322,
        2323,
        2324,
        2325
    ],
    "https://uqr.to/1n8a6": [
        2326,
        2327,
        2328,
        2329
    ],
    "https://uqr.to/1memf": [
        2330,
        2331
    ],
    "https://qr2.mobi/1wgrc": [
        2332,
        2333,
        2334,
        2335,
        2336,
        2337,
        2338,
        2339,
        2340,
        2341,
        2342,
        2343
    ],
    "https://uqr.to/1rtfm": [
        2344,
        2345,
        2346,
        2347,
        2348,
        2349,
        2350,
        2351,
        2352,
        2353,
        2354,
        2355
    ],
    "https://qr2.mobi/1wtht": [
        2356,
        2357,
        2358,
        2359,
        2360,
        2361,
        2362,
        2363,
        2364,
        2365,
        2366,
        2367
    ],
    "https://uqr.to/1tu48": [
        2368,
        2369
    ],
    "https://uqr.to/1n6k5": [
        2370,
        2371,
        2372,
        2373,
        2374,
        2375,
        2376,
        2377,
        2378,
        2379,
        2380,
        2381,
        2382,
        2383,
        2384,
        2385,
        2386,
        2387,
        2388
    ],
    "https://qr2.mobi/22sxj": [
        2389,
        2390,
        2391,
        2392,
        2393,
        2394,
        2395,
        2396,
        2397,
        2398,
        2399,
        2400,
        2401,
        2402,
        2403,
        2404,
        2405
    ],
    "https://uqr.to/1qt1m": [
        2406,
        2407,
        2408,
        2409,
        2410,
        2411,
        2412,
        2413,
        2414,
        2415,
        2416,
        2417,
        2418,
        2419,
        2420,
        2421,
        2422
    ],
    "https://qr2.mobi/22sxh": [
        2423,
        2424,
        2425,
        2426,
        2427,
        2428,
        2429,
        2430,
        2431,
        2432,
        2433,
        2434,
        2435,
        2436,
        2437,
        2438,
        2439,
        2440,
        2441,
        2442,
        2443,
        2444
    ],
    "https://uqr.to/1q97p": [
        2445,
        2446,
        2447,
        2448,
        2449,
        2450,
        2451,
        2452,
        2453,
        2454,
        2455,
        2456,
        2457,
        2458,
        2459,
        2460,
        2461,
        2462,
        2463,
        2464,
        2465,
        2466
    ],
    "https://qr2.mobi/210ms": [
        2467,
        2468,
        2469,
        2470,
        2471,
        2472,
        2473,
        2474,
        2475,
        2476,
        2477,
        2478
    ],
    "https://uqr.to/1sb7a": [
        2479,
        2480,
        2481,
        2482,
        2483,
        2484,
        2485,
        2486,
        2487,
        2488,
        2489,
        2490
    ],
    "https://qr2.mobi/1wnht": [
        2491,
        2492,
        2493,
        2494,
        2495,
        2496,
        2497,
        2498,
        2499,
        2500,
        2501,
        2502,
        2503,
        2504,
        2505,
        2506,
        2507,
        2508,
        2509,
        2510,
        2511,
        2512,
        2513,
        2514,
        2515
    ],
    "https://uqr.to/1puj4": [
        2516,
        2517,
        2518,
        2519,
        2520,
        2521,
        2522,
        2523,
        2524,
        2525,
        2526,
        2527,
        2528,
        2529,
        2530,
        2531,
        2532
    ],
    "https://uqr.to/1lqu9": [
        2533,
        2534,
        2535,
        2536,
        2537,
        2538
    ],
    "https://uqr.to/1kt1t": [
        2539,
        2540,
        2541,
        2542,
        2543,
        2544,
        2545,
        2546,
        2547,
        2548,
        2549,
        2550,
        2551,
        2552,
        2553,
        2554,
        2555,
        2556,
        2557,
        2558,
        2559,
        2560,
        2561,
        2562,
        2563,
        2564,
        2565,
        2566,
        2567,
        2568,
        2569,
        2570
    ],
    "https://qr2.mobi/1x1x4": [
        2571,
        2572,
        2573,
        2574,
        2575,
        2576,
        2577,
        2578,
        2579,
        2580,
        2581,
        2582,
        2583,
        2584,
        2585,
        2586,
        2587,
        2588,
        2589,
        2590,
        2591,
        2592,
        2593,
        2594,
        2595,
        2596,
        2597,
        2598,
        2599,
        2600,
        2601,
        2602
    ],
    "https://uqr.to/1m001": [
        2603,
        2604,
        2605,
        2606,
        2607,
        2608
    ],
    "https://uqr.to/1tlqy": [
        2609,
        2610,
        2611,
        2612,
        2613,
        2614
    ],
    "https://uqr.to/1p4su": [
        2615,
        2616,
        2617,
        2618,
        2619,
        2620,
        2621,
        2622,
        2623,
        2624,
        2625,
        2626,
        2627,
        2628,
        2629,
        2630,
        2631,
        2632
    ],
    "https://qr2.mobi/1ydpg": [
        2633,
        2634
    ],
    "https://uqr.to/1mqva": [
        2635
    ],
    "https://uqr.to/1g45a": [
        2636,
        2637
    ],
    "https://uqr.to/1thea": [
        2638,
        2639,
        2640
    ],
    "https://qr2.mobi/1xy59": [
        2641,
        2642,
        2643,
        2644,
        2645,
        2646,
        2647,
        2648,
        2649,
        2650,
        2651,
        2652,
        2653,
        2654,
        2655,
        2656,
        2657,
        2658,
        2659,
        2660
    ],
    "https://uqr.to/1ln4g": [
        2661,
        2662,
        2663,
        2664,
        2665,
        2666,
        2667
    ],
    "https://uqr.to/1m18l": [
        2668,
        2669,
        2670,
        2671,
        2672,
        2673,
        2674
    ],
    "https://uqr.to/1ozkx": [
        2675,
        2676,
        2677,
        2678,
        2679,
        2680,
        2681,
        2682,
        2683,
        2684,
        2685,
        2686,
        2687,
        2688,
        2689,
        2690,
        2691,
        2692,
        2693,
        2694,
        2695,
        2696,
        2697
    ],
    "https://qr2.mobi/1x1uf": [
        2698,
        2699,
        2700,
        2701,
        2702,
        2703,
        2704,
        2705,
        2706,
        2707,
        2708,
        2709,
        2710,
        2711,
        2712,
        2713,
        2714,
        2715,
        2716,
        2717,
        2718,
        2719,
        2720
    ],
    "https://qr2.mobi/201g4": [
        2721,
        2722,
        2723
    ],
    "https://uqr.to/1qt2j": [
        2724,
        2725,
        2726
    ],
    "https://qr2.mobi/1ydol": [
        2727
    ],
    "https://uqr.to/1r4cp": [
        2728,
        2729
    ],
    "https://uqr.to/1r4cn": [
        2730,
        2731
    ],
    "https://uqr.to/1pg6e": [
        2732,
        2733,
        2734,
        2735,
        2736,
        2737,
        2738
    ],
    "https://uqr.to/1r4cs": [
        2739
    ],
    "https://uqr.to/1r4cv": [
        2740,
        2741
    ],
    "https://uqr.to/1s0mx": [
        2742,
        2743,
        2744,
        2745
    ],
    "https://qr2.mobi/20bxx": [
        2746
    ],
    "https://qr2.mobi/201g2": [
        2747,
        2748
    ],
    "https://uqr.to/1s0n6": [
        2749,
        2750,
        2751,
        2752
    ],
    "https://uqr.to/1xic2": [
        2753
    ],
    "https://qr2.mobi/20sw8": [
        2754
    ],
    "https://qr2.mobi/20bxv": [
        2755
    ],
    "https://uqr.to/1tr0l": [
        2756,
        2757,
        2758,
        2759,
        2760,
        2761,
        2762,
        2763,
        2764,
        2765
    ],
    "https://uqr.to/1s54g": [
        2766,
        2767,
        2768,
        2769
    ],
    "https://qr2.mobi/20bxw": [
        2770
    ],
    "https://qr2.mobi/203dt": [
        2771
    ],
    "https://uqr.to/1r4q1": [
        2772
    ],
    "https://uqr.to/1r831": [
        2773,
        2774,
        2775,
        2776,
        2777,
        2778,
        2779,
        2780,
        2781,
        2782,
        2783
    ],
    "https://uqr.to/1r81y": [
        2784,
        2785,
        2786,
        2787,
        2788,
        2789,
        2790,
        2791,
        2792,
        2793,
        2794,
        2795,
        2796,
        2797,
        2798,
        2799,
        2800,
        2801,
        2802,
        2803,
        2804,
        2805,
        2806,
        2807
    ],
    "https://uqr.to/1j2ow": [
        2808
    ],
    "https://qr2.mobi/1zpy2": [
        2809
    ],
    "https://qr2.mobi/1ypls": [
        2810
    ],
    "https://uqr.to/1rk5j": [
        2811,
        2812
    ],
    "https://uqr.to/1sjkp": [
        2813,
        2814,
        2815,
        2816,
        2817,
        2818,
        2819,
        2820,
        2821,
        2822
    ],
    "https://uqr.to/1qbjn": [
        2823,
        2824,
        2825,
        2826,
        2827
    ],
    "https://uqr.to/1lv83": [
        2828,
        2829,
        2830
    ],
    "https://uqr.to/1rz09": [
        2831,
        2832,
        2833,
        2834,
        2835,
        2836,
        2837,
        2838,
        2839,
        2840
    ],
    "https://uqr.to/1sbb9": [
        2841,
        2842,
        2843,
        2844,
        2845,
        2846,
        2847,
        2848,
        2849
    ],
    "https://qr2.mobi/1w2b0": [
        2850,
        2851,
        2852,
        2853,
        2854,
        2855,
        2856,
        2857,
        2858,
        2859
    ],
    "https://qr2.mobi/1w056": [
        2860,
        2861,
        2862,
        2863,
        2864,
        2865,
        2866,
        2867,
        2868,
        2869,
        2870,
        2871,
        2872,
        2873,
        2874,
        2875,
        2876
    ],
    "https://uqr.to/1qryw": [
        2877
    ],
    "https://uqr.to/1vjc8": [
        2878
    ],
    "https://uqr.to/1ri32": [
        2879,
        2880,
        2881,
        2882
    ],
    "https://uqr.to/1vk10": [
        2883
    ],
    "https://qr2.mobi/20e29": [
        2884
    ],
    "https://uqr.to/1srma": [
        2885
    ],
    "https://uqr.to/1txsb": [
        2886
    ],
    "https://qr2.mobi/1z9ba": [
        2887
    ],
    "https://uqr.to/1q0r8": [
        2888,
        2889,
        2890,
        2891,
        2892
    ],
    "https://uqr.to/1q0rf": [
        2893,
        2894,
        2895,
        2896,
        2897,
        2898
    ],
    "https://uqr.to/1q0rd": [
        2899,
        2900
    ],
    "https://uqr.to/1ppa0": [
        2901,
        2902,
        2903,
        2904,
        2905,
        2906,
        2907,
        2908,
        2909,
        2910
    ],
    "https://qr2.mobi/1z9bl": [
        2911,
        2912
    ],
    "https://qr2.mobi/1zxay": [
        2913
    ],
    "https://uqr.to/1sygg": [
        2914
    ],
    "https://uqr.to/1wpz0": [
        2915,
        2916,
        2917
    ],
    "https://uqr.to/1tmim": [
        2918,
        2919,
        2920
    ],
    "https://qr2.mobi/20tid": [
        2921,
        2922,
        2923,
        2924
    ],
    "https://qr2.mobi/1x4oz": [
        2925,
        2926,
        2927
    ],
    "https://uqr.to/1r2yl": [
        2928,
        2929,
        2930,
        2931,
        2932,
        2933,
        2934,
        2935
    ],
    "https://qr2.mobi/202sp": [
        2936,
        2937,
        2938,
        2939,
        2940,
        2941
    ],
    "https://uqr.to/1s673": [
        2942,
        2943,
        2944,
        2945
    ],
    "https://uqr.to/1xiy7": [
        2946
    ],
    "https://uqr.to/1shk8": [
        2947,
        2948,
        2949,
        2950,
        2951
    ],
    "https://qr2.mobi/20f9p": [
        2952
    ],
    "https://uqr.to/1rc99": [
        2953
    ],
    "https://uqr.to/1tng0": [
        2954,
        2955,
        2956,
        2957,
        2958,
        2959,
        2960,
        2961,
        2962,
        2963,
        2964,
        2965,
        2966,
        2967,
        2968,
        2969,
        2970,
        2971,
        2972,
        2973
    ],
    "https://uqr.to/1opqb": [
        2974
    ],
    "https://uqr.to/1q9aq": [
        2975,
        2976,
        2977,
        2978,
        2979,
        2980,
        2981,
        2982,
        2983,
        2984
    ],
    "https://uqr.to/1q725": [
        2985,
        2986,
        2987,
        2988,
        2989
    ],
    "https://uqr.to/1q7v4": [
        2990,
        2991,
        2992,
        2993
    ],
    "https://qr2.mobi/1wnn7": [
        2994,
        2995,
        2996,
        2997,
        2998,
        2999,
        3000,
        3001,
        3002,
        3003,
        3004,
        3005,
        3006,
        3007,
        3008
    ],
    "https://qr2.mobi/23gqm": [
        3009
    ],
    "https://uqr.to/1pn8n": [
        3010,
        3011
    ],
    "https://uqr.to/1wg36": [
        3012,
        3013,
        3014,
        3015,
        3016,
        3017,
        3018,
        3019
    ],
    "https://uqr.to/1n6kp": [
        3020,
        3021,
        3022,
        3023,
        3024,
        3025,
        3026,
        3027,
        3028,
        3029,
        3030,
        3031,
        3032,
        3033,
        3034,
        3035,
        3036,
        3037,
        3038,
        3039,
        3040
    ],
    "https://uqr.to/1mvyh": [
        3041,
        3042,
        3043,
        3044,
        3045
    ],
    "https://uqr.to/1mptd": [
        3046,
        3047,
        3048,
        3049,
        3050
    ],
    "https://qr2.mobi/238t5": [
        3051
    ],
    "https://uqr.to/1n1k7": [
        3052,
        3053,
        3054,
        3055,
        3056,
        3057,
        3058,
        3059,
        3060,
        3061,
        3062,
        3063,
        3064,
        3065,
        3066,
        3067,
        3068,
        3069,
        3070,
        3071,
        3072,
        3073,
        3074,
        3075
    ],
    "https://uqr.to/1pkem": [
        3076,
        3077,
        3078,
        3079
    ],
    "https://uqr.to/1mvyc": [
        3080,
        3081,
        3082,
        3083,
        3084,
        3085,
        3086,
        3087,
        3088,
        3089,
        3090,
        3091,
        3092,
        3093,
        3094,
        3095,
        3096,
        3097,
        3098,
        3099,
        3100,
        3101,
        3102,
        3103
    ],
    "https://uqr.to/1tqco": [
        3104
    ],
    "https://qr2.mobi/238tk": [
        3105,
        3106
    ],
    "https://uqr.to/1txsd": [
        3107
    ],
    "https://uqr.to/1sdk0": [
        3108
    ],
    "https://uqr.to/1w2c4": [
        3109
    ],
    "https://uqr.to/1opq8": [
        3110
    ],
    "https://uqr.to/1wnnj": [
        3111,
        3112
    ],
    "https://uqr.to/1spl2": [
        3113
    ],
    "https://uqr.to/1qxmu": [
        3114,
        3115
    ],
    "https://qr2.mobi/202tk": [
        3116,
        3117,
        3118,
        3119
    ],
    "https://uqr.to/1r4q2": [
        3120,
        3121,
        3122,
        3123,
        3124,
        3125,
        3126,
        3127
    ],
    "https://qr2.mobi/20bye": [
        3128
    ],
    "https://qr2.mobi/20b9u": [
        3129,
        3130
    ],
    "https://qr2.mobi/201g6": [
        3131,
        3132
    ],
    "https://qr2.mobi/20b9m": [
        3133,
        3134
    ],
    "https://uqr.to/1wq8p": [
        3135
    ],
    "https://uqr.to/1vk17": [
        3136,
        3137,
        3138,
        3139,
        3140,
        3145,
        3146,
        3147
    ],
    "https://qr2.mobi/1z9b7": [
        3141,
        3142,
        3143,
        3144
    ],
    "https://qr2.mobi/20bxq": [
        3148
    ],
    "https://uqr.to/1ubn3": [
        3149,
        3150,
        3151
    ],
    "https://uqr.to/1wc4f": [
        3152
    ],
    "https://uqr.to/1vhsw": [
        3153
    ],
    "https://uqr.to/1xixh": [
        3154
    ],
    "https://uqr.to/1wq8z": [
        3155
    ],
    "https://uqr.to/1v47t": [
        3156,
        3157
    ],
    "https://qr2.mobi/1zxaz": [
        3158,
        3159,
        3160,
        3161,
        3162,
        3163
    ],
    "https://uqr.to/1t7iv": [
        3164,
        3165,
        3166,
        3167,
        3168,
        3169,
        3170,
        3171,
        3172,
        3173,
        3174,
        3175
    ],
    "https://uqr.to/1tmil": [
        3176,
        3177,
        3178,
        3179,
        3180,
        3181,
        3182,
        3183,
        3184,
        3185,
        3186,
        3187
    ],
    "https://qr2.mobi/1xf0o": [
        3188,
        3189,
        3190,
        3191,
        3192,
        3193,
        3194,
        3195,
        3196,
        3197
    ],
    "https://qr2.mobi/1wni8": [
        3198,
        3199,
        3200,
        3201,
        3202,
        3203,
        3204,
        3205,
        3206,
        3207
    ],
    "https://uqr.to/1qryt": [
        3208,
        3209,
        3210
    ],
    "https://uqr.to/1w5th": [
        3211,
        3212,
        3213
    ],
    "https://uqr.to/1xiy4": [
        3214
    ],
    "https://uqr.to/1raz4": [
        3215
    ],
    "https://qr2.mobi/20swd": [
        3216
    ],
    "https://uqr.to/1r5tl": [
        3217,
        3218,
        3219
    ],
    "https://uqr.to/1onte": [
        3220
    ],
    "https://qr2.mobi/1zspu": [
        3221,
        3222,
        3223
    ],
    "https://qr2.mobi/201le": [
        3224,
        3225,
        3226,
        3227,
        3228,
        3229,
        3230,
        3231,
        3232,
        3233,
        3234,
        3235,
        3236,
        3237,
        3238,
        3239
    ],
    "https://uqr.to/1ovop": [
        3240,
        3241,
        3242,
        3243,
        3244,
        3245,
        3246,
        3247,
        3248,
        3249,
        3250,
        3251,
        3252,
        3253,
        3254,
        3255,
        3256,
        3257,
        3258,
        3259,
        3260,
        3261,
        3262,
        3263,
        3264,
        3265,
        3266,
        3267,
        3268,
        3269,
        3270,
        3271
    ],
    "https://uqr.to/1ozkw": [
        3272,
        3273,
        3274,
        3275,
        3276,
        3277
    ],
    "https://uqr.to/1n147": [
        3278,
        3279,
        3280,
        3281,
        3282,
        3283,
        3284,
        3285,
        3286,
        3287,
        3288,
        3289,
        3290,
        3291,
        3292,
        3293,
        3294,
        3295,
        3296,
        3297,
        3298,
        3299,
        3300,
        3301,
        3302,
        3303,
        3304,
        3305,
        3306,
        3307,
        3308,
        3309
    ],
    "https://qr2.mobi/20bxz": [
        3310
    ],
    "https://uqr.to/1w5tc": [
        3311,
        3312,
        3313
    ],
    "https://uqr.to/1rc9h": [
        3314
    ],
    "https://uqr.to/1ovou": [
        3315,
        3316,
        3317,
        3318,
        3319,
        3320,
        3321,
        3322,
        3323,
        3324,
        3325,
        3326,
        3327,
        3328,
        3329,
        3330,
        3331,
        3332,
        3333,
        3334,
        3335,
        3336,
        3337,
        3338,
        3339,
        3340,
        3341,
        3342
    ],
    "https://qr2.mobi/201g3": [
        3343,
        3344,
        3345
    ],
    "https://qr2.mobi/20b50": [
        3346,
        3347
    ],
    "https://uqr.to/1u8x4": [
        3348,
        3349
    ],
    "https://uqr.to/1rdja": [
        3350,
        3351
    ],
    "https://uqr.to/1t5jq": [
        3352
    ],
    "https://uqr.to/1pyv6": [
        3353
    ],
    "https://uqr.to/1v4km": [
        3354,
        3355
    ],
    "https://uqr.to/1idwc": [
        3356
    ],
    "https://uqr.to/1xixb": [
        3357
    ],
    "https://uqr.to/1u4t5": [
        3358
    ],
    "https://qr2.mobi/20f95": [
        3359
    ],
    "https://uqr.to/1t1m4": [
        3360,
        3361
    ],
    "https://uqr.to/1ts64": [
        3362,
        3363
    ],
    "https://uqr.to/1qaem": [
        3364,
        3365,
        3366,
        3367
    ],
    "https://uqr.to/1shl4": [
        3370,
        3371,
        3372,
        3373,
        3374,
        3375,
        3376,
        3377
    ],
    "https://qr2.mobi/210lm": [
        3378,
        3379,
        3380,
        3381,
        3382,
        3383,
        3384,
        3385,
        3386
    ],
    "https://uqr.to/1shkj": [
        3387,
        3388,
        3389,
        3390,
        3391,
        3392,
        3393,
        3394,
        3395,
        3396
    ],
    "https://uqr.to/1ozme": [
        3397,
        3398,
        3399
    ],
    "https://uqr.to/1tjt6": [
        3400,
        3401,
        3402,
        3403,
        3404,
        3405,
        3406,
        3407,
        3408,
        3409,
        3410,
        3411,
        3412,
        3413,
        3414,
        3415,
        3416,
        3417,
        3418,
        3419,
        3420,
        3421,
        3422,
        3423,
        3424,
        3425,
        3426,
        3427,
        3428
    ],
    "https://uqr.to/1ncja": [
        3429,
        3430,
        3431,
        3432,
        3433
    ],
    "https://qr2.mobi/21lb8": [
        3434,
        3435,
        3436,
        3437,
        3438,
        3439,
        3440,
        3441,
        3442,
        3443,
        3444,
        3445,
        3446,
        3447,
        3448,
        3449,
        3450,
        3451,
        3452,
        3453
    ],
    "https://qr2.mobi/21go4": [
        3454,
        3455,
        3456,
        3457,
        3458,
        3459,
        3460,
        3461,
        3462,
        3463,
        3464,
        3465,
        3466,
        3467,
        3468,
        3469,
        3470,
        3471,
        3472,
        3473
    ],
    "https://uqr.to/1sr11": [
        3474,
        3475,
        3476,
        3477,
        3478,
        3479,
        3480,
        3481,
        3482,
        3483
    ],
    "https://uqr.to/1t02g": [
        3484,
        3485,
        3486,
        3487,
        3488,
        3489,
        3490,
        3491
    ],
    "https://uqr.to/1tar5": [
        3492,
        3493,
        3494,
        3495,
        3496,
        3497,
        3498,
        3499
    ],
    "https://uqr.to/1t2gb": [
        3500,
        3501,
        3502,
        3503,
        3504,
        3505,
        3506,
        3507,
        3508,
        3509,
        3510,
        3511,
        3512,
        3513,
        3514,
        3515,
        3516,
        3517,
        3518,
        3519,
        3520,
        3521,
        3522,
        3523,
        3524,
        3525,
        3526,
        3527,
        3528
    ],
    "https://qr2.mobi/20swb": [
        3529
    ],
    "https://qr2.mobi/20d2i": [
        3530
    ],
    "https://uqr.to/1u3j1": [
        3531
    ],
    "https://uqr.to/1tazc": [
        3532,
        3533
    ],
    "https://uqr.to/1u023": [
        3534,
        3535,
        3536,
        3537
    ],
    "https://qr2.mobi/23gl7": [
        3538
    ],
    "https://uqr.to/1u024": [
        3539,
        3540,
        3541
    ],
    "https://qr2.mobi/20w4a": [
        3542,
        3543,
        3544,
        3545,
        3546,
        3547,
        3548,
        3549,
        3550,
        3551
    ],
    "https://uqr.to/1xixn": [
        3552
    ]
};



            if (QRS[value]) {
                setSearchQuery(""); // limpiamos primero
                const ids = QRS[value].map(String).join(",");
                setSearchQuery(ids); // string tipo "2005,2006,2007"
                return;
            }

            const parsed = JSON.parse(value);
            if (
                parsed?.app === "Taskium" &&
                parsed?.version === 1 &&
                parsed?.type === "product" &&
                parsed?.data?.id
            ) {
                const prod = catalog.find((p) => p.id === parsed.data.id);
                if (prod) {
                    setSearchQuery(String(prod.id));
                } else {
                    toast.error(`${translate("Orders_item_product")} ${parsed.data.id} ${translate("Orders_error_notFound")}`);
                }
            } else {
                toast.error(translate("Orders_error_invalidQRProduct"));
            }
        } catch {
            toast.error(translate("Orders_error_invalidQRFormat"));
        }
    };

    const getPriceByType = (product) => {
        const type = product.priceType || "price";
        if (type === "price") return parseFloat(product.price || 0);

        const id = parseInt(type.replace("cf_", ""), 10);
        const field = product.customFields?.find(f => f.id === id);
        if (!field?.value) return 0;

        return parseFloat(field.value.replace("€", "").replace(",", ".") || 0);
    };

    useEffect(() => {
        if (expandedProduct) return;
        const mobile = orientation !== "landscape";
        if (!mobile) return;
        if (!currentOrder) return;

        if (openCartForOrderId == currentOrder.id) {
            setShowCartMobile(true);
            onCartConsumed?.();
        }
    }, [orientation, currentOrder?.id, openCartForOrderId]);

    if (!currentOrder) {
        return (
            <View style={[
                styles.center,
                {
                    backgroundColor: CurrentTheme.secondaryView
                }
            ]}>
                <Text style={[
                    styles.notFound,
                    {
                        color: CurrentTheme.cardText,
                    }
                ]}>
                    {translate("Orders_error_orderNotFound")}
                </Text>
                <TouchableOpacity onPress={goPrimaryView}>
                    <IoniconsIcon name="arrow-back" size={32} color={CurrentTheme.cardText} />
                </TouchableOpacity>
            </View>
        );
    }

    if (expandedProduct) {
        return (
            <ExpandedProduct
                product={expandedProduct}
                catalog={catalog}
                order={currentOrder}
                onBack={() => setExpandedProduct(null)}
                onChangeQty={changeQty}
                translate={translate}
                customFields={customProductFields}
                onPressCart={() => {
                    setExpandedProduct(null);
                    setShowCartMobile(true);
                }}
            />
        );
    }

    if (mobile && showCartMobile) {
        return (
            <OrdersCartMobile
                setShowCartMobile={setShowCartMobile}
                translate={translate}
                currentOrder={currentOrder}
                changeQty={changeQty}
            />
        );
    }

    if (scanningQR)
        return <QRScanner onRead={onQrRead} onCancel={() => setScanningQR(false)} />;

    return (
        <View style={[styles.containerRow, { backgroundColor: CurrentTheme.secondaryView }]}>
            <View style={styles.leftPanel}>
                {mobile && (
                    <OrderMobileHeader
                        order={currentOrder}
                        showBack
                        onBack={goPrimaryView}
                        showCart
                        cartCount={currentOrder?.totalQuantity || 0}
                        onPressCart={() => setShowCartMobile(true)}
                    />
                )}
                <View style={styles.topBar}>
                    <CustomTextInput
                        placeholder={translate("Orders_placeholder_search")}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                    />

                    {mobile && (
                        <View style={styles.topBarIcons}>
                            <TouchableOpacity onPress={() => setScanningQR(true)}>
                                <IoniconsIcon
                                    name="qr-code-outline"
                                    size={40}
                                    color={CurrentTheme.cardText}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.grid}>
                    <View style={[styles.row, { gap: mobile ? 10 : 20 }]}>
                        {visibleProducts.map((p) => (
                            <OrderProductCard
                                key={p.id}
                                product={p}
                                order={currentOrder}
                                idOrder={idOrder}
                                onPress={() => setExpandedProduct(p)}
                            />
                        ))}
                    </View>

                    {page * pageSize < filteredProducts.length && (
                        <Text
                            style={[styles.loadMore, { color: CurrentTheme.primaryText }]}
                            onPress={() => setPage((prev) => prev + 1)}
                        >
                            {translate("Orders_button_loadMore")}
                        </Text>
                    )}
                </ScrollView>
            </View>

            {!mobile && (
                <View style={[styles.cartPanel, { backgroundColor: CurrentTheme.primaryView }]}>
                    <Text style={[styles.cartTitle, { color: CurrentTheme.cardText }]}>
                        {translate("Orders_label_subtotal")}
                    </Text>
                    <Text style={[styles.cartTitle, { color: CurrentTheme.cardText }]}>
                        {currentOrder?.totalPrice}€
                    </Text>
                    <ScrollView contentContainerStyle={styles.grid}>

                        {currentOrder.products.map((prod) => {
                            return (
                                <TouchableOpacity
                                    key={prod.id}
                                    style={[
                                        styles.cartItem,
                                        {
                                            backgroundColor: CurrentTheme.secondaryView
                                        }
                                    ]}
                                    onPress={() => setExpandedProduct(prod)}
                                >

                                    <Image source={{ uri: prod.images[0]?.url || "https://my.fliwer.com/no-image.jpg" }} style={styles.productImage} resizeMode="cover" />

                                    <Text style={[styles.productPrice, { color: CurrentTheme.cardText }]}>
                                        {getPriceByType(prod).toFixed(2)}€
                                    </Text>

                                    <View style={styles.cartActions}>
                                        <TouchableOpacity onPress={() => changeQty(prod, -1)} style={styles.cartButton}>
                                            <Ionicons
                                                name={prod.quantity > 1 ? "remove" : "trash-bin-outline"}
                                                size={26}
                                                color={CurrentTheme.secondaryText}
                                            />
                                        </TouchableOpacity>

                                        <Text style={[styles.qtyText, { color: CurrentTheme.cardText }]}>
                                            {prod.quantity}
                                        </Text>

                                        <TouchableOpacity onPress={() => changeQty(prod, 1)} style={styles.cartButton}>
                                            <IoniconsIcon name="add" size={18} color={CurrentTheme.cardText} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );


};

export default OrderSecondaryView;

const styles = StyleSheet.create({
    containerRow: {
        flex: 1,
        flexDirection: "row",
    },
    leftPanel: {
        flex: 9,
    },
    cartPanel: {
        flex: 1,
        padding: 10,
        borderLeftWidth: 1,
        borderColor: "#ccc",
        alignItems: "center"
    },
    topBar: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },
    searchInput: {
        margin: 10,
        padding: 10,
        borderRadius: 8,
        flex: 1,
    },
    topBarIcons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    grid: {
        padding: Platform.OS !== "web" ? 0 : 20,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    loadMore: {
        marginTop: 20,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 20,
    },
    cartTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 12,
    },
    cartItem: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        backgroundColor: "#f4f4f4",
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: "#ccc",
    },
    productPrice: {
        fontSize: 12,
    },
    cartActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
        gap: 8,
    },
    cartButton: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: "rgba(0,0,0,0.05)",
    },
    qtyText: {
        fontSize: 14,
        fontWeight: "bold",
        minWidth: 20,
        textAlign: "center",
    },
});
