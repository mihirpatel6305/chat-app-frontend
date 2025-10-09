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
    sortUserOnLastestMsg: (state, action) => {
      // array like [{_id, lastMessageAt}, ...]
      const latestMessages = action.payload;

      // Create a map of _id -> index in latestMessages
      const orderMap = {};
      latestMessages.forEach((msg, index) => {
        orderMap[msg._id] = index;
      });

      // Sort allUsers based on orderMap
      state.allUsers.sort((userA, userB) => {
        const indexA =
          orderMap[userA._id] !== undefined ? orderMap[userA._id] : Infinity;
        const indexB =
          orderMap[userB._id] !== undefined ? orderMap[userB._id] : Infinity;
        return indexA - indexB;
      });
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
  sortUserOnLastestMsg,
  setSelectedUser,
} = userSlice.actions;
export default userSlice.reducer;
