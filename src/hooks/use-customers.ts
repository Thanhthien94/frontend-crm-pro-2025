import { useState, useEffect, useCallback, useRef } from "react";
import { Customer, CustomerFormData } from "@/types/customer";
import { customerService } from "@/services/customerService";
import { toast } from "sonner";

interface UseCustomersProps {
  initialPage?: number;
  pageSize?: number;
}

export function useCustomers({
  initialPage = 1,
  pageSize = 10,
}: UseCustomersProps = {}) {
  // State management
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Lưu cache customers để tránh fetch lại dữ liệu không cần thiết
  const [customerCache, setCustomerCache] = useState<Record<string, Customer>>(
    {}
  );

  // Sử dụng refs để tránh re-renders không cần thiết
  const initialFetchDone = useRef(false);
  const currentFiltersRef = useRef<Record<string, any>>({});

  /**
   * Fetch danh sách khách hàng với phân trang và bộ lọc
   */
  const fetchCustomers = useCallback(
    async (currentPage: number = 1, filters: Record<string, any> = {}) => {
      // Lưu lại bộ lọc hiện tại để sử dụng sau này
      currentFiltersRef.current = filters;

      // Đặt trạng thái loading và xóa lỗi cũ
      setLoading(true);
      setError(null);

      try {
        // Gọi API để lấy danh sách khách hàng
        const response = await customerService.getCustomers(
          currentPage,
          pageSize,
          filters
        );

        const fetchedCustomers = response.data.data;

        // Cập nhật cache với dữ liệu mới
        const newCache = { ...customerCache };
        fetchedCustomers.forEach((customer: Customer) => {
          newCache[customer._id] = customer;
        });
        setCustomerCache(newCache);

        // Cập nhật state
        setCustomers(fetchedCustomers);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
          setTotalCustomers(response.data.pagination.total);
        } else {
          // Fallback nếu API không trả về thông tin phân trang
          setTotalPages(Math.ceil(fetchedCustomers.length / pageSize));
          setTotalCustomers(fetchedCustomers.length);
        }

        // Cập nhật trang hiện tại
        setPage(currentPage);
      } catch (err: any) {
        // Xử lý lỗi
        const errorMessage =
          err.response?.data?.error || "Không thể tải danh sách khách hàng";
        setError(errorMessage);
        toast.error("Lỗi", {
          description: errorMessage,
        });
      } finally {
        // Hủy trạng thái loading
        setLoading(false);
      }
    },
    [pageSize, customerCache]
  );

  /**
   * Fetch thông tin chi tiết của một khách hàng theo ID
   */
  const getCustomer = useCallback(
    async (id: string) => {
      // Kiểm tra nếu khách hàng đã có trong cache
      if (customerCache[id]) {
        return customerCache[id];
      }

      try {
        // Gọi API để lấy chi tiết khách hàng
        const response = await customerService.getCustomer(id);
        const customer = response.data.data;

        // Cập nhật cache với khách hàng mới
        setCustomerCache((prev) => ({
          ...prev,
          [id]: customer,
        }));

        return customer;
      } catch (err: any) {
        // Xử lý lỗi
        const errorMessage =
          err.response?.data?.error || "Không thể tải thông tin khách hàng";
        toast.error("Lỗi", {
          description: errorMessage,
        });
        throw err;
      }
    },
    [customerCache]
  );

  /**
   * Tạo khách hàng mới
   */
  const createCustomer = async (data: CustomerFormData) => {
    try {
      // Gọi API để tạo khách hàng mới
      const response = await customerService.createCustomer(data);
      const newCustomer = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã tạo khách hàng mới",
      });

      // Cập nhật cache với khách hàng mới
      setCustomerCache((prev) => ({
        ...prev,
        [newCustomer._id]: newCustomer,
      }));

      return newCustomer;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tạo khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Cập nhật thông tin khách hàng
   */
  const updateCustomer = async (
    id: string,
    data: Partial<CustomerFormData>
  ) => {
    try {
      // Gọi API để cập nhật khách hàng
      const response = await customerService.updateCustomer(id, data);
      const updatedCustomer = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã cập nhật thông tin khách hàng",
      });

      // Cập nhật cache với khách hàng đã được cập nhật
      setCustomerCache((prev) => ({
        ...prev,
        [id]: updatedCustomer,
      }));

      return updatedCustomer;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Gán khách hàng cho nhân viên
   */
  const assignCustomer = async (id: string, assignedTo: string) => {
    try {
      // Gọi API để gán khách hàng cho nhân viên
      const response = await customerService.assignCustomer(id, assignedTo);
      const updatedCustomer = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã gán khách hàng cho người dùng",
      });

      // Cập nhật cache với khách hàng đã được cập nhật
      setCustomerCache((prev) => ({
        ...prev,
        [id]: updatedCustomer,
      }));

      return updatedCustomer;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể gán khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Xóa khách hàng
   */
  const deleteCustomer = async (id: string) => {
    try {
      // Gọi API để xóa khách hàng
      await customerService.deleteCustomer(id);

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã xóa khách hàng",
      });

      // Xóa khách hàng khỏi cache
      setCustomerCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      return true;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể xóa khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Lấy khách hàng theo loại
   */
  const getCustomersByType = async (type: string) => {
    try {
      // Gọi API để lấy khách hàng theo loại
      const response = await customerService.getCustomersByType(type);

      // Cập nhật cache với khách hàng mới
      const fetchedCustomers = response.data.data;
      const newCache = { ...customerCache };
      fetchedCustomers.forEach((customer: Customer) => {
        newCache[customer._id] = customer;
      });
      setCustomerCache(newCache);

      return fetchedCustomers;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || `Không thể tải khách hàng loại ${type}`;
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Lấy thống kê khách hàng theo loại
   */
  const getCustomerStatsByType = async () => {
    try {
      // Gọi API để lấy thống kê khách hàng theo loại
      const response = await customerService.getCustomerStatsByType();
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải thống kê khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Lấy khách hàng được gán cho người dùng hiện tại
   */
  const getMyCustomers = async () => {
    try {
      // Gọi API để lấy khách hàng được gán cho người dùng hiện tại
      const response = await customerService.getAssignedCustomers();

      // Cập nhật cache với khách hàng mới
      const fetchedCustomers = response.data.data;
      const newCache = { ...customerCache };
      fetchedCustomers.forEach((customer: Customer) => {
        newCache[customer._id] = customer;
      });
      setCustomerCache(newCache);

      return fetchedCustomers;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải khách hàng được gán";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Thay đổi trạng thái khách hàng
   */
  const changeCustomerStatus = async (
    id: string,
    status: "active" | "inactive"
  ) => {
    try {
      // Gọi API để cập nhật trạng thái khách hàng
      const response = await customerService.updateCustomer(id, { status });
      const updatedCustomer = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: `Đã cập nhật trạng thái thành ${
          status === "active" ? "Hoạt động" : "Không hoạt động"
        }`,
      });

      // Cập nhật cache với khách hàng đã được cập nhật trạng thái
      setCustomerCache((prev) => ({
        ...prev,
        [id]: updatedCustomer,
      }));

      return updatedCustomer;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật trạng thái khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Thay đổi loại khách hàng
   */
  const changeCustomerType = async (
    id: string,
    type: "lead" | "prospect" | "customer" | "churned"
  ) => {
    try {
      // Gọi API để cập nhật loại khách hàng
      const response = await customerService.updateCustomer(id, { type });
      const updatedCustomer = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: `Đã cập nhật loại thành ${type}`,
      });

      // Cập nhật cache với khách hàng đã được cập nhật loại
      setCustomerCache((prev) => ({
        ...prev,
        [id]: updatedCustomer,
      }));

      return updatedCustomer;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật loại khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Thay đổi trang hiện tại và fetch lại dữ liệu
   */
  const changePage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchCustomers(newPage, currentFiltersRef.current);
    },
    [fetchCustomers]
  );

  /**
   * Effect để fetch dữ liệu ban đầu một lần khi component mount
   */
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchCustomers(initialPage);
      initialFetchDone.current = true;
    }
  }, [initialPage, fetchCustomers]);

  // Trả về các state và methods
  return {
    // States
    customers,
    loading,
    error,
    page,
    totalPages,
    totalCustomers,

    // Basic CRUD methods
    fetchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Customer specific actions
    assignCustomer,
    changeCustomerStatus,
    changeCustomerType,

    // Additional methods
    getCustomersByType,
    getCustomerStatsByType,
    getMyCustomers,

    // Pagination
    changePage,
  };
}
