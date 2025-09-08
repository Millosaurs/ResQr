import QRCode from "qrcode";
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

  // Generate QR code as buffer directly
  const qrCodeBuffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    type: "png",
  });

  // Convert to base64 for storage
  const imageBuffer = qrCodeBuffer.toString("base64");
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
  // Generate QR code as buffer directly
  const qrCodeBuffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    type: "png",
  });

  // Return the PNG buffer directly
  return qrCodeBuffer;
}
