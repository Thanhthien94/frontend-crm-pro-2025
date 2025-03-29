export interface Task {
    _id: string;
    title: string;
    description?: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'canceled';
    assignedTo: {
      _id: string;
      name: string;
      email: string;
    };
    organization: string;
    relatedTo?: {
      model: 'Customer' | 'Deal';
      id: string;
      name?: string; // Additional field to store related entity name
    };
    reminderDate?: string;
    completedDate?: string;
    completedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
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
    customFields?: Record<string, any>;
  }