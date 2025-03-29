// src/hooks/use-customers.ts
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Customer, CustomerFormData } from '@/types/customer';
import { toast } from 'sonner';

interface UseCustomersProps {
  initialPage?: number;
  pageSize?: number;
}

export function useCustomers({ initialPage = 1, pageSize = 10 }: UseCustomersProps = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const fetchCustomers = async (currentPage: number = 1, filters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...filters
      });
      
      const response = await api.get(`/customers?${queryParams}`);
      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalCustomers(response.data.pagination.total);
      setPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải danh sách khách hàng');
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tải danh sách khách hàng',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCustomer = async (id: string) => {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data.data;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tải thông tin khách hàng',
      });
      throw err;
    }
  };

  const createCustomer = async (data: CustomerFormData) => {
    try {
      const response = await api.post('/customers', data);
      toast.success('Thành công', {
        description: 'Đã tạo khách hàng mới',
      });
      return response.data.data;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tạo khách hàng',
      });
      throw err;
    }
  };

  const updateCustomer = async (id: string, data: Partial<CustomerFormData>) => {
    try {
      const response = await api.put(`/customers/${id}`, data);
      toast.success('Thành công', {
        description: 'Đã cập nhật thông tin khách hàng',
      });
      return response.data.data;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể cập nhật khách hàng',
      });
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Thành công', {
        description: 'Đã xóa khách hàng',
      });
      return true;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể xóa khách hàng',
      });
      throw err;
    }
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    fetchCustomers(newPage);
  };

  // Fetch customers on initial load
  useEffect(() => {
    fetchCustomers(initialPage);
  }, [initialPage, pageSize]);

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
    deleteCustomer,
    changePage,
  };
}