// app/dashboard/menus/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash,
  Eye,
  ArrowLeft,
  GripVertical,
  Clock,
  IndianRupee,
  MoreVertical,
  Copy,
  Settings,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  categoryId: string;
  categoryName: string;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface MenuData {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  restaurantName: string;
  restaurantId: string;
}

export default function MenuItemsManagement({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState("items");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );
  const [deleteItemDialog, setDeleteItemDialog] = useState<{
    open: boolean;
    itemId: string | null;
    itemName: string;
  }>({ open: false, itemId: null, itemName: "" });
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{
    open: boolean;
    categoryId: string | null;
    categoryName: string;
    itemCount: number;
  }>({ open: false, categoryId: null, categoryName: "", itemCount: 0 });
  const [togglingAvailability, setTogglingAvailability] = useState<
    string | null
  >(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setMenuId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: "",
    estimatedTime: 15,
    ingredients: [] as string[],
    categoryId: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isAvailable: true,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [menuSettings, setMenuSettings] = useState({
    name: "",
    description: "",
    isPublished: false,
  });

  const [ingredientInput, setIngredientInput] = useState("");

  useEffect(() => {
    if (menuId) {
      fetchMenuData();
      fetchCategories();
      fetchItems();
    }
  }, [menuId]);

  useEffect(() => {
    if (menuData) {
      setMenuSettings({
        name: menuData.name || "",
        description: menuData.description || "",
        isPublished: menuData.isPublished || false,
      });
    }
  }, [menuData]);

  const fetchMenuData = async () => {
    try {
      const response = await fetch(`/api/menus/${menuId}`);
      if (response.ok) {
        const result = await response.json();

        setMenuData(result.data);
      } else {
        toast.error("Menu not found");
        router.push("/dashboard/menus");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      toast.error("Failed to load menu data");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/menus/${menuId}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(
          data.sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/menus/${menuId}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(
          data.sort((a: MenuItem, b: MenuItem) => a.sortOrder - b.sortOrder)
        );
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!itemForm.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem
        ? `/api/menus/${menuId}/items/${editingItem.id}`
        : `/api/menus/${menuId}/items`;

      const payload = {
        ...itemForm,
        price: parseFloat(itemForm.price).toFixed(2),
        menuId: menuId,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingItem) {
          setItems(
            items.map((item) => (item.id === editingItem.id ? data : item))
          );
          toast.success("Item updated successfully");
        } else {
          setItems([...items, data]);
          toast.success("Item created successfully");
        }

        resetItemForm();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = editingCategory ? "PUT" : "POST";
      const url = editingCategory
        ? `/api/menus/${menuId}/categories/${editingCategory.id}`
        : `/api/menus/${menuId}/categories`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...categoryForm, menuId: menuId }),
      });

      if (response.ok) {
        const data = await response.json();

        if (editingCategory) {
          setCategories(
            categories.map((cat) =>
              cat.id === editingCategory.id ? data : cat
            )
          );
          toast.success("Category updated successfully");
        } else {
          setCategories([...categories, data]);
          toast.success("Category created successfully");
        }

        resetCategoryForm();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMenuSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menuSettings),
      });

      if (response.ok) {
        const result = await response.json();

        // Fix: Extract data from the response object
        setMenuData(result.data); // Changed from result to result.data

        toast.success("Menu settings updated successfully");
        setSettingsDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update menu settings");
      }
    } catch (error) {
      console.error("Error updating menu settings:", error);
      toast.error("Failed to update menu settings");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSettingsDialogClose = (open: boolean) => {
    if (!open && menuData) {
      // Reset form to current menuData values when closing
      setMenuSettings({
        name: menuData.name || "",
        description: menuData.description || "",
        isPublished: menuData.isPublished || false,
      });
    }
    setSettingsDialogOpen(open);
  };

  const handleDeleteItem = async (itemId: string) => {
    setDeletingItemId(itemId);
    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== itemId));
        toast.success("Item deleted successfully");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setDeletingItemId(null);
      setDeleteItemDialog({ open: false, itemId: null, itemName: "" });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    try {
      const response = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Remove category from state
        setCategories(categories.filter((cat) => cat.id !== categoryId));

        // Remove all items that belonged to this category from state
        setItems(items.filter((item) => item.categoryId !== categoryId));

        // Show success message with count of deleted items
        const deletedItemsCount = result.deletedItemsCount || 0;
        if (deletedItemsCount > 0) {
          toast.success(
            `Category deleted successfully. ${deletedItemsCount} ${
              deletedItemsCount === 1 ? "item was" : "items were"
            } also removed.`
          );
        } else {
          toast.success("Category deleted successfully");
        }
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
      setDeleteCategoryDialog({
        open: false,
        categoryId: null,
        categoryName: "",
        itemCount: 0,
      });
    }
  };
  const openDeleteCategoryDialog = (category: Category) => {
    const itemsInCategory = items.filter(
      (item) => item.categoryId === category.id
    );
    setDeleteCategoryDialog({
      open: true,
      categoryId: category.id,
      categoryName: category.name,
      itemCount: itemsInCategory.length,
    });
  };
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      estimatedTime: item.estimatedTime || 15,
      ingredients: item.ingredients || [],
      categoryId: item.categoryId,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isSpicy: item.isSpicy,
      isAvailable: item.isAvailable,
    });
    setItemDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setCategoryDialogOpen(true);
  };

  const handleDuplicateItem = async (item: MenuItem) => {
    const duplicatedItem = {
      ...itemForm,
      name: `${item.name} (Copy)`,
      description: item.description,
      price: item.price,
      estimatedTime: item.estimatedTime,
      ingredients: [...item.ingredients],
      categoryId: item.categoryId,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isSpicy: item.isSpicy,
      isAvailable: item.isAvailable,
    };

    try {
      const response = await fetch(`/api/menus/${menuId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...duplicatedItem, menuId: menuId }),
      });

      if (response.ok) {
        const data = await response.json();
        setItems([...items, data]);
        toast.success("Item duplicated successfully");
      } else {
        toast.error("Failed to duplicate item");
      }
    } catch (error) {
      console.error("Error duplicating item:", error);
      toast.error("Failed to duplicate item");
    }
  };

  const toggleItemAvailability = async (
    itemId: string,
    isAvailable: boolean
  ) => {
    setTogglingAvailability(itemId); // Set loading state for this specific item
    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });

      if (response.ok) {
        setItems(
          items.map((item) =>
            item.id === itemId ? { ...item, isAvailable } : item
          )
        );
        toast.success(
          `Item ${isAvailable ? "enabled" : "disabled"} successfully`
        );
      } else {
        toast.error("Failed to update item availability");
      }
    } catch (error) {
      console.error("Error updating item availability:", error);
      toast.error("Failed to update item availability");
    } finally {
      setTogglingAvailability(null); // Clear loading state
    }
  };

  const resetItemForm = () => {
    setItemForm({
      name: "",
      description: "",
      price: "",
      estimatedTime: 15,
      ingredients: [],
      categoryId: "",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isAvailable: true,
    });
    setEditingItem(null);
    setItemDialogOpen(false);
    setIngredientInput("");
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      isActive: true,
    });
    setEditingCategory(null);
    setCategoryDialogOpen(false);
  };

  const addIngredient = () => {
    if (
      ingredientInput.trim() &&
      !itemForm.ingredients.includes(ingredientInput.trim())
    ) {
      setItemForm({
        ...itemForm,
        ingredients: [...itemForm.ingredients, ingredientInput.trim()],
      });
      setIngredientInput("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setItemForm({
      ...itemForm,
      ingredients: itemForm.ingredients.filter((ing) => ing !== ingredient),
    });
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const getPreviewUrl = () => {
    return `${window.location.origin}/menu/${menuId}`;
  };

  const copyPreviewUrl = () => {
    navigator.clipboard.writeText(getPreviewUrl());
    toast.success("Preview URL copied to clipboard");
  };

  if (loading || !menuId) {
    return (
      <div className="flex justify-center items-center h-64 ">
        <Loader2 className="h-12 w-12 animate-spin text-primary " />
      </div>
    );
  }

  return (
    <div className="space-y-6 m-4">
      {/* Header - Responsive Version */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/menus")}
            className="flex items-center gap-2 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Menus</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl truncate">
              {menuData?.name}
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              <span className="block sm:inline">
                {menuData?.restaurantName}
              </span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">
                {items.length} items • {categories.length} categories
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Mobile: Stack buttons vertically, Desktop: Horizontal layout */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (menuData) {
                  setMenuSettings({
                    name: menuData.name || "",
                    description: menuData.description || "",
                    isPublished: menuData.isPublished || false,
                  });
                }
                setSettingsDialogOpen(true);
              }}
              className="flex items-center gap-2 justify-center sm:justify-start"
              size="sm"
            >
              <Settings className="h-4 w-4" />
              <span className="sm:inline">Settings</span>
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(getPreviewUrl(), "_blank")}
                className="flex items-center gap-2 flex-1 sm:flex-initial justify-center"
                disabled={!menuData?.isPublished}
                size="sm"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>

              <Button
                variant="outline"
                onClick={copyPreviewUrl}
                className="flex items-center gap-2 flex-1 sm:flex-initial justify-center"
                disabled={!menuData?.isPublished}
                size="sm"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </Button>
            </div>
          </div>

          <Badge
            variant={menuData?.isPublished ? "default" : "secondary"}
            className="self-start sm:self-center"
          >
            {menuData?.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Tabs - Responsive Version */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:grid-cols-none sm:flex">
          <TabsTrigger value="items" className="text-xs sm:text-sm">
            <span className="sm:hidden">Items ({items.length})</span>
            <span className="hidden sm:inline">
              Menu Items ({items.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            <span className="sm:hidden">Categories ({categories.length})</span>
            <span className="hidden sm:inline">
              Categories ({categories.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-4 sm:mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg font-semibold">Menu Items</h3>
            <Button
              onClick={() => {
                // Clear editing state and reset form for new item
                setEditingItem(null);
                setItemForm({
                  name: "",
                  description: "",
                  price: "",
                  estimatedTime: 15,
                  ingredients: [],
                  categoryId: "",
                  isVegetarian: false,
                  isVegan: false,
                  isGlutenFree: false,
                  isSpicy: false,
                  isAvailable: true,
                });
                setIngredientInput(""); // Also clear ingredient input
                setItemDialogOpen(true);
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
              disabled={categories.length === 0}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">Add Item</span>
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-6 ">
                <div className="text-center py-6 sm:py-8 ">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    You need to create at least one category before adding
                    items.
                  </p>
                  <Button
                    onClick={() => {
                      setActiveTab("categories");
                      setCategoryDialogOpen(true);
                    }}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : Object.keys(groupedItems).length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    No items yet. Start by adding your first menu item.
                  </p>
                  <Button
                    onClick={() => setItemDialogOpen(true)}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {categories
                .filter((category) => category.isActive)
                .map((category) => {
                  const categoryItems = groupedItems[category.name] || [];
                  return (
                    <Card key={category.id}>
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle
                            className="flex items-center gap-2 text-base sm:text-lg cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleEditCategory(category)}
                          >
                            {/* Remove the GripVertical icon */}
                            <span className="truncate">{category.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {categoryItems.length}
                            </Badge>
                          </CardTitle>
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {category.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid gap-3 sm:gap-4 cursor-pointer">
                          {categoryItems.map((item) => (
                            <div
                              key={item.id}
                              className={`border rounded-lg p-3 sm:p-4 {
                                !item.isAvailable
                                  ? "opacity-90 bg-muted/50"
                                  : ""
                              }`}
                              onClick={() => handleEditItem(item)}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 mb-1">
                                        <h4 className="font-medium text-sm sm:text-base truncate">
                                          {item.name}
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                          {item.isVegetarian && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-green-50 text-green-700"
                                            >
                                              Veg
                                            </Badge>
                                          )}
                                          {item.isVegan && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-green-50 text-green-700"
                                            >
                                              Vegan
                                            </Badge>
                                          )}
                                          {item.isGlutenFree && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-blue-50 text-blue-700"
                                            >
                                              GF
                                            </Badge>
                                          )}
                                          {item.isSpicy && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-red-50 text-red-700"
                                            >
                                              Spicy
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      {item.description && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                                          {item.description}
                                        </p>
                                      )}
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <IndianRupee className="h-3 w-3" />
                                          <span className="font-medium">
                                            ₹{item.price}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{item.estimatedTime} mins</span>
                                        </div>
                                      </div>
                                      {item.ingredients &&
                                        item.ingredients.length > 0 && (
                                          <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">
                                              Ingredients:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                              {item.ingredients
                                                .slice(0, 3)
                                                .map((ingredient, idx) => (
                                                  <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-xs"
                                                  >
                                                    {ingredient}
                                                  </Badge>
                                                ))}
                                              {item.ingredients.length > 3 && (
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  +{item.ingredients.length - 3}{" "}
                                                  more
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                                  <div onClick={(e) => e.stopPropagation()}>
                                    {togglingAvailability === item.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin scale-75 sm:scale-100" />
                                    ) : (
                                      <Switch
                                        checked={item.isAvailable}
                                        onCheckedChange={(checked) =>
                                          toggleItemAvailability(
                                            item.id,
                                            checked
                                          )
                                        }
                                        className={`scale-75 sm:scale-100 ${
                                          !item.isAvailable ? "opacity-100" : ""
                                        }`}
                                      />
                                    )}
                                  </div>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          disabled={deletingItemId === item.id}
                                          className="h-8 w-8 p-0"
                                        >
                                          {deletingItemId === item.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <MoreVertical className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => handleEditItem(item)}
                                        >
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleDuplicateItem(item)
                                          }
                                        >
                                          <Copy className="h-4 w-4 mr-2" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setDeleteItemDialog({
                                              open: true,
                                              itemId: item.id,
                                              itemName: item.name,
                                            });
                                          }}
                                          className="text-red-600"
                                          disabled={deletingItemId === item.id}
                                        >
                                          <Trash className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {categoryItems.length === 0 && (
                            <div className="text-center py-6 sm:py-8 text-muted-foreground">
                              <p className="text-sm">
                                No items in this category yet.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-4 sm:mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg font-semibold">Categories</h3>
            <Button
              onClick={() => {
                setEditingCategory(null); // Clear editing state
                setCategoryForm({
                  name: "",
                  description: "",
                  isActive: true,
                });
                setCategoryDialogOpen(true);
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="text-center py-6 sm:py-8">
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    No categories yet. Create your first category to organize
                    menu items.
                  </p>
                  <Button
                    onClick={() => setCategoryDialogOpen(true)}
                    className="flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEditCategory(category)}
                >
                  <CardContent className="px-4">
                    <div className="flex items-center justify-between gap-4 ">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1  hover:bg-muted/20 -m-2 p-2 rounded transition-colors">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                            <h4 className="font-medium text-sm sm:text-base truncate">
                              {category.name}
                            </h4>
                            <div className="flex gap-2 flex-wrap">
                              <Badge
                                variant={
                                  category.isActive ? "default" : "secondary"
                                }
                                className="text-xs"
                              >
                                {category.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {groupedItems[category.name]?.length || 0} items
                              </Badge>
                            </div>
                          </div>
                          {category.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const categoryItems = items.filter(
                              (item) => item.categoryId === category.id
                            );
                            setDeleteCategoryDialog({
                              open: true,
                              categoryId: category.id,
                              categoryName: category.name,
                              itemCount: categoryItems.length,
                            });
                          }}
                          className="text-red-600 hover:text-red-700 h-8 w-8 p-0 sm:h-9 sm:w-9"
                          disabled={deletingCategoryId === category.id}
                        >
                          {deletingCategoryId === category.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Item Dialog - Responsive */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Item Name *
                </Label>
                <Input
                  id="name"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  placeholder="Enter item name"
                  className="mt-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-sm font-medium">
                  Price (₹) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.price}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  className="mt-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Describe your menu item..."
                rows={3}
                className="mt-2"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-2">
                  Category *
                </Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(value) =>
                    setItemForm({ ...itemForm, categoryId: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => cat.isActive)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimatedTime" className="text-sm font-medium">
                  Estimated Time (minutes)
                </Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  min="1"
                  max="120"
                  value={itemForm.estimatedTime}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      estimatedTime: parseInt(e.target.value) || 15,
                    })
                  }
                  placeholder="15"
                  className="mt-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Ingredients</Label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Input
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="Add ingredient"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addIngredient())
                  }
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addIngredient}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {itemForm.ingredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span className="truncate max-w-[100px] sm:max-w-none">
                      {ingredient}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => removeIngredient(ingredient)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Item Properties</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegetarian"
                    checked={itemForm.isVegetarian}
                    onCheckedChange={(checked) =>
                      setItemForm({ ...itemForm, isVegetarian: checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="vegetarian" className="text-sm">
                    Vegetarian
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegan"
                    checked={itemForm.isVegan}
                    onCheckedChange={(checked) =>
                      setItemForm({ ...itemForm, isVegan: checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="vegan" className="text-sm">
                    Vegan
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="glutenFree"
                    checked={itemForm.isGlutenFree}
                    onCheckedChange={(checked) =>
                      setItemForm({ ...itemForm, isGlutenFree: checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="glutenFree" className="text-sm">
                    Gluten Free
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="spicy"
                    checked={itemForm.isSpicy}
                    onCheckedChange={(checked) =>
                      setItemForm({ ...itemForm, isSpicy: checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="spicy" className="text-sm">
                    Spicy
                  </Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={itemForm.isAvailable}
                  onCheckedChange={(checked) =>
                    setItemForm({ ...itemForm, isAvailable: checked })
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="available" className="text-sm">
                  Available
                </Label>
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={resetItemForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {editingItem ? "Updating..." : "Creating..."}
                  </>
                ) : editingItem ? (
                  "Update Item"
                ) : (
                  "Create Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Dialog - Responsive */}
      <Dialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset form when dialog is closed
            setCategoryForm({
              name: "",
              description: "",
              isActive: true,
            });
            setEditingCategory(null);
          }
          setCategoryDialogOpen(open);
        }}
      >
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="categoryName" className="text-sm font-medium">
                Category Name *
              </Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                className="w-full"
                placeholder="Enter category name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="categoryDescription"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="w-full resize-none"
                placeholder="Describe this category..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-3 py-2">
              <Switch
                id="categoryActive"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) =>
                  setCategoryForm({ ...categoryForm, isActive: checked })
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor="categoryActive"
                className="text-sm font-medium cursor-pointer"
              >
                Active
              </Label>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetCategoryForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">
                      {editingCategory ? "Updating..." : "Creating..."}
                    </span>
                    <span className="sm:hidden">
                      {editingCategory ? "Updating" : "Creating"}
                    </span>
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Item AlertDialog - Responsive */}
      <AlertDialog
        open={deleteItemDialog.open}
        onOpenChange={(open) =>
          setDeleteItemDialog({ open, itemId: null, itemName: "" })
        }
      >
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader className="pb-4">
            <AlertDialogTitle className="text-lg sm:text-xl">
              Delete Menu Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-medium break-words">
                "{deleteItemDialog.itemName}"
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteItemDialog.itemId &&
                handleDeleteItem(deleteItemDialog.itemId)
              }
              className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/70"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category AlertDialog - Responsive */}
      <AlertDialog
        open={deleteCategoryDialog.open}
        onOpenChange={(open) =>
          setDeleteCategoryDialog({
            open,
            categoryId: null,
            categoryName: "",
            itemCount: 0,
          })
        }
      >
        <AlertDialogContent className="w-[95vw] max-w-md mx-auto">
          <AlertDialogHeader className="pb-4">
            <AlertDialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Trash className="h-5 w-5 text-primary" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base leading-relaxed space-y-3">
              <p>
                Are you sure you want to delete{" "}
                <span className="font-medium break-words">
                  "{deleteCategoryDialog.categoryName}"
                </span>
                ?
              </p>

              {deleteCategoryDialog.itemCount > 0 ? (
                <div className="p-3 bg-primary/20 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-1">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm">Warning</span>
                  </div>
                  <p className="text-red-700 text-sm">
                    This will also permanently delete{" "}
                    <span className="font-semibold">
                      {deleteCategoryDialog.itemCount}{" "}
                      {deleteCategoryDialog.itemCount === 1 ? "item" : "items"}
                    </span>{" "}
                    in this category.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">
                      This category is empty and can be safely deleted.
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={deletingCategoryId !== null}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteCategoryDialog.categoryId &&
                handleDeleteCategory(deleteCategoryDialog.categoryId)
              }
              disabled={deletingCategoryId !== null}
              className="w-full sm:w-auto order-1 sm:order-2 bg-primary hover:bg-primary/70 focus:ring-red-600"
            >
              {deletingCategoryId === deleteCategoryDialog.categoryId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  Delete Category
                  {deleteCategoryDialog.itemCount > 0 &&
                    ` & ${deleteCategoryDialog.itemCount} Item${
                      deleteCategoryDialog.itemCount === 1 ? "" : "s"
                    }`}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Menu Settings Dialog - Responsive */}
      <Dialog
        open={settingsDialogOpen}
        onOpenChange={handleSettingsDialogClose}
      >
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl">
              Menu Settings
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMenuSettingsSubmit} className="space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="menuName" className="text-sm font-medium">
                Menu Name
              </Label>
              <Input
                id="menuName"
                value={menuSettings.name}
                onChange={(e) =>
                  setMenuSettings({ ...menuSettings, name: e.target.value })
                }
                className="w-full"
                placeholder="Enter menu name"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menuDescription" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="menuDescription"
                value={menuSettings.description}
                onChange={(e) =>
                  setMenuSettings({
                    ...menuSettings,
                    description: e.target.value,
                  })
                }
                className="w-full resize-none"
                placeholder="Describe your menu..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-3 py-2">
              <Switch
                id="menuPublished"
                checked={menuSettings.isPublished}
                onCheckedChange={(checked) =>
                  setMenuSettings({ ...menuSettings, isPublished: checked })
                }
                disabled={isSubmitting}
              />
              <Label
                htmlFor="menuPublished"
                className="text-sm font-medium cursor-pointer"
              >
                Published (Make menu public)
              </Label>
            </div>
            {menuSettings.isPublished && (
              <div className="p-3 sm:p-4 bg-muted rounded-lg space-y-3">
                <Label className="text-sm font-medium block">Public URL</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={getPreviewUrl()}
                    readOnly
                    className="text-xs sm:text-sm flex-1 font-mono"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={copyPreviewUrl}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto shrink-0"
                  >
                    <Copy className="h-4 w-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Copy Link</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Anyone with this link can view your menu
                </p>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettingsDialogOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Saving</span>
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
