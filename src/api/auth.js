import api from "./axios";

export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

export const signup = async (name, email, password, confirmPassword) => {
  try {
    const response = await api.post("/auth/signup", {
      name,
      email,
      password,
      confirmPassword,
    });
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return error.response?.data;
  }
};
