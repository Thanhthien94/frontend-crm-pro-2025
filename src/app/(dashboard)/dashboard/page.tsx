'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  CheckSquare, 
  TrendingUp, 
  Loader2, 
  AlertTriangle, 
  PlusCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface DashboardStats {
  customers?: {
    total: number;
    lead: number;
    prospect: number;
    customer: number;
  };
  sales?: {
    pipelineValue: number;
    pipelineDealCount: number;
    thisMonthRevenue: number;
    thisMonthWonDeals: number;
    growthRate: number;
  };
  tasks?: {
    overdue: number;
    dueToday: number;
    total?: number;
    pending?: number;
    in_progress?: number;
    completed?: number;
    canceled?: number;
  };
  trend?: Array<{
    period: string;
    totalValue: number;
    wonValue: number;
    dealCount: number;
  }>;
  // Thêm dữ liệu phân tích deals theo giai đoạn
  dealsByStage?: Record<string, {count: number, value: number}>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [totalDeals, setTotalDeals] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Attempt to fetch dashboard data
        const response = await api.get("/analytics/dashboard");
        console.log("Dashboard data fetched:", response.data.data);
        
        // Process and set data
        const dashboardData = response.data.data;
        
        // Calculate total deals from the data
        let totalDealCount = 0;
        let stageData = {};
        
        // If sales data is available
        if (dashboardData.sales && dashboardData.sales.pipelineDealCount) {
          totalDealCount = dashboardData.sales.pipelineDealCount;
        }

        // Or use trend data if available
        if (dashboardData.trend && dashboardData.trend.length > 0) {
          const latestTrend = dashboardData.trend[dashboardData.trend.length - 1];
          if (latestTrend.dealCount) {
            totalDealCount = latestTrend.dealCount;
          }
        }

        // Process deals by stage if available
        if (dashboardData.dealsByStage) {
          stageData = dashboardData.dealsByStage;
        } else if (dashboardData.sales && dashboardData.sales.stageBreakdown) {
          // Fallback in case the structure is different
          stageData = dashboardData.sales.stageBreakdown;
        }

        // Set processed data
        setTotalDeals(totalDealCount);
        setStats({
          ...dashboardData,
          dealsByStage: stageData
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p>Không thể tải dữ liệu bảng điều khiển</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Customers Card */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push('/customers')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số khách hàng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.customers?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.customers?.lead || 0} tiềm năng, {stats.customers?.prospect || 0} triển vọng
            </p>
          </CardContent>
        </Card>

        {/* Active Deals Card */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push('/deals')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao dịch đang hoạt động</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sales?.pipelineDealCount || totalDeals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.sales?.pipelineValue?.toLocaleString() || '0'} tổng giá trị
            </p>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => router.push('/tasks')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Công việc</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.tasks?.pending || 0) + 
               (stats.tasks?.in_progress || 0) + 
               (stats.tasks?.completed || 0) + 
               (stats.tasks?.canceled || 0) || 
               stats.tasks?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.tasks?.overdue || 0} quá hạn, {stats.tasks?.dueToday || 0} đến hạn hôm nay
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ chuyển đổi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.sales?.growthRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.sales?.thisMonthWonDeals || 0} giao dịch thành công tháng này
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deals">
        <TabsList>
          <TabsTrigger value="deals">Giao dịch</TabsTrigger>
          <TabsTrigger value="tasks">Công việc</TabsTrigger>
        </TabsList>
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giao dịch theo giai đoạn</CardTitle>
              <CardDescription>
                Tổng quan về đường dẫn bán hàng hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.dealsByStage && Object.keys(stats.dealsByStage).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.dealsByStage)
                    .filter(([key]) => !["total", "totalValue"].includes(key))
                    .map(([stage, data]) => {
                      let stageTranslation = stage.replace("-", " ");
                      
                      // Dịch các giai đoạn sang tiếng Việt
                      if (stage === "lead") stageTranslation = "Tiềm năng";
                      if (stage === "qualified") stageTranslation = "Đủ điều kiện";
                      if (stage === "proposal") stageTranslation = "Đề xuất"; 
                      if (stage === "negotiation") stageTranslation = "Đàm phán";
                      if (stage === "closed-won") stageTranslation = "Đã đóng (Thành công)";
                      if (stage === "closed-lost") stageTranslation = "Đã đóng (Thất bại)";
                        
                      return (
                        <div key={stage} className="flex items-center">
                          <div className="w-40 font-medium capitalize">
                            {stageTranslation}
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${Math.round(
                                    (data.count / (totalDeals || 1)) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-20 text-right">
                            {data.count} (
                            {Math.round((data.count / (totalDeals || 1)) * 100)}%)
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Không có dữ liệu giao dịch. Tạo giao dịch đầu tiên để xem thống kê đường dẫn.
                  </p>
                  <Button 
                    onClick={() => router.push('/deals/new')}
                    className="gap-2 inline-flex items-center"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Tạo giao dịch đầu tiên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan công việc</CardTitle>
              <CardDescription>Trạng thái các công việc đang diễn ra</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.tasks && 
               (stats.tasks.total > 0 || 
                Object.keys(stats.tasks).some(key => 
                  !["total", "overdue", "dueToday"].includes(key) && (stats.tasks as any)[key] > 0
                )) ? (
                <div className="space-y-2">
                  {Object.entries(stats.tasks)
                    .filter(
                      ([key]) => !["total", "overdue", "dueToday"].includes(key) && typeof stats.tasks?.[key as keyof typeof stats.tasks] === 'number'
                    )
                    .map(([status, count]) => {
                      // Dịch các trạng thái sang tiếng Việt
                      let statusTranslation = status.replace("_", " ");
                      
                      if (status === "pending") statusTranslation = "Cần làm";
                      if (status === "in_progress") statusTranslation = "Đang thực hiện";
                      if (status === "completed") statusTranslation = "Hoàn thành";
                      if (status === "canceled") statusTranslation = "Đã hủy";
                      
                      return (
                        <div key={status} className="flex items-center">
                          <div className="w-40 font-medium capitalize">
                            {statusTranslation}
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{
                                  width: `${Math.round(
                                    (count as number / (stats.tasks?.total || 1)) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="w-20 text-right">
                            {count} ({Math.round((count as number / (stats.tasks?.total || 1)) * 100)}%)
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Không có dữ liệu công việc. Tạo công việc đầu tiên để xem thống kê.
                  </p>
                  <Button 
                    onClick={() => router.push('/tasks/new')}
                    className="gap-2 inline-flex items-center"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Tạo công việc đầu tiên
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Section */}
      {stats.trend && stats.trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Hiệu suất bán hàng của bạn theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <div className="space-y-4">
                {stats.trend.slice(-5).map((period, index) => (
                  <div key={period.period} className="flex items-center">
                    <div className="w-24 font-medium">{period.period}</div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${Math.min(100, (period.totalValue / 
                              (Math.max(...stats.trend?.map(t => t.totalValue) || [1]))) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right">${period.totalValue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}