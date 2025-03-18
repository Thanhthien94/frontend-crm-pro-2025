import React from 'react';
import AuthRedirect from '@/components/auth/auth-redirect';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRedirect>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">CRM Pro</h1>
            <p className="mt-2 text-gray-600">Manage your customers with ease</p>
          </div>
          {children}
        </div>
      </div>
    </AuthRedirect>
  );
}