'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Customer, CustomerFormData } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '@/components/forms/customer-form';
import api from '@/lib/api';
import {toast } from 'sonner';
import { usePermission } from '@/hooks/use-permission';

export default function EditCustomerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    // Check permission
    if (!checkPermission('customer', 'update')) {
      toast.error('Bạn không có quyền chỉnh sửa khách hàng');
      router.push('/customers');
      return;
    }
    
    const fetchCustomer = async () => {
      try {
        const response = await api.get(`/customers/${id}`);
        setCustomer(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch customer:', error);
        toast.error('Không thể lấy thông tin khách hàng');
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [id, router, toast, checkPermission]);

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await api.put(`/customers/${id}`, data);
      toast.success('Đã cập nhật khách hàng thành công');
      router.push(`/customers/${id}`);
    } catch {
      toast.error('Không thể cập nhật khách hàng');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Đang tải...</div>;
  }

  if (!customer) {
    return <div>Không tìm thấy khách hàng</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Chỉnh sửa khách hàng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            customer={customer}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}