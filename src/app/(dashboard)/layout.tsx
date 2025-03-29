"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import TokenSessionGuard from "@/components/auth/token-session-guard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TokenSessionGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </TokenSessionGuard>
  );
}