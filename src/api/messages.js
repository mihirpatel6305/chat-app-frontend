import api from "./axios";

export const getUnreadCount = async (userId) => {
  try {
    const res = await api.get(`message/unreadCount/${userId}`);
    return res.data?.unreadCounts;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendImageMessage = async (receiverId, file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post(`message/sendImage/${receiverId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
