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
import { ActionType, ResourceType, usePermission } from "@/hooks/use-permission";
import { useSidebar } from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission?: {
    resource: ResourceType;
    action: ActionType;
  };
};

export function AppSidebar() {
  const { user } = useAuth();
  const { open, isMobile } = useSidebar();
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
        resource: "customer",
        action: "read",
      },
    },
    {
      title: "Thương vụ",
      href: "/deals",
      icon: <DollarSign className="h-5 w-5" />,
      permission: {
        resource: "deal",
        action: "read",
      },
    },
    {
      title: "Công việc",
      href: "/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      permission: {
        resource: "task",
        action: "read",
      },
    },
    {
      title: "Báo cáo",
      href: "/reports",
      icon: <BarChart className="h-5 w-5" />,
      permission: {
        resource: "report",
        action: "read",
      },
    },
    {
      title: "Cài đặt",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      permission: {
        resource: "setting",
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
          {/* <h1 className="text-xl font-bold">CRM Pro</h1> */}
        </div>
      </div>

      {/* Sidebar chính */}
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
          <div data-active={!open} className="flex items-center gap-2 data-[active=true]:hidden">
            <div className="flex-1">
              <h1 className="text-xl font-bold">CRM Pro</h1>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href} className="px-2">
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
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium text-primary">
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              <div data-active={!open} className="flex flex-col truncate data-[active=true]:hidden">
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
