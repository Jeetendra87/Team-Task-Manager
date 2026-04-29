import axios from "axios";
import { useAuthStore } from "@/store/auth";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({ baseURL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const { token, logout } = useAuthStore.getState();
      // Only force-logout if we *had* a token (i.e. it expired/was revoked).
      if (token) logout();
    }
    return Promise.reject(err);
  }
);

export function apiError(err, fallback = "Something went wrong") {
  return err?.response?.data?.error || err?.message || fallback;
}
