"use client";

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
import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, X, ArrowLeft } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import * as Dialog from "@radix-ui/react-dialog";

export default function SignUp() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(false);
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);

    useEffect(() => {
        if (session) {
            router.replace("/dashboard");
        }
    }, [session, router]);

    if (session) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
                        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Welcome to ResQr</h2>
                        <p className="text-muted-foreground text-center text-base">Create your account to unlock powerful restaurant management features and streamline your workflow.</p>
                    </div>
                    {/* Signup Card (right side) */}
                    <div className="w-full max-w-md md:mr-16">
                        <div className="mb-8 text-center md:hidden">
                            <h1 className="text-4xl font-bold text-foreground mb-2">Create your account 🚀</h1>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">Sign up to get started with ResQr and manage your restaurant with ease.</p>
                        </div>
                        <Card className="z-50 rounded-xl w-full shadow-xl border-border border bg-card/80 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-lg md:text-xl">Sign Up</CardTitle>
                                <CardDescription className="text-xs md:text-sm">
                                    Enter your information to create an account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="first-name">First name</Label>
                                            <Input
                                                id="first-name"
                                                placeholder="Max"
                                                required
                                                onChange={(e) => {
                                                    setFirstName(e.target.value);
                                                }}
                                                value={firstName}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="last-name">Last name</Label>
                                            <Input
                                                id="last-name"
                                                placeholder="Robinson"
                                                required
                                                onChange={(e) => {
                                                    setLastName(e.target.value);
                                                }}
                                                value={lastName}
                                            />
                                        </div>
                                    </div>
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
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Password"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Confirm Password"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="image">Profile Image (optional)</Label>
                                        <div className="flex items-end gap-4">
                                            {imagePreview && (
                                                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Profile preview"
                                                        layout="fill"
                                                        objectFit="cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 w-full">
                                                <Input
                                                    id="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="w-full"
                                                />
                                                {imagePreview && (
                                                    <X
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setImage(null);
                                                            setImagePreview(null);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading}
                                        onClick={async () => {
                                            await signUp.email({
                                                email,
                                                password,
                                                name: `${firstName} ${lastName}`,
                                                image: image ? await convertImageToBase64(image) : "",
                                                callbackURL: "/dashboard",
                                                fetchOptions: {
                                                    onResponse: () => {
                                                        setLoading(false);
                                                    },
                                                    onRequest: () => {
                                                        setLoading(true);
                                                    },
                                                    onError: (ctx) => {
                                                        toast.error(ctx.error.message);
                                                    },
                                                    onSuccess: async () => {
                                                        setShowVerifyDialog(true);

                                                    },
                                                },
                                            });
                                        }}
                                    >
                                        {loading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            "Create an account"
                                        )}
                                    </Button>
                                    {/* Email Verification Dialog */}
                                    <Dialog.Root open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                                        <Dialog.Portal>
                                            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                                            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-8 shadow-xl border border-border flex flex-col items-center">
                                                <Dialog.Title className="text-xl font-bold text-foreground mb-2">Verify your email</Dialog.Title>
                                                <Dialog.Description className="text-muted-foreground text-center mb-4">
                                                    We have sent a verification link to <span className="font-semibold">{email}</span>.<br />
                                                    Please check your inbox and follow the instructions to activate your account.
                                                </Dialog.Description>
                                                <Button onClick={() => {
                                                    setShowVerifyDialog(false);
                                                    router.push('/sign-in');
                                                }} className="mt-2 w-full">Close</Button>
                                            </Dialog.Content>
                                        </Dialog.Portal>
                                    </Dialog.Root>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div className="flex flex-col w-full border-t py-4 items-center">
                                    <p className="text-center text-xs text-neutral-500 mb-2">
                                        Secured by <span className="text-orange-400">better-auth.</span>
                                    </p>
                                    <span className="text-xs text-muted-foreground">Already have an account? <a href="/sign-in" className="text-primary underline">Sign in</a></span>
                                </div>
                            </CardFooter>
                        </Card>

                    </div>
                </div>
            </div>
        </div>

    );
}

async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}