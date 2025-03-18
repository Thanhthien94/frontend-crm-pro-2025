// src/components/auth/token-session-guard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getCookie } from 'cookies-next';
import { debugAuthState } from '@/lib/auth-debug';

export default function TokenSessionGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { refreshUserData, isAuthenticated } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = getCookie('token');
      
      // Debug current state
      debugAuthState();
      
      if (token && !isAuthenticated) {
        try {
          // Try to refresh user data
          await refreshUserData();
        } catch (error) {
          console.error('Token validation failed:', error);
        }
      }
      
      setIsValidating(false);
    };
    
    validateToken();
    
    // Kiểm tra định kỳ token và session
    const interval = setInterval(() => {
      validateToken();
    }, 5 * 60 * 1000); // Kiểm tra mỗi 5 phút
    
    return () => clearInterval(interval);
  }, [refreshUserData, isAuthenticated]);

  if (isValidating) {
    return null; // Hoặc hiển thị loading spinner
  }

  return <>{children}</>;
}