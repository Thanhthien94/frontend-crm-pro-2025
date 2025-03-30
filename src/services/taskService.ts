import api from "@/lib/api";
import { TaskFormData } from "@/types/task";

export const taskService = {
  // Lấy danh sách tasks với các filter
  getTasks: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    return api.get(`/tasks?${queryParams}`);
  },

  // Lấy tasks sắp đến hạn
  getUpcomingTasks: async () => {
    return api.get("/tasks/upcoming");
  },

  // Lấy tasks quá hạn
  getOverdueTasks: async () => {
    return api.get("/tasks/overdue");
  },

  // Lấy chi tiết task
  getTask: async (id: string) => {
    return api.get(`/tasks/${id}`);
  },

  // Tạo task mới
  createTask: async (taskData: TaskFormData) => {
    // Không cần map vì frontend đã sử dụng cùng cấu trúc với backend
    return api.post("/tasks", taskData);
  },

  // Cập nhật task
  updateTask: async (id: string, taskData: Partial<TaskFormData>) => {
    // Tạo bản sao dữ liệu để xử lý
    const processedData = { ...taskData };

    // Xử lý relatedTo nếu tồn tại
    if (
      processedData.relatedTo &&
      processedData.relatedTo.model &&
      processedData.relatedTo.id
    ) {
      // Chuyển đổi từ relatedTo sang các trường cụ thể dựa trên model
      if (processedData.relatedTo.model === "Customer") {
        processedData.customer = processedData.relatedTo.id;
        // Xóa trường deal nếu tồn tại vì chỉ có thể liên kết với 1 trong 2
        delete processedData.deal;
      } else if (processedData.relatedTo.model === "Deal") {
        processedData.deal = processedData.relatedTo.id;
        // Xóa trường customer nếu tồn tại vì chỉ có thể liên kết với 1 trong 2
        delete processedData.customer;
      }

      // Xóa trường relatedTo vì backend không cần nó
      delete processedData.relatedTo;
    } else if (processedData.relatedTo) {
      // Nếu relatedTo không đầy đủ, xóa nó đi
      delete processedData.relatedTo;
      // Xóa cả customer và deal nếu relatedTo không hợp lệ
      delete processedData.customer;
      delete processedData.deal;
    }

    // Xử lý trường assignedTo nếu là đối tượng
    if (
      processedData.assignedTo &&
      typeof processedData.assignedTo === "object"
    ) {
      // @ts-ignore
      processedData.assignedTo =
        processedData.assignedTo._id || processedData.assignedTo.id;
    }

    if (processedData.reminderDate) {
        delete processedData.reminderDate;
    }

    return api.patch(`/tasks/${id}`, processedData);
  },

  // Xóa task
  deleteTask: async (id: string) => {
    return api.delete(`/tasks/${id}`);
  },

  // Hoàn thành task
  completeTask: async (id: string) => {
    return api.patch(`/tasks/${id}`, {
      status: "completed",
      completedDate: new Date().toISOString(),
    });
  },

  // Lấy tổng hợp task
  getTaskSummary: async () => {
    return api.get("/tasks/summary");
  },

  // Lấy tasks theo đối tượng liên quan
  getRelatedTasks: async (entityType: string, entityId: string) => {
    return api.get(`/tasks/related/${entityType}/${entityId}`);
  },

  // Lấy tasks được gán cho người dùng hiện tại
  getMyTasks: async (filters = {}) => {
    const apiFilters = { ...filters, my: "true" };

    const queryParams = new URLSearchParams({
      ...apiFilters,
    });

    return api.get(`/tasks?${queryParams}`);
  },
};
