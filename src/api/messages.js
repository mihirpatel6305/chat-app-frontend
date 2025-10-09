import api from "./axios";
import { compressImage } from "../services/compressImage";

export const getUnreadCount = async (userId) => {
  try {
    const res = await api.get(`message/unread-count/${userId}`);
    return res.data?.data?.unreadCounts;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchLatestMsgTime = async () => {
  try {
    const res = await api.get("message/latest");
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendImageMessage = async (receiverId, file, onUploadProgress) => {
  try {
    const compressedImage = await compressImage(file, 0.8, 1024, 1024);
    const formData = new FormData();
    formData.append("image", compressedImage, file.name);
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

export const setAllDelivered = async () => {
  try {
    const res = await api.put("/message/delivered");
    return res.data?.data || res.data;
  } catch (error) {
    console.error("Error in setAllDelivered >>", error);
    throw error.response?.data || error.message;
  }
};
