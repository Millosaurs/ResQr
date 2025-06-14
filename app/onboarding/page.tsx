"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  X,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Palette,
  Info,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import ImgUpload from "@/components/imgUpload";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// URL validation regex
const URL_REGEX =
  /^(https?:\/\/)?(([\w\-])+\.)+([\w\-\.]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?$/;

// Country codes for phone numbers
const COUNTRY_CODES = [
  { code: "+1", country: "United States/Canada" },
  { code: "+44", country: "United Kingdom" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+52", country: "Mexico" },
  { code: "+55", country: "Brazil" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+82", country: "South Korea" },
  { code: "+7", country: "Russia" },
  { code: "+31", country: "Netherlands" },
];

const CUISINE_TYPES = [
  { value: "italian", label: "🍝 Italian" },
  { value: "mexican", label: "🌮 Mexican" },
  { value: "chinese", label: "🥢 Chinese" },
  { value: "indian", label: "🍛 Indian" },
  { value: "japanese", label: "🍣 Japanese" },
  { value: "american", label: "🍔 American" },
  { value: "mediterranean", label: "🫒 Mediterranean" },
  { value: "thai", label: "🌶️ Thai" },
  { value: "french", label: "🥐 French" },
  { value: "other", label: "🍽️ Other" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restaurant data state
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    address: "",
    countryCode: "+1",
    phone: "",
    email: "",
    googleBusinessUrl: "",
    googleRating: "",
    cuisineType: "",
    description: "",
    logoImageId: null as number | null,
    logoUrl: "",
    colorTheme: "#ff6b35",
    subscriptionTier: "FREE",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Special validation for Google Rating
    if (name === "googleRating" && value !== "") {
      const numValue = parseFloat(value);
      if (numValue > 5) {
        return; // Don't update if greater than 5
      }
    }

    setRestaurantData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setRestaurantData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle logo upload success
  const handleLogoUploadSuccess = async (imageData: {
    id: number;
    fileName: string;
    imageUrl: string;
    imagekitFileId: string;
  }) => {
    setRestaurantData((prev) => ({
      ...prev,
      logoImageId: imageData.id,
      logoUrl: imageData.imageUrl,
    }));

    toast.success("Logo uploaded successfully!");
  };

  // Improved logo removal function
  const handleLogoRemove = async () => {
    if (!restaurantData.logoImageId) {
      // Just clear the form data if no logo was uploaded yet
      setRestaurantData((prev) => ({
        ...prev,
        logoImageId: null,
        logoUrl: "",
      }));
      return;
    }

    setImageUploading(true);

    try {
      const response = await fetch(
        `/api/upload?id=${restaurantData.logoImageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete logo");
      }

      // Clear the form data
      setRestaurantData((prev) => ({
        ...prev,
        logoImageId: null,
        logoUrl: "",
      }));

      toast.success("Logo removed successfully");
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove logo. Please try again."
      );
    } finally {
      setImageUploading(false);
    }
  };

  // Validate form data for current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        // Validate name
        if (!restaurantData.name.trim()) {
          newErrors.name = "Restaurant name is required";
        }

        // Validate email if provided
        if (restaurantData.email && !EMAIL_REGEX.test(restaurantData.email)) {
          newErrors.email = "Please enter a valid email address";
        }

        // Validate phone if provided
        if (restaurantData.phone && !/^\d{10}$/.test(restaurantData.phone)) {
          newErrors.phone = "Please enter a valid 10-digit phone number";
        }
        break;

      case 3:
        // Validate Google Business URL if provided
        if (
          restaurantData.googleBusinessUrl &&
          !URL_REGEX.test(restaurantData.googleBusinessUrl)
        ) {
          newErrors.googleBusinessUrl = "Please enter a valid URL";
        }

        // Validate Google Rating if provided
        if (restaurantData.googleRating) {
          const rating = parseFloat(restaurantData.googleRating);
          if (isNaN(rating) || rating < 0 || rating > 5) {
            newErrors.googleRating = "Rating must be between 0 and 5";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Cleanup function for failed restaurant creation
  const cleanupFailedUpload = async () => {
    if (restaurantData.logoImageId) {
      try {
        await fetch(`/api/upload?id=${restaurantData.logoImageId}`, {
          method: "DELETE",
        });
      } catch (cleanupError) {
        console.error(
          "Error cleaning up logo after failed restaurant creation:",
          cleanupError
        );
      }
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the restaurant data payload
      const restaurantPayload = {
        name: restaurantData.name.trim(),
        address: restaurantData.address.trim() || null,
        phone: restaurantData.phone
          ? restaurantData.countryCode + restaurantData.phone
          : null,
        email: restaurantData.email.trim() || null,
        googleBusinessUrl: restaurantData.googleBusinessUrl.trim() || null,
        googleRating: restaurantData.googleRating
          ? parseFloat(restaurantData.googleRating)
          : null,
        cuisineType: restaurantData.cuisineType || null,
        description: restaurantData.description.trim() || null,
        logoImageId: restaurantData.logoImageId,
        colorTheme: restaurantData.colorTheme,
        subscriptionTier: restaurantData.subscriptionTier,
      };

      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create restaurant");
      }

      // Update the uploaded image record to associate it with the restaurant
      if (restaurantData.logoImageId) {
        try {
          await fetch(`/api/upload/${restaurantData.logoImageId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              restaurantId: data.data.id,
              isLinked: true,
            }),
          });
        } catch (error) {
          console.error("Error linking logo to restaurant:", error);
          // Don't fail the restaurant creation for this
        }
      }

      toast.success("Restaurant created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating restaurant:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create restaurant. Please try again."
      );

      // Cleanup uploaded logo if restaurant creation failed
      await cleanupFailedUpload();
    } finally {
      setLoading(false);
    }
  };

  // Get selected cuisine details
  const getSelectedCuisine = () => {
    return CUISINE_TYPES.find((c) => c.value === restaurantData.cuisineType);
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Let's start with the essential details of your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={restaurantData.name}
                  onChange={handleChange}
                  placeholder="Enter your restaurant name"
                  required
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={restaurantData.address}
                  onChange={handleChange}
                  placeholder="Enter your restaurant address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={restaurantData.countryCode}
                      onValueChange={(value) =>
                        handleSelectChange("countryCode", value)
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      name="phone"
                      value={restaurantData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={errors.phone ? "border-destructive" : ""}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-destructive text-sm">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={restaurantData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Restaurant Details
              </CardTitle>
              <CardDescription>
                Tell us about your cuisine and what makes you special
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <Select
                  value={restaurantData.cuisineType}
                  onValueChange={(value) =>
                    handleSelectChange("cuisineType", value)
                  }
                >
                  <SelectTrigger id="cuisineType">
                    <SelectValue placeholder="Select your cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_TYPES.map((cuisine) => (
                      <SelectItem key={cuisine.value} value={cuisine.value}>
                        {cuisine.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {restaurantData.cuisineType && (
                  <Badge variant="secondary" className="mt-2">
                    {getSelectedCuisine()?.label}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={restaurantData.description}
                  onChange={handleChange}
                  placeholder="Describe your restaurant's atmosphere, specialties, and what makes it unique..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {restaurantData.description.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Online Presence
              </CardTitle>
              <CardDescription>
                Connect your Google Business profile to boost credibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="googleBusinessUrl">Google Business URL</Label>
                <Input
                  id="googleBusinessUrl"
                  name="googleBusinessUrl"
                  value={restaurantData.googleBusinessUrl}
                  onChange={handleChange}
                  placeholder="https://business.google.com/..."
                  className={
                    errors.googleBusinessUrl ? "border-destructive" : ""
                  }
                />
                {errors.googleBusinessUrl && (
                  <p className="text-destructive text-sm">
                    {errors.googleBusinessUrl}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="googleRating"
                  className="flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  Google Rating (0-5)
                </Label>
                <div className="relative">
                  <Input
                    id="googleRating"
                    name="googleRating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={restaurantData.googleRating}
                    onChange={handleChange}
                    placeholder="e.g., 4.5"
                    className={errors.googleRating ? "border-destructive" : ""}
                  />
                  {restaurantData.googleRating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {restaurantData.googleRating}
                      </span>
                    </div>
                  )}
                </div>
                {errors.googleRating && (
                  <p className="text-destructive text-sm">
                    {errors.googleRating}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Customize your restaurant's visual identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Restaurant Logo</Label>
                <div className="flex flex-col items-center space-y-4">
                  {restaurantData.logoUrl ? (
                    <div className="relative">
                      <div className="w-32 h-32 rounded-lg border overflow-hidden bg-white">
                        <img
                          src={restaurantData.logoUrl}
                          alt="Restaurant Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={handleLogoRemove}
                        disabled={imageUploading}
                      >
                        {imageUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full max-w-md">
                      <ImgUpload
                        onUploadSuccess={handleLogoUploadSuccess}
                        currentImageUrl={restaurantData.logoUrl}
                        onRemove={handleLogoRemove}
                        label="Upload Restaurant Logo"
                        maxSizeMB={5}
                      />
                    </div>
                  )}

                  {restaurantData.logoImageId && (
                    <Badge variant="secondary" className="text-green-700">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Logo uploaded successfully
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label htmlFor="colorTheme">Brand Color Theme</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Input
                      id="colorTheme"
                      name="colorTheme"
                      type="color"
                      value={restaurantData.colorTheme}
                      onChange={handleChange}
                      className="w-16 h-16 rounded-lg border cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={restaurantData.colorTheme}
                      onChange={(e) =>
                        setRestaurantData((prev) => ({
                          ...prev,
                          colorTheme: e.target.value,
                        }))
                      }
                      placeholder="#ff6b35"
                      className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This color will be used for your restaurant's branding
                    </p>
                  </div>
                </div>

                {/* Color Preview */}
                <div
                  className="h-24 rounded-lg border flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: restaurantData.colorTheme }}
                >
                  {restaurantData.name || "Your Restaurant"}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Review Your Information
              </CardTitle>
              <CardDescription>
                Please review all details before completing your setup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {/* Restaurant Preview Card */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {restaurantData.logoUrl && (
                      <img
                        src={restaurantData.logoUrl}
                        alt="Logo"
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {restaurantData.name}
                      </h3>
                      {restaurantData.cuisineType && (
                        <Badge variant="secondary" className="mt-1">
                          {getSelectedCuisine()?.label}
                        </Badge>
                      )}
                      {restaurantData.googleRating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {restaurantData.googleRating}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold border-b pb-2">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {restaurantData.address || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {restaurantData.phone
                            ? `${restaurantData.countryCode}${restaurantData.phone}`
                            : "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {restaurantData.email || "Not provided"}
                        </span>
                      </div>
                      {restaurantData.googleBusinessUrl && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            Google Business Profile
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold border-b pb-2">
                      Restaurant Details
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Cuisine Type
                        </Label>
                        <p className="text-sm font-medium">
                          {restaurantData.cuisineType
                            ? getSelectedCuisine()?.label
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Brand Color
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{
                              backgroundColor: restaurantData.colorTheme,
                            }}
                          />
                          <span className="text-sm font-mono">
                            {restaurantData.colorTheme}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">
                          Logo
                        </Label>
                        <p className="text-sm font-medium">
                          {restaurantData.logoUrl
                            ? "✓ Uploaded"
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {restaurantData.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">
                        {restaurantData.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Almost Ready!
              </CardTitle>
              <CardDescription>
                Confirm your details and create your restaurant profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Ready to Create Your Restaurant Profile
                    </h3>
                    <p className="text-green-700">
                      You're about to create your restaurant profile with all
                      the information you've provided. Once created, you'll be
                      able to:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/80 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Manage Your Menu</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add dishes, set prices, and organize categories
                      </p>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Generate QR Codes</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Create digital menus for your tables
                      </p>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Track Performance</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Monitor views and customer engagement
                      </p>
                    </div>

                    <div className="bg-white/80 rounded-lg p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium">
                          Customize Experience
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Update branding and restaurant details anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">
                      What happens next?
                    </h4>
                    <p className="text-sm text-blue-700">
                      After clicking "Create Restaurant", you'll be redirected
                      to your dashboard where you can start building your
                      digital menu and generating QR codes for your tables.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="flex items-center justify-between p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">ResQr</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{session?.user?.name}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Restaurant Onboarding</h1>
          <Badge variant="outline">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} disabled={loading}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Restaurant...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Restaurant
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
