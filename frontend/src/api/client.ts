import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",
});

apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
);

export default apiClient;