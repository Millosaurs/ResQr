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
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, Check, ChefHat } from "lucide-react";
import Link from "next/link";

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

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restaurant data state
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    address: "",
    countryCode: "+1", // Default country code
    phone: "",
    email: "",
    googleBusinessUrl: "",
    googleRating: "",
    cuisineType: "",
    description: "",
    logoUrl: "",
    colorTheme: "#000000",
    subscriptionTier: "FREE",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload this to a storage service
      // and get back a URL to store in the database
      // For now, we'll just create a temporary URL
      const tempUrl = URL.createObjectURL(file);
      setRestaurantData((prev) => ({
        ...prev,
        logoUrl: tempUrl,
      }));
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

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Add API call to create restaurant in the database
      // const response = await fetch('/api/restaurants', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...restaurantData,
      //     phone: restaurantData.countryCode + restaurantData.phone,
      //     ownerId: session?.user?.id,
      //   }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Failed to create restaurant');
      // }

      toast.success("Restaurant created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating restaurant:", error);
      toast.error("Failed to create restaurant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader className="my-4">
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Let's start with the basic details of your restaurant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={restaurantData.name}
                  onChange={handleChange}
                  placeholder="Enter your restaurant name"
                  required
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={restaurantData.address}
                  onChange={handleChange}
                  placeholder="Enter your restaurant address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select
                      value={restaurantData.countryCode}
                      onValueChange={(value) =>
                        handleSelectChange("countryCode", value)
                      }
                    >
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.code} ({country.country.split("/")[0]})
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
                      className={errors.phone ? "border-red-500" : ""}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={restaurantData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader className="my-4">
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>
                Tell us more about your restaurant's cuisine and description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <Select
                  value={restaurantData.cuisineType}
                  onValueChange={(value) =>
                    handleSelectChange("cuisineType", value)
                  }
                >
                  <SelectTrigger id="cuisineType">
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="mexican">Mexican</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="thai">Thai</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={restaurantData.description}
                  onChange={handleChange}
                  placeholder="Describe your restaurant"
                  className="h-24"
                />
              </div>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader className="my-4">
              <CardTitle>Online Presence</CardTitle>
              <CardDescription>
                Add your Google Business information to enhance your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleBusinessUrl">Google Business URL</Label>
                <Input
                  id="googleBusinessUrl"
                  name="googleBusinessUrl"
                  value={restaurantData.googleBusinessUrl}
                  onChange={handleChange}
                  placeholder="https://business.google.com/..."
                  className={errors.googleBusinessUrl ? "border-red-500" : ""}
                />
                {errors.googleBusinessUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.googleBusinessUrl}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleRating">
                  Google Rating (if available, max 5)
                </Label>
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
                  className={errors.googleRating ? "border-red-500" : ""}
                />
                {errors.googleRating && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.googleRating}
                  </p>
                )}
              </div>
            </CardContent>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader className="my-4">
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize your restaurant's appearance on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Restaurant Logo</Label>
                <Input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {restaurantData.logoUrl && (
                  <div className="mt-2">
                    <img
                      src={restaurantData.logoUrl}
                      alt="Logo Preview"
                      className="w-24 h-24 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorTheme">Brand Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="colorTheme"
                    name="colorTheme"
                    type="color"
                    value={restaurantData.colorTheme}
                    onChange={handleChange}
                    className="w-12 h-12 p-1"
                  />
                  <span>{restaurantData.colorTheme}</span>
                </div>
              </div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="w-full bg-background ">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center">
              <ChefHat className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-bold text-foreground">ResQr</h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {session?.user?.name}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl shadow-lg border-opacity-50 mt-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 px-6 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Restaurant Onboarding</h1>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {renderStepContent()}

            <CardFooter className="flex justify-between pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={nextStep} disabled={loading}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Processing
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Complete Setup
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
