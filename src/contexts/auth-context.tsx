// src/contexts/auth-context.tsx

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types/user';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hàm chung để đồng bộ giữa cookie và localStorage
  const syncAuthState = (userData: User | null, token?: string) => {
    if (userData && token) {
      // Nếu có cả data và token, lưu trữ cả hai
      localStorage.setItem('user', JSON.stringify(userData));
      setCookie('token', token, { 
        maxAge: 30 * 24 * 60 * 60, // 30 ngày
        path: '/',
        sameSite: 'lax'
      });
      setUser(userData);
    } else {
      // Nếu không có một trong hai, xóa cả hai để đảm bảo trạng thái sạch
      localStorage.removeItem('user');
      deleteCookie('token', { path: '/' });
      setUser(null);
    }
  };

  // Hàm refresh user data từ server
  const refreshUserData = async () => {
    try {
      const token = getCookie('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await api.get('/auth/me');
      if (response.data && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error('Invalid user data');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      syncAuthState(null);
      throw error;
    }
  };

  // Khởi tạo trạng thái xác thực khi component mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getCookie('token');
      console.log('Auth context init - token exists:', !!token);
      
      // Nếu không có token, chắc chắn không được xác thực
      if (!token) {
        console.log('Auth context init - no token, not authenticated');
        syncAuthState(null);
        setLoading(false);
        return;
      }
      
      // Kiểm tra nhanh từ localStorage
      let localUser = null;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          localUser = JSON.parse(storedUser);
          console.log('Auth context init - found user in localStorage');
          setUser(localUser);
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage', error);
        localStorage.removeItem('user');
      }
      
      // Luôn xác thực với server
      try {
        console.log('Auth context init - validating token with server');
        const response = await api.get('/auth/me');
        
        if (response.data && response.data.data) {
          console.log('Auth context init - token validated successfully');
          setUser(response.data.data);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } else {
          console.error('Auth context init - server returned invalid user data');
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Auth context init - token validation failed', error);
        syncAuthState(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Login function cải tiến
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Login - attempting login with email:', email);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      console.log('Login - successful, received user data:', user);
      
      // Đồng bộ trạng thái xác thực
      syncAuthState(user, token);
      
      // Clear any errors
      if (window.location.href.includes('error=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      console.log('Login - auth state updated successfully');
      
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function cải tiến
  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      console.log('Register - attempting with email:', data.email);
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      
      console.log('Register - successful, received user data:', user);
      
      // Đồng bộ trạng thái xác thực
      syncAuthState(user, token);
      
      console.log('Register - auth state updated successfully');
      
      // Use a longer timeout to ensure cookie processing
      return user;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function cải tiến
  const logout = async () => {
    try {
      console.log('Logout - attempting to logout');
      
      // Call backend logout endpoint to clear server-side cookie
      await api.get('/auth/logout');
      
      // Clear client-side data
      syncAuthState(null);
      
      console.log('Logout - cleared all auth data');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
      // Still clear client-side data even if server call fails
      syncAuthState(null);
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  // Kiểm tra token cookie để xác định trạng thái xác thực chính xác
  const cookieToken = getCookie('token');
  const isAuthenticated = !!cookieToken && !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}