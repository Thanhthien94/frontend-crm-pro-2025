'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DealFormData } from '@/types/deal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DealForm from '@/components/forms/deal-form';
import api from '@/lib/api';
import { usePermission } from '@/hooks/use-permission';
import { toast } from 'sonner';
import { mapFormDataToApiData } from '@/utils/deals-mapper';

export default function NewDealPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // Check permission
    if (!checkPermission('deals', 'create')) {
      toast.error('Bạn không có quyền tạo giao dịch');
      router.push('/deals');
    }
  }, [router, checkPermission]);

  const handleSubmit = async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      // Sử dụng mapper để chuyển đổi dữ liệu
      const apiData = mapFormDataToApiData(data);
      
      const response = await api.post('/deals', apiData);
      toast.success('Tạo giao dịch thành công');
      router.push(`/deals/${response.data.data._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Không thể tạo giao dịch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Tạo giao dịch mới</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <DealForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}