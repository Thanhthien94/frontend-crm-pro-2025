"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User } from "@/types/user";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

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
  const [user, setUser] = useState<User | null>(() => {
    // Đọc dữ liệu người dùng từ localStorage khi khởi tạo
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse user data from localStorage");
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hàm chung để đồng bộ giữa cookie và localStorage
  const syncAuthState = (userData: User | null, token?: string) => {
    console.log(
      "syncAuthState called with userData:",
      !!userData,
      "token:",
      !!token
    );

    if (userData && token) {
      // Nếu có cả data và token, lưu trữ cả hai
      localStorage.setItem("user", JSON.stringify(userData));
      setCookie("token", token, {
        maxAge: 30 * 24 * 60 * 60, // 30 ngày
        path: "/",
        sameSite: "lax",
      });
      setUser(userData);
      console.log("Auth state updated with user and token");
    } else {
      // Nếu không có một trong hai, xóa cả hai để đảm bảo trạng thái sạch
      localStorage.removeItem("user");
      deleteCookie("token", { path: "/" });
      setUser(null);
      console.log("Auth state cleared");
    }
  };

  // Hàm refresh user data từ server - đã cải tiến
  const refreshUserData = async () => {
    try {
      const token = getCookie("token");
      if (!token) {
        syncAuthState(null); // Đảm bảo xóa dữ liệu nếu không có token
        throw new Error("No token found");
      }

      const response = await api.get("/auth/me");
      if (response.data && response.data.data) {
        // Cập nhật state user
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error("Invalid user data");
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      syncAuthState(null);
      throw error;
    }
  };

  // Khởi tạo trạng thái xác thực khi component mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = getCookie("token");
      console.log("Khởi tạo auth context - token tồn tại:", !!token);

      if (!token) {
        console.log("Khởi tạo auth context - không có token, chưa xác thực");
        syncAuthState(null);
        setLoading(false);
        return;
      }

      // Luôn cố gắng lấy dữ liệu người dùng mới từ server khi có token
      try {
        console.log("Khởi tạo auth context - đang xác thực token với server");
        const response = await api.get("/auth/me");

        if (response.data && response.data.data) {
          console.log("Khởi tạo auth context - xác thực token thành công");
          setUser(response.data.data);
          localStorage.setItem("user", JSON.stringify(response.data.data));
        } else {
          console.error(
            "Khởi tạo auth context - server trả về dữ liệu người dùng không hợp lệ"
          );
          throw new Error("Dữ liệu người dùng không hợp lệ");
        }
      } catch (error) {
        console.error("Khởi tạo auth context - xác thực token thất bại", error);
        syncAuthState(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log("Login - attempting login with email:", email);
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      console.log("Login - successful, received user data:", user);

      // Đồng bộ trạng thái xác thực
      // Sử dụng cài đặt cookie nâng cao để đảm bảo hoạt động đúng
      localStorage.setItem("user", JSON.stringify(user));

      // Thiết lập cookie với đường dẫn đầy đủ
      setCookie("token", token, {
        maxAge: 30 * 24 * 60 * 60, // 30 ngày
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      setUser(user);

      // Clear any errors
      if (window.location.href.includes("error=")) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }

      console.log("Login - auth state updated successfully");

      return { user, token }; // Trả về để có thể xử lý tiếp
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Register function cải tiến
  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      console.log("Register - attempting with email:", data.email);
      const response = await api.post("/auth/register", data);
      const { token, user } = response.data;

      console.log("Register - successful, received user data:", user);

      // Đồng bộ trạng thái xác thực
      syncAuthState(user, token);

      console.log("Register - auth state updated successfully");

      // Use a longer timeout to ensure cookie processing
      return user;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function cải tiến
  const logout = async () => {
    try {
      console.log("Logout - attempting to logout");

      // Call backend logout endpoint to clear server-side cookie
      await api.get("/auth/logout");

      // Clear client-side data
      syncAuthState(null);

      console.log("Logout - cleared all auth data");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
      // Still clear client-side data even if server call fails
      syncAuthState(null);

      // Redirect to login page
      window.location.href = "/login";
    }
  };

  // Kiểm tra token cookie để xác định trạng thái xác thực chính xác
  const cookieToken = getCookie("token");
  const isAuthenticated = !!cookieToken && !!user;

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
