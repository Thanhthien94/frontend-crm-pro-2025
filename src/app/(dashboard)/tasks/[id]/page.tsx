'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task } from '@/types/task';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Building,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/use-permission';
import { formatDate } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const { checkPermission } = usePermission();
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch task:', error);
        toast.error('Lỗi', {
          description: error.response?.data?.error || 'Không thể tải chi tiết công việc',
        });
        router.push('/tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [id, router]);

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Đã xóa công việc thành công');
      router.push('/tasks');
    } catch (error: any) {
      toast.error('Lỗi khi xóa', {
        description: error.response?.data?.error || 'Không thể xóa công việc',
      });
    }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/tasks/${id}`, { status: 'completed' });
      toast.success('Đã hoàn thành công việc');
      
      // Cập nhật trạng thái task trong state
      setTask(prev => {
        if (!prev) return null;
        return { ...prev, status: 'completed' };
      });
      
      setIsCompleteDialogOpen(false);
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật', {
        description: error.response?.data?.error || 'Không thể cập nhật trạng thái công việc',
      });
    }
  };

  // Lấy tên ưu tiên từ giá trị
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  // Lấy tên trạng thái từ giá trị
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'Cần làm';
      case 'in_progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Lấy class cho ưu tiên
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Lấy class cho trạng thái
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'todo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Kiểm tra xem task có quá hạn không
  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'completed' && task.status !== 'cancelled';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Đang tải...</div>;
  }

  if (!task) {
    return <div>Không tìm thấy công việc</div>;
  }

  const canComplete = task.status !== 'completed' && task.status !== 'cancelled';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push('/tasks')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>
        <div className="flex space-x-2">
          {canComplete && (
            <Button 
              variant="outline" 
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => setIsCompleteDialogOpen(true)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Hoàn thành
            </Button>
          )}
          {checkPermission('tasks', 'update') && (
            <Button onClick={() => router.push(`/tasks/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
          {checkPermission('tasks', 'delete') && (
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {task.title}
                  {isTaskOverdue(task) && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      Quá hạn
                    </span>
                  )}
                </CardTitle>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                  <TabsTrigger value="liên kết">Liên kết</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                  {task.description && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
                      <div className="bg-muted/50 p-4 rounded-md whitespace-pre-line">
                        {task.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ngày hết hạn</p>
                        <p>{task.dueDate ? formatDate(task.dueDate) : 'Không có'}</p>
                      </div>
                    </div>
                    
                    {task.completedAt && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Ngày hoàn thành</p>
                          <p>{formatDate(task.completedAt)}</p>
                        </div>
                      </div>
                    )}
                    
                    {task.reminderDate && (
                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nhắc nhở</p>
                          <p>{formatDate(task.reminderDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {task.isRecurring && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Lặp lại</p>
                        <p className="capitalize">{task.recurringFrequency || 'Không'}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="liên kết" className="space-y-4">
                  {!task.customer && !task.deal ? (
                    <div className="text-center py-6 text-muted-foreground">
                      Không có liên kết nào
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {task.customer && (
                        <div className="flex items-start gap-2">
                          <Building className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Khách hàng liên quan</p>
                            <div className="flex items-center">
                              <p>{task.customer.name}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => router.push(`/customers/${task.customer?._id}`)}
                              >
                                Xem
                              </Button>
                            </div>
                            {task.customer.company && (
                              <p className="text-sm text-muted-foreground">{task.customer.company}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {task.deal && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Cơ hội liên quan</p>
                            <div className="flex items-center">
                              <p>{task.deal.title}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="ml-2"
                                onClick={() => router.push(`/deals/${task.deal?._id}`)}
                              >
                                Xem
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Giá trị: {task.deal.value.toLocaleString()} đ
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin giao việc</CardTitle>
            </CardHeader>
            <CardContent>
              {task.assignedTo ? (
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {task.assignedTo.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{task.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.assignedTo.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Chưa giao cho ai</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Thông tin khác</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Tạo bởi</p>
                {task.createdBy ? (
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p>{task.createdBy.name}</p>
                  </div>
                ) : (
                  <p>Không có thông tin</p>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p>{formatDate(task.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn công việc "{task.title}". Không thể hoàn tác thao tác này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog 
        open={isCompleteDialogOpen} 
        onOpenChange={setIsCompleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hoàn thành công việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đánh dấu công việc "{task.title}" là đã hoàn thành?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Hoàn thành
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}