import axios from "axios";

// Create an axios instance with base URL and default headers
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401) - redirect to login
    if (error.response && error.response.status === 401) {
      // You can add redirection logic here if needed
      console.error("Unauthorized access, please login again");
    }
    return Promise.reject(error);
  }
);
