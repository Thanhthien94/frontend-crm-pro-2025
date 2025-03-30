import { useState, useEffect, useCallback, useRef } from "react";
import {
  userService,
  UserResponse,
  UserCreateData,
  UserUpdateData,
  InviteUserData,
} from "@/services/userService";
import { toast } from "sonner";

export interface UserBasicInfo {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: string;
}

export interface UsersState {
  users: UserBasicInfo[];
  allUsers: UserResponse[];
  roles: string[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    pageSize: number;
  };
  loading: boolean;
  error: string | null;
}

interface UseUsersFunctions {
  fetchUsers: (
    page?: number,
    filters?: Record<string, any>,
    force?: boolean
  ) => Promise<UserBasicInfo[]>;
  getUserRoles: () => Promise<string[]>;
  getUser: (id: string) => Promise<UserResponse>;
  createUser: (data: UserCreateData) => Promise<UserResponse>;
  updateUser: (id: string, data: UserUpdateData) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<boolean>;
  changeUserRole: (id: string, role: string) => Promise<UserResponse>;
  activateUser: (id: string) => Promise<UserResponse>;
  deactivateUser: (id: string) => Promise<UserResponse>;
  inviteUser: (data: InviteUserData) => Promise<any>;
  updateCurrentUser: (
    data: Partial<{ name: string; email: string }>
  ) => Promise<UserResponse>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<any>;
  getUserById: (id: string) => UserBasicInfo | null;
  changePage: (newPage: number) => void;
  applyFilters: (filters: Record<string, any>) => void;
}

