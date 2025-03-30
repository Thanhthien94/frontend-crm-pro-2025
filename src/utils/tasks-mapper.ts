import { Task, TaskFormData } from "@/types/task";

// Map từ frontend form sang API format
export function mapTaskFormToApiData(formData: TaskFormData) {
  // Chuyển đổi status từ frontend sang backend
  let status = formData.status;
  if (status === "pending") status = "todo";
  if (status === "canceled") status = "cancelled";

  return {
    ...formData,
    status,
  };
}

// Map từ API data sang frontend form
export function mapApiDataToTaskForm(apiData: Task): TaskFormData {
  // Chuyển đổi status từ backend sang frontend
  let status = apiData.status;
  if (status === "todo") status = "pending";
  if (status === "cancelled") status = "canceled";

  return {
    title: apiData.title,
    description: apiData.description,
    dueDate: apiData.dueDate,
    priority: apiData.priority,
    status,
    assignedTo: apiData.assignedTo?._id,
    relatedTo: apiData.relatedTo,
    reminderDate: apiData.reminderDate,
    isRecurring: apiData.isRecurring,
    recurringFrequency: apiData.recurringFrequency,
    customFields: apiData.customFields,
  };
}
