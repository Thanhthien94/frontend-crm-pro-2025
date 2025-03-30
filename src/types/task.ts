export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  // Sử dụng đúng các giá trị của backend
  status: "todo" | "in_progress" | "completed" | "cancelled"; // Theo backend
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  organization: string;
  relatedTo?: {
    model: "Customer" | "Deal";
    id: string;
  };
  customer?: {
    _id: string;
    name: string;
    company?: string;
    email?: string;
  };
  deal?: {
    _id: string;
    title: string;
    value?: number;
  };
  reminderDate?: string;
  completedDate?: string;
  completedBy?: string | { _id: string; name: string; email: string };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringFrequency: "none" | "daily" | "weekly" | "monthly";
  customFields?: Record<string, any>;
}

// Form data cũng sử dụng status nhất quán với API
export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  // Sử dụng đúng giá trị của backend
  status: string; // Sẽ là 'todo', 'in_progress', 'completed', hoặc 'cancelled'
  assignedTo?: string;
  relatedTo?: {
    model: string;
    id: string;
  };
  reminderDate?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  customFields?: Record<string, any>;
}
