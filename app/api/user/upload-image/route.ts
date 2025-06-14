// app/api/user/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { db } from "@/db";
import { images, user } from "@/db/schema"; // Changed to 'user'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (2MB limit for profile images)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 2MB allowed." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileName = `profile_${session.user.id}_${timestamp}_${randomString}.${fileExtension}`;

    // Delete existing profile image if exists
    try {
      const existingImages = await db
        .select()
        .from(images)
        .where(
          and(
            eq(images.uploadedBy, session.user.id),
            eq(images.imageType, "profile")
          )
        );

      for (const existingImage of existingImages) {
        try {
          await imagekit.deleteFile(existingImage.imagekitFileId);
        } catch (deleteError) {
          console.error(
            "Error deleting existing image from ImageKit:",
            deleteError
          );
        }
        await db.delete(images).where(eq(images.id, existingImage.id));
      }
    } catch (cleanupError) {
      console.error("Error cleaning up existing images:", cleanupError);
    }

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: "/user_profiles", // Separate folder for user profiles
      useUniqueFileName: true,
      responseFields: ["fileId", "url", "name", "size"],
      transformation: {
        pre: "w-400,h-400,c-maintain_ratio", // Resize to max 400x400
      },
    });

    // Save to images table
    const [savedImage] = await db
      .insert(images)
      .values({
        fileName: uploadResponse.name,
        imageUrl: uploadResponse.url,
        imagekitFileId: uploadResponse.fileId,
        uploadedBy: session.user.id,
        imageType: "profile",
      })
      .returning();

    // Update user.image column with the new image URL
    await db
      .update(user) // Changed to 'user'
      .set({
        image: uploadResponse.url,
        updatedAt: new Date().toISOString(), // Convert to string since mode is "string"
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: {
        id: savedImage.id,
        fileName: savedImage.fileName,
        imageUrl: savedImage.imageUrl,
        imagekitFileId: savedImage.imagekitFileId,
      },
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all profile images for the user
    const userProfileImages = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.uploadedBy, session.user.id),
          eq(images.imageType, "profile")
        )
      );

    for (const image of userProfileImages) {
      try {
        // Delete from ImageKit
        await imagekit.deleteFile(image.imagekitFileId);
      } catch (imagekitError) {
        console.error("Error deleting from ImageKit:", imagekitError);
      }

      // Delete from database
      await db.delete(images).where(eq(images.id, image.id));
    }

    // Update user.image column to null
    await db
      .update(user) // Changed to 'user'
      .set({
        image: null,
        updatedAt: new Date().toISOString(), // Convert to string since mode is "string"
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("Profile image delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile image" },
      { status: 500 }
    );
  }
}
