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
import { useEffect } from 'react';

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
      toast('Session Expired', {
        description: 'Your session has expired. Please log in again.',
      });
    }
  }, [errorMessage]);

  // Chuyển hướng nếu đã xác thực
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, router, returnUrl]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Hiển thị toast đầu tiên
      toast('Logging in...', {
        description: 'Please wait...',
      });
      
      await login(values.email, values.password);
      
      toast('Login successful', {
        description: 'Welcome back!',
      });
      
      // Đặt timeout nhỏ để đảm bảo cookies đã được đặt trước khi chuyển hướng
      setTimeout(() => {
        router.push(returnUrl);
      }, 500);
    } catch (error: any) {
      toast('Login failed', {
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