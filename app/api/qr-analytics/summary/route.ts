import { db } from "@/db";
import { user, qrMenuAnalytics, menuItems } from "@/db/schema";
import { NextResponse } from "next/server";
import { sql, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the user's subscription status
  const [userRow] = await db
    .select({ subscriptionStatus: user.subscriptionStatus })
    .from(user)
    .where(eq(user.id, session.user.id));

  const isPro = userRow?.subscriptionStatus === "ACTIVE";

  // Basic analytics (for all)
  const scansThisMonth = await db
    .select({ count: sql`COUNT(*)` })
    .from(qrMenuAnalytics)
    .where(sql`date_trunc('month', scanned_at) = date_trunc('month', now())`)
    .then((rows) => Number(rows[0]?.count ?? 0));

  // Pro analytics (only for active subscribers)
  let topMenu = "-";
  let peakTime = "-";
  let daily = { labels: [], counts: [] };
  let deviceStats = null;

  if (isPro) {
    // Top menu item
    const topMenuRow = await db
      .select({ name: menuItems.name, count: sql`COUNT(*)` })
      .from(qrMenuAnalytics)
      .leftJoin(menuItems, sql`${qrMenuAnalytics.menuItemId} = ${menuItems.id}`)
      .groupBy(menuItems.name)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1)
      .then((rows) => rows[0]);
    topMenu = topMenuRow?.name || "-";

    // Peak time
    const peakTimeRow = await db
      .select({
        hour: sql`EXTRACT(HOUR FROM scanned_at)`,
        count: sql`COUNT(*)`,
      })
      .from(qrMenuAnalytics)
      .groupBy(sql`EXTRACT(HOUR FROM scanned_at)`)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(1)
      .then((rows) => rows[0]);
    peakTime = peakTimeRow
      ? `${peakTimeRow.hour}:00-${Number(peakTimeRow.hour) + 1}:00`
      : "-";

    // Daily scan data
    type DailyRow = { date: string; count: number };

    const dailyRows = (await db
      .select({
        date: sql`DATE(scanned_at)`,
        count: sql`COUNT(*)`,
      })
      .from(qrMenuAnalytics)
      .groupBy(sql`DATE(scanned_at)`)
      .orderBy(sql`DATE(scanned_at) ASC`)) as {
      date: unknown;
      count: unknown;
    }[];

    const daily = {
      labels: dailyRows.map((r) => String(r.date)),
      counts: dailyRows.map((r) => Number(r.count)),
    };

    // Device stats (pro only)
    deviceStats = await db
      .select({
        deviceType: qrMenuAnalytics.deviceType,
        count: sql`COUNT(*)`,
      })
      .from(qrMenuAnalytics)
      .groupBy(qrMenuAnalytics.deviceType);
  }

  return NextResponse.json({
    scansThisMonth,
    ...(isPro
      ? { topMenu, peakTime, daily, deviceStats }
      : { message: "Upgrade to Pro for more analytics!" }),
    isPro,
  });
}
