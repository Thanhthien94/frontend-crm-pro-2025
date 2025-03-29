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

// Hàm kiểm tra token có hợp lệ không
const hasValidToken = () => {
  const token = getCookie('token');
  if (!token) return false;
  
  // Kiểm tra xem token có định dạng JWT không
  try {
    const parts = token.toString().split('.');
    return parts.length === 3;
  } catch (e) {
    return false;
  }
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Token will be sent automatically via cookies
    // This is just for client-side API calls that might need the token in headers
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm header cho debugging
    config.headers['X-Client-Time'] = new Date().toISOString();
    config.headers['X-Has-Token'] = hasValidToken() ? 'yes' : 'no';
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ xử lý khi có lỗi 401 và đang ở client side
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.log('API received 401 error - logging out');
      
      // Clean up cookies and local storage
      deleteCookie('token', { path: '/' });
      localStorage.removeItem('user');
      
      // Lưu lại đường dẫn hiện tại để có thể quay lại sau khi đăng nhập
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        // Chỉ chuyển hướng nếu không phải đang ở trang login hoặc register
        window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;