import type { Metadata } from "next";
import { Outfit, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfitsans = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResQr | Restaurant QR & Menu Dashboard",
  description: "ResQr is a modern dashboard for managing restaurant menus, QR codes, analytics, and more. Streamline your restaurant operations with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfitsans.variable} ${geistMono.variable} antialiased`}
      ><Toaster />
        {children}
      </body>
    </html>
  );
}
