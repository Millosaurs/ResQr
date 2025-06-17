import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { menus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQrPngOnly } from "@/lib/generateQrCode";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;

  // Fetch menu to get the URL
  const [menu] = await db
    .select()
    .from(menus)
    .where(eq(menus.id, menuId))
    .limit(1);

  if (!menu) {
    return NextResponse.json({ error: "Menu not found" }, { status: 404 });
  }

  const url = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/menu/${menu.id}`;

  const buffer = await generateQrPngOnly({ url, size: 512 });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="qr-${menu.id}.png"`,
    },
  });
}
