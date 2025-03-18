'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { getCookie } from 'cookies-next';

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function AuthGuard({ 
  children, 
  allowedRoles = ['admin', 'user'] 
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if route requires authentication
    const authCheck = async () => {
      // If still loading, wait
      if (loading) {
        console.log('Auth check - still loading, waiting...');
        return;
      }
      
      try {
        // Check for token in cookie
        const token = getCookie('token');
        
        // Debug info
        console.log('Auth check - token exists:', !!token);
        console.log('Auth check - user exists:', !!user);
        console.log('Auth check - is authenticated:', isAuthenticated);
        
        // If we have a token, consider it mostly authenticated
        // This approach is more permissive to avoid login loops
        if (token) {
          console.log('Auth check - token found, setting authorized to true');
          setAuthorized(true);
          return;
        }
        
        // If we have user data but no token (inconsistent state)
        if (!token && user) {
          console.log('Auth check - inconsistent state: user without token');
          localStorage.removeItem('user');
          window.location.href = '/login?error=session_expired';
          return;
        }
        
        // No token, no authorization
        if (!token) {
          console.log('Auth check - no token found, redirecting to login');
          window.location.href = `/login?returnUrl=${encodeURIComponent(pathname)}`;
          return;
        }
      } catch (error) {
        console.error('Auth check - error during check:', error);
        setAuthorized(false);
      }
    };

    authCheck();
  }, [user, loading, isAuthenticated, router, pathname, allowedRoles]);

  // Show loading spinner while checking auth
  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authorized, render children
  return <>{children}</>;
}