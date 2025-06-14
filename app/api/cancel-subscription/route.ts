// app/api/cancel-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update user subscription status
    await db
      .update(user)
      .set({
        subscriptionStatus: "CANCELLED",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json(
      { message: "Subscription cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Error cancelling subscription" },
      { status: 500 }
    );
  }
}
