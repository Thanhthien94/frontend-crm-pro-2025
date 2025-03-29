'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/hooks/use-tasks';
import { Task, TaskFormData } from '@/types/task';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Calendar, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import TaskForm from '@/components/forms/task-form';
import { TasksTable } from '@/components/data-tables/tasks-table';
import { usePermission } from '@/hooks/use-permission';

export default function TasksPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();
  
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Fetch tasks data using custom hook
  const {
    tasks,
    loading,
    page,
    totalPages,
    totalTasks,
    fetchTasks,
    createTask,
    deleteTask,
    completeTask,
    changePage,
  } = useTasks();

  // Handlers
  const handleViewTask = (task: Task) => {
    router.push(`/tasks/${task._id}`);
  };

  const handleEditTask = (task: Task) => {
    router.push(`/tasks/${task._id}/edit`);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleCompleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsCompleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask._id);
      setIsDeleteDialogOpen(false);
      fetchTasks(page, currentFilters);
    }
  };

  const confirmCompleteTask = async () => {
    if (selectedTask) {
      await completeTask(selectedTask._id);
      setIsCompleteDialogOpen(false);
      fetchTasks(page, currentFilters);
    }
  };

  const handleCreateSubmit = async (data: TaskFormData) => {
    await createTask(data);
    setIsCreateDialogOpen(false);
    fetchTasks(page, currentFilters);
  };

  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newFilters: Record<string, any> = { ...currentFilters };
    
    // Clear previous status filters
    delete newFilters.status;
    delete newFilters.overdue;
    delete newFilters.upcoming;
    delete newFilters.my;
    
    // Apply new filters based on tab
    switch (value) {
      case 'overdue':
        newFilters.overdue = 'true';
        break;
      case 'today':
        newFilters.upcoming = 'true';
        break;
      case 'my':
        newFilters.my = 'true';
        break;
      case 'pending':
        newFilters.status = 'pending';
        break;
      case 'in_progress':
        newFilters.status = 'in_progress';
        break;
      case 'completed':
        newFilters.status = 'completed';
        break;
      case 'canceled':
        newFilters.status = 'canceled';
        break;
    }
    
    setCurrentFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  // Filtering functions
  const handlePriorityFilter = (priority: string) => {
    const newFilters = { ...currentFilters };
    if (priority && priority !== 'all') {
      newFilters.priority = priority;
    } else {
      delete newFilters.priority;
    }
    setCurrentFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  const handleSearch = () => {
    const newFilters = { ...currentFilters };
    if (searchQuery) {
      newFilters.search = searchQuery;
    } else {
      delete newFilters.search;
    }
    setCurrentFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const canUpdateTask = checkPermission('tasks', 'update');
  const canDeleteTask = checkPermission('tasks', 'delete');

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Công việc</h1>
          <p className="text-muted-foreground">
            Quản lý các công việc và hoạt động
          </p>
        </div>
        
        {checkPermission('tasks', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm công việc
          </Button>
        )}
      </div>

      {/* Tasks Card */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách công việc</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs and Filters */}
          <div className="space-y-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="my">Của tôi</TabsTrigger>
                <TabsTrigger value="overdue" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Quá hạn
                </TabsTrigger>
                <TabsTrigger value="today" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Hôm nay
                </TabsTrigger>
                <TabsTrigger value="pending">Cần làm</TabsTrigger>
                <TabsTrigger value="in_progress">Đang thực hiện</TabsTrigger>
                <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
                <TabsTrigger value="canceled">Đã hủy</TabsTrigger>
              </TabsList>
            </Tabs>
          
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex gap-2 flex-1">
                <Input
                  placeholder="Tìm kiếm công việc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="max-w-xs"
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ưu tiên:</span>
                <Select
                  onValueChange={handlePriorityFilter}
                  defaultValue={currentFilters.priority || 'all'}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tất cả mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Tasks Table */}
          <TasksTable 
            data={tasks}
            loading={loading}
            onView={handleViewTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onComplete={handleCompleteTask}
            canUpdate={canUpdateTask}
            canDelete={canDeleteTask}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Hiển thị {tasks.length} trong tổng số {totalTasks} công việc
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                >
                  Trang trước
                </Button>
                <div className="flex items-center text-sm">
                  Trang {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm công việc mới</DialogTitle>
            <DialogDescription>
              Tạo một công việc hoặc hoạt động mới để theo dõi.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn công việc "{selectedTask?.title}". Không thể hoàn tác thao tác này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDeleteTask}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hoàn thành công việc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đánh dấu công việc "{selectedTask?.title}" là đã hoàn thành?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompleteTask}>
              Hoàn thành
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}