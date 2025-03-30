'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TaskFormData } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TaskForm from '@/components/forms/task-form';
import { usePermission } from '@/hooks/use-permission';
import { toast } from 'sonner';
import { useTasks } from '@/hooks/use-tasks';

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkPermission } = usePermission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preselectedRelation, setPreselectedRelation] = useState<{
    model: 'Customer' | 'Deal';
    id: string;
    name: string;
  } | null>(null);
  
  // Sử dụng hook useTasks thay vì gọi API trực tiếp
  const { createTask } = useTasks();
  
  // Kiểm tra URL params để xem có liên kết sẵn với khách hàng hoặc deal không
  useEffect(() => {
    const customerId = searchParams.get('customerId');
    const customerName = searchParams.get('customerName');
    const dealId = searchParams.get('dealId');
    const dealName = searchParams.get('dealName');
    
    if (customerId && customerName) {
      setPreselectedRelation({
        model: 'Customer',
        id: customerId,
        name: customerName
      });
    } else if (dealId && dealName) {
      setPreselectedRelation({
        model: 'Deal',
        id: dealId,
        name: dealName
      });
    }
  }, [searchParams]);
  
  useEffect(() => {
    // Kiểm tra quyền hạn
    if (!checkPermission('task', 'create')) {
      toast.error('Bạn không có quyền tạo công việc mới');
      router.push('/tasks');
    }
  }, [router, checkPermission]);

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // Sử dụng createTask từ hook thay vì gọi API trực tiếp
      const newTask = await createTask(data);
      toast.success('Tạo công việc mới thành công');
      router.push(`/tasks/${newTask._id}`);
    } catch (error: any) {
      toast.error('Lỗi', {
        description: error.response?.data?.error || 'Không thể tạo công việc mới',
      });
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
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Tạo công việc mới</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
            preselectedRelation={preselectedRelation || undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}