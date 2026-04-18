import axios from 'axios';

export const TOKEN_KEY = "shopmore_token";
const USER_KEY = "shopmore_user";

// Registered by AuthContext so 401s clear React state instead of hard-navigating.
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(fn: () => void): void {
    onUnauthorized = fn;
}

export const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8088",
    headers: { "Content-Type": "application/json" },
});

// Attach Bearer token from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear local auth state and route through React instead of hard-navigating
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);
