import axios from "axios";


// ==========================
// BASE URL (ENV READY)
// ==========================
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 60000,
});


// ==========================
// REQUEST INTERCEPTOR
// ==========================
api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

  },
  (error) => Promise.reject(error)
);


// ==========================
// RESPONSE INTERCEPTOR
// ==========================
api.interceptors.response.use(
  (response) => response,

  (error) => {

    const status = error?.response?.status;


    // ==========================
    // UNAUTHORIZED
    // ==========================
    if (status === 401) {

      console.warn("401 - Session expired");

      localStorage.clear();
      sessionStorage.clear();

      if (!window.location.pathname.includes("login")) {
        window.location.href = "/login";
      }
    }


    // ==========================
    // FORBIDDEN
    // ==========================
    if (status === 403) {

      alert("You don't have permission ❌");

      if (!window.location.pathname.includes("dashboard")) {
        window.location.href = "/dashboard";
      }
    }


    return Promise.reject(error);
  }
);


export default api;
