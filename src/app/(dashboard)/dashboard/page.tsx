"use client";

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
  PlusCircle,
  Activity,
  Calendar,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// Import các card nâng cao mới
import {
  StatCard,
  DashboardCard,
  ProgressCard,
  ProcessCard,
} from "@/components/ui/enhanced-cards";

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
  dealsByStage?: Record<string, { count: number; value: number }>;
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
          const latestTrend =
            dashboardData.trend[dashboardData.trend.length - 1];
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
          dealsByStage: stageData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Demo data nếu không có API
        const demoStats: DashboardStats = {
          customers: {
            total: 254,
            lead: 45,
            prospect: 68,
            customer: 141,
          },
          sales: {
            pipelineValue: 1250000,
            pipelineDealCount: 24,
            thisMonthRevenue: 345000,
            thisMonthWonDeals: 5,
            growthRate: 12.5,
          },
          tasks: {
            overdue: 7,
            dueToday: 3,
            total: 45,
            pending: 15,
            in_progress: 12,
            completed: 18,
            canceled: 0,
          },
          dealsByStage: {
            lead: { count: 5, value: 250000 },
            qualified: { count: 8, value: 450000 },
            proposal: { count: 6, value: 320000 },
            negotiation: { count: 3, value: 180000 },
            "closed-won": { count: 2, value: 50000 },
            "closed-lost": { count: 0, value: 0 },
          },
        };

        setStats(demoStats);
        setTotalDeals(24);
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
          <p className="text-muted-foreground">
            Đang tải dữ liệu bảng điều khiển...
          </p>
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

  // Chuyển đổi dữ liệu deals theo giai đoạn để hiển thị trong ProcessCard
  const dealStagesData = stats.dealsByStage
    ? Object.entries(stats.dealsByStage)
        .filter(([key]) => !["total", "totalValue"].includes(key))
        .map(([stage, data]) => {
          // Chuyển đổi tên giai đoạn sang tiếng Việt
          let stageName = stage.replace("-", " ");
          if (stage === "lead") stageName = "Tiềm năng";
          if (stage === "qualified") stageName = "Đủ điều kiện";
          if (stage === "proposal") stageName = "Đề xuất";
          if (stage === "negotiation") stageName = "Đàm phán";
          if (stage === "closed-won") stageName = "Thành công";
          if (stage === "closed-lost") stageName = "Thất bại";

          return {
            name: stageName,
            count: data.count,
            percentage: Math.round((data.count / (totalDeals || 1)) * 100),
            value: data.value,
          };
        })
    : [];

  // Chuyển đổi dữ liệu tasks theo trạng thái để hiển thị trong ProcessCard
  const taskStagesData = [];

  if (stats.tasks) {
    const taskStagesMap = [
      { key: "pending", name: "Cần làm" },
      { key: "in_progress", name: "Đang thực hiện" },
      { key: "completed", name: "Hoàn thành" },
      { key: "canceled", name: "Đã hủy" },
    ];

    const totalTasks =
      stats.tasks.total ||
      (stats.tasks.pending || 0) +
        (stats.tasks.in_progress || 0) +
        (stats.tasks.completed || 0) +
        (stats.tasks.canceled || 0);

    taskStagesMap.forEach((stage) => {
      const count = stats.tasks?.[stage.key as keyof typeof stats.tasks] || 0;
      if (typeof count === "number") {
        taskStagesData.push({
          name: stage.name,
          count,
          percentage: Math.round((count / (totalTasks || 1)) * 100),
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <Activity className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button>
            <BarChart className="mr-2 h-4 w-4" />
            Báo cáo
          </Button>
        </div>
      </div>

      {/* Thẻ thống kê tổng quan với gradient */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Tổng số khách hàng"
          value={stats.customers?.total || 0}
          description={`${stats.customers?.lead || 0} tiềm năng, ${
            stats.customers?.prospect || 0
          } triển vọng`}
          icon={<Users className="h-5 w-5" />}
          variant="primary"
          onClick={() => router.push("/customers")}
        />

        <DashboardCard
          title="Thương vụ đang hoạt động"
          value={stats.sales?.pipelineDealCount || 0}
          description={`$${
            stats.sales?.pipelineValue?.toLocaleString() || "0"
          } tổng giá trị`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="secondary"
          onClick={() => router.push("/deals")}
        />

        <DashboardCard
          title="Công việc cần làm"
          value={(stats.tasks?.pending || 0) + (stats.tasks?.in_progress || 0)}
          description={`${stats.tasks?.overdue || 0} quá hạn, ${
            stats.tasks?.dueToday || 0
          } đến hạn hôm nay`}
          icon={<CheckSquare className="h-5 w-5" />}
          variant="warning"
          onClick={() => router.push("/tasks")}
        />

        <DashboardCard
          title="Tỷ lệ chuyển đổi"
          value={`${stats.sales?.growthRate || 0}%`}
          description={`${
            stats.sales?.thisMonthWonDeals || 0
          } thương vụ thành công tháng này`}
          icon={<TrendingUp className="h-5 w-5" />}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Process card hiển thị thương vụ theo giai đoạn */}
        <div className="md:col-span-2">
          <ProcessCard
            title="Thương vụ theo giai đoạn"
            stages={dealStagesData}
            total={totalDeals}
            className="h-full"
          />
        </div>

        {/* Card hiển thị công việc theo trạng thái */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Công việc sắp đến hạn</span>
              </CardTitle>
              <CardDescription>
                {stats.tasks?.dueToday || 0} công việc đến hạn hôm nay
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(stats.tasks?.dueToday || 0) > 0 ? (
                <div className="space-y-4">
                  {Array.from({
                    length: Math.min(stats.tasks?.dueToday || 0, 3),
                  }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <div>
                          <p className="font-medium">Công việc {i + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            Đến hạn hôm nay
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Xem
                      </Button>
                    </div>
                  ))}
                  {(stats.tasks?.dueToday || 0) > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => router.push("/tasks")}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-muted-foreground">
                    Không có công việc nào đến hạn hôm nay
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/tasks/new")}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Tạo công việc mới
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="deals" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="deals">Thương vụ</TabsTrigger>
          <TabsTrigger value="tasks">Công việc</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Thẻ thống kê thương vụ */}
            <StatCard
              title="Thương vụ đang đàm phán"
              value={stats.dealsByStage?.negotiation?.count || 0}
              description={`$${
                stats.dealsByStage?.negotiation?.value?.toLocaleString() || 0
              } giá trị`}
              icon={<DollarSign className="h-4 w-4" />}
              onClick={() => router.push("/deals?stage=negotiation")}
            />

            <StatCard
              title="Thương vụ đã thắng"
              value={stats.dealsByStage?.["closed-won"]?.count || 0}
              description={`$${
                stats.dealsByStage?.["closed-won"]?.value?.toLocaleString() || 0
              } doanh thu`}
              icon={<CheckSquare className="h-4 w-4" />}
              trend={{
                value: stats.sales?.growthRate || 0,
                isPositive: (stats.sales?.growthRate || 0) > 0,
              }}
              onClick={() => router.push("/deals?stage=closed-won")}
            />

            <StatCard
              title="Khách hàng mới"
              value={stats.customers?.lead || 0}
              description="Khách hàng tiềm năng tháng này"
              icon={<Users className="h-4 w-4" />}
              onClick={() => router.push("/customers?type=lead")}
            />
          </div>

          {/* Progress bar cho các chỉ số */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressCard
              title="Mục tiêu doanh số tháng này"
              value={(stats.sales?.thisMonthRevenue || 0) / 1000}
              max={500}
              unit="K"
              description="Tiến độ đạt mục tiêu doanh số 500.000"
              variant="primary"
            />

            <ProgressCard
              title="Tỷ lệ thành công thương vụ"
              value={stats.sales?.growthRate || 0}
              max={100}
              unit="%"
              description="Tỷ lệ thành công các thương vụ tháng này"
              variant="success"
            />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {/* Card hiển thị công việc theo trạng thái */}
          <ProcessCard
            title="Trạng thái công việc"
            stages={taskStagesData}
            total={stats.tasks?.total || 0}
          />

          {/* Thống kê công việc */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Công việc quá hạn"
              value={stats.tasks?.overdue || 0}
              description="Cần xử lý ngay"
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              onClick={() => router.push("/tasks?overdue=true")}
            />

            <StatCard
              title="Công việc đến hạn hôm nay"
              value={stats.tasks?.dueToday || 0}
              description="Cần hoàn thành trong ngày"
              icon={<Calendar className="h-4 w-4" />}
              onClick={() => router.push("/tasks?today=true")}
            />

            <StatCard
              title="Công việc đã hoàn thành"
              value={stats.tasks?.completed || 0}
              description="Trong tháng này"
              icon={<CheckSquare className="h-4 w-4 text-green-500" />}
              onClick={() => router.push("/tasks?status=completed")}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Hoạt động gần đây</CardTitle>
          <Button variant="outline" size="sm">
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sample activities */}
            <div className="flex items-start gap-4">
              <div className="relative mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Thương vụ mới được tạo</p>
                <p className="text-xs text-muted-foreground">
                  Đề xuất bản quyền phần mềm - 50.000.000 VND
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  10 phút trước
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <CheckSquare className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Công việc đã hoàn thành</p>
                <p className="text-xs text-muted-foreground">
                  Gửi báo giá dịch vụ Tư vấn CNTT cho ABC Corp
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  1 giờ trước
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Khách hàng mới được thêm</p>
                <p className="text-xs text-muted-foreground">
                  Nguyễn Văn A - Công ty XYZ
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  3 giờ trước
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
