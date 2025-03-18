import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies to be sent with requests
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Token will be sent automatically via cookies
    // This is just for client-side API calls that might need the token in headers
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean up cookies and local storage
      deleteCookie('token');
      localStorage.removeItem('user');
      
      // Only redirect in client-side context
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;