import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  try {
    // Use 'token' key to match auth utilities across the app
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor to handle unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      if (status === 401) {
        // Clear token and cached user on 401 to avoid loops
        try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(error);
  }
);

export default api;
