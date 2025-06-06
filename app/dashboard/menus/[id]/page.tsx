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
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    if (menuId) {
      fetchMenuData();
      fetchCategories();
      fetchItems();
    }
  }, [menuId]);

  const fetchMenuData = async () => {
    try {
      const response = await fetch(`/api/menus/${menuId}`);
      if (response.ok) {
        const data = await response.json();
        setMenuData(data);
        setMenuSettings({
          name: data.name,
          description: data.description,
          isPublished: data.isPublished,
        });
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
        const data = await response.json();

        // Update both menuData and menuSettings to ensure consistency
        setMenuData((prevData) => ({
          ...prevData,
          ...data,
          isPublished: menuSettings.isPublished, // Ensure this is updated
        }));

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

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

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
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryItems = items.filter(
      (item) => item.categoryId === categoryId
    );
    const confirmMessage =
      categoryItems.length > 0
        ? `Are you sure you want to delete this category? This will also delete ${categoryItems.length} item(s) in this category.`
        : "Are you sure you want to delete this category?";

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(
        `/api/menus/${menuId}/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        setItems(items.filter((item) => item.categoryId !== categoryId));
        toast.success("Category deleted successfully");
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 m-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/menus")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menus
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{menuData?.name}</h1>
            <p className="text-muted-foreground">
              {menuData?.restaurantName} • {items.length} items •{" "}
              {categories.length} categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSettingsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(getPreviewUrl(), "_blank")}
            className="flex items-center gap-2"
            disabled={!menuData?.isPublished}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={copyPreviewUrl}
            className="flex items-center gap-2"
            disabled={!menuData?.isPublished}
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
          <Badge variant={menuData?.isPublished ? "default" : "secondary"}>
            {menuData?.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="items">Menu Items ({items.length})</TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Menu Items</h3>
            <Button
              onClick={() => setItemDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={categories.length === 0}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card>
              <CardContent className=" ">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You need to create at least one category before adding
                    items.
                  </p>
                  <Button
                    onClick={() => {
                      setActiveTab("categories");
                      setCategoryDialogOpen(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : Object.keys(groupedItems).length === 0 ? (
            <Card>
              <CardContent className=" ">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No items yet. Start by adding your first menu item.
                  </p>
                  <Button
                    onClick={() => setItemDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {categories
                .filter((category) => category.isActive)
                .map((category) => {
                  const categoryItems = groupedItems[category.name] || [];
                  return (
                    <Card key={category.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            {category.name}
                            <Badge variant="outline">
                              {categoryItems.length}
                            </Badge>
                          </CardTitle>
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {categoryItems.map((item) => (
                            <div
                              key={item.id}
                              className={`border rounded-lg p-4 ${
                                !item.isAvailable
                                  ? "opacity-50 bg-muted/50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-start gap-3">
                                    <GripVertical className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">
                                          {item.name}
                                        </h4>
                                        <div className="flex gap-1">
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
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {item.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                                              {item.ingredients.map(
                                                (ingredient, idx) => (
                                                  <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-xs"
                                                  >
                                                    {ingredient}
                                                  </Badge>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={item.isAvailable}
                                    onCheckedChange={(checked) =>
                                      toggleItemAvailability(item.id, checked)
                                    }
                                  />
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
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
                                        onClick={() =>
                                          handleDeleteItem(item.id)
                                        }
                                        className="text-red-600"
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          ))}
                          {categoryItems.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No items in this category yet.</p>
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

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categories</h3>
            <Button
              onClick={() => setCategoryDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>

          {categories.length === 0 ? (
            <Card>
              <CardContent className=" ">
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No categories yet. Create your first category to organize
                    menu items.
                  </p>
                  <Button
                    onClick={() => setCategoryDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className=" ">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge
                              variant={
                                category.isActive ? "default" : "secondary"
                              }
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">
                              {groupedItems[category.name]?.length || 0} items
                            </Badge>
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
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

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, name: e.target.value })
                  }
                  placeholder="Enter item name"
                  className="my-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
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
                  className="my-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
                placeholder="Describe your menu item..."
                rows={3}
                className="my-2"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="mb-2">
                  Category *
                </Label>
                <Select
                  value={itemForm.categoryId}
                  onValueChange={(value) =>
                    setItemForm({ ...itemForm, categoryId: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
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
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
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
                  className="my-2"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <Label>Ingredients</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={ingredientInput}
                  className="my-2"
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="Add ingredient"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addIngredient())
                  }
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  onClick={addIngredient}
                  className="my-2"
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {itemForm.ingredients.map((ingredient, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {ingredient}
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

            <div className="space-y-3">
              <Label className="pb-2">Item Properties</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegetarian"
                    checked={itemForm.isVegetarian}
                    onCheckedChange={(checked) =>
                      setItemForm({ ...itemForm, isVegetarian: checked })
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="vegetarian">Vegetarian</Label>
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
                  <Label htmlFor="vegan">Vegan</Label>
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
                  <Label htmlFor="glutenFree">Gluten Free</Label>
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
                  <Label htmlFor="spicy">Spicy</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 ">
                <Switch
                  id="available"
                  checked={itemForm.isAvailable}
                  onCheckedChange={(checked) =>
                    setItemForm({ ...itemForm, isAvailable: checked })
                  }
                  disabled={isSubmitting}
                />
                <Label htmlFor="available">Available</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetItemForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                className="mt-2"
                placeholder="Enter category name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                className="mt-2"
                placeholder="Describe this category..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="categoryActive"
                checked={categoryForm.isActive}
                onCheckedChange={(checked) =>
                  setCategoryForm({ ...categoryForm, isActive: checked })
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="categoryActive">Active</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetCategoryForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCategory ? "Updating..." : "Creating..."}
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

      {/* Menu Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menu Settings</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMenuSettingsSubmit} className="space-y-4">
            <div>
              <Label htmlFor="menuName">Menu Name </Label>
              <Input
                id="menuName"
                value={menuSettings.name}
                onChange={(e) =>
                  setMenuSettings({ ...menuSettings, name: e.target.value })
                }
                className="mt-2"
                placeholder="Enter menu name"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="menuDescription">Description</Label>
              <Textarea
                id="menuDescription"
                value={menuSettings.description}
                onChange={(e) =>
                  setMenuSettings({
                    ...menuSettings,
                    description: e.target.value,
                  })
                }
                className="mt-2"
                placeholder="Describe your menu..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="menuPublished"
                checked={menuSettings.isPublished}
                onCheckedChange={(checked) =>
                  setMenuSettings({ ...menuSettings, isPublished: checked })
                }
                disabled={isSubmitting}
              />
              <Label htmlFor="menuPublished">
                Published (Make menu public)
              </Label>
            </div>
            {menuSettings.isPublished && (
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Public URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={getPreviewUrl()} readOnly className="text-sm" />
                  <Button
                    type="button"
                    size="sm"
                    onClick={copyPreviewUrl}
                    disabled={isSubmitting}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Anyone with this link can view your menu
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSettingsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
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
