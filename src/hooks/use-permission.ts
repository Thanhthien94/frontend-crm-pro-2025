'use client';

import { useAuth } from '@/contexts/auth-context';

export type Resource = 'customers' | 'deals' | 'tasks' | 'reports' | 'settings' | 'users';
export type Action = 'read' | 'create' | 'update' | 'delete';

export function usePermission() {
  const { user } = useAuth();
  
  const checkPermission = (resource: Resource, action: Action): boolean => {
    if (!user) {
      // Thêm log để debug
      console.warn('checkPermission called without user data');
      return false;
    }
    
    // Admin has all permissions
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }
    
    // Define permission rules for regular users
    const userPermissions: Record<Resource, Action[]> = {
      customers: ['read', 'create', 'update'],
      deals: ['read', 'create', 'update'],
      tasks: ['read', 'create', 'update', 'delete'],
      reports: ['read'],
      settings: [],
      users: []
    };
    
    return userPermissions[resource]?.includes(action) || false;
  };
  
  return { checkPermission };
}