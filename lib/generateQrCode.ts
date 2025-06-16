import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import { db } from "@/db";
import { qrCodes, restaurants, menus } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateQrForMenu({
  menuId,
  restaurantId,
  size = 1024,
}: {
  menuId: string;
  restaurantId: string;
  size?: number;
}) {
  // Fetch menu and restaurant data
  const [menu] = await db
    .select()
    .from(menus)
    .where(eq(menus.id, menuId))
    .limit(1);
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .limit(1);

  if (!menu || !restaurant) throw new Error("Menu or restaurant not found");

  const url = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/menu/${menu.id}`;
  const restaurantName = restaurant.name;
  const menuName = menu.name;
  const restaurantAddress = restaurant.address;
  const restaurantPhone = restaurant.phone;

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

  // Check if QR code already exists for this menu
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
      .returning({ id: qrCodes.id });
    qrCodeId = inserted.id;
  }

  return qrCodeId;
}

export async function generateQrPngOnly({
  url,
  size = 1024,
}: {
  url: string;
  size?: number;
}) {
  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  // Create canvas for the final image (square)
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Fill white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load and draw QR code (fill the canvas)
  const qrImage = await loadImage(qrCodeDataUrl);
  ctx.drawImage(qrImage, 0, 0, size, size);

  // Return the PNG buffer
  return canvas.toBuffer("image/png");
}
