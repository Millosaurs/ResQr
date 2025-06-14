// app/api/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, planType } = await request.json();

    // Generate a shorter receipt ID (max 40 characters)
    const timestamp = Date.now().toString();
    const userIdShort = session.user.id.slice(-8); // Last 8 characters of user ID
    const planPrefix = planType === "yearly" ? "Y" : "M";
    const receipt = `${planPrefix}_${userIdShort}_${timestamp}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: receipt,
      notes: {
        userId: session.user.id,
        planType,
        fullUserId: session.user.id, // Store full user ID in notes
      },
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}
