'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { User } from '@/types/user';
import { userService } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<User | null>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Khởi tạo state user từ localStorage nếu có
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          console.error('[AUTH] Lỗi khi phân tích dữ liệu người dùng từ localStorage');
          localStorage.removeItem('user');
          return null;
        }
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);
  
  // Hàm refresh user data từ server - đây là cách đáng tin cậy để kiểm tra trạng thái đăng nhập
  const refreshUserData = async () => {
    try {
      console.log('[AUTH] Đang refresh dữ liệu user');
      const response = await userService.getCurrentUser();      
      // Xử lý dữ liệu phản hồi - mỗi API có thể trả về cấu trúc khác nhau
      let userData: User | null = null;
      
      if (response.data && response.data.data) {
        userData = response.data.data;
      } else if (response.data && response.data.user) {
        userData = response.data.user;
      } else if (response.data) {
        // Nếu dữ liệu trả về trực tiếp là user
        userData = response.data;
      }
      
      if (userData) {
        console.log('[AUTH] User data refreshed');
        
        // Cập nhật state và lưu vào localStorage
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('[AUTH] Lỗi khi refreshUserData:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Nếu server trả về 401, xóa dữ liệu người dùng
        console.log('[AUTH] Phiên hết hạn, đang xóa dữ liệu user');
        localStorage.removeItem('user');
        setUser(null);
      }
      
      return null;
    }
  };

  // Khởi tạo trạng thái xác thực khi component mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Kiểm tra trạng thái đăng nhập bằng cách gọi API me
        await refreshUserData();
      } catch (error) {
        console.error('[AUTH] Lỗi khi khởi tạo trạng thái xác thực:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('[AUTH] Bắt đầu đăng nhập với email:', email);
      
      const response = await api.post('/auth/login', { email, password });
      
      // Xử lý dữ liệu phản hồi - tìm thông tin user từ response
      let userData: User | null = null;
      
      if (response.data && response.data.user) {
        userData = response.data.user;
      } else if (response.data && response.data.data) {
        userData = response.data.data;
      }
      
      // Nếu không tìm thấy dữ liệu người dùng trong phản hồi đăng nhập,
      // thử gọi API me để lấy thông tin
      if (!userData) {
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data && userResponse.data.data) {
            userData = userResponse.data.data;
          } else if (userResponse.data && userResponse.data.user) {
            userData = userResponse.data.user;
          }
        } catch (err) {
          console.error('[AUTH] Lỗi khi lấy thông tin user sau khi đăng nhập:', err);
        }
      }
      
      // Nếu vẫn không có thông tin user, báo lỗi
      if (!userData) {
        console.error('[AUTH] Không tìm thấy dữ liệu người dùng trong response');
        throw new Error('Không tìm thấy dữ liệu người dùng');
      }

      console.log('[AUTH] Đăng nhập thành công');

      // Cập nhật state và localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('[AUTH] Đăng nhập thất bại', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      console.log('[AUTH] Đăng ký với email:', data.email);
      const response = await api.post('/auth/register', data);
      
      // Tìm thông tin user từ response
      let userData: User | null = null;
      
      if (response.data && response.data.user) {
        userData = response.data.user;
      } else if (response.data && response.data.data) {
        userData = response.data.data;
      }
      
      if (!userData) {
        // Nếu không tìm thấy trong response trực tiếp, thử gọi API me
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data && userResponse.data.data) {
            userData = userResponse.data.data;
          } else if (userResponse.data && userResponse.data.user) {
            userData = userResponse.data.user;
          }
        } catch (err) {
          console.error('[AUTH] Lỗi khi lấy thông tin user sau khi đăng ký:', err);
        }
      }
      
      if (!userData) {
        console.error('[AUTH] Không tìm thấy dữ liệu người dùng trong response');
        throw new Error('Không tìm thấy dữ liệu người dùng');
      }

      console.log('[AUTH] Đăng ký thành công');

      // Cập nhật state và localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('[AUTH] Đăng ký thất bại', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH] Đang đăng xuất');

      // Gọi API đăng xuất để xóa cookie phía server
      await api.get('/auth/logout');

      // Xóa dữ liệu user trên client
      localStorage.removeItem('user');
      setUser(null);

      console.log('[AUTH] Đã xóa tất cả dữ liệu xác thực');
      
      // Router sẽ được sử dụng bởi component gọi hàm logout
    } catch (error) {
      console.error('[AUTH] Đăng xuất thất bại', error);
      // Vẫn xóa dữ liệu user ngay cả khi server call thất bại
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Thêm phương thức quên mật khẩu
  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return;
    } catch (error) {
      console.error('[AUTH] Lỗi quên mật khẩu:', error);
      throw error;
    }
  };

  // Thêm phương thức đặt lại mật khẩu
  const resetPassword = async (token: string, password: string) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      return;
    } catch (error) {
      console.error('[AUTH] Lỗi đặt lại mật khẩu:', error);
      throw error;
    }
  };

  // Xác định trạng thái xác thực dựa trên việc có user data không
  // Cookie sẽ tự động gửi đi với mỗi request, không cần kiểm tra ở đây
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        refreshUserData,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}