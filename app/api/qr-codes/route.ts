// app/api/qr-codes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import path to your db instance
import { restaurants, menus } from "@/db/schema"; // Adjust the import path
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth"; // Adjust to your auth implementation
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the current user (adjust this based on your auth implementation)
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's restaurant
    const userRestaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (!userRestaurant.length) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const restaurant = userRestaurant[0];

    // Get all published menus for this restaurant
    const restaurantMenus = await db
      .select()
      .from(menus)
      .where(
        and(
          eq(menus.restaurantId, restaurant.id),
          eq(menus.isPublished, true),
          eq(menus.isActive, true)
        )
      )
      .orderBy(menus.displayOrder);

    // Generate QR code data
    const qrCodes = restaurantMenus.map((menu) => ({
      id: menu.id,
      menuName: menu.name,
      menuSlug: menu.slug,
      restaurantName: restaurant.name,
      restaurantId: restaurant.id,
      // Generate the public menu URL - adjust domain as needed
      menuUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/menu/${menu.id}`,
    }));

    return NextResponse.json({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
      },
      qrCodes,
    });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
