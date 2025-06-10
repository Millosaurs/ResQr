// hooks/useQRCodes.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface QRCodeData {
  id: string;
  menuName: string;
  menuSlug: string;
  restaurantName: string;
  restaurantId: string;
  menuUrl: string;
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

export const useQRCodes = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/qr-codes");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to view QR codes");
        } else if (response.status === 404) {
          throw new Error(
            "Restaurant not found. Please set up your restaurant first."
          );
        } else {
          throw new Error("Failed to load QR codes");
        }
      }

      const data: QRCodesResponse = await response.json();
      setQrCodes(data.qrCodes);
      setRestaurant(data.restaurant);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async (
    qrCode: QRCodeData,
    options?: { size?: number }
  ) => {
    try {
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
          size: options?.size || 1024,
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
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to download QR code";
      toast.error(errorMessage);
      return false;
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
        return true;
      } else {
        await navigator.clipboard.writeText(qrCode.menuUrl);
        toast.success("Menu URL copied to clipboard");
        return true;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to share QR code";
      toast.error(errorMessage);
      return false;
    }
  };

  const generateQRCodePreview = (url: string, size: number = 200) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      url
    )}`;
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  return {
    qrCodes,
    restaurant,
    loading,
    error,
    refetch: fetchQRCodes,
    downloadQRCode,
    shareQRCode,
    generateQRCodePreview,
  };
};
