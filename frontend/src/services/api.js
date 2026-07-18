import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Attach the saved auth token to every request automatically, so protected
// endpoints (like /auth/dashboard) don't each need to build their own
// Authorization header by hand.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
