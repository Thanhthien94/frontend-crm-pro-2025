'use client';

import { useAuth } from '@/contexts/auth-context';

export type Resource = 'customers' | 'deals' | 'tasks' | 'reports' | 'settings' | 'users';
export type Action = 'view' | 'create' | 'update' | 'delete';

export function usePermission() {
  const { user } = useAuth();
  
  const checkPermission = (resource: Resource, action: Action): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }
    
    // Define permission rules for regular users
    const userPermissions: Record<Resource, Action[]> = {
      customers: ['view', 'create', 'update'],
      deals: ['view', 'create', 'update'],
      tasks: ['view', 'create', 'update', 'delete'],
      reports: ['view'],
      settings: [],
      users: []
    };
    
    return userPermissions[resource]?.includes(action) || false;
  };
  
  return { checkPermission };
}