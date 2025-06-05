// lib/image-utils.ts
import { useState } from "react";
import { toast } from "sonner";

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    id: number;
    fileName: string;
    imageUrl: string;
    imagekitFileId: string;
  };
  error?: string;
}

export interface ImageDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Upload an image file to the server
 */
export async function uploadImage(
  file: File,
  imageType: string = "general"
): Promise<ImageUploadResponse> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size too large. Maximum 5MB allowed.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("imageType", imageType);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }

    return data;
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

/**
 * Delete an image by ID
 */
export async function deleteImage(
  imageId: number
): Promise<ImageDeleteResponse> {
  try {
    const response = await fetch(`/api/upload?id=${imageId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to delete image");
    }

    return data;
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image",
    };
  }
}

/**
 * Link an image to a restaurant
 */
export async function linkImageToRestaurant(
  imageId: number,
  restaurantId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/upload/${imageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restaurantId,
        isLinked: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to link image to restaurant");
    }

    return { success: true };
  } catch (error) {
    console.error("Link image error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to link image",
    };
  }
}

/**
 * Hook for managing image uploads with loading states and error handling
 */
export function useImageUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, imageType?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await uploadImage(file, imageType);

      if (result.success) {
        toast.success("Image uploaded successfully!");
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (imageId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteImage(imageId);

      if (result.success) {
        toast.success("Image removed successfully!");
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    upload,
    remove,
    loading,
    error,
  };
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Invalid file type. Only images are allowed.",
    };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: "File size too large. Maximum 5MB allowed.",
    };
  }

  // Check for common image formats
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "Unsupported image format. Please use JPEG, PNG, WebP, or GIF.",
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Generate optimized image URL with ImageKit transformations
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpeg" | "png";
  } = {}
): string {
  if (!imageUrl) return "";

  // If it's not an ImageKit URL, return as is
  if (!imageUrl.includes("ik.imagekit.io")) {
    return imageUrl;
  }

  const params = new URLSearchParams();

  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  if (options.quality) params.set("q", options.quality.toString());
  if (options.format) params.set("f", options.format);

  const paramString = params.toString();

  if (paramString) {
    // Add transformation parameters to ImageKit URL
    const separator = imageUrl.includes("?") ? "&" : "?";
    return `${imageUrl}${separator}tr=${paramString}`;
  }

  return imageUrl;
}
