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

    // Updating the status and replace it with original message object
    updateMsgStatusSent: (state, action) => {
      const { tempId, newMessage } = action.payload;
      const receiverId = newMessage?.receiverId;
      const messages = state.messages[receiverId];

      if (!messages) return;

      const index = messages.findIndex((msg) => msg.tempId === tempId);
      if (index !== -1) {
        // Replace temp message with actual message from server
        state.messages[receiverId][index] = {
          ...newMessage,
          status: "sent",
        };
      }
    },

    updateMsgStatusDelivered: (state, action) => {
      const message = action.payload;
      const receiverId = message?.receiverId;
      const messages = state.messages[receiverId];

      if (!messages) return;

      const index = messages.findIndex((msg) => msg?._id === message?._id);
      if (index !== -1) {
        const currentStatus = messages[index]?.status;

        // Allow delivered only if message isn't already seen
        if (currentStatus !== "seen") {
          state.messages[receiverId][index] = {
            ...message,
            status: "delivered",
          };
        }
      }
    },

    updateMsgStatusSeen: (state, action) => {
      const message = action.payload;
      const receiverId = message?.receiverId;
      const messages = state.messages[receiverId];

      if (!messages) return;

      const index = messages.findIndex((msg) => msg?._id === message?._id);
      if (index !== -1) {
        state.messages[receiverId][index] = {
          ...message,
          status: "seen",
        };
      }
    },

    allMsgStatusSeen: (state, action) => {
      const receiverId = action.payload;
      const messages = state.messages[receiverId];
      if (!messages) return;
      state.messages[receiverId] = messages.map((msg) => {
        if (msg.status !== "seen") {
          return { ...msg, status: "seen" };
        }
        return msg;
      });
    },

    removeMessage: (state, action) => {
      const { receiverId, tempId } = action.payload;
      const messages = state.messages[receiverId];

      if (!messages) return;

      const index = messages.findIndex((msg) => msg.tempId === tempId);
      if (index !== -1) {
        messages.splice(index, 1);
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

export const {
  addMessage,
  setMessages,
  addPrevMessage,
  updateMessage,
  removeMessage,
  updateMsgStatusSent,
  updateMsgStatusDelivered,
  updateMsgStatusSeen,
  allMsgStatusSeen,
} = messagesSlice.actions;
export default messagesSlice.reducer;
