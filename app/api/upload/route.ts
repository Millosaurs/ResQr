// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import { db } from "@/db"; // Your drizzle db instance
import { images } from "@/db/schema"; // Your schema
import { auth } from "@/lib/auth"; // Your auth function
import { headers } from "next/headers";

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
    const imageType = (formData.get("imageType") as string) || "general";

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

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
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
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: fileName,
      folder: "/restaurant_assets", // Optional: organize in folders
      useUniqueFileName: true,
      responseFields: ["fileId", "url", "name", "size"],
    });

    // Save to database
    const [savedImage] = await db
      .insert(images)
      .values({
        fileName: uploadResponse.name,
        imageUrl: uploadResponse.url,
        imagekitFileId: uploadResponse.fileId,
        uploadedBy: session.user.id,
        imageType: imageType,
      })
      .returning();

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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
