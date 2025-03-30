import api from "@/lib/api";
import { TaskFormData } from "@/types/task";
import { mapTaskFormToApiData } from "@/utils/tasks-mapper";

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
    const apiData = mapTaskFormToApiData(taskData);
    return api.post("/tasks", apiData);
  },

  // Cập nhật task
  updateTask: async (id: string, taskData: Partial<TaskFormData>) => {
    const apiData = mapTaskFormToApiData(taskData as TaskFormData);
    return api.patch(`/tasks/${id}`, apiData);
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
};
