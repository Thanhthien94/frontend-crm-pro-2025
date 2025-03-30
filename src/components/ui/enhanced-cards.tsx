"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BriefcaseIcon,
  DollarSignIcon,
  UsersIcon,
  ClockIcon,
  TrendingUpIcon,
  BarChartIcon,
  CheckCircle2Icon,
} from "lucide-react";

// Các loại card thống kê
type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 border border-border/50 hover:shadow-md backdrop-blur-sm",
        onClick && "cursor-pointer hover:border-primary/40",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            {trend.isPositive ? (
              <TrendingUpIcon className="h-3 w-3 text-emerald-500 mr-1" />
            ) : (
              <TrendingUpIcon className="h-3 w-3 text-rose-500 mr-1 rotate-180" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Card cho dashboard với nền gradient hiện đại
type DashboardCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "info";
  className?: string;
  onClick?: () => void;
};

export function DashboardCard({
  title,
  value,
  description,
  icon,
  variant = "primary",
  className,
  onClick,
}: DashboardCardProps) {
  // Các biến thể màu sắc hiện đại
  const variantClasses = {
    primary:
      "bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 text-primary-foreground",
    secondary:
      "bg-gradient-to-br from-secondary/90 via-secondary/80 to-secondary/70 border-secondary/30",
    success:
      "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white",
    warning:
      "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white",
    info: "bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white",
  };

  // Icon mặc định cho mỗi biến thể
  const defaultIcons = {
    primary: <DollarSignIcon className="h-6 w-6" />,
    secondary: <UsersIcon className="h-6 w-6" />,
    success: <CheckCircle2Icon className="h-6 w-6" />,
    warning: <ClockIcon className="h-6 w-6" />,
    info: <BarChartIcon className="h-6 w-6" />,
  };

  return (
    <div
      className={cn(
        "rounded-lg px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md border-border/20 border backdrop-blur-sm",
        variantClasses[variant],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
          {icon || defaultIcons[variant]}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold">{value}</p>
        {description && (
          <p className="mt-1 text-sm opacity-90">{description}</p>
        )}
      </div>
    </div>
  );
}

// Card cho Progress Bar hiện đại
type ProgressCardProps = {
  title: string;
  value: number;
  max?: number;
  unit?: string;
  description?: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "info";
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function ProgressCard({
  title,
  value,
  max = 100,
  unit = "%",
  description,
  variant = "primary",
  className,
  size = "md",
}: ProgressCardProps) {
  // Tính toán phần trăm
  const percentage = Math.min(100, (value / max) * 100);

  // Các biến thể màu sắc cho progress bar
  const variantClasses = {
    primary: "bg-gradient-to-r from-primary/80 to-primary",
    secondary: "bg-gradient-to-r from-secondary/80 to-secondary",
    success: "bg-gradient-to-r from-emerald-500/80 to-emerald-500",
    warning: "bg-gradient-to-r from-amber-500/80 to-amber-500",
    info: "bg-gradient-to-r from-sky-500/80 to-sky-500",
  };

  // Kích thước của progress bar
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-border/50 border",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <span className="text-sm font-medium">
            {value}
            {unit}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className={cn(
              "transition-all duration-700 ease-in-out rounded-full",
              variantClasses[variant],
              sizeClasses[size]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Card cho tổng quan quy trình hiện đại
type ProcessCardProps = {
  title: string;
  stages: {
    name: string;
    count: number;
    percentage: number;
    value?: number;
  }[];
  total?: number;
  className?: string;
};

export function ProcessCard({
  title,
  stages,
  total,
  className,
}: ProcessCardProps) {
  // Palette màu hiện đại cho các giai đoạn
  const colors = [
    "from-primary/80 to-primary",
    "from-amber-500/80 to-amber-500",
    "from-emerald-500/80 to-emerald-500",
    "from-sky-500/80 to-sky-500",
    "from-violet-500/80 to-violet-500",
    "from-rose-500/80 to-rose-500",
  ];

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-border/50 border",
        className
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {total !== undefined && (
          <CardDescription>Tổng cộng: {total}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {stages.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full bg-gradient-to-r",
                      colors[index % colors.length]
                    )}
                  />
                  <span className="text-sm font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{stage.count}</span>
                  <span className="text-xs text-muted-foreground">
                    ({stage.percentage}%)
                  </span>
                  {stage.value !== undefined && (
                    <span className="text-xs font-medium text-primary">
                      ${stage.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-in-out",
                    colors[index % colors.length]
                  )}
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Content Card hiện đại với hiệu ứng hover
type ContentCardProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
};

export function ContentCard({
  title,
  subtitle,
  icon,
  children,
  className,
  footer,
  onClick,
  hoverable = true,
}: ContentCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 border-border/50 border overflow-hidden",
        hoverable && "hover:shadow-md hover:border-primary/30",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="rounded-full bg-primary/10 p-2.5 text-primary">
              {icon}
            </div>
          )}
          <div>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="border-t bg-muted/20 p-4">{footer}</CardFooter>
      )}
    </Card>
  );
}

// Activity Card hiện đại
type ActivityItem = {
  title: string;
  description?: string;
  time: string;
  icon?: ReactNode;
  iconColor?: string;
  link?: string;
};

type ActivityCardProps = {
  items: ActivityItem[];
  title?: string;
  description?: string;
  className?: string;
  maxItems?: number;
  showMore?: boolean;
  onShowMore?: () => void;
};

export function ActivityCard({
  items,
  title = "Hoạt động gần đây",
  description,
  className,
  maxItems = 5,
  showMore = true,
  onShowMore,
}: ActivityCardProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card
      className={cn(
        "transition-all duration-200 border-border/50 border",
        className
      )}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="space-y-0">
          {displayItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4 px-6 py-4 transition-colors",
                "hover:bg-muted/30"
              )}
            >
              {item.icon && (
                <div
                  className={cn(
                    "relative mt-1 flex h-10 w-10 items-center justify-center rounded-full",
                    item.iconColor ? `bg-${item.iconColor}/10` : "bg-primary/10"
                  )}
                >
                  {item.icon}
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      {showMore && items.length > maxItems && (
        <CardFooter className="border-t px-6 py-4">
          <button
            onClick={onShowMore}
            className="text-sm text-primary font-medium hover:underline w-full text-center"
          >
            Xem tất cả ({items.length} hoạt động)
          </button>
        </CardFooter>
      )}
    </Card>
  );
}
