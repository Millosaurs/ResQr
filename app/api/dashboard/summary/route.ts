import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { restaurants, menus, menuItems, qrCodes } from "@/db/schema";
import { eq, count, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's restaurant using direct table query
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, userId))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json({
        restaurant: null,
        menuCount: 0,
        menuItemCount: 0,
        qrCodeCount: 0,
        totalScans: 0,
      });
    }

    // Get menu count for this restaurant
    const [menuCountResult] = await db
      .select({ count: count() })
      .from(menus)
      .where(eq(menus.restaurantId, restaurant.id));

    // Get menu IDs first
    const menuIds = await db
      .select({ id: menus.id })
      .from(menus)
      .where(eq(menus.restaurantId, restaurant.id));

    const menuIdList = menuIds.map((m) => m.id);

    let menuItemCount = 0;
    if (menuIdList.length > 0) {
      // Use inArray() instead of SQL ANY()
      const [menuItemCountResult] = await db
        .select({ count: count() })
        .from(menuItems)
        .where(inArray(menuItems.menuId, menuIdList));
      menuItemCount = menuItemCountResult.count;
    }

    // Get QR codes count
    const [qrCodeCountResult] = await db
      .select({ count: count() })
      .from(qrCodes)
      .where(eq(qrCodes.restaurantId, restaurant.id));

    return NextResponse.json({
      restaurant: {
        name: restaurant.name,
        address: restaurant.address,
        email: restaurant.email,
        phone: restaurant.phone,
        subscriptionTier: restaurant.subscriptionTier,
        googleRating: restaurant.googleRating,
        cuisineType: restaurant.cuisineType,
        isActive: restaurant.isActive,
      },
      menuCount: menuCountResult.count,
      menuItemCount,
      qrCodeCount: qrCodeCountResult.count,
      totalScans: 0,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
