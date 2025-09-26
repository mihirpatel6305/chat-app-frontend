import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: {},
    loading: false,
  },
  reducers: {
    addMessage: (state, action) => {
      const { receiverId, message } = action.payload;
      if (!state.messages[receiverId]) {
        state.messages[receiverId] = [];
      }
      state.messages[receiverId].push(message);
    },
    updateMessage: (state, action) => {
      const { receiverId, tempId, updates } = action.payload;
      const message = state.messages[receiverId];

      if (!message) return;

      const index = message.findIndex((msg) => msg.tempId === tempId);
      if (index !== -1) {
        message[index] = { ...message[index], ...updates };
      }
    },
    setMessages: (state, action) => {
      const { receiverId, messages } = action.payload;

      if (Array.isArray(messages)) {
        const reversedMessages = [...messages].reverse();
        state.messages[receiverId] = [...reversedMessages];
      } else {
        state.messages[receiverId] = [];
      }
    },
    addPrevMessage: (state, action) => {
      const { receiverId, messages } = action.payload;
      if (state.messages[receiverId]) {
        if (Array.isArray(messages)) {
          const reversedMessages = [...messages].reverse();

          state.messages[receiverId] = [
            ...reversedMessages,
            ...(state.messages[receiverId] || []),
          ];
        }
      }
    },
  },
});

export const { addMessage, setMessages, addPrevMessage, updateMessage } =
  messagesSlice.actions;
export default messagesSlice.reducer;
