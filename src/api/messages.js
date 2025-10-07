import api from "./axios";

export const getUnreadCount = async (userId) => {
  try {
    const res = await api.get(`message/unread-count/${userId}`);
    return res.data?.data?.unreadCounts;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendImageMessage = async (receiverId, file, onUploadProgress) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post(`message/image/${receiverId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return res;
  } catch (error) {
    return error.response?.data || error.message;
  }
};
