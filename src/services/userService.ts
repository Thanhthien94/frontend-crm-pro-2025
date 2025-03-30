import api from "@/lib/api";

export interface UserResponse {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
  organization?: {
    _id: string;
    id?: string;
    name: string;
    plan?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  /**
   * Lấy danh sách người dùng với phân trang và bộ lọc
   * @param page Trang hiện tại
   * @param limit Số lượng người dùng trên mỗi trang
   * @param filters Các bộ lọc (search, role, status, ...)
   * @returns Promise với dữ liệu người dùng
   */
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return api.get(`/users?${queryParams}`);
  },

  /**
   * Lấy tất cả người dùng không phân trang
   * @returns Promise với tất cả dữ liệu người dùng
   */
  getAllUsers: async () => {
    return api.get("/users?limit=100");
  },

  /**
   * Lấy thông tin chi tiết của một người dùng
   * @param id ID của người dùng
   * @returns Promise với dữ liệu chi tiết người dùng
   */
  getUser: async (id: string) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Lấy thông tin người dùng hiện tại
   * @returns Promise với dữ liệu người dùng hiện tại
   */
  getCurrentUser: async () => {
    return api.get(`/auth/me`);
  },

  /**
   * Tạo người dùng mới
   * @param userData Dữ liệu người dùng mới
   * @returns Promise với dữ liệu người dùng đã tạo
   */
  createUser: async (userData: UserCreateData) => {
    return api.post("/users", userData);
  },

  /**
   * Cập nhật thông tin người dùng
   * @param id ID của người dùng
   * @param userData Dữ liệu cần cập nhật
   * @returns Promise với dữ liệu người dùng đã cập nhật
   */
  updateUser: async (id: string, userData: UserUpdateData) => {
    return api.put(`/users/${id}`, userData);
  },

  /**
   * Xóa người dùng
   * @param id ID của người dùng
   * @returns Promise với kết quả xóa
   */
  deleteUser: async (id: string) => {
    return api.delete(`/users/${id}`);
  },

  /**
   * Lấy danh sách quyền
   * @returns Promise với danh sách quyền
   */
  getPermissionsList: async () => {
    return api.get(`/permissions/list`);
  },

  /**
   * Lấy danh sách vai trò
   * @returns Promise với danh sách vai trò
   */
  getUserRoles: async () => {
    return api.get(`/permissions/roles`);
  },

  /**
   * Tạo vai trò mới
   * @param roleData Dữ liệu vai trò mới
   * @returns Promise với dữ liệu vai trò đã tạo
   */
  createRole: async (roleData: {
    name: string;
    slug: string;
    permissions: string[];
    description?: string;
    isDefault?: boolean;
  }) => {
    return api.post(`/permissions/roles`, roleData);
  },

  /**
   * Cập nhật vai trò
   * @param id ID của vai trò
   * @param roleData Dữ liệu cần cập nhật
   * @returns Promise với dữ liệu vai trò đã cập nhật
   */
  updateRole: async (
    id: string,
    roleData: {
      name?: string;
      permissions?: string[];
      description?: string;
      isDefault?: boolean;
    }
  ) => {
    return api.patch(`/permissions/roles/${id}`, roleData);
  },

  /**
   * Xóa vai trò
   * @param id ID của vai trò
   * @returns Promise với kết quả xóa
   */
  deleteRole: async (id: string) => {
    return api.delete(`/permissions/roles/${id}`);
  },

  /**
   * Gán vai trò cho người dùng
   * @param roleId ID của vai trò
   * @param userId ID của người dùng
   * @returns Promise với kết quả gán
   */
  assignRoleToUser: async (roleId: string, userId: string) => {
    return api.post(`/permissions/roles/${roleId}/assign`, {
      userId,
    });
  },

  /**
   * Thu hồi vai trò từ người dùng
   * @param roleId ID của vai trò
   * @param userId ID của người dùng
   * @returns Promise với kết quả thu hồi
   */
  revokeRoleFromUser: async (roleId: string, userId: string) => {
    return api.post(`/permissions/roles/${roleId}/revoke`, {
      userId,
    });
  },

  /**
   * Yêu cầu đặt lại mật khẩu
   * @param email Email của người dùng
   * @returns Promise với kết quả yêu cầu
   */
  forgotPassword: async (email: string) => {
    return api.post(`/auth/forgot-password`, { email });
  },

  /**
   * Đặt lại mật khẩu
   * @param token Token đặt lại mật khẩu
   * @param password Mật khẩu mới
   * @returns Promise với kết quả đặt lại
   */
  resetPassword: async (token: string, password: string) => {
    return api.post(`/auth/reset-password`, { token, password });
  },
};
