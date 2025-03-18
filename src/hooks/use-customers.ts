import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Customer, CustomerFormData } from '@/types/customer';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const fetchCustomers = async (page: number = 1, filters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...filters
      });
      
      const response = await api.get(`/customers?${queryParams}`);
      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalCustomers(response.data.pagination.total);
      setPage(page);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch customers');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch customers',
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch customer',
      });
      throw err;
    }
  };

  const createCustomer = async (data: CustomerFormData) => {
    try {
      const response = await api.post('/customers', data);
      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create customer',
      });
      throw err;
    }
  };

  const updateCustomer = async (id: string, data: Partial<CustomerFormData>) => {
    try {
      const response = await api.put(`/customers/${id}`, data);
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      return response.data.data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update customer',
      });
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await api.delete(`/customers/${id}`);
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
      return true;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete customer',
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