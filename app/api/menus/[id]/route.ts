import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menus, restaurants, menuItems, menuCategories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get specific menu details
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get menu with restaurant ownership check
    const menu = await db
      .select({
        id: menus.id,
        restaurantId: menus.restaurantId,
        name: menus.name,
        description: menus.description,
        slug: menus.slug,
        isPublished: menus.isPublished,
        isActive: menus.isActive,
        displayOrder: menus.displayOrder,
        createdAt: menus.createdAt,
        updatedAt: menus.updatedAt,
        restaurantName: restaurants.name,
        restaurantOwnerId: restaurants.ownerId,
      })
      .from(menus)
      .innerJoin(restaurants, eq(menus.restaurantId, restaurants.id))
      .where(and(eq(menus.id, id), eq(restaurants.ownerId, session.user.id)))
      .limit(1);

    if (menu.length === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: menu[0],
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update menu
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, slug, isPublished, isActive, displayOrder } =
      body;

    // Verify ownership
    const menu = await db
      .select({ restaurantOwnerId: restaurants.ownerId })
      .from(menus)
      .innerJoin(restaurants, eq(menus.restaurantId, restaurants.id))
      .where(eq(menus.id, id))
      .limit(1);

    if (menu.length === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu[0].restaurantOwnerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If slug is being updated, check for uniqueness
    if (slug) {
      const existingSlug = await db
        .select({ id: menus.id })
        .from(menus)
        .where(and(eq(menus.slug, slug), eq(menus.id, id)))
        .limit(1);

      if (existingSlug.length > 0 && existingSlug[0].id !== id) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update menu
    const updatedMenu = await db
      .update(menus)
      .set({
        name: name?.trim(),
        description: description?.trim() || null,
        slug: slug?.trim(),
        isPublished: isPublished,
        isActive: isActive,
        displayOrder: displayOrder,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(menus.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedMenu[0],
      message: "Menu updated successfully",
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const menu = await db
      .select({ restaurantOwnerId: restaurants.ownerId })
      .from(menus)
      .innerJoin(restaurants, eq(menus.restaurantId, restaurants.id))
      .where(eq(menus.id, id))
      .limit(1);

    if (menu.length === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (menu[0].restaurantOwnerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete menu (cascade will handle menu items and categories)
    await db.delete(menus).where(eq(menus.id, id));

    return NextResponse.json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
