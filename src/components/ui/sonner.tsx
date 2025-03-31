"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Toaster as Sonner,
  toast as sonnerToast,
  ToasterProps,
} from "sonner";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// Định nghĩa các biến thể cho toast
const toastVariants = cva(
  "group relative text-foreground overflow-hidden rounded-lg p-4 pr-12 shadow-lg border-l-4 transition-all data-[mounted=true]:animate-in data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-out data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:opacity-0",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground",
        success:
          "border-l-green-500 bg-green-50 dark:bg-green-950/30 text-green-950 dark:text-green-50",
        error:
          "border-l-red-500 bg-red-50 dark:bg-red-950/30 text-red-950 dark:text-red-50",
        warning:
          "border-l-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-50",
        info: "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Map giữa loại toast và icon tương ứng
const iconMap = {
  success: (
    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
  ),
  error: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
  warning: (
    <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
  ),
  info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
};

// Mở rộng Toast API
interface CustomToastOptions {
  variant?: "default" | "success" | "error" | "warning" | "info";
}

// Mở rộng các phương thức của toast
const toast = (
  message: string,
  options?: Parameters<typeof sonnerToast>[1] & CustomToastOptions
) => {
  const { variant, ...restOptions } = options || {};

  return sonnerToast(message, {
    ...restOptions,
    icon: options?.icon || (variant && iconMap[variant]),
    className: cn(
      toastVariants({ variant }),
      "animate-in slide-in-from-right-8 duration-300 ease-in-out",
      options?.className
    ),
  });
};

// Các phương thức tiện ích
toast.success = (
  message: string,
  options?: Omit<Parameters<typeof toast>[1], "variant">
) => {
  return toast(message, { ...options, variant: "success" });
};

toast.error = (
  message: string,
  options?: Omit<Parameters<typeof toast>[1], "variant">
) => {
  return toast(message, { ...options, variant: "error" });
};

toast.warning = (
  message: string,
  options?: Omit<Parameters<typeof toast>[1], "variant">
) => {
  return toast(message, { ...options, variant: "warning" });
};

toast.info = (
  message: string,
  options?: Omit<Parameters<typeof toast>[1], "variant">
) => {
  return toast(message, { ...options, variant: "info" });
};

// Sử dụng lại các phương thức khác của sonnerToast
toast.dismiss = sonnerToast.dismiss;
toast.error = sonnerToast.error;
toast.success = sonnerToast.success;
toast.info = sonnerToast.info;
toast.warning = sonnerToast.warning;
toast.promise = sonnerToast.promise;
toast.custom = sonnerToast.custom;
toast.loading = sonnerToast.loading;
toast.message = sonnerToast.message;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      icons={{
        success: iconMap.success,
        error: iconMap.error,
        warning: iconMap.warning,
        info: iconMap.info,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-foreground text-base font-medium",
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:text-foreground/50 group-[.toast]:hover:text-foreground",
        },
        duration: 4000,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
