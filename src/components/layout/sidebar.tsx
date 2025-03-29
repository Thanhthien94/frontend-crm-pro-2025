'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  CheckSquare, 
  BarChart, 
  Settings,
  UserCog,
  LogOut,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/use-permission';

const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user, loading, refreshUserData } = useAuth();
  const { checkPermission } = usePermission();
  const [localLoading, setLocalLoading] = useState(true);
  
  // Thử refresh dữ liệu người dùng khi component mount
  useEffect(() => {
    const init = async () => {
      try {
        // Chỉ gọi refresh nếu có user trong localStorage nhưng không có trong state
        if (!user && localStorage.getItem('user')) {
          await refreshUserData();
        }
      } catch (error) {
        console.error("Failed to refresh user data in sidebar:", error);
      } finally {
        setLocalLoading(false);
      }
    };
    
    init();
  }, [user, refreshUserData]);
  
  // Hiển thị tất cả menu không cần kiểm tra quyền hạn trong trường hợp khẩn cấp
  const hardcodedNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Deals', href: '/deals', icon: DollarSign },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Reports', href: '/reports', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Users', href: '/users', icon: UserCog },
  ];
  
  // Hiển thị loading nếu đang tải
  if (loading || localLoading) {
    return (
      <div className="flex flex-col h-full border-r bg-background items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="px-6 py-6">
        <Link href="/dashboard">
          <h2 className="text-2xl font-bold">CRM Pro</h2>
        </Link>
      </div>
      <div className="flex-1 px-4 space-y-1">
        <nav className="flex-1 space-y-1">
          {/* Sử dụng hardcodedNavigation để hiển thị tất cả menu */}
          {hardcodedNavigation.map((item) => {
            const isActive = pathname === item.href || 
                           (pathname?.startsWith(item.href) && item.href !== '/dashboard');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="mb-4 px-3 py-2">
          <p className="text-sm font-medium">{user?.name || 'Người dùng'}</p>
          <p className="text-xs text-muted-foreground">{user?.organization?.name || 'Tổ chức'}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</p>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;