// src/hooks/use-customers.ts
import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { Customer, CustomerFormData } from "@/types/customer";
import { toast } from "sonner";

interface UseCustomersProps {
  initialPage?: number;
  pageSize?: number;
}

export function useCustomers({
  initialPage = 1,
  pageSize = 10,
}: UseCustomersProps = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customerCache, setCustomerCache] = useState<Record<string, Customer>>(
    {}
  );

  // Refs để tracking và tránh re-renders không cần thiết
  const initialFetchDone = useRef(false);
  const currentFiltersRef = useRef<Record<string, any>>({});

  const fetchCustomers = useCallback(
    async (currentPage: number = 1, filters: Record<string, any> = {}) => {
      // Lưu lại filters hiện tại
      currentFiltersRef.current = filters;

      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
          ...filters,
        });

        const response = await api.get(`/api/v1/customers?${queryParams}`);

        // Cập nhật cache
        const fetchedCustomers = response.data.data;
        const newCache = { ...customerCache };
        fetchedCustomers.forEach((customer: Customer) => {
          newCache[customer._id] = customer;
        });
        setCustomerCache(newCache);

        setCustomers(fetchedCustomers);
        setTotalPages(response.data.pagination.pages);
        setTotalCustomers(response.data.pagination.total);
        setPage(currentPage);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Không thể tải danh sách khách hàng"
        );
        toast.error("Lỗi", {
          description:
            err.response?.data?.error || "Không thể tải danh sách khách hàng",
        });
      } finally {
        setLoading(false);
      }
    },
    [pageSize, customerCache]
  );

  const getCustomer = useCallback(
    async (id: string) => {
      // Kiểm tra nếu đã có trong cache
      if (customerCache[id]) {
        return customerCache[id];
      }

      try {
        const response = await api.get(`/api/v1/customers/${id}`);

        // Cập nhật cache
        const customer = response.data.data;
        setCustomerCache((prev) => ({
          ...prev,
          [id]: customer,
        }));

        return customer;
      } catch (err: any) {
        toast.error("Lỗi", {
          description:
            err.response?.data?.error || "Không thể tải thông tin khách hàng",
        });
        throw err;
      }
    },
    [customerCache]
  );

  const createCustomer = async (data: CustomerFormData) => {
    try {
      const response = await api.post("/api/v1/customers", data);

      // Cập nhật cache với customer mới
      const newCustomer = response.data.data;
      setCustomerCache((prev) => ({
        ...prev,
        [newCustomer._id]: newCustomer,
      }));

      toast.success("Thành công", {
        description: "Đã tạo khách hàng mới",
      });

      return newCustomer;
    } catch (err: any) {
      toast.error("Lỗi", {
        description: err.response?.data?.error || "Không thể tạo khách hàng",
      });
      throw err;
    }
  };

  const updateCustomer = async (
    id: string,
    data: Partial<CustomerFormData>
  ) => {
    try {
      // Sử dụng PATCH đúng với API spec
      const response = await api.patch(`/api/v1/customers/${id}`, data);

      // Cập nhật cache
      const updatedCustomer = response.data.data;
      setCustomerCache((prev) => ({
        ...prev,
        [id]: updatedCustomer,
      }));

      toast.success("Thành công", {
        description: "Đã cập nhật thông tin khách hàng",
      });

      return updatedCustomer;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || "Không thể cập nhật khách hàng",
      });
      throw err;
    }
  };

  const assignCustomer = async (id: string, assignedTo: string) => {
    try {
      // Sử dụng endpoint đặc biệt để assign
      const response = await api.patch(`/api/v1/customers/${id}/assign`, {
        assignedTo,
      });

      // Cập nhật cache
      const updatedCustomer = response.data.data;
      setCustomerCache((prev) => ({
        ...prev,
        [id]: updatedCustomer,
      }));

      toast.success("Thành công", {
        description: "Đã gán khách hàng cho người dùng khác",
      });

      return updatedCustomer;
    } catch (err: any) {
      toast.error("Lỗi", {
        description: err.response?.data?.error || "Không thể gán khách hàng",
      });
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await api.delete(`/api/v1/customers/${id}`);

      // Xóa khỏi cache
      setCustomerCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      toast.success("Thành công", {
        description: "Đã xóa khách hàng",
      });

      return true;
    } catch (err: any) {
      toast.error("Lỗi", {
        description: err.response?.data?.error || "Không thể xóa khách hàng",
      });
      throw err;
    }
  };

  const getCustomersByType = async (type: string) => {
    try {
      const response = await api.get(`/api/v1/customers/by-type/${type}`);
      return response.data.data;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || `Không thể tải khách hàng loại ${type}`,
      });
      throw err;
    }
  };

  const getCustomerStatsByType = async () => {
    try {
      const response = await api.get("/api/v1/customers/stats/by-type");
      return response.data.data;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || "Không thể tải thống kê khách hàng",
      });
      throw err;
    }
  };

  const getMyCustomers = async () => {
    try {
      const response = await api.get("/api/v1/customers/assigned-to/me");
      return response.data.data;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || "Không thể tải khách hàng được gán",
      });
      throw err;
    }
  };

  const changePage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchCustomers(newPage, currentFiltersRef.current);
    },
    [fetchCustomers]
  );

  // Fetch customers on initial load only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchCustomers(initialPage);
      initialFetchDone.current = true;
    }
  }, [initialPage, fetchCustomers]);

  return {
    customers,
    loading,
    error,
    page,
    totalPages,
    totalCustomers,
    fetchCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    assignCustomer,
    deleteCustomer,
    getCustomersByType,
    getCustomerStatsByType,
    getMyCustomers,
    changePage,
  };
}
