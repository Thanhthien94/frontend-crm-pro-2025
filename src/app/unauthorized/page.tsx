'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

export default function UnauthorizedPage() {
  const { logout } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg text-center mb-8">
        You don't have permission to access this page.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
        <Button onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}