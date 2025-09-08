import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menus, qrCodes, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQrForMenu } from "@/lib/generateQrCode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { menuId, restaurantId, size = 1024 } = body;

    // Optionally, validate required fields
    if (!menuId || !restaurantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call the helper
    const qrCodeId = await generateQrForMenu({
      menuId,
      restaurantId,
      size,
    });

    // Fetch the QR code record to get the imageBuffer and fileName
    const [qr] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, qrCodeId));

    if (!qr) {
      return NextResponse.json(
        { error: "QR code not found after generation" },
        { status: 500 }
      );
    }

    // Convert base64 back to buffer for response
    const buffer = Buffer.from(qr.imageBuffer, "base64");
    const fileName = qr.fileName;

    // Return the PNG file and the qrCodeId in a header
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-QRCode-Id": qrCodeId,
      },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
