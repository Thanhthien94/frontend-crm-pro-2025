// src/components/forms/login-form.tsx

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from "sonner"
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const errorMessage = searchParams.get('error');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Hiển thị thông báo lỗi từ URL nếu có
  useEffect(() => {
    if (errorMessage === 'session_expired') {
      toast.error('Session Expired', {
        description: 'Your session has expired. Please log in again.',
      });
    }
  }, [errorMessage]);

  // Chuyển hướng nếu đã xác thực và không đang trong quá trình đăng nhập
  useEffect(() => {
    if (isAuthenticated && !isRedirecting) {
      // Lưu URL trả về vào localStorage để sử dụng sau khi đăng nhập
      if (returnUrl) {
        localStorage.setItem('returnUrl', returnUrl);
      }
      
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl, isRedirecting]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsRedirecting(true);
      
      // Hiển thị toast đầu tiên
      toast('Logging in...', {
        description: 'Please wait...',
      });
      
      await login(values.email, values.password);
      
      toast.success('Login successful', {
        description: 'Welcome back!',
      });
      
      // Lưu URL trả về vào localStorage để sử dụng sau khi đăng nhập
      if (returnUrl) {
        localStorage.setItem('returnUrl', returnUrl);
      }
      
      // Đặt timeout dài hơn để đảm bảo cookies đã được đặt trước khi chuyển hướng
      setTimeout(() => {
        window.location.href = returnUrl; // Sử dụng window.location thay vì router.push
      }, 1000);
    } catch (error: any) {
      setIsRedirecting(false);
      toast.error('Login failed', {
        description: error.response?.data?.error || 'Invalid credentials',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </Form>
  );
}