import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: {},
    onlineUsers: [],
    allUsers: [],
    selectedUser: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
    setOnlineUser: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setAllUser: (state, action) => {
      state.allUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setOnlineUser,
  setAllUser,
  setSelectedUser,
} = userSlice.actions;
export default userSlice.reducer;
