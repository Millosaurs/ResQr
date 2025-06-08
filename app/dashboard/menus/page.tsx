"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pencil,
  Download,
  Eye,
  Trash,
  Plus,
  ExternalLink,
  Globe,
  Copy,
  Settings,
  Loader2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { useRouter } from "next/navigation";

interface Menu {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  restaurantId: string;
  displayOrder?: number;
  updatedAt?: string;
}

interface MenuFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export default function MenuManagement() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteMenuId, setDeleteMenuId] = useState<string | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [form, setForm] = useState<MenuFormData>({
    name: "",
    description: "",
    isActive: true,
  });

  const router = useRouter();

  useEffect(() => {
    fetchMenus();
  }, []);

  // Filter and sort menus
  useEffect(() => {
    let filtered = menus.filter((menu) => {
      const matchesSearch =
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && menu.isPublished) ||
        (statusFilter === "draft" && !menu.isPublished) ||
        (statusFilter === "active" && menu.isActive) ||
        (statusFilter === "inactive" && !menu.isActive);

      return matchesSearch && matchesStatus;
    });

    // Sort by creation date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredMenus(filtered);
  }, [menus, searchTerm, statusFilter, sortOrder]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (deleteCountdown > 0) {
      interval = setInterval(() => {
        setDeleteCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [deleteCountdown]);

  const fetchMenus = async () => {
    try {
      const response = await fetch("/api/menus");
      if (response.ok) {
        const data = await response.json();
        // Fix: Access data.data instead of data directly
        setMenus(Array.isArray(data.data) ? data.data : []);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast.error(errorData.error || "Failed to load menus");
        setMenus([]);
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Failed to load menus");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (menu: Menu, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setEditingMenu(menu);
    setForm({
      name: menu.name,
      description: menu.description,
      isActive: menu.isActive,
    });
    setOpen(true);
  };

  const handleDeleteClick = (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setDeleteMenuId(menuId);
    setDeleteCountdown(5); // Start 5-second countdown
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMenuId) return;

    setDeletingMenuId(deleteMenuId);
    try {
      const response = await fetch(`/api/menus/${deleteMenuId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMenus(menus.filter((menu) => menu.id !== deleteMenuId));
        toast.success("Menu deleted successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Failed to delete menu");
    } finally {
      setDeleteMenuId(null);
      setDeleteCountdown(0);
      setDeletingMenuId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteMenuId(null);
    setDeleteCountdown(0);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Menu name is required");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingMenu ? `/api/menus/${editingMenu.id}` : "/api/menus";
      const method = editingMenu ? "PUT" : "POST";

      // For new menus, include default published status
      const submitData = editingMenu ? form : { ...form, isPublished: false };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingMenu) {
          // Update existing menu
          setMenus(
            menus.map((menu) =>
              menu.id === editingMenu.id ? { ...menu, ...form } : menu
            )
          );
          toast.success("Menu updated successfully");
        } else {
          // Add new menu
          setMenus([...menus, data.data]);
          toast.success("Menu created successfully");
        }
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save menu");
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Failed to save menu");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPreviewLink = (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    const link = `${window.location.origin}/menu/${menuId}`;
    navigator.clipboard.writeText(link);
    toast.success("Preview link copied to clipboard");
  };

  const handleCardClick = (menuId: string) => {
    // Prevent navigation if menu is being deleted
    if (deletingMenuId === menuId) return;
    router.push(`/dashboard/menus/${menuId}`);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      isActive: true,
    });
    setEditingMenu(null);
    setSubmitting(false);
    setOpen(false);
  };

  const handleChange = (field: keyof MenuFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedMenu = menus.find((menu) => menu.id === deleteMenuId);

  const getStatusCounts = () => {
    const published = menus.filter((menu) => menu.isPublished).length;
    const draft = menus.filter((menu) => !menu.isPublished).length;
    const active = menus.filter((menu) => menu.isActive).length;
    const inactive = menus.filter((menu) => !menu.isActive).length;
    return { published, draft, active, inactive, total: menus.length };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <>
        <SiteHeader title="Menus" />
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading menu data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Menus" />
      <div className="min-h-screen">
        {/* Header Controls - Only show when menus exist */}
        {menus.length > 0 && (
          <div className="flex flex-col gap-4 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Top Row - Stats and Create Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 w-full sm:w-auto">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{statusCounts.total}</span>{" "}
                  total menu{statusCounts.total !== 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap items-center gap-1 xs:gap-2">
                  <Badge
                    variant="default"
                    className="text-xs whitespace-nowrap"
                  >
                    {statusCounts.published} Published
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs whitespace-nowrap"
                  >
                    {statusCounts.draft} Draft
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs whitespace-nowrap"
                  >
                    {statusCounts.active} Active
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Menu
              </Button>
            </div>

            {/* Filter and Search Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 sm:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Menus</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 flex-shrink-0"
                  title={`Sort ${
                    sortOrder === "asc" ? "newest first" : "oldest first"
                  }`}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Menu Grid - Responsive grid layout */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-3 sm:px-4 md:px-6 lg:px-8 pb-6">
          {filteredMenus.map((menu) => (
            <Card
              key={menu.id}
              className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${
                deletingMenuId === menu.id
                  ? "opacity-50 pointer-events-none"
                  : "hover:scale-[1.02]"
              }`}
              onClick={() => handleCardClick(menu.id)}
            >
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg line-clamp-2 break-words">
                      {menu.name}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                      {menu.description || "No description"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <Badge
                      variant={menu.isPublished ? "default" : "secondary"}
                      className="text-xs whitespace-nowrap"
                    >
                      {menu.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge
                      variant={menu.isActive ? "outline" : "destructive"}
                      className="text-xs whitespace-nowrap"
                    >
                      {menu.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  {/* Desktop action buttons - hidden on mobile */}
                  <div className="hidden sm:flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleEditClick(menu, e)}
                      className="h-8 w-8 p-0"
                      title="Edit menu"
                      disabled={deletingMenuId === menu.id}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => copyPreviewLink(menu.id, e)}
                      className="h-8 w-8 p-0"
                      title="Copy preview link"
                      disabled={deletingMenuId === menu.id}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/menu/${menu.id}`, "_blank");
                      }}
                      className="h-8 w-8 p-0"
                      title="Open preview"
                      disabled={deletingMenuId === menu.id}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    {deletingMenuId === menu.id ? (
                      <div className="h-8 w-8 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleDeleteClick(menu.id, e)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Delete menu"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Mobile dropdown menu - visible only on mobile */}
                  <div className="sm:hidden ml-auto">
                    {deletingMenuId === menu.id ? (
                      <div className="h-8 w-8 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => handleEditClick(menu, e)}
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Menu
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => copyPreviewLink(menu.id, e)}
                            className="cursor-pointer"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/menu/${menu.id}`, "_blank");
                            }}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteClick(menu.id, e)}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Menu
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Created date - responsive text size */}
                  <div className="text-xs text-muted-foreground sm:ml-auto">
                    {new Date(menu.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year:
                        new Date(menu.createdAt).getFullYear() !==
                        new Date().getFullYear()
                          ? "numeric"
                          : undefined,
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results state */}
        {filteredMenus.length === 0 && menus.length > 0 && (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-medium">No menus match your filters</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Empty state */}
        {menus.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <h3 className="text-lg font-medium">No menus created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first menu to get started
            </p>
            <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Menu
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Menu Dialog - Responsive */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingMenu ? "Edit Menu" : "Create New Menu"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Menu Name
              </Label>
              <Input
                id="name"
                placeholder="Enter menu name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter menu description (optional)"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={form.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
              />
              <Label htmlFor="active" className="text-sm font-medium">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {editingMenu ? "Updating..." : "Creating..."}
                </>
              ) : editingMenu ? (
                "Update Menu"
              ) : (
                "Create Menu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog - Responsive */}
      <AlertDialog
        open={!!deleteMenuId}
        onOpenChange={() => handleDeleteCancel()}
      >
        <AlertDialogContent className="w-[95vw] max-w-[500px] mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Delete Menu
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Are you sure you want to delete "{selectedMenu?.name}"? This
              action cannot be undone.
              <br />
              <br />
              <strong>Warning:</strong> This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>All categories in this menu</li>
                <li>All menu items in this menu</li>
                <li>All associated data and settings</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCountdown > 0}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            >
              {deleteCountdown > 0
                ? `Delete in ${deleteCountdown}s`
                : "Delete Menu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
