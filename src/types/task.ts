export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  // Thay đổi từ 'pending' sang 'todo' theo backend
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'; // Chú ý chính tả 'cancelled' với hai chữ l
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
  completedBy?: string | { _id: string; name: string; email: string; };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
  recurringFrequency: 'none' | 'daily' | 'weekly' | 'monthly';
  customFields?: Record<string, any>;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string; // Frontend form vẫn có thể giữ nguyên, nhưng cần mapper khi gửi lên server
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