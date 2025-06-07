// app/api/menus/[id]/categories/[categoryId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menuCategories, menus, restaurants, menuItems } from "@/db/schema"; // Add menuItems import
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, categoryId } = resolvedParams;

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

    // Verify category exists and belongs to the menu
    const categoryToDelete = await db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, categoryId),
          eq(menuCategories.menuId, menuId)
        )
      )
      .limit(1);

    if (categoryToDelete.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // First, delete all menu items that belong to this category
    const deletedItems = await db
      .delete(menuItems)
      .where(
        and(eq(menuItems.categoryId, categoryId), eq(menuItems.menuId, menuId))
      )
      .returning();

    // Then delete the category
    await db
      .delete(menuCategories)
      .where(
        and(
          eq(menuCategories.id, categoryId),
          eq(menuCategories.menuId, menuId)
        )
      );

    return NextResponse.json(
      {
        message: "Category deleted successfully",
        deletedItemsCount: deletedItems.length,
        deletedItems: deletedItems.map((item) => item.id), // Return deleted item IDs
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ... rest of your PUT and GET functions remain the same

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, categoryId } = resolvedParams;

    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isActive, sortOrder } = body;

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

    // Verify category exists and belongs to the menu
    const existingCategory = await db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, categoryId),
          eq(menuCategories.menuId, menuId)
        )
      )
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Category name must be a non-empty string" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    if (sortOrder !== undefined) {
      if (typeof sortOrder !== "number" || sortOrder < 0) {
        return NextResponse.json(
          { error: "Sort order must be a non-negative number" },
          { status: 400 }
        );
      }
      updateData.sortOrder = sortOrder;
    }

    // Update the category
    const updatedCategory = await db
      .update(menuCategories)
      .set(updateData)
      .where(
        and(
          eq(menuCategories.id, categoryId),
          eq(menuCategories.menuId, menuId)
        )
      )
      .returning();

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, categoryId } = resolvedParams;

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

    // Get the specific category
    const category = await db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.id, categoryId),
          eq(menuCategories.menuId, menuId)
        )
      )
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category[0]);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
