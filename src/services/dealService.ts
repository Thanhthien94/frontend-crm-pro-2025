import api from "@/lib/api";
import { DealFormData } from "@/types/deal";

export const dealService = {
  /**
   * Lấy danh sách thương vụ với phân trang và bộ lọc
   * @param page Trang hiện tại
   * @param limit Số lượng thương vụ trên mỗi trang
   * @param filters Các bộ lọc (search, stage, status, ...)
   * @returns Promise với dữ liệu thương vụ
   */
  getDeals: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return api.get(`/deals?${queryParams}`);
  },

  /**
   * Lấy thông tin chi tiết của một thương vụ
   * @param id ID của thương vụ
   * @returns Promise với dữ liệu chi tiết thương vụ
   */
  getDeal: async (id: string) => {
    return api.get(`/deals/${id}`);
  },

  /**
   * Tạo thương vụ mới
   * @param dealData Dữ liệu thương vụ mới
   * @returns Promise với dữ liệu thương vụ đã tạo
   */
  createDeal: async (dealData: DealFormData) => {
    return api.post("/deals", dealData);
  },

  /**
   * Cập nhật thông tin thương vụ
   * @param id ID của thương vụ
   * @param dealData Dữ liệu cần cập nhật
   * @returns Promise với dữ liệu thương vụ đã cập nhật
   */
  updateDeal: async (id: string, dealData: Partial<DealFormData>) => {
    return api.patch(`/deals/${id}`, dealData);
  },

  /**
   * Xóa thương vụ
   * @param id ID của thương vụ
   * @returns Promise với kết quả xóa
   */
  deleteDeal: async (id: string) => {
    return api.delete(`/deals/${id}`);
  },

  /**
   * Lấy tổng hợp thông tin thương vụ
   * @returns Promise với dữ liệu tổng hợp
   */
  getDealSummary: async () => {
    return api.get("/deals/summary");
  },

  /**
   * Thay đổi giai đoạn của thương vụ
   * @param id ID của thương vụ
   * @param stage Giai đoạn mới
   * @returns Promise với dữ liệu thương vụ đã cập nhật
   */
  changeDealStage: async (id: string, stage: string) => {
    return api.patch(`/deals/${id}`, { stage });
  },

  /**
   * Lấy thương vụ theo khách hàng
   * @param customerId ID của khách hàng
   * @returns Promise với danh sách thương vụ
   */
  getDealsByCustomer: async (customerId: string) => {
    return api.get(`/deals?customerId=${customerId}`);
  },

  /**
   * Lấy thương vụ theo người phụ trách
   * @param assigneeId ID của người phụ trách
   * @returns Promise với danh sách thương vụ
   */
  getDealsByAssignee: async (assigneeId: string) => {
    return api.get(`/deals?assignedTo=${assigneeId}`);
  },

  /**
   * Lấy hoạt động của thương vụ
   * @param id ID của thương vụ
   * @returns Promise với danh sách hoạt động
   */
  getDealActivities: async (id: string) => {
    return api.get(`/deals/${id}/activities`);
  },

  /**
   * Lấy công việc liên quan đến thương vụ
   * @param id ID của thương vụ
   * @returns Promise với danh sách công việc
   */
  getDealTasks: async (id: string) => {
    return api.get(`/tasks?relatedToModel=Deal&relatedToId=${id}`);
  },

  /**
   * Thêm ghi chú cho thương vụ
   * @param id ID của thương vụ
   * @param note Nội dung ghi chú
   * @returns Promise với kết quả thêm ghi chú
   */
  addDealNote: async (id: string, note: string) => {
    return api.post(`/deals/${id}/notes`, { note });
  },

  /**
   * Lấy ghi chú của thương vụ
   * @param id ID của thương vụ
   * @returns Promise với danh sách ghi chú
   */
  getDealNotes: async (id: string) => {
    return api.get(`/deals/${id}/notes`);
  },

  /**
   * Thêm sản phẩm vào thương vụ
   * @param id ID của thương vụ
   * @param productData Dữ liệu sản phẩm cần thêm
   * @returns Promise với dữ liệu thương vụ đã cập nhật
   */
  addProductToDeal: async (
    id: string,
    productData: {
      productId: string;
      quantity: number;
      price?: number;
    }
  ) => {
    return api.post(`/deals/${id}/products`, productData);
  },

  /**
   * Xóa sản phẩm khỏi thương vụ
   * @param dealId ID của thương vụ
   * @param productId ID của sản phẩm
   * @returns Promise với kết quả xóa
   */
  removeProductFromDeal: async (dealId: string, productId: string) => {
    return api.delete(`/deals/${dealId}/products/${productId}`);
  },

  /**
   * Cập nhật giá trị thương vụ dựa trên sản phẩm
   * @param id ID của thương vụ
   * @returns Promise với dữ liệu thương vụ đã cập nhật
   */
  recalculateDealValue: async (id: string) => {
    return api.post(`/deals/${id}/recalculate`);
  },

  /**
   * Đóng thương vụ (thành công hoặc thất bại)
   * @param id ID của thương vụ
   * @param status Trạng thái đóng ('won' hoặc 'lost')
   * @param reason Lý do đóng thương vụ
   * @returns Promise với dữ liệu thương vụ đã cập nhật
   */
  closeDeal: async (id: string, status: "won" | "lost", reason?: string) => {
    const stage = status === "won" ? "closed-won" : "closed-lost";
    return api.patch(`/deals/${id}`, {
      stage,
      closureReason: reason,
    });
  },

  /**
   * Sao chép thương vụ hiện tại
   * @param id ID của thương vụ cần sao chép
   * @returns Promise với dữ liệu thương vụ mới
   */
  duplicateDeal: async (id: string) => {
    return api.post(`/deals/${id}/duplicate`);
  },

  /**
   * Tìm kiếm thương vụ
   * @param query Từ khóa tìm kiếm
   * @returns Promise với kết quả tìm kiếm
   */
  searchDeals: async (query: string) => {
    return api.get(`/deals/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Xuất danh sách thương vụ
   * @param format Định dạng xuất (csv, excel)
   * @param filters Các bộ lọc cho danh sách xuất
   * @returns Promise với URL tải xuống
   */
  exportDeals: async (format: "csv" | "excel", filters = {}) => {
    const queryParams = new URLSearchParams({
      format,
      ...filters,
    });
    return api.get(`/export/deals?${queryParams}`);
  },

  /**
   * Nhập danh sách thương vụ
   * @param file File dữ liệu thương vụ
   * @returns Promise với kết quả nhập
   */
  importDeals: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/import/deals", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
