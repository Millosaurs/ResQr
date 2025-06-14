"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Restaurant = {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  subscriptionTier?: string;
  googleRating?: string;
  cuisineType?: string;
  isActive?: boolean;
};

type Summary = {
  restaurant: Restaurant | null;
  menuCount: number;
  menuItemCount: number;
  qrCodeCount: number;
  totalScans: number;
};

type Activity = {
  id: string;
  text: string;
  time: string;
  type: string;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [summaryRes, activityRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/dashboard/activity"),
        ]);

        if (!summaryRes.ok || !activityRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const summaryData = await summaryRes.json();
        const activityData = await activityRes.json();

        setSummary(summaryData);
        setActivity(activityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-destructive">Error: {error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (!summary?.restaurant) {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">
                  No Restaurant Found
                </h2>
                <p className="text-muted-foreground">
                  Create your first restaurant to get started.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const summaryCards = [
    { label: "Total Menus", value: summary.menuCount },
    { label: "Menu Items", value: summary.menuItemCount },
    { label: "QR Codes", value: summary.qrCodeCount },
    {
      label: "Rating",
      value: summary.restaurant.googleRating || "N/A",
    },
  ];

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6">
          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {summary.restaurant.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      summary.restaurant.isActive ? "default" : "secondary"
                    }
                  >
                    {summary.restaurant.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {summary.restaurant.subscriptionTier || "FREE"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {summary.restaurant.address && (
                  <div>
                    <span className="font-medium">Address:</span>{" "}
                    {summary.restaurant.address}
                  </div>
                )}
                {summary.restaurant.email && (
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {summary.restaurant.email}
                  </div>
                )}
                {summary.restaurant.phone && (
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    {summary.restaurant.phone}
                  </div>
                )}
                {summary.restaurant.cuisineType && (
                  <div>
                    <span className="font-medium">Cuisine:</span>{" "}
                    {summary.restaurant.cuisineType}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryCards.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {item.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {item.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <ul className="space-y-3">
                  {activity.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-foreground">{item.text}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
