"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import api from "@/lib/api";
import { User } from "@/types/user";

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
  // Khởi tạo state user từ localStorage nếu có
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          console.error("Failed to parse user data from localStorage");
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  
  // Hàm refresh user data từ server
  const refreshUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      if (response.data && response.data.data) {
        // Cập nhật state user và localStorage
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error("Invalid user data");
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // Chỉ xóa dữ liệu nếu server trả về 401
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("user");
        setUser(null);
      }
      throw error;
    }
  };

  // Khởi tạo trạng thái xác thực khi component mount - CHẠY MỘT LẦN DUY NHẤT
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Thử xác thực với server nếu có dữ liệu trong localStorage
        if (localStorage.getItem("user")) {
          try {
            const response = await api.get("/auth/me");
            
            if (response.data && response.data.data) {
              console.log("Khởi tạo auth context - xác thực thành công");
              setUser(response.data.data);
              localStorage.setItem("user", JSON.stringify(response.data.data));
            } else {
              console.error("Khởi tạo auth context - dữ liệu người dùng không hợp lệ");
              // Không xóa dữ liệu nếu server không trả về dữ liệu
            }
          } catch (error) {
            console.error("Khởi tạo auth context - xác thực thất bại", error);
            
            if (axios.isAxiosError(error) && error.response?.status === 401) {
              // Xóa dữ liệu user khi server trả về 401
              localStorage.removeItem("user");
              setUser(null);
            }
            // Các lỗi khác không xóa dữ liệu
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    // QUAN TRỌNG: Không có dependencies nào - chỉ chạy một lần khi mount
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Login - attempting login with email:", email);
      const response = await api.post("/auth/login", { email, password });
      console.log('user response: ', response.data);
      const { user } = response.data;

      console.log("Login - successful, received user data:", user);

      // Cập nhật dữ liệu user
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login - auth state updated successfully");

      return user;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      console.log("Register - attempting with email:", data.email);
      const response = await api.post("/auth/register", data);
      const { user } = response.data;

      console.log("Register - successful, received user data:", user);

      // Cập nhật dữ liệu user
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Register - auth state updated successfully");

      return user;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Logout - attempting to logout");

      // Call backend logout endpoint to clear server-side cookie
      await api.get("/auth/logout");

      // Xóa dữ liệu user
      localStorage.removeItem("user");
      setUser(null);

      console.log("Logout - cleared all auth data");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
      // Vẫn xóa dữ liệu user ngay cả khi server call thất bại
      localStorage.removeItem("user");
      setUser(null);

      // Redirect to login page
      window.location.href = "/login";
    }
  };

  // Xác định trạng thái xác thực
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}