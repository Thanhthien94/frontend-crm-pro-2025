import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng để gửi cookie cùng các request
});

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Thêm một số thông tin debug
    config.headers["X-Client-Time"] = new Date().toISOString();
    return config;
  },
  (error) => {
    console.error("[API] Lỗi trong request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor cho response để xử lý lỗi xác thực
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Chỉ xử lý khi có lỗi 401 và đang ở client side
    if (error.response?.status === 401 && typeof window !== "undefined") {
      console.log("[API] Nhận lỗi 401 - phiên đăng nhập hết hạn");
      localStorage.removeItem("user");
      localStorage.setItem("auth_error", "session_expired");
    }
    return Promise.reject(error);
  }
);

export default api;
