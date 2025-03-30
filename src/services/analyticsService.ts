import api from "@/lib/api";

export const analyticsService = {
  // Lấy dữ liệu dashboard
  getDashboard: async () => {
    return api.get("/analytics/dashboard");
  },

  // Lấy dữ liệu phân tích doanh số
  getSalesAnalytics: async (
    timeframe = "monthly",
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams();
    if (timeframe) params.append("timeframe", timeframe);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return api.get(`/analytics/sales?${params}`);
  },

  // Lấy dữ liệu phân tích khách hàng
  getCustomerAnalytics: async (params = {}) => {
    return api.get("/analytics/customers", { params });
  },

  // Lấy dữ liệu phân tích hoạt động
  getActivityAnalytics: async (params = {}) => {
    return api.get("/analytics/activities", { params });
  },

  // Lấy dữ liệu phân tích hiệu suất
  getPerformanceAnalytics: async (params = {}) => {
    return api.get("/analytics/performance", { params });
  },
};
