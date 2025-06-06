// app/api/public/menu/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menus, restaurants, menuItems, menuCategories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Await params before accessing properties
    const { id } = await context.params;

    console.log("Fetching public menu with ID:", id);

    // Get published menu with restaurant details
    const menu = await db
      .select({
        id: menus.id,
        name: menus.name,
        description: menus.description,
        slug: menus.slug,
        createdAt: menus.createdAt,
        updatedAt: menus.updatedAt,
        restaurantId: menus.restaurantId,
        restaurantName: restaurants.name,
        restaurantAddress: restaurants.address,
        restaurantPhone: restaurants.phone,
        restaurantEmail: restaurants.email,
        restaurantLogoUrl: restaurants.logoUrl,
        restaurantColorTheme: restaurants.colorTheme,
        restaurantCuisineType: restaurants.cuisineType,
        restaurantDescription: restaurants.description,
        restaurantGoogleRating: restaurants.googleRating,
        restaurantGoogleBusinessUrl: restaurants.googleBusinessUrl,
      })
      .from(menus)
      .innerJoin(restaurants, eq(menus.restaurantId, restaurants.id))
      .where(
        and(
          eq(menus.id, id),
          eq(menus.isPublished, true),
          eq(menus.isActive, true),
          eq(restaurants.isActive, true)
        )
      )
      .limit(1);

    if (menu.length === 0) {
      return NextResponse.json(
        { error: "Menu not found or not published" },
        { status: 404 }
      );
    }

    console.log("Menu found, fetching categories and items");

    // Get menu categories with proper ordering
    const categories = await db
      .select()
      .from(menuCategories)
      .where(
        and(eq(menuCategories.menuId, id), eq(menuCategories.isActive, true))
      )
      .orderBy(
        asc(menuCategories.displayOrder),
        asc(menuCategories.sortOrder),
        asc(menuCategories.name)
      );

    // Get all menu items with proper ordering
    const items = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.menuId, id), eq(menuItems.isAvailable, true)))
      .orderBy(
        asc(menuItems.displayOrder),
        asc(menuItems.sortOrder),
        asc(menuItems.name)
      );

    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
      const categoryId = item.categoryId || "uncategorized";
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(item);
      return acc;
    }, {} as Record<string, typeof items>);

    // Build response with categorized items
    const categorizedItems = categories.map((category) => ({
      ...category,
      items: itemsByCategory[category.id] || [],
    }));

    // Add uncategorized items if any
    if (itemsByCategory["uncategorized"]) {
      categorizedItems.push({
        id: "uncategorized",
        menuId: id,
        name: "Other Items",
        description: null,
        sortOrder: 999,
        displayOrder: 999,
        isActive: true,
        createdAt: new Date().toISOString(),
        items: itemsByCategory["uncategorized"],
      });
    }

    const response = {
      success: true,
      data: {
        menu: menu[0],
        categories: categorizedItems,
        totalItems: items.length,
        totalCategories: categories.length,
      },
    };

    console.log("Returning menu data:", {
      menuId: id,
      itemCount: items.length,
      categoryCount: categories.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching public menu:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
