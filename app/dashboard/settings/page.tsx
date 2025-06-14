"use client";

import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/image-upload";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Palette,
  Save,
  Settings,
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  Eye,
  X,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

type Restaurant = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  googleBusinessUrl: string | null;
  googleRating: string | null;
  cuisineType: string | null;
  description: string | null;
  logoUrl: string | null;
  logoImageId: number | null;
  colorTheme: string;
  isActive: boolean;
};

export default function Page() {
  const [form, setForm] = useState<Restaurant>({
    id: "",
    name: "",
    email: null,
    phone: null,
    address: null,
    googleBusinessUrl: null,
    googleRating: null,
    cuisineType: null,
    description: null,
    logoUrl: null,
    logoImageId: null,
    colorTheme: "#dc2626",
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRestaurant, setHasRestaurant] = useState<boolean | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch restaurant data on component mount
  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setIsInitialLoading(true);
      setError(null);

      const response = await fetch("/api/restaurants");
      const data = await response.json();

      if (response.ok && data.success) {
        setForm({
          ...data.data,
          // Keep null values as null for proper handling
          email: data.data.email,
          phone: data.data.phone,
          address: data.data.address,
          googleBusinessUrl: data.data.googleBusinessUrl,
          googleRating: data.data.googleRating,
          cuisineType: data.data.cuisineType,
          description: data.data.description,
          logoUrl: data.data.logoUrl,
          logoImageId: data.data.logoImageId,
        });
        setHasRestaurant(true);
      } else if (response.status === 404) {
        // No restaurant found - this is for new restaurant creation
        setHasRestaurant(false);
        setIsEditing(true); // Start in edit mode for new restaurant
      } else {
        throw new Error(data.error || "Failed to fetch restaurant");
      }
    } catch (err) {
      console.error("Error fetching restaurant:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load restaurant data"
      );
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleImageUploaded = (imageUrl: string, imageId: number) => {
    setForm((prev) => ({
      ...prev,
      logoUrl: imageUrl,
      logoImageId: imageId,
    }));
  };

  const handleImageRemoved = () => {
    setForm((prev) => ({
      ...prev,
      logoUrl: null,
      logoImageId: null,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required fields
      if (!form.name?.trim()) {
        toast.error("Restaurant name is required");
        return;
      }

      const method = hasRestaurant ? "PUT" : "POST";
      const response = await fetch("/api/restaurants", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address?.trim() || null,
          phone: form.phone?.trim() || null,
          email: form.email?.trim() || null,
          googleBusinessUrl: form.googleBusinessUrl?.trim() || null,
          googleRating: form.googleRating?.trim() || null,
          cuisineType: form.cuisineType || null,
          description: form.description?.trim() || null,
          logoImageId: form.logoImageId,
          colorTheme: form.colorTheme,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm((prev) => ({ ...prev, ...data.data }));
        setHasRestaurant(true);
        setIsEditing(false);
        toast.success(
          hasRestaurant
            ? "Restaurant updated successfully!"
            : "Restaurant created successfully!"
        );
      } else {
        throw new Error(data.error || "Failed to save restaurant");
      }
    } catch (err) {
      console.error("Error saving restaurant:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save restaurant";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch("/api/restaurants", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm({
          id: "",
          name: "",
          email: null,
          phone: null,
          address: null,
          googleBusinessUrl: null,
          googleRating: null,
          cuisineType: null,
          description: null,
          logoUrl: null,
          logoImageId: null,
          colorTheme: "#dc2626",
          isActive: true,
        });
        setHasRestaurant(false);
        setIsDeleteDialogOpen(false);
        setDeleteConfirmText("");
        setIsEditing(true); // Switch to edit mode after deletion
        toast.success("Restaurant deleted successfully!");
      } else {
        throw new Error(data.error || "Failed to delete restaurant");
      }
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete restaurant";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeleteConfirmText("");
  };

  const handleCancelEdit = () => {
    if (!hasRestaurant) {
      // If no restaurant exists, we can't cancel to view mode
      return;
    }
    setIsEditing(false);
    // Reset form to original data
    fetchRestaurant();
  };

  const isDeleteConfirmValid = deleteConfirmText.trim() === form.name?.trim();

  const cuisineTypes = [
    "Italian",
    "Chinese",
    "Japanese",
    "Mexican",
    "Indian",
    "French",
    "Thai",
    "Mediterranean",
    "American",
    "Korean",
    "Vietnamese",
    "Other",
  ];

  const getRestaurantInitials = () => {
    if (!form.name) return "?";
    return form.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Display component for read-only view
  const DisplayField = ({
    label,
    value,
    icon: Icon,
    type = "text",
  }: {
    label: string;
    value: string | null;
    icon?: any;
    type?: "text" | "email" | "url";
  }) => {
    if (!value) return null;

    const renderValue = () => {
      if (type === "email") {
        return (
          <a href={`mailto:${value}`} className="text-primary hover:underline">
            {value}
          </a>
        );
      }
      if (type === "url") {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {value}
          </a>
        );
      }
      return <span>{value}</span>;
    };

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </div>
        <div className="text-sm">{renderValue()}</div>
      </div>
    );
  };

  if (isInitialLoading) {
    return (
      <>
        <SiteHeader title="Restaurant Settings" />
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2 text-center">
            Loading Settings...
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

  return (
    <>
      <SiteHeader title="Restaurant Settings" />
      <div className="flex flex-1 flex-col bg-muted/20">
        <div className="container mx-auto p-6 max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {hasRestaurant
                    ? "Restaurant Settings"
                    : "Create Your Restaurant"}
                </h1>
                <p className="text-muted-foreground">
                  {hasRestaurant
                    ? "Manage your restaurant information and preferences"
                    : "Set up your restaurant profile to get started"}
                </p>
              </div>
            </div>

            {/* Edit/View Toggle Button */}
            {hasRestaurant && (
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Content - Takes 2/3 width */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about your restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Restaurant Name *</Label>
                          <Input
                            id="name"
                            value={form.name ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="Enter restaurant name"
                            className="font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cuisineType">Cuisine Type</Label>
                          <Select
                            value={form.cuisineType ?? ""}
                            onValueChange={(value) =>
                              setForm((f) => ({
                                ...f,
                                cuisineType: value || null,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select cuisine type" />
                            </SelectTrigger>
                            <SelectContent>
                              {cuisineTypes.map((cuisine) => (
                                <SelectItem key={cuisine} value={cuisine}>
                                  {cuisine}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={form.description ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              description: e.target.value || null,
                            }))
                          }
                          placeholder="Describe your restaurant..."
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-muted-foreground">
                            Restaurant Name
                          </div>
                          <div className="text-lg font-semibold">
                            {form.name || "Not set"}
                          </div>
                        </div>
                        <DisplayField
                          label="Cuisine Type"
                          value={form.cuisineType}
                        />
                      </div>
                      <DisplayField
                        label="Description"
                        value={form.description}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>How customers can reach you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={form.email ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                email: e.target.value || null,
                              }))
                            }
                            placeholder="restaurant@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4" />
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={form.phone ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                phone: e.target.value || null,
                              }))
                            }
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="flex items-center gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Address
                        </Label>
                        <Textarea
                          id="address"
                          value={form.address ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              address: e.target.value || null,
                            }))
                          }
                          placeholder="123 Main Street, City, State, ZIP Code"
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <DisplayField
                        label="Email Address"
                        value={form.email}
                        icon={Mail}
                        type="email"
                      />
                      <DisplayField
                        label="Phone Number"
                        value={form.phone}
                        icon={Phone}
                      />
                      <div className="md:col-span-2">
                        <DisplayField
                          label="Address"
                          value={form.address}
                          icon={MapPin}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Google Business & Rating */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Online Presence
                  </CardTitle>
                  <CardDescription>
                    Google Business and rating information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="googleBusinessUrl"
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Google Business URL
                        </Label>
                        <Input
                          id="googleBusinessUrl"
                          value={form.googleBusinessUrl ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              googleBusinessUrl: e.target.value || null,
                            }))
                          }
                          placeholder="https://business.google.com/your-restaurant"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="googleRating"
                          className="flex items-center gap-2"
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          Google Rating
                        </Label>
                        <Input
                          id="googleRating"
                          value={form.googleRating ?? ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              googleRating: e.target.value || null,
                            }))
                          }
                          placeholder="4.5"
                          className="max-w-20"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <DisplayField
                        label="Google Business URL"
                        value={form.googleBusinessUrl}
                        icon={Globe}
                        type="url"
                      />
                      <DisplayField
                        label="Google Rating"
                        value={form.googleRating}
                        icon={Star}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Branding */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding & Appearance
                  </CardTitle>
                  <CardDescription>
                    Customize your restaurant's visual identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="colorTheme">Brand Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="colorTheme"
                            type="color"
                            value={form.colorTheme}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                colorTheme: e.target.value,
                              }))
                            }
                            className="w-16 h-10 rounded-md border cursor-pointer"
                          />
                          <Input
                            value={form.colorTheme}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                colorTheme: e.target.value,
                              }))
                            }
                            placeholder="#dc2626"
                            className="font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Restaurant Logo</Label>
                        <ImageUpload
                          currentImage={form.logoUrl}
                          onImageUploaded={handleImageUploaded}
                          onImageRemoved={handleImageRemoved}
                          fallbackText={getRestaurantInitials()}
                          disabled={isLoading}
                          size="lg"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Brand Color
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-md border"
                            style={{ backgroundColor: form.colorTheme }}
                          />
                          <span className="font-mono text-sm">
                            {form.colorTheme}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Restaurant Logo
                        </div>
                        <div className="flex items-center gap-3">
                          {form.logoUrl ? (
                            <img
                              src={form.logoUrl}
                              alt="Restaurant Logo"
                              className="w-16 h-16 rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border">
                              <span className="text-lg font-semibold text-muted-foreground">
                                {getRestaurantInitials()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {form.logoUrl ? "Custom logo" : "Default initials"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Status */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="isActive" className="text-sm font-medium">
                        Restaurant Active
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Make your restaurant visible to customers
                      </p>
                    </div>
                    {isEditing ? (
                      <Switch
                        id="isActive"
                        checked={form.isActive}
                        onCheckedChange={(checked) =>
                          setForm((f) => ({ ...f, isActive: checked }))
                        }
                      />
                    ) : (
                      <Badge
                        variant={form.isActive ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {form.isActive ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {isEditing && (
                <Card className="shadow-sm">
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading || !form.name?.trim()}
                      className="w-full flex items-center gap-2"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {hasRestaurant ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {hasRestaurant ? "Save Changes" : "Create Restaurant"}
                        </>
                      )}
                    </Button>

                    {hasRestaurant && (
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="w-full flex items-center gap-2"
                        size="lg"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Delete Button - Only show if restaurant exists and in edit mode */}
              {hasRestaurant && isEditing && (
                <Card className="shadow-sm border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive flex items-center gap-2">
                      <Trash2 className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Once you delete a restaurant, there is no going back.
                      Please be certain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full flex items-center gap-2"
                          size="lg"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Restaurant
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Delete Restaurant
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="space-y-3">
                              <p>
                                This action cannot be undone. This will
                                permanently delete your restaurant{" "}
                                <strong>"{form.name}"</strong> and remove all
                                associated data.
                              </p>
                              <p className="text-sm">
                                Please type <strong>{form.name}</strong> to
                                confirm:
                              </p>
                              <Input
                                value={deleteConfirmText}
                                onChange={(e) =>
                                  setDeleteConfirmText(e.target.value)
                                }
                                placeholder={`Type "${form.name}" to confirm`}
                                className="mt-2"
                              />
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={handleDeleteDialogClose}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={!isDeleteConfirmValid || isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Restaurant
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
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
