// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Your database connection
import { user, restaurants } from "@/db/schema";
import { auth } from "@/lib/auth"; // Your Better Auth configuration
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

    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    if (
      body.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(body.email)
    ) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (body.phone && !/^\+\d{1,4}\d{10}$/.test(body.phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    if (body.googleRating) {
      const rating = parseFloat(body.googleRating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          { error: "Google rating must be between 0 and 5" },
          { status: 400 }
        );
      }
    }

    const existingRestaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (existingRestaurant.length > 0) {
      return NextResponse.json(
        { error: "You already have a restaurant registered" },
        { status: 400 }
      );
    }

    // STEP 1: Create the restaurant
    const insertedRestaurant = await db
      .insert(restaurants)
      .values({
        name: body.name.trim(),
        address: body.address?.trim() || null,
        phone: body.phone || null,
        email: body.email?.trim() || null,
        googleBusinessUrl: body.googleBusinessUrl?.trim() || null,
        googleRating: body.googleRating ? body.googleRating.toString() : null,
        cuisineType: body.cuisineType || null,
        description: body.description?.trim() || null,
        logoUrl: body.logoUrl || null,
        colorTheme: body.colorTheme || "#000000",
        subscriptionTier: body.subscriptionTier || "FREE",
        ownerId: session.user.id,
      })
      .returning();

    // STEP 2: Update user to set hasRestaurant = true
    await db
      .update(user)
      .set({ hasRestaurant: true })
      .where(eq(user.id, session.user.id));

    return NextResponse.json(
      {
        message: "Restaurant created successfully",
        restaurant: insertedRestaurant[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's restaurants
    const userRestaurants = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id));

    return NextResponse.json({
      restaurants: userRestaurants,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
