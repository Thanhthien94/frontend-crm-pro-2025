"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  CheckSquare,
  User,
  Settings,
  BarChart,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Action, Resource, usePermission } from "@/hooks/use-permission";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission?: {
    resource: Resource;
    action: Action;
  };
};

export function AppSidebar() {
  const { user } = useAuth();
  const { checkPermission } = usePermission();

  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      title: "Bảng điều khiển",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Khách hàng",
      href: "/customers",
      icon: <Users className="h-5 w-5" />,
      permission: {
        resource: "customers",
        action: "read",
      },
    },
    {
      title: "Giao dịch",
      href: "/deals",
      icon: <DollarSign className="h-5 w-5" />,
      permission: {
        resource: "deals",
        action: "read",
      },
    },
    {
      title: "Công việc",
      href: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      permission: {
        resource: "tasks",
        action: "read",
      },
    },
    {
      title: "Báo cáo",
      href: "/reports",
      icon: <BarChart className="h-5 w-5" />,
      permission: {
        resource: "reports",
        action: "read",
      },
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      permission: {
        resource: "settings",
        action: "read",
      },
    },
    {
      title: "Hồ sơ",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.permission ||
      checkPermission(item.permission.resource, item.permission.action)
  );

  return (
    <div>
      {/* Trigger hiển thị trên mobile */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-4 md:hidden">
        {/* <SidebarTrigger /> */}
        <div className="flex-1">
          <h1 className="text-xl font-bold">CRM Pro</h1>
        </div>
      </div>

      {/* Sidebar chính */}
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold">CRM Pro</h1>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  }
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          {user && (
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium text-primary">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.organization?.name}
                </span>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