export function useUsers(
  initialPage = 1,
  pageSize = 10
): UsersState & UseUsersFunctions {
  const [state, setState] = useState<UsersState>({
    users: [],
    allUsers: [],
    roles: [],
    pagination: {
      currentPage: initialPage,
      totalPages: 1,
      totalUsers: 0,
      pageSize,
    },
    loading: true,
    error: null,
  });

  // Cache để tránh fetch lại dữ liệu không cần thiết
  const userCache = useRef<Record<string, UserResponse>>({});
  const initialFetchDone = useRef<boolean>(false);
  const currentFilters = useRef<Record<string, any>>({});
  const rolesLoaded = useRef<boolean>(false);

  // Hàm để cập nhật state một cách an toàn
  const setPartialState = useCallback((newState: Partial<UsersState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  /**
   * Lấy danh sách người dùng với phân trang và bộ lọc
   */
  const fetchUsers = useCallback(
    async (
      page = state.pagination.currentPage,
      filters = {},
      force = false
    ) => {
      // Nếu đã fetch và không bắt buộc fetch lại, return sớm
      if (
        initialFetchDone.current &&
        !force &&
        state.users.length > 0 &&
        page === state.pagination.currentPage &&
        JSON.stringify(filters) === JSON.stringify(currentFilters.current)
      ) {
        return state.users;
      }

      // Lưu lại bộ lọc hiện tại
      currentFilters.current = { ...filters };

      setPartialState({ loading: true, error: null });

      try {
        const response = await userService.getUsers(page, pageSize, filters);
        const userData = response.data.data as UserResponse[];

        // Cập nhật cache
        userData.forEach((user) => {
          const userId = user._id || user.id || "";
          if (userId) {
            userCache.current[userId] = user;
          }
        });

        // Map thành format đơn giản cho dropdown, etc.
        const simpleUserData = userData.map((user) => ({
          id: user._id || (user.id as string) || "",
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        }));

        // Cập nhật state
        setPartialState({
          users: simpleUserData,
          loading: false,
          pagination: {
            ...state.pagination,
            currentPage: page,
            totalPages: response.data.pagination?.pages || 1,
            totalUsers: response.data.pagination?.total || userData.length,
          },
        });

        initialFetchDone.current = true;
        return simpleUserData;
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
        const errorMessage =
          error.response?.data?.error || "Không thể tải danh sách người dùng";
        setPartialState({ loading: false, error: errorMessage });
        toast.error("Lỗi", { description: errorMessage });
        return [];
      }
    },
    [state.pagination, pageSize, setPartialState]
  );

  /**
   * Lấy tất cả người dùng (không phân trang)
   */
  const fetchAllUsers = useCallback(
    async (force = false) => {
      // Nếu đã có dữ liệu và không bắt buộc fetch lại, return sớm
      if (state.allUsers.length > 0 && !force) {
        return state.allUsers;
      }

      setPartialState({ loading: true, error: null });

      try {
        const response = await userService.getAllUsers();
        const userData = response.data.data as UserResponse[];

        // Cập nhật cache
        const newCache: Record<string, UserResponse> = {};
        userData.forEach((user) => {
          const userId = user._id || user.id || "";
          if (userId) {
            newCache[userId] = user;
          }
        });
        userCache.current = { ...userCache.current, ...newCache };

        // Cập nhật state
        setPartialState({
          allUsers: userData,
          loading: false,
        });

        return userData;
      } catch (error: any) {
        console.error("Failed to fetch all users:", error);
        const errorMessage =
          error.response?.data?.error || "Không thể tải tất cả người dùng";
        setPartialState({ loading: false, error: errorMessage });
        toast.error("Lỗi", { description: errorMessage });
        return [];
      }
    },
    [state.allUsers, setPartialState]
  );

  /**
   * Lấy danh sách vai trò người dùng
   */
  const getUserRoles = useCallback(async () => {
    if (state.roles.length > 0 && rolesLoaded.current) {
      return state.roles;
    }

    try {
      const response = await userService.getUserRoles();
      const roles = response.data.data;

      setPartialState({ roles });
      rolesLoaded.current = true;
      return roles;
    } catch (error: any) {
      console.error("Failed to fetch user roles:", error);
      const errorMessage =
        error.response?.data?.error || "Không thể tải danh sách vai trò";
      toast.error("Lỗi", { description: errorMessage });
      return state.roles;
    }
  }, [state.roles, setPartialState]);

  /**
   * Lấy thông tin chi tiết của một user
   */
  const getUser = useCallback(async (id: string) => {
    // Kiểm tra từ cache trước
    if (userCache.current[id]) {
      return userCache.current[id];
    }

    try {
      const response = await userService.getUser(id);
      const userData = response.data.data;

      // Cập nhật cache
      userCache.current[id] = userData;

      return userData;
    } catch (error: any) {
      console.error(`Failed to fetch user with ID ${id}:`, error);
      const errorMessage =
        error.response?.data?.error || "Không thể tải thông tin người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Lấy người dùng từ state theo ID
   */
  const getUserById = useCallback(
    (id: string): UserBasicInfo | null => {
      // Tìm trong danh sách users
      const userFromList = state.users.find((user) => user.id === id);
      if (userFromList) return userFromList;

      // Tìm trong danh sách allUsers
      const userFromAll = state.allUsers.find(
        (user) => user._id === id || user.id === id
      );
      if (userFromAll) {
        return {
          id: userFromAll._id || (userFromAll.id as string) || "",
          name: userFromAll.name,
          email: userFromAll.email,
          role: userFromAll.role,
          status: userFromAll.status,
        };
      }

      // Tìm trong cache
      const userFromCache = userCache.current[id];
      if (userFromCache) {
        return {
          id: userFromCache._id || (userFromCache.id as string) || "",
          name: userFromCache.name,
          email: userFromCache.email,
          role: userFromCache.role,
          status: userFromCache.status,
        };
      }

      return null;
    },
    [state.users, state.allUsers]
  );

  /**
   * Tạo user mới
   */
  const createUser = async (data: UserCreateData) => {
    try {
      const response = await userService.createUser(data);
      const newUser = response.data.data;

      // Cập nhật cache
      const userId = newUser._id || newUser.id || "";
      if (userId) {
        userCache.current[userId] = newUser;
      }

      // Cập nhật state
      setPartialState({
        allUsers: [...state.allUsers, newUser],
      });

      // Refresh lại danh sách để cập nhật pagination
      await fetchUsers(
        state.pagination.currentPage,
        currentFilters.current,
        true
      );

      toast.success("Thành công", { description: "Đã tạo người dùng mới" });
      return newUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể tạo người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Cập nhật user
   */
  const updateUser = async (id: string, data: UserUpdateData) => {
    try {
      const response = await userService.updateUser(id, data);
      const updatedUser = response.data.data;

      // Cập nhật cache
      userCache.current[id] = updatedUser;

      // Cập nhật state
      setPartialState({
        allUsers: state.allUsers.map((user) =>
          user._id === id || user.id === id ? updatedUser : user
        ),
        users: state.users.map((user) => {
          if (user.id === id) {
            return {
              ...user,
              name: data.name || user.name,
              email: data.email || user.email,
              role: data.role || user.role,
              status: data.status || user.status,
            };
          }
          return user;
        }),
      });

      toast.success("Thành công", { description: "Đã cập nhật người dùng" });
      return updatedUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể cập nhật người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Xóa user
   */
  const deleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);

      // Xóa khỏi cache
      delete userCache.current[id];

      // Cập nhật state
      setPartialState({
        allUsers: state.allUsers.filter(
          (user) => user._id !== id && user.id !== id
        ),
        users: state.users.filter((user) => user.id !== id),
      });

      // Refresh lại danh sách để cập nhật pagination
      await fetchUsers(
        state.pagination.currentPage,
        currentFilters.current,
        true
      );

      toast.success("Thành công", { description: "Đã xóa người dùng" });
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể xóa người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Kích hoạt user
   */
  const activateUser = async (id: string) => {
    try {
      const response = await userService.activateUser(id);
      const updatedUser = response.data.data;

      // Cập nhật cache
      userCache.current[id] = updatedUser;

      // Cập nhật state
      setPartialState({
        allUsers: state.allUsers.map((user) =>
          user._id === id || user.id === id ? updatedUser : user
        ),
        users: state.users.map((user) => {
          if (user.id === id) {
            return {
              ...user,
              status: "active",
            };
          }
          return user;
        }),
      });

      toast.success("Thành công", { description: "Đã kích hoạt người dùng" });
      return updatedUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể kích hoạt người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Vô hiệu hóa user
   */
  const deactivateUser = async (id: string) => {
    try {
      const response = await userService.deactivateUser(id);
      const updatedUser = response.data.data;

      // Cập nhật cache
      userCache.current[id] = updatedUser;

      // Cập nhật state
      setPartialState({
        allUsers: state.allUsers.map((user) =>
          user._id === id || user.id === id ? updatedUser : user
        ),
        users: state.users.map((user) => {
          if (user.id === id) {
            return {
              ...user,
              status: "inactive",
            };
          }
          return user;
        }),
      });

      toast.success("Thành công", { description: "Đã vô hiệu hóa người dùng" });
      return updatedUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể vô hiệu hóa người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Thay đổi vai trò người dùng
   */
  const changeUserRole = async (id: string, role: string) => {
    try {
      const response = await userService.changeUserRole(id, role);
      const updatedUser = response.data.data;

      // Cập nhật cache
      userCache.current[id] = updatedUser;

      // Cập nhật state
      setPartialState({
        allUsers: state.allUsers.map((user) =>
          user._id === id || user.id === id ? updatedUser : user
        ),
        users: state.users.map((user) => {
          if (user.id === id) {
            return { ...user, role };
          }
          return user;
        }),
      });

      toast.success("Thành công", {
        description: "Đã thay đổi vai trò người dùng",
      });
      return updatedUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể thay đổi vai trò người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Mời người dùng mới
   */
  const inviteUser = async (data: InviteUserData) => {
    try {
      const response = await userService.inviteUser(data);
      toast.success("Thành công", {
        description: "Đã gửi lời mời cho người dùng",
      });

      // Refresh lại danh sách để cập nhật
      await fetchUsers(
        state.pagination.currentPage,
        currentFilters.current,
        true
      );

      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể gửi lời mời cho người dùng";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Cập nhật thông tin người dùng hiện tại
   */
  const updateCurrentUser = async (
    data: Partial<{ name: string; email: string }>
  ) => {
    try {
      const response = await userService.updateCurrentUser(data);
      const updatedUser = response.data.data;

      toast.success("Thành công", {
        description: "Đã cập nhật thông tin của bạn",
      });
      return updatedUser;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể cập nhật thông tin";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Cập nhật mật khẩu người dùng hiện tại
   */
  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await userService.updatePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Thành công", { description: "Đã cập nhật mật khẩu" });
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Không thể cập nhật mật khẩu";
      toast.error("Lỗi", { description: errorMessage });
      throw error;
    }
  };

  /**
   * Chuyển đến trang khác
   */
  const changePage = useCallback(
    (newPage: number) => {
      fetchUsers(newPage, currentFilters.current);
    },
    [fetchUsers]
  );

  /**
   * Áp dụng bộ lọc mới
   */
  const applyFilters = useCallback(
    (filters: Record<string, any>) => {
      fetchUsers(1, filters);
    },
    [fetchUsers]
  );

  // Tải dữ liệu ban đầu
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchUsers(initialPage);
      getUserRoles();
    }
  }, [initialPage, fetchUsers, getUserRoles]);

  return {
    // State
    users: state.users,
    allUsers: state.allUsers,
    roles: state.roles,
    pagination: state.pagination,
    loading: state.loading,
    error: state.error,

    // Phương thức
    fetchUsers,
    getUserRoles,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    changeUserRole,
    activateUser,
    deactivateUser,
    inviteUser,
    updateCurrentUser,
    updatePassword,
    getUserById,
    changePage,
    applyFilters,
  };
}
