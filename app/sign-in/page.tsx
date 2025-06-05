"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { signIn, useSession } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Function to check user's restaurant status
async function checkUserRestaurantStatus(): Promise<boolean> {
  try {
    const response = await fetch("/api/user/restaurant-status");
    if (!response.ok) {
      throw new Error("Failed to fetch user status");
    }
    const data = await response.json();
    return data.hasRestaurant || false;
  } catch (error) {
    console.error("Error checking restaurant status:", error);
    return false;
  }
}

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (session) return null;

  const handleSignIn = async () => {
    await signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          let message = "Sign in failed.";
          if (ctx?.error?.code === "EMAIL_NOT_VERIFIED") {
            message = "Email not verified. Please check your inbox.";
          } else if (ctx?.error?.message) {
            message = ctx.error.message;
          } else if (ctx?.error?.status === 0) {
            message = "Connection issue. Please try again.";
          }
          toast.error(message, {
            className:
              "bg-destructive text-destructive-foreground border border-destructive rounded-lg px-4 py-3 text-sm font-medium shadow-xl",
          });
        },
        onSuccess: async (ctx) => {
          if (ctx?.data && ctx.data.emailVerified === false) {
            toast.error("Please verify your email before logging in.", {
              className:
                "bg-destructive text-destructive-foreground border border-destructive rounded-lg px-4 py-3 text-sm font-medium shadow-xl",
            });
            return;
          }

          // Check restaurant status after successful authentication
          try {
            const hasRestaurant = await checkUserRestaurantStatus();

            if (!hasRestaurant) {
              router.push("/onboarding");
            } else {
              router.push("/dashboard");
            }
          } catch (error) {
            console.error("Error checking restaurant status:", error);
            // Default to onboarding if we can't determine status
            router.push("/onboarding");
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background px-4">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center w-full">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-8xl gap-8 mt-16 md:mt-0">
          {/* Illustration and text (left side) */}
          <div className="hidden md:flex flex-col items-center justify-center md:w-full p-8 bg-muted rounded-xl shadow-md mr-0 md:mr-4 ml-0 md:ml-16">
            <Image
              src="/public/next.svg"
              alt="Brand Illustration"
              width={720}
              height={630}
              className="mb-6"
            />
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
              Welcome to ResQr
            </h2>
            <p className="text-muted-foreground text-center text-base">
              Sign in to access your dashboard and manage your restaurant with
              powerful tools.
            </p>
          </div>
          {/* Sign In Card (right side) */}
          <div className="w-full max-w-md md:mr-16">
            <div className="mb-8 text-center md:hidden">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome Back 👋
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Sign in to your account to access the dashboard and manage your
                restaurant efficiently.
              </p>
            </div>
            <Card className="z-50 rounded-xl w-full shadow-xl border-border border bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Enter your email below to login to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      value={email}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>

                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      autoComplete="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      onClick={() => {
                        setRememberMe(!rememberMe);
                      }}
                    />
                    <Label htmlFor="remember">Remember me</Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    onClick={handleSignIn}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <p> Login </p>
                    )}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full text-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/sign-up" className="text-primary underline">
                      Sign up
                    </Link>
                  </span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
