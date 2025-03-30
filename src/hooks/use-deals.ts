// src/hooks/use-deals.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { Deal, DealFormData } from "@/types/deal";
import { toast } from "sonner";
import { dealService } from "@/services/dealService";

interface UseDealsProps {
  initialPage?: number;
  pageSize?: number;
}

export function useDeals({
  initialPage = 1,
  pageSize = 10,
}: UseDealsProps = {}) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDeals, setTotalDeals] = useState(0);
  const [dealCache, setDealCache] = useState<Record<string, Deal>>({});

  // Refs để tracking và tránh re-renders không cần thiết
  const initialFetchDone = useRef(false);
  const currentFiltersRef = useRef<Record<string, any>>({});

  const fetchDeals = useCallback(
    async (currentPage: number = 1, filters: Record<string, any> = {}) => {
      // Lưu lại filters hiện tại
      currentFiltersRef.current = filters;

      setLoading(true);
      setError(null);
      try {
        const response = await dealService.getDeals(
          currentPage,
          pageSize,
          filters
        );

        // Cập nhật cache
        const fetchedDeals = response.data.data;
        const newCache = { ...dealCache };
        fetchedDeals.forEach((deal: Deal) => {
          newCache[deal._id] = deal;
        });
        setDealCache(newCache);

        setDeals(fetchedDeals);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
          setTotalDeals(response.data.pagination.total);
        } else {
          // Fallback nếu API không trả về thông tin phân trang
          setTotalPages(Math.ceil(fetchedDeals.length / pageSize));
          setTotalDeals(fetchedDeals.length);
        }

        setPage(currentPage);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Không thể tải danh sách thương vụ"
        );
        toast.error("Lỗi", {
          description:
            err.response?.data?.error || "Không thể tải danh sách thương vụ",
        });
      } finally {
        setLoading(false);
      }
    },
    [pageSize, dealCache]
  );

  const getDeal = useCallback(
    async (id: string) => {
      // Kiểm tra nếu đã có trong cache
      if (dealCache[id]) {
        return dealCache[id];
      }

      try {
        const response = await dealService.getDeal(id);

        // Cập nhật cache
        const deal = response.data.data;
        setDealCache((prev) => ({
          ...prev,
          [id]: deal,
        }));

        return deal;
      } catch (err: any) {
        toast.error("Lỗi", {
          description:
            err.response?.data?.error || "Không thể tải thông tin thương vụ",
        });
        throw err;
      }
    },
    [dealCache]
  );

  const createDeal = async (data: DealFormData) => {
    try {
      const response = await dealService.createDeal(data);

      // Cập nhật cache với deal mới
      const newDeal = response.data.data;
      setDealCache((prev) => ({
        ...prev,
        [newDeal._id]: newDeal,
      }));

      toast.success("Thành công", {
        description: "Đã tạo thương vụ mới",
      });

      return newDeal;
    } catch (err: any) {
      toast.error("Lỗi", {
        description: err.response?.data?.error || "Không thể tạo thương vụ",
      });
      throw err;
    }
  };

  const updateDeal = async (id: string, data: Partial<DealFormData>) => {
    try {
      const response = await dealService.updateDeal(id, data);

      // Cập nhật cache
      const updatedDeal = response.data.data;
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      toast.success("Thành công", {
        description: "Đã cập nhật thương vụ",
      });

      return updatedDeal;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || "Không thể cập nhật thương vụ",
      });
      throw err;
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      await dealService.deleteDeal(id);

      // Xóa khỏi cache
      setDealCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      toast.success("Thành công", {
        description: "Đã xóa thương vụ",
      });

      return true;
    } catch (err: any) {
      toast.error("Lỗi", {
        description: err.response?.data?.error || "Không thể xóa thương vụ",
      });
      throw err;
    }
  };

  const getDealSummary = async () => {
    try {
      const response = await dealService.getDealSummary();
      return response.data.data;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || "Không thể tải thống kê thương vụ",
      });
      throw err;
    }
  };

  const changeDealStage = async (id: string, stage: string) => {
    try {
      const response = await dealService.changeDealStage(id, stage);

      // Cập nhật cache
      const updatedDeal = response.data.data;
      setDealCache((prev) => ({
        ...prev,
        [id]: updatedDeal,
      }));

      toast.success("Thành công", {
        description: `Đã chuyển thương vụ sang giai đoạn ${stage}`,
      });

      return updatedDeal;
    } catch (err: any) {
      toast.error("Lỗi", {
        description:
          err.response?.data?.error || "Không thể chuyển giai đoạn thương vụ",
      });
      throw err;
    }
  };

  const changePage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchDeals(newPage, currentFiltersRef.current);
    },
    [fetchDeals]
  );

  // Fetch deals on initial load only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchDeals(initialPage);
      initialFetchDone.current = true;
    }
  }, [initialPage, fetchDeals]);

  return {
    deals,
    loading,
    error,
    page,
    totalPages,
    totalDeals,
    fetchDeals,
    getDeal,
    createDeal,
    updateDeal,
    deleteDeal,
    getDealSummary,
    changeDealStage,
    changePage,
  };
}
