"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import TokenSessionGuard from "@/components/auth/token-session-guard";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TokenSessionGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </TokenSessionGuard>
  );
}