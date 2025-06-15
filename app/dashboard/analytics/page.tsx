"use client";

import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  TrendingUp,
  Users,
  Clock,
  Smartphone,
  Crown,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type DeviceStat = { deviceType: string | null; count: number };

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    { label: "Scans This Month", value: 0, icon: Activity, change: "+12%" },
    { label: "Top Menu", value: "-", icon: TrendingUp, change: null },
    { label: "Peak Time", value: "-", icon: Clock, change: null },
  ]);
  const [scanData, setScanData] = useState<ChartData<"bar">>({
    labels: [],
    datasets: [],
  });
  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetch("/api/qr-analytics/summary")
      .then((res) => res.json())
      .then((data) => {
        setIsPro(data.isPro);
        setMetrics([
          {
            label: "Scans This Month",
            value: data.scansThisMonth,
            icon: Activity,
            change: "+12%",
          },
          {
            label: "Top Menu",
            value: data.topMenu ?? "-",
            icon: TrendingUp,
            change: null,
          },
          {
            label: "Peak Time",
            value: data.peakTime ?? "-",
            icon: Clock,
            change: null,
          },
        ]);
        setScanData({
          labels: data.daily?.labels ?? [],
          datasets: [
            {
              label: "Scans",
              data: data.daily?.counts ?? [],
              backgroundColor: "hsl(var(--primary) / 0.1)",
              borderColor: "hsl(var(--primary))",
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        });
        setDeviceStats(data.deviceStats ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "hsl(var(--muted-foreground))" },
      },
      y: {
        grid: { color: "hsl(var(--border))" },
        border: { display: false },
        ticks: { color: "hsl(var(--muted-foreground))" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          color: "hsl(var(--foreground))",
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  if (loading) {
    return (
      <SidebarInset>
        <SiteHeader title="Analytics" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <SiteHeader title="Analytics" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
              <p className="text-muted-foreground">
                Track your QR menu performance and user engagement
              </p>
            </div>
            {isPro && (
              <Badge variant="secondary" className="gap-2">
                <Crown className="h-4 w-4" />
                Pro Analytics
              </Badge>
            )}
          </div>

          {/* Metrics Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.change && (
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">{metric.change}</span>{" "}
                        from last month
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          {isPro ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Daily Scans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar data={scanData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              {deviceStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Device Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Pie
                        data={{
                          labels: deviceStats.map(
                            (d) => d.deviceType || "Unknown"
                          ),
                          datasets: [
                            {
                              data: deviceStats.map((d) => d.count),
                              backgroundColor: [
                                "hsl(var(--chart-1))",
                                "hsl(var(--chart-2))",
                                "hsl(var(--chart-3))",
                                "hsl(var(--chart-4))",
                                "hsl(var(--chart-5))",
                              ],
                              borderWidth: 0,
                            },
                          ],
                        }}
                        options={pieOptions}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Upgrade Card */
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Crown className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Unlock Pro Analytics
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Get detailed insights with daily scan trends, device
                  breakdowns, peak hours analysis, and more advanced metrics.
                </p>
                <Button className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SidebarInset>
  );
}
