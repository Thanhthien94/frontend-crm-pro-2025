import React from 'react';
import Sidebar from './sidebar';
import Header from './header';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './app-sidebar';
import { getCookie } from 'cookies-next';

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const defaultState = getCookie("sidebar:state");
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={defaultState === "true"}>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        <Header />
        {children}
      </main>
    </SidebarProvider>
    // <div className="flex h-screen overflow-hidden">
    //   <div className="w-64 h-full">
    //     <Sidebar />
    //   </div>
    //   <div className="flex flex-col flex-1 overflow-hidden">
    //     <Header />
    //     <main className="flex-1 overflow-auto p-6">
    //       {children}
    //     </main>
    //   </div>
    // </div>
  );
};

export default DashboardLayout;