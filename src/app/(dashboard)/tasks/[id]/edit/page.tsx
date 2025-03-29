'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task, TaskFormData } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TaskForm from '@/components/forms/task-form';
import api from '@/lib/api';
import { usePermission } from '@/hooks/use-permission';
import { toast } from 'sonner';

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    // Kiểm tra quyền hạn
    if (!checkPermission('tasks', 'update')) {
      toast.error('Bạn không có quyền chỉnh sửa công việc');
      router.push('/tasks');
      return;
    }
    
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch task:', error);
        toast.error('Lỗi', {
          description: error.response?.data?.error || 'Không thể tải thông tin công việc',
        });
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id, router, checkPermission]);

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/tasks/${id}`, data);
      toast.success('Cập nhật công việc thành công');
      router.push(`/tasks/${id}`);
    } catch (error: any) {
      toast.error('Lỗi', {
        description: error.response?.data?.error || 'Không thể cập nhật công việc',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Đang tải thông tin công việc...</span>
      </div>
    );
  }

  if (!task) {
    return <div>Không tìm thấy công việc</div>;
  }

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
        <h1 className="ml-4 text-3xl font-bold tracking-tight">Chỉnh sửa công việc</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            task={task}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}