import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login', '/register', '/unauthorized'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Add debug headers for troubleshooting (visible in Network tab)
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('x-has-token', token ? 'yes' : 'no');
  response.headers.set('x-is-public-path', isPublicPath ? 'yes' : 'no');
  
  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    console.log(`[Middleware] No token, redirecting from ${pathname} to login`);
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }
  
  // If token exists and trying to access login/register, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    console.log(`[Middleware] Has token, redirecting from ${pathname} to dashboard`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise, continue to the requested page
  console.log(`[Middleware] Continuing to ${pathname}, token: ${token ? 'exists' : 'none'}`);
  return response;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes, and _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};