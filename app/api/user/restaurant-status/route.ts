// app/api/user/restaurant-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get only hasRestaurant column (avoid circular reference)
    const userRecord = await db
      .select({ hasRestaurant: user.hasRestaurant })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)
      .then((res) => res[0]);

    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasRestaurant: userRecord.hasRestaurant || false,
    });
  } catch (error) {
    console.error("Error fetching user restaurant status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
