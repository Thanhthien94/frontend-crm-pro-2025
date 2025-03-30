import api from "@/lib/api";
import { CustomerFormData } from "@/types/customer";

export const customerService = {
  // Lấy danh sách customers với filter
  getCustomers: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return api.get(`/customers?${queryParams}`);
  },

  // Lấy chi tiết customer
  getCustomer: async (id: string) => {
    return api.get(`/customers/${id}`);
  },

  // Tạo customer mới
  createCustomer: async (customerData: CustomerFormData) => {
    return api.post("/customers", customerData);
  },

  // Cập nhật customer
  updateCustomer: async (
    id: string,
    customerData: Partial<CustomerFormData>
  ) => {
    return api.patch(`/customers/${id}`, customerData);
  },

  // Xóa customer
  deleteCustomer: async (id: string) => {
    return api.delete(`/customers/${id}`);
  },

  // Lấy customers theo loại
  getCustomersByType: async (type: string) => {
    return api.get(`/customers/by-type/${type}`);
  },

  // Lấy customers được gán cho user hiện tại
  getAssignedCustomers: async () => {
    return api.get("/customers/assigned-to/me");
  },

  // Gán customer cho user
  assignCustomer: async (id: string, userId: string) => {
    return api.patch(`/customers/${id}/assign`, { assignedTo: userId });
  },

  // Thống kê customers theo loại
  getCustomerStatsByType: async () => {
    return api.get("/customers/stats/by-type");
  },
};
