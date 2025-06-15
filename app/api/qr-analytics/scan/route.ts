import { db } from "@/db";
import { qrMenuAnalytics, qrCodes } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  let {
    qrCodeId,
    menuId,
    restaurantId,
    sessionId,
    referrer,
    scanSource,
    menuItemId,
  } = await req.json();

  const userAgent = req.headers.get("user-agent") || "";
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ipAddress = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : undefined;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If qrCodeId or restaurantId is missing, look it up by menuId
  if ((!qrCodeId || !restaurantId) && menuId) {
    const [qr] = await db
      .select({ id: qrCodes.id, restaurantId: qrCodes.restaurantId })
      .from(qrCodes)
      .where(eq(qrCodes.menuId, menuId));
    if (qr) {
      qrCodeId = qrCodeId || qr.id;
      restaurantId = restaurantId || qr.restaurantId;
    } else {
      return NextResponse.json(
        { error: "QR code not found for this menu" },
        { status: 400 }
      );
    }
  }

  // If still missing, fail gracefully
  if (!qrCodeId || !menuId || !restaurantId) {
    return NextResponse.json(
      { error: "Missing qrCodeId, menuId, or restaurantId" },
      { status: 400 }
    );
  }

  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type || "desktop";
  const browser = parser.getBrowser().name || "";
  const os = parser.getOS().name || "";

  await db.insert(qrMenuAnalytics).values({
    qrCodeId,
    menuId,
    restaurantId,
    sessionId,
    userAgent,
    ipAddress,
    userId: session?.user?.id ?? null,
    referrer,
    deviceType,
    browser,
    os,
    scanSource,
    menuItemId,
  });

  return NextResponse.json({ success: true });
}
