// components/user-image-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Loader2, X, Camera } from "lucide-react";
import { toast } from "sonner";

interface UserImageUploadProps {
  currentImage?: string | null;
  userName: string;
  onImageUploaded: (imageUrl: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function UserImageUpload({
  currentImage,
  userName,
  onImageUploaded,
  disabled = false,
  size = "lg",
}: UserImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: "h-16 w-16",
      text: "text-lg",
      button: "h-5 w-5 rounded-full p-0",
      deleteIcon: "h-3 w-3",
    },
    md: {
      avatar: "h-20 w-20",
      text: "text-xl",
      button: "h-6 w-6 rounded-full p-0",
      deleteIcon: "h-3 w-3",
    },
    lg: {
      avatar: "h-24 w-24",
      text: "text-2xl",
      button: "h-6 w-6 rounded-full p-0",
      deleteIcon: "h-3 w-3",
    },
  };

  const config = sizeConfig[size];

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return "Please select an image file (JPG, PNG, GIF, WebP)";
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return "Image size must be less than 2MB";
    }

    // Validate file dimensions (optional)
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }

      onImageUploaded(result.data.imageUrl);
      toast.success("Profile image updated successfully");

      // Refresh the page to reflect changes in the user session
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    if (disabled || uploading) return;

    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (!imageFile) {
      toast.error("Please drop an image file");
      return;
    }

    await uploadFile(imageFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDeleteImage = async () => {
    if (!currentImage) return;

    setDeleting(true);

    try {
      const response = await fetch("/api/user/upload-image", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete image");
      }

      onImageUploaded("");
      toast.success("Profile image removed successfully");

      // Refresh the page to reflect changes in the user session
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to remove image");
    } finally {
      setDeleting(false);
    }
  };

  const isLoading = uploading || deleting;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar with drag and drop */}
      <div
        className={`relative group cursor-pointer transition-all duration-200 ${
          dragOver ? "scale-105" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
      >
        <Avatar
          className={`${config.avatar} transition-all duration-200 ${
            dragOver ? "ring-2 ring-primary ring-offset-2" : ""
          } ${isLoading ? "opacity-50" : ""}`}
        >
          <AvatarImage src={currentImage || ""} alt={userName} />
          <AvatarFallback className={config.text}>
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {/* Hover overlay */}
        {!isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Delete button */}
        {currentImage && !isLoading && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={`absolute -top-2 -right-2 ${config.button}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteImage();
            }}
            disabled={disabled}
          >
            <X className={config.deleteIcon} />
          </Button>
        )}

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full border-2 border-dashed border-primary">
            <Upload className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>

      {/* Upload controls */}
      <div className="flex flex-col items-center space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isLoading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isLoading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : deleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {currentImage ? "Change Image" : "Upload Image"}
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF or WebP. Max 2MB.
          </p>
          <p className="text-xs text-muted-foreground">
            Click or drag and drop to upload
          </p>
        </div>
      </div>
    </div>
  );
}
