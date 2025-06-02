"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { signIn, useSession } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
                        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Welcome to ResQr</h2>
                        <p className="text-muted-foreground text-center text-base">Sign in to access your dashboard and manage your restaurant with powerful tools.</p>
                    </div>
                    {/* Sign In Card (right side) */}
                    <div className="w-full max-w-md md:mr-16">
                        <div className="mb-8 text-center md:hidden">
                            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back 👋</h1>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">Sign in to your account to access the dashboard and manage your restaurant efficiently.</p>
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
                                        onClick={async () => {
                                            await signIn.email(
                                                {
                                                    email,
                                                    password
                                                },
                                                {
                                                    onRequest: (ctx) => {
                                                        setLoading(true);
                                                    },
                                                    onResponse: (ctx) => {
                                                        setLoading(false);
                                                    },
                                                    onError: (error) => {
                                                        console.error(error);
                                                    },
                                                    onSuccess: (data) => {
                                                        console.log(data);
                                                        router.push("/dashboard");
                                                    }
                                                },
                                            );
                                        }}
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
                                    <span className="text-xs text-muted-foreground">Don't have an account? <Link href="/sign-up" className="text-primary underline">Sign up</Link></span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>

        </div>
    );
}