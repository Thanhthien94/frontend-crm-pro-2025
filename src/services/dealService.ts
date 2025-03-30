import api from "@/lib/api";
import { DealFormData } from "@/types/deal";

export const dealService = {
  // Lấy danh sách deals với các filter
  getDeals: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return api.get(`/deals?${queryParams}`);
  },

  // Lấy chi tiết deal
  getDeal: async (id: string) => {
    return api.get(`/deals/${id}`);
  },

  // Tạo deal mới
  createDeal: async (dealData: DealFormData) => {
    // Không cần map vì frontend đã sử dụng cùng cấu trúc với backend
    return api.post("/deals", dealData);
  },

  // Cập nhật deal
  updateDeal: async (id: string, dealData: Partial<DealFormData>) => {
    // Không cần map vì frontend đã sử dụng cùng cấu trúc với backend
    return api.patch(`/deals/${id}`, dealData);
  },

  // Xóa deal
  deleteDeal: async (id: string) => {
    return api.delete(`/deals/${id}`);
  },

  // Lấy tổng hợp deal
  getDealSummary: async () => {
    return api.get("/deals/summary");
  },

  // Thay đổi stage cho deal
  changeDealStage: async (id: string, stage: string) => {
    return api.patch(`/deals/${id}`, { stage });
  },

  // Lấy deals theo khách hàng
  getDealsByCustomer: async (customerId: string) => {
    return api.get(`/deals?customerId=${customerId}`);
  },

  // Lấy deals theo người phụ trách
  getDealsByAssignee: async (assigneeId: string) => {
    return api.get(`/deals?assignedTo=${assigneeId}`);
  },
};
