// app/api/billing/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user, payments } from "@/db/schema"; // Updated import
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user subscription data
    const userData = await db
      .select({
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Get payment history
    const paymentHistory = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, session.user.id))
      .orderBy(desc(payments.createdAt))
      .limit(10);

    const userInfo = userData[0];
    // app/api/billing/route.ts - Update the subscription amounts
    const subscription = userInfo?.subscriptionStatus
      ? {
          id: `sub_${session.user.id}`,
          plan: userInfo.subscriptionType === "YEARLY" ? "Pro Annual" : "Pro",
          status: userInfo.subscriptionStatus.toLowerCase(),
          currentPeriodStart: userInfo.subscriptionStartDate,
          currentPeriodEnd: userInfo.subscriptionEndDate,
          amount: userInfo.subscriptionType === "YEARLY" ? 399900 : 29900, // Updated amounts in paise
          currency: "inr",
          interval: userInfo.subscriptionType === "YEARLY" ? "year" : "month",
        }
      : null;

    const invoices = paymentHistory.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency.toLowerCase(),
      status: payment.status.toLowerCase(),
      date: payment.createdAt,
      downloadUrl: `/api/invoices/${payment.id}/download`,
    }));

    return NextResponse.json({
      subscription,
      paymentMethods: [],
      invoices,
    });
  } catch (error) {
    console.error("Error fetching billing data:", error);
    return NextResponse.json(
      { error: "Error fetching billing data" },
      { status: 500 }
    );
  }
}
