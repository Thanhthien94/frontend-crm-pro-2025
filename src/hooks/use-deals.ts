import { useState, useEffect, useCallback, useRef } from "react";
import { Deal, DealFormData } from "@/types/deal";
import { dealService } from "@/services/dealService";
import { toast } from "sonner";

interface UseDealsProps {
  initialPage?: number;
  pageSize?: number;
}

export function useDeals({
  initialPage = 1,
  pageSize = 10,
}: UseDealsProps = {}) {
  // State management
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);

  // Lưu cache deals để tránh fetch lại dữ liệu không cần thiết
  const [dealCache, setDealCache] = useState<Record<string, Deal>>({});

  // Sử dụng refs để tránh re-renders không cần thiết
  const initialFetchDone = useRef(false);
  const currentFiltersRef = useRef<Record<string, any>>({});

  /**
   * Fetch danh sách thương vụ với phân trang và bộ lọc
   */
  const fetchDeals = useCallback(
    async (currentPage: number = 1, filters: Record<string, any> = {}) => {
      // Lưu lại bộ lọc hiện tại để sử dụng sau này
      currentFiltersRef.current = filters;

      // Đặt trạng thái loading và xóa lỗi cũ
      setLoading(true);
      setError(null);

      try {
        // Gọi API để lấy danh sách thương vụ
        const response = await dealService.getDeals(
          currentPage,
          pageSize,
          filters
        );

        const fetchedDeals = response.data.data;

        // Cập nhật cache với dữ liệu mới
        const newCache = { ...dealCache };
        fetchedDeals.forEach((deal: Deal) => {
          newCache[deal._id] = deal;
        });
        setDealCache(newCache);

        // Cập nhật state
        setDeals(fetchedDeals);
        console.log('deals: ', fetchedDeals);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
          setTotalDeals(response.data.pagination.total);
        } else {
          // Fallback nếu API không trả về thông tin phân trang
          setTotalPages(Math.ceil(fetchedDeals.length / pageSize));
          setTotalDeals(fetchedDeals.length);
        }

        // Cập nhật trang hiện tại
        setPage(currentPage);
      } catch (err: any) {
        // Xử lý lỗi
        const errorMessage =
          err.response?.data?.error || "Không thể tải danh sách thương vụ";
        setError(errorMessage);
        toast.error("Lỗi", {
          description: errorMessage,
        });
      } finally {
        // Hủy trạng thái loading
        setLoading(false);
      }
    },
    [pageSize, dealCache]
  );

  /**
   * Fetch thông tin chi tiết của một thương vụ theo ID
   */
  const getDeal = useCallback(
    async (id: string) => {
      // Kiểm tra nếu thương vụ đã có trong cache
      if (dealCache[id]) {
        return dealCache[id];
      }

      try {
        // Gọi API để lấy chi tiết thương vụ
        const response = await dealService.getDeal(id);
        const deal = response.data.data;

        // Cập nhật cache với thương vụ mới
        setDealCache((prev) => ({
          ...prev,
          [id]: deal,
        }));

        return deal;
      } catch (err: any) {
        // Xử lý lỗi
        const errorMessage =
          err.response?.data?.error || "Không thể tải thông tin thương vụ";
        toast.error("Lỗi", {
          description: errorMessage,
        });
        throw err;
      }
    },
    [dealCache]
  );

  /**
   * Tạo thương vụ mới
   */
  const createDeal = async (data: DealFormData) => {
    try {
      // Gọi API để tạo thương vụ mới
      const response = await dealService.createDeal(data);
      const newDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã tạo thương vụ mới",
      });

      // Cập nhật cache với thương vụ mới
      setDealCache((prev) => ({
        ...prev,
        [newDeal._id]: newDeal,
      }));

      return newDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tạo thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Cập nhật thông tin thương vụ
   */
  const updateDeal = async (id: string, data: Partial<DealFormData>) => {
    try {
      // Gọi API để cập nhật thương vụ
      const response = await dealService.updateDeal(id, data);
      const updatedDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã cập nhật thông tin thương vụ",
      });

      // Cập nhật cache với thương vụ đã được cập nhật
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      return updatedDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Xóa thương vụ
   */
  const deleteDeal = async (id: string) => {
    try {
      // Gọi API để xóa thương vụ
      await dealService.deleteDeal(id);

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã xóa thương vụ",
      });

      // Xóa thương vụ khỏi cache
      setDealCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      return true;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể xóa thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Thay đổi giai đoạn thương vụ
   */
  const changeDealStage = async (id: string, stage: string) => {
    try {
      // Gọi API để cập nhật giai đoạn thương vụ
      const response = await dealService.changeDealStage(id, stage);
      const updatedDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: `Đã chuyển thương vụ sang giai đoạn ${stage}`,
      });

      // Cập nhật cache với thương vụ đã được cập nhật giai đoạn
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      return updatedDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể chuyển giai đoạn thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Lấy tổng hợp thông tin thương vụ
   */
  const getDealSummary = async () => {
    try {
      // Gọi API để lấy tổng hợp thông tin thương vụ
      const response = await dealService.getDealSummary();
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải thống kê thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Lấy thương vụ theo khách hàng
   */
  const getDealsByCustomer = async (customerId: string) => {
    try {
      // Gọi API để lấy thương vụ theo khách hàng
      const response = await dealService.getDealsByCustomer(customerId);

      // Cập nhật cache với thương vụ mới
      const fetchedDeals = response.data.data;
      const newCache = { ...dealCache };
      fetchedDeals.forEach((deal: Deal) => {
        newCache[deal._id] = deal;
      });
      setDealCache(newCache);

      return fetchedDeals;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải thương vụ của khách hàng";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Gán thương vụ cho người dùng
   */
  const assignDeal = async (id: string, userId: string) => {
    try {
      // Gọi API để gán thương vụ cho người dùng
      const response = await dealService.updateDeal(id, { assignedTo: userId });
      const updatedDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã gán thương vụ cho người dùng",
      });

      // Cập nhật cache với thương vụ đã được cập nhật
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      return updatedDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể gán thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Cập nhật trạng thái thương vụ
   */
  const updateDealStatus = async (
    id: string,
    status: "active" | "inactive"
  ) => {
    try {
      // Gọi API để cập nhật trạng thái thương vụ
      const response = await dealService.updateDeal(id, { status });
      const updatedDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: `Đã cập nhật trạng thái thành ${
          status === "active" ? "Hoạt động" : "Không hoạt động"
        }`,
      });

      // Cập nhật cache với thương vụ đã được cập nhật trạng thái
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      return updatedDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật trạng thái thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Cập nhật tỷ lệ thành công của thương vụ
   */
  const updateDealProbability = async (id: string, probability: number) => {
    try {
      // Gọi API để cập nhật tỷ lệ thành công
      const response = await dealService.updateDeal(id, { probability });
      const updatedDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: `Đã cập nhật tỷ lệ thành công thành ${probability}%`,
      });

      // Cập nhật cache với thương vụ đã được cập nhật
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      return updatedDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật tỷ lệ thành công";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Lấy hoạt động của thương vụ
   */
  const getDealActivities = async (id: string) => {
    try {
      // Gọi API để lấy hoạt động của thương vụ
      const response = await dealService.getDealActivities(id);
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải hoạt động của thương vụ";
      toast.error("Lỗi", {
        description: errorMessage,
      });
      throw err;
    }
  };

  /**
   * Thêm sản phẩm vào thương vụ
   */
  const addProductToDeal = async (
    id: string,
    productData: {
      productId: string;
      quantity: number;
      price?: number;
    }
  ) => {
    try {
      // Gọi API để thêm sản phẩm vào thương vụ
      const response = await dealService.addProductToDeal(id, productData);
      const updatedDeal = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã thêm sản phẩm vào thương vụ",
      });

      // Cập nhật cache với thương vụ đã được cập nhật
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      return updatedDeal;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể thêm sản phẩm vào thương vụ";
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
      fetchDeals(newPage, currentFiltersRef.current);
    },
    [fetchDeals]
  );

  /**
   * Effect để fetch dữ liệu ban đầu một lần khi component mount
   */
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchDeals(initialPage);
      initialFetchDone.current = true;
    }
  }, [initialPage, fetchDeals]);

  // Trả về các state và methods
  return {
    // States
    deals,
    loading,
    error,
    page,
    totalPages,
    totalDeals,

    // Basic CRUD methods
    fetchDeals,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,

    // Deal specific actions
    changeDealStage,
    assignDeal,
    updateDealStatus,
    updateDealProbability,

    // Additional methods
    getDealSummary,
    getDealsByCustomer,
    getDealActivities,
    addProductToDeal,

    // Pagination
    changePage,
  };
}
