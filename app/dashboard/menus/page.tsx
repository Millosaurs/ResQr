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
} from "lucide-react";
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
  isPublished: boolean;
  isActive: boolean;
}

export default function MenuManagement() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [form, setForm] = useState<MenuFormData>({
    name: "",
    description: "",
    isPublished: false,
    isActive: true,
  });

  const router = useRouter();

  useEffect(() => {
    fetchMenus();
  }, []);

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

  const handleDelete = async (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    if (!confirm("Are you sure you want to delete this menu?")) return;

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMenus(menus.filter((menu) => menu.id !== menuId));
        toast.success("Menu deleted successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error("Failed to delete menu");
    }
  };

  const copyPreviewLink = (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    const link = `${window.location.origin}/menu/${menuId}`;
    navigator.clipboard.writeText(link);
    toast.success("Preview link copied to clipboard");
  };

  const handleCardClick = (menuId: string) => {
    router.push(`/dashboard/menus/${menuId}`);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      isPublished: false,
      isActive: true,
    });
    setEditingMenu(null);
    setOpen(false);
  };

  const handleChange = (field: keyof MenuFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Menus" />
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Card
              key={menu.id}
              className="group hover:shadow-md transition-shadow cursor-pointer m-4"
              onClick={() => handleCardClick(menu.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {menu.description || "No description"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={menu.isPublished ? "default" : "secondary"}>
                      {menu.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant={menu.isActive ? "outline" : "destructive"}>
                      {menu.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => copyPreviewLink(menu.id, e)}
                      className="h-8 w-8 p-0"
                      title="Copy preview link"
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
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleDelete(menu.id, e)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete menu"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {menus.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No menus created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first menu to get started
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Menu
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
