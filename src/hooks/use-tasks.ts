import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { Task, TaskFormData } from '@/types/task';
import { toast } from 'sonner';

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
  
  // Ref để theo dõi trạng thái fetch đầu tiên
  const initialFetchDone = useRef(false);
  // Ref để lưu trữ filters hiện tại, tránh re-render không cần thiết
  const currentFiltersRef = useRef<Record<string, any>>({});

  // Hàm để tải thông tin liên quan cho các task
  const loadRelatedEntities = useCallback(async (tasks: Task[]): Promise<Task[]> => {
    const tasksWithRelatedInfo = [...tasks];
    
    // Lấy danh sách ID cần tải
    const customerIds = new Set<string>();
    const dealIds = new Set<string>();
    
    tasks.forEach(task => {
      if (task.relatedTo) {
        if (task.relatedTo.model === 'Customer') {
          customerIds.add(task.relatedTo.id);
        } else if (task.relatedTo.model === 'Deal') {
          dealIds.add(task.relatedTo.id);
        }
      }
    });
    
    // Tải thông tin customer nếu cần
    if (customerIds.size > 0) {
      try {
        // Gọi API để lấy danh sách customers theo ID
        const customerIdsArray = Array.from(customerIds);
        if (customerIdsArray.length > 0) {
          const customerResponse = await api.get(`/customers`, {
            params: { ids: customerIdsArray.join(',') }
          });
          
          const customers = customerResponse.data.data || [];
          
          // Map customers vào tasks
          tasksWithRelatedInfo.forEach(task => {
            if (task.relatedTo?.model === 'Customer') {
              const relatedCustomer = customers.find(
                (c: any) => c._id === task.relatedTo?.id
              );
              if (relatedCustomer) {
                task.customer = {
                  _id: relatedCustomer._id,
                  name: relatedCustomer.name,
                  company: relatedCustomer.company,
                  email: relatedCustomer.email
                };
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading related customers:', error);
      }
    }
    
    // Tải thông tin deal nếu cần
    if (dealIds.size > 0) {
      try {
        // Gọi API để lấy danh sách deals theo ID
        const dealIdsArray = Array.from(dealIds);
        if (dealIdsArray.length > 0) {
          const dealResponse = await api.get(`/deals`, {
            params: { ids: dealIdsArray.join(',') }
          });
          
          const deals = dealResponse.data.data || [];
          
          // Map deals vào tasks
          tasksWithRelatedInfo.forEach(task => {
            if (task.relatedTo?.model === 'Deal') {
              const relatedDeal = deals.find(
                (d: any) => d._id === task.relatedTo?.id
              );
              if (relatedDeal) {
                task.deal = {
                  _id: relatedDeal._id,
                  title: relatedDeal.title,
                  value: relatedDeal.value
                };
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading related deals:', error);
      }
    }
    
    return tasksWithRelatedInfo;
  }, []);

  const fetchTasks = useCallback(async (currentPage: number = 1, filters: Record<string, any> = {}) => {
    // Lưu lại filters hiện tại
    currentFiltersRef.current = filters;
    
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...filters
      });
      
      const response = await api.get(`/tasks?${queryParams}`);
      let fetchedTasks = response.data.data;
      
      // Tải thông tin liên quan nếu cần
      if (fetchedTasks && fetchedTasks.length > 0) {
        fetchedTasks = await loadRelatedEntities(fetchedTasks);
      }
      
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
      setError(err.response?.data?.error || 'Không thể tải danh sách công việc');
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tải danh sách công việc',
      });
    } finally {
      setLoading(false);
    }
  }, [loadRelatedEntities, pageSize]);

  const fetchRelatedTasks = useCallback(async (model: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tasks/related/${model}/${id}`);
      let relatedTasks = response.data.data;
      
      // Tải thông tin liên quan nếu cần
      if (relatedTasks && relatedTasks.length > 0) {
        relatedTasks = await loadRelatedEntities(relatedTasks);
      }
      
      setTasks(relatedTasks);
      setTotalTasks(response.data.count || relatedTasks.length);
      // No pagination for related tasks
      setTotalPages(1);
      setPage(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể tải công việc liên quan');
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tải công việc liên quan',
      });
    } finally {
      setLoading(false);
    }
  }, [loadRelatedEntities]);

  const getTask = useCallback(async (id: string) => {
    // Kiểm tra xem task có trong cache không
    if (taskCache[id]) {
      return taskCache[id];
    }
    
    try {
      const response = await api.get(`/tasks/${id}`);
      const task = response.data.data;
      
      // Cập nhật cache
      setTaskCache(prev => ({
        ...prev,
        [id]: task
      }));
      
      return task;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tải thông tin công việc',
      });
      throw err;
    }
  }, [taskCache]);

  const createTask = async (data: TaskFormData) => {
    try {
      const response = await api.post('/tasks', data);
      toast.success('Đã tạo công việc mới');
      
      // Cập nhật cache
      const newTask = response.data.data;
      setTaskCache(prev => ({
        ...prev,
        [newTask._id]: newTask
      }));
      
      return response.data.data;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể tạo công việc mới',
      });
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<TaskFormData>) => {
    try {
      const response = await api.patch(`/tasks/${id}`, data);
      toast.success('Đã cập nhật công việc');
      
      // Cập nhật cache
      setTaskCache(prev => ({
        ...prev,
        [id]: response.data.data
      }));
      
      return response.data.data;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể cập nhật công việc',
      });
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Đã xóa công việc');
      
      // Xóa khỏi cache
      setTaskCache(prev => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });
      
      return true;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể xóa công việc',
      });
      throw err;
    }
  };

  const completeTask = async (id: string) => {
    try {
      const response = await api.patch(`/tasks/${id}`, {
        status: 'completed',
        completedDate: new Date().toISOString()
      });
      
      toast.success('Đã hoàn thành công việc');
      
      // Cập nhật cache
      setTaskCache(prev => ({
        ...prev,
        [id]: response.data.data
      }));
      
      return response.data.data;
    } catch (err: any) {
      toast.error('Lỗi', {
        description: err.response?.data?.error || 'Không thể hoàn thành công việc',
      });
      throw err;
    }
  };

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
    fetchTasks(newPage, currentFiltersRef.current);
  }, [fetchTasks]);

  // Fetch tasks chỉ một lần khi component mount
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
    fetchRelatedTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    changePage,
  };
}