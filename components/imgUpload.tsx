"use client";
import { AlertCircleIcon, ImageUpIcon, XIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useState } from "react";
import { toast } from "sonner";

interface ImgUploadProps {
  onUploadSuccess?: (imageData: {
    id: number;
    fileName: string;
    imageUrl: string;
    imagekitFileId: string;
  }) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
  label?: string;
  className?: string;
  maxSizeMB?: number;
}

export default function ImgUpload({
  onUploadSuccess,
  currentImageUrl,
  onRemove,
  label,
  className = "",
  maxSizeMB = 5,
}: ImgUploadProps) {
  const [uploading, setUploading] = useState(false);
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop: originalHandleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageType", "restaurant_logo");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();

      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
    }
  };

  // Enhanced drop handler that triggers upload
  const handleDrop = async (e: React.DragEvent) => {
    originalHandleDrop(e as React.DragEvent<HTMLElement>); // Call the original drop handler

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Enhanced file input change handler
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    if (files[0]?.id) {
      removeFile(files[0].id);
    }
    if (onRemove) {
      onRemove();
    }
  };

  // Use currentImageUrl if provided, otherwise use preview from files
  const previewUrl = currentImageUrl || files[0]?.preview || null;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Drop area */}
        <div
          role="button"
          onClick={uploading ? undefined : openFileDialog}
          onDragEnter={uploading ? undefined : handleDragEnter}
          onDragLeave={uploading ? undefined : handleDragLeave}
          onDragOver={uploading ? undefined : handleDragOver}
          onDrop={uploading ? undefined : handleDrop}
          data-dragging={isDragging || undefined}
          className={`border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px] ${
            uploading ? "pointer-events-none opacity-75" : ""
          }`}
        >
          <input
            {...getInputProps()}
            onChange={handleInputChange}
            disabled={uploading}
            className="sr-only"
            aria-label="Upload file"
          />

          {previewUrl ? (
            <div className="absolute inset-0">
              <img
                src={previewUrl}
                alt={files[0]?.file?.name || "Uploaded image"}
                className="size-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin opacity-60" />
                ) : (
                  <ImageUpIcon className="size-4 opacity-60" />
                )}
              </div>
              <p className="mb-1.5 text-sm font-medium">
                {uploading
                  ? "Uploading..."
                  : "Drop your image here or click to browse"}
              </p>
              <p className="text-muted-foreground text-xs">
                PNG, JPG, JPEG up to {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>

        {previewUrl && !uploading && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading image...
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
