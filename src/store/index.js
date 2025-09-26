import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../feature/userSlice";
import messageReducer from "../feature/messageSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    messages: messageReducer,
  },
});

export default store;
