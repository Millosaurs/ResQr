import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db"; // Fixed import path
import { restaurants, menus, menuItems } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

type Activity = {
  id: string;
  text: string;
  time: string;
  type: string;
  timestamp: Date;
};

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's restaurant
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, userId))
      .limit(1);

    if (!restaurant) {
      return NextResponse.json([]);
    }

    // Get recent menus
    const recentMenus = await db
      .select()
      .from(menus)
      .where(eq(menus.restaurantId, restaurant.id))
      .orderBy(desc(menus.updatedAt))
      .limit(3);

    // Get menu IDs for menu items query
    const menuIds = recentMenus.map((m) => m.id);

    let recentMenuItems: Array<{
      id: string;
      name: string;
      createdAt: string | null;
      updatedAt: string | null;
      menuId: string;
    }> = [];

    if (menuIds.length > 0) {
      recentMenuItems = await db
        .select({
          id: menuItems.id,
          name: menuItems.name,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          menuId: menuItems.menuId,
        })
        .from(menuItems)
        .where(inArray(menuItems.menuId, menuIds))
        .orderBy(desc(menuItems.updatedAt))
        .limit(2);
    }

    // Create activity feed with explicit typing
    const activities: Activity[] = [];

    // Add menu activities
    recentMenus.forEach((menu) => {
      // Handle null updatedAt
      const updatedAt = menu.updatedAt ? new Date(menu.updatedAt) : new Date();
      const createdAt = menu.createdAt ? new Date(menu.createdAt) : new Date();

      activities.push({
        id: `menu-${menu.id}`,
        text: `Menu '${menu.name}' ${
          createdAt.getTime() === updatedAt.getTime() ? "created" : "updated"
        }`,
        time: formatTimeAgo(updatedAt),
        type: "menu",
        timestamp: updatedAt,
      });
    });

    // Add menu item activities
    recentMenuItems.forEach((item) => {
      // Handle null updatedAt
      const updatedAt = item.updatedAt ? new Date(item.updatedAt) : new Date();
      const createdAt = item.createdAt ? new Date(item.createdAt) : new Date();

      activities.push({
        id: `item-${item.id}`,
        text: `Menu item '${item.name}' ${
          createdAt.getTime() === updatedAt.getTime() ? "added" : "updated"
        }`,
        time: formatTimeAgo(updatedAt),
        type: "menu-item",
        timestamp: updatedAt,
      });
    });

    // Sort by most recent timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Remove timestamp from response (keep for sorting only)
    const responseActivities = activities
      .slice(0, 5)
      .map(({ timestamp, ...activity }) => activity);

    return NextResponse.json(responseActivities);
  } catch (error) {
    console.error("Dashboard activity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
