import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Deal, DealFormData } from "@/types/deal";
import { toast } from "sonner";
import { mapFormDataToApiData } from "@/utils/deals-mapper";

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

  const fetchDeals = async (
    page: number = 1,
    filters: Record<string, any> = {}
  ) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...filters,
      });

      const response = await api.get(`/deals?${queryParams}`);
      // Cấu trúc response của API
      setDeals(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalDeals(response.data.pagination.total);
      setPage(page);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch deals");
      toast.error(err.response?.data?.error || "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  };

  const getDeal = async (id: string) => {
    try {
      const response = await api.get(`/deals/${id}`);
      return response.data.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch deal");
      throw err;
    }
  };

  const createDeal = async (data: DealFormData) => {
    try {
      // Sử dụng hàm mapper để chuyển đổi dữ liệu
      const apiData = mapFormDataToApiData(data);
      
      const response = await api.post("/deals", apiData);
      toast.success("Deal created successfully");
      return response.data.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create deal");
      throw err;
    }
  };

  const updateDeal = async (id: string, data: Partial<DealFormData>) => {
    try {
      // Chuyển đổi từ form data sang API data
      const apiData: any = { ...data };
      
      if (data.name !== undefined) {
        // Đổi name thành title và xóa name
        apiData.title = data.name;
        delete apiData.name;
      }
      
      const response = await api.put(`/deals/${id}`, apiData);
      toast.success("Deal updated successfully");
      return response.data.data;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update deal");
      throw err;
    }
  };

  const deleteDeal = async (id: string) => {
    try {
      await api.delete(`/deals/${id}`);
      toast.success("Deal deleted successfully");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete deal");
      throw err;
    }
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    fetchDeals(newPage);
  };

  // Fetch deals on initial load
  useEffect(() => {
    fetchDeals(initialPage);
  }, [initialPage, pageSize]);

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
    changePage,
  };
}