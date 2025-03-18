export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    organization: {
      id: string;
      name: string;
      plan?: string;
    };
  }