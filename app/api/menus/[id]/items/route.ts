// app/api/menus/[id]/items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, menus, restaurants, menuCategories } from "@/db/schema";
import { eq, and, asc, desc, max } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/menus/[id]/items - Fetch all items for a menu
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

    // Fetch menu items with category information
    const items = await db
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
      .where(eq(menuItems.menuId, menuId))
      .orderBy(
        asc(menuCategories.sortOrder),
        asc(menuItems.sortOrder),
        asc(menuItems.createdAt)
      );

    // Parse ingredients JSON strings back to arrays
    const itemsWithParsedIngredients = items.map((item) => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      categoryName: item.categoryName || "Uncategorized",
    }));

    return NextResponse.json(itemsWithParsedIngredients);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/menus/[id]/items - Create a new menu item
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

    // Get the current max sort order for this menu
    const maxSortOrderResult = await db
      .select({ maxOrder: max(menuItems.sortOrder) })
      .from(menuItems)
      .where(eq(menuItems.menuId, menuId));

    const nextSortOrder = (maxSortOrderResult[0]?.maxOrder || 0) + 1;

    // Create new menu item
    const newItem = await db
      .insert(menuItems)
      .values({
        menuId: menuId,
        categoryId: categoryId,
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price).toFixed(2),
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        ingredients:
          ingredients && Array.isArray(ingredients)
            ? JSON.stringify(ingredients)
            : null,
        imageUrl: imageUrl || null,
        imageId: imageId || null,
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
        isSpicy: Boolean(isSpicy),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        sortOrder: nextSortOrder,
        displayOrder: nextSortOrder,
      })
      .returning();

    // Fetch the created item with category info
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
      .where(eq(menuItems.id, newItem[0].id))
      .limit(1);

    const result = {
      ...itemWithCategory[0],
      ingredients: itemWithCategory[0].ingredients
        ? JSON.parse(itemWithCategory[0].ingredients)
        : [],
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
