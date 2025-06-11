"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, QrCode, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface QRCodeData {
  id: string;
  menuName: string;
  menuSlug: string;
  restaurantName: string;
  restaurantId: string;
  menuUrl: string;
  qrCodeImageUrl?: string; // URL to the actual QR code image
}

interface RestaurantData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface QRCodesResponse {
  restaurant: RestaurantData;
  qrCodes: QRCodeData[];
}

export default function QRCodesPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qr-codes");
      if (!response.ok) {
        throw new Error("Failed to fetch QR codes");
      }
      const data: QRCodesResponse = await response.json();
      setQrCodes(data.qrCodes);
      setRestaurant(data.restaurant);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      toast.error("Failed to load QR codes");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async (qrCode: QRCodeData) => {
    try {
      setDownloadingId(qrCode.id);

      const response = await fetch("/api/qr-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: qrCode.menuUrl,
          restaurantName: qrCode.restaurantName,
          menuName: qrCode.menuName,
          restaurantAddress: restaurant?.address,
          restaurantPhone: restaurant?.phone,
          size: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${qrCode.restaurantName}-${qrCode.menuName}-QR.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("QR code downloaded successfully");
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
    } finally {
      setDownloadingId(null);
    }
  };

  const shareQRCode = async (qrCode: QRCodeData) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${qrCode.restaurantName} - ${qrCode.menuName}`,
          text: `Check out our ${qrCode.menuName} menu!`,
          url: qrCode.menuUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(qrCode.menuUrl);
        toast.success("Menu URL copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      toast.error("Failed to share QR code");
    }
  };

  const getQRCodeImageUrl = (qrCode: QRCodeData) => {
    // If the user has a stored QR code image, use that
    if (qrCode.qrCodeImageUrl) {
      return qrCode.qrCodeImageUrl;
    }
    // Fallback to API endpoint that serves the user's QR code
    return `/api/qr-codes/${qrCode.id}/image`;
  };

  if (loading) {
    return (
      <>
        <SidebarInset>
          <SiteHeader title="QR Codes" />
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-muted-foreground mt-2 text-center">
              Loading QR codes...
            </p>
          </div>
        </SidebarInset>
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
      <SidebarInset>
        <SiteHeader title="QR Codes" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Header section - responsive layout */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold">QR Codes</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Generate and download QR codes for your restaurant menus
                </p>
              </div>
              {restaurant && (
                <Card className="w-full lg:w-auto lg:min-w-[280px] gap-0">
                  <CardHeader className="">
                    <CardTitle className="text-2xl font-bold">
                      Restaurant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                      <p className="text-xl font-semibold">{restaurant.name}</p>
                      {restaurant.address && (
                        <p className="text-muted-foreground break-words">
                          {restaurant.address}
                        </p>
                      )}
                      {restaurant.phone && (
                        <p className="text-muted-foreground">
                          {restaurant.phone}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Empty state or QR codes grid */}
            {qrCodes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
                  <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-center">
                    No QR Codes Available
                  </h3>
                  <p className="text-muted-foreground text-center text-sm sm:text-base max-w-md">
                    You need to create and publish menus first to generate QR
                    codes.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {qrCodes.map((qrCode) => (
                  <Card key={qrCode.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle
                        className="text-base sm:text-lg truncate"
                        title={qrCode.menuName}
                      >
                        {qrCode.menuName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* QR Code Image - responsive sizing */}
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-[200px] aspect-square">
                          <img
                            src={getQRCodeImageUrl(qrCode)}
                            alt={`QR Code for ${qrCode.menuName}`}
                            className="w-full h-full object-contain border border-border rounded-lg"
                            onError={(e) => {
                              // Fallback to external service if user's QR code fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                qrCode.menuUrl
                              )}`;
                            }}
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                          Scan to view {qrCode.menuName}
                        </p>
                      </div>

                      {/* Action buttons - responsive layout */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="default"
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => downloadQRCode(qrCode)}
                          disabled={downloadingId === qrCode.id}
                        >
                          {downloadingId === qrCode.id ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          )}
                          Download
                        </Button>
                        <Button
                          size="default"
                          variant="outline"
                          className="flex-1 text-xs sm:text-sm"
                          onClick={() => shareQRCode(qrCode)}
                        >
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* URL display - responsive text */}
                      <div className="text-xs text-muted-foreground">
                        <p
                          className="truncate break-all"
                          title={qrCode.menuUrl}
                        >
                          {qrCode.menuUrl}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
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
