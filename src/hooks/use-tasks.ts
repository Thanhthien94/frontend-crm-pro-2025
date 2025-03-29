import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Task, TaskFormData } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const fetchTasks = async (page: number = 1, filters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...filters
      });
      
      const response = await api.get(`/tasks?${queryParams}`);
      setTasks(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalTasks(response.data.pagination.total);
      setPage(page);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch tasks',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedTasks = async (model: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/tasks/related/${model}/${id}`);
      setTasks(response.data.data);
      setTotalTasks(response.data.count);
      // No pagination for related tasks
      setTotalPages(1);
      setPage(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch related tasks');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch related tasks',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTask = async (id: string) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data.data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch task',
      });
      throw err;
    }
  };

  const createTask = async (data: TaskFormData) => {
    try {
      const response = await api.post('/tasks', data);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create task',
      });
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<TaskFormData>) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
      return response.data.data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update task',
      });
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });
      return true;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete task',
      });
      throw err;
    }
  };

  const completeTask = async (id: string) => {
    try {
      const response = await api.put(`/tasks/${id}`, { status: 'completed' });
      toast({
        title: 'Success',
        description: 'Task marked as completed',
      });
      return response.data.data;
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.error || 'Failed to complete task',
      });
      throw err;
    }
  };

  const changePage = (newPage: number) => {
    setPage(newPage);
    fetchTasks(newPage);
  };

  // Fetch tasks on initial load
  useEffect(() => {
    fetchTasks(initialPage);
  }, [initialPage, pageSize]);

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