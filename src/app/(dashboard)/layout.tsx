"use client";

import { useEffect } from "react";
import { getCookie } from "cookies-next";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple direct check for authentication
  useEffect(() => {
    // Check for token cookie
    const token = getCookie('token');
    console.log('Dashboard layout - token exists:', !!token);
    
    // If no token redirect to login
    if (!token) {
      console.log('No token found, redirecting to login');
      window.location.href = '/login';
    }
  }, []);

  // Assume authenticated since middleware should have redirected if not
  return (
    <DashboardLayout>{children}</DashboardLayout>
  );
}
