// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Đường dẫn công khai không yêu cầu xác thực
const publicPaths = [
  "/login",
  "/register",
  "/unauthorized",
  "/",
  "/about",
  "/features",
  "/pricing",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Kiểm tra đường dẫn có phải là tĩnh hay không
const isStaticPath = (path: string) => {
  return (
    path.startsWith("/api/") || path.startsWith("/_next/") || path.includes(".")
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các đường dẫn tĩnh
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Kiểm tra đường dẫn công khai
  const isPublicPath = publicPaths.some((path) => pathname === path);

  console.log(`[MIDDLEWARE] Path: ${pathname}, isPublic: ${isPublicPath}`);

  // Lấy token từ cookie
  const token = request.cookies.get("token")?.value;

  // Kiểm tra nếu đường dẫn là login callback (có returnUrl)
  const isLoginCallback =
    pathname === "/login" && request.nextUrl.searchParams.has("returnUrl");

  // Nếu không có token và đang truy cập route được bảo vệ, chuyển hướng đến login
  if (!token && !isPublicPath) {
    console.log(
      `[MIDDLEWARE] Không có token, chuyển hướng từ ${pathname} đến login`
    );
    const loginUrl = new URL("/login", request.url);
    // Lưu đường dẫn hiện tại để quay lại sau khi đăng nhập
    loginUrl.searchParams.set("returnUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }

  // Nếu đã có token mà vẫn vào login/register (không phải login callback),
  // chuyển hướng đến dashboard
  if (
    token &&
    (pathname === "/login" || pathname === "/register") &&
    !isLoginCallback
  ) {
    console.log(
      `[MIDDLEWARE] Đã có token, chuyển hướng từ ${pathname} đến dashboard`
    );
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Nếu không có vấn đề gì, tiếp tục đến trang được yêu cầu
  console.log(`[MIDDLEWARE] Tiếp tục đến ${pathname}`);
  return NextResponse.next();
}

// Cấu hình middleware chạy trên các path cụ thể
export const config = {
  matcher: [
    // Áp dụng cho tất cả route trừ static files, api routes, và _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
