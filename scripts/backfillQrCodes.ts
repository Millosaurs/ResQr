import { db } from "@/db";
import { menus, qrCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

async function backfillQrCodes() {
  const allMenus = await db.select().from(menus);
  for (const menu of allMenus) {
    const [existing] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.menuId, menu.id));
    if (!existing) {
      await db.insert(qrCodes).values({
        menuId: menu.id,
        restaurantId: menu.restaurantId,
        imageBuffer: "PLACEHOLDER",
        fileName: `${menu.name}-qr.png`,
      });
      console.log(`Created QR code for menu ${menu.id}`);
    }
  }
}

backfillQrCodes().then(() => process.exit(0));
