import api from "@/lib/api";
import { CustomerFormData } from "@/types/customer";

export const customerService = {
  /**
   * Lấy danh sách khách hàng với phân trang và bộ lọc
   * @param page Trang hiện tại
   * @param limit Số lượng khách hàng trên mỗi trang
   * @param filters Các bộ lọc (search, type, status, ...)
   * @returns Promise với dữ liệu khách hàng
   */
  getCustomers: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return api.get(`/customers?${queryParams}`);
  },

  /**
   * Lấy thông tin chi tiết của một khách hàng
   * @param id ID của khách hàng
   * @returns Promise với dữ liệu chi tiết khách hàng
   */
  getCustomer: async (id: string) => {
    return api.get(`/customers/${id}`);
  },

  /**
   * Tạo khách hàng mới
   * @param customerData Dữ liệu khách hàng mới
   * @returns Promise với dữ liệu khách hàng đã tạo
   */
  createCustomer: async (customerData: CustomerFormData) => {
    return api.post("/customers", customerData);
  },

  /**
   * Cập nhật thông tin khách hàng
   * @param id ID của khách hàng
   * @param customerData Dữ liệu cần cập nhật
   * @returns Promise với dữ liệu khách hàng đã cập nhật
   */
  updateCustomer: async (
    id: string,
    customerData: Partial<CustomerFormData>
  ) => {
    return api.patch(`/customers/${id}`, customerData);
  },

  /**
   * Xóa khách hàng
   * @param id ID của khách hàng
   * @returns Promise với kết quả xóa
   */
  deleteCustomer: async (id: string) => {
    return api.delete(`/customers/${id}`);
  },

  /**
   * Lấy khách hàng theo loại
   * @param type Loại khách hàng (lead, prospect, customer, churned)
   * @returns Promise với danh sách khách hàng theo loại
   */
  getCustomersByType: async (type: string) => {
    return api.get(`/customers/by-type/${type}`);
  },

  /**
   * Lấy danh sách khách hàng được gán cho người dùng hiện tại
   * @returns Promise với danh sách khách hàng được gán
   */
  getAssignedCustomers: async () => {
    return api.get("/customers/assigned-to/me");
  },

  /**
   * Gán khách hàng cho người dùng
   * @param id ID của khách hàng
   * @param userId ID của người dùng được gán
   * @returns Promise với kết quả gán
   */
  assignCustomer: async (id: string, userId: string) => {
    return api.patch(`/customers/${id}/assign`, { assignedTo: userId });
  },

  /**
   * Lấy thống kê khách hàng theo loại
   * @returns Promise với dữ liệu thống kê
   */
  getCustomerStatsByType: async () => {
    return api.get("/customers/stats/by-type");
  },

  /**
   * Lấy lịch sử hoạt động của khách hàng
   * @param id ID của khách hàng
   * @returns Promise với lịch sử hoạt động
   */
  getCustomerActivities: async (id: string) => {
    return api.get(`/customers/${id}/activities`);
  },

  /**
   * Lấy giao dịch của khách hàng
   * @param id ID của khách hàng
   * @returns Promise với danh sách giao dịch
   */
  getCustomerDeals: async (id: string) => {
    return api.get(`/deals?customerId=${id}`);
  },

  /**
   * Lấy công việc liên quan đến khách hàng
   * @param id ID của khách hàng
   * @returns Promise với danh sách công việc
   */
  getCustomerTasks: async (id: string) => {
    return api.get(`/tasks?relatedToModel=Customer&relatedToId=${id}`);
  },

  /**
   * Thêm ghi chú cho khách hàng
   * @param id ID của khách hàng
   * @param note Nội dung ghi chú
   * @returns Promise với kết quả thêm ghi chú
   */
  addCustomerNote: async (id: string, note: string) => {
    return api.post(`/customers/${id}/notes`, { note });
  },

  /**
   * Lấy ghi chú của khách hàng
   * @param id ID của khách hàng
   * @returns Promise với danh sách ghi chú
   */
  getCustomerNotes: async (id: string) => {
    return api.get(`/customers/${id}/notes`);
  },

  /**
   * Tìm kiếm khách hàng
   * @param query Từ khóa tìm kiếm
   * @returns Promise với kết quả tìm kiếm
   */
  searchCustomers: async (query: string) => {
    return api.get(`/customers/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Xuất danh sách khách hàng
   * @param format Định dạng xuất (csv, excel)
   * @param filters Các bộ lọc cho danh sách xuất
   * @returns Promise với URL tải xuống
   */
  exportCustomers: async (format: "csv" | "excel", filters = {}) => {
    const queryParams = new URLSearchParams({
      format,
      ...filters,
    });
    return api.get(`/export/customers?${queryParams}`);
  },

  /**
   * Nhập danh sách khách hàng
   * @param file File dữ liệu khách hàng
   * @returns Promise với kết quả nhập
   */
  importCustomers: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/import/customers", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
