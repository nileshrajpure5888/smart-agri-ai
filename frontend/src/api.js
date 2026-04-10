import axios from "axios";

const api = axios.create({
  baseURL: "https://smart-agri-ai-2.onrender.com",
  timeout: 5000,
});

/* REQUEST INTERCEPTOR */
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* RESPONSE INTERCEPTOR */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.log("API ERROR:", error.message);

    if (error.code === "ECONNABORTED") {
      alert("Server is slow. Try again.");
    }

    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;