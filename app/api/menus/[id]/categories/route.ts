// app/api/menus/[id]/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menuCategories, menus, restaurants } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const menuId = resolvedParams.id;

    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify menu belongs to user's restaurant
    const userRestaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (userRestaurant.length === 0) {
      return NextResponse.json(
        { error: "No restaurant found" },
        { status: 404 }
      );
    }

    const menu = await db
      .select()
      .from(menus)
      .where(
        and(eq(menus.id, menuId), eq(menus.restaurantId, userRestaurant[0].id))
      )
      .limit(1);

    if (menu.length === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Get categories for the menu
    const MenuCategories = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.menuId, menuId))
      .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.createdAt));

    return NextResponse.json(MenuCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const menuId = resolvedParams.id;

    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Verify menu belongs to user's restaurant
    const userRestaurant = await db
      .select()
      .from(restaurants)
      .where(eq(restaurants.ownerId, session.user.id))
      .limit(1);

    if (userRestaurant.length === 0) {
      return NextResponse.json(
        { error: "No restaurant found" },
        { status: 404 }
      );
    }

    const menu = await db
      .select()
      .from(menus)
      .where(
        and(eq(menus.id, menuId), eq(menus.restaurantId, userRestaurant[0].id))
      )
      .limit(1);

    if (menu.length === 0) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Get the current max sort order
    const maxSortOrder = await db
      .select({ maxOrder: menuCategories.sortOrder })
      .from(menuCategories)
      .where(eq(menuCategories.menuId, menuId))
      .orderBy(asc(menuCategories.sortOrder))
      .limit(1);

    const nextSortOrder = (maxSortOrder[0]?.maxOrder || 0) + 1;

    // Create new category
    const newCategory = await db
      .insert(menuCategories)
      .values({
        menuId: menuId,
        name: name.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: nextSortOrder,
      })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
