import { useState, useEffect, useCallback, useRef } from "react";
import { Task, TaskFormData } from "@/types/task";
import { taskService } from "@/services/taskService";
import { toast } from "sonner";

interface UseTasksProps {
  initialPage?: number;
  pageSize?: number;
}

export function useTasks({
  initialPage = 1,
  pageSize = 10,
}: UseTasksProps = {}) {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  
  // Lưu cache tasks để tránh fetch lại dữ liệu không cần thiết
  const [taskCache, setTaskCache] = useState<Record<string, Task>>({});

  // Sử dụng refs để tránh re-renders không cần thiết
  const initialFetchDone = useRef(false);
  const currentFiltersRef = useRef<Record<string, any>>({});

  /**
   * Fetch danh sách tasks với phân trang và bộ lọc
   */
  const fetchTasks = useCallback(
    async (currentPage: number = 1, filters: Record<string, any> = {}) => {
      // Lưu lại bộ lọc hiện tại để sử dụng sau này
      currentFiltersRef.current = filters;

      // Đặt trạng thái loading và xóa lỗi cũ
      setLoading(true);
      setError(null);

      try {
        // Gọi API để lấy danh sách tasks
        const response = await taskService.getTasks(
          currentPage,
          pageSize,
          filters
        );

        const fetchedTasks = response.data.data;

        // Cập nhật cache với dữ liệu mới
        const newCache = { ...taskCache };
        fetchedTasks.forEach((task: Task) => {
          newCache[task._id] = task;
        });
        setTaskCache(newCache);

        // Cập nhật state
        setTasks(fetchedTasks);

        // Cập nhật thông tin phân trang
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
          setTotalTasks(response.data.pagination.total);
        } else {
          // Fallback nếu API không trả về thông tin phân trang
          setTotalPages(Math.ceil(fetchedTasks.length / pageSize));
          setTotalTasks(fetchedTasks.length);
        }

        // Cập nhật trang hiện tại
        setPage(currentPage);
      } catch (err: any) {
        // Xử lý lỗi
        const errorMessage =
          err.response?.data?.error || "Không thể tải danh sách công việc";
        setError(errorMessage);
        toast.error("Lỗi", { description: errorMessage });
      } finally {
        // Hủy trạng thái loading
        setLoading(false);
      }
    },
    [pageSize, taskCache]
  );

  /**
   * Fetch thông tin chi tiết của một task theo ID
   */
  const fetchTask = useCallback(
    async (id: string) => {
      // Kiểm tra nếu task đã có trong cache
      if (taskCache[id]) {
        return taskCache[id];
      }

      try {
        // Gọi API để lấy chi tiết task
        const response = await taskService.getTask(id);
        const task = response.data.data;

        // Cập nhật cache với task mới
        setTaskCache((prev) => ({
          ...prev,
          [id]: task,
        }));

        return task;
      } catch (err: any) {
        // Xử lý lỗi
        const errorMessage =
          err.response?.data?.error || "Không thể tải thông tin công việc";
        toast.error("Lỗi", { description: errorMessage });
        throw err;
      }
    },
    [taskCache]
  );

  /**
   * Tạo task mới
   */
  const createTask = async (data: TaskFormData) => {
    try {
      // Gọi API để tạo task mới
      const response = await taskService.createTask(data);
      const newTask = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", { description: "Đã tạo công việc mới" });

      // Cập nhật cache với task mới
      setTaskCache((prev) => ({
        ...prev,
        [newTask._id]: newTask,
      }));

      return newTask;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tạo công việc mới";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Cập nhật thông tin task
   */
  const updateTask = async (id: string, data: Partial<TaskFormData>) => {
    try {
      // Gọi API để cập nhật task
      const response = await taskService.updateTask(id, data);
      const updatedTask = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", { description: "Đã cập nhật công việc" });
  
      // Cập nhật cache với task đã được cập nhật
      setTaskCache((prev) => ({
        ...prev,
        [id]: updatedTask,
      }));
  
      return updatedTask;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật công việc";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Xóa task
   */
  const deleteTask = async (id: string) => {
    try {
      // Gọi API để xóa task
      await taskService.deleteTask(id);

      // Hiển thị thông báo thành công
      toast.success("Thành công", { description: "Đã xóa công việc" });

      // Xóa task khỏi cache
      setTaskCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      return true;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể xóa công việc";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Đánh dấu task là đã hoàn thành
   */
  const completeTask = async (id: string) => {
    try {
      // Gọi API để đánh dấu task là đã hoàn thành
      const response = await taskService.completeTask(id);
      const updatedTask = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: "Đã đánh dấu hoàn thành công việc",
      });

      // Cập nhật cache với task đã được đánh dấu hoàn thành
      setTaskCache((prev) => ({
        ...prev,
        [id]: updatedTask,
      }));

      return updatedTask;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể đánh dấu hoàn thành công việc";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Thay đổi trạng thái của task
   */
  const changeTaskStatus = async (id: string, status: string) => {
    try {
      // Chuẩn bị dữ liệu cập nhật
      const updateData: any = { status };
      if (status === "completed") {
        updateData.completedDate = new Date().toISOString();
      }

      // Gọi API để cập nhật trạng thái task
      const response = await taskService.updateTask(id, updateData);
      const updatedTask = response.data.data;

      // Hiển thị thông báo thành công
      toast.success("Thành công", {
        description: `Đã cập nhật trạng thái thành ${status}`,
      });

      // Cập nhật cache với task đã được cập nhật trạng thái
      setTaskCache((prev) => ({
        ...prev,
        [id]: updatedTask,
      }));

      return updatedTask;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể cập nhật trạng thái công việc";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Lấy danh sách hoạt động của task
   */
  const getTaskActivities = async (id: string) => {
    try {
      // Gọi API để lấy hoạt động của task
      const response = await taskService.getTaskActivities(id);
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải hoạt động của công việc";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Lấy danh sách task sắp đến hạn
   */
  const getUpcomingTasks = async () => {
    try {
      // Gọi API để lấy danh sách task sắp đến hạn
      const response = await taskService.getUpcomingTasks();
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải công việc sắp đến hạn";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Lấy danh sách task quá hạn
   */
  const getOverdueTasks = async () => {
    try {
      // Gọi API để lấy danh sách task quá hạn
      const response = await taskService.getOverdueTasks();
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải công việc quá hạn";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Thêm bình luận vào task
   */
  const addTaskComment = async (id: string, comment: string) => {
    try {
      // Gọi API để thêm bình luận
      const response = await taskService.addTaskComment(id, comment);

      // Hiển thị thông báo thành công
      toast.success("Thành công", { description: "Đã thêm bình luận" });
      
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể thêm bình luận";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Lấy danh sách bình luận của task
   */
  const getTaskComments = async (id: string) => {
    try {
      // Gọi API để lấy danh sách bình luận
      const response = await taskService.getTaskComments(id);
      return response.data.data;
    } catch (err: any) {
      // Xử lý lỗi
      const errorMessage =
        err.response?.data?.error || "Không thể tải bình luận";
      toast.error("Lỗi", { description: errorMessage });
      throw err;
    }
  };

  /**
   * Thay đổi trang hiện tại và fetch lại dữ liệu
   */
  const changePage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchTasks(newPage, currentFiltersRef.current);
    },
    [fetchTasks]
  );

  /**
   * Effect để fetch dữ liệu ban đầu một lần khi component mount
   */
  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchTasks(initialPage);
      initialFetchDone.current = true;
    }
  }, [initialPage, fetchTasks]);

  // Trả về các state và methods
  return {
    // States
    tasks,
    loading,
    error,
    page,
    totalPages,
    totalTasks,
    
    // Basic CRUD methods
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    
    // Task specific actions
    completeTask,
    changeTaskStatus,
    
    // Additional methods
    getTaskActivities,
    getUpcomingTasks,
    getOverdueTasks,
    addTaskComment,
    getTaskComments,
    
    // Pagination
    changePage,
  };
}