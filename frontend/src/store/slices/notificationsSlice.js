import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, { payload }) => {
      state.list = payload.list ?? payload;
      state.unreadCount = (payload.list ?? payload).filter((n) => !n.read).length;
    },
    addNotification: (state, { payload }) => {
      state.list.unshift(payload);
      if (!payload.read) state.unreadCount += 1;
    },
    markRead: (state, { payload }) => {
      const n = state.list.find((x) => x._id === payload);
      if (n) n.read = true;
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAllRead: (state) => {
      state.list.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markRead, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
