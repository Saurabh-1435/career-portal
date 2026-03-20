import axios from 'axios';
import { STORAGE } from '../context/authContext';

const api = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL || '/api') : '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const t = localStorage.getItem(STORAGE.token);
  if (t) config.headers.Authorization = `Bearer ${t}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Only handle 401 (Unauthorized) - means token is invalid/expired or user is not authenticated
    // 403 (Forbidden) means user is authenticated but doesn't have permission for this resource
    // Let individual components handle 403 errors appropriately
    if (err.response?.status === 401) {
      // Clear authentication data on unauthorized responses
      localStorage.removeItem(STORAGE.token);
      localStorage.removeItem(STORAGE.user);
      // Only redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
