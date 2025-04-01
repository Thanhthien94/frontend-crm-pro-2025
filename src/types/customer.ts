import { Deal } from "./deal";
import { Task } from "./task";

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'lead' | 'prospect' | 'customer' | 'churned';
  status: 'active' | 'inactive';
  source?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  organization?: string;
  customFields?: Record<string, any>;
  relatedDeals?: Array<Deal>;
  relatedTasks?: Array<Task>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: string;
  status: string;
  source?: string;
  assignedTo?: string;
  notes?: string;
  customFields?: Record<string, any>;
}