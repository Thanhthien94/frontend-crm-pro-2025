"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, CheckSquare, TrendingUp } from "lucide-react";
import api, { API_URL } from "@/lib/api";

interface DashboardStats {
  customers: {
    total: number;
    lead: number;
    prospect: number;
    customer: number;
  };
  deals: {
    total: number;
    totalValue: number;
    lead: { count: number; value: number };
    qualified: { count: number; value: number };
    proposal: { count: number; value: number };
    negotiation: { count: number; value: number };
    "closed-won": { count: number; value: number };
    "closed-lost": { count: number; value: number };
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    canceled: number;
    overdue: number;
    dueToday: number;
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      console.log(
        "Fetching dashboard data from:",
        `${API_URL}/analytics/dashboard`
      );
      try {
        // Log cookie status for debugging
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];
        
        console.log("Cookie check on dashboard - token exists:", !!token);
        
        // Attempt to fetch dashboard data
        const response = await api.get("/analytics/dashboard");
        console.log("Dashboard data fetched successfully");
        setStats(response.data.data);
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
      <div className="flex items-center justify-center h-full">Loading...</div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.customers.lead} leads, {stats.customers.prospect} prospects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deals.total}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.deals.totalValue.toLocaleString()} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tasks.overdue} overdue, {stats.tasks.dueToday} due today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.deals["closed-won"].count > 0
                ? Math.round(
                    (stats.deals["closed-won"].count /
                      (stats.deals["closed-won"].count +
                        stats.deals["closed-lost"].count)) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.deals["closed-won"].count} won,{" "}
              {stats.deals["closed-lost"].count} lost
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deals">
        <TabsList>
          <TabsTrigger value="deals">Deals Pipeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deals by Stage</CardTitle>
              <CardDescription>
                Overview of your current sales pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.deals)
                  .filter(([key]) => !["total", "totalValue"].includes(key))
                  .map(([stage, data]) => (
                    <div key={stage} className="flex items-center">
                      <div className="w-40 font-medium capitalize">
                        {stage.replace("-", " ")}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.round(
                                (data.count / stats.deals.total) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        {data.count} (
                        {Math.round((data.count / stats.deals.total) * 100)}%)
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Overview</CardTitle>
              <CardDescription>Status of your ongoing tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.tasks)
                  .filter(
                    ([key]) => !["total", "overdue", "dueToday"].includes(key)
                  )
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center">
                      <div className="w-40 font-medium capitalize">
                        {status.replace("_", " ")}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.round(
                                (count / stats.tasks.total) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        {count} ({Math.round((count / stats.tasks.total) * 100)}
                        %)
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
