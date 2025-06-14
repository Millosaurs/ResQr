// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { user, payments } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
    } = await request.json();

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Calculate subscription dates
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + (planType === "yearly" ? 12 : 1));

    // Update user subscription
    await db
      .update(user)
      .set({
        subscriptionType: planType === "yearly" ? "YEARLY" : "MONTHLY",
        subscriptionStatus: "ACTIVE",
        subscriptionStartDate: now.toISOString(),
        subscriptionEndDate: endDate.toISOString(),
        razorpayCustomerId: razorpay_payment_id,
        updatedAt: now.toISOString(),
      })
      .where(eq(user.id, session.user.id));

    await db.insert(payments).values({
      userId: session.user.id,
      amount: planType === "yearly" ? 399900 : 29900, // Amount in paise (₹3999 = 399900 paise, ₹299 = 29900 paise)
      currency: "INR",
      status: "COMPLETED",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      planType: planType === "yearly" ? "YEARLY" : "MONTHLY",
    });

    return NextResponse.json(
      { message: "Payment verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}
