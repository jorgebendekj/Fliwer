// reducers/offlineAccessSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  userName: '',
  allowedModules: [], // Ej: ['products', 'newOrder']
  lastSync: null
};

const offlineAccessSlice = createSlice({
  name: 'offlineAccess',
  initialState,
  reducers: {
    setOfflineUserData(state, action) {
      const { userId, userName, allowedModules } = action.payload;
      state.userId = userId;
      state.userName = userName;
      state.allowedModules = allowedModules;
      state.lastSync = new Date().toISOString();
    },
    clearOfflineUserData(state) {
      state.userId = null;
      state.userName = '';
      state.allowedModules = [];
      state.lastSync = null;
    }
  }
});

export const { setOfflineUserData, clearOfflineUserData } = offlineAccessSlice.actions;
export default offlineAccessSlice.reducer;
