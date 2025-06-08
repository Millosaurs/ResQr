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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Upload,
  Save,
  Settings,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

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
  subscriptionTier: string;
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
    subscriptionTier: "FREE",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRestaurant, setHasRestaurant] = useState<boolean | null>(null);

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
        });
        setHasRestaurant(true);
      } else if (response.status === 404) {
        // No restaurant found - this is for new restaurant creation
        setHasRestaurant(false);
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
          subscriptionTier: form.subscriptionTier,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setForm((prev) => ({ ...prev, ...data.data }));
        setHasRestaurant(true);
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

  const subscriptionTiers = [
    { value: "FREE", label: "Free Plan", color: "bg-gray-100 text-gray-800" },
    { value: "BASIC", label: "Basic Plan", color: "bg-blue-100 text-blue-800" },
    { value: "PRO", label: "Pro Plan", color: "bg-purple-100 text-purple-800" },
    {
      value: "ENTERPRISE",
      label: "Enterprise",
      color: "bg-gold-100 text-gold-800",
    },
  ];

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

  // Loading component with Loader2
  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading restaurant data...</p>
    </div>
  );

  if (isInitialLoading) {
    return (
      <>
        <SiteHeader title="Restaurant Settings" />
        <div className="flex flex-1 flex-col bg-muted/20">
          <div className="container mx-auto p-6 max-w-4xl">
            <LoadingScreen />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Restaurant Settings" />
      <div className="flex flex-1 flex-col bg-muted/20">
        <div className="container mx-auto p-6 max-w-9xl space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {hasRestaurant ? "" : "Create Your Restaurant"}
              </h1>
              <p className="text-muted-foreground">
                {hasRestaurant
                  ? "Manage your restaurant information and preferences"
                  : "Set up your restaurant profile to get started"}
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-8 md:grid-cols-3">
            {/* Main Settings - Takes 2/3 width */}
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
                          setForm((f) => ({ ...f, cuisineType: value || null }))
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="colorTheme">Brand Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="colorTheme"
                        type="color"
                        value={form.colorTheme}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, colorTheme: e.target.value }))
                        }
                        className="w-16 h-10 rounded-md border cursor-pointer"
                      />
                      <Input
                        value={form.colorTheme}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, colorTheme: e.target.value }))
                        }
                        placeholder="#dc2626"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Restaurant Logo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={form.logoUrl ?? undefined} />
                        <AvatarFallback className="text-lg font-bold">
                          {form.name
                            ? form.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
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
                    <Switch
                      id="isActive"
                      checked={form.isActive}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, isActive: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Plan</Label>
                    <Badge
                      className={
                        subscriptionTiers.find(
                          (t) => t.value === form.subscriptionTier
                        )?.color
                      }
                    >
                      {
                        subscriptionTiers.find(
                          (t) => t.value === form.subscriptionTier
                        )?.label
                      }
                    </Badge>
                  </div>

                  <Select
                    value={form.subscriptionTier}
                    onValueChange={(value) =>
                      setForm((f) => ({ ...f, subscriptionTier: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionTiers.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          {tier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card className="shadow-sm">
                <CardContent className="pt-6">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
