// app/menu/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Phone, Mail, Star, Leaf, Flame } from "lucide-react";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedTime: number;
  ingredients: string[];
  imageUrl?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  categoryName: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  colorTheme: string;
  cuisineType: string;
  description: string;
  googleRating: string;
}

interface MenuData {
  id: string;
  name: string;
  description: string;
  restaurant: Restaurant;
  items: MenuItem[];
  categories: string[];
}

export default function PublicMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extract params
  useEffect(() => {
    let isMounted = true;

    params
      .then(({ id }) => {
        if (isMounted) {
          setMenuId(id);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error extracting params:", err);
          setError("Invalid menu URL");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params]);

  // Fetch menu data
  useEffect(() => {
    if (!menuId) return;

    let isMounted = true;

    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/public/menu/${menuId}`);

        if (!isMounted) return;

        if (!response.ok) {
          if (response.status === 404) {
            setError("Menu not found or not published");
          } else {
            setError("Failed to load menu");
          }
          return;
        }

        const data = await response.json();

        if (!isMounted) return;

        setMenuData(data);

        // Set default category
        if (data?.categories?.length > 0) {
          setSelectedCategory(data.categories[0]);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching menu:", err);
          setError("Failed to load menu");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMenuData();

    return () => {
      isMounted = false;
    };
  }, [menuId]);

  const filteredItems =
    menuData?.items?.filter(
      (item) =>
        selectedCategory === "all" || item.categoryName === selectedCategory
    ) || [];

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Menu Not Available</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const { restaurant } = menuData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div
        className="relative bg-gradient-to-r from-primary/10 to-primary/5 border-b"
        style={{
          background: restaurant?.colorTheme
            ? `linear-gradient(135deg, ${restaurant.colorTheme}15, ${restaurant.colorTheme}05)`
            : undefined,
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {restaurant?.logoUrl && (
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-lg">
                <Image
                  src={restaurant.logoUrl}
                  alt={`${restaurant.name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {restaurant?.name || "Loading..."}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {menuData.name}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                {restaurant?.cuisineType && (
                  <Badge variant="secondary">{restaurant.cuisineType}</Badge>
                )}
                {restaurant?.googleRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{restaurant.googleRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {menuData.description && (
            <p className="text-center md:text-left mt-4 text-muted-foreground max-w-2xl">
              {menuData.description}
            </p>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      {menuData.categories && menuData.categories.length > 1 && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                All Items
              </button>
              {menuData.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {selectedCategory === "all" ? (
          // Show all categories
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([categoryName, items]) => (
              <div key={categoryName}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  {categoryName}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({items.length} items)
                  </span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show selected category
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              {selectedCategory}
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredItems.length} items)
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No items available in this category.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {restaurant?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{restaurant.email}</span>
                  </div>
                )}
                {restaurant?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-sm text-muted-foreground">
                {restaurant?.description ||
                  `Welcome to ${
                    restaurant?.name || "our restaurant"
                  }. We serve delicious ${
                    restaurant?.cuisineType || ""
                  } cuisine.`}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Menu</h3>
              <p className="text-sm text-muted-foreground">{menuData.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Rating</h3>
              {restaurant?.googleRating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(parseFloat(restaurant.googleRating))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">
                    {restaurant.googleRating}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="text-center text-sm text-muted-foreground">
            <p>
              © 2024 {restaurant?.name || "Restaurant"}. Digital menu powered by
              MenuCraft.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <Card
      className={`h-full transition-all hover:shadow-md ${
        !item.isAvailable ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          {item.imageUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              ₹{item.price}
            </span>
            {!item.isAvailable && (
              <Badge variant="destructive">Not Available</Badge>
            )}
          </div>

          {item.estimatedTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{item.estimatedTime} mins</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {item.isVegetarian && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                <Leaf className="h-3 w-3 mr-1" />
                Veg
              </Badge>
            )}
            {item.isVegan && (
              <Badge
                variant="outline"
                className="text-green-700 border-green-300"
              >
                Vegan
              </Badge>
            )}
            {item.isGlutenFree && <Badge variant="outline">Gluten Free</Badge>}
            {item.isSpicy && (
              <Badge variant="outline" className="text-red-600 border-red-200">
                <Flame className="h-3 w-3 mr-1" />
                Spicy
              </Badge>
            )}
          </div>

          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Ingredients:
              </p>
              <p className="text-xs text-muted-foreground">
                {item.ingredients.join(", ")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
