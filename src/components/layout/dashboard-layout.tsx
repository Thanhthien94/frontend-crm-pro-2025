import React from 'react';
import Sidebar from './sidebar';
import Header from './header';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from './app-sidebar';
import { getCookie } from 'cookies-next';

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const defaultState = getCookie("sidebar_state")?.toString() === "true" || false;
const HEADER_HEIGHT = '80px';
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={defaultState}>
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header />
          <main 
            className="flex-1 overflow-auto md:pr-4 md:pl-2 py-2"
            style={{ marginTop: HEADER_HEIGHT }}
          >
            {children}
          </main>
        </div>
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