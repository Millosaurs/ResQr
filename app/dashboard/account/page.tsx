// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Mail,
  User,
  Shield,
  Store,
  CreditCard,
  Pencil,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  hasRestaurant: boolean | null;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    image: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUser(userData);
      setEditForm({
        name: userData.name,
        email: userData.email,
        image: userData.image || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setVerificationLoading(true);
    try {
      const response = await fetch("/api/user/resend-verification", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send verification email");
      }

      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    // Validate password fields if changing password
    if (editForm.newPassword) {
      if (!editForm.currentPassword) {
        toast.error("Current password is required");
        setEditLoading(false);
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        toast.error("New passwords do not match");
        setEditLoading(false);
        return;
      }
      if (editForm.newPassword.length < 8) {
        toast.error("New password must be at least 8 characters long");
        setEditLoading(false);
        return;
      }
    }

    try {
      const updateData: any = {
        name: editForm.name,
        image: editForm.image,
      };

      // Only include email if it's different
      if (editForm.email !== user?.email) {
        updateData.email = editForm.email;
      }

      // Only include password fields if changing password
      if (editForm.newPassword) {
        updateData.currentPassword = editForm.currentPassword;
        updateData.newPassword = editForm.newPassword;
      }

      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      // Handle email verification case
      if (result.emailVerificationRequired) {
        toast.success(result.message);
        setEditDialogOpen(false);

        // Reload the page after a short delay to show the toast
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      setUser(result);
      setEditDialogOpen(false);

      // Reset password fields
      setEditForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("Profile updated successfully");

      // Reload the page after a short delay to show the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <SiteHeader title="Account" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-32"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteHeader title="Account" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            <h1 className="text-2xl font-bold">Account</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Failed to load user data. Please try again.
                </p>
                <Button onClick={fetchUser} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Account" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Account</h1>

            {/* Edit Profile Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsContent value="profile" className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-20 w-20 ">
                          <AvatarImage
                            src={editForm.image}
                            alt={editForm.name}
                          />
                          <AvatarFallback className="text-lg">
                            {editForm.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="w-full ">
                          <Label htmlFor="image" className="py-2">
                            Profile Image URL
                          </Label>
                          <Input
                            id="image"
                            type="url"
                            value={editForm.image}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                image: e.target.value,
                              })
                            }
                            placeholder="https://example.com/image.jpg"
                            disabled={editLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="name" className="py-2">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          required
                          disabled={editLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="py-2">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          required
                          disabled={editLoading}
                        />
                        {editForm.email !== user.email && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Changing your email will require verification of
                              the new email address.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      disabled={editLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Email Verification Alert */}
          {!user.emailVerified && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your email address is not verified. Please check your inbox for
                a verification email.
                <Button
                  variant="link"
                  className="p-0 h-auto ml-2 text-yellow-800 underline"
                  onClick={handleResendVerification}
                  disabled={verificationLoading}
                >
                  {verificationLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend verification email"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image || ""} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    {user.emailVerified ? (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>Member since</span>
                  </div>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4" />
                    <span>Restaurant Status</span>
                  </div>
                  <Badge variant={user.hasRestaurant ? "default" : "outline"}>
                    {user.hasRestaurant ? "Has Restaurant" : "No Restaurant"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/billing">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/dashboard/security">
                    <Lock className="h-4 w-4 mr-2" />
                    Security Settings
                  </Link>
                </Button>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Last updated: {formatDate(user.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
