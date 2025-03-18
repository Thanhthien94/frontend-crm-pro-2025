'use client';

import { usePermission, Resource, Action } from '@/hooks/use-permission';

interface PermissionGateProps {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGate({
  resource,
  action,
  children,
  fallback = null
}: PermissionGateProps) {
  const { checkPermission } = usePermission();
  
  if (!checkPermission(resource, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}