'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getCookie } from 'cookies-next';
import { debugAuthState } from '@/lib/auth-debug';
import { Loader2 } from 'lucide-react';

export default function TokenSessionGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter();
  const { refreshUserData, isAuthenticated, loading: authLoading } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [validationAttempts, setValidationAttempts] = useState(0);

  useEffect(() => {
    // Kiểm tra nếu có returnUrl trong localStorage để chuyển hướng sau khi đăng nhập
    const checkReturnUrl = () => {
      const savedReturnUrl = localStorage.getItem('returnUrl');
      if (savedReturnUrl && isAuthenticated) {
        localStorage.removeItem('returnUrl');
        router.push(savedReturnUrl);
      }
    };

    checkReturnUrl();
  }, [isAuthenticated, router]);

  useEffect(() => {
    const validateToken = async () => {
      const token = getCookie('token');
      
      // Debug trạng thái hiện tại
      debugAuthState();
      
      if (token && !isAuthenticated) {
        try {
          // Thử làm mới dữ liệu người dùng
          await refreshUserData();
          console.log('Token validation successful, user data refreshed');
        } catch (error) {
          console.error('Xác thực token thất bại:', error);
          // Tăng số lần thử
          setValidationAttempts(prev => prev + 1);
        }
      } else if (!token) {
        console.log('No token found during validation');
      } else {
        console.log('Token valid and user already authenticated');
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

  // Kiểm tra nếu đã thử xác thực nhiều lần nhưng vẫn thất bại
  useEffect(() => {
    if (validationAttempts >= 3) {
      // Nếu đã thử 3 lần mà vẫn thất bại, đưa người dùng về trang đăng nhập
      console.error('Quá nhiều lần thử xác thực thất bại, quay lại trang đăng nhập');
      router.push('/login');
    }
  }, [validationAttempts, router]);

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