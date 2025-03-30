"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Vui lòng nhập địa chỉ email hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export default function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  const errorMessage = searchParams.get("error");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Kiểm tra lỗi từ URL
  useEffect(() => {
    if (errorMessage === "session_expired") {
      toast.error("Phiên đăng nhập hết hạn", {
        description: "Vui lòng đăng nhập lại.",
      });
    }
  }, [errorMessage]);

  // Chuyển hướng sau khi đăng nhập thành công và nhận được thông tin user
  useEffect(() => {
    if (loginSuccess && isAuthenticated) {
      console.log(
        "[LOGIN] Đã xác thực thành công, chuẩn bị chuyển hướng đến:",
        returnUrl
      );

      // Đặt timeout trước khi chuyển hướng để đảm bảo token đã được thiết lập
      const redirectTimer = setTimeout(() => {
        console.log("[LOGIN] Chuyển hướng đến:", returnUrl);
        router.push(returnUrl);
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [loginSuccess, isAuthenticated, router, returnUrl]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Reset trạng thái đăng nhập thành công
    setLoginSuccess(false);

    try {
      console.log("[LOGIN] Bắt đầu xử lý đăng nhập");

      // Hiển thị thông báo đang đăng nhập
      toast("Đang đăng nhập...", {
        description: "Vui lòng đợi...",
      });

      // Thực hiện đăng nhập
      const userData = await login(values.email, values.password);
      console.log(
        "[LOGIN] Đăng nhập thành công, nhận được dữ liệu user:",
        userData
      );

      toast.success("Đăng nhập thành công", {
        description: "Chào mừng trở lại!",
      });

      // Lưu URL trả về vào localStorage nếu cần
      if (returnUrl) {
        localStorage.setItem("returnUrl", returnUrl);
        console.log("[LOGIN] Đã lưu returnUrl:", returnUrl);
      }

      // Đánh dấu đăng nhập thành công để trigger chuyển hướng
      setLoginSuccess(true);
    } catch (error) {
      console.error("[LOGIN] Đăng nhập thất bại", error);
      toast.error("Đăng nhập thất bại", {
        description: "Thông tin đăng nhập không chính xác",
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
              <FormLabel>Mật khẩu</FormLabel>
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
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>
    </Form>
  );
}
