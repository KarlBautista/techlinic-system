import axios from "axios";
import supabase from "../config/supabaseClient";

/**
 * Axios instance pre-configured for the Techclinic backend API.
 * 
 * Automatically attaches the Supabase JWT access token to every request
 * via an Authorization: Bearer <token> header.
 * 
 * This is what enables the backend RBAC middleware to verify the user
 * and check their role before allowing access to protected endpoints.
 * 
 * Usage (in stores):
 *   import api from "../lib/api";
 *   const response = await api.get("/get-records");
 *   const response = await api.post("/insert-record", { formData });
 */
const api = axios.create({
    baseURL: "http://localhost:3500/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach Supabase JWT to every outgoing request
api.interceptors.request.use(
    async (config) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch (err) {
            console.error("Failed to attach auth token:", err.message);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor — handle 401/403 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("API returned 401 Unauthorized — session may have expired");
            // Optionally redirect to login or refresh the session
        }
        if (error.response?.status === 403) {
            console.warn("API returned 403 Forbidden — insufficient role permissions");
        }
        return Promise.reject(error);
    }
);

export default api;
