'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getCookie } from 'cookies-next';
import { debugAuthState } from '@/lib/auth-debug';
import { Loader2 } from 'lucide-react';

export default function TokenSessionGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { refreshUserData, isAuthenticated, loading: authLoading } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = getCookie('token');
      
      // Debug trạng thái hiện tại
      debugAuthState();
      
      if (token && !isAuthenticated) {
        try {
          // Thử làm mới dữ liệu người dùng
          await refreshUserData();
        } catch (error) {
          console.error('Xác thực token thất bại:', error);
        }
      }
      
      setIsValidating(false);
    };
    
    validateToken();
    
    // Kiểm tra định kỳ token và phiên
    const interval = setInterval(() => {
      validateToken();
    }, 5 * 60 * 1000); // Kiểm tra mỗi 5 phút
    
    return () => clearInterval(interval);
  }, [refreshUserData, isAuthenticated]);

  // Hiển thị loading trong khi xác thực token hoặc auth context đang tải
  if (isValidating || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}