import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      restaurantName,
      menuName,
      restaurantAddress,
      restaurantPhone,
      size = 1024,
      menuId,
      restaurantId,
    } = body;

    if (!url || !restaurantName || !menuName || !menuId || !restaurantId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Create canvas for the final image
    const canvas = createCanvas(size, size + 200);
    const ctx = canvas.getContext("2d");

    // Fill white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw QR code
    const qrImage = await loadImage(qrCodeDataUrl);
    const qrSize = size * 0.7;
    const qrX = (size - qrSize) / 2;
    const qrY = 40;
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Set up text styling
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.font = "bold 32px Arial";
    ctx.fillText(restaurantName, size / 2, qrY + qrSize + 50);
    ctx.font = "24px Arial";
    ctx.fillText(`Menu: ${menuName}`, size / 2, qrY + qrSize + 85);
    if (restaurantAddress) {
      ctx.font = "18px Arial";
      ctx.fillText(restaurantAddress, size / 2, qrY + qrSize + 115);
    }
    if (restaurantPhone) {
      ctx.font = "18px Arial";
      ctx.fillText(restaurantPhone, size / 2, qrY + qrSize + 140);
    }
    ctx.font = "14px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("by ResQr", size / 2, canvas.height - 20);

    // Add border
    ctx.strokeStyle = "#E5E5E5";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Convert to buffer and base64
    const buffer = canvas.toBuffer("image/png");
    const imageBuffer = buffer.toString("base64");
    const fileName = `${restaurantName}-${menuName}-QR.png`;

    // --- Update or Insert qrCodes record ---
    const [existing] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.menuId, menuId));

    let qrCodeId: string;

    if (existing) {
      await db
        .update(qrCodes)
        .set({
          imageBuffer,
          fileName,
          size,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(qrCodes.id, existing.id));
      qrCodeId = existing.id;
    } else {
      const [inserted] = await db
        .insert(qrCodes)
        .values({
          menuId,
          restaurantId,
          imageBuffer,
          fileName,
          size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
      qrCodeId = inserted.id;
    }

    // Return the PNG file and the qrCodeId in a header
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-QRCode-Id": qrCodeId, // <-- custom header
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
