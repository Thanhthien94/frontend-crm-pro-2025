'use client';

import React from 'react';
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
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { usePermission } from '@/hooks/use-permission';

const Sidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const { checkPermission } = usePermission();
  
  // Define nav items with permission requirements
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users, resource: 'customers', action: 'view' },
    { name: 'Deals', href: '/deals', icon: DollarSign, resource: 'deals', action: 'view' },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, resource: 'tasks', action: 'view' },
    { name: 'Reports', href: '/reports', icon: BarChart, resource: 'reports', action: 'view' },
    { name: 'Settings', href: '/settings', icon: Settings, resource: 'settings', action: 'view' },
  ];
  
  // Add Users link for admins
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    navigation.push({ name: 'Users', href: '/users', icon: UserCog, resource: 'users', action: 'view' });
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
          {navigation.map((item) => {
            // Check if current path matches or starts with this nav item's path
            const isActive = pathname === item.href || 
                           (pathname?.startsWith(item.href) && item.href !== '/dashboard');
            
            // Skip items the user doesn't have permission for
            if (item.resource && item.action && !checkPermission(item.resource as any, item.action as any)) {
              return null;
            }
            
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
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.organization.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
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