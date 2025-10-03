import api from "./axios";

export const getAllUsers = async () => {
  try {
    const response = await api.get("/user/users");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProfile = async () => {
  try {
    const res = await api.get("/user/me");
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserById = async (id) => {
  try {
    const res = await api.get(`/user/${id}`);
    return res.data?.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
