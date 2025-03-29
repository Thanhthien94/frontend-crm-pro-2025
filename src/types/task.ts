export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  organization: string;
  relatedTo?: {
    model: 'Customer' | 'Deal';
    id: string;
  };
  // Thông tin bổ sung khi fetch task detail
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
  completedDate?: string; // Giữ nguyên theo backend
  completedBy?: string | null; // String ID của user hoặc null
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringFrequency: string; // "none", "daily", "weekly", "monthly"
  customFields?: Record<string, any>;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
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