export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
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
  completedBy?: string | { _id: string; name: string; email: string };
  isRecurring: boolean;
  recurringFrequency: 'none' | 'daily' | 'weekly' | 'monthly';
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}