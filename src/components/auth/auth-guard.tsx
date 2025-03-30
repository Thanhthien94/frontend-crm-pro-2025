"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function AuthGuard({
  children,
  allowedRoles = ["admin", "user"],
}: AuthGuardProps) {
  const { user, loading, isAuthenticated, refreshUserData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Kiểm tra nếu có lỗi auth được lưu trong localStorage
    const checkAuthError = () => {
      const authError = localStorage.getItem("auth_error");
      if (authError) {
        console.log("[AUTH-GUARD] Phát hiện lỗi xác thực:", authError);
        localStorage.removeItem("auth_error");

        if (authError === "session_expired") {
          router.push(
            `/login?error=session_expired&returnUrl=${encodeURIComponent(
              pathname
            )}`
          );
          return true;
        }
      }
      return false;
    };

    // Kiểm tra xem người dùng đã được xác thực chưa
    const checkAuthentication = async () => {
      setCheckingAuth(true);

      // Kiểm tra lỗi trước
      if (checkAuthError()) {
        setCheckingAuth(false);
        return;
      }

      // Nếu đang tải, chờ
      if (loading) {
        console.log("[AUTH-GUARD] Đang tải, chờ...");
        return;
      }

      try {
        // Nếu đã có user data, xem như đã xác thực
        if (isAuthenticated) {
          console.log("[AUTH-GUARD] Đã xác thực với user hiện tại");
          setAuthorized(true);
          setCheckingAuth(false);
          return;
        }

        // Nếu chưa có user data, thử refresh để kiểm tra phiên
        console.log("[AUTH-GUARD] Chưa xác thực, thử refresh user data");
        const userData = await refreshUserData();

        if (userData) {
          console.log("[AUTH-GUARD] Refresh thành công, đã xác thực");
          setAuthorized(true);
        } else {
          console.log("[AUTH-GUARD] Refresh thất bại, chuyển hướng đến login");
          router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        }
      } catch (error) {
        console.error("[AUTH-GUARD] Lỗi khi kiểm tra xác thực:", error);
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [user, loading, isAuthenticated, router, pathname, refreshUserData]);

  // Kiểm tra vai trò người dùng nếu cần
  useEffect(() => {
    if (user && authorized && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        console.log("[AUTH-GUARD] Không có quyền truy cập");
        router.push("/unauthorized");
      }
    }
  }, [user, authorized, allowedRoles, router]);

  // Hiển thị loading khi đang kiểm tra xác thực
  if (loading || checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nếu chưa được xác thực, không hiển thị gì cả (đã chuyển hướng)
  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nếu đã xác thực và có quyền truy cập, hiển thị nội dung
  return <>{children}</>;
}
