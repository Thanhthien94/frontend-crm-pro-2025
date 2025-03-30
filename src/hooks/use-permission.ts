import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";

export type ResourceType =
  | "customer"
  | "deal"
  | "task"
  | "product"
  | "organization"
  | "user"
  | "webhook"
  | "api_key"
  | "analytics"
  | "custom_field"
  | "report"
  | "setting";

export type ActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "assign"
  | "manage";

// Cache cho permission checks
const permissionCache: Record<string, boolean> = {};

export function usePermission() {
  const { user } = useAuth();
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [permissions, setPermissions] = useState<any[]>([]);

  // Tải tất cả permissions từ API
  const loadPermissions = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get("/permissions/list");

      // Lưu permissions vào state
      if (response.data && response.data.data) {
        setPermissions(response.data.data);

        // Cập nhật cache
        if (Array.isArray(response.data.data)) {
          response.data.data.forEach((permission: any) => {
            const cacheKey = `${permission.resource}:${permission.action}`;
            permissionCache[cacheKey] = true;
          });
        }
      }

      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      setPermissionsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && !permissionsLoaded) {
      loadPermissions();
    }
  }, [user, permissionsLoaded, loadPermissions]);

  // Kiểm tra quyền
  const checkPermission = useCallback(
    (
      resource: ResourceType,
      action: ActionType,
      resourceId?: string
    ): boolean => {
      if (!user) return false;

      // Admin và superadmin luôn có tất cả quyền
      if (user.role === "admin" || user.role === "superadmin") {
        return true;
      }

      // Kiểm tra cache
      const cacheKey = resourceId
        ? `${resource}:${action}:${resourceId}`
        : `${resource}:${action}`;

      if (permissionCache[cacheKey] !== undefined) {
        return permissionCache[cacheKey];
      }

      // Nếu permissions đã được tải, kiểm tra trong state
      if (permissionsLoaded && permissions.length > 0) {
        const hasPermission = permissions.some(
          (p) => p.resource === resource && p.action === action
        );

        // Lưu kết quả vào cache
        permissionCache[cacheKey] = hasPermission;
        return hasPermission;
      }

      // Fallback đến simple role-based check
      return fallbackRoleCheck(resource, action);
    },
    [user, permissionsLoaded, permissions]
  );

  // Fallback simple check
  const fallbackRoleCheck = (
    resource: ResourceType,
    action: ActionType
  ): boolean => {
    if (!user) return false;

    if (user.role === "admin" || user.role === "superadmin") {
      return true;
    }

    // Quyền mặc định cho users
    const userPermissions: Record<ResourceType, ActionType[]> = {
      customer: ["read", "create", "update"],
      deal: ["read", "create", "update"],
      task: ["read", "create", "update", "delete"],
      product: ["read"],
      organization: [],
      user: [],
      webhook: [],
      api_key: [],
      analytics: ["read"],
      custom_field: ["read"],
      report: ["read"],
      setting: [],
    };

    return userPermissions[resource]?.includes(action) || false;
  };

  // Kiểm tra quyền sở hữu
  const isOwner = useCallback(
    (resource: any): boolean => {
      if (!user || !resource) return false;

      if (resource.assignedTo) {
        return (
          resource.assignedTo._id === user.id || resource.assignedTo === user.id
        );
      }

      if (resource.createdBy) {
        return (
          resource.createdBy._id === user.id || resource.createdBy === user.id
        );
      }

      return false;
    },
    [user]
  );

  return {
    checkPermission,
    isOwner,
    permissionsLoaded,
    reloadPermissions: loadPermissions,
  };
}
