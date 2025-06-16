import { db } from "@/db";
import { menus, qrCodes, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQrForMenu } from "@/lib/generateQrCode"; // The helper from previous answer

async function backfillQRCodes() {
  // 1. Get all menus
  const allMenus = await db.select().from(menus);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const menu of allMenus) {
    try {
      // 2. Check if QR code exists for this menu
      const [existing] = await db
        .select()
        .from(qrCodes)
        .where(eq(qrCodes.menuId, menu.id));

      if (existing) {
        // Optionally, update the QR code if you want to refresh it
        await generateQrForMenu({
          menuId: menu.id,
          restaurantId: menu.restaurantId,
        });
        updated++;
        console.log(`Updated QR code for menu: ${menu.id}`);
      } else {
        // Create QR code for this menu
        await generateQrForMenu({
          menuId: menu.id,
          restaurantId: menu.restaurantId,
        });
        created++;
        console.log(`Created QR code for menu: ${menu.id}`);
      }
    } catch (err) {
      failed++;
      console.error(`Failed for menu ${menu.id}:`, err);
    }
  }

  console.log(
    `Backfill complete! Created: ${created}, Updated: ${updated}, Failed: ${failed}`
  );
}

// If running as a script (e.g. with tsx or ts-node)
backfillQRCodes().then(() => process.exit(0));
