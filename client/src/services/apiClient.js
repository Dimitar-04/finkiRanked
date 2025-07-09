import axios from "axios";

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("supabase-auth-token");
    // const tokenObject = JSON.parse(token);
    // const accessToken = tokenObject?.access_token;
    // console.log(accessToken);
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error(
      `API call failed: ${error.message} for URL ${error.config?.url}`,
      {
        status: error.response?.status,
        responseData: error.response?.data,
        requestData: error.config?.data,
      }
    );
    return Promise.reject(error);
  }
);

export default apiClient;
