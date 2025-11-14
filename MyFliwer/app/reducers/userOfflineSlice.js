// reducers/userOfflineSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
};

const userOfflineSlice = createSlice({
  name: 'userOffline',
  initialState,
  reducers: {
    setUserOfflineData(state, action) {
      state.data = action.payload;
    },
    clearUserOfflineData(state) {
      state.data = null;
    },
  },
});

export const { setUserOfflineData, clearUserOfflineData } = userOfflineSlice.actions;
export default userOfflineSlice.reducer;
