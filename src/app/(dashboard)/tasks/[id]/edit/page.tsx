"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Task, TaskFormData } from "@/types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import TaskForm from "@/components/forms/task-form";
import { usePermission } from "@/hooks/use-permission";
import { toast } from "sonner";
import { useTasks } from "@/hooks/use-tasks";

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { checkPermission } = usePermission();

  // Sử dụng hook useTasks thay vì gọi service trực tiếp
  const { fetchTask, updateTask } = useTasks();

  useEffect(() => {
    // Kiểm tra quyền hạn trước khi fetch dữ liệu
    if (!checkPermission("task", "update")) {
      toast.error("Bạn không có quyền chỉnh sửa công việc");
      router.push("/tasks");
      return;
    }

    // Tải dữ liệu task
    const loadTask = async () => {
      try {
        setLoading(true);
        const taskData = await fetchTask(id as string);
        setTask(taskData);
      } catch (error: any) {
        console.error("Failed to fetch task:", error);
        toast.error("Lỗi", {
          description:
            error.response?.data?.error || "Không thể tải thông tin công việc",
        });
        router.push("/tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [checkPermission, router, fetchTask, id]);

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // Sử dụng updateTask từ hook thay vì gọi service trực tiếp
      await updateTask(id as string, data);
      router.push(`/tasks/${id}`);
    } catch {
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
        <h1 className="ml-4 text-3xl font-bold tracking-tight">
          Chỉnh sửa công việc
        </h1>
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
