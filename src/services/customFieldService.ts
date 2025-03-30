import api from "@/lib/api";

export const customFieldService = {
  // Lấy danh sách custom fields
  getCustomFields: async () => {
    return api.get("/custom-fields");
  },

  // Lấy custom fields theo entity
  getCustomFieldsByEntity: async (entity: string) => {
    return api.get(`/custom-fields/entity/${entity}`);
  },

  // Tạo custom field mới
  createCustomField: async (data: any) => {
    return api.post("/custom-fields", data);
  },

  // Cập nhật custom field
  updateCustomField: async (id: string, data: any) => {
    return api.patch(`/custom-fields/${id}`, data);
  },

  // Xóa custom field
  deleteCustomField: async (id: string) => {
    return api.delete(`/custom-fields/${id}`);
  },

  // Kiểm tra giá trị custom field
  validateCustomField: async (data: any) => {
    return api.post("/custom-fields/validate", data);
  },
};
