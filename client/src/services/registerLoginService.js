import apiClient from "./apiClient";

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/api/register", userData);
    return response;
  } catch (error) {
    console.error("Error during user registration:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post("/api/login", credentials);
    return response;
  } catch (error) {
    console.error("Error during user login:", error);
    throw error;
  }
};

export const signInWithGoogle = () => {
  window.location.href = "http://localhost:5001/api/auth/google";
};
