import {
    GET_CLOCK_IN,
    SET_CLOCK_IN_LOADING,
    UPDATE_CLOCK_IN,
    SET_CLOCK_IN_TIMER_STATE
} from "../actions/clockInActions";

const initialState = {
    data: [],
    loading: true
};

const clockInReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CLOCK_IN_LOADING:
            return {
                ...state,
                loading: action.data
            };

        case GET_CLOCK_IN:
            return {
                ...state,
                data: action.data.map(x => {
                    const actions = Array.isArray(x.actions) ? x.actions : [];

                    const sorted = [...actions]
                        .filter(action => action.deleted !== 1)
                        .sort((a, b) => a.insertTime - b.insertTime);
                    const last = sorted[sorted.length - 1];

                    const isRunning = last?.action === "start";

                    return {
                        ...x,
                        actions,
                        isRunning
                    };
                }),
                loading: false
            };



        case UPDATE_CLOCK_IN: {
            const updatedClockIn = {
                ...action.payload,
                actions: Array.isArray(action.payload.actions) ? action.payload.actions : [],
            };

            const sorted = [...updatedClockIn.actions]
                .filter(action => action.deleted !== 1)
                .sort((a, b) => a.insertTime - b.insertTime);
            const last = sorted[sorted.length - 1];

            updatedClockIn.isRunning = last?.action === "start";

            return {
                ...state,
                data: state.data.map(clockIn =>
                    clockIn.id === updatedClockIn.id
                        ? updatedClockIn
                        : clockIn
                )
            };
        }

        case SET_CLOCK_IN_TIMER_STATE: {
            const { clockInId, isRunning } = action.payload;
            return {
                ...state,
                data: state.data.map(clockIn =>
                    clockIn.id === clockInId
                        ? { ...clockIn, isRunning }
                        : clockIn
                )
            };
        }

        default:
            return state;
    }
};

export default clockInReducer;
