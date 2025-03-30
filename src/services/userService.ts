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
  organization?: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  organization?: string;
}

export interface InviteUserData {
  email: string;
  role?: string;
  name?: string;
}

export interface AcceptInvitationData {
  password: string;
  name?: string;
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
    return api.get('/users?limit=100');
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
    return api.get(`/users/me`);
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
   * Cập nhật thông tin người dùng hiện tại
   * @param userData Dữ liệu cần cập nhật
   * @returns Promise với dữ liệu người dùng đã cập nhật
   */
  updateCurrentUser: async (userData: Partial<{ name: string; email: string }>) => {
    return api.put(`/users/profile`, userData);
  },

  /**
   * Cập nhật mật khẩu người dùng hiện tại
   * @param passwords Mật khẩu hiện tại và mới
   * @returns Promise với kết quả cập nhật
   */
  updatePassword: async (passwords: PasswordUpdateData) => {
    return api.put(`/users/updatepassword`, passwords);
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
   * Vô hiệu hóa người dùng
   * @param id ID của người dùng
   * @returns Promise với kết quả vô hiệu hóa
   */
  deactivateUser: async (id: string) => {
    return api.patch(`/users/${id}/deactivate`);
  },

  /**
   * Kích hoạt người dùng
   * @param id ID của người dùng
   * @returns Promise với kết quả kích hoạt
   */
  activateUser: async (id: string) => {
    return api.patch(`/users/${id}/activate`);
  },

  /**
   * Thay đổi vai trò người dùng
   * @param id ID của người dùng
   * @param role Vai trò mới
   * @returns Promise với kết quả thay đổi vai trò
   */
  changeUserRole: async (id: string, role: string) => {
    return api.patch(`/users/${id}/role`, { role });
  },

  /**
   * Lấy danh sách vai trò có thể gán
   * @returns Promise với danh sách vai trò
   */
  getUserRoles: async () => {
    return api.get(`/users/roles`);
  },

  /**
   * Mời người dùng tham gia tổ chức
   * @param data Thông tin mời
   * @returns Promise với kết quả mời
   */
  inviteUser: async (data: InviteUserData) => {
    return api.post(`/users/invite`, data);
  },

  /**
   * Chấp nhận lời mời tham gia tổ chức
   * @param token Token mời
   * @param data Thông tin chấp nhận
   * @returns Promise với kết quả chấp nhận
   */
  acceptInvitation: async (token: string, data: AcceptInvitationData) => {
    return api.post(`/users/accept-invitation/${token}`, data);
  },
};