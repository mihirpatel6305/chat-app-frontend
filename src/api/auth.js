import api from "./axios";

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const signinUser = async (name, email, password) => {
  try {
    const response = await api.post("/auth/signin", { name, email, password });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
