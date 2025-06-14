// app/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/useRazorpay";

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "canceled" | "cancelled" | "past_due" | "trialing";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "completed";
  date: string;
  downloadUrl?: string;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    name: string;
  } | null>(null);

  const { initializePayment } = useRazorpay();

  useEffect(() => {
    fetchBillingData();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const user = await response.json();
        setUserInfo({
          email: user.email || "",
          name: user.name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchBillingData = async () => {
    try {
      const response = await fetch("/api/billing");
      if (!response.ok) throw new Error("Failed to fetch billing data");

      const data = await response.json();
      setSubscription(data.subscription);
      setInvoices(data.invoices);
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: "monthly" | "yearly") => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setActionLoading(planType);
    const amount = planType === "yearly" ? 3999 : 299;

    await initializePayment({
      amount,
      planType,
      userEmail: userInfo?.email || "",
      userName: userInfo?.name || "",
      onSuccess: () => {
        fetchBillingData();
        setActionLoading(null);
      },
      onError: () => {
        setActionLoading(null);
      },
    });
  };

  const handleCancelSubscription = async () => {
    setActionLoading("cancel");
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Subscription canceled successfully");
        fetchBillingData();
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      toast.error("Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      canceled: "destructive",
      cancelled: "destructive",
      past_due: "destructive",
      trialing: "secondary",
      paid: "default",
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <>
        <SiteHeader title="Billing" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-4xl mx-auto w-full">
            <div className="animate-pulse space-y-4 sm:space-y-6">
              <div className="h-6 sm:h-8 bg-muted rounded w-24 sm:w-32"></div>
              <div className="h-48 sm:h-64 bg-muted rounded-lg"></div>
              <div className="h-32 sm:h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment system")}
      />
      <SiteHeader title="Billing" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-xl sm:text-2xl font-bold">
            Billing & Subscription
          </h1>

          {/* Current Subscription */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        {subscription.plan} Plan
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {formatAmount(
                          subscription.amount,
                          subscription.currency
                        )}{" "}
                        per {subscription.interval}
                      </p>
                    </div>
                    <div className="self-start sm:self-auto">
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Current Period</span>
                      </div>
                      <p className="text-sm sm:text-base font-medium break-words">
                        {formatDate(subscription.currentPeriodStart)} -{" "}
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Next Payment</span>
                      </div>
                      <p className="text-sm sm:text-base font-medium break-words">
                        {subscription.status === "cancelled"
                          ? "Subscription will end on " +
                            formatDate(subscription.currentPeriodEnd)
                          : formatAmount(
                              subscription.amount,
                              subscription.currency
                            ) +
                            " on " +
                            formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>

                  {subscription.status !== "cancelled" && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={actionLoading === "cancel"}
                        className="text-sm sm:text-base"
                        size="sm"
                      >
                        {actionLoading === "cancel" ? (
                          <>
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                            <span className="hidden sm:inline">
                              Canceling...
                            </span>
                            <span className="sm:hidden">Cancel...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">
                              Cancel Subscription
                            </span>
                            <span className="sm:hidden">Cancel</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      No active subscription found. Choose a plan to get
                      started.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold">
                            Monthly Plan
                          </h3>
                          <div className="text-2xl sm:text-3xl font-bold">
                            ₹299
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            per month
                          </p>
                          <Button
                            className="w-full text-sm sm:text-base"
                            onClick={() => handleSubscribe("monthly")}
                            disabled={actionLoading === "monthly"}
                            size="sm"
                          >
                            {actionLoading === "monthly" ? (
                              <>
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">
                                  Processing...
                                </span>
                                <span className="sm:hidden">Wait...</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline">
                                  Subscribe Monthly
                                </span>
                                <span className="sm:hidden">Monthly</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <div className="text-center space-y-3 sm:space-y-4">
                          <h3 className="text-base sm:text-lg font-semibold">
                            Annual Plan
                          </h3>
                          <div className="text-2xl sm:text-3xl font-bold">
                            ₹3,999
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            per year
                          </p>
                          <Badge
                            variant="secondary"
                            className="mb-2 text-xs sm:text-sm"
                          >
                            Save ₹589!
                          </Badge>
                          <Button
                            className="w-full text-sm sm:text-base"
                            onClick={() => handleSubscribe("yearly")}
                            disabled={actionLoading === "yearly"}
                            size="sm"
                          >
                            {actionLoading === "yearly" ? (
                              <>
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">
                                  Processing...
                                </span>
                                <span className="sm:hidden">Wait...</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline">
                                  Subscribe Annually
                                </span>
                                <span className="sm:hidden">Annual</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">
                          Date
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm">
                          Status
                        </TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="text-xs sm:text-sm font-medium">
                            <div className="min-w-0">
                              <div className="hidden sm:block">
                                {formatDate(invoice.date)}
                              </div>
                              <div className="sm:hidden">
                                {new Date(invoice.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm font-medium">
                            {formatAmount(invoice.amount, invoice.currency)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-start">
                              {getStatusBadge(invoice.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {invoice.downloadUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={invoice.downloadUrl} download>
                                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="sr-only">
                                    Download invoice
                                  </span>
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    No billing history found.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
