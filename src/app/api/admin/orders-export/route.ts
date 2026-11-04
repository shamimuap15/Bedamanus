import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { orderFilters } from "@/lib/orderQuery";

export const dynamic = "force-dynamic";

function csv(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const rows = await db
    .select()
    .from(schema.orders)
    .where(orderFilters(url.searchParams.get("status") ?? "", url.searchParams.get("q") ?? ""))
    .orderBy(desc(schema.orders.createdAt))
    .limit(10000);

  const header = ["Order No", "Date", "Status", "Name", "Phone", "Address", "Area", "Items", "Subtotal", "Delivery", "Total (COD)", "Customer note", "Admin note"];
  const lines = rows.map((o) =>
    [
      o.orderNo,
      o.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
      o.status,
      o.name,
      o.phone,
      o.address,
      o.area,
      o.items.map((i) => `${i.name} x${i.qty}`).join("; "),
      o.subtotal,
      o.deliveryCharge,
      o.total,
      o.customerNote,
      o.adminNote,
    ].map(csv).join(","),
  );
  // BOM so Excel opens Bangla text correctly.
  const body = "﻿" + [header.join(","), ...lines].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${date}.csv"`,
    },
  });
}
