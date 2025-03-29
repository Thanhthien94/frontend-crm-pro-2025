'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Deal, DealFormData } from '@/types/deal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DealForm from '@/components/forms/deal-form';
import api from '@/lib/api';
import { usePermission } from '@/hooks/use-permission';
import { toast } from 'sonner';
import { mapFormDataToApiData, mapApiDataToFormData } from '@/utils/deals-mapper';

export default function EditDealPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    // Check permission
    if (!checkPermission('deals', 'update')) {
      toast.error('Bạn không có quyền chỉnh sửa giao dịch');
      router.push('/deals');
      return;
    }
    
    const fetchDeal = async () => {
      try {
        const response = await api.get(`/deals/${id}`);
        setDeal(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch deal:', error);
        toast.error(error.response?.data?.error || 'Không thể lấy thông tin giao dịch');
        router.push('/deals');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeal();
  }, [id, router, checkPermission]);

  const handleSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      // Sử dụng mapper để chuyển đổi dữ liệu
      const apiData = mapFormDataToApiData(data);
      
      await api.put(`/deals/${id}`, apiData);
      toast.success('Cập nhật giao dịch thành công');
      router.push(`/deals/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể cập nhật giao dịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Đang tải thông tin giao dịch...</span>
      </div>
    );
  }

  if (!deal) {
    return <div>Không tìm thấy giao dịch</div>;
  }

  // Chuyển đổi từ API data sang form data (title -> name)
  const formData = mapApiDataToFormData(deal);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          disabled={isSubmitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Chỉnh sửa giao dịch</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            deal={deal}
            initialFormData={formData}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}