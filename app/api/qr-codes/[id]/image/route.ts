// app/api/qr-codes/[id]/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Your database instance
import { qrCodes } from "@/db/schema"; // Your schema
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "QR code ID is required" },
        { status: 400 }
      );
    }

    // Fetch QR code from database
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, id))
      .limit(1);

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(qrCode.imageBuffer, "base64");

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${qrCode.fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Error serving QR code image:", error);
    return NextResponse.json(
      { error: "Failed to serve QR code image" },
      { status: 500 }
    );
  }
}
