"use client";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "sidebar" | "mobile";
  showText?: boolean;
};

export function Logo({
  className,
  size = "md",
  variant = "default",
  showText = true,
}: LogoProps) {
  // Kích thước dựa vào props
  const sizesMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizesMap = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        {
          "flex-col": variant === "sidebar",
        },
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm",
          sizesMap[size]
        )}
      >
        {/* Kiểu hiệu ứng ánh sáng hiện đại */}
        <span className="absolute -right-3 -top-3 h-6 w-6 rotate-45 bg-white/20 blur-md"></span>
        <span className="relative font-bold tracking-tight">CRM</span>
      </div>
      {showText && (
        <div
          className={cn("font-bold tracking-tight", textSizesMap[size], {
            "text-foreground": variant === "default",
            "text-primary": variant === "sidebar",
          })}
        >
          <span className="mr-0.5">CRM</span>
          <span className="text-primary font-normal">Pro</span>
        </div>
      )}
    </div>
  );
}
