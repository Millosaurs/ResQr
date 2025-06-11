"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Leaf,
  Flame,
  AlertCircle,
  Eye,
  Filter,
  Search,
  X,
  Loader2,
  Info,
} from "lucide-react";
import Image from "next/image";
import Head from "next/head";
import { Toaster } from "sonner";

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
  googleBusinessUrl?: string;
}

interface MenuData {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  restaurant: Restaurant;
  items: MenuItem[];
  categories: string[];
}

interface FilterState {
  search: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  availableOnly: boolean;
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
  const [isPreview, setIsPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    availableOnly: false,
  });

  // Extract params
  useEffect(() => {
    let isMounted = true;
    params
      .then(({ id }) => {
        if (isMounted) {
          setMenuId(id);
          const urlParams = new URLSearchParams(window.location.search);
          setIsPreview(urlParams.has("preview"));
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

        const url = `/api/public/menu/${menuId}${
          isPreview ? "?preview=true" : ""
        }`;
        const response = await fetch(url);

        if (!isMounted) return;

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 404) {
            setError("Menu not found");
          } else if (response.status === 403) {
            setError(
              "This menu is not currently published and available to the public"
            );
          } else {
            setError(errorData.message || "Failed to load menu");
          }
          return;
        }

        const result = await response.json();
        if (!isMounted) return;

        setMenuData(result.data);

        if (result.data?.categories?.length > 0) {
          setSelectedCategory("all");
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
  }, [menuId, isPreview]);

  // Filter items based on search and filters
  const getFilteredItems = () => {
    if (!menuData?.items || !Array.isArray(menuData.items)) {
      return [];
    }

    let items = [...menuData.items]; // Create a copy to avoid mutating original array

    // Category filter
    if (selectedCategory !== "all") {
      items = items.filter((item) => item?.categoryName === selectedCategory);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      items = items.filter((item) => {
        if (!item) return false;

        const nameMatch =
          item.name?.toLowerCase().includes(searchTerm) || false;
        const descMatch =
          item.description?.toLowerCase().includes(searchTerm) || false;
        const ingredientMatch =
          item.ingredients && Array.isArray(item.ingredients)
            ? item.ingredients.some((ingredient) =>
                ingredient?.toLowerCase().includes(searchTerm)
              )
            : false;

        return nameMatch || descMatch || ingredientMatch;
      });
    }

    // Dietary filters
    if (filters.isVegetarian) {
      items = items.filter((item) => item?.isVegetarian === true);
    }
    if (filters.isVegan) {
      items = items.filter((item) => item?.isVegan === true);
    }
    if (filters.isGlutenFree) {
      items = items.filter((item) => item?.isGlutenFree === true);
    }
    if (filters.isSpicy) {
      items = items.filter((item) => item?.isSpicy === true);
    }
    if (filters.availableOnly) {
      items = items.filter((item) => item?.isAvailable === true);
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!item?.categoryName) return acc;

    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const hasActiveFilters = Object.values(filters).some((value) =>
    typeof value === "boolean" ? value : value.length > 0
  );

  const clearAllFilters = () => {
    setFilters({
      search: "",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      availableOnly: false,
    });
  };

  if (loading) {
    return (
      <>
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-center">
            Loading QR codes...
          </p>
        </div>

        <Toaster
          toastOptions={{
            style: {
              fontFamily: "var(--font-outfit)",
            },
          }}
        />
      </>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            Menu Not Available
          </h1>
          <p className="text-muted-foreground mb-4 text-sm md:text-base">
            {error}
          </p>
          {error?.includes("not published") && (
            <p className="text-xs md:text-sm text-muted-foreground">
              The restaurant owner needs to publish this menu before it can be
              viewed publicly.
            </p>
          )}
        </div>
      </div>
    );
  }

  const { restaurant } = menuData;

  return (
    <>
      <Head>
        <title>
          {restaurant?.name
            ? `${restaurant.name} - by ResQr`
            : "Menu - by ResQr"}
        </title>
        <meta
          name="description"
          content={`${restaurant?.name || "Restaurant"} menu - ${
            menuData.description || "Digital menu"
          } powered by ResQr`}
        />
        <meta
          property="og:title"
          content={`${restaurant?.name || "Restaurant"} - by ResQr`}
        />
        <meta
          property="og:description"
          content={`${restaurant?.name || "Restaurant"} menu - ${
            menuData.description || "Digital menu"
          } powered by ResQr`}
        />
        {restaurant?.logoUrl && (
          <meta property="og:image" content={restaurant.logoUrl} />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Preview Banner */}
        {isPreview && !menuData.isPublished && (
          <div className="bg-orange-100 border-b border-orange-200 p-3">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 text-orange-800">
                <Eye className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  Preview Mode - This menu is not published yet
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {restaurant?.logoUrl && (
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white shadow-sm shrink-0">
                    <Image
                      src={restaurant.logoUrl}
                      alt={`${restaurant.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold truncate">
                    {restaurant?.name}
                  </h1>
                  {restaurant?.cuisineType && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {restaurant.cuisineType}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {restaurant?.googleRating && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {restaurant.googleRating}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground hidden sm:block">
                  by ResQr
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Responsive Search and Filter Bar */}
        <div className="border-b bg-white/50 backdrop-blur-sm sticky top-[65px] sm:top-[73px] z-10">
          <div className="container mx-auto px-3 sm:px-4 py-3">
            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm transition-colors ${
                  showFilters || hasActiveFilters
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                    {
                      Object.values(filters).filter((v) =>
                        typeof v === "boolean" ? v : v.length > 0
                      ).length
                    }
                  </span>
                )}
              </button>

              {/* Category Pills - Horizontal scroll on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-2 rounded-full whitespace-nowrap text-sm transition-colors shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  All ({menuData?.items?.length || 0})
                </button>
                {menuData?.categories?.map((category) => {
                  const categoryItemCount =
                    menuData?.items?.filter(
                      (item) => item?.categoryName === category
                    )?.length || 0;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 rounded-full whitespace-nowrap text-sm transition-colors shrink-0 ${
                        selectedCategory === category
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {category} ({categoryItemCount})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isVegetarian}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isVegetarian: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Leaf className="h-4 w-4 text-green-600" />
                    <span className="truncate">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isVegan}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isVegan: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span className="truncate">Vegan</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isGlutenFree}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isGlutenFree: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span className="truncate">Gluten Free</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isSpicy}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isSpicy: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Flame className="h-4 w-4 text-red-600" />
                    <span className="truncate">Spicy</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          availableOnly: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span className="truncate">Available Only</span>
                  </label>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-0">
          {selectedCategory === "all" && !hasActiveFilters ? (
            // Show all categories when no filters are active
            <div className="space-y-6 sm:space-y-8">
              {Object.entries(groupedItems).map(([categoryName, items]) => (
                <section key={categoryName}>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                    {categoryName}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({items.length})
                    </span>
                  </h2>
                  <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onInfoClick={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            // Show filtered results
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {selectedCategory === "all"
                    ? "Search Results"
                    : selectedCategory}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredItems.length} items)
                  </span>
                </h2>
              </div>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onInfoClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                No items found matching your criteria.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-primary hover:underline text-sm sm:text-base"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </main>

        {/* Item Details Modal */}
        {selectedItem && (
          <ItemModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}

        {/* Responsive Footer */}
        <footer className="border-t bg-muted/20 mt-8 sm:mt-12">
          <div className="container mx-auto px-3 sm:px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                {restaurant?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="break-all">{restaurant.phone}</span>
                  </div>
                )}
                {restaurant?.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="break-words text-center sm:text-left">
                      {restaurant.address}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-xs">
                Powered by <span className="font-medium">ResQr</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function MenuItemCard({
  item,
  onInfoClick,
}: {
  item: MenuItem;
  onInfoClick: () => void;
}) {
  // Check if we have any badges to show
  const hasBadges =
    item.isVegetarian || item.isVegan || item.isGlutenFree || item.isSpicy;

  return (
    <Card
      className={`h-full transition-all hover:shadow-md py-0 ${
        !item.isAvailable ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-3 ">
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold leading-tight text-lg sm:text-xl break-words mb-1">
              {item.name}
            </h1>
            <div className="text-lg sm:text-xl font-bold text-primary">
              ₹{item.price}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!item.isAvailable && (
              <Badge variant="destructive" className="text-xs">
                Unavailable
              </Badge>
            )}
            <button
              onClick={onInfoClick}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
              aria-label="View item details"
            >
              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        {hasBadges && (
          <div className="flex flex-wrap gap-1">
            {item.isVegetarian && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 text-xs"
              >
                <Leaf className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                Veg
              </Badge>
            )}
            {item.isVegan && (
              <Badge
                variant="outline"
                className="text-green-700 border-green-300 text-xs"
              >
                Vegan
              </Badge>
            )}
            {item.isGlutenFree && (
              <Badge variant="outline" className="text-xs">
                Gluten Free
              </Badge>
            )}
            {item.isSpicy && (
              <Badge
                variant="outline"
                className="text-red-600 border-red-200 text-xs"
              >
                <Flame className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                Spicy
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ItemModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const hasBadges =
    item.isVegetarian || item.isVegan || item.isGlutenFree || item.isSpicy;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold break-words">
              {item.name}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-primary">
                ₹{item.price}
              </span>
              {!item.isAvailable && (
                <Badge variant="destructive">Unavailable</Badge>
              )}
            </div>

            {item.description && item.description.trim() && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground break-words">
                  {item.description}
                </p>
              </div>
            )}

            {item.estimatedTime && item.estimatedTime > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Estimated preparation time: {item.estimatedTime} minutes
                </span>
              </div>
            )}

            {hasBadges && (
              <div>
                <h3 className="font-medium mb-2">Dietary Information</h3>
                <div className="flex flex-wrap gap-2">
                  {item.isVegetarian && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetarian
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
                  {item.isGlutenFree && (
                    <Badge variant="outline">Gluten Free</Badge>
                  )}
                  {item.isSpicy && (
                    <Badge
                      variant="outline"
                      className="text-red-600 border-red-200"
                    >
                      <Flame className="h-3 w-3 mr-1" />
                      Spicy
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Ingredients</h3>
                <p className="text-muted-foreground break-words">
                  {item.ingredients.join(", ")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
