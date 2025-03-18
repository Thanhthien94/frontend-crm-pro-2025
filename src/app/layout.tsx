import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/sonner";

// import { useEffect } from 'react';
import { addAuthDebugButton } from '@/lib/auth-debug';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Pro',
  description: 'Professional CRM system for businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Thêm nút debug auth trong development mode
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     addAuthDebugButton();
  //   }
  // }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}