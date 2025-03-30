import { useState, useEffect, useCallback, useRef } from 'react';
import { Task, TaskFormData } from '@/types/task';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';
import { mapTaskFormToApiData, mapApiDataToTaskForm } from '@/utils/tasks-mapper';

interface UseTasksProps {
  initialPage?: number;
  pageSize?: number;
}

export function useTasks({ initialPage = 1, pageSize = 10 }: UseTasksProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [taskCache, setTaskCache] = useState<Record<string, Task>>({});
  
  const initialFetchDone = useRef(false);
  const currentFiltersRef = useRef<Record<string, any>>({});

  const fetchTasks = useCallback(async (currentPage: number = 1, filters: Record<string, any> = {}) => {
    // Chuyển đổi bất kỳ filter nào từ frontend sang backend format
    const apiFilters = { ...filters };
    
    // Chuyển đổi status nếu cần
    if (apiFilters.status === 'pending') apiFilters.status = 'todo';
    if (apiFilters.status === 'canceled') apiFilters.status = 'cancelled';
    
    currentFiltersRef.current = apiFilters;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await taskService.getTasks(currentPage, pageSize, apiFilters);
      
      let fetchedTasks = response.data.data;
      
      // Cập nhật cache và state
      const newCache = { ...taskCache };
      fetchedTasks.forEach((task: Task) => {
        newCache[task._id] = task;
      });
      setTaskCache(newCache);
      
      setTasks(fetchedTasks);
      setTotalPages(response.data.pagination.pages);
      setTotalTasks(response.data.pagination.total);
      setPage(currentPage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể tải danh sách công việc';
      setError(errorMessage);
      toast.error('Lỗi', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [pageSize, taskCache]);

  const fetchTask = useCallback(async (id: string) => {
    // Kiểm tra nếu đã có trong cache
    if (taskCache[id]) {
      return taskCache[id];
    }
    
    try {
      const response = await taskService.getTask(id);
      
      // Cập nhật cache
      const task = response.data.data;
      setTaskCache(prev => ({
        ...prev,
        [id]: task
      }));
      
      return task;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể tải thông tin công việc';
      toast.error('Lỗi', { description: errorMessage });
      throw err;
    }
  }, [taskCache]);

  const createTask = async (data: TaskFormData) => {
    try {
      const response = await taskService.createTask(data);
      toast.success('Thành công', { description: 'Đã tạo công việc mới' });
      
      // Cập nhật cache
      const newTask = response.data.data;
      setTaskCache(prev => ({
        ...prev,
        [newTask._id]: newTask
      }));
      
      return newTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể tạo công việc mới';
      toast.error('Lỗi', { description: errorMessage });
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<TaskFormData>) => {
    try {
      const response = await taskService.updateTask(id, data);
      toast.success('Thành công', { description: 'Đã cập nhật công việc' });
      
      // Cập nhật cache
      const updatedTask = response.data.data;
      setTaskCache(prev => ({
        ...prev,
        [id]: updatedTask
      }));
      
      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể cập nhật công việc';
      toast.error('Lỗi', { description: errorMessage });
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      toast.success('Thành công', { description: 'Đã xóa công việc' });
      
      // Xóa khỏi cache
      setTaskCache(prev => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể xóa công việc';
      toast.error('Lỗi', { description: errorMessage });
      throw err;
    }
  };

  const completeTask = async (id: string) => {
    try {
      const response = await taskService.completeTask(id);
      toast.success('Thành công', { description: 'Đã đánh dấu hoàn thành công việc' });
      
      // Cập nhật cache
      const updatedTask = response.data.data;
      setTaskCache(prev => ({
        ...prev,
        [id]: updatedTask
      }));
      
      return updatedTask;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Không thể đánh dấu hoàn thành công việc';
      toast.error('Lỗi', { description: errorMessage });
      throw err;
    }
  };

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
    fetchTasks(newPage, currentFiltersRef.current);
  }, [fetchTasks]);

  // Fetch tasks on initial load only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchTasks(initialPage);
      initialFetchDone.current = true;
    }
  }, [initialPage, fetchTasks]);

  return {
    tasks,
    loading,
    error,
    page,
    totalPages,
    totalTasks,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    changePage,
  };
}