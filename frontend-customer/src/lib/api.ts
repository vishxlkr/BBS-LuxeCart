import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('luxecart_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthPage = window.location.pathname.startsWith('/auth');
      if (!isAuthPage) {
        localStorage.removeItem('luxecart_token');
        localStorage.removeItem('luxecart_user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Utility to get error message from Axios errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unknown error occurred';
};
