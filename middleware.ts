// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths không yêu cầu xác thực
const publicPaths = ['/login', '/register', '/unauthorized', '/', '/about', '/features', '/pricing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // static files
  );
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Add debug headers for troubleshooting (visible in Network tab)
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('x-has-token', token ? 'yes' : 'no');
  response.headers.set('x-is-public-path', isPublicPath ? 'yes' : 'no');
  
  // Nếu không có token và đang truy cập route được bảo vệ, chuyển hướng đến login
  if (!token && !isPublicPath) {
    console.log(`[Middleware] No token, redirecting from ${pathname} to login`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(loginUrl);
  }
  
  // Nếu đã có token mà vẫn vào login/register, chuyển hướng đến dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    console.log(`[Middleware] Has token, redirecting from ${pathname} to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Nếu không, tiếp tục đến trang được yêu cầu
  console.log(`[Middleware] Continuing to ${pathname}, token: ${token ? 'exists' : 'none'}`);
  return response;
}

// Cấu hình middleware chạy trên các path cụ thể
export const config = {
  matcher: [
    // Áp dụng cho tất cả route trừ static files, api routes, và _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};