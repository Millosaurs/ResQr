// app/api/menus/[id]/items/[itemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, menus, restaurants, menuCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/menus/[id]/items/[itemId] - Get a specific menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, itemId } = resolvedParams;

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

    // Fetch the specific menu item with category info
    const item = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        estimatedTime: menuItems.estimatedTime,
        ingredients: menuItems.ingredients,
        imageUrl: menuItems.imageUrl,
        imageId: menuItems.imageId,
        isVegetarian: menuItems.isVegetarian,
        isVegan: menuItems.isVegan,
        isGlutenFree: menuItems.isGlutenFree,
        isSpicy: menuItems.isSpicy,
        isAvailable: menuItems.isAvailable,
        sortOrder: menuItems.sortOrder,
        displayOrder: menuItems.displayOrder,
        categoryId: menuItems.categoryId,
        categoryName: menuCategories.name,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
      })
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(and(eq(menuItems.id, itemId), eq(menuItems.menuId, menuId)))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const result = {
      ...item[0],
      ingredients: item[0].ingredients ? JSON.parse(item[0].ingredients) : [],
      categoryName: item[0].categoryName || "Uncategorized",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/menus/[id]/items/[itemId] - Update a menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, itemId } = resolvedParams;

    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      estimatedTime,
      ingredients,
      categoryId,
      isVegetarian,
      isVegan,
      isGlutenFree,
      isSpicy,
      isAvailable,
      imageUrl,
      imageId,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
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

    // Verify item exists and belongs to this menu
    const existingItem = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.menuId, menuId)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Verify category exists and belongs to this menu
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

    // Update menu item
    const updatedItem = await db
      .update(menuItems)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price).toFixed(2),
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        ingredients:
          ingredients && Array.isArray(ingredients)
            ? JSON.stringify(ingredients)
            : null,
        categoryId: categoryId,
        imageUrl: imageUrl || null,
        imageId: imageId || null,
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
        isSpicy: Boolean(isSpicy),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(menuItems.id, itemId))
      .returning();

    // Fetch the updated item with category info
    const itemWithCategory = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        estimatedTime: menuItems.estimatedTime,
        ingredients: menuItems.ingredients,
        imageUrl: menuItems.imageUrl,
        imageId: menuItems.imageId,
        isVegetarian: menuItems.isVegetarian,
        isVegan: menuItems.isVegan,
        isGlutenFree: menuItems.isGlutenFree,
        isSpicy: menuItems.isSpicy,
        isAvailable: menuItems.isAvailable,
        sortOrder: menuItems.sortOrder,
        displayOrder: menuItems.displayOrder,
        categoryId: menuItems.categoryId,
        categoryName: menuCategories.name,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
      })
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(eq(menuItems.id, itemId))
      .limit(1);

    const result = {
      ...itemWithCategory[0],
      ingredients: itemWithCategory[0].ingredients
        ? JSON.parse(itemWithCategory[0].ingredients)
        : [],
      categoryName: itemWithCategory[0].categoryName || "Uncategorized",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/menus/[id]/items/[itemId] - Partially update a menu item (e.g., availability)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, itemId } = resolvedParams;

    // Get session
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

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

    // Verify item exists and belongs to this menu
    const existingItem = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.menuId, menuId)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (body.isAvailable !== undefined) {
      updateData.isAvailable = Boolean(body.isAvailable);
    }
    if (body.sortOrder !== undefined) {
      updateData.sortOrder = parseInt(body.sortOrder);
    }
    if (body.displayOrder !== undefined) {
      updateData.displayOrder = parseInt(body.displayOrder);
    }

    // Update menu item
    await db.update(menuItems).set(updateData).where(eq(menuItems.id, itemId));

    // Fetch the updated item with category info
    const itemWithCategory = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        estimatedTime: menuItems.estimatedTime,
        ingredients: menuItems.ingredients,
        imageUrl: menuItems.imageUrl,
        imageId: menuItems.imageId,
        isVegetarian: menuItems.isVegetarian,
        isVegan: menuItems.isVegan,
        isGlutenFree: menuItems.isGlutenFree,
        isSpicy: menuItems.isSpicy,
        isAvailable: menuItems.isAvailable,
        sortOrder: menuItems.sortOrder,
        displayOrder: menuItems.displayOrder,
        categoryId: menuItems.categoryId,
        categoryName: menuCategories.name,
        createdAt: menuItems.createdAt,
        updatedAt: menuItems.updatedAt,
      })
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(eq(menuItems.id, itemId))
      .limit(1);

    const result = {
      ...itemWithCategory[0],
      ingredients: itemWithCategory[0].ingredients
        ? JSON.parse(itemWithCategory[0].ingredients)
        : [],
      categoryName: itemWithCategory[0].categoryName || "Uncategorized",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/menus/[id]/items/[itemId] - Delete a menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: menuId, itemId } = resolvedParams;

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

    // Verify item exists and belongs to this menu
    const existingItem = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, itemId), eq(menuItems.menuId, menuId)))
      .limit(1);

    if (existingItem.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the menu item
    await db.delete(menuItems).where(eq(menuItems.id, itemId));

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
