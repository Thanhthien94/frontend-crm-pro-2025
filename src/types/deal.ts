export interface Deal {
  _id: string;
  title: string;  // Thay đổi name -> title
  value: number;
  currency: string; // Thêm trường này
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  expectedCloseDate?: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  customFields?: Record<string, any>;
  probability?: number;
  status: 'active' | 'inactive';
  organization: string;
  products?: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  activities?: Array<{
    _id: string;
    type: string;
    description: string;
    date: string;
    user: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DealFormData {
  title: string;  // Thay đổi name -> title
  value: number;
  stage: string;
  expectedCloseDate?: string;
  customer: string;
  assignedTo?: string;
  notes?: string;
  customFields?: Record<string, any>;
  probability?: number;
  status?: string;
}