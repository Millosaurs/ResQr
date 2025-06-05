// app/api/restaurants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Your database connection
import { restaurants, user, images } from "@/db/schema"; // Added images import
import { auth } from "@/lib/auth"; // Your Better Auth configuration
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm"; // Added 'and' import

export async function POST(request: NextRequest) {
  try {
    // Check authentication using Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a restaurant
    const existingRestaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (existingRestaurant.length > 0) {
      return NextResponse.json(
        { error: "User already has a restaurant" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      address,
      phone,
      email,
      googleBusinessUrl,
      googleRating,
      cuisineType,
      description,
      logoImageId,
      colorTheme,
      subscriptionTier,
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    let logoUrl = null;

    // If logoImageId is provided, verify the image belongs to the user and get the URL
    if (logoImageId) {
      const imageRecord = await db
        .select({
          imageUrl: images.imageUrl,
          uploadedBy: images.uploadedBy,
        })
        .from(images)
        .where(
          and(
            eq(images.id, logoImageId),
            eq(images.uploadedBy, session.user.id)
          )
        )
        .limit(1);

      if (imageRecord.length === 0) {
        return NextResponse.json(
          {
            error:
              "Logo image not found or you don't have permission to use this image",
          },
          { status: 400 }
        );
      }

      logoUrl = imageRecord[0].imageUrl;
    }

    // Create restaurant
    const [newRestaurant] = await db
      .insert(restaurants)
      .values({
        ownerId: session.user.id,
        name: name.trim(),
        address: address || null,
        phone: phone || null,
        email: email || null,
        googleBusinessUrl: googleBusinessUrl || null,
        googleRating: googleRating || null,
        cuisineType: cuisineType || null,
        description: description || null,
        logoImageId: logoImageId || null,
        logoUrl: logoUrl, // Set the logo URL from the image
        colorTheme: colorTheme || "#000000",
        subscriptionTier: subscriptionTier || "FREE",
        isActive: true,
      })
      .returning();

    // Update user's hasRestaurant status
    await db
      .update(user)
      .set({ hasRestaurant: true })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: newRestaurant,
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
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

    // Get user's restaurant
    const userRestaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (userRestaurant.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userRestaurant[0],
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      phone,
      email,
      googleBusinessUrl,
      googleRating,
      cuisineType,
      description,
      logoImageId,
      colorTheme,
      subscriptionTier,
    } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    let logoUrl = null;

    // If logoImageId is provided, verify the image belongs to the user and get the URL
    if (logoImageId) {
      const imageRecord = await db
        .select({
          imageUrl: images.imageUrl,
          uploadedBy: images.uploadedBy,
        })
        .from(images)
        .where(
          and(
            eq(images.id, logoImageId),
            eq(images.uploadedBy, session.user.id)
          )
        )
        .limit(1);

      if (imageRecord.length === 0) {
        return NextResponse.json(
          {
            error:
              "Logo image not found or you don't have permission to use this image",
          },
          { status: 400 }
        );
      }

      logoUrl = imageRecord[0].imageUrl;
    }

    // Update restaurant
    const [updatedRestaurant] = await db
      .update(restaurants)
      .set({
        name: name.trim(),
        address: address || null,
        phone: phone || null,
        email: email || null,
        googleBusinessUrl: googleBusinessUrl || null,
        googleRating: googleRating || null,
        cuisineType: cuisineType || null,
        description: description || null,
        logoImageId: logoImageId || null,
        logoUrl: logoUrl, // Update logo URL if provided
        colorTheme: colorTheme || "#000000",
        subscriptionTier: subscriptionTier || "FREE",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(restaurants.ownerId, session.user.id))
      .returning();

    if (!updatedRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}
