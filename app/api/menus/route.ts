// app/api/menus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menus, restaurants } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Helper function to generate a URL-friendly slug
function generateSlug(name: string, restaurantId: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Add a short restaurant ID suffix to ensure uniqueness
  const shortId = restaurantId.slice(-8);
  return `${baseSlug}-${shortId}`;
}

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/menus - Starting request");

    // Get session with better error handling
    let session;
    try {
      const headersList = await headers();
      session = await auth.api.getSession({
        headers: headersList,
      });
      console.log("Session retrieved:", session ? "Yes" : "No");
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      console.log("No user session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", session.user.id);

    // Get user's restaurant with better error handling
    let userRestaurant;
    try {
      userRestaurant = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.ownerId, session.user.id))
        .limit(1);
      console.log(
        "Restaurant query result:",
        userRestaurant.length,
        "restaurants found"
      );
    } catch (dbError) {
      console.error("Database error fetching restaurant:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (userRestaurant.length === 0) {
      console.log("No restaurant found for user");
      return NextResponse.json(
        { error: "No restaurant found" },
        { status: 404 }
      );
    }

    // Get menus for the restaurant with proper ordering
    let userMenus;
    try {
      userMenus = await db
        .select()
        .from(menus)
        .where(eq(menus.restaurantId, userRestaurant[0].id))
        .orderBy(asc(menus.displayOrder), asc(menus.createdAt));
      console.log("Menus query result:", userMenus.length, "menus found");
    } catch (dbError) {
      console.error("Database error fetching menus:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: userMenus,
      total: userMenus.length,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/menus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/menus - Starting request");

    // Get session with better error handling
    let session;
    try {
      const headersList = await headers();
      session = await auth.api.getSession({
        headers: headersList,
      });
      console.log("Session retrieved:", session ? "Yes" : "No");
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    if (!session?.user?.id) {
      console.log("No user session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", Object.keys(body));
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { name, description, slug, isPublished, isActive, displayOrder } =
      body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      console.log("Invalid menu name:", name);
      return NextResponse.json(
        { error: "Menu name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get user's restaurant
    let userRestaurant;
    try {
      userRestaurant = await db
        .select()
        .from(restaurants)
        .where(eq(restaurants.ownerId, session.user.id))
        .limit(1);
      console.log(
        "Restaurant query result:",
        userRestaurant.length,
        "restaurants found"
      );
    } catch (dbError) {
      console.error("Database error fetching restaurant:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (userRestaurant.length === 0) {
      console.log("No restaurant found for user");
      return NextResponse.json(
        { error: "No restaurant found" },
        { status: 404 }
      );
    }

    // Generate slug if not provided
    const menuSlug =
      slug?.trim() || generateSlug(name.trim(), userRestaurant[0].id);
    console.log("Generated slug:", menuSlug);

    // Check if slug already exists
    let existingSlug;
    try {
      existingSlug = await db
        .select({ id: menus.id })
        .from(menus)
        .where(eq(menus.slug, menuSlug))
        .limit(1);
      console.log(
        "Slug check result:",
        existingSlug.length,
        "existing slugs found"
      );
    } catch (dbError) {
      console.error("Database error checking slug:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (existingSlug.length > 0) {
      return NextResponse.json(
        {
          error:
            "Menu slug already exists. Please choose a different name or provide a custom slug.",
        },
        { status: 400 }
      );
    }

    // Create new menu
    let newMenu;
    try {
      newMenu = await db
        .insert(menus)
        .values({
          restaurantId: userRestaurant[0].id,
          name: name.trim(),
          description: description?.trim() || null,
          slug: menuSlug,
          isPublished: Boolean(isPublished),
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          displayOrder: typeof displayOrder === "number" ? displayOrder : 0,
        })
        .returning();
      console.log("Menu created successfully:", newMenu[0]?.id);
    } catch (dbError) {
      console.error("Database error creating menu:", dbError);

      // Handle unique constraint violations
      if (dbError instanceof Error && dbError.message.includes("unique")) {
        return NextResponse.json(
          { error: "Menu with this slug already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Database error creating menu" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newMenu[0],
        message: "Menu created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/menus:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
