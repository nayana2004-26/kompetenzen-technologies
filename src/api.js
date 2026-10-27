import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});

// Add the login token to protected API requests.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("kt_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Display understandable error messages.
export function getErrorMessage(error) {
    if (error.response) {
        return (
            error.response.data?.message ||
            `Request failed (${error.response.status}).`
        );
    }

    if (error.code === "ECONNABORTED") {
        return "The request timed out. Please try again.";
    }

    return "Cannot connect to the backend. Check that localhost:5000 is running.";
}

export { api };
export default api;