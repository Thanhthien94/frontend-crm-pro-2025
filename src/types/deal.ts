export interface Deal {
  _id: string;
  title: string; // Sử dụng title theo backend
  value: number;
  currency?: string;
  stage:
    | "lead"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "closed-won"
    | "closed-lost";
  expectedCloseDate?: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    company?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  customFields?: Record<string, any>;
  probability?: number;
  status: "active" | "inactive";
  organization?: string;
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

// Form data cũng sử dụng title thay vì name để phù hợp với API
export interface DealFormData {
  title: string; // Sử dụng title theo backend
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
