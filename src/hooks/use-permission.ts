"use client";

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

// Cache for permission checks to reduce API calls
const permissionCache: Record<string, boolean> = {};

export function usePermission() {
  const { user } = useAuth();
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Load all permissions data for the user
  const loadPermissions = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      // Tận dụng API access-control để kiểm tra quyền
      // Đây chỉ là gợi ý - endpoint này có thể cần được thay đổi tùy thuộc vào API thực tế
      const response = await api.get("/permissions/list");

      // Cập nhật cache với dữ liệu từ backend
      if (response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((permission: any) => {
          const cacheKey = `${permission.resource}:${permission.action}`;
          permissionCache[cacheKey] = true;
        });
      }

      setPermissionsLoaded(true);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      // Fallback to role-based permissions if API fails
      setPermissionsLoaded(true);
    }
  }, [user]);

  // Load permissions once when component mounts
  useEffect(() => {
    if (user && !permissionsLoaded) {
      loadPermissions();
    }
  }, [user, permissionsLoaded, loadPermissions]);

  /**
   * Kiểm tra quyền của người dùng
   */
  const checkPermission = useCallback(
    async (
      resource: ResourceType,
      action: ActionType,
      resourceId?: string
    ): Promise<boolean> => {
      if (!user) {
        console.warn("checkPermission called without user data");
        return false;
      }

      // Admin và superadmin luôn có tất cả quyền
      if (user.role === "admin" || user.role === "superadmin") {
        return true;
      }

      // Kiểm tra cache trước
      const cacheKey = resourceId
        ? `${resource}:${action}:${resourceId}`
        : `${resource}:${action}`;

      if (permissionCache[cacheKey] !== undefined) {
        return permissionCache[cacheKey];
      }

      // Nếu không có trong cache và permissions đã được load
      if (permissionsLoaded) {
        // Sử dụng API để kiểm tra quyền cụ thể
        try {
          // Gọi API kiểm tra quyền
          const response = await api.post("/api/v1/access-control/check", {
            resource,
            action,
            resourceId,
          });

          // Lưu kết quả vào cache
          const hasPermission = response.data.allowed === true;
          permissionCache[cacheKey] = hasPermission;

          return hasPermission;
        } catch (error) {
          console.error("Permission check failed:", error);

          // Fallback to simplistic role-based check if API fails
          return fallbackRoleCheck(resource, action);
        }
      }

      // Fallback to simplistic role-based check if permissions not loaded yet
      return fallbackRoleCheck(resource, action);
    },
    [user, permissionsLoaded]
  );

  /**
   * Fallback role-based check nếu không thể gọi API
   */
  const fallbackRoleCheck = (
    resource: ResourceType,
    action: ActionType
  ): boolean => {
    if (!user) return false;

    // Admin và superadmin luôn có tất cả quyền
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
    };

    return userPermissions[resource]?.includes(action) || false;
  };

  /**
   * Kiểm tra nếu người dùng là chủ sở hữu của resource
   */
  const isOwner = useCallback(
    (resource: any): boolean => {
      if (!user || !resource) return false;

      // Kiểm tra nếu resource có trường assignedTo
      if (resource.assignedTo) {
        return (
          resource.assignedTo._id === user.id ||
          resource.assignedTo === user.id
        );
      }

      // Kiểm tra nếu resource có trường createdBy
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
  };
}
