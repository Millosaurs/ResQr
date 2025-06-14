"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  MapPin,
  Phone,
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
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Head from "next/head";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

    let items = [...menuData.items];

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
      <div className="min-h-screen bg-background">
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground text-center">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="text-center max-w-md w-full space-y-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-bold">Menu Not Available</h1>
            <p className="text-muted-foreground">{error}</p>
            {error?.includes("not published") && (
              <p className="text-sm text-muted-foreground">
                The restaurant owner needs to publish this menu before it can be
                viewed publicly.
              </p>
            )}
          </div>
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
          <Alert className="rounded-none border-x-0 border-t-0 border-orange-200 bg-orange-50">
            <Eye className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              <strong>Preview Mode</strong> - This menu is not published yet
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Restaurant Info */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={restaurant?.logoUrl} alt={restaurant?.name} />
                <AvatarFallback className="text-lg">
                  {restaurant?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
                  {restaurant?.googleRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-sm">
                        {restaurant.googleRating}
                      </span>
                    </div>
                  )}
                </div>
                {restaurant?.cuisineType && (
                  <p className="text-muted-foreground mb-2">
                    {restaurant.cuisineType}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {restaurant?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                  {restaurant?.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0">
                      {
                        Object.values(filters).filter((v) =>
                          typeof v === "boolean" ? v : v.length > 0
                        ).length
                      }
                    </Badge>
                  )}
                </Button>

                <div className="flex gap-2 overflow-x-auto">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All ({menuData?.items?.length || 0})
                  </Button>
                  {menuData?.categories?.map((category) => {
                    const count =
                      menuData?.items?.filter(
                        (item) => item?.categoryName === category
                      )?.length || 0;
                    return (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="whitespace-nowrap"
                      >
                        {category} ({count})
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                        <span>Vegetarian</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                        <span>Vegan</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                        <span>Gluten Free</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                        <span>Spicy</span>
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
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
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Available Only</span>
                      </label>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear all filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <main className="max-w-4xl mx-auto px-6 py-6">
          {selectedCategory === "all" && !hasActiveFilters ? (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([categoryName, items]) => (
                <section key={categoryName} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">{categoryName}</h2>
                    <Badge variant="secondary">{items.length} items</Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === "all"
                    ? "Search Results"
                    : selectedCategory}
                </h2>
                <Badge variant="secondary">{filteredItems.length} items</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">
                No items found matching your criteria.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
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

        {/* Footer */}
        <footer className="border-t bg-muted/20 mt-12">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Powered by <span className="font-medium">ResQr</span>
              </p>
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
  const hasBadges =
    item.isVegetarian || item.isVegan || item.isGlutenFree || item.isSpicy;

  return (
    <Card
      className={`group transition-all hover:shadow-md ${
        !item.isAvailable ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight mb-1">
              {item.name}
            </h3>
            <p className="text-xl font-bold text-primary">₹{item.price}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!item.isAvailable && (
              <Badge variant="destructive" className="text-xs">
                Unavailable
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onInfoClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        )}

        {hasBadges && (
          <div className="flex flex-wrap gap-1">
            {item.isVegetarian && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 text-xs"
              >
                <Leaf className="h-3 w-3 mr-1" />
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
                <Flame className="h-3 w-3 mr-1" />
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ₹{item.price}
            </span>
            {!item.isAvailable && (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>

          {item.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          )}

          {item.estimatedTime && item.estimatedTime > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Estimated time: {item.estimatedTime} minutes</span>
            </div>
          )}

          {hasBadges && (
            <div>
              <h4 className="font-medium mb-2">Dietary Information</h4>
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
              <h4 className="font-medium mb-2">Ingredients</h4>
              <p className="text-muted-foreground">
                {item.ingredients.join(", ")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
