// app/api/qr-codes/route.ts
import { db } from "@/db";
import { restaurants, menus, qrCodes } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's restaurant
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Get all published menus for this restaurant
    const menuRows = await db
      .select()
      .from(menus)
      .where(
        and(
          eq(menus.restaurantId, restaurant.id),
          eq(menus.isPublished, true),
          eq(menus.isActive, true)
        )
      );

    // Get all QR codes for these menus
    const menuIds = menuRows.map((m) => m.id);
    const qrRows = await db
      .select()
      .from(qrCodes)
      .where(inArray(qrCodes.menuId, menuIds));

    // Map menuId -> QR code
    const qrMap = new Map(qrRows.map((qr) => [qr.menuId, qr]));

    // Compose response
    const qrCode = menuRows.map((menu) => {
      const qr = qrMap.get(menu.id);
      return {
        id: qr?.id ?? "",
        menuId: menu.id,
        menuName: menu.name,
        menuSlug: menu.slug,
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        menuUrl: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/menu/${menu.id}?qr=${qr?.id ?? ""}`,
        qrCodeImageUrl: undefined,
      };
    });

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
      },
      qrCode,
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
